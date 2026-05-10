// ============================================================
// CHARACTER DEFINITIONS
// The 4 Qatari animal mascots, each with a cybersecurity role
// ============================================================

export interface Character {
  name: string;
  emoji: string;
  profile: string | Blob | undefined;  // URL or Blob for the character's image
  role: string;
  roleAr: string;
  desc: string;
  games: string[];  // Game IDs this character is associated with
}

export const CHARS: Record<string, Character> = {
  // Saqr the Falcon — hunts and detects threats
  falcon: {
    name: "Saqr",
    emoji: "🦅",
    profile: "/characters/falcon.jpeg",
    role: "Threat Hunter",
    roleAr: "صائد التهديدات",
    desc: "Detects and tracks threats before they strike",
    games: ["virus", "worm", "hacklab", "phishcraft"],
  },

  // Oryx — plans and builds layered defenses
  oryx: {
    name: "Oryx",
    emoji: "🦌",
    profile: "/characters/oryx.jpeg",
    role: "Security Architect",
    roleAr: "مهندس الأمان",
    desc: "Plans and builds layered defenses",
    games: ["souq", "builder", "inbox", "packets"],
  },

  // Tha'lab the Fox — investigates and analyzes evidence
  fox: {
    name: "Tha'lab",
    emoji: "🦊",
    profile: "/characters/fox.jpeg",
    role: "Investigator",
    roleAr: "المحقق",
    desc: "Analyzes evidence and uncovers hidden clues",
    games: ["evidence", "dm", "detective", "smarttrap"],
  },

  // Hisan the Horse — responds fast to incidents
  horse: {
    name: "Hisan",
    emoji: "🐴",
    profile: "/characters/ArabianHorse.jpeg",
    role: "First Responder",
    roleAr: "المستجيب الأول",
    desc: "Responds fast when incidents happen",
    games: ["ransom", "chatshield", "passforge", "lockkey"],
  },
};
