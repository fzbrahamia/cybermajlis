// ============================================================
// RANSOM RESCUE — Navigate a ransomware incident step by step
// Each playthrough picks a random scenario
// ============================================================

import { useState, useEffect } from "react";
import { CHARS } from "@/app/lib/characters";
import { GameShell, GameHeader, Intro, Result } from "@/components/GameShell";
import { useTranslations } from "next-intl";

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const GAME_XP       = 100;
const PASSING_SCORE = 4;

interface Option  { text: string; correct: boolean; tip: string; }
interface Step    { q: string; opts: Option[]; }
interface Scenario { title: string; icon: string; banner: string; steps: Step[]; }
interface Choice  extends Option { stepIdx: number; }

export default function RansomRescue({ onHome }: { onHome: (xp?: number) => void }) {
  const t = useTranslations('RansomRescue');
  
  const [phase, setPhase]       = useState<"intro"|"play"|"done">("intro");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [stepIdx, setStepIdx]   = useState(0);
  const [score, setScore]       = useState(0);
  const [choices, setChoices]   = useState<Choice[]>([]);
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);

  // Load scenarios from translations
  const getScenarios = (): Scenario[] => {
    const scenariosData = t.raw('scenarios');
    if (!scenariosData || !Array.isArray(scenariosData)) {
      console.error('Scenarios not found in translations');
      return [];
    }
    return scenariosData;
  };

  const [generating, setGenerating] = useState(false);
  const [attempts, setAttempts] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("cm-game-ransom");
    if (saved) try { setAttempts(JSON.parse(saved).attempts + 1); } catch {}
  }, []);

  const start = async () => {
    const saved = localStorage.getItem("cm-game-ransom");
    const pastAttempts = saved ? (JSON.parse(saved).attempts || 0) : 0;
    if (pastAttempts >= 1) {
      setGenerating(true);
      try {
        const res = await fetch("/api/games/generate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: "ransom", attempts: pastAttempts + 1 }),
        });
        const data = await res.json();
        if (data.content?.steps) {
          const sc = data.content;
          setScenario({ ...sc, steps: sc.steps.map((s: any) => ({ ...s, opts: shuffle([...s.opts]) })) });
          setStepIdx(0); setScore(0); setChoices([]); setLastChoice(null);
          setGenerating(false); setPhase("play");
          const cv = JSON.parse(localStorage.getItem("cm-game-ransom")||"{}");
          localStorage.setItem("cm-game-ransom", JSON.stringify({attempts:(cv.attempts||0)+1}));
          return;
        }
      } catch {}
      setGenerating(false);
    }
    const allScenarios = getScenarios();
    const picked = allScenarios[Math.floor(Math.random() * allScenarios.length)];
    const shuffledSteps = picked.steps.map(s => ({ ...s, opts: shuffle([...s.opts]) }));
    setScenario({ ...picked, steps: shuffledSteps });
    setStepIdx(0); setScore(0); setChoices([]); setLastChoice(null);
    const cv = JSON.parse(localStorage.getItem("cm-game-ransom")||"{}");
    localStorage.setItem("cm-game-ransom", JSON.stringify({attempts:(cv.attempts||0)+1}));
    setPhase("play");
  };

  const choose = (opt: Option) => {
    if (lastChoice) return;
    if (opt.correct) setScore(s => s + 1);
    const choice: Choice = { ...opt, stepIdx };
    setChoices(c => [...c, choice]);
    setLastChoice(choice);
    setTimeout(() => {
      setLastChoice(null);
      if (stepIdx + 1 >= (scenario?.steps.length ?? 0)) setPhase("done");
      else setStepIdx(s => s + 1);
    }, 2000);
  };

  if (generating) return (
    <GameShell>
      <div style={{ textAlign:"center", padding:60, display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <img src="/avatar.png" alt="Hamad" style={{ width:64, height:64, borderRadius:"50%", border:"2px solid rgba(245,158,11,0.4)" }} />
        <div style={{ fontSize:14, color:"#d97706", fontFamily:"'JetBrains Mono',monospace" }}>Hamad is writing a new incident for you…</div>
        <div style={{ fontSize:11, color:"rgba(217,119,6,0.5)" }}>New scenario based on your play history · ~15 seconds</div>
        <div style={{ display:"flex", gap:5 }}>{[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#d97706", opacity:0.3, animation:`blink 1.2s ease-in-out ${i*0.3}s infinite` }}/>)}</div>
      </div>
    </GameShell>
  );

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
        onStart={() => start()}
      />
    </GameShell>
  );

  if (phase === "done") {
    const wrongChoices = choices.filter(c => !c.correct);
    return (
      <div style={{ minHeight: "100vh", background: "#faf8f3", fontFamily: "sans-serif" }}>
        <div style={{ padding: "32px 40px", maxWidth: 780, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>{scenario?.icon}</div>
            <h2 style={{ fontFamily: "serif", fontSize: 26, color: "#2c1810", marginBottom: 4 }}>
              {score >= PASSING_SCORE ? t('result.restored') : t('result.review')}
            </h2>
            <div style={{ fontSize: 14, color: "#8a7a6e" }}>{scenario?.title}</div>
          </div>

          {/* Score summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: t('result.correctDecisions'), val: score,                   color: "#27ae60" },
              { label: t('result.wrongDecisions'),   val: wrongChoices.length,     color: "#c0392b" },
              { label: t('result.outOf'),            val: scenario?.steps.length,  color: "#632024" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #e8e0d4", borderRadius: 14, padding: "18px", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "#8a7a6e", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* XP message */}
          <div style={{
            textAlign: "center", padding: "14px 20px", borderRadius: 14, marginBottom: 24,
            background: score >= PASSING_SCORE ? "rgba(39,174,96,.06)" : "rgba(192,57,43,.05)",
            border: `1px solid ${score >= PASSING_SCORE ? "rgba(39,174,96,.2)" : "rgba(192,57,43,.2)"}`,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: score >= PASSING_SCORE ? "#27ae60" : "#c0392b" }}>
              {score >= PASSING_SCORE
                ? t('result.xpEarned')
                : t('result.xpNeeded', { passingScore: PASSING_SCORE, score: score })}
            </div>
          </div>

          {/* Wrong decisions review */}
          {wrongChoices.length > 0 && (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#c0392b", marginBottom: 12 }}>
                {t('result.reconsiderHeader')}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {wrongChoices.map((c, i) => (
                  <div key={i} style={{ background: "#fff", border: "1.5px solid rgba(192,57,43,.2)", borderRadius: 14, padding: "18px 20px" }}>
                    <div style={{ fontSize: 13, color: "#8a7a6e", marginBottom: 6 }}>
                      {t('result.stepLabel', { step: c.stepIdx + 1 })}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#c0392b", marginBottom: 10 }}>✗ {c.text}</div>
                    <div style={{ fontSize: 14, color: "#5a4a3e", lineHeight: 1.7 }}>
                      <strong style={{ color: "#632024" }}>{t('result.whyWrong')}</strong>{c.tip}
                    </div>
                    {/* Show correct answer */}
                    {scenario?.steps[c.stepIdx].opts.find(o => o.correct) && (
                      <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(39,174,96,.06)", borderRadius: 10, border: "1px solid rgba(39,174,96,.2)" }}>
                        <div style={{ fontSize: 13, color: "#27ae60", fontWeight: 600, marginBottom: 4 }}>{t('result.betterAnswer')}</div>
                        <div style={{ fontSize: 13, color: "#5a4a3e" }}>{scenario.steps[c.stepIdx].opts.find(o => o.correct)?.text}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {wrongChoices.length === 0 && (
            <div style={{ textAlign: "center", padding: 24, background: "rgba(39,174,96,.06)", borderRadius: 14, border: "1px solid rgba(39,174,96,.2)", marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#27ae60" }}>{t('result.perfect')}</div>
              <div style={{ fontSize: 13, color: "#5a4a3e", marginTop: 6 }}>{t('result.perfectSub')}</div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={start} style={{ padding: "13px 28px", background: "#632024", border: "none", borderRadius: 12, color: "#f5ede0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {t('result.tryAgain')}
            </button>
            <button onClick={() => onHome(score >= PASSING_SCORE ? GAME_XP : 0)}
              style={{ padding: "13px 28px", background: "#fff", border: "1.5px solid #e8e0d4", borderRadius: 12, color: "#5a4a3e", fontSize: 14, cursor: "pointer" }}>
              {score >= PASSING_SCORE ? t('result.collectXp') : t('result.allGames')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!scenario) return null;
  const current = scenario.steps[stepIdx];

  return (
    <GameShell>
      <GameHeader
        name={t('title')} onBack={() => onHome(0)}
        score={score} round={stepIdx + 1} maxRound={scenario.steps.length}
      />

      <div style={{ padding: "24px 40px", maxWidth: 800, margin: "0 auto" }}>

        {/* Scenario banner */}
        {stepIdx === 0 && !lastChoice && (
          <div style={{ background: "rgba(192,57,43,.06)", border: "2px solid rgba(192,57,43,.25)", borderRadius: 16, padding: "20px 24px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#c0392b", marginBottom: 6 }}>{scenario.banner}</div>
            <div style={{ fontSize: 13, color: "#8a7a6e" }}>{t('scenarioLabel')} {scenario.title}</div>
          </div>
        )}

        {/* Question card */}
        <div style={{ background: "#fff", border: "1px solid #e8e0d4", borderRadius: 16, padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
          <div style={{ fontSize: 12, color: "#632024", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
            {t('stepLabel', { current: stepIdx + 1, total: scenario.steps.length })}
          </div>
          <div style={{ fontSize: 16, color: "#2c1810", fontWeight: 600, lineHeight: 1.7 }}>{current.q}</div>
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {current.opts.map((opt, i) => {
            const isChosen  = lastChoice?.text === opt.text;
            const showResult = !!lastChoice;
            let bg = "#fff", bc = "#e8e0d4";
            if (showResult && opt.correct)             { bg = "rgba(39,174,96,.08)";  bc = "rgba(39,174,96,.4)"; }
            else if (showResult && isChosen && !opt.correct) { bg = "rgba(192,57,43,.06)"; bc = "rgba(192,57,43,.35)"; }

            return (
              <div
                key={i}
                onClick={() => !lastChoice && choose(opt)}
                style={{ padding: "18px 20px", borderRadius: 14, background: bg, border: `1.5px solid ${bc}`, cursor: lastChoice ? "default" : "pointer", transition: "all .2s", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}
                onMouseEnter={e => { if (!lastChoice) { e.currentTarget.style.borderColor = "#632024"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { if (!lastChoice) { e.currentTarget.style.borderColor = "#e8e0d4"; e.currentTarget.style.transform = "none"; } }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: "#2c1810" }}>{opt.text}</div>
                {showResult && (isChosen || opt.correct) && (
                  <div style={{ fontSize: 13, color: "#5a4a3e", marginTop: 10, lineHeight: 1.7, borderTop: "1px solid #e8e0d4", paddingTop: 10 }}>
                    <strong style={{ color: opt.correct ? "#27ae60" : "#c0392b" }}>
                      {opt.correct ? t('correctBadge') : t('incorrectBadge')}
                    </strong>
                    {opt.tip}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}