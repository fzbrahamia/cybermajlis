"use client";

// The innovation track's home. Majlis level: the five moves are the method,
// and the method is the trunk. See app/lib/innovationData.ts.

import Link from "next/link";
import { useLocale } from "next-intl";
import { Users, CalendarClock } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import Spine from "@/components/innovation/Spine";
import { STEPS, PROBLEMS, WORK } from "@/app/lib/innovationData";
import { M, mono, label, card, flat, button, quietPill } from "@/components/innovation/theme";

export default function InvestigatePage() {
  const isAR = useLocale() === "ar";
  const month = PROBLEMS.find(p => p.featured)!;
  const first = STEPS[0];

  return (
    <InnovationPage>
      {/* This is practice, not the front door. Someone starting here has no way
          to know how to proceed, so the page says where the method is taught. */}
      <div style={{
        ...flat, padding: "13px 18px", marginBottom: 18,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 14, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 13, lineHeight: 1.55, color: M.heading }}>
          {isAR
            ? "هذه ساحة تطبيق، لا نقطة بداية. الطريقة تُدرَّس في مسار التعلّم."
            : "This is a place to apply the method, not to start. The method itself is taught in Learn."}
        </span>
        <Link href="/learn" style={{
          fontFamily: mono, fontSize: 11, letterSpacing: "0.1em",
          textTransform: "uppercase", color: M.action, textDecoration: "none", flex: "none",
        }}>
          {isAR ? "تعلّم الطريقة أولاً" : "Learn the method first"}
        </Link>
      </div>

      {/* what she is chasing */}
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap", marginBottom: 14,
      }}>
        <div>
          <div style={{ ...label, marginBottom: 6 }}>
            {isAR ? "تحقيقك" : "Your investigation"}
          </div>
          <h1 style={{
            margin: 0, fontSize: "clamp(21px,3vw,26px)", fontWeight: 800,
            lineHeight: 1.25, letterSpacing: "-0.01em", color: M.heading,
            maxWidth: "44rem", textWrap: "balance",
          }}>
            {isAR
              ? "لماذا تتشابه علبتا دواء جدتي إلى هذا الحد؟"
              : "Why do my grandmother's two medicine boxes look the same?"}
          </h1>
        </div>
        <span style={quietPill}>{isAR ? "لاحظتها بنفسي" : "Noticed by me"}</span>
      </div>

      <div style={{ ...card, padding: "24px 24px 12px", marginBottom: 22 }}>
        <Spine done={["notice", "name"]} current="make" />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))",
        gap: 18,
      }}>
        {/* this month, everyone */}
        <div style={{ ...card, padding: "22px 24px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <span style={label}>{isAR ? month.source_ar : month.source_en}</span>
            <span style={{ ...quietPill, gap: 6 }}>
              <CalendarClock size={12} />
              {isAR ? "بقيت ٩ أيام" : "9 days left"}
            </span>
          </div>
          <div style={{
            fontSize: 18, fontWeight: 800, color: M.heading,
            lineHeight: 1.35, marginBottom: 8,
          }}>
            {isAR ? month.title_ar : month.title_en}
          </div>
          <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.65 }}>
            {isAR ? month.body_ar : month.body_en}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/problems" style={button}>
              {isAR ? "ابدأ الملاحظة" : "Start noticing"}
            </Link>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: M.body }}>
              <Users size={14} />
              {isAR ? `${month.count} آخرون يعملون عليها` : `${month.count} others are on it`}
            </span>
          </div>
        </div>

        {/* the passport, in miniature */}
        <div style={{ ...card, padding: "22px 24px 24px" }}>
          <div style={{ ...label, marginBottom: 14 }}>
            {isAR ? "جوازك" : "Your passport"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {WORK.slice(0, 3).map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", background: M.gold,
                  marginTop: 8, flex: "none",
                }} />
                <span style={{ fontSize: 13, lineHeight: 1.5, color: M.heading }}>
                  {isAR ? w.ar : w.en}
                </span>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: 14, borderTop: `1px solid ${M.line}`, fontSize: 12.5, lineHeight: 1.6 }}>
            {isAR
              ? "أول إجابة كتبتها عن العلبتين محفوظة. ستقرؤها مرة أخرى في النهاية وترى كم تغيّر تفكيرك."
              : "Your first answer about the boxes is saved. You will read it again at the end and see how far you moved."}
          </div>
          <Link href="/passport" style={{
            display: "inline-block", marginTop: 14,
            fontFamily: mono, fontSize: 11, letterSpacing: "0.1em",
            textTransform: "uppercase", color: M.action, textDecoration: "none",
          }}>
            {isAR ? "افتح الجواز" : "Open the passport"}
          </Link>
        </div>
      </div>

      {/* walk her six weeks */}
      <div style={{ ...card, padding: "22px 24px 24px", marginTop: 18 }}>
        <div style={{ ...label, marginBottom: 10 }}>
          {isAR ? "ستة أسابيع، خطوة بخطوة" : "Six weeks, step by step"}
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.65, maxWidth: "42rem" }}>
          {isAR
            ? "كل خطوة صفحة حقيقية. ابدأ من الأولى وامضِ إلى النهاية، بما في ذلك الأسبوع الذي أخفقت فيه."
            : "Every step is a real page. Start at the first and walk to the end, including the week it failed."}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {STEPS.map((s, i) => (
            <Link
              key={s.id}
              href={`/investigate/${s.id}`}
              style={{
                ...quietPill,
                textDecoration: "none",
                background: i === 0 ? M.goldSoft : "rgba(42,35,28,.06)",
                color: i === 0 ? M.action : M.body,
              }}
            >
              {i + 1}. {isAR ? s.title_ar : s.title_en}
            </Link>
          ))}
        </div>
        <Link href={`/investigate/${first.id}`} style={button}>
          {isAR ? "ابدأ من الأسبوع الأول" : "Start at week one"}
        </Link>
      </div>
    </InnovationPage>
  );
}
