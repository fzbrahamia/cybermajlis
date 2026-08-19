"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import {
  motion, AnimatePresence, useReducedMotion, useScroll,
  useTransform, useMotionValue, useSpring,
} from "framer-motion";
import {
  ArrowRight, ChevronDown, Hammer, ShieldCheck, Sparkles,
  Backpack, Users, GraduationCap, Lock, Check,
} from "lucide-react";
import {
  M, BRANCHES, MODES, container, item, display, crimson, mono,
  EASE, EASE_SLOW, SPRING, SHADOW, RADIUS, GRAIN,
} from "@/components/majlis/theme";
import { MajlisHeader, MajlisFooter, MajlisMark } from "@/components/majlis/MajlisChrome";

/* One background colour runs the whole page, so structure comes from rhythm:
   an airy hero, a thin strip, big cards, a picker, a quiet tail. Depth and
   grain do the work that colour bands used to. */

/* ── paper grain over the flat surface ───────────────────── */
function Grain() {
  return (
    <div aria-hidden style={{
      position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
      backgroundImage: GRAIN, opacity: 0.32, mixBlendMode: "multiply",
    }} />
  );
}

/* ── hairline progress rule ──────────────────────────────── */
function ScrollRule() {
  const { scrollYProgress } = useScroll();
  const isAR = useLocale() === "ar";
  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed", top: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 2, zIndex: 90,
        transformOrigin: isAR ? "100% 0" : "0% 0", scaleX: scrollYProgress,
        background: `linear-gradient(90deg, ${BRANCHES[0].mid}, ${M.gold}, ${BRANCHES[1].mid}, ${BRANCHES[2].mid})`,
      }}
    />
  );
}

function Divider() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden style={{ display: "flex", justifyContent: "center", padding: "clamp(38px,6vw,72px) 0" }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, scaleX: 0.3 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, ease: EASE_SLOW }}
        style={{ display: "flex", alignItems: "center", gap: 14, width: "min(340px, 62vw)" }}
      >
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${M.gold}77)` }} />
        <span style={{ width: 5, height: 5, background: M.gold, transform: "rotate(45deg)" }} />
        <span style={{ width: 3, height: 3, background: `${M.gold}88`, transform: "rotate(45deg)" }} />
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${M.gold}77, transparent)` }} />
      </motion.div>
    </div>
  );
}

