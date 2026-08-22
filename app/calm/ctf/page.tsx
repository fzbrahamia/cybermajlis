"use client";

// ============================================================
// CALM CTF, "Flag Finders"
// A very gentle Capture-The-Flag for the calm/neurodivergent
// space. One clear task per track, tap-to-answer (no typing),
// no timer, no animations, soft-blue palette. Sign-in required
// so progress + skills are saved (shared useCtfProgress hook).
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound, Search, Eye, Code2, EyeOff,
  Flag, CheckCircle, Lock, Star, Trophy,
} from "lucide-react";
import CalmNav from "@/components/calm/CalmNav";
import { useCalmLang } from "@/hooks/useCalmLang";
import { useCtfProgress } from "@/hooks/useCtfProgress";
import { useTrackView } from "@/hooks/useTrackView";
import { trackSkillAttempt, trackSkillSolve } from "@/app/lib/analytics";

const SANS    = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const CINZEL  = "var(--ui)";
const MONO    = "'Geist Mono', 'JetBrains Mono', Menlo, monospace";
const BG      = "#F0F9FF";
const PRIMARY = "#1A3A5C";
const ACCENT  = "#3B82F6";
const BORDER  = "#BFDBFE";
const CARD    = "#FFFFFF";
const OK_BG   = "#F0FDF4";
const OK_BD   = "#86EFAC";
const OK_TX   = "#16a34a";
// "Try again" uses a soft, low-saturation amber instead of alarm-red.
// Bright red is overstimulating for autistic children, so wrong answers
// stay gentle and encouraging rather than alarming.
const TRY_BG  = "#FBF6EF";
const TRY_BD  = "#E4C9A1";
const TRY_TX  = "#9A6A2F";

type Lang = "en" | "ar";

interface Option { en: string; ar: string; correct: boolean; mono?: boolean }
interface Track {
  id: string;          // challenge id (calm-…)
  sectionId: string;   // shared section id for skill analytics
  points: number;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: { en: string; ar: string };
  realName: { en: string; ar: string };
  prompt: { en: string; ar: string };
  show: { lines: string[]; mono?: boolean } | null; // puzzle display
  big?: string;                                       // a single large token (e.g. TAC)
  options: Option[];
  success: { en: string; ar: string };
  lesson: { en: string; ar: string };
}

