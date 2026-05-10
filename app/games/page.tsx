"use client";
// ============================================================
// Main Router
// Manages which screen is active: hub, game, or demo
// ============================================================
import { useState, useCallback, useEffect, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import Hub from "@/components/Hub";
// ── Game Imports ──
import SouqSafe from "./SouqSafe";
import InboxInspector from "./InboxInspector";
import RansomRescue from "./RansomRescue";
import DefenseBuilder from "./DefenseBuilder";
import DMDetector from "./DMDetector";
import ChatShield from "./ChatShield";
import HackLab from "./HackLab";
import PacketRush from "./PacketRush";
import DigitalDetective from "./DigitalDetective";
import SmartTrap from "./SmartTrap";
import { useRouter } from "next/navigation";
import { SIM_MAP } from "./simMap";

const GAME_MAP: Record<string, React.ComponentType<{ onHome: (xp?: number) => void }>> = {
  souq:       SouqSafe,
  inbox:      InboxInspector,
  ransom:     RansomRescue,
  builder:    DefenseBuilder,
  dm:         DMDetector,
  chatshield: ChatShield,
  hacklab:    HackLab,
  packets:    PacketRush,
  detective:  DigitalDetective,
  smarttrap:  SmartTrap,
};

export default function App() {
  const router = useRouter();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const userRef = useRef<User | null>(null); // always up-to-date, no stale closure

  // ── Auth listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      userRef.current = u;
      if (u) {
        const snap = await getDoc(doc(db, "user", u.uid));
        setTotalXP(snap.exists() ? (snap.data().xp ?? 0) : 0);
      } else {
        sessionStorage.removeItem("guestXP");
        setTotalXP(0);
      }
    });
    return () => unsub();
  }, []);

  // ── Award XP when returning from a game ──
  const returnFromGame = useCallback(async (gameSlug: string, earnedXP: number = 0) => {
    setActiveGame(null);
    if (earnedXP <= 0) return;

    const currentUser = userRef.current; // use ref — never stale
    if (currentUser) {
      // Logged in — persist to Firestore
      await setDoc(doc(db, "user", currentUser.uid), { xp: increment(earnedXP) }, { merge: true });
      const scoreData = {
        userID: currentUser.uid,
        gameSlug,
        score: earnedXP,
        achievedAt: serverTimestamp(),
      };
      await Promise.all([
        addDoc(collection(db, "gameScore"), scoreData),
        addDoc(collection(db, "user", currentUser.uid, "gameScores"), scoreData),
      ]);
      setTotalXP((x) => x + earnedXP);
    } else {
      // Guest — session only
      setTotalXP((prev) => {
        const next = prev + earnedXP;
        sessionStorage.setItem("guestXP", String(next));
        return next;
      });
    }
  }, []);

  // ── Render active game ──
  if (activeGame && GAME_MAP[activeGame]) {
    const GameComponent = GAME_MAP[activeGame];
    return <GameComponent onHome={(xp?: number) => returnFromGame(activeGame, xp ?? 0)} />;
  }

  // ── Render hub ──
  return (
    <Hub
      totalXP={totalXP}
      onSelectGame={(id: string) => setActiveGame(id)}
      onDashboard={() => router.push("/dashboard")}
      gameMap={GAME_MAP}
      simMap={SIM_MAP}
    />
  );
}