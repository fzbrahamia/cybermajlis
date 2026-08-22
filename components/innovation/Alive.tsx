"use client";

/* The layer that makes the track feel like one place.

   Before this, every page opened with a label, a heading and a paragraph, in
   gold, with no motion and nobody in it. Five pages built to the same template
   read as five separate websites.

   So: a room colour that drifts behind the content, entrances that arrive in
   sequence rather than all at once, and Hamad and Rouda actually present.
   Motion is the connective tissue, not decoration. */

import { motion, useReducedMotion } from "framer-motion";
import { M, sans, mono, R, T, type Hue } from "./theme";

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ── soft light behind the room ───────────────────────── */

export function Blobs({ hue }: { hue: Hue }) {
  const reduce = useReducedMotion();
  const shapes = [
    { c: hue.mid, size: 420, top: "-6%", start: "-10%", dur: 19 },
    { c: hue.soft, size: 300, top: "38%", start: "82%", dur: 24 },
    { c: M.gold, size: 260, top: "78%", start: "8%", dur: 21 },
  ];
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          animate={reduce ? undefined : { scale: [1, 1.14, 1], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: i * 1.4 }}
          style={{
            position: "absolute", top: s.top, insetInlineStart: s.start,
            width: s.size, height: s.size, borderRadius: "50%",
            background: `radial-gradient(circle, ${s.c}2E, transparent 70%)`,
            filter: "blur(42px)",
          }}
        />
      ))}
    </div>
  );
}

/* ── entrances ────────────────────────────────────────── */

export function Stagger({ children, gap = 0.07 }: { children: React.ReactNode; gap?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function Rise({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE } },
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/** A card that answers the cursor. Small, but it is what makes a page feel awake. */
export function Lift({ children, style, hue }: { children: React.ReactNode; style?: React.CSSProperties; hue?: Hue }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE } },
      }}
      whileHover={reduce ? undefined : {
        y: -5,
        boxShadow: `0 3px 6px rgba(58,44,28,.05), 0 20px 40px ${hue?.tint ?? "rgba(58,44,28,.10)"}`,
        transition: { type: "spring", stiffness: 320, damping: 22 },
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── the two of them, actually present ────────────────── */

const FACE = {
  hamad: "/characters/HamadAvatars/hamad-1.png",
  rouda: "/characters/RoudaAvatars/rouda-1.png",
};

export function Face({ who, size = 40 }: { who: "hamad" | "rouda"; size?: number }) {
  const ring = who === "rouda" ? "#2E9C6E" : "#C5A57E";
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", flex: "none",
      overflow: "hidden", background: M.card,
      border: `2px solid ${ring}`, display: "block",
    }}>
      <img src={FACE[who]} alt="" width={size} height={size}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </span>
  );
}

/** One of them says one thing. Arrives with a small bounce, like a sticker landing. */
export function Says({
  who, children, hue,
}: { who: "hamad" | "rouda"; children: React.ReactNode; hue?: Hue }) {
  const reduce = useReducedMotion();
  const green = who === "rouda";
  const bg = green ? "rgba(46,156,110,.09)" : (hue?.wash ?? "rgba(197,165,126,.09)");
  const edge = green ? "rgba(46,156,110,.26)" : (hue?.tint ?? "rgba(197,165,126,.26)");
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      style={{
        display: "flex", gap: 13, alignItems: "flex-start",
        padding: "14px 17px", borderRadius: R.panel,
        background: bg, border: `1px solid ${edge}`,
      }}
    >
      <Face who={who} size={38} />
      <span style={{ fontSize: 14.5, lineHeight: 1.6, color: M.heading, fontFamily: sans, paddingTop: 4 }}>
        {children}
      </span>
    </motion.div>
  );
}

/* ── a sticker, for finishing something ───────────────── */

