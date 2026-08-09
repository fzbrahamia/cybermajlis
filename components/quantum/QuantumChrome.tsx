"use client";

/* Quantum Majlis chrome. Its own, like the Majlis roof, because this is a
   different majlis and not part of the CyberMajlis site. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { Q, INK, BODY, LINE, PAGE, display, mono, bodyFont } from "./theme";

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
}

export function QuantumHeader() {
  const isAR = useLocale() === "ar";
  const router = useRouter();

  const switchLocale = () => {
    setLocaleCookie(isAR ? "en" : "ar");
    router.refresh();
  };

  return (
    <header style={{
      position: "fixed", top: 0, insetInlineStart: 0, insetInlineEnd: 0, zIndex: 80,
      background: "rgba(240,245,241,.88)", backdropFilter: "saturate(180%) blur(18px)",
      borderBottom: `1px solid ${LINE}`,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 clamp(18px,4vw,36px)",
        height: 62, display: "flex", alignItems: "center", gap: 14,
      }}>
        <Link href="/quantum" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span aria-hidden style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            background: `radial-gradient(circle at 34% 30%, ${Q.soft}, ${Q.mid} 60%, ${Q.deep})`,
            boxShadow: `0 0 0 3px ${Q.tint}`,
          }} />
          <span style={{ fontFamily: display(isAR), fontWeight: 900, fontSize: isAR ? 19 : 18, color: INK }}>
            {isAR ? "مجلس الكم" : "Quantum"}
            {!isAR && <span style={{ color: Q.mid }}>Majlis</span>}
          </span>
        </Link>

        <a
          href="/"
          style={{
            marginInlineStart: "auto", textDecoration: "none",
            fontFamily: mono, fontSize: 9.5, letterSpacing: "0.16em", color: BODY,
            padding: "7px 14px", borderRadius: 99, border: `1px solid ${LINE}`,
          }}
        >
          {isAR ? "مجلس" : "MAJLIS"}
        </a>

        <button
          onClick={switchLocale}
          aria-label={isAR ? "Switch to English" : "Switch to Arabic"}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
            background: Q.tint, border: `1px solid ${Q.mid}44`, borderRadius: 99,
            padding: "7px 13px", color: Q.deep, fontFamily: mono,
            fontSize: 9.5, fontWeight: 500, letterSpacing: "0.14em",
          }}
        >
          <Globe size={12} />
          {isAR ? "EN" : "AR"}
        </button>
      </div>
    </header>
  );
}

export function QuantumFooter() {
  const isAR = useLocale() === "ar";
  return (
    <footer style={{ background: PAGE, borderTop: `1px solid ${LINE}`, padding: "26px clamp(18px,4vw,36px)" }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap",
        gap: 14, alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: bodyFont, fontSize: 14.5, fontStyle: "italic", color: BODY }}>
          {isAR
            ? "حيث يخذلك الحدس، يتقدّم المعلّم."
            : "Where intuition fails, a teacher leads."}
        </span>
        <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: "0.16em", color: BODY, opacity: 0.7 }}>
          {isAR ? "آمن بالتصميم" : "SECURE BY DESIGN"}
        </span>
      </div>
    </footer>
  );
}
