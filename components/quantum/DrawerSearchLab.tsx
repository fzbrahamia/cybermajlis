"use client";

// ============================================================
// LAB 01 — THE CABINET OF DRAWERS
//
// This is equipment, not a page. Dark chassis, engineering grid, phosphor
// readouts, indicator lamps and a console that prints every operation as it
// happens, so a child can see the machine working rather than read about it.
//
// Rouda's bench on the left, the quantum processor on the right, same cabinet.
// The rule for every lab here: the classical method runs beside the quantum
// one, or "quantum" just reads as magic.
//
// The processor runs the real Grover algorithm. Amplitudes start equal, the
// oracle flips the sign of the marked state, the diffuser reflects about the
// mean. Which lets the child discover what the story could not show: run too
// many rounds and the answer gets WORSE. Knowing when to stop is the lesson.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Activity, KeyRound, Power, RotateCcw, Search, Zap } from "lucide-react";
import { Q, LAB, LAB_GRID, headingFont, bodyFont, mono, display } from "./theme";

const N = 16;
const OPTIMAL = Math.floor((Math.PI / 4) * Math.sqrt(N)); // 3 for N = 16

type LogLine = { id: number; kind: "op" | "read" | "warn" | "ok" | "fail"; text: string };

/** One Grover round: flip the marked state's sign, then reflect about the mean. */
function groverRound(amps: number[], target: number): number[] {
  const flipped = amps.map((a, i) => (i === target ? -a : a));
  const mean = flipped.reduce((s, a) => s + a, 0) / flipped.length;
  return flipped.map(a => 2 * mean - a);
}

