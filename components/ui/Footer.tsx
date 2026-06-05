"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const cinzel  = '"Cinzel", "Trajan Pro", Georgia, serif';
const crimson = '"Crimson Pro", "Crimson Text", Georgia, serif';

const NAV_LINKS = [
  { label: "Play",       href: "/games"     },
  { label: "Learn",      href: "/dashboard" },
  { label: "Connect",    href: "/community" },
  { label: "Scan",       href: "/scan"      },
  { label: "News",       href: "/news"      },
  { label: "SOC",        href: "/soc"       },
];

export default function Footer() {
  const router = useRouter();
  const locale = useLocale();
  const isAR = locale === "ar";

  return (
    <footer style={{
      padding: "48px 4rem",
      background: "linear-gradient(180deg, #3e1316 0%, #2a0c0e 100%)",
      borderTop: "1px solid rgba(197,165,126,.25)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "3rem", flexWrap: "wrap",
      }}>

        {/* Brand */}
        <div style={{ maxWidth: 280 }}>
          <img
            src={isAR ? "/logoAr.png" : "/logoEn.png"}
            alt="CyberMajlis"
            style={{ height: 36, width: "auto", marginBottom: 14 }}
          />
          <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 13.5, color: "rgba(232,212,188,.65)", lineHeight: 1.6, margin: 0 }}>
            {isAR
              ? "أكاديمية قطر في الأمن السيبراني. تأسست في الدوحة، بُنيت للمنطقة."
              : "Qatar's gamified cybersecurity academy. Founded in Doha, built for the region."}
          </p>
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "12px 32px" }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              onClick={() => router.push(href)}
              style={{
                fontFamily: cinzel, fontSize: 11, fontWeight: 700,
                letterSpacing: 2, color: "rgba(232,212,188,.6)",
                textDecoration: "none", cursor: "pointer",
                transition: "color .2s ease",
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "#c5a57e"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(232,212,188,.6)"; }}
            >
              {label}
            </a>
          ))}
        </nav>

      </div>
    </footer>
  );
}
