"use client";

// ============================================================
// THE MAJLIS TRIALS — main-site kids CTF
// A gentle Capture-The-Flag that introduces real CTF categories.
// Sign-in required; progress saved via useCtfProgress.
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  KeyRound, Search, Eye, Code2, EyeOff,
  Flag, Lightbulb, CheckCircle2, Lock, Trophy, LogIn,
  ArrowLeft, ArrowRight, Star, Sparkles, ShieldCheck,
} from "lucide-react";
import {
  SECTIONS, ALL_CHALLENGES, TOTAL_POINTS, isFlagCorrect,
  type Challenge, type Section, type Puzzle,
} from "@/app/lib/ctfData";
import { useCtfProgress } from "@/hooks/useCtfProgress";
import { useTrackView } from "@/hooks/useTrackView";
import { trackSkillAttempt, trackSkillSolve } from "@/app/lib/analytics";

/* ── Fonts & palette (matches the main site) ── */
const cinzel  = '"Cinzel", "Trajan Pro", Georgia, serif';
const crimson = '"Crimson Pro", "Crimson Text", Georgia, serif';
const mono    = '"Geist Mono", "JetBrains Mono", Menlo, monospace';

const INK   = "#3e1316";
const WINE  = "#632024";
const RUBY  = "#8B2635";
const GOLD  = "#c5a57e";
const GOLD2 = "#E8D4BC";
const CREAM = "#E3DAC9";
const PAPER = "#f5ede0";

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  KeyRound, Search, Eye, Code2, EyeOff,
};

