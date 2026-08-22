"use client";
import { useTrackView } from "@/hooks/useTrackView";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Mail, MessageCircle, Smartphone } from "lucide-react";
import CalmNav from "@/components/calm/CalmNav";
import { useCalmLang } from "@/hooks/useCalmLang";
import CalmSouqSafe   from "./CalmSouqSafe";
import CalmSafeReply  from "./CalmSafeReply";
import CalmInboxCheck from "./CalmInboxCheck";
import CalmDMCheck    from "./CalmDMCheck";

const sans   = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const cinzel = "var(--ui)";

const gameIcons: Record<string, React.ReactNode> = {
  souq:  <ShoppingCart  size={48} color="#1A3A5C" strokeWidth={1.5} />,
  inbox: <Mail          size={48} color="#1A3A5C" strokeWidth={1.5} />,
  reply: <MessageCircle size={48} color="#1A3A5C" strokeWidth={1.5} />,
  dm:    <Smartphone    size={48} color="#1A3A5C" strokeWidth={1.5} />,
};

const GAMES = {
  en: [
    { id: "souq",  title: "Safe or Not Safe?",   desc: "Sort things into: keep it private, or okay to share. Simple drag and tap!" },
    { id: "inbox", title: "Real or Fake Email?", desc: "Read emails and decide if they are real or trying to trick you." },
    { id: "reply", title: "Safe Reply",           desc: "Someone sends you a message. Pick the safest thing to say back." },
    { id: "dm",    title: "Safe or Suspicious?", desc: "Look at each message and decide if it is safe or a trick." },
  ],
  ar: [
    { id: "souq",  title: "آمن أم لا؟",          desc: "صنّف الأشياء إلى: احتفظ بها لنفسك، أو يمكن مشاركتها. سحب وضغط بسيط!" },
    { id: "inbox", title: "بريد حقيقي أم مزيف؟", desc: "اقرأ رسائل البريد وقرر إذا كانت حقيقية أم تحاول خداعك." },
    { id: "reply", title: "الرد الآمن",           desc: "أحد ما أرسل لك رسالة. اختر أأمن رد ممكن." },
    { id: "dm",    title: "آمن أم مشبوه؟",       desc: "انظر إلى كل رسالة وقرر إذا كانت آمنة أم حيلة." },
  ],
};

const UI = {
  en: { title: "Play & Learn", sub: "Choose a game. Take your time, there is no timer pressure.", backHome: "← Back to home" },
  ar: { title: "العب وتعلّم", sub: "اختر لعبة. خذ وقتك، لا يوجد عداد للوقت.", backHome: "← العودة للرئيسية" },
};

export default function CalmGamesPage() {
  useTrackView("calm_games");
  const [lang, setLang] = useCalmLang();
  const [active, setActive] = useState<string | null>(null);
  const router = useRouter();
  const isRtl = lang === "ar";
  const ui = UI[lang];
  const games = GAMES[lang];

  if (active === "souq")  return <CalmSouqSafe   lang={lang} onBack={() => setActive(null)} />;
  if (active === "inbox") return <CalmInboxCheck  lang={lang} onBack={() => setActive(null)} />;
  if (active === "reply") return <CalmSafeReply   lang={lang} onBack={() => setActive(null)} />;
  if (active === "dm")    return <CalmDMCheck      lang={lang} onBack={() => setActive(null)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", color: "#1A2233", direction: isRtl ? "rtl" : "ltr", fontFamily: sans }}>
      <CalmNav lang={lang} onLangChange={setLang} />

      <main style={{ paddingTop: 100, padding: "100px 2rem 4rem", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#1A3A5C", marginBottom: "0.4rem", textAlign: "center" }}>
          {ui.title}
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#475569", textAlign: "center", marginBottom: "2.5rem", lineHeight: 1.7 }}>
          {ui.sub}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.4rem", marginBottom: "2.5rem" }}>
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setActive(game.id)}
              style={{
                background: "#FFFFFF", borderRadius: 20,
                border: "2px solid #BFDBFE", padding: "2rem 1.8rem",
                textAlign: isRtl ? "right" : "left",
                cursor: "pointer", display: "flex", flexDirection: "column", gap: "0.8rem",
                width: "100%",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B82F6"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#BFDBFE"; }}
            >
              <span style={{ display: "flex" }}>{gameIcons[game.id]}</span>
              <span style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.2rem", color: "#1A3A5C" }}>{game.title}</span>
              <span style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.6 }}>{game.desc}</span>
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => router.push("/calm")}
            style={{ fontFamily: cinzel, fontWeight: 600, fontSize: "0.95rem", background: "none", color: "#3B82F6", border: "2px solid #BFDBFE", borderRadius: 12, padding: "0.6rem 1.4rem", cursor: "pointer" }}
          >
            {ui.backHome}
          </button>
        </div>
      </main>
    </div>
  );
}
