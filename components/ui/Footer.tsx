"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";

const cinzel  = '"Cinzel", "Trajan Pro", Georgia, serif';
const crimson = '"Crimson Pro", "Crimson Text", Georgia, serif';

type Link = { href?: string; chat?: boolean; en: string; ar: string };

const COLUMNS: { title_en: string; title_ar: string; links: Link[] }[] = [
  {
    title_en: "Learn", title_ar: "تعلّم",
    links: [
      { href: "/dashboard",              en: "Lessons",     ar: "الدروس" },
      { href: "/games?view=simulations", en: "Simulations", ar: "المحاكاة" },
    ],
  },
  {
    title_en: "Defend", title_ar: "دافع",
    links: [
      { href: "/soc",  en: "Live SOC",     ar: "مركز العمليات" },
      { href: "/scan", en: "Link Scanner", ar: "فاحص الروابط" },
      { href: "/news", en: "News",         ar: "الأخبار" },
    ],
  },
  {
    title_en: "Compete", title_ar: "تنافس",
    links: [
      { href: "/ctf",   en: "Capture the Flag", ar: "التقط العلم" },
      { href: "/games", en: "Games",            ar: "الألعاب" },
    ],
  },
  {
    title_en: "Connect", title_ar: "تواصل",
    links: [
      { href: "/community", en: "Community", ar: "المجتمع" },
      { chat: true,         en: "Ask Hamad", ar: "اسأل حمد" },
    ],
  },
];

const SPECIAL = [
  { href: "/elder", en: "Seniors Mode", ar: "وضع كبار السن", desc_en: "A slower, simpler experience with larger text, read-aloud audio and a clutter-free layout.", desc_ar: "تجربة أبطأ وأبسط، بنص أكبر وقراءة صوتية وواجهة خالية من الزحام." },
  { href: "/calm",  en: "Calm Mode",    ar: "الوضع الهادئ",  desc_en: "A quiet, soothing space with soft colors, a gentle pace and no animations.",                  desc_ar: "مساحة هادئة ومريحة، بألوان ناعمة وإيقاع لطيف وبدون أي حركة." },
];

export default function Footer() {
  const router = useRouter();
  const isAR   = useLocale() === "ar";

  const go = (l: Link) => {
    if (l.chat) { window.dispatchEvent(new Event("cm:open-chat")); return; }
    if (l.href) router.push(l.href);
  };

  const linkStyle: React.CSSProperties = {
    fontFamily: cinzel, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em",
    color: "rgba(232,212,188,.62)", background: "none", border: "none", padding: 0,
    cursor: "pointer", textAlign: isAR ? "right" : "left", transition: "color .2s ease",
  };
  const colTitle: React.CSSProperties = {
    fontFamily: cinzel, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
    color: "rgba(197,165,126,.55)", marginBottom: "1.1rem", textTransform: "uppercase",
  };

  return (
    <footer style={{
      padding: "64px 4rem 36px",
      background: "linear-gradient(180deg,#3e1316 0%,#2a0c0e 100%)",
      borderTop: "1px solid rgba(197,165,126,.25)",
      direction: isAR ? "rtl" : "ltr",
    }}>
      <style>{`
        .cm-footer-grid {
          display: grid;
          grid-template-columns: 1.5fr repeat(4, minmax(96px,0.85fr)) 1.5fr;
          gap: 2.5rem 1.8rem;
        }
        @media (max-width: 1024px){ .cm-footer-grid{ grid-template-columns: 1fr 1fr 1fr; } }
        @media (max-width: 700px){ .cm-footer-grid{ grid-template-columns: 1fr 1fr; } }
        @media (max-width: 460px){ .cm-footer-grid{ grid-template-columns: 1fr; } }
      `}</style>
      <div className="cm-footer-grid" style={{ maxWidth: 1180, margin: "0 auto", alignItems: "start" }}>

        {/* ── Brand ── */}
        <div style={{ maxWidth: 280 }}>
          <img src={isAR ? "/logoAr.png" : "/logoEn.png"} alt="CyberMajlis" style={{ height: 38, width: "auto", marginBottom: 16 }} />
          <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 14, color: "rgba(232,212,188,.6)", lineHeight: 1.7, margin: "0 0 18px" }}>
            {isAR
              ? "أكاديمية قطر للأمن السيبراني بأسلوب اللعب والمحاكاة. تأسست في الدوحة، وبُنيت للمنطقة."
              : "Qatar's gamified cybersecurity academy. Founded in Doha, built for the region."}
          </p>
          <button
            onClick={() => router.push("/auth?signup=true")}
            style={{
              fontFamily: cinzel, fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
              padding: "10px 20px", borderRadius: 9, border: "none", cursor: "pointer",
              color: "#3e1316", background: "linear-gradient(135deg,#e8d4bc,#c5a57e)",
              boxShadow: "0 4px 16px rgba(197,165,126,.25)", display: "inline-flex", alignItems: "center", gap: 8,
              transition: "transform .2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
          >
            {isAR ? "انضم الآن" : "Join now"}
            <ArrowRight size={14} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
          </button>
        </div>

        {/* ── Link columns ── */}
        {COLUMNS.map((col, ci) => (
          <div key={ci}>
            <div style={colTitle}>{isAR ? col.title_ar : col.title_en}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {col.links.map((l, i) => (
                <button
                  key={i}
                  onClick={() => go(l)}
                  style={linkStyle}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c5a57e"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(232,212,188,.62)"; }}
                >
                  {isAR ? l.ar : l.en}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* ── Special Versions ── */}
        <div>
          <div style={colTitle}>{isAR ? "نسخ خاصة" : "Special Versions"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {SPECIAL.map(s => (
              <a key={s.href} href={s.href} style={{ textDecoration: "none" }}>
                <div
                  style={{ fontFamily: cinzel, fontSize: 11.5, fontWeight: 700, color: "#c5a57e", letterSpacing: "0.06em", marginBottom: "0.25rem", transition: "color .2s ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#E8D4BC"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#c5a57e"; }}
                >
                  {isAR ? s.ar : s.en}
                </div>
                <div style={{ fontFamily: crimson, fontSize: 12, color: "rgba(232,212,188,.42)", lineHeight: 1.55 }}>
                  {isAR ? s.desc_ar : s.desc_en}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        maxWidth: 1180, margin: "2.8rem auto 0", paddingTop: "1.5rem",
        borderTop: "1px solid rgba(197,165,126,.1)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem",
      }}>
        <span style={{ fontFamily: crimson, fontSize: 12.5, color: "rgba(232,212,188,.35)" }}>
          {isAR ? "© 2026 المجلس السيبراني، قطر" : "© 2026 CyberMajlis, Qatar"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <a href="/privacy" style={{ fontFamily: cinzel, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(197,165,126,.75)", textDecoration: "none" }}>
            {isAR ? "سياسة الخصوصية" : "Privacy Policy"}
          </a>
          <span style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 12, color: "rgba(232,212,188,.28)" }}>
            {isAR ? "تعليم الأمن السيبراني للجميع" : "Cybersecurity education for everyone"}
          </span>
        </div>
      </div>
    </footer>
  );
}
