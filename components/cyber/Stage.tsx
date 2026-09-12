"use client";

/* THE STAGE
 *
 * What a Why You lesson is instead of a film.
 *
 * The rule that separates this from a slide deck: a beat does not cut to a new
 * picture, it grows out of the last one. A sentence on a card becomes the row
 * that card really is; the row gets weighed; the weighing turns into the
 * promise; the promise breaks. So the run reads as one object being turned over
 * in the hand rather than eight unrelated slides.
 *
 * The panel is dark on purpose. Everything else on this site is cream paper,
 * and a lit rectangle inside a cream page is read instantly as a thing being
 * shown to you. The palette is still only maroon, gold and cream, inverted.
 *
 * Every beat kind in app/lib/whyYouData.ts has exactly one case below. Adding a
 * kind means adding a picture; there is no generic fallback on purpose, because
 * a generic fallback is how a deck ends up looking like a deck.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import {
  ChevronLeft, ChevronRight, User, Server, ArrowDown, Quote, Building2, RotateCcw,
} from "lucide-react";
import type { Beat, Say } from "@/app/lib/whyYouData";
import { Conversation } from "@/components/cyber/Character";

/* ── the inverted palette ───────────────────────────────── */
const S = {
  ground: "linear-gradient(157deg, #45181B 0%, #2C0C0F 58%, #240A0C 100%)",
  ink:    "#F7ECDD",
  dim:    "rgba(247,236,221,.60)",
  faint:  "rgba(247,236,221,.34)",
  gold:   "#D3B387",
  goldDim:"rgba(211,179,135,.55)",
  line:   "rgba(211,179,135,.20)",
  card:   "rgba(247,236,221,.055)",
  lit:    "rgba(211,179,135,.10)",
};

const CSS = `
.wy-stage { position: relative; background: ${S.ground}; border-radius: 22px;
  border: 1px solid rgba(211,179,135,.28); overflow: hidden;
  box-shadow: 0 30px 80px rgba(62,19,22,.30), inset 0 1px 0 rgba(247,236,221,.06); }
.wy-stage::after { content:""; position:absolute; inset:0; pointer-events:none;
  background: radial-gradient(ellipse 70% 45% at 50% 0%, rgba(211,179,135,.12), transparent 70%); }
.wy-floor { position: relative; z-index: 1; display: flex;
  flex-direction: column; padding: 1.5rem clamp(1.1rem, 3.2vw, 2.6rem) 1.3rem; }
.wy-scene { flex: 1; display: flex; flex-direction: column; justify-content: center;
  min-height: clamp(260px, 42vh, 400px); }
/* Rail on the left, beat on the right; the progress row stays full width. */
.wy-grid { display: grid; grid-template-columns: minmax(300px, 370px) minmax(0, 1fr);
  gap: clamp(1rem, 2.4vw, 2rem); align-items: stretch; }
.wy-body { display: flex; flex-direction: column; min-width: 0; }
.wy-rail { display: flex; align-items: center; min-width: 0;
  padding-inline-end: clamp(.6rem, 1.6vw, 1.2rem);
  border-inline-end: 1px solid rgba(211,179,135,.18); order: -1; }
@media (max-width: 900px) {
  .wy-grid { grid-template-columns: minmax(0, 1fr); }
  .wy-rail { order: 0; border-inline-end: 0; padding-inline-end: 0;
    padding-top: 1.1rem; border-top: 1px solid rgba(211,179,135,.18); }
}
.wy-eyebrow { font-size: .58rem; letter-spacing: .3em; text-transform: uppercase;
  color: ${S.goldDim}; }
.wy-pip { width: 7px; height: 7px; background: ${S.faint}; transform: rotate(45deg);
  border: 0; padding: 0; cursor: pointer; transition: background .3s, transform .3s; }
.wy-pip[data-on="1"] { background: ${S.gold}; transform: rotate(45deg) scale(1.35); }
.wy-pip[data-seen="1"] { background: ${S.goldDim}; }
.wy-pip:focus-visible { outline: 2px solid ${S.gold}; outline-offset: 4px; }
.wy-nav { display: inline-flex; align-items: center; gap: 7px; cursor: pointer;
  font: inherit; font-size: .68rem; letter-spacing: .14em; text-transform: uppercase;
  font-weight: 700; padding: 10px 18px; border-radius: 10px;
  border: 1px solid rgba(211,179,135,.35); background: rgba(211,179,135,.10);
  color: ${S.ink}; transition: background .2s, opacity .2s; }
.wy-nav:hover:not(:disabled) { background: rgba(211,179,135,.2); }
.wy-nav:disabled { opacity: .3; cursor: default; }
.wy-nav[data-go="1"] { background: ${S.gold}; color: #2C0C0F; border-color: ${S.gold}; }
.wy-nav[data-go="1"]:hover { background: #E3C79F; }
.wy-cell { background: ${S.card}; border: 1px solid ${S.line}; border-radius: 14px; }
/* Four things want to be two rows of two, not three and a straggler. */
.wy-two { display: grid; gap: .8rem; grid-template-columns: 1fr 1fr; }
/* The branch: one rail across the children, one drop into each of them, so the
   picture says "you are one node" instead of leaving a line hanging in air. */
.wy-fan { position: relative; display: grid; gap: .7rem; width: 100%;
  grid-template-columns: repeat(3, 1fr); }
.wy-fan::before { content: ""; position: absolute; top: -14px; left: 16.6%; right: 16.6%;
  height: 1.5px; background: ${S.goldDim}; }
.wy-fan > * { position: relative; }
.wy-fan > *::before { content: ""; position: absolute; top: -14px; left: 50%;
  width: 1.5px; height: 14px; background: ${S.goldDim}; }
@media (max-width: 780px) {
  .wy-two, .wy-fan { grid-template-columns: 1fr; }
  .wy-fan::before, .wy-fan > *::before { display: none; }
  /* A 150px label column against a phone leaves the value nowhere to go, so
     the field stacks and the spacer cell collapses. */
  .wy-field { grid-template-columns: 1fr !important; gap: .2rem !important; }
  .wy-field > .wy-gap { display: none; }
}
/* Beats speak once or twice. Without a floor the panel shrinks on the one-line
   ones and the whole page jumps at the end of the run. */
.wy-talk { min-height: 74px; }
.wy-caret { display: inline-block; width: 2px; height: 1em; background: ${S.gold};
  vertical-align: -.12em; margin-inline-start: 3px; animation: wyb 1.05s step-end infinite; }
@keyframes wyb { 50% { opacity: 0 } }
@media (prefers-reduced-motion: reduce) { .wy-caret { animation: none } }
`;

