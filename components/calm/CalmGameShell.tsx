"use client";

import { Star } from "lucide-react";

const SANS   = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const CINZEL = "var(--ui)";
const BG     = "#F0F9FF";
const PRIMARY = "#1A3A5C";
const ACCENT  = "#3B82F6";
const BORDER  = "#BFDBFE";
const CARD    = "#FFFFFF";

interface ShellProps  { children: React.ReactNode }
interface HeaderProps { name: string; onBack: () => void; score?: number; round?: number; maxRound?: number; isRtl?: boolean }
interface IntroProps  { icon: React.ReactNode; title: string; lines: string[]; btnLabel: string; onStart: () => void }
interface ResultProps { score: number; total: number; title: string; message: string; againLabel: string; homeLabel: string; onRestart: () => void; onHome: () => void }

export function CalmShell({ children }: ShellProps) {
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: SANS }}>
      {children}
    </div>
  );
}

export function CalmHeader({ name, onBack, score = 0, round, maxRound, isRtl }: HeaderProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 1.5rem", height: 64,
      background: PRIMARY, borderBottom: `3px solid ${ACCENT}`,
      direction: isRtl ? "rtl" : "ltr",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
        <button
          onClick={onBack}
          style={{ color: "rgba(255,255,255,0.8)", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}
        >
          {isRtl ? "→" : "←"}
        </button>
        <div>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1rem", color: "#FFFFFF" }}>{name}</div>
          {round != null && (
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
              {round} / {maxRound}
            </div>
          )}
        </div>
      </div>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.3rem", color: "#93C5FD" }}>{score}</div>
    </div>
  );
}

export function CalmIntro({ icon, title, lines, btnLabel, onStart }: IntroProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem", textAlign: "center" }}>
      <div style={{ lineHeight: 1, marginBottom: "1rem", display: "flex", justifyContent: "center" }}>{icon}</div>
      <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.8rem", color: PRIMARY, marginBottom: "1.5rem" }}>{title}</h2>
      <div style={{ maxWidth: 520, marginBottom: "2rem" }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            background: CARD, border: `2px solid ${BORDER}`,
            borderRadius: 16, padding: "1rem 1.4rem",
            fontSize: "1.05rem", color: "#334155", lineHeight: 1.7,
            marginBottom: "0.8rem", textAlign: "left",
          }}>
            {line}
          </div>
        ))}
      </div>
      <button
        onClick={onStart}
        style={{
          fontFamily: CINZEL, fontWeight: 700, fontSize: "1.1rem",
          background: ACCENT, color: "#FFFFFF",
          border: "none", borderRadius: 14,
          padding: "0.9rem 2.6rem", cursor: "pointer",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#2563EB"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ACCENT; }}
      >
        {btnLabel}
      </button>
    </div>
  );
}

export function CalmResult({ score, total, title, message, againLabel, homeLabel, onRestart, onHome }: ResultProps) {
  const pct   = Math.round((score / Math.max(total, 1)) * 100);
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem", textAlign: "center" }}>
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", justifyContent: "center" }}>
        {Array.from({ length: 3 }, (_, i) => (
          <Star key={i} size={48} fill={i < stars ? "#FBBF24" : "none"} color={i < stars ? "#FBBF24" : "#CBD5E1"} strokeWidth={1.5} />
        ))}
      </div>
      <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.6rem", color: PRIMARY, marginBottom: "0.4rem" }}>{title}</h2>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "3rem", color: ACCENT, marginBottom: "0.2rem" }}>{score}/{total}</div>
      <p style={{ fontSize: "1.1rem", color: "#475569", maxWidth: 440, lineHeight: 1.7, marginBottom: "2rem" }}>{message}</p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={onRestart}
          style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1rem", background: ACCENT, color: "#FFFFFF", border: "none", borderRadius: 12, padding: "0.8rem 1.8rem", cursor: "pointer" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#2563EB"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ACCENT; }}
        >
          {againLabel}
        </button>
        <button
          onClick={onHome}
          style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1rem", background: CARD, color: PRIMARY, border: `2px solid ${BORDER}`, borderRadius: 12, padding: "0.8rem 1.8rem", cursor: "pointer" }}
        >
          {homeLabel}
        </button>
      </div>
    </div>
  );
}
