"use client";

// ============================================================
// useQuantumProgress — path progress, gating, and the account behind it
//
// Progress is per account, mirroring the CTF and lesson hooks:
//   user/{uid}/quantumProgress/{lessonSlug}  { video, board, lab, updatedAt }
//   quantumProgress/{uid}_{slug}             flat mirror for reporting
//
// Quantum lessons run in order: the next opens only once the previous is
// finished. "Finished" means the video was watched, the board was opened and a
// lab was completed. Deliberately NOT a quiz score, which would lock out the
// learner who most needs the next lesson. Anything already unlocked stays open.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { QUANTUM_PATH, STEP_ORDER, type StepId } from "@/app/lib/quantumData";

export type AuthState = "loading" | "signed-out" | "signed-in";

/** slug -> which steps are done */
export type QuantumProgress = Record<string, Partial<Record<StepId, boolean>>>;

export function useQuantumProgress() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<QuantumProgress>({});

  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setProgress({});
        setAuthState("signed-out");
        return;
      }
      try {
        const snap = await getDocs(collection(db, "user", u.uid, "quantumProgress"));
        const map: QuantumProgress = {};
        snap.forEach(d => {
          const data = d.data();
          map[d.id] = { video: !!data.video, board: !!data.board, lab: !!data.lab };
        });
        setProgress(map);
      } catch (err) {
        console.error("Quantum progress load error:", err);
      } finally {
        setAuthState("signed-in");
      }
    });
    return () => unsub();
  }, []);

  /** Idempotent: a step already recorded never writes again. */
  const markStep = useCallback(async (slug: string, step: StepId) => {
    const u = auth.currentUser;
    if (!u) return;
    if (progressRef.current[slug]?.[step]) return;

    // Optimistic, so the rail ticks over immediately.
    setProgress(prev => ({ ...prev, [slug]: { ...prev[slug], [step]: true } }));

    const patch = { [step]: true, lessonSlug: slug, userID: u.uid, updatedAt: serverTimestamp() };
    try {
      await Promise.all([
        setDoc(doc(db, "user", u.uid, "quantumProgress", slug), patch, { merge: true }),
        setDoc(doc(db, "quantumProgress", `${u.uid}_${slug}`), { ...patch, progressID: `${u.uid}_${slug}` }, { merge: true }),
      ]);
    } catch (err) {
      console.error("Quantum mark-step error:", err);
    }
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
    authState, user, progress,
    /** True once we know whether anyone is signed in. */
    loaded: authState !== "loading",
    markStep, isStepDone, isLessonDone, isUnlocked, currentLesson,
    doneCount, stepCount,
  };
}
