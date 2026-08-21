"use client";

/* The investigation board.

   A child should be able to tell what this is before reading a word of it:
   scraps of paper pinned to a warm board, tilted the way pinned paper tilts,
   with red thread running between the ones that connect. Light, because the
   rest of Majlis is light, but unmistakably a board and not a list of cards. */

import { motion, useReducedMotion } from "framer-motion";
import { M, sans, mono, R } from "./theme";

const CORK = [
  "radial-gradient(circle at 20% 30%, rgba(168,128,74,.10) 0 2px, transparent 3px)",
  "radial-gradient(circle at 70% 60%, rgba(168,128,74,.08) 0 2px, transparent 3px)",
  "radial-gradient(circle at 45% 85%, rgba(168,128,74,.07) 0 1.5px, transparent 3px)",
  "linear-gradient(160deg, #F2E4CB 0%, #EBD9BB 100%)",
].join(", ");

const THREAD = "#A8323F";

export function BoardSurface({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative",
      background: CORK,
      backgroundSize: "44px 44px, 62px 62px, 38px 38px, 100% 100%",
      borderRadius: R.card,
      border: "8px solid #8A6A42",
      boxShadow: "inset 0 2px 14px rgba(90,66,34,.22), 0 14px 34px rgba(58,44,28,.16)",
      padding: "clamp(20px, 3.4vw, 34px)",
    }}>
      {children}
    </div>
  );
}

export function Pinned({
  tag, head, body, turn, i = 0, onOpen, hidden,
}: {
  tag: string; head: string; body: string;
  /** The card the board is built to deliver. */
  turn?: boolean;
  i?: number;
  onOpen?: () => void;
  hidden?: boolean;
}) {
  const reduce = useReducedMotion();
  const tilt = (i % 2 ? 1 : -1) * (0.8 + (i % 3) * 0.5);

  if (hidden) {
    return (
      <motion.button
        onClick={onOpen}
        whileHover={reduce ? undefined : { scale: 1.03, rotate: 0 }}
        style={{
          position: "relative", cursor: "pointer", border: "none", textAlign: "start",
          transform: `rotate(${tilt}deg)`,
          background: "rgba(255,253,248,.5)",
          borderRadius: 6, padding: "34px 20px", minHeight: 150,
          boxShadow: "0 2px 5px rgba(90,66,34,.2)",
          display: "grid", placeItems: "center", fontFamily: sans,
          fontSize: 13, fontWeight: 800, color: "rgba(90,66,34,.55)",
        }}
      >
        <Pin turn={false} />
        ?
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.9, rotate: tilt - 5, y: -12 }}
      animate={{ opacity: 1, scale: 1, rotate: tilt, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      whileHover={reduce ? undefined : { rotate: 0, scale: 1.02, zIndex: 2 }}
      style={{
        position: "relative",
        background: turn ? "#FFF8E6" : "#FFFDF8",
        borderRadius: 4,
        padding: "30px 20px 20px",
        boxShadow: turn
          ? "0 3px 8px rgba(90,66,34,.26), 0 0 0 2px rgba(168,50,63,.35)"
          : "0 3px 8px rgba(90,66,34,.24)",
      }}
    >
      <Pin turn={!!turn} />
      <div style={{
        fontFamily: mono, fontSize: 9.5, letterSpacing: "0.15em",
        textTransform: "uppercase", color: turn ? THREAD : "rgba(90,66,34,.62)",
        marginBottom: 8,
      }}>
        {tag}
      </div>
      <div style={{
        fontSize: 15, fontWeight: 800, color: M.heading,
        lineHeight: 1.38, marginBottom: 7, fontFamily: sans,
      }}>
        {head}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: M.body, fontFamily: sans }}>
        {body}
      </div>
    </motion.div>
  );
}

function Pin({ turn }: { turn: boolean }) {
  return (
    <span aria-hidden style={{
      position: "absolute", top: 10, insetInlineStart: "50%",
      transform: "translateX(-50%)",
      width: 14, height: 14, borderRadius: "50%",
      background: turn
        ? `radial-gradient(circle at 35% 30%, #D9707B, ${THREAD})`
        : "radial-gradient(circle at 35% 30%, #E4C79B, #A8804A)",
      boxShadow: "0 2px 3px rgba(90,66,34,.4)",
      display: "block",
    }} />
  );
}

/** Red thread, drawn once every card is out. */
export function Thread({ show }: { show: boolean }) {
  const reduce = useReducedMotion();
  if (!show) return null;
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 1, opacity: 0.5,
    }}>
      <motion.path
        d="M14 24 L52 40 L86 26 M52 40 L30 74 M52 40 L82 70"
        fill="none" stroke={THREAD} strokeWidth="0.4" strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
        vectorEffect="non-scaling-stroke"
        style={{ strokeWidth: 1.5 }}
      />
    </svg>
  );
}
