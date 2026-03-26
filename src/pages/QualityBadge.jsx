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
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Award,
  Network,
  Building2,
  FileText,
  Vote,
  Shield,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

// ─────────────────────────────────────────────────────────────────
//  LIVE TV PANEL
// ─────────────────────────────────────────────────────────────────
function LiveTVPanel() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#000",
        fontFamily: "monospace",
        border: "1px solid #0a2540",
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px 10px",
          background: "linear-gradient(180deg,rgba(0,0,0,.85),transparent)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#FF2222",
              boxShadow: "0 0 8px #FF2222",
              animation: "nm-blink 1s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: "#FF2222",
              letterSpacing: 2,
              fontWeight: "bold",
            }}
          >
            LIVE
          </span>
          <span
            style={{
              fontSize: 9,
              color: "#fff",
              letterSpacing: 1,
              opacity: 0.9,
            }}
          >
            🇩🇿 Canal Algérie 3
          </span>
        </div>
      </div>

      {/* Scanlines overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px)",
        }}
      />

      {/* Placeholder instead of video */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #001a2e, #003344)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#00CCFF",
          fontFamily: "monospace",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 32 }}>📡</span>
        <span style={{ fontSize: 12, letterSpacing: 2, opacity: 0.8 }}>
          البث مؤقتاً غير متاح
        </span>
        <span style={{ fontSize: 9, color: "#004466", letterSpacing: 1 }}>
          SIGNAL OFFLINE
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  SHARED CONSTANTS
// ─────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  legal: "#4488FF",
  accounting: "#00FF88",
  marketing: "#FF4488",
  hr: "#FFCC00",
};
const CAT_ICONS = { legal: "⚖️", accounting: "💼", marketing: "📢", hr: "👥" };

// ─────────────────────────────────────────────────────────────────
//  SHARED STYLE HELPERS
// ─────────────────────────────────────────────────────────────────
const mkBadge = (color) => ({
  fontSize: 11,
  padding: "3px 8px",
  borderRadius: 4,
  background: `${color}18`,
  border: `1px solid ${color}40`,
  color,
  fontFamily: "monospace",
  letterSpacing: 1,
  flexShrink: 0,
  whiteSpace: "nowrap",
});

const NAME_STYLE = {
  fontSize: 13,
  color: "#88CCDD",
  direction: "rtl",
  textAlign: "right",
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontFamily: "monospace",
  lineHeight: 1.4,
};

const ROW_BASE = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderBottom: "1px solid #060e18",
  cursor: "pointer",
};

const priColor = (p) =>
  p === "high" ? "#FF4444" : p === "medium" ? "#FFCC00" : "#00CCFF";