const TRACKS: Track[] = [
  {
    id: "calm-crypto", sectionId: "crypto", points: 50, icon: KeyRound,
    title: { en: "Secret Codes", ar: "الشيفرات السرية" },
    realName: { en: "Cryptography", ar: "التعمية" },
    prompt: {
      en: "This word is written backwards. What is the real word?",
      ar: "هذه الكلمة مكتوبة بالمقلوب. ما هي الكلمة الحقيقية؟",
    },
    show: null, big: "TAC",
    options: [
      { en: "CAT 🐱", ar: "قطة (CAT) 🐱", correct: true },
      { en: "HAT 🎩", ar: "قبعة (HAT) 🎩", correct: false },
      { en: "BAT 🦇", ar: "خفاش (BAT) 🦇", correct: false },
    ],
    success: { en: "Yes! TAC backwards spells CAT.", ar: "أحسنت! TAC بالمقلوب تعني CAT." },
    lesson: {
      en: "Writing a word backwards is a simple secret code. Spies have used codes like this for a very long time.",
      ar: "كتابة الكلمة بالمقلوب شيفرة سرية بسيطة. استخدم الجواسيس شيفرات كهذه منذ زمن طويل.",
    },
  },
  {
    id: "calm-forensics", sectionId: "forensics", points: 50, icon: Search,
    title: { en: "Digital Clues", ar: "الأدلة الرقمية" },
    realName: { en: "Forensics", ar: "التحقيق الرقمي" },
    prompt: {
      en: "A photo secretly remembers little notes. Tap the one that is a hidden SECRET message.",
      ar: "تحتفظ الصورة سرّاً بملاحظات صغيرة. اضغط على الملاحظة التي تُعدّ رسالة سرّية مخفية.",
    },
    show: null,
    options: [
      { en: "Camera: Pixel 7", ar: "الكاميرا: Pixel 7", correct: false, mono: true },
      { en: "Secret note: meet at the gate 🔑", ar: "ملاحظة سرّية: قابلني عند البوابة 🔑", correct: true, mono: true },
      { en: "Date: Friday", ar: "التاريخ: الجمعة", correct: false, mono: true },
    ],
    success: { en: "Well spotted! That note was hidden inside the photo.", ar: "أحسنت الملاحظة! تلك الرسالة كانت مخفية داخل الصورة." },
    lesson: {
      en: "Photos store hidden details called metadata. Investigators read them, so always think about what your pictures remember.",
      ar: "تخزّن الصور تفاصيل مخفية تُسمّى «البيانات الوصفية». يقرؤها المحققون، لذا فكّر دائماً فيما تتذكّره صورك.",
    },
  },
  {
    id: "calm-osint", sectionId: "osint", points: 50, icon: Eye,
    title: { en: "Detective Work", ar: "عمل المحقق" },
    realName: { en: "OSINT", ar: "الاستخبارات المفتوحة" },
    prompt: {
      en: "Read this post. A stranger could now guess a secret. What did the post give away?",
      ar: "اقرأ هذا المنشور. يمكن لغريب أن يخمّن سرّاً الآن. ماذا كشف المنشور؟",
    },
    show: { lines: ["My dog Max is 3 today! 🎂🐶"], mono: false },
    options: [
      { en: "The dog's name (Max)", ar: "اسم الكلب (Max)", correct: true },
      { en: "Today's weather", ar: "طقس اليوم", correct: false },
      { en: "Their favourite food", ar: "طعامهم المفضّل", correct: false },
    ],
    success: { en: "Right, the post gave away the dog's name, Max.", ar: "صحيح، كشف المنشور اسم الكلب، Max." },
    lesson: {
      en: "Be careful what you share online. Even a pet's name can help a stranger guess a password or a secret answer.",
      ar: "انتبه لما تشاركه على الإنترنت. حتى اسم حيوان أليف قد يساعد غريباً على تخمين كلمة مرور أو إجابة سرّية.",
    },
  },
  {
    id: "calm-web", sectionId: "web", points: 50, icon: Code2,
    title: { en: "Behind the Page", ar: "خلف الصفحة" },
    realName: { en: "Web", ar: "الويب" },
    prompt: {
      en: "Web pages have hidden code. One of these lines is a secret the website tried to hide. Tap the secret.",
      ar: "صفحات الويب فيها شيفرة مخفية. أحد هذه الأسطر سرّ حاول الموقع إخفاءه. اضغط على السرّ.",
    },
    show: null,
    options: [
      { en: "<h1>Welcome!</h1>", ar: "<h1>Welcome!</h1>", correct: false, mono: true },
      { en: "<!-- secret word: BLUE -->", ar: "<!-- secret word: BLUE -->", correct: true, mono: true },
      { en: "<p>Hello friends</p>", ar: "<p>Hello friends</p>", correct: false, mono: true },
    ],
    success: { en: "You found it! The secret word BLUE was hidden in the code.", ar: "وجدتها! الكلمة السرّية BLUE كانت مخفية في الشيفرة." },
    lesson: {
      en: "The little <!-- … --> is a hidden note in a web page. Secrets left in code can be read by anyone who looks.",
      ar: "العلامة <!-- … --> ملاحظة مخفية في صفحة الويب. الأسرار المتروكة في الشيفرة يمكن لأي شخص ينظر أن يقرأها.",
    },
  },
  {
    id: "calm-stego", sectionId: "stego", points: 50, icon: EyeOff,
    title: { en: "Hidden Messages", ar: "الرسائل المخفية" },
    realName: { en: "Steganography", ar: "إخفاء المعلومات" },
    prompt: {
      en: "Read only the FIRST letter of each line, top to bottom. What word do they spell?",
      ar: "اقرأ الحرف الأول فقط من كل سطر، من الأعلى للأسفل. أيّ كلمة تتكوّن؟",
    },
    show: { lines: ["Sun is bright", "Up in the sky", "Now it is day"], mono: false },
    options: [
      { en: "SUN ☀️", ar: "SUN ☀️", correct: true },
      { en: "FUN 🎈", ar: "FUN 🎈", correct: false },
      { en: "RUN 🏃", ar: "RUN 🏃", correct: false },
    ],
    success: { en: "Yes! S, U, N spells SUN.", ar: "نعم! S, U, N تكوّن SUN." },
    lesson: {
      en: "Hiding a word in the first letters of each line is a sneaky trick called steganography, a message hidden inside another.",
      ar: "إخفاء كلمة في الأحرف الأولى لكل سطر حيلة لطيفة تُسمّى «إخفاء المعلومات», رسالة مخبّأة داخل أخرى.",
    },
  },
];

