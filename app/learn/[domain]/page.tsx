"use client";

// Inside one domain: the background films first, then the real cases.
//
// The order on this page is the pedagogy. A learner who opens a case before
// holding the concepts will read a fundamental constraint as a design failure,
// so the films come first and the case says what it expects you to hold.

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Clock, Lock, RotateCcw, ExternalLink } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { domainById, casesForDomain } from "@/app/lib/domainData";
import { conceptsForDomain, conceptById } from "@/app/lib/conceptData";
import { M, mono, label, card, flat, button, quietPill } from "@/components/innovation/theme";

const STATE_ICON = { known: Check, open: ArrowRight, loop: RotateCcw, locked: Lock };
const STATE_TEXT = {
  known:  { en: "Known",    ar: "معروف" },
  open:   { en: "Open now", ar: "متاح الآن" },
  loop:   { en: "Go back",  ar: "ارجع إليه" },
  locked: { en: "Locked",   ar: "مقفل" },
};

export default function DomainPage() {
  const isAR = useLocale() === "ar";
  const params = useParams<{ domain: string }>();
  const d = domainById(params.domain);

  if (!d || !d.live) {
    return (
      <InnovationPage>
        <p style={{ fontSize: 15 }}>
          {isAR ? "هذا المجال قيد البناء." : "This domain is still being built."}
        </p>
        <Link href="/learn" style={button}>{isAR ? "العودة" : "Back to the domains"}</Link>
      </InnovationPage>
    );
  }

  const concepts = conceptsForDomain(d.id);
  const cases = casesForDomain(d.id);
  const known = concepts.filter(c => c.state === "known").length;

  return (
    <InnovationPage>
      <Link href="/learn" style={{
        display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16,
        fontFamily: mono, fontSize: 11, letterSpacing: "0.1em",
        textTransform: "uppercase", color: M.goldDeep, textDecoration: "none",
      }}>
        {isAR ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
        {isAR ? "كل المجالات" : "All domains"}
      </Link>

      <div style={{ marginBottom: 24, maxWidth: "46rem" }}>
        <div style={{ ...label, marginBottom: 8, color: d.tone }}>
          {isAR ? "مجال" : "Domain"}
        </div>
        <h1 style={{
          margin: "0 0 10px", fontSize: "clamp(23px,3.2vw,29px)", fontWeight: 800,
          lineHeight: 1.22, letterSpacing: "-0.015em", color: M.heading,
        }}>
          {isAR ? d.name_ar : d.name_en}
        </h1>
        <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.7 }}>
          {isAR ? d.line_ar : d.line_en}
        </p>
        <div style={{ padding: "15px 18px", background: d.tint, borderRadius: 16 }}>
          <div style={{ ...label, fontSize: 9.5, marginBottom: 6, color: d.tone }}>
            {isAR ? "ما يتجادل حوله هذا المجال الآن" : "What this domain is arguing about right now"}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: M.heading, fontWeight: 600 }}>
            {isAR ? d.open_ar : d.open_en}
          </div>
        </div>
      </div>

      {/* 1. the films */}
      <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <span style={{ ...label, fontSize: 10 }}>{isAR ? "أولاً" : "First"}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: M.heading }}>
          {isAR ? "المعرفة الأساسية" : "The background"}
        </span>
        <span style={{ ...quietPill }}>
          {isAR ? `${known} من ${concepts.length}` : `${known} of ${concepts.length}`}
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15.5rem), 1fr))",
        gap: 11, marginBottom: 30,
      }}>
        {concepts.map(c => {
          const Icon = STATE_ICON[c.state];
          const locked = c.state === "locked";
          const inner = (
            <div style={{
              ...card, height: "100%", padding: "17px 19px 18px",
              display: "flex", flexDirection: "column", gap: 8,
              background: c.state === "known" ? M.goldSoft : M.card,
              border: c.state === "known" ? `1px solid ${M.gold}`
                : c.state === "open" ? `2px solid ${M.action}`
                : c.state === "loop" ? `2px dashed ${M.goldDeep}`
                : `1px dashed rgba(42,35,28,.18)`,
              opacity: locked ? 0.55 : 1,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ ...quietPill, color: locked ? M.body : M.action }}>
                  {isAR ? STATE_TEXT[c.state].ar : STATE_TEXT[c.state].en}
                </span>
                <Icon size={15} strokeWidth={2.2} color={locked ? M.body : M.action} />
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: M.heading, lineHeight: 1.35 }}>
                {isAR ? c.name_ar : c.name_en}
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{isAR ? c.line_ar : c.line_en}</div>
              <div style={{
                marginTop: "auto", paddingTop: 9, display: "inline-flex", alignItems: "center", gap: 5,
                fontFamily: mono, fontSize: 9.5, letterSpacing: "0.09em",
                textTransform: "uppercase", color: M.goldDeep,
              }}>
                <Clock size={10} /> {c.minutes} {isAR ? "دقائق" : "min film"}
              </div>
            </div>
          );
          return locked
            ? <div key={c.id}>{inner}</div>
            : <Link key={c.id} href={`/learn/${d.id}/concept/${c.id}`} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>;
        })}
      </div>

      {/* 2. the cases */}
      <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <span style={{ ...label, fontSize: 10 }}>{isAR ? "ثم" : "Then"}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: M.heading }}>
          {isAR ? "حالات حقيقية" : "Real cases"}
        </span>
      </div>
      <p style={{ margin: "0 0 14px", maxWidth: "44rem", fontSize: 13.5, lineHeight: 1.65 }}>
        {isAR
          ? "مشكلة حقيقية حدثت، وكل من حاول حلها جدياً، وأين توقف كل واحد منهم. تخرج منها بفجوة محددة، لا برأي."
          : "A real problem that happened, everyone who seriously tried, and where each of them stopped. You leave with a stated gap, not an opinion."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cases.map(cs => (
          <Link key={cs.id} href={`/learn/${d.id}/case/${cs.id}`} style={{ textDecoration: "none" }}>
            <div style={{ ...card, padding: "22px 24px", borderTop: `3px solid ${d.tone}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ ...quietPill }}>{cs.year}</span>
                <span style={{ ...quietPill }}>
                  {cs.approaches.length} {isAR ? "محاولات حقيقية" : "real attempts"}
                </span>
              </div>
              <div style={{ fontSize: 18.5, fontWeight: 800, color: M.heading, lineHeight: 1.35, marginBottom: 8 }}>
                {isAR ? cs.title_ar : cs.title_en}
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.6, maxWidth: "46rem", color: M.body }}>
                {isAR ? cs.story_ar[0] : cs.story_en[0]}
              </p>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: "7px 9px", alignItems: "center",
                paddingTop: 12, borderTop: `1px solid ${M.line}`,
              }}>
                <span style={{ ...label, fontSize: 9.5 }}>
                  {isAR ? "تحتاج أن تعرف أولاً" : "You need to know first"}
                </span>
                {cs.needs.map(id => {
                  const c = conceptById(id);
                  if (!c) return null;
                  const ok = c.state === "known";
                  return (
                    <span key={id} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontFamily: mono, fontSize: 9.5, letterSpacing: "0.07em",
                      textTransform: "uppercase", borderRadius: 999, padding: "5px 10px",
                      background: ok ? "rgba(197,165,126,.24)" : "rgba(42,35,28,.05)",
                      color: ok ? M.action : M.body,
                      border: ok ? "none" : `1px dashed rgba(42,35,28,.22)`,
                    }}>
                      {ok && <Check size={10} strokeWidth={3} />}
                      {isAR ? c.name_ar : c.name_en}
                    </span>
                  );
                })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {d.deeper && (
        <div style={{ ...flat, padding: "18px 20px", marginTop: 22 }}>
          <div style={{ ...label, fontSize: 9.5, marginBottom: 7 }}>
            {isAR ? "إن أردت التعمق" : "If you want the real thing"}
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.6 }}>
            {isAR
              ? "ما هنا يكفي لتتخيل الآليات وتحكم على الحدود. أما التعمق الحقيقي في هذا المجال فله مجلسه."
              : "What is here is enough to picture the mechanisms and judge the limits. Going properly deep in this domain has its own majlis."}
          </p>
          <Link href={d.deeper.href} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 13.5, fontWeight: 800, color: d.tone, textDecoration: "none",
          }}>
            {isAR ? d.deeper.ar : d.deeper.en}
            <ExternalLink size={13} />
          </Link>
        </div>
      )}
    </InnovationPage>
  );
}
