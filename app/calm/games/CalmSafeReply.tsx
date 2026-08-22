"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { CalmShell, CalmHeader, CalmIntro, CalmResult } from "@/components/calm/CalmGameShell";

const ACCENT  = "#3B82F6";
const PRIMARY = "#1A3A5C";
const BORDER  = "#BFDBFE";

interface Option { en: string; ar: string; correct: boolean; enTip: string; arTip: string }
interface Scenario { enContext: string; arContext: string; enSpeaker: string; arSpeaker: string; enMsg: string; arMsg: string; opts: Option[] }

const SCENARIOS: Scenario[] = [
  {
    enContext: "Online game lobby", arContext: "لوبي لعبة إلكترونية",
    enSpeaker: "Player_X007",      arSpeaker: "Player_X007",
    enMsg: "Hey! What school do you go to? I'm trying to find kids near me to play with.",
    arMsg: "مرحباً! ما اسم مدرستك؟ أحاول إيجاد أطفال بجانبي للعب معهم.",
    opts: [
      { en: "I don't share my school online.", ar: "لا أشارك معلومات مدرستي على الإنترنت.", correct: true,  enTip: "Smart! Sharing your school name with strangers can help them find your location every day.", arTip: "ذكي! مشاركة اسم مدرستك مع الغرباء قد يساعدهم على معرفة مكانك يومياً." },
      { en: "It's Al-Nahda School in Doha!", ar: "إنها مدرسة النهضة في الدوحة!", correct: false, enTip: "Sharing your school name with strangers reveals where you can be found each day.", arTip: "مشاركة اسم مدرستك مع الغرباء يكشف أين يمكن إيجادك كل يوم." },
      { en: "I'll tell you later!", ar: "سأخبرك لاحقاً!", correct: false, enTip: "It's better to just say no. There's no need to promise to share later.", arTip: "من الأفضل أن تقول لا فقط. لا حاجة للوعد بالمشاركة لاحقاً." },
    ],
  },
  {
    enContext: "WhatsApp message", arContext: "رسالة واتساب",
    enSpeaker: "Unknown Number 🔴", arSpeaker: "رقم غير معروف 🔴",
    enMsg: "Congratulations! You won a free iPhone! Click here to claim your prize: bit.ly/win-now",
    arMsg: "تهانينا! لقد فزت بـ iPhone مجاني! اضغط هنا للمطالبة بجائزتك: bit.ly/win-now",
    opts: [
      { en: "I won't click that, this looks like a scam.", ar: "لن أضغط على ذلك، هذا يبدو احتيالاً.", correct: true,  enTip: "You didn't enter any contest, so you can't have won. Random prize messages are almost always scams.", arTip: "لم تشترك في أي مسابقة، لذا لا يمكنك الفوز. رسائل الجوائز العشوائية دائماً تقريباً عمليات احتيال." },
      { en: "Let me click and see what it is!", ar: "سأضغط عليه لأرى ما هو!", correct: false, enTip: "Clicking unknown links can give hackers access to your phone or personal info.", arTip: "الضغط على روابط غير معروفة قد يمنح المخترقين الوصول إلى هاتفك أو معلوماتك الشخصية." },
      { en: "Cool! I'll share it with my friends too.", ar: "رائع! سأشاركه مع أصدقائي أيضاً.", correct: false, enTip: "Sharing a scam link spreads the danger to your friends too.", arTip: "مشاركة رابط الاحتيال ينشر الخطر على أصدقائك أيضاً." },
    ],
  },
  {
    enContext: "Instagram DM", arContext: "رسالة إنستغرام",
    enSpeaker: "fashionfan2024",   arSpeaker: "fashionfan2024",
    enMsg: "You seem really cool! Can you send me your phone number so we can talk more?",
    arMsg: "تبدو رائعاً حقاً! هل يمكنك إرسال رقم هاتفك حتى نتحدث أكثر؟",
    opts: [
      { en: "I don't share my number with people I don't know.", ar: "لا أشارك رقمي مع أشخاص لا أعرفهم.", correct: true,  enTip: "Your phone number is private. Only share it with people you know and trust in real life.", arTip: "رقم هاتفك خاص. شاركه فقط مع أشخاص تعرفهم وتثق بهم في الحياة الحقيقية." },
      { en: "Sure, my number is 5500-XXXX!", ar: "بالطبع، رقمي 5500-XXXX!", correct: false, enTip: "You don't know this person. Sharing your number with strangers online is not safe.", arTip: "لا تعرف هذا الشخص. مشاركة رقمك مع الغرباء عبر الإنترنت ليس آمناً." },
      { en: "We can just keep talking here on Instagram.", ar: "يمكننا الاستمرار في التحدث هنا على إنستغرام.", correct: true,  enTip: "Good choice! There's no need to move to a private channel with someone you just met online.", arTip: "خيار جيد! لا داعي للانتقال إلى قناة خاصة مع شخص التقيت به للتو على الإنترنت." },
    ],
  },
  {
    enContext: "Email", arContext: "بريد إلكتروني",
    enSpeaker: "support@bank-alerts.net", arSpeaker: "support@bank-alerts.net",
    enMsg: "⚠️ Your account will be CLOSED in 24 hours! Click here and enter your password to save it.",
    arMsg: "⚠️ سيتم إغلاق حسابك خلال 24 ساعة! اضغط هنا وأدخل كلمة مرورك لحفظه.",
    opts: [
      { en: "Delete this, real banks never ask for your password by email.", ar: "احذف هذا، البنوك الحقيقية لا تطلب كلمة مرورك أبداً عبر البريد الإلكتروني.", correct: true, enTip: "Banks NEVER ask for your password by email. This is called phishing, a trick to steal your info.", arTip: "البنوك لا تطلب كلمة مرورك أبداً عبر البريد الإلكتروني. هذا يسمى التصيد، حيلة لسرقة معلوماتك." },
      { en: "I'll enter my password to save my account!", ar: "سأدخل كلمة مروري لحماية حسابي!", correct: false, enTip: "This is a fake email. Entering your password gives it directly to the scammer.", arTip: "هذا بريد إلكتروني مزيف. إدخال كلمة مرورك يعطيها مباشرة للمحتال." },
      { en: "I'll reply and ask if it's from the real bank.", ar: "سأرد وأسأل إذا كانت من البنك الحقيقي.", correct: false, enTip: "Replying to a phishing email confirms your address is active. Delete it and call your bank directly instead.", arTip: "الرد على رسالة تصيد يؤكد أن عنوانك نشط. احذفها واتصل ببنكك مباشرة." },
    ],
  },
  {
    enContext: "Gaming forum", arContext: "منتدى الألعاب",
    enSpeaker: "⚙️ SuperAdmin",   arSpeaker: "⚙️ SuperAdmin",
    enMsg: "We need your account username and password to fix a problem with your account.",
    arMsg: "نحتاج اسم مستخدمك وكلمة مرورك لإصلاح مشكلة في حسابك.",
    opts: [
      { en: "Real admins never need your password, this is a trick.", ar: "المشرفون الحقيقيون لا يحتاجون كلمة مرورك أبداً، هذه حيلة.", correct: true, enTip: "Legitimate staff can fix accounts without your password. Anyone asking for it is trying to steal your account.", arTip: "الموظفون الشرعيون يمكنهم إصلاح الحسابات بدون كلمة مرورك. من يطلبها يحاول سرقة حسابك." },
      { en: "Okay! Username: me123, Password: secret!", ar: "حسناً! اسم المستخدم: me123، كلمة المرور: secret!", correct: false, enTip: "Never share your password with anyone, even someone claiming to be an admin.", arTip: "لا تشارك كلمة مرورك مع أحد، حتى من يدّعي أنه مشرف." },
      { en: "Let me DM you the info.", ar: "سأرسل لك المعلومات برسالة خاصة.", correct: false, enTip: "Sharing your password in DMs is just as dangerous as sharing it publicly.", arTip: "مشاركة كلمة مرورك في رسالة خاصة بنفس الخطورة كمشاركتها علناً." },
    ],
  },
  {
    enContext: "Text message", arContext: "رسالة نصية",
    enSpeaker: "Your cousin Hessa 😊", arSpeaker: "ابنة عمك حصة 😊",
    enMsg: "Can you send me a photo of yourself for the family WhatsApp group?",
    arMsg: "هل يمكنك إرسال صورة لك لمجموعة واتساب العائلة؟",
    opts: [
      { en: "Sure, she's family and it's a private family group!", ar: "بالتأكيد، إنها من العائلة والمجموعة خاصة بالعائلة!", correct: true, enTip: "Sharing a photo with close family in a private group is fine.", arTip: "مشاركة صورة مع العائلة القريبة في مجموعة خاصة أمر جيد." },
      { en: "I'll ask a parent first, just to be sure.", ar: "سأسأل أحد والديّ أولاً، فقط للتأكد.", correct: true, enTip: "Asking a parent before sharing any photo online is always a smart move.", arTip: "سؤال أحد الوالدين قبل مشاركة أي صورة على الإنترنت دائماً خطوة ذكية." },
      { en: "I never share photos online ever.", ar: "لا أشارك الصور على الإنترنت أبداً.", correct: false, enTip: "With trusted family in a private group, sharing a photo is okay. It's all about context.", arTip: "مع العائلة الموثوقة في مجموعة خاصة، مشاركة صورة أمر مقبول. الأمر كله يتعلق بالسياق." },
    ],
  },
];

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

const UI = {
  en: {
    title: "Safe Reply", titleSub: "Pick the safest thing to say.",
    howToRespond: "How would you respond?",
    smartBadge: "Smart move! ", riskyBadge: "Risky choice: ",
    next: "Next →", finish: "See my score",
    introLines: [
      "Someone sends you a message online. What do you say back?",
      "Read each message and choose the safest reply.",
      "No timer, take your time and think it through!",
    ],
    start: "Let's Play!",
    resultTitle: "Well done!",
    resultGood: "You picked safe replies every time. You're great at this!",
    resultOk: "Good thinking! A few more practice rounds and you'll be an expert.",
    resultTryAgain: "Keep going! Knowing how to reply safely is a really important skill.",
    again: "Play Again", home: "← Back to Games",
  },
  ar: {
    title: "الرد الآمن", titleSub: "اختر أأمن رد ممكن.",
    howToRespond: "كيف ستردّ؟",
    smartBadge: "خطوة ذكية! ", riskyBadge: "خيار محفوف بالمخاطر: ",
    next: "التالي →", finish: "شاهد نتيجتي",
    introLines: [
      "أحد ما أرسل لك رسالة على الإنترنت. ماذا ستقول في ردك؟",
      "اقرأ كل رسالة واختر الرد الأكثر أماناً.",
      "لا يوجد مؤقت، خذ وقتك وفكّر بعناية!",
    ],
    start: "هيا نلعب!",
    resultTitle: "أحسنت!",
    resultGood: "لقد اخترت ردوداً آمنة في كل مرة. أنت رائع في هذا!",
    resultOk: "تفكير جيد! بضع جولات تدريب إضافية وستكون خبيراً.",
    resultTryAgain: "استمر! معرفة كيفية الرد بأمان مهارة مهمة جداً.",
    again: "العب مجدداً", home: "← العودة للألعاب",
  },
};

