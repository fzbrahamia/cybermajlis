"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { globalLessonStyles, lessons, pageShellStyle } from "../../lessonData";

type Mode = "video" | "reading" | "checklist";

export default function PlatformLessonPage() {
  const params = useParams();
  const router = useRouter();

  const deviceId = params.device as string;
  const mode = params.mode as Mode;
  const platform = params.platform as string;

  const lesson = lessons[deviceId];
  const guide = lesson?.platformGuides?.find(
    (item) => item.label.toLowerCase() === platform.toLowerCase()
  );

  if (!lesson || !guide || !["video", "reading", "checklist"].includes(mode)) {
    return (
      <main style={pageShellStyle}>
        <style>{globalLessonStyles}</style>
        <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
          <Link href={`/dashboard/do-it-yourself/${deviceId}/${mode}`} className="back-btn">
            ← Back
          </Link>
          <h1>Page not found</h1>
        </div>
      </main>
    );
  }

  const checklistItems = [...guide.checklist, ...lesson.checklist];

  const guideTitleStyle = {
    fontFamily: "'Cinzel', serif",
    fontSize: "clamp(1.4rem, 3vw, 2.1rem)",
    marginTop: 0,
    marginBottom: "1rem",
    color: "#3e1316",
    lineHeight: 1.2,
  } as const;

  return (
    <main style={pageShellStyle}>
      <style>{globalLessonStyles}</style>

      <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
        <header style={{ marginBottom: "2rem" }}>
          <Link href={`/dashboard/do-it-yourself/${deviceId}/${mode}`} className="back-btn">
            ← Back to device choices
          </Link>
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
            <h2 style={guideTitleStyle}>{guide.title}</h2>

            <div
              style={{
                marginTop: "1rem",
                borderRadius: 20,
                overflow: "hidden",
                background: "#2a0d0f",
              }}
            >
              <video controls style={{ width: "100%", display: "block" }}>
                <source src={guide.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </section>
        )}

        {mode === "reading" && (
          <ReadingJourney
            deviceId={deviceId}
            platform={guide.label.toLowerCase()}
            guideTitle={guide.title}
            guideSteps={guide.steps}
            sharedSections={lesson.readingSections}
          />
        )}

        {mode === "checklist" && (
          <ChecklistPageContent
            storageKey={`diy-checklist-${deviceId}-${guide.label}`}
            checklistItems={checklistItems}
          />
        )}
      </div>
    </main>
  );
}

