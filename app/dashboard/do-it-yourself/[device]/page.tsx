"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { globalLessonStyles, lessons, lessonsAr, pageShellStyle } from "./lessonData";

const VIDEO_FEATURE_ENABLED = false;

export default function DeviceLessonPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("DIY");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const deviceId = params.device as string;
  const lesson = (isRtl ? lessonsAr : lessons)[deviceId];

  const ui = isRtl
    ? {
        comingSoon: "قريباً",
        videoComingSoonDesc: "سيتم إضافة درس الفيديو لاحقاً. حالياً يمكنك استخدام الدليل المصوّر أو قراءة الخطوات.",
        visualManual: "الدليل المصوّر",
        visualManualDesc: "اتبع صوراً واقعية موحدة مع شرح قصير لكل خطوة، مثل دليل استخدام واضح.",
      }
    : {
        comingSoon: "Coming Soon",
        videoComingSoonDesc:
          "The video lesson will be added later. For now, you can use the visual manual or read the steps.",
        visualManual: "Visual Manual",
        visualManualDesc:
          "Follow realistic, consistent screenshots with a short explanation for each step.",
      };

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

  const openMode = (mode: "video" | "reading" | "visual-manual" | "checklist") => {
    if (mode === "video" && !VIDEO_FEATURE_ENABLED) return;
    router.push(`/dashboard/do-it-yourself/${deviceId}/${mode}`);
  };

  return (
    <main
      style={{
        ...pageShellStyle,
        padding: "80px 2rem 2rem",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      <style>{`
        ${globalLessonStyles}

        .locked-card {
          cursor: not-allowed;
          opacity: 0.72;
          position: relative;
        }

        .locked-card:hover {
          transform: none;
          box-shadow: none;
        }

        .coming-soon-pill {
          position: absolute;
          top: 0.9rem;
          right: 0.9rem;
          background: rgba(99,32,36,0.1);
          color: #632024;
          border: 1px solid rgba(99,32,36,0.18);
          padding: 0.25rem 0.55rem;
          border-radius: 999px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        [dir="rtl"] .coming-soon-pill {
          right: auto;
          left: 0.9rem;
        }
      `}</style>

      <div style={{ maxWidth: 1150, margin: "0 auto", paddingTop: "1.8rem" }}>
        <Link href="/dashboard/do-it-yourself" className="back-btn">
          {t("backToRoom")}
        </Link>

        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
            margin: "0 0 0.3rem",
            color: "#3e1316",
          }}
        >
          {lesson.title}
        </h1>

        <p
          style={{
            fontSize: "0.88rem",
            color: "#5C4033",
            margin: "0 0 1.5rem",
            lineHeight: 1.5,
          }}
        >
          {lesson.description}
        </p>

        <section>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1.15rem",
              marginBottom: "1.2rem",
              color: "#3e1316",
              textAlign: "center",
              fontWeight: 400,
              letterSpacing: "0.04em",
            }}
          >
            {t("chooseHowToLearn")}
          </h2>

          <div
            className="choice-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "1rem",
            }}
          >
            <button
              disabled
              aria-disabled="true"
              className="lesson-card locked-card"
              style={{ background: "#f4eee8", color: "#3e1316" }}
            >
              <span className="coming-soon-pill">{ui.comingSoon}</span>

              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.05rem",
                  margin: "0 0 0.4rem",
                }}
              >
                {t("watchVideo")}
              </h3>

              <p style={{ color: "#5C4033", lineHeight: 1.5, fontSize: "0.85rem", margin: 0 }}>
                {ui.videoComingSoonDesc}
              </p>
            </button>

            <button
              onClick={() => openMode("reading")}
              className="lesson-card"
              style={{ background: "#fffaf6", color: "#3e1316" }}
            >
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.05rem",
                  margin: "0 0 0.4rem",
                }}
              >
                {t("readSteps")}
              </h3>

              <p style={{ color: "#5C4033", lineHeight: 1.5, fontSize: "0.85rem", margin: 0 }}>
                {t("readStepsDesc")}
              </p>
            </button>

            <button
              onClick={() => openMode("visual-manual")}
              className="lesson-card"
              style={{
                background: "#fdf8f4",
                color: "#3e1316",
                border: "1px solid rgba(197,165,126,0.45)",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.05rem",
                  margin: "0 0 0.4rem",
                }}
              >
                {ui.visualManual}
              </h3>

              <p style={{ color: "#5C4033", lineHeight: 1.5, fontSize: "0.85rem", margin: 0 }}>
                {ui.visualManualDesc}
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
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.05rem",
                  margin: "0 0 0.4rem",
                }}
              >
                {t("quickChecklist")}
              </h3>

              <p
                style={{
                  color: "rgba(232,212,188,0.78)",
                  lineHeight: 1.5,
                  fontSize: "0.85rem",
                  margin: 0,
                }}
              >
                {t("quickChecklistDesc")}
              </p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
