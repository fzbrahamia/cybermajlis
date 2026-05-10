// ============================================================
// UTILITY HELPERS
// Shared functions used across all games and components
// ============================================================

/** Generate a random integer between min and max (inclusive) */
export const rand = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Pick a random element from an array */
export const pick = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

/** Shuffle an array (Fisher-Yates) — returns new array, does not mutate */
export const shuffle = <T>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);