/* ── motion ─────────────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1] as const;
const wrap = { off: {}, on: { transition: { staggerChildren: 0.085, delayChildren: 0.06 } } };
const pop = {
  off: { opacity: 0, y: 16, scale: 0.965 },
  on:  { opacity: 1, y: 0, scale: 1, transition: { duration: 0.52, ease: EASE } },
};

function Pop({ children, style, className }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? undefined : pop} style={style}>
      {children}
    </motion.div>
  );
}

function Stack({ children, style, className }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial="off" animate="on" exit="off"
      variants={reduce ? undefined : wrap} style={style}>
      {children}
    </motion.div>
  );
}

/** A line writing itself. Reduced motion gets the finished line at once. */
function Typed({ text, speed = 34 }: { text: string; speed?: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) { setN(text.length); return; }
    setN(0);
    const id = setInterval(() => {
      setN(c => { if (c >= text.length) { clearInterval(id); return c; } return c + 1; });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]);
  return (
    <>{text.slice(0, n)}{n < text.length && <i className="wy-caret" />}</>
  );
}

/* ── shared small parts ─────────────────────────────────── */

const head: React.CSSProperties = {
  fontFamily: "var(--title)",
  fontSize: "clamp(1.15rem, 2.5vw, 1.55rem)", fontWeight: 700, color: S.ink,
  lineHeight: 1.32, margin: 0,
};
const bodyTxt: React.CSSProperties = {
  fontSize: ".93rem", lineHeight: 1.68, color: S.dim, fontWeight: 300, margin: 0,
};
const label: React.CSSProperties = {
  fontSize: ".57rem", letterSpacing: ".26em", textTransform: "uppercase", color: S.goldDim,
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7, ...label,
      border: `1px solid ${S.line}`, background: S.lit,
      padding: "6px 13px", borderRadius: 999, color: S.gold,
    }}>{children}</span>
  );
}

