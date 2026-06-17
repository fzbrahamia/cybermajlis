"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const cinzel  = '"Cinzel", "Trajan Pro", Georgia, serif';
const crimson = '"Crimson Pro", "Crimson Text", Georgia, serif';

const FEATURES = [
  { key: "learn",   href: "/dashboard", en: "Dashboard",  ar: "لوحة التعلم" },
  { key: "play",    href: "/games",     en: "Games",       ar: "الألعاب" },
  { key: "connect", href: "/community", en: "Community",   ar: "المجتمع" },
  { key: "news",    href: "/news",      en: "News",        ar: "الأخبار" },
  { key: "scan",    href: "/scan",      en: "Link Scanner",ar: "فحص الروابط" },
  { key: "soc",     href: "/soc",       en: "Live SOC",    ar: "مركز العمليات" },
];

const SPECIAL = [
  { href: "/elder", en: "Seniors Mode",     ar: "كبار القدر",    desc_en: "Large text, audio & simplified UI",    desc_ar: "نص كبير وصوت وواجهة مبسطة" },
  { href: "/calm",  en: "Calm Mode",        ar: "الوضع الهادئ",  desc_en: "For neurodivergent learners",               desc_ar: "للمتعلمين ذوي الاحتياجات الخاصة" },
];

export default function Footer() {
  const router = useRouter();
  const locale = useLocale();
  const isAR   = locale === "ar";
  const t      = useTranslations("Hub.navbar");

  return (
    <footer style={{
      padding: "56px 4rem 40px",
      background: "linear-gradient(180deg, #3e1316 0%, #2a0c0e 100%)",
      borderTop: "1px solid rgba(197,165,126,.25)",
      direction: isAR ? "rtl" : "ltr",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: "3.5rem",
        alignItems: "start",
      }}>

        {/* ── Brand ── */}
        <div style={{ maxWidth: 260 }}>
          <img
            src={isAR ? "/logoAr.png" : "/logoEn.png"}
            alt="CyberMajlis"
            style={{ height: 36, width: "auto", marginBottom: 14 }}
          />
          <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 13.5, color: "rgba(232,212,188,.65)", lineHeight: 1.7, margin: 0 }}>
            {t("footer_tagline")}
          </p>
        </div>

        {/* ── Features column ── */}
        <div>
          <div style={{ fontFamily: cinzel, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(197,165,126,0.5)", marginBottom: "1.1rem", textTransform: "uppercase" }}>
            {isAR ? "المميزات" : "Features"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {FEATURES.map(f => (
              <button
                key={f.key}
                onClick={() => router.push(f.href)}
                style={{
                  fontFamily: cinzel, fontSize: 11.5, fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "rgba(232,212,188,.65)",
                  background: "none", border: "none", padding: 0,
                  cursor: "pointer", textAlign: isAR ? "right" : "left",
                  transition: "color .2s ease",
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = "#c5a57e"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(232,212,188,.65)"; }}
              >
                {isAR ? f.ar : f.en}
              </button>
            ))}
          </div>
        </div>

        {/* ── Special Versions column ── */}
        <div style={{ minWidth: 180 }}>
          <div style={{ fontFamily: cinzel, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(197,165,126,0.5)", marginBottom: "1.1rem", textTransform: "uppercase" }}>
            {isAR ? "نسخ خاصة" : "Special Versions"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {SPECIAL.map(s => (
              <a
                key={s.href}
                href={s.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    fontFamily: cinzel, fontSize: 11.5, fontWeight: 700,
                    color: "#c5a57e",
                    letterSpacing: "0.06em",
                    marginBottom: "0.15rem",
                    transition: "color .2s ease",
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = "#E8D4BC"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = "#c5a57e"; }}
                >
                  {isAR ? s.ar : s.en}
                </div>
                <div style={{ fontFamily: crimson, fontSize: 12, color: "rgba(232,212,188,0.4)", lineHeight: 1.5 }}>
                  {isAR ? s.desc_ar : s.desc_en}
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        maxWidth: 1100, margin: "2.5rem auto 0",
        paddingTop: "1.5rem",
        borderTop: "1px solid rgba(197,165,126,0.1)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "0.5rem",
      }}>
        <span style={{ fontFamily: crimson, fontSize: 12.5, color: "rgba(232,212,188,0.35)" }}>
          {isAR ? "© 2026 مجلس الأمن السيبراني" : "© 2026 CyberMajlis — Qatar"}
        </span>
        <a href="/privacy" style={{ fontFamily: cinzel, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(197,165,126,0.75)", textDecoration: "none" }}>
          {isAR ? "سياسة الخصوصية" : "Privacy Policy"}
        </a>
        <span style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 12, color: "rgba(232,212,188,0.25)" }}>
          {isAR ? "تعليم الأمن السيبراني للجميع" : "Cybersecurity education for everyone"}
        </span>
      </div>
    </footer>
  );
}
