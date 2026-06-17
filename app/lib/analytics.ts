// ============================================================
// ANALYTICS — first-party event tracker
//
// Writes events to the Firestore `analyticsEvent` collection so
// the cybermajlis-admin console can answer two questions:
//   1. What cybersecurity SKILLS are the kids building / struggling
//      with?  (skill_attempt / skill_solve, tagged by section)
//   2. Which FEATURES does our audience actually use — and which
//      can we skip?  (feature_view, game_start, …)
//
// No third-party trackers, no cookies on children. Fire-and-forget:
// every call swallows its own errors so tracking can never break a
// page. Reads are admin-only (see firestore.rules).
// ============================================================

import { auth, db } from "./firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export type EventCategory = "feature" | "skill" | "game" | "lesson" | "engagement";

// A per-tab id so the admin console can group a single visit's events.
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem("cm-analytics-session");
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem("cm-analytics-session", id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

/**
 * Record one event. Safe to call from anywhere on the client.
 * Never throws; failures are swallowed.
 */
export function track(
  event: string,
  category: EventCategory,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  try {
    const path = window.location.pathname;
    void addDoc(collection(db, "analyticsEvent"), {
      event,
      category,
      params,
      userID: auth.currentUser?.uid ?? null,
      anonymous: !auth.currentUser,
      sessionId: getSessionId(),
      path,
      mode: path.startsWith("/calm") ? "calm" : path.startsWith("/elder") ? "elder" : "main",
      lang: typeof document !== "undefined" ? document.documentElement.lang || null : null,
      ts: serverTimestamp(),
    }).catch(() => {});
  } catch {
    /* never let analytics break the app */
  }
}

// ── Convenience helpers (typed event taxonomy) ──

/** A learner opened a feature/page — answers "what do they use?" */
export const trackFeatureView = (feature: string) =>
  track("feature_view", "feature", { feature });

/** A skill challenge was attempted (right or wrong) — shows where kids struggle. */
export const trackSkillAttempt = (
  section: string,
  challengeId: string,
  correct: boolean,
  mode: "main" | "calm",
) => track("skill_attempt", "skill", { section, challengeId, correct, mode });

/** A skill challenge was solved (flag captured). */
export const trackSkillSolve = (
  section: string,
  challengeId: string,
  points: number,
  mode: "main" | "calm",
) => track("skill_solve", "skill", { section, challengeId, points, mode });

/** A mini-game was started — shows which games are popular. */
export const trackGameStart = (game: string) =>
  track("game_start", "game", { game });

/** A mini-game finished, with the XP earned. */
export const trackGameComplete = (game: string, xp: number) =>
  track("game_complete", "game", { game, xp });

/** A lesson quiz was completed — a "thinking" activity, score out of total. */
export const trackQuizComplete = (score: number, total: number) =>
  track("quiz_complete", "skill", {
    score,
    total,
    pct: total ? Math.round((score / total) * 100) : 0,
  });

/** A SOC incident-response scenario was completed. `scores` is the per-layer
 *  breakdown (alert triage, containment, risk assessment, …). */
export const trackSocComplete = (
  scenario: string,
  scores: Record<string, number>,
  total: number,
) => track("soc_complete", "skill", { scenario, scores, total });

/** A specific lesson was opened — ranks which lessons actually get read. */
export const trackLessonView = (lesson: string, context: "main" | "elder" | "calm") =>
  track("lesson_view", "lesson", { lesson, context });
