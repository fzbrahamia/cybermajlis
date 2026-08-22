"use client";

import { useState } from "react";
import { ShoppingCart, Lock, MessageCircle, Lightbulb } from "lucide-react";
import { CalmShell, CalmHeader, CalmIntro, CalmResult } from "@/components/calm/CalmGameShell";

const ACCENT  = "#3B82F6";
const PRIMARY = "#1A3A5C";
const BORDER  = "#BFDBFE";

interface Item { en: string; ar: string; protect: boolean; enWhy: string; arWhy: string }

const ITEMS: Item[] = [
  { en: "Your password",          ar: "كلمة مرورك",             protect: true,  enWhy: "Never share your password, it's like the key to your house.", arWhy: "لا تشارك كلمة مرورك أبداً، إنها مثل مفتاح بيتك." },
  { en: "Your favorite color",    ar: "لونك المفضل",             protect: false, enWhy: "This is fine to share, it's not private information.", arWhy: "هذا الاشتراك يعد أمراً جيداً، ليست معلومات خاصة." },
  { en: "Your home address",      ar: "عنوان بيتك",              protect: true,  enWhy: "Your address tells strangers where you live, keep it private.", arWhy: "عنوانك يخبر الغرباء أين تسكن، احتفظ به لنفسك." },
  { en: "Your favorite sport",    ar: "رياضتك المفضلة",          protect: false, enWhy: "Sharing what sport you like is completely safe.", arWhy: "مشاركة رياضتك المفضلة أمر آمن تماماً." },
  { en: "Your phone number",      ar: "رقم هاتفك",               protect: true,  enWhy: "Only share your phone number with people you trust.", arWhy: "شارك رقم هاتفك مع الأشخاص الذين تثق بهم فقط." },
  { en: "Your nickname online",   ar: "لقبك على الإنترنت",       protect: false, enWhy: "A friendly nickname is usually fine to use online.", arWhy: "اللقب الودي عادةً أمر جيد لاستخدامه على الإنترنت." },
  { en: "Your bank card PIN",     ar: "الرقم السري لبطاقتك",     protect: true,  enWhy: "Never share your PIN with anyone, ever!", arWhy: "لا تشارك الرقم السري مع أحد، أبداً!" },
  { en: "Your favorite food",     ar: "طعامك المفضل",             protect: false, enWhy: "Telling people your favorite food is perfectly safe.", arWhy: "إخبار الناس بطعامك المفضل آمن تماماً." },
  { en: "Your school name",       ar: "اسم مدرستك",               protect: true,  enWhy: "Sharing your school name with strangers can help them find you.", arWhy: "مشاركة اسم مدرستك مع الغرباء قد يساعدهم على إيجادك." },
  { en: "Your favorite movie",    ar: "فيلمك المفضل",             protect: false, enWhy: "Movie preferences are safe and fun to share.", arWhy: "تفضيلات الأفلام آمنة ومحببة للمشاركة." },
  { en: "Your national ID number",ar: "رقم هويتك الوطنية",        protect: true,  enWhy: "ID numbers are very private, never share them online.", arWhy: "أرقام الهوية خاصة جداً، لا تشاركها على الإنترنت." },
  { en: "Your pet's name",        ar: "اسم حيوانك الأليف",        protect: false, enWhy: "Sharing your pet's name is harmless and fun!", arWhy: "مشاركة اسم حيوانك الأليف أمر بسيط وممتع!" },
];

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

const UI = {
  en: {
    title: "Safe or Not Safe?", titleSub: "Sort each thing into the right pile.",
    protect: "Keep it private", protectSub: "Personal & sensitive",
    share: "Okay to share", shareSub: "Not private",
    clickHint: "Tap a pile to sort this item",
    correct: "Correct!", wrong: "Not quite!",
    next: "Next →", finish: "See my score",
    introLines: [
      "Some information should be kept private. Other things are fine to share.",
      "For each item, decide: should you keep it private, or is it okay to share?",
      "Tap the right pile for each one. Take your time!",
    ],
    start: "Let's Play!",
    resultTitle: "Great job!",
    resultGood: "Excellent! You know what to keep private online.",
    resultOk: "Good work! You got most of them right.",
    resultTryAgain: "Keep practising, you're learning!",
    again: "Play Again", home: "← Back to Games",
  },
  ar: {
    title: "آمن أم لا؟", titleSub: "صنّف كل شيء في المكان الصحيح.",
    protect: "احتفظ به لنفسك", protectSub: "معلومات شخصية وحساسة",
    share: "يمكن مشاركته", shareSub: "ليس خاصاً",
    clickHint: "اضغط على الكومة لتصنيف هذا العنصر",
    correct: "صحيح!", wrong: "ليس تماماً!",
    next: "التالي →", finish: "شاهد نتيجتي",
    introLines: [
      "بعض المعلومات يجب أن تبقى خاصة. أشياء أخرى يمكن مشاركتها.",
      "لكل عنصر، قرر: هل تحتفظ به لنفسك، أم يمكن مشاركته؟",
      "اضغط على الكومة الصحيحة لكل عنصر. خذ وقتك!",
    ],
    start: "هيا نلعب!",
    resultTitle: "عمل رائع!",
    resultGood: "ممتاز! تعرف ما يجب إخفاؤه على الإنترنت.",
    resultOk: "عمل جيد! أجبت على معظمها بشكل صحيح.",
    resultTryAgain: "استمر في التدريب، أنت تتعلم!",
    again: "العب مجدداً", home: "← العودة للألعاب",
  },
};

