"use client";

// ============================================================
// LAB 02 — HOW BIG DOES IT GET?
//
// The cabinet lab is fixed at sixteen drawers, so it can show that quantum is
// faster but not how the gap grows. This one does only that: drag the lock size
// up and watch the two machines pull apart.
//
// One control, two numbers, two clocks. Nothing to misread.
//
// Classical: about N/2 tries on average.
// Quantum:   about (pi/4) * sqrt(N) rounds.
// Both timed at a billion steps a second, which is generous to the classical
// machine and still loses by years.
// ============================================================

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Clock, Gauge } from "lucide-react";
import { Q, LAB, LAB_GRID, bodyFont, mono } from "./theme";

/** A fast machine: one billion attempts every second. */
const PER_SEC = 1e9;
const MIN_EXP = 2, MAX_EXP = 18;

function human(n: number, isAR: boolean): string {
  if (n < 1000) return Math.round(n).toString();
  const units = isAR
    ? ["", " ألف", " مليون", " مليار", " تريليون", " كوادريليون", " كوينتليون"]
    : ["", " thousand", " million", " billion", " trillion", " quadrillion", " quintillion"];
  let u = 0, v = n;
  while (v >= 1000 && u < units.length - 1) { v /= 1000; u++; }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)}${units[u]}`;
}

function duration(seconds: number, isAR: boolean): string {
  if (seconds < 1e-6) return isAR ? "أقل من ميكروثانية" : "less than a microsecond";
  if (seconds < 0.001) return isAR ? `${(seconds * 1e6).toFixed(0)} ميكروثانية` : `${(seconds * 1e6).toFixed(0)} microseconds`;
  if (seconds < 1) return isAR ? `${(seconds * 1000).toFixed(0)} جزء من الألف من الثانية` : `${(seconds * 1000).toFixed(0)} milliseconds`;
  if (seconds < 60) return isAR ? `${seconds.toFixed(1)} ثانية` : `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) return isAR ? `${(seconds / 60).toFixed(0)} دقيقة` : `${(seconds / 60).toFixed(0)} minutes`;
  if (seconds < 86400) return isAR ? `${(seconds / 3600).toFixed(0)} ساعة` : `${(seconds / 3600).toFixed(0)} hours`;
  if (seconds < 31557600) return isAR ? `${(seconds / 86400).toFixed(0)} يوماً` : `${(seconds / 86400).toFixed(0)} days`;
  const years = seconds / 31557600;
  if (years < 1000) return isAR ? `${years.toFixed(0)} سنة` : `${years.toFixed(0)} years`;
  return isAR ? `${human(years, true)} سنة` : `${human(years, false)} years`;
}

