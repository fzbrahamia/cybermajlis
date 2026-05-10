// ============================================================
// CHAT SHIELD — Pick the safest response in online chats
// ============================================================

import { useState, useEffect, useRef } from "react";
import { CHARS } from "@/app/lib/characters";
import { GameShell, GameHeader, Intro, Result } from "@/components/GameShell";
import { useTranslations } from "next-intl";

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const GAME_XP       = 100;
const DEFAULT_TOTAL = 6;
const MAX_LIVES     = 4;
const TIMER         = 35;
const PASSING_SCORE = 500;

interface ChatOpt { text: string; correct: boolean; tip: string; }
interface Scenario { context: string; speaker: string; msg: string; opts: ChatOpt[]; }

export default function ChatShield({ onHome }: { onHome: (xp?: number) => void }) {
  const t = useTranslations('ChatShield');
  
  const [phase, setPhase]       = useState<"intro"|"play"|"done">("intro");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [lives, setLives]       = useState(MAX_LIVES);
  const [timer, setTimer]       = useState(TIMER);
  const [feedback, setFeedback] = useState<(ChatOpt & { timeout?: boolean }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRounds, setTotalRounds] = useState(DEFAULT_TOTAL);
  const tRef = useRef<NodeJS.Timeout | null>(null);

  // Load scenarios from translations
  const loadScenarios = (): Scenario[] => {
    try {
      const scenariosData = t.raw('scenarios');
      if (!scenariosData || !Array.isArray(scenariosData)) {
        console.error('Scenarios not found in translations');
        return [];
      }
      return scenariosData.map((scenario: any) => ({
        context: scenario.context,
        speaker: scenario.speaker,
        msg: scenario.msg,
        opts: scenario.opts.map((opt: any) => ({
          text: opt.text,
          correct: opt.correct,
          tip: opt.tip
        }))
      }));
    } catch (error) {
      console.error('Error loading scenarios:', error);
      return [];
    }
  };

  const startTimer = () => {
    let tVal = TIMER; setTimer(TIMER);
    if (tRef.current) clearInterval(tRef.current);
    tRef.current = setInterval(() => {
      tVal--; setTimer(tVal);
      if (tVal <= 0) {
        if (tRef.current) clearInterval(tRef.current);
        setFeedback({ text: "", tip: "", correct: false, timeout: true });
        setLives(l => l - 1);
      }
    }, 1000);
  };

  const start = () => {
    const allScenarios = loadScenarios();
    if (allScenarios.length === 0) {
      console.error('No scenarios loaded');
      return;
    }
    
    // Use available scenarios, up to DEFAULT_TOTAL
    const availableCount = Math.min(DEFAULT_TOTAL, allScenarios.length);
    setTotalRounds(availableCount);
    
    const picked = shuffle([...allScenarios]).slice(0, availableCount).map(s => ({ ...s, opts: shuffle([...s.opts]) }));
    setScenarios(picked);
    setIdx(0); setScore(0); setLives(MAX_LIVES); setFeedback(null);
    setIsLoading(false);
    setPhase("play"); 
    setTimeout(startTimer, 100);
  };

  const choose = (opt: ChatOpt) => {
    if (feedback) return;
    if (tRef.current) clearInterval(tRef.current);
    if (opt.correct) setScore(s => s + 100 + timer * 3);
    else setLives(l => l - 1);
    setFeedback(opt);
  };

  const next = () => {
    setFeedback(null);
    if (lives <= 0 || idx + 1 >= totalRounds) {
      setPhase("done");
    } else {
      setIdx(i => i + 1);
      startTimer();
    }
  };

  useEffect(() => {
    return () => { 
      if (tRef.current) clearInterval(tRef.current); 
    };
  }, []);

  // Initial load check
  useEffect(() => {
    if (phase === "intro") {
      const allScenarios = loadScenarios();
      if (allScenarios.length > 0) {
        setIsLoading(false);
      }
    }
  }, [phase]);

  if (phase === "intro") return (
    <GameShell>
      <Intro
        char={CHARS.horse}
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
        total={totalRounds * 205}
        char={CHARS.horse}
        title={t('result.title')}
        message={
          score >= 1000
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

  // Show loading state or empty state
  if (isLoading || scenarios.length === 0) {
    return (
      <GameShell>
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>🛡️</div>
          <div style={{ fontSize: 16, color: "#632024" }}>Loading scenarios...</div>
        </div>
      </GameShell>
    );
  }

  // Safety check for valid index
  if (!scenarios[idx]) {
    console.error(`Invalid scenario index: ${idx}, scenarios length: ${scenarios.length}`);
    return (
      <GameShell>
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 16, color: "#632024" }}>Error loading scenario. Please restart the game.</div>
          <button 
            onClick={start}
            style={{ marginTop: 20, padding: "12px 24px", background: "#632024", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Restart Game
          </button>
        </div>
      </GameShell>
    );
  }

  const sc = scenarios[idx];

  return (
    <GameShell>
      <GameHeader
        name={t('title')} onBack={() => { if (tRef.current) clearInterval(tRef.current); onHome(0); }}
        score={score} round={idx + 1} maxRound={totalRounds}
        timer={feedback ? null : timer} maxTimer={TIMER}
        lives={lives} maxLives={MAX_LIVES}
      />

      <div style={{ padding: "28px 40px", maxWidth: 760, margin: "0 auto" }}>

        {/* Context badge */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, padding: "6px 18px", borderRadius: 12, background: "rgba(99,32,36,.08)", color: "#632024", fontWeight: 700 }}>
            {sc.context}
          </span>
        </div>

        {/* Fixed-height slot — no jumping */}
        <div style={{ minHeight: 420 }}>

          {/* Chat bubble */}
          <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "20px 24px", border: "1px solid #e8e0d4", boxShadow: "0 2px 8px rgba(0,0,0,.04)", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#632024", marginBottom: 8 }}>{sc.speaker}</div>
            <div style={{ fontSize: 16, color: "#2c1810", lineHeight: 1.7 }}>{sc.msg}</div>
          </div>

          <div style={{ fontSize: 13, color: "#8a7a6e", textAlign: "center", marginBottom: 14 }}>{t('howToRespond')}</div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sc.opts && sc.opts.map((opt, i) => {
              const showResult = !!feedback;
              const isChosen   = feedback?.text === opt.text;
              let bg = "#fff", bc = "#e8e0d4";
              if (showResult && opt.correct)              { bg = "rgba(39,174,96,.07)";  bc = "rgba(39,174,96,.35)"; }
              else if (showResult && isChosen && !opt.correct) { bg = "rgba(192,57,43,.05)"; bc = "rgba(192,57,43,.3)"; }

              return (
                <div
                  key={i}
                  onClick={() => choose(opt)}
                  style={{
                    padding: "16px 20px", borderRadius: "4px 16px 16px 16px",
                    background: bg, border: `1.5px solid ${bc}`,
                    cursor: feedback ? "default" : "pointer", transition: "all .15s",
                    boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                  }}
                  onMouseEnter={e => { if (!feedback) e.currentTarget.style.borderColor = "#632024"; }}
                  onMouseLeave={e => { if (!feedback) e.currentTarget.style.borderColor = "#e8e0d4"; }}
                >
                  <div style={{ fontSize: 15, color: "#2c1810", lineHeight: 1.6 }}>{opt.text}</div>
                  {showResult && (opt.correct || isChosen) && (
                    <div style={{ fontSize: 13, color: "#5a4a3e", marginTop: 10, lineHeight: 1.6, borderTop: "1px solid #e8e0d4", paddingTop: 10 }}>
                      <strong style={{ color: opt.correct ? "#27ae60" : "#c0392b" }}>
                        {opt.correct ? t('smartBadge') : t('riskyBadge')}
                      </strong>
                      {opt.tip}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {feedback && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14,
                color: feedback.correct ? "#27ae60" : "#c0392b" }}>
                {feedback.timeout ? t('tooSlow') : feedback.correct ? t('smartResponse') : t('riskyResponse')}
              </div>
              <button
                onClick={next}
                style={{ padding: "13px 36px", background: "#632024", border: "none", borderRadius: 12, color: "#f5ede0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                {idx + 1 >= totalRounds || lives <= 0 ? t('seeResults') : t('nextChat')}
              </button>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}