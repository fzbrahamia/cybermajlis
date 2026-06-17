"use client";
import { useTrackView } from "@/hooks/useTrackView";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ElderNav from "@/components/elder/ElderNav";
import { useElderLang } from "@/hooks/useElderLang";

const cinzel = "'Cinzel', Georgia, serif";
const body   = "'Crimson Pro', Georgia, serif";

const topics = {
  en: [
    { id: "phishing",  icon: "🎣", title: "Email & Message Scams",   desc: "How scammers trick you through messages — and how to spot them every time.",  mins: 5 },
    { id: "passwords", icon: "🔐", title: "Protecting Your Accounts",  desc: "Why strong passwords matter and the easiest way to create them.",              mins: 4 },
    { id: "privacy",   icon: "👁", title: "Your Phone & Privacy",      desc: "What your phone shares about you and how to take control.",                    mins: 5 },
    { id: "scams",     icon: "⚠️", title: "Recognising Online Scams",  desc: "The tricks scammers use online — and why they feel so convincing.",            mins: 5 },
    { id: "shopping",  icon: "🛒", title: "Safe Online Shopping",      desc: "How to know if a website is trustworthy before you enter your card details.",   mins: 6 },
    { id: "family",    icon: "👨‍👩‍👧", title: "Keeping Your Family Safe", desc: "How to help your children and grandchildren stay safe online too.",           mins: 4 },
  ],
  ar: [
    { id: "phishing",  icon: "🎣", title: "الرسائل والبريد الاحتيالي",  desc: "كيف يخدعك المحتالون عبر الرسائل — وكيف تتعرف عليهم في كل مرة.",        mins: 5 },
    { id: "passwords", icon: "🔐", title: "حماية حساباتك",               desc: "لماذا كلمات المرور القوية مهمة وأسهل طريقة لإنشائها.",                 mins: 4 },
    { id: "privacy",   icon: "👁", title: "هاتفك وخصوصيتك",             desc: "ما الذي يشاركه هاتفك عنك وكيف تتحكم في ذلك.",                          mins: 5 },
    { id: "scams",     icon: "⚠️", title: "كيف تتعرف على عمليات الاحتيال", desc: "الحيل التي يستخدمها المحتالون — ولماذا تبدو مقنعة جداً.",            mins: 5 },
    { id: "shopping",  icon: "🛒", title: "التسوق الآمن عبر الإنترنت",   desc: "كيف تعرف أن الموقع موثوق قبل إدخال بيانات بطاقتك.",                   mins: 6 },
    { id: "family",    icon: "👨‍👩‍👧", title: "حماية عائلتك",               desc: "كيف تساعد أبناءك وأحفادك على البقاء آمنين على الإنترنت.",             mins: 4 },
  ],
};

export default function ElderLessonsPage() {
  useTrackView("elder_lessons");
  const [lang, setLang] = useElderLang();
  const router = useRouter();
  const list = topics[lang];
  const isRtl = lang === "ar";

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", color: "#3e1316", direction: isRtl ? "rtl" : "ltr", fontFamily: body }}>
      <ElderNav lang={lang} onLangChange={setLang} />

      <main style={{ paddingTop: 110, padding: "110px 2rem 4rem", maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "#3e1316", marginBottom: "0.5rem" }}>
          {isRtl ? "تعلّم بالسرعة التي تناسبك" : "Learn at Your Pace"}
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#5C4033", marginBottom: "3rem", lineHeight: 1.75 }}>
          {isRtl
            ? "اختر أي موضوع يهمك. كل درس قصير وواضح — بفيديو وشرح بسيط."
            : "Pick any topic that interests you. Every lesson is short and clear — with a video and simple explanation."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {list.map(topic => (
            <div
              key={topic.id}
              onClick={() => router.push(`/elder/lessons/${topic.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                background: "#fff",
                borderRadius: 18,
                border: "1px solid rgba(99,32,36,0.1)",
                boxShadow: "0 2px 16px rgba(62,19,22,0.06)",
                padding: "1.6rem 1.8rem",
                cursor: "pointer",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateX(6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(62,19,22,0.13)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(62,19,22,0.06)"; }}
            >
              <span style={{ fontSize: "2.8rem", flexShrink: 0 }}>{topic.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.25rem", color: "#3e1316", marginBottom: "0.3rem" }}>{topic.title}</div>
                <div style={{ fontSize: "1rem", color: "#5C4033", lineHeight: 1.6 }}>{topic.desc}</div>
              </div>
              <div style={{ flexShrink: 0, fontFamily: cinzel, fontSize: "0.8rem", color: "#8B2635", background: "rgba(139,38,53,0.08)", border: "1px solid rgba(139,38,53,0.15)", borderRadius: 999, padding: "0.3rem 0.75rem", whiteSpace: "nowrap" }}>
                {topic.mins} {isRtl ? "دقائق" : "min"}
              </div>
            </div>
          ))}
        </div>

        {/* ── Video library ── */}
        <div style={{ marginTop: "4rem", borderTop: "1px solid rgba(99,32,36,0.1)", paddingTop: "3rem" }}>
          <h2 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.5rem", marginBottom: "0.4rem" }}>
            {isRtl ? "مكتبة الفيديوهات" : "Video Library"}
          </h2>
          <p style={{ fontSize: "1rem", color: "#5C4033", marginBottom: "2rem" }}>
            {isRtl ? "فيديوهات توعوية قصيرة حول أنواع البرمجيات الخبيثة الأكثر شيوعاً." : "Short awareness videos about the most common types of malware."}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.4rem" }}>
            {[
              { src: "/lessons/vids/virus.mp4",      title: isRtl ? "الفيروسات"                  : "Computer Viruses" },
              { src: "/lessons/vids/worms.mp4",      title: isRtl ? "الديدان الإلكترونية"        : "Worms" },
              { src: "/lessons/vids/ransomware.mp4", title: isRtl ? "برامج الفدية"               : "Ransomware" },
              { src: "/lessons/vids/poly&meta.mp4",  title: isRtl ? "البرمجيات المتحوّلة"        : "Polymorphic Malware" },
            ].map(v => (
              <div key={v.src} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(62,19,22,0.07)", border: "1px solid rgba(99,32,36,0.08)" }}>
                <video src={v.src} controls preload="metadata" style={{ width: "100%", display: "block", maxHeight: 200, background: "#000" }} />
                <div style={{ padding: "0.8rem 1rem", fontFamily: cinzel, fontWeight: 700, fontSize: "0.95rem", color: "#3e1316" }}>{v.title}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
