import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "@/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Vote,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CreateProposal() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    impact: "",
    category: "General",
    priority: "medium",
    deadline: "",
    proposedBy: auth.currentUser?.displayName || auth.currentUser?.email || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("العنوان مطلوب");
      }
      if (!formData.description.trim()) {
        throw new Error("الوصف مطلوب");
      }
      if (!formData.deadline) {
        throw new Error("الموعد النهائي مطلوب");
      }

      // Create proposal object
      const newProposal = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        impact: formData.impact.trim(),
        category: formData.category,
        priority: formData.priority,
        deadline: formData.deadline,
        proposedBy: formData.proposedBy,
        status: "active",
        votesFor: 0,
        votesAgainst: 0,
        abstain: 0,
        totalVotes: 0,
        votes: [],
        votedUsers: [],
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };

      // Add to Firestore
      await addDoc(collection(db, "consortium_decisions"), newProposal);

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/decision-making");
      }, 2000);
    } catch (error) {
      console.error("Error creating proposal:", error);
      setSubmitError(error.message || "حدث خطأ في إنشاء المقترح");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 pt-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>العودة</span>
          </button>

          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Vote className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">إنشاء مقترح تصويت</h1>
                <p className="text-orange-50 mt-2">
                  أضف مقترح جديد للتصويت عليه في الاتحادية
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-slate-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
              <CardTitle>تفاصيل المقترح</CardTitle>
            </CardHeader>

            <CardContent className="p-8">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                    }}
                  >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    تم إنشاء المقترح بنجاح! ✓
                  </h3>
                  <p className="text-slate-600 mb-4">
                    سيتم نقلك إلى صفحة المقترحات...
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>{submitError}</span>
                    </motion.div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      عنوان المقترح *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="مثال: الموافقة على استراتيجية التسويق الجديدة"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      الوصف التفصيلي *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="اشرح تفاصيل المقترح والخلفية..."
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Impact */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      التأثير المتوقع
                    </label>
                    <textarea
                      name="impact"
                      value={formData.impact}
                      onChange={handleChange}
                      placeholder="ما هو التأثير المتوقع من هذا المقترح؟"
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        الفئة
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                        disabled={isSubmitting}
                      >
                        <option value="General">عام</option>
                        <option value="Marketing">التسويق</option>
                        <option value="Finance">المالية</option>
                        <option value="Quality">الجودة</option>
                        <option value="Partnerships">الشراكات</option>
                        <option value="Operations">العمليات</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        الأولوية
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                        disabled={isSubmitting}
                      >
                        <option value="low">منخفضة</option>
                        <option value="medium">متوسطة</option>
                        <option value="high">عالية</option>
                      </select>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      الموعد النهائي *
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Proposed By */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      المقترح من قبل
                    </label>
                    <input
                      type="text"
                      name="proposedBy"
                      value={formData.proposedBy}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          جاري الإنشاء...
                        </>
                      ) : (
                        <>
                          <Vote className="w-5 h-5" />
                          إنشاء المقترح
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                      className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300 transition-all disabled:opacity-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
