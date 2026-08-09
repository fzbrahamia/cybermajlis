"use client";

// ============================================================
// SIM GRID
// The 7 safe, hands-on malware demos, as cards.
//
// Shared by /simulations and the Malware category page so both show the
// identical card. It also owns the full-screen launch, which means closing a
// simulation returns you to whichever page opened it rather than bouncing you
// to /simulations.
// ============================================================

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bug, Ghost, Keyboard, Worm, Drama, Microscope, Lock, type LucideIcon } from "lucide-react";
import { SIM_MAP } from "@/app/simulations/simMap";

export const SIM_IDS = ["virus", "rootkit", "keylogger", "worm", "polymorphic", "metamorphic", "ransomware"] as const;
export type SimId = (typeof SIM_IDS)[number];

export const SIM_ICONS: Record<SimId, LucideIcon> = {
  virus:       Bug,
  rootkit:     Ghost,
  keylogger:   Keyboard,
  worm:        Worm,
  polymorphic: Drama,
  metamorphic: Microscope,
  ransomware:  Lock,
};

export default function SimGrid({
  ids = [...SIM_IDS],
  initialSim = null,
  backLabel,
}: {
  /** Which simulations to show. Defaults to all of them. */
  ids?: string[];
  /** Opens straight into this simulation, for /simulations?sim=<id> links. */
  initialSim?: string | null;
  /**
   * What the close button says. Closing returns to the page that opened the
   * simulation, so the label has to name that page: "Simulations" is only
   * right when the grid is on /simulations.
   */
  backLabel?: string;
}) {
  const t = useTranslations("Hub");
  const router = useRouter();
  const pathname = usePathname();

  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (initialSim && SIM_MAP[initialSim]) setActiveSimulation(initialSim);
  }, [initialSim]);

  // Stop the page behind the simulation from scrolling under it.
  useEffect(() => {
    if (!activeSimulation) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [activeSimulation]);

  const close = () => {
    setActiveSimulation(null);
    // Drop ?sim= so a later back/forward doesn't silently relaunch it.
    if (initialSim) router.replace(pathname);
  };

  // ── Full-screen simulation ─────────────────────────────────
  // Portalled to <body>. The pages that host this grid wrap their content in
  // positioned, z-indexed containers, and a fixed element inside one of those
  // is trapped in its stacking context: the navbar would paint over the
  // simulation and hide the back button. Rendering at the top level avoids
  // depending on whatever the host page's layering happens to be.
  if (activeSimulation) {
    const SimComponent = SIM_MAP[activeSimulation];
    if (SimComponent) {
      if (!mounted) return null;
      return createPortal(
        <div className="fixed inset-0 z-[100] w-full h-full overflow-hidden bg-[#5C1E22]">
          <SimComponent onHome={close} />
          <button
            onClick={close}
            className="fixed top-3 right-3 z-[9999] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/70 border border-white/20 text-white text-xs font-bold backdrop-blur-sm hover:bg-black/90 transition-colors shadow-lg"
          >
            ← {backLabel ?? t("simulations.back")}
          </button>
        </div>,
        document.body,
      );
    }
    setActiveSimulation(null);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {ids.map((simId) => {
        const isAvailable = !!SIM_MAP[simId];
        const SimIcon = SIM_ICONS[simId as SimId];
        const tags = (t.raw(`SimTags.${simId}`) ?? []) as string[];
        return (
          <div
            key={simId}
            onClick={() => isAvailable && setActiveSimulation(simId)}
            className={`group bg-[#FBF4E8] border border-[#632024]/12 rounded-2xl p-5 shadow-sm transition-all duration-300 ${
              isAvailable
                ? "cursor-pointer hover:-translate-y-1 hover:border-[#632024]/35 hover:shadow-2xl hover:shadow-[#632024]/12"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#632024]/12 border border-[#632024]/25 group-hover:animate-bounce" style={{ animationDuration: "1.5s" }}>
                {SimIcon && <SimIcon size={26} color="#632024" strokeWidth={1.7} />}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] px-2.5 py-1 rounded-lg bg-[#632024]/15 border border-[#632024]/20 text-[#632024] font-bold">
                  {t("simulations.badge")}
                </span>
                {isAvailable ? (
                  <span className="text-[8px] px-2 py-0.5 rounded-md bg-[#632024]/10 border border-[#632024]/22 text-[#8B2635] font-semibold">
                    {t("simulations.launch")}
                  </span>
                ) : (
                  <span className="text-[8px] px-2 py-0.5 rounded-md bg-[#632024]/04 border border-[#632024]/12 text-[#6a4640]/55 font-semibold">
                    {t("simulations.coming_soon")}
                  </span>
                )}
              </div>
            </div>
            <div className="text-lg font-extrabold text-[#4a1a1d] mb-1">
              {t(`simList.${simId}.name`)}
            </div>
            <div className="text-xs text-[#632024] font-semibold mb-2">
              {t(`simList.${simId}.sub`)}
            </div>
            {isAvailable && (
              <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-400 group-hover:max-h-48 group-hover:opacity-100 group-hover:mt-2.5">
                <p className="text-[11px] text-[#6a4640]/85 leading-relaxed">
                  {t(`simList.${simId}.desc`)}
                </p>
              </div>
            )}
            <div className="flex gap-1 flex-wrap mt-2">
              {tags.map((tag, j) => (
                <span key={j} className="text-[9px] px-2 py-1 rounded-md bg-[#632024]/10 border border-[#632024]/15 text-[#632024] font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
