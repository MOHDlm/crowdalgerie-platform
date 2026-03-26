import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auth, db } from "@/firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import ProjectForm from "../components/myprojects/ProjectForm";
import MyProjectCard from "../components/myprojects/MyProjectCard";

export default function MyProjects() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  // مراقبة المستخدم الحالي
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // جلب مشاريع المستخدم من Firebase
  const { data: myProjects = [], isLoading } = useQuery({
    queryKey: ["my-projects", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];

      try {
        const q = query(
          collection(db, "projects"),
          where("created_by_uid", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("خطأ في جلب المشاريع:", error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  // إضافة مشروع جديد إلى Firebase
  const createProjectMutation = useMutation({
    mutationFn: async (projectData) => {
      if (!currentUser) throw new Error("يجب تسجيل الدخول أولاً");

      try {
        const docRef = await addDoc(collection(db, "projects"), {
          ...projectData,
          created_by_uid: currentUser.uid,
          created_by_email: currentUser.email,
          created_date: serverTimestamp(),
          status: "voting",
          votes_count: 0,
          votes_needed: 10,
        });
        console.log("✅ تم إضافة المشروع بنجاح:", docRef.id);
        return { id: docRef.id, ...projectData };
      } catch (error) {
        console.error("❌ خطأ في إضافة المشروع:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-projects", currentUser?.uid],
      });
      setShowForm(false);
    },
    onError: (error) => {
      console.error("خطأ في الحفظ:", error.message);
      alert("حدث خطأ في حفظ المشروع: " + error.message);
    },
  });

  // تحديث مشروع في Firebase
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (!currentUser) throw new Error("يجب تسجيل الدخول أولاً");

      try {
        const projectRef = doc(db, "projects", id);
        await updateDoc(projectRef, {
          ...data,
          updated_date: serverTimestamp(),
        });
        console.log("✅ تم تحديث المشروع بنجاح:", id);
        return { id, ...data };
      } catch (error) {
        console.error("❌ خطأ في تحديث المشروع:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-projects", currentUser?.uid],
      });
      setShowForm(false);
      setEditingProject(null);
    },
    onError: (error) => {
      console.error("خطأ في التحديث:", error.message);
      alert("حدث خطأ في تحديث المشروع: " + error.message);
    },
  });

  const handleSubmit = (projectData) => {
    if (editingProject) {
      updateProjectMutation.mutate({
        id: editingProject.id,
        data: projectData,
      });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  // إذا لم يكن المستخدم مسجل دخول
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-gray-600 mb-4">
                يجب تسجيل الدخول أولاً لإضافة مشاريع
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">مشاريعي</h1>
            <p className="text-gray-600 text-lg">أضف وأدر مشاريعك الخاصة</p>
          </div>
          <Button
            onClick={() => {
              setEditingProject(null);
              setShowForm(!showForm);
            }}
            className="bg-gradient-to-r from-blue-900 to-blue-700"
          >
            <Plus className="w-5 h-5 ml-2" />
            مشروع جديد
          </Button>
        </div>

        {showForm && (
          <ProjectForm
            project={editingProject}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
            isLoading={
              createProjectMutation.isPending || updateProjectMutation.isPending
            }
          />
        )}

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
            <p className="text-gray-600 mt-4">جاري التحميل...</p>
          </div>
        ) : myProjects.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-gray-600 mb-4">لم تضف أي مشروع بعد</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-900 to-blue-700"
              >
                <Plus className="w-5 h-5 ml-2" />
                أضف مشروعك الأول
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myProjects.map((project) => (
              <MyProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
