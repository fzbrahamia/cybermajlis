"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Play } from "lucide-react";
import { CyberPage, Head, Rise, Item, Grid, CardArt, C, ACCENT } from "@/components/cyber/shell";
import { CASES } from "@/app/lib/cyberData";
import Guide from "@/components/cyber/Guide";

const TONE = ACCENT.cases;

export default function CasesPage() {
  const isAR = useLocale() === "ar";
  return (
    <CyberPage>
      <Head
        section={isAR ? "المجلس السيبراني · حالات" : "Cyber Majlis · Cases"}
        title={isAR ? "حالات" : "Real Life"}
        tail={isAR ? "حقيقية" : "Cases"}
        sub={isAR
          ? "ليست قصص ملفات مسروقة، بل ما كلّفته الهجمات أناساً حقيقيين"
          : "Not stories about stolen files, but what attacks cost real people"}
        back="/dashboard"
        backLabel={isAR ? "← العودة إلى اللوحة" : "← Back to Dashboard"}
      />

      <Rise style={{ marginBottom: "2.4rem" }}>
        <Guide lines={[
          { who: "rouda",
            en: "Every case here really happened to real people. We do not tell them to frighten you.",
            ar: "كل حالة هنا وقعت فعلاً لأناس حقيقيين. ولا نرويها لنخيفك." },
          { who: "hamad",
            en: "We tell them so you can see what one small mistake actually costs somebody, long after the computers are fixed.",
            ar: "بل نرويها لترى ما يكلّفه خطأ صغير إنساناً، بعد إصلاح الحواسيب بزمن طويل." },
        ]} />
      </Rise>

      <Grid min={320}>
        {CASES.map(k => (
          <Item key={k.slug} style={{ height: "100%" }}>
            <Link href={`/dashboard/cases/${k.slug}`} className="cy-card"
              style={{ ["--tone" as string]: TONE, height: "100%" }}>
              <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
              <div style={{ padding: "1.4rem 1.6rem 1.8rem", display: "flex", flexDirection: "column", flex: 1, alignItems: "center", textAlign: "center" }}>
                <CardArt
                  slug={k.slug}
                  src={k.cover}
                  alt={isAR ? k.name_ar : k.name_en}
                  fallback={<Play size={30} strokeWidth={1.6} />}
                  style={{ marginBottom: "1.1rem" }}
                />

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: "1rem" }}>
                  <span className="cy-chip" style={{ color: TONE, background: `${TONE}14` }}>
                    {isAR ? k.when_ar : k.when_en}
                  </span>
                  {k.video && <span className="cy-chip"><Play size={11} />{k.minutes} {isAR ? "د" : "min"}</span>}
                </div>
                <h2 style={{ margin: "0 0 .6rem", fontSize: "1.25rem", fontWeight: 800, color: C.head, lineHeight: 1.3 }}>
                  {isAR ? k.name_ar : k.name_en}
                </h2>
                <p style={{ margin: 0, fontSize: ".95rem", lineHeight: 1.65, color: C.body, fontWeight: 300, flex: 1 }}>
                  {isAR ? k.line_ar : k.line_en}
                </p>
                <div className="cy-arrow" style={{ width: "100%" }}>{isAR ? "افتحها" : "Open it"}</div>
              </div>
            </Link>
          </Item>
        ))}
      </Grid>
    </CyberPage>
  );
}
