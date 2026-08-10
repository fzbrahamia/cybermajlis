"use client";

// ============================================================
// QUANTUM LESSON
//
// Two columns, not a stack. The lesson identity and the three beats sit in a
// sticky rail at the side, and the content sits beside them, so nothing has to
// be scrolled past to reach the thing you came for.
//
//   video  the story, simplified with an analogy
//   board  what the analogy really means, and where it breaks
//   lab    the same idea hands-on, classical beside quantum
//
// Each board widget has its own shape. A board of identical cards reads as a
// document; a board of different objects reads as a board. One widget
// ("Where the story was simplifying") appears in every lesson, because the
// scripts promise it out loud: Grandfather says the coin only helps you
// imagine a qubit, and that real ones are stranger. Here that is paid.
// ============================================================

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Film, LayoutGrid, FlaskConical,
  Play, Lock, Quote, AlertTriangle, Globe2,
} from "lucide-react";
import { lessonBySlug, QUANTUM_PATH, STEP_ORDER, type StepId, type Widget } from "@/app/lib/quantumData";
import { useQuantumProgress } from "@/hooks/useQuantumProgress";
import { QuantumHeader, QuantumFooter } from "@/components/quantum/QuantumChrome";
// OLD LABS — kept in the project for reference, but no longer rendered here.
// import DrawerSearchLab from "@/components/quantum/DrawerSearchLab";
// import ScaleLab from "@/components/quantum/ScaleLab";
import QuantumLessonGames from "@/components/quantum/QuantumLessonGames";
import QuantumField from "@/components/quantum/QuantumField";
import {
  Q, INK, BODY, LINE, PAPER, PAGE, GOLD, GOLD_DEEP,
  display, bodyFont, mono, EASE, CARD_SHADOW,
} from "@/components/quantum/theme";

/* ══════════════ board widgets ══════════════ */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section style={{
      background: PAPER, border: `1px solid ${LINE}`, borderRadius: 22,
      padding: 26, boxShadow: CARD_SHADOW,
    }}>
      {children}
    </section>
  );
}

