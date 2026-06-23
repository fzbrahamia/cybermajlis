"use client";
// ============================================================
// SIMULATIONS
// Standalone route for the 7 safe, hands-on malware demos.
// (Formerly the "Simulations" tab inside the games hub.)
// Reuses the existing `Hub.*` translation keys.
// ============================================================

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTrackView } from "@/hooks/useTrackView";
import { Bug, Ghost, Keyboard, Worm, Drama, Microscope, Lock, type LucideIcon } from "lucide-react";
import { SIM_MAP } from "./simMap";

const SIM_IDS = ["virus", "rootkit", "keylogger", "worm", "polymorphic", "metamorphic", "ransomware"] as const;
type SimId = (typeof SIM_IDS)[number];

const SIM_ICONS: Record<SimId, LucideIcon> = {
  virus:       Bug,
  rootkit:     Ghost,
  keylogger:   Keyboard,
  worm:        Worm,
  polymorphic: Drama,
  metamorphic: Microscope,
  ransomware:  Lock,
};

export default function SimulationsPage() {
  useTrackView("simulations");
  const t = useTranslations("Hub");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const SIM_TAGS: Record<SimId, string[]> = {
    virus:       t.raw("SimTags.virus"),
    rootkit:     t.raw("SimTags.rootkit"),
    keylogger:   t.raw("SimTags.keylogger"),
    worm:        t.raw("SimTags.worm"),
    polymorphic: t.raw("SimTags.polymorphic"),
    metamorphic: t.raw("SimTags.metamorphic"),
    ransomware:  t.raw("SimTags.ransomware"),
  };

  // ── Full-screen simulation (covers the navbar too) ─────────
  if (activeSimulation) {
    const SimComponent = SIM_MAP[activeSimulation];
    if (SimComponent) {
      return (
        <div className="fixed inset-0 z-[100] w-full h-full overflow-hidden bg-[#5C1E22]">
          <SimComponent onHome={() => setActiveSimulation(null)} />
          <button
            onClick={() => setActiveSimulation(null)}
            className="fixed top-3 left-3 z-[9999] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/70 border border-white/20 text-white text-xs font-bold backdrop-blur-sm hover:bg-black/90 transition-colors shadow-lg"
          >
            ← {t("simulations.back")}
          </button>
        </div>
      );
    }
    setActiveSimulation(null);
  }

  // ═══════════════════════════════════════════════════════════
  return (
    <div
      className="min-h-screen bg-[#5C1E22] font-sans relative overflow-hidden"
      style={isRtl ? { fontFamily: "var(--font-arabic), serif", direction: "rtl" } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#5C1E22] to-[#4F1A1B] pointer-events-none" />

      <div className="relative z-10 max-w-[960px] mx-auto px-5 pt-28 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#f5ede0]">
            {t("simulations.title")}
          </h1>
          <p className="text-[#f5ede0]/45 text-sm mt-3 max-w-xl mx-auto">
            {t("simulations.subtitle")}
          </p>
        </div>

        {/* Simulation grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SIM_IDS.map((simId) => {
            const isAvailable = !!SIM_MAP[simId];
            const SimIcon = SIM_ICONS[simId];
            return (
              <div
                key={simId}
                onClick={() => isAvailable && setActiveSimulation(simId)}
                className={`group bg-white/[.09] border border-white/10 rounded-2xl p-5 transition-all duration-300 ${
                  isAvailable
                    ? "cursor-pointer hover:-translate-y-1 hover:border-[#D5B893]/60 hover:shadow-2xl hover:shadow-black/25"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#D5B893]/12 border border-[#D5B893]/25 group-hover:animate-bounce" style={{ animationDuration: "1.5s" }}>
                    <SimIcon size={26} color="#D5B893" strokeWidth={1.7} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] px-2.5 py-1 rounded-lg bg-[#D5B893]/15 border border-[#D5B893]/20 text-[#D5B893] font-bold">
                      {t("simulations.badge")}
                    </span>
                    {isAvailable ? (
                      <span className="text-[8px] px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-semibold">
                        {t("simulations.launch")}
                      </span>
                    ) : (
                      <span className="text-[8px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#f5ede0]/30 font-semibold">
                        {t("simulations.coming_soon")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-lg font-extrabold text-[#f5ede0] mb-1">
                  {t(`simList.${simId}.name`)}
                </div>
                <div className="text-xs text-[#D5B893] font-semibold mb-2">
                  {t(`simList.${simId}.sub`)}
                </div>
                {isAvailable && (
                  <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-400 group-hover:max-h-48 group-hover:opacity-100 group-hover:mt-2.5">
                    <p className="text-[11px] text-[#f5ede0]/40 leading-relaxed">
                      {t(`simList.${simId}.desc`)}
                    </p>
                  </div>
                )}
                <div className="flex gap-1 flex-wrap mt-2">
                  {SIM_TAGS[simId].map((tag, j) => (
                    <span key={j} className="text-[9px] px-2 py-1 rounded-md bg-[#D5B893]/10 border border-[#D5B893]/15 text-[#D5B893] font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 p-3.5 bg-white/[.04] rounded-xl border border-white/5 text-center">
          <div className="text-xs text-[#f5ede0]/40 leading-relaxed">
            {t("simulations.disclaimer")}
          </div>
        </div>
      </div>
    </div>
  );
}
