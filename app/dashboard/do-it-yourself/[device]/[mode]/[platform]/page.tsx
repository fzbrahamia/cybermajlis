"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { globalLessonStyles, lessons, lessonsAr, pageShellStyle, ReadingSection } from "../../lessonData";

type Mode = "video" | "reading" | "checklist";

export default function PlatformLessonPage() {
  const params = useParams();
  const t = useTranslations("DIY");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const deviceId = params.device as string;
  const mode = params.mode as Mode;
  const platform = params.platform as string;

  const lesson = (isRtl ? lessonsAr : lessons)[deviceId];
  const guide = lesson?.platformGuides?.find(

    (item) => item.label.toLowerCase() === platform.toLowerCase()
  );

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
        href={`/dashboard/do-it-yourself/${deviceId}/${mode}`}
        className="back-btn"
        style={{ flexShrink: 0 }}
      >
        {t("backToDevices")}
      </Link>
      {guide && (
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#3e1316",
          }}
        >
          {guide.label}
        </span>
      )}
    </div>
  );

  if (!lesson || !guide || !["video", "reading", "checklist"].includes(mode)) {
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

  const checklistItems = [...guide.checklist, ...lesson.checklist];

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
              {guide.title}
            </h2>
            <div style={{ borderRadius: 16, overflow: "hidden", background: "#2a0d0f" }}>
              <video controls style={{ width: "100%", display: "block" }}>
                <source src={guide.videoUrl} type="video/mp4" />
              </video>
            </div>
          </section>
        )}

        {mode === "reading" && (
          <ReadingJourney
            deviceId={deviceId}
            platform={platform}
            guideSteps={guide.steps}
            whyPerStep={guide.whyPerStep}
            sharedSections={lesson.readingSections}
            t={t}
            isRtl={isRtl}
          />
        )}

        {mode === "checklist" && (
          <ChecklistPageContent
            storageKey={`diy-checklist-${deviceId}-${guide.label}`}
            checklistItems={checklistItems}
            t={t}
          />
        )}
      </div>
    </main>
  );
}