const UI = {
  en: {
    heroTitle: "Flag Finders",
    heroSub: "Five little challenges. Find the hidden answer in each one. Take your time, there is no timer.",
    progress: (n: number) => `${n} of ${TRACKS.length} found`,
    realLabel: "Real name:",
    tapHint: "Tap your answer",
    tryAgain: "Not quite, have another look. You can try again 💙",
    learned: "What you learned",
    back: "← Back to challenges",
    allDone: "You found every flag! Amazing work.",
    gateTitle: "Flag Finders",
    gateBody: "Please sign in to play. We save the flags you find so we can see the skills you are learning.",
    signIn: "Sign in",
    create: "Create account",
    loading: "Loading…",
  },
  ar: {
    heroTitle: "صائدو الأعلام",
    heroSub: "خمسة تحدّيات صغيرة. اعثر على الإجابة المخفية في كل واحد. خذ وقتك، لا يوجد عدّاد.",
    progress: (n: number) => `وجدت ${n} من ${TRACKS.length}`,
    realLabel: "الاسم الحقيقي:",
    tapHint: "اضغط على إجابتك",
    tryAgain: "ليس تماماً، انظر مرة أخرى. يمكنك المحاولة ثانية 💙",
    learned: "ماذا تعلّمت",
    back: "← العودة للتحدّيات",
    allDone: "وجدت كل الأعلام! عمل رائع.",
    gateTitle: "صائدو الأعلام",
    gateBody: "يرجى تسجيل الدخول للّعب. نحفظ الأعلام التي تجدها لنرى المهارات التي تتعلّمها.",
    signIn: "تسجيل الدخول",
    create: "إنشاء حساب",
    loading: "جارٍ التحميل…",
  },
};

