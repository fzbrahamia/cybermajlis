// ============================================================
// LEADERBOARD DATA
// Generates fake leaderboard with Qatari names
// The "You" entry syncs with actual player XP
// ============================================================

import { rand } from "../utils/helpers";

/** Leaderboard entry */
export interface LBEntry {
  name: string;
  avatar: string;
  xp: number;
  games: number;
  isYou: boolean;
}

// Qatari-style names for the leaderboard
const LB_NAMES = [
  "Noura A.", "Khalid M.", "Sara H.", "Ahmed R.", "Fatima Q.",
  "Omar J.", "Maha S.", "Hamad T.", "Lina K.", "Youssef B.",
  "Dana W.", "Nasser F.", "Reem G.", "Ali Z.", "Hessa N.",
];

// Character profile images for leaderboard entries
const LB_AVATARS = [
  "/characters/falcon.jpeg",
  "/characters/oryx.jpeg",
  "/characters/fox.jpeg",
  "/characters/ArabianHorse.jpeg",
  "/characters/falcon.jpeg",
  "/characters/oryx.jpeg",
  "/characters/fox.jpeg",
  "/characters/ArabianHorse.jpeg",
  "/characters/falcon.jpeg",
  "/characters/oryx.jpeg",
  "/characters/fox.jpeg",
  "/characters/ArabianHorse.jpeg",
  "/characters/falcon.jpeg",
  "/characters/oryx.jpeg",
  "/characters/fox.jpeg",
];

/** Feat descriptions shown next to each player */
export const LB_FEATS = [
  "Survived 5 phishing waves", "Built perfect defense wall",
  "Cracked 8 ciphers", "Contained virus in 10s",
  "Blocked every worm path", "Forged 12 strong passwords",
  "Secured all IoT devices", "Caught 20 scam DMs",
  "Solved 3 forensics cases", "Crafted elite phishing test",
  "Analyzed 50 packets", "Perfect ransomware response",
  "Master social engineer", "Found every digital clue",
  "Shield master",
];

/**
 * Generate leaderboard data
 * @param playerXP - The current player's XP (synced from game scores)
 * @returns Sorted array of leaderboard entries
 */
export function genLB(playerXP: number): LBEntry[] {
  const youIdx = 5; // Fixed position for "You" before sorting

  return LB_NAMES.map((name, i) => ({
    name,
    avatar: LB_AVATARS[i],
    // "You" entry uses actual player XP; others are randomly generated
    xp: i === youIdx ? playerXP : Math.max(8500 - i * rand(400, 650), rand(600, 1400)),
    games: rand(Math.max(5, 40 - i * 3), 45 - i * 2),
    isYou: i === youIdx,
  })).sort((a, b) => b.xp - a.xp); // Sort by XP descending
}
