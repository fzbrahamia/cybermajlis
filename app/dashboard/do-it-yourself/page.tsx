"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

type Device = {
  id: string;
  labelKey: string;
  top: string;
  left: string;
  width: string;
  height: string;
  radius: string;
};

const devices: Device[] = [
  { id: "camera", labelKey: "camera", top: "9%",  left: "74.5%", width: "80px",  height: "80px",  radius: "50%"   },
  { id: "tv",     labelKey: "tv",     top: "34%", left: "60%",   width: "340px", height: "155px", radius: "12px"  },
  { id: "router", labelKey: "router", top: "75%", left: "47%",   width: "190px", height: "75px",  radius: "999px" },
  { id: "lock",   labelKey: "lock",   top: "47%", left: "83%",   width: "80px",  height: "120px", radius: "18px"  },
];

export default function DoItYourselfPage() {
  const router = useRouter();
  const t = useTranslations("DIY");
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#E3DAC9",
        padding: "80px 2rem 2rem",
        color: "#3e1316",
        fontFamily: "'Crimson Pro', Georgia, serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

        .diy-hotspot {
          position: absolute;
          transform: translate(-50%, -50%);
          border: none;
          background: transparent;
          box-shadow: none;
          cursor: pointer;
          padding: 0;
        }
        .diy-hotspot:hover {
          background: transparent;
          box-shadow: none;
          transform: translate(-50%, -50%);
        }
        .diy-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          margin-top: 10px;
          transform: translateX(-50%) translateY(-6px);
          opacity: 0;
          pointer-events: none;
          background: rgba(62, 19, 22, 0.96);
          color: #E8D4BC;
          padding: 0.55rem 0.8rem;
          border-radius: 12px;
          white-space: nowrap;
          font-size: 0.82rem;
          box-shadow: 0 14px 35px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
          border: 1px solid rgba(197,165,126,0.35);
          z-index: 10;
        }
        .diy-tooltip span { display: block; font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.72rem; letter-spacing: 0.04em; }
        .diy-tooltip small { display: block; color: #c5a57e; font-size: 0.68rem; margin-top: 0.12rem; }
        .diy-hotspot:hover .diy-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }

        .diy-sub-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          padding: 0;
          margin-top: 2rem;
        }

        @media (max-width: 700px) {
          main { padding: 80px 1rem 1rem !important; }
          .diy-sub-header { padding: 1rem 0 0.6rem; }
          .diy-tooltip { font-size: 0.72rem; top: 58px; }
        }
      `}</style>

      {/* Sticky sub-header with back button */}
      <div className="diy-sub-header" style={{ direction: isRtl ? "rtl" : "ltr" }}>
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#E8D4BC",
            background: "linear-gradient(135deg, #3e1316, #632024)",
            border: "1px solid rgba(197,165,126,0.45)",
            padding: "0.5rem 0.9rem",
            borderRadius: 999,
            textDecoration: "none",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(62,19,22,0.2)",
            whiteSpace: "nowrap",
          }}
        >
          {t("backToDashboard")}
        </Link>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#5C4033", lineHeight: 1.5 }}>
          {t("roomIntro")}
        </p>
      </div>

      <div style={{ maxWidth: 1500, margin: "0 auto", paddingTop: "0.5rem" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 24px 70px rgba(62,19,22,0.35)",
            border: "1px solid rgba(99,32,36,0.2)",
            background: "#3e1316",
          }}
        >
          <img
            src="/cybermajlis-room.png"
            alt="Interactive CyberMajlis room"
            style={{ width: "100%", display: "block" }}
          />

          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => router.push(`/dashboard/do-it-yourself/${device.id}`)}
              aria-label={`Start ${t(`devices.${device.labelKey}`)} lesson`}
              className="diy-hotspot"
              style={{
                top: device.top,
                left: device.left,
                width: device.width,
                height: device.height,
                borderRadius: device.radius,
              }}
            >
              <span className="diy-tooltip">
                <span>{t(`devices.${device.labelKey}`)}</span>
                <small>{t("startLesson")}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