function ReadingJourney({
  deviceId,
  platform,
  guideTitle,
  guideSteps,
  sharedSections,
}: {
  deviceId: string;
  platform: string;
  guideTitle: string;
  guideSteps: string[];
  sharedSections: {
    title: string;
    body?: string;
    bullets?: string[];
  }[];
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  const getDeviceTitle = (index: number, step: string) => {
    const lower = step.toLowerCase();

    if (lower.includes("connected to the home wi-fi")) return "Connect to the right Wi-Fi";
    if (lower.includes("search") || lower.includes("settings")) return "Open the right place";
    if (lower.includes("command prompt")) return "Open the network tool";
    if (lower.includes("ipconfig")) return "Show network details";
    if (lower.includes("wi-fi section")) return "Find the Wi-Fi details";
    if (lower.includes("default gateway")) return "Find the router address";
    if (lower.includes("router address")) return "Use the router address";
    if (lower.includes("browser") || lower.includes("chrome") || lower.includes("safari")) {
      return "Open the router page";
    }

    return `Device guide point ${index + 1}`;
  };

  const getDeviceWhy = (index: number) => {
    const reasons = [
      "The router settings page usually works only when your device is connected to the same home Wi-Fi.",
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

  const getRouterWhy = (title: string) => {
    const lower = title.toLowerCase();

    if (lower.includes("log in")) {
      return "Router admin details control important settings, so they should be treated more carefully than the normal Wi-Fi password.";
    }

    if (lower.includes("wi-fi network name")) {
      return "A general Wi-Fi name gives less personal information to people nearby.";
    }

    if (lower.includes("strong wi-fi password")) {
      return "A strong Wi-Fi password helps stop unwanted people from joining your home network.";
    }

    if (lower.includes("security mode")) {
      return "WPA2-AES or WPA3 helps protect the connection between your devices and the router.";
    }

    if (lower.includes("connected devices")) {
      return "Reviewing connected devices helps you notice unknown phones, laptops, or smart devices using your Wi-Fi.";
    }

    if (lower.includes("guest network")) {
      return "An open guest network can let nearby people connect without permission, so it should be closed or protected.";
    }

    if (lower.includes("advanced")) {
      return "Advanced settings can break the internet connection if changed incorrectly, so it is safer to avoid them.";
    }

    return "This helps you understand the router setting before applying it in the checklist.";
  };

  const cleanRouterTitle = (title: string) => {
    return title.replace(/^\d+\.\s*/, "");
  };

  const journeyMissions = useMemo(() => {
    const deviceMissions = guideSteps.map((step, index) => ({
      group: "Device Guide",
      title: getDeviceTitle(index, step),
      whatToDo: step,
      whyItMatters: getDeviceWhy(index),
      bullets: [] as string[],
    }));

    const routerMissions = sharedSections.map((section) => ({
      group: "Router Protection",
      title: cleanRouterTitle(section.title),
      whatToDo: section.body || "",
      whyItMatters: getRouterWhy(section.title),
      bullets: section.bullets || [],
    }));

    return [...deviceMissions, ...routerMissions];
  }, [guideSteps, sharedSections]);

  const currentMission = journeyMissions[stepIndex];
  const totalMissions = journeyMissions.length;
  const progress = Math.round(((stepIndex + 1) / totalMissions) * 100);
  const isLastMission = stepIndex === totalMissions - 1;

  const nextMission = () => {
  if (!isLastMission) {
    setStepIndex((prev) => prev + 1);
  }
};

const previousMission = () => {
  if (stepIndex > 0) {
    setStepIndex((prev) => prev - 1);
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
          Mission {stepIndex + 1} / {totalMissions}
        </div>
      </div>

      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          marginTop: 0,
          marginBottom: "0.8rem",
          color: "#3e1316",
          lineHeight: 1.2,
        }}
      >
        {currentMission.title}
      </h2>

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
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              marginTop: 0,
              marginBottom: "0.7rem",
              color: "#3e1316",
            }}
          >
            What to do
          </h3>

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
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              marginTop: 0,
              marginBottom: "0.7rem",
              color: "#3e1316",
            }}
          >
            Why this matters
          </h3>

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
          disabled={stepIndex === 0}
          style={{
            border: "1px solid rgba(99,32,36,0.18)",
            background: stepIndex === 0 ? "rgba(99,32,36,0.06)" : "white",
            color: stepIndex === 0 ? "rgba(99,32,36,0.35)" : "#632024",
            padding: "0.75rem 1.2rem",
            borderRadius: 999,
            cursor: stepIndex === 0 ? "default" : "pointer",
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
            onClick={() =>
              router.push(`/dashboard/do-it-yourself/${deviceId}/checklist/${platform}`)
            }
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
      <p style={{ color: "#5C4033" }}>
        Complete the steps for your selected device, then continue with the shared router protection steps.
      </p>

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
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { globalLessonStyles, lessons, pageShellStyle } from "../../lessonData";

// type Mode = "video" | "reading" | "checklist";

// export default function PlatformLessonPage() {
//   const params = useParams();
//   const deviceId = params.device as string;
//   const mode = params.mode as Mode;
//   const platform = params.platform as string;

//   const lesson = lessons[deviceId];
//   const guide = lesson?.platformGuides?.find(
//     (item) => item.label.toLowerCase() === platform.toLowerCase()
//   );

//   if (!lesson || !guide || !["video", "reading", "checklist"].includes(mode)) {
//     return (
//       <main style={pageShellStyle}>
//         <style>{globalLessonStyles}</style>
//         <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
//           <Link href={`/dashboard/do-it-yourself/${deviceId}/${mode}`} className="back-btn">
//             ← Back
//           </Link>
//           <h1>Page not found</h1>
//         </div>
//       </main>
//     );
//   }

//   const checklistItems = [...guide.checklist, ...lesson.checklist];

//   const guideTitleStyle = {
//   fontFamily: "'Cinzel', serif",
//   fontSize: "clamp(1.2rem, 1.7vw, 2rem)",
//   marginTop: 0,
//   marginBottom: "1rem",
//   color: "#3e1316",
//   lineHeight: 1.2,
// } as const;

//   return (
//     <main style={pageShellStyle}>
//       <style>{globalLessonStyles}</style>

//       <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
//         <header style={{ marginBottom: "2rem" }}>
//           <Link href={`/dashboard/do-it-yourself/${deviceId}/${mode}`} className="back-btn">
//             ← Back to device choices
//           </Link>
//         </header>

//         {mode === "video" && (
//           <section
//             style={{
//               background: "#fdf8f4",
//               borderRadius: 24,
//               padding: "1.5rem",
//               border: "1px solid rgba(99,32,36,0.15)",
//               boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
//             }}
//           >
//             <h2 style={guideTitleStyle}>{guide.title}</h2>

//             <div
//               style={{
//                 marginTop: "1rem",
//                 borderRadius: 20,
//                 overflow: "hidden",
//                 background: "#2a0d0f",
//               }}
//             >
//               <video controls style={{ width: "100%", display: "block" }}>
//                 <source src={guide.videoUrl} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>
//             </div>
//           </section>
//         )}

//         {mode === "reading" && (
//           <section
//             style={{
//               background: "#fdf8f4",
//               borderRadius: 24,
//               padding: "1.5rem",
//               border: "1px solid rgba(99,32,36,0.15)",
//               boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
//             }}
//           >
//             <h2 style={guideTitleStyle}>{guide.title}</h2>

//             <article className="reading-step" style={{ marginBottom: "1rem" }}>
//               <ul>
//                 {guide.steps.map((step, index) => (
//                   <li key={index}>{step}</li>
//                 ))}
//               </ul>
//             </article>

//             <h2
//               style={{
//                 fontFamily: "'Cinzel', serif",
//                 fontSize: "clamp(1.6rem, 3vw, 2.3rem)",
//                 marginTop: "1.5rem",
//                 color: "#3e1316",
//               }}
//             >
//               Shared router protection steps
//             </h2>

//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "1rem",
//                 marginTop: "1.2rem",
//               }}
//             >
//               {lesson.readingSections.map((section, index) => (
//                 <article key={index} className="reading-step">
//                   <h3>{section.title}</h3>
//                   {section.body && <p>{section.body}</p>}
//                   {section.bullets && (
//                     <ul>
//                       {section.bullets.map((bullet, bulletIndex) => (
//                         <li key={bulletIndex}>{bullet}</li>
//                       ))}
//                     </ul>
//                   )}
//                 </article>
//               ))}
//             </div>
//           </section>
//         )}

//         {mode === "checklist" && (
//           <ChecklistPageContent
//             storageKey={`diy-checklist-${deviceId}-${guide.label}`}
//             checklistItems={checklistItems}
//           />
//         )}
//       </div>
//     </main>
//   );
// }

// function ChecklistPageContent({
//   checklistItems,
//   storageKey,
// }: {
//   checklistItems: string[];
//   storageKey: string;
// }) {
//   const [checked, setChecked] = useState<boolean[]>([]);

//   useEffect(() => {
//     const saved = localStorage.getItem(storageKey);

//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         if (Array.isArray(parsed)) {
//           setChecked(checklistItems.map((_, index) => Boolean(parsed[index])));
//           return;
//         }
//       } catch {}
//     }

//     setChecked(checklistItems.map(() => false));
//   }, [storageKey, checklistItems.length]);

//   useEffect(() => {
//     if (checked.length !== checklistItems.length) return;
//     localStorage.setItem(storageKey, JSON.stringify(checked));
//   }, [checked, storageKey, checklistItems.length]);

//   const completed = checked.filter(Boolean).length;
//   const progress = checklistItems.length
//     ? Math.round((completed / checklistItems.length) * 100)
//     : 0;

//   return (
//     <section
//       style={{
//         background: "#fdf8f4",
//         borderRadius: 24,
//         padding: "1.5rem",
//         border: "1px solid rgba(99,32,36,0.15)",
//         boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
//       }}
//     >
//       <p style={{ color: "#5C4033" }}>
//         Complete the steps for your selected device, then continue with the shared router protection steps.
//       </p>

//       <div
//         style={{
//           height: 9,
//           background: "rgba(99,32,36,0.12)",
//           borderRadius: 999,
//           overflow: "hidden",
//           margin: "1rem 0 0.5rem",
//         }}
//       >
//         <div
//           style={{
//             height: "100%",
//             width: `${progress}%`,
//             background: "linear-gradient(90deg, #632024, #c5a57e)",
//             transition: "width 0.25s ease",
//           }}
//         />
//       </div>

//       <p
//         style={{
//           color: "#8B2635",
//           fontWeight: 700,
//           marginBottom: "1.2rem",
//         }}
//       >
//         {completed}/{checklistItems.length} completed
//       </p>

//       <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
//         {checklistItems.map((step, index) => (
//           <label key={index} className={`check-item ${checked[index] ? "done" : ""}`}>
//             <input
//               type="checkbox"
//               checked={checked[index] || false}
//               onChange={() => {
//                 setChecked((prev) => {
//                   const fixed = checklistItems.map((_, i) => Boolean(prev[i]));
//                   fixed[index] = !fixed[index];
//                   return fixed;
//                 });
//               }}
//             />
//             <span
//               style={{
//                 color: "#3e1316",
//                 lineHeight: 1.6,
//                 textDecoration: checked[index] ? "line-through" : "none",
//               }}
//             >
//               {step}
//             </span>
//           </label>
//         ))}
//       </div>

//       {completed === checklistItems.length && (
//         <div
//           style={{
//             marginTop: "1.2rem",
//             padding: "1rem",
//             borderRadius: 16,
//             background: "rgba(34,197,94,0.12)",
//             border: "1px solid rgba(34,197,94,0.25)",
//             color: "#14532d",
//             fontWeight: 700,
//           }}
//         >
//           Great job! You completed this security checklist.
//         </div>
//       )}
//     </section>
//   );
// }