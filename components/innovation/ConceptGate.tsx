"use client";

/* THE GATE
 *
 * The only question on the whole platform that has a right answer.
 *
 * Everywhere else, Rouda marks whether somebody thought. Here we are marking
 * whether they can hold the idea, because a case read without its concepts
 * teaches the wrong lesson: a fundamental constraint gets read as somebody's
 * design failure. So the case does not open until this is passed.
 *
 * Reading and watching are both optional. Anyone who already knows this can
 * answer and walk straight through, which is the point: a child who learned
 * firewalls somewhere else should not have to sit through ours.
 *
 * A wrong answer costs nothing but another go. There is no score anywhere. */

import { useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import type { MCQ } from "@/app/lib/conceptData";
import { markDone } from "@/app/lib/conceptProgress";
import { Face } from "./Alive";
import { M, sans, R, HUES, ROUDA, label } from "./theme";

export default function ConceptGate({
  id, mcq, done, onDone,
}: { id: string; mcq: MCQ; done: boolean; onDone: () => void }) {
  const isAR = useLocale() === "ar";
  const [picked, setPicked] = useState<number | null>(null);
  const right = picked !== null && picked === mcq.right;

  const choose = (i: number) => {
    setPicked(i);
    if (i === mcq.right) { markDone(id); onDone(); }
  };

  const options = isAR ? mcq.options_ar : mcq.options_en;

  return (
    <div style={{
      padding: "26px 28px", borderRadius: R.card,
      background: done || right ? "rgba(46,156,110,.09)" : M.card,
      border: `2px solid ${done || right ? "rgba(46,156,110,.34)" : "rgba(42,35,28,.10)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <Face who="rouda" size={36} />
        <span style={{ ...label, color: ROUDA.deep }}>
          {done && picked === null
            ? (isAR ? "أنهيتها" : "You finished this one")
            : (isAR ? "سؤال واحد" : "One question")}
        </span>
      </div>

      <p style={{
        margin: "0 0 16px", fontSize: 17.5, fontWeight: 700, lineHeight: 1.5,
        color: M.heading, maxWidth: "38ch", fontFamily: sans,
      }}>
        {isAR ? mcq.q_ar : mcq.q_en}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {options.map((opt, i) => {
          const on = picked === i;
          const good = on && i === mcq.right;
          const bad = on && i !== mcq.right;
          return (
            <button key={i} onClick={() => choose(i)} disabled={right}
              style={{
                font: "inherit", fontFamily: sans, fontSize: 15.5, fontWeight: 700,
                textAlign: "start", cursor: right ? "default" : "pointer",
                padding: "15px 18px", borderRadius: R.panel,
                display: "flex", alignItems: "center", gap: 11,
                background: good ? "rgba(46,156,110,.16)" : bad ? "rgba(168,50,63,.07)" : M.page,
                color: M.heading,
                border: `2px solid ${good ? HUES.green.mid : bad ? "rgba(168,50,63,.34)" : "rgba(42,35,28,.12)"}`,
                transition: "background .18s, border-color .18s",
              }}>
              <span aria-hidden style={{
                width: 22, height: 22, borderRadius: "50%", flex: "none",
                display: "grid", placeItems: "center",
                background: good ? HUES.green.deep : "transparent",
                border: good ? "none" : `2px solid rgba(42,35,28,.18)`,
                color: "#FFFDF8",
              }}>
                {good && <Check size={13} strokeWidth={3.5} />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {picked !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginTop: 16 }}>
            {right ? (
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: M.heading, maxWidth: "44ch" }}>
                {isAR ? mcq.why_ar : mcq.why_en}
              </p>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, lineHeight: 1.6, color: M.body }}>
                  {isAR
                    ? "ليست هذه. اقرأ اللوحة مرة أخرى وجرّب."
                    : "Not that one. Read the board again and have another go."}
                </span>
                <button onClick={() => setPicked(null)} style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  font: "inherit", fontFamily: sans, fontSize: 14, fontWeight: 800,
                  cursor: "pointer", padding: "9px 15px", borderRadius: 999,
                  background: "transparent", color: ROUDA.deep,
                  border: `2px solid ${HUES.green.soft}`,
                }}>
                  <RotateCcw size={14} />{isAR ? "مرة أخرى" : "Again"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
