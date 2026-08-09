"use client";

// ============================================================
// QUANTUM MAJLIS — DASHBOARD
//
// Where you stand and the two doors out: Paths and Labs.
//
// Deliberately no lesson titles here. Naming them turns the dashboard into a
// second, worse copy of the path page, and the titles are the one thing worth
// meeting in order. Progress shows as numbered stations instead.
// ============================================================

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import {
  ArrowRight, FlaskConical, Route, Check,
} from "lucide-react";
import { QUANTUM_PATH, QUANTUM_LABS, QUANTUM_UPCOMING, STEP_ORDER } from "@/app/lib/quantumData";
import { useQuantumProgress } from "@/hooks/useQuantumProgress";
import { QuantumHeader, QuantumFooter } from "@/components/quantum/QuantumChrome";
import QuantumField from "@/components/quantum/QuantumField";
import {
  Q, INK, BODY, LINE, PAPER, PAGE,
  display, bodyFont, mono, EASE, CARD_SHADOW,
} from "@/components/quantum/theme";

export default function QuantumDashboard() {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  const { authState, doneCount, stepCount, currentLesson, isLessonDone } = useQuantumProgress();

  const [username, setUsername] = useState("");
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { setUsername(""); return; }
      return onSnapshot(doc(db, "user", u.uid), snap => {
        if (snap.exists()) setUsername(snap.data().username || "");
      });
    });
    return () => unsub();
  }, []);

  const signedIn = authState === "signed-in";
  const written = QUANTUM_PATH.length;
  const total = written + QUANTUM_UPCOMING.length;
  const totalSteps = written * STEP_ORDER.length;
  const pct = totalSteps ? Math.round((stepCount / totalSteps) * 100) : 0;
  const next = currentLesson();
  const readyLabs = QUANTUM_LABS.filter(l => l.ready).length;

  /** Numbered stations. Written ones can be done or current; the rest are dashed. */
  const stations = [
    ...QUANTUM_PATH.map(l => ({ written: true, done: signedIn && isLessonDone(l.slug), current: signedIn && next?.slug === l.slug })),
    ...QUANTUM_UPCOMING.map(() => ({ written: false, done: false, current: false })),
  ];

  const card: React.CSSProperties = {
    background: PAPER, border: `1px solid ${LINE}`, borderRadius: 22,
    padding: "26px 24px", boxShadow: CARD_SHADOW, textDecoration: "none",
    display: "flex", flexDirection: "column",
  };

  return (
    <div style={{ background: PAGE, minHeight: "100vh", color: INK, fontFamily: bodyFont }}>
      <QuantumHeader />

      {/* ── who and where ── */}
      <section style={{ position: "relative", padding: "calc(62px + clamp(38px,6vw,64px)) clamp(18px,4vw,36px) clamp(22px,3vw,34px)" }}>
        <QuantumField height={300} />
        <div style={{ position: "relative", maxWidth: 980, margin: "0 auto" }}>
          <h1 style={{
            fontFamily: display(isAR), fontWeight: 900,
            fontSize: "clamp(1.9rem,4.4vw,2.9rem)", lineHeight: 1.1,
            letterSpacing: isAR ? 0 : "-0.03em", margin: "0 0 12px",
          }}>
            {signedIn && username
              ? (isAR ? `أهلاً، ${username}` : `Welcome back, ${username}`)
              : (isAR ? "الشيء يمكن أن يكون شيئين معاً." : "A thing can be two things at once.")}
          </h1>
          <p style={{ fontFamily: bodyFont, fontSize: "clamp(1.05rem,2vw,1.25rem)", lineHeight: 1.55, color: BODY, margin: 0, maxWidth: 460 }}>
            {signedIn
              ? (isAR ? "تابع من حيث توقّفت، أو اجلس على أي منضدة." : "Pick up where you left off, or walk up to any bench.")
              : (isAR ? "تعال وانظر." : "Come and see.")}
          </p>
        </div>
      </section>

      {/* ── progress ── */}
      <section style={{ padding: "0 clamp(18px,4vw,36px) clamp(20px,3vw,30px)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ ...card, padding: "24px 24px" }}>
              <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", marginBottom: 24 }}>
                {([
                  { n: `${doneCount}/${total}`, en: "lessons finished",   ar: "دروس أنهيتها" },
                  { n: `${stepCount}`,          en: "steps done",         ar: "خطوة أتممتها" },
                  { n: `${pct}%`,               en: "of what is written", ar: "ممّا كُتب حتى الآن" },
                ] as const).map(k => (
                  <div key={k.en}>
                    <div style={{
                      fontFamily: display(isAR), fontSize: "clamp(1.7rem,3vw,2.2rem)", fontWeight: 900,
                      letterSpacing: isAR ? 0 : "-0.02em", color: Q.deep, lineHeight: 1,
                    }}>
                      {k.n}
                    </div>
                    <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.16em", color: BODY, marginTop: 7, textTransform: "uppercase" }}>
                      {isAR ? k.ar : k.en}
                    </div>
                  </div>
                ))}
              </div>

              {/* stations, numbered rather than named */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                {stations.map((st, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      width: 30, height: 30, borderRadius: "50%",
                      display: "grid", placeItems: "center",
                      fontFamily: mono, fontSize: 11, fontWeight: 700,
                      color: st.done ? "#fff" : st.written ? Q.deep : BODY,
                      background: st.done ? Q.deep : st.current ? Q.tint : "transparent",
                      border: `${st.written ? 1 : 1.5}px ${st.written ? "solid" : "dashed"} ${st.done || st.current ? Q.mid : LINE}`,
                    }}>
                      {st.done ? <Check size={13} /> : i + 1}
                    </span>
                    {i < stations.length - 1 && (
                      <span aria-hidden style={{ width: 12, height: 1.5, borderRadius: 2, background: st.done ? Q.mid : LINE }} />
                    )}
                  </span>
                ))}
              </div>

              <div style={{ height: 8, borderRadius: 99, background: "rgba(17,26,21,.06)", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: EASE }}
                  style={{ height: "100%", borderRadius: 99, background: Q.mid }}
                />
              </div>

              {next && (
                <Link href={`/quantum/paths/${next.slug}`} style={{
                  display: "inline-flex", alignItems: "center", gap: 10, marginTop: 22, alignSelf: "flex-start",
                  padding: "13px 26px", borderRadius: 999, textDecoration: "none",
                  fontFamily: display(isAR), fontSize: 12.5, fontWeight: 700,
                  background: Q.deep, color: "#fff",
                }}>
                  {doneCount === 0
                    ? (isAR ? "ابدأ المسار" : "Start the path")
                    : (isAR ? "تابع من حيث توقّفت" : "Pick up where you left off")}
                  <ArrowRight size={14} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
                </Link>
              )}
            </div>
        </div>
      </section>

      {/* ── the two doors ── */}
      <section style={{ padding: "0 clamp(18px,4vw,36px) clamp(24px,3vw,34px)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {([
            {
              href: "/quantum/paths", Icon: Route,
              title_en: "Paths", title_ar: "المسارات",
              body_en: "Lessons in order. A story, then what it really means, then a bench.",
              body_ar: "دروس بالترتيب. قصّة، ثم ما تعنيه حقاً، ثم منضدة.",
              meta_en: `${written} written · ${QUANTUM_UPCOMING.length} coming`,
              meta_ar: `${written} مكتوبة · ${QUANTUM_UPCOMING.length} قادمة`,
            },
            {
              href: "/quantum/labs", Icon: FlaskConical,
              title_en: "Labs", title_ar: "المختبرات",
              body_en: "Benches you can walk up to on their own. No lesson needed.",
              body_ar: "مناضد تجلس إليها مباشرة. بلا درس ولا حساب.",
              meta_en: `${readyLabs} ready · ${QUANTUM_LABS.length - readyLabs} being built`,
              meta_ar: `${readyLabs} جاهز · ${QUANTUM_LABS.length - readyLabs} قيد البناء`,
            },
          ] as const).map((d, i) => (
            <motion.div
              key={d.href}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06 * i, ease: EASE }}
              whileHover={reduce ? undefined : { y: -5 }}
              style={{ display: "flex" }}
            >
              <Link href={d.href} style={{ ...card, width: "100%" }}>
                <span style={{
                  width: 40, height: 40, borderRadius: 13, marginBottom: 16,
                  display: "grid", placeItems: "center", background: Q.tint, color: Q.deep,
                }}>
                  <d.Icon size={18} />
                </span>
                <h2 style={{
                  fontFamily: display(isAR), fontSize: isAR ? 23 : 21, fontWeight: 800,
                  letterSpacing: isAR ? 0 : "-0.02em", color: INK, margin: "0 0 8px",
                }}>
                  {isAR ? d.title_ar : d.title_en}
                </h2>
                <p style={{ fontFamily: bodyFont, fontSize: 16, lineHeight: 1.6, color: BODY, margin: "0 0 16px", flex: 1 }}>
                  {isAR ? d.body_ar : d.body_en}
                </p>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.14em", color: BODY }}>
                    {isAR ? d.meta_ar : d.meta_en}
                  </span>
                  <ArrowRight size={15} style={{ marginInlineStart: "auto", color: Q.mid, transform: isAR ? "scaleX(-1)" : "none" }} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <QuantumFooter />
    </div>
  );
}
