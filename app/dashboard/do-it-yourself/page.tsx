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
      className="diy-wrap"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#FCF6EA",
        fontFamily: "var(--ui)",
        direction: isRtl ? "rtl" : "ltr",
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
        .diy-tooltip span { display: block; font-family: var(--ui); font-weight: 700; font-size: 0.72rem; letter-spacing: 0.04em; }
        .diy-tooltip small { display: block; color: #c5a57e; font-size: 0.68rem; margin-top: 0.12rem; }
        .diy-hotspot:hover .diy-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }

        /* The back button and the note used to be fixed on top of the room,
           which put them over the picture. They now live in a column of their
           own and the room gives up exactly that much width. */
        .diy-wrap {
          display: flex; flex-direction: column; gap: .8rem;
          padding: 5.4rem 1.2rem 1rem;
        }


        .diy-stage {
          position: relative;
          flex: 1 1 auto;
          min-width: 0;
          margin-inline: auto;
          box-sizing: border-box;
          aspect-ratio: 1672 / 941;
          /* Whichever limit binds first: the page width, or the height left
             under the header. */
          width: min(100%, calc((100vh - 10rem) * 1672 / 941));
          border: 10px solid #4a1a1d;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(74,26,29,0.28), inset 0 0 0 2px rgba(197,165,126,0.55);
        }
        .diy-side {
          flex: none;
          display: flex; align-items: center; gap: .9rem; flex-wrap: wrap;
          width: 100%; max-width: 1180px; margin-inline: auto;
        }
        .diy-back {
          z-index: 50;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-family: var(--ui);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #E8D4BC;
          background: linear-gradient(135deg, #4a1a1d, #632024);
          border: 1px solid rgba(197,165,126,0.45);
          padding: 0.55rem 1rem;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 700;
          box-shadow: 0 6px 20px rgba(0,0,0,0.45);
          white-space: nowrap;
        }
        .diy-hint {
          z-index: 50;
          flex: 1 1 18rem;
          max-width: 42rem;
          background: linear-gradient(155deg, rgba(255,253,249,0.98) 0%, rgba(247,238,225,0.95) 100%);
          color: #6a4640;
          border: 1px solid rgba(197,165,126,0.5);
          border-radius: 14px;
          padding: 0.7rem 0.9rem;
          font-family: var(--ui);
          font-size: 0.82rem;
          line-height: 1.45;
          backdrop-filter: blur(6px);
          box-shadow:
            0 10px 22px rgba(62,19,22,0.30),
            0 20px 44px rgba(62,19,22,0.16),
            inset 0 1px 0 rgba(255,255,255,0.75),
            inset 0 -1px 0 rgba(99,32,36,0.08);
        }

        @media (max-width: 700px) {
          .diy-tooltip { font-size: 0.72rem; }
          .diy-hint { max-width: 210px; font-size: 0.75rem; }
        }
      `}</style>

      <div className="diy-side">
        <Link href="/dashboard" className="diy-back">
          {t("backToDashboard")}
        </Link>
        <div className="diy-hint">
          {t("roomIntro")}
        </div>
      </div>

      <div className="diy-stage">
        <img
          src="/cybermajlis-room.png"
          alt="Interactive CyberMajlis room"
          style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
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
    </main>
  );
}