function GoldRule({ width = 34 }: { width?: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ height: 1, width, background: `linear-gradient(90deg, transparent, ${S.gold})` }} />
      <span style={{ width: 4, height: 4, background: S.gold, transform: "rotate(45deg)" }} />
      <span style={{ height: 1, width, background: `linear-gradient(90deg, ${S.gold}, transparent)` }} />
    </span>
  );
}

/* ── the eight pictures ─────────────────────────────────── */

function Picture({ beat, isAR }: { beat: Beat; isAR: boolean }) {
  const pick = <T,>(en: T, ar: T) => (isAR ? ar : en);

  switch (beat.kind) {
    /* one card, one sentence, nothing else in the world */
    case "said":
      return (
        <Stack style={{ display: "grid", placeItems: "center", minHeight: 200 }}>
          <Pop>
            <motion.div
              animate={{ rotate: [-1.4, -0.6, -1.4] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "linear-gradient(158deg, #FDFBF6, #F0E3CC)",
                borderRadius: 12, padding: "1.9rem clamp(1.4rem,4vw,3rem) 2.1rem",
                maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,.36)",
                border: "1px solid rgba(211,179,135,.5)",
              }}
            >
              <div style={{ ...label, color: "#9A7B53", marginBottom: ".9rem" }}>
                {pick(beat.meta_en, beat.meta_ar)}
              </div>
              <Quote size={15} color="#C5A57E" style={{ marginBottom: ".4rem" }} />
              <p style={{
                margin: 0, fontSize: "clamp(1.05rem,2.3vw,1.3rem)", lineHeight: 1.55,
                color: "#4a1a1d", fontWeight: 500, minHeight: "2.4em",
              }}>
                <Typed text={pick(beat.text_en, beat.text_ar)} />
              </p>
            </motion.div>
          </Pop>
        </Stack>
      );

    /* the same card, opened up into the fields it always was */
    case "row":
      return (
        <Stack style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
          <Pop style={{ marginBottom: ".2rem" }}>
            <h3 style={head}>{pick(beat.head_en, beat.head_ar)}</h3>
          </Pop>
          {beat.fields.map((f, i) => (
            <Pop key={i} className="wy-cell wy-field" style={{
              padding: ".85rem 1.1rem",
              display: "grid", gap: ".15rem .9rem", alignItems: "baseline",
              gridTemplateColumns: "minmax(120px, 150px) 1fr",
              background: f.heavy ? "rgba(211,179,135,.11)" : S.card,
              borderColor: f.heavy ? "rgba(211,179,135,.42)" : S.line,
              [isAR ? "borderRightWidth" : "borderLeftWidth"]: f.heavy ? 3 : 1,
            } as React.CSSProperties}>
              <span style={{ ...label, color: f.heavy ? S.gold : S.goldDim }}>
                {pick(f.label_en, f.label_ar)}
              </span>
              <span style={{ fontSize: ".97rem", fontWeight: 700, color: S.ink }}>
                {pick(f.value_en, f.value_ar)}
              </span>
              <span className="wy-gap" />
              <span style={{ fontSize: ".85rem", lineHeight: 1.6, color: S.dim, fontWeight: 300 }}>
                {pick(f.weight_en, f.weight_ar)}
              </span>
            </Pop>
          ))}
        </Stack>
      );

    /* two columns, and the second one does not balance */
    case "worth": {
      const Col = ({ c, lit }: { c: typeof beat.left; lit?: boolean }) => (
        <Pop className="wy-cell" style={{
          padding: "1.3rem 1.3rem 1.4rem", display: "flex", flexDirection: "column", gap: ".8rem",
          background: lit ? "rgba(211,179,135,.12)" : S.card,
          borderColor: lit ? "rgba(211,179,135,.45)" : S.line,
        }}>
          <span style={{ ...label, color: lit ? S.gold : S.goldDim }}>{pick(c.head_en, c.head_ar)}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".45rem" }}>
            {pick(c.items_en, c.items_ar).map((it, i) => (
              <span key={i} style={{
                fontSize: ".95rem", fontWeight: 700, color: S.ink,
                border: `1px solid ${S.line}`, borderRadius: 9,
                padding: ".4rem .75rem", background: "rgba(0,0,0,.16)",
              }}>{it}</span>
            ))}
          </div>
          <p style={{ ...bodyTxt, fontSize: ".88rem", marginTop: "auto", paddingTop: ".3rem" }}>
            {pick(c.foot_en, c.foot_ar)}
          </p>
        </Pop>
      );
      return (
        <Stack style={{
          display: "grid", gap: "1rem", alignItems: "stretch",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        }}>
          <Col c={beat.left} />
          <Col c={beat.right} lit />
        </Stack>
      );
    }

    /* the thread between two people, and where it actually runs */
    case "promise": {
      const Node = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
        <span style={{ display: "grid", justifyItems: "center", gap: ".5rem", minWidth: 96 }}>
          <span style={{
            width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center",
            border: `1px solid ${S.goldDim}`, background: S.lit, color: S.gold,
          }}>{icon}</span>
          <span style={{ fontSize: ".88rem", fontWeight: 700, color: S.ink, textAlign: "center" }}>{text}</span>
        </span>
      );
      return (
        <Stack style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Pop style={{ display: "flex", alignItems: "flex-start", gap: ".4rem", justifyContent: "center" }}>
            <Node icon={<User size={20} strokeWidth={1.7} />} text={pick(beat.a_en, beat.a_ar)} />
            <span style={{ display: "grid", justifyItems: "center", gap: 6, paddingTop: 14, minWidth: 110 }}>
              <span style={{ ...label, color: S.gold }}>{pick(beat.thread_en, beat.thread_ar)}</span>
              <motion.span
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: .7, delay: .3, ease: EASE }}
                style={{ height: 1.5, width: "100%", transformOrigin: isAR ? "right" : "left",
                  background: `linear-gradient(90deg, ${S.goldDim}, ${S.gold}, ${S.goldDim})` }} />
            </span>
            <Node icon={<User size={20} strokeWidth={1.7} />} text={pick(beat.b_en, beat.b_ar)} />
          </Pop>

          <Pop style={{ display: "grid", justifyItems: "center", gap: ".4rem" }}>
            <ArrowDown size={18} color={S.goldDim} />
            <span style={{ ...label, color: S.goldDim }}>
              {isAR ? "لكن الكلام محفوظ هنا" : "But the words are kept here"}
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 10, marginTop: ".15rem",
              border: `1px solid ${S.goldDim}`, borderRadius: 12,
              padding: ".6rem 1.1rem", background: "rgba(0,0,0,.2)", color: S.ink,
            }}>
              <Server size={18} color={S.gold} strokeWidth={1.7} />
              <b style={{ fontSize: ".95rem" }}>{pick(beat.keeps_en, beat.keeps_ar)}</b>
            </span>
          </Pop>

          <Pop className="wy-cell" style={{
            padding: "1.05rem 1.3rem", maxWidth: "62ch",
            background: "rgba(211,179,135,.10)", borderColor: "rgba(211,179,135,.38)",
          }}>
            <p style={{ ...bodyTxt, color: S.ink, fontSize: ".97rem", fontWeight: 400 }}>
              {pick(beat.reveal_en, beat.reveal_ar)}
            </p>
          </Pop>
        </Stack>
      );
    }

    /* it already happened, one fact at a time, then the part nobody guesses */
    case "turn":
      return (
        <Stack style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
          <Pop><Chip>{pick(beat.when_en, beat.when_ar)}</Chip></Pop>
          {beat.hits.map((h, i) => (
            <Pop key={i} className="wy-cell wy-field" style={{
              padding: ".85rem 1.1rem", display: "flex", gap: ".85rem", alignItems: "flex-start",
            }}>
              <span style={{
                width: 25, height: 25, borderRadius: "50%", flex: "none", marginTop: 2,
                display: "grid", placeItems: "center", background: "rgba(211,179,135,.16)",
                color: S.gold, fontWeight: 800, fontSize: ".76rem",
              }}>{i + 1}</span>
              <span style={{ minWidth: 0 }}>
                <b style={{ display: "block", fontSize: ".99rem", color: S.ink, fontWeight: 700, lineHeight: 1.4 }}>
                  {pick(h.head_en, h.head_ar)}
                </b>
                <span style={{ display: "block", ...bodyTxt, fontSize: ".87rem", marginTop: ".2rem" }}>
                  {pick(h.body_en, h.body_ar)}
                </span>
              </span>
            </Pop>
          ))}
          <Pop style={{
            marginTop: ".2rem", padding: "1.1rem 1.3rem", borderRadius: 14,
            background: "linear-gradient(150deg, rgba(211,179,135,.20), rgba(211,179,135,.07))",
            border: `1px solid ${S.gold}`,
          }}>
            <div style={{ ...label, color: S.gold, marginBottom: ".45rem" }}>
              {isAR ? "ثم انعطف" : "And then it turned"}
            </div>
            <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.62, color: S.ink, fontWeight: 500 }}>
              {pick(beat.twist_en, beat.twist_ar)}
            </p>
          </Pop>
        </Stack>
      );

    /* the camera pulls back: you are a node, not the map */
    case "chain":
      return (
        <Stack style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".55rem" }}>
          <Pop style={{
            display: "inline-flex", alignItems: "center", gap: 9,
            border: `1px solid ${S.gold}`, borderRadius: 12, padding: ".55rem 1.15rem",
            background: "rgba(211,179,135,.16)", color: S.ink,
          }}>
            <Building2 size={17} color={S.gold} strokeWidth={1.7} />
            <b style={{ fontSize: ".97rem" }}>{pick(beat.you_en, beat.you_ar)}</b>
          </Pop>

          <motion.span
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ duration: .4, delay: .18, ease: EASE }}
            style={{ width: 1.5, height: 20, background: S.goldDim, transformOrigin: "top" }} />

          <div className="wy-fan">
            {beat.nodes.map((n, i) => (
              <Pop key={i} className="wy-cell wy-field" style={{ padding: "1rem 1.1rem 1.1rem" }}>
                <b style={{ display: "block", fontSize: ".95rem", color: S.gold, fontWeight: 700, lineHeight: 1.4, marginBottom: ".35rem" }}>
                  {pick(n.name_en, n.name_ar)}
                </b>
                <span style={{ ...bodyTxt, fontSize: ".86rem", display: "block" }}>
                  {pick(n.body_en, n.body_ar)}
                </span>
              </Pop>
            ))}
          </div>

          <Pop style={{ maxWidth: "58ch", textAlign: "center", marginTop: ".7rem" }}>
            <p style={{ margin: 0, fontSize: ".99rem", lineHeight: 1.65, color: S.ink,
              fontWeight: 400, textWrap: "balance" } as React.CSSProperties}>
              {pick(beat.rule_en, beat.rule_ar)}
            </p>
          </Pop>
        </Stack>
      );

    /* four small real things */
    case "do":
      return (
        <Stack className="wy-two">
          {beat.items.map((it, i) => (
            <Pop key={i} className="wy-cell wy-field" style={{ padding: "1.05rem 1.2rem 1.2rem" }}>
              <span style={{ ...label, color: S.gold, display: "block", marginBottom: ".45rem" }}>
                {isAR ? `${i + 1} ·` : `0${i + 1} ·`} {isAR ? "افعل" : "Do this"}
              </span>
              <b style={{ display: "block", fontSize: "1rem", color: S.ink, fontWeight: 700, lineHeight: 1.38 }}>
                {pick(it.head_en, it.head_ar)}
              </b>
              <span style={{ ...bodyTxt, fontSize: ".87rem", display: "block", marginTop: ".4rem" }}>
                {pick(it.body_en, it.body_ar)}
              </span>
            </Pop>
          ))}
        </Stack>
      );

    /* the sentence the whole run exists for */
    case "close":
      return (
        <Stack style={{ display: "grid", placeItems: "center", minHeight: 200, textAlign: "center" }}>
          <Pop style={{ display: "grid", justifyItems: "center", gap: "1rem", maxWidth: "40ch" }}>
            <GoldRule />
            <p style={{
              margin: 0, fontSize: "clamp(1.15rem, 2.7vw, 1.65rem)", lineHeight: 1.5,
              color: S.ink, fontWeight: 500,
            }}>
              {pick(beat.line_en, beat.line_ar)}
            </p>
            <GoldRule />
          </Pop>
        </Stack>
      );
  }
}

