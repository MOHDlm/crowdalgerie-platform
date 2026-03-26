import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const sectors = [
  { value: "technology", label: "تقنية" },
  { value: "agriculture", label: "زراعة" },
  { value: "services", label: "خدمات" },
  { value: "industry", label: "صناعة" },
  { value: "commerce", label: "تجارة" },
  { value: "tourism", label: "سياحة" },
  { value: "education", label: "تعليم" },
];

const riskLevels = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
];

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

// ── أنواع نقاط سلسلة التوريد ──────────────────────────────────────────────
const SUPPLY_NODE_TYPES = [
  { value: "مورد", label: "🏭 مورد مواد" },
  { value: "مستودع", label: "🏪 مستودع" },
  { value: "توزيع", label: "🚚 مركز توزيع" },
  { value: "تصنيع", label: "⚙️ مصنع/إنتاج" },
  { value: "تصدير", label: "✈️ نقطة تصدير" },
  { value: "عميل", label: "🛒 عميل رئيسي" },
];

export default function ProjectForm({
  project,
  onSubmit,
  onCancel,
  isLoading,
}) {
  const [formData, setFormData] = useState(
    project || {
      name_ar: "",
      description_ar: "",
      company_name: "",
      sector: "technology",
      wilaya: "", // ← حقل الولاية الجديد
      funding_goal: "",
      deadline: "",
      return_percentage: "",
      project_duration: "",
      risk_level: "medium",
      image_url: "",
      financial_score: "",
      feasibility_score: "",
      team_score: "",
      innovation_score: "",
      supply_chain: [], // ← سلسلة التوريد
    },
  );

  // ── إدارة نقاط سلسلة التوريد ─────────────────────────────────────────────
  const addSupplyNode = () => {
    setFormData((prev) => ({
      ...prev,
      supply_chain: [
        ...prev.supply_chain,
        { name: "", type: "مورد", wilaya: "", status: "active", notes: "" },
      ],
    }));
  };

  const updateSupplyNode = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.supply_chain];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, supply_chain: updated };
    });
  };

  const removeSupplyNode = (idx) => {
    setFormData((prev) => ({
      ...prev,
      supply_chain: prev.supply_chain.filter((_, i) => i !== idx),
    }));
  };

  const totalScore = useMemo(() => {
    const financial = parseFloat(formData.financial_score) || 0;
    const feasibility = parseFloat(formData.feasibility_score) || 0;
    const team = parseFloat(formData.team_score) || 0;
    const innovation = parseFloat(formData.innovation_score) || 0;
    return financial + feasibility + team + innovation;
  }, [
    formData.financial_score,
    formData.feasibility_score,
    formData.team_score,
    formData.innovation_score,
  ]);

  const qualityBadge = totalScore >= 85;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      funding_goal: parseFloat(formData.funding_goal),
      return_percentage: parseFloat(formData.return_percentage),
      project_duration: parseInt(formData.project_duration),
      financial_score: parseFloat(formData.financial_score) || 0,
      feasibility_score: parseFloat(formData.feasibility_score) || 0,
      team_score: parseFloat(formData.team_score) || 0,
      innovation_score: parseFloat(formData.innovation_score) || 0,
      total_score: totalScore,
      quality_badge: qualityBadge,
      supply_chain: formData.supply_chain || [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900">
            {project ? "تعديل المشروع" : "مشروع جديد"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* القسم الأول: بيانات المشروع الأساسية */}
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                📋 بيانات المشروع
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* اسم المشروع */}
                <div className="space-y-2">
                  <Label>اسم المشروع *</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => handleChange("name_ar", e.target.value)}
                    required
                    placeholder="أدخل اسم المشروع"
                  />
                </div>

                {/* اسم المؤسسة */}
                <div className="space-y-2">
                  <Label>اسم المؤسسة *</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) =>
                      handleChange("company_name", e.target.value)
                    }
                    required
                    placeholder="أدخل اسم المؤسسة"
                  />
                </div>

                {/* القطاع */}
                <div className="space-y-2">
                  <Label>القطاع *</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(value) => handleChange("sector", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem
                          key={sector.value}
                          value={sector.value}
                        >
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ── الولاية (حقل جديد) ── */}
                <div className="space-y-2">
                  <Label>الولاية *</Label>
                  <Select
                    value={formData.wilaya}
                    onValueChange={(value) => handleChange("wilaya", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الولاية" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {WILAYAS.map((w) => (
                        <SelectItem
                          key={w}
                          value={w}
                        >
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* المبلغ المطلوب */}
                <div className="space-y-2">
                  <Label>المبلغ المطلوب (دج) *</Label>
                  <Input
                    type="number"
                    value={formData.funding_goal}
                    onChange={(e) =>
                      handleChange("funding_goal", e.target.value)
                    }
                    required
                    placeholder="500000"
                  />
                </div>

                {/* نسبة العائد */}
                <div className="space-y-2">
                  <Label>نسبة العائد المتوقعة (%) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.return_percentage}
                    onChange={(e) =>
                      handleChange("return_percentage", e.target.value)
                    }
                    required
                    placeholder="15"
                  />
                </div>

                {/* مدة المشروع */}
                <div className="space-y-2">
                  <Label>مدة المشروع (أشهر) *</Label>
                  <Input
                    type="number"
                    value={formData.project_duration}
                    onChange={(e) =>
                      handleChange("project_duration", e.target.value)
                    }
                    required
                    placeholder="12"
                  />
                </div>

                {/* تاريخ انتهاء الحملة */}
                <div className="space-y-2">
                  <Label>تاريخ انتهاء الحملة *</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    required
                  />
                </div>

                {/* مستوى المخاطر */}
                <div className="space-y-2">
                  <Label>مستوى المخاطر</Label>
                  <Select
                    value={formData.risk_level}
                    onValueChange={(value) => handleChange("risk_level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {riskLevels.map((level) => (
                        <SelectItem
                          key={level.value}
                          value={level.value}
                        >
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* وصف المشروع */}
              <div className="space-y-2 mt-6">
                <Label>وصف المشروع *</Label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) =>
                    handleChange("description_ar", e.target.value)
                  }
                  required
                  placeholder="قدم وصفاً تفصيلياً للمشروع، أهدافه، وفوائده..."
                  className="min-h-32"
                />
              </div>

              {/* رابط الصورة */}
              <div className="space-y-2 mt-6">
                <Label>رابط الصورة (اختياري)</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* القسم الثاني: معايير التقييم */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                ⭐ معايير التقييم (من 0-25)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>التقييم المالي (0-25) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="25"
                    value={formData.financial_score}
                    onChange={(e) =>
                      handleChange("financial_score", e.target.value)
                    }
                    placeholder="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>دراسة الجدوى (0-25) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="25"
                    value={formData.feasibility_score}
                    onChange={(e) =>
                      handleChange("feasibility_score", e.target.value)
                    }
                    placeholder="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفريق (0-25) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="25"
                    value={formData.team_score}
                    onChange={(e) => handleChange("team_score", e.target.value)}
                    placeholder="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الابتكار (0-25) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="25"
                    value={formData.innovation_score}
                    onChange={(e) =>
                      handleChange("innovation_score", e.target.value)
                    }
                    placeholder="20"
                  />
                </div>
              </div>

              {/* النقاط الكلية */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-900">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">النقاط الكلية</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {totalScore}/100
                    </p>
                  </div>
                  <div>
                    {qualityBadge ? (
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">
                          ✅ وسم الجودة
                        </p>
                        <p className="text-sm text-gray-600">
                          مؤهل للحصول على الامتيازات
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          ينقص {85 - totalScore} نقطة
                        </p>
                        <p className="text-xs text-gray-500">
                          للحصول على وسم الجودة
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── قسم سلسلة التوريد ── */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                🔗 سلسلة التوريد
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                أضف نقاط سلسلة التوريد الخاصة بمشروعك — ستظهر تلقائياً على
                الخريطة التفاعلية مربوطة بخطوط شبكة.
              </p>

              {/* نقاط موجودة */}
              <div className="space-y-3 mb-4">
                {(formData.supply_chain || []).map((node, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-700">
                        نقطة {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSupplyNode(idx)}
                        className="text-red-400 hover:text-red-600 text-xs font-bold"
                      >
                        ✕ حذف
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">اسم النقطة *</Label>
                        <input
                          value={node.name}
                          onChange={(e) =>
                            updateSupplyNode(idx, "name", e.target.value)
                          }
                          placeholder="مثال: مستودع وهران"
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">النوع</Label>
                        <select
                          value={node.type}
                          onChange={(e) =>
                            updateSupplyNode(idx, "type", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          {SUPPLY_NODE_TYPES.map((t) => (
                            <option
                              key={t.value}
                              value={t.value}
                            >
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">الولاية *</Label>
                        <select
                          value={node.wilaya}
                          onChange={(e) =>
                            updateSupplyNode(idx, "wilaya", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                          required
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
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">ملاحظات</Label>
                        <input
                          value={node.notes}
                          onChange={(e) =>
                            updateSupplyNode(idx, "notes", e.target.value)
                          }
                          placeholder="اختياري"
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* زر إضافة نقطة */}
              <button
                type="button"
                onClick={addSupplyNode}
                className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 font-semibold hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span>
                إضافة نقطة في سلسلة التوريد
              </button>

              {/* معاينة */}
              {(formData.supply_chain || []).length > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-bold text-green-700 mb-1">
                    ✓ {formData.supply_chain.length} نقطة — ستظهر على الخريطة
                    عند الحفظ
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.supply_chain.map((n, i) => (
                      <span
                        key={i}
                        className="text-xs bg-white border border-green-300 text-green-700 px-2 py-1 rounded-full"
                      >
                        {n.type} {n.wilaya ? `📍${n.wilaya}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-900 to-blue-700"
              >
                {isLoading
                  ? "جاري الحفظ..."
                  : project
                    ? "حفظ التعديلات"
                    : "إضافة المشروع"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

ProjectForm.propTypes = {
  project: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
