// app/news/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  collection, addDoc, setDoc, getDocs, query,
  orderBy, serverTimestamp, deleteDoc, doc as fsDoc,
} from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// ── Types ─────────────────────────────────────────────────────────────────────
type Severity = "critical" | "high" | "medium" | "low";
interface NewsItem {
  id: string;
  headline: string;
  headline_ar?: string;
  what_happened: string;
  what_happened_ar?: string;
  who_affected: string;
  severity: Severity;
  action_steps: string[];
  action_steps_ar?: string[];
  qatar_relevant: boolean;
  qatar_note?: string;
  qatar_note_ar?: string;
  source_url?: string;
  source_name?: string;
  createdAt?: { toDate: () => Date };
}

// ── Severity config ───────────────────────────────────────────────────────────
const SEV: Record<Severity, { color: string; bg: string; dot: string; label: string; label_ar: string }> = {
  critical: { color:"#dc2626", bg:"rgba(220,38,38,0.07)",  dot:"#dc2626", label:"Critical", label_ar:"حرج"    },
  high:     { color:"#ea580c", bg:"rgba(234,88,12,0.07)",  dot:"#f97316", label:"High",     label_ar:"عالي"   },
  medium:   { color:"#ca8a04", bg:"rgba(202,138,4,0.07)",  dot:"#eab308", label:"Medium",   label_ar:"متوسط"  },
  low:      { color:"#16a34a", bg:"rgba(22,163,74,0.07)",  dot:"#22c55e", label:"Low",      label_ar:"منخفض"  },
};

function timeAgo(d?: Date | null): string {
  if (!d) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60)  return "Just now";
  if (s < 3600) return Math.floor(s/60) + "m ago";
  if (s < 86400) return Math.floor(s/3600) + "h ago";
  return Math.floor(s/86400) + "d ago";
}

