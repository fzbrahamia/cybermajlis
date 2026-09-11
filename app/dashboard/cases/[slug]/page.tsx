"use client";

import { use } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { CyberPage, Head, SectionHead, Rise, Item, Grid, Rule, Film, C, ACCENT } from "@/components/cyber/shell";
import { caseBySlug } from "@/app/lib/cyberData";

const TONE = ACCENT.cases;
const over: React.CSSProperties = {
  fontSize: ".62rem", letterSpacing: ".28em", textTransform: "uppercase",
  color: C.mid, marginBottom: ".7rem",
};

export default function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isAR = useLocale() === "ar";
  const k = caseBySlug(slug);

  if (!k) {
    return <CyberPage><Head section="Cyber Majlis" title="Not" tail="Found"
      back="/dashboard/cases" backLabel="← Back" /></CyberPage>;
  }

  const costs = isAR ? k.cost_ar : k.cost_en;

  return (
    <CyberPage>
      <Head
        section={`${isAR ? k.called_ar : k.called_en} · ${isAR ? k.when_ar : k.when_en}`}
        title={isAR ? k.name_ar : k.name_en}
        sub={isAR ? k.line_ar : k.line_en}
        back="/dashboard/cases"
        backLabel={isAR ? "← حالات حقيقية" : "← Real Life Cases"}
      />

      {k.video && (
        <Rise style={{ marginBottom: "2.5rem" }}>
          <div className="cy-panel" style={{ overflow: "hidden" }}>
            <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
            <div style={{ padding: "1rem" }}>
              <Film src={k.video} poster={`/lessons/covers/${k.slug}.jpg`} />
            </div>
          </div>
        </Rise>
      )}

      <Rise delay={.05} style={{ marginBottom: "3rem" }}>
        <div className="cy-panel" style={{ overflow: "hidden" }}>
          <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
          <div style={{ padding: "2rem 2.1rem 2.3rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ ...over, marginBottom: ".5rem" }}>{isAR ? "ما حدث" : "What happened"}</div>
              <Rule width={36} />
            </div>

            <p style={{
              margin: "0 auto", maxWidth: "34ch", textAlign: "center",
              fontSize: "clamp(1.2rem, 2.4vw, 1.55rem)", lineHeight: 1.5,
              color: C.head, fontWeight: 800, letterSpacing: "-.015em",
            }}>
              {(isAR ? k.story_ar : k.story_en)[0]}
            </p>

            <div style={{
              marginTop: "1.9rem", display: "grid", gap: "1.3rem 2.4rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            }}>
              {(isAR ? k.story_ar : k.story_en).slice(1).map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: "1rem", lineHeight: 1.75, color: C.body, fontWeight: 300 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Rise>

      <SectionHead
        title={isAR ? "كيف عملت" : "How It Worked"}
        sub={isAR ? "خطوة بخطوة، حتى تفهمها لا أن تخافها" : "Step by step, so you understand it rather than fear it"}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {(isAR ? k.how_ar : k.how_en).map((h, i) => (
          <Rise key={i} delay={i * .04}>
            <div className="cy-panel" style={{ overflow: "hidden" }}>
              <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
              <div style={{ padding: "1.4rem 1.6rem 1.5rem", display: "flex", gap: "1.1rem", alignItems: "flex-start" }}>
                <span style={{
                  width: 34, height: 34, borderRadius: "50%", flex: "none",
                  display: "grid", placeItems: "center", marginTop: 2,
                  background: "rgba(99,32,36,.09)", color: C.maroon,
                  fontWeight: 800, fontSize: ".9rem",
                }}>{i + 1}</span>
                <span style={{ minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: "1.06rem", fontWeight: 800, color: C.head, lineHeight: 1.35 }}>
                    {"head_en" in h ? h.head_en : h.head_ar}
                  </b>
                  <span style={{ display: "block", fontSize: ".97rem", lineHeight: 1.7, color: C.body, fontWeight: 300, marginTop: ".3rem", maxWidth: "74ch" }}>
                    {"body_en" in h ? h.body_en : h.body_ar}
                  </span>
                </span>
              </div>
            </div>
          </Rise>
        ))}
      </div>

      {/* the lesson that teaches the thing the attack used */}
      {k.lesson && (
        <Rise delay={.06} style={{ marginBottom: "3rem" }}>
          <Link href={k.lesson.href} className="cy-card" style={{ ["--tone" as string]: TONE, display: "block" }}>
            <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
            <div style={{ padding: "1.3rem 1.6rem 1.4rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ flex: 1, minWidth: 200 }}>
                <span style={{ display: "block", ...over, marginBottom: ".35rem" }}>
                  {isAR ? "لفهم القفل نفسه" : "To understand the lock itself"}
                </span>
                <span style={{ display: "block", fontSize: "1.1rem", fontWeight: 800, color: C.head }}>
                  {isAR ? k.lesson.ar : k.lesson.en}
                </span>
              </span>
              {isAR ? <ArrowLeft size={18} color={C.maroon} /> : <ArrowRight size={18} color={C.maroon} />}
            </div>
          </Link>
        </Rise>
      )}

      <Rise style={{ marginBottom: "3rem" }}>
        <div className="cy-panel" style={{ overflow: "hidden" }}>
          <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
          <div style={{ padding: "1.9rem 1.9rem 2.1rem", textAlign: "center" }}>
            <div style={{ ...over, marginBottom: ".5rem" }}>{isAR ? "كيف انتهت" : "How it ended"}</div>
            <Rule width={36} />
            <p style={{ margin: "0 auto", maxWidth: "62ch", fontSize: "1.02rem", lineHeight: 1.78, color: C.body, fontWeight: 300 }}>
              {isAR ? k.stopped_ar : k.stopped_en}
            </p>
          </div>
        </div>
      </Rise>

      <SectionHead
        title={isAR ? "ماذا كلّف الناس" : "What It Cost People"}
        sub={isAR ? "خارج الشاشة، حيث يعيش الناس" : "Off the screen, where people live"}
      />
      <Grid min={260} style={{ marginBottom: "3rem" }}>
        {costs.map((c, i) => (
          <Item key={i} style={{ height: "100%" }}>
            <div className="cy-card" style={{ ["--tone" as string]: TONE, height: "100%" }}>
              <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
              <div style={{ padding: "1.5rem 1.5rem 1.7rem", display: "flex", flexDirection: "column", gap: ".55rem", flex: 1, textAlign: "center" }}>
                <b style={{ fontSize: "1.06rem", color: C.head, fontWeight: 800, lineHeight: 1.34 }}>
                  {"head_en" in c ? c.head_en : c.head_ar}
                </b>
                <span style={{ fontSize: ".92rem", lineHeight: 1.65, color: C.body, fontWeight: 300 }}>
                  {"body_en" in c ? c.body_en : c.body_ar}
                </span>
              </div>
            </div>
          </Item>
        ))}
      </Grid>

      <Rise delay={.08} style={{ marginBottom: "3rem" }}>
        <div className="cy-panel" style={{
          overflow: "hidden",
          background: "linear-gradient(160deg, #FBF3E2 0%, #F1E3C8 100%)",
          borderColor: "rgba(197,165,126,.55)",
        }}>
          <div className="cy-stripe" style={{ ["--tone" as string]: C.gold }} />
          <div style={{ padding: "2.4rem 2.1rem", textAlign: "center" }}>
            <div style={over}>{isAR ? "الفكرة كلها" : "The whole point"}</div>
            <Rule width={36} />
            <p style={{
              margin: "0 auto", fontSize: "clamp(1.08rem,2vw,1.32rem)", lineHeight: 1.68,
              color: C.head, fontWeight: 500, maxWidth: "44ch", letterSpacing: "-.008em",
            }}>
              {isAR ? k.point_ar : k.point_en}
            </p>
          </div>
        </div>
      </Rise>

    </CyberPage>
  );
}
