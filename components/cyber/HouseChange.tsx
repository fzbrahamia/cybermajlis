"use client";

/* THE HOUSE CHANGING, WATCHED
 *
 * Finishing a concept already altered the house, but only silently: you had to
 * navigate back to the Concepts page and notice the picture was different. The
 * reward existed and nobody saw it happen.
 *
 * So the change is played where the work was done, the moment the quiz is
 * right. The old picture is on screen, light sweeps across it, and the new one
 * settles in behind the sweep. Three seconds, once.
 *
 * The sweep is doing real work, not decoration: a straight cross-fade between
 * two photographs of the same house reads as a glitch, because most of the
 * frame is identical and only one part changes. A light passing over it says
 * something happened here, and the eye follows the light to the part that did.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { C } from "@/components/cyber/shell";

export default function HouseChange({ before, after, en, ar }: {
  before: string;
  after: string;
  /** What is different now, in the house's words, not the lesson's. */
  en: string; ar: string;
}) {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  /* changed flips once the sweep is over the middle of the frame, so the new
     picture is revealed by the light rather than before it. */
  const [changed, setChanged] = useState(reduce);
  const [settled, setSettled] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    const a = setTimeout(() => setChanged(true), 620);
    const b = setTimeout(() => setSettled(true), 1500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [reduce]);

  const shown = changed ? after : before;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 24 }}
      className="cy-panel"
      style={{ overflow: "hidden" }}
    >
      <div className="cy-stripe" style={{ ["--tone" as string]: C.gold }} />

      <div style={{ padding: "1.3rem 1.4rem 1.5rem" }}>
        <div style={{
          fontSize: ".62rem", letterSpacing: ".28em", textTransform: "uppercase",
          color: C.mid, marginBottom: ".8rem", display: "flex", alignItems: "center", gap: 7,
        }}>
          <Sparkles size={13} />
          {isAR ? "تغيّر بيتك" : "Your house changed"}
        </div>

        <div style={{
          position: "relative", aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden",
          border: `3px solid ${C.head}`, background: C.cream,
          boxShadow: `inset 0 0 0 2px ${C.gold}66`,
        }}>
          <AnimatePresence mode="sync">
            <motion.img
              key={shown}
              src={shown}
              alt=""
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? .2 : .8, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AnimatePresence>

          {/* the light that carries the change across the frame */}
          {!reduce && (
            <motion.span
              initial={{ x: "-130%" }}
              animate={{ x: "130%" }}
              transition={{ duration: 1.35, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "absolute", top: "-20%", bottom: "-20%", width: "55%",
                pointerEvents: "none", transform: "skewX(-14deg)",
                background: "linear-gradient(90deg, transparent, rgba(255,246,225,.16) 35%, rgba(255,240,205,.72) 50%, rgba(255,246,225,.16) 65%, transparent)",
                filter: "blur(2px)",
              }}
            />
          )}
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={settled ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            margin: "1rem 0 0", fontSize: "1.02rem", lineHeight: 1.6,
            color: C.head, fontWeight: 700, textAlign: "center",
          }}
        >
          {isAR ? ar : en}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={settled ? { opacity: 1 } : {}}
          transition={{ duration: .5, delay: .15 }}
          style={{ display: "flex", justifyContent: "center", marginTop: ".9rem" }}
        >
          <Link href="/dashboard/concepts" className="cy-back">
            {isAR ? "انظر إلى بيتك" : "Look at your house"}
            {isAR ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
