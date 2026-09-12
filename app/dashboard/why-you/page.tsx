"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useTrackView } from "@/hooks/useTrackView";
import { Check, Clock, DoorOpen, Boxes } from "lucide-react";
import { CyberPage, Head, SectionHead, Rise, Item, Grid, C, ACCENT } from "@/components/cyber/shell";
import { WHY_YOU } from "@/app/lib/whyYouData";
import Guide from "@/components/cyber/Guide";
import { subscribeDone } from "@/app/lib/conceptProgress";

const TONE = ACCENT.concepts;

/* The two reasons, and they are a statement rather than a menu.
   The first version put them in two separate raised cards side by side, which
   made them look like two things to choose between. They are numbered rows
   inside one panel now: one explanation, in two parts, that you read. */
const REASONS = [
  { Icon: Boxes,
    head_en: "You have something worth stealing",
    head_ar: "لديك ما يستحق السرقة",
    body_en: "Not money. Information about people, which they gave you and gave nobody else. Before you decide it is not worth taking, find out what you are actually keeping.",
    body_ar: "ليس مالاً. بل معلومات عن أشخاص، أعطوك إياها ولم يعطوها أحداً غيرك. وقبل أن تقرر أنها لا تستحق السرقة، اعرف ما الذي تحفظه فعلاً." },
  { Icon: DoorOpen,
    head_en: "You are a way in to somewhere else",
    head_ar: "وأنت طريق إلى مكان آخر",
    body_en: "You send reports to a government office. You take patients from a public service. You use the same software as forty other places. Someone who wants them can come through you, even if they never wanted you.",
    body_ar: "ترسل تقارير إلى جهة حكومية. وتستقبل مرضى من جهة عامة. وتستعمل البرنامج نفسه الذي تستعمله أربعون جهة. ومن أرادهم يستطيع أن يمر بك، وإن لم يُردك أنت." },
];

export default function WhyYouPage() {
  useTrackView("why-you");
  const isAR = useLocale() === "ar";
  const [done, setDone] = useState<Record<string, unknown>>({});
  useEffect(() => subscribeDone(setDone), []);

  return (
    <CyberPage>
      <Head
        section={isAR ? "المجلس السيبراني · لماذا أنت" : "Cyber Majlis · Why You"}
        title={isAR ? "لماذا" : "Why"}
        tail={isAR ? "أنت" : "You"}
        sub={isAR
          ? "«ومن يريد بياناتي؟» — إليك الجواب"
          : "“Who would want my data?” Here is the answer"}
        back="/dashboard"
        backLabel={isAR ? "← العودة إلى اللوحة" : "← Back to Dashboard"}
      />

      <Rise style={{ marginBottom: "3rem" }}>
        <div className="cy-panel" style={{ overflow: "hidden" }}>
          <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
          <div style={{ padding: "1.7rem 1.8rem 1.9rem" }}>
            <p style={{
              margin: "0 0 1.4rem", fontSize: "1.06rem", lineHeight: 1.6,
              color: C.head, fontWeight: 700, maxWidth: "48ch",
            }}>
              {isAR
                ? "لماذا قد يأتي أحد إليك أنت؟ لسببين."
                : "Why would anyone come after you? There are two reasons."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              {REASONS.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: "50%", flex: "none", marginTop: 2,
                    display: "grid", placeItems: "center",
                    background: "rgba(99,32,36,.08)", color: C.maroon,
                    fontWeight: 800, fontSize: ".85rem",
                  }}>{i + 1}</span>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: "block", fontSize: "1.04rem", fontWeight: 800, color: C.head, lineHeight: 1.38 }}>
                      {isAR ? r.head_ar : r.head_en}
                    </b>
                    <span style={{ display: "block", fontSize: ".95rem", lineHeight: 1.72, color: C.body, fontWeight: 300, marginTop: ".3rem", maxWidth: "72ch" }}>
                      {isAR ? r.body_ar : r.body_en}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Rise>

      <Rise style={{ marginBottom: "2.6rem" }}>
        <Guide
          lines={[
            { who: "hamad",
              en: "Most people think an attack is aimed at banks and governments. It is usually aimed at whoever left a door open.",
              ar: "يظن أكثر الناس أن الهجوم يستهدف المصارف والحكومات. وهو غالباً يستهدف من ترك باباً مفتوحاً." },
          ]}
          ask={{ who: "rouda",
            en: "Before you open a lesson: what do you keep at work that a stranger could use?",
            ar: "قبل أن تفتح درساً: ما الذي تحفظه في عملك ويستطيع غريب أن يستعمله؟" }}
        />
      </Rise>

      <SectionHead
        title={isAR ? "اختر عملك" : "Find Your Work"}
        sub={isAR ? "كل درس مكتوب لأصحاب عمل بعينه" : "Each lesson is written for one kind of work"}
      />

      <Grid min={320}>
        {WHY_YOU.map(w => {
          const finished = Boolean(done[`wy-${w.slug}`]);
          return (
            <Item key={w.slug} style={{ height: "100%" }}>
              <Link href={`/dashboard/why-you/${w.slug}`} className="cy-card"
                style={{ ["--tone" as string]: finished ? C.gold : TONE, height: "100%" }}>
                <div className="cy-stripe" style={{ ["--tone" as string]: finished ? C.gold : TONE }} />
                <div style={{ padding: "1.6rem 1.7rem 1.8rem", display: "flex", flexDirection: "column", flex: 1, textAlign: "center", alignItems: "center" }}>
                  <h2 style={{
                    fontFamily: "var(--title)",
                    fontSize: "1.24rem", fontWeight: 700, color: C.head,
                    margin: "0 0 .6rem", lineHeight: 1.4,
                  }}>
                    {isAR ? w.who_ar : w.who_en}{" "}
                    <span style={{ color: C.mid }}>{isAR ? w.tail_ar : w.tail_en}</span>
                  </h2>
                  <p style={{ margin: 0, fontSize: ".93rem", lineHeight: 1.68, color: C.body, fontWeight: 300 }}>
                    {isAR ? w.line_ar : w.line_en}
                  </p>
                  <div style={{ marginTop: "auto", paddingTop: "1.1rem" }}>
                    <span className="cy-chip" style={finished
                      ? { background: "rgba(197,165,126,.3)", color: C.maroon, fontWeight: 700 }
                      : undefined}>
                      {finished ? <Check size={11} strokeWidth={3} /> : <Clock size={11} />}
                      {finished
                        ? (isAR ? "أنهيته" : "Finished")
                        : `${w.minutes} ${isAR ? "دقائق" : "min"}`}
                    </span>
                  </div>
                  <div className="cy-arrow" style={{ width: "100%" }}>{isAR ? "افتحه" : "Open it"}</div>
                </div>
              </Link>
            </Item>
          );
        })}
      </Grid>
    </CyberPage>
  );
}
