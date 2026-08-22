"use client";
// ============================================================
// SIMULATIONS
// Standalone route for the 7 safe, hands-on malware demos.
//
// The cards and the full-screen launch live in components/SimGrid.tsx, which
// the Malware category page also uses, so both places look and behave the same.
// ============================================================

import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTrackView } from "@/hooks/useTrackView";
import SimGrid from "@/components/SimGrid";

export default function SimulationsPage() {
  useTrackView("simulations");
  const t = useTranslations("Hub");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const searchParams = useSearchParams();

  return (
    <div
      className="min-h-screen bg-[#FDFBF6] font-sans relative overflow-hidden"
      style={isRtl ? { fontFamily: "var(--ui)", direction: "rtl" } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF6] to-[#F3EBDB] pointer-events-none" />

      <div className="relative z-10 max-w-[960px] mx-auto px-5 pt-28 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#4a1a1d]">
            {t("simulations.title")}
          </h1>
          <p className="text-[#6a4640]/80 text-sm mt-3 max-w-xl mx-auto">
            {t("simulations.subtitle")}
          </p>
        </div>

        <SimGrid initialSim={searchParams.get("sim")} />

        <div className="mt-5 p-3.5 bg-[#632024]/03 rounded-xl border border-[#632024]/10 text-center">
          <div className="text-xs text-[#6a4640]/85 leading-relaxed">
            {t("simulations.disclaimer")}
          </div>
        </div>
      </div>
    </div>
  );
}
