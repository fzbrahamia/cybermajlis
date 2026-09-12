"use client";

/* HAMAD AND ROUDA, DRAWN
 *
 * Until now they were one circular avatar each, reused everywhere. That works
 * beside a line of text and nowhere else: stretched into a wide box after a
 * video it looks like a mistake, and it cannot show that somebody is listening
 * rather than talking.
 *
 * Two shapes off one set of files:
 *   figure   the 5:6 half-figure, in a rounded cream plate
 *   avatar   the same picture cropped to a circle around the head
 *
 * WHY A PLATE. The pose PNGs have a solid warm background (#ebe0d7), not an
 * alpha channel. Dropped straight onto a panel the rectangle shows, so a
 * figure is always inside a plate whose ground is that same cream. Give one a
 * transparent background and the plate can go.
 *
 * TURN TAKING. `Conversation` below is the point of the whole file: when one
 * of them is speaking the other is listening, and both change on the same
 * beat. Nobody stares blankly while the other talks.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { useReveal } from "@/components/cyber/shell";

export type Who = "hamad" | "rouda";

/** Exactly what is on disk. See public/poses/README.txt. */
const POSES = {
  hamad: ["agreeing", "asking", "curious", "explaining", "listening",
          "monitoring", "reading", "talking", "thinking", "thumbs-up"] as const,
  rouda: ["asking", "curious", "excited", "explaining", "listening",
          "looking-aside", "pointing", "satisfied", "scared", "smiling",
          "talking", "thinking", "thumbs-up"] as const,
};

export type Pose = (typeof POSES)["hamad"][number] | (typeof POSES)["rouda"][number];

/* The set is not symmetric. Rather than 404, a pose one of them does not have
   walks down to the nearest thing they do: Hamad has no "excited", so he gets
   "agreeing"; Rouda has no "reading", so she gets "thinking". */
const NEAREST: Partial<Record<Pose, Pose[]>> = {
  excited: ["thumbs-up", "agreeing", "talking"],
  smiling: ["satisfied", "agreeing", "listening"],
  satisfied: ["agreeing", "thumbs-up", "listening"],
  scared: ["curious", "thinking"],
  pointing: ["explaining", "talking"],
  "looking-aside": ["curious", "listening"],
  reading: ["thinking", "listening"],
  monitoring: ["reading", "thinking", "listening"],
  agreeing: ["satisfied", "thumbs-up", "listening"],
};

function poseSrc(who: Who, pose: Pose): string {
  const has = POSES[who] as readonly string[];
  if (has.includes(pose)) return `/poses/${who}/${pose}.png`;
  for (const alt of NEAREST[pose] ?? []) {
    if (has.includes(alt)) return `/poses/${who}/${alt}.png`;
  }
  return `/poses/${who}/talking.png`;
}

const NAME = {
  hamad: { en: "Hamad", ar: "حمد" },
  rouda: { en: "Rouda", ar: "روضة" },
} as const;

/* A circle 34px across cannot show a half-figure: crop it to the head and the
   face is a smudge. The avatar art is drawn for exactly this size, so the
   avatar shape uses it and only the figure shape uses the poses. */
const AVATAR = {
  hamad: "/characters/HamadAvatars/hamad-1.png",
  rouda: "/characters/RoudaAvatars/rouda-1.png",
} as const;

const RING = { hamad: "#c5a57e", rouda: "#5B7C5C" } as const;

/* Maroon on maroon is invisible: the dark stage needs its own pair. */
const NAME_TINT = {
  light: { hamad: "#8B2635", rouda: "#5B7C5C" },
  dark:  { hamad: "rgba(211,179,135,.85)", rouda: "#8FBFA3" },
} as const;
const GROUND = "#EBE0D7"; // the pose files' own background, so the plate is seamless

export default function Character({
  who, pose = "talking", shape = "figure", width = 150, dim, label, tone = "light", style,
}: {
  who: Who;
  pose?: Pose;
  shape?: "figure" | "avatar";
  /** A name label has to be legible on whatever it is sitting on. */
  tone?: "light" | "dark";
  /** Figure: plate width in px. Avatar: diameter. */
  width?: number;
  /** The one who is not speaking sits back a little. */
  dim?: boolean;
  /** Name under a figure. Off by default; a talking figure rarely needs it. */
  label?: boolean;
  style?: React.CSSProperties;
}) {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  const src = shape === "avatar" ? AVATAR[who] : poseSrc(who, pose);

  const frame: React.CSSProperties = shape === "avatar"
    ? { width, height: width, borderRadius: "50%", border: `2px solid ${RING[who]}`,
        background: "#FDFBF6" }
    : { width, aspectRatio: "5 / 6", borderRadius: 18, border: `1px solid rgba(99,32,36,.14)` };

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6, ...style }}>
      <motion.span
        animate={reduce ? {} : { opacity: dim ? 0.62 : 1, scale: dim ? 0.965 : 1 }}
        transition={{ type: "spring", stiffness: 210, damping: 26 }}
        style={{
          ...frame, position: "relative", overflow: "hidden", display: "block",
          flex: "none", background: GROUND,
          boxShadow: shape === "figure" ? "0 8px 26px rgba(99,32,36,.10)" : "none",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={src}
            src={src}
            alt=""
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              /* The files are not one size. cover with the crop pinned to the
                 top keeps the head in frame whatever the aspect. */
              objectFit: shape === "avatar" ? "contain" : "cover",
              objectPosition: "50% 8%",
            }}
          />
        </AnimatePresence>
      </motion.span>

      {label && (
        <span style={{
          fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase",
          fontWeight: 700, color: NAME_TINT[tone][who],
        }}>
          {NAME[who][isAR ? "ar" : "en"]}
        </span>
      )}
    </span>
  );
}

