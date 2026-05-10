// ============================================================
// DEFENSE BUILDER — Build a security wall to block threat waves
// ============================================================

import { useState, useEffect, useRef } from "react";
import { GameShell, GameHeader, Intro, Result } from "@/components/GameShell";
import { CHARS } from "@/app/lib/characters";
import { useTranslations } from "next-intl";

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const GAME_XP = 100;
const PASSING_SCORE = 1000;
const WAVES = 5;
const MAX_LIVES = 5;
const TIMER = 30;

interface Layer {
  id: string;
  name: string;
  icon: string;
  desc: string;
  beats: string[];
  cost: number;
}

interface Threat {
  id: string;
  name: string;
  icon: string;
  blocked_by: string[];
}

interface Result2 extends Threat {
  blocked: boolean;
}

export default function DefenseBuilder({ onHome }: { onHome: (xp?: number) => void }) {
  const t = useTranslations('DefenseBuilder');
  const getDefLayers = (): Layer[] => {
    const layersData = t.raw('defenseLayers');
    if (!layersData || !Array.isArray(layersData)) {
      console.error('Defense layers not found in translations');
      return [];
    }
    return layersData;
  };

  const getDefThreats = (): Threat[] => {
    const threatsData = t.raw('defenseThreats');
    if (!threatsData || !Array.isArray(threatsData)) {
      console.error('Defense threats not found in translations');
      return [];
    }
    return threatsData;
  };
  const [phase, setPhase]     = useState<"intro"|"play"|"done">("intro");
  const [wave, setWave]       = useState(0);
  const [score, setScore]     = useState(0);
  const [lives, setLives]     = useState(MAX_LIVES);
  const [budget, setBudget]   = useState(4);
  const [wall, setWall]       = useState<Layer[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [results, setResults] = useState<Result2[] | null>(null);
  const [timer, setTimer]     = useState(TIMER);
  const tRef = useRef<NodeJS.Timeout | null>(null);
  const wallRef = useRef<Layer[]>([]);

  useEffect(() => { wallRef.current = wall; }, [wall]);
  useEffect(() => () => { if (tRef.current) clearInterval(tRef.current); }, []);

  const startWave = (w: number) => {
    setWave(w); setWall([]); wallRef.current = []; setResults(null);
    const b = Math.min(3 + w, 7); setBudget(b);
    const numThreats = Math.min(2 + Math.floor(w / 2), 4);
    const allThreats = getDefThreats();
    setThreats(shuffle([...allThreats]).slice(0, numThreats));
    setTimer(TIMER);
    let timerValue = TIMER;
    if (tRef.current) clearInterval(tRef.current);
    tRef.current = setInterval(() => {
      timerValue--; setTimer(timerValue);
      if (timerValue <= 0) { if (tRef.current) clearInterval(tRef.current); deployWall(wallRef.current); }
    }, 1000);
  };

  const start = () => { setScore(0); setLives(MAX_LIVES); setPhase("play"); startWave(1); };

  const toggleLayer = (layer: Layer) => {
    if (results) return;
    const inWall = wallRef.current.find(l => l.id === layer.id);
    if (inWall) {
      const next = wallRef.current.filter(l => l.id !== layer.id);
      setWall(next); wallRef.current = next;
    } else {
      const usedBudget = wallRef.current.reduce((s, l) => s + l.cost, 0);
      if (usedBudget + layer.cost <= budget) {
        const next = [...wallRef.current, layer];
        setWall(next); wallRef.current = next;
      }
    }
  };

  const deployWall = (currentWall: Layer[]) => {
    if (tRef.current) clearInterval(tRef.current);
    const activeDefenses = currentWall.map(l => l.id);
    setThreats(prev => {
      const res: Result2[] = prev.map(threat => ({
        ...threat,
        blocked: threat.blocked_by.some((def: any) => activeDefenses.includes(def)),
      }));
      setResults(res);
      const blocked = res.filter(r => r.blocked).length;
      const missed  = res.filter(r => !r.blocked).length;
      setScore(s => s + blocked * 100 + (missed === 0 ? timer * 5 : 0));
      if (missed > 0) setLives(l => Math.max(0, l - missed));
      return prev;
    });
  };

  const nextWave = () => {
    if (lives <= 0 || wave >= WAVES) { setPhase("done"); return; }
    startWave(wave + 1);
  };

  if (phase === "intro") return (
    <GameShell>
      <Intro
        char={CHARS.oryx}
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
        total={WAVES * 500}
        char={CHARS.oryx}
        title={lives > 0 ? t('result.wallStands') : t('result.wallBreached')}
        message={
          score >= PASSING_SCORE
            ? score >= 2000
              ? t('result.perfect')
              : t('result.passed')
            : t('result.failed', { passingScore: PASSING_SCORE })
        }
        onRestart={start}
        onHome={() => onHome(score >= PASSING_SCORE ? GAME_XP : 0)}
      />
    </GameShell>
  );

  const usedBudget = wall.reduce((s, l) => s + l.cost, 0);

  return (
    <GameShell>
      <GameHeader
        name={t('title')} onBack={() => { if (tRef.current) clearInterval(tRef.current); onHome(0); }}
        score={score} round={wave} maxRound={WAVES}
        timer={results ? null : timer} maxTimer={TIMER}
        lives={lives} maxLives={MAX_LIVES}
      />

      <div style={{ padding: "24px 40px", maxWidth: 960, margin: "0 auto" }}>

        {/* Incoming threats */}
        <div style={{ background: "rgba(192,57,43,.04)", border: "1px solid rgba(192,57,43,.15)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#c0392b", fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>{t('incomingThreats', { wave: wave })}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {threats.map((threat, i) => {
              const r = results?.[i];
              return (
                <div key={i} style={{
                  padding: "16px 20px", borderRadius: 14, minWidth: 120, textAlign: "center",
                  background: r ? (r.blocked ? "rgba(39,174,96,.06)" : "rgba(192,57,43,.06)") : "#fff",
                  border: `1.5px solid ${r ? (r.blocked ? "rgba(39,174,96,.25)" : "rgba(192,57,43,.25)") : "#e8e0d4"}`,
                }}>
                  <div style={{ fontSize: 36 }}>{threat.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2c1810", marginTop: 6 }}>{threat.name}</div>
                  {r && <div style={{ fontSize: 11, fontWeight: 800, color: r.blocked ? "#27ae60" : "#c0392b", marginTop: 6 }}>{r.blocked ? t('blockedBadge') : t('breachBadge')}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Defense selection */}
        {!results && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#632024", fontWeight: 700 }}>{t('selectDefenses')}</span>
              <span style={{ fontFamily: "monospace", fontSize: 15, color: "#632024", fontWeight: 700 }}>{t('budget', { used: usedBudget, budget: budget })}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
              {getDefLayers().map(layer => {
                const inWall    = !!wall.find(l => l.id === layer.id);
                const canAfford = usedBudget + layer.cost <= budget || inWall;
                return (
                  <div key={layer.id} onClick={() => toggleLayer(layer)} style={{
                    padding: "18px 14px", borderRadius: 14, textAlign: "center",
                    cursor: canAfford ? "pointer" : "default",
                    background: inWall ? "rgba(99,32,36,.06)" : "#fff",
                    border: `2px solid ${inWall ? "#632024" : canAfford ? "#e8e0d4" : "transparent"}`,
                    opacity: !canAfford && !inWall ? 0.35 : 1,
                    transition: "all .15s",
                    boxShadow: inWall ? "0 0 14px rgba(99,32,36,.15)" : "0 2px 8px rgba(0,0,0,.04)",
                  }}>
                    <div style={{ fontSize: 32 }}>{layer.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: inWall ? "#632024" : "#5a4a3e", marginTop: 8 }}>{layer.name}</div>
                    <div style={{ fontSize: 11, color: "#8a7a6e", marginTop: 4, lineHeight: 1.5 }}>{layer.desc}</div>
                    <div style={{ fontSize: 12, color: "#C5A57E", fontWeight: 700, marginTop: 6 }}>{t('costLabel', { cost: layer.cost })}</div>
                  </div>
                );
              })}
            </div>

            {/* Current wall */}
            <div style={{ background: "#f8f4ed", borderRadius: 14, padding: 18, marginBottom: 20, border: "1px solid #e8e0d4", minHeight: 64 }}>
              <div style={{ fontSize: 12, color: "#8a7a6e", marginBottom: 8 }}>{t('yourWall')}</div>
              {wall.length === 0
                ? <div style={{ fontSize: 14, color: "#8a7a6e", textAlign: "center", padding: "8px 0" }}>{t('emptyWall')}</div>
                : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {wall.map(l => (
                      <span key={l.id} style={{ padding: "7px 14px", borderRadius: 10, background: "rgba(99,32,36,.08)", border: "1px solid rgba(99,32,36,.15)", fontSize: 13, color: "#632024", fontWeight: 600 }}>
                        {l.icon} {l.name}
                      </span>
                    ))}
                  </div>
              }
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => deployWall(wallRef.current)}
                style={{
                  padding: "14px 48px", background: wall.length > 0 ? "#632024" : "#e8e0d4",
                  border: "none", borderRadius: 14,
                  color: wall.length > 0 ? "#f5ede0" : "#8a7a6e",
                  fontSize: 16, fontWeight: 800, cursor: wall.length > 0 ? "pointer" : "default", letterSpacing: 1,
                }}
              >
                {t('deployButton')} 🚀
              </button>
            </div>
          </>
        )}

        {/* Results panel */}
        {results && (
          <div>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 800, marginBottom: 12,
              color: results.every(r => r.blocked) ? "#27ae60" : "#c0392b" }}>
              {results.every(r => r.blocked) ? t('allBlocked') : t('breaches', { count: results.filter(r => !r.blocked).length })}
            </div>

            <div style={{ background: "#f8f4ed", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #e8e0d4" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#632024", marginBottom: 8 }}>{t('analysis')}</div>
              {results.filter(r => !r.blocked).map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: "#5a4a3e", marginBottom: 6, lineHeight: 1.6 }}>
                  <strong style={{ color: "#c0392b" }}>{r.icon} {r.name}</strong> {t('wasNotBlocked')}{" "}
                  <strong style={{ color: "#632024" }}>
                    {r.blocked_by.map((d: any) => getDefLayers().find(l => l.id === d)?.name || d).join(" or ")}
                  </strong>
                </div>
              ))}
              {results.every(r => r.blocked) && (
                <div style={{ fontSize: 12, color: "#27ae60" }}>{t('perfectDefense')}</div>
              )}
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={nextWave} style={{ padding: "12px 32px", background: "#632024", border: "none", borderRadius: 12, color: "#f5ede0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {wave >= WAVES || lives <= 0 ? t('seeResults') : t('nextWave')}
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}