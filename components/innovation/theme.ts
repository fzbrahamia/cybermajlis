/* Innovation track tokens.

   Two decisions, both inherited rather than invented:

   Gold, because this track belongs to the company and crosses all three
   majalis. components/majlis/theme.ts already says gold is what holds them
   together, so the surfaces here are the Majlis surfaces.

   Nunito, not Cinzel. components/quantum/theme.ts states the rule: Cinzel is
   stately and right for a majlis, and the wrong voice for a nine year old.
   These are screens a child reads, so they take the rounder face. */

import { M, RADIUS, SHADOW } from "@/components/majlis/theme";

export { M, RADIUS, SHADOW };

export const sans = 'var(--font-nunito), "Nunito", ui-rounded, system-ui, sans-serif';
export const mono = '"Geist Mono", "JetBrains Mono", Menlo, monospace';

/** Nunito carries no Arabic glyphs, so Arabic falls back to the brand Naskh. */
export const display = (isAR: boolean) => (isAR ? "var(--font-arabic), sans-serif" : sans);

/** Rouda challenges, and she is the quantum green so she reads as a person
    rather than as the platform speaking. Hamad helps, and wears the gold. */
export const ROUDA = { mid: "#2E9C6E", deep: "#1B6B4C", tint: "rgba(46,156,110,.09)", line: "rgba(46,156,110,.28)" };

export const card: React.CSSProperties = {
  background: M.card,
  border: `1px solid rgba(42,35,28,.08)`,
  borderRadius: RADIUS.panel,
  boxShadow: SHADOW.rest,
};

export const flat: React.CSSProperties = {
  background: M.card,
  border: `1px solid rgba(42,35,28,.08)`,
  borderRadius: 16,
};

export const label: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: M.goldDeep,
};

export const button: React.CSSProperties = {
  minHeight: 44,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: M.action,
  color: M.cream,
  border: "none",
  borderRadius: RADIUS.pill,
  padding: "0 22px",
  fontFamily: sans,
  fontSize: 13.5,
  fontWeight: 800,
  letterSpacing: "0.02em",
  cursor: "pointer",
  textDecoration: "none",
};

export const ghostButton: React.CSSProperties = {
  ...button,
  background: "transparent",
  color: M.action,
  border: `1px solid ${M.gold}`,
};

export const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: mono,
  fontSize: 10,
  letterSpacing: "0.11em",
  textTransform: "uppercase",
  borderRadius: RADIUS.pill,
  padding: "5px 10px",
  background: M.goldSoft,
  color: M.action,
};

export const quietPill: React.CSSProperties = {
  ...pill,
  background: "rgba(42,35,28,.06)",
  color: M.body,
};