/* ── drifting light behind the hero, with parallax ───────── */
function Blobs() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const slow = useTransform(scrollYProgress, [0, 0.4], [0, -70]);
  const fast = useTransform(scrollYProgress, [0, 0.4], [0, -130]);

  const shapes = [
    { c: BRANCHES[0].mid, size: 340, top: "2%",  start: "-8%", dur: 17, y: slow },
    { c: BRANCHES[1].mid, size: 260, top: "56%", start: "80%", dur: 21, y: fast },
    { c: BRANCHES[2].mid, size: 300, top: "14%", start: "72%", dur: 19, y: slow },
    { c: M.gold,          size: 240, top: "68%", start: "4%",  dur: 24, y: fast },
  ];
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute", top: s.top, insetInlineStart: s.start,
            width: s.size, height: s.size, borderRadius: "50%",
            background: `radial-gradient(circle, ${s.c}22, transparent 68%)`,
            filter: "blur(34px)", y: reduce ? undefined : s.y,
          }}
        >
          <motion.div
            animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.9 }}
            style={{ width: "100%", height: "100%", borderRadius: "50%", background: "inherit" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ── wordmark: letters rise out of a mask, then stay playful ─ */
function Wordmark({ isAR }: { isAR: boolean }) {
  const reduce = useReducedMotion();
  const size = "clamp(3.8rem,12vw,8.5rem)";

  // Arabic script is connected, so it can never be split into letters.
  if (isAR) {
    return (
      <motion.h1
        initial={reduce ? false : { opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING}
        style={{
          fontFamily: display(true), fontWeight: 900, fontSize: size,
          color: M.heading, margin: "20px 0 0", lineHeight: 1.1,
        }}
      >
        مجلس
      </motion.h1>
    );
  }

  const letters = "Majlis".split("");
  const hues = [BRANCHES[0].mid, M.goldDeep, BRANCHES[1].mid, BRANCHES[2].mid, M.goldDeep, BRANCHES[0].mid];

  return (
    <h1 style={{
      fontFamily: display(false), fontWeight: 900, fontSize: size,
      lineHeight: 1, margin: "20px 0 0", display: "flex", justifyContent: "center",
      letterSpacing: "-0.03em",
    }}>
      {letters.map((l, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em" }}>
          <motion.span
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, delay: 0.06 * i, ease: EASE_SLOW }}
            whileHover={reduce ? undefined : { y: -14, rotate: i % 2 ? 5 : -5, transition: SPRING }}
            style={{ color: hues[i], display: "inline-block", cursor: "default" }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/* ── small caps eyebrow with a gold tick ─────────────────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  const isAR = useLocale() === "ar";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 11,
      fontFamily: mono, fontSize: 9.5, fontWeight: 500,
      letterSpacing: isAR ? 0 : "0.26em", color: M.goldDeep, marginBottom: 16,
    }}>
      <span aria-hidden style={{ width: 18, height: 1, background: `${M.gold}99` }} />
      {children}
      <span aria-hidden style={{ width: 18, height: 1, background: `${M.gold}99` }} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const isAR = useLocale() === "ar";
  return (
    <h2 style={{
      fontFamily: display(isAR), fontWeight: 900, textAlign: "center",
      fontSize: "clamp(1.9rem,3.8vw,2.9rem)", lineHeight: 1.12,
      letterSpacing: isAR ? 0 : "-0.02em", margin: 0, color: M.heading,
    }}>
      {children}
    </h2>
  );
}

/* Pointer-tracked card: the surface tilts toward the cursor in 3D and a
   sheen follows it. Tilt runs on motion values and the sheen is written
   straight to the node, so moving the mouse never triggers a React render. */
function useTiltCard(tone: string, enabled: boolean) {
  const ref = useRef<HTMLElement | null>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 200, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-11, 11]), spring);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || !enabled) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    px.set(x / r.width);
    py.set(y / r.height);
    el.style.setProperty("--sx", `${x}px`);
    el.style.setProperty("--sy", `${y}px`);
    el.style.setProperty("--so", "1");
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    ref.current?.style.setProperty("--so", "0");
  };

  const sheen: React.CSSProperties = {
    background: `radial-gradient(360px circle at var(--sx,50%) var(--sy,50%), ${tone}22, transparent 68%)`,
    opacity: "var(--so,0)" as unknown as number,
    transition: "opacity .4s ease",
  };

  return { ref, onMove, onLeave, sheen, rotateX: enabled ? rotateX : 0, rotateY: enabled ? rotateY : 0 };
}

/* ════════════════════════ PAGE ════════════════════════ */
export default function MajlisLanding() {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  const [role, setRole] = useState("student");

  const PROMISE = [
    { icon: Hammer,      tone: BRANCHES[1].mid, en: "You build something real",      ar: "تبني شيئًا حقيقيًا" },
    { icon: ShieldCheck, tone: BRANCHES[0].mid, en: "Safety comes first, not last",  ar: "الأمان أولًا، لا أخيرًا" },
    { icon: Sparkles,    tone: BRANCHES[2].mid, en: "Arabic and English, from age eight", ar: "بالعربية والإنجليزية، من سن الثامنة" },
  ];

  const ROLES = [
    {
      id: "student", icon: Backpack, tone: BRANCHES[0].mid,
      en: "Student", ar: "طالب",
      d_en: "Pick a majlis and start playing. Your progress follows you everywhere you go.",
      d_ar: "اختر مجلسًا وابدأ اللعب. تقدّمك يتبعك أينما ذهبت.",
      cta_en: "Start learning", cta_ar: "ابدأ التعلّم",
      href: "/auth?signup=true",
    },
    {
      id: "parent", icon: Users, tone: BRANCHES[1].mid,
      en: "Parent", ar: "وليّ أمر",
      d_en: "A weekly summary of what your child did, and a daily time limit you control.",
      d_ar: "ملخّص أسبوعي لما فعله طفلك، وحدّ زمني يومي تتحكّم به.",
      cta_en: "See how it works", cta_ar: "شاهد كيف يعمل",
      href: "/auth?signup=true",
    },
    {
      id: "teacher", icon: GraduationCap, tone: BRANCHES[2].mid,
      en: "Teacher", ar: "معلّم",
      d_en: "One class code opens all three majalis for your whole class, with progress reported back to you.",
      d_ar: "رمز صف واحد يفتح المجالس الثلاثة لصفّك كاملًا، مع تقارير تقدّم تصلك مباشرة.",
      cta_en: "Open a class", cta_ar: "افتح صفًّا",
      href: "/auth?signup=true",
      all: true,
    },
  ];

  const active = ROLES.find(r => r.id === role)!;
  const gutter = "clamp(18px,4vw,40px)";

  return (
    <div style={{ background: M.page, color: M.heading, fontFamily: crimson, overflowX: "hidden", position: "relative" }}>
      <Grain />
      <ScrollRule />
      <MajlisHeader />

      <div style={{ position: "relative", zIndex: 2 }}>

        {/* ══════ HERO ══════ */}
        <section style={{
          position: "relative", minHeight: "94vh", display: "flex", alignItems: "center",
          padding: `calc(66px + 3.5rem) ${gutter} 3rem`,
        }}>
          <Blobs />

          <motion.div
            variants={container} initial="hidden" animate="show"
            style={{ position: "relative", maxWidth: 840, margin: "0 auto", textAlign: "center", width: "100%" }}
          >
            <motion.div variants={item} style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
              <motion.span
                animate={reduce ? undefined : { rotate: [0, 7, -7, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: "inline-flex" }}
              >
                <MajlisMark size={42} />
              </motion.span>
            </motion.div>

            <motion.div variants={item}>
              <Eyebrow>
                {isAR
                  ? "الابتكار · الأمن السيبراني · التقنيات الناشئة"
                  : "INNOVATION · CYBERSECURITY · EMERGING TECHNOLOGY"}
              </Eyebrow>
            </motion.div>

            <Wordmark isAR={isAR} />

            <motion.div
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.6, ease: EASE_SLOW }}
              style={{
                height: 4, width: 118, borderRadius: 99, margin: "26px auto 28px",
                background: `linear-gradient(90deg, ${BRANCHES[0].mid}, ${M.gold}, ${BRANCHES[1].mid}, ${BRANCHES[2].mid})`,
              }}
            />

            <motion.p variants={item} style={{
              fontFamily: crimson, fontSize: "clamp(1.3rem,2.7vw,1.8rem)",
              lineHeight: 1.4, color: M.body, maxWidth: 470, margin: "0 auto",
            }}>
              {isAR
                ? "حيث يتعلّم الصغار أن يبنوا بأمان."
                : "Where young minds learn to build safely."}
            </motion.p>

            <motion.div variants={item} style={{
              display: "inline-flex", alignItems: "center", gap: 9, marginTop: 26,
              padding: "9px 20px", borderRadius: RADIUS.pill,
              background: M.goldSoft, border: `1px solid ${M.gold}55`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)",
              fontFamily: mono, fontSize: 10, fontWeight: 500,
              letterSpacing: isAR ? 0 : "0.2em", color: M.goldDeep,
            }}>
              <Lock size={11} />
              {isAR ? "آمن بالتصميم" : "SECURE BY DESIGN"}
            </motion.div>

            <motion.div variants={item}>
              <motion.button
                onClick={() => document.getElementById("majalis")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })}
                whileHover={reduce ? undefined : { scale: 1.04, y: -3 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={SPRING}
                style={{
                  marginTop: 34, cursor: "pointer", border: "none",
                  display: "inline-flex", alignItems: "center", gap: 11,
                  padding: "17px 36px", borderRadius: RADIUS.pill, color: M.cream,
                  fontFamily: display(isAR), fontSize: 13, fontWeight: 700,
                  letterSpacing: isAR ? 0 : "0.12em",
                  background: M.action, boxShadow: SHADOW.button,
                }}
              >
                {isAR ? "اختر مجلسك" : "FIND YOUR MAJLIS"}
                <motion.span
                  animate={reduce ? undefined : { y: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ display: "inline-flex" }}
                >
                  <ChevronDown size={16} />
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* ══════ PROMISE STRIP ══════ */}
        <section style={{ padding: `0 ${gutter}` }}>
          <div style={{
            maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap",
            justifyContent: "center", alignItems: "center", gap: "20px 0",
          }}>
            {PROMISE.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.en}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.1 * i, ease: EASE_SLOW }}
                  whileHover="hover"
                  style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "0 clamp(14px,2.4vw,30px)" }}
                >
                  <motion.span
                    variants={{ hover: reduce ? {} : { rotate: [0, -12, 12, 0], scale: 1.14 } }}
                    transition={{ duration: 0.6 }}
                    style={{
                      width: 40, height: 40, borderRadius: RADIUS.chip, flexShrink: 0,
                      display: "grid", placeItems: "center",
                      background: `${p.tone}17`, color: p.tone,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)",
                    }}
                  >
                    <Icon size={18} />
                  </motion.span>
                  <span style={{ fontFamily: crimson, fontSize: 16.5, lineHeight: 1.35, color: M.body }}>
                    {isAR ? p.ar : p.en}
                  </span>
                  {i < PROMISE.length - 1 && (
                    <span aria-hidden className="mj-sep" style={{
                      width: 1, height: 26, background: M.line, marginInlineStart: "clamp(14px,2.4vw,30px)",
                    }} />
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        <Divider />

        {/* ══════ THE THREE MAJALIS ══════ */}
        <section id="majalis" style={{ padding: `0 ${gutter}` }}>
          <div style={{ maxWidth: 1160, margin: "0 auto" }}>
            <Eyebrow>{isAR ? "اختر بابك" : "CHOOSE YOUR DOOR"}</Eyebrow>
            <div style={{ marginBottom: 52 }}>
              <SectionTitle>{isAR ? "المجالس الثلاثة" : "The Three Majalis"}</SectionTitle>
            </div>

            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(295px, 1fr))" }}>
              {BRANCHES.map((b, i) => (
                <MajlisCard key={b.id} b={b} i={i} isAR={isAR} reduce={!!reduce} />
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ══════ THE TRUNK ══════
            The majalis above are the scope. This is the method that runs
            through all three, so it sits under them rather than beside them. */}
        <section style={{ padding: `0 ${gutter}` }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <Eyebrow>{isAR ? "ثم ماذا؟" : "AND THEN"}</Eyebrow>
            <SectionTitle>
              {isAR ? "لا تحتاج إلى فكرة لتبدأ" : "You do not need an idea to start"}
            </SectionTitle>
            <p style={{
              margin: "18px auto 28px", maxWidth: 560,
              fontFamily: crimson, fontSize: 17, lineHeight: 1.75, color: M.body,
            }}>
              {isAR
                ? "كل مسابقة تطلب منك فكرة جاهزة لتشارك. نحن نبدأ قبل ذلك بكثير: لاحظ، سمّه، سوّه، جربه، ثم اشرحه."
                : "Every competition asks you to arrive with an idea. We start long before that: notice, name, make, try, then tell."}
            </p>
            <a
              href="/learn"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10, minHeight: 48,
                padding: "0 26px", borderRadius: RADIUS.pill,
                background: M.action, color: M.cream, textDecoration: "none",
                fontFamily: display(isAR), fontSize: isAR ? 16 : 13,
                fontWeight: 700, letterSpacing: isAR ? 0 : "0.08em",
                boxShadow: SHADOW.button,
              }}
            >
              {isAR ? "ابدأ التعلّم" : "START LEARNING"}
            </a>
          </div>
        </section>

        <Divider />

        {/* ══════ WHO IS COMING IN ══════ */}
        <section style={{ padding: `0 ${gutter}` }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Eyebrow>{isAR ? "ابدأ من هنا" : "START HERE"}</Eyebrow>
            <SectionTitle>{isAR ? "من الداخل معنا؟" : "Who is coming in?"}</SectionTitle>

            <div style={{
              display: "flex", flexWrap: "wrap", gap: 10,
              justifyContent: "center", margin: "32px 0 24px",
            }}>
              {ROLES.map(r => {
                const Icon = r.icon;
                const on = r.id === role;
                return (
                  <motion.button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    aria-pressed={on}
                    whileHover={reduce ? undefined : { y: -3 }}
                    whileTap={reduce ? undefined : { scale: 0.96 }}
                    transition={SPRING}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer",
                      padding: "12px 24px", borderRadius: RADIUS.pill,
                      fontFamily: display(isAR), fontSize: isAR ? 16 : 13, fontWeight: 700,
                      letterSpacing: isAR ? 0 : "0.04em",
                      color: on ? M.cream : M.body,
                      background: on ? r.tone : M.card,
                      border: `1px solid ${on ? r.tone : M.line}`,
                      boxShadow: on ? `0 8px 20px ${r.tone}33` : "inset 0 1px 0 rgba(255,255,255,.9)",
                      transition: "background .25s ease, color .25s ease, border-color .25s ease",
                    }}
                  >
                    <Icon size={15} />
                    {isAR ? r.ar : r.en}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE }}
                style={{
                  textAlign: "center", padding: "38px 32px", borderRadius: RADIUS.panel,
                  background: M.card, border: `1px solid ${active.tone}2e`,
                  boxShadow: SHADOW.rest,
                }}
              >
                <p style={{
                  fontFamily: crimson, fontSize: "clamp(1.1rem,2.1vw,1.35rem)",
                  lineHeight: 1.55, color: M.body, margin: "0 auto", maxWidth: 470,
                }}>
                  {isAR ? active.d_ar : active.d_en}
                </p>

                {active.all && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 7, marginTop: 18,
                    fontFamily: mono, fontSize: 9.5, letterSpacing: "0.14em", color: active.tone,
                  }}>
                    <Check size={12} />
                    {isAR ? "المجالس الثلاثة بدخول واحد" : "ALL THREE MAJALIS, ONE LOGIN"}
                  </span>
                )}

                <div>
                  <motion.a
                    href={active.href}
                    whileHover={reduce ? undefined : { scale: 1.04, y: -2 }}
                    whileTap={reduce ? undefined : { scale: 0.98 }}
                    transition={SPRING}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10, marginTop: 26,
                      padding: "15px 30px", borderRadius: RADIUS.pill, textDecoration: "none",
                      fontFamily: display(isAR), fontSize: 12.5, fontWeight: 700,
                      letterSpacing: isAR ? 0 : "0.1em", color: M.cream,
                      background: M.action, boxShadow: SHADOW.button,
                    }}
                  >
                    {isAR ? active.cta_ar : active.cta_en}
                    <ArrowRight size={14} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
                  </motion.a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <Divider />

        {/* ══════ MODES ══════ */}
        <section style={{ padding: `0 ${gutter} clamp(64px,9vw,104px)` }}>
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <SectionTitle>
              {isAR ? "ليس كل عقل يتعلّم بالطريقة نفسها" : "Not every mind learns the same way"}
            </SectionTitle>
            <p style={{
              fontFamily: crimson, fontSize: "1.1rem", textAlign: "center",
              color: M.body, margin: "14px auto 34px", maxWidth: 400,
            }}>
              {isAR ? "الطريق نفسه، بإيقاع يناسبك." : "Same path, at the pace that suits you."}
            </p>

            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(255px, 1fr))" }}>
              {MODES.map((m, i) => (
                <motion.div
                  key={m.href}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.75, delay: 0.09 * i, ease: EASE_SLOW }}
                  style={{
                    padding: "24px 22px", borderRadius: RADIUS.panel,
                    background: M.card, border: `1px solid ${M.line}`,
                    boxShadow: SHADOW.rest, opacity: 0.78,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                    <motion.span
                      animate={reduce ? undefined : { scale: [1, 1.28, 1], opacity: [1, 0.65, 1] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                      style={{ width: 10, height: 10, borderRadius: "50%", background: m.dot }}
                    />
                    <span style={{
                      fontFamily: display(isAR), fontSize: isAR ? 19 : 17,
                      fontWeight: 700, letterSpacing: isAR ? 0 : "-0.01em", color: M.heading,
                    }}>
                      {isAR ? m.ar : m.en}
                    </span>
                    <span style={{
                      marginInlineStart: "auto", fontFamily: mono, fontSize: 8.5,
                      letterSpacing: "0.16em", color: M.body,
                      padding: "4px 11px", borderRadius: RADIUS.pill, border: `1px solid ${M.line}`,
                    }}>
                      {isAR ? "قريبًا" : "SOON"}
                    </span>
                  </span>
                  <p style={{ fontFamily: crimson, fontSize: 15.5, lineHeight: 1.6, color: M.body, margin: 0 }}>
                    {isAR ? m.desc_ar : m.desc_en}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <MajlisFooter />
      </div>

      <style>{`
        @media (max-width: 760px) { .mj-sep { display: none !important; } }
      `}</style>
    </div>
  );
}

/* ── one majlis card ─────────────────────────────────────── */
function MajlisCard({
  b, i, isAR, reduce,
}: { b: (typeof BRANCHES)[number]; i: number; isAR: boolean; reduce: boolean }) {
  const open = !!(b.live && b.enter);
  const tilt = open && !reduce;
  const { ref, onMove, onLeave, sheen, rotateX, rotateY } = useTiltCard(b.mid, tilt);
  const Tag = open ? motion.a : motion.div;

  return (
    /* perspective has to sit on the parent for the child rotation to read as depth */
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, delay: 0.11 * i, ease: EASE_SLOW }}
      style={{ perspective: 1100, display: "flex" }}
    >
      <Tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        {...(open ? { href: b.enter as string, onMouseMove: onMove, onMouseLeave: onLeave } : {})}
        initial={false}
        whileHover={open && !reduce ? "hover" : undefined}
        animate="rest"
        variants={{
          rest:  { y: 0,   boxShadow: SHADOW.rest },
          hover: { y: -14, boxShadow: SHADOW.lift },
        }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{
          position: "relative", overflow: "hidden",
          width: "100%", display: "flex", flexDirection: "column", textDecoration: "none",
          padding: "36px 30px 32px", borderRadius: RADIUS.card,
          background: `linear-gradient(180deg, #FFFFFF 0%, ${M.card} 100%)`,
          border: `1px solid ${open ? b.mid + "2e" : M.line}`,
          opacity: open ? 1 : 0.6,
          cursor: open ? "pointer" : "default",
          transformStyle: "preserve-3d",
          rotateX, rotateY,
        }}
      >
        {/* pointer sheen */}
        {open && <span aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", ...sheen }} />}

        {/* colour wash that blooms up from the bottom edge on hover */}
        {open && (
          <motion.span
            aria-hidden
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{
              position: "absolute", insetInline: 0, bottom: 0, height: "55%", pointerEvents: "none",
              background: `linear-gradient(0deg, ${b.mid}12, transparent)`,
            }}
          />
        )}

        <div style={{ position: "relative", transform: "translateZ(40px)", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24,
          }}>
            <motion.span
              variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.22, rotate: -8 } }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{
                display: "block", width: 46, height: 46, borderRadius: "50%",
                background: `radial-gradient(circle at 32% 28%, ${b.soft}, ${b.mid} 62%, ${b.deep})`,
                boxShadow: `0 6px 16px ${b.mid}3a, inset 0 1px 0 rgba(255,255,255,.35)`,
              }}
            />
            <motion.span
              variants={{ rest: { opacity: 0.6, x: 0 }, hover: { opacity: 1, x: isAR ? 6 : -6 } }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.18em", color: b.mid }}
            >
              {String(i + 1).padStart(2, "0")}
            </motion.span>
          </div>

          <h3 style={{
            fontFamily: display(isAR), fontWeight: 900,
            fontSize: isAR ? "1.7rem" : "1.9rem", lineHeight: 1.08,
            letterSpacing: isAR ? 0 : "-0.02em", margin: "0 0 12px",
          }}>
            {isAR ? (
              <span style={{ color: b.deep }}>{b.name_ar}</span>
            ) : (
              <>
                <span style={{ color: M.heading }}>{b.word[0]}</span>
                <span style={{ color: b.mid }}>{b.word[1]}</span>
              </>
            )}
          </h3>

          <p style={{ fontFamily: crimson, fontSize: 17.5, lineHeight: 1.6, color: M.body, margin: "0 0 28px", flex: 1 }}>
            {isAR ? b.line_ar : b.line_en}
          </p>

          {open ? (
            <motion.span
              variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                fontFamily: display(isAR), fontSize: 12, fontWeight: 700,
                letterSpacing: isAR ? 0 : "0.12em",
                padding: "14px 28px", borderRadius: RADIUS.pill, color: M.cream,
                background: b.deep, boxShadow: `0 8px 20px ${b.deep}33`,
                transformOrigin: isAR ? "right center" : "left center",
                alignSelf: "flex-start",
              }}
            >
              {isAR ? "ادخل" : "ENTER"}
              <motion.span
                variants={{ rest: { x: 0 }, hover: { x: isAR ? -5 : 5 } }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
                style={{ display: "inline-flex" }}
              >
                <ArrowRight size={14} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
              </motion.span>
            </motion.span>
          ) : (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: mono, fontSize: 10, fontWeight: 500,
              letterSpacing: "0.16em",
              padding: "14px 24px", borderRadius: RADIUS.pill, color: M.body,
              border: `1px solid ${M.line}`, alignSelf: "flex-start",
            }}>
              <Lock size={11} />
              {isAR ? "قريبًا" : "COMING SOON"}
            </span>
          )}
        </div>
      </Tag>
    </motion.div>
  );
}
