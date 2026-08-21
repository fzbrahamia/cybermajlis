"use client";

/* Chrome for the Majlis page only. components/ui/NavBar + Footer belong to
   CyberMajlis, one level down. Light surfaces, no dark bands. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, Menu, X } from "lucide-react";
import { M, BRANCHES, MODES, display, wordmark, crimson, mono, RADIUS } from "./theme";
import PolicyDialog from "@/components/PolicyDialog";

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
}

/** Four dots: the company, plus one per majlis. */
export function MajlisMark({ size = 26 }: { size?: number }) {
  const d = size * 0.34;
  const g = size * 0.13;
  const dots = [M.gold, BRANCHES[1].mid, BRANCHES[0].mid, BRANCHES[2].mid];
  return (
    <span aria-hidden style={{ display: "grid", gridTemplateColumns: `repeat(2, ${d}px)`, gap: g }}>
      {dots.map((c, i) => (
        <span key={i} style={{ width: d, height: d, borderRadius: "50%", background: c }} />
      ))}
    </span>
  );
}

export function MajlisHeader() {
  const isAR = useLocale() === "ar";
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLocale = () => {
    setLocaleCookie(isAR ? "en" : "ar");
    router.refresh();
  };

  const base: React.CSSProperties = {
    fontFamily: display(isAR),
    fontSize: isAR ? 15 : 12.5,
    fontWeight: 700,
    letterSpacing: isAR ? 0 : "0.06em",
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "color .2s ease",
  };

  return (
    <header style={{
      position: "fixed", top: 0, insetInlineStart: 0, insetInlineEnd: 0, zIndex: 80,
      background: scrolled ? "rgba(252,246,234,.95)" : "rgba(252,246,234,.75)",
      backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${scrolled ? "rgba(197,165,126,.28)" : "transparent"}`,
      boxShadow: scrolled ? "0 1px 20px rgba(58,44,28,.05)" : "none",
      transition: "background .4s ease, border-color .4s ease, box-shadow .4s ease",
    }}>
      <div style={{
        maxWidth: 1240, margin: "0 auto", padding: "0 clamp(18px,4vw,40px)",
        height: 66, display: "flex", alignItems: "center", gap: 16,
      }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <MajlisMark />
          <span style={{
            fontFamily: display(isAR), fontWeight: 900,
            fontSize: isAR ? 21 : 20, color: M.heading,
          }}>
            {isAR ? "مجلس" : "Majlis"}
          </span>
        </a>

        {/* the three majalis */}
        <nav className="mj-wide" style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 22 }}>
          {BRANCHES.map(br => (
            br.live && br.enter ? (
              <a key={br.id} href={br.enter} style={{ ...base, color: br.deep }}>
                {isAR ? br.name_ar : br.name_en}
              </a>
            ) : (
              <span key={br.id} style={{ ...base, color: M.body, opacity: 0.42, cursor: "default" }}>
                {isAR ? br.name_ar : br.name_en}
              </span>
            )
          ))}
        </nav>

        {/* modes live in the header on this page only */}
        <div className="mj-wide" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span aria-hidden style={{ width: 1, height: 20, background: M.line }} />
          {MODES.map(m => (
            <span key={m.href} style={{
              ...base, fontSize: isAR ? 14 : 11.5, color: M.body, opacity: 0.55,
              display: "inline-flex", alignItems: "center", gap: 6, cursor: "default",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.dot }} />
              {isAR ? m.ar : m.en}
            </span>
          ))}
          <button
            onClick={switchLocale}
            aria-label={isAR ? "Switch to English" : "Switch to Arabic"}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
              background: M.goldSoft, border: `1px solid ${M.gold}55`, borderRadius: RADIUS.pill,
              padding: "7px 14px", color: M.goldDeep, fontFamily: mono,
              fontSize: 10, fontWeight: 500, letterSpacing: "0.14em",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)",
            }}
          >
            <Globe size={12} />
            {isAR ? "EN" : "AR"}
          </button>
        </div>

        <button
          className="mj-burger"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          style={{
            marginInlineStart: "auto", display: "none", background: "transparent",
            border: "none", color: M.heading, cursor: "pointer", padding: 6,
          }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div style={{
          borderTop: `1px solid ${M.line}`, background: M.page,
          padding: "12px clamp(18px,4vw,40px) 20px", display: "flex", flexDirection: "column", gap: 2,
        }}>
          {BRANCHES.map(br => (
            br.live && br.enter ? (
              <a key={br.id} href={br.enter} style={{ ...base, color: br.deep, padding: "12px 0", fontSize: isAR ? 16 : 14 }}>
                {isAR ? br.name_ar : br.name_en}
              </a>
            ) : (
              <span key={br.id} style={{ ...base, color: M.body, opacity: 0.42, padding: "12px 0", fontSize: isAR ? 16 : 14 }}>
                {isAR ? br.name_ar : br.name_en}
              </span>
            )
          ))}
          <span aria-hidden style={{ height: 1, background: M.line, margin: "8px 0" }} />
          {MODES.map(m => (
            <span key={m.href} style={{
              ...base, color: M.body, opacity: 0.55, padding: "11px 0", fontSize: isAR ? 15 : 13,
              display: "inline-flex", alignItems: "center", gap: 8, cursor: "default",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.dot }} />
              {isAR ? m.ar : m.en}
            </span>
          ))}
          <button
            onClick={switchLocale}
            style={{
              marginTop: 10, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6,
              cursor: "pointer", background: M.goldSoft, border: `1px solid ${M.gold}66`,
              borderRadius: 99, padding: "8px 16px", color: M.goldDeep,
              fontFamily: display(isAR), fontSize: 12, fontWeight: 700,
            }}
          >
            <Globe size={13} />
            {isAR ? "English" : "Arabic"}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 1080px) {
          .mj-wide { display: none !important; }
          .mj-burger { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}

/** One horizontal band. Nothing repeated from the header. */
export function MajlisFooter() {
  const isAR = useLocale() === "ar";

  return (
    <footer style={{
      background: M.page, borderTop: `1px solid rgba(197,165,126,.3)`,
      padding: "30px clamp(18px,4vw,40px)",
    }}>
      <div style={{
        maxWidth: 1240, margin: "0 auto", display: "flex", flexWrap: "wrap",
        alignItems: "center", gap: "14px 26px",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
          <MajlisMark size={20} />
          <span style={{ fontFamily: display(isAR), fontWeight: 900, fontSize: 17, color: M.heading }}>
            {isAR ? "مجلس" : "Majlis"}
          </span>
        </span>

        <span style={{
          fontFamily: mono, fontSize: 9.5, fontWeight: 500,
          letterSpacing: isAR ? 0 : "0.2em", color: M.goldDeep,
        }}>
          {isAR ? "آمن بالتصميم · صُنع لقطر" : "SECURE BY DESIGN · BUILT FOR QATAR"}
        </span>

        <span style={{ marginInlineStart: "auto", fontFamily: crimson, fontSize: 15, color: M.body }}>
          <PolicyDialog accent={M.action} />
        </span>

        <span style={{ fontFamily: mono, fontSize: 10.5, color: M.body, opacity: 0.6 }}>
          © {new Date().getFullYear()} Majlis
        </span>
      </div>
    </footer>
  );
}
