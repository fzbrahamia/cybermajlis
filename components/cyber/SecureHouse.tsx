"use client";

/* THE HOUSE
 *
 * One picture of a house that changes as lessons get finished. Finish the
 * Firewall lesson and a gate appears on the way in; finish Zero Day and the
 * gaps in the wall are filled.
 *
 * WHOLE PICTURES, NOT LAYERS. The first version stacked transparent PNGs on a
 * base photo. The art that exists is three separate renders at slightly
 * different framing, so stacking them tears. They cross-fade instead, and the
 * table below says which picture belongs to which state.
 *
 * Lessons can still be taken in any order: the state is read from what is
 * finished, not from a sequence. Nothing has to be dragged. You finish a
 * lesson and the house is different when you come back. That is the reward. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, ShieldCheck, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { C } from "@/components/cyber/shell";
import { conceptBySlug } from "@/app/lib/cyberData";
import { subscribeDone } from "@/app/lib/conceptProgress";

/** The concepts that change the house, in the order they are listed below it. */
export const PARTS = [
  {
    needs: "firewall",
    en: "A gate on the way in", ar: "بوابة على المدخل",
    does_en: "Someone at the entrance who decides what comes in.",
    does_ar: "من يقف عند المدخل ويقرر ما الذي يدخل.",
  },
  {
    needs: "zero-day",
    en: "The gaps filled", ar: "سدّ الفجوات",
    does_en: "The holes nobody had fixed are fixed.",
    does_ar: "الثقوب التي لم يصلحها أحد صارت مُصلَحة.",
  },
] as const;

/* Which picture belongs to which state, first match wins. gated.jpeg already
   shows an intact wall, so it doubles as the both-finished picture until a
   gate-with-gaps render exists; see public/house/README.txt. */
const SCENES: { when: (has: (id: string) => boolean) => boolean; src: string }[] = [
  { when: h => h("firewall"), src: "/house/gated.jpeg" },
  { when: h => h("zero-day"), src: "/house/patched.jpeg" },
  { when: () => true,         src: "/house/base.jpeg" },
];

/** Which picture a given set of finished concepts produces. Exported so a
    lesson can work out what the house looked like before it was finished and
    what it looks like after, and show the change. */
export function houseScene(finished: ReadonlySet<string>): string {
  const has = (id: string) => finished.has(id);
  return (SCENES.find(sc => sc.when(has)) ?? SCENES[SCENES.length - 1]).src;
}

export default function SecureHouse() {
  const isAR = useLocale() === "ar";
  const [done, setDone] = useState<Record<string, unknown>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => subscribeDone(d => { setDone(d); setReady(true); }), []);

  const has = (id: string) => Boolean(done[`cm-${id}`]);
  const on = PARTS.filter(p => has(p.needs));
  const all = on.length === PARTS.length;
  const scene = houseScene(new Set(PARTS.filter(p => has(p.needs)).map(p => p.needs)));

  /* REPLAY. The change plays once on the lesson page, at the moment the quiz
     is answered, and then never again. Anyone who comes back here has only the
     finished house and no memory of it arriving. So a finished part is a
     button: press it and the house goes back to how it looked without that
     part, the light crosses, and the part returns. */
  const [showing, setShowing] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const replay = (id: string) => {
    if (playing) return;
    const without = new Set(
      PARTS.map(p => p.needs as string).filter(n => n !== id && has(n))
    );
    const before = houseScene(without);
    if (before === scene) return;   // this part changes nothing to show
    setShowing(before);
    setPlaying(true);
    setTimeout(() => setShowing(null), 700);
    setTimeout(() => setPlaying(false), 1700);
  };

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
          {on.length > 0
            ? (isAR ? "اضغط أي جزء منجَز لتشاهد تغييره" : "Press a finished part to watch it change")
            : `${on.length} / ${PARTS.length}`}
        </span>
      </div>

      {/* ── the house as it currently stands ── */}
      <div className="hs-body">
        <div style={{
          position: "relative", aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden",
          border: `4px solid ${C.head}`,
          boxShadow: `inset 0 0 0 2px ${C.gold}88, 0 8px 24px rgba(62,19,22,.25)`,
          background: "#E3DAC9",
        }}>
          <AnimatePresence mode="sync">
            {ready && (
              <motion.img
                key={showing ?? scene}
                src={showing ?? scene}
                alt=""
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: .9, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>

          {/* the light that carries a replayed change across the frame */}
          {playing && (
            <motion.span
              initial={{ x: "-130%" }}
              animate={{ x: "130%" }}
              transition={{ duration: 1.35, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "absolute", top: "-20%", bottom: "-20%", width: "55%",
                pointerEvents: "none", transform: "skewX(-14deg)", zIndex: 2,
                background: "linear-gradient(90deg, transparent, rgba(255,246,225,.16) 35%, rgba(255,240,205,.72) 50%, rgba(255,246,225,.16) 65%, transparent)",
                filter: "blur(2px)",
              }}
            />
          )}

          {ready && all && !playing && (
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
        {PARTS.map(l => {
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
              {lit
                ? <RotateCcw size={14} color={C.maroon} style={{ opacity: .55 }} />
                : (isAR ? <ArrowLeft size={15} color={C.maroon} /> : <ArrowRight size={15} color={C.maroon} />)}
            </div>
          );

          return lit
            ? (
              <button
                key={l.needs}
                onClick={() => replay(l.needs)}
                disabled={playing}
                title={isAR ? "شاهد التغيير مرة أخرى" : "Watch this change again"}
                style={{
                  display: "block", width: "100%", padding: 0, border: 0, background: "none",
                  textAlign: "start", font: "inherit",
                  cursor: playing ? "default" : "pointer",
                }}
              >{body}</button>
            )
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
