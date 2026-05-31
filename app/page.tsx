"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, ChevronDown, Compass, Swords, Trophy } from "lucide-react";
import { useLocale } from "next-intl";

/* ── Fonts ───────────────────────────────────────────────── */
const cinzel  = '"Cinzel", "Trajan Pro", Georgia, serif';
const crimson = '"Crimson Pro", "Crimson Text", Georgia, serif';
const mono    = '"Geist Mono", "JetBrains Mono", Menlo, monospace';

/* ── Static data ─────────────────────────────────────────── */

const CHARS = [
  {
    id: "saqr",   img: "/characters/saqr.GIF",
    name: "SAQR",    nameAr: "الصقر",
    role: "RECONNAISSANCE", roleAr: "الاستطلاع",
    accent: "#8B2635", rgb: "139,38,53",
    desc: "The falcon's eye. Master of OSINT, footprinting, and the patient hunt.",
    descAr: "عين الصقر. خبير في الاستخبارات مفتوحة المصدر والتتبع والصيد الصبور.",
  },
  {
    id: "oryx",   img: "/characters/oryx.GIF",
    name: "ORYX",    nameAr: "المها",
    role: "DEFENCE",        roleAr: "الدفاع",
    accent: "#7a5c2e", rgb: "122,92,46",
    desc: "Resilient guardian. Teaches hardening, segmentation, and the long watch.",
    descAr: "الحارس الصامد. يعلّم التحصين والعزل والمراقبة الدؤوبة.",
  },
  {
    id: "thalab", img: "/characters/fox.GIF",
    name: "THA'LAB", nameAr: "الثعلب",
    role: "OFFENSE",        roleAr: "الهجوم",
    accent: "#8B4513", rgb: "139,69,19",
    desc: "The cunning fox. Red-team tactics, social engineering, the lockpick's art.",
    descAr: "الثعلب الماكر. تكتيكات الفريق الأحمر والهندسة الاجتماعية وفن الاختراق.",
  },
  {
    id: "hisan",  img: "/characters/hisan.GIF",
    name: "HISAN",   nameAr: "الحصان",
    role: "RESPONSE",       roleAr: "الاستجابة",
    accent: "#4a7c59", rgb: "74,124,89",
    desc: "Swift charger. Incident response, forensics, the cool head under fire.",
    descAr: "المندفع السريع. الاستجابة للحوادث والتحقيقات الجنائية والرأس الثابت.",
  },
];

const FEATURES = [
  {
    Glyph: "learn",
    title: "LEARN",    titleAr: "تعلّم",
    desc:  "Master different malware categories through Qatari-specific use cases.",
    descAr: "أتقن أطر الأمن السيبراني المتقدمة من خلال حالات استخدام قطرية خاصة ومعايير دولية.",
  },
  {
    Glyph: "play",
    title: "PLAY",     titleAr: "العب",
    desc:  "Apply your knowledge in engaging mini-games designed to challenge your skills.",
    descAr: "طبق معرفتك في ألعاب صغيرة ممتعة مصممة لتحدي مهاراتك.",
  },
  {
    Glyph: "simulate",
    title: "SIMULATE", titleAr: "محاكاة",
    desc:  "Deploy into realistic sandbox environments mimicking real-world scenarios.",
    descAr: "انتشر في بيئات محاكاة واقعية تحاكي السيناريوهات الحقيقية.",
  },
  {
    Glyph: "monitor",
    title: "MONITOR",  titleAr: "مراقبة",
    desc:  "Live SOC dashboard tracking global threats in real-time with fellow Majlis members.",
    descAr: "لوحة مركز العمليات الأمنية الحية لتتبع التهديدات العالمية مع أعضاء المجلس.",
  },
];

const HOW_IT_WORKS = [
  {
    num: "01", Icon: Compass,
    title: "Explore",         titleAr: "استكشف",
    desc:  "Choose your guardian and dive into four deep-dive lessons on the most dangerous cyber threats — presented as an animated story.",
    descAr: "اختر بطلك وانطلق في أربع دروس تفاعلية حول أخطر التهديدات السيبرانية.",
  },
  {
    num: "02", Icon: Swords,
    title: "Play & Simulate", titleAr: "العب وجرّب",
    desc:  "Put your knowledge to the test in ten mini-games and seven real-world breach simulations — make decisions, see consequences.",
    descAr: "اختبر معلوماتك في عشر ألعاب وسبعة سيناريوهات هجمات واقعية في بيئة آمنة.",
  },
  {
    num: "03", Icon: Trophy,
    title: "Master & Rise",   titleAr: "أتقن وارتقِ",
    desc:  "Monitor the live SOC, earn achievements, and climb the leaderboard as your cybersecurity expertise grows.",
    descAr: "راقب مركز العمليات الحي واكسب الإنجازات وتصاعد في لوحة المتصدرين.",
  },
];

