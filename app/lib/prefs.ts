// Small per-device preferences that are not worth an account: they follow the
// browser, not the person, and losing them costs nothing.
//
// One key, because a second key is a second thing to forget to migrate.

const KEY = "mj-prefs";

export type Motion = "system" | "full" | "reduced";

export type Prefs = {
  /** Rouda reads her questions out loud. Pre-dates this file. */
  voice?: boolean;
  /** "system" follows the operating system's reduce-motion setting. */
  motion?: Motion;
};

export function readPrefs(): Prefs {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); }
  catch { return {}; }
}

export function writePrefs(patch: Prefs): Prefs {
  const next = { ...readPrefs(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
  // localStorage does not fire `storage` in the tab that wrote it, and the
  // whole point of this setting is that it takes effect the instant you press
  // it, on the page you are looking at.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mj-prefs", { detail: next }));
  }
  return next;
}

/** Fires now and on every change, in this tab and in any other. */
export function subscribePrefs(cb: (p: Prefs) => void): () => void {
  if (typeof window === "undefined") return () => {};
  cb(readPrefs());
  const here = () => cb(readPrefs());
  const elsewhere = (e: StorageEvent) => { if (e.key === KEY) cb(readPrefs()); };
  window.addEventListener("mj-prefs", here);
  window.addEventListener("storage", elsewhere);
  return () => {
    window.removeEventListener("mj-prefs", here);
    window.removeEventListener("storage", elsewhere);
  };
}
