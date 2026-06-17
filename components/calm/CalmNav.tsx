"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const links = {
  en: [
    { href: "/calm",          label: "Home"         },
    { href: "/calm/lessons",  label: "Lessons"      },
    { href: "/calm/games",    label: "Games"        },
    { href: "/calm/ctf",      label: "Flag Finders" },
    { href: "/calm/scanner",  label: "Check a Link" },
  ],
  ar: [
    { href: "/calm",          label: "الرئيسية"     },
    { href: "/calm/lessons",  label: "الدروس"       },
    { href: "/calm/games",    label: "الألعاب"      },
    { href: "/calm/ctf",      label: "صائدو الأعلام" },
    { href: "/calm/scanner",  label: "افحص رابطاً"  },
  ],
};

interface Props { lang: "en" | "ar"; onLangChange: (l: "en" | "ar") => void; }

export default function CalmNav({ lang, onLangChange }: Props) {
  const pathname = usePathname();
  const nav = links[lang];
  const isRtl = lang === "ar";

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "#1A3A5C",
      borderBottom: "3px solid #3B82F6",
      direction: isRtl ? "rtl" : "ltr",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: 72,
        gap: "1.5rem",
      }}>
        {/* Logo */}
        <Link href="/calm" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img src="/logo.png" alt="CyberMajlis" style={{ height: 60 }} />
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {nav.map(link => {
            const active = pathname === link.href || (link.href !== "/calm" && pathname?.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} style={{
                fontFamily: sans,
                fontSize: "1.05rem",
                fontWeight: active ? 700 : 500,
                color: active ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                textDecoration: "none",
                padding: "0.5rem 1.1rem",
                borderRadius: 12,
                background: active ? "rgba(255,255,255,0.15)" : "transparent",
                border: active ? "2px solid rgba(255,255,255,0.3)" : "2px solid transparent",
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
            fontFamily: sans,
            fontSize: "1rem",
            fontWeight: 700,
            color: "#FFFFFF",
            background: "rgba(255,255,255,0.12)",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 12,
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
