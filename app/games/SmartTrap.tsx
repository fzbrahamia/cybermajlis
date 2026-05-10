// ============================================================
// SMART TRAP — Secure IoT devices room by room
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

interface IotOpt  { text: string; correct: boolean; tip: string; }
interface IotRoom  { room: string; device: string; icon: string; puzzle: string; opts: IotOpt[]; }
type Feedback = IotOpt & { timeout?: boolean };

export default function SmartTrap({ onHome }: { onHome: (xp?: number) => void }) {
  const t = useTranslations('SmartTrap');
  
  const [phase, setPhase]       = useState<"intro"|"play"|"done">("intro");
  const [rooms, setRooms]       = useState<IotRoom[]>([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [lives, setLives]       = useState(MAX_LIVES);
  const [timer, setTimer]       = useState(TIMER);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const tRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load IoT rooms from translations
  const getIotRooms = (): IotRoom[] => {
    const roomsData = t.raw('rooms');
    if (!roomsData || !Array.isArray(roomsData)) {
      console.error('IoT rooms not found in translations');
      return [];
    }
    return roomsData;
  };

  const startTimer = () => {
    let tVal = TIMER; setTimer(TIMER);
    if (tRef.current) clearInterval(tRef.current);
    tRef.current = setInterval(() => {
      tVal--; setTimer(tVal);
      if (tVal <= 0) {
        if (tRef.current) clearInterval(tRef.current);
        setFeedback({ correct: false, timeout: true, text: "", tip: t('timeoutTip') });
        setLives(l => l - 1);
      }
    }, 1000);
  };

  const start = () => {
    const allRooms = getIotRooms();
    const picked = shuffle([...allRooms]).slice(0, TOTAL).map(r => ({ ...r, opts: shuffle([...r.opts]) }));
    setRooms(picked);
    setIdx(0); setScore(0); setLives(MAX_LIVES); setFeedback(null);
    setPhase("play"); setTimeout(startTimer, 100);
  };

  const choose = (opt: IotOpt) => {
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
        total={TOTAL * 205}
        char={CHARS.fox}
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

  const room = rooms[idx];
  
  if (!room) return null;

  return (
    <GameShell>
      <GameHeader
        name={t('title')} onBack={() => { if (tRef.current) clearInterval(tRef.current); onHome(0); }}
        score={score} round={idx + 1} maxRound={TOTAL}
        timer={feedback ? null : timer} maxTimer={TIMER}
        lives={lives} maxLives={MAX_LIVES}
      />

      <div style={{ padding: "24px 40px", maxWidth: 800, margin: "0 auto" }}>

        {/* Room + device header */}
        <div style={{ background: "#fff", border: "1px solid #e8e0d4", borderRadius: 16, padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(99,32,36,.08)", color: "#632024", fontWeight: 700 }}>
              📍 {room.room}
            </span>
            <span style={{ fontSize: 13, color: "#8a7a6e" }}>→</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2c1810" }}>{room.icon} {room.device}</span>
          </div>
          <div style={{ fontSize: 16, color: "#2c1810", lineHeight: 1.7, fontWeight: 500 }}>{room.puzzle}</div>
        </div>

        {/* Fixed-height slot — no jumping */}
        <div style={{ minHeight: 320 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {room.opts.map((opt, i) => {
              const showResult = !!feedback;
              const isChosen   = feedback?.text === opt.text;
              let bg = "#fff", bc = "#e8e0d4";
              if (showResult && opt.correct)              { bg = "rgba(39,174,96,.07)";  bc = "rgba(39,174,96,.35)"; }
              else if (showResult && isChosen && !opt.correct) { bg = "rgba(192,57,43,.05)"; bc = "rgba(192,57,43,.3)"; }

              return (
                <div
                  key={i}
                  onClick={() => choose(opt)}
                  style={{ padding: "18px 20px", borderRadius: 14, background: bg, border: `1.5px solid ${bc}`, cursor: feedback ? "default" : "pointer", transition: "all .15s", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}
                  onMouseEnter={e => { if (!feedback) { e.currentTarget.style.borderColor = "#632024"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { if (!feedback) { e.currentTarget.style.borderColor = "#e8e0d4"; e.currentTarget.style.transform = "none"; } }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#2c1810" }}>{opt.text}</div>
                  {showResult && (opt.correct || isChosen) && (
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

          {feedback && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14,
                color: feedback.correct ? "#27ae60" : "#c0392b" }}>
                {feedback.timeout ? t('tooSlow') : feedback.correct ? t('deviceSecured') : t('stillVulnerable')}
              </div>
              <button
                onClick={next}
                style={{ padding: "13px 36px", background: "#632024", border: "none", borderRadius: 12, color: "#f5ede0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                {idx + 1 >= TOTAL || lives <= 0 ? t('seeResults') : t('nextRoom')}
              </button>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}