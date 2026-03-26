import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Target,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Share2,
} from "lucide-react";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isInvestigating, setIsInvestigating] = useState(false);

  // جلب بيانات المشروع من API أو من الـ cache
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      // استبدل هذا بـ API الخاص بك
      const response = await fetch(`/api/projects/${projectId}`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4">المشروع غير موجود</p>
          <button
            onClick={() => navigate("/projects")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            العودة للمشاريع
          </button>
        </div>
      </div>
    );
  }

  // --- معالجة البيانات ---
  const raised = Number(project.funding_current || project.raised || 0);
  const goal = Number(project.funding_goal || project.goal || 1);
  const percentage = Math.min(100, Math.round((raised / goal) * 100));

  const calculateDaysLeft = (dateString) => {
    if (!dateString) return 0;
    const deadline = new Date(dateString);
    const today = new Date();
    const diff = deadline.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const daysLeft = calculateDaysLeft(project.deadline || project.end_date);
  const investorsCount = Number(project.investors_count || 0);
  const roi = project.roi || project.return_percentage || 0;

  const handleInvest = async () => {
    setIsInvestigating(true);
    setTimeout(() => {
      setIsInvestigating(false);
      alert("تم تسجيل اهتمامك بالمشروع بنجاح!");
      queryClient.invalidateQueries(["dashboard-projects"]);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen bg-slate-50"
      dir="rtl"
    >
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowRight size={20} />
            <span className="font-medium">العودة</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100" />
        <h1 className="relative text-7xl font-black text-slate-200 select-none opacity-50">
          {project.category || "CrowdAlgerie"}
        </h1>
        <div className="absolute bottom-6 right-6 flex gap-2">
          <span className="px-4 py-2 bg-white backdrop-blur text-blue-600 text-sm font-bold rounded-lg shadow-md">
            {project.category || "عام"}
          </span>
          {project.quality_badge && (
            <span className="px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-lg shadow-md border border-yellow-200 flex items-center gap-1">
              وسم الجودة
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Title & Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                {project.title || "عنوان المشروع"}
              </h1>
              <p className="text-slate-600 leading-relaxed">
                {project.description || "لا يوجد وصف متاح لهذا المشروع حالياً."}
              </p>
            </div>

            {/* Funding Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                حالة التمويل
              </h2>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-bold text-slate-700">
                  تم جمع: {raised.toLocaleString()} دج
                </span>
                <span className="text-slate-500">
                  الهدف: {goal.toLocaleString()} دج
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-bold text-lg">
                  {percentage}% مكتمل
                </span>
                {percentage >= 100 && (
                  <span className="flex items-center gap-1 text-green-600 font-bold">
                    <CheckCircle2 size={16} />
                    تم التمويل بالكامل
                  </span>
                )}
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                تفاصيل المشروع
              </h2>
              <div className="prose max-w-none text-slate-600">
                <p>
                  يمكنك إضافة المزيد من التفاصيل هنا مثل خطة العمل، الفريق،
                  المخاطر، وغيرها من المعلومات المهمة للمستثمرين.
                </p>
              </div>
            </div>
          </div>

          {/* Left Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics Cards */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                إحصائيات سريعة
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="flex justify-center text-blue-500 mb-2">
                  <Target size={24} />
                </div>
                <div className="font-bold text-slate-800 text-2xl">
                  {percentage}%
                </div>
                <div className="text-sm text-slate-500">نسبة التمويل</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="flex justify-center text-purple-500 mb-2">
                  <Users size={24} />
                </div>
                <div className="font-bold text-slate-800 text-2xl">
                  {investorsCount}
                </div>
                <div className="text-sm text-slate-500">مستثمر</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="flex justify-center text-orange-500 mb-2">
                  <Calendar size={24} />
                </div>
                <div className="font-bold text-slate-800 text-2xl">
                  {daysLeft}
                </div>
                <div className="text-sm text-slate-500">يوم متبقي</div>
              </div>
            </div>

            {/* ROI Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="p-3 bg-white rounded-full text-green-600 shadow-sm">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    العائد المتوقع (ROI)
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {roi}%{" "}
                    <span className="text-sm font-normal opacity-75">
                      / سنوياً
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
              <button
                onClick={handleInvest}
                disabled={isInvestigating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isInvestigating ? "جاري المعالجة..." : "استثمر الآن"}
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-xl font-medium transition-colors"
              >
                <Share2 size={20} />
                مشاركة المشروع
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
