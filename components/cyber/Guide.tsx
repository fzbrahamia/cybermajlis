"use client";

/* HAMAD AND ROUDA, ON THE PAGE
 *
 * They already exist in two places: the floating Ask Hamad widget, and the Why
 * You stage where they narrate a run of beats. Everywhere else the site talks
 * to the learner in the voice of a museum label, which is a different site.
 *
 * This is the small version: one or two lines in their voice, at the point on
 * the page where a person would actually have the question. It is deliberately
 * NOT a card. A card competes with the content; this sits beside it like
 * somebody leaning over and saying one thing.
 *
 * Three shapes, and the difference matters:
 *   note   one of them says one thing
 *   duo    the two of them, because a second voice can disagree or add
 *   ask    a question put TO the learner, with no answer underneath it
 *
 * Rouda asks and reframes. Hamad explains and reassures. Keep them in
 * character: if the line is a fact about how the page works, it is Hamad's.
 */

import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { C, useReveal } from "@/components/cyber/shell";
import Character, { type Pose } from "@/components/cyber/Character";

const NAME = {
  hamad: { en: "Hamad", ar: "حمد" },
  rouda: { en: "Rouda", ar: "روضة" },
} as const;

export type Who = "hamad" | "rouda";
/** A pose can be named per line. Left out, the speaker talks. */
export type Line = { who: Who; pose?: Pose; en: string; ar: string };

function Said({ line, isAR, delay }: { line: Line; isAR: boolean; delay: number }) {
  const reduce = useReducedMotion();
  const [ref, shown] = useReveal<HTMLDivElement>();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={shown || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: .45, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "flex", gap: ".8rem", alignItems: "flex-start" }}
    >
      <Character who={line.who} pose={line.pose ?? "talking"} shape="avatar" width={40} />
      <span style={{ minWidth: 0, paddingTop: 1 }}>
        <span style={{
          display: "block", fontSize: ".58rem", letterSpacing: ".24em",
          textTransform: "uppercase", fontWeight: 700, marginBottom: ".2rem",
          color: line.who === "rouda" ? "#5B7C5C" : C.mid,
        }}>
          {NAME[line.who][isAR ? "ar" : "en"]}
        </span>
        <span style={{
          display: "block", fontSize: ".97rem", lineHeight: 1.68,
          color: C.body, fontWeight: 300, maxWidth: "70ch",
        }}>
          {isAR ? line.ar : line.en}
        </span>
      </span>
    </motion.div>
  );
}

export default function Guide({ lines, ask, style }: {
  /** One line for a note, two for an exchange. */
  lines: Line[];
  /** A question put to the learner. Drawn heavier, and never answered here. */
  ask?: { who: Who; en: string; ar: string };
  style?: React.CSSProperties;
}) {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  const [askRef, askShown] = useReveal<HTMLDivElement>();

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: ".9rem",
      padding: "1.15rem 1.3rem",
      borderRadius: 16,
      background: "rgba(197,165,126,.09)",
      [isAR ? "borderRight" : "borderLeft"]: `3px solid ${C.gold}`,
      ...style,
    } as React.CSSProperties}>
      {lines.map((l, i) => <Said key={i} line={l} isAR={isAR} delay={i * .12} />)}

      {ask && (
        <motion.div
          ref={askRef}
          initial={reduce ? false : { opacity: 0 }}
          animate={askShown || reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: .5, delay: lines.length * .12 + .1 }}
          style={{
            display: "flex", gap: ".8rem", alignItems: "flex-start",
            paddingTop: ".9rem", borderTop: `1px solid ${C.line}`,
          }}
        >
          <Character who={ask.who} pose="asking" shape="avatar" width={34} />
          <span style={{ minWidth: 0 }}>
            <span style={{
              display: "block", fontSize: ".57rem", letterSpacing: ".24em",
              textTransform: "uppercase", color: C.mid, marginBottom: ".25rem",
            }}>
              {isAR ? "سؤال لك" : "A question for you"}
            </span>
            <span style={{
              display: "block", fontSize: "1.02rem", lineHeight: 1.6,
              color: C.head, fontWeight: 600, maxWidth: "62ch",
            }}>
              {isAR ? ask.ar : ask.en}
            </span>
          </span>
        </motion.div>
      )}
    </div>
  );
}
