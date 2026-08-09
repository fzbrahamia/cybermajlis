"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";

const cinzel  = '"Cinzel", "Trajan Pro", Georgia, serif';
const crimson = '"Crimson Pro", "Crimson Text", Georgia, serif';

type Link = { href?: string; chat?: boolean; en: string; ar: string };

const COLUMNS: { title_en: string; title_ar: string; links: Link[] }[] = [
  {
    // Three different ways to learn: read it, try it, do the real job.
    title_en: "Learn", title_ar: "تعلّم",
    links: [
      { href: "/dashboard",   en: "Lessons",     ar: "الدروس" },
      { href: "/simulations", en: "Simulations", ar: "المحاكاة" },
      { href: "/soc",         en: "Live SOC",    ar: "مركز العمليات" },
    ],
  },
  {
    // Everyday, real-world safety: stay informed, warn others, check before you click.
    title_en: "Protect", title_ar: "احمِ نفسك",
    links: [
      { href: "/scan",      en: "Link Scanner", ar: "فاحص الروابط" },
      { href: "/news",      en: "News",         ar: "الأخبار" },
      { href: "/community", en: "Community",    ar: "المجتمع" },
      { chat: true,         en: "Ask Hamad",    ar: "اسأل حمد" },
    ],
  },
  {
    // Self-directed, hands-on: prove your skill and secure your own devices.
    title_en: "Practice", title_ar: "تدرّب",
    links: [
      { href: "/ctf",                      en: "Capture the Flag", ar: "التقط العلم" },
      { href: "/dashboard/do-it-yourself", en: "Do It Yourself",   ar: "افعلها بنفسك" },
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
  // Light theme is scoped to the landing page for now; the rest of the site keeps
  // the dark maroon footer until we roll the new look out.
  const pathname = usePathname();
  const isLanding = pathname === "/cybermajlis" || pathname.startsWith("/dashboard") || pathname.startsWith("/auth") || pathname.startsWith("/simulations") || pathname.startsWith("/ctf") || pathname.startsWith("/scan") || pathname.startsWith("/news") || pathname.startsWith("/community") || pathname.startsWith("/profile") || pathname.startsWith("/settings") || pathname.startsWith("/privacy");

  const th = {
    bg: isLanding ? "rgba(251,248,243,0.82)" : "linear-gradient(180deg,#3e1316 0%,#2a0c0e 100%)",
    border: isLanding ? "rgba(99,32,36,.12)" : "rgba(197,165,126,.25)",
    linkIdle: isLanding ? "rgba(74,26,29,.72)" : "rgba(232,212,188,.62)",
    linkHover: isLanding ? "#8B2635" : "#c5a57e",
    title: isLanding ? "rgba(139,38,53,.7)" : "rgba(197,165,126,.55)",
    brandText: isLanding ? "rgba(90,45,40,.78)" : "rgba(232,212,188,.6)",
    specialIdle: isLanding ? "#8B2635" : "#c5a57e",
    specialHover: isLanding ? "#5e1a1e" : "#E8D4BC",
    specialDesc: isLanding ? "rgba(90,45,40,.6)" : "rgba(232,212,188,.42)",
    bottomText: isLanding ? "rgba(90,45,40,.5)" : "rgba(232,212,188,.35)",
    bottomBorder: isLanding ? "rgba(99,32,36,.1)" : "rgba(197,165,126,.1)",
    privacy: isLanding ? "rgba(122,30,34,.8)" : "rgba(197,165,126,.75)",
    tagline: isLanding ? "rgba(90,45,40,.45)" : "rgba(232,212,188,.28)",
  };

  const go = (l: Link) => {
    if (l.chat) { window.dispatchEvent(new Event("cm:open-chat")); return; }
    if (l.href) router.push(l.href);
  };

  const linkStyle: React.CSSProperties = {
    fontFamily: cinzel, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em",
    color: th.linkIdle, background: "none", border: "none", padding: 0,
    cursor: "pointer", textAlign: isAR ? "right" : "left", transition: "color .2s ease",
  };
  const colTitle: React.CSSProperties = {
    fontFamily: cinzel, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
    color: th.title, marginBottom: "1.1rem", textTransform: "uppercase",
  };

  return (
    <footer style={{
      padding: "64px 4rem 36px",
      background: th.bg,
      borderTop: `1px solid ${th.border}`,
      direction: isAR ? "rtl" : "ltr",
    }}>
      <style>{`
        .cm-footer-grid {
          display: grid;
          grid-template-columns: 1.5fr repeat(3, minmax(110px,0.9fr)) 1.5fr;
          gap: 2.5rem 1.8rem;
        }
        @media (max-width: 1024px){ .cm-footer-grid{ grid-template-columns: 1fr 1fr 1fr; } }
        @media (max-width: 700px){ .cm-footer-grid{ grid-template-columns: 1fr 1fr; } }
        @media (max-width: 460px){ .cm-footer-grid{ grid-template-columns: 1fr; } }
      `}</style>
      <div className="cm-footer-grid" style={{ maxWidth: 1180, margin: "0 auto", alignItems: "start" }}>

        {/* ── Brand ── */}
        <div style={{ maxWidth: 280 }}>
          {isLanding ? (
            <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: isAR ? 22 : 26, letterSpacing: 0.5, marginBottom: 16, whiteSpace: "nowrap" }}>
              {isAR ? (
                <span style={{ fontFamily: '"Noto Naskh Arabic", "Crimson Pro", serif', color: "#7a1e22" }}>المجلس السيبراني</span>
              ) : (
                <><span style={{ color: "#3e1316" }}>Cyber</span><span style={{ color: "#8B2635" }}> Majlis</span></>
              )}
            </div>
          ) : (
            <img src={isAR ? "/logoAr.png" : "/logoEn.png"} alt="CyberMajlis" style={{ height: 38, width: "auto", marginBottom: 16 }} />
          )}
          <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 14, color: th.brandText, lineHeight: 1.7, margin: "0 0 18px" }}>
            {isAR
              ? "أكاديمية قطر للأمن السيبراني بأسلوب اللعب والمحاكاة. تأسست في الدوحة، وبُنيت للمنطقة."
              : "Qatar's gamified cybersecurity academy. Founded in Doha, built for the region."}
          </p>
          {/* Up one level, to the Majlis roof. Replaces the old "Join now"
              CTA, which kept showing to people who were already signed in. */}
          <button
            onClick={() => router.push("/")}
            style={{
              fontFamily: cinzel, fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
              padding: "10px 18px", borderRadius: 999, cursor: "pointer",
              color: isLanding ? "#5a3a2a" : "#E8D4BC",
              background: "transparent",
              border: `1px solid ${isLanding ? "rgba(99,32,36,.2)" : "rgba(197,165,126,.3)"}`,
              display: "inline-flex", alignItems: "center", gap: 9,
              transition: "transform .2s ease, background .2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = isLanding ? "rgba(99,32,36,.05)" : "rgba(255,255,255,.06)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span aria-hidden style={{ display: "grid", gridTemplateColumns: "repeat(2, 5px)", gap: 2 }}>
              {["#C5A57E", "#4C8C5C", "#A8323F", "#5D66AD"].map(c => (
                <span key={c} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />
              ))}
            </span>
            {isAR ? "مجلس" : "Majlis"}
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
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = th.linkHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = th.linkIdle; }}
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
                  style={{ fontFamily: cinzel, fontSize: 11.5, fontWeight: 700, color: th.specialIdle, letterSpacing: "0.06em", marginBottom: "0.25rem", transition: "color .2s ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = th.specialHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = th.specialIdle; }}
                >
                  {isAR ? s.ar : s.en}
                </div>
                <div style={{ fontFamily: crimson, fontSize: 12, color: th.specialDesc, lineHeight: 1.55 }}>
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
        borderTop: `1px solid ${th.bottomBorder}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem",
      }}>
        <span style={{ fontFamily: crimson, fontSize: 12.5, color: th.bottomText }}>
          {isAR ? "© 2026 المجلس السيبراني، قطر" : "© 2026 CyberMajlis, Qatar"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <a href="/privacy" style={{ fontFamily: cinzel, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: th.privacy, textDecoration: "none" }}>
            {isAR ? "سياسة الخصوصية" : "Privacy Policy"}
          </a>
          <span style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 12, color: th.tagline }}>
            {isAR ? "تعليم الأمن السيبراني للجميع" : "Cybersecurity education for everyone"}
          </span>
        </div>
      </div>
    </footer>
  );
}
