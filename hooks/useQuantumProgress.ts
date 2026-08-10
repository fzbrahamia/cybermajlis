"use client";

// ============================================================
// useQuantumProgress — path progress and gating
//
// Stored in localStorage, on purpose. Firestore is where this belongs
// eventually, but the security rules do not allow a `quantumProgress`
// collection yet, so every write came back "Missing or insufficient
// permissions". Local keeps the path working today and means a child can start
// with no account at all.
//
// To move it later: add rules for
//   user/{uid}/quantumProgress/{lesson}   and   quantumProgress/{uid}_{lesson}
// then swap the read in the mount effect and the write in markStep. Nothing
// else in the app touches storage, so no page has to change.
//
// Lessons run in order: the next opens only once the previous is finished.
// "Finished" means the video was watched, the board was opened and the lab was
// completed. Deliberately not a quiz score, which would lock out the learner
// who most needs the next lesson. Anything already unlocked stays open.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { QUANTUM_PATH, STEP_ORDER, type StepId } from "@/app/lib/quantumData";

const KEY = "qm-progress-v1";

/** slug -> which steps are done */
export type QuantumProgress = Record<string, Partial<Record<StepId, boolean>>>;

function read(): QuantumProgress {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as QuantumProgress;
  } catch {
    return {};
  }
}

export function useQuantumProgress() {
  const [progress, setProgress] = useState<QuantumProgress>({});
  // Nothing is known until the browser has read storage. Rendering locks before
  // that would flash every lesson as locked on a return visit.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(read());
    setLoaded(true);
  }, []);

  const markStep = useCallback((slug: string, step: StepId) => {
    setProgress(prev => {
      if (prev[slug]?.[step]) return prev;
      const next = { ...prev, [slug]: { ...prev[slug], [step]: true } };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }, []);

  const isStepDone = useCallback(
    (slug: string, step: StepId) => !!progress[slug]?.[step],
    [progress],
  );

  const isLessonDone = useCallback(
    (slug: string) => STEP_ORDER.every(s => progress[slug]?.[s]),
    [progress],
  );

  /** The first lesson is always open. After that, finish the one before it. */
  const isUnlocked = useCallback(
    (slug: string) => {
      const idx = QUANTUM_PATH.findIndex(l => l.slug === slug);
      if (idx <= 0) return true;
      return STEP_ORDER.every(s => progress[QUANTUM_PATH[idx - 1].slug]?.[s]);
    },
    [progress],
  );

  /** Where a returning learner should be dropped back in. */
  const currentLesson = useCallback(() => {
    const next = QUANTUM_PATH.find(l => !STEP_ORDER.every(s => progress[l.slug]?.[s]));
    return next ?? QUANTUM_PATH[QUANTUM_PATH.length - 1];
  }, [progress]);

  const doneCount = QUANTUM_PATH.filter(l => STEP_ORDER.every(s => progress[l.slug]?.[s])).length;
  const stepCount = QUANTUM_PATH.reduce(
    (n, l) => n + STEP_ORDER.filter(s => progress[l.slug]?.[s]).length, 0,
  );

  return {
    progress, loaded,
    markStep, isStepDone, isLessonDone, isUnlocked, currentLesson,
    doneCount, stepCount,
  };
}