function ReadingJourney({
  deviceId,
  platform,
  guideSteps,
  whyPerStep,
  sharedSections,
  t,
  isRtl,
}: {
  deviceId: string;
  platform: string;
  guideSteps: string[];
  whyPerStep?: string[];
  sharedSections: ReadingSection[];
  t: ReturnType<typeof useTranslations>;
  isRtl: boolean;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  const getDeviceStepTitle = (step: string): string => {
    const lower = step.toLowerCase();
    if (lower.includes("connected to the home wi-fi")) return "Connect to the right Wi-Fi";
    if (lower.includes("search") || lower.includes("settings")) return "Open the right place";
    if (lower.includes("command prompt")) return "Open the network tool";
    if (lower.includes("ipconfig")) return "Show network details";
    if (lower.includes("wi-fi section")) return "Find the Wi-Fi details";
    if (lower.includes("default gateway")) return "Find the router address";
    if (lower.includes("router address")) return "Use the router address";
    if (lower.includes("browser") || lower.includes("chrome") || lower.includes("safari")) return "Open the router page";
    return step.replace(/^[\d٠-٩]+[.٫]\s*/, "").slice(0, 40);
  };

  const getDeviceWhyFallback = (index: number): string => {
    const reasons = [
      "The router settings page usually works only when your device is on the same home Wi-Fi.",
      "This helps you reach the correct tool or settings area instead of searching randomly.",
      "This tool shows the network information your device is currently using.",
      "This command or menu reveals the technical network details safely.",
      "The Wi-Fi section helps you avoid copying information from the wrong network.",
      "The router address is the doorway to your router settings.",
      "Using the correct address helps you reach the router page directly.",
      "Typing the address in the browser bar avoids searching it on Google by mistake.",
      "This final check confirms you are ready to log in to the router safely.",
    ];
    return reasons[index] || "This step prepares you to safely review the router settings.";
  };

  const getSectionWhyFallback = (title: string, body?: string): string => {
    const text = `${title} ${body || ""}`.toLowerCase();
    if (text.includes("log in")) return "Router admin details control important settings, so they should be treated carefully.";
    if (text.includes("wi-fi network name") || text.includes("ssid")) return "A general Wi-Fi name gives less personal information to people nearby.";
    if (text.includes("strong wi-fi password")) return "A strong Wi-Fi password helps stop unwanted people from joining your home network.";
    if (text.includes("security mode") || text.includes("wpa")) return "WPA2-AES or WPA3 protects the connection between your devices and the router.";
    if (text.includes("connected devices")) return "Reviewing connected devices helps you notice unknown devices on your network.";
    if (text.includes("guest network")) return "An open guest network can let nearby people connect without permission.";
    if (text.includes("advanced")) return "Advanced settings can break the internet connection if changed incorrectly.";
    return "This helps you understand the router setting before applying it in the checklist.";
  };

  const journeyMissions = useMemo(() => {
    const deviceMissions = guideSteps.map((step, index) => ({
      group: t("deviceGuide"),
      title: isRtl ? step.replace(/^[\d٠-٩]+[.٫]\s*/, "").slice(0, 50) : getDeviceStepTitle(step),
      whatToDo: step,
      whyItMatters: (whyPerStep && whyPerStep[index]) || getDeviceWhyFallback(index),
      bullets: [] as string[],
    }));

    const routerMissions = sharedSections.map((section) => ({
      group: t("routerProtection"),
      title: section.title.replace(/^[\d٠-٩]+[.٫]\s*/, ""),
      whatToDo: section.body || "",
      whyItMatters: section.whyItMatters || getSectionWhyFallback(section.title, section.body),
      bullets: section.bullets || [],
    }));

    return [...deviceMissions, ...routerMissions];
  }, [guideSteps, sharedSections, whyPerStep, isRtl]);

  const current = journeyMissions[stepIndex];
  const total = journeyMissions.length;
  const progress = Math.round(((stepIndex + 1) / total) * 100);
  const isLast = stepIndex === total - 1;

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
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.8rem" }}>
        <div style={{ display: "inline-block", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8B2635", background: "rgba(99,32,36,0.08)", border: "1px solid rgba(99,32,36,0.16)", padding: "0.35rem 0.85rem", borderRadius: 999 }}>
          {current.group}
        </div>
        <div style={{ color: "#8B2635", fontWeight: 700, fontSize: "0.88rem" }}>
          {t("mission")} {stepIndex + 1} {t("of")} {total}
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
          onClick={() => setStepIndex((p) => Math.max(p - 1, 0))}
          disabled={stepIndex === 0}
          style={{ border: "1px solid rgba(99,32,36,0.18)", background: stepIndex === 0 ? "rgba(99,32,36,0.06)" : "white", color: stepIndex === 0 ? "rgba(99,32,36,0.35)" : "#632024", padding: "0.65rem 1.1rem", borderRadius: 999, cursor: stepIndex === 0 ? "default" : "pointer", fontWeight: 700, fontSize: "0.88rem" }}
        >
          {t("previous")}
        </button>

        {!isLast ? (
          <button
            onClick={() => setStepIndex((p) => p + 1)}
            style={{ border: "none", background: "linear-gradient(135deg, #3e1316, #632024)", color: "#E8D4BC", padding: "0.65rem 1.2rem", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 6px 18px rgba(62,19,22,0.22)" }}
          >
            {t("nextMission")}
          </button>
        ) : (
          <button
            onClick={() => router.push(`/dashboard/do-it-yourself/${deviceId}/checklist/${platform}`)}
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
      <p style={{ color: "#5C4033", margin: "0 0 0.8rem", fontSize: "0.9rem" }}>{t("completeDeviceThenRouter")}</p>

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
