"use client";

/* Chrome for the innovation track. Majlis level, so it wears the Majlis
   surfaces and sits above all three majalis rather than inside one.
   components/ui/NavBar belongs to CyberMajlis, one level down. */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { MajlisMark } from "@/components/majlis/MajlisChrome";
import { M, sans, mono, display } from "./theme";

/* Learn sits first on purpose. The two tracks grow together, and knowledge is
   the one that gates: you cannot judge a limitation you cannot explain. */
const TABS = [
  { href: "/learn",       en: "Learn",       ar: "تعلّم" },
  { href: "/sundus",      en: "Sundus",      ar: "سندس" },
  { href: "/investigate", en: "Investigate", ar: "حقّق" },
  { href: "/problems",    en: "Problems",    ar: "المشكلات" },
  { href: "/passport",    en: "Passport",    ar: "الجواز" },
];

export function InnovationHeader() {
  const isAR = useLocale() === "ar";
  const router = useRouter();
  const pathname = usePathname();

  // Longest match wins, so /investigate/log still lights the Investigate tab.
  const active = TABS.map(t => t.href)
    .filter(h => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const switchLocale = () => {
    document.cookie = `locale=${isAR ? "en" : "ar"}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 60,
        background: "rgba(252,246,234,.94)",
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${M.line}`,
      }}
    >
      <div style={{
        maxWidth: 1240, margin: "0 auto",
        padding: "0 clamp(16px,4vw,34px)", height: 64,
        display: "flex", alignItems: "center", gap: 20,
      }}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}
        >
          <MajlisMark size={22} />
          <span style={{
            fontFamily: display(isAR),
            fontSize: isAR ? 17 : 15, fontWeight: 900,
            letterSpacing: isAR ? 0 : "0.10em",
            textTransform: isAR ? "none" : "uppercase",
            color: M.heading,
          }}>
            {isAR ? "مجلس" : "Majlis"}
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2.4vw,24px)", flex: 1, minWidth: 0, overflowX: "auto" }}>
          {TABS.map(tab => {
            const on = tab.href === active;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  fontFamily: display(isAR),
                  fontSize: isAR ? 15 : 13,
                  fontWeight: 700,
                  color: on ? M.action : M.body,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  paddingBottom: 2,
                  borderBottom: on ? `2px solid ${M.action}` : "2px solid transparent",
                }}
              >
                {isAR ? tab.ar : tab.en}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={switchLocale}
          aria-label={isAR ? "English" : "العربية"}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            minHeight: 38, padding: "0 13px", cursor: "pointer",
            background: "transparent", border: `1px solid ${M.line}`,
            borderRadius: 999, color: M.body,
            fontFamily: mono, fontSize: 11, letterSpacing: "0.08em",
            flexShrink: 0,
          }}
        >
          <Globe size={14} />
          {isAR ? "EN" : "AR"}
        </button>

        <span
          aria-hidden
          style={{
            width: 32, height: 32, borderRadius: "50%", background: M.gold,
            display: "grid", placeItems: "center", flexShrink: 0,
            fontFamily: sans, fontSize: 13, fontWeight: 800, color: M.cream,
          }}
        >
          M
        </span>
      </div>
    </header>
  );
}

/** Wraps every page in the track: one surface, one type family, no dark bands. */
export function InnovationPage({ children }: { children: React.ReactNode }) {
  const isAR = useLocale() === "ar";
  return (
    <div style={{
      minHeight: "100vh",
      background: M.page,
      fontFamily: display(isAR),
      color: M.body,
      direction: isAR ? "rtl" : "ltr",
    }}>
      <InnovationHeader />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(22px,3.4vw,36px) clamp(16px,4vw,34px) 80px" }}>
        {children}
      </main>
    </div>
  );
}
