"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Check, Play, BookOpen } from "lucide-react";
import { CyberPage, Head, SectionHead, Rise, Item, Grid, CardArt, C, ACCENT } from "@/components/cyber/shell";
import { CONCEPTS } from "@/app/lib/cyberData";
import { subscribeDone } from "@/app/lib/conceptProgress";
import SecureHouse from "@/components/cyber/SecureHouse";
import Guide from "@/components/cyber/Guide";

const TONE = ACCENT.concepts;

export default function ConceptsPage() {
  const isAR = useLocale() === "ar";
  const [done, setDone] = useState<Record<string, unknown>>({});
  useEffect(() => subscribeDone(setDone), []);

  return (
    <CyberPage>
      <Head
        section={isAR ? "المجلس السيبراني · المفاهيم" : "Cyber Majlis · Concepts"}
        title={isAR ? "ما الذي" : "What You Are"}
        tail={isAR ? "تحميه" : "Protecting"}
        sub={isAR
          ? "كل درس تنهيه يضيف شيئاً يحمي بيتك"
          : "Every lesson you finish adds something that protects your house"}
        back="/dashboard"
        backLabel={isAR ? "← العودة إلى اللوحة" : "← Back to Dashboard"}
      />

      <Rise style={{ marginBottom: "1.6rem" }}>
        <Guide lines={[
          { who: "hamad",
            en: "This is your house. It starts with gaps in the wall and no gate, because that is what a computer looks like before anyone protects it.",
            ar: "هذا بيتك. يبدأ بفجوات في الجدار وبلا بوابة، فهكذا يبدو الحاسوب قبل أن يحميه أحد." },
          { who: "rouda",
            en: "Finish a lesson and the house changes. Nothing here is decoration: each part is the thing that lesson taught you.",
            ar: "أنهِ درساً يتغيّر البيت. ولا شيء هنا زينة: كل جزء هو ما علّمك إياه ذلك الدرس." },
        ]} />
      </Rise>

      <Rise style={{ marginBottom: "3rem" }}>
        <SecureHouse />
      </Rise>

      <SectionHead title={isAR ? "المفاهيم" : "The Concepts"} />

      <Grid min={300}>
        {CONCEPTS.map(c => {
          const finished = Boolean(done[`cm-${c.slug}`]);
          const Icon = c.media.kind === "book" ? BookOpen : Play;
          return (
            <Item key={c.slug} style={{ height: "100%" }}>
              <Link href={`/dashboard/concepts/${c.slug}`} className="cy-card"
                style={{ ["--tone" as string]: finished ? C.gold : TONE, height: "100%" }}>
                <div className="cy-stripe" style={{ ["--tone" as string]: finished ? C.gold : TONE }} />
                <div style={{ padding: "1.4rem 1.6rem 1.8rem", display: "flex", flexDirection: "column", flex: 1, alignItems: "center", textAlign: "center" }}>
                  <CardArt
                    slug={c.slug}
                    alt={isAR ? c.name_ar : c.name_en}
                    fallback={<Icon size={30} strokeWidth={1.6} />}
                    style={{ marginBottom: "1.1rem" }}
                  />

                  <h2 style={{
                    fontFamily: "var(--title)",
                    fontSize: "1.28rem", fontWeight: 700, color: C.head,
                    margin: "0 0 .5rem", lineHeight: 1.38,
                  }}>
                    {isAR ? c.name_ar : c.name_en}
                  </h2>

                  <p style={{ margin: 0, fontSize: ".93rem", lineHeight: 1.65, color: C.body, fontWeight: 300 }}>
                    {isAR ? c.line_ar : c.line_en}
                  </p>

                  <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                    <span className="cy-chip" style={finished
                      ? { background: "rgba(197,165,126,.3)", color: C.maroon, fontWeight: 700 }
                      : undefined}>
                      {finished && <Check size={11} strokeWidth={3} />}
                      {finished
                        ? (isAR ? "أنهيته" : "Finished")
                        : c.media.kind === "book"
                          ? (isAR ? "قصة" : "Storybook")
                          : `${c.media.minutes} ${isAR ? "دقائق" : "min"}`}
                    </span>
                  </div>
                  <div className="cy-arrow">{isAR ? "افتحه" : "Explore"}</div>
                </div>
              </Link>
            </Item>
          );
        })}
      </Grid>
    </CyberPage>
  );
}
