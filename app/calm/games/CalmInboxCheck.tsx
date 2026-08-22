"use client";

import { useState } from "react";
import { Mail, Fish, CheckCircle, Flag, Link2, Search, Lightbulb, AlertTriangle } from "lucide-react";
import { CalmShell, CalmHeader, CalmIntro, CalmResult } from "@/components/calm/CalmGameShell";

const ACCENT  = "#3B82F6";
const PRIMARY = "#1A3A5C";
const BORDER  = "#BFDBFE";

interface Email { enFrom: string; arFrom: string; enSender: string; arSender: string; enSubj: string; arSubj: string; enBody: string; arBody: string; url: string | null; phish: boolean; enFlags: string[]; arFlags: string[] }

const EMAILS: Email[] = [
  {
    enFrom: "noreply@amaz0n-delivery.net", arFrom: "noreply@amaz0n-delivery.net",
    enSender: "Amazon Delivery 📦",        arSender: "توصيل أمازون 📦",
    enSubj: "Your package is ON HOLD, verify now!",
    arSubj: "طردك في الانتظار، تحقق الآن!",
    enBody: "Dear Customer,\n\nYour package could not be delivered. You must verify your address and payment details within 24 HOURS or it will be returned.\n\nClick below immediately.",
    arBody: "عزيزي العميل،\n\nلم نتمكن من توصيل طردك. يجب عليك التحقق من عنوانك وبيانات الدفع خلال 24 ساعة وإلا سيتم إرجاعه.\n\nاضغط أدناه فوراً.",
    url: "http://amaz0n-delivery.net/verify",
    phish: true,
    enFlags: ["The email is from 'amaz0n' with a zero, not the real amazon.com", "It creates fake urgency with '24 HOURS'", "Real Amazon never asks you to click to verify payment like this"],
    arFlags: ["البريد من 'amaz0n' بصفر بدلاً من حرف O، وليس amazon.com الحقيقي", "يخلق إلحاحاً مزيفاً بـ '24 ساعة'", "أمازون الحقيقي لا يطلب منك النقر للتحقق من الدفع هكذا"],
  },
  {
    enFrom: "teacher.ali@school.edu.qa", arFrom: "teacher.ali@school.edu.qa",
    enSender: "Mr. Ali, Science Teacher",  arSender: "أستاذ علي، معلم العلوم",
    enSubj: "Homework reminder, Chapter 5 due Thursday",
    arSubj: "تذكير بالواجب، الفصل 5 يستحق يوم الخميس",
    enBody: "Hi students,\n\nJust a reminder that your Chapter 5 worksheet is due this Thursday. If you have any questions, email me or come see me during break.\n\nGood luck!\nMr. Ali",
    arBody: "مرحباً طلاباً،\n\nمجرد تذكير بأن ورقة عمل الفصل 5 تستحق هذا الخميس. إذا كان لديكم أي أسئلة، راسلوني أو تعالوا لرؤيتي خلال الاستراحة.\n\nحظاً موفقاً!\nأستاذ علي",
    url: null,
    phish: false,
    enFlags: ["Comes from an official school email (@school.edu.qa)", "No links to click or info to provide", "Normal, expected communication from a known teacher"],
    arFlags: ["يأتي من بريد إلكتروني رسمي للمدرسة (@school.edu.qa)", "لا روابط للنقر عليها أو معلومات لتقديمها", "تواصل طبيعي ومتوقع من معلم معروف"],
  },
  {
    enFrom: "prizes@wintoday-qt.com",   arFrom: "prizes@wintoday-qt.com",
    enSender: "Qatar Prize Department 🏆", arSender: "قسم الجوائز القطري 🏆",
    enSubj: "YOU HAVE BEEN SELECTED, Claim Your QR 50,000 Prize!",
    arSubj: "لقد تم اختيارك، اطالب بجائزتك 50,000 ريال!",
    enBody: "CONGRATULATIONS!\n\nYour phone number has been randomly selected to receive QR 50,000.\n\nTo claim, reply with your full name, ID number, and bank account number within 48 hours.",
    arBody: "تهانينا!\n\nتم اختيار رقم هاتفك عشوائياً للحصول على 50,000 ريال.\n\nللمطالبة، أرسل اسمك الكامل ورقم هويتك ورقم حسابك البنكي خلال 48 ساعة.",
    url: null,
    phish: true,
    enFlags: ["You never entered any contest, you can't win something you didn't enter", "Asking for your ID and bank details is a major red flag", "No real prize authority asks for bank info by email"],
    arFlags: ["لم تشترك في أي مسابقة، لا يمكنك الفوز بشيء لم تشترك فيه", "طلب رقم هويتك وبياناتك البنكية علامة تحذير كبيرة", "لا تطلب أي جهة جوائز حقيقية بيانات بنكية عبر البريد الإلكتروني"],
  },
  {
    enFrom: "mama.fatima@gmail.com",     arFrom: "mama.fatima@gmail.com",
    enSender: "Mama Fatima 💙",            arSender: "ماما فاطمة 💙",
    enSubj: "Can you pick up bread on your way home?",
    arSubj: "هل يمكنك أخذ خبز في طريقك للبيت؟",
    enBody: "Habibti,\n\nI forgot to buy bread this morning. Can you pick some up from the shop near school when you're heading home?\n\nLove you!\nMama",
    arBody: "حبيبتي،\n\nنسيت أن أشتري خبزاً هذا الصباح. هل يمكنك أخذ بعضه من المحل القريب من المدرسة في طريقك للبيت؟\n\nأحبك!\nماما",
    url: null,
    phish: false,
    enFlags: ["From a known email address you recognise", "A totally normal everyday request", "No links, no urgency, no personal info requested"],
    arFlags: ["من عنوان بريد إلكتروني معروف تعرفه", "طلب عادي جداً في الحياة اليومية", "لا روابط ولا إلحاح ولا طلب لمعلومات شخصية"],
  },
  {
    enFrom: "security-noreply@instagram-alerts.co", arFrom: "security-noreply@instagram-alerts.co",
    enSender: "Instagram Security 🔐",                arSender: "أمان إنستغرام 🔐",
    enSubj: "Your account will be DELETED, verify in 12 hours",
    arSubj: "سيتم حذف حسابك، تحقق خلال 12 ساعة",
    enBody: "We have detected suspicious activity on your Instagram account.\n\nYour account is scheduled for deletion in 12 hours unless you click the link below and enter your username and password to confirm your identity.",
    arBody: "اكتشفنا نشاطاً مريباً على حساب إنستغرام الخاص بك.\n\nسيتم حذف حسابك خلال 12 ساعة ما لم تنقر على الرابط أدناه وتدخل اسم مستخدمك وكلمة مرورك لتأكيد هويتك.",
    url: "http://instagram-alerts.co/verify-account",
    phish: true,
    enFlags: ["The email is from 'instagram-alerts.co', not the real instagram.com", "Instagram NEVER sends password requests by email", "Fake urgency: '12 hours' is a pressure tactic", "The link doesn't go to instagram.com"],
    arFlags: ["البريد من 'instagram-alerts.co'، وليس instagram.com الحقيقي", "إنستغرام لا يرسل أبداً طلبات كلمة المرور عبر البريد الإلكتروني", "إلحاح مزيف: '12 ساعة' هو أسلوب ضغط", "الرابط لا يذهب إلى instagram.com"],
  },
  {
    enFrom: "library@school.edu.qa",     arFrom: "library@school.edu.qa",
    enSender: "School Library 📚",        arSender: "مكتبة المدرسة 📚",
    enSubj: "Book return reminder, 3 days overdue",
    arSubj: "تذكير بإعادة الكتاب، 3 أيام متأخراً",
    enBody: "Hello,\n\nThis is a reminder that you have a book ('The Giver') that is 3 days overdue. Please return it to the library at your earliest convenience.\n\nThank you!\nSchool Library Team",
    arBody: "مرحباً،\n\nهذا تذكير بأن لديك كتاباً ('The Giver') متأخراً 3 أيام. يرجى إعادته إلى المكتبة في أقرب وقت ممكن.\n\nشكراً!\nفريق مكتبة المدرسة",
    url: null,
    phish: false,
    enFlags: ["Official school email address", "A routine, expected type of message from school", "No suspicious links or requests for personal info"],
    arFlags: ["عنوان بريد إلكتروني رسمي للمدرسة", "نوع من الرسائل الروتينية المتوقعة من المدرسة", "لا روابط مشبوهة أو طلبات لمعلومات شخصية"],
  },
];

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

