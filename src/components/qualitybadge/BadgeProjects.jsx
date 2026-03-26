import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Building2, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";

const sectorLabels = {
  technology: "تقنية",
  agriculture: "زراعة",
  services: "خدمات",
  industry: "صناعة",
  commerce: "تجارة",
  tourism: "سياحة",
  education: "تعليم"
};

export default function BadgeProjects({ projects }) {
  if (projects.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">لا توجد مشاريع حاصلة على وسم الجودة حالياً</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="text-2xl text-blue-900 flex items-center gap-3">
            <Award className="w-7 h-7 text-yellow-500" />
            المشاريع الحاصلة على وسم الجودة ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-yellow-200 bg-gradient-to-br from-white to-yellow-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-yellow-400 text-yellow-900">
                        <Award className="w-3 h-3 ml-1" />
                        معتمد
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-bold text-yellow-700">
                          {project.quality_score}/100
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">{project.name_ar}</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{project.company_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{sectorLabels[project.sector]}</Badge>
                      {project.return_percentage && (
                        <div className="flex items-center gap-1 text-green-700">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-bold">{project.return_percentage}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description_ar}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}