interface Props { lang: "en" | "ar"; onBack: () => void }

export default function CalmSouqSafe({ lang, onBack }: Props) {
  const isRtl = lang === "ar";
  const ui = UI[lang];
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx]     = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; why: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const start = () => {
    setItems(shuffle([...ITEMS]).slice(0, 10));
    setIdx(0); setScore(0); setFeedback(null);
    setPhase("play");
  };

  const judge = (zone: "protect" | "share") => {
    if (feedback) return;
    const item = items[idx];
    const correct = (zone === "protect" && item.protect) || (zone === "share" && !item.protect);
    if (correct) setScore(s => s + 1);
    setFeedback({ correct, why: lang === "ar" ? item.arWhy : item.enWhy });
  };

  const next = () => {
    setFeedback(null);
    if (idx + 1 >= items.length) setPhase("done");
    else setIdx(i => i + 1);
  };

  const item = items[idx];

  const resultMsg = score >= 9 ? ui.resultGood : score >= 6 ? ui.resultOk : ui.resultTryAgain;

  if (phase === "intro") return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} isRtl={isRtl} />
      <CalmIntro icon={<ShoppingCart size={80} color="#1A3A5C" strokeWidth={1.5} />} title={ui.titleSub} lines={ui.introLines} btnLabel={ui.start} onStart={start} />
    </CalmShell>
  );

  if (phase === "done") return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} score={score} isRtl={isRtl} />
      <CalmResult score={score} total={items.length} title={ui.resultTitle} message={resultMsg} againLabel={ui.again} homeLabel={ui.home} onRestart={start} onHome={onBack} />
    </CalmShell>
  );

  return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} score={score} round={idx + 1} maxRound={items.length} isRtl={isRtl} />
      <div style={{ padding: "2rem 1.5rem", maxWidth: 680, margin: "0 auto", direction: isRtl ? "rtl" : "ltr" }}>

        {/* Item card */}
        <div style={{ minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
          {!feedback ? (
            <div
              draggable
              onDragStart={e => e.dataTransfer.setData("text", "item")}
              style={{ background: "#FFFFFF", border: `2px solid ${BORDER}`, borderRadius: 20, padding: "2rem 2.4rem", textAlign: "center", cursor: "grab", userSelect: "none", width: "100%", boxShadow: "0 2px 12px rgba(59,130,246,0.08)" }}
            >
              <div style={{ fontSize: "1.5rem", color: "#94A3B8", marginBottom: "0.5rem", fontWeight: 500 }}>{isRtl ? "ما هذا؟" : "What about this?"}</div>
              <div style={{ fontFamily: "var(--ui)", fontWeight: 700, fontSize: "1.4rem", color: PRIMARY }}>{lang === "ar" ? item.ar : item.en}</div>
              <div style={{ fontSize: "0.85rem", color: "#94A3B8", marginTop: "0.8rem" }}>{ui.clickHint}</div>
            </div>
          ) : (
            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: feedback.correct ? "#16a34a" : "#9A6A2F", marginBottom: "0.8rem" }}>
                {feedback.correct ? ui.correct : ui.wrong}
              </div>
              <div style={{ background: "#EFF6FF", border: `2px solid ${BORDER}`, borderRadius: 16, padding: "1.2rem 1.6rem", marginBottom: "1.2rem", fontSize: "1.05rem", color: "#1E3A5F", lineHeight: 1.7, display: "flex", gap: "0.7rem", alignItems: "flex-start", textAlign: "left" }}>
                <span style={{ flexShrink: 0, paddingTop: "0.1rem" }}><Lightbulb size={20} color="#1D4ED8" strokeWidth={1.5} /></span>
                <span>{feedback.why}</span>
              </div>
              <button
                onClick={next}
                style={{ fontFamily: "var(--ui)", fontWeight: 700, background: ACCENT, color: "#FFFFFF", border: "none", borderRadius: 12, padding: "0.8rem 2rem", cursor: "pointer", fontSize: "1rem" }}
              >
                {idx + 1 >= items.length ? ui.finish : ui.next}
              </button>
            </div>
          )}
        </div>

        {/* Drop zones */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {(["protect", "share"] as const).map(zone => (
            <div
              key={zone}
              onDragOver={e => { e.preventDefault(); setDragOver(zone); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => { setDragOver(null); judge(zone); }}
              onClick={() => !feedback && judge(zone)}
              style={{
                borderRadius: 20, padding: "1.4rem 1rem", textAlign: "center",
                border: `2px dashed ${dragOver === zone ? ACCENT : BORDER}`,
                background: dragOver === zone ? "#DBEAFE" : "#F8FAFF",
                cursor: feedback ? "default" : "pointer",
                minHeight: 110,
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.4rem" }}>
                {zone === "protect"
                  ? <Lock size={28} color={PRIMARY} strokeWidth={1.5} />
                  : <MessageCircle size={28} color={PRIMARY} strokeWidth={1.5} />}
              </div>
              <div style={{ fontFamily: "var(--ui)", fontWeight: 700, fontSize: "0.95rem", color: PRIMARY }}>
                {zone === "protect" ? ui.protect : ui.share}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.3rem" }}>
                {zone === "protect" ? ui.protectSub : ui.shareSub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CalmShell>
  );
}