const UI = {
  en: {
    title: "Real or Fake Email?", titleSub: "Decide if each email is real or a trick.",
    hoverHint: "Hover over the link to see where it really goes",
    realUrl: "Real destination",
    phishBtn: "Phishing!", phishSub: "This email is fake / a trick",
    safeBtn: "Looks Real",  safeSub: "This email seems genuine",
    correct: "Correct!", missed: "Not quite!",
    phishLabel: "This was a phishing email",
    safeLabel: "✓ This was a real email",
    next: "Next →", finish: "See my score",
    clickHere: "Click here",
    introLines: [
      "Some emails are real. Others are tricks trying to steal your info.",
      "Read each email carefully. Check the sender address and any links.",
      "Then decide: is it real, or is it a trick?",
    ],
    start: "Let's Play!",
    resultTitle: "Nice work!",
    resultGood: "You spotted every trick! You're an email detective.",
    resultOk: "Good job! You got most right. Keep an eye on those sender addresses.",
    resultTryAgain: "Keep practising, spotting phishing emails is a really useful skill!",
    again: "Play Again", home: "← Back to Games",
  },
  ar: {
    title: "بريد حقيقي أم مزيف؟", titleSub: "قرر إذا كان كل بريد حقيقياً أم حيلة.",
    hoverHint: "مرر فوق الرابط لترى أين يذهب حقاً",
    realUrl: "الوجهة الحقيقية",
    phishBtn: "تصيّد!", phishSub: "هذا البريد مزيف / حيلة",
    safeBtn: "يبدو حقيقياً", safeSub: "هذا البريد يبدو أصيلاً",
    correct: "صحيح!", missed: "ليس تماماً!",
    phishLabel: "كان هذا بريداً تصيّدياً",
    safeLabel: "✓ كان هذا بريداً حقيقياً",
    next: "التالي →", finish: "شاهد نتيجتي",
    clickHere: "اضغط هنا",
    introLines: [
      "بعض رسائل البريد الإلكتروني حقيقية. وأخرى حيل تحاول سرقة معلوماتك.",
      "اقرأ كل بريد بعناية. تحقق من عنوان المُرسِل وأي روابط.",
      "ثم قرر: هل هو حقيقي، أم هو حيلة؟",
    ],
    start: "هيا نلعب!",
    resultTitle: "عمل رائع!",
    resultGood: "اكتشفت كل الحيل! أنت محقق بريد إلكتروني.",
    resultOk: "عمل جيد! أجبت على معظمها بشكل صحيح. انتبه لعناوين المُرسِلين.",
    resultTryAgain: "استمر في التدريب، اكتشاف رسائل التصيد مهارة مفيدة جداً!",
    again: "العب مجدداً", home: "← العودة للألعاب",
  },
};

