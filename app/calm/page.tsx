"use client";
import { useTrackView } from "@/hooks/useTrackView";
import { useRouter } from "next/navigation";
import {
  Shield, Lightbulb, Search,
  Mail, KeyRound, EyeOff, AlertTriangle, ShoppingCart, Users,
  Smartphone, MessageCircle,
} from "lucide-react";
import CalmNav from "@/components/calm/CalmNav";
import { useCalmLang } from "@/hooks/useCalmLang";

const topicIcons: Record<string, React.ReactNode> = {
  phishing:  <Mail         size={48} color="#1A3A5C" strokeWidth={1.5} />,
  passwords: <KeyRound     size={48} color="#1A3A5C" strokeWidth={1.5} />,
  privacy:   <EyeOff       size={48} color="#1A3A5C" strokeWidth={1.5} />,
  scams:     <AlertTriangle size={48} color="#1A3A5C" strokeWidth={1.5} />,
  shopping:  <ShoppingCart  size={48} color="#1A3A5C" strokeWidth={1.5} />,
  family:    <Users         size={48} color="#1A3A5C" strokeWidth={1.5} />,
};

const gameIcons: Record<string, React.ReactNode> = {
  souq:  <ShoppingCart   size={38} color="#1A3A5C" strokeWidth={1.5} />,
  inbox: <Mail           size={38} color="#1A3A5C" strokeWidth={1.5} />,
  reply: <MessageCircle  size={38} color="#1A3A5C" strokeWidth={1.5} />,
  dm:    <Smartphone     size={38} color="#1A3A5C" strokeWidth={1.5} />,
};

const sans   = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const cinzel = "'Cinzel', Georgia, serif";

