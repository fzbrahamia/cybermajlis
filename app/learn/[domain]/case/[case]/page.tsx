"use client";

// A case: one real failure, and everyone who has genuinely tried.
//
// The order down this page is the whole method, and it is deliberately the
// opposite of how competitions run:
//
//   feel it  ->  make it harder  ->  decompose each attempt  ->  collide them
//            ->  state the gap   ->  only now, propose
//
// Nobody is allowed to imagine before the gap is stated, because an idea that
// arrives before the gap is a guess wearing a proposal's clothes.

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { caseById, domainById, type Approach } from "@/app/lib/domainData";
import { conceptById } from "@/app/lib/conceptData";
import { M, mono, label, card, flat, button, quietPill, ROUDA } from "@/components/innovation/theme";

function Stage({ n, eyebrow, title, children }: {
  n: string; eyebrow: string; title: string; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 34 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{
          fontFamily: mono, fontSize: 11, letterSpacing: "0.14em",
          color: M.goldDeep, flex: "none",
        }}>{n}</span>
        <span style={{ ...label, fontSize: 10 }}>{eyebrow}</span>
      </div>
      <h2 style={{
        margin: "0 0 14px", fontSize: "clamp(18px,2.6vw,22px)", fontWeight: 800,
        lineHeight: 1.3, letterSpacing: "-0.01em", color: M.heading,
        maxWidth: "42rem", textWrap: "balance",
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The fixed template, applied identically to every attempt. Consistency is the
    point: it is what makes the comparison in the next stage possible at all. */
function ApproachCard({ a, isAR, tone }: { a: Approach; isAR: boolean; tone: string }) {
  const rows = [
    { k_en: "The problem they actually attacked", k_ar: "المشكلة التي هاجموها فعلاً", v: isAR ? a.problem_ar : a.problem_en },
    { k_en: "Their insight",     k_ar: "رؤيتهم",           v: isAR ? a.insight_ar : a.insight_en },
    { k_en: "The mechanism",     k_ar: "الآلية",            v: isAR ? a.mechanism_ar : a.mechanism_en },
    { k_en: "What they assumed", k_ar: "ما افترضوه",        v: isAR ? a.assumption_ar : a.assumption_en },
    { k_en: "What they gave up", k_ar: "ما تخلوا عنه",      v: isAR ? a.sacrifice_ar : a.sacrifice_en },
    { k_en: "Where it works",    k_ar: "أين ينجح",          v: isAR ? a.works_ar : a.works_en },
    { k_en: "Where it breaks",   k_ar: "أين ينكسر",         v: isAR ? a.breaks_ar : a.breaks_en, last: true },
  ];

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden", height: "100%" }}>
      <div style={{ height: 3, background: tone }} />
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: M.heading, marginBottom: 14 }}>
          {isAR ? a.name_ar : a.name_en}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            padding: "11px 0",
            borderTop: i === 0 ? "none" : `1px solid ${M.line}`,
            background: r.last ? "transparent" : "transparent",
          }}>
            <div style={{
              ...label, fontSize: 9,
              marginBottom: 5,
              color: r.last ? M.action : M.goldDeep,
            }}>
              {isAR ? r.k_ar : r.k_en}
            </div>
            <div style={{
              fontSize: 13, lineHeight: 1.6,
              color: r.last ? M.heading : M.body,
              fontWeight: r.last ? 600 : 400,
            }}>
              {r.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CasePage() {
  const isAR = useLocale() === "ar";
  const params = useParams<{ domain: string; case: string }>();
  const cs = caseById(params.case);
  const d = domainById(params.domain);

  if (!cs || !d) {
    return (
      <InnovationPage>
        <p style={{ fontSize: 15 }}>{isAR ? "لا توجد هذه الحالة." : "There is no such case."}</p>
        <Link href="/learn" style={button}>{isAR ? "العودة" : "Back to the domains"}</Link>
      </InnovationPage>
    );
  }

  const home = `/learn/${d.id}`;
  const missing = cs.needs.filter(id => conceptById(id)?.state !== "known");
  const harder = isAR
    ? cs.harder_ar.map(h => ({ q: h.q_ar, body: h.body_ar }))
    : cs.harder_en.map(h => ({ q: h.q_en, body: h.body_en }));
  const collision = isAR
    ? cs.collision_ar.map(c => ({ head: c.head_ar, body: c.body_ar }))
    : cs.collision_en.map(c => ({ head: c.head_en, body: c.body_en }));

  return (
    <InnovationPage>
      <Link href={home} style={{
        display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16,
        fontFamily: mono, fontSize: 11, letterSpacing: "0.1em",
        textTransform: "uppercase", color: M.goldDeep, textDecoration: "none",
      }}>
        {isAR ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
        {isAR ? d.name_ar : d.name_en}
      </Link>

      <div style={{ marginBottom: 16, maxWidth: "46rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 9 }}>
          <span style={{ ...label, color: d.tone }}>{isAR ? "حالة" : "Case"}</span>
          <span style={quietPill}>{cs.year}</span>
        </div>
        <h1 style={{
          margin: 0, fontSize: "clamp(23px,3.4vw,30px)", fontWeight: 800,
          lineHeight: 1.22, letterSpacing: "-0.015em", color: M.heading,
          textWrap: "balance",
        }}>
          {isAR ? cs.title_ar : cs.title_en}
        </h1>
      </div>

      {/* what you must already hold */}
      <div style={{
        ...flat, padding: "14px 18px", marginBottom: 30,
        display: "flex", flexWrap: "wrap", gap: "8px 10px", alignItems: "center",
        background: missing.length ? M.goldSoft : M.card,
        border: missing.length ? `1px solid ${M.gold}` : `1px solid rgba(42,35,28,.08)`,
      }}>
        <span style={{ ...label, fontSize: 9.5 }}>
          {missing.length
            ? (isAR ? "ينقصك قبل هذه الحالة" : "You are missing, before this case")
            : (isAR ? "تحمل كل ما تحتاجه" : "You hold everything this needs")}
        </span>
        {cs.needs.map(id => {
          const c = conceptById(id);
          if (!c) return null;
          const ok = c.state === "known";
          return (
            <Link key={id} href={`${home}/concept/${id}`} style={{
              display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none",
              fontFamily: mono, fontSize: 9.5, letterSpacing: "0.07em",
              textTransform: "uppercase", borderRadius: 999, padding: "5px 10px",
              background: ok ? "rgba(197,165,126,.28)" : M.card,
              color: ok ? M.action : M.body,
              border: ok ? "none" : `1px dashed rgba(42,35,28,.22)`,
            }}>
              {ok ? <Check size={10} strokeWidth={3} /> : <Lock size={9} strokeWidth={2.4} />}
              {isAR ? c.name_ar : c.name_en}
            </Link>
          );
        })}
      </div>

      {/* 1 */}
      <Stage
        n="01"
        eyebrow={isAR ? "اشعر بها أولاً" : "Feel it first"}
        title={isAR ? "ما حدث فعلاً" : "What actually happened"}
      >
        {(isAR ? cs.story_ar : cs.story_en).map((p, i) => (
          <p key={i} style={{
            margin: "0 0 13px", maxWidth: "44rem",
            fontSize: i === 0 ? 16 : 14.5, lineHeight: 1.75,
            color: i === 0 ? M.heading : M.body,
            fontWeight: i === 0 ? 600 : 400,
          }}>
            {p}
          </p>
        ))}
      </Stage>

      {/* 2 */}
      <Stage
        n="02"
        eyebrow={isAR ? "اجعلها أصعب" : "Make it harder"}
        title={isAR ? "قبل أي حل، عمّق المشكلة" : "Before any solution, make the problem harder"}
      >
        <p style={{ margin: "0 0 16px", maxWidth: "44rem", fontSize: 14, lineHeight: 1.65 }}>
          {isAR
            ? "معظم التعليم يبسّط المشكلات. هنا نفعل العكس، لأن من لم يرَ تعقيد المشكلة سيقترح حلاً لمشكلة أسهل منها."
            : "Most teaching makes problems simpler. Here we do the opposite, because someone who has not seen the full complexity will solve an easier problem than the real one."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {harder.map((h, i) => (
            <div key={i} style={{ ...flat, padding: "16px 19px" }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: M.heading, marginBottom: 6 }}>
                {h.q}
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, maxWidth: "44rem" }}>{h.body}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "18px 22px", background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 18 }}>
          <div style={{ ...label, fontSize: 10, marginBottom: 8, color: M.action }}>
            {isAR ? "الشيئان اللذان تطلبهما المشكلة ويتصارعان" : "The two things this problem demands that fight each other"}
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: M.heading, maxWidth: "44rem" }}>
            {isAR ? cs.tension_ar : cs.tension_en}
          </p>
        </div>
      </Stage>

      {/* 3 */}
      <Stage
        n="03"
        eyebrow={isAR ? "فكّك كل محاولة" : "Take each attempt apart"}
        title={isAR ? "ثلاث محاولات حقيقية، بالقالب نفسه" : "Three real attempts, through the same template"}
      >
        <p style={{ margin: "0 0 18px", maxWidth: "44rem", fontSize: 14, lineHeight: 1.65 }}>
          {isAR
            ? "هذه ليست شركات لتحكم أيها أفضل. هي فرق نظرت إلى المشكلة نفسها واتخذت قرارات مختلفة. القالب واحد لكل واحدة، وهذا ما يجعل المقارنة بعدها ممكنة أصلاً."
            : "These are not companies for you to rank. They are teams who looked at the same problem and made different choices. The template is identical for each, and that is what makes the comparison in the next stage possible at all."}
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 19rem), 1fr))",
          gap: 13,
        }}>
          {cs.approaches.map(a => (
            <ApproachCard key={a.id} a={a} isAR={isAR} tone={d.tone} />
          ))}
        </div>
      </Stage>

      {/* 4 */}
      <Stage
        n="04"
        eyebrow={isAR ? "اصدمها ببعضها" : "Collide them"}
        title={isAR ? "ما تكشفه المقارنة نفسها" : "What the comparison itself reveals"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {collision.map((c, i) => (
            <div key={i} style={{
              ...card, padding: "20px 22px",
              borderInlineStart: `3px solid ${i === 2 ? M.action : M.gold}`,
            }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: M.heading, marginBottom: 7 }}>
                {c.head}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, maxWidth: "46rem" }}>{c.body}</p>
            </div>
          ))}
        </div>
      </Stage>

      {/* 5 */}
      <Stage
        n="05"
        eyebrow={isAR ? "صُغ الفجوة" : "State the gap"}
        title={isAR ? "ما زال مطلوباً، ولا أحد يقدمه" : "What is still demanded, and nobody provides"}
      >
        <div style={{
          padding: "24px 26px", borderRadius: 20,
          background: M.card, border: `2px solid ${M.action}`,
          boxShadow: "0 6px 20px rgba(143,106,56,.12)",
        }}>
          <div style={{ ...label, fontSize: 10, marginBottom: 10 }}>
            {isAR ? "الفجوة البنيوية" : "The structural gap"}
          </div>
          <p style={{
            margin: 0, fontSize: "clamp(16px,2.2vw,18.5px)", lineHeight: 1.65,
            color: M.heading, fontWeight: 700, maxWidth: "44rem",
          }}>
            {isAR ? cs.gap_ar : cs.gap_en}
          </p>
        </div>
        <p style={{ margin: "14px 0 0", maxWidth: "44rem", fontSize: 13.5, lineHeight: 1.65 }}>
          {isAR
            ? "لاحظ أن هذه الجملة اشتُقت ولم تُتخيل. كل جزء منها جاء من عمود أين ينكسر في القالب أعلاه."
            : "Notice that this sentence was derived, not imagined. Every part of it came from the where it breaks row of the template above."}
        </p>
      </Stage>

      {/* 6 */}
      <Stage
        n="06"
        eyebrow={isAR ? "الآن فقط" : "Only now"}
        title={isAR ? "ما الذي يأتي بعدهم؟" : "What comes next?"}
      >
        <div style={{
          padding: "22px 24px", borderRadius: 20,
          background: ROUDA.tint, border: `1px solid ${ROUDA.line}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{
              width: 30, height: 30, borderRadius: "50%", background: ROUDA.mid,
              display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: "#fff",
            }}>R</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: ROUDA.deep }}>
              {isAR ? "رودة تسأل" : "Rouda asks"}
            </span>
          </div>

          {(isAR
            ? ["ثلاثتهم افترضوا أن أحداً يراقب المخرجات. ماذا لو لم يكن هناك أحد؟",
               "الجهاز الذي لا يمكن تغييره لا يقبل برنامجاً. فما الذي يمكن تغييره حوله؟",
               "اكتب اقتراحك في جملة واحدة، ثم اكتب تحتها الشيء الذي يجب أن يكون صحيحاً كي ينجح.",
               "ما التجربة الواحدة التي قد تثبت خطأ افتراضك خلال أسبوع؟"]
            : ["All three assumed somebody is watching the output. What if nobody is?",
               "The machine that cannot be changed will not take software. What can be changed around it?",
               "Write your proposal in one sentence, then write underneath it the one thing that must be true for it to work.",
               "What single experiment could prove your assumption wrong within a week?"]
          ).map((q, i) => (
            <div key={i} style={{
              display: "flex", gap: 11, alignItems: "flex-start", padding: "12px 0",
              borderTop: i === 0 ? "none" : `1px solid rgba(27,107,76,.14)`,
            }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: ROUDA.deep, flex: "none", paddingTop: 2 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 14.5, lineHeight: 1.6, color: M.heading }}>{q}</span>
            </div>
          ))}

          <p style={{
            margin: "14px 0 0", paddingTop: 13,
            borderTop: `1px solid rgba(27,107,76,.14)`,
            fontSize: 13, lineHeight: 1.65, color: M.body, maxWidth: "44rem",
          }}>
            {isAR
              ? "هذه حالة لا يمكنك صنع حلها واختباره، ولن ندّعي غير ذلك. المطلوب منك هنا مقترح مُدافَع عنه بافتراضات معلنة وتجربة صممتها ولو لم تستطع تنفيذها."
              : "This is a case you cannot build and test, and we will not pretend otherwise. What is asked of you here is a defended proposal with its assumptions stated, and an experiment you designed even though you cannot run it."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <span style={button}>{isAR ? "اكتب اقتراحي" : "Write my proposal"}</span>
          <Link href={home} style={{ ...button, background: "transparent", color: M.action, border: `1px solid ${M.gold}` }}>
            {isAR ? `العودة إلى ${d.name_ar}` : `Back to ${d.name_en}`}
          </Link>
        </div>
      </Stage>
    </InnovationPage>
  );
}