const CHEERS_EN = [
  "You changed your own mind. That is the hard one.",
  "You noticed something most people walk past.",
  "That took patience. Not everyone has it.",
  "You said what you were not sure about. Good.",
  "Qatar needs people who look properly. You just did.",
  "You went back and fixed it instead of defending it.",
  "That answer is yours. Nobody gave it to you.",
];
const CHEERS_AR = [
  "غيّرت رأيك بنفسك. وهذا هو الصعب.",
  "لاحظت شيئاً يمرّ عليه معظم الناس.",
  "احتاج هذا صبراً. وليس عند الجميع صبر.",
  "قلت ما لست متأكداً منه. جيد.",
  "قطر تحتاج من ينظر جيداً. وقد فعلت.",
  "عدت وأصلحته بدل أن تدافع عنه.",
  "هذه الإجابة لك. لم يعطك إياها أحد.",
];

/* Hamad's drawn stickers, matched to the occasion rather than sprinkled.
   Filenames carry spaces, so they are encoded here once. */
export const STICKERS = {
  celebrating: "/HamadStickers/Celebrating.png",
  idea:        "/HamadStickers/Got%20an%20Idea.png",
  love:        "/HamadStickers/Love.png",
  respect:     "/HamadStickers/Respect.png",
  thumbsUp:    "/HamadStickers/ThumbsUp.png",
} as const;
export type StickerKind = keyof typeof STICKERS;

/** Which sticker suits which moment. Respect is reserved for changing your mind. */
const FOR_CHEER: StickerKind[] = ["respect", "idea", "thumbsUp", "respect", "love", "respect", "celebrating"];

export function Sticker({
  seed = 0, who = "hamad", isAR = false, line, kind,
}: { seed?: number; who?: "hamad" | "rouda"; isAR?: boolean; line?: string; kind?: StickerKind }) {
  const reduce = useReducedMotion();
  const pool = isAR ? CHEERS_AR : CHEERS_EN;
  const i = seed % pool.length;
  const text = line ?? pool[i];
  const art = STICKERS[kind ?? FOR_CHEER[i]];
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 14,
        padding: "12px 20px 12px 12px", borderRadius: R.card,
        background: M.card, border: `2px solid ${who === "rouda" ? "#5FC79C" : "#E0CBAA"}`,
        boxShadow: "0 3px 0 rgba(0,0,0,.05), 0 16px 34px rgba(58,44,28,.12)",
      }}
    >
      <motion.img
        src={art} alt="" width={72} height={72}
        animate={reduce ? undefined : { rotate: [-2, 2, -2] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: 72, height: 72, objectFit: "contain", display: "block", flex: "none" }}
      />
      <span style={{ fontSize: 14.5, fontWeight: 700, color: M.heading, fontFamily: sans, lineHeight: 1.45, maxWidth: 250 }}>
        {text}
      </span>
    </motion.div>
  );
}

/* ── the room's own heading ───────────────────────────── */

export function RoomHead({
  hue, eyebrow, title, sub,
}: { hue: Hue; eyebrow?: string; title: string; sub?: string }) {
  return (
    <Stagger gap={0.09}>
      {eyebrow && (
        <Rise>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 12,
            fontFamily: mono, fontSize: 10.5, letterSpacing: "0.15em",
            textTransform: "uppercase", color: hue.deep,
          }}>
            <span aria-hidden style={{ width: 22, height: 3, borderRadius: 2, background: hue.mid }} />
            {eyebrow}
          </div>
        </Rise>
      )}
      <Rise>
        <h1 style={{
          margin: "0 0 14px", fontFamily: sans,
          fontSize: T.h1, fontWeight: 900,
          lineHeight: 1.1, letterSpacing: "-0.028em",
          color: M.heading, maxWidth: "20ch", textWrap: "balance",
        }}>
          {title}
        </h1>
      </Rise>
      {sub && (
        <Rise>
          <p style={{
            margin: "0 0 4px", maxWidth: "42ch",
            fontSize: T.lead, lineHeight: 1.62, color: M.body, fontFamily: sans,
          }}>
            {sub}
          </p>
        </Rise>
      )}
    </Stagger>
  );
}

/* A label on hover.

   The browser's own tooltip rather than one we draw: it is positioned by the
   operating system, so it can never be clipped by a card edge the way a
   custom popup was, and it is the same thing a person already knows from
   every other website. */
export function Hint({
  children, say,
}: { children: React.ReactNode; say: string }) {
  return (
    <span
      title={say}
      aria-label={say}
      tabIndex={0}
      style={{ display: "inline-flex", cursor: "help", outline: "none" }}
    >
      {children}
    </span>
  );
}
