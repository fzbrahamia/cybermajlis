"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export default function HomePage() {
  const router = useRouter();
  const [animateStep, setAnimateStep] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = useTranslations("Home");
  const locale = useLocale();

  useEffect(() => {
    [0,1,2,3,4].forEach((_, i) => setTimeout(() => setAnimateStep(i + 1), 300 * (i + 1)));
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#E3DAC9", fontFamily: "'Crimson Pro', Georgia, serif", position: "relative", overflow: "hidden" }}>

      {/* ── Atmospheric background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Radial glow top-left */}
        <div style={{ position: "absolute", width: 700, height: 700, top: -200, left: -150, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,32,36,.09), transparent 65%)", filter: "blur(40px)" }} />
        {/* Radial glow bottom-right */}
        <div style={{ position: "absolute", width: 500, height: 500, bottom: -100, right: -80, borderRadius: "50%", background: "radial-gradient(circle, rgba(197,165,126,.14), transparent 65%)", filter: "blur(40px)" }} />
        {/* Animated grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(45deg, rgba(99,32,36,0.04) 0px, rgba(99,32,36,0.04) 1px, transparent 1px, transparent 22px)",
          backgroundSize: "22px 22px",
          animation: "gridMove 18s linear infinite",
        }} />
        {/* Large faint Arabic-style geometric watermark */}
        <svg style={{ position: "absolute", right: -60, top: "50%", transform: "translateY(-50%)", opacity: 0.04, width: 600, height: 600 }} viewBox="0 0 200 200">
          <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="#632024" strokeWidth="1.5"/>
          <polygon points="100,25 175,62 175,138 100,175 25,138 25,62" fill="none" stroke="#632024" strokeWidth="1"/>
          <polygon points="100,40 160,70 160,130 100,160 40,130 40,70" fill="none" stroke="#c5a57e" strokeWidth="1"/>
          <circle cx="100" cy="100" r="55" fill="none" stroke="#632024" strokeWidth="0.8"/>
          <circle cx="100" cy="100" r="38" fill="none" stroke="#c5a57e" strokeWidth="0.8"/>
          <line x1="100" y1="10" x2="100" y2="190" stroke="#632024" strokeWidth="0.5"/>
          <line x1="10" y1="100" x2="190" y2="100" stroke="#632024" strokeWidth="0.5"/>
          <line x1="25" y1="25" x2="175" y2="175" stroke="#c5a57e" strokeWidth="0.4"/>
          <line x1="175" y1="25" x2="25" y2="175" stroke="#c5a57e" strokeWidth="0.4"/>
        </svg>
      </div>

      {/* ── Main layout ── */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 4rem 4rem", gap: "5rem", flexWrap: "wrap" }}>

        {/* ── LEFT: Video card ── */}
        <div style={{
          opacity: animateStep >= 3 ? 1 : 0,
          transform: animateStep >= 3 ? "translateY(0) scale(1)" : "translateY(24px) scale(0.95)",
          transition: "all 0.8s cubic-bezier(0.34,1.2,0.64,1)",
          position: "relative", flexShrink: 0,
        }}>
          {/* Full perimeter frame connecting the corners */}
          <div style={{ position: "absolute", inset: -8, borderRadius: 26, border: "1px solid rgba(197,165,126,.25)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: -14, borderRadius: 30, border: "1px solid rgba(197,165,126,.1)", pointerEvents: "none" }} />
          <div style={{
            position: "absolute", inset: -12, borderRadius: 28,
            background: "linear-gradient(135deg, rgba(197,165,126,.25), rgba(99,32,36,.15))",
            filter: "blur(16px)", zIndex: -1,
          }} />
          {/* Card */}
          <div style={{
            width: 300, height: 520, borderRadius: 22, overflow: "hidden",
            border: "2px solid rgba(99,32,36,.35)",
            boxShadow: "0 32px 80px rgba(99,32,36,.22), 0 0 0 1px rgba(197,165,126,.2), inset 0 1px 0 rgba(255,255,255,.3)",
            position: "relative",
          }}>
            <video ref={videoRef} src="/hamad.mp4" autoPlay loop muted={isMuted}
              style={{ width: "100%", height: "100%", objectFit: "cover", animation: "videoPulse 5s ease-in-out infinite" }}
            />
            {/* Bottom gradient overlay */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to top, rgba(62,19,22,.7), transparent)" }} />
            {/* Guide label */}
            <div style={{
              position: "absolute", bottom: 14, left: 16, right: 48,
              fontFamily: "'Cinzel', serif", fontSize: 11, color: "rgba(232,212,188,.9)",
              letterSpacing: "0.15em", fontWeight: 600,
            }}>
              {t("guide")}
            </div>
            {/* Mute button */}
            <button onClick={() => setIsMuted(!isMuted)}
              style={{
                position: "absolute", bottom: 12, right: 12,
                borderRadius: "50%", padding: 7, cursor: "pointer",
                background: "rgba(62,19,22,.75)", border: "1px solid rgba(197,165,126,.3)",
                color: "#E8D4BC", backdropFilter: "blur(6px)", display: "flex",
              }}>
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
          {/* Corner ornaments — larger to complete the frame */}
          <div style={{ position: "absolute", top: -8, left: -8, width: 24, height: 24, borderTop: "2.5px solid #c5a57e", borderLeft: "2.5px solid #c5a57e", borderRadius: "4px 0 0 0" }} />
          <div style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderTop: "2.5px solid #c5a57e", borderRight: "2.5px solid #c5a57e", borderRadius: "0 4px 0 0" }} />
          <div style={{ position: "absolute", bottom: -8, left: -8, width: 24, height: 24, borderBottom: "2.5px solid #c5a57e", borderLeft: "2.5px solid #c5a57e", borderRadius: "0 0 0 4px" }} />
          <div style={{ position: "absolute", bottom: -8, right: -8, width: 24, height: 24, borderBottom: "2.5px solid #c5a57e", borderRight: "2.5px solid #c5a57e", borderRadius: "0 0 4px 0" }} />
          {/* Side mid-points to complete the frame */}
          <div style={{ position: "absolute", top: "50%", left: -8, transform: "translateY(-50%)", width: 5, height: 5, background: "#c5a57e", borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: "50%", right: -8, transform: "translateY(-50%)", width: 5, height: 5, background: "#c5a57e", borderRadius: "50%" }} />
          <div style={{ position: "absolute", left: "50%", top: -8, transform: "translateX(-50%)", width: 5, height: 5, background: "#c5a57e", borderRadius: "50%" }} />
          <div style={{ position: "absolute", left: "50%", bottom: -8, transform: "translateX(-50%)", width: 5, height: 5, background: "#c5a57e", borderRadius: "50%" }} />
        </div>

        {/* ── RIGHT: Text content ── */}
        <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>

          {/* Badge */}
          <div style={{
            opacity: animateStep >= 1 ? 1 : 0,
            transform: animateStep >= 1 ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.6s ease",
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 16px", borderRadius: 99,
            background: "rgba(197,165,126,.18)", border: "1px solid rgba(197,165,126,.4)",
            fontFamily: "'Cinzel', serif", fontSize: 9.5, letterSpacing: "2.5px",
            color: "#632024", fontWeight: 600, marginBottom: 20,
          }}>
            {t("badge")}
          </div>

          {/* Title */}
          <h1 style={{
            opacity: animateStep >= 1 ? 1 : 0,
            transform: animateStep >= 1 ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.9s ease 0.1s",
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(3rem, 5vw, 4.2rem)",
            lineHeight: 1.05, letterSpacing: "-0.5px",
            margin: "0 0 6px",
          }}>
            <span style={{ color: "#3e1316", fontWeight: 900 }}>Cyber</span>
            <span style={{ color: "#8B2635", fontWeight: 700 }}> Majlis</span>
          </h1>

          {/* Arabic title */}
          <div style={{
            opacity: animateStep >= 1 ? 1 : 0,
            transition: "all 0.9s ease 0.15s",
            fontFamily: "'Crimson Pro', serif", fontSize: "1.1rem",
            color: "#a07060", fontStyle: "italic", letterSpacing: "0.05em",
            marginBottom: 10, direction: "rtl",
          }}>
            المجلس السيبراني
          </div>

          {/* Gold divider */}
          <div style={{
            opacity: animateStep >= 2 ? 1 : 0,
            transition: "all 0.6s ease 0.2s",
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20, width: "100%",
          }}>
            <div style={{ height: 1.5, width: 52, background: "linear-gradient(90deg, #632024, #c5a57e)", borderRadius: 2 }} />
            <div style={{ width: 5, height: 5, background: "#c5a57e", transform: "rotate(45deg)", borderRadius: 1 }} />
            <div style={{ height: 1.5, flex: 1, background: "linear-gradient(90deg, #c5a57e, transparent)", borderRadius: 2 }} />
          </div>

          {/* Subtitle */}
          <p style={{
            opacity: animateStep >= 2 ? 1 : 0,
            transform: animateStep >= 2 ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.8s ease 0.2s",
            fontFamily: "'Crimson Pro', serif", fontSize: "1.15rem",
            lineHeight: 1.8, color: "#5a2428", fontStyle: "italic",
            margin: "0 0 28px",
          }}>
            {t("subtitle")}
          </p>

          {/* Stats strip */}
          <div style={{
            opacity: animateStep >= 3 ? 1 : 0,
            transform: animateStep >= 3 ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.7s ease 0.3s",
            display: "flex", gap: 20, marginBottom: 32,
            padding: "12px 20px", borderRadius: 12,
            background: "rgba(99,32,36,.06)", border: "1px solid rgba(99,32,36,.1)",
          }}>
            {[
              { icon: "📚", val: "4", label: "Lessons", ar: "دروس" },
              { icon: "🎮", val: "10", label: "Games", ar: "ألعاب" },
              { icon: "⚔️", val: "7", label: "Simulations", ar: "محاكاة" },
              { icon: "🛡️", val: "Live", label: "SOC", ar: "مباشر" },
            ].map(({ icon, val, label, ar }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, color: "#632024" }}>{val}</span>
                <span style={{ fontSize: 9, color: "#8B6050", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
                <span style={{ fontSize: 9, color: "#a07060", fontFamily: "'Crimson Pro', serif", fontStyle: "italic" }}>{ar}</span>
              </div>
            ))}
          </div>

          {/* Buttons row */}
          <div style={{
            opacity: animateStep >= 4 ? 1 : 0,
            transform: animateStep >= 4 ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.7s ease 0.4s",
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            {/* Start Learning — primary */}
            <button onClick={() => router.push("/auth")}
              style={{
                padding: "13px 32px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #632024, #8B2635)",
                color: "#f5ede0", fontFamily: "'Cinzel', serif", fontSize: 13,
                fontWeight: 700, letterSpacing: "1px",
                boxShadow: "0 4px 20px rgba(99,32,36,.35), inset 0 1px 0 rgba(255,255,255,.1)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,32,36,.4), inset 0 1px 0 rgba(255,255,255,.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,32,36,.35), inset 0 1px 0 rgba(255,255,255,.1)"; }}
            >
              Start Learning →
              <span style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 11, opacity: 0.7, marginLeft: 4 }}>/ ابدأ</span>
            </button>

            {/* Play Games — secondary */}
            <button onClick={() => router.push("/games")}
              style={{
                padding: "12px 22px", borderRadius: 10, cursor: "pointer",
                border: "1.5px solid rgba(99,32,36,.25)",
                background: "rgba(99,32,36,.07)", color: "#632024",
                fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,32,36,.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,32,36,.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(99,32,36,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <img src="/icons/games.gif" alt="" style={{ width: 18, height: 18 }} />
              </div>
              <span>Play Games</span>
              <span style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 11, opacity: 0.6 }}>/ العاب</span>
            </button>

            {/* Live SOC — tertiary */}
            <button onClick={() => router.push("/soc")}
              style={{
                padding: "12px 20px", borderRadius: 10, cursor: "pointer",
                border: "1.5px solid rgba(39,174,96,.35)",
                background: "rgba(39,174,96,.08)", color: "#1a7a40",
                fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(39,174,96,.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(39,174,96,.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#27ae60", display: "inline-block", animation: "socPulse 1.8s ease-in-out infinite", flexShrink: 0 }} />
              Live SOC
              <span style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", fontSize: 11, opacity: 0.6 }}>/ مباشر</span>
            </button>
          </div>

          {/* New here hint */}
          <div style={{
            opacity: animateStep >= 5 ? 1 : 0,
            transition: "all 0.6s ease 0.5s",
            marginTop: 18,
            fontFamily: "'Crimson Pro', serif", fontSize: 13,
            color: "rgba(90,36,40,.55)", fontStyle: "italic",
          }}>
            {t("new_here")}{" "}
            <span onClick={() => router.push("/auth?signup=true")}
              style={{ color: "#632024", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, fontWeight: 600 }}>
              {t("create_account")}
            </span>{" "}{t("track")}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 44px 44px; }
        }
        @keyframes videoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        @keyframes socPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(39,174,96,.5); }
          50% { box-shadow: 0 0 0 5px rgba(39,174,96,0); }
        }
      `}</style>
    </div>
  );
}