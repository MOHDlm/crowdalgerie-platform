import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import {
  ArrowRight,
  Target,
  Users,
  TrendingUp,
  CheckCircle2,
  Share2,
  X,
  DollarSign,
  Award,
  Clock,
} from "lucide-react";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isInvesting, setIsInvesting] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");

  // جلب بيانات المشروع من Firebase
  const {
    data: project,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      try {
        if (!projectId) return null;

        const projectDocRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectDocRef);

        if (projectDoc.exists()) {
          const data = projectDoc.data();
          return {
            id: projectDoc.id,
            ...data,
            // Ensure proper data types
            funding_current: Number(data.funding_current || 0),
            funding_goal: Number(data.funding_goal || 1),
            investors_count: Number(data.investors_count || 0),
            roi: Number(data.roi || data.return_percentage || 0),
          };
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        return null;
      }
    },
    staleTime: 0, // البيانات تصبح قديمة فوراً
    cacheTime: 0, // لا تحفظ الكاش
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X
              className="text-red-600"
              size={40}
            />
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">
            Project not found
          </p>
          <p className="text-slate-600 mb-6">
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            Back to Projects
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
    const amount = Number(investmentAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid investment amount.");
      return;
    }

    if (amount < 1000) {
      alert("Minimum investment amount is 1,000 DZD");
      return;
    }

    setIsInvesting(true);

    try {
      // تحديث Firebase أولاً
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        funding_current: increment(amount),
        investors_count: increment(1),
      });

      // تحديث محلي فوري بعد نجاح Firebase
      queryClient.setQueryData(["project", projectId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          funding_current: Number(oldData.funding_current || 0) + amount,
          investors_count: Number(oldData.investors_count || 0) + 1,
        };
      });

      // عرض رسالة نجاح
      const formattedAmount = amount.toLocaleString("en-US");
      const projectTitle = project.title || project.name_ar || "this project";
      alert(
        `Success! You have invested ${formattedAmount} DZD in ${projectTitle}. Thank you for your investment!`
      );

      setShowInvestModal(false);
      setInvestmentAmount("");

      // تحديث البيانات من Firebase في الخلفية
      queryClient.invalidateQueries(["all-projects-firebase"]);
      queryClient.refetchQueries(["project", projectId]);
    } catch (error) {
      console.error("Investment error:", error);
      alert("Failed to process investment. Please try again.");

      // إعادة تحميل البيانات في حالة الخطأ
      queryClient.invalidateQueries(["project", projectId]);
    } finally {
      setIsInvesting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const projectTitle = project.title || project.name_ar || "Project";
    const projectDesc = project.description || "";

    if (navigator.share) {
      navigator
        .share({
          title: projectTitle,
          text: projectDesc,
          url: url,
        })
        .catch(() => {
          // Share cancelled or failed
        });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors font-medium group"
          >
            <ArrowRight
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Projects</span>
          </button>
        </div>
      </div>

      {/* Hero Section with Image */}
      <div className="relative h-96 overflow-hidden">
        {project.image || project.imageUrl || project.cover_image ? (
          <>
            <img
              src={project.image || project.imageUrl || project.cover_image}
              alt={project.title || "Project"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMThjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTE4IDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTE4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0wIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTE4YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
            </div>
            <h1 className="absolute inset-0 flex items-center justify-center text-8xl font-black text-white/20 select-none">
              {project.category || project.sector || "PROJECT"}
            </h1>
          </>
        )}

        {/* Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-4 py-2 bg-white/95 backdrop-blur text-blue-600 text-sm font-bold rounded-lg shadow-lg">
                {project.category || project.sector || "General"}
              </span>
              {project.quality_badge && (
                <span className="px-4 py-2 bg-yellow-400/95 text-yellow-900 text-sm font-bold rounded-lg shadow-lg flex items-center gap-2">
                  <Award size={16} />
                  Quality Badge
                </span>
              )}
              {project.status && (
                <span className="px-4 py-2 bg-green-500/95 text-white text-sm font-bold rounded-lg shadow-lg capitalize">
                  {project.status}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-2xl">
              {project.title || project.name_ar || "Project Title"}
            </h1>
            {project.company_name && (
              <p className="text-xl text-white/90 font-medium drop-shadow-lg">
                by {project.company_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Funding Progress Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Funding Progress
                </h2>
                <span className="text-3xl font-black text-blue-600">
                  {percentage}%
                </span>
              </div>

              <div className="mb-6">
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Raised</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {raised.toLocaleString()} DZD
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Goal</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {goal.toLocaleString()} DZD
                  </p>
                </div>
              </div>

              {percentage >= 100 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <CheckCircle2
                    className="text-green-600"
                    size={24}
                  />
                  <span className="text-green-800 font-semibold">
                    Project Fully Funded!
                  </span>
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                About This Project
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {project.description ||
                  "No description available for this project."}
              </p>
            </div>

            {/* Additional Details */}
            {(project.details || project.long_description) && (
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Project Details
                </h2>
                <div className="prose max-w-none text-slate-600">
                  <p>{project.details || project.long_description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Investment Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 shadow-2xl text-white sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Investment Options</h3>

              <button
                onClick={() => setShowInvestModal(true)}
                className="w-full bg-white text-blue-600 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl hover:shadow-2xl mb-4"
              >
                Invest Now
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-4 rounded-xl font-semibold transition-all border border-white/20"
              >
                <Share2 size={20} />
                Share Project
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Quick Stats
              </h3>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Target
                      className="text-white"
                      size={20}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    Funding Progress
                  </span>
                </div>
                <p className="text-3xl font-black text-blue-600">
                  {percentage}%
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Users
                      className="text-white"
                      size={20}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    Total Investors
                  </span>
                </div>
                <p className="text-3xl font-black text-purple-600">
                  {investorsCount}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Clock
                      className="text-white"
                      size={20}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    Days Remaining
                  </span>
                </div>
                <p className="text-3xl font-black text-orange-600">
                  {daysLeft}
                </p>
              </div>
            </div>

            {/* ROI Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 shadow-xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <p className="text-sm opacity-90 font-medium">Expected ROI</p>
                  <p className="text-4xl font-black">{roi}%</p>
                </div>
              </div>
              <p className="text-sm opacity-80">Annually</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowInvestModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X
                size={24}
                className="text-slate-600"
              />
            </button>

            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <DollarSign
                  className="text-blue-600"
                  size={32}
                />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Invest in Project
              </h2>
              <p className="text-slate-600">
                {project.title || "this project"}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Investment Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-semibold">
                  DZD
                </span>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="1,000"
                  className="w-full pl-16 pr-4 py-4 border-2 border-slate-200 rounded-xl text-lg font-semibold focus:border-blue-500 focus:outline-none transition-colors"
                  min="1000"
                  step="1000"
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Minimum investment: 1,000 DZD (Algerian Dinar)
              </p>
            </div>

            <button
              onClick={handleInvest}
              disabled={isInvesting || !investmentAmount}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInvesting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : (
                "Confirm Investment"
              )}
            </button>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `,
        }}
      />
    </div>
  );
}
