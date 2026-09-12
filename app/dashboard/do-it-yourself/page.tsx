"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Guide from "@/components/cyber/Guide";

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

  /* The arrow is pulled out of the label so it can sit in a box of a known
     width. The description is then indented by that same width, which lands
     it exactly under the B of Back whatever the font does with the glyph. */
  const backLabel = t("backToDashboard");
  const arrowMatch = backLabel.match(/^([←→]\s*)(.+)$/);
  const backArrow = arrowMatch ? arrowMatch[1].trim() : "";
  const backText = arrowMatch ? arrowMatch[2] : backLabel;

  return (
    <main
      className="diy-wrap"
      style={{
        minHeight: "100vh",
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

        /* A title and a line under it, then the room stretched full width
           beneath them. No frames on the words: the only framed thing on the
           page is the picture. */
        .diy-wrap {
          display: flex; flex-direction: column; gap: .5rem;
          /* ClientLayout hides the navbar on this route, so there is nothing
             overhead to clear. The top margin just matches the sides. */
          padding: 1.4rem 1.2rem 2.4rem;
          /* how far in the B of "Back" sits, and so the description too */
          --indent: 1.6rem;
          /* The room and the words are the same width, so their edges line up. */
          --room: min(100%, 1600px);
        }


        .diy-stage {
          position: relative;
          flex: none;
          min-width: 0;
          margin-inline: auto;
          box-sizing: border-box;
          /* The picture is 1672 x 941. The box is 829 tall instead of 941,
             which is an inch shorter at a normal window width. The height is
             taken off the box and the picture compresses into it rather than
             being cropped: the four hotspots are percentages of this box, and
             cropping would slide them off their devices. */
          aspect-ratio: 1672 / 829;
          width: var(--room);
          border: 10px solid #4a1a1d;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(74,26,29,0.28), inset 0 0 0 2px rgba(197,165,126,0.55);
        }
        .diy-side {
          width: var(--room); margin-inline: auto;
          text-align: start;
        }
        /* Small, because it is a way out and not a heading. It got its size
           from being the only text up here; Hamad and Rouda carry that now. */
        .diy-back {
          display: inline-block;
          font-family: var(--ui);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a1a1d;
          text-decoration: none;
          transition: color .2s;
        }
        .diy-back:hover { color: #8B2635; }
        .diy-arrow { display: inline-block; width: var(--indent); }
        @media (max-width: 700px) {
          .diy-tooltip { font-size: 0.72rem; }
          .diy-back { font-size: 0.72rem; }
        }
      `}</style>

      <div className="diy-side">
        <Link href="/dashboard" className="diy-back">
          {backArrow && <span className="diy-arrow">{backArrow}</span>}
          {backText}
        </Link>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto 1.4rem", padding: "0 1.5rem" }}>
        <Guide lines={[
          { who: "rouda",
            en: "This is an ordinary room. Every device in it is one you probably own, and every one of them can be set up more safely than it came out of the box.",
            ar: "هذه غرفة عادية. وكل جهاز فيها جهاز تملكه على الأرجح، وكل واحد منها يمكن ضبطه أأمن مما خرج به من علبته." },
          { who: "hamad",
            en: "Tap anything you recognise and I will walk you through your own settings, step by step.",
            ar: "المس أي شيء تعرفه، وسأمشي معك في إعداداتك أنت، خطوة خطوة." },
        ]} />
      </div>

      <div className="diy-stage">
        <img
          src="/cybermajlis-room.png"
          alt="Interactive CyberMajlis room"
          style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }}
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
