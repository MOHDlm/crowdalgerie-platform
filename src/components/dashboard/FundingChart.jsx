import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FundingChart({ projects, investments }) {
  const data = projects.slice(0, 6).map(project => ({
    name: project.name_ar?.substring(0, 15) + '...',
    funding: project.current_funding / 1000,
    goal: project.funding_goal / 1000
  }));

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-900">
          التمويل حسب المشروع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="funding" fill="#1e40af" name="التمويل الحالي (ألف دج)" />
            <Bar dataKey="goal" fill="#93c5fd" name="الهدف (ألف دج)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}