const content = {
  en: {
    hero:    "Stay Safe Online",
    heroSub: "Learn simple rules to stay safe on the internet. No rush. No pressure. Just easy steps.",
    topicsTitle: "Choose a topic to learn about",
    gamesTitle: "Play & Learn",
    gamesSub: "Fun games that teach you how to stay safe online. Take your time — there is no timer pressure.",
    gamesBtn: "Open the game room →",
    games: [
      { id: "souq",  title: "Safe or Not Safe?",   desc: "Sort things into safe and not-safe piles. Simple drag and drop!" },
      { id: "inbox", title: "Real or Fake Email?", desc: "Read emails and decide if they are real or trying to trick you." },
      { id: "reply", title: "Safe Reply",           desc: "Someone sends you a message. Pick the safest thing to say back." },
      { id: "dm",    title: "Strong Password",      desc: "Help make passwords stronger. See how hard they are to crack!" },
    ],
    topics: [
      { id: "phishing",  title: "Tricky Messages",   desc: "Learn how to spot messages that want to trick you." },
      { id: "passwords", title: "Your Secret Code",   desc: "Learn how to keep your accounts safe with a strong password." },
      { id: "privacy",   title: "Your Private Info",  desc: "Learn what personal info to keep secret online." },
      { id: "scams",     title: "Online Tricks",      desc: "Learn how to spot when someone is trying to trick you." },
      { id: "shopping",  title: "Safe Shopping",      desc: "Learn how to stay safe when buying things online." },
      { id: "family",    title: "Keeping Family Safe", desc: "Learn how to help your family stay safe online too." },
    ],
    rule:    "The most important rule",
    ruleText: "When you are not sure about something online, always ask a grown-up first.",
    checkLink: "Not sure about a link?",
    checkDesc: "You can paste any link here and we will tell you if it is safe.",
    checkBtn:  "Check a link",
    backToMain: "← Back to main site",
  },
  ar: {
    hero:    "ابقَ آمناً على الإنترنت",
    heroSub: "تعلّم قواعد بسيطة للبقاء آمناً على الإنترنت. بدون تسرّع. بدون ضغط. خطوات سهلة فقط.",
    topicsTitle: "اختر موضوعاً لتتعلم عنه",
    gamesTitle: "العب وتعلّم",
    gamesSub: "ألعاب ممتعة تعلّمك كيف تبقى آمناً على الإنترنت. خذ وقتك — لا يوجد عداد للوقت.",
    gamesBtn: "افتح غرفة الألعاب →",
    games: [
      { id: "souq",  title: "آمن أم لا؟",          desc: "رتّب الأشياء في مجموعتين: آمنة وغير آمنة. سحب وإفلات بسيط!" },
      { id: "inbox", title: "بريد حقيقي أم مزيف؟", desc: "اقرأ رسائل البريد وقرر إذا كانت حقيقية أم تحاول خداعك." },
      { id: "reply", title: "الرد الآمن",           desc: "أحد أرسل لك رسالة. اختر أأمن رد ممكن." },
      { id: "dm",    title: "كلمة مرور قوية",       desc: "ساعد في تقوية كلمات المرور. شاهد كم يصعب اختراقها!" },
    ],
    topics: [
      { id: "phishing",  title: "الرسائل المزيفة",   desc: "تعلّم كيف تتعرف على الرسائل التي تريد خداعك." },
      { id: "passwords", title: "كودك السري",          desc: "تعلّم كيف تحمي حساباتك بكلمة مرور قوية." },
      { id: "privacy",   title: "معلوماتك الخاصة",    desc: "تعلّم ما يجب إخفاؤه عنك على الإنترنت." },
      { id: "scams",     title: "الحيل الإلكترونية",  desc: "تعلّم كيف تعرف عندما يحاول شخص ما خداعك." },
      { id: "shopping",  title: "التسوق الآمن",        desc: "تعلّم كيف تبقى آمناً عند شراء الأشياء عبر الإنترنت." },
      { id: "family",    title: "حماية العائلة",       desc: "تعلّم كيف تساعد عائلتك على البقاء آمنة على الإنترنت." },
    ],
    rule:    "القاعدة الأهم",
    ruleText: "عندما لا تكون متأكداً من شيء على الإنترنت، اسأل شخصاً بالغاً أولاً دائماً.",
    checkLink: "غير متأكد من رابط؟",
    checkDesc: "يمكنك لصق أي رابط هنا وسنخبرك إذا كان آمناً.",
    checkBtn:  "افحص رابطاً",
    backToMain: "← العودة للموقع الرئيسي",
  },
};

