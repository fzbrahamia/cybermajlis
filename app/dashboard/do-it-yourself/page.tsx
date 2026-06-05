"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Device = {
  id: string;
  label: string;
  top: string;
  left: string;
  width: string;
  height: string;
  radius: string;
};

const devices: Device[] = [
  {
    id: "camera",
    label: "Smart Camera",
    top: "9%",
    left: "74.5%",
    width: "80px",
    height: "80px",
    radius: "50%",
  },
  {
    id: "tv",
    label: "Smart TV",
    top: "34%",
    left: "60%",
    width: "340px",
    height: "155px",
    radius: "12px",
  },
  {
    id: "router",
    label: "Wi-Fi Router",
    top: "75%",
    left: "47%",
    width: "190px",
    height: "75px",
    radius: "999px",
  },
  {
    id: "lock",
    label: "Smart Lock",
    top: "47%",
    left: "83%",
    width: "80px",
    height: "120px",
    radius: "18px",
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
  padding: 0.65rem 0.9rem;
  border-radius: 14px;
  white-space: nowrap;
  font-size: 0.9rem;
  box-shadow: 0 14px 35px rgba(0,0,0,0.3);
  transition: all 0.2s ease;
  border: 1px solid rgba(197,165,126,0.35);
  z-index: 10;
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


          .diy-tooltip {
  top: 58px;
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
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
      color: "#3e1316",
            justifyContent:"center",
            display:"flex"
          }}
        >
          Explore the CyberMajlis room. Hover over a glowing device to see its name, then click to start the lesson.
        </h1>

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
  width: device.width,
  height: device.height,
  borderRadius: device.radius,
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