export default function ScaleLab({ onComplete }: { onComplete?: () => void }) {
  const isAR = useLocale() === "ar";
  const [exp, setExp] = useState(4);
  const [touched, setTouched] = useState(false);

  const { N, tries, rounds, tSec, qSec, ratio } = useMemo(() => {
    const N = 10 ** exp;
    const tries = N / 2;
    const rounds = Math.floor((Math.PI / 4) * Math.sqrt(N));
    return { N, tries, rounds, tSec: tries / PER_SEC, qSec: rounds / PER_SEC, ratio: tries / Math.max(rounds, 1) };
  }, [exp]);

  const onSlide = (v: number) => {
    setExp(v);
    if (!touched) { setTouched(true); onComplete?.(); }
  };

  const readout: React.CSSProperties = { fontFamily: mono, fontSize: 9, letterSpacing: "0.18em", color: LAB.textDim };
  const bay: React.CSSProperties = {
    background: LAB.panel, border: `1px solid ${LAB.edge}`, borderRadius: 14, padding: "20px 18px",
  };

  // Bars are on a log scale, or the classical one would be off the screen and
  // the quantum one invisible at every size worth looking at.
  const barOf = (v: number) => Math.max(3, (Math.log10(Math.max(v, 1)) / 18) * 100);

  return (
    <div style={{
      position: "relative", overflow: "hidden", borderRadius: 22,
      background: LAB.chassis, backgroundImage: LAB_GRID, backgroundSize: "26px 26px",
      border: `1px solid ${LAB.edge}`, boxShadow: "0 30px 70px rgba(10,19,16,.45)",
    }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(700px 220px at 50% -8%, ${Q.mid}22, transparent 70%)`,
      }} />

      <div style={{
        position: "relative", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        padding: "14px 18px", borderBottom: `1px solid ${LAB.edge}`, background: "rgba(0,0,0,.22)",
      }}>
        <Gauge size={13} style={{ color: LAB.phosphor }} />
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.22em", color: LAB.phosphor }}>
          {isAR ? "مختبر ٢ · كم يكبر الفارق؟" : "LAB 02 · HOW BIG DOES IT GET?"}
        </span>
        <span style={{ ...readout, marginInlineStart: "auto" }}>
          {isAR ? "بسرعة مليار محاولة في الثانية" : "AT A BILLION TRIES PER SECOND"}
        </span>
      </div>

      <div style={{ position: "relative", padding: 18, display: "grid", gap: 16 }}>

        {/* the one control */}
        <div style={bay}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={readout}>{isAR ? "عدد المفاتيح على الحلقة" : "KEYS ON THE RING"}</span>
            <span style={{
              fontFamily: mono, fontSize: 30, fontWeight: 700, color: LAB.phosphor, lineHeight: 1,
              textShadow: `0 0 14px ${LAB.phosphor}55`, marginInlineStart: "auto",
            }}>
              {human(N, isAR)}
            </span>
          </div>
          <input
            type="range"
            min={MIN_EXP}
            max={MAX_EXP}
            step={1}
            value={exp}
            onChange={e => onSlide(Number(e.target.value))}
            aria-label={isAR ? "عدد المفاتيح" : "Number of keys"}
            style={{ width: "100%", accentColor: LAB.phosphor, marginTop: 10, cursor: "pointer" }}
          />
          <div style={{ ...readout, display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span>{isAR ? "مئة" : "100"}</span>
            <span>{isAR ? "اسحب المؤشّر" : "DRAG ME"}</span>
            <span>{isAR ? "كوينتليون" : "1 QUINTILLION"}</span>
          </div>
        </div>

        {/* the two machines */}
        {([
          {
            key: "classical",
            label: isAR ? "الحاسوب الثابت · محاولات" : "STATIC COMPUTER · TRIES",
            sub: isAR ? "يجرّب مفتاحاً تلو الآخر" : "one key after another",
            value: tries, secs: tSec, colour: LAB.textDim, bar: "rgba(185,216,202,.35)",
          },
          {
            key: "quantum",
            label: isAR ? "الحاسوب الكمّي · جولات" : "QUANTUM COMPUTER · ROUNDS",
            sub: isAR ? "يمسك كل المفاتيح ويُخفت الخاطئة" : "holds them all, fades the wrong ones",
            value: rounds, secs: qSec, colour: LAB.phosphor, bar: LAB.phosphor,
          },
        ] as const).map(m => (
          <div key={m.key} style={bay}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...readout, color: m.key === "quantum" ? LAB.phosphorDim : LAB.textDim }}>{m.label}</span>
              <span style={{
                marginInlineStart: "auto", fontFamily: mono, fontSize: 26, fontWeight: 700,
                color: m.colour, lineHeight: 1,
              }}>
                {human(m.value, isAR)}
              </span>
            </div>
            <div style={{ fontFamily: bodyFont, fontSize: 13.5, color: LAB.textDim, margin: "4px 0 12px" }}>{m.sub}</div>
            <div style={{ height: 12, borderRadius: 99, background: "rgba(0,0,0,.4)", overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${barOf(m.value)}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 24 }}
                style={{
                  height: "100%", borderRadius: 99, background: m.bar,
                  boxShadow: m.key === "quantum" ? `0 0 14px ${LAB.phosphor}88` : "none",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <Clock size={11} style={{ color: m.colour, flexShrink: 0 }} />
              <span style={{ fontFamily: mono, fontSize: 12, color: m.colour }}>{duration(m.secs, isAR)}</span>
            </div>
          </div>
        ))}

        {/* the punchline */}
        <div style={{
          padding: "16px 18px", borderRadius: 12,
          background: "rgba(0,0,0,.26)", border: `1px solid ${LAB.edge}`,
        }}>
          <p style={{ fontFamily: bodyFont, fontSize: 15, lineHeight: 1.6, color: LAB.text, margin: 0 }}>
            {isAR
              ? `عند ${human(N, true)} مفتاح، الحاسوب الكمّي يحتاج عملاً أقل بنحو ${human(ratio, true)} مرة. وكلما كبر القفل اتّسع الفارق، لأن الجذر التربيعي ينمو أبطأ بكثير.`
              : `At ${human(N, false)} keys the quantum machine does about ${human(ratio, false)} times less work. The bigger the lock, the wider the gap, because a square root grows far more slowly.`}
          </p>
        </div>

        <p style={{ ...readout, margin: 0, lineHeight: 1.7 }}>
          {isAR
            ? "الأعمدة على مقياس لوغاريتمي، وإلا لاختفى العمود الكمّي تماماً."
            : "THE BARS USE A LOG SCALE, OR THE QUANTUM ONE WOULD BE TOO SMALL TO SEE"}
        </p>
      </div>
    </div>
  );
}
