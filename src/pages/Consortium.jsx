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

export default function Consortium() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: qualifiedProjects = [], isLoading } = useQuery({
    queryKey: ["consortium-members"],
    queryFn: async () => {
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("quality_badge", "==", true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    initialData: [],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["consortium-suppliers"],
    queryFn: async () => {
      const suppliersRef = collection(db, "suppliers");
      const snapshot = await getDocs(suppliersRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    initialData: [],
  });

  const { data: sharedServices = [] } = useQuery({
    queryKey: ["consortium-services"],
    queryFn: async () => {
      const servicesRef = collection(db, "shared_services");
      const snapshot = await getDocs(servicesRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    initialData: [],
  });

  const services = [
    {
      id: "supply-chain",
      title: "سلاسل التوريد المشتركة",
      description: "الوصول إلى شبكة موردين موثوقين بأسعار تفضيلية",
      icon: Network,
      link: "/SupplyChain",
    },
    {
      id: "services",
      title: "الخدمات المشتركة",
      description: "محاسبة، قانونية، تسويق، وموارد بشرية",
      icon: Building2,
      link: "/SharedServices",
    },
    {
      id: "voting",
      title: "المشاركة في القرار",
      description: "التصويت على القرارات الاستراتيجية للتكتل",
      icon: Vote,
      link: "/Voting",
    },
    {
      id: "contracts",
      title: "فرص المناولة",
      description: "التعاون في مشاريع المناولة والتعاقد من الباطن",
      icon: Handshake,
      link: "/Consortium",
    },
    {
      id: "funding",
      title: "أولوية التمويل",
      description: "الحصول على الأولوية في التمويل والدعم",
      icon: TrendingUp,
      link: "/FundingPriority",
    },
    {
      id: "credibility",
      title: "مصداقية معززة",
      description: "شهادة اعتماد رسمية تزيد ثقة المستثمرين",
      icon: Shield,
      link: "/EnhancedCredibility",
    },
  ];

  const recentActivities = [
    {
      title: "تصويت جديد: توسيع شبكة الموردين",
      time: "منذ ساعتين",
      icon: Vote,
      link: "/Voting",
    },
    {
      title: "فرصة مناولة جديدة متاحة",
      time: "منذ 5 ساعات",
      icon: Handshake,
      link: "/Consortium",
    },
    {
      title: "خدمة استشارات قانونية مجانية",
      time: "منذ يوم",
      icon: FileText,
      link: "/SharedServices",
    },
    {
      title: "3 أعضاء جدد انضموا للتكتل",
      time: "منذ يومين",
      icon: Users,
      link: "/Consortium",
    },
  ];

  const stats = [
    {
      icon: Users,
      label: "عضو نشط",
      value: isLoading ? "—" : qualifiedProjects.length,
    },
    { icon: Package, label: "مورد معتمد", value: suppliers.length },
    { icon: Handshake, label: "فرصة مناولة", value: 28 },
    { icon: Building2, label: "خدمة مشتركة", value: sharedServices.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                التكتل التعاوني
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                منظومة متكاملة للمؤسسات المعتمدة
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-slate-200">
            {[
              { id: "dashboard", label: "لوحة التحكم" },
              {
                id: "members",
                label: `الأعضاء (${qualifiedProjects.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <Card key={i} className="border-slate-200 shadow-none">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <stat.icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Services / Privileges Grid */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                الخدمات والامتيازات
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Link key={service.id} to={service.link} className="group block">
                    <Card className="h-full border-slate-200 shadow-none hover:border-slate-400 hover:shadow-sm transition-all">
                      <CardContent className="p-5">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                          <service.icon className="w-4 h-4 text-slate-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm mb-1.5">
                          {service.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                            <CheckCircle className="w-3 h-3" />
                            متاح الآن
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <Card className="border-slate-200 shadow-none">
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-400" />
                  النشاطات الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-2">
                <div className="divide-y divide-slate-100">
                  {recentActivities.map((activity, i) => (
                    <Link
                      key={i}
                      to={activity.link}
                      className="flex items-center gap-3 py-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                        <activity.icon className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "members" && (
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-slate-900">
                أعضاء التكتل المعتمدين
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-slate-500 text-sm text-center py-12">
                  جاري التحميل...
                </p>
              ) : qualifiedProjects.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-12">
                  لا يوجد أعضاء معتمدين حالياً
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {qualifiedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm truncate">
                            {project.name_ar || "مشروع بدون اسم"}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {project.company_name} • {project.sector}
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 ml-3">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {project.total_score}/100
                        </span>
                        {project.benefits && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-blue-500" />
                            6 امتيازات
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
