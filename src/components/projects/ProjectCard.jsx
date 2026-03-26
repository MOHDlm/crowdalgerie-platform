import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const sectorLabels = {
  technology: "تقنية",
  agriculture: "زراعة",
  services: "خدمات",
  industry: "صناعة",
  commerce: "تجارة",
  tourism: "سياحة",
  education: "تعليم",
};

const statusLabels = {
  voting: "تحت التصويت",
  active: "نشط",
  funded: "ممول",
  closed: "مغلق",
};

const statusColors = {
  voting: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  funded: "bg-blue-100 text-blue-800",
  closed: "bg-gray-100 text-gray-800",
};

const riskColors = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
};

const riskLabels = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
};

export default function ProjectCard({ project = {}, onClick }) {
  // حساب النسبة المئوية - مع معالجة جميع الاحتمالات
  const raised = Number(
    project.funding_current || project.current_funding || 0
  );
  const goal = Number(project.funding_goal || project.goal || 1);
  const fundingPercentage =
    Math.min(100, Math.round((raised / goal) * 100)) || 0;

  const daysLeft = project.deadline
    ? Math.max(
        0,
        Math.ceil(
          (new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="h-full bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 overflow-hidden"
        onClick={onClick}
      >
        <div className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
          {project.image_url ||
          project.image ||
          project.imageUrl ||
          project.cover_image ? (
            <img
              src={
                project.image_url ||
                project.image ||
                project.imageUrl ||
                project.cover_image
              }
              alt={project.name_ar || project.title || "Project"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-20">
              {(project.name_ar || project.title || "P").charAt(0)}
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            {project.status && (
              <Badge
                className={
                  statusColors[project.status] || "bg-gray-100 text-gray-800"
                }
              >
                {statusLabels[project.status] || project.status}
              </Badge>
            )}
            {project.quality_badge && (
              <Badge className="bg-yellow-400 text-yellow-900">
                <Award className="w-3 h-3 ml-1" />
                وسم الجودة
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-1">
                {project.name_ar || project.title || "مشروع بدون عنوان"}
              </h3>
              <p className="text-sm text-gray-600">
                {project.company_name || ""}
              </p>
            </div>
            {(project.sector || project.category) && (
              <Badge
                variant="outline"
                className="mr-2"
              >
                {sectorLabels[project.sector] ||
                  sectorLabels[project.category] ||
                  project.sector ||
                  project.category}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-700 line-clamp-2 leading-relaxed">
            {project.description_ar || project.description || "لا يوجد وصف"}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">التمويل المحقق</span>
              <span className="font-bold text-blue-900">
                {fundingPercentage}%
              </span>
            </div>

            {/* الشريط الديناميكي */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${fundingPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold text-blue-900">
                {(raised / 1000).toFixed(0)} ألف دج
              </span>
              <span className="text-gray-600">
                من {(goal / 1000).toFixed(0)} ألف دج
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{daysLeft} يوم متبقي</span>
            </div>
            {project.risk_level && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span
                  className={riskColors[project.risk_level] || "text-gray-600"}
                >
                  {riskLabels[project.risk_level] || project.risk_level}
                </span>
              </div>
            )}
          </div>

          {project.return_percentage && (
            <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">العائد المتوقع</span>
              <span className="text-lg font-bold text-green-700">
                {project.return_percentage}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}
      </style>
    </motion.div>
  );
}
