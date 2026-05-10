// ============================================================
// HACK LAB — Think like an attacker to learn defense
// ============================================================

import { useState, useEffect, useRef } from "react";
import { CHARS } from "@/app/lib/characters";
import { GameShell, GameHeader, Intro, Result } from "@/components/GameShell";
import { useTranslations } from "next-intl";

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const GAME_XP       = 100;
const TOTAL         = 5;
const MAX_LIVES     = 4;
const TIMER         = 35;
const PASSING_SCORE = 400;

interface MissionOption {
  text: string;
  correct: boolean;
  lesson: string;
}

interface Mission {
  target: string;
  icon: string;
  defense: string;
  opts: MissionOption[];
}

interface Feedback {
  text: string;
  correct: boolean;
  lesson: string;
  timeout?: boolean;
}

export default function HackLab({ onHome }: { onHome: (xp?: number) => void }) {
  const t = useTranslations('HackLab');
  
  const [phase, setPhase]       = useState<"intro"|"play"|"done">("intro");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [lives, setLives]       = useState(MAX_LIVES);
  const [timer, setTimer]       = useState(TIMER);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const tRef = useRef<NodeJS.Timeout | null>(null);

  // Load missions from translations
  const getMissions = (): Mission[] => {
    const missionsData = t.raw('missions');
    if (!missionsData || !Array.isArray(missionsData)) {
      console.error('Missions not found in translations');
      return [];
    }
    return missionsData;
  };

  const startTimer = () => {
    let tVal = TIMER; setTimer(TIMER);
    if (tRef.current) clearInterval(tRef.current);
    tRef.current = setInterval(() => {
      tVal--; setTimer(tVal);
      if (tVal <= 0) {
        if (tRef.current) clearInterval(tRef.current);
        setFeedback({ text: "", correct: false, timeout: true, lesson: t('timeoutLesson') });
        setLives(l => l - 1);
      }
    }, 1000);
  };

  const start = () => {
    const allMissions = getMissions();
    const picked = shuffle([...allMissions]).slice(0, TOTAL).map(m => ({
      ...m,
      opts: shuffle([...m.opts]),
    }));
    setMissions(picked);
    setIdx(0); setScore(0); setLives(MAX_LIVES); setFeedback(null);
    setPhase("play"); setTimeout(startTimer, 100);
  };

  const choose = (opt: MissionOption) => {
    if (feedback) return;
    if (tRef.current) clearInterval(tRef.current);
    if (opt.correct) setScore(s => s + 100 + timer * 3);
    else setLives(l => l - 1);
    setFeedback(opt);
  };

  const next = () => {
    setFeedback(null);
    if (lives <= 0 || idx + 1 >= TOTAL) setPhase("done");
    else { setIdx(i => i + 1); startTimer(); }
  };

  useEffect(() => () => { if (tRef.current) clearInterval(tRef.current); }, []);

  if (phase === "intro") return (
    <GameShell>
      <Intro
        char={CHARS.falcon}
        title={t('title')}
        lines={[
          t('intro.line1'),
          t('intro.line2'),
          t('intro.line3'),
        ]}
        onStart={start}
      />
    </GameShell>
  );

  if (phase === "done") return (
    <GameShell>
      <Result
        score={score}
        total={TOTAL * 205}
        char={CHARS.falcon}
        title={t('result.title')}
        message={
          score >= 800
            ? t('result.perfect')
            : score >= PASSING_SCORE
            ? t('result.passed')
            : t('result.failed', { passingScore: PASSING_SCORE })
        }
        onRestart={start}
        onHome={() => onHome(score >= PASSING_SCORE ? GAME_XP : 0)}
      />
    </GameShell>
  );

  const mission = missions[idx];
  
  if (!mission) return null;

  return (
    <GameShell>
      <GameHeader
        name={t('title')} onBack={() => { if (tRef.current) clearInterval(tRef.current); onHome(0); }}
        score={score} round={idx + 1} maxRound={TOTAL}
        timer={feedback ? null : timer} maxTimer={TIMER}
        lives={lives} maxLives={MAX_LIVES}
      />

      <div style={{ padding: "24px 40px", maxWidth: 800, margin: "0 auto" }}>

        {/* Mission briefing */}
        <div style={{ background: "rgba(192,57,43,.04)", border: "1.5px solid rgba(192,57,43,.15)", borderRadius: 16, padding: 24, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#c0392b", fontWeight: 800, letterSpacing: 3, marginBottom: 10 }}>🔓 {t('missionBriefing')}</div>
          <div style={{ fontSize: 48, marginBottom: 10 }}>{mission.icon}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2c1810", marginBottom: 6 }}>{t('targetLabel')} {mission.target}</div>
          <div style={{ fontSize: 14, color: "#c0392b", fontWeight: 600 }}>{t('weaknessLabel')} {mission.defense}</div>
        </div>

        <div style={{ fontSize: 13, color: "#8a7a6e", textAlign: "center", marginBottom: 16 }}>
          {t('questionLabel')}
        </div>

        {/* Fixed-height slot — no jumping */}
        <div style={{ minHeight: 320 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mission.opts.map((opt, i) => {
              const showResult = !!feedback;
              let bg = "#fff", bc = "#e8e0d4";
              if (showResult && opt.correct)                              { bg = "rgba(39,174,96,.06)";  bc = "rgba(39,174,96,.35)"; }
              else if (showResult && feedback?.text === opt.text && !opt.correct) { bg = "rgba(192,57,43,.05)"; bc = "rgba(192,57,43,.25)"; }

              return (
                <div
                  key={i}
                  onClick={() => choose(opt)}
                  style={{
                    padding: "18px 20px", borderRadius: 14, background: bg,
                    border: `1.5px solid ${bc}`, cursor: feedback ? "default" : "pointer",
                    transition: "all .15s", boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                  }}
                  onMouseEnter={e => { if (!feedback) { e.currentTarget.style.borderColor = "#632024"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { if (!feedback) { e.currentTarget.style.borderColor = "#e8e0d4"; e.currentTarget.style.transform = "none"; } }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#2c1810" }}>{opt.text}</div>
                  {showResult && (opt.correct || feedback?.text === opt.text) && (
                    <div style={{ fontSize: 13, color: "#5a4a3e", marginTop: 12, lineHeight: 1.7, borderTop: "1px solid #e8e0d4", paddingTop: 10 }}>
                      <strong style={{ color: "#632024" }}>{t('defenseLesson')}</strong>{opt.lesson}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {feedback && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14,
                color: feedback.correct ? "#27ae60" : "#c0392b" }}>
                {feedback.timeout ? t('missionExpired') : feedback.correct ? t('perfectAttack') : t('wrongApproach')}
              </div>
              <button
                onClick={next}
                style={{ padding: "13px 36px", background: "#632024", border: "none", borderRadius: 12, color: "#f5ede0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                {idx + 1 >= TOTAL || lives <= 0 ? t('seeResults') : t('nextMission')}
              </button>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}