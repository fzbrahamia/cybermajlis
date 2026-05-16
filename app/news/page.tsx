// app/news/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  collection, addDoc, getDocs, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";

// ── Types ──────────────────────────────────────────────────────────────────────
type Severity = "critical" | "high" | "medium" | "low";
interface NewsItem {
  id: string;
  headline: string;
  what_happened: string;
  who_affected: string;
  severity: Severity;
  action_steps: string[];
  qatar_relevant: boolean;
  qatar_note?: string;
  source_url?: string;
  createdAt: { toDate: () => Date } | null;
}

// ── Config ─────────────────────────────────────────────────────────────────────
const SEV: Record<Severity, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label: "Critical", color: "#dc2626", bg: "rgba(220,38,38,0.08)",  dot: "#dc2626" },
  high:     { label: "High",     color: "#ea580c", bg: "rgba(234,88,12,0.08)",  dot: "#ea580c" },
  medium:   { label: "Medium",   color: "#ca8a04", bg: "rgba(202,138,4,0.08)",  dot: "#ca8a04" },
  low:      { label: "Low",      color: "#16a34a", bg: "rgba(22,163,74,0.07)",  dot: "#16a34a" },
};

const SEED: NewsItem[] = [];

// ── Helpers ────────────────────────────────────────────────────────────────────
const timeAgo = (d: Date) => {
  const h = Math.floor((Date.now()-d.getTime())/3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

// ── NewsCard ───────────────────────────────────────────────────────────────────
function NewsCard({ item }: { item: NewsItem }) {
  const s = SEV[item.severity];
  return (
    <article style={{ background:"white", borderRadius:14, border:"1px solid rgba(99,32,36,0.09)", boxShadow:"0 2px 14px rgba(99,32,36,0.06)", overflow:"hidden", transition:"box-shadow .2s", position:"relative" }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.boxShadow="0 6px 24px rgba(99,32,36,0.11)"}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.boxShadow="0 2px 14px rgba(99,32,36,0.06)"}
    >
      {/* Left severity stripe */}
      <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:`linear-gradient(to bottom,${s.color},${s.color}60)` }}/>
      <div style={{ padding:"1.2rem 1.4rem 1.2rem 1.7rem" }}>
        {/* Meta row */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20, background:s.bg, color:s.color, letterSpacing:"0.06em", textTransform:"uppercase" }}>
            {item.severity==="critical"?"🔴":item.severity==="high"?"🟠":item.severity==="medium"?"🟡":"🟢"} {s.label}
          </span>
          <span style={{ fontSize:11, padding:"2px 9px", borderRadius:20, background:"rgba(99,32,36,0.05)", color:"rgba(99,32,36,0.6)", fontWeight:600 }}>
            {item.who_affected}
          </span>
          {item.qatar_relevant && (
            <span style={{ fontSize:11, padding:"2px 9px", borderRadius:20, background:"rgba(99,32,36,0.07)", color:"#632024", fontWeight:700 }}>
              🇶🇦 Qatar Alert
            </span>
          )}
          <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(99,32,36,0.35)", fontFamily:"'Cinzel',serif", letterSpacing:"0.08em" }}>
            {item.createdAt ? timeAgo(item.createdAt.toDate()) : ""}
          </span>
        </div>

        {/* Headline */}
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"0.95rem", fontWeight:700, color:"#3e1316", lineHeight:1.4, margin:"0 0 8px" }}>
          {item.headline}
        </h2>

        {/* What happened */}
        <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:"0.95rem", color:"#5C4033", lineHeight:1.72, margin:"0 0 12px" }}>
          {item.what_happened}
        </p>

        {/* Qatar note */}
        {item.qatar_relevant && item.qatar_note && (
          <div style={{ background:"rgba(99,32,36,0.05)", borderRadius:8, padding:"8px 12px", border:"1px solid rgba(99,32,36,0.12)", marginBottom:12, fontSize:12, color:"#632024", fontStyle:"italic", lineHeight:1.6 }}>
            🇶🇦 {item.qatar_note}
          </div>
        )}

        {/* Action steps */}
        <div style={{ background:"#faf6f1", borderRadius:10, padding:"11px 14px", border:"1px solid rgba(99,32,36,0.08)" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(99,32,36,0.4)", marginBottom:8 }}>
            What to do now
          </div>
          {item.action_steps.map((step, i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom: i < item.action_steps.length-1 ? 6 : 0 }}>
              <span style={{ width:20, height:20, borderRadius:"50%", background:s.color, color:"white", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</span>
              <span style={{ fontFamily:"'Crimson Pro',serif", fontSize:"0.93rem", color:"#5C4033", lineHeight:1.6 }}>{step}</span>
            </div>
          ))}
        </div>

        {item.source_url && (
          <a href={item.source_url} target="_blank" rel="noreferrer"
            style={{ display:"inline-block", marginTop:10, fontSize:11, color:"rgba(99,32,36,0.4)", textDecoration:"none", fontFamily:"'Cinzel',serif", letterSpacing:"0.08em" }}>
            Source ↗
          </a>
        )}
      </div>
    </article>
  );
}


