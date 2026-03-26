import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X, Building2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── قائمة الولايات الـ 58 ──────────────────────────────────────────────────
const WILAYAS = [
  "أدرار",
  "الشلف",
  "الأغواط",
  "أم البواقي",
  "باتنة",
  "بجاية",
  "بسكرة",
  "بشار",
  "البليدة",
  "البويرة",
  "تمنراست",
  "تبسة",
  "تلمسان",
  "تيارت",
  "تيزي وزو",
  "الجزائر",
  "الجلفة",
  "جيجل",
  "سطيف",
  "سعيدة",
  "سكيكدة",
  "سيدي بلعباس",
  "عنابة",
  "قالمة",
  "قسنطينة",
  "المدية",
  "مستغانم",
  "المسيلة",
  "معسكر",
  "ورقلة",
  "وهران",
  "البيض",
  "إليزي",
  "برج بوعريريج",
  "بومرداس",
  "الطارف",
  "تندوف",
  "تيسمسيلت",
  "الوادي",
  "خنشلة",
  "سوق أهراس",
  "تيبازة",
  "ميلة",
  "عين الدفلى",
  "النعامة",
  "عين تموشنت",
  "غرداية",
  "غليزان",
  "تيميمون",
  "برج باجي مختار",
  "أولاد جلال",
  "بني عباس",
  "عين صالح",
  "عين قزام",
  "توقرت",
  "جانت",
  "المغير",
  "المنيعة",
];

const EMPTY_FORM = {
  name_ar: "",
  name_en: "",
  description: "",
  category: "legal",
  provider: "",
  wilaya: "",
  price_before: "",
  price_after: "",
  discount_percentage: "",
  duration: "",
  rating: "0",
  bookings_count: "0",
  available: true,
};

