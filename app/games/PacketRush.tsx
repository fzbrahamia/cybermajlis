// ============================================================
// PACKET RUSH — Filter network packets as a firewall
// ============================================================

import { useState, useEffect, useRef } from "react";
import { CHARS } from "@/app/lib/characters";
import { GameShell, GameHeader, Intro } from "@/components/GameShell";
import { useTranslations } from "next-intl";

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const GAME_XP       = 100;
const MAX_LIVES     = 5;
const TIMER         = 90;
const PASSING_SCORE = 250;
const SPAWN_INTERVAL = 2200;

interface Packet {
  id: number;
  label: string;
  sublabel: string;
  bad: boolean;
  hint: string;
}

interface TappedResult {
  label: string;
  sublabel: string;
  bad: boolean;
  userBlocked: boolean;
  hint: string;
}

export default function PacketRush({ onHome }: { onHome: (xp?: number) => void }) {
  const t = useTranslations('PacketRush');
  
  const [phase, setPhase]         = useState<"intro"|"play"|"review"|"done">("intro");
  const [packets, setPackets]     = useState<Packet[]>([]);
  const [score, setScore]         = useState(0);
  const [lives, setLives]         = useState(MAX_LIVES);
  const [timer, setTimer]         = useState(TIMER);
  const [blocked, setBlocked]     = useState(0);
  const [tappedResults, setTappedResults] = useState<TappedResult[]>([]);
  // Per-packet flash: id → "good"|"bad"
  const [flashes, setFlashes]     = useState<Record<number, "good"|"bad">>({});
  const tRef    = useRef<NodeJS.Timeout | null>(null);
  const spRef   = useRef<NodeJS.Timeout | null>(null);
  const livesRef = useRef(MAX_LIVES);

  // Load packet pool from translations
  const getPacketPool = (): Omit<Packet, 'id'>[] => {
    const poolData = t.raw('packetPool');
    if (!poolData || !Array.isArray(poolData)) {
      console.error('Packet pool not found in translations');
      return [];
    }
    return poolData;
  };

  const stopAll = () => {
    if (tRef.current)  clearInterval(tRef.current);
    if (spRef.current) clearInterval(spRef.current);
  };

  const start = () => {
    setPackets([]); setScore(0); setLives(MAX_LIVES); livesRef.current = MAX_LIVES;
    setTimer(TIMER); setBlocked(0); setTappedResults([]); setFlashes({});
    setPhase("play");
    let timeLeft = TIMER;
    stopAll();
    tRef.current = setInterval(() => {
      timeLeft--; setTimer(timeLeft);
      if (timeLeft <= 0) { stopAll(); setPhase("review"); }
    }, 1000);
    spRef.current = setInterval(() => {
      const pool = getPacketPool();
      const pkt = pick(pool);
      setPackets(prev => [...prev.slice(-6), { ...pkt, id: Date.now() + Math.random() }]);
    }, SPAWN_INTERVAL);
  };

  const tapPacket = (pkt: Packet) => {
    const correct = pkt.bad;

    // Record result
    setTappedResults(prev => [...prev, {
      label: pkt.label, sublabel: pkt.sublabel,
      bad: pkt.bad, userBlocked: true, hint: pkt.hint,
    }]);

    if (correct) {
      setScore(s => s + 30);
      setBlocked(b => b + 1);
    } else {
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      if (newLives <= 0) { stopAll(); setPhase("review"); }
    }

    // Flash the packet green or red before removing
    setFlashes(f => ({ ...f, [pkt.id]: correct ? "good" : "bad" }));
    setTimeout(() => {
      setFlashes(f => { const n = { ...f }; delete n[pkt.id]; return n; });
      setPackets(prev => prev.filter(p => p.id !== pkt.id));
    }, 500);
  };

  useEffect(() => () => stopAll(), []);

  // ── INTRO ──
  if (phase === "intro") return (
    <GameShell>
      <Intro
        char={CHARS.oryx}
        title={t('title')}
        lines={[
          t('intro.line1'),
          t('intro.line2'),
          t('intro.line3'),
          t('intro.line4'),
        ]}
        onStart={start}
      />
    </GameShell>
  );

  // ── REVIEW SCREEN ──
  if (phase === "review") {
    const mistakes = tappedResults.filter(r => !r.bad);
    return (
      <div style={{ minHeight: "100vh", background: "#faf8f3", fontFamily: "sans-serif" }}>
        <div style={{ padding: "24px 40px", maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
            <h2 style={{ fontFamily: "serif", fontSize: 26, color: "#2c1810", marginBottom: 4 }}>{t('review.title')}</h2>
            <div style={{ fontSize: 14, color: "#8a7a6e" }}>{t('review.subtitle')}</div>
          </div>

          {/* Score summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: t('review.score'), val: score, color: "#632024" },
              { label: t('review.threatsBlocked'), val: blocked, color: "#27ae60" },
              { label: t('review.falseBlocks'), val: mistakes.length, color: "#c0392b" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #e8e0d4", borderRadius: 14, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "#8a7a6e", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Mistakes */}
          {mistakes.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, background: "rgba(39,174,96,.06)", borderRadius: 16, border: "1px solid rgba(39,174,96,.2)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#27ae60" }}>{t('review.perfect')}</div>
              <div style={{ fontSize: 13, color: "#5a4a3e", marginTop: 4 }}>{t('review.perfectSub')}</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#c0392b", marginBottom: 12 }}>
                {t('review.mistakesHeader', { count: mistakes.length })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {mistakes.map((r, i) => (
                  <div key={i} style={{ background: "#fff", border: "1.5px solid rgba(192,57,43,.2)", borderRadius: 14, padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>✗</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#2c1810" }}>{r.label}</div>
                        <div style={{ fontSize: 12, color: "#8a7a6e", fontFamily: "monospace", marginBottom: 8 }}>{r.sublabel}</div>
                        <div style={{ fontSize: 13, color: "#5a4a3e", lineHeight: 1.6 }}>
                          <strong style={{ color: "#632024" }}>{t('review.whySafe')}: </strong>{r.hint}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={start} style={{ padding: "12px 28px", background: "#632024", border: "none", borderRadius: 12, color: "#f5ede0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {t('review.playAgain')}
            </button>
            <button
              onClick={() => onHome(score >= PASSING_SCORE ? GAME_XP : 0)}
              style={{ padding: "12px 28px", background: "#fff", border: "1.5px solid #e8e0d4", borderRadius: 12, color: "#5a4a3e", fontSize: 14, cursor: "pointer" }}
            >
              {score >= PASSING_SCORE ? t('review.collectXp') : t('review.allGames')}
            </button>
          </div>

          {score < PASSING_SCORE && (
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#8a7a6e" }}>
              {t('review.xpRequirement', { passingScore: PASSING_SCORE, score: score })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── GAMEPLAY ──
  return (
    <GameShell>
      <GameHeader
        name={t('title')} onBack={() => { stopAll(); onHome(0); }}
        score={score} timer={timer} maxTimer={TIMER}
        lives={lives} maxLives={MAX_LIVES}
      />

      <div style={{ padding: "20px 40px", maxWidth: 800, margin: "0 auto" }}>

        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16, padding: "10px 20px", background: "#f8f4ed", borderRadius: 12, border: "1px solid #e8e0d4" }}>
          <span style={{ fontSize: 13, color: "#27ae60", fontWeight: 600 }}>🟢 {t('legend.green')}</span>
          <span style={{ fontSize: 13, color: "#8a7a6e" }}>|</span>
          <span style={{ fontSize: 13, color: "#c0392b", fontWeight: 600 }}>🔴 {t('legend.red')}</span>
          <span style={{ fontSize: 13, color: "#8a7a6e" }}>|</span>
          <span style={{ fontSize: 13, color: "#8a7a6e" }}>{t('legend.dontTap')}</span>
        </div>

        {/* Packet stream */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 400 }}>
          {packets.map(pkt => {
            const flash = flashes[pkt.id];
            return (
              <div
                key={pkt.id}
                onClick={() => !flash && tapPacket(pkt)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 20px", borderRadius: 14, cursor: flash ? "default" : "pointer",
                  transition: "all .2s",
                  background: flash === "good"
                    ? "rgba(39,174,96,.15)"
                    : flash === "bad"
                    ? "rgba(192,57,43,.12)"
                    : "#fff",
                  border: `2px solid ${
                    flash === "good" ? "rgba(39,174,96,.5)"
                    : flash === "bad" ? "rgba(192,57,43,.4)"
                    : "#e8e0d4"
                  }`,
                  boxShadow: flash ? "0 4px 16px rgba(0,0,0,.08)" : "0 2px 8px rgba(0,0,0,.04)",
                  transform: flash ? "scale(1.01)" : "scale(1)",
                }}
                onMouseEnter={e => { if (!flash) { e.currentTarget.style.transform = "scale(1.01)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"; } }}
                onMouseLeave={e => { if (!flash) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.04)"; } }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#2c1810" }}>{pkt.label}</div>
                  <div style={{ fontSize: 12, color: "#8a7a6e", fontFamily: "monospace", marginTop: 3 }}>{pkt.sublabel}</div>
                </div>
                {flash ? (
                  <div style={{ fontSize: 18, fontWeight: 800, color: flash === "good" ? "#27ae60" : "#c0392b" }}>
                    {flash === "good" ? t('packet.correctFlash') : t('packet.wrongFlash')}
                  </div>
                ) : (
                  <div style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.2)", color: "#c0392b" }}>
                    🛡 {t('packet.blockBtn')}
                  </div>
                )}
              </div>
            );
          })}

          {packets.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "#8a7a6e", fontSize: 14 }}>
              {t('waitingPackets')}
            </div>
          )}
        </div>

        {/* Server footer */}
        <div style={{ textAlign: "center", marginTop: 16, padding: "12px", background: "#f8f4ed", borderRadius: 12, border: "1px solid #e8e0d4" }}>
          <div style={{ fontSize: 32 }}>🖥</div>
          <div style={{ fontSize: 12, color: "#8a7a6e", marginTop: 4 }}>
            {t('protectedServer', { blocked: blocked })}
          </div>
        </div>
      </div>
    </GameShell>
  );
}