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
    <Card className="mb-6 bg-[#161b27] border border-slate-800 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-4 h-4" />
            <span className="font-semibold">القطاع:</span>
          </div>
          {sectors.map((sector) => (
            <Badge
              key={sector.value}
              variant={sectorFilter === sector.value ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 ${
                sectorFilter === sector.value 
                  ? "bg-blue-700 text-white border-blue-600"
                  : "text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200"
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