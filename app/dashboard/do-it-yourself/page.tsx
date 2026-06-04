"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Device = {
  id: string;
  label: string;
  top: string;
  left: string;
};

const devices: Device[] = [
  {
    id: "camera",
    label: "Smart Camera",
    top: "9%",
    left: "74.5%",
  },
  {
    id: "tv",
    label: "Smart TV",
    top: "36%",
    left: "60%",
  },
  {
    id: "router",
    label: "Wi-Fi Router",
    top: "75%",
    left: "47%",
  },
  {
    id: "lock",
    label: "Smart Lock",
    top: "47%",
    left: "83%",
  },

];

export default function DoItYourselfPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#E3DAC9",
        padding: "2rem",
        color: "#3e1316",
        fontFamily: "'Crimson Pro', Georgia, serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

        .diy-hotspot {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 78px;
          height: 78px;
          border-radius: 50%;
          border: 2px solid #FFD36A;
          background: rgba(255, 211, 106, 0.12);
          box-shadow: 0 0 26px rgba(255, 211, 106, 0.95);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .diy-hotspot:hover {
          transform: translate(-50%, -50%) scale(1.08);
          background: rgba(255, 211, 106, 0.22);
          box-shadow: 0 0 36px rgba(255, 211, 106, 1), 0 0 0 8px rgba(255, 211, 106, 0.13);
        }

        .diy-tooltip {
        position: absolute;
        top: 92px;
        left: 50%;
        transform: translateX(-50%) translateY(-8px);
        opacity: 0;
        pointer-events: none;
        background: rgba(62, 19, 22, 0.96);
        color: #E8D4BC;
        padding: 0.65rem 0.9rem;
        border-radius: 14px;
        white-space: nowrap;
        font-size: 0.9rem;
        box-shadow: 0 14px 35px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
        border: 1px solid rgba(197,165,126,0.35);
        }

        .diy-hotspot:hover .diy-tooltip {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
        }

        .diy-tooltip span {
          display: block;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.04em;
        }

        .diy-tooltip small {
          display: block;
          color: #c5a57e;
          font-size: 0.72rem;
          margin-top: 0.15rem;
        }

        .diy-hotspot:hover .diy-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        @media (max-width: 700px) {
          main {
            padding: 1rem !important;
          }

          .diy-hotspot {
            width: 48px;
            height: 48px;
          }

          .diy-tooltip {
            bottom: 58px;
            font-size: 0.75rem;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1500, margin: "0 auto", paddingTop: "5rem" }}>
  <Link
    href="/dashboard"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.3rem",
      fontFamily: "'Cinzel', serif",
      fontSize: "0.75rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#E8D4BC",
      background: "linear-gradient(135deg, #3e1316, #632024)",
      border: "1px solid rgba(197,165,126,0.45)",
      padding: "0.7rem 1rem",
      borderRadius: 999,
      marginBottom: "1rem",
      textDecoration: "none",
      fontWeight: 700,
      boxShadow: "0 8px 24px rgba(62,19,22,0.22)",
    }}
  >
    ← Back to Dashboard
  </Link>

  <h1
    style={{
      fontFamily: "'Cinzel', serif",
      fontSize: "clamp(2rem, 4vw, 3.5rem)",
      marginBottom: "0.5rem",
      color: "#3e1316",
      justifyContent: "center",
      display: "flex",
    }}
  >
    Do It Yourself
  </h1>

        <p
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.1rem",
            color: "#5C4033",
            justifyContent:"center",
            display:"flex"
          }}
        >
          Explore the CyberMajlis room. Hover over a glowing device to see its name, then click to start the lesson.
        </p>

        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 24px 70px rgba(62,19,22,0.35)",
            border: "1px solid rgba(99,32,36,0.2)",
            background: "#3e1316",
          }}
        >
          <img
            src="/cybermajlis-room.png"
            alt="Interactive CyberMajlis room"
            style={{
              width: "100%",
              display: "block",
            }}
          />

          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => router.push(`/dashboard/do-it-yourself/${device.id}`)}
              aria-label={`Start ${device.label} lesson`}
              title={`${device.label} - Start Lesson`}
              className="diy-hotspot"
              style={{
                top: device.top,
                left: device.left,
              }}
            >
              <span className="diy-tooltip">
                <span>{device.label}</span>
                <small>Start Lesson</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}


