"use client";

/* Where a film goes.

   Every one of these is a place the track was written to have a film and does
   not yet. It says what the film has to do, so whoever makes it knows the job
   rather than guessing from the surrounding text. */

import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { Play, Film } from "lucide-react";
import { M, sans, mono, R, HUES, type Hue } from "./theme";

export default function VideoSlot({
  hue = HUES.gold, minutes = 2, brief_en, brief_ar, ready,
}: {
  hue?: Hue;
  minutes?: number;
  /** What this film has to achieve. Written for whoever produces it. */
  brief_en: string;
  brief_ar: string;
  /** Once a real file exists, pass its path and the placeholder gives way. */
  ready?: string;
}) {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();

  if (ready) {
    return (
      <video controls playsInline src={ready} style={{
        width: "100%", borderRadius: R.card, display: "block",
        background: "#000", aspectRatio: "16 / 9",
      }} />
    );
  }

  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "16 / 9",
      borderRadius: R.card, overflow: "hidden",
      background: `linear-gradient(150deg, ${hue.wash}, ${hue.tint})`,
      border: `2px dashed ${hue.tint}`,
      display: "grid", placeItems: "center", padding: "clamp(18px,3vw,32px)",
    }}>
      <div style={{ textAlign: "center", maxWidth: "34ch" }}>
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
            background: M.card, border: `2px solid ${hue.soft}`,
            display: "grid", placeItems: "center",
          }}
        >
          <Play size={24} color={hue.deep} fill={hue.deep} />
        </motion.div>

        <div style={{
          fontSize: "clamp(15px,2.1vw,17px)", fontWeight: 800, color: M.heading,
          lineHeight: 1.5, fontFamily: sans, marginBottom: 10,
        }}>
          {isAR ? brief_ar : brief_en}
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontFamily: mono, fontSize: 10.5, letterSpacing: "0.13em",
          textTransform: "uppercase", color: hue.deep,
          background: M.card, borderRadius: R.pill, padding: "6px 13px",
        }}>
          <Film size={12} />
          {isAR ? `فيلم · ${minutes} دقيقة` : `Film · ${minutes} min`}
        </div>
      </div>
    </div>
  );
}
