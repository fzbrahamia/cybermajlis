"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  globalLessonStyles,
  lessons,
  lessonsAr,
  pageShellStyle,
  ReadingSection,
  Lesson,
} from "../lessonData";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type Mode = "video" | "reading" | "visual-manual" | "checklist";

type ManualStep = {
  title: string;
  body: string;
  bullets?: string[];
  why?: string;
  image: string;
};

function padStep(num: number) {
  return String(num).padStart(2, "0");
}

function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default function LessonModePage() {
  const params = useParams();
  const t = useTranslations("DIY");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const deviceId = params.device as string;
  const mode = params.mode as Mode;
  const lesson = (isRtl ? lessonsAr : lessons)[deviceId];

  const allowedModes: Mode[] = ["video", "reading", "visual-manual", "checklist"];

  const stickyHeader = (
    <div
      style={{
        direction: isRtl ? "rtl" : "ltr",
        paddingTop: "1.8rem",
        paddingBottom: "1rem",
      }}
    >
      <Link href={`/dashboard/do-it-yourself/${deviceId}`} className="back-btn">
        {t("backToOptions")}
      </Link>
    </div>
  );

  if (!lesson || !allowedModes.includes(mode)) {
    return (
      <main
        style={{
          ...pageShellStyle,
          padding: "80px 2rem 2rem",
          direction: isRtl ? "rtl" : "ltr",
        }}
      >
        <style>{globalLessonStyles}</style>
        {stickyHeader}
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <h1>{t("pageNotFound")}</h1>
        </div>
      </main>
    );
  }

  /*
    Keep the old router behavior for reading/checklist/video.
    Only visual-manual opens directly because it has its own tabs inside the page.
  */
  if (lesson.platformGuides?.length && mode !== "visual-manual") {
    return (
      <main
        style={{
          ...pageShellStyle,
          padding: "80px 2rem 2rem",
          direction: isRtl ? "rtl" : "ltr",
        }}
      >
        <style>{globalLessonStyles}</style>
        {stickyHeader}

        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "#3e1316",
              marginBottom: "1.2rem",
              letterSpacing: "0.04em",
              textAlign: "center",
            }}
          >
            {t("chooseDeviceFirst")}
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.8rem",
              justifyContent: "center",
            }}
          >
            {lesson.platformGuides.map((guide) => (
              <Link
                key={guide.label}
                href={`/dashboard/do-it-yourself/${deviceId}/${mode}/${guide.label.toLowerCase()}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: "0.05em",
                  color: "#E8D4BC",
                  background: "linear-gradient(135deg, #3e1316, #632024)",
                  border: "1px solid rgba(197,165,126,0.45)",
                  padding: "0.75rem 1.7rem",
                  borderRadius: 999,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(62,19,22,0.2)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 22px rgba(62,19,22,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(62,19,22,0.2)";
                }}
              >
                {guide.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        ...pageShellStyle,
        padding: "80px 2rem 2rem",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      <style>{globalLessonStyles}</style>
      {stickyHeader}

      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {mode === "video" && (
          <VideoComingSoonContent lessonTitle={lesson.title} isRtl={isRtl} />
        )}

        {mode === "reading" && (
          <ReadingJourney
            deviceId={deviceId}
            readingTitle={lesson.readingTitle}
            readingIntro={lesson.readingIntro}
            sections={lesson.readingSections}
            t={t}
            isRtl={isRtl}
          />
        )}

        {mode === "visual-manual" && (
          <VisualManualPageContent deviceId={deviceId} lesson={lesson} isRtl={isRtl} />
        )}

        {mode === "checklist" && (
          <ChecklistPageContent
            storageKey={`diy-checklist-${deviceId}`}
            checklistItems={lesson.checklist}
            t={t}
          />
        )}
      </div>
    </main>
  );
}

function VideoComingSoonContent({
  lessonTitle,
  isRtl,
}: {
  lessonTitle: string;
  isRtl: boolean;
}) {
  const ui = isRtl
    ? {
        title: "الفيديو قريباً",
        desc: "سيتم إضافة درس الفيديو لاحقاً. حالياً يمكنك استخدام قراءة الخطوات أو الدليل المصوّر لتطبيق الخطوات بشكل واضح.",
        label: "ميزة مستقبلية",
      }
    : {
        title: "Video Coming Soon",
        desc: "The video lesson will be added later. For now, you can use Read Steps or the Visual Manual to follow the instructions clearly.",
        label: "Future Feature",
      };

  return (
    <section
      style={{
        background: "#fdf8f4",
        borderRadius: 20,
        padding: "1.4rem",
        border: "1px solid rgba(99,32,36,0.15)",
        boxShadow: "0 16px 45px rgba(99,32,36,0.14)",
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          marginBottom: "0.9rem",
          background: "rgba(99,32,36,0.1)",
          color: "#632024",
          border: "1px solid rgba(99,32,36,0.18)",
          padding: "0.35rem 0.75rem",
          borderRadius: 999,
          fontSize: "0.75rem",
          fontWeight: 700,
        }}
      >
        {ui.label}
      </span>

      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
          marginTop: 0,
          marginBottom: "0.5rem",
          color: "#3e1316",
        }}
      >
        {lessonTitle} — {ui.title}
      </h2>

      <p
        style={{
          color: "#5C4033",
          lineHeight: 1.7,
          margin: "0 auto",
          maxWidth: 650,
        }}
      >
        {ui.desc}
      </p>
    </section>
  );
}

function VisualManualPageContent({
  deviceId,
  lesson,
  isRtl,
}: {
  deviceId: string;
  lesson: Lesson;
  isRtl: boolean;
}) {
  const [selectedGuideIndex, setSelectedGuideIndex] = useState(0);

  const ui = isRtl
    ? {
        visualManual: "الدليل المصوّر",
        chooseDevice: "اختر جهازك",
        step: "الخطوة",
        screenshotNote:
          "",
      }
    : {
        visualManual: "Visual Manual",
        chooseDevice: "Choose your device",
        step: "Step",
        screenshotNote:
          "",
      };

  const pad = (num: number) => String(num).padStart(2, "0");
  const toSlug = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

  const hasPlatformGuides = Boolean(lesson.platformGuides?.length);
  const selectedGuide = hasPlatformGuides ? lesson.platformGuides![selectedGuideIndex] : null;

  const platformSteps = selectedGuide
    ? selectedGuide.steps.map((step, index) => ({
        body: step,
        bullets: undefined as string[] | undefined,
        image: `/diy-manual/${deviceId}/${toSlug(selectedGuide.label)}/${pad(index + 1)}.png`,
      }))
    : [];

const isMobileGuide =
  selectedGuide?.label === "iPhone" || selectedGuide?.label === "Android";

const sharedFolder = isMobileGuide ? "mobile-common" : "common";

const commonSteps = lesson.readingSections.map((section, index) => {
  const imagePath = selectedGuide
    ? `/diy-manual/${deviceId}/${sharedFolder}/${pad(index + 1)}.png`
    : `/diy-manual/${deviceId}/${pad(index + 1)}.png`;

  return {
    title: section.title,
    body: section.body ?? "",
    bullets: section.bullets,
    image: imagePath,
  };
});

  const steps = selectedGuide ? [...platformSteps, ...commonSteps] : commonSteps;

  return (
    <section>
      <style>{`
        .manual-header-card {
          background: #fdf8f4;
          border-radius: 20px;
          padding: 1.2rem;
          border: 1px solid rgba(99,32,36,0.12);
          box-shadow: 0 12px 32px rgba(99,32,36,0.08);
          margin-bottom: 2rem;
        }

        .manual-platform-tabs {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .manual-platform-tab {
          border: 1px solid rgba(99,32,36,0.18);
          background: #fffaf6;
          color: #3e1316;
          border-radius: 999px;
          padding: 0.55rem 0.9rem;
          cursor: pointer;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .manual-platform-tab.active {
          background: linear-gradient(135deg, #3e1316, #632024);
          color: #E8D4BC;
          border-color: rgba(197,165,126,0.45);
        }

        .manual-step {
          padding: 0;
          margin: 0;
          scroll-margin-top: 95px;
        }

        .manual-step-title {
          margin-bottom: 1rem;
        }

        .manual-step-title h2 {
          font-family: 'Cinzel', serif;
          color: #3e1316;
          margin: 0;
          font-size: clamp(1.08rem, 2vw, 1.4rem);
          letter-spacing: 0.02em;
        }

        .manual-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
          gap: 2rem;
          align-items: center;
        }

        .manual-layout.reverse {
          grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.2fr);
        }

        .manual-layout.reverse .manual-image-wrap {
          order: 2;
        }

        .manual-layout.reverse .manual-text {
          order: 1;
        }

        .manual-image-wrap {
          background: transparent;
          border: none;
          border-radius: 18px;
          overflow: visible;
          box-shadow: none;
        }

        .manual-image {
          width: 100%;
          display: block;
          object-fit: cover;
        }

        .manual-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100%;
          padding: 0 0.4rem;
        }

        .manual-text.short {
          text-align: center;
          align-items: center;
        }

        .manual-text p {
          margin: 0;
          color: #5C4033;
          line-height: 1.8;
          font-size: 1.08rem;
          max-width: 430px;
        }

        .manual-text.short p {
          font-size: 1.18rem;
          line-height: 1.9;
          max-width: 500px;
        }

        .manual-text ul {
          list-style: none;
          margin: 1rem 0 0;
          padding: 0;
          color: #5C4033;
          line-height: 1.9;
          max-width: 500px;
        }

        .manual-text li {
          position: relative;
          margin-bottom: 0.45rem;
          padding-inline-start: 1.1rem;
          font-size: 1rem;
        }

        .manual-text li::before {
          content: "-";
          position: absolute;
          inset-inline-start: 0;
          color: #8B2635;
          font-weight: 700;
        }

        .manual-connector {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 1.2rem 0 2rem;
          pointer-events: none;
        }

        .manual-simple-arrow {
          width: 54px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.9;
        }

        .manual-simple-arrow svg {
          display: block;
          filter: drop-shadow(0 6px 10px rgba(62,19,22,0.10));
        }

        @media (max-width: 980px) {
          .manual-layout,
          .manual-layout.reverse {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .manual-layout.reverse .manual-image-wrap,
          .manual-layout.reverse .manual-text {
            order: initial;
          }

          .manual-text,
          .manual-text.short {
            text-align: start;
            align-items: flex-start;
            padding: 0;
          }

          .manual-text p,
          .manual-text.short p,
          .manual-text ul {
            max-width: 100%;
          }
        }

        @media (max-width: 700px) {
          .manual-header-card {
            padding: 0.95rem;
          }

          .manual-text p {
            font-size: 1rem;
          }

          .manual-text.short p {
            font-size: 1.08rem;
          }
        }
      `}</style>

      <div className="manual-header-card">
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(1.15rem, 2vw, 1.55rem)",
            marginTop: 0,
            marginBottom: "0.45rem",
            color: "#3e1316",
          }}
        >
          {ui.visualManual}: {lesson.title}
        </h2>

        <p
          style={{
            color: "#5C4033",
            lineHeight: 1.6,
            margin: 0,
            fontSize: "0.92rem",
          }}
        >
          {lesson.readingIntro}
        </p>

        <p
          style={{
            color: "#8B2635",
            lineHeight: 1.6,
            margin: "0.7rem 0 0",
            fontSize: "0.88rem",
            fontWeight: 700,
          }}
        >
          {ui.screenshotNote}
        </p>

        {hasPlatformGuides && (
          <>
            <p
              style={{
                margin: "1rem 0 0",
                color: "#3e1316",
                fontWeight: 700,
              }}
            >
              {ui.chooseDevice}
            </p>

            <div className="manual-platform-tabs">
              {lesson.platformGuides!.map((guide, index) => (
                <button
                  key={guide.label}
                  onClick={() => setSelectedGuideIndex(index)}
                  className={`manual-platform-tab ${
                    selectedGuideIndex === index ? "active" : ""
                  }`}
                >
                  {guide.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {steps.map((step, index) => {
        const isShortStep =
          (!step.bullets || step.bullets.length === 0) &&
          step.body.trim().length <= 120;

        return (
          <div key={`${deviceId}-visual-step-${index}`}>
            <section id={`manual-step-${index}`} className="manual-step">
              <div className="manual-step-title">
                <h2>
                  {ui.step} {index + 1}:
                </h2>
              </div>

              <div
                className={`manual-layout ${index % 2 === 1 ? "reverse" : ""}`}
              >
                <div className="manual-image-wrap">
                  <img
                    src={step.image}
                    alt={`${ui.step} ${index + 1}`}
                    className="manual-image"
                    onError={(event) => {
                      const img = event.currentTarget;
                      if (!img.src.includes("placeholder")) {
                        img.src = "/diy-manual/placeholder.png";
                      }
                    }}
                  />
                </div>

                <div className={`manual-text ${isShortStep ? "short" : ""}`}>
                  <p>{step.body}</p>

                  {step.bullets && step.bullets.length > 0 && (
                    <ul>
                      {step.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            {index < steps.length - 1 && (
              <div className="manual-connector" aria-hidden="true">
                <div className="manual-simple-arrow">
                  <svg viewBox="0 0 54 70" width="54" height="70">
                    <path
                      d="M27 6 V52"
                      fill="none"
                      stroke="#8B2635"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 42 L27 53 L38 42"
                      fill="none"
                      stroke="#8B2635"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="27" cy="6" r="3.5" fill="#c5a57e" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function ReadingJourney({
  deviceId,
  readingTitle,
  readingIntro,
  sections,
  t,
  isRtl,
}: {
  deviceId: string;
  readingTitle: string;
  readingIntro: string;
  sections: ReadingSection[];
  t: ReturnType<typeof useTranslations>;
  isRtl: boolean;
}) {
  const router = useRouter();
  const [missionIndex, setMissionIndex] = useState(0);

  const stripNumber = (title: string) => title.replace(/^[\d٠-٩]+[.٫]\s*/, "");

  const getWhyFallback = (title: string, body?: string): string => {
    const text = `${title} ${body || ""}`.toLowerCase();

    if (text.includes("settings") || text.includes("إعدادات"))
      return isRtl
        ? "من هنا يمكنك التحكم في الأمان والخصوصية والتحديثات والحسابات."
        : "This is where you can control security, privacy, updates, and connected features.";

    if (text.includes("password") || text.includes("كلمة مرور"))
      return isRtl
        ? "كلمات المرور الضعيفة تسهّل الوصول غير المصرح به."
        : "Weak passwords make it easier for someone to access the device without permission.";

    if (text.includes("default") || text.includes("افتراضي"))
      return isRtl
        ? "بيانات الدخول الافتراضية خطيرة لأنها معروفة ويمكن تخمينها."
        : "Default credentials are risky because many people can guess or find them online.";

    if (text.includes("update") || text.includes("تحديث"))
      return isRtl
        ? "التحديثات تُصلح نقاط الضعف الأمنية."
        : "Updates fix security weaknesses and improve how safely the device works.";

    if (text.includes("remote") || text.includes("بُعد"))
      return isRtl
        ? "الوصول عن بُعد يفتح باباً آخر إذا لم يكن محمياً."
        : "Remote access creates another entry point if not properly protected.";

    if (
      text.includes("qr") ||
      text.includes("share") ||
      text.includes("مشارك") ||
      text.includes("رمز qr")
    )
      return isRtl
        ? "الروابط المشتركة قد تمنح وصولاً للشخص الخطأ."
        : "Shared links can give access to the wrong person if forwarded or exposed.";

    if (
      text.includes("users") ||
      text.includes("accounts") ||
      text.includes("مستخدم") ||
      text.includes("حساب")
    )
      return isRtl
        ? "مراجعة المستخدمين يساعد على إزالة الوصول القديم أو غير المعروف."
        : "Reviewing users helps remove old, unknown, or unnecessary access.";

    if (text.includes("apps") || text.includes("تطبيق"))
      return isRtl
        ? "التطبيقات من مصادر مجهولة قد تكون غير آمنة."
        : "Apps from unknown sources may collect data or behave unsafely.";

    if (
      text.includes("permission") ||
      text.includes("إذن") ||
      text.includes("أذون")
    )
      return isRtl
        ? "الأذونات تتحكم فيما تصل إليه التطبيقات."
        : "Permissions control what apps can access, such as camera, microphone, and location.";

    if (
      text.includes("casting") ||
      text.includes("pairing") ||
      text.includes("بث") ||
      text.includes("إقران")
    )
      return isRtl
        ? "البث المفتوح قد يسمح للأجهزة القريبة بالاتصال بدون إذن."
        : "Open casting can let nearby devices connect without sufficient control.";

    if (
      text.includes("pin") ||
      text.includes("code") ||
      text.includes("رمز") ||
      text.includes("كود")
    )
      return isRtl
        ? "رموز الدخول البسيطة تشكّل خطراً أمنياً حقيقياً."
        : "Access codes protect physical entry, so simple codes create real security risk.";

    if (text.includes("temp") || text.includes("مؤقت"))
      return isRtl
        ? "الوصول المؤقت أكثر أماناً لأنه يمكن إزالته."
        : "Temporary access is safer because it can be removed after use.";

    if (text.includes("activity") || text.includes("نشاط"))
      return isRtl
        ? "سجل النشاط يساعدك على ملاحظة الوصول غير العادي."
        : "Activity history helps you notice unusual access events.";

    return isRtl
      ? "هذا يساعدك على فهم الهدف الأمني قبل التطبيق."
      : "This helps you understand the security purpose before applying it.";
  };

  const missions = useMemo(
    () =>
      sections.map((s) => ({
        title: stripNumber(s.title),
        whatToDo: s.body || "",
        whyItMatters: s.whyItMatters || getWhyFallback(s.title, s.body),
        bullets: s.bullets || [],
      })),
    [sections]
  );

  const current = missions[missionIndex];
  const total = missions.length;
  const progress = Math.round(((missionIndex + 1) / total) * 100);
  const isLast = missionIndex === total - 1;

  return (
    <section
      style={{
        background: "#fdf8f4",
        borderRadius: 20,
        padding: "1.2rem",
        border: "1px solid rgba(99,32,36,0.15)",
        boxShadow: "0 16px 45px rgba(99,32,36,0.14)",
      }}
    >
      <div
        style={{
          marginBottom: "1rem",
          paddingBottom: "0.8rem",
          borderBottom: "1px solid rgba(99,32,36,0.12)",
        }}
      >
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            marginTop: 0,
            marginBottom: "0.4rem",
            color: "#3e1316",
            lineHeight: 1.2,
          }}
        >
          {readingTitle}
        </h2>
        <p
          style={{
            color: "#5C4033",
            lineHeight: 1.6,
            margin: 0,
            fontSize: "0.9rem",
          }}
        >
          {readingIntro}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.8rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "0.8rem",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8B2635",
            background: "rgba(99,32,36,0.08)",
            border: "1px solid rgba(99,32,36,0.16)",
            padding: "0.35rem 0.85rem",
            borderRadius: 999,
          }}
        >
          {t("learningJourney")}
        </div>

        <div style={{ color: "#8B2635", fontWeight: 700, fontSize: "0.88rem" }}>
          {t("mission")} {missionIndex + 1} {t("of")} {total}
        </div>
      </div>

      <h3
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1rem, 1.8vw, 1.4rem)",
          marginTop: 0,
          marginBottom: "0.6rem",
          color: "#3e1316",
          lineHeight: 1.2,
        }}
      >
        {current.title}
      </h3>

      <div
        style={{
          height: 7,
          background: "rgba(99,32,36,0.12)",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: "1rem",
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
          gap: "0.8rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid rgba(99,32,36,0.1)",
            borderRadius: 16,
            padding: "1.1rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'Cinzel', serif",
              marginTop: 0,
              marginBottom: "0.5rem",
              color: "#3e1316",
              fontSize: "0.85rem",
            }}
          >
            {t("whatToDo")}
          </h4>

          <p
            style={{
              color: "#5C4033",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              marginTop: 0,
              marginBottom: current.bullets.length ? "0.8rem" : 0,
            }}
          >
            {current.whatToDo}
          </p>

          {current.bullets.length > 0 && (
            <ul
              style={{
                color: "#5C4033",
                fontSize: "0.9rem",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {current.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>

        <div
          style={{
            background: "rgba(99,32,36,0.06)",
            border: "1px solid rgba(99,32,36,0.12)",
            borderRadius: 16,
            padding: "1.1rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'Cinzel', serif",
              marginTop: 0,
              marginBottom: "0.5rem",
              color: "#3e1316",
              fontSize: "0.85rem",
            }}
          >
            {t("whyItMatters")}
          </h4>

          <p
            style={{
              color: "#5C4033",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {current.whyItMatters}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.8rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setMissionIndex((p) => Math.max(p - 1, 0))}
          disabled={missionIndex === 0}
          style={{
            border: "1px solid rgba(99,32,36,0.18)",
            background: missionIndex === 0 ? "rgba(99,32,36,0.06)" : "white",
            color: missionIndex === 0 ? "rgba(99,32,36,0.35)" : "#632024",
            padding: "0.65rem 1.1rem",
            borderRadius: 999,
            cursor: missionIndex === 0 ? "default" : "pointer",
            fontWeight: 700,
            fontSize: "0.88rem",
          }}
        >
          {t("previous")}
        </button>

        {!isLast ? (
          <button
            onClick={() => setMissionIndex((p) => p + 1)}
            style={{
              border: "none",
              background: "linear-gradient(135deg, #3e1316, #632024)",
              color: "#E8D4BC",
              padding: "0.65rem 1.2rem",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.88rem",
              boxShadow: "0 6px 18px rgba(62,19,22,0.22)",
            }}
          >
            {t("nextMission")}
          </button>
        ) : (
          <button
            onClick={() => router.push(`/dashboard/do-it-yourself/${deviceId}/checklist`)}
            style={{
              border: "none",
              background: "linear-gradient(135deg, #3e1316, #632024)",
              color: "#E8D4BC",
              padding: "0.65rem 1.2rem",
              borderRadius: 999,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.88rem",
              boxShadow: "0 6px 18px rgba(62,19,22,0.22)",
            }}
          >
            {t("goToChecklist")}
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
  t,
}: {
  checklistItems: string[];
  storageKey: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const [checked, setChecked] = useState<boolean[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      const loggedIn = !!u;
      setIsSignedIn(loggedIn);

      if (!loggedIn) {
        setChecked(checklistItems.map(() => false));
        return;
      }

      const saved = localStorage.getItem(storageKey);

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setChecked(checklistItems.map((_, i) => Boolean(parsed[i])));
            return;
          }
        } catch {}
      }

      setChecked(checklistItems.map(() => false));
    });

    return () => unsub();
  }, [storageKey, checklistItems.length]);

  useEffect(() => {
    if (!isSignedIn || checked.length !== checklistItems.length) return;
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey, checklistItems.length, isSignedIn]);

  const completed = checked.filter(Boolean).length;
  const progress = checklistItems.length
    ? Math.round((completed / checklistItems.length) * 100)
    : 0;

  return (
    <section
      style={{
        background: "#fdf8f4",
        borderRadius: 20,
        padding: "1.2rem",
        border: "1px solid rgba(99,32,36,0.15)",
        boxShadow: "0 16px 45px rgba(99,32,36,0.14)",
      }}
    >
      <p style={{ color: "#5C4033", margin: "0 0 0.8rem", fontSize: "0.9rem" }}>
        {t("completeTick")}
      </p>

      <div
        style={{
          height: 7,
          background: "rgba(99,32,36,0.12)",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: "0.4rem",
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
          marginBottom: "1rem",
          fontSize: "0.88rem",
        }}
      >
        {completed}/{checklistItems.length} {t("completed")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {checklistItems.map((step, i) => (
          <label key={i} className={`check-item ${checked[i] ? "done" : ""}`}>
            <input
              type="checkbox"
              checked={checked[i] || false}
              onChange={() =>
                setChecked((prev) => {
                  const fixed = checklistItems.map((_, j) => Boolean(prev[j]));
                  fixed[i] = !fixed[i];
                  return fixed;
                })
              }
            />
            <span
              style={{
                color: "#3e1316",
                lineHeight: 1.5,
                fontSize: "0.9rem",
                textDecoration: checked[i] ? "line-through" : "none",
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
            marginTop: "1rem",
            padding: "0.8rem",
            borderRadius: 14,
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.25)",
            color: "#14532d",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          {t("allDone")}
        </div>
      )}
    </section>
  );
}
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useTranslations, useLocale } from "next-intl";
// import { globalLessonStyles, lessons, lessonsAr, pageShellStyle, ReadingSection } from "../lessonData";
// import { auth } from "@/app/lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";

// type Mode = "video" | "reading" | "checklist";

// const modeTitleKeys: Record<Mode, string> = {
//   video: "watchVideo",
//   reading: "readSteps",
//   checklist: "quickChecklist",
// };

// export default function LessonModePage() {
//   const params = useParams();
//   const t = useTranslations("DIY");
//   const locale = useLocale();
//   const isRtl = locale === "ar";

//   const deviceId = params.device as string;
//   const mode = params.mode as Mode;
//   const lesson = (isRtl ? lessonsAr : lessons)[deviceId];

//   const stickyHeader = (
//     <div style={{ direction: isRtl ? "rtl" : "ltr", paddingTop: "1.8rem", paddingBottom: "1rem" }}>
//       <Link
//         href={`/dashboard/do-it-yourself/${deviceId}`}
//         className="back-btn"
//       >
//         {t("backToOptions")}
//       </Link>
//     </div>
//   );

//   if (!lesson || !["video", "reading", "checklist"].includes(mode)) {
//     return (
//       <main style={{ ...pageShellStyle, padding: "80px 2rem 2rem", direction: isRtl ? "rtl" : "ltr" }}>
//         <style>{globalLessonStyles}</style>
//         {stickyHeader}
//         <div style={{ maxWidth: 1050, margin: "0 auto" }}>
//           <h1>{t("pageNotFound")}</h1>
//         </div>
//       </main>
//     );
//   }

//   // Router lesson has platform guides, show device selector
//   if (lesson.platformGuides?.length) {
//     return (
//       <main style={{ ...pageShellStyle, padding: "80px 2rem 2rem", direction: isRtl ? "rtl" : "ltr" }}>
//         <style>{globalLessonStyles}</style>
//         {stickyHeader}

//         <div style={{ maxWidth: 1050, margin: "0 auto" }}>
//           <h2 style={{
//             fontFamily: "'Cinzel', serif",
//             fontSize: "1.15rem",
//             fontWeight: 700,
//             color: "#3e1316",
//             marginBottom: "1.2rem",
//             letterSpacing: "0.04em",
//           }}>
//             {t("chooseDeviceFirst")}
//           </h2>

//           {/* Platform selection buttons */}
//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: "0.8rem",
//               justifyContent: "center",
//             }}
//           >
//             {lesson.platformGuides.map((guide) => (
//               <Link
//                 key={guide.label}
//                 href={`/dashboard/do-it-yourself/${deviceId}/${mode}/${guide.label.toLowerCase()}`}
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontFamily: "'Cinzel', serif",
//                   fontWeight: 700,
//                   fontSize: "0.9rem",
//                   letterSpacing: "0.05em",
//                   color: "#E8D4BC",
//                   background: "linear-gradient(135deg, #3e1316, #632024)",
//                   border: "1px solid rgba(197,165,126,0.45)",
//                   padding: "0.75rem 1.7rem",
//                   borderRadius: 999,
//                   textDecoration: "none",
//                   boxShadow: "0 4px 14px rgba(62,19,22,0.2)",
//                   transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = "translateY(-2px)";
//                   e.currentTarget.style.boxShadow = "0 8px 22px rgba(62,19,22,0.3)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = "";
//                   e.currentTarget.style.boxShadow = "0 4px 14px rgba(62,19,22,0.2)";
//                 }}
//               >
//                 {guide.label}
//               </Link>
//             ))}
//           </div>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main style={{ ...pageShellStyle, padding: "80px 2rem 2rem", direction: isRtl ? "rtl" : "ltr" }}>
//       <style>{globalLessonStyles}</style>
//       {stickyHeader}

//       <div style={{ maxWidth: 1050, margin: "0 auto" }}>
//         {mode === "video" && (
//           <section
//             style={{
//               background: "#fdf8f4",
//               borderRadius: 20,
//               padding: "1.2rem",
//               border: "1px solid rgba(99,32,36,0.15)",
//               boxShadow: "0 16px 45px rgba(99,32,36,0.14)",
//             }}
//           >
//             <h2
//               style={{
//                 fontFamily: "'Cinzel', serif",
//                 fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
//                 marginTop: 0,
//                 color: "#3e1316",
//               }}
//             >
//               {lesson.title}
//             </h2>
//             <div style={{ borderRadius: 16, overflow: "hidden", background: "#2a0d0f" }}>
//               <video controls style={{ width: "100%", display: "block" }}>
//                 <source src={lesson.videoUrl} type="video/mp4" />
//               </video>
//             </div>
//           </section>
//         )}

//         {mode === "reading" && (
//           <ReadingJourney
//             deviceId={deviceId}
//             readingTitle={lesson.readingTitle}
//             readingIntro={lesson.readingIntro}
//             sections={lesson.readingSections}
//             t={t}
//             isRtl={isRtl}
//           />
//         )}

//         {mode === "checklist" && (
//           <ChecklistPageContent
//             storageKey={`diy-checklist-${deviceId}`}
//             checklistItems={lesson.checklist}
//             t={t}
//           />
//         )}
//       </div>
//     </main>
//   );
// }

// function ReadingJourney({
//   deviceId,
//   readingTitle,
//   readingIntro,
//   sections,
//   t,
//   isRtl,
// }: {
//   deviceId: string;
//   readingTitle: string;
//   readingIntro: string;
//   sections: ReadingSection[];
//   t: ReturnType<typeof useTranslations>;
//   isRtl: boolean;
// }) {
//   const router = useRouter();
//   const [missionIndex, setMissionIndex] = useState(0);

//   const stripNumber = (title: string) => title.replace(/^[\d٠-٩]+[.٫]\s*/, "");

//   const getWhyFallback = (title: string, body?: string): string => {
//     const text = `${title} ${body || ""}`.toLowerCase();
//     if (text.includes("settings") || text.includes("إعدادات")) return isRtl ? "من هنا يمكنك التحكم في الأمان والخصوصية والتحديثات والحسابات." : "This is where you can control security, privacy, updates, and connected features.";
//     if (text.includes("password") || text.includes("كلمة مرور")) return isRtl ? "كلمات المرور الضعيفة تسهّل الوصول غير المصرح به." : "Weak passwords make it easier for someone to access the device without permission.";
//     if (text.includes("default") || text.includes("افتراضي")) return isRtl ? "بيانات الدخول الافتراضية خطيرة لأنها معروفة ويمكن تخمينها." : "Default credentials are risky because many people can guess or find them online.";
//     if (text.includes("update") || text.includes("تحديث")) return isRtl ? "التحديثات تُصلح نقاط الضعف الأمنية." : "Updates fix security weaknesses and improve how safely the device works.";
//     if (text.includes("remote") || text.includes("بُعد")) return isRtl ? "الوصول عن بُعد يفتح باباً آخر إذا لم يكن محمياً." : "Remote access creates another entry point if not properly protected.";
//     if (text.includes("qr") || text.includes("share") || text.includes("مشارك") || text.includes("رمز qr")) return isRtl ? "الروابط المشتركة قد تمنح وصولاً للشخص الخطأ." : "Shared links can give access to the wrong person if forwarded or exposed.";
//     if (text.includes("users") || text.includes("accounts") || text.includes("مستخدم") || text.includes("حساب")) return isRtl ? "مراجعة المستخدمين يساعد على إزالة الوصول القديم أو غير المعروف." : "Reviewing users helps remove old, unknown, or unnecessary access.";
//     if (text.includes("apps") || text.includes("تطبيق")) return isRtl ? "التطبيقات من مصادر مجهولة قد تكون غير آمنة." : "Apps from unknown sources may collect data or behave unsafely.";
//     if (text.includes("permission") || text.includes("إذن") || text.includes("أذون")) return isRtl ? "الأذونات تتحكم فيما تصل إليه التطبيقات." : "Permissions control what apps can access, such as camera, microphone, and location.";
//     if (text.includes("casting") || text.includes("pairing") || text.includes("بث") || text.includes("إقران")) return isRtl ? "البث المفتوح قد يسمح للأجهزة القريبة بالاتصال بدون إذن." : "Open casting can let nearby devices connect without sufficient control.";
//     if (text.includes("pin") || text.includes("code") || text.includes("رمز") || text.includes("كود")) return isRtl ? "رموز الدخول البسيطة تشكّل خطراً أمنياً حقيقياً." : "Access codes protect physical entry, so simple codes create real security risk.";
//     if (text.includes("temp") || text.includes("مؤقت")) return isRtl ? "الوصول المؤقت أكثر أماناً لأنه يمكن إزالته." : "Temporary access is safer because it can be removed after use.";
//     if (text.includes("activity") || text.includes("نشاط")) return isRtl ? "سجل النشاط يساعدك على ملاحظة الوصول غير العادي." : "Activity history helps you notice unusual access events.";
//     return isRtl ? "هذا يساعدك على فهم الهدف الأمني قبل التطبيق." : "This helps you understand the security purpose before applying it.";
//   };

//   const missions = useMemo(() => sections.map((s) => ({
//     title: stripNumber(s.title),
//     whatToDo: s.body || "",
//     whyItMatters: s.whyItMatters || getWhyFallback(s.title, s.body),
//     bullets: s.bullets || [],
//   })), [sections]);

//   const current = missions[missionIndex];
//   const total = missions.length;
//   const progress = Math.round(((missionIndex + 1) / total) * 100);
//   const isLast = missionIndex === total - 1;

//   return (
//     <section
//       style={{
//         background: "#fdf8f4",
//         borderRadius: 20,
//         padding: "1.2rem",
//         border: "1px solid rgba(99,32,36,0.15)",
//         boxShadow: "0 16px 45px rgba(99,32,36,0.14)",
//       }}
//     >
//       <div style={{ marginBottom: "1rem", paddingBottom: "0.8rem", borderBottom: "1px solid rgba(99,32,36,0.12)" }}>
//         <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.1rem, 2vw, 1.5rem)", marginTop: 0, marginBottom: "0.4rem", color: "#3e1316", lineHeight: 1.2 }}>
//           {readingTitle}
//         </h2>
//         <p style={{ color: "#5C4033", lineHeight: 1.6, margin: 0, fontSize: "0.9rem" }}>{readingIntro}</p>
//       </div>

//       <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.8rem" }}>
//         <div style={{ display: "inline-block", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8B2635", background: "rgba(99,32,36,0.08)", border: "1px solid rgba(99,32,36,0.16)", padding: "0.35rem 0.85rem", borderRadius: 999 }}>
//           {t("learningJourney")}
//         </div>
//         <div style={{ color: "#8B2635", fontWeight: 700, fontSize: "0.88rem" }}>
//           {t("mission")} {missionIndex + 1} {t("of")} {total}
//         </div>
//       </div>

//       <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1rem, 1.8vw, 1.4rem)", marginTop: 0, marginBottom: "0.6rem", color: "#3e1316", lineHeight: 1.2 }}>
//         {current.title}
//       </h3>

//       <div style={{ height: 7, background: "rgba(99,32,36,0.12)", borderRadius: 999, overflow: "hidden", marginBottom: "1rem" }}>
//         <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #632024, #c5a57e)", transition: "width 0.25s ease" }} />
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
//         <div style={{ background: "white", border: "1px solid rgba(99,32,36,0.1)", borderRadius: 16, padding: "1.1rem" }}>
//           <h4 style={{ fontFamily: "'Cinzel', serif", marginTop: 0, marginBottom: "0.5rem", color: "#3e1316", fontSize: "0.85rem" }}>
//             {t("whatToDo")}
//           </h4>
//           <p style={{ color: "#5C4033", fontSize: "0.95rem", lineHeight: 1.7, marginTop: 0, marginBottom: current.bullets.length ? "0.8rem" : 0 }}>
//             {current.whatToDo}
//           </p>
//           {current.bullets.length > 0 && (
//             <ul style={{ color: "#5C4033", fontSize: "0.9rem", lineHeight: 1.8, margin: 0 }}>
//               {current.bullets.map((b, i) => <li key={i}>{b}</li>)}
//             </ul>
//           )}
//         </div>

//         <div style={{ background: "rgba(99,32,36,0.06)", border: "1px solid rgba(99,32,36,0.12)", borderRadius: 16, padding: "1.1rem" }}>
//           <h4 style={{ fontFamily: "'Cinzel', serif", marginTop: 0, marginBottom: "0.5rem", color: "#3e1316", fontSize: "0.85rem" }}>
//             {t("whyItMatters")}
//           </h4>
//           <p style={{ color: "#5C4033", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
//             {current.whyItMatters}
//           </p>
//         </div>
//       </div>

//       <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
//         <button
//           onClick={() => setMissionIndex((p) => Math.max(p - 1, 0))}
//           disabled={missionIndex === 0}
//           style={{ border: "1px solid rgba(99,32,36,0.18)", background: missionIndex === 0 ? "rgba(99,32,36,0.06)" : "white", color: missionIndex === 0 ? "rgba(99,32,36,0.35)" : "#632024", padding: "0.65rem 1.1rem", borderRadius: 999, cursor: missionIndex === 0 ? "default" : "pointer", fontWeight: 700, fontSize: "0.88rem" }}
//         >
//           {t("previous")}
//         </button>

//         {!isLast ? (
//           <button
//             onClick={() => setMissionIndex((p) => p + 1)}
//             style={{ border: "none", background: "linear-gradient(135deg, #3e1316, #632024)", color: "#E8D4BC", padding: "0.65rem 1.2rem", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 6px 18px rgba(62,19,22,0.22)" }}
//           >
//             {t("nextMission")}
//           </button>
//         ) : (
//           <button
//             onClick={() => router.push(`/dashboard/do-it-yourself/${deviceId}/checklist`)}
//             style={{ border: "none", background: "linear-gradient(135deg, #3e1316, #632024)", color: "#E8D4BC", padding: "0.65rem 1.2rem", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 6px 18px rgba(62,19,22,0.22)" }}
//           >
//             {t("goToChecklist")}
//           </button>
//         )}
//       </div>

//       <style>{`
//         @media (max-width: 800px) {
//           section div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
//         }
//       `}</style>
//     </section>
//   );
// }

// function ChecklistPageContent({
//   checklistItems,
//   storageKey,
//   t,
// }: {
//   checklistItems: string[];
//   storageKey: string;
//   t: ReturnType<typeof useTranslations>;
// }) {
//   const [checked, setChecked] = useState<boolean[]>([]);
//   const [isSignedIn, setIsSignedIn] = useState(false);

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (u) => {
//       const loggedIn = !!u;
//       setIsSignedIn(loggedIn);
//       if (!loggedIn) {
//         // Guest: always start fresh
//         setChecked(checklistItems.map(() => false));
//         return;
//       }
//       const saved = localStorage.getItem(storageKey);
//       if (saved) {
//         try {
//           const parsed = JSON.parse(saved);
//           if (Array.isArray(parsed)) { setChecked(checklistItems.map((_, i) => Boolean(parsed[i]))); return; }
//         } catch {}
//       }
//       setChecked(checklistItems.map(() => false));
//     });
//     return () => unsub();
//   }, [storageKey, checklistItems.length]);

//   useEffect(() => {
//     if (!isSignedIn || checked.length !== checklistItems.length) return;
//     localStorage.setItem(storageKey, JSON.stringify(checked));
//   }, [checked, storageKey, checklistItems.length, isSignedIn]);

//   const completed = checked.filter(Boolean).length;
//   const progress = checklistItems.length ? Math.round((completed / checklistItems.length) * 100) : 0;

//   return (
//     <section style={{ background: "#fdf8f4", borderRadius: 20, padding: "1.2rem", border: "1px solid rgba(99,32,36,0.15)", boxShadow: "0 16px 45px rgba(99,32,36,0.14)" }}>
//       <p style={{ color: "#5C4033", margin: "0 0 0.8rem", fontSize: "0.9rem" }}>{t("completeTick")}</p>

//       <div style={{ height: 7, background: "rgba(99,32,36,0.12)", borderRadius: 999, overflow: "hidden", marginBottom: "0.4rem" }}>
//         <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #632024, #c5a57e)", transition: "width 0.25s ease" }} />
//       </div>
//       <p style={{ color: "#8B2635", fontWeight: 700, marginBottom: "1rem", fontSize: "0.88rem" }}>
//         {completed}/{checklistItems.length} {t("completed")}
//       </p>

//       <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
//         {checklistItems.map((step, i) => (
//           <label key={i} className={`check-item ${checked[i] ? "done" : ""}`}>
//             <input
//               type="checkbox"
//               checked={checked[i] || false}
//               onChange={() => setChecked((prev) => { const f = checklistItems.map((_, j) => Boolean(prev[j])); f[i] = !f[i]; return f; })}
//             />
//             <span style={{ color: "#3e1316", lineHeight: 1.5, fontSize: "0.9rem", textDecoration: checked[i] ? "line-through" : "none" }}>
//               {step}
//             </span>
//           </label>
//         ))}
//       </div>

//       {completed === checklistItems.length && (
//         <div style={{ marginTop: "1rem", padding: "0.8rem", borderRadius: 14, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#14532d", fontWeight: 700, fontSize: "0.9rem" }}>
//           {t("allDone")}
//         </div>
//       )}
//     </section>
//   );
// }