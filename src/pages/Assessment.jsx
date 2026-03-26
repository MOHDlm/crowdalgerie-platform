import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Assessment() {
  const [expandedProject, setExpandedProject] = useState(null);
  const [scores, setScores] = useState({});
  const queryClient = useQueryClient();

  // جلب جميع المشاريع
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["all-projects-assessment"],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("✅ تم جلب المشاريع:", projectsList);
        return projectsList;
      } catch (error) {
        console.error("❌ خطأ في جلب المشاريع:", error);
        return [];
      }
    },
  });

  // تحديث تقييم المشروع
  const updateScoresMutation = useMutation({
    mutationFn: async ({
      projectId,
      financialScore,
      feasibilityScore,
      teamScore,
      innovationScore,
    }) => {
      const totalScore =
        parseFloat(financialScore || 0) +
        parseFloat(feasibilityScore || 0) +
        parseFloat(teamScore || 0) +
        parseFloat(innovationScore || 0);

      const qualityBadge = totalScore >= 85;

      try {
        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, {
          financial_score: parseFloat(financialScore || 0),
          feasibility_score: parseFloat(feasibilityScore || 0),
          team_score: parseFloat(teamScore || 0),
          innovation_score: parseFloat(innovationScore || 0),
          total_score: totalScore,
          quality_badge: qualityBadge,
        });
        console.log("✅ تم تحديث التقييم بنجاح:", {
          projectId,
          totalScore,
          qualityBadge,
        });
        return { projectId, totalScore, qualityBadge };
      } catch (error) {
        console.error("❌ خطأ في تحديث التقييم:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-projects-assessment"] });
      setExpandedProject(null);
      setScores({});
      alert("✅ تم حفظ التقييم بنجاح!");
    },
    onError: (error) => {
      alert("❌ خطأ في حفظ التقييم: " + error.message);
    },
  });

  const handleScoreChange = (projectId, field, value) => {
    const numValue = Math.min(Math.max(parseFloat(value) || 0, 0), 25);
    setScores((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: numValue,
      },
    }));
  };

  const handleSubmitScores = (projectId) => {
    const projectScores = scores[projectId] || {};
    updateScoresMutation.mutate({
      projectId,
      financialScore: projectScores.financial || 0,
      feasibilityScore: projectScores.feasibility || 0,
      teamScore: projectScores.team || 0,
      innovationScore: projectScores.innovation || 0,
    });
  };

  // حساب النقاط الكلية الحالية أو المؤقتة
  const calculateTotal = (project) => {
    const projectScores = scores[project.id] || {};
    return (
      (parseFloat(projectScores.financial) || project.financial_score || 0) +
      (parseFloat(projectScores.feasibility) ||
        project.feasibility_score ||
        0) +
      (parseFloat(projectScores.team) || project.team_score || 0) +
      (parseFloat(projectScores.innovation) || project.innovation_score || 0)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* الرأس */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            ⭐ تقييم المشاريع
          </h1>
          <p className="text-gray-600 text-lg">
            قيم المشاريع على المعايير الأربعة للحصول على وسم الجودة
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
            <p className="text-gray-600 mt-4">جاري تحميل المشاريع...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-gray-600 mb-4">
                لا توجد مشاريع للتقييم
              </p>
              <p className="text-sm text-gray-500">
                أضف مشاريع جديدة من صفحة مشاريعي أولا
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const totalScore = calculateTotal(project);
              const hasQualityBadge = project.quality_badge;
              const isExpanded = expandedProject === project.id;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedProject(isExpanded ? null : project.id)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <CardTitle className="text-blue-900">
                              {project.name_ar || "مشروع بدون اسم"}
                            </CardTitle>
                            {hasQualityBadge && (
                              <Badge className="bg-green-600 text-white">
                                ✅ وسم الجودة
                              </Badge>
                            )}
                            {totalScore >= 85 && !hasQualityBadge && (
                              <Badge className="bg-yellow-600 text-white">
                                ⏳ مؤهل للوسم
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {project.company_name || "شركة غير محددة"} •{" "}
                            {project.sector || "قطاع غير محدد"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-900">
                            {totalScore}
                          </p>
                          <p className="text-xs text-gray-500">/100</p>
                        </div>
                      </div>

                      {/* شريط النقاط */}
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            totalScore >= 85
                              ? "bg-green-500"
                              : totalScore >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(totalScore, 100)}%` }}
                        />
                      </div>
                    </CardHeader>

                    {/* القسم المتوسع */}
                    {isExpanded && (
                      <CardContent className="border-t pt-6">
                        <div className="space-y-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-gray-700 text-sm">
                              <strong>الوصف:</strong>{" "}
                              {project.description_ar || "لا يوجد وصف"}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                              <div>
                                <span className="text-gray-500">
                                  التمويل المطلوب:
                                </span>
                                <p className="font-semibold">
                                  {project.funding_goal
                                    ? `${project.funding_goal} دج`
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  العائد المتوقع:
                                </span>
                                <p className="font-semibold">
                                  {project.return_percentage
                                    ? `${project.return_percentage}%`
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">المدة:</span>
                                <p className="font-semibold">
                                  {project.project_duration
                                    ? `${project.project_duration} شهر`
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">المخاطر:</span>
                                <p className="font-semibold">
                                  {project.risk_level || "-"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* نموذج التقييم */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg space-y-4">
                            <h3 className="font-semibold text-blue-900 text-lg flex items-center gap-2">
                              📝 معايير التقييم
                              <span className="text-sm text-gray-500 font-normal">
                                (كل معيار من 0 إلى 25)
                              </span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* التقييم المالي */}
                              <div className="space-y-2">
                                <Label className="flex justify-between">
                                  <span>💰 التقييم المالي</span>
                                  <span className="text-blue-900 font-bold">
                                    {scores[project.id]?.financial ||
                                      project.financial_score ||
                                      0}
                                    /25
                                  </span>
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="25"
                                  step="0.5"
                                  value={
                                    scores[project.id]?.financial ??
                                    project.financial_score ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleScoreChange(
                                      project.id,
                                      "financial",
                                      e.target.value
                                    )
                                  }
                                  placeholder="من 0 إلى 25"
                                  className="text-center text-lg font-semibold"
                                />
                              </div>

                              {/* دراسة الجدوى */}
                              <div className="space-y-2">
                                <Label className="flex justify-between">
                                  <span>📊 دراسة الجدوى</span>
                                  <span className="text-blue-900 font-bold">
                                    {scores[project.id]?.feasibility ||
                                      project.feasibility_score ||
                                      0}
                                    /25
                                  </span>
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="25"
                                  step="0.5"
                                  value={
                                    scores[project.id]?.feasibility ??
                                    project.feasibility_score ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleScoreChange(
                                      project.id,
                                      "feasibility",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0-25"
                                  className="text-center text-lg font-semibold"
                                />
                              </div>

                              {/* الفريق */}
                              <div className="space-y-2">
                                <Label className="flex justify-between">
                                  <span>👥 الفريق</span>
                                  <span className="text-blue-900 font-bold">
                                    {scores[project.id]?.team ||
                                      project.team_score ||
                                      0}
                                    /25
                                  </span>
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="25"
                                  step="0.5"
                                  value={
                                    scores[project.id]?.team ??
                                    project.team_score ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleScoreChange(
                                      project.id,
                                      "team",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0-25"
                                  className="text-center text-lg font-semibold"
                                />
                              </div>

                              {/* الابتكار */}
                              <div className="space-y-2">
                                <Label className="flex justify-between">
                                  <span>💡 الابتكار</span>
                                  <span className="text-blue-900 font-bold">
                                    {scores[project.id]?.innovation ||
                                      project.innovation_score ||
                                      0}
                                    /25
                                  </span>
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="25"
                                  step="0.5"
                                  value={
                                    scores[project.id]?.innovation ??
                                    project.innovation_score ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleScoreChange(
                                      project.id,
                                      "innovation",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0-25"
                                  className="text-center text-lg font-semibold"
                                />
                              </div>
                            </div>

                            {/* النقاط الكلية */}
                            <div className="mt-4 p-4 rounded-lg bg-white border-2 border-blue-900">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">
                                  النقاط الكلية:
                                </span>
                                <span className="text-3xl font-bold text-blue-900">
                                  {totalScore}/100
                                </span>
                              </div>
                            </div>

                            {/* رسالة الوسم */}
                            <div
                              className={`mt-4 p-4 rounded-lg border-l-4 ${
                                totalScore >= 85
                                  ? "bg-green-50 border-green-500"
                                  : "bg-yellow-50 border-yellow-500"
                              }`}
                            >
                              {totalScore >= 85 ? (
                                <div className="flex items-center gap-2 text-green-700">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="font-semibold">
                                    🎉 مؤهل للحصول على وسم الجودة!
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-yellow-700">
                                  <AlertCircle className="w-5 h-5" />
                                  <span>
                                    ينقص <strong>{85 - totalScore}</strong> نقطة
                                    للحصول على الوسم
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* الأزرار */}
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setExpandedProject(null);
                                setScores({});
                              }}
                            >
                              إلغاء
                            </Button>
                            <Button
                              onClick={() => handleSubmitScores(project.id)}
                              disabled={updateScoresMutation.isPending}
                              className="bg-gradient-to-r from-blue-900 to-blue-700"
                            >
                              {updateScoresMutation.isPending
                                ? "جاري الحفظ..."
                                : "💾 حفظ التقييم"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