export default function CalmCtfPage() {
  const [lang, setLang] = useCalmLang();
  const router = useRouter();
  const { authState, solved, markSolved } = useCtfProgress();
  useTrackView("calm_ctf");
  const [activeId, setActiveId] = useState<string | null>(null);

  const isRtl = lang === "ar";
  const ui = UI[lang];
  const page: React.CSSProperties = {
    minHeight: "100vh", background: BG, color: "#1A2233",
    direction: isRtl ? "rtl" : "ltr", fontFamily: SANS,
  };

  // ── Loading ──
  if (authState === "loading") {
    return (
      <div style={page}>
        <CalmNav lang={lang} onLangChange={setLang} />
        <div style={{ paddingTop: 160, textAlign: "center", fontFamily: CINZEL, color: PRIMARY, fontSize: "1.1rem" }}>
          {ui.loading}
        </div>
      </div>
    );
  }

  // ── Signed out → gentle gate ──
  if (authState === "signed-out") {
    return (
      <div style={page}>
        <CalmNav lang={lang} onLangChange={setLang} />
        <div style={{ display: "flex", justifyContent: "center", padding: "140px 1.5rem 4rem" }}>
          <div style={{ maxWidth: 460, width: "100%", textAlign: "center", background: CARD, border: `2px solid ${BORDER}`, borderRadius: 22, padding: "2.5rem 2rem" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={34} color={PRIMARY} strokeWidth={1.5} />
              </div>
            </div>
            <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.6rem", color: PRIMARY, margin: "0 0 0.7rem" }}>
              {ui.gateTitle}
            </h1>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#475569", margin: "0 0 1.6rem" }}>
              {ui.gateBody}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/auth?next=/calm/ctf&guest=0")}
                style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.05rem", background: ACCENT, color: "#fff", border: "none", borderRadius: 14, padding: "0.85rem 2rem", cursor: "pointer" }}
              >
                {ui.signIn}
              </button>
              <button
                onClick={() => router.push("/auth?signup=true&next=/calm/ctf&guest=0")}
                style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.05rem", background: CARD, color: PRIMARY, border: `2px solid ${BORDER}`, borderRadius: 14, padding: "0.85rem 2rem", cursor: "pointer" }}
              >
                {ui.create}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Signed in ──
  const active = activeId ? TRACKS.find((t) => t.id === activeId) ?? null : null;
  const solvedCount = TRACKS.filter((t) => solved[t.id]).length;

  if (active) {
    return (
      <div style={page}>
        <CalmNav lang={lang} onLangChange={setLang} />
        <CalmChallenge
          track={active}
          lang={lang}
          ui={ui}
          alreadySolved={!!solved[active.id]}
          onSolve={() => markSolved({ challengeId: active.id, sectionId: active.sectionId, points: active.points, mode: "calm" })}
          onBack={() => setActiveId(null)}
        />
      </div>
    );
  }

  return (
    <div style={page}>
      <CalmNav lang={lang} onLangChange={setLang} />

      <main style={{ padding: "110px 1.5rem 4rem", maxWidth: 820, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Flag size={52} color={PRIMARY} strokeWidth={1.5} />
          </div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "clamp(1.7rem, 4vw, 2.3rem)", color: PRIMARY, margin: "0 0 0.5rem" }}>
            {ui.heroTitle}
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#475569", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            {ui.heroSub}
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "2rem" }}>
          <Trophy size={22} color={ACCENT} strokeWidth={1.5} />
          <span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.05rem", color: PRIMARY }}>
            {ui.progress(solvedCount)}
          </span>
          {solvedCount === TRACKS.length && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: OK_TX, fontWeight: 700 }}>
              <Star size={18} fill={OK_TX} color={OK_TX} /> {ui.allDone}
            </span>
          )}
        </div>

        {/* Track cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.2rem" }}>
          {TRACKS.map((t) => {
            const Icon = t.icon;
            const done = !!solved[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                style={{
                  textAlign: isRtl ? "right" : "left", cursor: "pointer", width: "100%",
                  background: done ? OK_BG : CARD,
                  border: `2px solid ${done ? OK_BD : BORDER}`,
                  borderRadius: 20, padding: "1.6rem 1.5rem",
                  display: "flex", flexDirection: "column", gap: "0.7rem",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = done ? OK_BD : BORDER; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Icon size={40} color={done ? OK_TX : PRIMARY} strokeWidth={1.5} />
                  {done && <CheckCircle size={26} color={OK_TX} strokeWidth={1.5} />}
                </div>
                <span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.2rem", color: PRIMARY }}>
                  {t.title[lang]}
                </span>
                <span style={{ fontSize: "0.95rem", color: "#64748B" }}>
                  {ui.realLabel} {t.realName[lang]}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

/* ── Single challenge ── */
function CalmChallenge({
  track, lang, ui, alreadySolved, onSolve, onBack,
}: {
  track: Track;
  lang: Lang;
  ui: typeof UI["en"];
  alreadySolved: boolean;
  onSolve: () => void;
  onBack: () => void;
}) {
  const isRtl = lang === "ar";
  const Icon = track.icon;
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);
  const done = alreadySolved || (picked != null && track.options[picked].correct);

  const choose = (i: number) => {
    if (done) return;
    const correct = track.options[i].correct;
    trackSkillAttempt(track.sectionId, track.id, correct, "calm");
    if (correct) {
      setPicked(i);
      setWrong(false);
      if (!alreadySolved) {
        trackSkillSolve(track.sectionId, track.id, track.points, "calm");
        onSolve();
      }
    } else {
      setPicked(i);
      setWrong(true);
    }
  };

  return (
    <main style={{ padding: "100px 1.5rem 4rem", maxWidth: 640, margin: "0 auto" }}>
      <button
        onClick={onBack}
        style={{ fontFamily: CINZEL, fontWeight: 600, fontSize: "0.95rem", background: "none", color: ACCENT, border: `2px solid ${BORDER}`, borderRadius: 12, padding: "0.5rem 1.2rem", cursor: "pointer", marginBottom: "1.4rem" }}
      >
        {ui.back}
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.2rem" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={30} color={PRIMARY} strokeWidth={1.5} />
        </div>
        <div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.5rem", color: PRIMARY, margin: 0 }}>
            {track.title[lang]}
          </h1>
          <span style={{ fontSize: "0.9rem", color: "#64748B" }}>{ui.realLabel} {track.realName[lang]}</span>
        </div>
      </div>

      {/* Prompt */}
      <p style={{ fontSize: "1.2rem", lineHeight: 1.7, color: "#1E293B", fontWeight: 600, marginBottom: "1.2rem" }}>
        {track.prompt[lang]}
      </p>

      {/* Puzzle display */}
      {track.big && (
        <div style={{ background: PRIMARY, borderRadius: 18, padding: "1.8rem", textAlign: "center", marginBottom: "1.4rem" }}>
          <span style={{ fontFamily: MONO, fontSize: "3rem", fontWeight: 700, letterSpacing: 8, color: "#FFFFFF", direction: "ltr", display: "inline-block" }}>
            {track.big}
          </span>
        </div>
      )}
      {track.show && (
        <div style={{ background: CARD, border: `2px solid ${BORDER}`, borderRadius: 16, padding: "1.3rem 1.5rem", marginBottom: "1.4rem" }}>
          {track.show.lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: track.show!.mono ? MONO : SANS,
                fontSize: track.show!.mono ? "1.05rem" : "1.25rem",
                lineHeight: 1.9, color: PRIMARY, direction: "ltr", textAlign: "left",
              }}
            >
              {!track.show!.mono && (
                <span style={{ display: "inline-block", minWidth: 24, fontWeight: 800, color: ACCENT }}>{line.charAt(0)}</span>
              )}
              {!track.show!.mono ? line.slice(1) : line}
            </div>
          ))}
        </div>
      )}

      {/* Options or success */}
      {!done ? (
        <>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "0.9rem", letterSpacing: 1, color: ACCENT, marginBottom: "0.8rem", textTransform: "uppercase" }}>
            {ui.tapHint}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {track.options.map((o, i) => {
              const isWrongPick = wrong && picked === i;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  style={{
                    fontFamily: o.mono ? MONO : SANS,
                    fontSize: o.mono ? "1rem" : "1.15rem", fontWeight: 600,
                    textAlign: isRtl && !o.mono ? "right" : "left",
                    direction: o.mono ? "ltr" : undefined,
                    background: isWrongPick ? TRY_BG : CARD,
                    border: `2px solid ${isWrongPick ? TRY_BD : BORDER}`,
                    color: PRIMARY, borderRadius: 14, padding: "1.1rem 1.3rem", cursor: "pointer", width: "100%",
                  }}
                  onMouseEnter={(e) => { if (!isWrongPick) (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; }}
                  onMouseLeave={(e) => { if (!isWrongPick) (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; }}
                >
                  {o[lang]}
                </button>
              );
            })}
          </div>
          {wrong && (
            <div style={{ marginTop: "1rem", fontSize: "1.05rem", color: TRY_TX, fontWeight: 600 }}>
              {ui.tryAgain}
            </div>
          )}
        </>
      ) : (
        <div style={{ background: OK_BG, border: `2px solid ${OK_BD}`, borderRadius: 18, padding: "1.5rem 1.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.9rem" }}>
            <CheckCircle size={28} color={OK_TX} strokeWidth={1.5} />
            <span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.3rem", color: OK_TX }}>
              {track.success[lang]}
            </span>
          </div>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "0.85rem", letterSpacing: 1, color: "#3f6b4d", marginBottom: "0.4rem", textTransform: "uppercase" }}>
            {ui.learned}
          </div>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#3a4a3f", margin: "0 0 1.2rem" }}>
            {track.lesson[lang]}
          </p>
          <button
            onClick={onBack}
            style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "1.05rem", background: ACCENT, color: "#fff", border: "none", borderRadius: 14, padding: "0.8rem 1.8rem", cursor: "pointer" }}
          >
            {ui.back}
          </button>
        </div>
      )}
    </main>
  );
}
