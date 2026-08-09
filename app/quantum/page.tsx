"use client";

// ============================================================
// QUANTUM MAJLIS — THE PATH
//
// A path, not a grid of categories. Each station opens only once the one
// before it is finished, because the scripts are written that way: the Chest
// ends on Rouda's question and Grandfather reaching for the coin, and the Coin
// answers it. Out of order, the thread is lost.
// ============================================================

import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Lock } from "lucide-react";
import { QUANTUM_PATH, QUANTUM_UPCOMING, STEP_ORDER } from "@/app/lib/quantumData";
import { useQuantumProgress } from "@/hooks/useQuantumProgress";
import { QuantumHeader, QuantumFooter } from "@/components/quantum/QuantumChrome";
import QuantumField from "@/components/quantum/QuantumField";
import { Q, INK, BODY, LINE, PAPER, PAGE, GOLD, GOLD_DEEP, display, bodyFont, mono, EASE, CARD_SHADOW } from "@/components/quantum/theme";

export default function QuantumPathPage() {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  const { loaded, isUnlocked, isLessonDone, isStepDone, doneCount } = useQuantumProgress();

  const total = QUANTUM_PATH.length + QUANTUM_UPCOMING.length;

  return (
    <div style={{ background: PAGE, minHeight: "100vh", color: INK, fontFamily: bodyFont }}>
      <QuantumHeader />

      {/* ── Hero ── */}
      <section style={{ position: "relative", padding: "calc(62px + clamp(44px,7vw,80px)) clamp(18px,4vw,36px) clamp(28px,4vw,44px)" }}>
        <QuantumField height={340} />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 11, marginBottom: 16,
            fontFamily: mono, fontSize: 9.5, letterSpacing: "0.26em", color: GOLD_DEEP,
          }}>
            <span aria-hidden style={{ width: 18, height: 1, background: `${GOLD}99` }} />
            {isAR ? "الرحلة" : "THE PATH"}
            <span aria-hidden style={{ width: 18, height: 1, background: `${GOLD}99` }} />
          </div>

          <h1 style={{
            fontFamily: display(isAR), fontWeight: 900,
            fontSize: "clamp(2.1rem,5vw,3.4rem)", lineHeight: 1.1,
            letterSpacing: isAR ? 0 : "-0.02em", margin: "0 0 16px",
          }}>
            {isAR ? <>مجلس <span style={{ color: Q.mid }}>الكم</span></> : <>Quantum<span style={{ color: Q.mid }}>Majlis</span></>}
          </h1>

          <p style={{ fontFamily: bodyFont, fontSize: "clamp(1.05rem,2.1vw,1.3rem)", lineHeight: 1.55, color: BODY, margin: "0 auto", maxWidth: 500 }}>
            {isAR
              ? "الشيء يمكن أن يكون شيئين معاً. تعال وانظر."
              : "A thing can be two things at once. Come and see."}
          </p>

          {loaded && (
            <div style={{ marginTop: 22, fontFamily: mono, fontSize: 10, letterSpacing: "0.16em", color: BODY }}>
              {isAR ? `أنهيت ${doneCount} من ${total} دروس` : `${doneCount} OF ${total} LESSONS DONE`}
            </div>
          )}
        </div>
      </section>

      {/* ── The stations ── */}
      <section style={{ padding: "0 clamp(18px,4vw,36px) clamp(56px,8vw,90px)" }}>
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* the rail the stations sit on */}
          <span aria-hidden style={{
            position: "absolute", insetInlineStart: 43, top: 30, bottom: 30, width: 2, borderRadius: 2,
            background: `linear-gradient(180deg, ${Q.mid}66, ${Q.mid}22 60%, transparent)`,
            // Behind the stations. Positioned elements paint above static ones,
            // so without this the rail draws straight through each node.
            zIndex: 0,
          }} />

          {QUANTUM_PATH.map((lesson, i) => {
            // Until storage has been read, treat everything as locked except the
            // first, so a return visit never flashes the wrong state.
            const unlocked = loaded ? isUnlocked(lesson.slug) : i === 0;
            const done = loaded && isLessonDone(lesson.slug);
            const started = loaded && STEP_ORDER.some(s => isStepDone(lesson.slug, s));

            const inner = (
              <>
                {/* station number / state */}
                <span style={{
                  width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                  display: "grid", placeItems: "center",
                  fontFamily: mono, fontSize: 13, fontWeight: 700,
                  color: done || unlocked ? PAPER : BODY,
                  background: done ? Q.deep : unlocked ? Q.mid : PAGE,
                  border: `${unlocked ? 1 : 1.5}px ${unlocked ? "solid" : "dashed"} ${unlocked ? Q.mid : LINE}`,
                }}>
                  {done ? <Check size={18} /> : unlocked ? lesson.order : <Lock size={15} />}
                </span>

                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    display: "block", fontFamily: display(isAR),
                    fontSize: isAR ? 20 : 18, fontWeight: 700, color: INK, lineHeight: 1.25,
                  }}>
                    {isAR ? lesson.name_ar : lesson.name_en}
                  </span>
                  <span style={{ display: "block", fontFamily: bodyFont, fontSize: 15, color: BODY, marginTop: 3 }}>
                    {isAR ? lesson.subtitle_ar : lesson.subtitle_en}
                  </span>

                  {/* the three beats */}
                  {unlocked && (
                    <span style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      {STEP_ORDER.map(step => {
                        const on = loaded && isStepDone(lesson.slug, step);
                        const text = { video: isAR ? "فيلم" : "Video", board: isAR ? "لوح" : "Board", lab: isAR ? "مختبر" : "Lab" }[step];
                        return (
                          <span key={step} style={{
                            fontFamily: mono, fontSize: 8.5, letterSpacing: "0.12em",
                            padding: "3px 9px", borderRadius: 99,
                            color: on ? Q.deep : BODY,
                            background: on ? Q.tint : "transparent",
                            border: `1px solid ${on ? Q.mid + "55" : LINE}`,
                          }}>
                            {on ? "✓ " : ""}{text.toUpperCase()}
                          </span>
                        );
                      })}
                    </span>
                  )}
                </span>

                {unlocked
                  ? <ArrowRight size={17} style={{ color: Q.mid, flexShrink: 0, transform: isAR ? "scaleX(-1)" : "none" }} />
                  : <span style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: "0.12em", color: BODY, flexShrink: 0 }}>
                      {isAR ? "أنهِ ما قبله" : "FINISH THE ONE BEFORE"}
                    </span>}
              </>
            );

            const shell: React.CSSProperties = {
              display: "flex", alignItems: "center", gap: 15,
              padding: "18px 20px", borderRadius: 18, textDecoration: "none",
              background: unlocked ? PAPER : "transparent",
              border: `1px solid ${unlocked ? (started ? Q.mid + "40" : LINE) : LINE}`,
              boxShadow: unlocked ? CARD_SHADOW : "none",
              opacity: unlocked ? 1 : 0.5,
            };

            return (
              <motion.div
                key={lesson.slug}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.06 * i, ease: EASE }}
                style={{ position: "relative", zIndex: 1 }}
              >
                {unlocked ? (
                  <Link href={`/quantum/${lesson.slug}`} style={shell}>{inner}</Link>
                ) : (
                  <div style={{ ...shell, cursor: "default" }} aria-disabled="true">{inner}</div>
                )}
              </motion.div>
            );
          })}

          {/* still being written */}
          {QUANTUM_UPCOMING.map((s, i) => (
            <div key={s.name_en} style={{
              position: "relative", zIndex: 1,
              display: "flex", alignItems: "center", gap: 15,
              padding: "18px 20px", borderRadius: 18,
              background: PAGE, border: `1px dashed ${LINE}`, opacity: 0.42,
            }}>
              <span style={{
                width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                display: "grid", placeItems: "center",
                fontFamily: mono, fontSize: 13, color: BODY,
                border: `1.5px dashed ${LINE}`,
              }}>
                {QUANTUM_PATH.length + i + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: display(isAR), fontSize: isAR ? 20 : 18, fontWeight: 700, color: INK }}>
                  {isAR ? s.name_ar : s.name_en}
                </span>
                <span style={{ display: "block", fontFamily: bodyFont, fontSize: 15, color: BODY, marginTop: 3 }}>
                  {isAR ? s.sub_ar : s.sub_en}
                </span>
              </span>
              <span style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: "0.14em", color: BODY, flexShrink: 0 }}>
                {isAR ? "قيد الكتابة" : "BEING WRITTEN"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <QuantumFooter />
    </div>
  );
}