interface Props { lang: "en" | "ar"; onBack: () => void }

export default function CalmSafeReply({ lang, onBack }: Props) {
  const isRtl = lang === "ar";
  const ui = UI[lang];
  const [phase, setPhase]       = useState<"intro" | "play" | "done">("intro");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [chosen, setChosen]     = useState<Option | null>(null);

  const start = () => {
    setScenarios(shuffle([...SCENARIOS]).slice(0, 5).map(s => ({ ...s, opts: shuffle([...s.opts]) })));
    setIdx(0); setScore(0); setChosen(null);
    setPhase("play");
  };

  const choose = (opt: Option) => {
    if (chosen) return;
    if (opt.correct) setScore(s => s + 1);
    setChosen(opt);
  };

  const next = () => {
    setChosen(null);
    if (idx + 1 >= scenarios.length) setPhase("done");
    else setIdx(i => i + 1);
  };

  const sc = scenarios[idx];
  const resultMsg = score >= 5 ? ui.resultGood : score >= 3 ? ui.resultOk : ui.resultTryAgain;

  if (phase === "intro") return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} isRtl={isRtl} />
      <CalmIntro icon={<MessageCircle size={80} color="#1A3A5C" strokeWidth={1.5} />} title={ui.titleSub} lines={ui.introLines} btnLabel={ui.start} onStart={start} />
    </CalmShell>
  );

  if (phase === "done") return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} score={score} isRtl={isRtl} />
      <CalmResult score={score} total={scenarios.length} title={ui.resultTitle} message={resultMsg} againLabel={ui.again} homeLabel={ui.home} onRestart={start} onHome={onBack} />
    </CalmShell>
  );

  return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} score={score} round={idx + 1} maxRound={scenarios.length} isRtl={isRtl} />
      <div style={{ padding: "1.5rem", maxWidth: 700, margin: "0 auto", direction: isRtl ? "rtl" : "ltr" }}>

        {/* Context badge */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, background: "#DBEAFE", color: PRIMARY, borderRadius: 10, padding: "0.3rem 1rem" }}>
            {lang === "ar" ? sc.arContext : sc.enContext}
          </span>
        </div>

        {/* Chat bubble */}
        <div style={{ background: "#FFFFFF", border: `2px solid ${BORDER}`, borderRadius: "18px 18px 18px 4px", padding: "1.2rem 1.6rem", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(59,130,246,0.06)" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: ACCENT, marginBottom: "0.5rem" }}>
            {lang === "ar" ? sc.arSpeaker : sc.enSpeaker}
          </div>
          <div style={{ fontSize: "1.05rem", color: "#1E293B", lineHeight: 1.7 }}>
            {lang === "ar" ? sc.arMsg : sc.enMsg}
          </div>
        </div>

        <div style={{ fontSize: "0.9rem", color: "#64748B", textAlign: "center", marginBottom: "1rem" }}>
          {ui.howToRespond}
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {sc.opts.map((opt, i) => {
            const isChosen  = chosen?.en === opt.en;
            let bg = "#FFFFFF", bc = BORDER, textColor = "#1E293B";
            if (chosen) {
              if (opt.correct)           { bg = "#F0FDF4"; bc = "#86EFAC"; textColor = "#166534"; }
              else if (isChosen)         { bg = "#FBF6EF"; bc = "#E4C9A1"; textColor = "#991B1B"; }
            }

            return (
              <div
                key={i}
                onClick={() => choose(opt)}
                style={{
                  background: bg, border: `2px solid ${bc}`,
                  borderRadius: 14, padding: "1rem 1.2rem",
                  cursor: chosen ? "default" : "pointer",
                  color: textColor, fontSize: "1rem", lineHeight: 1.6,
                }}
                onMouseEnter={e => { if (!chosen) (e.currentTarget as HTMLDivElement).style.borderColor = ACCENT; }}
                onMouseLeave={e => { if (!chosen) (e.currentTarget as HTMLDivElement).style.borderColor = BORDER; }}
              >
                {lang === "ar" ? opt.ar : opt.en}
                {chosen && (opt.correct || isChosen) && (
                  <div style={{ fontSize: "0.88rem", marginTop: "0.6rem", paddingTop: "0.6rem", borderTop: `1px solid ${BORDER}`, color: "#475569" }}>
                    <strong style={{ color: opt.correct ? "#16a34a" : "#9A6A2F" }}>
                      {opt.correct ? ui.smartBadge : ui.riskyBadge}
                    </strong>
                    {lang === "ar" ? opt.arTip : opt.enTip}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {chosen && (
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button
              onClick={next}
              style={{ fontFamily: "var(--ui)", fontWeight: 700, fontSize: "1rem", background: ACCENT, color: "#FFFFFF", border: "none", borderRadius: 12, padding: "0.8rem 2rem", cursor: "pointer" }}
            >
              {idx + 1 >= scenarios.length ? ui.finish : ui.next}
            </button>
          </div>
        )}
      </div>
    </CalmShell>
  );
}
