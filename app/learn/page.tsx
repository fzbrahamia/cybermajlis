"use client";

// The front door of the whole track.
//
// Deliberately NOT "here is a problem, go solve one". A learner arriving here
// has no way to know how to proceed, so the first thing offered is the way of
// thinking, then the domains, then the real cases inside them. The friction
// log, the community board and our monthly problems are ways to apply this
// afterwards, and they are reached from the bottom of this page.

import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight, Film, Layers, Lock } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { DOMAINS } from "@/app/lib/domainData";
import { VERBS } from "@/app/lib/innovationData";
import { M, mono, label, card, flat, button, quietPill } from "@/components/innovation/theme";

export default function LearnPage() {
  const isAR = useLocale() === "ar";

  return (
    <InnovationPage>
      {/* the promise */}
      <div style={{ marginBottom: 26, maxWidth: "48rem" }}>
        <div style={{ ...label, marginBottom: 8 }}>
          {isAR ? "ابدأ من هنا" : "Start here"}
        </div>
        <h1 style={{
          margin: "0 0 12px", fontSize: "clamp(23px,3.4vw,30px)", fontWeight: 800,
          lineHeight: 1.22, letterSpacing: "-0.015em", color: M.heading,
          textWrap: "balance",
        }}>
          {isAR
            ? "أولاً، تعلّم كيف يفكر المبتكر"
            : "First, learn how an innovator thinks"}
        </h1>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.75 }}>
          {isAR
            ? "لن نطلب منك فكرة. ستشاهد أفلاماً عن مجالات تقنية مختلفة، ثم تأخذ مشكلة حقيقية لم يحلها العالم بعد، وتفكك كل من حاول حلها فعلاً، وتكتشف الجدار الذي اصطدموا به جميعاً. وعندها فقط تقترح ما يأتي بعدهم."
            : "We will not ask you for an idea. You will watch films about different technology domains, then take a real problem the world has not solved, take apart everyone who has genuinely tried, and find the wall all of them hit. Only then do you propose what comes next."}
        </p>
      </div>

      {/* what you are actually learning */}
      <div style={{ ...card, padding: "22px 24px", marginBottom: 26 }}>
        <div style={{ ...label, fontSize: 10, marginBottom: 14 }}>
          {isAR ? "الحركات الخمس التي تتعلمها" : "The five moves you are learning"}
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr))",
          gap: 10,
        }}>
          {VERBS.map((v, i) => (
            <div key={v.id} style={{
              padding: "14px 15px", background: M.page, borderRadius: 14,
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: M.goldDeep }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{
                fontSize: isAR ? 17 : 15, fontWeight: 900,
                letterSpacing: isAR ? 0 : "0.04em",
                textTransform: isAR ? "none" : "uppercase",
                color: M.heading,
              }}>
                {isAR ? v.ar : v.en}
              </span>
              <span style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                {isAR ? v.does_ar : v.does_en}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* the domains */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...label, marginBottom: 8 }}>
          {isAR ? "اختر مجالاً" : "Pick a domain"}
        </div>
        <h2 style={{
          margin: "0 0 8px", fontSize: "clamp(18px,2.6vw,22px)", fontWeight: 800,
          color: M.heading, letterSpacing: "-0.01em",
        }}>
          {isAR ? "أين يقف العالم الآن" : "Where the world is now"}
        </h2>
        <p style={{ margin: 0, maxWidth: "44rem", fontSize: 14, lineHeight: 1.65 }}>
          {isAR
            ? "كل مجال يحمل أفلامه الأساسية، ثم حالات حقيقية: ما المشكلة، ومن حاول، وأين توقف كل منهم."
            : "Each domain carries its background films, then real cases: what the problem is, who has tried, and where each of them stopped."}
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))",
        gap: 13, marginBottom: 30,
      }}>
        {DOMAINS.map(d => {
          const inner = (
            <div style={{
              ...card, height: "100%", padding: "20px 22px 22px",
              display: "flex", flexDirection: "column", gap: 9,
              borderTop: `3px solid ${d.live ? d.tone : "rgba(42,35,28,.14)"}`,
              opacity: d.live ? 1 : 0.62,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: d.live ? d.tone : M.heading }}>
                  {isAR ? d.name_ar : d.name_en}
                </span>
                {d.live
                  ? <ArrowRight size={16} color={d.tone} strokeWidth={2.2} />
                  : <Lock size={14} color={M.body} strokeWidth={2} />}
              </div>

              <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                {isAR ? d.line_ar : d.line_en}
              </div>

              <div style={{
                marginTop: 4, padding: "11px 13px", borderRadius: 12,
                background: d.live ? d.tint : "rgba(42,35,28,.04)",
              }}>
                <div style={{ ...label, fontSize: 9, marginBottom: 5, color: d.live ? d.tone : M.body }}>
                  {isAR ? "السؤال المفتوح" : "The open question"}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: M.heading }}>
                  {isAR ? d.open_ar : d.open_en}
                </div>
              </div>

              <div style={{
                marginTop: "auto", paddingTop: 10, display: "flex", gap: 14,
                fontFamily: mono, fontSize: 10, letterSpacing: "0.09em",
                textTransform: "uppercase", color: M.goldDeep,
              }}>
                {d.live ? (
                  <>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <Film size={11} /> {d.concepts} {isAR ? "أفلام" : "films"}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <Layers size={11} /> {d.cases} {isAR ? "حالات" : d.cases === 1 ? "case" : "cases"}
                    </span>
                  </>
                ) : (
                  <span>{isAR ? "قريباً" : "Being built"}</span>
                )}
              </div>
            </div>
          );

          return d.live
            ? <Link key={d.id} href={`/learn/${d.id}`} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>
            : <div key={d.id}>{inner}</div>;
        })}
      </div>

      {/* the extras, clearly secondary */}
      <div style={{ paddingTop: 24, borderTop: `1px solid ${M.line}` }}>
        <div style={{ ...label, marginBottom: 8 }}>
          {isAR ? "بعد أن تتعلم" : "Once you have learned this"}
        </div>
        <h2 style={{
          margin: "0 0 8px", fontSize: "clamp(17px,2.4vw,20px)", fontWeight: 800,
          color: M.heading,
        }}>
          {isAR ? "طرق لتطبيقه" : "Ways to apply it"}
        </h2>
        <p style={{ margin: "0 0 16px", maxWidth: "44rem", fontSize: 13.5, lineHeight: 1.65 }}>
          {isAR
            ? "هذه ليست نقطة البداية. فمن يبدأ منها لا يعرف كيف يمضي. لكنها المكان الذي يصير فيه ما تعلّمته شيئاً يخصك أنت."
            : "These are not where you start. Someone beginning here has no way to know how to proceed. They are where what you learned becomes yours."}
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))",
          gap: 12,
        }}>
          {[
            { href: "/investigate/log", en: "Keep a friction log", ar: "احتفظ بسجل ملاحظات",
              d_en: "Two weeks of what goes wrong near you, with no solutions allowed.",
              d_ar: "أسبوعان مما يسوء من حولك، وممنوع كتابة الحلول." },
            { href: "/problems", en: "Read the community board", ar: "اقرأ لوحة المجتمع",
              d_en: "Problems posted by people who live them, and our monthly one.",
              d_ar: "مشكلات نشرها من يعيشونها، ومشكلة الشهر منا." },
            { href: "/investigate", en: "Run your own investigation", ar: "أدر تحقيقك أنت",
              d_en: "Take one problem through all five moves, start to finish.",
              d_ar: "خذ مشكلة واحدة عبر الحركات الخمس من أولها إلى آخرها." },
          ].map(x => (
            <Link key={x.href} href={x.href} style={{ ...flat, padding: "16px 18px", textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: M.heading, marginBottom: 5 }}>
                {isAR ? x.ar : x.en}
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: M.body }}>
                {isAR ? x.d_ar : x.d_en}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </InnovationPage>
  );
}
