import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Award,
  Users,
  Network,
  Handshake,
  Building2,
  Vote,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle,
  Package,
  FileText,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Consortium() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // جلب المشاريع المعتمدة
  const { data: qualifiedProjects = [], isLoading } = useQuery({
    queryKey: ["consortium-members"],
    queryFn: async () => {
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("quality_badge", "==", true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    initialData: [],
  });

  // جلب الموردين من Firebase
  const { data: suppliers = [] } = useQuery({
    queryKey: ["consortium-suppliers"],
    queryFn: async () => {
      const suppliersRef = collection(db, "suppliers");
      const snapshot = await getDocs(suppliersRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    initialData: [],
  });

  // جلب الخدمات المشتركة من Firebase
  const { data: sharedServices = [] } = useQuery({
    queryKey: ["consortium-services"],
    queryFn: async () => {
      const servicesRef = collection(db, "shared_services");
      const snapshot = await getDocs(servicesRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    initialData: [],
  });

  const services = [
    {
      id: "supply-chain",
      title: "سلاسل التوريد المشتركة",
      description: "الوصول إلى شبكة موردين موثوقين بأسعار تفضيلية",
      icon: Network,
      color: "from-purple-500 to-purple-700",
      stats: { suppliers: suppliers.length, discount: "15-30%" },
      available: true,
      link: "/SupplyChain", // ✅ مصحح
    },
    {
      id: "services",
      title: "الخدمات المشتركة",
      description: "محاسبة، قانونية، تسويق، وموارد بشرية",
      icon: Building2,
      color: "from-indigo-500 to-indigo-700",
      stats: { services: sharedServices.length, savings: "40%" },
      available: true,
      link: "/SharedServices", // ✅ مصحح
    },
    {
      id: "voting",
      title: "المشاركة في القرار",
      description: "التصويت على القرارات الاستراتيجية للتكتل",
      icon: Vote,
      color: "from-orange-500 to-orange-700",
      stats: { votes: 5, participation: "87%" },
      available: true,
      link: "/Voting", // ✅ صحيح
    },
    {
      id: "contracts",
      title: "فرص المناولة",
      description: "التعاون في مشاريع المناولة والتعاقد من الباطن",
      icon: Handshake,
      color: "from-pink-500 to-pink-700",
      stats: { opportunities: 28, active: 8 },
      available: true,
      link: "/Consortium", // ✅ يبقى في نفس الصفحة
    },
    {
      id: "funding",
      title: "أولوية التمويل",
      description: "الحصول على الأولوية في التمويل والدعم",
      icon: TrendingUp,
      color: "from-green-500 to-green-700",
      stats: { priority: "مفعّل", boost: "+40%" },
      available: true,
      link: "/Consortium", // ✅ يبقى في نفس الصفحة
    },
    {
      id: "credibility",
      title: "مصداقية معززة",
      description: "شهادة اعتماد رسمية تزيد ثقة المستثمرين",
      icon: Shield,
      color: "from-blue-500 to-blue-700",
      stats: { certified: "نعم", trust: "+60%" },
      available: true,
      link: "/Consortium", // ✅ يبقى في نفس الصفحة
    },
  ];

  const recentActivities = [
    {
      type: "vote",
      title: "تصويت جديد: توسيع شبكة الموردين",
      time: "منذ ساعتين",
      icon: Vote,
      color: "text-orange-600",
      link: "/Voting", // ✅ صحيح
    },
    {
      type: "contract",
      title: "فرصة مناولة جديدة متاحة",
      time: "منذ 5 ساعات",
      icon: Handshake,
      color: "text-pink-600",
      link: "/Consortium", // ✅ يبقى في نفس الصفحة
    },
    {
      type: "service",
      title: "خدمة استشارات قانونية مجانية",
      time: "منذ يوم",
      icon: FileText,
      color: "text-indigo-600",
      link: "/SharedServices", // ✅ مصحح
    },
    {
      type: "member",
      title: "3 أعضاء جدد انضموا للتكتل",
      time: "منذ يومين",
      icon: Users,
      color: "text-blue-600",
      link: "/Consortium", // ✅ يبقى في نفس الصفحة
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Award className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-blue-900">
                التكتل التعاوني
              </h1>
              <p className="text-gray-600 text-lg">
                منظومة متكاملة للمؤسسات المعتمدة
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              لوحة التحكم
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "members"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              الأعضاء ({qualifiedProjects.length})
            </button>
          </div>
        </motion.div>

        {activeTab === "dashboard" && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-blue-900 mb-1">
                      {isLoading ? "..." : qualifiedProjects.length}
                    </h3>
                    <p className="text-gray-600 text-sm">عضو نشط</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-blue-900 mb-1">
                      {suppliers.length}
                    </h3>
                    <p className="text-gray-600 text-sm">مورد معتمد</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Handshake className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-blue-900 mb-1">
                      28
                    </h3>
                    <p className="text-gray-600 text-sm">فرصة مناولة</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-blue-900 mb-1">
                      {sharedServices.length}
                    </h3>
                    <p className="text-gray-600 text-sm">خدمة مشتركة</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Services Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-blue-900 mb-6">
                الخدمات المتاحة
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link
                      to={service.link}
                      className="block h-full group"
                    >
                      <Card className="bg-white hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div
                            className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                          >
                            <service.icon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-blue-700">
                            {service.title}
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm">
                            {service.description}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-sm">
                              {Object.entries(service.stats).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="text-gray-600"
                                  >
                                    <span className="font-semibold text-blue-900">
                                      {value}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                            <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                          </div>

                          {service.available && (
                            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-semibold">متاح الآن</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
                    <Bell className="w-6 h-6" />
                    النشاطات الأخيرة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <Link
                          to={activity.link}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                        >
                          <div
                            className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}
                          >
                            <activity.icon
                              className={`w-6 h-6 ${activity.color}`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.time}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {activeTab === "members" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900">
                  أعضاء التكتل المعتمدين
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-gray-600 text-center py-8">
                    جاري التحميل...
                  </p>
                ) : qualifiedProjects.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    لا يوجد أعضاء معتمدين حالياً
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {qualifiedProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-blue-900 text-lg mb-1">
                              {project.name_ar || "مشروع بدون اسم"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {project.company_name} • {project.sector}
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 rounded-lg">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">
                              {project.total_score}/100 نقطة
                            </span>
                          </div>
                          {project.benefits && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-700">
                                6 امتيازات مفعّلة
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
