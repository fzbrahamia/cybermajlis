"use client";

// One concept: the film, the mechanism, where the simple version stops being
// true, and a check that is not a multiple choice question.
//
// The shape deliberately matches a QuantumMajlis lesson board, caveat panel and
// all, so the whole company teaches one way. What differs is the ending: a path
// lesson hooks you into the next one, and this one releases you.

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Play, ArrowLeft, ArrowRight, Clock, ExternalLink } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { conceptById, prereqsOf, unlockedBy, EDGE_LABEL } from "@/app/lib/conceptData";
import { domainById } from "@/app/lib/domainData";
import { M, sans, mono, label, card, flat, button, quietPill, ROUDA } from "@/components/innovation/theme";
import { Face } from "@/components/innovation/Alive";
import VideoSlot from "@/components/innovation/VideoSlot";
import AskHamad from "@/components/innovation/AskHamad";

export default function ConceptPage() {
  const isAR = useLocale() === "ar";
  const params = useParams<{ domain: string; concept: string }>();
  const c = conceptById(params.concept);
  const d = domainById(params.domain);
  const home = `/learn/${params.domain}`;

  if (!c || !d) {
    return (
      <InnovationPage>
        <p style={{ fontSize: 15 }}>{isAR ? "لا يوجد هذا المفهوم." : "There is no such concept."}</p>
        <Link href="/learn" style={button}>{isAR ? "العودة" : "Back to the domains"}</Link>
      </InnovationPage>
    );
  }

  const prereqs = prereqsOf(c.id);
  const opens = unlockedBy(c.id).filter(u => u.concept);

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

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ ...label, color: d.tone }}>{isAR ? "معرفة أساسية" : "Background"}</span>
          <span style={{ ...quietPill, gap: 6 }}>
            <Clock size={11} />
            {isAR ? `${c.minutes} دقائق` : `${c.minutes} min`}
          </span>
        </div>
        <h1 style={{
          margin: "0 0 10px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
          lineHeight: 1.25, letterSpacing: "-0.01em", color: M.heading,
          maxWidth: "44rem", textWrap: "balance",
        }}>
          {isAR ? c.name_ar : c.name_en}
        </h1>
        <p style={{ margin: 0, maxWidth: "42rem", fontSize: 15, lineHeight: 1.65 }}>
          {isAR ? c.line_ar : c.line_en}
        </p>
      </div>

      {prereqs.length > 0 && (
        <div style={{ ...flat, padding: "13px 18px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: "8px 16px", alignItems: "center" }}>
          <span style={{ ...label, fontSize: 9.5 }}>{isAR ? "قبل هذا" : "Before this"}</span>
          {prereqs.map(p => (
            <Link key={p.from} href={`${home}/concept/${p.from}`} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              fontSize: 12.5, fontWeight: 700, color: M.heading, textDecoration: "none",
            }}>
              <span style={{
                width: 20, height: 0, flex: "none",
                borderTop: p.type === "hard" ? `2px solid ${M.action}`
                  : p.type === "soft" ? `2px dashed ${M.gold}`
                  : `2px dotted rgba(42,35,28,.4)`,
              }} />
              {isAR ? p.concept?.name_ar : p.concept?.name_en}
              <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.07em", textTransform: "uppercase", color: M.body }}>
                {isAR ? EDGE_LABEL[p.type].ar : EDGE_LABEL[p.type].en}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* the film */}
      <div style={{ ...card, padding: "22px 24px", marginBottom: 16 }}>
        <div style={{ marginBottom: 18 }}>
          <VideoSlot minutes={c.minutes} brief_en={c.picture_en} brief_ar={c.picture_ar} />
        </div>

        {/* he sits under the film, inside the lesson, not off in a corner */}
        <div style={{ marginBottom: 22 }}>
          <AskHamad
            about={[
              `Concept: ${c.name_en}`,
              `In one line: ${c.line_en}`,
              `They should be able to picture: ${c.picture_en}`,
              ...c.body_en,
              `Where the simple version stops being true: ${c.caveat_en}`,
            ].join("\n")}
          />
        </div>

        <div style={{ ...label, fontSize: 10, marginBottom: 8 }}>
          {isAR ? "ما ستستطيع تخيله بعده" : "What you can picture afterwards"}
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 15.5, lineHeight: 1.6, color: M.heading, fontWeight: 600, maxWidth: "42rem" }}>
          {isAR ? c.picture_ar : c.picture_en}
        </p>

        {(isAR ? c.body_ar : c.body_en).map((para, i) => (
          <p key={i} style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.75, maxWidth: "44rem" }}>
            {para}
          </p>
        ))}
      </div>

      {/* the caveat, same move the quantum boards make */}
      <div style={{
        padding: "18px 22px", marginBottom: 16,
        background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 18,
      }}>
        <div style={{ ...label, fontSize: 10, marginBottom: 8, color: M.action }}>
          {isAR ? "أين بسّط الفيلم" : "Where the film was simplifying"}
        </div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: M.heading, maxWidth: "44rem" }}>
          {isAR ? c.caveat_ar : c.caveat_en}
        </p>
      </div>

      {/* the check */}
      <div style={{
        padding: "20px 22px", marginBottom: 16,
        background: ROUDA.tint, border: `1px solid ${ROUDA.line}`, borderRadius: 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <Face who="rouda" size={36} />
          <span style={{ fontSize: 15, fontWeight: 800, color: ROUDA.deep }}>
            {isAR ? "قبل أن تمضي" : "Before you move on"}
          </span>
        </div>

        {c.checks.map((ch, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start", padding: "13px 0",
            borderTop: i === 0 ? "none" : `1px solid rgba(27,107,76,.14)`,
          }}>
            <span style={{
              ...quietPill, flex: "none", marginTop: 2,
              background: ch.kind === "explain" ? "rgba(46,156,110,.16)" : "rgba(42,35,28,.06)",
              color: ch.kind === "explain" ? ROUDA.deep : M.body,
            }}>
              {ch.kind === "explain" ? (isAR ? "اشرح" : "Explain") : (isAR ? "تذكّر" : "Recall")}
            </span>
            <span style={{ fontSize: 14.5, lineHeight: 1.6, color: M.heading }}>
              {isAR ? ch.q_ar : ch.q_en}
            </span>
          </div>
        ))}

      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 19rem), 1fr))",
        gap: 14,
      }}>
        {c.deeper && (
          <div style={{ ...card, padding: "20px 22px", borderTop: `3px solid ${c.deeper.tone}` }}>
            <div style={{ ...label, fontSize: 10, marginBottom: 8 }}>
              {isAR ? "إن أردت التعمق" : "If you want the real thing"}
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6 }}>
              {isAR
                ? "هذا الفيلم أعطاك ما يكفي لتتخيل الآلية. أما التعمق الحقيقي فله باب خاص."
                : "This film gave you enough to picture the mechanism. Going properly deep has its own door."}
            </p>
            <Link href={c.deeper.href} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 13, fontWeight: 800, color: c.deeper.tone, textDecoration: "none",
            }}>
              {isAR ? c.deeper.ar : c.deeper.en}
              <ExternalLink size={13} />
            </Link>
          </div>
        )}

        {opens.length > 0 && (
          <div style={{ ...flat, padding: "20px 22px" }}>
            <div style={{ ...label, fontSize: 10, marginBottom: 10 }}>
              {isAR ? "ماذا يفتح هذا" : "What this opens"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {opens.map(u => (
                <Link key={u.to} href={`${home}/concept/${u.to}`} style={{
                  display: "flex", alignItems: "center", gap: 9,
                  fontSize: 13.5, fontWeight: 700, color: M.heading, textDecoration: "none",
                }}>
                  <ArrowRight size={13} color={M.action} style={{ flex: "none" }} />
                  {isAR ? u.concept?.name_ar : u.concept?.name_en}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <Link href={home} style={button}>
          {isAR ? `العودة إلى ${d.name_ar}` : `Back to ${d.name_en}`}
        </Link>
      </div>
    </InnovationPage>
  );
}
