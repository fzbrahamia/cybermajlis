"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { globalLessonStyles, lessons, pageShellStyle } from "../lessonData";

type Mode = "video" | "reading" | "checklist";

const modeTitles: Record<Mode, string> = {
  video: "Watch Video",
  reading: "Read the Steps",
  checklist: "Quick Checklist",
};

const modeIcons: Record<Mode, string> = {
  video: "🎥",
  reading: "📖",
  checklist: "✅",
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
                  background:
                    guide.label === "Windows"
                      ? "linear-gradient(135deg, #3e1316, #632024)"
                      : "#fdf8f4",
                  color: guide.label === "Windows" ? "#E8D4BC" : "#3e1316",
                  textDecoration: "none",
                  minHeight: 160,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: "0.8rem" }}>
                  {modeIcons[mode]}
                </div>

                <h2
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "1.65rem",
                    margin: 0,
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
            <h2 style={{ fontFamily: "'Cinzel', serif", marginTop: 0 }}>
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
          <section
            style={{
              background: "#fdf8f4",
              borderRadius: 24,
              padding: "1.5rem",
              border: "1px solid rgba(99,32,36,0.15)",
              boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
            }}
          >
            <h2 style={{ fontFamily: "'Cinzel', serif", marginTop: 0 }}>
              {lesson.readingTitle}
            </h2>

            <p style={{ color: "#5C4033", lineHeight: 1.7 }}>
              {lesson.readingIntro}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1.2rem",
              }}
            >
              {lesson.readingSections.map((section, index) => (
                <article key={index} className="reading-step">
                  <h3>{section.title}</h3>
                  {section.body && <p>{section.body}</p>}
                  {section.bullets && (
                    <ul>
                      {section.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
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