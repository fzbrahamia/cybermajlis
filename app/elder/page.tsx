"use client";
import { useTrackView } from "@/hooks/useTrackView";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ElderNav from "@/components/elder/ElderNav";
import TtsButton from "@/components/elder/TtsButton";
import { useElderLang } from "@/hooks/useElderLang";

const cinzel = "'Cinzel', Georgia, serif";
const body   = "'Crimson Pro', Georgia, serif";

const content = {
  en: {
    hero: "Stay Safe in the Digital World",
    heroSub: "This space was made for you, no jargon, no rushing. Just clear guidance to help you and your family stay safe online.",
    thenNowTitle: "The world changed. The threats didn't, they just moved online.",
    cards: [
      {
        then: "A stranger called on the landline, pretending to be from your bank.",
        now: "Today that same stranger sends a WhatsApp message, or an email, that looks exactly like it came from your bank.",
        lesson: "Never click a link sent to you. Go to your bank's website by typing it yourself.",
        topic: "phishing",
      },
      {
        then: "You locked your front door with a key only you had.",
        now: "Your accounts need the same protection, a strong password only you know, changed regularly.",
        lesson: "Use a long phrase you remember, like: MyGrandchildren2Hamad!",
        topic: "passwords",
      },
      {
        then: "You wouldn't let a stranger photograph you in your home without permission.",
        now: "Apps on your phone can access your camera, location, and contacts, unless you tell them not to.",
        lesson: "Check which apps have permission to your camera and location in your phone settings.",
        topic: "privacy",
      },
      {
        then: "If a deal at the market sounded too good to be true, you walked away.",
        now: "Online scams use the same trick, 'You won!', 'Limited offer!', 'Act now!'",
        lesson: "If something feels too good to be true online, it almost always is.",
        topic: "scams",
      },
    ],
    sections: [
      { href: "/elder/lessons",   icon: "📖", title: "Learn at Your Pace",       desc: "Simple lessons with videos. No quizzes, no pressure." },
      { href: "/elder/scanner",   icon: "🔍", title: "Check a Suspicious Link",  desc: "Paste any link and we will tell you if it is safe." },
      { href: "/elder/news",      icon: "📰", title: "Latest Safety News",        desc: "What scammers are doing right now in Qatar." },
      { href: "/elder/community", icon: "🤝", title: "Talk to Others",            desc: "Share experiences, ask questions, help each other." },
    ],
    ttsLabel: "Read this page aloud",
  },
  ar: {
    hero: "ابقَ آمناً في العالم الرقمي",
    heroSub: "هذا المكان صُنع من أجلك، بلا مصطلحات معقدة، وبلا تسرّع. إرشادات واضحة لتحميك أنت وعائلتك على الإنترنت.",
    thenNowTitle: "تغيّر العالم. والتهديدات لم تختفِ، انتقلت فقط إلى الإنترنت.",
    cards: [
      {
        then: "كان غريب يتصل على الهاتف الأرضي متظاهراً بأنه من البنك.",
        now: "اليوم، نفس الشخص يرسل رسالة واتساب، أو بريداً إلكترونياً، تبدو تماماً كأنها من بنكك.",
        lesson: "لا تضغط على أي رابط يُرسل إليك. اكتب عنوان البنك بنفسك في المتصفح.",
        topic: "phishing",
      },
      {
        then: "كنت تغلق بابك بمفتاح خاص بك وحدك.",
        now: "حساباتك تحتاج نفس الحماية، كلمة مرور قوية تعرفها أنت فقط، تُغيّرها بانتظام.",
        lesson: "استخدم جملة طويلة تتذكرها، مثل: عائلتي_حمد_2025!",
        topic: "passwords",
      },
      {
        then: "لم تكن تسمح لغريب بتصويرك في بيتك دون إذن.",
        now: "التطبيقات على هاتفك تستطيع الوصول إلى كاميرتك وموقعك وجهات اتصالك، إلا إذا منعتها.",
        lesson: "افتح إعدادات هاتفك وتحقق من التطبيقات التي تملك صلاحية الكاميرا والموقع.",
        topic: "privacy",
      },
      {
        then: "إذا بدت صفقة في السوق مريبة، كنت تمضي في حالك.",
        now: "نفس الحيلة على الإنترنت، 'ربحت جائزة!'، 'عرض محدود!'، 'تصرف الآن!'",
        lesson: "إذا شعرت أن شيئاً ما جيد أكثر مما ينبغي، فالغالب أنه احتيال.",
        topic: "scams",
      },
    ],
    sections: [
      { href: "/elder/lessons",   icon: "📖", title: "تعلّم بالسرعة التي تناسبك", desc: "دروس بسيطة مع فيديوهات. بلا اختبارات، بلا ضغط." },
      { href: "/elder/scanner",   icon: "🔍", title: "افحص رابطاً مشبوهاً",        desc: "الصق أي رابط وسنخبرك إذا كان آمناً أم لا." },
      { href: "/elder/news",      icon: "📰", title: "آخر أخبار الأمان",           desc: "ما يفعله المحتالون الآن في قطر." },
      { href: "/elder/community", icon: "🤝", title: "تحدّث مع الآخرين",           desc: "شارك تجاربك، اطرح أسئلتك، ساعد بعضكم البعض." },
    ],
    ttsLabel: "اقرأ لي هذه الصفحة",
  },
};

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

