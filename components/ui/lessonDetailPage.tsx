"use client";

import { useState, useEffect, useRef } from "react";
import { quizData, quizDataAr } from "@/app/lib/quizData";
import Quiz from "@/components/quiz";
import { useRouter, useParams } from "next/navigation";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { Lock, BookOpen, Monitor, Image, HelpCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { addDoc, collection, serverTimestamp, doc, setDoc, increment } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";

interface LessonDetailProps {
  lesson: {
    slug: string;
    title: string;
    videoUrl?: string;
    simulationUrl?: string;
    posterUrl?: string;
    videoCaption?: string;
    demoCaption?: string;
    quizUrl?: string;
  };
}

// Tab order and icons stay in code — only the visible labels come from JSON
const TAB_META = {
  Story:  { icon: BookOpen,   step: 1 },
  Demo:   { icon: Monitor,    step: 2 },
  Poster: { icon: Image,      step: 3 },
  Quiz:   { icon: HelpCircle, step: 4 },
} as const;

type Tab = keyof typeof TAB_META;

export default function LessonDetailPage({ lesson }: LessonDetailProps) {
  const t = useTranslations("LessonDetail");
  const tCategory = useTranslations("Categories");
  const tLessons = useTranslations("Lessons");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [selectedTab, setSelectedTab] = useState<Tab>("Story");
  const [storyStarted, setStoryStarted] = useState(false);
  const [demoEnded, setDemoEnded] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const router = useRouter();
  const params = useParams();
  const categoryFromParams = (params && (params as any).category) || "dashboard";
  const category = (lesson as any).category || categoryFromParams;
  const formattedCategory = tCategory(category);
  const rightDemoRef = useRef<HTMLVideoElement>(null);

  const { progress, update, loading } = useLessonProgress(lesson.slug);

  const [localDone, setLocalDone] = useState({
    storyDone: false,
    demoDone: false,
    posterDone: false,
    quizDone: false,
  });

  const merged = {
    storyDone:  progress.storyDone  || localDone.storyDone,
    demoDone:   progress.demoDone   || localDone.demoDone,
    posterDone: progress.posterDone || localDone.posterDone,
    quizDone:   progress.quizDone   || localDone.quizDone,
  };

  const markDone = (key: keyof typeof localDone) => {
    setLocalDone(prev => ({ ...prev, [key]: true }));
    update({ [key]: true });
  };

  const tabUnlocked: Record<Tab, boolean> = {
    Story:  true,
    Demo:   merged.storyDone,
    Poster: merged.demoDone,
    Quiz:   merged.posterDone,
  };

  const handleTabClick = (tab: Tab) => {
    if (!tabUnlocked[tab]) return;
    setSelectedTab(tab);
  };

  useEffect(() => {
    if (selectedTab !== "Story") setStoryStarted(false);
    if (selectedTab !== "Demo") setDemoEnded(false);
  }, [selectedTab]);

  useEffect(() => {
    if (selectedTab === "Poster" && !merged.posterDone) markDone("posterDone");
  }, [selectedTab]);

  const demoVideos: Record<string, string> = {
    "ransomware":              "/demos/ransomware.mp4",
    "virus":                   "/demos/virus.mp4",
    "worm":                    "/demos/worm.mp4",
    "polymorphic-metamorphic": "/demos/demoMorph.mp4",
  };
  const demoVideosAr: Record<string, string> = {
    "ransomware":              "/arabicVids/Basic/demo/ransom.mp4",
    "virus":                   "/arabicVids/Basic/demo/virus.mp4",
    "worm":                    "/arabicVids/Basic/demo/worm.mp4",
    "polymorphic-metamorphic": "/arabicVids/advanced/demo/poly&meta.mp4",
  };
  const arabicDemoVideos: Record<string, string> = {
    "ransomware":              "/arabicVids/Basic/demoCharacter/ransom.mp4",
    "virus":                   "/arabicVids/Basic/demoCharacter/virusDemo.mp4",
    "worm":                    "/arabicVids/Basic/demoCharacter/wormDemo.mp4",
    "polymorphic-metamorphic": "/arabicVids/advanced/demoCharacter/poly&meta.mp4",
  };
  const demoVideoSrc = (isRtl && arabicDemoVideos[lesson.slug])
    ? arabicDemoVideos[lesson.slug]
    : demoVideos[lesson.slug] || null;

  const arabicStoryVideos: Record<string, string> = {
    "ransomware":              "/arabicvids/Basic/stories/ransom.mp4",
    "virus":                   "/arabicvids/Basic/stories/virus.mp4",
    "worm":                    "/arabicvids/Basic/stories/worm.mp4",
    "polymorphic-metamorphic": "/arabicVids/advanced/stories/poly&meta.mp4",
  };
  const storyVideoSrc = isRtl && arabicStoryVideos[lesson.slug]
    ? arabicStoryVideos[lesson.slug]
    : lesson.videoUrl;

  // ─── Arabic caption tracks ────────────────────────────────────────────────
  const arabicStoryCaption: Record<string, string> = {
    "ransomware":              "/captions/arb/basic/ransom_arstory.vtt",
    "virus":                   "/captions/arb/basic/virus_arstory.vtt",
    "worm":                    "/captions/arb/basic/worm_arstory.vtt",
    "polymorphic-metamorphic": "/captions/arb/advanced/polymeta_arstory.vtt",
  };
  const arabicDemoCaption: Record<string, string> = {
    "ransomware":              "/captions/arb/basic/ransom_ardemo.vtt",
    "virus":                   "/captions/arb/basic/virus_ardemo.vtt",
    "worm":                    "/captions/arb/basic/worm_ardemo.vtt",
    "polymorphic-metamorphic": "/captions/arb/advanced/polymeta_ardemo.vtt",
  };
  // ─────────────────────────────────────────────────────────────────────────

  const arabicPosters: Record<string, string> = {
    "ransomware": "/posters/ar/ransom.svg",
    "virus":      "/posters/ar/virus.svg",
    "worm":       "/posters/ar/worm.svg",
    "polymorphic-metamorphic": "/posters/ar/poly&meta.svg",
  };
  const posterSrc = isRtl && arabicPosters[lesson.slug]
    ? arabicPosters[lesson.slug]
    : lesson.posterUrl;

  const descKey = ["ransomware", "virus", "worm", "polymorphic-metamorphic"].includes(lesson.slug)
    ? lesson.slug
    : "default";
  const storyDescription = t(`descriptions.${descKey}`);

  const completedCount = [merged.storyDone, merged.demoDone, merged.posterDone, merged.quizDone].filter(Boolean).length;
  const progressPct = (completedCount / 4) * 100;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      :root {
        --maroon: #632024; --maroon-deep: #3e1316; --maroon-mid: #8B2635;
        --gold: #c5a57e; --gold-light: #E8D4BC; --gold-bright: #d4a94e;
        --cream: #E3DAC9; --cream-light: #f5f0e8; --cream-dark: #cec4b0;
      }
      .ld-root { min-height: 100vh; background: var(--cream); font-family: 'Crimson Pro', Georgia, serif; position: relative; overflow-x: hidden; }
      .ld-orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
      .ld-orb-1 { width: 500px; height: 500px; top: -150px; left: -100px; background: radial-gradient(circle, rgba(99,32,36,.09), transparent 70%); }
      .ld-orb-2 { width: 400px; height: 400px; bottom: -100px; right: -80px; background: radial-gradient(circle, rgba(197,165,126,.12), transparent 70%); }
      .ld-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 6rem 2.5rem 4rem; }
      .ld-header { margin-bottom: 2rem; }
      .ld-back { display: inline-flex; align-items: center; gap: 7px; font-family: 'Cinzel', serif; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; color: var(--maroon); background: none; border: 1px solid rgba(99,32,36,.2); padding: 7px 16px; border-radius: 8px; cursor: pointer; margin-bottom: 1.5rem; transition: background .2s, border-color .2s; text-transform: uppercase; }
      .ld-back:hover { background: rgba(99,32,36,.06); border-color: var(--maroon); }
      .ld-title { font-family: 'Cinzel', serif; font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 700; color: var(--maroon); letter-spacing: -.5px; margin-bottom: .5rem; }
      .ld-progress-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
      .ld-progress-bar { flex: 1; height: 4px; border-radius: 4px; background: rgba(99,32,36,.1); overflow: hidden; }
      .ld-progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--maroon), var(--gold)); transition: width .6s cubic-bezier(.4,0,.2,1); }
      .ld-progress-label { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 1.5px; color: rgba(99,32,36,.5); white-space: nowrap; }
      .ld-tabs { display: flex; gap: 4px; margin-bottom: 1.5rem; background: rgba(99,32,36,.05); padding: 4px; border-radius: 12px; border: 1px solid rgba(197,165,126,.25); }
      .ld-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 16px; border-radius: 9px; border: none; font-family: 'Cinzel', serif; font-size: 11px; font-weight: 600; letter-spacing: 1px; cursor: pointer; transition: all .2s; position: relative; background: transparent; color: rgba(99,32,36,.45); }
      .ld-tab.active { background: var(--maroon); color: var(--cream-light); box-shadow: 0 2px 12px rgba(99,32,36,.25); }
      .ld-tab.unlocked:not(.active):hover { background: rgba(99,32,36,.08); color: var(--maroon); }
      .ld-tab.locked { cursor: not-allowed; opacity: .4; }
      .ld-tab-lock { position: absolute; top: 6px; right: 8px; width: 12px; height: 12px; opacity: .5; }
      .ld-content { display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; align-items: stretch; height: 480px; }
      .ld-left { border-radius: 18px; overflow: hidden; border: 2px solid rgba(197,165,126,.35); box-shadow: 0 8px 32px rgba(99,32,36,.1); background: var(--gold-light); display: flex; align-items: center; justify-content: center; flex: 1; }
      .ld-left img, .ld-left video { width: 100%; height: 100%; object-fit: cover; display: block; }
      .ld-right { border-radius: 18px; border: 1.5px solid rgba(197,165,126,.3); background: rgba(255,255,255,.55); backdrop-filter: blur(8px); box-shadow: 0 8px 32px rgba(99,32,36,.07); overflow: hidden; height: 414px; display: flex; align-items: center; justify-content: center; }
      .ld-right video { width: 100%; height: auto; max-height: 480px; display: block; border-radius: 12px; object-fit: contain; }
      .ld-right > img { width: 100%; display: block; border-radius: 16px; }
      .ld-story-intro { padding: 3rem 2.5rem; text-align: center; max-width: 520px; width: 100%; display: flex; flex-direction: column; align-items: center; }
      .ld-story-icon { font-size: 3rem; margin-bottom: 1rem; }
      .ld-story-heading { font-family: 'Cinzel', serif; font-size: 1.5rem; font-weight: 700; color: var(--maroon); margin-bottom: 1rem; }
      .ld-story-desc { font-size: 1.1rem; line-height: 1.8; color: #5a2428; font-style: italic; margin-bottom: 2rem; }
      .ld-watch-btn { padding: 13px 32px; border: none; border-radius: 12px; background: var(--maroon); color: var(--cream-light); font-family: 'Cinzel', serif; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; cursor: pointer; box-shadow: 0 4px 18px rgba(99,32,36,.28); transition: transform .2s, box-shadow .2s, background .2s; }
      .ld-watch-btn:hover { background: var(--maroon-deep); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,32,36,.35); }
      .ld-gem-divider { display: flex; align-items: center; gap: 10px; margin: 1rem 0; width: 100%; }
      .ld-gem-line { flex: 1; height: 1px; background: linear-gradient(90deg, var(--gold), transparent); }
      .ld-gem { width: 5px; height: 5px; background: var(--gold); transform: rotate(45deg); border-radius: 1px; }
      .ld-quiz-wrap { width: 100%; padding: 1.5rem; }
      @media (max-width: 768px) { .ld-content { grid-template-columns: 1fr; } .ld-left { aspect-ratio: 16/9; } .ld-tabs { flex-wrap: wrap; } }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); document.head.removeChild(link); };
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#E3DAC9", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Cinzel', serif", color: "#632024", fontSize: "1rem", letterSpacing: "2px", opacity: .6 }}>
        {t("loading")}
      </div>
    </div>
  );

  return (
    <div className="ld-root">
      <div className="ld-orb ld-orb-1" />
      <div className="ld-orb ld-orb-2" />

      <div className="ld-inner">
        <div className="ld-header">
          <h1 className="ld-title">{(lesson as any).titleKey ? tLessons((lesson as any).titleKey) : lesson.title}</h1>
          <div className="ld-progress-wrap">
            <div className="ld-progress-bar">
              <div className="ld-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="ld-progress-label">
              {t("progress_label", { done: completedCount })}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="ld-tabs">
          {(Object.keys(TAB_META) as Tab[]).map((tab) => {
            const { icon: Icon } = TAB_META[tab];
            const unlocked = tabUnlocked[tab];
            const active = selectedTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`ld-tab ${active ? "active" : ""} ${unlocked ? "unlocked" : "locked"}`}
              >
                <Icon size={13} />
                {t(`tabs.${tab}`)}
                {!unlocked && <Lock className="ld-tab-lock" size={10} />}
              </button>
            );
          })}
        </div>

        <div className="ld-content">
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: 0 }}>
            <div className="ld-left" style={{ flex: 1 }}>
              {selectedTab === "Story" && !storyStarted && (
                <video
                  src={isRtl ? "/arabicvids/characters/hamad.mp4" : "/lessons/vids/newLesson.mp4"}
                  autoPlay className="rounded-lg w-full" onEnded={() => setFeedback(null)}
                />
              )}
              {selectedTab === "Story" && storyStarted && (
                <img src="/avatar.png" alt="Hamad" />
              )}
              {selectedTab === "Poster" && (
                <video src="/posters/scrolldown.mp4" autoPlay loop muted />
              )}
              {selectedTab === "Quiz" && (
                <img src="/characters/ArabianHorse.jpeg" alt="Arabian Horse" />
              )}
              {selectedTab === "Demo" && (
                demoVideoSrc && !demoEnded
                  ? <video src={demoVideoSrc} autoPlay playsInline onEnded={() => { setDemoEnded(true); setTimeout(() => rightDemoRef.current?.play(), 200); }} />
                  : <img src="/characters/oryx.jpeg" alt="Oryx" />
              )}
            </div>

            <button
              className="ld-back"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => router.push(`/dashboard/${category}`)}
            >
              {t("back", { category: formattedCategory })}
            </button>
          </div>

          {/* Right column */}
          <div className="ld-right">
            {selectedTab === "Story" && (
              !storyStarted ? (
                <div className="ld-story-intro">
                  <div className="ld-story-icon">📖</div>
                  <h2 className="ld-story-heading">{t("story_intro.heading")}</h2>
                  <div className="ld-gem-divider">
                    <div className="ld-gem-line" />
                    <div className="ld-gem" />
                    <div className="ld-gem-line" style={{ background: "linear-gradient(90deg, transparent, var(--gold))", transform: "scaleX(-1)" }} />
                  </div>
                  <p className="ld-story-desc">{storyDescription}</p>
                  <button className="ld-watch-btn" onClick={() => setStoryStarted(true)}>
                    {t("story_intro.watch_btn")}
                  </button>
                </div>
              ) : (
                <video
                  src={storyVideoSrc}
                  autoPlay
                  controls
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onEnded={() => { if (!merged.storyDone) markDone("storyDone"); }}
                >
                  {/* ── Caption track: Arabic or English ── */}
                  {isRtl
                    ? <track
                        src={arabicStoryCaption[lesson.slug]}
                        kind="captions"
                        srcLang="ar"
                        label="Arabic"
                        default
                      />
                    : <track
                        src={lesson.videoCaption}
                        kind="captions"
                        srcLang="en"
                        label="English"
                        default
                      />
                  }
                </video>
              )
            )}

            {selectedTab === "Demo" && (isRtl ? demoVideosAr[lesson.slug] : lesson.simulationUrl) && (
              <video
                ref={rightDemoRef}
                src={isRtl ? demoVideosAr[lesson.slug] : lesson.simulationUrl}
                controls
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onEnded={() => { if (!merged.demoDone) markDone("demoDone"); }}
              >
                {/* ── Caption track: Arabic or English ── */}
                {isRtl
                  ? <track
                      src={arabicDemoCaption[lesson.slug]}
                      kind="captions"
                      srcLang="ar"
                      label="Arabic"
                      default
                    />
                  : <track
                      src={lesson.demoCaption}
                      kind="captions"
                      srcLang="en"
                      label="English"
                      default
                    />
                }
              </video>
            )}

            {selectedTab === "Poster" && posterSrc && (
              <div style={{ width: "100%", height: "414px", overflowY: "auto", overflowX: "hidden", borderRadius: 16, scrollbarWidth: "thin", scrollbarColor: "rgba(99,32,36,.3) transparent" }}>
                <img src={posterSrc} alt="Poster" style={{ width: "100%", height: "auto", display: "block", borderRadius: 0 }} />
              </div>
            )}

            {selectedTab === "Quiz" && (
              <div className="ld-quiz-wrap">
                <Quiz
                  questions={(isRtl ? quizDataAr : quizData)[lesson.slug] || []}
                  onAnswerFeedback={(f) => { setFeedback(f); setFeedbackKey(prev => prev + 1); }}
                  onRetake={() => {
                    update({ quizRetakes: (progress.quizRetakes || 0) + 1 });
                  }}
                  onQuizDone={async (score, total) => {
                    const isFirstCompletion = !merged.quizDone;
                    if (isFirstCompletion) markDone("quizDone");
                    const user = auth.currentUser;
                    if (!user) return;
                    try {
                      const attemptData = {
                        userID: user.uid,
                        lessonID: lesson.slug,
                        score,
                        total,
                        attemptedAt: serverTimestamp(),
                      };
                      await Promise.all([
                        addDoc(collection(db, "quizAttempt"), attemptData),
                        addDoc(collection(db, "user", user.uid, "quizAttempts"), attemptData),
                      ]);
                      if (isFirstCompletion) {
                        await setDoc(doc(db, "user", user.uid), { xp: increment(100) }, { merge: true });
                      }
                    } catch (err) {
                      console.error("Failed to save quiz attempt:", err);
                    }
                  }}
                />
              </div>
            )}

            {!lesson.videoUrl && !lesson.simulationUrl && !lesson.posterUrl && !lesson.quizUrl && (
              <p style={{ color: "rgba(99,32,36,.5)", fontStyle: "italic", fontSize: "1rem" }}>
                {t("no_content")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}