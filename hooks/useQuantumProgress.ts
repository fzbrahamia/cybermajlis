"use client";

// ============================================================
// useQuantumProgress — path progress and gating
//
// Quantum lessons run in order: the next one opens only once the previous is
// finished. "Finished" means the video was watched, the board was read and at
// least one lab was completed. Deliberately NOT a quiz score: gating on a score
// locks out exactly the learner who most needs the next lesson.
//
// Anything already unlocked stays open forever, so nobody is ever stuck with
// nothing to do.
//
// Stored in localStorage, so a child can start without an account. Moving this
// to Firestore later means swapping read/write here and nothing else.
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
  // Nothing is known until the browser has read storage; rendering locks before
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

  const reset = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch { /* private mode */ }
    setProgress({});
  }, []);

  const doneCount = QUANTUM_PATH.filter(l => STEP_ORDER.every(s => progress[l.slug]?.[s])).length;

  return { progress, loaded, markStep, isStepDone, isLessonDone, isUnlocked, currentLesson, reset, doneCount };
}
