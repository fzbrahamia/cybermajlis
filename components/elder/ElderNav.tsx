"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const cinzel = "var(--ui)";

const links = {
  en: [
    { href: "/elder",          label: "Home"      },
    { href: "/elder/lessons",  label: "Learn"     },
    { href: "/elder/scanner",  label: "Check a Link" },
    { href: "/elder/news",     label: "News"      },
    { href: "/elder/community",label: "Community" },
  ],
  ar: [
    { href: "/elder",          label: "الرئيسية"  },
    { href: "/elder/lessons",  label: "تعلّم"     },
    { href: "/elder/scanner",  label: "افحص رابطاً" },
    { href: "/elder/news",     label: "الأخبار"   },
    { href: "/elder/community",label: "المجتمع"   },
  ],
};

interface Props { lang: "en" | "ar"; onLangChange: (l: "en" | "ar") => void; }

export default function ElderNav({ lang, onLangChange }: Props) {
  const pathname = usePathname();
  const nav = links[lang];
  const isRtl = lang === "ar";

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(62,19,22,0.97)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(197,165,126,0.25)",
      direction: isRtl ? "rtl" : "ltr",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: 80,
        gap: "1.5rem",
      }}>
        {/* Logo */}
        <Link href="/elder" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img src="/logo.png" alt="CyberMajlis" style={{ height: 68 }} />
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          {nav.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{
                fontFamily: cinzel,
                fontSize: "1rem",
                fontWeight: active ? 700 : 500,
                color: active ? "#E8D4BC" : "rgba(232,212,188,0.6)",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: 999,
                background: active ? "rgba(197,165,126,0.15)" : "transparent",
                border: active ? "1px solid rgba(197,165,126,0.3)" : "1px solid transparent",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Lang toggle */}
        <button
          onClick={() => onLangChange(lang === "en" ? "ar" : "en")}
          style={{
            fontFamily: cinzel,
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#E8D4BC",
            background: "rgba(197,165,126,0.12)",
            border: "1px solid rgba(197,165,126,0.35)",
            borderRadius: 999,
            padding: "0.45rem 1rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {lang === "en" ? "عربي" : "EN"}
        </button>
      </div>
    </nav>
  );
}
