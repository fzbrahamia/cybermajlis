"use client";
import { useTrackView } from "@/hooks/useTrackView";
import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Lightbulb } from "lucide-react";
import CalmNav from "@/components/calm/CalmNav";
import { useCalmLang } from "@/hooks/useCalmLang";

const sans   = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const cinzel = "'Cinzel', Georgia, serif";

type Result = { severity: string; detected: number; total: number; url?: string };

const content = {
  en: {
    title: "Is this link safe?",
    sub: "If someone sent you a link and you are not sure — paste it here and we will check it for you.",
    placeholder: "Paste the link here…",
    btn: "Check this link",
    checking: "Checking… please wait",
    clean: "This link looks safe!",
    suspicious: "This link looks a bit strange. Ask a grown-up before clicking.",
    malicious: "This link is dangerous! Do not click it. Tell a grown-up right away.",
    unknown: "We could not check this link. When you are not sure, do not click it.",
    tip: "If the link came from someone you do not know — do not click it, even if it looks safe.",
    detectedBy: "Flagged by",
    engines: "security engines",
    tryAnother: "← Check another link",
    back: "← Go back",
  },
  ar: {
    title: "هل هذا الرابط آمن؟",
    sub: "إذا أرسل لك أحد رابطاً ولست متأكداً — الصقه هنا وسنفحصه لك.",
    placeholder: "الصق الرابط هنا…",
    btn: "افحص هذا الرابط",
    checking: "جاري الفحص… انتظر قليلاً",
    clean: "هذا الرابط يبدو آمناً!",
    suspicious: "هذا الرابط يبدو غريباً قليلاً. اسأل شخصاً كبيراً قبل الضغط عليه.",
    malicious: "هذا الرابط خطير! لا تضغط عليه. أخبر شخصاً كبيراً الآن.",
    unknown: "لم نستطع فحص هذا الرابط. عندما لا تكون متأكداً، لا تضغط عليه.",
    tip: "إذا جاء الرابط من شخص لا تعرفه — لا تضغط عليه، حتى لو بدا آمناً.",
    detectedBy: "رُصد بواسطة",
    engines: "محرك أمني",
    tryAnother: "افحص رابطاً آخر →",
    back: "→ عُد للخلف",
  },
};

export default function CalmScannerPage() {
  useTrackView("calm_scanner");
  const [lang, setLang] = useCalmLang();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const isRtl = lang === "ar";
  const c = content[lang];

  const check = async () => {
    if (!url.trim()) return;
    setLoading(true); setResult(null); setError("");
    try {
      let target = url.trim();
      if (!/^https?:\/\//i.test(target)) target = "https://" + target;

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "url", target }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setResult(d);
    } catch (err: any) {
      setError(err?.message || c.unknown);
    }
    setLoading(false);
  };

  const verdict = result
    ? result.severity === "clean"      ? { text: c.clean,      color: "#16a34a", bg: "#f0fdf4", border: "#86efac", icon: <CheckCircle   size={64} color="#16a34a" strokeWidth={1.5} /> }
    : result.severity === "malicious"  ? { text: c.malicious,  color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", icon: <XCircle        size={64} color="#dc2626" strokeWidth={1.5} /> }
    : result.severity === "suspicious" ? { text: c.suspicious, color: "#ca8a04", bg: "#fefce8", border: "#fde68a", icon: <AlertTriangle  size={64} color="#ca8a04" strokeWidth={1.5} /> }
    : { text: c.unknown, color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", icon: <HelpCircle size={64} color="#6b7280" strokeWidth={1.5} /> }
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", color: "#1A2233", direction: isRtl ? "rtl" : "ltr", fontFamily: sans }}>
      <CalmNav lang={lang} onLangChange={setLang} />

      <main style={{ padding: "110px 2rem 4rem", maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#1A3A5C", marginBottom: "0.6rem" }}>
          {c.title}
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#475569", marginBottom: "2.5rem", lineHeight: 1.8 }}>
          {c.sub}
        </p>

        {!result && (
          <div style={{ background: "#FFFFFF", borderRadius: 20, border: "2px solid #BFDBFE", padding: "2rem", boxShadow: "0 4px 24px rgba(59,130,246,0.07)" }}>
            <textarea
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder={c.placeholder}
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box",
                fontFamily: sans, fontSize: "1.1rem", lineHeight: 1.6,
                border: "2px solid #BFDBFE",
                borderRadius: 12, padding: "1rem",
                color: "#1A2233", background: "#F0F9FF",
                outline: "none", resize: "none",
                direction: "ltr",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#3B82F6"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#BFDBFE"; }}
            />
            <button
              onClick={check}
              disabled={!url.trim() || loading}
              style={{
                marginTop: "1.2rem",
                fontFamily: cinzel, fontWeight: 700, fontSize: "1.1rem",
                background: url.trim() && !loading ? "#3B82F6" : "#93C5FD",
                color: "#FFFFFF",
                border: "none", borderRadius: 14,
                padding: "0.9rem 2.2rem",
                cursor: url.trim() && !loading ? "pointer" : "not-allowed",
                width: "100%",
              }}
            >
              {loading ? c.checking : c.btn}
            </button>
          </div>
        )}

        {verdict && result && (
          <div>
            <div style={{
              background: verdict.bg,
              border: `2px solid ${verdict.border}`,
              borderRadius: 20,
              padding: "2.5rem 2rem",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}>
              <div style={{ marginBottom: "0.8rem", display: "flex", justifyContent: "center" }}>{verdict.icon}</div>
              <p style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.3rem", color: verdict.color, margin: "0 0 0.5rem" }}>
                {verdict.text}
              </p>
              {result.total > 0 && (
                <p style={{ fontSize: "0.95rem", color: "#64748B", margin: 0 }}>
                  {c.detectedBy} {result.detected} / {result.total} {c.engines}
                </p>
              )}
            </div>

            <div style={{
              background: "#DBEAFE",
              border: "2px solid #93C5FD",
              borderRadius: 14, padding: "1.2rem 1.6rem",
              display: "flex", gap: "0.8rem", alignItems: "flex-start",
              marginBottom: "1.5rem",
            }}>
              <span style={{ flexShrink: 0, paddingTop: "0.1rem" }}><Lightbulb size={22} color="#1D4ED8" strokeWidth={1.5} /></span>
              <p style={{ color: "#1E3A5F", fontSize: "1rem", margin: 0, lineHeight: 1.7 }}>{c.tip}</p>
            </div>

            <button
              onClick={() => { setResult(null); setUrl(""); }}
              style={{
                fontFamily: cinzel, fontSize: "0.95rem",
                background: "none",
                border: "2px solid #BFDBFE",
                borderRadius: 999, padding: "0.6rem 1.4rem",
                cursor: "pointer", color: "#1D4ED8",
              }}
            >
              {c.tryAnother}
            </button>
          </div>
        )}

        {error && (
          <p style={{ color: "#9A6A2F", fontSize: "1.1rem", marginTop: "1rem", background: "#FBF6EF", borderRadius: 12, padding: "1rem" }}>
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
