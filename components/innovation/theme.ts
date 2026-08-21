/* Innovation track tokens.

   Gold is the roof: it is what components/majlis/theme.ts says holds the three
   majalis together, so it stays on the mark and the shared chrome.

   But gold alone made every page look like every other page, which is why the
   track felt like five separate websites. So each room now carries one of the
   four brand hues, the same four that make up the Majlis mark. Inside Learn,
   the domain's own colour takes over, because a cybersecurity case should feel
   like cybersecurity.

   Nunito throughout, at rounder radii and larger sizes than the company pages.
   components/quantum/theme.ts already settled this: Cinzel is right for a
   majlis and wrong for a child. */

import { M, RADIUS, SHADOW } from "@/components/majlis/theme";

export { M, SHADOW };

export const sans = 'var(--font-nunito), "Nunito", ui-rounded, system-ui, sans-serif';
export const mono = '"Geist Mono", "JetBrains Mono", Menlo, monospace';
export const display = (isAR: boolean) => (isAR ? "var(--font-arabic), sans-serif" : sans);

/** Rounder than the company pages. Children read shapes before words. */
export const R = { card: 24, panel: 20, chip: 16, pill: 999 };
export { RADIUS };

export type Hue = { deep: string; mid: string; soft: string; tint: string; wash: string };

const hue = (deep: string, mid: string, soft: string, a: string): Hue => ({
  deep, mid, soft,
  tint: `${a}, .10)`,
  wash: `${a}, .05)`,
});

/** The four of the Majlis mark, reused as the four rooms of the track. */
export const HUES: Record<string, Hue> = {
  gold:    hue("#8F6A38", "#C5A57E", "#E0CBAA", "rgba(197,165,126"),
  green:   hue("#1B6B4C", "#2E9C6E", "#5FC79C", "rgba(46,156,110"),
  maroon:  hue("#7A1E22", "#A8323F", "#C9525F", "rgba(168,50,63"),
  blue:    hue("#2B4E86", "#3D6FB5", "#7099D6", "rgba(61,111,181"),
};

/** Which room wears which hue. Learn is gold because it is the way in. */
export const ROOM: Record<string, Hue> = {
  "/learn":   HUES.gold,
  "/board":   HUES.maroon,
  "/latest":  HUES.green,
  "/mine":    HUES.blue,
  "/account": HUES.blue,
};

export const roomFor = (pathname: string): Hue => {
  const k = Object.keys(ROOM).filter(h => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return ROOM[k] ?? HUES.gold;
};

/** Rouda challenges and wears green; Hamad helps and wears gold. */
export const ROUDA = { mid: HUES.green.mid, deep: HUES.green.deep, tint: HUES.green.tint, line: "rgba(46,156,110,.28)" };

/* ── surfaces ─────────────────────────────────────────── */

export const card: React.CSSProperties = {
  background: M.card,
  border: "1px solid rgba(42,35,28,.07)",
  borderRadius: R.card,
  boxShadow: "0 1px 2px rgba(58,44,28,.03), 0 10px 26px rgba(58,44,28,.05)",
};

export const flat: React.CSSProperties = {
  background: M.card,
  border: "1px solid rgba(42,35,28,.07)",
  borderRadius: R.panel,
};

export const label: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 10.5,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: M.goldDeep,
};

/* ── controls ─────────────────────────────────────────── */

export const btn = (h: Hue = HUES.gold): React.CSSProperties => ({
  minHeight: 48,
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  background: h.deep,
  color: "#FFFDF8",
  border: "none",
  borderRadius: R.pill,
  padding: "0 24px",
  fontFamily: sans,
  fontSize: 14.5,
  fontWeight: 800,
  cursor: "pointer",
  textDecoration: "none",
  boxShadow: `0 2px 0 rgba(0,0,0,.08), 0 8px 20px ${h.tint}`,
});

export const ghost = (h: Hue = HUES.gold): React.CSSProperties => ({
  ...btn(h),
  background: "transparent",
  color: h.deep,
  border: `2px solid ${h.soft}`,
  boxShadow: "none",
});

export const chip = (h: Hue = HUES.gold, on = false): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: sans,
  fontSize: 12.5,
  fontWeight: 700,
  borderRadius: R.pill,
  padding: "7px 14px",
  background: on ? h.deep : h.tint,
  color: on ? "#FFFDF8" : h.deep,
});

export const quiet: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: sans,
  fontSize: 12.5,
  fontWeight: 700,
  borderRadius: R.pill,
  padding: "7px 14px",
  background: "rgba(42,35,28,.05)",
  color: M.body,
};

/* kept so existing pages keep compiling while they are rewritten */
export const button = btn(HUES.gold);
export const ghostButton = ghost(HUES.gold);
export const pill = chip(HUES.gold);
export const quietPill = quiet;