// "use client";

// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useTranslations, useLocale } from "next-intl";
// import { globalLessonStyles, lessons, lessonsAr, pageShellStyle } from "./lessonData";

// export default function DeviceLessonPage() {
//   const params = useParams();
//   const router = useRouter();
//   const t = useTranslations("DIY");
//   const locale = useLocale();
//   const isRtl = locale === "ar";

//   const deviceId = params.device as string;
//   const lesson = (isRtl ? lessonsAr : lessons)[deviceId];

//   if (!lesson) {
//     return (
//       <main style={pageShellStyle}>
//         <style>{globalLessonStyles}</style>
//         <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
//           <Link href="/dashboard/do-it-yourself" className="back-btn">
//             {t("backToRoom")}
//           </Link>
//           <h1 style={{ marginTop: "1rem" }}>{t("lessonNotFound")}</h1>
//         </div>
//       </main>
//     );
//   }

//   const openMode = (mode: "video" | "reading" | "checklist") => {
//     router.push(`/dashboard/do-it-yourself/${deviceId}/${mode}`);
//   };

//   return (
//     <main
//       style={{
//         ...pageShellStyle,
//         padding: "80px 2rem 2rem",
//         direction: isRtl ? "rtl" : "ltr",
//       }}
//     >
//       <style>{globalLessonStyles}</style>

//       <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "1.8rem" }}>
//         <Link href="/dashboard/do-it-yourself" className="back-btn">
//           {t("backToRoom")}
//         </Link>
//         <h1
//           style={{
//             fontFamily: "'Cinzel', serif",
//             fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
//             margin: "0 0 0.3rem",
//             color: "#3e1316",
//           }}
//         >
//           {lesson.title}
//         </h1>
//         <p style={{ fontSize: "0.88rem", color: "#5C4033", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
//           {lesson.description}
//         </p>
//         <section>
//           <h2
//             style={{
//               fontFamily: "'Cinzel', serif",
//               fontSize: "1.15rem",
//               marginBottom: "1.2rem",
//               color: "#3e1316",
//               textAlign: "center",
//               fontWeight: 400,
//               letterSpacing: "0.04em",
//             }}
//           >
//             {t("chooseHowToLearn")}
//           </h2>

//           <div
//             className="choice-grid"
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
//               gap: "1rem",
//             }}
//           >
//             <button
//               onClick={() => openMode("video")}
//               className="lesson-card"
//               style={{ background: "#fdf8f4", color: "#3e1316" }}
//             >
//               <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.05rem", margin: "0 0 0.4rem" }}>
//                 {t("watchVideo")}
//               </h3>
//               <p style={{ color: "#5C4033", lineHeight: 1.5, fontSize: "0.85rem", margin: 0 }}>
//                 {t("watchVideoDesc")}
//               </p>
//             </button>

//             <button
//               onClick={() => openMode("reading")}
//               className="lesson-card"
//               style={{ background: "#fffaf6", color: "#3e1316" }}
//             >
//               <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.05rem", margin: "0 0 0.4rem" }}>
//                 {t("readSteps")}
//               </h3>
//               <p style={{ color: "#5C4033", lineHeight: 1.5, fontSize: "0.85rem", margin: 0 }}>
//                 {t("readStepsDesc")}
//               </p>
//             </button>

//             <button
//               onClick={() => openMode("checklist")}
//               className="lesson-card"
//               style={{
//                 background: "linear-gradient(135deg, #3e1316, #632024)",
//                 color: "#E8D4BC",
//               }}
//             >
//               <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.05rem", margin: "0 0 0.4rem" }}>
//                 {t("quickChecklist")}
//               </h3>
//               <p style={{ color: "rgba(232,212,188,0.78)", lineHeight: 1.5, fontSize: "0.85rem", margin: 0 }}>
//                 {t("quickChecklistDesc")}
//               </p>
//             </button>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }
