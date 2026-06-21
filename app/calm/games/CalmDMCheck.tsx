"use client";

import { useState } from "react";
import { Smartphone, Flag, CheckCircle, AlertTriangle } from "lucide-react";
import { CalmShell, CalmHeader, CalmIntro, CalmResult } from "@/components/calm/CalmGameShell";

const ACCENT  = "#3B82F6";
const PRIMARY = "#1A3A5C";
const BORDER  = "#BFDBFE";

interface DM { enFrom: string; arFrom: string; enMsg: string; arMsg: string; sus: boolean; enFlags: string[]; arFlags: string[] }

const DMS: DM[] = [
  {
    enFrom: "Unknown number 🔴", arFrom: "رقم غير معروف 🔴",
    enMsg: "Congratulations! You won FREE Robux! Click: free-robux.xyz/claim",
    arMsg: "تهانينا! لقد فزت بـ Robux مجاني! اضغط: free-robux.xyz/claim",
    sus: true,
    enFlags: ["You didn't enter any contest", "Free game currency links are almost always scams", "The link goes to a suspicious unknown website"],
    arFlags: ["لم تشترك في أي مسابقة", "روابط العملة المجانية في الألعاب تكون دائماً تقريباً عمليات احتيال", "الرابط يذهب إلى موقع مشبوه غير معروف"],
  },
  {
    enFrom: "Mama 💙",       arFrom: "ماما 💙",
    enMsg: "Can you set the table for dinner? I'll be home in 20 minutes.",
    arMsg: "هل يمكنك ترتيب الطاولة للعشاء؟ سأكون في البيت خلال 20 دقيقة.",
    sus: false,
    enFlags: ["It's from someone you know and trust", "A completely normal, everyday request", "No links, no urgency, no personal info needed"],
    arFlags: ["من شخص تعرفه وتثق به", "طلب عادي جداً في الحياة اليومية", "لا روابط ولا إلحاح ولا حاجة لمعلومات شخصية"],
  },
  {
    enFrom: "BANK ALERT 🏦",  arFrom: "تنبيه البنك 🏦",
    enMsg: "URGENT: Your card has been blocked. Reply with your card number and PIN to unlock it.",
    arMsg: "عاجل: تم حجب بطاقتك. أرسل رقم بطاقتك والرقم السري لإلغاء الحجب.",
    sus: true,
    enFlags: ["Banks NEVER ask for your PIN by text or DM", "Real banks call you or ask you to visit a branch", "This is a classic scam to steal your card details"],
    arFlags: ["البنوك لا تطلب أبداً رقمك السري عبر رسالة نصية أو رسالة مباشرة", "البنوك الحقيقية تتصل بك أو تطلب منك زيارة فرع", "هذه حيلة كلاسيكية لسرقة بيانات بطاقتك"],
  },
  {
    enFrom: "Classmate Ahmed 😄", arFrom: "زميلك أحمد 😄",
    enMsg: "Did you understand Question 5 in the math homework? I'm a bit stuck.",
    arMsg: "هل فهمت السؤال 5 في واجب الرياضيات؟ أنا عالق قليلاً.",
    sus: false,
    enFlags: ["A message from a known classmate", "A completely normal school-related question", "No links, no requests for personal info"],
    arFlags: ["رسالة من زميل تعرفه", "سؤال طبيعي جداً متعلق بالمدرسة", "لا روابط ولا طلبات لمعلومات شخصية"],
  },
  {
    enFrom: "PrizeBot2024 🎁",  arFrom: "PrizeBot2024 🎁",
    enMsg: "You WON a PS5! We just need your home address and phone number to deliver it.",
    arMsg: "لقد فزت بـ PS5! نحتاج فقط عنوان بيتك ورقم هاتفك لتوصيله.",
    sus: true,
    enFlags: ["You never entered this contest", "Asking for your home address is a privacy and safety risk", "Legitimate prize deliveries go through official processes, not DMs"],
    arFlags: ["لم تشترك في هذه المسابقة قط", "طلب عنوان بيتك يشكّل خطراً على الخصوصية والسلامة", "تسليم الجوائز الحقيقي يمر عبر إجراءات رسمية، وليس عبر رسائل مباشرة"],
  },
  {
    enFrom: "Friend Sara 😊",  arFrom: "صديقتك سارة 😊",
    enMsg: "Did you watch the new season of that show we both love? SO GOOD!",
    arMsg: "هل شاهدت الموسم الجديد من المسلسل الذي نحبه كلانا؟ رائع جداً!",
    sus: false,
    enFlags: ["From a real friend you know", "A fun, casual conversation topic", "No links, no personal info, no urgency"],
    arFlags: ["من صديقة حقيقية تعرفها", "موضوع محادثة ممتع وغير رسمي", "لا روابط ولا معلومات شخصية ولا إلحاح"],
  },
  {
    enFrom: "Support Team ⚙️",  arFrom: "فريق الدعم ⚙️",
    enMsg: "Your account shows unusual activity. Verify your identity now or your account will be deleted in 1 hour.",
    arMsg: "يظهر حسابك نشاطاً غير عادي. تحقق من هويتك الآن أو سيتم حذف حسابك خلال ساعة.",
    sus: true,
    enFlags: ["Creates fake urgency ('1 hour') to panic you", "Real platforms don't threaten deletion by DM", "This is designed to make you act quickly without thinking"],
    arFlags: ["يخلق إلحاحاً مزيفاً ('ساعة') لإخافتك", "المنصات الحقيقية لا تهدد بالحذف عبر رسالة مباشرة", "هذا مصمم لجعلك تتصرف بسرعة دون تفكير"],
  },
  {
    enFrom: "Coach Khalid ⚽",  arFrom: "المدرب خالد ⚽",
    enMsg: "Training session is moved to Thursday this week due to the school event. Same time, same place.",
    arMsg: "تم تغيير موعد التدريب إلى يوم الخميس هذا الأسبوع بسبب فعالية المدرسة. نفس الوقت ونفس المكان.",
    sus: false,
    enFlags: ["From a coach you know", "A routine schedule change message", "No links, no personal info requested, nothing suspicious"],
    arFlags: ["من مدرب تعرفه", "رسالة تغيير جدول روتينية", "لا روابط ولا طلبات لمعلومات شخصية ولا شيء مشبوه"],
  },
];

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

const UI = {
  en: {
    title: "Safe or Suspicious?", titleSub: "Is this message safe or suspicious?",
    directMessage: "Direct Message",
    susBtn: "Suspicious!", susSub: "This looks like a trick",
    safeBtn: "Looks Safe",   safeSub: "This seems genuine",
    wasSuspicious: "This was suspicious", wasSafe: "✓ This was safe",
    correct: "Good catch!", missed: "Not quite!",
    next: "Next →", finish: "See my score",
    introLines: [
      "Your phone is full of messages. Some are from people you know, others are tricks.",
      "For each message, decide: does it look safe, or suspicious?",
      "Take your time, there's no rush!",
    ],
    start: "Let's Play!",
    resultTitle: "Well spotted!",
    resultGood: "You caught every suspicious message. You're hard to trick!",
    resultOk: "Good instincts! A couple more rounds and you'll be an expert.",
    resultTryAgain: "Keep practising, recognising suspicious messages takes practice!",
    again: "Play Again", home: "← Back to Games",
  },
  ar: {
    title: "آمن أم مشبوه؟", titleSub: "هل هذه الرسالة آمنة أم مشبوهة؟",
    directMessage: "رسالة مباشرة",
    susBtn: "مشبوه!", susSub: "هذا يبدو حيلة",
    safeBtn: "يبدو آمناً", safeSub: "هذا يبدو حقيقياً",
    wasSuspicious: "كان هذا مشبوهاً", wasSafe: "✓ كان هذا آمناً",
    correct: "اكتشاف جيد!", missed: "ليس تماماً!",
    next: "التالي →", finish: "شاهد نتيجتي",
    introLines: [
      "هاتفك مليء بالرسائل. بعضها من أشخاص تعرفهم، وأخرى حيل.",
      "لكل رسالة، قرر: هل تبدو آمنة، أم مشبوهة؟",
      "خذ وقتك، لا تسرّع!",
    ],
    start: "هيا نلعب!",
    resultTitle: "اكتشاف رائع!",
    resultGood: "اكتشفت كل رسالة مشبوهة. من الصعب خداعك!",
    resultOk: "حدس جيد! بضع جولات إضافية وستكون خبيراً.",
    resultTryAgain: "استمر في التدريب، التعرف على الرسائل المشبوهة يحتاج تمرين!",
    again: "العب مجدداً", home: "← العودة للألعاب",
  },
};

interface Props { lang: "en" | "ar"; onBack: () => void }

export default function CalmDMCheck({ lang, onBack }: Props) {
  const isRtl = lang === "ar";
  const ui = UI[lang];
  const [phase, setPhase]       = useState<"intro" | "play" | "done">("intro");
  const [msgs, setMsgs]         = useState<DM[]>([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; dm: DM } | null>(null);

  const start = () => {
    setMsgs(shuffle([...DMS]));
    setIdx(0); setScore(0); setFeedback(null);
    setPhase("play");
  };

  const judge = (answer: "sus" | "safe") => {
    if (feedback) return;
    const dm = msgs[idx];
    const correct = (answer === "sus" && dm.sus) || (answer === "safe" && !dm.sus);
    if (correct) setScore(s => s + 1);
    setFeedback({ correct, dm });
  };

  const next = () => {
    setFeedback(null);
    if (idx + 1 >= msgs.length) setPhase("done");
    else setIdx(i => i + 1);
  };

  const dm = msgs[idx];
  const resultMsg = score >= 7 ? ui.resultGood : score >= 5 ? ui.resultOk : ui.resultTryAgain;

  if (phase === "intro") return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} isRtl={isRtl} />
      <CalmIntro icon={<Smartphone size={80} color="#1A3A5C" strokeWidth={1.5} />} title={ui.titleSub} lines={ui.introLines} btnLabel={ui.start} onStart={start} />
    </CalmShell>
  );

  if (phase === "done") return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} score={score} isRtl={isRtl} />
      <CalmResult score={score} total={msgs.length} title={ui.resultTitle} message={resultMsg} againLabel={ui.again} homeLabel={ui.home} onRestart={start} onHome={onBack} />
    </CalmShell>
  );

  return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} score={score} round={idx + 1} maxRound={msgs.length} isRtl={isRtl} />
      <div style={{ padding: "1.5rem", maxWidth: 680, margin: "0 auto", direction: isRtl ? "rtl" : "ltr" }}>

        {/* Message card */}
        <div style={{ background: "#FFFFFF", border: `2px solid ${BORDER}`, borderRadius: 18, overflow: "hidden", marginBottom: "1.2rem", boxShadow: "0 2px 12px rgba(59,130,246,0.07)" }}>
          <div style={{ padding: "0.9rem 1.4rem", background: "#EFF6FF", borderBottom: `2px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "#FFFFFF", fontWeight: 700, flexShrink: 0 }}>
              {(lang === "ar" ? dm.arFrom : dm.enFrom)[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: PRIMARY }}>{lang === "ar" ? dm.arFrom : dm.enFrom}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748B" }}>{ui.directMessage}</div>
            </div>
          </div>
          <div style={{ padding: "1.2rem 1.4rem" }}>
            <p style={{ fontSize: "1.05rem", color: "#1E293B", lineHeight: 1.7, margin: 0 }}>
              {lang === "ar" ? dm.arMsg : dm.enMsg}
            </p>
          </div>
        </div>

        {/* Buttons or feedback */}
        {!feedback ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <button
              onClick={() => judge("sus")}
              style={{ padding: "1.2rem", borderRadius: 14, background: "#FBF6EF", border: "2px solid #E4C9A1", cursor: "pointer", textAlign: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#9A6A2F"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E4C9A1"; }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.3rem" }}><Flag size={32} color="#9A6A2F" strokeWidth={1.5} /></div>
              <div style={{ fontWeight: 800, color: "#9A6A2F", fontSize: "0.95rem" }}>{ui.susBtn}</div>
              <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: "0.2rem" }}>{ui.susSub}</div>
            </button>
            <button
              onClick={() => judge("safe")}
              style={{ padding: "1.2rem", borderRadius: 14, background: "#F0FDF4", border: "2px solid #86EFAC", cursor: "pointer", textAlign: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#16a34a"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#86EFAC"; }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.3rem" }}><CheckCircle size={32} color="#16a34a" strokeWidth={1.5} /></div>
              <div style={{ fontWeight: 800, color: "#16a34a", fontSize: "0.95rem" }}>{ui.safeBtn}</div>
              <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: "0.2rem" }}>{ui.safeSub}</div>
            </button>
          </div>
        ) : (
          <div style={{ background: feedback.correct ? "#F0FDF4" : "#FBF6EF", border: `2px solid ${feedback.correct ? "#86EFAC" : "#E4C9A1"}`, borderRadius: 16, padding: "1.2rem 1.4rem" }}>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: feedback.correct ? "#16a34a" : "#9A6A2F", textAlign: "center", marginBottom: "0.8rem" }}>
              {feedback.correct ? ui.correct : ui.missed}
            </div>
            <div style={{ fontWeight: 700, color: dm.sus ? "#9A6A2F" : "#16a34a", marginBottom: "0.6rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {dm.sus
                ? <><AlertTriangle size={16} strokeWidth={1.5} />{ui.wasSuspicious}</>
                : <>{ui.wasSafe}</>}
            </div>
            {(lang === "ar" ? dm.arFlags : dm.enFlags).map((f, i) => (
              <div key={i} style={{ fontSize: "0.9rem", color: "#334155", display: "flex", gap: "0.5rem", alignItems: "flex-start", lineHeight: 1.6, marginBottom: "0.3rem" }}>
                <span style={{ color: dm.sus ? "#9A6A2F" : "#16a34a", flexShrink: 0, paddingTop: "0.1rem" }}>
                  {dm.sus ? <AlertTriangle size={14} strokeWidth={1.5} /> : <CheckCircle size={14} strokeWidth={1.5} />}
                </span>
                {f}
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                onClick={next}
                style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: "1rem", background: ACCENT, color: "#FFFFFF", border: "none", borderRadius: 12, padding: "0.7rem 1.8rem", cursor: "pointer" }}
              >
                {idx + 1 >= msgs.length ? ui.finish : ui.next}
              </button>
            </div>
          </div>
        )}
      </div>
    </CalmShell>
  );
}
