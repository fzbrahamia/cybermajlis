/* Quantum Majlis tokens.
   Green, matching the hue this majlis carries on the Majlis landing. It is a
   luminous green rather than a leafy one, because it has to glow on the dark
   lab chassis as well as sit calmly on paper. */

export const Q = {
  deep: "#1B6B4C",
  mid: "#2E9C6E",
  soft: "#5FC79C",
  tint: "rgba(46,156,110,.10)",
};

/* ── The lab is a different place ─────────────────────────
   Reading surfaces stay on paper. The lab is instrumentation: a dark chassis,
   phosphor readouts, indicator lamps. The same rule the SOC follows, and it is
   what makes the lab feel like equipment rather than another page of text. */
export const LAB = {
  chassis: "#0A1310",
  panel: "#0F1E18",
  panelHi: "#14271F",
  edge: "rgba(95,199,156,.16)",
  edgeBright: "rgba(95,199,156,.40)",
  phosphor: "#6EE7A8",
  phosphorDim: "rgba(110,231,168,.55)",
  text: "#B9D8CA",
  textDim: "rgba(185,216,202,.55)",
  amber: "#E3B341",
  red: "#E06C6C",
};

/* Reading surfaces. Deliberately not the Majlis cream: this majlis sits on a
   pale green paper, near white, with pure white cards on top of it. Airy and
   quiet, so the dark lab lands as a hard cut when you reach it. */
export const INK = "#111A15";
export const BODY = "#5B6A62";
export const LINE = "rgba(17,26,21,.10)";
export const PAPER = "#FFFFFF";
export const PAGE = "#F0F5F1";
export const GOLD = "#C5A57E";
export const GOLD_DEEP = "#A8804A";

/* Quantum reads friendlier than the rest of the company. Cinzel is stately and
   right for a majlis; it is the wrong voice for a nine year old meeting
   superposition. Rounded sans throughout, mono kept for instrument readouts. */
export const headingFont = 'var(--font-nunito), "Nunito", ui-rounded, system-ui, sans-serif';
export const bodyFont    = 'var(--font-nunito), "Nunito", ui-rounded, system-ui, sans-serif';
export const mono = '"Geist Mono", "JetBrains Mono", Menlo, monospace';

/** Nunito carries no Arabic glyphs, so Arabic falls back to the brand Naskh. */
export const display = (isAR: boolean) => (isAR ? "var(--font-arabic), sans-serif" : headingFont);

export const EASE = [0.16, 1, 0.3, 1] as const;
export const SPRING = { type: "spring" as const, stiffness: 200, damping: 20 };

export const CARD_SHADOW = [
  "0 1px 2px rgba(17,26,21,.04)",
  "0 6px 16px rgba(17,26,21,.04)",
].join(", ");
export const CARD_SHADOW_LIFT = [
  "0 2px 6px rgba(17,26,21,.05)",
  "0 16px 34px rgba(17,26,21,.07)",
].join(", ");

/** Faint engineering grid for the lab chassis. */
export const LAB_GRID =
  "linear-gradient(rgba(95,199,156,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(95,199,156,.045) 1px, transparent 1px)";
