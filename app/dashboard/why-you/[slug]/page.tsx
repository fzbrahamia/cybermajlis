"use client";

/* One Why You lesson: the stage, then the door.
 *
 * The stage is the whole lesson. Everything below it exists only to hand the
 * learner to the real case, the same way a concept hands them to one — the
 * difference being that here the case is the proof rather than the example. */

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useTrackView } from "@/hooks/useTrackView";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { CyberPage, Head, Rise, Rule, C, ACCENT } from "@/components/cyber/shell";
import Stage from "@/components/cyber/Stage";
import { whyYouBySlug } from "@/app/lib/whyYouData";
import { caseBySlug } from "@/app/lib/cyberData";
import { markDone, subscribeDone } from "@/app/lib/conceptProgress";

const over: React.CSSProperties = {
  fontSize: ".62rem", letterSpacing: ".28em", textTransform: "uppercase",
  color: C.mid, marginBottom: ".7rem",
};

export default function WhyYouLesson({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  useTrackView(`why-you-${slug}`);
  const isAR = useLocale() === "ar";
  const w = whyYouBySlug(slug);

  const [done, setDone] = useState(false);
  useEffect(() => subscribeDone(d => setDone(Boolean(d[`wy-${slug}`]))), [slug]);

  /* Finished means reached the end of the run, not merely opened the page. */
  const finish = useCallback(() => { markDone(`wy-${slug}`); setDone(true); }, [slug]);

  if (!w) {
    return <CyberPage><Head section="Cyber Majlis" title="Not" tail="Found"
      back="/dashboard/why-you" backLabel="← Back" /></CyberPage>;
  }

  const k = w.case ? caseBySlug(w.case) : undefined;

  return (
    <CyberPage>
      <Head
        section={isAR ? "المجلس السيبراني · لماذا أنت" : "Cyber Majlis · Why You"}
        title={isAR ? w.who_ar : w.who_en}
        tail={isAR ? w.tail_ar : w.tail_en}
        sub={isAR ? w.line_ar : w.line_en}
        back="/dashboard/why-you"
        backLabel={isAR ? "← لماذا أنت" : "← Why You"}
      />

      <Rise style={{ marginBottom: k ? "2.6rem" : "3rem" }}>
        <Stage beats={w.beats} onFinish={finish} />
      </Rise>

      {done && (
        <Rise style={{ marginBottom: "2.2rem", textAlign: "center" }}>
          <span className="cy-chip" style={{ background: "rgba(197,165,126,.3)", color: C.maroon, fontWeight: 700 }}>
            <Check size={11} strokeWidth={3} />{isAR ? "أنهيت هذا الدرس" : "You finished this one"}
          </span>
        </Rise>
      )}

      {/* the door to the case, which is the proof that none of it was theory */}
      {k && (
        <Rise delay={.06} style={{ marginBottom: "3rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
            <div style={over}>{isAR ? "حدث هذا من قبل" : "This has happened before"}</div>
            <Rule width={36} />
          </div>

          <Link href={`/dashboard/cases/${k.slug}`} className="cy-card"
            style={{ ["--tone" as string]: ACCENT.cases, display: "block" }}>
            <div className="cy-stripe" style={{ ["--tone" as string]: ACCENT.cases }} />
            <div style={{
              padding: "1.6rem 1.8rem 1.7rem", display: "flex", alignItems: "center",
              gap: "1.2rem", flexWrap: "wrap",
            }}>
              <span style={{ flex: 1, minWidth: 230 }}>
                <span className="cy-chip" style={{ marginBottom: ".7rem" }}>
                  {isAR ? k.when_ar : k.when_en}
                </span>
                <span style={{ display: "block", fontSize: "1.22rem", fontWeight: 800, color: C.head, lineHeight: 1.32 }}>
                  {isAR ? k.name_ar : k.name_en}
                </span>
                <span style={{ display: "block", fontSize: ".95rem", lineHeight: 1.65, color: C.body, fontWeight: 300, marginTop: ".4rem" }}>
                  {isAR ? k.line_ar : k.line_en}
                </span>
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 9, flex: "none",
                fontSize: ".7rem", letterSpacing: ".14em", textTransform: "uppercase",
                fontWeight: 700, color: C.maroon, border: `1px solid rgba(99,32,36,.25)`,
                background: "rgba(99,32,36,.05)", borderRadius: 9, padding: "11px 18px",
              }}>
                {isAR ? "شاهد ما حدث" : "See what happened"}
                {isAR ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
              </span>
            </div>
          </Link>
        </Rise>
      )}
    </CyberPage>
  );
}
