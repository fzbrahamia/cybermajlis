"use client";

// ============================================================
// ONE LAB, FULL WIDTH
//
// The bench gets the whole page. Adding a lab means a component, a row in
// QUANTUM_LABS, and one line in the switch below.
// ============================================================

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Hammer } from "lucide-react";
import { labById, lessonBySlug } from "@/app/lib/quantumData";
import { QuantumHeader, QuantumFooter } from "@/components/quantum/QuantumChrome";
import DrawerSearchLab from "@/components/quantum/DrawerSearchLab";
import ScaleLab from "@/components/quantum/ScaleLab";
import {
  Q, INK, BODY, LINE, PAPER, PAGE,
  display, bodyFont, mono,
} from "@/components/quantum/theme";

export default function QuantumLabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: id } = use(params);
  const isAR = useLocale() === "ar";
  const lab = labById(id);

  if (!lab) notFound();
  const lesson = lab.lesson ? lessonBySlug(lab.lesson) : null;

  return (
    <div style={{ background: PAGE, minHeight: "100vh", color: INK, fontFamily: bodyFont }}>
      <QuantumHeader />

      <div style={{
        maxWidth: 1180, margin: "0 auto",
        padding: "calc(62px + clamp(26px,4vw,44px)) clamp(18px,4vw,36px) clamp(56px,8vw,90px)",
      }}>
        <Link href="/quantum/labs" style={{
          display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 20,
          fontFamily: mono, fontSize: 9, letterSpacing: "0.18em", color: BODY,
        }}>
          {isAR ? <ArrowRight size={11} /> : <ArrowLeft size={11} />}
          {isAR ? "كل المختبرات" : "ALL LABS"}
        </Link>

        <div style={{ marginBottom: 24, maxWidth: 640 }}>
          <h1 style={{
            fontFamily: display(isAR), fontWeight: 900,
            fontSize: "clamp(1.8rem,3.6vw,2.6rem)", lineHeight: 1.1,
            letterSpacing: isAR ? 0 : "-0.03em", margin: "0 0 10px",
          }}>
            {isAR ? lab.title_ar : lab.title_en}
          </h1>
          <p style={{ fontFamily: bodyFont, fontSize: "1.1rem", lineHeight: 1.6, color: BODY, margin: 0 }}>
            {isAR ? lab.does_ar : lab.does_en}
          </p>
          {lesson && (
            <Link href={`/quantum/paths/${lesson.slug}`} style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, textDecoration: "none",
              fontFamily: mono, fontSize: 9, letterSpacing: "0.16em", color: Q.deep,
              padding: "7px 14px", borderRadius: 999, border: `1px solid ${Q.mid}44`, background: Q.tint,
            }}>
              {isAR ? `الدرس: ${lesson.name_ar}` : `LESSON: ${lesson.name_en}`}
              <ArrowRight size={11} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
            </Link>
          )}
        </div>

        {id === "drawer-search" ? <DrawerSearchLab />
          : id === "scale" ? <ScaleLab />
          : (
            <div style={{
              padding: "56px 28px", borderRadius: 22, textAlign: "center",
              background: PAPER, border: `1px dashed ${LINE}`,
            }}>
              <Hammer size={22} style={{ color: Q.mid, marginBottom: 14 }} />
              <p style={{ fontFamily: bodyFont, fontSize: 17, lineHeight: 1.6, color: BODY, margin: 0 }}>
                {isAR ? "هذا المختبر قيد البناء." : "This bench is still being built."}
              </p>
            </div>
          )}
      </div>

      <QuantumFooter />
    </div>
  );
}
