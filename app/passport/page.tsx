"use client";

// The Innovation Passport.
//
// Two sections, two validators, deliberately not merged. The work record is
// discrete and validated by whoever received it. The thinking record is
// continuous, observed, and never a verdict. Merging them lets a lucky build
// manufacture a thinker, and lets a good thinker with a failed build read as a
// failure. Both of those are wrong.

import Link from "next/link";
import { useLocale } from "next-intl";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { WORK, THINKING } from "@/app/lib/innovationData";
import { M, mono, label, card, flat, button, pill } from "@/components/innovation/theme";

const V = [
  {
    v: "V1", week_en: "Week 1", week_ar: "الأسبوع ١",
    text_en: "My grandmother cannot see the labels because her eyesight is bad.",
    text_ar: "جدتي لا ترى الملصقات لأن نظرها ضعيف.",
  },
  {
    v: "V2", week_en: "Week 3", week_ar: "الأسبوع ٣",
    text_en: "She reads them fine. She takes them at 5am in the dark and does not turn the light on.",
    text_ar: "هي تقرؤها جيداً. تأخذها في الخامسة فجراً في الظلام ولا تشعل الضوء.",
    why_en: "Changed after interviewing her. She had scratched one lid with a knife years ago and never told anyone.",
    why_ar: "تغيّرت بعد مقابلتها. كانت قد خدشت أحد الغطاءين بسكين قبل سنوات ولم تخبر أحداً.",
  },
  {
    v: "V3", week_en: "Week 6", week_ar: "الأسبوع ٦",
    text_en: "She will not turn on the light because her husband is asleep. Whatever helps her has to work in the dark, silently, without touching anyone else in the room.",
    text_ar: "لن تشعل الضوء لأن زوجها نائم. أي شيء يساعدها يجب أن يعمل في الظلام، بصمت، دون أن يمس أحداً آخر في الغرفة.",
    why_en: "Changed after her first build failed. She was polite about it and used it once.",
    why_ar: "تغيّرت بعد إخفاق محاولتها الأولى. جاملتها جدتها واستعملتها مرة واحدة.",
    last: true,
  },
];

export default function PassportPage() {
  const isAR = useLocale() === "ar";

  return (
    <InnovationPage>
      {/* who */}
      <div style={{ ...card, padding: "24px 26px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{
              width: 56, height: 56, borderRadius: "50%", background: M.gold,
              display: "grid", placeItems: "center", fontSize: 21, fontWeight: 900,
              color: M.cream, flex: "none",
            }}>M</span>
            <div>
              <div style={{ ...label, marginBottom: 5 }}>
                {isAR ? "جواز الابتكار" : "Innovation Passport"}
              </div>
              <div style={{
                fontSize: "clamp(21px,3vw,25px)", fontWeight: 800,
                letterSpacing: "-0.01em", color: M.heading, marginBottom: 3,
              }}>
                {isAR ? "مريم، ١٢ سنة" : "Maryam, 12"}
              </div>
              <div style={{ fontSize: 12.5 }}>
                {isAR
                  ? "مدرسة الوكرة المستقلة · بدأت في مارس ٢٠٢٦ · ستة أسابيع من العمل"
                  : "Al Wakrah Independent School · started March 2026 · 6 weeks of work"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: isAR ? "flex-start" : "flex-end", gap: 8 }}>
            <span style={pill}>{isAR ? "موثّق من المعلمة" : "Teacher verified"}</span>
            <span style={{ fontSize: 11.5 }}>
              {isAR ? "هذا السجل ملك مريم. هي من تقرر من يراه." : "This record is Maryam's. She chooses who sees it."}
            </span>
          </div>
        </div>
      </div>

      {/* how she thinks: the delta */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ ...label, fontSize: 10.5 }}>{isAR ? "اثنان" : "Two"}</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: M.heading }}>
            {isAR ? "كيف تفكر؟" : "How does she think?"}
          </span>
          <span style={{ fontSize: 12.5 }}>
            {isAR ? "المشكلة نفسها، مصوغة ثلاث مرات على مدى ستة أسابيع." : "The same problem, stated three times over six weeks."}
          </span>
        </div>

        <div style={{ ...card, padding: "22px 24px" }}>
          {V.map((row, i) => (
            <div key={row.v} style={{
              display: "grid", gridTemplateColumns: "78px 1fr", gap: 18,
              padding: i === 0 ? "0 0 16px" : "16px 0",
              borderTop: i === 0 ? "none" : `1px solid rgba(42,35,28,.09)`,
            }}>
              <div>
                <div style={{
                  fontFamily: mono, fontSize: 11, fontWeight: 600,
                  color: row.last ? M.action : M.goldDeep,
                }}>{row.v}</div>
                <div style={{ fontFamily: mono, fontSize: 9.5, color: "rgba(42,35,28,.42)" }}>
                  {isAR ? row.week_ar : row.week_en}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 14, lineHeight: 1.6,
                  color: i === 0 ? M.body : M.heading,
                  fontWeight: row.last ? 600 : 400,
                  marginBottom: row.why_en ? 7 : 0,
                }}>
                  {isAR ? row.text_ar : row.text_en}
                </div>
                {row.why_en && (
                  <div style={{ fontSize: 12, fontStyle: "italic", color: M.body }}>
                    {isAR ? row.why_ar : row.why_en}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* the two records */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))",
        gap: 16,
      }}>
        <div style={{ ...card, padding: "22px 24px" }}>
          <div style={{ ...label, fontSize: 10.5, marginBottom: 12 }}>
            {isAR ? "العمل · يوثّقه من تسلّمه" : "The work · validated by whoever received it"}
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
            {WORK.map((w, i) => (
              <li key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.55, color: M.heading }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: M.action, marginTop: 8, flex: "none" }} />
                {isAR ? w.ar : w.en}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ ...card, padding: "22px 24px", background: M.goldSoft, borderColor: M.gold }}>
          <div style={{ ...label, fontSize: 10.5, marginBottom: 12, color: M.action }}>
            {isAR ? "التفكير · يُلاحظ ولا يُقيَّم" : "The thinking · observed, never scored"}
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
            {THINKING.map((t, i) => (
              <li key={i} style={{
                display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.55,
                color: M.heading, opacity: t.thin ? 0.72 : 1,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: M.action, marginTop: 8, flex: "none" }} />
                {isAR ? t.ar : t.en}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ ...flat, padding: "16px 20px", marginTop: 16, fontSize: 13.5, lineHeight: 1.6 }}>
        {isAR
          ? "السطر الأخير يبقى. السجل الذي لا يحمل إلا الأخبار الجيدة ليس دليلاً، والطفل الذي لا يُسمح له بإجابة ضعيفة يتعلم التمثيل بدل التفكير."
          : "That last line stays in. A record that only holds good news is not evidence, and a child who is never allowed a thin answer learns to perform instead of think."}
      </div>

      <div style={{ marginTop: 22 }}>
        <Link href="/investigate/log" style={button}>
          {isAR ? "امشِ في أسابيعها الستة" : "Walk her six weeks"}
        </Link>
      </div>
    </InnovationPage>
  );
}
