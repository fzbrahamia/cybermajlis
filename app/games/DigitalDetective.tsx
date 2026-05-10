// ============================================================
// DIGITAL DETECTIVE — Forensic investigation game
// ============================================================

import { useState } from "react";
import { CHARS } from "@/app/lib/characters";
import { GameShell, GameHeader, Intro, Result } from "@/components/GameShell";
import { useTranslations } from "next-intl";

const GAME_XP = 100;
const PASSING_SCORE = 400; // at least 2 cases solved correctly

interface Clue {
  icon: string;
  type: string;
  text: string;
}

interface CaseOption {
  text: string;
  correct: boolean;
}

interface Case {
  title: string;
  intro: string;
  clues: Clue[];
  question: string;
  options: CaseOption[];
  lesson: string;
}

export default function DigitalDetective({ onHome }: { onHome: (xp?: number) => void }) {
  const t = useTranslations('DigitalDetective');
  
  const [phase, setPhase]     = useState<"intro"|"play"|"done">("intro");
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [score, setScore]     = useState(0);
  const [lives, setLives]     = useState(3);
  const [caseIdx, setCaseIdx] = useState(0);
  const [guess, setGuess]     = useState<CaseOption | null>(null);

  // Load cases from translations
  const getCases = (): Case[] => {
    const casesData = t.raw('cases');
    if (!casesData || !Array.isArray(casesData)) {
      console.error('Cases not found in translations');
      return [];
    }
    return casesData;
  };

  const loadCase = (idx: number) => {
    const allCases = getCases();
    const c = allCases[idx % allCases.length];
    const shuffledOptions = [...c.options].sort(() => Math.random() - 0.5);
    setCaseData({ ...c, options: shuffledOptions });
    setRevealed([]); setGuess(null); setPhase("play");
  };

  const start = () => { setCaseIdx(0); setScore(0); setLives(3); loadCase(0); };

  const revealClue = (i: number) => {
    if (!revealed.includes(i)) setRevealed(r => [...r, i]);
  };

  const submitGuess = (opt: CaseOption) => {
    setGuess(opt);
    if (opt.correct) setScore(s => s + 200);
    else setLives(l => l - 1);
  };

  const nextCase = () => {
    const allCases = getCases();
    const ni = caseIdx + 1;
    if (ni >= allCases.length || lives <= 0) setPhase("done");
    else { setCaseIdx(ni); loadCase(ni); }
  };

  if (phase === "intro") return (
    <GameShell>
      <Intro
        char={CHARS.fox}
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

  if (phase === "done") {
    const allCases = getCases();
    return (
      <GameShell>
        <Result
          score={score}
          total={allCases.length * 200}
          char={CHARS.fox}
          title={t('result.title')}
          message={
            score >= allCases.length * 200
              ? t('result.perfect')
              : score >= PASSING_SCORE
              ? t('result.passed')
              : t('result.failed')
          }
          onRestart={start}
          onHome={() => onHome(score >= PASSING_SCORE ? GAME_XP : 0)}
        />
      </GameShell>
    );
  }

  if (!caseData) return null;

  const allCases = getCases();

  return (
    <GameShell>
      <GameHeader
        name={t('title')} onBack={() => onHome(0)}
        score={score} round={caseIdx + 1} maxRound={allCases.length}
        lives={lives} maxLives={3}
      />

      <div style={{ padding: "24px 40px", maxWidth: 900, margin: "0 auto" }}>

        {/* Case header */}
        <div style={{ background: "rgba(192,57,43,.04)", border: "1px solid rgba(192,57,43,.15)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#c0392b", fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>{t('caseLabel', { num: caseIdx + 1 })}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#2c1810", marginBottom: 6 }}>{caseData.title}</div>
          <div style={{ fontSize: 14, color: "#5a4a3e", lineHeight: 1.6 }}>{caseData.intro}</div>
        </div>

        {/* Fixed-height area — no jumping */}
        <div style={{ minHeight: 420 }}>
          {!guess ? (
            <>
              {/* Clue grid */}
              <div style={{ fontSize: 13, color: "#8a7a6e", textAlign: "center", marginBottom: 14 }}>
                {t('clueCounter', { revealed: revealed.length, total: caseData.clues.length })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {caseData.clues.map((clue, i) => {
                  const isRevealed = revealed.includes(i);
                  return (
                    <div
                      key={i}
                      onClick={() => revealClue(i)}
                      style={{
                        padding: 18, borderRadius: 14, cursor: isRevealed ? "default" : "pointer",
                        background: isRevealed ? "#f8f4ed" : "#fff",
                        border: `1.5px solid ${isRevealed ? "rgba(39,174,96,.3)" : "#e8e0d4"}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                        transition: "all .2s",
                      }}
                      onMouseEnter={e => { if (!isRevealed) e.currentTarget.style.borderColor = "#632024"; }}
                      onMouseLeave={e => { if (!isRevealed) e.currentTarget.style.borderColor = "#e8e0d4"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 24 }}>{clue.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#2c1810" }}>{clue.type}</span>
                      </div>
                      {isRevealed
                        ? <div style={{ fontSize: 13, color: "#5a4a3e", lineHeight: 1.6 }}>{clue.text}</div>
                        : <div style={{ fontSize: 12, color: "#8a7a6e", fontStyle: "italic" }}>{t('tapToInvestigate')}</div>
                      }
                    </div>
                  );
                })}
              </div>

              {/* Question unlocks after 3 clues */}
              {revealed.length >= 3 ? (
                <div style={{ background: "rgba(99,32,36,.04)", border: "1px solid rgba(99,32,36,.15)", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#632024", marginBottom: 14 }}>{caseData.question}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {caseData.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => submitGuess(opt)}
                        style={{
                          padding: "14px 18px", borderRadius: 12, background: "#fff",
                          border: "1.5px solid #e8e0d4", cursor: "pointer",
                          textAlign: "left", fontSize: 14, color: "#2c1810",
                          transition: "all .15s", lineHeight: 1.5,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#632024"; e.currentTarget.style.background = "rgba(99,32,36,.03)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e0d4"; e.currentTarget.style.background = "#fff"; }}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 16, background: "#f8f4ed", borderRadius: 12, border: "1px solid #e8e0d4" }}>
                  <span style={{ fontSize: 13, color: "#8a7a6e" }}>{t('needMoreClues', { needed: 3 - revealed.length })}</span>
                </div>
              )}
            </>
          ) : (
            /* Feedback */
            <div>
              <div style={{ textAlign: "center", fontSize: 22, fontWeight: 800, marginBottom: 16, color: guess.correct ? "#27ae60" : "#c0392b" }}>
                {guess.correct ? t('caseSolved') : t('wrongConclusion')}
              </div>
              <div style={{ background: "#f8f4ed", borderRadius: 14, padding: 20, border: "1px solid #e8e0d4", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#632024", marginBottom: 8 }}>{t('lessonLabel')}</div>
                <div style={{ fontSize: 14, color: "#5a4a3e", lineHeight: 1.8 }}>{caseData.lesson}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={nextCase}
                  style={{ padding: "13px 36px", background: "#632024", border: "none", borderRadius: 12, color: "#f5ede0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                >
                  {caseIdx + 1 >= allCases.length || lives <= 0 ? t('seeResults') : t('nextCase')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}