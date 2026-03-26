import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp } from "lucide-react";

export default function TopProjects({ projects }) {
  const topProjects = projects
    .sort((a, b) => (b.current_funding / b.funding_goal) - (a.current_funding / a.funding_goal))
    .slice(0, 5);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-900">
          أفضل المشاريع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProjects.map((project, index) => {
            const percentage = (project.current_funding / project.funding_goal) * 100;
            return (
              <div key={project.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-blue-900 truncate">
                      {project.name_ar}
                    </p>
                    {project.quality_badge && (
                      <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-blue-900 flex-shrink-0">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}