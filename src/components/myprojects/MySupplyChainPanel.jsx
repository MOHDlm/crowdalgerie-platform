// ────────────────────────────────────────────────────────────────────────────
// MySupplyChainPanel.jsx
// ملف مستقل — أضفه في src/components/myprojects/MySupplyChainPanel.jsx
// ────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/firebase-config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { Trash2, Plus, Save, CheckCircle } from "lucide-react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

// ── 58 Wilayas ───────────────────────────────────────────────────────────────
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

const NODE_TYPES = [
  { value: "مورد", label: "🏭 مورد مواد", color: "#FF8800" },
  { value: "مستودع", label: "🏪 مستودع", color: "#00CCFF" },
  { value: "توزيع", label: "🚚 مركز توزيع", color: "#00FF88" },
  { value: "تصنيع", label: "⚙️ مصنع/إنتاج", color: "#AA44FF" },
  { value: "تصدير", label: "✈️ تصدير", color: "#FF4444" },
  { value: "عميل", label: "🛒 عميل رئيسي", color: "#FFCC00" },
];

// ── Wilaya → Coords ───────────────────────────────────────────────────────────
const WILAYA_COORDS = {
  أدرار: [27.874, -0.294],
  الشلف: [36.165, 1.33],
  الأغواط: [33.8, 2.885],
  "أم البواقي": [35.875, 7.113],
  باتنة: [35.555, 6.174],
  بجاية: [36.75, 5.084],
  بسكرة: [34.85, 5.728],
  بشار: [31.617, -2.217],
  البليدة: [36.47, 2.83],
  البويرة: [36.37, 3.9],
  تمنراست: [22.785, 5.523],
  تبسة: [35.4, 8.12],
  تلمسان: [34.878, -1.315],
  تيارت: [35.371, 1.322],
  "تيزي وزو": [36.717, 4.046],
  الجزائر: [36.737, 3.086],
  الجلفة: [34.67, 3.263],
  جيجل: [36.82, 5.764],
  سطيف: [36.19, 5.408],
  سعيدة: [34.84, 0.153],
  سكيكدة: [36.876, 6.906],
  "سيدي بلعباس": [35.19, -0.63],
  عنابة: [36.897, 7.766],
  قالمة: [36.462, 7.433],
  قسنطينة: [36.365, 6.614],
  المدية: [36.27, 2.75],
  مستغانم: [35.93, 0.09],
  المسيلة: [35.706, 4.543],
  معسكر: [35.395, 0.141],
  ورقلة: [31.949, 5.324],
  وهران: [35.697, -0.634],
  البيض: [33.687, 1.003],
  إليزي: [26.48, 8.48],
  "برج بوعريريج": [36.073, 4.763],
  بومرداس: [36.76, 3.477],
  الطارف: [36.767, 8.313],
  تندوف: [27.673, -8.144],
  تيسمسيلت: [35.607, 1.814],
  الوادي: [33.37, 6.863],
  خنشلة: [35.436, 7.143],
  "سوق أهراس": [36.285, 7.952],
  تيبازة: [36.61, 2.47],
  ميلة: [36.45, 6.263],
  "عين الدفلى": [36.26, 1.966],
  النعامة: [33.267, -0.306],
  "عين تموشنت": [35.297, -1.144],
  غرداية: [32.49, 3.673],
  غليزان: [35.723, 0.577],
  تيميمون: [29.263, 0.241],
  "برج باجي مختار": [21.35, 0.95],
  "أولاد جلال": [34.417, 5.063],
  "بني عباس": [30.128, -2.832],
  "عين صالح": [27.2, 2.47],
  "عين قزام": [19.57, 5.77],
  توقرت: [33.1, 6.067],
  جانت: [24.565, 9.48],
  المغير: [33.95, 5.92],
  المنيعة: [29.783, 2.883],
};