/* ── the two of them, taking turns ─────────────────────────── */

export type Turn = { who: Who; pose?: Pose; en: string; ar: string };

/** Plays a short exchange: each line in sequence, both figures reacting.
 *  `step` drives it from outside when the parent already has a cursor
 *  (the Why You stage); left alone it advances itself on a timer. */
export function Conversation({
  turns, width = 150, auto = true, step, onDone, tone = "light", layout = "row", style,
}: {
  turns: Turn[];
  width?: number;
  /** Advance on a timer. Off when the parent supplies `step`. */
  auto?: boolean;
  step?: number;
  onDone?: () => void;
  /** The Why You stage is a lit dark panel; everywhere else is cream paper. */
  tone?: "light" | "dark";
  /** "row" stands them either side of the line. "rail" stacks them in a
      column with the line beside them, for a side panel. */
  layout?: "row" | "rail";
  style?: React.CSSProperties;
}) {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  /* The clock starts when the exchange is on screen, not when the page mounts.
     Otherwise a conversation near the foot of a case has already played itself
     out by the time anybody scrolls down to it. useReveal rather than useInView
     so an exchange the reader has scrolled past still runs. */
  const [box, seen] = useReveal<HTMLDivElement>();
  const [i, setI] = useState(0);
  const at = step ?? i;
  const turn = turns[Math.min(at, turns.length - 1)];

  useEffect(() => { setI(0); }, [turns]);

  useEffect(() => {
    if (!auto || step !== undefined || turns.length < 2 || !seen) return;
    if (i >= turns.length - 1) { onDone?.(); return; }
    /* Long enough to read the line, not so long that it stalls. */
    const words = (isAR ? turns[i].ar : turns[i].en).split(/\s+/).length;
    const t = setTimeout(() => setI(n => n + 1), Math.min(7000, 1900 + words * 190));
    return () => clearTimeout(t);
  }, [i, auto, step, turns, isAR, onDone, seen]);

  if (!turn) return null;

  /* Whoever is not speaking is listening. This is the whole idea. */
  const poseFor = (who: Who): Pose =>
    who === turn.who ? (turn.pose ?? "talking") : "listening";

  const bubble = (
      <motion.div
        key={`${turn.who}-${at}`}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          flex: 1, minWidth: 0, maxWidth: "46ch",
          background: tone === "dark" ? "rgba(247,236,221,.06)" : "rgba(253,251,246,.9)",
          border: `1px solid ${tone === "dark" ? "rgba(211,179,135,.24)" : "rgba(99,32,36,.14)"}`,
          borderRadius: 16, padding: "1rem 1.15rem",
          boxShadow: tone === "dark" ? "none" : "0 6px 22px rgba(99,32,36,.07)",
        }}
      >
        <span style={{
          display: "block", fontSize: ".57rem", letterSpacing: ".24em",
          textTransform: "uppercase", fontWeight: 700, marginBottom: ".3rem",
          color: turn.who === "rouda"
            ? (tone === "dark" ? "#8FBFA3" : "#5B7C5C")
            : (tone === "dark" ? "rgba(211,179,135,.85)" : "#8B2635"),
        }}>
          {NAME[turn.who][isAR ? "ar" : "en"]}
        </span>
        <span style={{ display: "block", fontSize: ".99rem", lineHeight: 1.66,
          color: tone === "dark" ? "#F7ECDD" : "#6a4640", fontWeight: 300 }}>
          {isAR ? turn.ar : turn.en}
        </span>
      </motion.div>

  );

  const hamad = <Character who="hamad" pose={poseFor("hamad")} width={width}
    dim={turn.who !== "hamad"} label tone={tone} />;
  const rouda = <Character who="rouda" pose={poseFor("rouda")} width={width}
    dim={turn.who !== "rouda"} label tone={tone} />;

  /* A rail puts both of them in one column with the line beside it, so the
     speaker is next to their own words instead of underneath them. */
  if (layout === "rail") {
    return (
      <div ref={box} style={{ display: "flex", gap: "clamp(.8rem, 1.8vw, 1.4rem)", alignItems: "center", ...style }}>
        <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", flex: "none" }}>
          {hamad}{rouda}
        </div>
        {bubble}
      </div>
    );
  }

  return (
    <div ref={box} style={{
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      gap: "clamp(.7rem, 2vw, 1.6rem)", ...style,
    }}>
      {hamad}{bubble}{rouda}
    </div>
  );
}
