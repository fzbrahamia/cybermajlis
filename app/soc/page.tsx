// app/soc/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// Disable SSR — LiveSoc reads sessionStorage/localStorage on init,
// which causes hydration mismatches if server-rendered.
const LiveSoc = dynamic(() => import("@/components/live_soc"), { ssr: false });

export default function SocPage() {
  const router = useRouter();
  const t = useTranslations("SOC");

  return (
    <>
      <style>{`
        nav { display: none !important; }
        body { padding-top: 0 !important; }
      `}</style>
      <div className="relative w-full h-screen overflow-hidden">
        <LiveSoc />
        <button
          onClick={() => router.back()}
          className="cursor-pointer fixed top-3 left-3 z-[9999] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/70 border border-white/20 text-white text-xs font-bold backdrop-blur-sm hover:bg-black/90 transition-colors shadow-lg"
        >
          {t("back")}
        </button>
      </div>
    </>
  );
}