// ── Mini Map ──────────────────────────────────────────────────────────────────
function MiniMap({ nodes }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);

  useEffect(() => {
    const validNodes = (nodes || [])
      .map((n) => ({ ...n, coords: WILAYA_COORDS[n.wilaya] }))
      .filter((n) => n.coords);

    if (!document.getElementById("leaflet-css")) {
      const lk = document.createElement("link");
      lk.id = "leaflet-css";
      lk.rel = "stylesheet";
      lk.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(lk);
    }

    const init = () => {
      const L = window.L;
      if (!mapRef.current) return;
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }

      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      });
      leafletRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd" },
      ).addTo(map);

      if (validNodes.length === 0) {
        map.setView([28, 2.5], 4);
        return;
      }

      // Lines between consecutive nodes
      for (let i = 0; i < validNodes.length - 1; i++) {
        L.polyline(
          [
            [validNodes[i].coords[0], validNodes[i].coords[1]],
            [validNodes[i + 1].coords[0], validNodes[i + 1].coords[1]],
          ],
          { color: "#00CCFF", weight: 2, opacity: 0.7, dashArray: "6 8" },
        ).addTo(map);
      }

      // Markers
      validNodes.forEach((n, idx) => {
        const nodeType = NODE_TYPES.find((t) => t.value === n.type);
        const color = nodeType?.color || "#00CCFF";
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;background:${color};border-radius:50%;
            box-shadow:0 0 8px ${color},0 0 16px ${color}60;
            animation:sc-pulse 2s ease-out infinite;animation-delay:${idx * 0.3}s"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        L.marker([n.coords[0], n.coords[1]], { icon })
          .bindTooltip(`<b>${n.name}</b><br/>${n.type} • ${n.wilaya}`, {
            className: "sc-tip",
            opacity: 1,
          })
          .addTo(map);
      });

      const lats = validNodes.map((n) => n.coords[0]);
      const lons = validNodes.map((n) => n.coords[1]);
      if (validNodes.length === 1) map.setView([lats[0], lons[0]], 7);
      else
        map.fitBounds([
          [Math.min(...lats) - 1, Math.min(...lons) - 1],
          [Math.max(...lats) + 1, Math.max(...lons) + 1],
        ]);
    };

    if (window.L) init();
    else {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = init;
      document.head.appendChild(s);
    }
    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, [nodes]);

  return (
    <>
      <style>{`
        @keyframes sc-pulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(3);opacity:0}}
        .sc-tip{font-family:monospace;font-size:11px;background:rgba(2,9,18,.95)!important;
          border:1px solid #00CCFF40!important;color:#00CCFF!important;padding:4px 8px!important;}
        .leaflet-tile{filter:hue-rotate(75deg) saturate(.2) brightness(.85)}
        .leaflet-control-zoom a{background:#060f08!important;color:#00FF88!important;border:1px solid #1a3a2a!important}
        .leaflet-bar{border:1px solid #1a3a2a!important;box-shadow:none!important}
      `}</style>
      <div
        ref={mapRef}
        style={{
          height: 240,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      />
    </>
  );
}

MiniMap.propTypes = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      wilaya: PropTypes.string,
      notes: PropTypes.string,
    }),
  ),
};

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function MySupplyChainPanel() {
  const [currentUser, setCurrentUser] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "projects"),
      where("created_by_uid", "==", currentUser.uid),
    );
    getDocs(q).then((snap) =>
      setMyProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, [currentUser]);

  useEffect(() => {
    if (!selectedProject) {
      setNodes([]);
      return;
    }
    setNodes(selectedProject.supply_chain || []);
  }, [selectedProject]);

  const addNode = () =>
    setNodes((p) => [...p, { name: "", type: "مورد", wilaya: "", notes: "" }]);
  const removeNode = (idx) => setNodes((p) => p.filter((_, i) => i !== idx));
  const updateNode = (idx, field, value) =>
    setNodes((p) => {
      const u = [...p];
      u[idx] = { ...u[idx], [field]: value };
      return u;
    });

  const handleSave = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "projects", selectedProject.id), {
        supply_chain: nodes,
      });
      setMyProjects((p) =>
        p.map((pr) =>
          pr.id === selectedProject.id ? { ...pr, supply_chain: nodes } : pr,
        ),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (!currentUser)
    return (
      <p className="text-center text-slate-500 py-6">يجب تسجيل الدخول أولاً</p>
    );

  return (
    <div className="space-y-5">
      {/* Project selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          اختر مشروعك
        </label>
        <select
          value={selectedProject?.id || ""}
          onChange={(e) =>
            setSelectedProject(
              myProjects.find((p) => p.id === e.target.value) || null,
            )
          }
          className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          dir="rtl"
        >
          <option value="">-- اختر مشروعاً --</option>
          {myProjects.map((p) => (
            <option
              key={p.id}
              value={p.id}
            >
              {p.name_ar || p.name || p.id}
            </option>
          ))}
        </select>
        {myProjects.length === 0 && (
          <p className="text-xs text-slate-400 mt-1">
            لا توجد مشاريع — أضف مشروعاً من صفحة مشاريعي أولاً
          </p>
        )}
      </div>

      {selectedProject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 text-sm">
                🔗 نقاط سلسلة التوريد
              </h4>
              <span className="text-xs text-slate-400">
                {nodes.length} نقطة
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
              <AnimatePresence>
                {nodes.map((node, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-blue-600">
                        نقطة {idx + 1}
                      </span>
                      <button
                        onClick={() => removeNode(idx)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-500 block mb-0.5">
                          الاسم
                        </label>
                        <input
                          value={node.name}
                          onChange={(e) =>
                            updateNode(idx, "name", e.target.value)
                          }
                          placeholder="مثال: مستودع وهران"
                          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-0.5">
                          النوع
                        </label>
                        <select
                          value={node.type}
                          onChange={(e) =>
                            updateNode(idx, "type", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          {NODE_TYPES.map((t) => (
                            <option
                              key={t.value}
                              value={t.value}
                            >
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-0.5">
                          الولاية
                        </label>
                        <select
                          value={node.wilaya}
                          onChange={(e) =>
                            updateNode(idx, "wilaya", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                          dir="rtl"
                        >
                          <option value="">-- اختر --</option>
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
                      <div>
                        <label className="text-xs text-slate-500 block mb-0.5">
                          ملاحظات
                        </label>
                        <input
                          value={node.notes || ""}
                          onChange={(e) =>
                            updateNode(idx, "notes", e.target.value)
                          }
                          placeholder="اختياري"
                          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-2">
              <button
                onClick={addNode}
                className="flex-1 py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 text-xs font-semibold hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={13} /> إضافة نقطة
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {saving ? (
                  "⟳"
                ) : saved ? (
                  <>
                    <CheckCircle size={12} /> تم!
                  </>
                ) : (
                  <>
                    <Save size={12} /> حفظ
                  </>
                )}
              </button>
            </div>

            {saved && (
              <p className="text-xs text-green-600 mt-2 text-center">
                ✓ ستظهر على خريطة Badge تلقائياً
              </p>
            )}
          </div>

          {/* Map preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 text-sm">
                🗺️ معاينة الشبكة
              </h4>
              {nodes.filter((n) => WILAYA_COORDS[n.wilaya]).length > 0 && (
                <span className="text-xs text-green-600 font-semibold">
                  ● {nodes.filter((n) => WILAYA_COORDS[n.wilaya]).length} نقطة
                </span>
              )}
            </div>
            <MiniMap nodes={nodes} />
          </div>
        </div>
      )}
    </div>
  );
}
