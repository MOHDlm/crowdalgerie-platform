import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Calendar, Edit, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const statusLabels = {
  voting: "تحت التصويت",
  active: "نشط",
  funded: "ممول",
  closed: "مغلق"
};

const statusColors = {
  voting: "bg-yellow-900/30 text-yellow-300",
  active: "bg-green-900/30 text-green-300",
  funded: "bg-blue-900/30 text-blue-300",
  closed: "bg-slate-800 text-slate-400"
};

export default function MyProjectCard({ project, onEdit }) {
  const fundingPercentage = (project.current_funding / project.funding_goal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-[#161b27] hover:shadow-xl transition-all duration-300 border border-slate-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-slate-200 mb-2">
                {project.name_ar}
              </CardTitle>
              <p className="text-slate-400">{project.company_name}</p>
            </div>
            <div className="flex gap-2 items-start">
              <Badge className={statusColors[project.status]}>
                {statusLabels[project.status]}
              </Badge>
              {project.quality_badge && (
                <Badge className="bg-yellow-400 text-yellow-900">
                  <Award className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-slate-400 line-clamp-2">{project.description_ar}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">التمويل المحقق</span>
              <span className="font-bold text-slate-200">{fundingPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={fundingPercentage} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-200">
                {(project.current_funding / 1000).toFixed(0)} ألف دج
              </span>
              <span className="text-slate-500">
                من {(project.funding_goal / 1000).toFixed(0)} ألف دج
              </span>
            </div>
          </div>

          {project.status === 'voting' && (
            <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">التصويت</span>
                <span className="font-bold text-yellow-400">
                  {project.votes_count} / {project.votes_needed}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              onClick={() => onEdit(project)}
            >
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </Button>
            {project.return_percentage && (
              <div className="flex items-center gap-2 bg-green-900/20 border border-green-800/40 px-3 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="font-bold text-green-400">{project.return_percentage}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}