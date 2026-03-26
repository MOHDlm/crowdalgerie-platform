import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function BenefitsSection({ benefits }) {
  const successStories = [
    {
      company: "شركة النجاح للتكنولوجيا",
      achievement: "زيادة في المبيعات بنسبة 45%",
      period: "خلال 6 أشهر من الانضمام",
      sector: "تقنية المعلومات",
    },
    {
      company: "مؤسسة الأمل الزراعية",
      achievement: "توسع في 3 ولايات جديدة",
      period: "بفضل شبكة التوريد المشتركة",
      sector: "الزراعة",
    },
    {
      company: "الابتكار للصناعات",
      achievement: "تخفيض التكاليف بنسبة 30%",
      period: "عبر الخدمات المشتركة",
      sector: "الصناعة",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-12 space-y-6"
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl text-blue-900 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-yellow-500" />
            امتيازات وسم الجودة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative group"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                  }}
                />
                <div className="relative p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Stories Section */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
        <CardHeader className="border-b border-green-200">
          <CardTitle className="text-2xl text-green-900 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-green-600" />
            قصص نجاح من الشركات الجزائرية الأعضاء
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {story.sector}
                  </span>
                </div>
                <h4 className="font-bold text-blue-900 mb-2">
                  {story.company}
                </h4>
                <p className="text-green-700 font-bold text-lg mb-2">
                  {story.achievement}
                </p>
                <p className="text-sm text-gray-600">{story.period}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 bg-white/50 rounded-lg p-4 border border-green-200">
            <p className="text-center text-green-900 font-semibold">
              🎯 انضم لأكثر من 188 مؤسسة جزائرية ناجحة في التكتل التعاوني
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
