"use client";
import { useTrackView } from "@/hooks/useTrackView";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, EyeOff, AlertTriangle, ShoppingCart, Users } from "lucide-react";
import CalmNav from "@/components/calm/CalmNav";
import { useCalmLang } from "@/hooks/useCalmLang";

const sans   = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const cinzel = "'Cinzel', Georgia, serif";

const topicIcons: Record<string, React.ReactNode> = {
  phishing:  <Mail          size={48} color="#1A3A5C" strokeWidth={1.5} />,
  passwords: <KeyRound      size={48} color="#1A3A5C" strokeWidth={1.5} />,
  privacy:   <EyeOff        size={48} color="#1A3A5C" strokeWidth={1.5} />,
  scams:     <AlertTriangle size={48} color="#1A3A5C" strokeWidth={1.5} />,
  shopping:  <ShoppingCart  size={48} color="#1A3A5C" strokeWidth={1.5} />,
  family:    <Users         size={48} color="#1A3A5C" strokeWidth={1.5} />,
};

const topics = {
  en: [
    { id: "phishing",  title: "Tricky Messages",    desc: "Scammers send fake messages to trick you. Learn to spot them.", mins: 4 },
    { id: "passwords", title: "Your Secret Code",    desc: "A strong password keeps your accounts safe.",                  mins: 3 },
    { id: "privacy",   title: "Your Private Info",   desc: "Some information should stay private and never be shared.",     mins: 4 },
    { id: "scams",     title: "Online Tricks",       desc: "Learn to spot when someone online is trying to trick you.",     mins: 4 },
    { id: "shopping",  title: "Safe Shopping",       desc: "How to tell if a website is safe before you buy anything.",     mins: 5 },
    { id: "family",    title: "Keeping Family Safe", desc: "You can help your whole family stay safe online.",             mins: 4 },
  ],
  ar: [
    { id: "phishing",  title: "الرسائل المزيفة",      desc: "المحتالون يرسلون رسائل وهمية. تعلّم كيف تتعرف عليها.",     mins: 4 },
    { id: "passwords", title: "كودك السري",             desc: "كلمة المرور القوية تحافظ على حساباتك آمنة.",              mins: 3 },
    { id: "privacy",   title: "معلوماتك الخاصة",       desc: "بعض المعلومات يجب أن تبقى سرية ولا تُشارَك أبداً.",       mins: 4 },
    { id: "scams",     title: "الحيل الإلكترونية",     desc: "تعلّم كيف تعرف عندما يحاول شخص ما خداعك على الإنترنت.", mins: 4 },
    { id: "shopping",  title: "التسوق الآمن",           desc: "كيف تعرف أن موقعاً آمن قبل أن تشتري منه أي شيء.",        mins: 5 },
    { id: "family",    title: "حماية العائلة",         desc: "يمكنك مساعدة عائلتك كلها على البقاء آمنة على الإنترنت.",  mins: 4 },
  ],
};

export default function CalmLessonsPage() {
  useTrackView("calm_lessons");
  const [lang, setLang] = useCalmLang();
  const router = useRouter();
  const list = topics[lang];
  const isRtl = lang === "ar";

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", color: "#1A2233", direction: isRtl ? "rtl" : "ltr", fontFamily: sans }}>
      <CalmNav lang={lang} onLangChange={setLang} />

      <main style={{ padding: "110px 2rem 5rem", maxWidth: 840, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: cinzel,
          fontWeight: 700,
          fontSize: "clamp(1.7rem, 4vw, 2.4rem)",
          color: "#1A3A5C",
          marginBottom: "0.5rem",
        }}>
          {isRtl ? "الدروس" : "Lessons"}
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#475569", marginBottom: "3rem", lineHeight: 1.7 }}>
          {isRtl
            ? "اختر أي موضوع يهمك. كل درس قصير وواضح — خطوة واحدة في كل مرة."
            : "Pick any topic you want to learn about. Every lesson is short and clear — one step at a time."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {list.map(topic => (
            <button
              key={topic.id}
              onClick={() => router.push(`/calm/lessons/${topic.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                background: "#FFFFFF",
                borderRadius: 18,
                border: "2px solid #BFDBFE",
                padding: "1.6rem 1.8rem",
                cursor: "pointer",
                width: "100%",
                textAlign: isRtl ? "right" : "left",
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B82F6"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#BFDBFE"; }}
            >
              <span style={{ flexShrink: 0, display: "flex" }}>{topicIcons[topic.id]}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: cinzel,
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: "#1A3A5C",
                  marginBottom: "0.3rem",
                }}>
                  {topic.title}
                </div>
                <div style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.6 }}>
                  {topic.desc}
                </div>
              </div>
              <div style={{
                flexShrink: 0,
                fontFamily: cinzel,
                fontSize: "0.85rem",
                color: "#1D4ED8",
                background: "#DBEAFE",
                border: "1px solid #93C5FD",
                borderRadius: 999,
                padding: "0.3rem 0.9rem",
                whiteSpace: "nowrap",
              }}>
                {topic.mins} {isRtl ? "دقائق" : "min"}
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer style={{
        textAlign: "center",
        padding: "2.5rem",
        fontSize: "1rem",
        color: "#64748B",
        background: "#F0F9FF",
        borderTop: "2px solid #BFDBFE",
      }}>
        {isRtl ? "مجلس الأمن السيبراني — قطر" : "CyberMajlis — Qatar"} ·{" "}
        <a href="/calm" style={{ color: "#1D7FCC", textDecoration: "none" }}>
          {isRtl ? "← الرئيسية" : "← Home"}
        </a>
      </footer>
    </div>
  );
}
