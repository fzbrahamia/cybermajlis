// ============================================================
// GAME DEFINITIONS
// Metadata for all 16 cybersecurity games
// Each game has EN/AR names, description, mechanic type,
// difficulty rating, estimated time, and learning objectives
// ============================================================

import { CHARS } from "./characters";

export interface GameDef {
  id: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  desc: string;
  descAr: string;
  mechanic: string;
  char: typeof CHARS[keyof typeof CHARS];
  skills: string[];
}

export interface GameDifficulty {
  stars: number;  // 1-3
  time: string;   // Estimated play time
}

/** All 16 game definitions */
export const GAMES: GameDef[] = [
  // ── BEGINNER-FRIENDLY ──
  {
    id: "souq", name: "Souq Safe", nameAr: "سوق آمن",
    tagline: "Protect your treasures in the marketplace",
    taglineAr: "احمِ كنوزك في السوق",
    desc: "Drag items to the safe chest or the exposed cart. Learn what to protect and what's okay to share.",
    descAr: "اسحب العناصر إلى الصندوق الآمن أو العربة المكشوفة.",
    mechanic: "Drag & Drop", char: CHARS.oryx,
    skills: ["Data Protection", "Privacy"],
  },
  {
    id: "inbox", name: "Inbox Inspector", nameAr: "مفتش البريد",
    tagline: "Real or fake? Your inbox needs you",
    taglineAr: "حقيقي أم مزيف؟ بريدك يحتاجك",
    desc: "Read emails, hover links to reveal hidden URLs, then decide: safe or phishing?",
    descAr: "اقرأ الرسائل، مرّر فوق الروابط، ثم قرر: آمن أم تصيّد؟",
    mechanic: "Tap & Inspect", char: CHARS.oryx,
    skills: ["Phishing Detection", "Critical Thinking"],
  },
  {
    id: "dm", name: "DM Detector", nameAr: "كاشف الرسائل",
    tagline: "Swipe safe or suspicious on every message",
    taglineAr: "اسحب يمين أو يسار لكل رسالة",
    desc: "Direct messages flood your phone. Swipe right if safe, left if suspicious.",
    descAr: "رسائل تغمر هاتفك. اسحب يمين للآمن، يسار للمشبوه!",
    mechanic: "Swipe", char: CHARS.fox,
    skills: ["Social Engineering", "Online Safety"],
  },
  {
    id: "chatshield", name: "Chat Shield", nameAr: "درع المحادثة",
    tagline: "Pick the safest reply in tricky chats",
    taglineAr: "اختر الرد الأكثر أمانًا في المحادثات",
    desc: "You're in a video game lobby or group chat. Pick the safest response every time!",
    descAr: "أنت في لوبي لعبة أو دردشة جماعية. اختر الرد الأكثر أمانًا!",
    mechanic: "Pick Response", char: CHARS.horse,
    skills: ["Safe Communication", "Personal Safety"],
  },

  // ── INTERMEDIATE ──
  {
    id: "virus", name: "Virus Outbreak", nameAr: "تفشي الفيروس",
    tagline: "Contain the infection before it spreads!",
    taglineAr: "احتوِ العدوى قبل أن تنتشر!",
    desc: "Files copy themselves to neighbors. Tap infected files to quarantine them. Levels get harder!",
    descAr: "الملفات تنسخ نفسها! انقر على المصابة لعزلها قبل الانتشار.",
    mechanic: "Tap to Contain", char: CHARS.falcon,
    skills: ["Incident Response", "Malware Awareness"],
  },
  {
    id: "worm", name: "Worm Hunt", nameAr: "صيد الدودة",
    tagline: "Block the worm before it reaches every machine",
    taglineAr: "اصد الدودة قبل أن تصل لكل جهاز",
    desc: "A worm scans the network. Click computers to firewall them before the worm arrives.",
    descAr: "دودة تفحص الشبكة! انقر على الأجهزة لحمايتها.",
    mechanic: "Click to Firewall", char: CHARS.falcon,
    skills: ["Network Defense", "Threat Containment"],
  },
  {
    id: "lockkey", name: "Lock & Key", nameAr: "القفل والمفتاح",
    tagline: "Match the right key to every lock",
    taglineAr: "طابق المفتاح الصحيح لكل قفل",
    desc: "Solve Caesar ciphers, XOR puzzles, reverse ciphers, and substitution codes.",
    descAr: "حل شفرات قيصر وألغاز XOR والشفرات العكسية.",
    mechanic: "Match & Connect", char: CHARS.horse,
    skills: ["Encryption Basics", "Pattern Recognition"],
  },
  {
    id: "evidence", name: "Evidence Trail", nameAr: "أثر الدليل",
    tagline: "Collect clues in the right order",
    taglineAr: "اجمع القرائن بالترتيب الصحيح",
    desc: "A cyber crime happened! Choose which evidence to collect first — volatile disappears!",
    descAr: "وقعت جريمة إلكترونية! اختر أي دليل تجمع أولاً.",
    mechanic: "Binary Choice", char: CHARS.fox,
    skills: ["Digital Forensics", "Evidence Handling"],
  },
  {
    id: "packets", name: "Packet Rush", nameAr: "اندفاع الحُزم",
    tagline: "Good packets in, bad packets out!",
    taglineAr: "الحزم الطيبة تدخل، الخبيثة تُمنع!",
    desc: "Packets stream toward your server. Tap threats, let safe traffic through!",
    descAr: "حزم تتدفق نحو خادمك. انقر على الخبيثة!",
    mechanic: "Tap & Filter", char: CHARS.oryx,
    skills: ["Network Security", "Traffic Analysis"],
  },
  {
    id: "passforge", name: "Password Forge", nameAr: "مصنع كلمات المرور",
    tagline: "Forge unbreakable passwords!",
    taglineAr: "اصنع كلمات مرور لا تُكسر!",
    desc: "Weak passwords arrive. Pick 3 upgrades to strengthen them. See crack time change!",
    descAr: "كلمات مرور ضعيفة تصل. اختر 3 تحسينات لتقويتها!",
    mechanic: "Drag to Upgrade", char: CHARS.horse,
    skills: ["Password Security", "Authentication"],
  },

  // ── ADVANCED ──
  {
    id: "ransom", name: "Ransom Rescue", nameAr: "إنقاذ من الفدية",
    tagline: "Your screen is locked — can you escape?",
    taglineAr: "شاشتك مقفلة — هل تستطيع الهروب؟",
    desc: "Ransomware locks your screen! Make the right decisions to recover without paying.",
    descAr: "فيروس الفدية قفل شاشتك! لا تدفع — اتخذ القرارات الصحيحة.",
    mechanic: "Puzzle & Restore", char: CHARS.horse,
    skills: ["Backup Strategy", "Ransomware Response"],
  },
  {
    id: "builder", name: "Defense Builder", nameAr: "بناء الدفاع",
    tagline: "Build your security wall, layer by layer",
    taglineAr: "ابنِ جدارك الأمني، طبقة بطبقة",
    desc: "Drag defense blocks into your wall, then face threat waves. Defense in depth!",
    descAr: "اسحب قطع الدفاع إلى جدارك الأمني ثم واجه التهديدات.",
    mechanic: "Drag to Build", char: CHARS.oryx,
    skills: ["Defense in Depth", "Security Strategy"],
  },
  {
    id: "hacklab", name: "Hack Lab", nameAr: "مختبر الاختراق",
    tagline: "Think like an attacker to defend better",
    taglineAr: "فكّر كمخترق لتدافع أفضل",
    desc: "Choose the best attack strategy for each target. Learn what defense prevents it!",
    descAr: "اختر أفضل استراتيجية هجوم — فهم المهاجمين يجعلك مدافعًا أفضل!",
    mechanic: "Strategy", char: CHARS.falcon,
    skills: ["Offensive Thinking", "Attack Vectors"],
  },
  {
    id: "phishcraft", name: "Phish Crafter", nameAr: "صانع التصيّد",
    tagline: "Build a phishing email — then learn to spot one",
    taglineAr: "ابنِ رسالة تصيّد — ثم تعلّم كيف تكشفها",
    desc: "Build the most convincing phishing email. Then see a full red-flag breakdown!",
    descAr: "ابنِ أقنع رسالة تصيّد ثم شاهد تحليل العلامات الحمراء!",
    mechanic: "Drag to Build", char: CHARS.falcon,
    skills: ["Social Engineering", "Phishing Anatomy"],
  },
  {
    id: "detective", name: "Digital Detective", nameAr: "المحقق الرقمي",
    tagline: "Search the clues, crack the case",
    taglineAr: "ابحث في القرائن، حل القضية",
    desc: "Investigate breaches! Search logs, metadata, social media. Then solve the case!",
    descAr: "حقق في الاختراقات! ابحث في السجلات ثم حل القضية.",
    mechanic: "Search & Find", char: CHARS.fox,
    skills: ["Digital Forensics", "OSINT"],
  },
  {
    id: "smarttrap", name: "Smart Trap", nameAr: "الفخ الذكي",
    tagline: "Your smart home is watching — are you?",
    taglineAr: "بيتك الذكي يراقب — هل أنت كذلك؟",
    desc: "Move through a smart apartment. Fix IoT vulnerabilities before hackers exploit them!",
    descAr: "تنقل في شقة ذكية. اعثر على كل ثغرة وأصلحها!",
    mechanic: "Explore & Fix", char: CHARS.fox,
    skills: ["IoT Security", "Default Passwords"],
  },
];

