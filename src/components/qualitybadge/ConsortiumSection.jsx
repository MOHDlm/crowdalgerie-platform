import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Vote, Network, Briefcase, Building2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function ConsortiumSection() {
  const consortiumFeatures = [
    {
      icon: Users,
      title: "بيئة عمل تعاونية",
      description: "انضم لمجتمع من المؤسسات المتميزة التي تعمل معاً لتحقيق النجاح المشترك",
      color: "from-blue-500 to-blue-700"
    },
    {
      icon: Vote,
      title: "صنع القرار الجماعي",
      description: "شارك في اتخاذ القرارات الاستراتيجية للتكتل من خلال نظام التصويت الديمقراطي",
      color: "from-purple-500 to-purple-700"
    },
    {
      icon: Network,
      title: "شبكة توريد متكاملة",
      description: "استفد من سلاسل توريد مشتركة وموردين موثوقين بأسعار تنافسية",
      color: "from-green-500 to-green-700"
    },
    {
      icon: Briefcase,
      title: "فرص المناولة",
      description: "تعاون مع مؤسسات التكتل في مشاريع المناولة والتعاقدات المشتركة",
      color: "from-orange-500 to-orange-700"
    }
  ];

  const memberCompanies = [
    { name: "شركة النجاح للتكنولوجيا", sector: "تقنية المعلومات", city: "الجزائر العاصمة", members: 45 },
    { name: "مؤسسة الأمل الزراعية", sector: "الزراعة الذكية", city: "قسنطينة", members: 32 },
    { name: "الابتكار للصناعات", sector: "الصناعة", city: "وهران", members: 28 },
    { name: "البركة للخدمات", sector: "الخدمات", city: "عنابة", members: 38 },
    { name: "التميز التعليمي", sector: "التعليم والتكوين", city: "سطيف", members: 25 },
    { name: "الريادة السياحية", sector: "السياحة", city: "تلمسان", members: 20 }
  ];

  const stats = [
    { value: "188", label: "مؤسسة عضو", color: "bg-blue-500" },
    { value: "24", label: "ولاية جزائرية", color: "bg-green-500" },
    { value: "12", label: "قطاع اقتصادي", color: "bg-purple-500" },
    { value: "450+", label: "فرصة مناولة", color: "bg-orange-500" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mb-12 space-y-6"
    >
      {/* Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
          >
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <span className="text-white font-bold text-lg">{stat.value.charAt(0)}</span>
            </div>
            <h3 className="text-2xl font-bold text-blue-900">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-blue-900 to-blue-700 border-0 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <CardHeader className="relative p-8 border-b border-blue-600">
          <CardTitle className="text-3xl text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-yellow-400" />
            التكتل التعاوني: بيئة عمل جماعية متكاملة
          </CardTitle>
          <p className="text-blue-100 mt-3 text-lg">
            المؤسسات الحاصلة على وسم الجودة تصبح جزءاً من تكتل تعاوني يوفر بيئة عمل متكاملة
          </p>
        </CardHeader>
        <CardContent className="relative p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {consortiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-blue-100 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-yellow-400" />
              أمثلة من الشركات الأعضاء في التكتل
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberCompanies.map((company, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-bold text-white text-sm">{company.name}</h5>
                    <div className="bg-yellow-400/20 px-2 py-1 rounded text-xs text-yellow-300 whitespace-nowrap">
                      {company.members} موظف
                    </div>
                  </div>
                  <p className="text-blue-200 text-xs mb-2">{company.sector}</p>
                  <div className="flex items-center gap-1 text-blue-300 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{company.city}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-xl p-6">
            <h4 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              الخدمات المشتركة المتاحة للأعضاء
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>خدمات محاسبية وإدارية مشتركة</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>استشارات قانونية جماعية</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>حملات تسويقية مشتركة</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>تطوير الموارد البشرية</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>خدمات لوجستية ونقل مشترك</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>تأمينات جماعية بأسعار تفضيلية</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}