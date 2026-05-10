// app/soc/page.tsx
"use client";

import LiveSoc from "@/components/live_soc";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function SocPage() {
  const router = useRouter();
  const t = useTranslations("SOC");
  const [showIntro, setShowIntro] = useState(true);

  const tips = t.raw("intro.tips") as string[];

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

        {showIntro && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm" style={{ background: "rgba(62,19,22,0.85)" }}>
            <div className="relative max-w-lg w-full mx-4 rounded-2xl p-8" style={{ background: "linear-gradient(135deg, #3e1316 0%, #632024 60%, #7a1e22 100%)", border: "1px solid rgba(197,165,126,0.3)", boxShadow: "0 25px 50px rgba(62,19,22,0.6)" }}>
              <div className="mb-1 text-xs font-bold tracking-widest uppercase" style={{ color: "#c5a57e" }}>
                {t("intro.title")}
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "#E3DAC9" }}>
                {t("intro.body")}
              </p>
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#c5a57e" }}>
                  {t("intro.watchFor")}
                </p>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: "#E3DAC9" }}>
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: "#c5a57e" }} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-5 text-sm italic" style={{ color: "#d4c5b0" }}>
                {t("intro.goal")}
              </p>
              <button
                onClick={() => setShowIntro(false)}
                className="mt-6 w-full py-2.5 rounded-lg cursor-pointer font-bold text-sm tracking-wide transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #c5a57e, #E8D4BC)", color: "#3e1316" }}
              >
                {t("intro.cta")}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
