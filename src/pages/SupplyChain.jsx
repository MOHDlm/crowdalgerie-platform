import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { db } from "@/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import videoFile from "./Untitled video - Made with Clipchamp (1).mp4";

// ① الإضافة الوحيدة — استيراد المكون
import MySupplyChainPanel from "../components/myprojects/MySupplyChainPanel";

import {
  Package,
  MapPin,
  Phone,
  Mail,
  Star,
  TrendingDown,
  CheckCircle,
  Filter,
  Search,
  ArrowUpRight,
  ShoppingCart,
  Truck,
  BarChart3,
  Layers,
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
  X,
  ArrowLeft,
  Settings,
  CheckCircle2,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { motion } from "framer-motion";
import SmartLogistics from "../components/SmartLogistics";

export default function SupplyChain() {
  const generateHistoricalData = () => {
    const months = [];
    const baseValue = 10000;
    for (let i = 0; i < 36; i++) {
      const trend = i * 150;
      const seasonal = Math.sin((i * Math.PI) / 6) * 2000;
      const noise = (Math.random() - 0.5) * 1000;
      months.push({
        month: i + 1,
        sales: Math.round(baseValue + trend + seasonal + noise),
        production: Math.round(baseValue + trend + seasonal + noise * 0.8),
      });
    }
    return months;
  };

  const forecastDemand = (historicalData) => {
    const lastYear = historicalData.slice(-12);
    const avgGrowth =
      lastYear.reduce((sum, m, i) => {
        if (i === 0) return 0;
        return sum + (m.sales - lastYear[i - 1].sales) / lastYear[i - 1].sales;
      }, 0) / 11;
    return Array.from({ length: 6 }, (_, i) => {
      const lastMonth = historicalData[historicalData.length - 1];
      const seasonal = Math.sin(((36 + i) * Math.PI) / 6) * 2000;
      const growth = lastMonth.sales * avgGrowth * (i + 1);
      return {
        month: 37 + i,
        forecast: Math.round(lastMonth.sales + growth + seasonal),
        confidence: 85 + Math.random() * 10,
      };
    });
  };

  const generateSupplierBids = () => {
    const items = [
      { name: "صلب منشأ", unit: "طن", qty: 500 },
      { name: "أسمنت بورتلاند", unit: "طن", qty: 1000 },
      { name: "كابلات كهربائية", unit: "متر", qty: 5000 },
    ];
    return items.map((item) => {
      const basePrice = Math.random() * 1000 + 500;
      const suppliers = [
        { name: "المورد أ", price: basePrice, deliveryDays: 15 },
        { name: "المورد ب", price: basePrice * 0.92, deliveryDays: 20 },
        { name: "المورد ج", price: basePrice * 1.05, deliveryDays: 10 },
        { name: "المورد د", price: basePrice * 0.88, deliveryDays: 25 },
      ].sort((a, b) => a.price - b.price);
      return {
        item: item.name,
        unit: item.unit,
        qty: item.qty,
        suppliers,
        bestBid: suppliers[0],
        savings: (
          ((suppliers[2].price - suppliers[0].price) / suppliers[2].price) *
          100
        ).toFixed(1),
      };
    });
  };

  const generateInventoryData = () => {
    const companies = [
      { id: "A", name: "الشركة أ", color: "#3b82f6" },
      { id: "B", name: "الشركة ب", color: "#8b5cf6" },
      { id: "C", name: "الشركة ج", color: "#f59e0b" },
      { id: "D", name: "الشركة د", color: "#10b981" },
    ];
    const items = [
      { id: 1, name: "صلب منشأ", unit: "طن", rop: 50, safetyStock: 20 },
      { id: 2, name: "أسمنت بورتلاند", unit: "طن", rop: 100, safetyStock: 40 },
      {
        id: 3,
        name: "كابلات كهربائية",
        unit: "متر",
        rop: 500,
        safetyStock: 200,
      },
      { id: 4, name: "مواسير PVC", unit: "متر", rop: 300, safetyStock: 100 },
    ];
    const data = [];
    companies.forEach((company) => {
      items.forEach((item) => {
        const currentStock = Math.floor(Math.random() * 200);
        const turnoverRate = Math.random() * 10 + 1;
        const daysToExpiry = Math.floor(Math.random() * 365);
        data.push({
          company: company.name,
          companyId: company.id,
          companyColor: company.color,
          item: item.name,
          itemId: item.id,
          unit: item.unit,
          currentStock,
          rop: item.rop,
          safetyStock: item.safetyStock,
          turnoverRate: turnoverRate.toFixed(1),
          daysToExpiry,
          isStagnant: turnoverRate < 2,
          needsReorder: currentStock < item.rop,
          value: currentStock * (500 + Math.random() * 1000),
        });
      });
    });
    return data;
  };

  const generateTransferOrders = (inventoryData) => {
    const transfers = [];
    const items = [...new Set(inventoryData.map((d) => d.itemId))];
    items.forEach((itemId) => {
      const itemStocks = inventoryData.filter((d) => d.itemId === itemId);
      const avgStock =
        itemStocks.reduce((s, i) => s + i.currentStock, 0) / itemStocks.length;
      const surplus = itemStocks.filter((s) => s.currentStock > avgStock * 1.3);
      const deficit = itemStocks.filter(
        (s) => s.needsReorder || s.currentStock < avgStock * 0.7,
      );
      if (surplus.length > 0 && deficit.length > 0) {
        surplus.forEach((from) => {
          deficit.forEach((to) => {
            if (from.companyId !== to.companyId) {
              const qty = Math.min(
                Math.floor((from.currentStock - avgStock) * 0.5),
                to.rop - to.currentStock,
              );
              if (qty > 0)
                transfers.push({
                  from: from.company,
                  to: to.company,
                  item: from.item,
                  qty,
                  unit: from.unit,
                  reason: to.needsReorder ? "عجز حرج" : "إعادة توازن",
                  urgency: to.needsReorder ? "عالي" : "متوسط",
                  estimatedSavings: qty * (300 + Math.random() * 500),
                });
            }
          });
        });
      }
    });
    return transfers.slice(0, 6);
  };

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showTechView, setShowTechView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [forecastResults, setForecastResults] = useState(null);
  const [biddingResults, setBiddingResults] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [transferOrders, setTransferOrders] = useState(null);
  // ② الإضافة الثانية — state للـ panel
  const [showMyChain, setShowMyChain] = useState(false);

  const runLiveSimulation = () => {
    setIsProcessing(true);
    setLiveData(null);
    setForecastResults(null);
    setBiddingResults(null);
    setInventoryData(null);
    setTransferOrders(null);
    setTimeout(() => {
      if (selectedCard.id === 1) {
        const historical = generateHistoricalData();
        setLiveData(historical);
        setTimeout(() => {
          setForecastResults(forecastDemand(historical));
          setIsProcessing(false);
        }, 1500);
      }
      if (selectedCard.id === 2) {
        setBiddingResults(generateSupplierBids());
        setIsProcessing(false);
      }
      if (selectedCard.id === 3) {
        const inventory = generateInventoryData();
        setInventoryData(inventory);
        setTimeout(() => {
          setTransferOrders(generateTransferOrders(inventory));
          setIsProcessing(false);
        }, 1500);
      }
      if (selectedCard.id === 4) {
        setIsProcessing(false);
      }
    }, 1000);
  };

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "suppliers"));
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    initialData: [],
  });

  const categories = [
    { id: "all", name: "الكل", count: suppliers.length },
    {
      id: "raw_materials",
      name: "مواد خام",
      count: suppliers.filter((s) => s.category === "raw_materials").length,
    },
    {
      id: "logistics",
      name: "لوجستيات",
      count: suppliers.filter((s) => s.category === "logistics").length,
    },
    {
      id: "technology",
      name: "تكنولوجيا",
      count: suppliers.filter((s) => s.category === "technology").length,
    },
  ];

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchCategory =
      selectedCategory === "all" || supplier.category === selectedCategory;
    const matchSearch = (supplier.name_ar || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const spendData = suppliers.slice(0, 5).map((s) => ({
    name: s.name_ar || "مورد",
    value: Math.floor(Math.random() * 5000000) + 1000000,
  }));
  const categoryData = categories
    .filter((c) => c.id !== "all")
    .map((c, idx) => ({
      name: c.name,
      value: c.count,
      color: ["#9333ea", "#f59e0b", "#3b82f6"][idx],
    }));

  const handleClose = () => {
    setSelectedCard(null);
    setShowTechView(false);
    setIsProcessing(false);
    setLiveData(null);
    setForecastResults(null);
    setBiddingResults(null);
    setInventoryData(null);
    setTransferOrders(null);
  };

  const processSteps = [
    {
      id: 1,
      title: "التخطيط والتنبؤ (S&OP)",
      shortDesc: "مجلس تخطيط مركزي لتوحيد الرؤية.",
      icon: BarChart3,
      color: "blue",
      details: {
        headline: "القضاء على 'تأثير السوط'",
        description:
          "موازنة الإنتاج والشراء بناءً على الرؤية الكاملة للمجموعة.",
        points: ["منع تكديس المخزون.", "توحيد جداول الإنتاج."],
        stat: "15%",
        statLabel: "دقة التنبؤ",
      },
      tech: {
        inputs: [
          "بيانات المبيعات التاريخية (3 سنوات)",
          "خطط الإنتاج من المصانع (ERP)",
          "اتجاهات السوق الموسمية (External Data)",
        ],
        process:
          "خوارزميات التنبؤ بالطلب (Demand Forecasting AI) + موازنة العرض والطلب",
        outputs: [
          "خطة طلب موحدة (Unified Demand Plan)",
          "جدول الإنتاج الرئيسي (MPS)",
          "تنبيهات العجز المبكر",
        ],
      },
      hasLiveDemo: true,
    },
    {
      id: 2,
      title: "التوريد الموحد",
      shortDesc: "قوة شرائية مجمعة لتقليل التكاليف.",
      icon: Globe,
      color: "indigo",
      details: {
        headline: "القوة الشرائية إلى مكاسب",
        description: "تقسيم المشتريات إلى فئات وتعيين مدير فئة مسؤول.",
        points: ["عقود إطارية سنوية.", "توحيد قاعدة الموردين."],
        stat: "22%",
        statLabel: "وفر مالي",
      },
      tech: {
        inputs: [
          "طلبات الشراء (PRs) من جميع الشركات",
          "مواصفات المواد (Item Master Data)",
          "أسعار البورصة العالمية للمواد الخام",
        ],
        process:
          "تجميع الطلبات (Aggregation Logic) + المناقصات الإلكترونية (E-Sourcing)",
        outputs: [
          "أوامر شراء مجمعة (Blanket POs)",
          "عقود إطارية (Framework Agreements)",
          "تقارير تقييم الموردين",
        ],
      },
      hasLiveDemo: true,
    },
    {
      id: 3,
      title: "المخزون المركزي",
      shortDesc: "نموذج Hub & Spoke لتبادل الفوائض.",
      icon: Layers,
      color: "violet",
      details: {
        headline: "الذكاء اللوجستي",
        description: "يستقبل المركز الرئيسي الشحنات ويوزعها حسب الحاجة.",
        points: ["تصفية المخزون الراكد.", "رؤية لحظية للمخزون."],
        stat: "30%",
        statLabel: "خفض التخزين",
      },
      tech: {
        inputs: [
          "مستويات المخزون الحالية (Stock Levels)",
          "معدل دوران الصنف (Turnover Rate)",
          "تواريخ انتهاء الصلاحية (Expiry Dates)",
        ],
        process:
          "خوارزمية إعادة التوزيع (Redistribution Algo) + حساب مستويات الأمان",
        outputs: [
          "أوامر نقل مخزني داخلي (Transfer Orders)",
          "قوائم المواد الراكدة للبيع",
          "تنبيهات نقطة إعادة الطلب (ROP)",
        ],
      },
      hasLiveDemo: true,
    },
    {
      id: 4,
      title: "اللوجستيات الذكية",
      shortDesc: "تجميع الشحنات ودمج المسارات.",
      icon: Truck,
      color: "emerald",
      details: {
        headline: "لا شاحنات فارغة",
        description: "دمج الشحنات وتنسيق رحلات التوزيع الداخلي.",
        points: ["دمج حاويات الاستيراد.", "مسارات Milk Runs."],
        stat: "40%",
        statLabel: "كفاءة الأسطول",
      },
      tech: {
        inputs: [
          "مواعيد جاهزية البضاعة (Cargo Readiness)",
          "عناوين التسليم (Delivery Points)",
          "سعة الشاحنات/الحاويات المتوفرة",
        ],
        process:
          "محرك تحسين المسارات (Route Optimization Engine) + منطق التجميع (Consolidation)",
        outputs: [
          "بوليصة شحن مجمعة (Master BL)",
          "خطة تحميل الشاحنات (Load Plan)",
          "جداول التوصيل الموحدة",
        ],
      },
    },
  ];

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );

  if (!showSuppliers) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-slate-50 font-sans text-slate-800"
      >
        {/* ③ الإضافة الثالثة — الزر والـ Modal */}

        {/* زر عائم */}
        <button
          onClick={() => setShowMyChain(true)}
          style={{
            position: "fixed",
            top: 150,
            right: 20,
            zIndex: 999,
            background:
              "linear-gradient(135deg, rgb(175, 30, 30), rgb(237, 207, 58))",
            color: "white",
            border: "2px solid rgba(255,255,255,0.25)",
            borderRadius: 114,
            padding: "12px 22px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow:
              "rgba(124,58,237,0.5) 0px 8px 32px, rgba(255,255,255,0.1) 0px 0px 0px 1px inset",
            fontFamily: "inherit",
            fontWeight: "bold",
            fontSize: 25,
            letterSpacing: "0.3px",
            backdropFilter: "blur(8px)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          🔗 انشاء سلسلة توريد
        </button>

        {/* Modal */}
        {showMyChain && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setShowMyChain(false)}
            />
            <div
              style={{
                position: "relative",
                background: "white",
                borderRadius: 20,
                boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
                width: "100%",
                maxWidth: 900,
                maxHeight: "90vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg,#1e3a8a,#4c1d95)",
                  color: "white",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>🔗</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: "bold" }}>
                      سلسلة التوريد الخاصة بمشروعي
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.75 }}>
                      أضف نقاط التوريد وستظهر على الخريطة التفاعلية تلقائياً
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMyChain(false)}
                  style={{
                    background: "rgba(255,255,255,.15)",
                    border: "none",
                    color: "white",
                    borderRadius: 8,
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                <MySupplyChainPanel />
              </div>
            </div>
          </div>
        )}
        {/* نهاية الإضافة */}

        {selectedCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handleClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[600px]">
              <div className="md:w-1/3 bg-blue-600 p-8 text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 100 L100 0 L100 100 Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <div className="relative z-10">
                  <button
                    onClick={handleClose}
                    className="mb-8 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors w-fit block md:hidden"
                  >
                    <X size={20} />
                  </button>
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 w-fit mb-6 shadow-lg">
                    <selectedCard.icon size={40} />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">
                    {selectedCard.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {selectedCard.shortDesc}
                  </p>
                </div>
                <div className="relative z-10 hidden md:block">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <span className="block text-3xl font-bold mb-1">
                      {selectedCard.details.stat}
                    </span>
                    <span className="text-xs uppercase tracking-wider opacity-75">
                      {selectedCard.details.statLabel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3 bg-white relative flex flex-col">
                <button
                  onClick={handleClose}
                  className="absolute top-6 left-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors z-20 hidden md:block"
                >
                  <X size={24} />
                </button>
                <div className="flex border-b border-slate-100 px-8 pt-8 gap-6">
                  <button
                    onClick={() => setShowTechView(false)}
                    className={`pb-4 text-sm font-bold transition-colors border-b-2 ${!showTechView ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    نظرة إدارية
                  </button>
                  <button
                    onClick={() => setShowTechView(true)}
                    className={`pb-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${showTechView ? "border-slate-800 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    <Settings size={14} />
                    الإعدادات التقنية (I/O)
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                  {!showTechView ? (
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-4">
                        {selectedCard.details.headline}
                      </h4>
                      <p className="text-slate-600 leading-relaxed mb-6">
                        {selectedCard.details.description}
                      </p>
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                        <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <CheckCircle2
                            size={18}
                            className="text-blue-500"
                          />
                          النقاط الرئيسية
                        </h5>
                        <ul className="space-y-3">
                          {selectedCard.details.points.map((point, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-sm text-slate-600 pr-6 relative"
                            >
                              <span className="absolute right-0 top-2 w-1.5 h-1.5 rounded-full bg-blue-400" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => setShowTechView(true)}
                        className="w-full py-3 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Settings size={18} />
                        عرض نموذج تدفق البيانات
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-xs mb-6 shadow-inner flex items-center gap-2 border border-slate-800">
                        <span className="animate-pulse">●</span>System_Status:
                        ONLINE | Module: {selectedCard.title}
                      </div>
                      {selectedCard.hasLiveDemo && (
                        <button
                          onClick={runLiveSimulation}
                          disabled={isProcessing}
                          className="mb-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <span>⏳ جاري المعالجة...</span>
                          ) : (
                            <span>▶️ RUN</span>
                          )}
                        </button>
                      )}
                      {liveData && (
                        <div className="mb-6 bg-white border-2 border-blue-200 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">
                            📊 بيانات المبيعات (آخر 12 شهر)
                          </h4>
                          <div className="h-48">
                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                            >
                              <LineChart data={liveData.slice(-12)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="month"
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                <Line
                                  type="monotone"
                                  dataKey="sales"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                  name="المبيعات"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="production"
                                  stroke="#8b5cf6"
                                  strokeWidth={2}
                                  name="الإنتاج"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-blue-50 rounded p-2">
                              <div className="text-lg font-bold text-blue-600">
                                {Math.round(
                                  liveData.reduce((s, m) => s + m.sales, 0) /
                                    liveData.length,
                                ).toLocaleString()}
                              </div>
                              <div className="text-gray-600">متوسط شهري</div>
                            </div>
                            <div className="bg-green-50 rounded p-2">
                              <div className="text-lg font-bold text-green-600">
                                +
                                {Math.round(
                                  ((liveData[35].sales - liveData[0].sales) /
                                    liveData[0].sales) *
                                    100,
                                )}
                                %
                              </div>
                              <div className="text-gray-600">النمو 3 سنوات</div>
                            </div>
                            <div className="bg-purple-50 rounded p-2">
                              <div className="text-lg font-bold text-purple-600">
                                {Math.round(
                                  (liveData.reduce(
                                    (s, m) =>
                                      s + Math.abs(m.sales - m.production),
                                    0,
                                  ) /
                                    liveData.length /
                                    liveData[0].sales) *
                                    100,
                                )}
                                %
                              </div>
                              <div className="text-gray-600">الفجوة</div>
                            </div>
                          </div>
                        </div>
                      )}
                      {forecastResults && (
                        <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">
                            🤖 التنبؤ بالذكاء الاصطناعي (6 أشهر)
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {forecastResults.map((f) => (
                              <div
                                key={f.month}
                                className="flex items-center justify-between bg-white rounded p-2 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center font-bold text-green-700 text-xs">
                                    {f.month - 36}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      شهر {f.month - 36}
                                    </div>
                                    <div className="text-gray-500">
                                      ثقة: {f.confidence.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-base font-bold text-green-600">
                                    {f.forecast.toLocaleString()}
                                  </div>
                                  <div className="text-gray-500">وحدة</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {biddingResults && (
                        <div className="mb-6 space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">
                            📋 نتائج المناقصة الإلكترونية
                          </h4>
                          {biddingResults.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-white border-2 border-indigo-200 rounded-xl p-4"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-bold text-gray-900">
                                    {item.item}
                                  </h5>
                                  <p className="text-xs text-gray-500">
                                    الكمية: {item.qty} {item.unit}
                                  </p>
                                </div>
                                <div className="bg-green-100 px-3 py-1 rounded-full">
                                  <span className="text-xs font-bold text-green-700">
                                    وفر {item.savings}%
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {item.suppliers.map((sup, i) => (
                                  <div
                                    key={i}
                                    className={`flex justify-between items-center p-2 rounded ${i === 0 ? "bg-indigo-50 border-2 border-indigo-400" : "bg-gray-50"}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {i === 0 && (
                                        <span className="text-lg">🏆</span>
                                      )}
                                      <div>
                                        <p className="text-xs font-semibold text-gray-900">
                                          {sup.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {sup.deliveryDays} يوم توصيل
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-indigo-600">
                                        {sup.price.toFixed(2)} ر.س
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        للوحدة
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                  إجمالي الطلب
                                </span>
                                <span className="text-lg font-bold text-indigo-600">
                                  {(
                                    item.bestBid.price * item.qty
                                  ).toLocaleString()}{" "}
                                  ر.س
                                </span>
                              </div>
                            </div>
                          ))}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">💰</span>
                              <h5 className="font-bold text-gray-900">
                                إجمالي الوفورات
                              </h5>
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                              {biddingResults
                                .reduce(
                                  (sum, item) =>
                                    sum +
                                    (item.suppliers[2].price -
                                      item.bestBid.price) *
                                      item.qty,
                                  0,
                                )
                                .toLocaleString()}{" "}
                              ر.س
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              من خلال اختيار أفضل العروض
                            </p>
                          </div>
                        </div>
                      )}
                      {inventoryData && (
                        <div className="mb-6 bg-white border-2 border-violet-200 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">
                            📦 حالة المخزون عبر الشركات
                          </h4>
                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {inventoryData.slice(0, 8).map((inv, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border-2 ${inv.needsReorder ? "bg-red-50 border-red-300" : inv.isStagnant ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor: inv.companyColor,
                                      }}
                                    />
                                    <div>
                                      <p className="text-xs font-bold text-gray-900">
                                        {inv.company}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {inv.item}
                                      </p>
                                    </div>
                                  </div>
                                  {inv.needsReorder && (
                                    <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-bold">
                                      🚨 عجز
                                    </span>
                                  )}
                                  {inv.isStagnant && !inv.needsReorder && (
                                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">
                                      ⚠️ راكد
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                  <div>
                                    <p className="text-gray-500">المخزون</p>
                                    <p className="font-bold text-gray-900">
                                      {inv.currentStock}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">ROP</p>
                                    <p className="font-bold text-gray-900">
                                      {inv.rop}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">الدوران</p>
                                    <p className="font-bold text-gray-900">
                                      {inv.turnoverRate}x
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">الصلاحية</p>
                                    <p className="font-bold text-gray-900">
                                      {inv.daysToExpiry}د
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {transferOrders && transferOrders.length > 0 && (
                        <div className="mb-6 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-300 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">
                            🔄 أوامر النقل المقترحة
                          </h4>
                          <div className="space-y-3">
                            {transferOrders.map((order, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded-lg p-3 border border-violet-200"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-blue-600 font-bold text-xs">
                                        {order.from}
                                      </span>
                                      <span className="text-gray-400">→</span>
                                      <span className="text-green-600 font-bold text-xs">
                                        {order.to}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      {order.item}: {order.qty} {order.unit}
                                    </p>
                                  </div>
                                  <div
                                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.urgency === "عالي" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                                  >
                                    {order.urgency}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                  <span className="text-xs text-gray-500">
                                    السبب: {order.reason}
                                  </span>
                                  <span className="text-xs font-bold text-violet-600">
                                    وفر:{" "}
                                    {order.estimatedSavings.toLocaleString()}{" "}
                                    ر.س
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-violet-200">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">
                                إجمالي التوفير المتوقع
                              </span>
                              <span className="text-lg font-bold text-violet-600">
                                {transferOrders
                                  .reduce(
                                    (sum, o) => sum + o.estimatedSavings,
                                    0,
                                  )
                                  .toLocaleString()}{" "}
                                ر.س
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedCard.id === 4 && !isProcessing && (
                        <div className="mb-6">
                          <SmartLogistics />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border-r-4 border-blue-500 shadow-sm">
                          <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">
                            المدخلات
                          </h5>
                          <ul className="space-y-1">
                            {selectedCard.tech.inputs.map((inp, i) => (
                              <li
                                key={i}
                                className="text-xs text-slate-700"
                              >
                                → {inp}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-800 text-white px-3 py-2 rounded text-center font-mono text-xs">
                          ⚙️ {selectedCard.tech.process}
                        </div>
                        <div className="bg-white p-3 rounded-xl border-r-4 border-emerald-500 shadow-sm">
                          <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">
                            المخرجات
                          </h5>
                          <ul className="space-y-1">
                            {selectedCard.tech.outputs.map((out, i) => (
                              <li
                                key={i}
                                className="text-xs font-bold text-emerald-800"
                              >
                                ✓ {out}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="relative bg-slate-900 text-white overflow-hidden pb-20 pt-24">
          <div className="absolute inset-0 opacity-30">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source
                src={videoFile}
                type="video/mp4"
              />
            </video>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 w-full hidden lg:block" />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/50 border border-blue-700 text-blue-200 text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                الجيل القادم من سلاسل الإمداد
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                من التشتت إلى <span className="text-blue-400">قوة التكتل</span>{" "}
                الموحد
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                نحول الشركات المنفصلة إلى منظومة توريد متكاملة رأسياً وأفقياً.
                نشتري ككيان واحد، نخزن بذكاء، وننقل بكفاءة لتحقيق وفورات الحجم.
              </p>
              <div className="flex flex-wrap gap-4 hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSuppliers(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  START
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            </div>
            <div className="relative h-96 w-full hidden lg:block">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.6)] z-20 border-4 border-blue-400/30">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-slate-900/40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Layers
                      className="mx-auto mb-2"
                      size={48}
                    />
                    <span className="text-lg font-bold block">المركز</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-slate-700 rounded-full opacity-50" />
            </div>
          </div>
        </header>

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-blue-600 font-bold text-sm tracking-widest uppercase mb-3">
                Operating structure
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                4 pillars for leading transformation
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedCard(step)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-100 text-right w-full"
                  >
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon size={28} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">
                      {step.title}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                      {step.shortDesc}
                    </p>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between w-full text-blue-600 text-xs font-bold uppercase tracking-wider">
                      <span>استكشف البروتوكول</span>
                      <ArrowLeft
                        size={16}
                        className="group-hover:-translate-x-1 transition-transform"
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Why is this model the best?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-blue-500 transition-colors">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingDown size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  Cost reduction
                </h3>
                <p className="text-slate-400 text-sm text-center">
                  Reducing storage costs by 20–30% and shipping costs
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-colors">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  Flexibility
                </h3>
                <p className="text-slate-400 text-sm text-center">
                  Covering shortages through sister companies during emergencies
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 hover:border-amber-500 transition-colors">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Speed</h3>
                <p className="text-slate-400 text-sm text-center">
                  Identifying supply issues weeks before they occur
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Get ready to transform the supply chain
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSuppliers(true)}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition-all"
            >
              Explore suppliers now
            </motion.button>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  📍 Locations and warehouses
                </h2>
                <p className="text-slate-600">
                  Supply chain location management
                </p>
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                ➕ إضافة موقع
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "laghouat",
                  loc: "BLIDA",
                  type: "Regional warehouse",
                  cap: "5000 tn",
                },
                {
                  name: "algeria",
                  loc: "algeria",
                  type: "Regional warehouse",
                  cap: "3000 tn",
                },
                {
                  name: "BLIDA",
                  loc: "BLIDA",
                  type: "center distribution",
                  cap: "2000 tn",
                },
              ].map((w, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">
                        {w.name}
                      </h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <MapPin size={16} />
                        {w.loc}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      active
                    </span>
                  </div>
                  <div className="space-y-2 p-3 bg-white rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">type:</span>
                      <span className="font-semibold">{w.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Capacity:</span>
                      <span className="font-semibold">{w.cap}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Layers
                size={24}
                className="text-blue-600"
              />
              <span className="text-lg font-bold text-white">SC-ALLIANCE</span>
            </div>
            <p className="text-sm">
              © 2026 All rights reserved to the Unified Cluster System.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSuppliers(false)}
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 mb-8"
        >
          <ArrowRight size={20} />
          العودة إلى البداية
        </motion.button>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
            <Package className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-blue-900">
              سلاسل التوريد المشتركة
            </h1>
            <p className="text-gray-600 text-lg">
              شبكة موردين موثوقين بأسعار تفضيلية
            </p>
          </div>
        </div>
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن موردين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md">
            + إضافة مورد جديد
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    إجمالي الموردين
                  </p>
                  <h3 className="text-3xl font-bold text-blue-900">
                    {suppliers.length}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-purple-500">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                <ArrowUpRight className="w-4 h-4" />
                <span>زيادة 12% عن العام الماضي</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    الموردين النشطين
                  </p>
                  <h3 className="text-3xl font-bold text-blue-900">
                    {suppliers.filter((s) => s.active).length}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-green-500">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-gray-600">معتمدين وموثوقين</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    متوسط الخصم
                  </p>
                  <h3 className="text-3xl font-bold text-blue-900">
                    {suppliers.length > 0
                      ? Math.round(
                          suppliers.reduce(
                            (sum, s) => sum + (parseInt(s.discount_rate) || 0),
                            0,
                          ) / suppliers.length,
                        )
                      : 0}
                    %
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-gray-600">توفير للأعضاء</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    متوسط التقييم
                  </p>
                  <h3 className="text-3xl font-bold text-blue-900">
                    {suppliers.length > 0
                      ? (
                          suppliers.reduce(
                            (sum, s) => sum + (parseFloat(s.rating) || 0),
                            0,
                          ) / suppliers.length
                        ).toFixed(1)
                      : 0}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-gray-600">/5.0</div>
            </CardContent>
          </Card>
        </div>
        {suppliers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border-0">
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                توزيع الإنفاق على الموردين
              </h3>
              <div
                className="h-80 w-full"
                dir="ltr"
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={spendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#9333ea"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-0">
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                توزيع الفئات
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                توزيع الموردين حسب التخصص
              </p>
              <div
                className="h-64 w-full relative"
                dir="ltr"
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                className="flex flex-wrap justify-center gap-3 mt-4"
                dir="rtl"
              >
                {categoryData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-6 h-6 text-blue-900" />
            <h2 className="text-xl font-bold text-blue-900">تصفية حسب الفئة</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${selectedCategory === category.id ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg" : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300"}`}
              >
                {category.name}
                <span className="ml-2 text-sm opacity-75">
                  ({category.count})
                </span>
              </motion.button>
            ))}
          </div>
        </div>
        {filteredSuppliers.length === 0 ? (
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 font-semibold">
                لا توجد نتائج
              </p>
              <p className="text-gray-500 mt-2">حاول تغيير معايير البحث</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="bg-white hover:shadow-2xl transition-all border-0 h-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {supplier.name_ar || "مورد بدون اسم"}
                        </h3>
                        <p className="text-purple-100 text-sm">
                          {supplier.name_en || ""}
                        </p>
                      </div>
                      {supplier.active && (
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {supplier.category_ar || supplier.category || "عام"}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
                      {supplier.description || "لا يوجد وصف"}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">خصم حصري</p>
                        <p className="text-2xl font-bold text-green-600">
                          {supplier.discount_rate || "0"}%
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-gray-600 mb-1">التقييم</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <p className="text-2xl font-bold text-yellow-600">
                            {supplier.rating || "0"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-blue-600" />
                        <span>{supplier.location || "لا يوجد عنوان"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                        <Phone className="w-4 h-4 flex-shrink-0 text-green-600" />
                        <span dir="ltr">{supplier.phone || "لا يوجد رقم"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors">
                        <Mail className="w-4 h-4 flex-shrink-0 text-purple-600" />
                        <span
                          className="truncate"
                          dir="ltr"
                        >
                          {supplier.email || "لا يوجد بريد"}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all group-hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      طلب عرض أسعار
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
