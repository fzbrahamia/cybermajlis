"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { globalLessonStyles, lessons, pageShellStyle } from "../lessonData";

type Mode = "video" | "reading" | "checklist";

const modeTitles: Record<Mode, string> = {
  video: "Watch Video",
  reading: "Read the Steps",
  checklist: "Quick Checklist",
};

export default function LessonModePage() {
  const params = useParams();
  const deviceId = params.device as string;
  const mode = params.mode as Mode;
  const lesson = lessons[deviceId];

  if (!lesson || !["video", "reading", "checklist"].includes(mode)) {
    return (
      <main style={pageShellStyle}>
        <style>{globalLessonStyles}</style>
        <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
          <Link href={`/dashboard/do-it-yourself/${deviceId}`} className="back-btn">
            ← Back to options
          </Link>
          <h1>Page not found</h1>
        </div>
      </main>
    );
  }

  if (lesson.platformGuides?.length) {
    return (
      <main style={pageShellStyle}>
        <style>{globalLessonStyles}</style>

        <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
          <header style={{ marginBottom: "2rem" }}>
            <Link href={`/dashboard/do-it-yourself/${deviceId}`} className="back-btn">
              ← Back to options
            </Link>

            <h1
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(2rem, 5vw, 3.8rem)",
                margin: 0,
                color: "#3e1316",
              }}
            >
              {modeTitles[mode]}
            </h1>

            <p style={{ fontSize: "1.15rem", color: "#5C4033", lineHeight: 1.7 }}>
              Choose your device first.
            </p>
          </header>

          <div className="platform-grid">
            {lesson.platformGuides.map((guide) => (
              <Link
                key={guide.label}
                href={`/dashboard/do-it-yourself/${deviceId}/${mode}/${guide.label.toLowerCase()}`}
                className="lesson-card"
                style={{
                  background: "#fdf8f4",
                  color: "#3e1316",
                  textDecoration: "none",
                  minHeight: 150,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "1.65rem",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {guide.label}
                </h2>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageShellStyle}>
      <style>{globalLessonStyles}</style>

      <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
        <header style={{ marginBottom: "2rem" }}>
          <Link href={`/dashboard/do-it-yourself/${deviceId}`} className="back-btn">
            ← Back to options
          </Link>

          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              margin: 0,
              color: "#3e1316",
            }}
          >
            {modeTitles[mode]}
          </h1>
        </header>

        {mode === "video" && (
          <section
            style={{
              background: "#fdf8f4",
              borderRadius: 24,
              padding: "1.5rem",
              border: "1px solid rgba(99,32,36,0.15)",
              boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(1.4rem, 3vw, 2.1rem)",
                marginTop: 0,
                color: "#3e1316",
              }}
            >
              {lesson.title}
            </h2>

            <div
              style={{
                marginTop: "1rem",
                borderRadius: 20,
                overflow: "hidden",
                background: "#2a0d0f",
              }}
            >
              <video controls style={{ width: "100%", display: "block" }}>
                <source src={lesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </section>
        )}

        {mode === "reading" && (
          <ReadingJourney
            deviceId={deviceId}
            readingTitle={lesson.readingTitle}
            readingIntro={lesson.readingIntro}
            sections={lesson.readingSections}
          />
        )}

        {mode === "checklist" && (
          <ChecklistPageContent
            storageKey={`diy-checklist-${deviceId}`}
            checklistItems={lesson.checklist}
          />
        )}
      </div>
    </main>
  );
}

function ReadingJourney({
  deviceId,
  readingTitle,
  readingIntro,
  sections,
}: {
  deviceId: string;
  readingTitle: string;
  readingIntro: string;
  sections: {
    title: string;
    body?: string;
    bullets?: string[];
  }[];
}) {
  const router = useRouter();
  const [missionIndex, setMissionIndex] = useState(0);

  const getMissionTitle = (title: string) => {
    return title.replace(/^\d+\.\s*/, "");
  };

  const getWhyThisMatters = (title: string, body?: string) => {
    const text = `${title} ${body || ""}`.toLowerCase();

    if (text.includes("settings")) {
      return "This is where you can control the device’s security, privacy, updates, accounts, and connected features.";
    }

    if (text.includes("password")) {
      return "Weak or reused passwords make it easier for someone to access the device or its app without permission.";
    }

    if (text.includes("default")) {
      return "Default login details are risky because many people can guess them or find them online.";
    }

    if (text.includes("update") || text.includes("firmware") || text.includes("software")) {
      return "Updates often fix security weaknesses and improve how safely the device works.";
    }

    if (text.includes("remote access")) {
      return "Remote access can be useful, but it also creates another way into the device if it is not protected properly.";
    }

    if (text.includes("qr") || text.includes("share") || text.includes("link")) {
      return "Shared links or QR codes can give access to the wrong person if they are forwarded or exposed.";
    }

    if (text.includes("users") || text.includes("connected devices") || text.includes("accounts")) {
      return "Reviewing users and accounts helps you remove old, unknown, or unnecessary access.";
    }

    if (text.includes("official store") || text.includes("apps")) {
      return "Apps from unknown sources may collect data or behave in unsafe ways.";
    }

    if (text.includes("permissions")) {
      return "Permissions control what apps can access, such as the camera, microphone, location, or nearby devices.";
    }

    if (text.includes("casting") || text.includes("pairing")) {
      return "Open casting or pairing can let nearby devices connect or send content without enough control.";
    }

    if (text.includes("pin") || text.includes("code")) {
      return "Access codes protect physical entry, so simple or shared codes can create real security risk.";
    }

    if (text.includes("temporary")) {
      return "Temporary access is safer because it can be removed after the visitor no longer needs it.";
    }

    if (text.includes("activity history")) {
      return "Activity history helps you notice unusual access or unlock events.";
    }

    return "This helps you understand the security purpose before applying it in the checklist.";
  };

  const missions = useMemo(() => {
    return sections.map((section) => ({
      group: "Learning Journey",
      title: getMissionTitle(section.title),
      whatToDo: section.body || "",
      whyItMatters: getWhyThisMatters(section.title, section.body),
      bullets: section.bullets || [],
    }));
  }, [sections]);

  const currentMission = missions[missionIndex];
  const totalMissions = missions.length;
  const progress = Math.round(((missionIndex + 1) / totalMissions) * 100);
  const isLastMission = missionIndex === totalMissions - 1;

  const nextMission = () => {
  if (!isLastMission) {
    setMissionIndex((prev) => prev + 1);
  }
};

const previousMission = () => {
  if (missionIndex > 0) {
    setMissionIndex((prev) => prev - 1);
  }
};

  return (
    <section
      style={{
        background: "#fdf8f4",
        borderRadius: 24,
        padding: "1.5rem",
        border: "1px solid rgba(99,32,36,0.15)",
        boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
      }}
    >
      <div
        style={{
          marginBottom: "1.5rem",
          paddingBottom: "1.2rem",
          borderBottom: "1px solid rgba(99,32,36,0.12)",
        }}
      >
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            marginTop: 0,
            marginBottom: "0.5rem",
            color: "#3e1316",
            lineHeight: 1.2,
          }}
        >
          {readingTitle}
        </h2>

        <p
          style={{
            color: "#5C4033",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {readingIntro}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#8B2635",
            background: "rgba(99,32,36,0.08)",
            border: "1px solid rgba(99,32,36,0.16)",
            padding: "0.45rem 1rem",
            borderRadius: 999,
          }}
        >
          {currentMission.group}
        </div>

        <div
          style={{
            color: "#8B2635",
            fontWeight: 700,
            fontSize: "0.95rem",
          }}
        >
          Mission {missionIndex + 1} / {totalMissions}
        </div>
      </div>

      <h3
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          marginTop: 0,
          marginBottom: "0.8rem",
          color: "#3e1316",
          lineHeight: 1.2,
        }}
      >
        {currentMission.title}
      </h3>

      <div
        style={{
          height: 9,
          background: "rgba(99,32,36,0.12)",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #632024, #c5a57e)",
            transition: "width 0.25s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.2rem",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid rgba(99,32,36,0.1)",
            borderRadius: 20,
            padding: "1.4rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'Cinzel', serif",
              marginTop: 0,
              marginBottom: "0.7rem",
              color: "#3e1316",
            }}
          >
            What to do
          </h4>

          <p
            style={{
              color: "#5C4033",
              fontSize: "1.08rem",
              lineHeight: 1.8,
              marginTop: 0,
              marginBottom: currentMission.bullets.length ? "1rem" : 0,
            }}
          >
            {currentMission.whatToDo}
          </p>

          {currentMission.bullets.length > 0 && (
            <ul
              style={{
                color: "#5C4033",
                fontSize: "1.02rem",
                lineHeight: 1.9,
                margin: 0,
              }}
            >
              {currentMission.bullets.map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>

        <div
          style={{
            background: "rgba(99,32,36,0.06)",
            border: "1px solid rgba(99,32,36,0.12)",
            borderRadius: 20,
            padding: "1.4rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'Cinzel', serif",
              marginTop: 0,
              marginBottom: "0.7rem",
              color: "#3e1316",
            }}
          >
            Why this matters
          </h4>

          <p
            style={{
              color: "#5C4033",
              fontSize: "1.08rem",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {currentMission.whyItMatters}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          onClick={previousMission}
          disabled={missionIndex === 0}
          style={{
            border: "1px solid rgba(99,32,36,0.18)",
            background: missionIndex === 0 ? "rgba(99,32,36,0.06)" : "white",
            color: missionIndex === 0 ? "rgba(99,32,36,0.35)" : "#632024",
            padding: "0.75rem 1.2rem",
            borderRadius: 999,
            cursor: missionIndex === 0 ? "default" : "pointer",
            fontWeight: 700,
          }}
        >
          ← Previous
        </button>

        {!isLastMission ? (
          <button
            onClick={nextMission}
            style={{
              border: "none",
              background: "linear-gradient(135deg, #3e1316, #632024)",
              color: "#E8D4BC",
              padding: "0.75rem 1.3rem",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(62,19,22,0.22)",
            }}
          >
            I understand, next →
          </button>
        ) : (
          <button
            onClick={() => router.push(`/dashboard/do-it-yourself/${deviceId}/checklist`)}
            style={{
              border: "none",
              background: "linear-gradient(135deg, #3e1316, #632024)",
              color: "#E8D4BC",
              padding: "0.75rem 1.3rem",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(62,19,22,0.22)",
            }}
          >
            Ready to apply it? Go to Checklist →
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 800px) {
          section div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function ChecklistPageContent({
  checklistItems,
  storageKey,
}: {
  checklistItems: string[];
  storageKey: string;
}) {
  const [checked, setChecked] = useState<boolean[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setChecked(checklistItems.map((_, index) => Boolean(parsed[index])));
          return;
        }
      } catch {}
    }

    setChecked(checklistItems.map(() => false));
  }, [storageKey, checklistItems.length]);

  useEffect(() => {
    if (checked.length !== checklistItems.length) return;
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey, checklistItems.length]);

  const completed = checked.filter(Boolean).length;
  const progress = checklistItems.length
    ? Math.round((completed / checklistItems.length) * 100)
    : 0;

  return (
    <section
      style={{
        background: "#fdf8f4",
        borderRadius: 24,
        padding: "1.5rem",
        border: "1px solid rgba(99,32,36,0.15)",
        boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
      }}
    >
      <p style={{ color: "#5C4033" }}>Complete each action and tick it off.</p>

      <div
        style={{
          height: 9,
          background: "rgba(99,32,36,0.12)",
          borderRadius: 999,
          overflow: "hidden",
          margin: "1rem 0 0.5rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #632024, #c5a57e)",
            transition: "width 0.25s ease",
          }}
        />
      </div>

      <p
        style={{
          color: "#8B2635",
          fontWeight: 700,
          marginBottom: "1.2rem",
        }}
      >
        {completed}/{checklistItems.length} completed
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {checklistItems.map((step, index) => (
          <label key={index} className={`check-item ${checked[index] ? "done" : ""}`}>
            <input
              type="checkbox"
              checked={checked[index] || false}
              onChange={() => {
                setChecked((prev) => {
                  const fixed = checklistItems.map((_, i) => Boolean(prev[i]));
                  fixed[index] = !fixed[index];
                  return fixed;
                });
              }}
            />
            <span
              style={{
                color: "#3e1316",
                lineHeight: 1.6,
                textDecoration: checked[index] ? "line-through" : "none",
              }}
            >
              {step}
            </span>
          </label>
        ))}
      </div>

      {completed === checklistItems.length && (
        <div
          style={{
            marginTop: "1.2rem",
            padding: "1rem",
            borderRadius: 16,
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.25)",
            color: "#14532d",
            fontWeight: 700,
          }}
        >
          Great job! You completed this security checklist.
        </div>
      )}
    </section>
  );
}