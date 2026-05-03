import { useQuery } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  doc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { auth } from "@/firebase-config";
import { useEffect, useRef, useState } from "react";
import {
  Award,
  Network,
  Building2,
  FileText,
  Vote,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X,
  FilePlus,
  Wrench,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import MySupplyChainPanel from "../components/myprojects/MySupplyChainPanel";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  legal: "#4488FF",
  accounting: "#00CC88",
  marketing: "#E0449A",
  hr: "#F59E0B",
};
const CAT_ICONS = { legal: "⚖️", accounting: "💼", marketing: "📢", hr: "👥" };

// ─── CHAT POPUP ───────────────────────────────────────────────────────────────
function ChatMiniPopup({ service, onClose }) {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([
    {
      from: "bot",
      text: `مرحباً! أنت الآن تتواصل معنا بخصوص خدمة "${
        service.name_en || service.name_ar || service.name
      }" من ${service.provider}. كيف يمكننا مساعدتك؟`,
      time: new Date().toLocaleTimeString("ar-DZ", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const bottomRef = useRef(null);
  const cc = CAT_COLORS[service.category] || "#4f46e5";

  const send = () => {
    if (!msg.trim()) return;
    const t = new Date().toLocaleTimeString("ar-DZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMsgs((p) => [...p, { from: "user", text: msg.trim(), time: t }]);
    setMsg("");
    setTimeout(() => {
      setMsgs((p) => [
        ...p,
        {
          from: "bot",
          text: "شكراً لرسالتك! سيتواصل معك فريقنا خلال 24 ساعة لإتمام الحجز.",
          time: new Date().toLocaleTimeString("ar-DZ", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1200);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  return (
    <div className="fixed bottom-20 right-6 z-[3000] w-80 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        style={{ background: `linear-gradient(135deg, ${cc}, ${cc}bb)` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-lg">
            {CAT_ICONS[service.category] || "🔧"}
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">
              {service.name_en || service.name_ar || service.name}
            </p>
            <p className="text-xs text-white/75">{service.provider}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      <div className="p-3 bg-slate-50 overflow-y-auto max-h-56 flex flex-col gap-2">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              m.from === "user" ? "items-start" : "items-end"
            }`}
          >
            <div
              className={`rounded-xl px-3 py-2 max-w-[90%] border ${
                m.from === "user"
                  ? "bg-white border-slate-200"
                  : "border-transparent"
              }`}
              style={
                m.from !== "user"
                  ? { background: `${cc}18`, borderColor: `${cc}40` }
                  : {}
              }
            >
              <p
                className="text-sm text-slate-700 leading-relaxed"
                dir="rtl"
              >
                {m.text}
              </p>
            </div>
            <span className="text-xs text-slate-400 mt-1">{m.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-3 border-t border-slate-200 bg-white">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="اكتب رسالتك..."
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
          dir="rtl"
        />
        <button
          onClick={send}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base flex-shrink-0"
          style={{ background: cc }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

ChatMiniPopup.propTypes = {
  service: PropTypes.shape({
    name_en: PropTypes.string,
    name_ar: PropTypes.string,
    name: PropTypes.string,
    provider: PropTypes.string,
    category: PropTypes.string,
    available: PropTypes.bool,
    price_before: PropTypes.number,
    price_after: PropTypes.number,
    discount_percentage: PropTypes.number,
    duration: PropTypes.string,
    rating: PropTypes.number,
    bookings_count: PropTypes.number,
    description: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

// ─── ALGERIA MAP ─────────────────────────────────────────────────────────────
function AlgeriaMap() {
  const mapRef = useRef(null),
    leafletRef = useRef(null),
    layersRef = useRef({}),
    unsubsRef = useRef([]),
    linesRef = useRef({}),
    pointsCache = useRef({});
  const [layers, setLayers] = useState([
    {
      id: "members",
      label: "المشاريع المعتمدة",
      icon: "🏆",
      color: "#FBBF24",
      active: true,
    },
    {
      id: "supply",
      label: "سلاسل التوريد",
      icon: "🔗",
      color: "#38BDF8",
      active: true,
    },
    {
      id: "services",
      label: "الخدمات المشتركة",
      icon: "🏢",
      color: "#A5B4FC",
      active: true,
    },
    {
      id: "contracts",
      label: "فرص المناولة",
      icon: "📋",
      color: "#FB923C",
      active: false,
    },
  ]);
  const [dbCounts, setDbCounts] = useState({});
  const [loadingLayers, setLoadingLayers] = useState(
    new Set(["members", "supply", "services", "contracts"]),
  );

  const CMAP = {
    members: "projects",
    supply: "projects",
    services: "shared_services",
    contracts: "contracts",
  };
  const WC = {
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
    Alger: [36.737, 3.086],
    Oran: [35.697, -0.634],
    Constantine: [36.365, 6.614],
    Annaba: [36.897, 7.766],
    Batna: [35.555, 6.174],
    Setif: [36.19, 5.408],
    Biskra: [34.85, 5.728],
    Bejaia: [36.75, 5.084],
    "Tizi Ouzou": [36.717, 4.046],
    Blida: [36.47, 2.83],
    Tlemcen: [34.878, -1.315],
    Ouargla: [31.949, 5.324],
    tech: [36.737, 3.086],
    agriculture: [34.85, 5.728],
    energy: [31.949, 5.324],
    industry: [36.365, 6.614],
    health: [36.897, 7.766],
    education: [36.717, 4.046],
    finance: [36.737, 3.086],
    transport: [35.697, -0.634],
  };

  const rc = (d) => {
    const la = d.location?.lat ?? d.lat ?? d.latitude ?? null;
    const lo = d.location?.lon ?? d.lon ?? d.lng ?? d.longitude ?? null;
    if (la && lo) return [Number(la), Number(lo)];
    const w = d.wilaya || d.city || d.region || d.governorate || "";
    if (w) {
      const c = WC[w];
      if (c) return c;
      const k = Object.keys(WC).find((k) => w.includes(k) || k.includes(w));
      if (k) return WC[k];
    }
    const cat = (d.category || d.sector || "").toLowerCase();
    const ck = Object.keys(WC).find((k) => cat.includes(k));
    if (ck) return WC[ck];
    return [36.737, 3.086];
  };

  const d2p = (id, docSnap) => {
    const d = docSnap.data();
    if (id === "supply") {
      const ch = d.supply_chain || [];
      if (!ch.length) return null;
      const n = ch[0];
      const [la, lo] = rc(n);
      return {
        name: n.name || d.name_ar || d.name || docSnap.id,
        lat: la,
        lon: lo,
        badge: false,
        category: n.type || "توريد",
        wilaya: n.wilaya || "",
        status: n.status || "active",
      };
    }
    const [la, lo] = rc(d);
    const nm =
      d.name ||
      d.name_en ||
      d.name_ar ||
      d.title ||
      d.project_name ||
      docSnap.id;
    if (id === "services") {
      const sn =
        d.name ||
        d.name_en ||
        d.name_ar ||
        d.title ||
        d.service_name ||
        docSnap.id;
      return {
        name: sn,
        lat: la,
        lon: lo,
        badge: d.available === true,
        category: d.category || "",
        wilaya: d.wilaya || d.city || d.region || "",
        status: d.available ? "متاح" : "غير متاح",
        value: d.price_after
          ? `${Number(d.price_after).toLocaleString()} دج`
          : "",
        company: d.provider || "",
        funding: d.discount_percentage ? `خصم ${d.discount_percentage}%` : "",
        score: d.rating ? `${d.rating}/5 ⭐` : null,
      };
    }
    return {
      name: nm,
      lat: la,
      lon: lo,
      badge: d.quality_badge === true,
      score: d.assessment_score ?? null,
      category: d.category || d.sector || d.type || d.service_type || "",
      wilaya: d.wilaya || d.city || d.region || "",
      status: d.status || "",
      value: d.funding_goal
        ? `هدف: ${Number(d.funding_goal).toLocaleString()} دج`
        : d.value || d.amount || "",
      company: d.company_name || "",
      funding: d.funding_current
        ? `${Number(d.funding_current).toLocaleString()} دج`
        : "",
    };
  };

  const d2ps = (id, docs) => {
    if (id !== "supply") return docs.map((d) => d2p(id, d)).filter(Boolean);
    const pts = [];
    docs.forEach((docSnap) => {
      const d = docSnap.data();
      (d.supply_chain || []).forEach((n, i) => {
        const c = rc(n);
        if (!c[0]) return;
        pts.push({
          name: n.name || `نقطة ${i + 1}`,
          lat: c[0],
          lon: c[1],
          badge: false,
          category: n.type || "توريد",
          wilaya: n.wilaya || "",
          status: n.status || "active",
          nodeType: n.type || "مورد",
        });
      });
    });
    return pts;
  };

  const FB = {
    members: [
      {
        name: "Pure Info",
        lat: 36.737,
        lon: 3.086,
        badge: true,
        category: "Tech",
        wilaya: "الجزائر",
      },
      {
        name: "AgriTech DZ",
        lat: 35.697,
        lon: -0.634,
        badge: false,
        category: "Agriculture",
        wilaya: "وهران",
      },
      {
        name: "Industrial Solutions",
        lat: 36.365,
        lon: 6.614,
        badge: false,
        category: "Industry",
        wilaya: "قسنطينة",
      },
      {
        name: "SolarSud",
        lat: 31.949,
        lon: 5.324,
        badge: true,
        category: "Energy",
        wilaya: "ورقلة",
      },
    ],
    supply: [
      { name: "مركز لوجستي — الجزائر", lat: 36.65, lon: 3.1 },
      { name: "مستودع — وهران", lat: 35.65, lon: -0.7 },
      { name: "منصة — قسنطينة", lat: 36.3, lon: 6.55 },
    ],
    services: [
      {
        name: "استشارات قانونية",
        lat: 36.737,
        lon: 3.086,
        company: "مكتب المحامي بن عمر",
        category: "legal",
        status: "متاح",
        value: "30,000 دج",
        funding: "خصم 40%",
        score: "4.7/5 ⭐",
      },
      {
        name: "خدمات محاسبية",
        lat: 35.697,
        lon: -0.634,
        company: "مكتب المحاسب",
        category: "accounting",
        status: "متاح",
        value: "15,000 دج",
        funding: "خصم 30%",
        score: "4.5/5 ⭐",
      },
    ],
    contracts: [
      {
        name: "مشروع طاقة شمسية — ورقلة",
        lat: 31.96,
        lon: 5.35,
        status: "active",
      },
    ],
  };

  const LC = {
    members: "#FBBF24",
    supply: "#38BDF8",
    services: "#A5B4FC",
    contracts: "#FB923C",
  };
  const LI = { members: "🏆", supply: "🔗", services: "🏢", contracts: "📋" };
  const NL = new Set(["supply", "contracts"]);
  const svgRef = useRef(null),
    meshARef = useRef(null),
    mfMesh = useRef([]),
    clRef = useRef(null);
  const ABD = new Set(["members", "supply", "services"]);

  const stopMesh = () => {
    if (meshARef.current) {
      cancelAnimationFrame(meshARef.current);
      meshARef.current = null;
    }
  };
  const removeMesh = () => {
    stopMesh();
    if (svgRef.current) {
      svgRef.current.innerHTML = "";
      svgRef.current.style.display = "none";
    }
  };

  const drawLines = (L, map, id, pts) => {
    if (linesRef.current[id]) {
      map.removeLayer(linesRef.current[id]);
      delete linesRef.current[id];
    }
    if (pts.length < 2) return;
    const color = LC[id];
    const lg = L.layerGroup();
    pts.forEach((pt, i) => {
      const oth = pts
        .map((p, j) => ({
          p,
          j,
          dist: Math.sqrt(
            Math.pow(pt.lat - p.lat, 2) + Math.pow(pt.lon - p.lon, 2),
          ),
        }))
        .filter((x) => x.j !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2);
      oth.forEach(({ p }) => {
        L.polyline(
          [
            [pt.lat, pt.lon],
            [p.lat, p.lon],
          ],
          {
            color,
            weight: 1.5,
            opacity: 0.45,
            dashArray: "6 8",
            dashOffset: "0",
          },
        ).addTo(lg);
      });
    });
    linesRef.current[id] = lg;
    if (layersRef.current[id] && map.hasLayer(layersRef.current[id]))
      lg.addTo(map);
    let off = 0;
    const anim = () => {
      off = (off + 0.3) % 14;
      lg.eachLayer((l) => {
        if (l.setStyle) l.setStyle({ dashOffset: String(-off) });
      });
      if (linesRef.current[id]) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  };

  const buildGroup = (L, id, pts) => {
    const color = LC[id],
      ie = LI[id];
    const g = L.layerGroup();
    pts.forEach((pt) => {
      const sz = pt.badge ? 14 : 10;
      const icon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:${sz}px;height:${sz}px"><div style="width:${sz}px;height:${sz}px;background:${color};border-radius:50%;box-shadow:0 0 ${pt.badge ? 10 : 6}px ${color};"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${sz * 2.8}px;height:${sz * 2.8}px;border:1.5px solid ${color}70;border-radius:50%;animation:wm-ping-lyr 2s ease-out infinite;"></div></div>`,
        iconSize: [sz, sz],
        iconAnchor: [sz / 2, sz / 2],
      });
      const lines = [
        pt.company
          ? `<span style="opacity:.8;color:${color}">🏢 ${pt.company}</span>`
          : "",
        pt.category ? `<span style="opacity:.65">⚙ ${pt.category}</span>` : "",
        pt.wilaya ? `<span style="opacity:.6">📍 ${pt.wilaya}</span>` : "",
        pt.status ? `<span style="color:#94A3B8">◉ ${pt.status}</span>` : "",
        pt.funding ? `<span style="color:#34D399">💵 ${pt.funding}</span>` : "",
        pt.value ? `<span style="color:#FB923C">${pt.value}</span>` : "",
        pt.score ? `<span style="color:#FBBF24">⭐ ${pt.score}</span>` : "",
        pt.badge
          ? `<span style="color:#FBBF24;font-weight:bold">🏆 CERTIFIED</span>`
          : "",
      ]
        .filter(Boolean)
        .join("<br/>");
      const tt = `<div style="font-family:system-ui,sans-serif;font-size:11px;color:${color};background:rgba(15,23,42,0.97);border:1px solid ${color}40;padding:8px 12px;border-radius:8px;min-width:140px;line-height:1.7;box-shadow:0 4px 16px rgba(0,0,0,.5);"><div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;font-weight:600;border-bottom:1px solid ${color}30;padding-bottom:4px;"><span>${ie}</span><span>${pt.name}</span></div>${lines}</div>`;
      L.marker([pt.lat, pt.lon], { icon })
        .bindTooltip(tt, {
          permanent: false,
          direction: "right",
          className: "wm-tt",
          opacity: 1,
        })
        .addTo(g);
    });
    return g;
  };

  const drawCL = (_L, map) => {
    removeMesh();
    if (!svgRef.current || !map || !mapRef.current) return;
    let mbs = mfMesh.current;
    if (!mbs?.length) mbs = pointsCache.current["members"] || [];
    if (!mbs?.length)
      mbs = [
        { lat: 36.737, lon: 3.086 },
        { lat: 35.697, lon: -0.634 },
        { lat: 36.365, lon: 6.614 },
      ];
    const vld = mbs.filter(
      (m) =>
        m &&
        typeof m.lat === "number" &&
        typeof m.lon === "number" &&
        m.lat > 14 &&
        m.lat < 40 &&
        m.lon > -9 &&
        m.lon < 12,
    );
    if (vld.length < 2) return;
    const svg = svgRef.current;
    svg.style.display = "block";
    const rd = () => {
      if (!svg || !map || !mapRef.current) return;
      const sz = map.getSize();
      svg.setAttribute("width", sz.x);
      svg.setAttribute("height", sz.y);
      svg.innerHTML = "";
      vld.forEach((a, i) => {
        vld.forEach((b, j) => {
          if (j <= i) return;
          try {
            const pa = map.latLngToContainerPoint([a.lat, a.lon]);
            const pb = map.latLngToContainerPoint([b.lat, b.lon]);
            const ln = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "line",
            );
            ln.setAttribute("x1", pa.x);
            ln.setAttribute("y1", pa.y);
            ln.setAttribute("x2", pb.x);
            ln.setAttribute("y2", pb.y);
            ln.setAttribute("stroke", "#FB923C");
            ln.setAttribute("stroke-width", "1.5");
            ln.setAttribute("stroke-opacity", "0.6");
            ln.setAttribute("stroke-dasharray", "7 5");
            ln.setAttribute("stroke-dashoffset", "0");
            svg.appendChild(ln);
          } catch {
            /*ignore*/
          }
        });
      });
    };
    rd();
    map.on("move zoom moveend zoomend", rd);
    let off = 0;
    const anim = () => {
      if (!svgRef.current || svgRef.current.style.display === "none") return;
      off = (off + 0.4) % 12;
      svg
        .querySelectorAll("line")
        .forEach((l) => l.setAttribute("stroke-dashoffset", String(-off)));
      meshARef.current = requestAnimationFrame(anim);
    };
    meshARef.current = requestAnimationFrame(anim);
    clRef.current = {
      cleanup: () => {
        map.off("move zoom moveend zoomend", rd);
      },
    };
  };

  const rl = (L, map, id, pts) => {
    const was =
      (layersRef.current[id] && map.hasLayer(layersRef.current[id])) ||
      (!layersRef.current[id] && ABD.has(id));
    if (layersRef.current[id]) {
      try {
        map.removeLayer(layersRef.current[id]);
      } catch {
        /*ignore*/
      }
    }
    const g = id === "contracts" ? L.layerGroup() : buildGroup(L, id, pts);
    layersRef.current[id] = g;
    pointsCache.current[id] = pts;
    if (was) g.addTo(map);
    if (NL.has(id) && id !== "contracts") drawLines(L, map, id, pts);
    if (id === "members") {
      mfMesh.current = pts.filter(
        (m) =>
          m &&
          typeof m.lat === "number" &&
          typeof m.lon === "number" &&
          m.lat > 14 &&
          m.lat < 40 &&
          m.lon > -9 &&
          m.lon < 12,
      );
    }
    if (id === "members" && window.L && clRef.current) drawCL(window.L, map);
  };

  const subL = (L, map, id) => {
    const u = onSnapshot(
      collection(db, CMAP[id]),
      (snap) => {
        const pts = d2ps(id, snap.docs);
        const fin = pts.length > 0 ? pts : FB[id] || [];
        setDbCounts((p) => ({ ...p, [id]: snap.docs.length }));
        setLoadingLayers((p) => {
          const s = new Set(p);
          s.delete(id);
          return s;
        });
        rl(L, map, id, fin);
      },
      () => {
        setDbCounts((p) => ({ ...p, [id]: 0 }));
        setLoadingLayers((p) => {
          const s = new Set(p);
          s.delete(id);
          return s;
        });
        rl(L, map, id, FB[id] || []);
      },
    );
    unsubsRef.current.push(u);
  };

  useEffect(() => {
    if (leafletRef.current) return;
    if (!document.getElementById("leaflet-css")) {
      const lk = document.createElement("link");
      lk.id = "leaflet-css";
      lk.rel = "stylesheet";
      lk.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(lk);
    }
    const sc = document.createElement("script");
    sc.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    sc.onload = () => {
      const L = window.L;
      if (!mapRef.current || leafletRef.current) return;
      const map = L.map(mapRef.current, {
        center: [36.2, 3.5],
        zoom: 6,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
        worldCopyJump: false,
      });
      leafletRef.current = map;
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 18, noWrap: true },
      ).addTo(map);
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution("© CARTO © OSM")
        .addTo(map);
      fetch(
        "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
      )
        .then((r) => r.json())
        .then((data) => {
          const dza = {
            type: "FeatureCollection",
            features: data.features.filter(
              (f) =>
                f.properties.ISO_A3 === "DZA" ||
                f.properties.ADMIN === "Algeria",
            ),
          };
          L.geoJSON(dza, {
            style: {
              color: "#34D399",
              weight: 1.5,
              opacity: 0.7,
              fillColor: "#34D399",
              fillOpacity: 0.04,
            },
          }).addTo(map);
        })
        .catch(() => {});
      ["members", "supply", "services", "contracts"].forEach((id) =>
        subL(L, map, id),
      );
      setTimeout(() => {
        ["members", "supply", "services"].forEach((id) => {
          if (layersRef.current[id] && !map.hasLayer(layersRef.current[id]))
            layersRef.current[id].addTo(map);
        });
      }, 2000);
    };
    document.head.appendChild(sc);
    return () => {
      unsubsRef.current.forEach((u) => u());
      unsubsRef.current = [];
      stopMesh();
      if (clRef.current?.cleanup) clRef.current.cleanup();
      clRef.current = null;
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLayer = (id) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = !l.active;
        const map = leafletRef.current;
        const grp = layersRef.current[id];
        if (map && grp) next ? grp.addTo(map) : map.removeLayer(grp);
        const lines = linesRef.current[id];
        if (map && lines) next ? lines.addTo(map) : map.removeLayer(lines);
        if (id === "contracts" && map && window.L) {
          if (next) drawCL(window.L, map);
          else {
            if (clRef.current?.cleanup) clRef.current.cleanup();
            removeMesh();
            clRef.current = null;
          }
        }
        return { ...l, active: next };
      }),
    );
  };

  const totalDocs = Object.values(dbCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <style>{`
        @keyframes wm-ping-lyr { 0%{transform:translate(-50%,-50%) scale(1);opacity:.9} 100%{transform:translate(-50%,-50%) scale(3.5);opacity:0} }
        .leaflet-control-zoom a { background:#1e293b !important; color:#94a3b8 !important; border:1px solid #334155 !important; }
        .leaflet-control-zoom a:hover { background:#334155 !important; }
        .leaflet-bar { border:1px solid #334155 !important; box-shadow:none !important; }
        .leaflet-control-attribution { background:rgba(15,23,42,.85) !important; color:#475569 !important; font-size:10px !important; }
        .leaflet-control-attribution a { color:#64748b !important; }
        .wm-tt { background:transparent !important; border:none !important; box-shadow:none !important; padding:0 !important; }
        .wm-tt::before { display:none !important; }
      `}</style>
      <div className="relative w-full h-full">
        <div
          ref={mapRef}
          className="absolute inset-0"
        />
        <svg
          ref={svgRef}
          className="absolute inset-0 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "none" }}
        />

        {/* Layer toggles */}
        <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-1.5 max-w-xs">
          {layers.map((layer) => {
            const isLoad = loadingLayers.has(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-sm ${
                  layer.active
                    ? "bg-slate-800/95 border border-slate-600/60 text-slate-200"
                    : "bg-slate-900/80 border border-slate-700/40 text-slate-500 hover:text-slate-400"
                }`}
              >
                {isLoad ? (
                  <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: layer.active ? layer.color : "#475569",
                      boxShadow: layer.active
                        ? `0 0 4px ${layer.color}`
                        : "none",
                    }}
                  />
                )}
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live badge */}
        <div className="absolute top-3 right-12 z-[1000] flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm border border-slate-700/60 px-3 py-1.5 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            ALGERIA LIVE
          </span>
          {totalDocs > 0 && (
            <span className="text-xs text-emerald-400">{totalDocs}</span>
          )}
        </div>
      </div>
    </>
  );
}

// ─── MODULE: SUPPLY CHAINS ────────────────────────────────────────────────────
function ModuleSupplyChain({ setShowMyChain }) {
  const [expandedId, setExpandedId] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["supply-chain-projects"],
    queryFn: async () => {
      const s = await getDocs(collection(db, "projects"));
      return s.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    staleTime: 30000,
  });

  const supplyProjects = projects.filter((p) => p.supply_chain?.length > 0);

  const NODE_COLORS = {
    مورد: "#38BDF8",
    مستودع: "#FBBF24",
    توزيع: "#34D399",
    تصنيع: "#FB923C",
    تصدير: "#F472B6",
    عميل: "#A78BFA",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Shared Supply Chains
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          سلاسل التوريد المشتركة ·{" "}
          <span className="text-sky-400">{supplyProjects.length}</span> مشاريع نشطة
        </p>
      </div>

      {/* Live map — tall, fills most of viewport */}
      <div
        className="rounded-xl overflow-hidden border border-slate-800 mb-6"
        style={{ height: "42vh" }}
      >
        <AlgeriaMap />
      </div>

      {/* Supply chain projects */}
      <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
        مشاريع سلاسل التوريد
      </h3>
      <div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-slate-700 border-t-sky-400 rounded-full animate-spin" />
        </div>
      ) : supplyProjects.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-10">
          لا توجد سلاسل توريد بعد
        </p>
      ) : (
        <div className="space-y-3">
          {supplyProjects.map((p) => {
            const chain = p.supply_chain || [];
            const isExp = expandedId === p.id;
            return (
              <div
                key={p.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExp ? null : p.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                  <span
                    className="flex-1 text-sm text-slate-200 font-medium"
                    dir="rtl"
                  >
                    {p.name_ar || p.name || p.id}
                  </span>
                  {p.wilaya && (
                    <span className="text-xs text-slate-600 hidden sm:block">
                      📍 {p.wilaya}
                    </span>
                  )}
                  <span className="text-xs text-sky-400/70 bg-sky-400/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    {chain.length} نقطة
                  </span>
                  {isExp ? (
                    <ChevronUp
                      size={14}
                      className="text-slate-500 flex-shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={14}
                      className="text-slate-500 flex-shrink-0"
                    />
                  )}
                </button>

                {isExp && (
                  <div className="px-4 pb-4 border-t border-slate-800">
                    <div className="mt-4 flex flex-col gap-2 relative">
                      {chain.length > 1 && (
                        <div
                          className="absolute left-3 top-4 bottom-4 w-px opacity-20"
                          style={{
                            background: "linear-gradient(#38BDF8, transparent)",
                          }}
                        />
                      )}
                      {chain.map((node, idx) => {
                        const nc = NODE_COLORS[node.type] || "#38BDF8";
                        return (
                          <div
                            key={idx}
                            className="flex gap-3 items-start relative z-10"
                          >
                            <div
                              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border"
                              style={{
                                background: `${nc}15`,
                                borderColor: `${nc}50`,
                                color: nc,
                              }}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-1 bg-slate-950/60 rounded-lg border border-slate-800/80 p-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: nc }}
                                >
                                  {node.name || `نقطة ${idx + 1}`}
                                </span>
                                {node.type && (
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded"
                                    style={{
                                      background: `${nc}15`,
                                      border: `1px solid ${nc}35`,
                                      color: nc,
                                    }}
                                  >
                                    {node.type}
                                  </span>
                                )}
                                {node.wilaya && (
                                  <span className="text-xs text-slate-600">
                                    📍 {node.wilaya}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setShowMyChain(true)}
                      className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-xs text-sky-400 hover:text-sky-300 border border-slate-800 hover:border-sky-800 rounded-lg transition-colors"
                    >
                      <ArrowRight size={11} />
                      سلسلة التوريد الخاصة بمشروعي
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
        </div>{/* closes scrollable */}
      </div>{/* closes projects panel */}
    </div>
  );
}

ModuleSupplyChain.propTypes = { setShowMyChain: PropTypes.func.isRequired };

// ─── MODULE: SHARED SERVICES ──────────────────────────────────────────────────
function ModuleSharedServices() {
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatService, setChatService] = useState(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["left-services"],
    queryFn: async () => {
      const s = await getDocs(collection(db, "shared_services"));
      return s.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    staleTime: 30000,
  });

  const openBook = (s) => {
    setShowModal(false);
    setChatService(s);
    setShowChat(true);
  };
  const availableCount = services.filter((s) => s.available).length;

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Shared Services
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          الخدمات المشتركة · {availableCount} خدمة متاحة من {services.length}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-slate-700 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-16">
          لا توجد خدمات متاحة
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((s) => {
            const cc = CAT_COLORS[s.category] || "#94A3B8";
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedService(s);
                  setShowModal(true);
                }}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left hover:border-slate-700 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{
                      background: `${cc}12`,
                      border: `1px solid ${cc}28`,
                    }}
                  >
                    {CAT_ICONS[s.category] || "🔧"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${s.available ? "bg-emerald-400" : "bg-slate-600"}`}
                    />
                    <span
                      className={`text-xs ${s.available ? "text-emerald-400" : "text-slate-600"}`}
                    >
                      {s.available ? "متاح" : "غير متاح"}
                    </span>
                  </div>
                </div>
                <p
                  className="font-medium text-sm text-slate-200 mb-1 truncate"
                  dir="rtl"
                >
                  {s.name_ar || s.name_en || s.name}
                </p>
                <p className="text-xs text-slate-500 mb-3 truncate">
                  {s.provider}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${cc}12`, color: cc }}
                  >
                    خصم {s.discount_percentage || 0}%
                  </span>
                  <ArrowRight
                    size={12}
                    className="text-slate-600 group-hover:text-slate-400 transition-colors"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Service detail modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <div
              className="px-6 py-5 text-white"
              style={{
                background: `linear-gradient(135deg, ${CAT_COLORS[selectedService.category] || "#4466FF"}, ${CAT_COLORS[selectedService.category] || "#4466FF"}99)`,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={14} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {CAT_ICONS[selectedService.category] || "🔧"}
                </div>
                <div>
                  <h2 className="font-bold text-base leading-tight">
                    {selectedService.name_en ||
                      selectedService.name_ar ||
                      selectedService.name}
                  </h2>
                  <p className="text-sm opacity-80 mt-0.5">
                    {selectedService.provider}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-white/20">
                      {selectedService.category}
                    </span>
                    {selectedService.available && (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-400/30">
                        ✓ متاح
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto p-5 flex-1">
              {selectedService.description && (
                <p
                  className="text-slate-600 text-sm leading-relaxed mb-5"
                  dir="rtl"
                >
                  {selectedService.description}
                </p>
              )}
              <div className="grid grid-cols-3 gap-3 mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">السعر العادي</p>
                  <p className="text-sm font-bold text-slate-400 line-through">
                    {selectedService.price_before?.toLocaleString()} DZD
                  </p>
                </div>
                <div className="text-center border-2 border-emerald-300 rounded-lg p-2">
                  <p className="text-xs text-slate-500 mb-1">سعر العضو</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {selectedService.price_after?.toLocaleString()} DZD
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">الوفر</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {selectedService.discount_percentage}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "المدة", val: selectedService.duration || "—" },
                  {
                    label: "التقييم",
                    val: `${selectedService.rating || 0}/5 ⭐`,
                  },
                  {
                    label: "الحجوزات",
                    val: `${selectedService.bookings_count || 0} حجز`,
                  },
                  { label: "المزود", val: selectedService.provider || "—" },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                  >
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <p
                      className="text-sm font-semibold text-slate-800"
                      dir="rtl"
                    >
                      {val}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openBook(selectedService)}
                  disabled={!selectedService.available}
                  className="py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors text-sm"
                >
                  📩 Book Now
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="py-3 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChat && chatService && (
        <ChatMiniPopup
          service={chatService}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

// ─── MODULE: DECISION MAKING ──────────────────────────────────────────────────
function ModuleDecisionMaking() {
  const [votingDecision, setVotingDecision] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(null);

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ["left-decisions"],
    queryFn: async () => {
      const q = query(
        collection(db, "consortium_decisions"),
        where("status", "==", "active"),
      );
      const s = await getDocs(q);
      return s.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    staleTime: 10000,
  });

  const doVote = async (d, vt) => {
    const uid = auth?.currentUser?.uid;
    if (!uid || d.votedUsers?.includes(uid) || isVoting) return;
    setIsVoting(true);
    try {
      const ref = doc(db, "consortium_decisions", d.id);
      const batch = writeBatch(db);
      const nFor = vt === "for" ? (d.votesFor || 0) + 1 : d.votesFor || 0;
      const nAg =
        vt === "against" ? (d.votesAgainst || 0) + 1 : d.votesAgainst || 0;
      const nAb = vt === "abstain" ? (d.abstain || 0) + 1 : d.abstain || 0;
      batch.update(ref, {
        votes: [
          ...(d.votes || []),
          { userId: uid, vote: vt, timestamp: Timestamp.now() },
        ],
        votedUsers: [...(d.votedUsers || []), uid],
        votesFor: nFor,
        votesAgainst: nAg,
        abstain: nAb,
        totalVotes: nFor + nAg + nAb,
        lastUpdated: Timestamp.now(),
      });
      await batch.commit();
      setVoteSuccess(d.id);
      setVotingDecision(null);
      setTimeout(() => setVoteSuccess(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Decision Making
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          المشاركة في القرار ·{" "}
          <span className="text-amber-400">{decisions.length}</span> قرار نشط
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
        </div>
      ) : decisions.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <Vote
            size={28}
            className="text-slate-700 mx-auto mb-3"
          />
          <p className="text-slate-500 text-sm">
            لا توجد قرارات نشطة للتصويت حالياً
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((d) => {
            const total =
              (d.votesFor || 0) + (d.votesAgainst || 0) + (d.abstain || 0);
            const forPct =
              total > 0 ? Math.round(((d.votesFor || 0) / total) * 100) : 0;
            const agPct =
              total > 0 ? Math.round(((d.votesAgainst || 0) / total) * 100) : 0;
            const abPct =
              total > 0 ? Math.round(((d.abstain || 0) / total) * 100) : 0;
            const uid = auth?.currentUser?.uid;
            const hasVoted = d.votedUsers?.includes(uid);
            const isExpanded = votingDecision === d.id;
            const justVoted = voteSuccess === d.id;

            return (
              <div
                key={d.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setVotingDecision(isExpanded ? null : d.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span
                    className="flex-1 text-sm font-medium text-slate-200"
                    dir="rtl"
                  >
                    {d.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {hasVoted && (
                      <CheckCircle
                        size={13}
                        className="text-emerald-400"
                      />
                    )}
                    <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">
                      {total} صوت
                    </span>
                    {isExpanded ? (
                      <ChevronUp
                        size={14}
                        className="text-slate-500"
                      />
                    ) : (
                      <ChevronDown
                        size={14}
                        className="text-slate-500"
                      />
                    )}
                  </div>
                </button>

                {/* Progress bar */}
                <div className="h-1 bg-slate-800 flex overflow-hidden">
                  <div
                    style={{ width: `${forPct}%` }}
                    className="bg-emerald-500 transition-all"
                  />
                  <div
                    style={{ width: `${agPct}%` }}
                    className="bg-red-500 transition-all"
                  />
                  <div
                    style={{ width: `${abPct}%` }}
                    className="bg-slate-600 transition-all"
                  />
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-4 border-t border-slate-800">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        {
                          label: "مع ✓",
                          val: d.votesFor || 0,
                          pct: forPct,
                          color: "#34D399",
                        },
                        {
                          label: "ضد ✗",
                          val: d.votesAgainst || 0,
                          pct: agPct,
                          color: "#F87171",
                        },
                        {
                          label: "ممتنع ◉",
                          val: d.abstain || 0,
                          pct: abPct,
                          color: "#94A3B8",
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-xl p-3 text-center border"
                          style={{
                            background: `${s.color}08`,
                            borderColor: `${s.color}20`,
                          }}
                        >
                          <p
                            className="text-xs mb-1.5"
                            style={{ color: s.color }}
                          >
                            {s.label}
                          </p>
                          <p
                            className="text-2xl font-bold"
                            style={{ color: s.color }}
                          >
                            {s.val}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: s.color, opacity: 0.6 }}
                          >
                            {s.pct}%
                          </p>
                        </div>
                      ))}
                    </div>

                    {d.description && (
                      <p
                        className="text-sm text-slate-500 leading-relaxed mb-4 bg-slate-900/60 rounded-lg p-3 border border-slate-800"
                        dir="rtl"
                      >
                        {d.description}
                      </p>
                    )}

                    {justVoted ? (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-sm text-emerald-400 text-center">
                        ✓ تم تسجيل صوتك بنجاح!
                      </div>
                    ) : hasVoted ? (
                      <div className="rounded-xl bg-slate-800/60 p-3 text-sm text-slate-500 text-center">
                        ✓ لقد صوّتَ بالفعل على هذا القرار
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            type: "for",
                            label: "مع ✓",
                            cls: "border-emerald-700/50 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15",
                          },
                          {
                            type: "abstain",
                            label: "ممتنع ◉",
                            cls: "border-slate-700/60 bg-slate-700/20 text-slate-400 hover:bg-slate-700/40",
                          },
                          {
                            type: "against",
                            label: "ضد ✗",
                            cls: "border-red-700/50 bg-red-500/8 text-red-400 hover:bg-red-500/15",
                          },
                        ].map((btn) => (
                          <button
                            key={btn.type}
                            onClick={() => doVote(d, btn.type)}
                            disabled={isVoting}
                            className={`py-3 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btn.cls}`}
                          >
                            {isVoting ? "..." : btn.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MODULE: FUNDING PRIORITY ─────────────────────────────────────────────────
function ModuleFundingPriority() {
  const { data: certifiedProjects = [], isLoading } = useQuery({
    queryKey: ["certified-projects"],
    queryFn: async () => {
      const snap = await getDocs(
        query(collection(db, "projects"), where("quality_badge", "==", true)),
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Funding Priority
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          أولوية التمويل · المشاريع المعتمدة تحصل على دعم تمويلي متقدم
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "مشاريع ذات أولوية",
            value: isLoading ? "—" : certifiedProjects.length,
            color: "text-sky-400",
          },
          {
            label: "زيادة فرص التمويل",
            value: "+40%",
            color: "text-emerald-400",
          },
          { label: "حالة الأولوية", value: "مفعّل", color: "text-amber-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <p className="text-xs text-slate-500 mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
        المشاريع ذات الأولوية
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-slate-700 border-t-sky-400 rounded-full animate-spin" />
        </div>
      ) : certifiedProjects.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <TrendingUp
            size={28}
            className="text-slate-700 mx-auto mb-3"
          />
          <p className="text-slate-500 text-sm">لا توجد مشاريع معتمدة حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certifiedProjects.map((p) => {
            const progress =
              p.funding_goal > 0
                ? Math.min(
                    100,
                    Math.round(
                      ((p.funding_current || 0) / p.funding_goal) * 100,
                    ),
                  )
                : 0;
            return (
              <div
                key={p.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm text-slate-100 truncate"
                      dir="rtl"
                    >
                      {p.name_ar || p.title || p.id}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.company_name}
                      {p.sector && ` · ${p.sector}`}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                    <Award
                      size={13}
                      className="text-amber-400"
                    />
                  </div>
                </div>
                {p.funding_goal > 0 && (
                  <>
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                      <span>
                        {(p.funding_current || 0).toLocaleString()} DZD
                      </span>
                      <span>هدف {p.funding_goal.toLocaleString()} DZD</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600">{progress}% مكتمل</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MODULE: ENHANCED CREDIBILITY ─────────────────────────────────────────────
function ModuleEnhancedCredibility() {
  const { data: certifiedProjects = [], isLoading } = useQuery({
    queryKey: ["certified-projects"],
    queryFn: async () => {
      const snap = await getDocs(
        query(collection(db, "projects"), where("quality_badge", "==", true)),
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Enhanced Credibility
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          مصداقية معززة · اعتماد رسمي يزيد ثقة المستثمرين والشركاء
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "أعضاء معتمدون",
            value: isLoading ? "—" : certifiedProjects.length,
            color: "text-purple-400",
          },
          {
            label: "زيادة ثقة المستثمرين",
            value: "+60%",
            color: "text-emerald-400",
          },
          { label: "مستوى المصداقية", value: "عالي", color: "text-sky-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <p className="text-xs text-slate-500 mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
        الأعضاء المعتمدون
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-slate-700 border-t-purple-400 rounded-full animate-spin" />
        </div>
      ) : certifiedProjects.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <Shield
            size={28}
            className="text-slate-700 mx-auto mb-3"
          />
          <p className="text-slate-500 text-sm">لا توجد مؤسسات معتمدة حالياً</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certifiedProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm text-slate-100 truncate"
                    dir="rtl"
                  >
                    {project.name_ar || "مشروع بدون اسم"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {project.company_name}
                    {project.sector && ` · ${project.sector}`}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0 ml-2">
                  <Award
                    size={13}
                    className="text-amber-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {project.total_score !== undefined && (
                  <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">
                    {project.total_score}/100 نقطة
                  </span>
                )}
                <span className="text-xs flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  <CheckCircle size={10} />6 امتيازات
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MODULE: SUBCONTRACTING ────────────────────────────────────────────────────
function ModuleSubcontracting() {
  const { data: contracts = [] } = useQuery({
    queryKey: ["subcontracting-contracts"],
    queryFn: async () => {
      try {
        const s = await getDocs(collection(db, "contracts"));
        return s.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  const opportunities =
    contracts.length > 0
      ? contracts
      : [
          {
            id: "s1",
            title: "مشروع طاقة شمسية — ورقلة",
            sector: "طاقة",
            value: "2.5M DZD",
            status: "active",
          },
          {
            id: "s2",
            title: "تطوير منصة رقمية — الجزائر",
            sector: "تقنية",
            value: "1.8M DZD",
            status: "active",
          },
          {
            id: "s3",
            title: "مشروع زراعي متكامل — سطيف",
            sector: "زراعة",
            value: "3.2M DZD",
            status: "pending",
          },
          {
            id: "s4",
            title: "بناء وحدة صناعية — وهران",
            sector: "صناعة",
            value: "5.0M DZD",
            status: "active",
          },
          {
            id: "s5",
            title: "مشروع مياه — بسكرة",
            sector: "بنية تحتية",
            value: "4.1M DZD",
            status: "pending",
          },
          {
            id: "s6",
            title: "تجهيز مستشفى — قسنطينة",
            sector: "صحة",
            value: "2.8M DZD",
            status: "active",
          },
        ];

  const activeCount = opportunities.filter((o) => o.status === "active").length;
  const sectors = [
    ...new Set(opportunities.map((o) => o.sector).filter(Boolean)),
  ];

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Subcontracting Opportunities
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          فرص المناولة · تعاون بين المؤسسات على مشاريع التعاقد من الباطن
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "إجمالي الفرص",
            value: opportunities.length,
            color: "text-orange-400",
          },
          {
            label: "نشطة حالياً",
            value: activeCount,
            color: "text-emerald-400",
          },
          {
            label: "قطاعات متاحة",
            value: sectors.length,
            color: "text-sky-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <p className="text-xs text-slate-500 mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
        الفرص المتاحة
      </h3>
      <div className="space-y-3">
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex items-center gap-4"
          >
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${opp.status === "active" ? "bg-emerald-400" : "bg-slate-600"}`}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-slate-200 truncate"
                dir="rtl"
              >
                {opp.title || opp.name || opp.id}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {opp.sector && (
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    {opp.sector}
                  </span>
                )}
                {opp.value && (
                  <span className="text-xs text-orange-400">{opp.value}</span>
                )}
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${
                opp.status === "active"
                  ? "bg-emerald-400/10 text-emerald-400"
                  : "bg-slate-700/50 text-slate-500"
              }`}
            >
              {opp.status === "active" ? "نشط" : "قيد المراجعة"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function QualityBadge() {
  const [activeModule, setActiveModule] = useState("supply-chain");
  const [showMyChain, setShowMyChain] = useState(false);
  const navigate = useNavigate();

  const modules = [
    {
      id: "supply-chain",
      label: "Shared Supply Chains",
      labelAr: "سلاسل التوريد",
      icon: Network,
    },
    {
      id: "shared-services",
      label: "Shared Services",
      labelAr: "الخدمات المشتركة",
      icon: Building2,
    },
    {
      id: "decision-making",
      label: "Decision Making",
      labelAr: "المشاركة في القرار",
      icon: Vote,
    },
    {
      id: "funding-priority",
      label: "Funding Priority",
      labelAr: "أولوية التمويل",
      icon: TrendingUp,
    },
    {
      id: "enhanced-credibility",
      label: "Enhanced Credibility",
      labelAr: "مصداقية معززة",
      icon: Shield,
    },
    {
      id: "subcontracting",
      label: "Subcontracting",
      labelAr: "فرص المناولة",
      icon: FileText,
    },
  ];

  return (
    <>
      <style>{`
        @keyframes mod-fade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .mod-fade { animation: mod-fade 0.15s ease-out; }
      `}</style>

      <div
        style={{
          position: "fixed",
          top: "64px",
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          display: "flex",
          background: "#0a0e17",
        }}
      >
        {/* ── SIDEBAR ── */}
        <aside
          style={{
            width: "300px",
            minWidth: "300px",
            height: "100%",
            background: "#0f1117",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {/* Scrollable top: header + nav */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {/* Header */}
            <div
              className="px-5 py-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <Award
                    size={16}
                    className="text-amber-400"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200 leading-tight truncate">
                    Quality Badge
                  </p>
                  <p className="text-xs text-slate-500 leading-tight">
                    شارة الجودة
                  </p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="py-3 px-3">
              {modules.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-left transition-all overflow-hidden ${
                      isActive
                        ? "bg-slate-800 text-slate-100"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    {/* Active accent bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-400 rounded-r-full" />
                    )}

                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive
                          ? "bg-blue-500/15 border border-blue-500/25"
                          : "bg-slate-800/80 border border-transparent"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={
                          isActive ? "text-blue-400" : "text-slate-500"
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-tight truncate">
                        {mod.label}
                      </p>
                      <p className="text-xs text-slate-600 leading-tight truncate mt-0.5">
                        {mod.labelAr}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Action Buttons — pinned to bottom */}
          <div
            style={{
              flexShrink: 0,
              padding: "12px 12px 24px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {[
              { label: "إنشاء تكتل", icon: Users, action: () => setShowMyChain(true) },
              { label: "إنشاء مقترح", icon: FilePlus, action: () => navigate("/create-proposal") },
              { label: "إنشاء خدمة", icon: Wrench, action: () => navigate("/admin/shared-services") },
            ].map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-left transition-all text-teal-500 hover:text-teal-300 hover:bg-teal-500/10"
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 bg-teal-500/10 border border-teal-500/20">
                  <Icon size={16} />
                </div>
                <span className="text-xs font-medium leading-tight">
                  <span className="text-teal-600 mr-0.5">+</span> {label}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main
          style={{
            flex: 1,
            width: 0,
            height: "100%",
            overflowY: "auto",
            padding: "2rem",
            background: "#0a0e17",
          }}
        >
          <div
            key={activeModule}
            className="mod-fade"
          >
            {activeModule === "supply-chain" && <ModuleSupplyChain setShowMyChain={setShowMyChain} />}
            {activeModule === "shared-services" && <ModuleSharedServices />}
            {activeModule === "decision-making" && <ModuleDecisionMaking />}
            {activeModule === "funding-priority" && <ModuleFundingPriority />}
            {activeModule === "enhanced-credibility" && (
              <ModuleEnhancedCredibility />
            )}
            {activeModule === "subcontracting" && <ModuleSubcontracting />}
          </div>
        </main>
      </div>

      {/* ── MY SUPPLY CHAIN MODAL ── */}
      {showMyChain && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowMyChain(false)}
          />
          <div
            style={{ position: "relative", background: "#161b27", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.5)", width: "100%", maxWidth: 900, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#1e3a8a,#4c1d95)", color: "white", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>🔗</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: "bold" }}>سلسلة التوريد الخاصة بمشروعي</h3>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.75 }}>أضف نقاط التوريد وستظهر على الخريطة التفاعلية تلقائياً</p>
                </div>
              </div>
              <button
                onClick={() => setShowMyChain(false)}
                style={{ background: "rgba(255,255,255,.15)", border: "none", color: "white", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={18} />
              </button>
            </div>
            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              <MySupplyChainPanel />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
