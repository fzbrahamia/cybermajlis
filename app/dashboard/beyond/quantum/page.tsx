"use client";

/* The quantum lessons, laid out the way the simulations grid is, because that
   is the shape CyberMajlis already uses for a set of things you go and run. */

import Link from "next/link";
import { useLocale } from "next-intl";
import { Play, Beaker, BookOpen, KeyRound, CircleDot } from "lucide-react";
import { CyberPage, Head, Item, Stagger, CardArt } from "@/components/cyber/shell";
import { QUANTUM_PATH, labsForLesson } from "@/app/lib/quantumData";

export default function BeyondQuantumPage() {
  const isAR = useLocale() === "ar";

  return (
    <CyberPage>
      <Head
        section={isAR ? "المجلس السيبراني · الكوانتم" : "Cyber Majlis · Quantum"}
        title={isAR ? "الآلة التي" : "The Machine That"}
        tail={isAR ? "تهزّ الأقفال" : "Shakes The Locks"}
        sub={isAR
          ? "كل ما نحميه اليوم يفترض أن بعض الحساب بطيء في عكسه"
          : "Everything we protect today assumes some arithmetic is slow to undo"}
        back="/dashboard"
        backLabel={isAR ? "← العودة إلى اللوحة" : "← Back to Dashboard"}
      />

      <Stagger style={{ display: "grid", gap: "0.875rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {QUANTUM_PATH.map(l => {
          const labs = labsForLesson(l.slug).length;
          /* Each lesson wears its own thing: a chest has a key, a coin spins. */
          const Icon = l.slug === "locked-chest" ? KeyRound : CircleDot;
          const tags = [
            `${l.video.minutes} ${isAR ? "دقائق" : "min"}`,
            isAR ? "لوحة" : "Board",
            `${labs} ${isAR ? "مختبر" : labs === 1 ? "lab" : "labs"}`,
          ];
          return (
            <Item key={l.slug} style={{ height: "100%" }}>
              <Link href={`/dashboard/beyond/quantum/${l.slug}`}
                className="group"
                style={{
                  display: "block", height: "100%", textDecoration: "none",
                  background: "#FBF4E8", border: "1px solid rgba(99,32,36,.12)",
                  borderRadius: "1rem", padding: "1.25rem",
                  boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                  transition: "transform .3s, border-color .3s, box-shadow .3s",
                }}>
                <CardArt
                  slug={l.slug}
                  alt={isAR ? l.name_ar : l.name_en}
                  fallback={<Icon size={28} color="#632024" strokeWidth={1.7} />}
                  style={{ marginBottom: ".75rem" }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".5rem", marginBottom: ".5rem" }}>
                  <div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#4a1a1d", marginBottom: 4 }}>
                      {isAR ? l.name_ar : l.name_en}
                    </div>
                    <div style={{ fontSize: ".75rem", color: "#632024", fontWeight: 600 }}>
                      {isAR ? l.subtitle_ar : l.subtitle_en}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flex: "none" }}>
                    <span style={{
                      fontSize: 9, padding: ".25rem .625rem", borderRadius: ".5rem", fontWeight: 700,
                      background: "rgba(99,32,36,.15)", border: "1px solid rgba(99,32,36,.2)", color: "#632024",
                    }}>{isAR ? "درس" : "Lesson"}</span>
                    <span style={{
                      fontSize: 8, padding: ".125rem .5rem", borderRadius: ".375rem", fontWeight: 600,
                      background: "rgba(99,32,36,.1)", border: "1px solid rgba(99,32,36,.22)", color: "#8B2635",
                    }}>{isAR ? "◀ ابدأ" : "▶ Begin"}</span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: ".6875rem", lineHeight: 1.6, color: "rgba(106,70,64,.85)" }}>
                  {isAR ? l.hook_ar : l.hook_en}
                </p>

                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: ".5rem" }}>
                  {tags.map((tag, j) => (
                    <span key={j} style={{
                      fontSize: 9, padding: ".25rem .5rem", borderRadius: ".375rem", fontWeight: 600,
                      background: "rgba(99,32,36,.1)", border: "1px solid rgba(99,32,36,.15)", color: "#632024",
                    }}>{tag}</span>
                  ))}
                </div>
              </Link>
            </Item>
          );
        })}
      </Stagger>

      <style>{`
        .group:hover { transform: translateY(-4px); border-color: rgba(99,32,36,.35) !important;
          box-shadow: 0 24px 48px rgba(99,32,36,.12) !important; }
      `}</style>
    </CyberPage>
  );
}
