"use client";

/* The dashboard aside. Was a leaderboard, which ranked children against each
   other and told them nothing they could act on.
   Styled as the dashboard's own panels are, with the .lc rows the lesson list
   already uses, so it does not announce itself as something newer. */

import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight, Lock, Layers, Cpu, Radio, Rocket, Factory } from "lucide-react";
import { QUANTUM_PATH } from "@/app/lib/quantumData";
import { CASES } from "@/app/lib/cyberData";

export default function BeyondPanel() {
  const isAR = useLocale() === "ar";
  const isRtl = isAR;

  const rows = [
    { Icon: Layers,  en: "Real life cases", ar: "حالات حقيقية",
      m_en: `${CASES.length} ${CASES.length === 1 ? "case" : "cases"}`, m_ar: `${CASES.length} حالة`,
      href: "/dashboard/cases" },
    { Icon: Cpu,     en: "Quantum computing", ar: "الحوسبة الكمّية",
      m_en: `${QUANTUM_PATH.length} lessons`, m_ar: `${QUANTUM_PATH.length} دروس`,
      href: "/dashboard/beyond/quantum" },
    { Icon: Factory, en: "Operational technology", ar: "تقنيات التشغيل", m_en: "Soon", m_ar: "قريباً" },
    { Icon: Radio,   en: "Artificial intelligence", ar: "الذكاء الاصطناعي", m_en: "Soon", m_ar: "قريباً" },
    { Icon: Rocket,  en: "Space technology", ar: "تقنيات الفضاء", m_en: "Soon", m_ar: "قريباً" },
  ];

  return (
    <div className="panel panel-light" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="panel-head">
        <h2>{isAR ? "خارج الشاشة" : "Beyond the Screen"}</h2>
        <p>{isAR ? "حين يخرج الأمر من الحاسوب." : "When it leaves the computer."}</p>
      </div>

      {rows.map(r => {
        const soon = !r.href;
        const body = (
          <>
            <div className="lc-ic" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <r.Icon size={19} strokeWidth={1.9} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#4a1a1d", lineHeight: 1.3 }}>
                {isAR ? r.ar : r.en}
              </div>
              <div style={{ fontSize: ".72rem", color: "#6a4640", marginTop: 2, letterSpacing: ".04em" }}>
                {isAR ? r.m_ar : r.m_en}
              </div>
            </div>
            {soon
              ? <Lock size={14} style={{ opacity: .5 }} />
              : <ArrowRight size={15} style={isRtl ? { transform: "scaleX(-1)" } : undefined} />}
          </>
        );
        return soon
          ? <div key={r.en} className="lc lc-soon" aria-disabled="true">{body}</div>
          : <Link key={r.en} href={r.href!} className="lc">{body}</Link>;
      })}
    </div>
  );
}
