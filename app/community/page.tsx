// app/community/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  collection, addDoc, getDocs, query, where, orderBy,
  updateDoc, doc, arrayUnion, serverTimestamp, getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";

// ── Types ─────────────────────────────────────────────────────────────────────
type WarningType = "phishing_site" | "scam_call" | "phishing_email" | "social_media" | "story" | "suspicious_link";

interface Warning {
  id: string;
  type: WarningType;
  title: string;
  content: string;
  detail?: string;
  displayName: string;
  locale: string;
  upvotes: number;
  upvotedBy: string[];
  createdAt: { toDate: () => Date } | null;
}

// ── Config ────────────────────────────────────────────────────────────────────
const WARNING_TYPES: Record<WarningType, { icon: string; label: string; labelAr: string; color: string; bg: string; detailLabel: string; detailLabelAr: string; placeholder: string; placeholderAr: string }> = {
  phishing_site:  { icon:"🎣", label:"Phishing Website",    labelAr:"موقع تصيد",             color:"#c5253a", bg:"rgba(197,37,58,0.08)",    detailLabel:"Website URL",     detailLabelAr:"رابط الموقع",      placeholder:"e.g. qnb-secure.net",       placeholderAr:"مثال: qnb-secure.net" },
  scam_call:      { icon:"📞", label:"Scam Call / SMS",     labelAr:"مكالمة/رسالة احتيالية", color:"#d4882a", bg:"rgba(212,136,42,0.08)",   detailLabel:"Phone Number",    detailLabelAr:"رقم الهاتف",       placeholder:"e.g. +974 XXXX XXXX",      placeholderAr:"مثال: +974 XXXX XXXX" },
  phishing_email: { icon:"📧", label:"Phishing Email",      labelAr:"بريد تصيد احتيالي",     color:"#4b7bec", bg:"rgba(75,123,236,0.08)",   detailLabel:"Sender Email",    detailLabelAr:"بريد المُرسِل",    placeholder:"e.g. support@qnb-help.com", placeholderAr:"مثال: support@qnb-help.com" },
  social_media:   { icon:"💬", label:"Social Media Scam",   labelAr:"احتيال على التواصل",    color:"#7b68ee", bg:"rgba(123,104,238,0.08)",  detailLabel:"Account / Handle",detailLabelAr:"حساب المحتال",     placeholder:"e.g. @fake_qatar_support",  placeholderAr:"مثال: @fake_qatar_support" },
  story:          { icon:"📖", label:"Story / Lesson",      labelAr:"قصة وعبرة",             color:"#22a05a", bg:"rgba(34,160,90,0.08)",    detailLabel:"",                detailLabelAr:"",                 placeholder:"",                          placeholderAr:"" },
  suspicious_link:{ icon:"🔗", label:"Suspicious Link",     labelAr:"رابط مشبوه",            color:"#f59e0b", bg:"rgba(245,158,11,0.08)",   detailLabel:"The Link",        detailLabelAr:"الرابط المشبوه",   placeholder:"e.g. bit.ly/win-iphone",    placeholderAr:"مثال: bit.ly/win-iphone" },
};

// ── Formatters ────────────────────────────────────────────────────────────────
const timeAgo = (date: Date, locale: string): string => {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (locale === "ar") {
    if (days > 30) return `منذ ${Math.floor(days/30)} شهر`;
    if (days > 0)  return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    return `منذ ${mins} دقيقة`;
  }
  if (days > 30)  return `${Math.floor(days/30)}mo ago`;
  if (days > 0)   return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  return `${mins}m ago`;
};

