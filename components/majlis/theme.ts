/* Majlis brand tokens.
   Majlis is the company. It has no colour of its own: it wears all three
   of its majalis at once, held together with gold. Light surfaces only. */

/* Cinzel is the wordmark and nothing else.

   It is inscriptional Roman capitals: right for a name carved on a building,
   wrong for a ten year old reading a sentence. The quantum theme settled this
   already, and the landing kept using it everywhere. Now the logo keeps its
   formality and every readable word is Nunito, which is what the rest of the
   platform uses. */
export const cinzel  = '"Cinzel", "Trajan Pro", Georgia, serif';
export const nunito  = 'var(--font-nunito), "Nunito", ui-rounded, system-ui, sans-serif';
export const crimson = nunito;
export const mono    = '"Geist Mono", "JetBrains Mono", Menlo, monospace';

/** The wordmark only. Arabic has no Cinzel, so it falls back to the brand Naskh. */
export const wordmark = (isAR: boolean) => (isAR ? "var(--font-arabic), serif" : cinzel);

/** Everything a person actually reads. */
export const display = (isAR: boolean) => (isAR ? "var(--font-arabic), sans-serif" : nunito);

export const M = {
  /** One surface for the whole page. Sections are never separated by colour. */
  page: "#FCF6EA",
  /** Cards and panels lift very slightly off the page. */
  card: "#FFFDF8",
  heading: "#2A231C",
  body: "#6E6357",
  line: "rgba(42,35,28,.12)",
  gold: "#C5A57E",
  goldDeep: "#A8804A",
  goldSoft: "rgba(197,165,126,.16)",
  /** The single colour every button on this page uses. */
  action: "#8F6A38",
  cream: "#FFFDF8",
};

export const EASE = [0.22, 1, 0.36, 1] as const;
/** Slower and longer than EASE. Used for the big reveals so they feel considered. */
export const EASE_SLOW = [0.16, 1, 0.3, 1] as const;
export const SPRING = { type: "spring" as const, stiffness: 220, damping: 20, mass: 0.9 };

export const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.06 } },
};
export const item = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_SLOW } },
};

/* ── depth ────────────────────────────────────────────────
   Layered rather than a single blur: a tight contact shadow, a mid
   spread, then a wide ambient one. Plus an inset highlight along the
   top edge so a card catches light like a real surface would. */
export const SHADOW = {
  rest: [
    "inset 0 1px 0 rgba(255,255,255,.9)",
    "0 1px 2px rgba(58,44,28,.04)",
    "0 8px 20px rgba(58,44,28,.05)",
    "0 24px 48px rgba(58,44,28,.04)",
  ].join(", "),
  lift: [
    "inset 0 1px 0 rgba(255,255,255,.9)",
    "0 2px 4px rgba(58,44,28,.05)",
    "0 16px 34px rgba(58,44,28,.08)",
    "0 40px 72px rgba(58,44,28,.06)",
  ].join(", "),
  button: "0 1px 2px rgba(58,44,28,.12), 0 10px 24px rgba(58,44,28,.16)",
};

export const RADIUS = { card: 26, panel: 22, pill: 999, chip: 14 };

/* Paper grain. Sits over the flat background at very low opacity so the
   surface reads as stock rather than as a filled rectangle. */
export const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")";

/* The three majalis. Names are written closed up, matching CyberMajlis. */
export type BranchId = "cyber" | "ai" | "quantum";

export type Branch = {
  id: BranchId;
  /** Straight into the majlis itself. Null while it is still being built. */
  enter: string | null;
  live: boolean;
  name_en: string; name_ar: string;
  /** two tone wordmark: plain half, then the coloured half */
  word: [string, string];
  line_en: string; line_ar: string;
  deep: string; mid: string; soft: string; tint: string;
};

export const BRANCHES: Branch[] = [
  {
    id: "cyber",
    enter: "/cybermajlis",
    live: true,
    name_en: "CyberMajlis", name_ar: "المجلس السيبراني",
    word: ["Cyber", "Majlis"],
    line_en: "Break things safely, then learn to defend them.",
    line_ar: "اكسر الأشياء بأمان، ثم تعلّم كيف تحميها.",
    deep: "#7A1E22", mid: "#A8323F", soft: "#C9525F", tint: "rgba(168,50,63,.10)",
  },
  {
    id: "ai",
    enter: null,
    live: false,
    name_en: "MajlisAI", name_ar: "مجلس الذكاء الاصطناعي",
    word: ["Majlis", "AI"],
    line_en: "Raise your own machine, one rule at a time.",
    line_ar: "ربِّ آلتك الخاصة، قاعدة تلو الأخرى.",
    deep: "#2B4E86", mid: "#3D6FB5", soft: "#7099D6", tint: "rgba(61,111,181,.10)",
  },
  {
    id: "quantum",
    enter: "/quantum",
    live: true,
    name_en: "QuantumMajlis", name_ar: "مجلس الكم",
    word: ["Quantum", "Majlis"],
    line_en: "The strangest science, told as a story.",
    line_ar: "أغرب العلوم، مرويًّا كقصّة.",
    deep: "#1B6B4C", mid: "#2E9C6E", soft: "#5FC79C", tint: "rgba(46,156,110,.10)",
  },
];

/* Accessibility modes. On the Majlis page these sit in the header; everywhere
   else in the site they stay in the footer.
   Both are held at "soon" here until the new look is agreed with partners.
   The live routes /calm and /elder still work, they are just not offered yet. */
export const MODES = [
  {
    href: "/calm",
    live: false,
    en: "Calm Mode", ar: "الوضع الهادئ",
    desc_en: "Soft colours, a gentle pace, nothing moving on the screen.",
    desc_ar: "ألوان ناعمة وإيقاع لطيف، ولا شيء يتحرّك على الشاشة.",
    dot: "#5D66AD",
  },
  {
    href: "/elder",
    live: false,
    en: "Seniors Mode", ar: "وضع كبار السن",
    desc_en: "Bigger text, read aloud, one simple thing at a time.",
    desc_ar: "نص أكبر وقراءة صوتية، وشيء واحد بسيط في كل مرة.",
    dot: "#A8804A",
  },
];
