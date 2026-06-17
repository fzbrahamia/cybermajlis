"use client";

// ============================================================
// useCtfProgress — shared CTF auth + progress hook
//
// Used by BOTH the main-site CTF (/ctf) and the calm CTF
// (/calm/ctf). Both require sign-in so we can record which
// challenges a learner solves and, from the section tags,
// understand their skills.
//
// Firestore writes (mirrors the lesson-progress pattern):
//   user/{uid}/ctfProgress/{challengeId}   — per-user solve
//   ctfProgress/{uid}_{challengeId}        — flat mirror for analytics
//   user/{uid}  { ctfPoints, ctfSolved, xp } — running totals (increment)
// ============================================================

import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection, doc, getDocs, setDoc, increment, serverTimestamp,
} from "firebase/firestore";

export type CtfMode = "main" | "calm";
export type AuthState = "loading" | "signed-out" | "signed-in";

export interface CtfSolve {
  challengeId: string;
  sectionId: string;
  points: number;
  mode: CtfMode;
}

interface SolvedEntry { points: number; sectionId: string; mode: string }

export function useCtfProgress() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [solved, setSolved] = useState<Record<string, SolvedEntry>>({});

  const solvedRef = useRef(solved);
  useEffect(() => { solvedRef.current = solved; }, [solved]);

  // ── Auth listener + initial progress load ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setSolved({});
        setAuthState("signed-out");
        return;
      }
      try {
        const snap = await getDocs(collection(db, "user", u.uid, "ctfProgress"));
        const map: Record<string, SolvedEntry> = {};
        snap.forEach((d) => {
          const data = d.data();
          map[d.id] = {
            points: data.points ?? 0,
            sectionId: data.sectionId ?? "",
            mode: data.mode ?? "main",
          };
        });
        setSolved(map);
      } catch (err) {
        console.error("CTF progress load error:", err);
      } finally {
        setAuthState("signed-in");
      }
    });
    return () => unsub();
  }, []);

  // ── Record a captured flag (idempotent — never double-counts) ──
  const markSolved = async (s: CtfSolve) => {
    const u = auth.currentUser;
    if (!u) return;
    if (solvedRef.current[s.challengeId]) return; // already captured

    // Optimistic local update so the UI reflects the capture instantly.
    setSolved((prev) => ({
      ...prev,
      [s.challengeId]: { points: s.points, sectionId: s.sectionId, mode: s.mode },
    }));

    const base = {
      challengeId: s.challengeId,
      sectionId: s.sectionId,
      points: s.points,
      mode: s.mode,
      userID: u.uid,
      solvedAt: serverTimestamp(),
    };
    const progressID = `${u.uid}_${s.challengeId}`;

    try {
      await Promise.all([
        setDoc(doc(db, "user", u.uid, "ctfProgress", s.challengeId), base, { merge: true }),
        setDoc(doc(db, "ctfProgress", progressID), { ...base, progressID }, { merge: true }),
        setDoc(
          doc(db, "user", u.uid),
          { ctfPoints: increment(s.points), ctfSolved: increment(1), xp: increment(s.points) },
          { merge: true },
        ),
      ]);
    } catch (err) {
      console.error("CTF mark-solved error:", err);
    }
  };

  const totalPoints = Object.values(solved).reduce((sum, e) => sum + e.points, 0);

  return { authState, user, solved, markSolved, totalPoints };
}
