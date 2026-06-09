"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { globalLessonStyles, lessons, lessonsAr, pageShellStyle } from "./lessonData";

export default function DeviceLessonPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("DIY");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const deviceId = params.device as string;
  const lesson = (isRtl ? lessonsAr : lessons)[deviceId];

  if (!lesson) {
    return (
      <main style={pageShellStyle}>
        <style>{globalLessonStyles}</style>
        <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
          <Link href="/dashboard/do-it-yourself" className="back-btn">
            {t("backToRoom")}
          </Link>
          <h1 style={{ marginTop: "1rem" }}>{t("lessonNotFound")}</h1>
        </div>
      </main>
    );
  }

  const openMode = (mode: "video" | "reading" | "checklist") => {
    router.push(`/dashboard/do-it-yourself/${deviceId}/${mode}`);
  };

  return (
    <main
      style={{
        ...pageShellStyle,
        padding: "0 2rem 2rem",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      <style>{globalLessonStyles}</style>

      {/* Sticky sub-header */}
      <div
        style={{
          position: "sticky",
          top: 80,
          zIndex: 20,
          background: "rgba(227,218,201,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(99,32,36,0.1)",
          padding: "0.55rem 0",
          margin: "0 -2rem 1.2rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Link href="/dashboard/do-it-yourself" className="back-btn" style={{ flexShrink: 0 }}>
          {t("backToRoom")}
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(1rem, 2vw, 1.4rem)",
              margin: 0,
              color: "#3e1316",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {lesson.title}
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#5C4033", margin: 0, lineHeight: 1.4 }}>
            {lesson.description}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <section>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.95rem",
              marginBottom: "0.8rem",
              color: "#3e1316",
            }}
          >
            {t("chooseHowToLearn")}
          </h2>

          <div
            className="choice-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "1rem",
            }}
          >
            <button
              onClick={() => openMode("video")}
              className="lesson-card"
              style={{ background: "#fdf8f4", color: "#3e1316" }}
            >
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.05rem", margin: "0 0 0.4rem" }}>
                {t("watchVideo")}
              </h3>
              <p style={{ color: "#5C4033", lineHeight: 1.5, fontSize: "0.85rem", margin: 0 }}>
                {t("watchVideoDesc")}
              </p>
            </button>

            <button
              onClick={() => openMode("reading")}
              className="lesson-card"
              style={{ background: "#fffaf6", color: "#3e1316" }}
            >
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.05rem", margin: "0 0 0.4rem" }}>
                {t("readSteps")}
              </h3>
              <p style={{ color: "#5C4033", lineHeight: 1.5, fontSize: "0.85rem", margin: 0 }}>
                {t("readStepsDesc")}
              </p>
            </button>

            <button
              onClick={() => openMode("checklist")}
              className="lesson-card"
              style={{
                background: "linear-gradient(135deg, #3e1316, #632024)",
                color: "#E8D4BC",
              }}
            >
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.05rem", margin: "0 0 0.4rem" }}>
                {t("quickChecklist")}
              </h3>
              <p style={{ color: "rgba(232,212,188,0.78)", lineHeight: 1.5, fontSize: "0.85rem", margin: 0 }}>
                {t("quickChecklistDesc")}
              </p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
