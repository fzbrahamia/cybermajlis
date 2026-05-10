"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useTranslations } from "next-intl";
import { seedLessonsData } from "@/app/lib/seedLessons";

type Category = {
  nameKey: string;
  descKey: string;
  href?: string;
  badgeKey?: string;
  icon: string;
  locked?: boolean;
  progress?: string;
};

export default function DashboardPage() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const t = useTranslations("Dashboard");
  const tAuth = useTranslations("Auth");

  const [showLoginToast, setShowLoginToast] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("loginSuccess") === "true") {
      sessionStorage.removeItem("loginSuccess");
      setShowLoginToast(true);
    }
  }, []);

  useEffect(() => {
    if (!showLoginToast) return;
    const timer = setTimeout(() => setShowLoginToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showLoginToast]);

  // Load progress for each lesson
  const { progress: virusProgress } = useLessonProgress("virus");
  const { progress: wormProgress } = useLessonProgress("worm");
  const { progress: ransomwareProgress } = useLessonProgress("ransomware");
  const { progress: polyProgress } = useLessonProgress("polymorphic-metamorphic");

  // Count completed lessons (all 4 tabs done = 1 complete lesson)
  const isLessonComplete = (p: any) => p.storyDone && p.demoDone && p.posterDone && p.quizDone;
  const completedLessons = [virusProgress, wormProgress, ransomwareProgress, polyProgress].filter(isLessonComplete).length;
  const totalLessons = 4;

  // XP: 100 per completed lesson
  const totalXP = completedLessons * 100;

  // Level
  const level = completedLessons === 0 ? t("levels.beginner") : completedLessons === 1 ? t("levels.aware") : completedLessons === 2 ? t("levels.defender") : t("levels.guardian");
  // Overall progress %
  const overallPct = Math.round((completedLessons / totalLessons) * 100);

  // Per-category progress
  const basicLessons = [virusProgress, wormProgress, ransomwareProgress];
  const basicCompleted = basicLessons.filter(isLessonComplete).length;
  const advancedCompleted = [polyProgress].filter(isLessonComplete).length;

  const categories: Category[] = [
    {
      nameKey: "basic.name",
      descKey: "basic.description",
      href: "/dashboard/basic",
      badgeKey: "basic.badge",
      icon: "/icons/webProtection.gif",
      progress: `${basicCompleted}/3`,
    },
    {
      nameKey: "advanced.name",
      descKey: "advanced.description",
      href: "/dashboard/advanced",
      badgeKey: "advanced.badge",
      icon: "/icons/growthIcon.gif",
      progress: `${advancedCompleted}/3`,
    },
    {
      nameKey: "realtime.name",
      descKey: "realtime.description",
      badgeKey: "realtime.badge",
      icon: "/icons/lock.gif",
      locked: true,
    },
  ];

  useEffect(() => {
    if (!localStorage.getItem("lessonsSeeded")) {
      seedLessonsData()
        .then(() => localStorage.setItem("lessonsSeeded", "1"))
        .catch((err) => console.error("Lesson seed failed:", err));
    }
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

      :root {
        --maroon: #632024;
        --maroon-deep: #3e1316;
        --maroon-mid: #8B2635;
        --gold: #c5a57e;
        --gold-light: #E8D4BC;
        --cream: #E3DAC9;
        --cream-dark: #d4c5b0;
        --sand: #FDF8F0;
        --text-dark: #2a0d0f;
      }

      .dashboard-root *, .dashboard-root *::before, .dashboard-root *::after { 
        box-sizing: border-box; 
      }

      body {
        font-family: 'Crimson Pro', Georgia, serif;
        background-color: var(--cream);
        color: var(--maroon);
        overflow-x: hidden;
      }

      .dashboard-root {
        min-height: 100vh;
        position: relative;
        padding: 0 2rem 6rem;
        overflow: hidden;
      }

      .bg-pattern {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background:
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,32,36,0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 100% 80%, rgba(197,165,126,0.15) 0%, transparent 60%);
      }

      .orb {
        position: fixed;
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
        filter: blur(80px);
        opacity: 0.18;
        animation: orb-drift 18s ease-in-out infinite alternate;
      }
      .orb-1 { width: 420px; height: 420px; background: var(--maroon); top: -120px; left: -100px; animation-delay: 0s; }
      .orb-2 { width: 280px; height: 280px; background: var(--gold); top: 40%; right: -80px; animation-delay: -6s; }
      .orb-3 { width: 200px; height: 200px; background: var(--maroon-mid); bottom: 10%; left: 30%; animation-delay: -12s; }

      @keyframes orb-drift {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(30px, 40px) scale(1.08); }
      }

      .content {
        position: relative;
        z-index: 1;
        max-width: 1200px;
        margin: 0 auto;
      }


      .header {
        text-align: center;
        padding: 7rem 0 3.5rem;
      }

      .header-eyebrow {
        display: inline-block;
        font-family: 'Cinzel', serif;
        font-size: 0.7rem;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: var(--maroon-mid);
        background: linear-gradient(135deg, rgba(99,32,36,0.08), rgba(197,165,126,0.18));
        border: 1px solid rgba(99,32,36,0.2);
        padding: 0.45rem 1.4rem;
        border-radius: 999px;
        margin-bottom: 1rem;
      }

      .header h1 {
        font-family: 'Cinzel', serif;
        font-size: clamp(2.4rem, 5vw, 4rem);
        font-weight: 900;
        line-height: 1.1;
        color: var(--maroon-deep);
        letter-spacing: -0.01em;
        margin-bottom: 1.2rem;
      }

      .header h1 span { color: var(--maroon-mid); }

      .header p {
        font-size: 1.15rem;
        color: #5C4033;
        font-style: italic;
        font-weight: 300;
        letter-spacing: 0.01em;
      }

      .tracker {
        background: linear-gradient(135deg, var(--maroon-deep) 0%, var(--maroon) 60%, #7a1e22 100%);
        border-radius: 24px;
        padding: 2.5rem 3rem;
        margin-bottom: 3.5rem;
        position: relative;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(99,32,36,0.3), 0 2px 0 rgba(255,255,255,0.08) inset;
      }

      .tracker::before {
        content: '';
        position: absolute;
        top: -60px; right: -60px;
        width: 200px; height: 200px;
        border-radius: 50%;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
      }
      .tracker::after {
        content: '';
        position: absolute;
        bottom: -40px; left: -40px;
        width: 140px; height: 140px;
        border-radius: 50%;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
      }

      .tracker-header {
        margin-bottom: 1.8rem;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .tracker-header h2 {
        font-family: 'Cinzel', serif;
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--cream);
        letter-spacing: 0.05em;
      }

      .tracker-header p {
        font-size: 0.85rem;
        color: rgba(227,218,201,0.55);
        font-style: italic;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
      }

      @media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

      .stat-card {
        background: rgba(253,248,240,0.07);
        border: 1px solid rgba(232,212,188,0.15);
        border-radius: 16px;
        padding: 1.4rem 1.2rem;
        transition: background 0.2s, transform 0.2s;
        position: relative;
        overflow: hidden;
      }

      .stat-card:hover {
        background: rgba(253,248,240,0.12);
        transform: translateY(-2px);
      }

      .stat-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--gold), transparent);
        opacity: 0.4;
      }

      .stat-emoji { font-size: 1.6rem; margin-bottom: 0.5rem; display: block; }

      .stat-value {
        font-family: 'Cinzel', serif;
        font-size: 1.7rem;
        font-weight: 700;
        color: var(--gold-light);
        line-height: 1;
        margin-bottom: 0.3rem;
      }

      .stat-label {
        font-size: 0.75rem;
        color: rgba(227,218,201,0.55);
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .progress-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: rgba(227,218,201,0.6);
        margin-bottom: 0.6rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .progress-track {
        width: 100%;
        height: 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 999px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--gold), #e8b87a);
        width: 0%;
        transition: width 1s ease;
        box-shadow: 0 0 8px rgba(197,165,126,0.5);
      }

      .section-label {
        font-family: 'Cinzel', serif;
        font-size: 0.65rem;
        letter-spacing: 0.4em;
        text-transform: uppercase;
        color: var(--maroon-mid);
        opacity: 0.6;
        text-align: center;
        margin-bottom: 2rem;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        align-items: stretch;
      }

      @media (max-width: 900px) { .cards-grid { grid-template-columns: 1fr; } }

      .card-wrap { text-decoration: none; display: block; height: 100%; }

      .card {
        position: relative;
        height: 100%;
        min-height: 380px;
        border-radius: 22px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
        border: 1px solid rgba(99,32,36,0.18);
      }

      .card:not(.card--locked):hover {
        transform: translateY(-10px) scale(1.01);
        box-shadow: 0 30px 70px rgba(99,32,36,0.22), 0 0 0 1px rgba(197,165,126,0.3);
      }

      .card--basic { background: linear-gradient(160deg, #f5ede0 0%, #e8d3b8 100%); }
      .card--advanced { background: linear-gradient(160deg, var(--maroon-deep) 0%, var(--maroon) 100%); }
      .card--locked { background: linear-gradient(160deg, #d4c5b0 0%, #c8b89a 100%); opacity: 0.6; cursor: not-allowed; }

      .card-stripe { height: 4px; width: 100%; }
      .card--basic .card-stripe { background: linear-gradient(90deg, var(--maroon), var(--gold)); }
      .card--advanced .card-stripe { background: linear-gradient(90deg, var(--gold), var(--maroon-mid)); }
      .card--locked .card-stripe { background: linear-gradient(90deg, #aaa, #888); }

      .card-inner {
        padding: 2rem 2rem 2.2rem;
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 0;
      }

      .card-badge {
        display: inline-block;
        font-family: 'Cinzel', serif;
        font-size: 0.6rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        padding: 0.3rem 0.9rem;
        border-radius: 999px;
        font-weight: 700;
        align-self: flex-start;
        margin-bottom: 1.4rem;
      }

      .card--basic .card-badge { background: rgba(99,32,36,0.1); color: var(--maroon); border: 1px solid rgba(99,32,36,0.2); }
      .card--advanced .card-badge { background: rgba(197,165,126,0.15); color: var(--gold-light); border: 1px solid rgba(197,165,126,0.25); }
      .card--locked .card-badge { background: rgba(0,0,0,0.1); color: #666; border: 1px solid rgba(0,0,0,0.1); }

      .card-icon-wrap {
        width: 72px; height: 72px;
        border-radius: 18px;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 1.5rem;
        position: relative;
      }
      .card--basic .card-icon-wrap { background: rgba(99,32,36,0.08); border: 1px solid rgba(99,32,36,0.12); }
      .card--advanced .card-icon-wrap { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); }
      .card--locked .card-icon-wrap { background: rgba(0,0,0,0.07); border: 1px solid rgba(0,0,0,0.1); }
      .card-icon-wrap img { width: 44px; height: 44px; }
      .card--advanced .card-icon-wrap img { filter: brightness(0) invert(1); opacity: 0.85; }

      .card-title {
        font-family: 'Cinzel', serif;
        font-size: 1.55rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        line-height: 1.15;
        margin-bottom: 0.9rem;
      }
      .card--basic .card-title { color: var(--maroon-deep); }
      .card--advanced .card-title { color: var(--cream); }
      .card--locked .card-title { color: #5C4033; }

      .card-desc { font-size: 0.95rem; line-height: 1.7; flex: 1; font-weight: 300; }
      .card--basic .card-desc { color: #5C4033; }
      .card--advanced .card-desc { color: rgba(227,218,201,0.75); }
      .card--locked .card-desc { color: #7a6050; }

      .card-progress { margin-top: 1.6rem; padding-top: 1.2rem; border-top: 1px solid rgba(99,32,36,0.1); }
      .card--advanced .card-progress { border-top-color: rgba(255,255,255,0.1); }

      .card-progress-meta {
        display: flex; justify-content: space-between;
        font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.6rem;
      }
      .card--basic .card-progress-meta { color: var(--maroon-mid); }
      .card--advanced .card-progress-meta { color: rgba(227,218,201,0.5); }

      .card-track { width: 100%; height: 5px; border-radius: 999px; overflow: hidden; }
      .card--basic .card-track { background: rgba(99,32,36,0.12); }
      .card--advanced .card-track { background: rgba(255,255,255,0.1); }

      .card-fill { height: 100%; border-radius: 999px; width: 0%; }
      .card--basic .card-fill { background: linear-gradient(90deg, var(--maroon-mid), var(--gold)); }
      .card--advanced .card-fill { background: linear-gradient(90deg, var(--gold), #e8b87a); }

      .card-locked-footer {
        margin-top: 1.6rem; padding-top: 1.2rem;
        border-top: 1px solid rgba(0,0,0,0.08);
        font-size: 0.85rem; color: #7a6050;
        display: flex; align-items: center; gap: 0.5rem;
      }

      .card-arrow {
        position: absolute; bottom: 1.5rem; right: 1.8rem;
        opacity: 0; transform: translateX(-6px);
        transition: opacity 0.25s, transform 0.25s;
        font-size: 1.1rem;
      }
      .card--basic .card-arrow { color: var(--maroon-mid); }
      .card--advanced .card-arrow { color: var(--gold); }
      .card:not(.card--locked):hover .card-arrow { opacity: 1; transform: translateX(0); }

      .card-number {
        position: absolute; top: 1.4rem; right: 1.6rem;
        font-family: 'Cinzel', serif; font-size: 7rem; font-weight: 900;
        line-height: 1; pointer-events: none; user-select: none;
      }
      .card--basic .card-number { color: rgba(99,32,36,0.13); }
      .card--advanced .card-number { color: rgba(255,255,255,0.10); }
      .card--locked .card-number { color: rgba(0,0,0,0.09); }
      @keyframes fadeSlideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const cardClass = (cat: Category) => {
    if (cat.locked) return "card card--locked";
    if (cat.nameKey === "basic.name") return "card card--basic";
    if (cat.nameKey === "advanced.name") return "card card--advanced";
    return "card";
  };

  const renderCard = (cat: Category, index: number) => (
    <div
      ref={(el) => { cardsRef.current[index] = el; }}
      className={cardClass(cat)}
    >
      <div className="card-stripe" />
      <div className="card-inner">
        <span className="card-number">{index + 1}</span>
        {cat.badgeKey && <span className="card-badge">{t(cat.badgeKey)}</span>}
        <div className="card-icon-wrap">
          <img src={cat.icon} alt={t(cat.nameKey)} />
        </div>
        <h2 className="card-title">{t(cat.nameKey)}</h2>
        <p className="card-desc">{t(cat.descKey)}</p>
        {!cat.locked && cat.progress && (
          <div className="card-progress">
            <div className="card-progress-meta">
              <span>{t("progress")}</span>
              <span>{cat.progress}</span>
            </div>
            <div className="card-track">
              <div className="card-fill" style={{ width: cat.nameKey === "basic.name" ? `${Math.round((basicCompleted/3)*100)}%` : cat.nameKey === "advanced.name" ? `${Math.round((advancedCompleted/3)*100)}%` : "0%" }} />
            </div>
          </div>
        )}
        {cat.locked && (
          <div className="card-locked-footer">
            <span>🚀</span>
            <span>{t("comingSoon")}</span>
          </div>
        )}
      </div>
      {!cat.locked && <span className="card-arrow">→</span>}
    </div>
  );

  return (
    <div className="dashboard-root">
      {showLoginToast && (
        <div
          style={{
            position: "fixed", top: 88, left: "50%", transform: "translateX(-50%)",
            zIndex: 9999, background: "linear-gradient(135deg, #3e1316 0%, #632024 60%, #7a1e22 100%)",
            border: "1px solid rgba(197,165,126,0.45)", borderRadius: 14,
            padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 8px 32px rgba(62,19,22,0.45)",
            fontFamily: "'Crimson Pro', serif", fontSize: "1rem", color: "#E3DAC9",
            whiteSpace: "nowrap", animation: "fadeSlideDown 0.35s ease",
          }}
        >
          <span style={{ color: "#c5a57e", fontWeight: 700, fontSize: "1.1rem" }}>✓</span>
          {tAuth("login.success")}
        </div>
      )}
      <div className="bg-pattern" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="content">

        {/* ── Header ── */}
        <header className="header">
          <div className="header-eyebrow">{t("headerEyebrow")}</div>
          <h1>{t("brand")} <span>{t("headerTitle")}</span></h1>
          <p>{t("headerSubtitle")}</p>
        </header>

        {/* ── Progress Tracker ── */}
        <div className="tracker">
          <div className="tracker-header">
            <div>
              <h2>{t("trackerTitle")}</h2>
              <p>{t("trackerSubtitle")}</p>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-emoji">📚</span>
              <div className="stat-value">{completedLessons}</div>
              <div className="stat-label">{t("lessonsCompleted")}</div>
            </div>
            <div className="stat-card">
              <span className="stat-emoji">⚡</span>
              <div className="stat-value">{totalXP} XP</div>
              <div className="stat-label">{t("totalXP")}</div>
            </div>
            <div className="stat-card">
              <span className="stat-emoji">🏅</span>
              <div className="stat-value">{completedLessons}</div>
              <div className="stat-label">{t("badges")}</div>
            </div>
            <div className="stat-card">
              <span className="stat-emoji">🛡️</span>
              <div className="stat-value" style={{ fontSize: "1.3rem" }}>{level}</div>
              <div className="stat-label">{t("currentLevel")}</div>
            </div>
          </div>
          <div className="progress-section">
            <div className="progress-meta">
              <span>{t("levelProgress")}</span>
              <span>{overallPct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>

        {/* ── Cards ── */}
        <p className="section-label">{t("selectPath")}</p>
        <div className="cards-grid">
          {categories.map((cat, index) =>
            cat.locked ? (
              <div key={index} className="card-wrap" style={{ pointerEvents: "none" }}>
                {renderCard(cat, index)}
              </div>
            ) : (
              <Link key={index} href={cat.href!} className="card-wrap">
                {renderCard(cat, index)}
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}