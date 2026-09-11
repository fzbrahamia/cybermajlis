"use client";

/* THE HOUSE
 *
 * One photograph of a house, and a transparent layer for every concept. Finish
 * a lesson and its layer fades in on top: the firewall lesson puts a gate in
 * front of the wall, the zero day lesson fills the holes in it.
 *
 * Layers rather than a sequence of whole scenes, because a child should be able
 * to learn these in whatever order they like. Nothing here waits on anything
 * else, and nothing has to be dragged: you finish a lesson and the house is
 * different when you come back. That is the whole reward. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { C } from "@/components/cyber/shell";
import { conceptBySlug } from "@/app/lib/cyberData";
import { readDone } from "@/app/lib/conceptProgress";

/** One layer per concept. `src` sits on top of the base, transparent around it. */
const LAYERS = [
  {
    needs: "firewall",
    src: "/house/gate.png",
    en: "The gate", ar: "البوابة",
    does_en: "A guard on the way in, deciding what passes.",
    does_ar: "حارس على المدخل، يقرر ما الذي يعبر.",
  },
  {
    needs: "zero-day",
    src: "/house/patched.png",
    en: "Patched walls", ar: "جدران مُرقّعة",
    does_en: "The holes nobody had filled in, filled in.",
    does_ar: "الثقوب التي لم يسدّها أحد، سُدّت.",
  },
] as const;

export default function SecureHouse() {
  const isAR = useLocale() === "ar";
  const [done, setDone] = useState<Record<string, unknown>>({});
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState<Record<string, boolean>>({});

  useEffect(() => { setDone(readDone()); setReady(true); }, []);

  const has = (id: string) => Boolean(done[`cm-${id}`]);
  const on = LAYERS.filter(l => has(l.needs));
  const all = on.length === LAYERS.length;

  return (
    <div className="cy-panel" style={{ overflow: "hidden" }}>
      <div className="cy-stripe" style={{ ["--tone" as string]: C.maroon }} />

      <div style={{
        padding: "1.1rem 1.6rem .9rem", display: "flex",
        justifyContent: "space-between", alignItems: "baseline", gap: ".8rem", flexWrap: "wrap",
      }}>
        <span style={{ fontSize: ".62rem", letterSpacing: ".28em", textTransform: "uppercase", color: C.mid }}>
          {isAR ? "بيتك" : "Your house"}
        </span>
        <span style={{ fontSize: ".8rem", fontWeight: 700, color: all ? C.maroon : C.head }}>
          {all ? (isAR ? "كل شيء في مكانه" : "Everything in place") : `${on.length} / ${LAYERS.length}`}
        </span>
      </div>

      {/* ── the house, and whatever has been earned on top of it ── */}
      <div className="hs-body">
        <div style={{
          position: "relative", aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden",
          border: `4px solid ${C.head}`,
          boxShadow: `inset 0 0 0 2px ${C.gold}88, 0 8px 24px rgba(62,19,22,.25)`,
          background: "#E3DAC9",
        }}>
          <img src="/house/base.jpg" alt=""
            onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

          <AnimatePresence>
            {ready && LAYERS.map(l => has(l.needs) && !gone[l.needs] && (
              <motion.img
                key={l.needs}
                src={l.src}
                alt=""
                onError={() => setGone(g => ({ ...g, [l.needs]: true }))}
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", pointerEvents: "none",
                }}
              />
            ))}
          </AnimatePresence>

          {ready && all && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .6, duration: .6 }}
              style={{
                position: "absolute", insetInline: 0, bottom: 0,
                padding: "1.6rem 1.2rem .9rem", textAlign: "center",
                background: "linear-gradient(transparent, rgba(44,16,17,.72))",
              }}>
              <ShieldCheck size={22} color="#fff" />
              <p style={{
                margin: ".25rem 0 0", color: "#fff", fontWeight: 700, fontSize: ".92rem",
                textShadow: "0 1px 6px rgba(0,0,0,.85)",
              }}>
                {isAR ? "أمّنت بيتك." : "You secured your own house."}
              </p>
            </motion.div>
          )}
        </div>

      {/* ── what is on, and what opens the rest ── */}
      <div className="hs-rows">
        {LAYERS.map(l => {
          const lit = has(l.needs);
          const c = conceptBySlug(l.needs);
          const body = (
            <div style={{
              display: "flex", alignItems: "center", gap: ".8rem",
              padding: ".85rem 1rem", borderRadius: 13, height: "100%",
              background: lit ? "rgba(197,165,126,.22)" : "rgba(255,255,255,.55)",
              border: `1px solid ${lit ? C.gold : C.line}`,
              opacity: lit ? 1 : .72,
              transition: "background .4s, border-color .4s, opacity .4s",
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: "50%", flex: "none",
                display: "grid", placeItems: "center",
                background: lit ? C.maroon : "rgba(99,32,36,.07)",
                color: lit ? C.light : C.body,
              }}>
                {lit ? <Check size={15} strokeWidth={3} /> : <Lock size={13} />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: ".92rem", fontWeight: 800, color: C.head }}>
                  {isAR ? l.ar : l.en}
                </span>
                <span style={{ display: "block", fontSize: ".78rem", lineHeight: 1.45, color: C.body, marginTop: 1 }}>
                  {lit
                    ? (isAR ? l.does_ar : l.does_en)
                    : (isAR ? `أنهِ درس «${c?.name_ar}»` : `Finish the ${c?.name_en} lesson`)}
                </span>
              </span>
              {!lit && (isAR ? <ArrowLeft size={15} color={C.maroon} /> : <ArrowRight size={15} color={C.maroon} />)}
            </div>
          );

          return lit
            ? <div key={l.needs}>{body}</div>
            : <Link key={l.needs} href={`/dashboard/concepts/${l.needs}`} style={{ textDecoration: "none" }}>{body}</Link>;
        })}
        </div>
      </div>

      <style>{`
        .hs-body { display: grid; gap: 1.2rem 1.4rem; padding: 0 1.6rem 1.5rem;
          grid-template-columns: minmax(0, 1.35fr) minmax(14rem, 1fr); align-items: center; }
        .hs-rows { display: grid; gap: .7rem; align-content: center; }
        @media (max-width: 760px) { .hs-body { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
