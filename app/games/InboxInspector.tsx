// ============================================================
// INBOX INSPECTOR — Spot phishing emails
// ============================================================

import { useState, useEffect } from "react";
import { CHARS } from "@/app/lib/characters";
import { GameShell, GameHeader, Intro, Result } from "@/components/GameShell";
import { useTranslations } from "next-intl";

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const GAME_XP       = 100;
const DEFAULT_TOTAL = 8;
const PASSING_SCORE = 6;

interface Email {
  from: string;
  fromD: string;
  subj: string;
  body: string;
  url: string | null;
  phish: boolean;
  flags: string[];
}

export default function InboxInspector({ onHome }: { onHome: (xp?: number) => void }) {
  const t = useTranslations('InboxInspector');
  
  const [phase, setPhase]       = useState<"intro"|"play"|"done">("intro");
  const [emails, setEmails]     = useState<Email[]>([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; email: Email } | null>(null);
  const [hover, setHover]       = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRounds, setTotalRounds] = useState(DEFAULT_TOTAL);

  // Load emails from translations
  const loadEmails = (): Email[] => {
    try {
      const emailsData = t.raw('emails');
      if (!emailsData || !Array.isArray(emailsData)) {
        console.error('Emails not found in translations');
        return [];
      }
      return emailsData.map((email: any) => ({
        from: email.from,
        fromD: email.fromD,
        subj: email.subj,
        body: email.body,
        url: email.url,
        phish: email.phish,
        flags: email.flags
      }));
    } catch (error) {
      console.error('Error loading emails:', error);
      return [];
    }
  };

  const start = () => {
    const allEmails = loadEmails();
    if (allEmails.length === 0) {
      console.error('No emails loaded');
      return;
    }
    
    // Use available emails, up to DEFAULT_TOTAL
    const availableCount = Math.min(DEFAULT_TOTAL, allEmails.length);
    setTotalRounds(availableCount);
    
    const shuffledEmails = shuffle([...allEmails]).slice(0, availableCount);
    setEmails(shuffledEmails);
    setIdx(0); 
    setScore(0); 
    setFeedback(null);
    setIsLoading(false);
    setPhase("play");
  };

  const judge = (answer: "phish" | "safe") => {
    const email = emails[idx];
    if (!email) return;
    const correct = (answer === "phish" && email.phish) || (answer === "safe" && !email.phish);
    if (correct) setScore(s => s + 1);
    setFeedback({ correct, email }); 
    setHover(false);
  };

  const next = () => {
    setFeedback(null);
    if (idx + 1 >= totalRounds) {
      setPhase("done");
    } else {
      setIdx(i => i + 1);
    }
  };

  // Initial load check
  useEffect(() => {
    if (phase === "intro") {
      const allEmails = loadEmails();
      if (allEmails.length > 0) {
        setIsLoading(false);
      }
    }
  }, [phase]);

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

  if (phase === "done") return (
    <GameShell>
      <Result
        score={score}
        total={totalRounds}
        char={CHARS.fox}
        title={t('result.title')}
        message={
          score >= 8
            ? t('result.perfect')
            : score >= PASSING_SCORE
            ? t('result.passed', { score: score, total: totalRounds })
            : t('result.failed', { passingScore: PASSING_SCORE, total: totalRounds })
        }
        onRestart={start}
        onHome={() => onHome(score >= PASSING_SCORE ? GAME_XP : 0)}
      />
    </GameShell>
  );

  // Show loading state or empty state
  if (isLoading || emails.length === 0) {
    return (
      <GameShell>
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>📧</div>
          <div style={{ fontSize: 16, color: "#632024" }}>Loading emails...</div>
        </div>
      </GameShell>
    );
  }

  // Safety check for valid index
  if (!emails[idx]) {
    console.error(`Invalid email index: ${idx}, emails length: ${emails.length}`);
    return (
      <GameShell>
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 16, color: "#632024" }}>Error loading email. Please restart the game.</div>
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

  const email = emails[idx];

  return (
    <GameShell>
      <GameHeader name={t('title')} onBack={() => onHome(0)} score={score} round={idx + 1} maxRound={totalRounds} />

      <div style={{ padding: "24px 40px", maxWidth: 780, margin: "0 auto" }}>

        {/* Fixed-height slot — no jumping */}
        <div style={{ minHeight: 480 }}>

          {/* Email card */}
          <div style={{ background: "#fff", border: "1px solid #e8e0d4", borderRadius: 16, overflow: "hidden", marginBottom: 20, boxShadow: "0 4px 16px rgba(0,0,0,.05)" }}>
            {/* Email header */}
            <div style={{ padding: "16px 20px", background: "#f8f4ed", borderBottom: "1px solid #e8e0d4" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(99,32,36,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#632024", fontWeight: 700, flexShrink: 0 }}>
                  {email.fromD && email.fromD[0]}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#2c1810" }}>{email.fromD}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "#8a7a6e" }}>{email.from}</div>
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#2c1810" }}>{email.subj}</div>
            </div>

            {/* Email body */}
            <div style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: 14, color: "#5a4a3e", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{email.body}</div>
              {email.url && (
                <div style={{ marginTop: 14 }}>
                  <div
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    style={{ display: "inline-block", padding: "8px 16px", borderRadius: 10, background: "rgba(99,32,36,.06)", border: "1px solid rgba(99,32,36,.15)", color: "#632024", fontSize: 13, cursor: "help", fontFamily: "monospace", position: "relative" }}
                  >
                    🔗 {t('clickHere')}
                    {hover && (
                      <div style={{ position: "absolute", bottom: "calc(100% + 10px)", left: 0, padding: "8px 14px", background: "#fff", border: "1.5px solid rgba(192,57,43,.35)", borderRadius: 10, fontSize: 12, color: "#c0392b", whiteSpace: "nowrap", zIndex: 20, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
                        🔍 {t('realUrl')}: {email.url}
                      </div>
                    )}
                  </div>
                  {!feedback && (
                    <div style={{ fontSize: 12, color: "#8a7a6e", marginTop: 6 }}>💡 {t('hoverHint')}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Buttons or feedback */}
          {!feedback ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <button
                onClick={() => judge("phish")}
                style={{ padding: "20px", borderRadius: 14, background: "rgba(192,57,43,.06)", border: "2px solid rgba(192,57,43,.2)", cursor: "pointer", transition: "all .2s", textAlign: "center" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#c0392b"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(192,57,43,.2)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>🎣</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#c0392b" }}>{t('phishingBtn')}</div>
                <div style={{ fontSize: 12, color: "#8a7a6e", marginTop: 4 }}>{t('phishingSub')}</div>
              </button>
              <button
                onClick={() => judge("safe")}
                style={{ padding: "20px", borderRadius: 14, background: "rgba(39,174,96,.06)", border: "2px solid rgba(39,174,96,.2)", cursor: "pointer", transition: "all .2s", textAlign: "center" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#27ae60"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(39,174,96,.2)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#27ae60" }}>{t('safeBtn')}</div>
                <div style={{ fontSize: 12, color: "#8a7a6e", marginTop: 4 }}>{t('safeSub')}</div>
              </button>
            </div>
          ) : (
            <div style={{
              background: feedback.correct ? "rgba(39,174,96,.06)" : "rgba(192,57,43,.05)",
              border: `1.5px solid ${feedback.correct ? "rgba(39,174,96,.25)" : "rgba(192,57,43,.25)"}`,
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: feedback.correct ? "#27ae60" : "#c0392b", textAlign: "center", marginBottom: 12 }}>
                {feedback.correct ? t('correctBadge') : t('missedBadge')}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: email.phish ? "#c0392b" : "#27ae60", marginBottom: 10 }}>
                {email.phish ? t('phishLabel') : t('safeLabel')}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {email.flags && email.flags.map((f, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#5a4a3e", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.6 }}>
                    <span style={{ color: email.phish ? "#c0392b" : "#27ae60", flexShrink: 0 }}>{email.phish ? "🚩" : "✓"}</span>
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button
                  onClick={next}
                  style={{ padding: "12px 32px", background: "#632024", border: "none", borderRadius: 12, color: "#f5ede0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  {idx + 1 >= totalRounds ? t('seeResults') : t('nextEmail')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}