/* ════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════ */
export default function CtfPage() {
  const router = useRouter();
  const locale = useLocale();
  const isAR = locale === "ar";

  const { authState, solved, markSolved, totalPoints } = useCtfProgress();
  useTrackView("ctf");

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  const solvedCount = Object.keys(solved).length;

  const page: React.CSSProperties = {
    minHeight: "100vh", background: CREAM, color: INK,
    fontFamily: crimson, direction: isAR ? "rtl" : "ltr",
    paddingTop: "calc(76px + 2rem)",
  };

  /* ── Auth loading ── */
  if (authState === "loading") {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 46, height: 46, margin: "0 auto 14px", borderRadius: "50%",
            border: `3px solid ${GOLD}44`, borderTopColor: RUBY,
            animation: "ctfSpin 0.9s linear infinite",
          }} />
          <div style={{ fontFamily: cinzel, fontSize: 12, letterSpacing: 2, color: WINE }}>
            {isAR ? "جارٍ التحميل…" : "LOADING…"}
          </div>
        </div>
        <style>{`@keyframes ctfSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Signed out → gate ── */
  if (authState === "signed-out") {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(76px + 2rem) 1.5rem 3rem" }}>
        <div style={{
          maxWidth: 460, width: "100%", textAlign: "center",
          background: `linear-gradient(160deg, ${INK}, ${WINE})`,
          border: `1px solid ${GOLD}33`, borderRadius: 22, padding: "2.6rem 2rem",
          boxShadow: "0 24px 64px rgba(62,19,22,0.4)",
        }}>
          <div style={{ height: 3, width: 60, margin: "0 auto 1.4rem", background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: `${GOLD}1f`, border: `1px solid ${GOLD}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={30} color={GOLD2} strokeWidth={1.5} />
            </div>
          </div>
          <h1 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.5rem", color: GOLD2, margin: "0 0 0.6rem" }}>
            {isAR ? "تجارب المجلس" : "The Majlis Trials"}
          </h1>
          <p style={{ fontFamily: crimson, fontSize: "1.02rem", lineHeight: 1.6, color: "rgba(227,218,201,0.82)", margin: "0 0 1.6rem" }}>
            {isAR
              ? "سجّل دخولك لتبدأ التحدّيات. نحفظ الأعلام التي تلتقطها لنتابع المهارات التي تبنيها."
              : "Sign in to begin the challenges. We save the flags you capture so we can track the skills you're building."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/auth")}
              style={{
                fontFamily: cinzel, fontWeight: 700, fontSize: 13, letterSpacing: 1,
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer",
                color: PAPER, background: `linear-gradient(135deg, ${WINE}, ${RUBY})`,
                boxShadow: "0 4px 16px rgba(99,32,36,.35)",
              }}
            >
              <LogIn size={16} /> {isAR ? "تسجيل الدخول" : "Sign In"}
            </button>
            <button
              onClick={() => router.push("/auth?signup=true")}
              style={{
                fontFamily: cinzel, fontWeight: 700, fontSize: 13, letterSpacing: 0.5,
                padding: "12px 24px", borderRadius: 10, cursor: "pointer",
                color: GOLD2, background: "rgba(255,255,255,0.06)",
                border: `1.5px solid ${GOLD}44`,
              }}
            >
              {isAR ? "إنشاء حساب" : "Create account"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Signed in ── */
  const activeChallenge = activeChallengeId
    ? ALL_CHALLENGES.find((c) => c.id === activeChallengeId) ?? null
    : null;
  const activeSection = activeSectionId
    ? SECTIONS.find((s) => s.id === activeSectionId) ?? null
    : null;

  if (activeChallenge) {
    return (
      <div style={page}>
        <ChallengeView
          challenge={activeChallenge}
          isAR={isAR}
          solved={!!solved[activeChallenge.id]}
          onSolve={() => markSolved({
            challengeId: activeChallenge.id,
            sectionId: activeChallenge.sectionId,
            points: activeChallenge.points,
            mode: "main",
          })}
          onBack={() => setActiveChallengeId(null)}
        />
      </div>
    );
  }

  if (activeSection) {
    return (
      <div style={page}>
        <SectionView
          section={activeSection}
          isAR={isAR}
          solved={solved}
          onOpenChallenge={(id) => setActiveChallengeId(id)}
          onBack={() => setActiveSectionId(null)}
        />
      </div>
    );
  }

  return (
    <div style={page}>
      <Hub
        isAR={isAR}
        solved={solved}
        solvedCount={solvedCount}
        totalPoints={totalPoints}
        onOpenSection={(id) => setActiveSectionId(id)}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   HUB — section overview
   ════════════════════════════════════════════════════════════ */
function Hub({
  isAR, solved, solvedCount, totalPoints, onOpenSection,
}: {
  isAR: boolean;
  solved: Record<string, unknown>;
  solvedCount: number;
  totalPoints: number;
  onOpenSection: (id: string) => void;
}) {
  const pct = Math.round((solvedCount / ALL_CHALLENGES.length) * 100);
  const allDone = solvedCount === ALL_CHALLENGES.length;

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "1rem 1.5rem 5rem" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "2.2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 99, background: "rgba(197,165,126,.18)", border: `1px solid ${GOLD}66`, fontFamily: cinzel, fontWeight: 600, fontSize: 9.5, letterSpacing: 2.5, color: WINE, marginBottom: 16 }}>
          <Flag size={11} /> {isAR ? "التقط الأعلام" : "CAPTURE THE FLAG"}
        </div>
        <h1 style={{ fontFamily: cinzel, fontWeight: 900, fontSize: "clamp(2.1rem, 5vw, 3.2rem)", lineHeight: 1.05, margin: "0 0 10px" }}>
          <span style={{ color: INK }}>{isAR ? "تجارب " : "The Majlis "}</span>
          <span style={{ color: RUBY }}>{isAR ? "المجلس" : "Trials"}</span>
        </h1>
        <p style={{ fontFamily: crimson, fontStyle: "italic", fontSize: "1.12rem", color: "#5a2428", maxWidth: 640, margin: "0 auto", lineHeight: 1.55 }}>
          {isAR
            ? "خمسة مسارات، كل منها يعرّفك بقسم حقيقي من عالم الأمن السيبراني. حُل كل لغز لتلتقط علَماً على شكل majlis{...}."
            : "Five tracks, each introducing a real section of the cybersecurity world. Solve each puzzle to capture a flag shaped like majlis{...}."}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        background: `linear-gradient(160deg, ${INK}, ${WINE})`, borderRadius: 18,
        border: `1px solid ${GOLD}33`, padding: "1.3rem 1.5rem", marginBottom: "2.2rem",
        boxShadow: "0 10px 30px rgba(62,19,22,0.18)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy size={20} color={GOLD2} strokeWidth={1.5} />
            <span style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 14, color: GOLD2, letterSpacing: 0.5 }}>
              {isAR ? `${solvedCount} من ${ALL_CHALLENGES.length} علَم` : `${solvedCount} of ${ALL_CHALLENGES.length} flags`}
            </span>
          </div>
          <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: GOLD }}>
            {totalPoints} / {TOTAL_POINTS} {isAR ? "نقطة" : "pts"}
          </span>
        </div>
        <div style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, transition: "width .5s ease" }} />
        </div>
        {allDone && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: GOLD2, fontFamily: cinzel, fontWeight: 700, fontSize: 13 }}>
            <Sparkles size={16} /> {isAR ? "أتممت كل التجارب — أنت بطل المجلس!" : "All trials complete — you are a Majlis champion!"}
          </div>
        )}
      </div>

      {/* Section grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.2rem" }}>
        {SECTIONS.map((section) => {
          const Icon = ICONS[section.icon] ?? Flag;
          const total = section.challenges.length;
          const done = section.challenges.filter((c) => solved[c.id]).length;
          const complete = done === total;
          return (
            <button
              key={section.id}
              onClick={() => onOpenSection(section.id)}
              style={{
                textAlign: isAR ? "right" : "left", cursor: "pointer", width: "100%",
                background: PAPER, borderRadius: 18, padding: "1.5rem",
                border: `1.5px solid ${complete ? section.accent + "aa" : "rgba(197,165,126,.4)"}`,
                boxShadow: complete ? `0 0 0 2px ${section.accent}33, 0 8px 24px rgba(99,32,36,.1)` : "0 2px 12px rgba(99,32,36,.06)",
                transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
                display: "flex", flexDirection: "column", gap: 10,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 14px 36px rgba(99,32,36,.16)`; e.currentTarget.style.borderColor = section.accent + "aa"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = complete ? `0 0 0 2px ${section.accent}33, 0 8px 24px rgba(99,32,36,.1)` : "0 2px 12px rgba(99,32,36,.06)"; e.currentTarget.style.borderColor = complete ? section.accent + "aa" : "rgba(197,165,126,.4)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: `${section.accent}1a`, border: `1px solid ${section.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={26} color={section.accent} strokeWidth={1.6} />
                </div>
                {complete
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: cinzel, fontSize: 10, fontWeight: 700, color: section.accent, background: `${section.accent}1a`, border: `1px solid ${section.accent}44`, borderRadius: 8, padding: "4px 9px" }}><CheckCircle2 size={12} /> {isAR ? "مكتمل" : "DONE"}</span>
                  : <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: WINE, background: "rgba(99,32,36,.07)", borderRadius: 8, padding: "4px 9px" }}>{done}/{total}</span>}
              </div>
              <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 17, color: INK }}>
                {isAR ? section.titleAr : section.title}
              </div>
              <div style={{ fontFamily: crimson, fontSize: 13.5, color: "#5a2428", fontStyle: "italic", lineHeight: 1.5 }}>
                {isAR ? section.taglineAr : section.tagline}
              </div>
              <div style={{ height: 1, background: `linear-gradient(90deg, ${section.accent}66, transparent)`, margin: "2px 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: cinzel, fontSize: 10, letterSpacing: 1, fontWeight: 700, color: section.accent }}>
                <ShieldCheck size={13} /> {(isAR ? section.realNameAr : section.realName).toUpperCase()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SECTION VIEW — challenge list
   ════════════════════════════════════════════════════════════ */
function SectionView({
  section, isAR, solved, onOpenChallenge, onBack,
}: {
  section: Section;
  isAR: boolean;
  solved: Record<string, unknown>;
  onOpenChallenge: (id: string) => void;
  onBack: () => void;
}) {
  const Icon = ICONS[section.icon] ?? Flag;
  const Arrow = isAR ? ArrowRight : ArrowLeft;
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "1rem 1.5rem 5rem" }}>
      <BackBtn onClick={onBack} label={isAR ? "كل المسارات" : "All tracks"} Arrow={Arrow} />

      {/* Section header */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 14 }}>
        <div style={{ width: 58, height: 58, borderRadius: 14, background: `${section.accent}1a`, border: `1px solid ${section.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={30} color={section.accent} strokeWidth={1.6} />
        </div>
        <div>
          <h1 style={{ fontFamily: cinzel, fontWeight: 800, fontSize: "1.7rem", color: INK, margin: 0 }}>
            {isAR ? section.titleAr : section.title}
          </h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4, fontFamily: cinzel, fontSize: 10, letterSpacing: 1, fontWeight: 700, color: section.accent, background: `${section.accent}14`, border: `1px solid ${section.accent}3a`, borderRadius: 8, padding: "3px 9px" }}>
            <ShieldCheck size={12} /> {isAR ? `في الواقع: ${section.realNameAr}` : `Real CTF category: ${section.realName}`}
          </div>
        </div>
      </div>

      <p style={{ fontFamily: crimson, fontSize: "1.05rem", lineHeight: 1.65, color: "#4a2024", background: PAPER, border: `1px solid ${GOLD}55`, borderRadius: 14, padding: "1.1rem 1.3rem", marginBottom: "1.6rem" }}>
        {isAR ? section.introAr : section.intro}
      </p>

      {/* Challenges */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {section.challenges.map((c, i) => {
          const done = !!solved[c.id];
          return (
            <button
              key={c.id}
              onClick={() => onOpenChallenge(c.id)}
              style={{
                textAlign: isAR ? "right" : "left", cursor: "pointer", width: "100%",
                display: "flex", alignItems: "center", gap: 14,
                background: done ? "rgba(74,124,89,0.08)" : PAPER,
                border: `1.5px solid ${done ? "#4a7c5966" : "rgba(197,165,126,.45)"}`,
                borderRadius: 14, padding: "1rem 1.2rem",
                transition: "transform .15s ease, border-color .15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = isAR ? "translateX(-4px)" : "translateX(4px)"; e.currentTarget.style.borderColor = section.accent + "aa"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = done ? "#4a7c5966" : "rgba(197,165,126,.45)"; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#4a7c5920" : `${section.accent}14`, border: `1px solid ${done ? "#4a7c5955" : section.accent + "3a"}` }}>
                {done ? <CheckCircle2 size={20} color="#4a7c59" /> : <Flag size={18} color={section.accent} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 15, color: INK }}>
                  {i + 1}. {isAR ? c.titleAr : c.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <Stars n={c.difficulty} />
                  <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: WINE }}>{c.points} {isAR ? "نقطة" : "pts"}</span>
                  {done && <span style={{ fontFamily: cinzel, fontSize: 10, fontWeight: 700, color: "#4a7c59", letterSpacing: 1 }}>{isAR ? "· مُلتقَط" : "· CAPTURED"}</span>}
                </div>
              </div>
              <span style={{ color: GOLD, transform: isAR ? "rotate(180deg)" : "none" }}><ArrowRight size={18} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CHALLENGE VIEW — puzzle + flag input
   ════════════════════════════════════════════════════════════ */
function ChallengeView({
  challenge, isAR, solved, onSolve, onBack,
}: {
  challenge: Challenge;
  isAR: boolean;
  solved: boolean;
  onSolve: () => void;
  onBack: () => void;
}) {
  const section = SECTIONS.find((s) => s.id === challenge.sectionId)!;
  const accent = section.accent;
  const Arrow = isAR ? ArrowRight : ArrowLeft;

  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong">("idle");
  const [justSolved, setJustSolved] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  const isDone = solved || justSolved;
  const hints = isAR ? challenge.hintsAr : challenge.hints;

  const submit = () => {
    if (!guess.trim()) return;
    const correct = isFlagCorrect(guess, challenge.flag);
    trackSkillAttempt(challenge.sectionId, challenge.id, correct, "main");
    if (correct) {
      setStatus("idle");
      setJustSolved(true);
      if (!solved) {
        trackSkillSolve(challenge.sectionId, challenge.id, challenge.points, "main");
        onSolve();
      }
    } else {
      setStatus("wrong");
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "1rem 1.5rem 5rem" }}>
      <BackBtn onClick={onBack} label={isAR ? section.titleAr : section.title} Arrow={Arrow} />

      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: cinzel, fontWeight: 800, fontSize: "1.6rem", color: INK, margin: 0 }}>
          {isAR ? challenge.titleAr : challenge.title}
        </h1>
        {isDone && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: cinzel, fontSize: 11, fontWeight: 700, color: "#4a7c59", background: "#4a7c5915", border: "1px solid #4a7c5944", borderRadius: 8, padding: "4px 10px" }}>
            <CheckCircle2 size={13} /> {isAR ? "مُلتقَط" : "CAPTURED"}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Stars n={challenge.difficulty} />
        <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: WINE }}>{challenge.points} {isAR ? "نقطة" : "pts"}</span>
      </div>

      {/* Story */}
      <p style={{ fontFamily: crimson, fontSize: "1.08rem", lineHeight: 1.7, color: "#4a2024", marginBottom: "1.3rem" }}>
        {isAR ? challenge.storyAr : challenge.story}
      </p>

      {/* Puzzle */}
      <PuzzleView puzzle={challenge.puzzle} isAR={isAR} accent={accent} />

      {/* Reference / cheat-sheet */}
      {challenge.reference && (
        <div style={{ marginTop: 14, background: "rgba(197,165,126,.12)", border: `1px dashed ${GOLD}88`, borderRadius: 12, padding: "0.9rem 1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: cinzel, fontWeight: 700, fontSize: 10, letterSpacing: 1.5, color: WINE, marginBottom: 6 }}>
            <Lightbulb size={13} /> {isAR ? "ورقة المساعدة" : "CHEAT SHEET"}
          </div>
          <div style={{ fontFamily: mono, fontSize: 13, color: "#4a2024", lineHeight: 1.7, direction: "ltr", textAlign: isAR ? "right" : "left" }}>
            {isAR ? challenge.referenceAr : challenge.reference}
          </div>
        </div>
      )}

      {/* Hints */}
      <div style={{ marginTop: 16 }}>
        {hintsShown < hints.length && !isDone && (
          <button
            onClick={() => setHintsShown((n) => n + 1)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: cinzel, fontWeight: 700, fontSize: 12, color: WINE, background: "transparent", border: `1.5px solid ${GOLD}88`, borderRadius: 10, padding: "8px 16px", cursor: "pointer" }}
          >
            <Lightbulb size={14} /> {hintsShown === 0 ? (isAR ? "أحتاج تلميحاً" : "Need a hint?") : (isAR ? "تلميح آخر" : "Another hint")}
          </button>
        )}
        {hints.slice(0, hintsShown).map((h, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, fontFamily: crimson, fontSize: "1rem", color: "#5a2428", background: PAPER, border: `1px solid ${GOLD}44`, borderRadius: 10, padding: "0.7rem 0.95rem" }}>
            <Lightbulb size={15} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} /> {h}
          </div>
        ))}
      </div>

      {/* Flag box */}
      {isDone ? (
        <div style={{ marginTop: 22, background: "rgba(74,124,89,0.08)", border: "1.5px solid #4a7c5966", borderRadius: 16, padding: "1.3rem 1.4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: cinzel, fontWeight: 800, fontSize: "1.05rem", color: "#3f6b4d", marginBottom: 10 }}>
            <CheckCircle2 size={20} /> {isAR ? "علَم مُلتقَط!" : "Flag captured!"}
          </div>
          <div style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: INK, background: "#fff", border: "1px solid #4a7c5944", borderRadius: 8, padding: "8px 12px", marginBottom: 12, direction: "ltr", textAlign: "center", letterSpacing: 0.5 }}>
            majlis&#123;{challenge.flag}&#125;
          </div>
          <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 10, letterSpacing: 1.5, color: "#3f6b4d", marginBottom: 6 }}>
            {isAR ? "ماذا تعلّمت" : "WHAT YOU LEARNED"}
          </div>
          <p style={{ fontFamily: crimson, fontSize: "1.04rem", lineHeight: 1.65, color: "#3a4a3f", margin: 0 }}>
            {isAR ? challenge.explainAr : challenge.explain}
          </p>
          <button
            onClick={onBack}
            style={{ marginTop: 16, fontFamily: cinzel, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, padding: "11px 22px", borderRadius: 10, border: "none", cursor: "pointer", color: PAPER, background: `linear-gradient(135deg, ${WINE}, ${RUBY})` }}
          >
            {isAR ? "متابعة ←" : "Continue →"}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 22 }}>
          <label style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, color: WINE, display: "block", marginBottom: 8 }}>
            {isAR ? "أدخل العلَم" : "SUBMIT THE FLAG"}
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={guess}
              onChange={(e) => { setGuess(e.target.value); if (status === "wrong") setStatus("idle"); }}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="majlis{...}"
              dir="ltr"
              style={{
                flex: "1 1 240px", fontFamily: mono, fontSize: 15, color: INK,
                padding: "12px 14px", borderRadius: 10, background: "#fff",
                border: `1.5px solid ${status === "wrong" ? "#c0392b" : GOLD}`,
                outline: "none",
              }}
            />
            <button
              onClick={submit}
              style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: "12px 26px", borderRadius: 10, border: "none", cursor: "pointer", color: PAPER, background: `linear-gradient(135deg, ${WINE}, ${RUBY})`, boxShadow: "0 4px 14px rgba(99,32,36,.3)" }}
            >
              {isAR ? "تحقّق" : "Submit"}
            </button>
          </div>
          {status === "wrong" && (
            <div style={{ marginTop: 10, fontFamily: crimson, fontSize: "1rem", color: "#c0392b", display: "flex", alignItems: "center", gap: 6 }}>
              {isAR ? "ليس بعد — تفحّص اللغز مرة أخرى وحاول ثانية." : "Not yet — look at the puzzle again and try once more."}
            </div>
          )}
          <div style={{ marginTop: 10, fontFamily: crimson, fontStyle: "italic", fontSize: "0.92rem", color: "#8a6a4a" }}>
            {isAR ? "نصيحة: لا يهم إن كتبت العلَم بأحرف كبيرة أو صغيرة أو بدون majlis{}." : "Tip: capital letters, lower-case, and leaving off the majlis{} wrapper all work."}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PUZZLE RENDERER
   ════════════════════════════════════════════════════════════ */
function PuzzleView({ puzzle, isAR, accent }: { puzzle: Puzzle; isAR: boolean; accent: string }) {
  // Terminal-ish frame used by most puzzle kinds
  const frame = (children: React.ReactNode, label?: string) => (
    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${INK}`, boxShadow: "0 8px 24px rgba(62,19,22,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: INK }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#e06c5e" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#e3b341" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7bc47f" }} />
        {label && <span style={{ marginInlineStart: 8, fontFamily: mono, fontSize: 11, color: GOLD }}>{label}</span>}
      </div>
      <div style={{ background: "#1d0708", padding: "1.2rem 1.3rem" }}>{children}</div>
    </div>
  );

  if (puzzle.kind === "mono") {
    return frame(
      <pre style={{ margin: 0, fontFamily: mono, fontSize: "1.35rem", lineHeight: 1.7, color: GOLD2, whiteSpace: "pre-wrap", letterSpacing: 1, direction: "ltr", textAlign: "left" }}>
        {puzzle.text}
      </pre>,
    );
  }

  if (puzzle.kind === "code") {
    return frame(
      <pre style={{ margin: 0, fontFamily: mono, fontSize: "0.92rem", lineHeight: 1.7, color: "#d6e3c9", whiteSpace: "pre-wrap", direction: "ltr", textAlign: "left", overflowX: "auto" }}>
        {puzzle.text}
      </pre>,
      puzzle.label,
    );
  }

  if (puzzle.kind === "table") {
    return (
      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${GOLD}88` }}>
        <div style={{ padding: "8px 14px", background: INK, fontFamily: cinzel, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, color: GOLD2, display: "flex", alignItems: "center", gap: 7 }}>
          <Search size={13} /> {isAR ? "تفاصيل الملف (البيانات الوصفية)" : "File details (metadata)"}
        </div>
        <div style={{ background: PAPER }}>
          {puzzle.rows.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderTop: i ? `1px solid ${GOLD}33` : "none" }}>
              <span style={{ fontFamily: cinzel, fontSize: 12.5, fontWeight: 600, color: WINE }}>{isAR ? r.kAr : r.k}</span>
              <span style={{ fontFamily: mono, fontSize: 13, color: INK, direction: "ltr", textAlign: isAR ? "left" : "right" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (puzzle.kind === "log") {
    return (
      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${GOLD}88` }}>
        <div style={{ padding: "8px 14px", background: INK, fontFamily: mono, fontSize: 11, color: GOLD, letterSpacing: 1 }}>
          ~/login_history.log
        </div>
        <div style={{ background: "#1d0708" }}>
          {puzzle.logs.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "62px 1fr auto", gap: 10, alignItems: "center", padding: "9px 14px", borderTop: i ? "1px solid rgba(197,165,126,0.12)" : "none", fontFamily: mono, fontSize: 12.5, color: "#d6c8b4", direction: "ltr" }}>
              <span style={{ color: GOLD }}>{r.time}</span>
              <span style={{ color: "#cdbfa9" }}>{isAR ? r.locationAr : r.location}</span>
              <span style={{ color: GOLD2 }}>{r.code}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (puzzle.kind === "posts") {
    return (
      <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${GOLD}88`, background: PAPER }}>
        {/* profile header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "1rem 1.2rem", background: `linear-gradient(135deg, ${accent}22, ${accent}0a)`, borderBottom: `1px solid ${GOLD}44` }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: cinzel, fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
            {(isAR ? puzzle.nameAr : puzzle.name).charAt(0)}
          </div>
          <div>
            <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 15, color: INK }}>{isAR ? puzzle.nameAr : puzzle.name}</div>
            <div style={{ fontFamily: mono, fontSize: 12, color: accent, direction: "ltr" }}>{puzzle.handle}</div>
            <div style={{ fontFamily: crimson, fontSize: 13, color: "#5a2428", marginTop: 2 }}>{isAR ? puzzle.bioAr : puzzle.bio}</div>
          </div>
        </div>
        {/* posts */}
        <div style={{ padding: "0.4rem 0" }}>
          {puzzle.posts.map((p, i) => (
            <div key={i} style={{ padding: "0.85rem 1.2rem", borderTop: i ? `1px solid ${GOLD}33` : "none", fontFamily: crimson, fontSize: "1.02rem", lineHeight: 1.55, color: "#3a1316" }}>
              <span style={{ color: accent, marginInlineEnd: 6 }}>▸</span>{isAR ? p.textAr : p.text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // hidden — invisible-ink (white text on white note, reveal on hover/select)
  return <HiddenNote puzzle={puzzle} isAR={isAR} />;
}

function HiddenNote({ puzzle, isAR }: { puzzle: Extract<Puzzle, { kind: "hidden" }>; isAR: boolean }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      style={{
        background: "#fbf7ef", border: `1px solid ${GOLD}88`, borderRadius: 14,
        padding: "1.4rem 1.5rem", fontFamily: crimson, fontSize: "1.06rem", lineHeight: 1.8, color: "#3a1316",
        cursor: "text", userSelect: "text",
      }}
    >
      {isAR ? puzzle.beforeAr : puzzle.before}
      <span style={{
        fontFamily: mono, fontWeight: 700, letterSpacing: 0.5, direction: "ltr", display: "inline-block",
        background: revealed ? "#3a1316" : "#fbf7ef",
        color: revealed ? GOLD2 : "#fbf7ef",
        padding: revealed ? "1px 6px" : 0, borderRadius: 4, transition: "background .2s ease, color .2s ease",
      }}>
        {puzzle.secret}
      </span>
      {isAR ? puzzle.afterAr : puzzle.after}
    </div>
  );
}

/* ── Small shared bits ── */
function BackBtn({ onClick, label, Arrow }: { onClick: () => void; label: string; Arrow: React.ComponentType<{ size?: number }> }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: cinzel, fontWeight: 700, fontSize: 12, letterSpacing: 0.5, color: WINE, background: "transparent", border: "none", cursor: "pointer", padding: "6px 0", marginBottom: 14 }}
    >
      <Arrow size={16} /> {label}
    </button>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3].map((s) => (
        <Star key={s} size={13} fill={s <= n ? GOLD : "none"} color={s <= n ? GOLD : "#c9b99e"} strokeWidth={1.5} />
      ))}
    </span>
  );
}
