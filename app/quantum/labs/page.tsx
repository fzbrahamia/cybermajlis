"use client";

// ============================================================
// QUANTUM LABS
//
// Labs stand on their own here rather than being trapped inside one lesson,
// so the list can grow as far as we like. Adding one is a component plus a row
// in QUANTUM_LABS.
//
// No sign-in needed: a lab saves nothing, it is a bench you walk up to.
// ============================================================

import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FlaskConical, Clock, Hammer } from "lucide-react";
import { QUANTUM_LABS, lessonBySlug } from "@/app/lib/quantumData";
import { QuantumHeader, QuantumFooter } from "@/components/quantum/QuantumChrome";
import {
  Q, INK, BODY, LINE, PAPER, PAGE, GOLD, GOLD_DEEP,
  display, bodyFont, mono, EASE, CARD_SHADOW,
} from "@/components/quantum/theme";

export default function QuantumLabsPage() {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();

  const ready = QUANTUM_LABS.filter(l => l.ready).length;

  return (
    <div style={{ background: PAGE, minHeight: "100vh", color: INK, fontFamily: bodyFont }}>
      <QuantumHeader />

      <section style={{ padding: "calc(62px + clamp(38px,6vw,68px)) clamp(18px,4vw,36px) clamp(56px,8vw,90px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "clamp(32px,5vw,52px)" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 11, marginBottom: 14,
              fontFamily: mono, fontSize: 9, letterSpacing: "0.26em", color: GOLD_DEEP,
            }}>
              <span aria-hidden style={{ width: 18, height: 1, background: `${GOLD}99` }} />
              {isAR ? `${ready} مختبر جاهز` : `${ready} BENCHES READY`}
              <span aria-hidden style={{ width: 18, height: 1, background: `${GOLD}99` }} />
            </div>
            <h1 style={{
              fontFamily: display(isAR), fontWeight: 900,
              fontSize: "clamp(2rem,4.6vw,3rem)", lineHeight: 1.1,
              letterSpacing: isAR ? 0 : "-0.03em", margin: "0 0 14px",
            }}>
              {isAR ? <>مختبرات <span style={{ color: Q.mid }}>الكم</span></> : <>Quantum<span style={{ color: Q.mid }}>Labs</span></>}
            </h1>
            <p style={{ fontFamily: bodyFont, fontSize: "clamp(1.05rem,2vw,1.25rem)", lineHeight: 1.55, color: BODY, margin: "0 auto", maxWidth: 460 }}>
              {isAR
                ? "اجلس على أي منضدة. لا حاجة لدرس ولا لحساب."
                : "Walk up to any bench. No lesson needed, no account needed."}
            </p>
          </div>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {QUANTUM_LABS.map((lab, i) => {
              const lesson = lab.lesson ? lessonBySlug(lab.lesson) : null;
              const inner = (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{
                      width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                      display: "grid", placeItems: "center",
                      background: lab.ready ? Q.tint : "rgba(17,26,21,.05)",
                      color: lab.ready ? Q.deep : BODY,
                    }}>
                      {lab.ready ? <FlaskConical size={16} /> : <Hammer size={16} />}
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.18em", color: BODY }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{
                      marginInlineStart: "auto", fontFamily: mono, fontSize: 8.5,
                      letterSpacing: "0.16em",
                      color: lab.ready ? Q.deep : BODY,
                      padding: "4px 10px", borderRadius: 999,
                      border: `1px solid ${lab.ready ? Q.mid + "44" : LINE}`,
                      background: lab.ready ? Q.tint : "transparent",
                    }}>
                      {lab.ready
                        ? (isAR ? "جاهز" : "READY")
                        : (isAR ? "قيد البناء" : "BEING BUILT")}
                    </span>
                  </div>

                  <h2 style={{
                    fontFamily: display(isAR), fontSize: isAR ? 21 : 19, fontWeight: 800,
                    letterSpacing: isAR ? 0 : "-0.02em", color: INK, margin: "0 0 8px", lineHeight: 1.2,
                  }}>
                    {isAR ? lab.title_ar : lab.title_en}
                  </h2>
                  <p style={{ fontFamily: bodyFont, fontSize: 16, lineHeight: 1.6, color: BODY, margin: "0 0 18px", flex: 1 }}>
                    {isAR ? lab.does_ar : lab.does_en}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 9, letterSpacing: "0.14em", color: BODY }}>
                      <Clock size={11} /> {lab.minutes} {isAR ? "دقائق" : "MIN"}
                    </span>
                    {lesson && (
                      <span style={{ fontFamily: bodyFont, fontSize: 13.5, color: BODY, opacity: 0.85 }}>
                        {isAR ? `مع ${lesson.name_ar}` : `goes with ${lesson.name_en}`}
                      </span>
                    )}
                    {lab.ready && (
                      <span style={{
                        marginInlineStart: "auto", display: "inline-flex", alignItems: "center", gap: 8,
                        fontFamily: display(isAR), fontSize: 12, fontWeight: 700,
                        padding: "10px 18px", borderRadius: 999, background: Q.deep, color: "#fff",
                      }}>
                        {isAR ? "ابدأ" : "OPEN"}
                        <ArrowRight size={13} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
                      </span>
                    )}
                  </div>
                </>
              );

              const shell: React.CSSProperties = {
                display: "flex", flexDirection: "column", textDecoration: "none",
                padding: "24px 22px", borderRadius: 22, background: PAPER,
                border: `1px solid ${lab.ready ? LINE : "transparent"}`,
                boxShadow: lab.ready ? CARD_SHADOW : "none",
                opacity: lab.ready ? 1 : 0.6,
                outline: lab.ready ? "none" : `1px dashed ${LINE}`,
              };

              return (
                <motion.div
                  key={lab.id}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.06 * i, ease: EASE }}
                  whileHover={reduce || !lab.ready ? undefined : { y: -5 }}
                  style={{ display: "flex" }}
                >
                  {lab.ready ? (
                    <Link href={`/quantum/labs/${lab.id}`} style={{ ...shell, width: "100%" }}>{inner}</Link>
                  ) : (
                    <div style={{ ...shell, width: "100%", cursor: "default" }}>{inner}</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <QuantumFooter />
    </div>
  );
}
