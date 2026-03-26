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
  voting: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  funded: "bg-blue-100 text-blue-800",
  closed: "bg-gray-100 text-gray-800"
};

export default function MyProjectCard({ project, onEdit }) {
  const fundingPercentage = (project.current_funding / project.funding_goal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-0">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-blue-900 mb-2">
                {project.name_ar}
              </CardTitle>
              <p className="text-gray-600">{project.company_name}</p>
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
          <p className="text-gray-700 line-clamp-2">{project.description_ar}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">التمويل المحقق</span>
              <span className="font-bold text-blue-900">{fundingPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={fundingPercentage} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-blue-900">
                {(project.current_funding / 1000).toFixed(0)} ألف دج
              </span>
              <span className="text-gray-600">
                من {(project.funding_goal / 1000).toFixed(0)} ألف دج
              </span>
            </div>
          </div>

          {project.status === 'voting' && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">التصويت</span>
                <span className="font-bold text-yellow-700">
                  {project.votes_count} / {project.votes_needed}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(project)}
            >
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </Button>
            {project.return_percentage && (
              <div className="flex items-center gap-2 bg-green-50 px-3 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-700">{project.return_percentage}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}