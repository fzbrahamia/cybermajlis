"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Play, Layers } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { Stagger, Rise, Lift, RoomHead, Says, Hint } from "@/components/innovation/Alive";
import { DOMAINS, casesForDomain } from "@/app/lib/domainData";
import { conceptsForDomain } from "@/app/lib/conceptData";
import { VERBS } from "@/app/lib/innovationData";
import { M, sans, HUES, R, card, btn, chip, quiet, label } from "@/components/innovation/theme";

const STEP_HUE = [HUES.gold, HUES.maroon, HUES.blue, HUES.green, HUES.gold];

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

      {/* the five moves, as shapes rather than a paragraph */}
      <Stagger gap={0.06}>
        <Rise style={{ marginTop: 34, marginBottom: 12 }}>
          <span style={{ ...label }}>{isAR ? "ما تتعلمه" : "What you learn"}</span>
        </Rise>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,10rem),1fr))",
          gap: 10, marginBottom: 42,
        }}>
          {VERBS.map((v, i) => {
            const h = STEP_HUE[i];
            return (
              <Lift key={v.id} hue={h} style={{
                ...card, padding: "18px 18px 20px",
                borderTop: `4px solid ${h.mid}`, height: "100%",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", background: h.tint,
                  display: "grid", placeItems: "center", marginBottom: 10,
                  fontFamily: sans, fontSize: 13, fontWeight: 900, color: h.deep,
                }}>{i + 1}</div>
                <div style={{
                  fontSize: isAR ? 20 : 18, fontWeight: 900, color: M.heading,
                  letterSpacing: isAR ? 0 : "0.02em",
                  textTransform: isAR ? "none" : "uppercase", marginBottom: 5,
                }}>{isAR ? v.ar : v.en}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: M.body }}>
                  {isAR ? v.does_ar : v.does_en}
                </div>
              </Lift>
            );
          })}
        </div>
      </Stagger>

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
            const inner = (
              <Lift hue={h} style={{
                ...card, height: "100%", padding: 0, overflow: "hidden",
                opacity: d.live ? 1 : 0.55,
              }}>
                <div style={{ height: 6, background: d.live ? d.tone : "rgba(42,35,28,.14)" }} />
                <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 10, height: "calc(100% - 6px)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontSize: 19, fontWeight: 900, color: d.live ? d.tone : M.heading, letterSpacing: "-0.01em" }}>
                      {isAR ? d.name_ar : d.name_en}
                    </span>
                    {d.live
                      ? <motion.span whileHover={{ x: 3 }}><ArrowRight size={18} color={d.tone} strokeWidth={2.4} /></motion.span>
                      : <Lock size={15} color={M.body} strokeWidth={2} />}
                  </div>

                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: M.body }}>
                    {isAR ? d.line_ar : d.line_en}
                  </div>

                  <div style={{ padding: "13px 15px", borderRadius: R.chip, background: d.live ? d.tint : "rgba(42,35,28,.04)" }}>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: M.heading, fontWeight: 600 }}>
                      {isAR ? d.open_ar : d.open_en}
                    </div>
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {d.live ? (
                      <>
                        <Hint say={isAR
                          ? `${cn} أفلام قصيرة تشرح كيف تعمل الأشياء هنا`
                          : `${cn} short films explaining how things work here`}>
                          <span style={{ ...quiet, gap: 6 }}><Play size={13} />{cn}</span>
                        </Hint>
                        <Hint say={isAR
                          ? `${cc} مشكلة حقيقية حدثت، وكل من حاول حلها`
                          : `${cc} real problem that happened, and everyone who tried to solve it`}>
                          <span style={{ ...quiet, gap: 6 }}><Layers size={13} />{cc}</span>
                        </Hint>
                      </>
                    ) : (
                      <span style={quiet}>{isAR ? "قريباً" : "Soon"}</span>
                    )}
                  </div>
                </div>
              </Lift>
            );
            return d.live
              ? <Link key={d.id} href={`/learn/${d.id}`} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>
              : <div key={d.id}>{inner}</div>;
          })}
        </div>
      </Stagger>

      <Says who="hamad" hue={gold}>
        {isAR
          ? "ابدأ بأي مجال يعجبك. لا يوجد ترتيب صحيح."
          : "Start with whichever one you like. There is no right order."}
      </Says>

      {/* practice, quietly */}
      <div style={{ marginTop: 40, paddingTop: 26, borderTop: `1px solid rgba(42,35,28,.10)` }}>
        <div style={{ ...label, marginBottom: 14 }}>{isAR ? "أشياء أخرى" : "Other things here"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href="/board" style={chip(HUES.maroon)}>{isAR ? "المشكلات" : "Problems"}</Link>
          <Link href="/mine" style={chip(HUES.green)}>{isAR ? "تحقيقك" : "Your investigation"}</Link>
          <Link href="/mine" style={chip(HUES.blue)}>{isAR ? "جوازك" : "Your passport"}</Link>
        </div>
      </div>
    </InnovationPage>
  );
}