// ── News Card ─────────────────────────────────────────────────────────────────
function NewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const locale  = useLocale();
  const isAr    = locale === "ar";
  const s       = SEV[item.severity] || SEV.low;
  const headline = isAr && item.headline_ar ? item.headline_ar : item.headline;
  const body     = isAr && item.what_happened_ar ? item.what_happened_ar : item.what_happened;
  const steps    = isAr && item.action_steps_ar?.length ? item.action_steps_ar : item.action_steps;
  const qnote    = isAr && item.qatar_note_ar ? item.qatar_note_ar : item.qatar_note;
  const dir      = isAr && item.headline_ar ? "rtl" : "ltr";

  return (
    <article dir={dir} onClick={() => setExpanded(!expanded)}
      style={{
        background:"white", borderRadius:12,
        border:"1px solid rgba(99,32,36,0.09)",
        borderLeft: dir === "rtl" ? undefined : "3px solid " + s.color,
        borderRight: dir === "rtl" ? "3px solid " + s.color : undefined,
        boxShadow:"0 1px 8px rgba(99,32,36,0.05)",
        marginBottom:"0.7rem", cursor:"pointer",
        transition:"box-shadow .2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,32,36,0.1)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 8px rgba(99,32,36,0.05)")}>
      <div style={{ padding:"0.85rem 1rem" }}>

        {/* Meta row */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap",
          justifyContent: dir === "rtl" ? "flex-end" : "flex-start" }}>
          <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:9,
            background:s.bg, color:s.color, fontFamily:"'Cinzel',serif", letterSpacing:"0.08em",
            textTransform:"uppercase" }}>
            {isAr ? s.label_ar : s.label}
          </span>
          <span style={{ fontSize:9, color:"rgba(99,32,36,0.45)", padding:"2px 7px",
            border:"1px solid rgba(99,32,36,0.1)", borderRadius:9 }}>
            {item.who_affected}
          </span>
          {item.qatar_relevant && (
            <span style={{ fontSize:9, color:"#632024", fontWeight:700 }}>🇶🇦</span>
          )}
          <span style={{ marginLeft:"auto", fontSize:9, color:"rgba(99,32,36,0.3)",
            fontFamily:"'Cinzel',serif" }}>
            {item.createdAt ? timeAgo(item.createdAt.toDate()) : ""}
          </span>
        </div>

        {/* Headline */}
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(0.78rem,1.8vw,0.9rem)",
          fontWeight:700, color:"#3e1316", margin:"0 0 8px", lineHeight:1.35,
          textAlign: dir === "rtl" ? "right" : "left" }}>
          {headline}
        </h2>

        {/* Qatar note — always show when relevant */}
        {qnote && (
          <div style={{ fontStyle:"italic", color:"rgba(99,32,36,0.65)", marginBottom:8,
            fontSize:"0.8rem", fontFamily:"'Crimson Pro',serif", lineHeight:1.5,
            textAlign: dir === "rtl" ? "right" : "left" }}>
            🇶🇦 {qnote}
          </div>
        )}

        {/* Action steps — always visible, this is what the user needs */}
        {steps && steps.length > 0 && (
          <div style={{ background:s.bg, borderRadius:8, padding:"8px 10px",
            border:"1px solid " + s.color + "25", marginBottom: expanded ? 8 : 0 }}>
            <div style={{ fontSize:8, letterSpacing:"0.2em", color:s.color, fontWeight:700,
              fontFamily:"'Cinzel',serif", marginBottom:5, textTransform:"uppercase",
              textAlign: dir === "rtl" ? "right" : "left" }}>
              {isAr ? "ماذا تفعل" : "What to do"}
            </div>
            {steps.slice(0, expanded ? steps.length : 2).map((step, i) => (
              <div key={i} style={{ display:"flex", gap:6, alignItems:"flex-start",
                marginBottom: i < steps.length - 1 ? 4 : 0,
                flexDirection: dir === "rtl" ? "row-reverse" : "row" }}>
                <span style={{ width:16, height:16, borderRadius:"50%", background:s.color,
                  color:"white", fontSize:8, fontWeight:700, display:"flex",
                  alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                  {i + 1}
                </span>
                <span style={{ fontFamily:"'Crimson Pro',serif", fontSize:"0.82rem",
                  color:"#3e1316", lineHeight:1.55 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Expanded: what happened */}
        {expanded && (
          <div style={{ marginTop:8, borderTop:"1px solid rgba(99,32,36,0.07)", paddingTop:8 }}>
            <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:"0.85rem", color:"#5C4033",
              lineHeight:1.7, margin:"0 0 6px", textAlign: dir === "rtl" ? "right" : "left" }}>
              {body}
            </p>
            {item.source_url && (
              <a href={item.source_url} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ fontSize:9, color:"rgba(99,32,36,0.35)", fontFamily:"'Cinzel',serif",
                  letterSpacing:"0.08em", textDecoration:"none" }}>
                {isAr ? "المصدر" : "Source"} ↗
              </a>
            )}
          </div>
        )}

        {/* Expand hint */}
        <div style={{ textAlign: dir === "rtl" ? "left" : "right", marginTop:4 }}>
          <span style={{ fontSize:8, color:"rgba(99,32,36,0.3)", fontFamily:"'Cinzel',serif",
            letterSpacing:"0.1em" }}>
            {expanded ? (isAr ? "▲ أقل" : "▲ less") : (isAr ? "▼ التفاصيل" : "▼ details")}
          </span>
        </div>

      </div>
    </article>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const locale = useLocale();
  const isAr   = locale === "ar";

  const [items,       setItems]       = useState<NewsItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetching,    setFetching]    = useState(false);
  const [filter,      setFilter]      = useState<"all"|Severity>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load Firestore cache
  const loadNews = useCallback(async (): Promise<NewsItem[]> => {
    try {
      const snap = await getDocs(query(collection(db, "securityNews"), orderBy("createdAt", "desc")));
      const result = snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
      setItems(result);
      setLastUpdated(new Date());
      return result;
    } catch {
      return [];
    }
  }, []);

  // Fetch fresh articles from API
  const fetchFresh = useCallback(async (cached: NewsItem[]) => {
    setFetching(true);
    const seen = new Set([
      ...cached.map(i => i.source_url).filter(Boolean) as string[],
      ...JSON.parse(localStorage.getItem("cm-news-seen") || "[]") as string[],
    ]);
    try {
      const res  = await fetch("/api/news/fetch?existing=" + encodeURIComponent([...seen].join(",")));
      const data = await res.json();
      if (data.success && data.summaries?.length > 0) {
        // Write with stable IDs so same article never gets a fresh timestamp
        for (const s of data.summaries) {
          if (!seen.has(s.source_url)) {
            const id = btoa(encodeURIComponent(s.source_url || Date.now().toString()))
              .replace(/[^a-zA-Z0-9]/g, "").slice(0, 28);
            await setDoc(fsDoc(db, "securityNews", id), {
              ...s, createdAt: serverTimestamp(), auto_generated: true,
            }).catch(() => {});
            seen.add(s.source_url);
          }
        }
        // Persist seen URLs
        localStorage.setItem("cm-news-seen",
          JSON.stringify([...seen].slice(-200)));
        await loadNews();
      }
    } catch { /* silent */ }
    setFetching(false);
  }, [loadNews]);

  // Force refresh: clear everything and re-fetch bilingual
  const forceRefresh = useCallback(async () => {
    if (fetching) return;
    localStorage.removeItem("cm-news-seen");
    try {
      const snap = await getDocs(query(collection(db, "securityNews"), orderBy("createdAt", "asc")));
      await Promise.all(snap.docs.map(d => deleteDoc(fsDoc(db, "securityNews", d.id)).catch(() => {})));
    } catch { /* silent */ }
    setItems([]);
    setFetching(true);
    const res  = await fetch("/api/news/fetch?existing=").catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (data.success && data.summaries?.length > 0) {
      for (const s of data.summaries) {
        const id = btoa(encodeURIComponent(s.source_url || Date.now().toString()))
          .replace(/[^a-zA-Z0-9]/g, "").slice(0, 28);
        await setDoc(fsDoc(db, "securityNews", id), {
          ...s, createdAt: serverTimestamp(), auto_generated: true,
        }).catch(() => {});
      }
      await loadNews();
    }
    setFetching(false);
  }, [fetching, loadNews]);

  // On mount: load cache then fetch if stale (> 1h)
  useEffect(() => {
    setLoading(true);
    loadNews().then(cached => {
      setLoading(false);
      const newest = cached.reduce((t, i) =>
        i.createdAt ? Math.max(t, i.createdAt.toDate().getTime()) : t, 0);
      if (newest < Date.now() - 60 * 60 * 1000) fetchFresh(cached);
    });
  }, [loadNews, fetchFresh]);

  // Sort + filter
  const sevOrder: Record<string, number> = { critical:0, high:1, medium:2, low:3 };
  const sorted = [...items]
    .sort((a, b) => {
      const at = a.createdAt ? a.createdAt.toDate().getTime() : 0;
      const bt = b.createdAt ? b.createdAt.toDate().getTime() : 0;
      if (bt !== at) return bt - at;
      return (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4);
    })
    .slice(0, 30);
  const filtered = filter === "all" ? sorted : sorted.filter(i => i.severity === filter);
  const counts   = Object.fromEntries(
    (["critical","high","medium","low"] as Severity[])
      .map(s => [s, sorted.filter(i => i.severity === s).length])
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f5ede2", fontFamily:"'DM Sans',sans-serif" }}
      dir={isAr ? "rtl" : "ltr"}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;600;700&display=swap" rel="stylesheet"/>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"5.5rem 1.5rem 3rem",
        display:"grid", gridTemplateColumns:"260px 1fr", gap:"1.5rem", alignItems:"start" }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div style={{ position:"sticky", top:"80px", display:"flex", flexDirection:"column", gap:"1rem" }}>

          {/* Header card */}
          <div style={{ background:"white", borderRadius:16, padding:"1.3rem",
            boxShadow:"0 2px 16px rgba(99,32,36,0.07)", border:"1px solid rgba(99,32,36,0.08)" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.25em",
              color:"rgba(99,32,36,0.4)", textTransform:"uppercase", marginBottom:6 }}>
              CyberMajlis
            </div>
            <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.1rem", fontWeight:700,
              color:"#3e1316", margin:"0 0 8px", borderLeft:"3px solid #632024", paddingLeft:10 }}>
              {isAr ? "نشرات الأمن" : "Security Briefings"}
            </h1>
            <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:"0.88rem", color:"#5C4033",
              lineHeight:1.65, margin:"0 0 12px" }}>
              {isAr
                ? "أحدث التهديدات بلغة بسيطة — مع خطوات يستطيع الجميع اتباعها."
                : "Latest threats translated into plain language — with steps anyone can follow."}
            </p>

            {/* Live indicator + buttons */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <div style={{ width:7, height:7, borderRadius:"50%",
                background: fetching ? "#ca8a04" : "#16a34a" }}/>
              <span style={{ fontSize:10, color:"rgba(99,32,36,0.45)",
                fontFamily:"'Cinzel',serif", letterSpacing:"0.1em" }}>
                {fetching
                  ? (isAr ? "جارٍ التحديث…" : "Updating…")
                  : (isAr ? "مباشر · " : "Live feed · ") + timeAgo(lastUpdated)}
              </span>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => loadNews().then(c => fetchFresh(c))} disabled={fetching}
                style={{ flex:1, padding:"5px 8px", borderRadius:7,
                  border:"1px solid rgba(99,32,36,0.2)", background:"transparent",
                  color:"rgba(99,32,36,0.55)", fontFamily:"'Cinzel',serif", fontSize:"0.55rem",
                  letterSpacing:"0.1em", textTransform:"uppercase",
                  cursor:fetching?"not-allowed":"pointer", opacity:fetching?0.5:1 }}>
                ⟳ {isAr ? "تحديث" : "Refresh"}
              </button>
              <button onClick={forceRefresh} disabled={fetching}
                title={isAr ? "إعادة جلب جميع المقالات بالعربية والإنجليزية" : "Re-fetch all with Arabic + English"}
                style={{ padding:"5px 10px", borderRadius:7,
                  border:"1px solid rgba(99,32,36,0.25)", background:"rgba(99,32,36,0.05)",
                  color:"rgba(99,32,36,0.7)", fontSize:13,
                  cursor:fetching?"not-allowed":"pointer", opacity:fetching?0.5:1 }}>
                🌐
              </button>
            </div>
          </div>

          {/* Severity filter */}
          <div style={{ background:"white", borderRadius:16, padding:"1.3rem",
            boxShadow:"0 2px 16px rgba(99,32,36,0.07)", border:"1px solid rgba(99,32,36,0.08)" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"0.2em",
              color:"rgba(99,32,36,0.4)", textTransform:"uppercase", marginBottom:12 }}>
              {isAr ? "فرز حسب الخطورة" : "Filter by Severity"}
            </div>

            {[["all", isAr ? "جميع النشرات" : "All Briefings", sorted.length],
              ...( ["critical","high","medium","low"] as Severity[]).map(s =>
                [s, isAr ? SEV[s].label_ar : SEV[s].label, counts[s] || 0]
              )
            ].map(([val, label, count]) => {
              const active = filter === val;
              const dot = val === "all" ? null : SEV[val as Severity]?.dot;
              return (
                <button key={String(val)} onClick={() => setFilter(val as "all"|Severity)}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                    padding:"8px 10px", borderRadius:10, border:"none", cursor:"pointer",
                    background: active ? "#f5ede2" : "transparent",
                    marginBottom:4, textAlign: isAr ? "right" : "left" }}>
                  {dot
                    ? <span style={{ width:12, height:12, borderRadius:"50%",
                        background:dot, flexShrink:0, display:"inline-block" }}/>
                    : <span style={{ fontSize:14 }}>🛡</span>}
                  <span style={{ flex:1, fontFamily:"'Cinzel',serif", fontSize:"0.75rem",
                    fontWeight: active ? 700 : 400, color: active ? "#3e1316" : "rgba(99,32,36,0.55)" }}>
                    {String(label)}
                  </span>
                  <span style={{ fontSize:11, fontWeight:700, padding:"1px 7px",
                    borderRadius:10, background: active ? "#632024" : "rgba(99,32,36,0.08)",
                    color: active ? "white" : "rgba(99,32,36,0.5)" }}>
                    {String(count)}
                  </span>
                </button>
              );
            })}
            <div style={{ marginTop:8, fontSize:10, color:"rgba(99,32,36,0.3)",
              fontFamily:"'Cinzel',serif", letterSpacing:"0.1em", textAlign:"center" }}>
              {sorted.length} {isAr ? "نشرة في قاعدة البيانات" : "Briefings in database"}
            </div>
          </div>
        </div>

        {/* ── Feed ────────────────────────────────────────────────────────── */}
        <main>
          {loading && (
            <div style={{ textAlign:"center", padding:"3rem", color:"rgba(99,32,36,0.4)",
              fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"0.15em" }}>
              {isAr ? "جارٍ التحميل…" : "Loading briefings…"}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"3rem", color:"rgba(99,32,36,0.4)",
              fontFamily:"'Cinzel',serif", fontSize:"0.7rem" }}>
              {isAr ? "لا توجد نشرات حتى الآن" : "No briefings yet — refresh to fetch latest news."}
            </div>
          )}
          {!loading && filtered.map((item, i) => (
            <NewsCard key={item.id || i} item={item} />
          ))}
        </main>
      </div>
    </div>
  );
}