"use client";
import { useTrackView } from "@/hooks/useTrackView";
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import ElderNav from "@/components/elder/ElderNav";
import { useElderLang } from "@/hooks/useElderLang";

const cinzel = "'Cinzel', Georgia, serif";
const body   = "'Crimson Pro', Georgia, serif";

type Severity = "critical" | "high" | "medium" | "low";
interface NewsItem {
  id: string; headline: string; headline_ar?: string;
  what_happened: string; what_happened_ar?: string;
  who_affected: string; severity: Severity;
  action_steps: string[]; action_steps_ar?: string[];
  createdAt?: { toDate: () => Date };
}

const SEV_COLOR: Record<Severity, string> = {
  critical: "#dc2626", high: "#ea580c", medium: "#ca8a04", low: "#16a34a",
};
const SEV_LABEL: Record<Severity, { en: string; ar: string }> = {
  critical: { en: "Critical", ar: "حرج" }, high: { en: "High", ar: "عالٍ" },
  medium:   { en: "Medium",   ar: "متوسط" }, low: { en: "Low",  ar: "منخفض" },
};

export default function ElderNewsPage() {
  useTrackView("elder_news");
  const [lang, setLang] = useElderLang();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isRtl = lang === "ar";

  useEffect(() => {
    getDocs(query(collection(db, "securityNews"), orderBy("createdAt", "desc")))
      .then(snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", color: "#3e1316", direction: isRtl ? "rtl" : "ltr", fontFamily: body }}>
      <ElderNav lang={lang} onLangChange={setLang} />
      <main style={{ padding: "110px 2rem 4rem", maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.5rem" }}>
          {isRtl ? "آخر أخبار الأمان" : "Latest Safety News"}
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#5C4033", marginBottom: "2.5rem" }}>
          {isRtl ? "تهديدات حقيقية تحدث الآن، ابقَ على اطلاع." : "Real threats happening now, stay informed."}
        </p>

        {loading && <p style={{ color: "#8B6555" }}>{isRtl ? "جاري التحميل…" : "Loading…"}</p>}
        {!loading && items.length === 0 && (
          <p style={{ color: "#8B6555" }}>{isRtl ? "لا توجد أخبار حالياً." : "No news items yet."}</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
          {items.map(item => {
            const headline = isRtl && item.headline_ar ? item.headline_ar : item.headline;
            const body_    = isRtl && item.what_happened_ar ? item.what_happened_ar : item.what_happened;
            const steps    = isRtl && item.action_steps_ar?.length ? item.action_steps_ar : item.action_steps;
            const sev      = item.severity ?? "low";
            const color    = SEV_COLOR[sev];
            const label    = SEV_LABEL[sev]?.[lang] ?? sev;
            return (
              <div key={item.id} style={{ background: "#fff", borderRadius: 18, border: `1px solid ${color}30`, boxShadow: "0 2px 16px rgba(62,19,22,0.06)", overflow: "hidden" }}>
                <div style={{ borderBottom: `3px solid ${color}`, padding: "1.4rem 1.6rem 1rem" }}>
                  <span style={{ background: `${color}15`, color, fontFamily: cinzel, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", padding: "2px 10px", borderRadius: 999, marginBottom: "0.7rem", display: "inline-block" }}>
                    ● {label}
                  </span>
                  <h2 style={{ fontFamily: cinzel, fontSize: "1.2rem", fontWeight: 700, margin: "0.3rem 0 0", lineHeight: 1.4 }}>{headline}</h2>
                </div>
                <div style={{ padding: "1rem 1.6rem 1.4rem" }}>
                  <p style={{ fontSize: "1.05rem", color: "#4A3728", lineHeight: 1.75, marginBottom: "1rem" }}>{body_}</p>
                  {steps?.length > 0 && (
                    <div style={{ background: "#F7F3EE", borderRadius: 12, padding: "1rem 1.2rem" }}>
                      <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "0.8rem", color: "#632024", marginBottom: "0.5rem" }}>
                        {isRtl ? "خطوات الحماية" : "WHAT TO DO"}
                      </div>
                      <ul style={{ margin: 0, paddingInlineStart: "1.2rem", color: "#4A3728", lineHeight: 2, fontSize: "1rem" }}>
                        {steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
