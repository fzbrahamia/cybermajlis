"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FirewallBook from "@/components/innovation/FirewallBook";

const FIREWALL = {
  name_en: "The Guard at the Gate",
  name_ar: "حارس البوابة",

  eyebrow_en: "A story before the lesson",
  eyebrow_ar: "قصة قبل أن نبدأ",

  line_en:
    "A small story about a neighborhood, a guard, and the things a gate can — and cannot — see.",
  line_ar:
    "قصة قصيرة عن حيّ وحارس، وعن الأشياء التي تستطيع البوابة رؤيتها... والأشياء التي لا تستطيع رؤيتها.",

  back: {
    href: "/learn/cybersecurity",
    en: "Cybersecurity",
    ar: "الأمن السيبراني",
  },
};

export default function FirewallStandalonePage() {
  const isAR = useLocale() === "ar";

  return (
    <main
      style={{
        minHeight: "100dvh",
        position: "relative",
        overflowX: "hidden",
        background:
          "radial-gradient(circle at 50% 12%, rgba(255,255,255,.96), rgba(250,244,229,.92) 34%, rgba(233,220,193,.96) 100%), linear-gradient(180deg,#FBF6E9,#E8D9BB)",
        color: "#432D20",
      }}
    >
      {/* very subtle paper-room texture */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.13,
          backgroundImage:
            "radial-gradient(circle, rgba(96,67,37,.12) 0 .55px, transparent .65px)",
          backgroundSize: "10px 11px",
          mixBlendMode: "multiply",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1380,
          margin: "0 auto",
          padding: "12px 18px 34px",
        }}
      >
        <Link
          href={FIREWALL.back.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 4,
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "#76532D",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          {isAR ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
          {isAR ? FIREWALL.back.ar : FIREWALL.back.en}
        </Link>
        <div style={{ height: 2 }} />

        <FirewallBook
          titleEn={FIREWALL.name_en}
          titleAr={FIREWALL.name_ar}
        />
      </div>
    </main>
  );
}
