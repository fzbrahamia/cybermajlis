"use client";
import { useState } from "react";
import ElderNav from "@/components/elder/ElderNav";

const cinzel = "'Cinzel', Georgia, serif";
const body   = "'Crimson Pro', Georgia, serif";

type Result = { severity: string; detected: number; total: number; url?: string };

const content = {
  en: {
    title: "Check a Suspicious Link",
    sub: "If someone sent you a link and you are not sure it is safe — paste it here before clicking.",
    placeholder: "Paste the link here…",
    btn: "Check this link",
    checking: "Checking… this may take up to 30 seconds",
    clean: "This link appears safe.",
    suspicious: "This link looks suspicious. Do not click it.",
    malicious: "This link is dangerous. Delete the message immediately.",
    unknown: "We could not check this link. When in doubt, do not click it.",
    tip: "If you received this link from an unknown sender, do not click it — even if it looks safe.",
    detectedBy: "Flagged by",
    engines: "security engines",
    tryAnother: "Check another link",
  },
  ar: {
    title: "افحص رابطاً مشبوهاً",
    sub: "إذا أرسل لك أحد رابطاً ولست متأكداً من أمانه — الصقه هنا قبل الضغط عليه.",
    placeholder: "الصق الرابط هنا…",
    btn: "افحص هذا الرابط",
    checking: "جاري الفحص… قد يستغرق حتى 30 ثانية",
    clean: "يبدو هذا الرابط آمناً.",
    suspicious: "هذا الرابط يبدو مشبوهاً. لا تضغط عليه.",
    malicious: "هذا الرابط خطير. احذف الرسالة فوراً.",
    unknown: "لم نستطع فحص هذا الرابط. عند الشك، لا تضغط عليه.",
    tip: "إذا وصلك هذا الرابط من شخص غير معروف، لا تضغط عليه — حتى لو بدا آمناً.",
    detectedBy: "رُصد بواسطة",
    engines: "محرك أمني",
    tryAnother: "افحص رابطاً آخر",
  },
};

export default function ElderScannerPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
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
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "url", target: url.trim() }),
      });
      if (!res.ok) throw new Error("scan failed");
      const d = await res.json();
      setResult(d);
    } catch {
      setError(c.unknown);
    }
    setLoading(false);
  };

  const verdict = result
    ? result.severity === "clean"    ? { text: c.clean,      color: "#16a34a", bg: "#f0fdf4", icon: "✓" }
    : result.severity === "malicious"? { text: c.malicious,   color: "#dc2626", bg: "#fef2f2", icon: "✗" }
    : result.severity === "suspicious"? { text: c.suspicious, color: "#ca8a04", bg: "#fefce8", icon: "⚠" }
    : { text: c.unknown, color: "#6b7280", bg: "#f9fafb", icon: "?" }
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", color: "#3e1316", direction: isRtl ? "rtl" : "ltr", fontFamily: body }}>
      <ElderNav lang={lang} onLangChange={setLang} />
      <main style={{ padding: "110px 2rem 4rem", maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.5rem" }}>
          {c.title}
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#5C4033", marginBottom: "2.5rem", lineHeight: 1.75 }}>
          {c.sub}
        </p>

        {!result && (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(99,32,36,0.1)", padding: "2rem", boxShadow: "0 4px 24px rgba(62,19,22,0.07)" }}>
            <textarea
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder={c.placeholder}
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box",
                fontFamily: body, fontSize: "1.1rem", lineHeight: 1.6,
                border: "2px solid rgba(99,32,36,0.15)",
                borderRadius: 12, padding: "1rem",
                color: "#3e1316", background: "#F7F3EE",
                outline: "none", resize: "none",
                direction: "ltr",
              }}
            />
            <button
              onClick={check}
              disabled={!url.trim() || loading}
              style={{
                marginTop: "1.2rem",
                fontFamily: cinzel, fontWeight: 700, fontSize: "1.1rem",
                letterSpacing: "0.05em",
                background: "linear-gradient(135deg, #3e1316, #632024)",
                color: "#E8D4BC",
                border: "none", borderRadius: 999,
                padding: "0.9rem 2.2rem",
                cursor: url.trim() && !loading ? "pointer" : "not-allowed",
                opacity: url.trim() && !loading ? 1 : 0.5,
                width: "100%",
              }}
            >
              {loading ? c.checking : c.btn}
            </button>
          </div>
        )}

        {verdict && result && (
          <div>
            <div style={{ background: verdict.bg, border: `2px solid ${verdict.color}40`, borderRadius: 20, padding: "2.5rem 2rem", textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "0.8rem" }}>{verdict.icon}</div>
              <p style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.4rem", color: verdict.color, margin: "0 0 0.5rem" }}>
                {verdict.text}
              </p>
              {result.total > 0 && (
                <p style={{ fontSize: "1rem", color: "#5C4033", margin: 0 }}>
                  {c.detectedBy} {result.detected} / {result.total} {c.engines}
                </p>
              )}
            </div>
            <div style={{ background: "linear-gradient(135deg, #3e1316, #632024)", borderRadius: 14, padding: "1.2rem 1.6rem", display: "flex", gap: "0.8rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "1.3rem" }}>💡</span>
              <p style={{ color: "#E8D4BC", fontSize: "1rem", margin: 0, lineHeight: 1.7 }}>{c.tip}</p>
            </div>
            <button
              onClick={() => { setResult(null); setUrl(""); }}
              style={{ fontFamily: cinzel, fontSize: "0.9rem", background: "none", border: "1px solid rgba(99,32,36,0.3)", borderRadius: 999, padding: "0.6rem 1.4rem", cursor: "pointer", color: "#632024" }}
            >
              ← {c.tryAnother}
            </button>
          </div>
        )}

        {error && <p style={{ color: "#dc2626", fontSize: "1.1rem", marginTop: "1rem" }}>{error}</p>}
      </main>
    </div>
  );
}