// ─────────────────────────────────────────────────────────────────
//  CHAT MINI POPUP
// ─────────────────────────────────────────────────────────────────
function ChatMiniPopup({ service, onClose }) {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([
    {
      from: "bot",
      text: `مرحباً! أنت الآن تتواصل معنا بخصوص خدمة "${service.name_en || service.name_ar || service.name}" من ${service.provider}. كيف يمكننا مساعدتك؟`,
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
    <div
      style={{
        position: "fixed",
        bottom: 80,
        right: 24,
        zIndex: 3000,
        width: 340,
        background: "white",
        borderRadius: 16,
        boxShadow: "0 12px 40px rgba(0,0,0,.3)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg,${cc},${cc}bb)`,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "rgba(255,255,255,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {CAT_ICONS[service.category] || "🔧"}
          </div>
          <div>
            <p
              style={{
                margin: 0,
                color: "white",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {service.name_en || service.name_ar || service.name}
            </p>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,.75)",
                fontSize: 12,
              }}
            >
              {service.provider}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,.2)",
            border: "none",
            color: "white",
            width: 30,
            height: 30,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          padding: 12,
          background: "#f8fafc",
          overflowY: "auto",
          maxHeight: 240,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.from === "user" ? "flex-start" : "flex-end",
            }}
          >
            <div
              style={{
                background: m.from === "user" ? "white" : `${cc}18`,
                border: `1px solid ${m.from === "user" ? "#e2e8f0" : `${cc}40`}`,
                borderRadius: 10,
                padding: "9px 13px",
                maxWidth: "90%",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#374151",
                  direction: "rtl",
                  lineHeight: 1.6,
                }}
              >
                {m.text}
              </p>
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
              {m.time}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          gap: 8,
          background: "white",
        }}
      >
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="اكتب رسالتك..."
          style={{
            flex: 1,
            padding: "9px 13px",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 13,
            direction: "rtl",
            outline: "none",
          }}
        />
        <button
          onClick={send}
          style={{
            background: cc,
            border: "none",
            color: "white",
            width: 38,
            height: 38,
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
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

// ─────────────────────────────────────────────────────────────────
//  LEFT TABS PANEL
// ─────────────────────────────────────────────────────────────────
function LeftTabsPanel() {
  const [activeTab, setActiveTab] = useState("supply");
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatService, setChatService] = useState(null);
  const [votingDecision, setVotingDecision] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(null);
  const [expandedSupply, setExpandedSupply] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["left-projects"],
    queryFn: async () => {
      const s = await getDocs(collection(db, "projects"));
      return s.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    staleTime: 30000,
  });
  const { data: decisions = [] } = useQuery({
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
  const { data: services = [] } = useQuery({
    queryKey: ["left-services"],
    queryFn: async () => {
      const s = await getDocs(collection(db, "shared_services"));
      return s.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    staleTime: 30000,
  });

  const TABS = [
    {
      id: "supply",
      label: "🔗 سلاسل",
      count: projects.filter((p) => p.supply_chain?.length > 0).length,
    },
    { id: "voting", label: "🗳️ تصويت", count: decisions.length },
    { id: "services", label: "🏢 خدمات", count: services.length },
  ];

  const TAB_LINKS = {
    supply: "/consortium/supply-chain",
    voting: "/decision-making",
    services: "/consortium/services",
  };

  const NODE_COLORS = {
    مورد: "#00CCFF",
    مستودع: "#FFCC00",
    توزيع: "#00FF88",
    تصنيع: "#FF8800",
    تصدير: "#FF4488",
    عميل: "#AA44FF",
  };

  const openBook = (s) => {
    setShowModal(false);
    setChatService(s);
    setShowChat(true);
  };

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

  const EmptyState = ({ text }) => (
    <div
      style={{
        textAlign: "center",
        padding: "32px 16px",
        fontSize: 13,
        color: "#224455",
        fontFamily: "monospace",
      }}
    >
      {text}
    </div>
  );

  EmptyState.propTypes = { text: PropTypes.string.isRequired };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#020912",
        fontFamily: "monospace",
        border: "1px solid #0a2540",
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        .lt-row:hover { background: rgba(0,180,255,.07) !important; }
        .lt-tab-btn:hover { background: rgba(0,180,255,.05) !important; }
        .lt-vote-btn { transition: all .15s; }
        .lt-vote-btn:hover { filter: brightness(1.2); transform: scale(1.03); }
        @keyframes nm-blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .lt-scroll::-webkit-scrollbar { width: 4px; }
        .lt-scroll::-webkit-scrollbar-thumb { background: #0a3a50; border-radius: 2px; }
      `}</style>

      {/* TAB BAR */}
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          borderBottom: "1px solid #0a2540",
          background: "#010810",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            className="lt-tab-btn"
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1,
              padding: "10px 6px",
              cursor: "pointer",
              fontFamily: "monospace",
              background:
                activeTab === t.id ? "rgba(0,180,255,.08)" : "transparent",
              border: "none",
              borderBottom:
                activeTab === t.id
                  ? "2px solid #00CCFF"
                  : "2px solid transparent",
              color: activeTab === t.id ? "#00CCFF" : "#445566",
              fontSize: 11,
              letterSpacing: 0.5,
              transition: "all .15s",
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span
                style={{
                  marginRight: 4,
                  fontSize: 10,
                  background: "#00CCFF22",
                  border: "1px solid #00CCFF40",
                  color: "#00CCFF",
                  padding: "1px 6px",
                  borderRadius: 3,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div
        className="lt-scroll"
        style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
      >
        {/* SUPPLY CHAINS */}
        {activeTab === "supply" &&
          (projects.filter((p) => p.supply_chain?.length > 0).length === 0 ? (
            <EmptyState text="لا توجد سلاسل توريد بعد" />
          ) : (
            projects
              .filter((p) => p.supply_chain?.length > 0)
              .map((p) => {
                const chain = p.supply_chain || [];
                const isExp = expandedSupply === p.id;
                return (
                  <div
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #060e18",
                      background: isExp ? "rgba(0,180,255,.04)" : "transparent",
                    }}
                  >
                    <div
                      className="lt-row"
                      style={ROW_BASE}
                      onClick={() => setExpandedSupply(isExp ? null : p.id)}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#00CCFF",
                          boxShadow: "0 0 6px #00CCFF",
                          flexShrink: 0,
                        }}
                      />
                      <span style={NAME_STYLE}>
                        {p.name_ar || p.name || p.id}
                      </span>
                      <span style={mkBadge("#00CCFF")}>
                        {chain.length} نقطة
                      </span>
                      <span style={{ fontSize: 12, color: "#224455" }}>
                        {isExp ? "▲" : "▼"}
                      </span>
                    </div>
                    {isExp && (
                      <div style={{ padding: "0 12px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginBottom: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          {p.wilaya && (
                            <span style={mkBadge("#AAEEFF")}>
                              📍 {p.wilaya}
                            </span>
                          )}
                          {p.category && (
                            <span style={mkBadge("#FFCC00")}>
                              ⚙ {p.category}
                            </span>
                          )}
                          {p.status && (
                            <span
                              style={mkBadge(
                                p.status === "active" ? "#00FF88" : "#FF4444",
                              )}
                            >
                              ◉ {p.status}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            position: "relative",
                          }}
                        >
                          {chain.length > 1 && (
                            <div
                              style={{
                                position: "absolute",
                                left: 13,
                                top: 16,
                                bottom: 16,
                                width: 1,
                                background:
                                  "linear-gradient(#00CCFF44,#00CCFF22)",
                                zIndex: 0,
                              }}
                            />
                          )}
                          {chain.map((node, idx) => {
                            const nc = NODE_COLORS[node.type] || "#00CCFF";
                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "flex-start",
                                  position: "relative",
                                  zIndex: 1,
                                }}
                              >
                                <div
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: "50%",
                                    flexShrink: 0,
                                    background: `${nc}22`,
                                    border: `1.5px solid ${nc}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 11,
                                    color: nc,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {idx + 1}
                                </div>
                                <div
                                  style={{
                                    flex: 1,
                                    background: "#030d18",
                                    border: `1px solid ${nc}30`,
                                    borderRadius: 6,
                                    padding: "8px 10px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      marginBottom: 4,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: nc,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {node.name || `نقطة ${idx + 1}`}
                                    </span>
                                    {node.type && (
                                      <span
                                        style={{ ...mkBadge(nc), fontSize: 9 }}
                                      >
                                        {node.type}
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {node.wilaya && (
                                      <span
                                        style={{
                                          fontSize: 10,
                                          color: "#446688",
                                        }}
                                      >
                                        📍 {node.wilaya}
                                      </span>
                                    )}
                                    {node.status && (
                                      <span
                                        style={{
                                          fontSize: 10,
                                          color:
                                            node.status === "active"
                                              ? "#00FF88"
                                              : "#FF4444",
                                        }}
                                      >
                                        ◉ {node.status}
                                      </span>
                                    )}
                                    {node.notes && (
                                      <span
                                        style={{
                                          fontSize: 10,
                                          color: "#224455",
                                          direction: "rtl",
                                        }}
                                      >
                                        {node.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <Link
                          to="/consortium/supply-chain"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            marginTop: 12,
                            padding: "9px",
                            borderRadius: 6,
                            background: "rgba(0,180,255,.08)",
                            border: "1px solid #00CCFF30",
                            color: "#00CCFF",
                            fontSize: 11,
                            textDecoration: "none",
                            fontFamily: "monospace",
                            letterSpacing: 1,
                          }}
                        >
                          → فتح سلاسل التوريد الكاملة
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
          ))}

        {/* VOTING */}
        {activeTab === "voting" &&
          (decisions.length === 0 ? (
            <EmptyState text="لا توجد قرارات نشطة" />
          ) : (
            decisions.map((d) => {
              const total =
                (d.votesFor || 0) + (d.votesAgainst || 0) + (d.abstain || 0);
              const forPct =
                total > 0 ? Math.round(((d.votesFor || 0) / total) * 100) : 0;
              const agPct =
                total > 0
                  ? Math.round(((d.votesAgainst || 0) / total) * 100)
                  : 0;
              const abPct =
                total > 0 ? Math.round(((d.abstain || 0) / total) * 100) : 0;
              const pc = priColor(d.priority);
              const uid = auth?.currentUser?.uid;
              const hasVoted = d.votedUsers?.includes(uid);
              const isExpanded = votingDecision === d.id;
              const justVoted = voteSuccess === d.id;
              return (
                <div
                  key={d.id}
                  style={{
                    borderBottom: "1px solid #060e18",
                    background: isExpanded
                      ? "rgba(0,180,255,.04)"
                      : "transparent",
                  }}
                >
                  <div
                    className="lt-row"
                    style={ROW_BASE}
                    onClick={() => setVotingDecision(isExpanded ? null : d.id)}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: pc,
                        boxShadow: `0 0 6px ${pc}`,
                        flexShrink: 0,
                      }}
                    />
                    <span style={NAME_STYLE}>{d.title}</span>
                    <span style={mkBadge(pc)}>{total} صوت</span>
                    {hasVoted && (
                      <span style={{ fontSize: 12, color: "#00FF88" }}>✓</span>
                    )}
                    <span style={{ fontSize: 12, color: "#224455" }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "#0a2540",
                      margin: "0 12px 8px",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", height: "100%" }}>
                      <div
                        style={{
                          width: `${forPct}%`,
                          background: "#00FF88",
                          transition: "width .3s",
                        }}
                      />
                      <div
                        style={{
                          width: `${agPct}%`,
                          background: "#FF4444",
                          transition: "width .3s",
                        }}
                      />
                      <div
                        style={{
                          width: `${abPct}%`,
                          background: "#445566",
                          transition: "width .3s",
                        }}
                      />
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: "0 12px 14px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        {[
                          {
                            label: "✓ مع",
                            val: d.votesFor || 0,
                            pct: forPct,
                            color: "#00FF88",
                          },
                          {
                            label: "✗ ضد",
                            val: d.votesAgainst || 0,
                            pct: agPct,
                            color: "#FF4444",
                          },
                          {
                            label: "◉ ممتنع",
                            val: d.abstain || 0,
                            pct: abPct,
                            color: "#445566",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              background: "#030d18",
                              border: `1px solid ${s.color}30`,
                              borderRadius: 6,
                              padding: "8px 6px",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: s.color,
                                marginBottom: 4,
                              }}
                            >
                              {s.label}
                            </div>
                            <div
                              style={{
                                fontSize: 22,
                                fontWeight: "bold",
                                color: s.color,
                                fontFamily: "monospace",
                              }}
                            >
                              {s.val}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: s.color,
                                opacity: 0.7,
                              }}
                            >
                              {s.pct}%
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginBottom: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={mkBadge(pc)}>
                          {d.priority || "medium"}
                        </span>
                        {d.category && (
                          <span style={mkBadge("#AAEEFF")}>{d.category}</span>
                        )}
                        {d.deadline && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#224455",
                              fontFamily: "monospace",
                            }}
                          >
                            ⏰ {d.deadline}
                          </span>
                        )}
                      </div>
                      {d.description && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#557788",
                            direction: "rtl",
                            textAlign: "right",
                            lineHeight: 1.7,
                            marginBottom: 10,
                            background: "#030d18",
                            padding: "8px 10px",
                            borderRadius: 5,
                            border: "1px solid #0a2540",
                          }}
                        >
                          {d.description}
                        </p>
                      )}
                      {justVoted ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "10px",
                            background: "#00FF8818",
                            border: "1px solid #00FF8840",
                            borderRadius: 7,
                            fontSize: 13,
                            color: "#00FF88",
                          }}
                        >
                          ✓ تم تسجيل صوتك بنجاح!
                        </div>
                      ) : hasVoted ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            background: "#224455",
                            borderRadius: 6,
                            fontSize: 11,
                            color: "#00CCFF88",
                          }}
                        >
                          ✓ لقد صوّتَ بالفعل على هذا القرار
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 7,
                          }}
                        >
                          {[
                            { type: "for", label: "مع ✓", color: "#00FF88" },
                            {
                              type: "abstain",
                              label: "ممتنع ◉",
                              color: "#AAEEFF",
                            },
                            {
                              type: "against",
                              label: "ضد ✗",
                              color: "#FF4444",
                            },
                          ].map((btn) => (
                            <button
                              key={btn.type}
                              className="lt-vote-btn"
                              onClick={() => doVote(d, btn.type)}
                              disabled={isVoting}
                              style={{
                                padding: "9px 4px",
                                borderRadius: 6,
                                border: `1px solid ${btn.color}60`,
                                background: `${btn.color}12`,
                                color: btn.color,
                                fontSize: 12,
                                cursor: isVoting ? "not-allowed" : "pointer",
                                fontFamily: "monospace",
                                fontWeight: "bold",
                                opacity: isVoting ? 0.5 : 1,
                              }}
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
            })
          ))}

        {/* SERVICES */}
        {activeTab === "services" &&
          (services.length === 0 ? (
            <EmptyState text="لا توجد خدمات" />
          ) : (
            services.map((s) => {
              const cc = CAT_COLORS[s.category] || "#AAEEFF";
              return (
                <div
                  key={s.id}
                  className="lt-row"
                  style={ROW_BASE}
                  onClick={() => {
                    setSelectedService(s);
                    setShowModal(true);
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: cc,
                      boxShadow: `0 0 5px ${cc}`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 15, flexShrink: 0 }}>
                    {CAT_ICONS[s.category] || "🔧"}
                  </span>
                  <span style={NAME_STYLE}>
                    {s.name_ar || s.name_en || s.name || s.id}
                  </span>
                  <span style={mkBadge(cc)}>{s.discount_percentage || 0}%</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontFamily: "monospace",
                      flexShrink: 0,
                      color: s.available ? "#00FF88" : "#FF4444",
                    }}
                  >
                    {s.available ? "●" : "○"}
                  </span>
                </div>
              );
            })
          ))}
      </div>

      {/* FOOTER */}
      <div
        style={{
          padding: "6px 12px",
          flexShrink: 0,
          borderTop: "1px solid #06121e",
          background: "#010810",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 9, color: "#0a3a50", letterSpacing: 2 }}>
          CROWDALG MONITOR
        </span>
        <Link
          to={TAB_LINKS[activeTab]}
          style={{
            fontSize: 11,
            color: "#00CCFF99",
            textDecoration: "none",
            letterSpacing: 1,
          }}
        >
          → فتح
        </Link>
      </div>

      {/* SERVICE MODAL */}
      {showModal && selectedService && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
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
              background: "rgba(0,0,0,.75)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowModal(false)}
          />
          <div
            style={{
              position: "relative",
              background: "white",
              borderRadius: 16,
              boxShadow: "0 24px 64px rgba(0,0,0,.4)",
              width: "100%",
              maxWidth: 540,
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg,${CAT_COLORS[selectedService.category] || "#4466FF"},${CAT_COLORS[selectedService.category] || "#4466FF"}99)`,
                padding: "22px 24px",
                color: "white",
                position: "relative",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  background: "rgba(255,255,255,.2)",
                  border: "none",
                  color: "white",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: "rgba(255,255,255,.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  {CAT_ICONS[selectedService.category] || "🔧"}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: "bold" }}>
                    {selectedService.name_en ||
                      selectedService.name_ar ||
                      selectedService.name}
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>
                    {selectedService.provider}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 10px",
                        borderRadius: 5,
                        background: "rgba(255,255,255,.2)",
                      }}
                    >
                      {selectedService.category}
                    </span>
                    {selectedService.available && (
                      <span
                        style={{
                          fontSize: 12,
                          padding: "2px 10px",
                          borderRadius: 5,
                          background: "rgba(0,255,136,.3)",
                        }}
                      >
                        ✓ Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ overflowY: "auto", padding: 22, flex: 1 }}>
              <p
                style={{
                  color: "#555",
                  lineHeight: 1.7,
                  marginBottom: 18,
                  direction: "rtl",
                  textAlign: "right",
                }}
              >
                {selectedService.description}
              </p>
              <div
                style={{
                  background: "linear-gradient(135deg,#f0fff4,#e6ffed)",
                  border: "2px solid #86efac",
                  borderRadius: 12,
                  padding: 18,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    textAlign: "center",
                  }}
                >
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#777", margin: "0 0 5px" }}
                    >
                      السعر العادي
                    </p>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#aaa",
                        textDecoration: "line-through",
                        margin: 0,
                      }}
                    >
                      {selectedService.price_before?.toLocaleString()} DZD
                    </p>
                  </div>
                  <div
                    style={{
                      border: "2px solid #22c55e",
                      borderRadius: 8,
                      padding: 8,
                    }}
                  >
                    <p
                      style={{ fontSize: 12, color: "#777", margin: "0 0 5px" }}
                    >
                      سعر العضو
                    </p>
                    <p
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#16a34a",
                        margin: 0,
                      }}
                    >
                      {selectedService.price_after?.toLocaleString()} DZD
                    </p>
                  </div>
                  <div>
                    <p
                      style={{ fontSize: 12, color: "#777", margin: "0 0 5px" }}
                    >
                      الوفر
                    </p>
                    <p
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#16a34a",
                        margin: 0,
                      }}
                    >
                      {selectedService.discount_percentage}%
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    background: "#16a34a",
                    color: "white",
                    borderRadius: 8,
                    padding: "9px",
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  إجمالي الوفر:{" "}
                  {(
                    (selectedService.price_before || 0) -
                    (selectedService.price_after || 0)
                  ).toLocaleString()}{" "}
                  DZD
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                {[
                  {
                    label: "المدة",
                    val: selectedService.duration || "—",
                    icon: "⏱",
                  },
                  {
                    label: "التقييم",
                    val: `${selectedService.rating || 0}/5 ⭐`,
                    icon: "⭐",
                  },
                  {
                    label: "الحجوزات",
                    val: `${selectedService.bookings_count || 0} حجز`,
                    icon: "👥",
                  },
                  {
                    label: "المزود",
                    val: selectedService.provider || "—",
                    icon: "🏢",
                  },
                ].map(({ label, val, icon }) => (
                  <div
                    key={label}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 9,
                      padding: "12px 14px",
                    }}
                  >
                    <p
                      style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}
                    >
                      {icon} {label}
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#1e293b",
                        margin: 0,
                        direction: "rtl",
                      }}
                    >
                      {val}
                    </p>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <button
                  onClick={() => openBook(selectedService)}
                  disabled={!selectedService.available}
                  style={{
                    padding: "14px",
                    borderRadius: 10,
                    border: "none",
                    cursor: selectedService.available
                      ? "pointer"
                      : "not-allowed",
                    background: selectedService.available
                      ? "linear-gradient(135deg,#4f46e5,#6366f1)"
                      : "#cbd5e1",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 15,
                  }}
                >
                  📩 Book Now
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "14px",
                    borderRadius: 10,
                    border: "2px solid #e2e8f0",
                    background: "white",
                    color: "#475569",
                    fontWeight: "bold",
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAT POPUP */}
      {showChat && chatService && (
        <ChatMiniPopup
          service={chatService}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ALGERIA MAP
// ─────────────────────────────────────────────────────────────────
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
      color: "#FFCC00",
      active: true,
    },
    {
      id: "supply",
      label: "سلاسل التوريد",
      icon: "🔗",
      color: "#00CCFF",
      active: true,
    },
    {
      id: "services",
      label: "الخدمات المشتركة",
      icon: "🏢",
      color: "#AAEEFF",
      active: true,
    },
    {
      id: "contracts",
      label: "فرص المناولة",
      icon: "📋",
      color: "#FF8800",
      active: false,
    },
  ]);
  const [search, setSearch] = useState("");
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
    const la = d.location?.lat ?? d.lat ?? d.latitude ?? null,
      lo = d.location?.lon ?? d.lon ?? d.lng ?? d.longitude ?? null;
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
  const d2p = (id, doc) => {
    const d = doc.data();
    if (id === "supply") {
      const ch = d.supply_chain || [];
      if (!ch.length) return null;
      const n = ch[0];
      const [la, lo] = rc(n);
      return {
        name: n.name || d.name_ar || d.name || doc.id,
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
      d.name || d.name_en || d.name_ar || d.title || d.project_name || doc.id;
    if (id === "services") {
      const sn =
        d.name || d.name_en || d.name_ar || d.title || d.service_name || doc.id;
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
    docs.forEach((doc) => {
      const d = doc.data();
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
    members: "#FFCC00",
    supply: "#00CCFF",
    services: "#AAEEFF",
    contracts: "#FF8800",
  };
  const LI = { members: "🏆", supply: "🔗", services: "🏢", contracts: "📋" };
  const NL = new Set(["supply", "contracts"]);

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
            opacity: 0.55,
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
        html: `<div style="position:relative;width:${sz}px;height:${sz}px"><div style="width:${sz}px;height:${sz}px;background:${color};border-radius:50%;box-shadow:0 0 ${pt.badge ? 12 : 7}px ${color},0 0 ${pt.badge ? 24 : 14}px ${color}60;"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${sz * 2.8}px;height:${sz * 2.8}px;border:1.5px solid ${color}70;border-radius:50%;animation:wm-ping-lyr 2s ease-out infinite;"></div></div>`,
        iconSize: [sz, sz],
        iconAnchor: [sz / 2, sz / 2],
      });
      const lines = [
        pt.company
          ? `<span style="opacity:.8;color:${color}">🏢 ${pt.company}</span>`
          : "",
        pt.category ? `<span style="opacity:.65">⚙ ${pt.category}</span>` : "",
        pt.wilaya ? `<span style="opacity:.6">📍 ${pt.wilaya}</span>` : "",
        pt.status ? `<span style="color:#88CCFF">◉ ${pt.status}</span>` : "",
        pt.funding ? `<span style="color:#00DD88">💵 ${pt.funding}</span>` : "",
        pt.value ? `<span style="color:#FF8800">${pt.value}</span>` : "",
        pt.score ? `<span style="color:#FFCC00">⭐ ${pt.score} pts</span>` : "",
        pt.badge
          ? `<span style="color:#FFCC00;font-weight:bold">🏆 CERTIFIED</span>`
          : "",
      ]
        .filter(Boolean)
        .join("<br/>");
      const tt = `<div style="font-family:monospace;font-size:10px;color:${color};background:rgba(2,9,18,0.95);border:1px solid ${color}50;padding:6px 10px;border-radius:3px;min-width:140px;line-height:1.7;"><div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;font-weight:bold;border-bottom:1px solid ${color}30;padding-bottom:3px;"><span>${ie}</span><span>${pt.name}</span></div>${lines}</div>`;
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
  const drawCL = (L, map) => {
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
            ln.setAttribute("stroke", "#FF8800");
            ln.setAttribute("stroke-width", "1.8");
            ln.setAttribute("stroke-opacity", "0.8");
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
      (/*err*/) => {
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
        zoom: 7,
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
              color: "#00FF88",
              weight: 2,
              opacity: 0.9,
              fillColor: "#00FF88",
              fillOpacity: 0.06,
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

  const filtered = layers.filter(
    (l) => l.label.includes(search) || search === "",
  );
  const activeCount = layers.filter((l) => l.active).length;
  const totalDocs = Object.values(dbCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <style>{`@keyframes wm-ping-lyr{0%{transform:translate(-50%,-50%) scale(1);opacity:.9}100%{transform:translate(-50%,-50%) scale(3.5);opacity:0}}@keyframes wm-blink-dot{0%,100%{opacity:1}50%{opacity:.15}}@keyframes wm-spin-map{to{transform:rotate(360deg)}}.leaflet-control-zoom a{background:#060f08!important;color:#00FF88!important;border:1px solid #1a3a2a!important;font-family:monospace!important}.leaflet-control-zoom a:hover{background:#003322!important}.leaflet-bar{border:1px solid #1a3a2a!important;box-shadow:none!important}.leaflet-control-attribution{background:rgba(2,9,18,0.75)!important;color:#1a4a5a!important;font-size:7px!important;font-family:monospace!important}.leaflet-control-attribution a{color:#00FF88!important}.leaflet-tile{filter:hue-rotate(75deg) saturate(0.25) brightness(0.85)}.wm-tt{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important}.wm-tt::before{display:none!important}`}</style>
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        <div
          style={{
            width: 210,
            flexShrink: 0,
            background: "rgba(2,9,18,0.97)",
            borderRight: "1px solid #0a2540",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 10px 8px",
              borderBottom: "1px solid #0a2540",
              background: "#020912",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 8,
                color: "#00CCFF",
                letterSpacing: 2,
                marginBottom: 7,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#00CCFF",
                    display: "inline-block",
                    boxShadow: "0 0 5px #00CCFF",
                    animation: "wm-blink-dot 1.4s ease-in-out infinite",
                  }}
                />
                LAYER CONTROL
              </div>
              <div
                style={{
                  background: "#001a33",
                  border: "1px solid #0a2540",
                  borderRadius: 2,
                  padding: "1px 6px",
                  fontSize: 7,
                  letterSpacing: 1,
                  color: totalDocs > 0 ? "#00AA88" : "#334455",
                }}
              >
                {totalDocs > 0 ? `⬤ ${totalDocs} DOCS` : "FALLBACK"}
              </div>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في الطبقات..."
              style={{
                width: "100%",
                background: "#030d18",
                border: "1px solid #0a2540",
                color: "#00CCFF",
                padding: "5px 8px",
                fontSize: 10,
                borderRadius: 2,
                fontFamily: "monospace",
                outline: "none",
                boxSizing: "border-box",
                direction: "rtl",
              }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map((layer) => {
              const isLoad = loadingLayers.has(layer.id);
              const cnt = dbCounts[layer.id];
              const hasReal = cnt !== undefined && cnt > 0;
              return (
                <div
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 10px",
                    borderBottom: "1px solid #06121e",
                    cursor: "pointer",
                    background: layer.active
                      ? `${layer.color}08`
                      : "transparent",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = `${layer.color}12`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = layer.active
                      ? `${layer.color}08`
                      : "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>
                      {layer.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 9,
                          color: layer.active ? layer.color : "#224455",
                          letterSpacing: 0.5,
                          direction: "rtl",
                          lineHeight: 1.3,
                        }}
                      >
                        {layer.label}
                      </div>
                      <div
                        style={{
                          fontSize: 7,
                          fontFamily: "monospace",
                          letterSpacing: 1,
                          marginTop: 1,
                          color: hasReal ? "#00AA88" : "#334455",
                        }}
                      >
                        {isLoad
                          ? "⟳ جاري التحميل..."
                          : hasReal
                            ? `● ${cnt} سجل حي`
                            : "○ بيانات نموذجية"}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: 17,
                      height: 17,
                      flexShrink: 0,
                      border: `1px solid ${layer.active ? layer.color : "#0a2540"}`,
                      borderRadius: 2,
                      background: layer.active
                        ? `${layer.color}22`
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .15s",
                    }}
                  >
                    {isLoad ? (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          border: `1.5px solid ${layer.color}`,
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "wm-spin-map .7s linear infinite",
                        }}
                      />
                    ) : layer.active ? (
                      <span
                        style={{
                          color: layer.color,
                          fontSize: 10,
                          lineHeight: 1,
                        }}
                      >
                        ✓
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              padding: "8px 10px",
              borderTop: "1px solid #0a2540",
              background: "#020912",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 7,
                color: "#0a3a50",
                letterSpacing: 2,
                marginBottom: 5,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>دليل الرموز</span>
              <span style={{ color: "#224455" }}>{activeCount} نشط</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {layers
                .filter((l) => l.active)
                .map((l) => (
                  <div
                    key={l.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      background: `${l.color}15`,
                      border: `1px solid ${l.color}40`,
                      borderRadius: 2,
                      padding: "2px 5px",
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: l.color,
                        boxShadow: `0 0 4px ${l.color}`,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 7,
                        color: l.color,
                      }}
                    >
                      {l.icon}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(2,9,18,0.9)",
              border: "1px solid #0a2540",
              padding: "4px 10px",
              borderRadius: 3,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00FF88",
                boxShadow: "0 0 5px #00FF88",
                display: "inline-block",
                animation: "wm-blink-dot 1.4s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "#00FF88",
                letterSpacing: 3,
              }}
            >
              ALGERIA — LIVE MAP
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 44,
              zIndex: 1000,
              display: "flex",
              gap: 6,
            }}
          >
            <div
              style={{
                background: "rgba(2,9,18,0.9)",
                border: "1px solid #0a2540",
                padding: "3px 8px",
                borderRadius: 3,
                fontFamily: "monospace",
                fontSize: 8,
                color: "#336677",
                letterSpacing: 1,
              }}
            >
              {activeCount} LAYERS
            </div>
            {totalDocs > 0 && (
              <div
                style={{
                  background: "rgba(0,30,20,0.9)",
                  border: "1px solid #004422",
                  padding: "3px 8px",
                  borderRadius: 3,
                  fontFamily: "monospace",
                  fontSize: 8,
                  color: "#00AA66",
                  letterSpacing: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#00AA66",
                    boxShadow: "0 0 4px #00AA66",
                    animation: "wm-blink-dot 1s ease-in-out infinite",
                  }}
                />
                FIREBASE LIVE
              </div>
            )}
          </div>
          <div
            ref={mapRef}
            style={{ width: "100%", height: "100%" }}
          />
          <svg
            ref={svgRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              display: "none",
              zIndex: 500,
            }}
            xmlns="http://www.w3.org/2000/svg"
          />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────────
export default function QualityBadge() {
  const [mapPct, setMapPct] = useState(40);
  const [leftVideoPct, setLeftVideoPct] = useState(30);
  const isDragging = useRef(false);
  const isDraggingLeft = useRef(false);
  const rightColRef = useRef(null);
  const leftColRef = useRef(null);

  const onResizerMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  }, []);
  const onLeftResizerMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingLeft.current = true;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current || !rightColRef.current) return;
      const rect = rightColRef.current.getBoundingClientRect();
      setMapPct(
        Math.max(
          15,
          Math.min(80, ((e.clientY - rect.top) / rect.height) * 100),
        ),
      );
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    const onMoveL = (e) => {
      if (!isDraggingLeft.current || !leftColRef.current) return;
      const rect = leftColRef.current.getBoundingClientRect();
      setLeftVideoPct(
        Math.max(
          15,
          Math.min(75, ((e.clientY - rect.top) / rect.height) * 100),
        ),
      );
    };
    const onUpL = () => {
      isDraggingLeft.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMoveL);
    window.addEventListener("mouseup", onUpL);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMoveL);
      window.removeEventListener("mouseup", onUpL);
    };
  }, []);

  const { isLoading } = useQuery({
    queryKey: ["certified-projects"],
    queryFn: async () => {
      const snap = await getDocs(
        query(collection(db, "projects"), where("quality_badge", "==", true)),
      );
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  const privileges = [
    {
      id: "supply-chain",
      title: "Shared Supply Chains",
      description:
        "Access to a network of trusted suppliers and shared logistics services at preferential rates.",
      icon: Network,
      accent: "#00FFFF",
      accentDim: "#001a33",
      link: "/consortium/supply-chain",
    },
    {
      id: "shared-services",
      title: "Shared Services",
      description:
        "Benefit from shared services: Accounting, Legal, Marketing, and HR.",
      icon: Building2,
      accent: "#AAEEFF",
      accentDim: "#001a2e",
      link: "/consortium/services",
    },
    {
      id: "voting",
      title: "Decision Making",
      description:
        "The right to participate in strategic decisions within the consortium.",
      icon: Vote,
      accent: "#FFCC00",
      accentDim: "#2a2200",
      link: "/decision-making",
    },
    {
      id: "funding-priority",
      title: "Funding Priority",
      description:
        "Projects with the badge receive priority for funding and support opportunities.",
      icon: TrendingUp,
      accent: "#00CCFF",
      accentDim: "#001e2a",
      link: "/funding-priority",
    },
    {
      id: "credibility",
      title: "Enhanced Credibility",
      description:
        "Official recognition increases the confidence of investors and partners.",
      icon: Shield,
      accent: "#88EEFF",
      accentDim: "#001a2e",
      link: "/enhanced-credibility",
    },
    {
      id: "contracts",
      title: "Subcontracting Opportunities",
      description:
        "Collaboration with other enterprises on subcontracting projects and contracts.",
      icon: FileText,
      accent: "#00FFFF",
      accentDim: "#001a33",
      link: "/subcontracting",
    },
  ];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;}
    .wm{height:100vh;background:#020912;color:#00DDFF;font-family:'Share Tech Mono',monospace;padding-top:64px;display:flex;flex-direction:column;overflow:hidden;position:relative;}
    .wm::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background-image:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,180,255,.015) 2px,rgba(0,180,255,.015) 4px);}
    .wm::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(0,180,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,255,.03) 1px,transparent 1px);background-size:40px 40px;}
    .wm-split{flex:1;min-height:0;display:grid;grid-template-columns:30% 70%;overflow:hidden;position:relative;z-index:1;}
    .wm-left{display:flex;flex-direction:column;padding:0;border-right:1px solid #0a2540;overflow:hidden;min-height:0;}
    .wm-right{display:flex;flex-direction:column;overflow:hidden;min-height:0;}
    .wm-map-zone{flex-shrink:0;overflow:hidden;position:relative;}
    .wm-resizer{flex-shrink:0;height:10px;cursor:ns-resize;position:relative;z-index:500;display:flex;align-items:center;justify-content:center;background:linear-gradient(90deg,transparent,#00CCFF44 30%,#00CCFF88 50%,#00CCFF44 70%,transparent);border-top:1px solid #00CCFF33;border-bottom:1px solid #00CCFF33;transition:background .15s;user-select:none;}
    .wm-resizer:hover{background:linear-gradient(90deg,transparent,#00CCFF66 30%,#00CCFFBB 50%,#00CCFF66 70%,transparent);}
    .wm-resizer-dot{width:3px;height:3px;border-radius:50%;background:#00CCFF;box-shadow:0 0 4px #00CCFF;}
    .wm-resizer-pct{position:absolute;right:10px;font-family:monospace;font-size:7px;color:#00CCFF99;letter-spacing:1px;pointer-events:none;}
    .wm-cards-zone{flex:1;min-height:0;overflow-y:auto;background:#020912;position:relative;padding:16px 18px;display:flex;flex-direction:column;gap:14px;}
    .wm-cards-zone::-webkit-scrollbar{width:3px;}.wm-cards-zone::-webkit-scrollbar-thumb{background:#0a3a50;}
    .wm-cards-zone::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(rgba(0,180,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,255,.022) 1px,transparent 1px);background-size:20px 20px;}
    .wm-hdr{border:1px solid #00FFFF;border-radius:5px;padding:8px 12px;background:#03101e;position:relative;overflow:hidden;}
    .wm-hdr::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,rgba(0,220,255,.06) 0%,transparent 60%);}
    .wm-hc{position:absolute;width:13px;height:13px;border-color:#00FFFF;border-style:solid;}
    .wm-hc.tl{top:5px;left:5px;border-width:2px 0 0 2px}.wm-hc.tr{top:5px;right:5px;border-width:2px 2px 0 0}.wm-hc.bl{bottom:5px;left:5px;border-width:0 0 2px 2px}.wm-hc.br{bottom:5px;right:5px;border-width:0 2px 2px 0}
    .wm-hdr-in{display:flex;align-items:center;gap:8px;}
    .wm-hdr-ico{border:1px solid #00FFFF;border-radius:5px;display:flex;align-items:center;justify-content:center;background:rgba(0,220,255,.07);flex-shrink:0;}
    .wm-hdr-lbl{font-size:7px;color:#00FFFF;letter-spacing:3px;display:flex;align-items:center;gap:5px;margin:0;}
    .wm-sec{display:flex;align-items:center;gap:8px;font-size:9px;color:#00FFFF;letter-spacing:3px;flex-shrink:0;}
    .wm-sec::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#0a3a50,transparent);}
    .wm-pg{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
    .wm-pc{display:block;text-decoration:none;background:#03101e;border:1px solid #0a2540;border-radius:10px;padding:20px 18px;transition:border-color .2s,transform .2s,box-shadow .2s;position:relative;overflow:hidden;}
    .wm-pc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--ac);opacity:0;transition:opacity .2s;}
    .wm-pc:hover{border-color:var(--ac);transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,220,255,.12);}
    .wm-pc:hover::before{opacity:1;}.wm-pc:hover .wm-pa{opacity:1;transform:translateX(0);}
    .wm-pi{width:46px;height:46px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;border:1px solid var(--ac);background:var(--acd);}
    .wm-pt{font-family:'Orbitron',monospace;font-size:11px;font-weight:700;color:#00FFFF;letter-spacing:1px;margin:0 0 8px;display:flex;align-items:center;justify-content:space-between;line-height:1.4;}
    .wm-pa{opacity:0;transform:translateX(-5px);transition:all .2s;}
    .wm-pd{font-size:10px;color:#3a7a99;line-height:1.7;margin:0 0 14px;}
    .wm-pf{border-top:1px solid #0a2540;padding-top:10px;display:flex;align-items:center;gap:5px;font-size:9px;color:#00AADD;letter-spacing:1px;}
    @keyframes wm-blink{0%,100%{opacity:1}50%{opacity:.2}}
    .wm-dot{width:6px;height:6px;border-radius:50%;background:#00CCFF;display:inline-block;flex-shrink:0;animation:wm-blink 1.4s ease-in-out infinite;box-shadow:0 0 5px rgba(0,220,255,.8);}
    .wm-loading{height:100vh;background:#020912;display:flex;align-items:center;justify-content:center;}
    @keyframes wm-spin-pg{to{transform:rotate(360deg);}}
    .wm-spin{width:34px;height:34px;border:2px solid #0a2540;border-top-color:#00FFFF;border-radius:50%;animation:wm-spin-pg .8s linear infinite;}
  `;

  if (isLoading)
    return (
      <>
        <style>{css}</style>
        <div className="wm-loading">
          <div className="wm-spin" />
        </div>
      </>
    );

  return (
    <>
      <style>{css}</style>
      <div
        className="wm"
        dir="ltr"
      >
        <div className="wm-split">
          {/* LEFT COLUMN */}
          <div
            className="wm-left"
            ref={leftColRef}
          >
            {/* video placeholder */}
            <div
              style={{
                height: `${leftVideoPct}%`,
                flexShrink: 0,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <LiveTVPanel />
            </div>
            {/* left resizer */}
            <div
              onMouseDown={onLeftResizerMouseDown}
              style={{
                height: 8,
                flexShrink: 0,
                cursor: "ns-resize",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(90deg,transparent,#00CCFF33 30%,#00CCFF66 50%,#00CCFF33 70%,transparent)",
                borderTop: "1px solid #00CCFF22",
                borderBottom: "1px solid #00CCFF22",
                userSelect: "none",
                position: "relative",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", gap: 3, pointerEvents: "none" }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      background: "#00CCFF",
                      opacity:
                        i === 0 || i === 4 ? 0.3 : i === 1 || i === 3 ? 0.6 : 1,
                      boxShadow: "0 0 3px #00CCFF",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  fontSize: 7,
                  color: "#00CCFF99",
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  pointerEvents: "none",
                }}
              >
                ↕ {Math.round(leftVideoPct)}% ╱ {Math.round(100 - leftVideoPct)}
                %
              </span>
            </div>
            {/* header */}
            <div style={{ flexShrink: 0, padding: "5px 8px" }}>
              <div className="wm-hdr">
                <div className="wm-hc tl" />
                <div className="wm-hc tr" />
                <div className="wm-hc bl" />
                <div className="wm-hc br" />
                <div className="wm-hdr-in">
                  <div
                    className="wm-hdr-ico"
                    style={{ width: 26, height: 26 }}
                  >
                    <Award
                      size={14}
                      color="#00FFFF"
                    />
                  </div>
                  <div className="wm-hdr-lbl">
                    <span className="wm-dot" />
                    CONSORTIUM — QUALITY CERTIFICATION SYSTEM
                  </div>
                </div>
              </div>
            </div>
            {/* tabs panel */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                padding: "3px 5px 5px",
              }}
            >
              <LeftTabsPanel />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div
            className="wm-right"
            ref={rightColRef}
          >
            {/* map */}
            <div
              className="wm-map-zone"
              style={{ height: `${mapPct}%` }}
            >
              <AlgeriaMap />
            </div>
            {/* right resizer */}
            <div
              className="wm-resizer"
              onMouseDown={onResizerMouseDown}
            >
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="wm-resizer-dot"
                    style={{
                      opacity:
                        i === 0 || i === 5 ? 0.3 : i === 1 || i === 4 ? 0.6 : 1,
                    }}
                  />
                ))}
              </div>
              <div className="wm-resizer-pct">
                ↕ {Math.round(mapPct)}% ╱ {Math.round(100 - mapPct)}%
              </div>
            </div>
            {/* privilege cards */}
            <div className="wm-cards-zone">
              <div className="wm-sec">
                <span className="wm-dot" />
                <span>06 PRIVILEGES — ACTIVE</span>
              </div>
              <div className="wm-pg">
                {privileges.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link
                      key={p.id}
                      to={p.link}
                      className="wm-pc"
                      style={{ "--ac": p.accent, "--acd": p.accentDim }}
                    >
                      <div className="wm-pi">
                        <Icon
                          size={22}
                          color={p.accent}
                        />
                      </div>
                      <div className="wm-pt">
                        <span>{p.title}</span>
                        <ArrowRight
                          size={13}
                          color={p.accent}
                          className="wm-pa"
                        />
                      </div>
                      <p className="wm-pd">{p.description}</p>
                      <div className="wm-pf">
                        <ArrowRight
                          size={9}
                          color="#00AADD"
                        />
                        <span>ACCESS MODULE</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