// ── Warning Card ──────────────────────────────────────────────────────────────
function WarningCard({ w, userId, locale, onUpvote }: { w: Warning; userId: string | null; locale: string; onUpvote: (id: string) => void }) {
  const cfg = WARNING_TYPES[w.type];
  const hasUpvoted = userId ? w.upvotedBy?.includes(userId) : false;
  const isAr = locale === "ar";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: `1px solid rgba(99,32,36,0.1)`,
      boxShadow: "0 4px 24px rgba(99,32,36,0.07)",
      padding: "1.4rem 1.5rem",
      display: "flex", flexDirection: "column", gap: "0.75rem",
      transition: "transform 0.2s, box-shadow 0.2s",
      position: "relative", overflow: "hidden",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(99,32,36,0.12)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(99,32,36,0.07)"; }}
    >
      {/* Top colour strip */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${cfg.color}, ${cfg.color}40)` }} />

      {/* Type badge + time */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:cfg.bg, color:cfg.color, letterSpacing:"0.05em" }}>
          {cfg.icon} {isAr ? cfg.labelAr : cfg.label}
        </span>
        <span style={{ fontSize:11, color:"rgba(99,32,36,0.4)", fontFamily:"'Cinzel', serif", letterSpacing:"0.08em" }}>
          {w.createdAt ? timeAgo(w.createdAt.toDate(), locale) : ""}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontFamily:"'Cinzel', serif", fontSize:"0.95rem", fontWeight:700, color:"#3e1316", lineHeight:1.4, margin:0 }}>{w.title}</h3>

      {/* Content */}
      <p style={{ fontFamily:"'Crimson Pro', Georgia, serif", fontSize:"0.95rem", color:"#5C4033", lineHeight:1.7, margin:0 }}>{w.content}</p>

      {/* Detail (URL / phone / etc.) */}
      {w.detail && (
        <div style={{ background:"rgba(99,32,36,0.04)", borderRadius:8, padding:"8px 12px", border:"1px solid rgba(99,32,36,0.1)", fontFamily:"monospace", fontSize:12, color:cfg.color, wordBreak:"break-all" }}>
          {cfg.icon} {w.detail}
        </div>
      )}

      {/* Footer */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
        <span style={{ fontSize:11, color:"rgba(99,32,36,0.4)", fontFamily:"'Cinzel', serif", letterSpacing:"0.06em" }}>
          {isAr ? "عضو مجتمعي" : w.displayName || "Community Member"}
        </span>
        <button
          onClick={() => userId && onUpvote(w.id)}
          title={isAr ? "مفيد" : "Helpful"}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, border:`1px solid ${hasUpvoted ? cfg.color : "rgba(99,32,36,0.15)"}`, background: hasUpvoted ? cfg.bg : "transparent", color: hasUpvoted ? cfg.color : "rgba(99,32,36,0.5)", fontSize:12, fontWeight:700, cursor: userId ? "pointer" : "default", transition:"all .2s" }}
        >
          ▲ {w.upvotes || 0} {isAr ? "مفيد" : "helpful"}
        </button>
      </div>
    </div>
  );
}

// ── Submit Modal ──────────────────────────────────────────────────────────────
function SubmitModal({ onClose, userId, locale }: { onClose: () => void; userId: string | null; locale: string }) {
  const isAr = locale === "ar";
  const [step, setStep] = useState<"type" | "form" | "done">("type");
  const [type, setType] = useState<WarningType | null>(null);
  const [form, setForm] = useState({ title:"", content:"", detail:"", anonymous: true });
  const [loading, setLoading] = useState(false);

  const cfg = type ? WARNING_TYPES[type] : null;

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "communityWarnings"), {
        type, title: form.title, content: form.content,
        detail: form.detail || null,
        displayName: form.anonymous ? null : "Member",
        userId: userId || null,
        locale,
        status: "pending",
        upvotes: 0,
        upvotedBy: [],
        createdAt: serverTimestamp(),
      });
      setStep("done");
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9998, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#faf6f1", borderRadius:24, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(62,19,22,0.35)", border:"1px solid rgba(197,165,126,0.2)", position:"relative" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#3e1316,#632024)", padding:"1.4rem 1.6rem", borderRadius:"24px 24px 0 0", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#c5a57e,rgba(197,165,126,0.2))" }} />
          <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontFamily:"'Cinzel', serif", fontSize:"0.6rem", letterSpacing:"0.3em", color:"rgba(197,165,126,0.7)", textTransform:"uppercase", marginBottom:6 }}>
                {isAr ? "تحذير مجتمعي" : "Community Warning"}
              </div>
              <h2 style={{ fontFamily:"'Cinzel', serif", fontSize:"1.2rem", color:"#E8D4BC", fontWeight:700, margin:0 }}>
                {isAr ? "شارك تجربتك" : "Share Your Experience"}
              </h2>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(232,212,188,0.7)", fontSize:18, width:32, height:32, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        </div>

        <div style={{ padding:"1.6rem" }}>
          {/* STEP 1: Choose type */}
          {step === "type" && (
            <div>
              <p style={{ fontFamily:"'Crimson Pro', serif", fontSize:"1rem", color:"#5C4033", fontStyle:"italic", marginBottom:"1.2rem", lineHeight:1.6 }}>
                {isAr ? "ما نوع التحذير الذي تريد مشاركته؟" : "What kind of warning would you like to share?"}
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.7rem" }}>
                {(Object.entries(WARNING_TYPES) as [WarningType, typeof WARNING_TYPES[WarningType]][]).map(([key, cfg]) => (
                  <button key={key} onClick={() => { setType(key); setStep("form"); }}
                    style={{ padding:"1rem", borderRadius:14, border:`1.5px solid ${type===key ? cfg.color : "rgba(99,32,36,0.15)"}`, background: type===key ? cfg.bg : "white", cursor:"pointer", textAlign:"center", transition:"all .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = cfg.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = type===key ? cfg.color : "rgba(99,32,36,0.15)")}
                  >
                    <div style={{ fontSize:22, marginBottom:4 }}>{cfg.icon}</div>
                    <div style={{ fontFamily:"'Cinzel', serif", fontSize:"0.65rem", letterSpacing:"0.08em", color:cfg.color, fontWeight:700 }}>
                      {isAr ? cfg.labelAr : cfg.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Form */}
          {step === "form" && cfg && (
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:cfg.bg, borderRadius:10, border:`1px solid ${cfg.color}30` }}>
                <span style={{ fontSize:16 }}>{cfg.icon}</span>
                <span style={{ fontFamily:"'Cinzel', serif", fontSize:"0.7rem", letterSpacing:"0.1em", color:cfg.color, fontWeight:700 }}>{isAr ? cfg.labelAr : cfg.label}</span>
                <button onClick={() => setStep("type")} style={{ marginLeft:"auto", background:"none", border:"none", color:"rgba(99,32,36,0.4)", fontSize:11, cursor:"pointer", fontFamily:"'Cinzel', serif", letterSpacing:"0.1em" }}>
                  {isAr ? "تغيير" : "change"}
                </button>
              </div>

              {/* Title */}
              <div>
                <label style={{ fontFamily:"'Cinzel', serif", fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(99,32,36,0.5)", display:"block", marginBottom:6 }}>
                  {isAr ? "عنوان قصير" : "Short Title"} *
                </label>
                <input value={form.title} onChange={e => setForm(f=>({...f, title:e.target.value}))}
                  placeholder={isAr ? "مثال: موقع بنك قطر الوطني المزيف" : "e.g. Fake QNB login page"}
                  style={{ width:"100%", padding:"0.75rem 1rem", borderRadius:10, border:"1.5px solid rgba(99,32,36,0.2)", fontFamily:"'Crimson Pro', serif", fontSize:"0.95rem", color:"#3e1316", background:"white", outline:"none", boxSizing:"border-box" }}
                  onFocus={e => (e.target.style.borderColor = cfg.color)}
                  onBlur={e => (e.target.style.borderColor = "rgba(99,32,36,0.2)")}
                />
              </div>

              {/* Detail (URL/phone/etc.) */}
              {cfg.detailLabel && (
                <div>
                  <label style={{ fontFamily:"'Cinzel', serif", fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(99,32,36,0.5)", display:"block", marginBottom:6 }}>
                    {isAr ? cfg.detailLabelAr : cfg.detailLabel}
                  </label>
                  <input value={form.detail} onChange={e => setForm(f=>({...f, detail:e.target.value}))}
                    placeholder={isAr ? cfg.placeholderAr : cfg.placeholder}
                    style={{ width:"100%", padding:"0.75rem 1rem", borderRadius:10, border:"1.5px solid rgba(99,32,36,0.2)", fontFamily:"monospace", fontSize:"0.85rem", color:cfg.color, background:"white", outline:"none", boxSizing:"border-box" }}
                    onFocus={e => (e.target.style.borderColor = cfg.color)}
                    onBlur={e => (e.target.style.borderColor = "rgba(99,32,36,0.2)")}
                  />
                </div>
              )}

              {/* Story / Content */}
              <div>
                <label style={{ fontFamily:"'Cinzel', serif", fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(99,32,36,0.5)", display:"block", marginBottom:6 }}>
                  {isAr ? "قصتك / تفاصيل ما حدث" : "Your Story / What Happened"} *
                </label>
                <textarea value={form.content} onChange={e => setForm(f=>({...f, content:e.target.value}))} rows={4}
                  placeholder={isAr ? "شارك ما حدث معك لتحذير الآخرين..." : "Share what happened so others can stay safe..."}
                  style={{ width:"100%", padding:"0.75rem 1rem", borderRadius:10, border:"1.5px solid rgba(99,32,36,0.2)", fontFamily:"'Crimson Pro', serif", fontSize:"0.95rem", color:"#3e1316", background:"white", outline:"none", resize:"vertical", lineHeight:1.6, boxSizing:"border-box" }}
                  onFocus={e => (e.target.style.borderColor = cfg.color)}
                  onBlur={e => (e.target.style.borderColor = "rgba(99,32,36,0.2)")}
                />
              </div>

              {/* Anonymous toggle */}
              <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                <div style={{ position:"relative", width:40, height:22 }}>
                  <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f=>({...f, anonymous:e.target.checked}))} style={{ opacity:0, position:"absolute", inset:0, cursor:"pointer" }} />
                  <div style={{ position:"absolute", inset:0, borderRadius:11, background: form.anonymous ? "#632024" : "rgba(99,32,36,0.15)", transition:"background .2s" }} />
                  <div style={{ position:"absolute", top:3, left: form.anonymous ? "calc(100% - 19px)" : 3, width:16, height:16, borderRadius:"50%", background:"white", transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
                </div>
                <span style={{ fontFamily:"'Crimson Pro', serif", fontSize:"0.9rem", color:"#5C4033" }}>
                  {isAr ? "نشر بشكل مجهول" : "Post anonymously"}
                </span>
              </label>

              {/* Notice */}
              <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:10, padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:14, flexShrink:0 }}>ⓘ</span>
                <p style={{ fontFamily:"'Crimson Pro', serif", fontSize:"0.85rem", color:"#92650a", lineHeight:1.6, margin:0 }}>
                  {isAr
                    ? "سيتم مراجعة تحذيرك من قِبَل فريقنا قبل نشره للحفاظ على جودة ودقة المحتوى."
                    : "Your submission will be reviewed by our team before publishing to ensure accuracy and community safety."}
                </p>
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={!form.title || !form.content || loading}
                style={{ padding:"0.9rem 2rem", borderRadius:12, border:"none", background: (form.title && form.content) ? "linear-gradient(135deg,#3e1316,#632024)" : "rgba(99,32,36,0.1)", color: (form.title && form.content) ? "#E8D4BC" : "rgba(99,32,36,0.3)", fontFamily:"'Cinzel', serif", fontSize:"0.7rem", letterSpacing:"0.15em", textTransform:"uppercase", fontWeight:700, cursor:(form.title && form.content) ? "pointer" : "not-allowed", boxShadow:(form.title && form.content) ? "0 4px 20px rgba(99,32,36,0.25)" : "none", transition:"all .2s" }}>
                {loading ? (isAr ? "جارٍ الإرسال..." : "Submitting...") : (isAr ? "إرسال للمراجعة ←" : "Submit for Review →")}
              </button>
            </div>
          )}

          {/* STEP 3: Done */}
          {step === "done" && (
            <div style={{ textAlign:"center", padding:"1.5rem 0" }}>
              <div style={{ fontSize:52, marginBottom:12 }}>🛡</div>
              <h3 style={{ fontFamily:"'Cinzel', serif", fontSize:"1.1rem", color:"#3e1316", marginBottom:8 }}>
                {isAr ? "شكراً لك!" : "Thank You!"}
              </h3>
              <p style={{ fontFamily:"'Crimson Pro', serif", fontSize:"1rem", color:"#5C4033", lineHeight:1.7, maxWidth:360, margin:"0 auto 1.4rem" }}>
                {isAr
                  ? "تم استلام تحذيرك. سيراجعه فريقنا ويُنشَر قريباً إذا استوفى معايير المجتمع."
                  : "Your warning has been received. Our team will review it and publish it shortly if it meets community guidelines."}
              </p>
              <div style={{ background:"rgba(34,160,90,0.08)", border:"1px solid rgba(34,160,90,0.25)", borderRadius:12, padding:"10px 16px", fontSize:"0.9rem", color:"#22a05a", fontFamily:"'Crimson Pro', serif", marginBottom:"1.2rem" }}>
                {isAr ? "مساهمتك قد تحمي شخصاً آخر اليوم." : "Your submission may protect someone in your community today."}
              </div>
              <button onClick={onClose} style={{ padding:"0.8rem 2rem", borderRadius:10, border:"1px solid rgba(99,32,36,0.2)", background:"transparent", fontFamily:"'Cinzel', serif", fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#632024", cursor:"pointer" }}>
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [filter, setFilter] = useState<WarningType | "all">("all");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  // Load warnings
  const loadWarnings = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "communityWarnings"),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setWarnings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Warning)));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadWarnings(); }, [loadWarnings]);

  // Upvote
  const handleUpvote = async (id: string) => {
    if (!userId) return;
    const ref = doc(db, "communityWarnings", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const upvotedBy: string[] = data.upvotedBy || [];
    const hasVoted = upvotedBy.includes(userId);
    await updateDoc(ref, {
      upvotes: (data.upvotes || 0) + (hasVoted ? -1 : 1),
      upvotedBy: hasVoted ? upvotedBy.filter((u: string) => u !== userId) : arrayUnion(userId),
    });
    loadWarnings();
  };

  // Filtered + searched
  const filtered = warnings.filter(w => {
    const matchType = filter === "all" || w.type === filter;
    const q = searchQ.toLowerCase();
    const matchSearch = !q || w.title.toLowerCase().includes(q) || w.content.toLowerCase().includes(q) || (w.detail || "").toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const typeCount = (t: WarningType) => warnings.filter(w => w.type === t).length;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#fdf8f4,#f7ede2)", fontFamily:"'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet" />

      {/* ── Hero ── */}
      <div style={{ background:"linear-gradient(135deg,#3e1316 0%,#632024 55%,#7a1e22 100%)", padding:"3.5rem 2rem 4rem", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", bottom:-60, left:-60, width:200, height:200, borderRadius:"50%", background:"rgba(197,165,126,0.06)", border:"1px solid rgba(197,165,126,0.1)" }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#c5a57e,rgba(197,165,126,0.2))" }} />
        <div style={{ maxWidth:780, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ fontFamily:"'Cinzel', serif", fontSize:"0.6rem", letterSpacing:"0.35em", textTransform:"uppercase", color:"rgba(197,165,126,0.65)", marginBottom:14 }}>
            {isAr ? "مجتمع سايبرمجلس" : "CyberMajlis Community"}
          </div>
          <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", color:"#E8D4BC", fontWeight:700, lineHeight:1.25, margin:"0 0 1rem" }}>
            {isAr ? "حذّر مجتمعك" : "Warn Your Community"}
          </h1>
          <div style={{ width:56, height:2, background:"linear-gradient(90deg,#c5a57e,transparent)", marginBottom:"1rem" }} />
          <p style={{ fontFamily:"'Crimson Pro', serif", fontSize:"clamp(1rem,2vw,1.15rem)", color:"rgba(232,212,188,0.8)", lineHeight:1.8, maxWidth:560, fontWeight:300 }}>
            {isAr
              ? "المواقع المزيفة، الأرقام الاحتيالية، القصص الحقيقية — شارك تجربتك لحماية الآخرين. التحذير الواحد قد ينقذ أحداً من عائلتك."
              : "Fake websites, scam numbers, real stories — share your experience to protect others. One warning can save someone in your community."}
          </p>
          <div style={{ display:"flex", gap:"1rem", marginTop:"1.6rem", flexWrap:"wrap" }}>
            <button onClick={() => setShowSubmit(true)} style={{ padding:"0.9rem 2rem", borderRadius:12, border:"none", background:"#c5a57e", color:"#3e1316", fontFamily:"'Cinzel', serif", fontSize:"0.7rem", letterSpacing:"0.15em", textTransform:"uppercase", fontWeight:700, cursor:"pointer", boxShadow:"0 4px 20px rgba(197,165,126,0.3)", transition:"all .2s" }}
              onMouseEnter={e => (e.currentTarget.style.transform="translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform="translateY(0)")}
            >
              {isAr ? "+ شارك تحذيرك" : "+ Share a Warning"}
            </button>
            <a href="https://www.cert.gov.qa" target="_blank" rel="noreferrer"
              style={{ padding:"0.9rem 1.6rem", borderRadius:12, border:"1px solid rgba(197,165,126,0.3)", background:"transparent", color:"rgba(232,212,188,0.75)", fontFamily:"'Cinzel', serif", fontSize:"0.65rem", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", textDecoration:"none", transition:"all .2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor="rgba(197,165,126,0.7)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor="rgba(197,165,126,0.3)"}
            >
              {isAr ? "إبلاغ CERT.Qatar →" : "Report to CERT.Qatar →"}
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ background:"white", borderBottom:"1px solid rgba(99,32,36,0.08)", padding:"0.8rem 2rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", gap:"1.5rem", alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontFamily:"'Cinzel', serif", fontSize:"0.65rem", letterSpacing:"0.15em", color:"rgba(99,32,36,0.45)", textTransform:"uppercase" }}>
            {isAr ? `${warnings.length} تحذير مجتمعي` : `${warnings.length} community warnings`}
          </span>
          {(Object.entries(WARNING_TYPES) as [WarningType, typeof WARNING_TYPES[WarningType]][]).map(([k, c]) => typeCount(k) > 0 && (
            <span key={k} style={{ fontSize:11, color:c.color, background:c.bg, padding:"2px 9px", borderRadius:20, fontWeight:700 }}>
              {c.icon} {typeCount(k)}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem" }}>
        {/* ── Filters + Search ── */}
        <div style={{ display:"flex", gap:"1rem", marginBottom:"1.5rem", flexWrap:"wrap", alignItems:"center" }}>
          {/* Search */}
          <div style={{ flex:1, minWidth:200, position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, opacity:0.35 }}>🔍</span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder={isAr ? "ابحث في التحذيرات..." : "Search warnings..."}
              style={{ width:"100%", padding:"0.65rem 1rem 0.65rem 2.4rem", borderRadius:10, border:"1.5px solid rgba(99,32,36,0.15)", fontFamily:"'Crimson Pro', serif", fontSize:"0.95rem", color:"#3e1316", background:"white", outline:"none", boxSizing:"border-box" }}
              onFocus={e => (e.target.style.borderColor="#632024")}
              onBlur={e => (e.target.style.borderColor="rgba(99,32,36,0.15)")}
            />
          </div>
          {/* Type filters */}
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
            {[{key:"all" as const, icon:"🛡", label:"All", labelAr:"الكل", color:"#632024"},...(Object.entries(WARNING_TYPES) as [WarningType, typeof WARNING_TYPES[WarningType]][]).map(([k,c])=>({key:k,icon:c.icon,label:c.label,labelAr:c.labelAr,color:c.color}))].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key as WarningType | "all")}
                style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${filter===f.key ? f.color : "rgba(99,32,36,0.15)"}`, background: filter===f.key ? `${f.color}12` : "white", color: filter===f.key ? f.color : "rgba(99,32,36,0.55)", fontSize:11, fontWeight:700, cursor:"pointer", transition:"all .2s", display:"flex", alignItems:"center", gap:4 }}>
                {f.icon} {isAr ? f.labelAr : f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cards grid ── */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"rgba(99,32,36,0.4)", fontFamily:"'Cinzel', serif", fontSize:"0.75rem", letterSpacing:"0.2em" }}>
            {isAr ? "جارٍ التحميل..." : "Loading warnings..."}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"rgba(99,32,36,0.4)" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🛡</div>
            <p style={{ fontFamily:"'Cinzel', serif", fontSize:"0.8rem", letterSpacing:"0.15em" }}>
              {isAr ? "لا توجد تحذيرات بعد" : "No warnings yet"}
            </p>
            <p style={{ fontFamily:"'Crimson Pro', serif", fontSize:"0.95rem", marginTop:8, fontStyle:"italic" }}>
              {isAr ? "كن أول من يحمي مجتمعه" : "Be the first to protect your community"}
            </p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:"1.2rem" }}>
            {filtered.map(w => (
              <WarningCard key={w.id} w={w} userId={userId} locale={locale} onUpvote={handleUpvote} />
            ))}
          </div>
        )}
      </div>

      {/* ── Submit Modal ── */}
      {showSubmit && <SubmitModal onClose={() => { setShowSubmit(false); loadWarnings(); }} userId={userId} locale={locale} />}
    </div>
  );
}
