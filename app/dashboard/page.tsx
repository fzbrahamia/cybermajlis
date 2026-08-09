"use client";
import { useTrackView } from "@/hooks/useTrackView";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useTranslations, useLocale } from "next-intl";
import { seedLessonsData } from "@/app/lib/seedLessons";
import LessonLeaderboard from "@/components/LessonLeaderboard";
import { Award, Medal, Brain, BookOpen, Swords, MonitorDot, Wrench, ScanSearch, Globe, Trophy, Target, ShieldCheck, TrendingUp, ArrowRight, type LucideIcon, Users, Lock } from "lucide-react";

type Track = { nameKey: string; descKey: string; href: string; Icon: LucideIcon; progress: string; fill: number; soon?: boolean };

export default function DashboardPage() {
  useTrackView("dashboard");
  const t = useTranslations("Dashboard");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const isRtl = locale === "ar";

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

  const isLessonComplete = (p: any) => p.storyDone && p.demoDone && p.posterDone && p.quizDone;
  const completedLessons = [virusProgress, wormProgress, ransomwareProgress, polyProgress].filter(isLessonComplete).length;
  const totalLessons = 4;
  const totalXP = completedLessons * 100;
  const overallPct = Math.round((completedLessons / totalLessons) * 100);

  // Basic and advanced were difficulty tiers of one subject, so they are now a
  // single Malware track holding all four lessons plus their simulations.
  const malwareCompleted = completedLessons;

  const tracks: Track[] = [
    { nameKey: "malware.name",            descKey: "malware.description",            href: "/dashboard/malware",            Icon: ShieldCheck, progress: `${malwareCompleted}/${totalLessons}`, fill: Math.round((malwareCompleted / totalLessons) * 100) },
    { nameKey: "social-engineering.name", descKey: "social-engineering.description", href: "/dashboard/social-engineering", Icon: Users,       progress: t("social-engineering.badge"),        fill: 0, soon: true },
    { nameKey: "why-you.name",            descKey: "why-you.description",            href: "/dashboard/why-you",            Icon: TrendingUp,  progress: t("why-you.badge"),                   fill: 0, soon: true },
  ];

  // ── Badge conditions ──
  const [badgeState, setBadgeState] = useState({
    socDone: false, diyDone: false, scannerUsed: false, communityPost: false,
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const socDone = parseInt(localStorage.getItem("cm-attacks-mitigated") || "0") >= 1;
    const diyDone = Object.keys(localStorage).some(k => k.startsWith("diy-checklist-") && localStorage.getItem(k));
    const scannerUsed = !!localStorage.getItem("cm-scan-used");
    const communityPost = !!localStorage.getItem("cm-community-posted");
    setBadgeState({ socDone, diyDone, scannerUsed, communityPost });
  }, []);

  const BADGE_DEFS: { id: string; Icon: LucideIcon; earned: boolean }[] = [
    { id: "first_step", Icon: Award,      earned: completedLessons >= 1 },
    { id: "aware",      Icon: Brain,      earned: completedLessons >= 3 },
    { id: "basic",      Icon: BookOpen,   earned: malwareCompleted >= 3 },
    { id: "advanced",   Icon: Swords,     earned: malwareCompleted >= 4 },
    { id: "soc",        Icon: MonitorDot, earned: badgeState.socDone   },
    { id: "diy",        Icon: Wrench,     earned: badgeState.diyDone    },
    { id: "scanner",    Icon: ScanSearch, earned: badgeState.scannerUsed },
    { id: "community",  Icon: Globe,      earned: badgeState.communityPost },
    { id: "veteran",    Icon: Trophy,     earned: false /* set below */ },
  ];
  const earnedCount = BADGE_DEFS.filter(b => b.earned).length;
  BADGE_DEFS[BADGE_DEFS.length - 1].earned = earnedCount >= 6;
  const totalBadges = BADGE_DEFS.filter(b => b.earned).length;

  const level = totalBadges === 0 ? t("levels.beginner")
    : totalBadges <= 2 ? t("levels.aware")
    : totalBadges <= 5 ? t("levels.defender")
    : t("levels.guardian");

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
        --maroon: #632024; --maroon-deep: #3e1316; --maroon-mid: #8B2635;
        --gold: #c5a57e; --gold-light: #E8D4BC; --cream: #E3DAC9; --sand: #FDF8F0;
        --heading: #4a1a1d; --body: #6a4640; --sage: #5B7C5C; --paper: #FDFBF6;
      }
      .dash-root *, .dash-root *::before, .dash-root *::after { box-sizing: border-box; }
      body { font-family: 'Crimson Pro', Georgia, serif; background-color: var(--paper); color: var(--body); overflow-x: hidden; }
      .dash-root { min-height: 100vh; position: relative; padding: 0 2rem 6rem; overflow: hidden; }
      .dash-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background:
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,32,36,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 100% 80%, rgba(197,165,126,0.15) 0%, transparent 60%); }
      .dash-orb { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(80px); opacity: 0.18; animation: dorb 18s ease-in-out infinite alternate; }
      .dash-orb-1 { width: 420px; height: 420px; background: var(--gold); top: -120px; left: -100px; }
      .dash-orb-2 { width: 280px; height: 280px; background: var(--gold); top: 38%; right: -80px; animation-delay: -6s; }
      .dash-orb-3 { width: 200px; height: 200px; background: var(--gold); bottom: 8%; left: 28%; animation-delay: -12s; }
      @keyframes dorb { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(30px,40px) scale(1.08); } }

      .dash-content { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

      /* Centered header */
      .dash-header { text-align: center; padding: 6.5rem 0 2.4rem; }
      .dash-eyebrow { display: inline-block; font-family: 'Cinzel', serif; font-size: 0.66rem; letter-spacing: 0.35em; text-transform: uppercase; color: var(--maroon-mid); background: linear-gradient(135deg, rgba(99,32,36,0.08), rgba(197,165,126,0.18)); border: 1px solid rgba(99,32,36,0.2); padding: 0.4rem 1.3rem; border-radius: 999px; margin-bottom: 0.9rem; }
      .dash-header h1 { font-family: 'Cinzel', serif; font-size: clamp(2.1rem, 4.4vw, 3.2rem); font-weight: 900; line-height: 1.08; color: var(--heading); margin: 0 0 0.7rem; }
      .dash-header h1 span { color: var(--maroon-mid); }
      .dash-header p { font-size: 1.08rem; color: var(--body); font-style: italic; font-weight: 300; margin: 0; }

      /* Hero: ring | stats */
      .hero { display: grid; grid-template-columns: 300px 1fr; gap: 1.6rem;
        background: linear-gradient(135deg, #FBF4E8 0%, #F1E8D6 100%); border: 1px solid rgba(99,32,36,0.12);
        border-radius: 26px; padding: 2.2rem; margin-bottom: 1.6rem; position: relative; overflow: hidden;
        box-shadow: 0 18px 46px rgba(99,32,36,0.10); }
      .hero::after { content:''; position:absolute; top:-70px; ${isRtl ? "left" : "right"}:-70px; width:220px; height:220px; border-radius:50%; background:rgba(99,32,36,0.035); border:1px solid rgba(99,32,36,0.07); }
      @media (max-width: 820px){ .hero { grid-template-columns: 1fr; text-align: center; } }
      .hero-ring-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
        ${isRtl ? "border-left" : "border-right"}: 1px solid rgba(99,32,36,0.14); }
      @media (max-width: 820px){ .hero-ring-wrap { border: none; padding-bottom: 1.4rem; border-bottom: 1px solid rgba(99,32,36,0.14); } }
      .hero-ring { width: 168px; height: 168px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      .hero-ring-inner { width: 132px; height: 132px; border-radius: 50%; background: linear-gradient(160deg, #4a181b, #2c1011); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(197,165,126,0.2); }
      .hero-xp { font-family: 'Cinzel', serif; font-size: 2.3rem; font-weight: 900; color: var(--gold-light); line-height: 1; }
      .hero-xp-label { font-family: 'Cinzel', serif; font-size: 0.62rem; letter-spacing: 0.3em; color: var(--gold); margin-top: 4px; }
      .hero-level-name { font-family: 'Cinzel', serif; font-size: 1.25rem; font-weight: 700; color: var(--heading); }
      .hero-level-label { font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(106,70,64,0.7); margin-top: 2px; }
      .hero-stats { display: flex; flex-direction: column; justify-content: center; gap: 1rem; }
      .hero-stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
      @media (max-width: 480px){ .hero-stat-row { grid-template-columns: 1fr; } }
      .hero-stat { background: rgba(255,255,255,0.55); border: 1px solid rgba(99,32,36,0.1); border-radius: 16px; padding: 1.2rem 1.1rem; transition: background .2s, transform .2s; position: relative; overflow: hidden; }
      .hero-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--gold),transparent); opacity:.55; }
      .hero-stat:hover { background: rgba(255,255,255,0.85); transform: translateY(-2px); }
      .hero-stat-ic { color: var(--maroon-mid); margin-bottom: 0.5rem; }
      .hero-stat-value { font-family: 'Cinzel', serif; font-size: 1.7rem; font-weight: 700; color: var(--heading); line-height: 1; }
      .hero-stat-label { font-size: 0.72rem; color: var(--body); letter-spacing: 0.05em; text-transform: uppercase; margin-top: 0.3rem; }
      .hero-progress-meta { display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--body); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.5rem; }
      .hero-progress-track { width: 100%; height: 7px; background: rgba(99,32,36,0.1); border-radius: 999px; overflow: hidden; }
      .hero-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--gold), #e8b87a); transition: width 1s ease; box-shadow: 0 0 8px rgba(197,165,126,0.5); }

      /* Middle: lessons | leaderboard */
      .dash-mid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 1.6rem; align-items: stretch; margin-bottom: 1.6rem; }
      @media (max-width: 980px){ .dash-mid { grid-template-columns: 1fr; } }
      .panel { background: rgba(236,224,202,0.8); border: 1px solid rgba(99,32,36,0.12); border-radius: 24px; padding: 1.7rem; backdrop-filter: blur(4px); }
      .panel.panel-light { background: rgba(253,248,240,0.55); }
      .panel-head h2 { font-family: 'Cinzel', serif; font-size: 1.15rem; font-weight: 700; color: var(--heading); margin: 0; }
      .panel-head p { font-size: 0.84rem; color: var(--body); font-style: italic; margin: 0.25rem 0 1.3rem; }

      .lc { display: flex; align-items: center; gap: 14px; text-decoration: none; background: rgba(255,255,255,0.6); border: 1px solid rgba(99,32,36,0.1); border-radius: 16px; padding: 1rem 1.1rem; margin-bottom: 0.9rem; transition: transform .25s, box-shadow .25s, border-color .25s; }
      .lc:last-child { margin-bottom: 0; }
      .lc:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(99,32,36,0.14); border-color: rgba(197,165,126,0.6); }
      /* Tracks being written: visible, so people know what is coming, but inert. */
      .lc-soon { opacity: 0.58; cursor: default; }
      .lc-soon:hover { transform: none; box-shadow: none; border-color: rgba(99,32,36,0.1); }
      .lc-soon .lc-prog { font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; }
      .lc-ic { width: 50px; height: 50px; border-radius: 13px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--maroon-mid); background: rgba(99,32,36,0.07); border: 1px solid rgba(99,32,36,0.18); }
      .lc-main { flex: 1; min-width: 0; }
      .lc-name { font-family: 'Cinzel', serif; font-weight: 700; font-size: 1rem; color: var(--heading); }
      .lc-sub { font-size: 0.8rem; color: var(--body); line-height: 1.4; margin: 2px 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .lc-track { height: 5px; background: rgba(99,32,36,0.1); border-radius: 999px; overflow: hidden; }
      .lc-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--maroon-mid), var(--gold)); }
      .lc-meta { display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--maroon-mid); flex-shrink: 0; }
      .lc-prog { font-family: monospace; font-size: 0.8rem; font-weight: 700; }

      /* Bottom: achievements */
      .badge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.9rem; }

      @keyframes fadeSlideDown { from { opacity:0; transform: translateX(-50%) translateY(-16px);} to { opacity:1; transform: translateX(-50%) translateY(0);} }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [isRtl]);

  return (
    <div className="dash-root" dir={isRtl ? "rtl" : "ltr"}>
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

      <div className="dash-bg" />
      <div className="dash-orb dash-orb-1" />
      <div className="dash-orb dash-orb-2" />
      <div className="dash-orb dash-orb-3" />

      <div className="dash-content">
        {/* ── Centered header ── */}
        <header className="dash-header">
          <div className="dash-eyebrow">{t("headerEyebrow")}</div>
          <h1>{t("brand")} <span>{t("headerTitle")}</span></h1>
          <p>{t("headerSubtitle")}</p>
        </header>

        {/* ── Hero: progress overview ── */}
        <section className="hero">
          <div className="hero-ring-wrap">
            <div
              className="hero-ring"
              style={{ background: `conic-gradient(#c5a57e ${overallPct * 3.6}deg, rgba(99,32,36,0.12) ${overallPct * 3.6}deg)` }}
            >
              <div className="hero-ring-inner">
                <span className="hero-xp">{totalXP}</span>
                <span className="hero-xp-label">XP</span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="hero-level-name">{level}</div>
              <div className="hero-level-label">{t("currentLevel")}</div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="hero-stat-row">
              <div className="hero-stat">
                <BookOpen className="hero-stat-ic" size={26} />
                <div className="hero-stat-value">{completedLessons}/{totalLessons}</div>
                <div className="hero-stat-label">{t("lessonsCompleted")}</div>
              </div>
              <div className="hero-stat">
                <Medal className="hero-stat-ic" size={26} />
                <div className="hero-stat-value">{totalBadges}</div>
                <div className="hero-stat-label">{t("badges")}</div>
              </div>
              <div className="hero-stat">
                <Target className="hero-stat-ic" size={26} />
                <div className="hero-stat-value">{overallPct}%</div>
                <div className="hero-stat-label">{t("levelProgress")}</div>
              </div>
            </div>
            <div>
              <div className="hero-progress-meta">
                <span>{t("levelProgress")}</span>
                <span>{completedLessons}/{totalLessons}</span>
              </div>
              <div className="hero-progress-track">
                <div className="hero-progress-fill" style={{ width: `${overallPct}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Middle: lessons (left) | leaderboard (right) ── */}
        <div className="dash-mid">
          <section className="panel">
            <div className="panel-head">
              <h2>{isRtl ? "دروسك" : "Your Lessons"}</h2>
              <p>{isRtl ? "اختر مسارًا وواصل التعلّم" : "Pick a track and keep learning"}</p>
            </div>
            {tracks.map((tr) => {
              const body = (
                <>
                  <span className="lc-ic"><tr.Icon size={24} /></span>
                  <div className="lc-main">
                    <div className="lc-name">{t(tr.nameKey)}</div>
                    <div className="lc-sub">{t(tr.descKey)}</div>
                    {!tr.soon && <div className="lc-track"><div className="lc-fill" style={{ width: `${tr.fill}%` }} /></div>}
                  </div>
                  <div className="lc-meta">
                    <span className="lc-prog">{tr.progress}</span>
                    {tr.soon
                      ? <Lock size={15} style={{ opacity: 0.55 }} />
                      : <ArrowRight size={16} style={isRtl ? { transform: "scaleX(-1)" } : undefined} />}
                  </div>
                </>
              );
              // Tracks still being written are shown but not walkable.
              return tr.soon ? (
                <div key={tr.href} className="lc lc-soon" aria-disabled="true">{body}</div>
              ) : (
                <Link key={tr.href} href={tr.href} className="lc">{body}</Link>
              );
            })}
          </section>

          <aside>
            <LessonLeaderboard youXP={totalXP} listLimit={4} />
          </aside>
        </div>

        {/* ── Bottom: achievements ── */}
        <section className="panel panel-light">
          <div className="panel-head">
            <h2>{t("badgesSection")}</h2>
            <p>{t("badgesSectionSub")}</p>
          </div>
          <div className="badge-grid">
            {BADGE_DEFS.map((badge) => {
              const badgeT = t.raw(`badgeList.${badge.id}`) as { title: string; desc: string };
              const Icon = badge.Icon;
              return (
                <div key={badge.id} style={{
                  background: badge.earned ? "linear-gradient(135deg, #632024, #3e1316)" : "rgba(99,32,36,0.03)",
                  border: badge.earned ? "1px solid rgba(197,165,126,0.5)" : "1px solid rgba(99,32,36,0.1)",
                  borderRadius: 16, padding: "1.2rem 1.1rem", display: "flex", flexDirection: "column",
                  alignItems: "center", textAlign: "center", gap: "0.55rem",
                  opacity: badge.earned ? 1 : 0.6, position: "relative", overflow: "hidden",
                }}>
                  {badge.earned && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #c5a57e, rgba(197,165,126,0.2))" }} />
                  )}
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    background: badge.earned ? "rgba(197,165,126,0.18)" : "rgba(99,32,36,0.06)",
                    border: badge.earned ? "1px solid rgba(197,165,126,0.35)" : "1px solid rgba(99,32,36,0.12)",
                  }}>
                    <Icon size={22} color={badge.earned ? "#E8D4BC" : "#9a7a68"} />
                  </div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", color: badge.earned ? "#E8D4BC" : "#6a4640" }}>
                    {badgeT.title}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: badge.earned ? "rgba(232,212,188,0.7)" : "#6a4640", lineHeight: 1.4 }}>
                    {badge.earned ? badgeT.desc : t("badgeNotEarned")}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
