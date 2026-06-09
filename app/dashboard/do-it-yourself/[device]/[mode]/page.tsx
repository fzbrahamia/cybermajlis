"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { globalLessonStyles, lessons, lessonsAr, pageShellStyle, ReadingSection } from "../lessonData";

type Mode = "video" | "reading" | "checklist";

const modeTitleKeys: Record<Mode, string> = {
  video: "watchVideo",
  reading: "readSteps",
  checklist: "quickChecklist",
};

export default function LessonModePage() {
  const params = useParams();
  const t = useTranslations("DIY");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const deviceId = params.device as string;
  const mode = params.mode as Mode;
  const lesson = (isRtl ? lessonsAr : lessons)[deviceId];

  const stickyHeader = (
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
        gap: "0.8rem",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      <Link
        href={`/dashboard/do-it-yourself/${deviceId}`}
        className="back-btn"
        style={{ flexShrink: 0 }}
      >
        {t("backToOptions")}
      </Link>
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "0.85rem",
          fontWeight: 700,
          color: "#3e1316",
        }}
      >
        {t(modeTitleKeys[mode] ?? "watchVideo")}
      </span>
    </div>
  );

  if (!lesson || !["video", "reading", "checklist"].includes(mode)) {
    return (
      <main style={{ ...pageShellStyle, padding: "0 2rem 2rem", direction: isRtl ? "rtl" : "ltr" }}>
        <style>{globalLessonStyles}</style>
        {stickyHeader}
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <h1>{t("pageNotFound")}</h1>
        </div>
      </main>
    );
  }

  // Router lesson has platform guides — show device selector
  if (lesson.platformGuides?.length) {
    return (
      <main style={{ ...pageShellStyle, padding: "0 2rem 2rem", direction: isRtl ? "rtl" : "ltr" }}>
        <style>{globalLessonStyles}</style>
        {stickyHeader}

        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <p style={{ fontSize: "0.9rem", color: "#5C4033", marginBottom: "1rem", lineHeight: 1.5 }}>
            {t("chooseDeviceFirst")}
          </p>

          {/* Compact pill row for platform selection */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
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
                  fontSize: "0.82rem",
                  letterSpacing: "0.05em",
                  color: "#E8D4BC",
                  background: "linear-gradient(135deg, #3e1316, #632024)",
                  border: "1px solid rgba(197,165,126,0.45)",
                  padding: "0.6rem 1.3rem",
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
    <main style={{ ...pageShellStyle, padding: "0 2rem 2rem", direction: isRtl ? "rtl" : "ltr" }}>
      <style>{globalLessonStyles}</style>
      {stickyHeader}

      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        {mode === "video" && (
          <section
            style={{
              background: "#fdf8f4",
              borderRadius: 20,
              padding: "1.2rem",
              border: "1px solid rgba(99,32,36,0.15)",
              boxShadow: "0 16px 45px rgba(99,32,36,0.14)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                marginTop: 0,
                color: "#3e1316",
              }}
            >
              {lesson.title}
            </h2>
            <div style={{ borderRadius: 16, overflow: "hidden", background: "#2a0d0f" }}>
              <video controls style={{ width: "100%", display: "block" }}>
                <source src={lesson.videoUrl} type="video/mp4" />
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
            t={t}
            isRtl={isRtl}
          />
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
    if (text.includes("settings") || text.includes("إعدادات")) return isRtl ? "من هنا يمكنك التحكم في الأمان والخصوصية والتحديثات والحسابات." : "This is where you can control security, privacy, updates, and connected features.";
    if (text.includes("password") || text.includes("كلمة مرور")) return isRtl ? "كلمات المرور الضعيفة تسهّل الوصول غير المصرح به." : "Weak passwords make it easier for someone to access the device without permission.";
    if (text.includes("default") || text.includes("افتراضي")) return isRtl ? "بيانات الدخول الافتراضية خطيرة لأنها معروفة ويمكن تخمينها." : "Default credentials are risky because many people can guess or find them online.";
    if (text.includes("update") || text.includes("تحديث")) return isRtl ? "التحديثات تُصلح نقاط الضعف الأمنية." : "Updates fix security weaknesses and improve how safely the device works.";
    if (text.includes("remote") || text.includes("بُعد")) return isRtl ? "الوصول عن بُعد يفتح باباً آخر إذا لم يكن محمياً." : "Remote access creates another entry point if not properly protected.";
    if (text.includes("qr") || text.includes("share") || text.includes("مشارك") || text.includes("رمز qr")) return isRtl ? "الروابط المشتركة قد تمنح وصولاً للشخص الخطأ." : "Shared links can give access to the wrong person if forwarded or exposed.";
    if (text.includes("users") || text.includes("accounts") || text.includes("مستخدم") || text.includes("حساب")) return isRtl ? "مراجعة المستخدمين يساعد على إزالة الوصول القديم أو غير المعروف." : "Reviewing users helps remove old, unknown, or unnecessary access.";
    if (text.includes("apps") || text.includes("تطبيق")) return isRtl ? "التطبيقات من مصادر مجهولة قد تكون غير آمنة." : "Apps from unknown sources may collect data or behave unsafely.";
    if (text.includes("permission") || text.includes("إذن") || text.includes("أذون")) return isRtl ? "الأذونات تتحكم فيما تصل إليه التطبيقات." : "Permissions control what apps can access, such as camera, microphone, and location.";
    if (text.includes("casting") || text.includes("pairing") || text.includes("بث") || text.includes("إقران")) return isRtl ? "البث المفتوح قد يسمح للأجهزة القريبة بالاتصال بدون إذن." : "Open casting can let nearby devices connect without sufficient control.";
    if (text.includes("pin") || text.includes("code") || text.includes("رمز") || text.includes("كود")) return isRtl ? "رموز الدخول البسيطة تشكّل خطراً أمنياً حقيقياً." : "Access codes protect physical entry, so simple codes create real security risk.";
    if (text.includes("temp") || text.includes("مؤقت")) return isRtl ? "الوصول المؤقت أكثر أماناً لأنه يمكن إزالته." : "Temporary access is safer because it can be removed after use.";
    if (text.includes("activity") || text.includes("نشاط")) return isRtl ? "سجل النشاط يساعدك على ملاحظة الوصول غير العادي." : "Activity history helps you notice unusual access events.";
    return isRtl ? "هذا يساعدك على فهم الهدف الأمني قبل التطبيق." : "This helps you understand the security purpose before applying it.";
  };

  const missions = useMemo(() => sections.map((s) => ({
    title: stripNumber(s.title),
    whatToDo: s.body || "",
    whyItMatters: s.whyItMatters || getWhyFallback(s.title, s.body),
    bullets: s.bullets || [],
  })), [sections]);

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
      <div style={{ marginBottom: "1rem", paddingBottom: "0.8rem", borderBottom: "1px solid rgba(99,32,36,0.12)" }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.1rem, 2vw, 1.5rem)", marginTop: 0, marginBottom: "0.4rem", color: "#3e1316", lineHeight: 1.2 }}>
          {readingTitle}
        </h2>
        <p style={{ color: "#5C4033", lineHeight: 1.6, margin: 0, fontSize: "0.9rem" }}>{readingIntro}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.8rem" }}>
        <div style={{ display: "inline-block", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8B2635", background: "rgba(99,32,36,0.08)", border: "1px solid rgba(99,32,36,0.16)", padding: "0.35rem 0.85rem", borderRadius: 999 }}>
          {t("learningJourney")}
        </div>
        <div style={{ color: "#8B2635", fontWeight: 700, fontSize: "0.88rem" }}>
          {t("mission")} {missionIndex + 1} {t("of")} {total}
        </div>
      </div>

      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1rem, 1.8vw, 1.4rem)", marginTop: 0, marginBottom: "0.6rem", color: "#3e1316", lineHeight: 1.2 }}>
        {current.title}
      </h3>

      <div style={{ height: 7, background: "rgba(99,32,36,0.12)", borderRadius: 999, overflow: "hidden", marginBottom: "1rem" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #632024, #c5a57e)", transition: "width 0.25s ease" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
        <div style={{ background: "white", border: "1px solid rgba(99,32,36,0.1)", borderRadius: 16, padding: "1.1rem" }}>
          <h4 style={{ fontFamily: "'Cinzel', serif", marginTop: 0, marginBottom: "0.5rem", color: "#3e1316", fontSize: "0.85rem" }}>
            {t("whatToDo")}
          </h4>
          <p style={{ color: "#5C4033", fontSize: "0.95rem", lineHeight: 1.7, marginTop: 0, marginBottom: current.bullets.length ? "0.8rem" : 0 }}>
            {current.whatToDo}
          </p>
          {current.bullets.length > 0 && (
            <ul style={{ color: "#5C4033", fontSize: "0.9rem", lineHeight: 1.8, margin: 0 }}>
              {current.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </div>

        <div style={{ background: "rgba(99,32,36,0.06)", border: "1px solid rgba(99,32,36,0.12)", borderRadius: 16, padding: "1.1rem" }}>
          <h4 style={{ fontFamily: "'Cinzel', serif", marginTop: 0, marginBottom: "0.5rem", color: "#3e1316", fontSize: "0.85rem" }}>
            {t("whyItMatters")}
          </h4>
          <p style={{ color: "#5C4033", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
            {current.whyItMatters}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => setMissionIndex((p) => Math.max(p - 1, 0))}
          disabled={missionIndex === 0}
          style={{ border: "1px solid rgba(99,32,36,0.18)", background: missionIndex === 0 ? "rgba(99,32,36,0.06)" : "white", color: missionIndex === 0 ? "rgba(99,32,36,0.35)" : "#632024", padding: "0.65rem 1.1rem", borderRadius: 999, cursor: missionIndex === 0 ? "default" : "pointer", fontWeight: 700, fontSize: "0.88rem" }}
        >
          {t("previous")}
        </button>

        {!isLast ? (
          <button
            onClick={() => setMissionIndex((p) => p + 1)}
            style={{ border: "none", background: "linear-gradient(135deg, #3e1316, #632024)", color: "#E8D4BC", padding: "0.65rem 1.2rem", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 6px 18px rgba(62,19,22,0.22)" }}
          >
            {t("nextMission")}
          </button>
        ) : (
          <button
            onClick={() => router.push(`/dashboard/do-it-yourself/${deviceId}/checklist`)}
            style={{ border: "none", background: "linear-gradient(135deg, #3e1316, #632024)", color: "#E8D4BC", padding: "0.65rem 1.2rem", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 6px 18px rgba(62,19,22,0.22)" }}
          >
            {t("goToChecklist")}
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 800px) {
          section div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
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

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) { setChecked(checklistItems.map((_, i) => Boolean(parsed[i]))); return; }
      } catch {}
    }
    setChecked(checklistItems.map(() => false));
  }, [storageKey, checklistItems.length]);

  useEffect(() => {
    if (checked.length !== checklistItems.length) return;
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey, checklistItems.length]);

  const completed = checked.filter(Boolean).length;
  const progress = checklistItems.length ? Math.round((completed / checklistItems.length) * 100) : 0;

  return (
    <section style={{ background: "#fdf8f4", borderRadius: 20, padding: "1.2rem", border: "1px solid rgba(99,32,36,0.15)", boxShadow: "0 16px 45px rgba(99,32,36,0.14)" }}>
      <p style={{ color: "#5C4033", margin: "0 0 0.8rem", fontSize: "0.9rem" }}>{t("completeTick")}</p>

      <div style={{ height: 7, background: "rgba(99,32,36,0.12)", borderRadius: 999, overflow: "hidden", marginBottom: "0.4rem" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #632024, #c5a57e)", transition: "width 0.25s ease" }} />
      </div>
      <p style={{ color: "#8B2635", fontWeight: 700, marginBottom: "1rem", fontSize: "0.88rem" }}>
        {completed}/{checklistItems.length} {t("completed")}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {checklistItems.map((step, i) => (
          <label key={i} className={`check-item ${checked[i] ? "done" : ""}`}>
            <input
              type="checkbox"
              checked={checked[i] || false}
              onChange={() => setChecked((prev) => { const f = checklistItems.map((_, j) => Boolean(prev[j])); f[i] = !f[i]; return f; })}
            />
            <span style={{ color: "#3e1316", lineHeight: 1.5, fontSize: "0.9rem", textDecoration: checked[i] ? "line-through" : "none" }}>
              {step}
            </span>
          </label>
        ))}
      </div>

      {completed === checklistItems.length && (
        <div style={{ marginTop: "1rem", padding: "0.8rem", borderRadius: 14, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#14532d", fontWeight: 700, fontSize: "0.9rem" }}>
          {t("allDone")}
        </div>
      )}
    </section>
  );
}