export default function DrawerSearchLab({ onComplete }: { onComplete?: () => void }) {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();

  const [target, setTarget] = useState(() => Math.floor(Math.random() * N));
  const [opened, setOpened] = useState<number[]>([]);
  const [amps, setAmps] = useState<number[]>(() => Array(N).fill(1 / Math.sqrt(N)));
  const [rounds, setRounds] = useState(0);
  const [measured, setMeasured] = useState<number | null>(null);
  const [run, setRun] = useState(1);
  const [roundsSpent, setRoundsSpent] = useState(0);
  const [log, setLog] = useState<LogLine[]>([]);
  const logId = useRef(0);
  const logBox = useRef<HTMLDivElement>(null);

  const probs = useMemo(() => amps.map(a => a * a), [amps]);
  const targetProb = probs[target];
  const maxProb = Math.max(...probs);
  const foundClassically = opened.includes(target);

  const say = (kind: LogLine["kind"], text: string) =>
    setLog(l => [...l.slice(-40), { id: logId.current++, kind, text }]);

  useEffect(() => {
    say("read", isAR ? "النظام جاهز · 16 حالة · مفتاح واحد" : "SYSTEM READY · 16 states · 1 marked");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logBox.current?.scrollTo({ top: logBox.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [log, reduce]);

  const reset = () => {
    setTarget(Math.floor(Math.random() * N));
    setOpened([]); setAmps(Array(N).fill(1 / Math.sqrt(N)));
    setRounds(0); setMeasured(null); setLog([]);
    setRun(1); setRoundsSpent(0);
    logId.current = 0;
    setTimeout(() => say("read", isAR ? "أُعيد إخفاء المفتاح · النظام جاهز" : "KEY RE-HIDDEN · system ready"), 30);
  };

  // A real machine that measures the wrong answer is simply run again: the
  // circuit resets and you try from scratch. Locking the controls after one
  // failed measurement left the child stranded at exactly the moment the
  // lesson ("it is likely, not guaranteed") is landing.
  const runAgain = () => {
    setAmps(Array(N).fill(1 / Math.sqrt(N)));
    setRounds(0);
    setMeasured(null);
    setRun(r => r + 1);
    say("read", isAR ? "أُعيد ضبط المعالج · الحالة متساوية" : "PROCESSOR RESET · amplitudes level again");
  };

  const openDrawer = (i: number) => {
    if (foundClassically || opened.includes(i)) return;
    setOpened(o => [...o, i]);
    if (i === target) {
      say("ok", isAR ? `الدرج ${i + 1}: المفتاح · بعد ${opened.length + 1} محاولة` : `DRAWER ${i + 1}: KEY FOUND after ${opened.length + 1} tries`);
      onComplete?.();
    } else {
      say("op", isAR ? `الدرج ${i + 1}: فارغ` : `DRAWER ${i + 1}: empty`);
    }
  };

  const runRound = () => {
    if (measured !== null) return;
    const next = groverRound(amps, target);
    setAmps(next); setRounds(r => r + 1); setRoundsSpent(t => t + 1);
    const p = next[target] * next[target];
    say("op", isAR ? "المُعرِّف: قلب الطور على الحالة المعلّمة" : "ORACLE   phase flip on marked state");
    say("op", isAR ? "الناشر: انعكاس حول المتوسط" : "DIFFUSER reflect about the mean");
    say(rounds + 1 > OPTIMAL ? "warn" : "read",
      isAR ? `احتمال المفتاح = ${(p * 100).toFixed(1)}%` : `P(key) = ${(p * 100).toFixed(1)}%`);
    if (rounds + 1 > OPTIMAL) {
      say("warn", isAR ? "تحذير: تجاوزت الجولة المثلى · الاحتمال ينخفض" : "WARNING past optimal round · probability falling");
    }
  };

  const measure = () => {
    if (measured !== null) return;
    const r = Math.random();
    let acc = 0, pick = N - 1;
    for (let i = 0; i < N; i++) { acc += probs[i]; if (r <= acc) { pick = i; break; } }
    setMeasured(pick);
    say("op", isAR ? "قياس · انهيار الحالة" : "MEASURE  collapsing state vector");
    if (pick === target) say("ok", isAR
      ? `النتيجة: الدرج ${pick + 1} · المفتاح · التشغيل ${run} · ${roundsSpent} جولة إجمالاً`
      : `RESULT drawer ${pick + 1} · KEY · run ${run} · ${roundsSpent} rounds in total`);
    else say("fail", isAR ? `النتيجة: الدرج ${pick + 1} · فارغ · أعد التشغيل` : `RESULT drawer ${pick + 1} · empty · run again`);
    onComplete?.();
  };

  /* ── styling helpers ───────────────────────────────────── */
  const readout: React.CSSProperties = { fontFamily: mono, fontSize: 9, letterSpacing: "0.18em", color: LAB.textDim };
  const bay: React.CSSProperties = {
    background: LAB.panel, border: `1px solid ${LAB.edge}`, borderRadius: 14, padding: "18px 16px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)",
  };
  const lamp = (on: boolean, c: string): React.CSSProperties => ({
    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
    background: on ? c : "rgba(255,255,255,.12)",
    boxShadow: on ? `0 0 8px ${c}, 0 0 2px ${c}` : "none",
  });
  const ctl = (bg: string, disabled: boolean): React.CSSProperties => ({
    fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
    padding: "11px 18px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
    background: disabled ? "rgba(255,255,255,.04)" : bg,
    color: disabled ? LAB.textDim : LAB.chassis,
    border: `1px solid ${disabled ? "rgba(255,255,255,.08)" : bg}`,
    display: "inline-flex", alignItems: "center", gap: 8,
    boxShadow: disabled ? "none" : `0 0 18px ${bg}55`,
  });

  return (
    <div style={{
      position: "relative", overflow: "hidden", borderRadius: 22,
      background: LAB.chassis,
      backgroundImage: LAB_GRID, backgroundSize: "26px 26px",
      border: `1px solid ${LAB.edge}`,
      boxShadow: "0 30px 70px rgba(10,19,16,.45), inset 0 1px 0 rgba(255,255,255,.05)",
    }}>
      {/* soft equipment glow */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(700px 220px at 50% -8%, ${Q.mid}22, transparent 70%)`,
      }} />

      {/* ── chassis header ── */}
      <div style={{
        position: "relative", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        padding: "14px 18px", borderBottom: `1px solid ${LAB.edge}`, background: "rgba(0,0,0,.22)",
      }}>
        <motion.span
          animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={lamp(true, LAB.phosphor)}
        />
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.22em", color: LAB.phosphor }}>
          {isAR ? "مختبر ١ · خزانة الأدراج" : "LAB 01 · CABINET OF DRAWERS"}
        </span>
        <span style={{ ...readout, marginInlineStart: "auto" }}>
          {isAR ? "درجة الحرارة  15 ملي كلفن" : "T  15 mK"}
        </span>
        <span aria-hidden style={{ width: 1, height: 14, background: LAB.edge }} />
        <span style={{ ...readout }}>{isAR ? "الحالات  16" : "STATES  16"}</span>
      </div>

      <div style={{ position: "relative", padding: "18px", display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>

          {/* ══ CLASSICAL BENCH ══ */}
          <div style={bay}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <span style={lamp(opened.length > 0 && !foundClassically, LAB.amber)} />
              <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: "0.18em", color: LAB.text }}>
                {isAR ? "الحاسوب الثابت · بحث خطي" : "STATIC COMPUTER · LINEAR SEARCH"}
              </span>
            </div>

            {/* physical drawers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {Array.from({ length: N }, (_, i) => {
                const isOpen = opened.includes(i);
                const isKey = isOpen && i === target;
                return (
                  <motion.button
                    key={i}
                    onClick={() => openDrawer(i)}
                    disabled={foundClassically || isOpen}
                    aria-label={`Drawer ${i + 1}`}
                    whileHover={foundClassically || isOpen || reduce ? undefined : { y: -2 }}
                    whileTap={foundClassically || isOpen || reduce ? undefined : { scale: 0.94 }}
                    style={{
                      position: "relative", aspectRatio: "1.25", borderRadius: 5, overflow: "hidden",
                      cursor: foundClassically || isOpen ? "default" : "pointer",
                      border: `1px solid ${isKey ? LAB.phosphor : LAB.edge}`,
                      background: isOpen
                        ? (isKey ? `linear-gradient(180deg, ${Q.deep}, ${LAB.panel})` : "rgba(0,0,0,.42)")
                        : `linear-gradient(180deg, ${LAB.panelHi}, ${LAB.panel})`,
                      boxShadow: isKey ? `0 0 16px ${LAB.phosphor}55` : "inset 0 1px 0 rgba(255,255,255,.05)",
                      display: "grid", placeItems: "center",
                    }}
                  >
                    {/* drawer handle */}
                    {!isOpen && (
                      <span aria-hidden style={{
                        width: "42%", height: 2, borderRadius: 2,
                        background: "rgba(185,216,202,.28)",
                      }} />
                    )}
                    {isKey && <KeyRound size={15} style={{ color: LAB.phosphor }} />}
                    {isOpen && !isKey && (
                      <span style={{ fontFamily: mono, fontSize: 8, color: LAB.textDim }}>
                        {isAR ? "فارغ" : "EMPTY"}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 14 }}>
              <span style={{ fontFamily: mono, fontSize: 30, fontWeight: 700, color: foundClassically ? LAB.phosphor : LAB.text, lineHeight: 1 }}>
                {String(opened.length).padStart(2, "0")}
              </span>
              <span style={readout}>{isAR ? "محاولات" : "TRIES"}</span>
              <span style={{ ...readout, marginInlineStart: "auto" }}>
                {isAR ? "المتوسط 8" : "AVG 8"}
              </span>
            </div>
          </div>

          {/* ══ QUANTUM PROCESSOR ══ */}
          <div style={bay}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <motion.span
                animate={reduce || measured !== null ? undefined : { opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={lamp(true, rounds > OPTIMAL ? LAB.amber : LAB.phosphor)}
              />
              <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: "0.18em", color: LAB.text }}>
                {isAR ? "الحاسوب الكمّي · غروفر" : "QUANTUM COMPUTER · GROVER"}
              </span>
            </div>

            {/* amplitude spectrum */}
            <div style={{
              position: "relative", height: 132, borderRadius: 8, padding: "8px 8px 0",
              background: "rgba(0,0,0,.34)", border: `1px solid ${LAB.edge}`,
            }}>
              {/* graticule */}
              {[0.25, 0.5, 0.75].map(f => (
                <span key={f} aria-hidden style={{
                  position: "absolute", insetInline: 8, top: `${f * 100}%`, height: 1,
                  background: "rgba(95,199,156,.10)",
                }} />
              ))}
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${N}, 1fr)`, gap: 2, alignItems: "end", height: "100%" }}>
                {probs.map((p, i) => {
                  const isPick = measured === i;
                  const isTarget = i === target;
                  const h = Math.max(1.5, (p / Math.max(maxProb, 0.0001)) * 100);
                  return (
                    <motion.div
                      key={i}
                      animate={{ height: `${h}%` }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 20 }}
                      style={{
                        borderRadius: "3px 3px 0 0",
                        background: isPick
                          ? LAB.phosphor
                          : `linear-gradient(180deg, ${LAB.phosphor}, ${Q.mid})`,
                        opacity: isPick ? 1 : isTarget ? 0.95 : 0.55,
                        boxShadow: isPick || (isTarget && p > 0.4) ? `0 0 12px ${LAB.phosphor}88` : "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* readouts */}
            <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 30, fontWeight: 700, color: LAB.text, lineHeight: 1 }}>
                  {String(rounds).padStart(2, "0")}
                </span>
                <span style={readout}>
                  {isAR ? "جولات" : "ROUNDS"}
                  {run > 1 && (
                    <span style={{ color: LAB.amber }}>
                      {isAR ? ` · تشغيل ${run} · ${roundsSpent} إجمالاً` : ` · RUN ${run} · ${roundsSpent} TOTAL`}
                    </span>
                  )}
                </span>
              </span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{
                  fontFamily: mono, fontSize: 30, fontWeight: 700, lineHeight: 1,
                  color: rounds > OPTIMAL ? LAB.amber : LAB.phosphor,
                  textShadow: `0 0 14px ${rounds > OPTIMAL ? LAB.amber : LAB.phosphor}66`,
                }}>
                  {(targetProb * 100).toFixed(1)}%
                </span>
                <span style={readout}>{isAR ? "احتمال المفتاح" : "P(KEY)"}</span>
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {measured === null ? (
                <>
                  <button onClick={runRound} style={ctl(LAB.phosphor, false)}>
                    <Zap size={12} /> {isAR ? "جولة" : "RUN ROUND"}
                  </button>
                  <button onClick={measure} style={ctl(Q.soft, false)}>
                    <Search size={12} /> {isAR ? "قِس" : "MEASURE"}
                  </button>
                </>
              ) : (
                <button onClick={runAgain} style={ctl(LAB.phosphor, false)}>
                  <RotateCcw size={12} /> {isAR ? "شغّل من جديد" : "RUN IT AGAIN"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ══ CONSOLE ══ */}
        <div style={{ ...bay, padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 9, padding: "9px 14px",
            borderBottom: `1px solid ${LAB.edge}`, background: "rgba(0,0,0,.24)",
          }}>
            <Activity size={12} style={{ color: LAB.phosphorDim }} />
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.2em", color: LAB.textDim }}>
              {isAR ? "سجل العمليات" : "OPERATION LOG"}
            </span>
          </div>
          <div ref={logBox} style={{ maxHeight: 132, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
            <AnimatePresence initial={false}>
              {log.map(l => (
                <motion.div
                  key={l.id}
                  initial={reduce ? false : { opacity: 0, x: isAR ? 6 : -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    fontFamily: mono, fontSize: 10.5, lineHeight: 1.7, whiteSpace: "pre-wrap",
                    color: l.kind === "warn" ? LAB.amber
                         : l.kind === "ok" ? LAB.phosphor
                         : l.kind === "fail" ? LAB.red
                         : l.kind === "op" ? LAB.textDim
                         : LAB.text,
                  }}
                >
                  <span style={{ color: LAB.phosphorDim }}>{"> "}</span>{l.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ══ FOOTER BAR ══ */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", borderRadius: 12,
          background: "rgba(0,0,0,.24)", border: `1px solid ${LAB.edge}`,
        }}>
          <p style={{ fontFamily: bodyFont, fontSize: 14.5, lineHeight: 1.6, color: LAB.text, margin: 0, maxWidth: 520 }}>
            {isAR
              ? `ستة عشر درجاً: نحو 8 محاولات مقابل ${OPTIMAL} جولات. وألف مفتاح على حلقة الجد: نحو 500 مقابل 25.`
              : `Sixteen drawers: about 8 tries against ${OPTIMAL} rounds. The thousand keys on Grandfather's ring: about 500 against 25.`}
          </p>
          <button onClick={reset} style={{
            fontFamily: mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em",
            padding: "10px 16px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
            background: "transparent", border: `1px solid ${LAB.edge}`, color: LAB.text,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <RotateCcw size={12} /> {isAR ? "أعد الإخفاء" : "RE-HIDE KEY"}
          </button>
        </div>

        <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.14em", color: LAB.textDim, margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
          <Power size={10} />
          {isAR
            ? "هذا المعالج يشغّل خوارزمية غروفر الحقيقية، لا رسماً متحركاً لها."
            : "THIS PROCESSOR RUNS THE REAL GROVER ALGORITHM, NOT AN ANIMATION OF ONE"}
        </p>
      </div>
    </div>
  );
}