export default function CalmPage() {
  useTrackView("calm_home");
  const [lang, setLang] = useCalmLang();
  const router = useRouter();
  const c = content[lang];
  const isRtl = lang === "ar";

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", color: "#1A2233", direction: isRtl ? "rtl" : "ltr", fontFamily: sans }}>
      <CalmNav lang={lang} onLangChange={setLang} />

      {/* ── Hero ── */}
      <section style={{
        paddingTop: 72,
        background: "#1A3A5C",
        padding: "120px 2rem 80px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}><Shield size={64} color="#FFFFFF" strokeWidth={1.5} /></div>
          <h1 style={{
            fontFamily: cinzel,
            fontWeight: 700,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            color: "#FFFFFF",
            lineHeight: 1.3,
            marginBottom: "1rem",
          }}>
            {c.hero}
          </h1>
          <p style={{
            fontSize: "1.3rem",
            color: "rgba(255,255,255,0.85)",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.8,
          }}>
            {c.heroSub}
          </p>
        </div>
      </section>

      {/* ── Topic tiles ── */}
      <section style={{ padding: "60px 2rem", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{
          fontFamily: cinzel,
          fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
          fontWeight: 700,
          color: "#1A3A5C",
          textAlign: "center",
          marginBottom: "2.5rem",
        }}>
          {c.topicsTitle}
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.4rem",
        }}>
          {c.topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => router.push(`/calm/lessons/${topic.id}`)}
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                border: "2px solid #BFDBFE",
                padding: "2rem 1.8rem",
                textAlign: isRtl ? "right" : "left",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
                width: "100%",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B82F6"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#BFDBFE"; }}
            >
              <span style={{ lineHeight: 1, display: "flex" }}>{topicIcons[topic.id]}</span>
              <span style={{
                fontFamily: cinzel,
                fontWeight: 700,
                fontSize: "1.3rem",
                color: "#1A3A5C",
              }}>
                {topic.title}
              </span>
              <span style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.6 }}>
                {topic.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Golden rule ── */}
      <section style={{ padding: "0 2rem 60px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{
          background: "#DBEAFE",
          border: "2px solid #93C5FD",
          borderRadius: 20,
          padding: "2rem 2.2rem",
          textAlign: "center",
        }}>
          <div style={{ marginBottom: "0.8rem", display: "flex", justifyContent: "center" }}><Lightbulb size={40} color="#1D4ED8" strokeWidth={1.5} /></div>
          <div style={{
            fontFamily: cinzel,
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "0.06em",
            color: "#1D4ED8",
            marginBottom: "0.7rem",
            textTransform: "uppercase",
          }}>
            {c.rule}
          </div>
          <p style={{
            fontSize: "1.25rem",
            color: "#1E3A5F",
            margin: 0,
            lineHeight: 1.7,
            fontWeight: 600,
          }}>
            {c.ruleText}
          </p>
        </div>
      </section>

      {/* ── Games ── */}
      <section style={{ background: "#EFF6FF", padding: "60px 2rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: cinzel,
            fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
            fontWeight: 700,
            color: "#1A3A5C",
            textAlign: "center",
            marginBottom: "0.5rem",
          }}>
            {c.gamesTitle}
          </h2>
          <p style={{ textAlign: "center", fontSize: "1.1rem", color: "#475569", marginBottom: "2.5rem", lineHeight: 1.7 }}>
            {c.gamesSub}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.2rem",
          }}>
            {c.games.map((game, i) => (
              <button
                key={i}
                onClick={() => router.push("/calm/games")}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 18,
                  border: "2px solid #BFDBFE",
                  padding: "1.6rem 1.4rem",
                  textAlign: isRtl ? "right" : "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  cursor: "pointer",
                  width: "100%",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B82F6"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#BFDBFE"; }}
              >
                <span style={{ lineHeight: 1, display: "flex" }}>{gameIcons[game.id]}</span>
                <span style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.1rem", color: "#1A3A5C" }}>
                  {game.title}
                </span>
                <span style={{ fontSize: "0.98rem", color: "#475569", lineHeight: 1.6 }}>
                  {game.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Check a link ── */}
      <section style={{ background: "#1A3A5C", padding: "56px 2rem" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ marginBottom: "0.8rem", display: "flex", justifyContent: "center" }}><Search size={40} color="#FFFFFF" strokeWidth={1.5} /></div>
          <h2 style={{
            fontFamily: cinzel,
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "#FFFFFF",
            marginBottom: "0.6rem",
          }}>
            {c.checkLink}
          </h2>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            {c.checkDesc}
          </p>
          <button
            onClick={() => router.push("/calm/scanner")}
            style={{
              fontFamily: cinzel,
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "#3B82F6",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 14,
              padding: "0.9rem 2.4rem",
              cursor: "pointer",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#2563EB"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#3B82F6"; }}
          >
            {c.checkBtn}
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: "center",
        padding: "2.5rem",
        fontSize: "1rem",
        color: "#64748B",
        background: "#F0F9FF",
        borderTop: "2px solid #BFDBFE",
      }}>
        {isRtl ? "مجلس الأمن السيبراني — قطر" : "CyberMajlis — Qatar"} ·{" "}
        <a href="/" style={{ color: "#1D7FCC", textDecoration: "none" }}>
          {c.backToMain}
        </a>
      </footer>
    </div>
  );
}
