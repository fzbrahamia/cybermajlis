// components/HamadCommentary.tsx
"use client";
import { useEffect, useState } from "react";

interface Props {
  simId: string;
  trigger: string | null; // current event key
  accentColor?: string;
}

export default function HamadCommentary({ simId, trigger, accentColor = "#632024" }: Props) {
  const [commentary, setCommentary] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  // Load commentary set once on mount
  useEffect(() => {
    fetch("/api/games/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: simId, mode: "commentary" }),
    })
      .then(r => r.json())
      .then(d => { if (d.content) setCommentary(d.content); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [simId]);

  // Show comment when trigger changes
  useEffect(() => {
    if (!trigger || !commentary[trigger]) return;
    setCurrent(commentary[trigger]);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 7000);
    return () => clearTimeout(t);
  }, [trigger, commentary]);

  if (loading || !current) return null;

  return (
    <div style={{
      position: "fixed", bottom: 90, right: 24, zIndex: 8000,
      display: "flex", alignItems: "flex-end", gap: 8,
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
      pointerEvents: visible ? "auto" : "none",
    }}>
      {/* Chat bubble */}
      <div style={{
        maxWidth: 260, padding: "10px 14px",
        background: "rgba(13,17,23,0.96)", border: `1px solid ${accentColor}50`,
        borderRadius: "12px 12px 4px 12px",
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}20`,
        fontSize: 12, color: "#c9d1d9", lineHeight: 1.65,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <div style={{ fontSize: 9, color: accentColor, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 6 }}>
          HAMAD · ANALYST
        </div>
        {current}
      </div>
      {/* Avatar */}
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${accentColor}60`, overflow: "hidden", flexShrink: 0 }}>
        <img src="/avatar.png" alt="Hamad" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
}
