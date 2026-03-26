import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, gradient, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-0 overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
              <h3 className="text-3xl font-bold text-blue-900">{value}</h3>
              {trend && (
                <p className="text-xs text-gray-500 mt-2">{trend}</p>
              )}
            </div>
            <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}