export default function ElderPage() {
  useTrackView("elder_home");
  const [lang, setLang] = useElderLang();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollY = useScrollY();
  const c = content[lang];
  const isRtl = lang === "ar";

  const getPageText = () => {
    const root = contentRef.current;
    if (!root) return "";
    // Skip control buttons (e.g. Read-aloud) so the TTS reads only the page body.
    const skip = Array.from(root.querySelectorAll<HTMLElement>("[data-tts-skip]"));
    const prev = skip.map((el) => el.style.display);
    skip.forEach((el) => { el.style.display = "none"; });
    const text = root.innerText ?? "";
    skip.forEach((el, i) => { el.style.display = prev[i]; });
    return text;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", color: "#4a1a1d", direction: isRtl ? "rtl" : "ltr", fontFamily: body }}>
      <ElderNav lang={lang} onLangChange={setLang} />

      {/* contentRef wraps only page body, nav and footer are excluded from TTS */}
      <div ref={contentRef}>

      {/* ── Hero ── */}
      <section style={{
        paddingTop: 120, paddingBottom: 80,
        background: "linear-gradient(160deg, #FBF4E8 0%, #F1E8D6 100%)",
        borderBottom: "1px solid rgba(99,32,36,0.12)",
        textAlign: "center", padding: "120px 2rem 80px",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 style={{
            fontFamily: cinzel, fontWeight: 700,
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            color: "#4a1a1d", lineHeight: 1.3, marginBottom: "1.2rem",
          }}>
            {c.hero}
          </h1>
          <p style={{ fontSize: "1.3rem", color: "#6a4640", maxWidth: 620, margin: "0 auto 2rem", lineHeight: 1.8 }}>
            {c.heroSub}
          </p>
          <TtsButton getText={getPageText} lang={lang} />
        </div>
      </section>

      {/* ── Now & Then cards ── */}
      <section style={{ padding: "64px 2rem", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontFamily: cinzel, fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#4a1a1d", textAlign: "center", marginBottom: "0.6rem" }}>
          {c.thenNowTitle}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem", marginTop: "2.5rem" }}>
          {c.cards.map((card, i) => (
            <div key={i} onClick={() => router.push(`/elder/lessons/${card.topic}`)} style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid rgba(99,32,36,0.12)",
              boxShadow: "0 4px 24px rgba(62,19,22,0.08)",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              display: "flex",
              flexDirection: "column",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(62,19,22,0.15)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(62,19,22,0.08)"; }}
            >
              {/* Then */}
              <div style={{ background: "#F7F3EE", padding: "1.4rem 1.6rem", borderBottom: "1px solid rgba(99,32,36,0.08)" }}>
                <div style={{ fontFamily: cinzel, fontSize: "0.75rem", letterSpacing: "0.1em", color: "#8B2635", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {isRtl ? "قبل" : "THEN"}
                </div>
                <p style={{ fontSize: "1.1rem", color: "#6a4640", margin: 0, lineHeight: 1.65 }}>{card.then}</p>
              </div>
              {/* Now */}
              <div style={{ padding: "1.4rem 1.6rem", borderBottom: "1px solid rgba(99,32,36,0.08)", flex: 1 }}>
                <div style={{ fontFamily: cinzel, fontSize: "0.75rem", letterSpacing: "0.1em", color: "#632024", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {isRtl ? "الآن" : "NOW"}
                </div>
                <p style={{ fontSize: "1.1rem", color: "#4a1a1d", margin: 0, lineHeight: 1.65 }}>{card.now}</p>
              </div>
              {/* Tip */}
              <div style={{ background: "linear-gradient(135deg, #4a1a1d, #632024)", padding: "1.2rem 1.6rem", display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: "1rem", color: "#E8D4BC", margin: 0, lineHeight: 1.65 }}>{card.lesson}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sections ── */}
      <section style={{ background: "#4a1a1d", padding: "64px 2rem" }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.2rem",
        }}>
          {c.sections.map(sec => (
            <a key={sec.href} href={sec.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(232,212,188,0.07)",
                border: "1px solid rgba(197,165,126,0.2)",
                borderRadius: 16,
                padding: "1.8rem 1.4rem",
                textAlign: "center",
                cursor: "pointer",
                transition: "background 0.2s ease",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "0.5rem",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(232,212,188,0.14)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(232,212,188,0.07)"; }}
              >
                <div style={{ fontSize: "2.4rem" }}>{sec.icon}</div>
                <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.05rem", color: "#E8D4BC" }}>{sec.title}</div>
                <div style={{ fontSize: "0.95rem", color: "rgba(232,212,188,0.65)", lineHeight: 1.6 }}>{sec.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      </div>{/* end contentRef */}

      {/* ── Footer ── */}
      <footer style={{ textAlign: "center", padding: "2.5rem", fontSize: "0.95rem", color: "#8B6555", background: "#F7F3EE", borderTop: "1px solid rgba(99,32,36,0.1)" }}>
        {isRtl ? "مجلس الأمن السيبراني، قطر" : "CyberMajlis, Qatar"} ·{" "}
        <a href="/" style={{ color: "#632024", textDecoration: "none" }}>
          {isRtl ? "العودة للموقع الرئيسي" : "Return to main site"}
        </a>
      </footer>

      {/* Scroll-to-top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        style={{
          position: "fixed",
          bottom: 36, left: 36,
          zIndex: 9999,
          width: 52, height: 52,
          borderRadius: "50%",
          border: "1px solid rgba(197,165,126,0.55)",
          background: "linear-gradient(135deg, #4a1a1d, #7a1e22)",
          color: "#E8D4BC",
          fontSize: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(62,19,22,0.5)",
          transition: "opacity 0.3s ease, transform 0.2s ease",
          opacity: scrollY > 300 ? 1 : 0,
          pointerEvents: scrollY > 300 ? "auto" : "none",
          transform: scrollY > 300 ? "translateY(0)" : "translateY(12px)",
        }}
      >
        ↑
      </button>
    </div>
  );
}