interface Props { lang: "en" | "ar"; onBack: () => void }

export default function CalmInboxCheck({ lang, onBack }: Props) {
  const isRtl = lang === "ar";
  const ui = UI[lang];
  const [phase, setPhase]       = useState<"intro" | "play" | "done">("intro");
  const [emails, setEmails]     = useState<Email[]>([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; email: Email } | null>(null);
  const [hover, setHover]       = useState(false);

  const start = () => {
    setEmails(shuffle([...EMAILS]).slice(0, 6));
    setIdx(0); setScore(0); setFeedback(null); setHover(false);
    setPhase("play");
  };

  const judge = (answer: "phish" | "safe") => {
    if (feedback) return;
    const email = emails[idx];
    const correct = (answer === "phish" && email.phish) || (answer === "safe" && !email.phish);
    if (correct) setScore(s => s + 1);
    setFeedback({ correct, email }); setHover(false);
  };

  const next = () => {
    setFeedback(null); setHover(false);
    if (idx + 1 >= emails.length) setPhase("done");
    else setIdx(i => i + 1);
  };

  const email = emails[idx];
  const resultMsg = score >= 5 ? ui.resultGood : score >= 4 ? ui.resultOk : ui.resultTryAgain;

  if (phase === "intro") return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} isRtl={isRtl} />
      <CalmIntro icon={<Mail size={80} color="#1A3A5C" strokeWidth={1.5} />} title={ui.titleSub} lines={ui.introLines} btnLabel={ui.start} onStart={start} />
    </CalmShell>
  );

  if (phase === "done") return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} score={score} isRtl={isRtl} />
      <CalmResult score={score} total={emails.length} title={ui.resultTitle} message={resultMsg} againLabel={ui.again} homeLabel={ui.home} onRestart={start} onHome={onBack} />
    </CalmShell>
  );

  return (
    <CalmShell>
      <CalmHeader name={ui.title} onBack={onBack} score={score} round={idx + 1} maxRound={emails.length} isRtl={isRtl} />
      <div style={{ padding: "1.5rem", maxWidth: 720, margin: "0 auto", direction: isRtl ? "rtl" : "ltr" }}>

        {/* Email card */}
        <div style={{ background: "#FFFFFF", border: `2px solid ${BORDER}`, borderRadius: 18, overflow: "hidden", marginBottom: "1.2rem", boxShadow: "0 2px 12px rgba(59,130,246,0.07)" }}>
          {/* Header */}
          <div style={{ padding: "1rem 1.4rem", background: "#EFF6FF", borderBottom: `2px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.6rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "#FFFFFF", fontWeight: 700, flexShrink: 0 }}>
                {(lang === "ar" ? email.arSender : email.enSender)[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: PRIMARY }}>{lang === "ar" ? email.arSender : email.enSender}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748B" }}>{lang === "ar" ? email.arFrom : email.enFrom}</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, color: "#1E293B", fontSize: "1rem" }}>{lang === "ar" ? email.arSubj : email.enSubj}</div>
          </div>

          {/* Body */}
          <div style={{ padding: "1.2rem 1.4rem" }}>
            <div style={{ fontSize: "0.98rem", color: "#334155", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
              {lang === "ar" ? email.arBody : email.enBody}
            </div>
            {email.url && (
              <div style={{ marginTop: "1rem" }}>
                <div
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: 10, background: "#DBEAFE", border: `1px solid ${BORDER}`, color: ACCENT, fontSize: "0.9rem", cursor: "help", position: "relative" }}
                >
                  <Link2 size={16} strokeWidth={1.5} />
                  {ui.clickHere}
                  {hover && (
                    <div style={{ position: "absolute", bottom: "calc(100% + 10px)", left: 0, padding: "0.5rem 0.9rem", background: "#FFFFFF", border: "2px solid #E4C9A1", borderRadius: 10, fontSize: "0.82rem", color: "#9A6A2F", whiteSpace: "nowrap", zIndex: 20, fontWeight: 700, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Search size={14} strokeWidth={1.5} />
                      {ui.realUrl}: {email.url}
                    </div>
                  )}
                </div>
                {!feedback && (
                  <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Lightbulb size={14} color="#94A3B8" strokeWidth={1.5} />
                    {ui.hoverHint}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Buttons or feedback */}
        {!feedback ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <button
              onClick={() => judge("phish")}
              style={{ padding: "1.2rem", borderRadius: 14, background: "#FBF6EF", border: "2px solid #E4C9A1", cursor: "pointer", textAlign: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#9A6A2F"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E4C9A1"; }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.3rem" }}><Fish size={32} color="#9A6A2F" strokeWidth={1.5} /></div>
              <div style={{ fontWeight: 800, color: "#9A6A2F", fontSize: "0.95rem" }}>{ui.phishBtn}</div>
              <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: "0.2rem" }}>{ui.phishSub}</div>
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
            <div style={{ fontWeight: 700, color: email.phish ? "#9A6A2F" : "#16a34a", marginBottom: "0.6rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {email.phish
                ? <><AlertTriangle size={16} strokeWidth={1.5} />{ui.phishLabel}</>
                : <>{ui.safeLabel}</>}
            </div>
            {(lang === "ar" ? email.arFlags : email.enFlags).map((f, i) => (
              <div key={i} style={{ fontSize: "0.9rem", color: "#334155", display: "flex", gap: "0.5rem", alignItems: "flex-start", lineHeight: 1.6, marginBottom: "0.3rem" }}>
                <span style={{ color: email.phish ? "#9A6A2F" : "#16a34a", flexShrink: 0, paddingTop: "0.1rem" }}>
                  {email.phish ? <Flag size={14} strokeWidth={1.5} /> : <CheckCircle size={14} strokeWidth={1.5} />}
                </span>
                {f}
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                onClick={next}
                style={{ fontFamily: "var(--ui)", fontWeight: 700, fontSize: "1rem", background: ACCENT, color: "#FFFFFF", border: "none", borderRadius: 12, padding: "0.7rem 1.8rem", cursor: "pointer" }}
              >
                {idx + 1 >= emails.length ? ui.finish : ui.next}
              </button>
            </div>
          </div>
        )}
      </div>
    </CalmShell>
  );
}