export default function SharedServicesAdmin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["shared-services"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "shared_services"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  const toNumbers = (data) => ({
    ...data,
    price_before: Number(data.price_before),
    price_after: Number(data.price_after),
    discount_percentage: Number(data.discount_percentage),
    rating: Number(data.rating),
    bookings_count: Number(data.bookings_count),
  });

  const addServiceMutation = useMutation({
    mutationFn: async (newService) => {
      await addDoc(collection(db, "shared_services"), {
        ...toNumbers(newService),
        created_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["shared-services"]);
      resetForm();
      setIsAddingService(false);
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await updateDoc(doc(db, "shared_services", id), toNumbers(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["shared-services"]);
      setEditingService(null);
      resetForm();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id) => deleteDoc(doc(db, "shared_services", id)),
    onSuccess: () => queryClient.invalidateQueries(["shared-services"]),
  });

  const resetForm = () => setFormData(EMPTY_FORM);

  const set = (field, val) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = () => {
    const required = [
      "name_ar",
      "name_en",
      "description",
      "provider",
      "wilaya",
      "price_before",
      "price_after",
      "discount_percentage",
      "duration",
    ];
    if (required.some((f) => !formData[f])) {
      alert("الرجاء ملء جميع الحقول المطلوبة (بما فيها الولاية)");
      return;
    }
    if (editingService)
      updateServiceMutation.mutate({ id: editingService.id, data: formData });
    else addServiceMutation.mutate(formData);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name_ar: service.name_ar || "",
      name_en: service.name_en || "",
      description: service.description || "",
      category: service.category || "legal",
      provider: service.provider || "",
      wilaya: service.wilaya || "",
      price_before: String(service.price_before || ""),
      price_after: String(service.price_after || ""),
      discount_percentage: String(service.discount_percentage || ""),
      duration: service.duration || "",
      rating: String(service.rating || "0"),
      bookings_count: String(service.bookings_count || "0"),
      available: service.available !== false,
    });
    setIsAddingService(true);
  };

  const handleCancel = () => {
    setIsAddingService(false);
    setEditingService(null);
    resetForm();
  };
  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الخدمة؟"))
      deleteServiceMutation.mutate(id);
  };

  const inputCls =
    "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
                <Building2 className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  إدارة الخدمات المشتركة
                </h1>
                <p className="text-slate-600 text-lg">
                  إضافة وتعديل الخدمات المتاحة للأعضاء
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* زر العودة لصفحة الخدمات */}
              <button
                onClick={() => navigate("/consortium/services")}
                className="flex items-center gap-2 border-2 border-indigo-300 text-indigo-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-50 transition-all text-sm"
              >
                ← عرض الخدمات
              </button>
              {!isAddingService && (
                <button
                  onClick={() => setIsAddingService(true)}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  إضافة خدمة جديدة
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {isAddingService && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="bg-white shadow-xl border-2 border-indigo-200">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                  <CardTitle className="text-white text-2xl">
                    {editingService ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Names */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          اسم الخدمة (بالعربية) *
                        </label>
                        <input
                          type="text"
                          value={formData.name_ar}
                          onChange={(e) => set("name_ar", e.target.value)}
                          className={inputCls}
                          placeholder="مثال: استشارات قانونية"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Service Name (English) *
                        </label>
                        <input
                          type="text"
                          value={formData.name_en}
                          onChange={(e) => set("name_en", e.target.value)}
                          className={inputCls}
                          placeholder="Example: Legal Consulting"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        الوصف *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => set("description", e.target.value)}
                        className={`${inputCls} resize-none`}
                        rows={3}
                        placeholder="وصف تفصيلي للخدمة..."
                      />
                    </div>

                    {/* Category + Provider */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          الفئة *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => set("category", e.target.value)}
                          className={`${inputCls} bg-white`}
                        >
                          <option value="legal">قانونية - Legal</option>
                          <option value="accounting">
                            محاسبة - Accounting
                          </option>
                          <option value="marketing">تسويق - Marketing</option>
                          <option value="hr">موارد بشرية - HR</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          مزود الخدمة *
                        </label>
                        <input
                          type="text"
                          value={formData.provider}
                          onChange={(e) => set("provider", e.target.value)}
                          className={inputCls}
                          placeholder="اسم الشركة أو المكتب"
                        />
                      </div>
                    </div>

                    {/* ── الولاية (حقل جديد) ── */}
                    <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                      <label className="block text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> الولاية *{" "}
                        <span className="text-xs font-normal text-indigo-500">
                          (تظهر الخدمة على الخريطة في هذه الولاية)
                        </span>
                      </label>
                      <select
                        value={formData.wilaya}
                        onChange={(e) => set("wilaya", e.target.value)}
                        className={`${inputCls} bg-white border-indigo-300 focus:border-indigo-600`}
                        dir="rtl"
                      >
                        <option value="">-- اختر الولاية --</option>
                        {WILAYAS.map((w) => (
                          <option
                            key={w}
                            value={w}
                          >
                            {w}
                          </option>
                        ))}
                      </select>
                      {formData.wilaya && (
                        <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                          ✓ ستظهر هذه الخدمة على خريطة Badge في ولاية{" "}
                          <strong>{formData.wilaya}</strong>
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          السعر قبل الخصم (DZD) *
                        </label>
                        <input
                          type="number"
                          value={formData.price_before}
                          onChange={(e) => set("price_before", e.target.value)}
                          className={inputCls}
                          placeholder="50000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          السعر بعد الخصم (DZD) *
                        </label>
                        <input
                          type="number"
                          value={formData.price_after}
                          onChange={(e) => set("price_after", e.target.value)}
                          className={inputCls}
                          placeholder="30000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          نسبة الخصم (%) *
                        </label>
                        <input
                          type="number"
                          value={formData.discount_percentage}
                          onChange={(e) =>
                            set("discount_percentage", e.target.value)
                          }
                          className={inputCls}
                          placeholder="40"
                        />
                      </div>
                    </div>

                    {/* Duration + Rating */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          المدة *
                        </label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => set("duration", e.target.value)}
                          className={inputCls}
                          placeholder="مثال: 2 ساعات"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          التقييم (0-5)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={formData.rating}
                          onChange={(e) => set("rating", e.target.value)}
                          className={inputCls}
                          placeholder="4.7"
                        />
                      </div>
                    </div>

                    {/* Available */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="available"
                        checked={formData.available}
                        onChange={(e) => set("available", e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="available"
                        className="text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        الخدمة متاحة للحجز
                      </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-slate-200">
                      <button
                        onClick={handleSubmit}
                        disabled={
                          addServiceMutation.isPending ||
                          updateServiceMutation.isPending
                        }
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-5 h-5" />
                        {addServiceMutation.isPending ||
                        updateServiceMutation.isPending
                          ? "جاري الحفظ..."
                          : editingService
                            ? "تحديث الخدمة"
                            : "إضافة الخدمة"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 border-2 border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        إلغاء
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 mt-4 font-semibold">جاري التحميل...</p>
          </div>
        ) : services.length === 0 ? (
          <Card className="bg-white shadow-lg border-2 border-slate-100">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-xl text-slate-600 mb-2">
                لا توجد خدمات حالياً
              </p>
              <p className="text-slate-500">
                انقر على &quot;إضافة خدمة جديدة&quot; لإضافة أول خدمة
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white hover:shadow-xl transition-all border-2 border-slate-100">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2 flex-wrap">
                          <h3 className="text-2xl font-bold text-slate-900">
                            {service.name_en} | {service.name_ar}
                          </h3>
                          {service.available && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              متاحة
                            </span>
                          )}
                          {/* ── Wilaya badge ── */}
                          {service.wilaya ? (
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {service.wilaya}
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                              ⚠ بدون ولاية
                            </span>
                          )}
                        </div>
                        <p className="text-indigo-600 font-semibold mb-2 text-sm">
                          {service.category}
                        </p>
                        <p className="text-slate-600 mb-3 leading-relaxed">
                          {service.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-slate-600">
                            <strong className="text-slate-800">
                              مزود الخدمة:
                            </strong>{" "}
                            {service.provider}
                          </span>
                          <span className="text-green-600 font-bold">
                            {service.price_after?.toLocaleString()} DZD
                          </span>
                          <span className="text-slate-400 line-through">
                            {service.price_before?.toLocaleString()} DZD
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 font-bold rounded">
                            خصم {service.discount_percentage}%
                          </span>
                          <span className="text-slate-600">
                            المدة: {service.duration}
                          </span>
                          <span className="text-amber-600 font-semibold">
                            ⭐ {service.rating}/5
                          </span>
                          <span className="text-slate-600">
                            {service.bookings_count} حجز
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                          title="تعديل"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          disabled={deleteServiceMutation.isPending}
                          className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