const FOOTER_COLS = [
  {
    title: "LEARN",
    items: [
      { label: "Curriculum",  href: "/dashboard" },
      { label: "Missions",    href: "/games"     },
      { label: "SOC Sim",     href: "/soc"       },
      { label: "Glossary",    href: "/dashboard" },
    ],
  },
  {
    title: "COMMUNITY",
    items: [
      { label: "Majlis",      href: "/dashboard" },
      { label: "Duels",       href: "/games"     },
      { label: "Tournaments", href: "/games"     },
      { label: "Leaderboard", href: "/profile"   },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { label: "Log In",      href: "/auth"             },
      { label: "Sign Up",     href: "/auth?signup=true"  },
      { label: "Cohort 03",   href: "/auth?signup=true"  },
      { label: "Support",     href: "/"                  },
    ],
  },
];

/* ── Hooks ───────────────────────────────────────────────── */

function useInView(threshold = 0.12) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

/* ── SVG components ──────────────────────────────────────── */

function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="markGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3e1316" />
          <stop offset="1" stopColor="#8B2635" />
        </linearGradient>
      </defs>
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="url(#markGrad)" />
      <polygon points="32,14 48,23 48,41 32,50 16,41 16,23" fill="none" stroke="#c5a57e" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="5" fill="#c5a57e" />
    </svg>
  );
}

function DesignWatermark({ size = 600 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 600 600" aria-hidden>
      <g fill="none" stroke="#632024" strokeWidth="1">
        <polygon points="300,40 520,170 520,430 300,560 80,430 80,170" />
        <polygon points="300,100 470,200 470,400 300,500 130,400 130,200" />
        <polygon points="300,160 420,230 420,370 300,440 180,370 180,230" stroke="#c5a57e" />
      </g>
      <g fill="none" stroke="#c5a57e" strokeWidth="1">
        <circle cx="300" cy="300" r="120" />
        <circle cx="300" cy="300" r="60" />
      </g>
      <g stroke="#632024" strokeWidth="1">
        <line x1="80"  y1="300" x2="520" y2="300" />
        <line x1="300" y1="40"  x2="300" y2="560" />
        <line x1="120" y1="120" x2="480" y2="480" />
        <line x1="120" y1="480" x2="480" y2="120" />
      </g>
    </svg>
  );
}

const glyphSVGProps = {
  width: 32, height: 32, viewBox: "0 0 32 32",
  fill: "none", stroke: "#c5a57e", strokeWidth: 1.4,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

function GlyphLearn() {
  return (
    <svg {...glyphSVGProps}>
      <path d="M3 8l13-4 13 4-13 4z" />
      <path d="M8 11v9c0 1.5 3.5 3 8 3s8-1.5 8-3v-9" />
      <path d="M29 8v9" />
      <circle cx="29" cy="19" r="1.3" fill="#c5a57e" />
    </svg>
  );
}
function GlyphPlay() {
  return (
    <svg {...glyphSVGProps}>
      <rect x="3" y="9" width="26" height="16" rx="5" />
      <circle cx="10" cy="17" r="1.6" fill="#c5a57e" />
      <line x1="22" y1="14" x2="22" y2="20" />
      <line x1="19" y1="17" x2="25" y2="17" />
      <line x1="9"  y1="6"  x2="9"  y2="9"  />
      <line x1="23" y1="6"  x2="23" y2="9"  />
    </svg>
  );
}
function GlyphSimulate() {
  return (
    <svg {...glyphSVGProps}>
      <circle cx="16" cy="16" r="11" />
      <path d="M5 16c4-3 7-3 11 0s7 3 11 0" />
      <circle cx="16" cy="16" r="2" fill="#c5a57e" />
      <line x1="16" y1="5" x2="16" y2="27" />
    </svg>
  );
}
function GlyphMonitor() {
  return (
    <svg {...glyphSVGProps}>
      <path d="M3 17c2 0 2-5 4-5s2 8 4 8 3-12 5-12 3 10 5 10 2-4 4-4 2 3 4 3" />
      <circle cx="16" cy="16" r="13" />
    </svg>
  );
}

const GLYPH_MAP: Record<string, React.ReactNode> = {
  learn:    <GlyphLearn />,
  play:     <GlyphPlay />,
  simulate: <GlyphSimulate />,
  monitor:  <GlyphMonitor />,
};

/* ── Decorative helpers ──────────────────────────────────── */

function GoldDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 18px" }}>
      <div style={{ width: 52, height: 1, background: "linear-gradient(90deg, #632024, #c5a57e)" }} />
      <div style={{ width: 5, height: 5, background: "#c5a57e", transform: "rotate(45deg)" }} />
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #c5a57e, transparent)" }} />
    </div>
  );
}

function CenterDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, maxWidth: 280, margin: "18px auto 0" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #c5a57e)" }} />
      <div style={{ width: 5, height: 5, background: "#c5a57e", transform: "rotate(45deg)", flexShrink: 0 }} />
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #c5a57e, transparent)" }} />
    </div>
  );
}

function CornerOrnaments() {
  const b = "2.5px solid #c5a57e";
  const dot: React.CSSProperties = { position: "absolute", width: 5, height: 5, borderRadius: "50%", background: "#c5a57e" };
  return (
    <>
      <div style={{ position: "absolute", top: -1, left:  -1, width: 22, height: 22, borderTop: b, borderLeft:  b, borderRadius: "4px 0 0 0" }} />
      <div style={{ position: "absolute", top: -1, right: -1, width: 22, height: 22, borderTop: b, borderRight: b, borderRadius: "0 4px 0 0" }} />
      <div style={{ position: "absolute", bottom: -1, left:  -1, width: 22, height: 22, borderBottom: b, borderLeft:  b, borderRadius: "0 0 0 4px" }} />
      <div style={{ position: "absolute", bottom: -1, right: -1, width: 22, height: 22, borderBottom: b, borderRight: b, borderRadius: "0 0 4px 0" }} />
      <div style={{ ...dot, top: -3, left: "50%", transform: "translateX(-50%)" }} />
      <div style={{ ...dot, bottom: -3, left: "50%", transform: "translateX(-50%)" }} />
      <div style={{ ...dot, left: -3, top: "50%", transform: "translateY(-50%)" }} />
      <div style={{ ...dot, right: -3, top: "50%", transform: "translateY(-50%)" }} />
    </>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();
  const isAR    = locale === "ar";
  const [step,       setStep      ] = useState(0);
  const [isMuted,    setIsMuted   ] = useState(true);
  const [hasPlayed,  setHasPlayed ] = useState(false);
  const [hoveredChar,setHoveredChar] = useState<string | null>(null);

  const scrollY = useScrollY();

  const { ref: featRef, inView: featInView } = useInView();
  const { ref: howRef,  inView: howInView  } = useInView();
  const { ref: charRef, inView: charInView } = useInView();
  const { ref: ctaRef,  inView: ctaInView  } = useInView(0.2);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 5; i++) ts.push(setTimeout(() => setStep(s => Math.max(s, i)), 300 * i));
    return () => ts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (!hasPlayed) {
      setHasPlayed(true); setIsMuted(false);
      videoRef.current.muted = false; videoRef.current.play();
    } else {
      const next = !isMuted;
      setIsMuted(next); videoRef.current.muted = next;
    }
  };
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const next = !isMuted; setIsMuted(next); videoRef.current.muted = next;
  };

  const enter = (s: number, delay = 0): React.CSSProperties => ({
    opacity:   step >= s ? 1 : 0,
    transform: step >= s ? "translateY(0)" : "translateY(14px)",
    transition: `opacity .7s ease ${delay}s, transform .7s ease ${delay}s`,
  });

  const reveal = (visible: boolean, i: number): React.CSSProperties => ({
    opacity:   visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity .65s ease ${i * 0.09}s, transform .65s ease ${i * 0.09}s`,
  });

  /* ── Button styles ── */
  const btnPrimary: React.CSSProperties = {
    fontFamily: cinzel, fontSize: 13, fontWeight: 700, letterSpacing: 0.8,
    padding: "13px 28px", borderRadius: 10, border: "none", cursor: "pointer",
    color: "#f5ede0", background: "linear-gradient(135deg, #632024, #8B2635)",
    boxShadow: "0 4px 20px rgba(99,32,36,.35), inset 0 1px 0 rgba(255,255,255,.1)",
    transition: "all .25s ease",
  };
  const btnPrimarySm: React.CSSProperties = {
    fontFamily: cinzel, fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
    padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer",
    color: "#f5ede0", background: "linear-gradient(135deg, #632024, #8B2635)",
    boxShadow: "0 2px 10px rgba(99,32,36,.25)", transition: "all .25s ease",
  };
  const btnSecondary: React.CSSProperties = {
    fontFamily: cinzel, fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
    padding: "13px 28px", borderRadius: 10, cursor: "pointer",
    color: "#632024", background: "rgba(99,32,36,.06)",
    border: "1.5px solid rgba(99,32,36,.3)", transition: "all .25s ease",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#E3DAC9", fontFamily: crimson, color: "#3e1316", position: "relative" }}>

      <style>{`
        @keyframes gridMove   { 0% { background-position: 0 0; } 100% { background-position: 44px 44px; } }
        @keyframes videoPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.015); } }
        @keyframes scrollBnce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
        @keyframes playPulse  { 0%,100% { box-shadow: 0 0 0 0 rgba(232,212,188,.35); } 50% { box-shadow: 0 0 0 14px rgba(232,212,188,0); } }
        @keyframes dotPulse   { 0%,100% { box-shadow: 0 0 0 0 rgba(139,38,53,.5); } 50% { box-shadow: 0 0 0 5px rgba(139,38,53,0); } }
        @keyframes ringPulse  { 0%,100% { opacity:.5; transform:scale(1); } 50% { opacity:1; transform:scale(1.04); } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>

      {/* ── Fixed atmospheric background with parallax ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", width: 700, height: 700, top: -200, left: -200,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(99,32,36,.09), transparent 65%)",
          filter: "blur(40px)", transform: `translateY(${scrollY * 0.08}px)`, transition: "transform .1s linear",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, bottom: -200, right: -200,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(197,165,126,.14), transparent 65%)",
          filter: "blur(40px)", transform: `translateY(${scrollY * -0.05}px)`, transition: "transform .1s linear",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(45deg, rgba(99,32,36,.04) 0 1px, transparent 1px 22px)",
          animation: "gridMove 18s linear infinite",
        }} />
        <div style={{ position: "absolute", right: -120, top: 60, opacity: 0.04 }}>
          <DesignWatermark size={600} />
        </div>
      </div>

      {/* ════════════════════════════════════════
          § 1  HERO
          ════════════════════════════════════════ */}
      <section style={{
        position: "relative", zIndex: 1,
        display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "space-between",
        padding: "calc(5rem + 76px) 4rem 4rem", maxWidth: 1440, margin: "0 auto",
      }}>

        {/* —— Left copy —— */}
        <div style={{ maxWidth: 570, flex: "1 1 460px", paddingTop: "4rem", paddingLeft: "4rem" }}>

          {/* Badge with pulsing dot */}
          <div style={{
            ...enter(1),
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 16px", borderRadius: 99,
            background: "rgba(197,165,126,.18)", border: "1px solid rgba(197,165,126,.4)",
            fontFamily: cinzel, fontWeight: 600, fontSize: 9.5, letterSpacing: 2.5, color: "#632024",
            marginBottom: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B2635", animation: "dotPulse 2s ease-in-out infinite" }} />
            Cybersecurity Awareness
          </div>

          {/* H1 */}
          <h1 style={{
            ...enter(1, 0.05),
            fontFamily: cinzel, fontWeight: 900,
            fontSize: "clamp(3rem, 5vw, 4.2rem)",
            lineHeight: 1.02, letterSpacing: "-0.5px", margin: "20px 0 6px",
          }}>
            <span style={{ color: "#3e1316" }}>Cyber</span>
            <span style={{ color: "#8B2635" }}> Majlis</span>
          </h1>

          {isAR && (
            <div style={{ ...enter(1, 0.1), fontFamily: crimson, fontSize: 24, color: "#a07060", direction: "rtl", marginBottom: 4 }}>
              المجلس السيبراني
            </div>
          )}

          <div style={enter(2, 0.15)}><GoldDivider /></div>

          <p style={{
            ...enter(2, 0.2),
            fontFamily: crimson, fontSize: "1.15rem", fontStyle: "italic",
            color: "#5a2428", lineHeight: 1.55, fontWeight: 400,
          }}>
            {isAR
              ? "أكاديمية قطر الأولى للأمن السيبراني بأسلوب اللعب والمحاكاة. أتقن الأطر الدولية من خلال سيناريوهات مستوحاة من بنيتنا التحتية الوطنية الحيوية وادافع عن الوطن إلى جانب زملائك في المجلس."
              : "Qatar's first gamified cybersecurity academy. Master international frameworks through scenarios drawn from our critical national infrastructure and defend the realm alongside fellow Majlis members."}
          </p>

          <div style={{ ...enter(3, 0.25), display: "flex", gap: 14, marginTop: 28 }}>
            <button
              onClick={() => router.push("/auth?signup=true")}
              style={btnPrimary}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,32,36,.4), inset 0 1px 0 rgba(255,255,255,.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,32,36,.35), inset 0 1px 0 rgba(255,255,255,.1)"; }}
            >
              SIGN UP
            </button>
            <button
              onClick={() => router.push("/auth")}
              style={btnSecondary}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,32,36,.13)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,32,36,.06)"; e.currentTarget.style.transform = ""; }}
            >
              LOG IN
            </button>
          </div>

          <div style={{ ...enter(4, 0.3), marginTop: 14 }}>
            <a
              onClick={() => router.push("/games")}
              style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 13, color: "rgba(90,36,40,.6)", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "#632024"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(90,36,40,.6)"; }}
            >
              Join as a Guest
            </a>
          </div>
        </div>

        {/* —— Right: video card —— */}
        <div style={{
          ...enter(3),
          transition: "opacity .8s cubic-bezier(.34,1.2,.64,1), transform .8s cubic-bezier(.34,1.2,.64,1)",
          position: "relative", flex: "0 0 auto", marginRight: "4rem",
        }}>
          {/* Halo glow */}
          <div style={{
            position: "absolute", inset: -30, borderRadius: 30,
            background: "radial-gradient(circle, rgba(197,165,126,.35), transparent 65%)",
            filter: "blur(16px)", pointerEvents: "none",
          }} />

          <div
            onClick={handleVideoClick}
            style={{
              position: "relative", width: 320, height: 560, borderRadius: 22,
              border: "2px solid rgba(99,32,36,.35)", overflow: "hidden",
              background: "#2c1010", cursor: "pointer",
              boxShadow: "0 32px 80px rgba(99,32,36,.22), 0 0 0 1px rgba(197,165,126,.2), inset 0 1px 0 rgba(255,255,255,.3)",
            }}
          >
            {/* Dark texture behind video */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #3e1316, #1d0708)" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(135deg, rgba(232,212,188,.03) 0 1px, transparent 1px 14px), repeating-linear-gradient(45deg, rgba(197,165,126,.05) 0 1px, transparent 1px 22px)" }} />

            <video
              ref={videoRef}
              src="/hamad.mp4"
              autoPlay loop muted={isMuted}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", animation: "videoPulse 5s ease-in-out infinite" }}
            />

            {/* Play overlay (before first interaction) */}
            {!hasPlayed && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
                background: "linear-gradient(180deg, rgba(62,19,22,.15), rgba(62,19,22,.6))",
              }}>
                <div style={{
                  width: 76, height: 76, borderRadius: "50%",
                  border: "1.5px solid rgba(232,212,188,.85)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(62,19,22,.45)", boxShadow: "0 0 0 6px rgba(232,212,188,.1)",
                  animation: "playPulse 2.2s ease-in-out infinite",
                }}>
                  <div style={{ width: 0, height: 0, marginLeft: 5, borderLeft: "16px solid #E8D4BC", borderTop: "10px solid transparent", borderBottom: "10px solid transparent" }} />
                </div>
                <div style={{ fontFamily: cinzel, fontSize: 11, letterSpacing: 4, color: "#E8D4BC", fontWeight: 700 }}>WATCH INTRO</div>
              </div>
            )}

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, rgba(62,19,22,.82), transparent)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: cinzel, fontSize: 8.5, letterSpacing: "0.15em", color: "rgba(232,212,188,.65)", fontWeight: 600 }}>YOUR GUIDE</span>
              <span style={{ fontFamily: cinzel, fontSize: 14, letterSpacing: 1.4, color: "#E8D4BC", fontWeight: 700 }}>HAMAD</span>
            </div>

            {hasPlayed && (
              <button onClick={toggleMute} style={{
                position: "absolute", bottom: 12, right: 12, borderRadius: "50%",
                padding: 7, cursor: "pointer", background: "rgba(62,19,22,.75)",
                border: "1px solid rgba(197,165,126,.3)", color: "#E8D4BC",
                backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            )}
          </div>

          <CornerOrnaments />
        </div>

        {/* Scroll cue */}
        <div style={{
          ...enter(5, 0.8),
          position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontFamily: cinzel, fontSize: 9, letterSpacing: 3, color: "rgba(99,32,36,.5)", fontWeight: 600 }}>SCROLL</span>
          <ChevronDown size={14} color="#c5a57e" style={{ animation: "scrollBnce 1.6s ease-in-out infinite", opacity: 0.7 }} />
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 2  FEATURES
          ════════════════════════════════════════ */}
      <section
        id="about"
        ref={featRef as React.RefObject<HTMLElement>}
        style={{
          position: "relative", zIndex: 1,
          padding: "96px 4rem",
          background: "rgba(62,19,22,.03)",
          borderTop: "1px solid rgba(197,165,126,.3)",
          borderBottom: "1px solid rgba(197,165,126,.3)",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 56px" }}>
          <div style={{ fontFamily: cinzel, fontSize: 9, letterSpacing: 3, color: "#c5a57e", fontWeight: 600, marginBottom: 12 }}>
            WHAT IS CYBERMAJLIS?
          </div>
          <h2 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#3e1316", margin: 0 }}>
            Four ways to learn
          </h2>
          <CenterDivider />
          <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: "1.05rem", color: "#5a2428", marginTop: 18, lineHeight: 1.55 }}>
            {isAR
              ? "منهج مبني على أربعة ركائز — كل منها مستند إلى سيناريوهات قطرية واقعية والمعايير الدولية التي تحكمها."
              : "A curriculum built on four pillars each grounded in real Qatari scenarios and the international standards that govern them."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22, maxWidth: 1080, margin: "0 auto" }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              ...reveal(featInView, i),
              background: "rgba(255,255,255,.45)", border: "1.5px solid rgba(197,165,126,.2)",
              borderRadius: 16, padding: 28, backdropFilter: "blur(8px)",
              boxShadow: "0 2px 12px rgba(99,32,36,.06)",
            }}>
              {/* Glyph icon container */}
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "rgba(197,165,126,.15)", border: "1px solid rgba(197,165,126,.3)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
              }}>
                {GLYPH_MAP[f.Glyph]}
              </div>
              <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 14, letterSpacing: 1.5, color: "#3e1316" }}>
                {isAR ? f.titleAr : f.title}
              </div>
              <div style={{ height: 1, background: "linear-gradient(90deg, #c5a57e, transparent)", margin: "12px 0 14px" }} />
              <p style={{ fontFamily: crimson, fontSize: 14, color: "#5a2428", lineHeight: 1.55, margin: 0 }}>
                {isAR ? f.descAr : f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 3  HOW IT WORKS
          ════════════════════════════════════════ */}
      <section
        ref={howRef as React.RefObject<HTMLElement>}
        style={{
          position: "relative", zIndex: 1,
          padding: "96px 4rem 104px",
          borderBottom: "1px solid rgba(197,165,126,.15)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,32,36,.05), transparent)" }} />
        <div style={{ position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)", opacity: 0.04 }}>
          <DesignWatermark size={380} />
        </div>

        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 72px" }}>
          <div style={{ fontFamily: cinzel, fontSize: 9, letterSpacing: 3, color: "#c5a57e", fontWeight: 600, marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#3e1316", margin: 0 }}>Your Path to Mastery</h2>
          <CenterDivider />
          <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: "1.05rem", color: "#5a2428", marginTop: 18, lineHeight: 1.55 }}>
            {isAR
              ? "ثلاث خطوات بسيطة تحوّلك من مبتدئ إلى محترف في الأمن السيبراني."
              : "Three simple steps from curious beginner to confident cyber defender."}
          </p>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
          <div style={{
            position: "absolute", top: 36, left: "18%", right: "18%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(197,165,126,.5) 20%, rgba(197,165,126,.5) 80%, transparent)",
            zIndex: 0,
          }} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {HOW_IT_WORKS.map((s, i) => {
              const StepIcon = s.Icon;
              return (
                <div key={i} style={{
                  ...reveal(howInView, i),
                  flex: "1 1 240px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  textAlign: "center", padding: "0 24px", position: "relative", zIndex: 1,
                }}>
                  <div style={{ position: "relative", marginBottom: 24 }}>
                    <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "1px solid rgba(197,165,126,.3)", animation: howInView ? `ringPulse 3s ease-in-out ${i * 0.8}s infinite` : "none" }} />
                    <div style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: "linear-gradient(135deg, #632024, #8B2635)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 8px 24px rgba(99,32,36,.32), inset 0 1px 0 rgba(255,255,255,.15)",
                    }}>
                      <span style={{ fontFamily: cinzel, fontSize: 13, fontWeight: 700, color: "#f5ede0", letterSpacing: "1.5px" }}>{s.num}</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16, color: "#8B2635", opacity: 0.85 }}>
                    <StepIcon size={26} strokeWidth={1.5} />
                  </div>
                  <div style={{ fontFamily: cinzel, fontSize: 15, fontWeight: 700, color: "#3e1316", marginBottom: 14 }}>
                    {isAR ? s.titleAr : s.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, width: "100%", justifyContent: "center" }}>
                    <div style={{ height: 1, width: 32, background: "linear-gradient(90deg, transparent, #c5a57e)" }} />
                    <div style={{ width: 4, height: 4, background: "#c5a57e", transform: "rotate(45deg)" }} />
                    <div style={{ height: 1, width: 32, background: "linear-gradient(90deg, #c5a57e, transparent)" }} />
                  </div>
                  <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: "0.93rem", color: "#5a2428", lineHeight: 1.7, margin: 0 }}>
                    {isAR ? s.descAr : s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 4  CHARACTERS
          ════════════════════════════════════════ */}
      <section
        id="majlis"
        ref={charRef as React.RefObject<HTMLElement>}
        style={{ position: "relative", zIndex: 1, padding: "96px 4rem", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", left: -140, top: "50%", transform: "translateY(-50%)", opacity: 0.04 }}>
          <DesignWatermark size={420} />
        </div>

        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 56px" }}>
          <div style={{ fontFamily: cinzel, fontSize: 9, letterSpacing: 3, color: "#c5a57e", fontWeight: 600, marginBottom: 12 }}>YOUR GUIDES</div>
          <h2 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#3e1316", margin: 0 }}>Meet the Guardians</h2>
          <CenterDivider />
          <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: "1.05rem", color: "#5a2428", marginTop: 18, lineHeight: 1.55 }}>
            {isAR
              ? "أربعة حرّاس قطريون — كل منهم متخصص في مجال مختلف من الأمن السيبراني."
              : "Four mentors lead your training. Each represents a discipline of the craft — pick the one whose path speaks to you first."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 22, maxWidth: 960, margin: "0 auto" }}>
          {CHARS.map((c, i) => {
            const hovered = hoveredChar === c.id;
            return (
              <div key={c.id}
                onMouseEnter={() => setHoveredChar(c.id)}
                onMouseLeave={() => setHoveredChar(null)}
                style={{
                  ...reveal(charInView, i),
                  borderRadius: 18, padding: 20,
                  backdropFilter: "blur(8px)",
                  background: hovered ? `rgba(${c.rgb},0.07)` : "rgba(255,255,255,.45)",
                  border:     hovered ? `1.5px solid ${c.accent}55` : "1.5px solid rgba(197,165,126,.2)",
                  transform:  charInView ? (hovered ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(1)") : "translateY(28px)",
                  boxShadow:  hovered
                    ? `0 0 0 2.5px ${c.accent}55, 0 0 28px rgba(${c.rgb},.25), 0 20px 56px rgba(${c.rgb},.2)`
                    : "0 2px 12px rgba(99,32,36,.06)",
                  transition: charInView
                    ? `opacity .65s ease ${i * .09}s, transform .3s cubic-bezier(.34,1.2,.64,1), box-shadow .3s ease, border-color .3s ease, background .3s ease`
                    : `opacity .65s ease ${i * .09}s, transform .65s ease ${i * .09}s`,
                  opacity: charInView ? 1 : 0,
                }}
              >
                {/* Character image */}
                <div style={{
                  height: 200, borderRadius: 12, position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, overflow: "hidden",
                  background: `rgba(${c.rgb},.10)`,
                  transition: "background .3s ease",
                }}>
                  <img
                    src={c.img}
                    alt={c.name}
                    style={{
                      width: "100%", height: "100%", objectFit: "contain", padding: 10,
                      transition: "transform .4s cubic-bezier(.34,1.2,.64,1)",
                      transform: hovered ? "scale(1.08)" : "scale(1)",
                    }}
                  />
                </div>

                <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 15, letterSpacing: 1.2, color: "#3e1316" }}>
                  {isAR ? c.nameAr : c.name}
                </div>
                {isAR && (
                  <div style={{ fontFamily: crimson, fontSize: 14, color: "#a07060", direction: "rtl", marginTop: 2 }}>{c.name}</div>
                )}
                <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 99, marginTop: 10, background: `rgba(${c.rgb},.12)`, border: `1px solid rgba(${c.rgb},.25)`, fontFamily: cinzel, fontSize: 9, letterSpacing: 1.5, fontWeight: 700, color: c.accent }}>
                  {isAR ? c.roleAr : c.role}
                </div>
                <div style={{ height: 1, background: `linear-gradient(90deg, ${c.accent}66, transparent)`, margin: "12px 0 10px" }} />
                <p style={{ fontFamily: crimson, fontSize: 13, color: "#5a2428", lineHeight: 1.5, margin: 0 }}>
                  {isAR ? c.descAr : c.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 5  CTA STRIP
          ════════════════════════════════════════ */}
      <section
        id="community"
        ref={ctaRef as React.RefObject<HTMLElement>}
        style={{
          position: "relative", zIndex: 1,
          padding: "96px 4rem", textAlign: "center",
          borderTop: "1px solid rgba(197,165,126,.3)",
          borderBottom: "1px solid rgba(197,165,126,.3)",
          background: "rgba(62,19,22,.04)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,32,36,.07), transparent 65%)", filter: "blur(60px)", pointerEvents: "none" }} />

        <div style={{
          position: "relative",
          opacity: ctaInView ? 1 : 0,
          transform: ctaInView ? "translateY(0)" : "translateY(32px)",
          transition: "opacity .8s ease, transform .8s ease",
          maxWidth: 720, margin: "0 auto",
        }}>
          <div style={{ fontFamily: cinzel, fontSize: 9, letterSpacing: 3, color: "#c5a57e", fontWeight: 600, marginBottom: 12 }}>JOIN THE MAJLIS</div>
          <h2 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#3e1316", margin: "8px 0 0" }}>
            {isAR ? "قطر تحتاج جيلها القادم من المدافعين." : "Qatar needs its next generation of defenders."}
          </h2>
          <CenterDivider />
          <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: "1.05rem", color: "#5a2428", marginTop: 18, lineHeight: 1.55 }}>
            {isAR
              ? "يُغلق التسجيل في الفوج الثالث خلال 14 يوماً. احجز مقعدك في المجلس."
              : "Cohort 03 enrollment closes in 14 days. Claim your seat at the Majlis."}
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 28, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/auth?signup=true")}
              style={btnPrimary}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(99,32,36,.45), inset 0 1px 0 rgba(255,255,255,.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,32,36,.35), inset 0 1px 0 rgba(255,255,255,.1)"; }}
            >
              BEGIN YOUR TRAINING
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              style={btnSecondary}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,32,36,.13)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,32,36,.06)"; e.currentTarget.style.transform = ""; }}
            >
              EXPLORE THE CURRICULUM
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          § 6  FOOTER  (dark maroon)
          ════════════════════════════════════════ */}
      <footer style={{
        position: "relative", zIndex: 1,
        padding: "80px 4rem 0",
        background: "linear-gradient(180deg, #3e1316 0%, #2a0c0e 100%)",
        color: "#E8D4BC",
        borderTop: "1px solid rgba(197,165,126,.25)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem" }}>

            {/* Brand column */}
            <div style={{ maxWidth: 320 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <Mark size={48} />
              </div>
              {isAR && (
                <div style={{ fontFamily: crimson, fontSize: 16, color: "rgba(232,212,188,.55)", direction: "rtl", marginTop: 8 }}>
                  المجلس السيبراني
                </div>
              )}
              <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 14, color: "rgba(232,212,188,.72)", lineHeight: 1.55, marginTop: 18, maxWidth: 280 }}>
                {isAR
                  ? "أكاديمية قطر في الأمن السيبراني. تأسست في الدوحة، بُنيت للمنطقة، كُتبت للعالم."
                  : "Qatar's gamified cybersecurity academy. Founded in Doha, built for the region, written for the world."}
              </p>
              <div style={{ height: 1, width: 60, background: "#c5a57e", margin: "20px 0 14px" }} />
              <div style={{ fontFamily: cinzel, fontSize: 9, letterSpacing: 2, color: "#c5a57e", fontWeight: 600 }}>
                QATAR · CYBERSECURITY EDUCATION
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map(({ title, items }) => (
              <div key={title}>
                <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 11, letterSpacing: 2.5, color: "#c5a57e", marginBottom: 18 }}>
                  {title}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        onClick={() => router.push(href)}
                        style={{ fontFamily: crimson, fontSize: "0.95rem", color: "rgba(232,212,188,.78)", textDecoration: "none", cursor: "pointer", transition: "color .2s ease" }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.color = "#E8D4BC"; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(232,212,188,.78)"; }}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "24px 0", marginTop: 56,
            borderTop: "1px solid rgba(197,165,126,.18)",
            flexWrap: "wrap", gap: 12,
          }}>
            <span style={{ fontFamily: crimson, fontStyle: "italic", fontSize: "0.82rem", color: "rgba(232,212,188,.55)" }}>
              © {new Date().getFullYear()} CyberMajlis · Founded in Doha
            </span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {["Privacy Policy", "Terms of Use", "Accessibility"].map((label, i) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {i > 0 && <span style={{ color: "rgba(232,212,188,.3)" }}>·</span>}
                  <a
                    href="#"
                    style={{ fontFamily: crimson, fontSize: "0.82rem", color: "rgba(232,212,188,.5)", textDecoration: "none", transition: "color .2s ease" }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = "rgba(232,212,188,.85)"; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(232,212,188,.5)"; }}
                  >
                    {label}
                  </a>
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