function Eyebrow({ children, tone = Q.deep }: { children: React.ReactNode; tone?: string }) {
  return (
    <div style={{
      fontFamily: mono, fontSize: 9, letterSpacing: "0.22em",
      color: tone, marginBottom: 14, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

function BoardWidget({ w }: { w: Widget }) {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();

  // ── recap: a pull quote on dark, not a paragraph in a box ──
  if (w.kind === "recap") {
    return (
      <section style={{
        position: "relative", overflow: "hidden", borderRadius: 22,
        background: `linear-gradient(150deg, ${Q.deep}, #0E2A1E)`, padding: "34px 30px",
      }}>
        <QuantumField height={280} />
        <div style={{ position: "relative" }}>
          <Quote size={20} style={{ color: Q.soft, marginBottom: 14, opacity: 0.85 }} />
          <Eyebrow tone={Q.soft}>{isAR ? w.title_ar : w.title_en}</Eyebrow>
          <p style={{
            fontFamily: bodyFont, fontSize: "clamp(1.15rem,2.1vw,1.45rem)",
            lineHeight: 1.55, color: "rgba(255,255,255,.93)", margin: 0, maxWidth: 640,
          }}>
            {isAR ? w.body_ar : w.body_en}
          </p>
        </div>
      </section>
    );
  }

  // ── mapping: story, then what it actually is, joined by a node ──
  if (w.kind === "mapping") {
    return (
      <Card>
        <Eyebrow>{isAR ? w.title_ar : w.title_en}</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {w.rows.map((r, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 * i, ease: EASE }}
              style={{
                display: "grid", gap: "6px 16px", alignItems: "start",
                gridTemplateColumns: "auto minmax(0, 1fr)",
                padding: "16px 0", borderTop: i ? `1px solid ${LINE}` : "none",
              }}
            >
              <span aria-hidden style={{
                width: 9, height: 9, borderRadius: "50%", marginTop: 8,
                background: Q.mid, boxShadow: `0 0 0 4px ${Q.tint}`,
              }} />
              <div>
                <div style={{ fontFamily: bodyFont, fontSize: 16.5, fontStyle: "italic", color: INK, marginBottom: 5 }}>
                  {isAR ? r.story_ar : r.story_en}
                </div>
                <div style={{ fontFamily: bodyFont, fontSize: 16, lineHeight: 1.65, color: BODY }}>
                  {isAR ? r.real_ar : r.real_en}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    );
  }

  // ── caveat: a correction notice, deliberately in another voice ──
  if (w.kind === "caveat") {
    return (
      <section style={{
        background: "rgba(197,165,126,.10)", border: `1px solid ${GOLD}55`,
        borderRadius: 22, padding: 26,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <AlertTriangle size={15} style={{ color: GOLD_DEEP }} />
          <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.22em", color: GOLD_DEEP, textTransform: "uppercase" }}>
            {isAR ? w.title_ar : w.title_en}
          </span>
        </div>
        <p style={{ fontFamily: bodyFont, fontSize: 15, fontStyle: "italic", color: BODY, margin: "0 0 20px" }}>
          {isAR ? "كل قصة تبسّط شيئاً. هنا نقول ماذا بالضبط." : "Every story simplifies something. Here is exactly what."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {w.items.map((it, i) => (
            <div key={i} style={{ borderTop: i ? `1px solid ${GOLD}44` : "none", paddingTop: i ? 18 : 0 }}>
              <p style={{ fontFamily: bodyFont, fontSize: 16, fontStyle: "italic", color: INK, margin: "0 0 8px", opacity: 0.72 }}>
                {isAR ? `القصة قالت: ${it.story_ar}` : `The story said: ${it.story_en}`}
              </p>
              <p style={{ fontFamily: bodyFont, fontSize: 16.5, lineHeight: 1.7, color: INK, margin: 0 }}>
                <strong style={{ color: GOLD_DEEP, fontWeight: 700 }}>{isAR ? "وفي الحقيقة: " : "In truth: "}</strong>
                {isAR ? it.truth_ar : it.truth_en}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── numbers: bars, because a table cannot show one column dwarfing another ──
  if (w.kind === "numbers") {
    const nums = w.rows.map(r => [Number(r[1].replace(/,/g, "")), Number(r[2].replace(/,/g, ""))] as const);
    const peak = Math.max(...nums.map(([a]) => a));
    return (
      <Card>
        <Eyebrow>{isAR ? w.title_ar : w.title_en}</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {w.rows.map((r, i) => {
            const [cls, qnt] = nums[i];
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontFamily: display(isAR), fontSize: 15, fontWeight: 700, color: INK }}>
                    {r[0]} {isAR ? "مفتاح" : "keys"}
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: BODY, whiteSpace: "nowrap" }}>
                    {r[1]} <span style={{ opacity: 0.4 }}>vs</span>{" "}
                    <span style={{ color: Q.deep, fontWeight: 700 }}>{r[2]}</span>
                  </span>
                </div>
                {([[cls, BODY, 0.25, 7], [qnt, Q.mid, 1, 11]] as const).map(([v, c, o, h], k) => (
                  <div key={k} style={{ height: h, background: "rgba(17,26,21,.05)", borderRadius: 99, marginBottom: k ? 0 : 5, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(1.2, (v / peak) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.08 * i + (k ? 0.12 : 0), ease: EASE }}
                      style={{ height: "100%", borderRadius: 99, background: c, opacity: o }}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 18, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: mono, fontSize: 9, letterSpacing: "0.14em", color: BODY }}>
            <span style={{ width: 14, height: 6, borderRadius: 99, background: BODY, opacity: 0.25 }} /> {w.cols[1].toUpperCase()}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: mono, fontSize: 9, letterSpacing: "0.14em", color: Q.deep }}>
            <span style={{ width: 14, height: 6, borderRadius: 99, background: Q.mid }} /> {w.cols[2].toUpperCase()}
          </span>
        </div>
        <p style={{ fontFamily: bodyFont, fontSize: 15.5, lineHeight: 1.65, color: BODY, margin: "16px 0 0", fontStyle: "italic" }}>
          {isAR ? w.note_ar : w.note_en}
        </p>
      </Card>
    );
  }

  // ── real world: tiles ──
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Globe2 size={15} style={{ color: Q.deep }} />
        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.22em", color: Q.deep, textTransform: "uppercase" }}>
          {isAR ? w.title_ar : w.title_en}
        </span>
      </div>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {w.items.map((it, i) => (
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 * i, ease: EASE }}
            style={{ padding: "18px 16px", borderRadius: 16, background: Q.tint, border: `1px solid ${Q.mid}22` }}
          >
            <div style={{ fontFamily: display(isAR), fontSize: isAR ? 17 : 15.5, fontWeight: 700, color: Q.deep, marginBottom: 7 }}>
              {isAR ? it.head_ar : it.head_en}
            </div>
            <p style={{ fontFamily: bodyFont, fontSize: 15.5, lineHeight: 1.6, color: BODY, margin: 0 }}>
              {isAR ? it.body_ar : it.body_en}
            </p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

/* ════════════════════════ PAGE ════════════════════════ */
export default function QuantumLessonPage({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: slug } = use(params);
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  const lesson = lessonBySlug(slug);

  const { loaded, isUnlocked, isStepDone, isLessonDone, markStep } = useQuantumProgress();
  const [step, setStep] = useState<StepId>("video");

  useEffect(() => {
    if (!loaded || !lesson) return;
    const next = STEP_ORDER.find(s => !isStepDone(lesson.slug, s));
    if (next) setStep(next);
  }, [loaded, lesson, isStepDone]);

  // Switching beats scrolls back up. Without this the lab opens with the page
  // still scrolled to wherever the board left it, below the equipment.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // The board is marked read by opening it. There is no way to verify reading,
  // and the two beats that carry the gate are the video and the lab.
  useEffect(() => {
    if (step === "board" && lesson) markStep(lesson.slug, "board");
  }, [step, lesson, markStep]);

  if (!lesson) notFound();

  const idx = QUANTUM_PATH.findIndex(l => l.slug === lesson.slug);
  const previousDone = idx <= 0 || (loaded && isLessonDone(QUANTUM_PATH[idx - 1].slug));
  // Fallback to the explicit previous-lesson rule as well as the hook. This
  // prevents a completed station from staying visually locked if auth/progress
  // hydration arrives in a slightly different order.
  const locked = loaded && !(isUnlocked(lesson.slug) || previousDone);
  const nextLesson = QUANTUM_PATH[idx + 1];
  const lessonDone = loaded && isLessonDone(lesson.slug);

  const STEP_META: { id: StepId; icon: typeof Film; en: string; ar: string; note_en: string; note_ar: string }[] = [
    { id: "video", icon: Film,         en: "The story", ar: "القصّة",  note_en: "Watch first",     note_ar: "شاهد أولاً" },
    { id: "board", icon: LayoutGrid,   en: "The board", ar: "اللوح",   note_en: "What it means",   note_ar: "ماذا يعني" },
    { id: "lab",   icon: FlaskConical, en: "The lab",   ar: "المختبر", note_en: "Try it yourself", note_ar: "جرّبه بنفسك" },
  ];

  const cta: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer",
    padding: "14px 26px", borderRadius: 999, border: "none", textDecoration: "none",
    fontFamily: display(isAR), fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em",
    background: Q.deep, color: "#fff",
  };

  if (locked) {
    return (
      <div style={{ background: PAGE, minHeight: "100vh", color: INK, fontFamily: bodyFont }}>
        <QuantumHeader />
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "calc(62px + 20vh) clamp(18px,4vw,36px) 18vh", textAlign: "center" }}>
          <Lock size={26} style={{ color: Q.mid, marginBottom: 16 }} />
          <h1 style={{ fontFamily: display(isAR), fontSize: 28, fontWeight: 900, letterSpacing: isAR ? 0 : "-0.02em", margin: "0 0 12px" }}>
            {isAR ? "هذه المحطة لم تُفتح بعد" : "This station is not open yet"}
          </h1>
          <p style={{ fontFamily: bodyFont, fontSize: 17, lineHeight: 1.65, color: BODY, margin: "0 0 26px" }}>
            {isAR
              ? "محطات هذا المسار مترابطة. أنهِ المحطة السابقة أولاً، فهي التي تطرح السؤال الذي تجيب عنه هذه."
              : "The stations on this path are linked. Finish the one before it first, because that is the station that asks the question this one answers."}
          </p>
          <Link href="/quantum" style={cta}>
            {isAR ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {isAR ? "عد إلى المسار" : "Back to the path"}
          </Link>
        </div>
        <QuantumFooter />
      </div>
    );
  }

  return (
    <div style={{ background: PAGE, minHeight: "100vh", color: INK, fontFamily: bodyFont }}>
      <QuantumHeader />

      <style>{`
        .ql-grid { display: grid; grid-template-columns: 268px minmax(0, 1fr); gap: clamp(28px, 4vw, 56px); }
        .ql-rail { position: sticky; top: calc(62px + 26px); align-self: start; }
        @media (max-width: 900px) {
          .ql-grid { grid-template-columns: minmax(0, 1fr); gap: 24px; }
          .ql-rail { position: static; }
          .ql-steps { flex-direction: row !important; flex-wrap: wrap; }
          .ql-steps > button { width: auto !important; }
          .ql-step-note { display: none; }
        }
      `}</style>

      <div className="ql-grid" style={{
        maxWidth: 1240, margin: "0 auto",
        padding: "calc(62px + clamp(26px,4vw,44px)) clamp(18px,4vw,36px) clamp(56px,8vw,90px)",
      }}>

        {/* ── the rail: identity and the three beats, always in view ── */}
        <aside className="ql-rail">
          <Link href="/quantum" style={{
            display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 20,
            fontFamily: mono, fontSize: 9, letterSpacing: "0.18em", color: BODY,
          }}>
            {isAR ? <ArrowRight size={11} /> : <ArrowLeft size={11} />}
            {isAR ? "المسار" : "THE PATH"}
          </Link>

          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.22em", color: GOLD_DEEP, marginBottom: 10 }}>
            {isAR ? `المحطة ${lesson.order}` : `STATION ${String(lesson.order).padStart(2, "0")}`}
          </div>

          <h1 style={{
            fontFamily: display(isAR), fontWeight: 900,
            fontSize: "clamp(1.6rem,2.6vw,2.1rem)", lineHeight: 1.08,
            letterSpacing: isAR ? 0 : "-0.03em", margin: "0 0 8px",
          }}>
            {isAR ? lesson.name_ar : lesson.name_en}
          </h1>
          <p style={{ fontFamily: bodyFont, fontSize: 16, fontStyle: "italic", color: BODY, margin: "0 0 24px", lineHeight: 1.5 }}>
            {isAR ? lesson.subtitle_ar : lesson.subtitle_en}
          </p>

          <div className="ql-steps" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STEP_META.map(s => {
              const on = step === s.id;
              const done = loaded && isStepDone(lesson.slug, s.id);
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  aria-pressed={on}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "start",
                    padding: "12px 14px", borderRadius: 14, width: "100%",
                    background: on ? PAPER : "transparent",
                    border: `1px solid ${on ? Q.mid + "55" : "transparent"}`,
                    boxShadow: on ? CARD_SHADOW : "none",
                    transition: "all .22s ease",
                  }}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                    display: "grid", placeItems: "center",
                    background: done ? Q.deep : on ? Q.tint : "rgba(17,26,21,.05)",
                    color: done ? "#fff" : on ? Q.deep : BODY,
                  }}>
                    {done ? <Check size={14} /> : <Icon size={14} />}
                  </span>
                  <span>
                    <span style={{
                      display: "block", fontFamily: display(isAR),
                      fontSize: isAR ? 16 : 14, fontWeight: 700,
                      color: on || done ? INK : BODY,
                    }}>
                      {isAR ? s.ar : s.en}
                    </span>
                    <span className="ql-step-note" style={{ display: "block", fontFamily: bodyFont, fontSize: 13.5, color: BODY, marginTop: 1 }}>
                      {isAR ? s.note_ar : s.note_en}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Only appears once the lab is solved. Nothing else in the rail
              moves you forward, so finishing is what opens the next station. */}
          {lessonDone && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${LINE}` }}
            >
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.2em", color: Q.deep, marginBottom: 10 }}>
                {isAR ? "أنهيت هذا الدرس" : "LESSON FINISHED"}
              </div>
              {nextLesson ? (
                <Link href={`/quantum/${nextLesson.slug}`} style={{ ...cta, width: "100%", justifyContent: "center", flexDirection: "column", gap: 3, padding: "13px 20px" }}>
                  <span style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: "0.18em", opacity: 0.75 }}>
                    {isAR ? "الدرس التالي" : "NEXT LESSON"}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {isAR ? nextLesson.name_ar : nextLesson.name_en}
                    <ArrowRight size={14} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
                  </span>
                </Link>
              ) : (
                <p style={{ fontFamily: bodyFont, fontSize: 15, lineHeight: 1.6, color: BODY, margin: 0 }}>
                  {isAR
                    ? "هذه آخر محطة مكتوبة حتى الآن."
                    : "That is the last station written so far."}
                </p>
              )}
            </motion.div>
          )}
        </aside>

        {/* ── the content ── */}
        <main style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              {/* ── VIDEO ── */}
              {step === "video" && (
                <div>
                  <div style={{
                    aspectRatio: "16 / 9", borderRadius: 22, overflow: "hidden",
                    background: `linear-gradient(150deg, ${Q.deep}, #0B1F16)`,
                    display: "grid", placeItems: "center", position: "relative",
                    boxShadow: CARD_SHADOW,
                  }}>
                    {/* The ambient field belongs behind the empty-state only.
                        Over a playing film it just looks like dirt on the lens. */}
                    {!lesson.video.src && <QuantumField height={560} />}
                    {lesson.video.src ? (
                      <video
                        src={lesson.video.src}
                        poster={lesson.video.poster ?? undefined}
                        controls
                        onEnded={() => markStep(lesson.slug, "video")}
                        onTimeUpdate={e => {
                          const v = e.currentTarget;
                          // Near enough to the end. Waiting for the exact last
                          // frame strands anyone who stops at the credits.
                          if (v.duration && v.currentTime / v.duration >= 0.9) markStep(lesson.slug, "video");
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ position: "relative", textAlign: "center", padding: 28 }}>
                        <Play size={32} style={{ color: Q.soft, marginBottom: 14 }} />
                        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.2em", color: Q.soft, marginBottom: 10 }}>
                          {isAR ? "الفيلم قيد الإنتاج" : "FILM IN PRODUCTION"}
                        </div>
                        <p style={{ fontFamily: bodyFont, fontSize: 17, fontStyle: "italic", color: "rgba(255,255,255,.85)", margin: "0 auto", maxWidth: 400, lineHeight: 1.6 }}>
                          {isAR
                            ? `النص مكتوب: خمسة مشاهد، نحو ${lesson.video.minutes} دقائق.`
                            : `The script is written: five scenes, about ${lesson.video.minutes} minutes.`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* The hook is the last line of the film. Showing it up front
                      gives away the ending, so it waits until the video is done. */}
                  {loaded && isStepDone(lesson.slug, "video") && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    style={{ marginTop: 20, padding: "22px 24px", borderRadius: 18, background: PAPER, border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}>
                    <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.2em", color: GOLD_DEEP, marginBottom: 10 }}>
                      {isAR ? "السؤال الذي يتركه" : "THE QUESTION IT LEAVES YOU"}
                    </div>
                    <p style={{ fontFamily: bodyFont, fontSize: "clamp(1.1rem,2vw,1.35rem)", fontStyle: "italic", lineHeight: 1.6, color: INK, margin: 0 }}>
                      “{isAR ? lesson.hook_ar : lesson.hook_en}”
                    </p>
                  </motion.div>
                  )}

                </div>
              )}

              {/* ── BOARD ── */}
              {step === "board" && (
                <div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {lesson.board.map((w, i) => (
                      <motion.div
                        key={i}
                        initial={reduce ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 * i, ease: EASE }}
                      >
                        <BoardWidget w={w} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── LAB ── */}
              {step === "lab" && (
                <div>
                  <QuantumLessonGames
                    lessonOrder={lesson.order}
                    onComplete={() => markStep(lesson.slug, "lab")}
                  />

                  {/*
                    OLD LAB UI — intentionally kept commented out.
                    The original components still exist in components/quantum:
                    <DrawerSearchLab onComplete={() => markStep(lesson.slug, "lab")} />
                    <ScaleLab onComplete={() => markStep(lesson.slug, "lab")} />
                  */}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <QuantumFooter />
    </div>
  );
}