// ── Main Page ──────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUserId(u?.uid ?? null));
    return unsub;
  }, []);

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "securityNews"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const real = snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
      setItems(real.length > 0 ? real : SEED);
      setLastUpdated(new Date());
    } catch {
      setItems(SEED);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadNews().then(() => autoFetch()); }, [loadNews]);

  // Auto-fetch: runs silently on load if feed is stale (>2h since last fetch)
  const autoFetch = async () => {
    const lastFetch = typeof window !== "undefined" ? localStorage.getItem("lastNewsFetch") : null;
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    if (lastFetch && parseInt(lastFetch) > twoHoursAgo) return; // fresh enough

    const existingParam = items.map(i => (i as any).source_url).filter(Boolean).join(",");
    try {
      const res = await fetch(`/api/news/fetch?existing=${encodeURIComponent(existingParam)}`);
      const data = await res.json();
      if (!data.success) return;
      // Only write if we have permission (user logged in or rules allow public write)
      try {
        for (const summary of (data.summaries || [])) {
          await addDoc(collection(db, "securityNews"), {
            ...summary, createdAt: serverTimestamp(), auto_generated: true,
          });
        }
      } catch { /* write failed — Firestore rules may require login */ }
      if ((data.summaries || []).length > 0) await loadNews();
      if (typeof window !== "undefined") localStorage.setItem("lastNewsFetch", Date.now().toString());
    } catch { /* silent fail — news will load from cache */ }
  };

    // Sort by severity then date, cap at 15 most relevant articles
  const sevOrder: Record<string, number> = { critical:0, high:1, medium:2, low:3 };
  const sorted = [...items].sort((a,b) => {
    const sd = (sevOrder[a.severity]??4) - (sevOrder[b.severity]??4);
    if (sd !== 0) return sd;
    const at = a.createdAt ? a.createdAt.toDate().getTime() : 0;
    const bt = b.createdAt ? b.createdAt.toDate().getTime() : 0;
    return bt - at;
  }).slice(0, 15);
  const filtered = filter === "all" ? sorted : sorted.filter(i => i.severity === filter);
  const counts = Object.fromEntries((["critical","high","medium","low"] as Severity[]).map(s => [s, sorted.filter(i=>i.severity===s).length]));

  return (
    <div style={{ minHeight:"100vh", background:"#f5ede2", fontFamily:"'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,600;1,300;1,600&family=DM+Sans:wght@300;400;600;700&display=swap" rel="stylesheet"/>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"5.5rem 1.5rem 3rem", display:"grid", gridTemplateColumns:"280px 1fr", gap:"2rem", alignItems:"start" }}>

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────── */}
        <aside style={{ position:"sticky", top:"5.5rem", display:"flex", flexDirection:"column", gap:"1.2rem" }}>

          {/* Branding card */}
          <div style={{ background:"white", borderRadius:16, padding:"1.6rem", boxShadow:"0 2px 16px rgba(99,32,36,0.07)", border:"1px solid rgba(99,32,36,0.08)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:3, height:28, background:"linear-gradient(to bottom,#632024,#c5a57e)", borderRadius:2 }}/>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.25em", color:"rgba(99,32,36,0.45)", textTransform:"uppercase" }}>CyberMajlis</div>
                <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.05rem", fontWeight:700, color:"#3e1316", margin:0, lineHeight:1.2 }}>Security Briefings</h1>
              </div>
            </div>
            <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:"0.9rem", color:"#5C4033", lineHeight:1.7, margin:"0 0 1.2rem", fontWeight:300 }}>
              Latest threats translated into plain language — with steps anyone can follow.
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:"1.2rem" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 6px #22c55e", animation:"blink 2s ease-in-out infinite" }}/>
              <span style={{ fontSize:10, color:"rgba(99,32,36,0.45)", fontFamily:"'Cinzel',serif", letterSpacing:"0.1em" }}>Live feed · {timeAgo(lastUpdated)}</span>
            </div>
          </div>

          {/* Severity filters */}
          <div style={{ background:"white", borderRadius:16, padding:"1.3rem", boxShadow:"0 2px 16px rgba(99,32,36,0.07)", border:"1px solid rgba(99,32,36,0.08)" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em", color:"rgba(99,32,36,0.4)", textTransform:"uppercase", marginBottom:10 }}>Filter by Severity</div>
            {[{key:"all",label:"All Briefings",icon:"🛡",color:"#632024"},
              {key:"critical",label:"Critical",icon:"🔴",color:SEV.critical.color},
              {key:"high",    label:"High",    icon:"🟠",color:SEV.high.color},
              {key:"medium",  label:"Medium",  icon:"🟡",color:SEV.medium.color},
              {key:"low",     label:"Low",     icon:"🟢",color:SEV.low.color},
            ].map(f=>{
              const cnt = f.key==="all" ? items.length : items.filter(i=>i.severity===f.key).length;
              const isActive = filter === f.key;
              return (
                <button key={f.key} onClick={()=>setFilter(f.key as Severity|"all")}
                  style={{ width:"100%", padding:"8px 12px", borderRadius:9, border:"none", background:isActive?`${f.color}12`:"transparent", color:isActive?f.color:"rgba(99,32,36,0.55)", fontSize:12, fontWeight:isActive?700:400, cursor:"pointer", textAlign:"left", transition:"all .15s", display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                  <span>{f.icon}</span>
                  <span style={{ flex:1 }}>{f.label}</span>
                  {cnt>0&&<span style={{ fontSize:10, background:isActive?`${f.color}20`:"rgba(99,32,36,0.06)", color:isActive?f.color:"rgba(99,32,36,0.4)", padding:"1px 7px", borderRadius:10, fontWeight:700 }}>{cnt}</span>}
                </button>
              );
            })}
          </div>

          {/* Stats */}
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.15em", color:"rgba(99,32,36,0.35)", textAlign:"center", textTransform:"uppercase" }}>
            {items.length} briefings in database
          </div>
        </aside>

        {/* ── RIGHT FEED ────────────────────────────────────────────── */}
        <main>
          {loading ? (
            <div style={{ textAlign:"center", padding:"4rem", color:"rgba(99,32,36,0.35)", fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"0.2em" }}>Loading briefings…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"4rem", background:"white", borderRadius:16, border:"1px solid rgba(99,32,36,0.08)" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🛡</div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:"0.75rem", letterSpacing:"0.15em", color:"rgba(99,32,36,0.4)" }}>No briefings at this severity level</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              {filtered.map(item => <NewsCard key={item.id} item={item} />)}
            </div>
          )}
        </main>
      </div>

    </div>
  );
}