/** Difficulty ratings and estimated play times */
export const GAME_DIFF: Record<string, GameDifficulty> = {
  souq: { stars: 1, time: "3-5 min" },
  inbox: { stars: 2, time: "5-8 min" },
  dm: { stars: 1, time: "3-5 min" },
  chatshield: { stars: 1, time: "3-5 min" },
  virus: { stars: 2, time: "2-4 min" },
  worm: { stars: 2, time: "3-5 min" },
  lockkey: { stars: 2, time: "4-6 min" },
  evidence: { stars: 2, time: "3-5 min" },
  packets: { stars: 2, time: "3-5 min" },
  passforge: { stars: 1, time: "3-5 min" },
  ransom: { stars: 1, time: "4-6 min" },
  builder: { stars: 3, time: "5-8 min" },
  hacklab: { stars: 3, time: "4-7 min" },
  phishcraft: { stars: 2, time: "3-5 min" },
  detective: { stars: 3, time: "5-8 min" },
  smarttrap: { stars: 2, time: "4-6 min" },
};

/** What each game teaches — shown on hover */
export const GAME_LEARN: Record<string, string[]> = {
  souq: ["What data is sensitive vs public", "Privacy fundamentals", "Data classification basics"],
  inbox: ["Spot misspelled domains", "Recognize urgency tactics", "Verify sender identity", "Check link destinations"],
  dm: ["Social media scam patterns", "Stranger danger online", "Red flags in messages"],
  chatshield: ["Safe responses in games/chats", "Protecting personal info online", "Recognizing social engineering"],
  virus: ["How viruses self-replicate", "Quarantine as containment", "Speed of incident response"],
  worm: ["Network propagation paths", "Firewall placement strategy", "Anticipating lateral movement"],
  lockkey: ["Caesar cipher mechanics", "XOR binary operations", "Substitution patterns", "How encryption protects data"],
  evidence: ["Volatile vs persistent evidence", "Forensic collection order", "Why RAM must come first"],
  packets: ["Network traffic types", "Malware packet identification", "DDoS flood recognition"],
  passforge: ["Password strength factors", "Brute force crack times", "Passphrase best practices"],
  ransom: ["Never pay ransom", "3-2-1 backup rule", "Incident response steps", "Verify backups before restoring"],
  builder: ["Defense in depth layers", "Cost-benefit of security controls", "Matching defenses to threats"],
  hacklab: ["Attacker mindset & strategies", "Weakest link identification", "Defense from offensive perspective"],
  phishcraft: ["Anatomy of a phishing email", "Typosquatting domains", "Fear-based manipulation"],
  detective: ["Digital breadcrumb analysis", "OSINT from social media", "Insider threat indicators"],
  smarttrap: ["IoT default password risks", "Smart device attack surfaces", "WiFi Direct vulnerabilities"],
};
