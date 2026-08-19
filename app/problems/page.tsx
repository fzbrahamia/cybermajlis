"use client";

// The problem library.
//
// Three sources, deliberately mixed: some we post, some come from people who
// live the problem, some a child noticed. Every problem carries the tag that
// says which engine it can actually complete, so nobody reaches the last gate
// and finds there was never an experiment available to them.

import Link from "next/link";
import { useLocale } from "next-intl";
import { Check } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { PROBLEMS } from "@/app/lib/innovationData";
import { NEEDED_FOR, conceptById } from "@/app/lib/conceptData";
import { M, mono, label, card, flat, button, pill, quietPill } from "@/components/innovation/theme";

export default function ProblemsPage() {
  const isAR = useLocale() === "ar";
  const featured = PROBLEMS.find(p => p.featured);
  const rest = PROBLEMS.filter(p => !p.featured);

  return (
    <InnovationPage>
      {/* This is practice, not the front door. Someone starting here has no way
          to know how to proceed, so the page says where the method is taught. */}
      <div style={{
        ...flat, padding: "13px 18px", marginBottom: 18,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 14, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 13, lineHeight: 1.55, color: M.heading }}>
          {isAR
            ? "هذه ساحة تطبيق، لا نقطة بداية. الطريقة تُدرَّس في مسار التعلّم."
            : "This is a place to apply the method, not to start. The method itself is taught in Learn."}
        </span>
        <Link href="/learn" style={{
          fontFamily: mono, fontSize: 11, letterSpacing: "0.1em",
          textTransform: "uppercase", color: M.action, textDecoration: "none", flex: "none",
        }}>
          {isAR ? "تعلّم الطريقة أولاً" : "Learn the method first"}
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ ...label, marginBottom: 7 }}>{isAR ? "المشكلات" : "Problems"}</div>
        <h1 style={{
          margin: "0 0 8px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
          lineHeight: 1.25, letterSpacing: "-0.01em", color: M.heading,
          maxWidth: "44rem", textWrap: "balance",
        }}>
          {isAR
            ? "لا تحتاج إلى فكرة لتبدأ. تحتاج إلى مشكلة."
            : "You do not need an idea to start. You need a problem."}
        </h1>
        <p style={{ margin: 0, maxWidth: "42rem", fontSize: 14.5, lineHeight: 1.65 }}>
          {isAR
            ? "بعض هذه المشكلات نشرناها نحن، وبعضها جاء ممن يعيشونها، وبعضها لاحظه شخص في مثل عمرك. خذ أياً منها، أو أحضر مشكلتك أنت."
            : "Some of these we posted. Some came from people who live them. Some were noticed by someone your age. Take any of them, or bring your own."}
        </p>
      </div>

      {featured && (
        <div style={{
          ...card, padding: "24px 26px", marginBottom: 12,
          border: `2px solid ${M.action}`, boxShadow: "0 6px 20px rgba(143,106,56,.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ ...pill, background: M.action, color: M.cream }}>
              {isAR ? featured.source_ar : featured.source_en}
            </span>
            <span style={pill}>{isAR ? "يمكنك صنعه" : "You could build it"}</span>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: M.heading, lineHeight: 1.35, marginBottom: 8 }}>
            {isAR ? featured.title_ar : featured.title_en}
          </div>
          <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.65, maxWidth: "46rem" }}>
            {isAR ? featured.body_ar : featured.body_en}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/investigate/log" style={button}>
              {isAR ? "ابدأ الملاحظة" : "Start noticing"}
            </Link>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: M.body }}>
              {isAR ? `${featured.count} يحققون فيها · بقيت ٩ أيام` : `${featured.count} investigating · 9 days left`}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {rest.map(p => {
          const solved = p.engine === "solved";
          return (
            <div key={p.id} style={{
              ...card, padding: "20px 22px",
              background: solved ? M.goldSoft : M.card,
              borderColor: solved ? M.gold : "rgba(42,35,28,.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9, flexWrap: "wrap" }}>
                <span style={quietPill}>{isAR ? p.source_ar : p.source_en}</span>
                {p.engine === "build" && <span style={pill}>{isAR ? "يمكنك صنعه" : "You could build it"}</span>}
                {p.engine === "propose" && (
                  <span style={quietPill}>{isAR ? "يمكنك اقتراحه فقط" : "You can only propose this one"}</span>
                )}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: M.heading, lineHeight: 1.4, marginBottom: 7 }}>
                {isAR ? p.title_ar : p.title_en}
              </div>
              <p style={{ margin: "0 0 13px", fontSize: 13, lineHeight: 1.6, maxWidth: "46rem" }}>
                {isAR ? p.body_ar : p.body_en}
              </p>

              {/* the two tracks meet here: you cannot judge what you cannot explain */}
              {(NEEDED_FOR[p.id] ?? []).length > 0 && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: "7px 10px",
                  alignItems: "center", marginBottom: 13, paddingTop: 11,
                  borderTop: `1px solid ${M.line}`,
                }}>
                  <span style={{ ...label, fontSize: 9.5 }}>
                    {isAR ? "تحتاج أن تعرف أولاً" : "You need to know first"}
                  </span>
                  {NEEDED_FOR[p.id].map(id => {
                    const c = conceptById(id);
                    if (!c) return null;
                    const known = c.state === "known";
                    return (
                      <Link key={id} href={`/learn/${c.domain}/concept/${id}`} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontFamily: mono, fontSize: 9.5, letterSpacing: "0.07em",
                        textTransform: "uppercase", textDecoration: "none",
                        borderRadius: 999, padding: "5px 10px",
                        background: known ? "rgba(197,165,126,.24)" : "rgba(42,35,28,.05)",
                        color: known ? M.action : M.body,
                        border: known ? "none" : `1px dashed rgba(42,35,28,.22)`,
                      }}>
                        {known && <Check size={10} strokeWidth={3} />}
                        {isAR ? c.name_ar : c.name_en}
                      </Link>
                    );
                  })}
                </div>
              )}

              <span style={{ fontSize: 12, fontWeight: 700, color: M.body }}>
                {isAR ? `${p.count} يحققون فيها` : `${p.count} investigating`}
              </span>
            </div>
          );
        })}

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, padding: "20px 22px", flexWrap: "wrap",
          border: `1px dashed rgba(42,35,28,.20)`, borderRadius: 20,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: M.heading, marginBottom: 4 }}>
              {isAR ? "رأيت شيئاً لم يصلحه أحد؟" : "Saw something nobody has fixed?"}
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, maxWidth: "36rem" }}>
              {isAR
                ? "انشره هنا ليأخذه غيرك. صف ما يحدث وما يفعله الناس بدلاً من ذلك. بلا حلول."
                : "Post it here for someone else to take on. Describe what happens and what people do instead. No solutions."}
            </div>
          </div>
          <span style={button}>{isAR ? "انشر مشكلة" : "Post a problem"}</span>
        </div>
      </div>
    </InnovationPage>
  );
}
