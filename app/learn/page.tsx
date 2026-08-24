"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight, Lock, Play, Layers } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { Stagger, Rise, Lift, RoomHead, Says } from "@/components/innovation/Alive";
import { DOMAINS, casesForDomain } from "@/app/lib/domainData";
import { conceptsForDomain } from "@/app/lib/conceptData";
import { M, sans, HUES, card, quiet } from "@/components/innovation/theme";

export default function LearnPage() {
  const isAR = useLocale() === "ar";
  const gold = HUES.gold;

  return (
    <InnovationPage>
      <RoomHead
        hue={gold}
        eyebrow={isAR ? "المجلس" : "Majlis"}
        title={isAR ? "اختر شيئاً تنظر فيه" : "Pick something to look into"}
        sub={isAR
          ? "كل مجال فيه أفلام قصيرة، ثم قضية حقيقية حدثت فعلاً."
          : "Each one has short films, then a real case that actually happened."}
      />

      {/* the domains */}
      <Stagger gap={0.07}>
        <Rise style={{ marginBottom: 16 }}>
          <h2 style={{
            margin: 0, fontFamily: sans, fontSize: "clamp(20px,3vw,26px)",
            fontWeight: 900, color: M.heading, letterSpacing: "-0.015em",
          }}>
            {isAR ? "أين يقف العالم الآن" : "Where the world is now"}
          </h2>
        </Rise>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,18rem),1fr))",
          gap: 14, marginBottom: 40,
        }}>
          {DOMAINS.map(d => {
            const h = { deep: d.tone, mid: d.tone, soft: d.tone, tint: d.tint, wash: d.tint };
            const cn = conceptsForDomain(d.id).length;
            const cc = casesForDomain(d.id).length;
            const shell: React.CSSProperties = {
              ...card, height: "100%", padding: 0, overflow: "hidden",
              opacity: d.live ? 1 : 0.5,
            };

            const face = (
              <>
                <div style={{ height: 6, background: d.live ? d.tone : "rgba(42,35,28,.14)" }} />
                <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 10, height: "calc(100% - 6px)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontSize: 19, fontWeight: 900, color: d.live ? d.tone : M.heading, letterSpacing: "-0.01em" }}>
                      {isAR ? d.name_ar : d.name_en}
                    </span>
                    {d.live
                      ? <ArrowRight size={18} color={d.tone} strokeWidth={2.4} />
                      : <Lock size={15} color={M.body} strokeWidth={2} />}
                  </div>

                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: M.body }}>
                    {isAR ? d.line_ar : d.line_en}
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {d.live ? (
                      <>
                        <span style={{ ...quiet, gap: 6 }} title={isAR ? "أفلام قصيرة" : "short films"}>
                          <Play size={13} />{cn}
                        </span>
                        <span style={{ ...quiet, gap: 6 }} title={isAR ? "قضايا حقيقية" : "real cases"}>
                          <Layers size={13} />{cc}
                        </span>
                      </>
                    ) : (
                      <span style={quiet}>{isAR ? "قريباً" : "Soon"}</span>
                    )}
                  </div>
                </div>
              </>
            );

            // Only what opens moves under the cursor. A locked card that lifts
            // is asking to be clicked and then refusing.
            return d.live
              ? (
                <Link key={d.id} href={`/learn/${d.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <Lift hue={h} style={shell}>{face}</Lift>
                </Link>
              )
              : <div key={d.id} style={shell}>{face}</div>;
          })}
        </div>
      </Stagger>

      <Says who="hamad" hue={gold}>
        {isAR
          ? "ابدأ بأي مجال يعجبك. لا يوجد ترتيب صحيح."
          : "Start with whichever one you like. There is no right order."}
      </Says>

    </InnovationPage>
  );
}