/* ── the two of them, taking turns under it ──────────────── */

/* Was two stacked avatars that both appeared at once and never changed. Now
   the lines play one at a time and the figures react: whoever is speaking
   holds their pose, the other one listens. Conversation carries the turn
   logic; this only decides how wide the figures are. */
function Talk({ say }: { say: Say[] }) {
  return (
    <Conversation
      turns={say}
      tone="dark"
      layout="rail"
      width={92}
      style={{ width: "100%" }}
    />
  );
}

/* ── the run ────────────────────────────────────────────── */

export default function Stage({ beats, onFinish, doneLabel }: {
  beats: Beat[];
  /** Fired once, the first time the last beat is reached. */
  onFinish?: () => void;
  doneLabel?: string;
}) {
  const isAR = useLocale() === "ar";
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState(0);
  const fired = useRef(false);
  const last = i === beats.length - 1;

  const go = useCallback((n: number) => {
    const next = Math.max(0, Math.min(beats.length - 1, n));
    setI(next);
    setSeen(s => Math.max(s, next));
  }, [beats.length]);

  useEffect(() => {
    if (last && !fired.current) { fired.current = true; onFinish?.(); }
  }, [last, onFinish]);

  /* Arrow keys follow the reading direction, so "forward" is forward. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const fwd = isAR ? "ArrowLeft" : "ArrowRight";
      const back = isAR ? "ArrowRight" : "ArrowLeft";
      if (e.key === fwd || e.key === " ") { e.preventDefault(); go(i + 1); }
      else if (e.key === back) { e.preventDefault(); go(i - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, isAR, go]);

  const beat = beats[i];
  const Fwd = isAR ? ChevronLeft : ChevronRight;
  const Back = isAR ? ChevronRight : ChevronLeft;

  return (
    <div className="wy-stage">
      <style>{CSS}</style>
      <div className="wy-floor">

        {/* the rail */}
        <div style={{ display: "flex", alignItems: "center", gap: ".9rem", marginBottom: "1.2rem" }}>
          <span className="wy-eyebrow">
            {isAR ? `${i + 1} من ${beats.length}` : `${i + 1} of ${beats.length}`}
          </span>
          <span style={{ display: "flex", gap: 9, alignItems: "center" }}>
            {beats.map((b, n) => (
              <button key={b.id} className="wy-pip" onClick={() => go(n)}
                data-on={n === i ? 1 : 0} data-seen={n < i || n <= seen ? 1 : 0}
                aria-label={isAR ? `اللقطة ${n + 1}` : `Beat ${n + 1}`}
                aria-current={n === i} />
            ))}
          </span>
        </div>

        <div className="wy-grid">
        <div className="wy-body">
        {/* the picture */}
        <div className="wy-scene">
          <AnimatePresence mode="wait">
            <motion.div key={beat.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: .22 }}
            >
              <Picture beat={beat} isAR={isAR} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* the controls sit under the picture, where the picture is */}
        <div style={{
          marginTop: "1.2rem", paddingTop: "1rem", borderTop: `1px solid ${S.line}`,
          display: "flex", gap: ".55rem", justifyContent: "flex-end",
        }}>
            <button className="wy-nav" onClick={() => go(i - 1)} disabled={i === 0}>
              <Back size={14} />{isAR ? "رجوع" : "Back"}
            </button>
            {last ? (
              <button className="wy-nav" onClick={() => go(0)}>
                <RotateCcw size={13} />{isAR ? "من البداية" : "Again"}
              </button>
            ) : (
              <button className="wy-nav" data-go="1" onClick={() => go(i + 1)}>
                {i === 0 ? (doneLabel ?? (isAR ? "ابدأ" : "Begin")) : (isAR ? "التالي" : "Next")}
                <Fwd size={14} />
              </button>
            )}
        </div>
        </div>

        {/* THEM, DOWN THE SIDE.
            They were a strip under the whole panel, which put the speaker a
            long way from the thing they were speaking about. In a side rail
            the pair stand beside the beat, and whoever is talking is level
            with their own words. Below 900px the rail goes back under. */}
        <aside className="wy-rail">
          <AnimatePresence mode="wait">
            <div key={beat.id}><Talk say={beat.say} /></div>
          </AnimatePresence>
        </aside>
        </div>
      </div>
    </div>
  );
}
