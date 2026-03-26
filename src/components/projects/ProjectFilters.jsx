import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

const sectors = [
  { value: "all", label: "كل القطاعات" },
  { value: "technology", label: "تقنية" },
  { value: "agriculture", label: "زراعة" },
  { value: "services", label: "خدمات" },
  { value: "industry", label: "صناعة" },
  { value: "commerce", label: "تجارة" },
  { value: "tourism", label: "سياحة" },
  { value: "education", label: "تعليم" }
];

export default function ProjectFilters({ sectorFilter, setSectorFilter }) {
  return (
    <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="font-semibold">القطاع:</span>
          </div>
          {sectors.map((sector) => (
            <Badge
              key={sector.value}
              variant={sectorFilter === sector.value ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 ${
                sectorFilter === sector.value 
                  ? "bg-blue-900 text-white" 
                  : "hover:bg-blue-50"
              }`}
              onClick={() => setSectorFilter(sector.value)}
            >
              {sector.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}