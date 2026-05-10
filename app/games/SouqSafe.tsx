"use client";
// ============================================================
// SOUQ SAFE — Drag & Drop Data Protection Game
// ============================================================

import { useState } from "react";
import { useTranslations } from "next-intl";
import { shuffle } from "../utils/helpers";
import { CHARS } from "../lib/characters";
import { GameShell, GameHeader, Intro, Result } from "@/components/GameShell";

interface SouqItem {
  text: string;
  safe: boolean;
  why: string;
}

const TOTAL_ROUNDS = 10;
const GAME_XP = 100;
const PASSING_SCORE = 7; // must get 7/10 to earn XP

export default function SouqSafe({ onHome }: { onHome: (xp?: number) => void }) {
  const t = useTranslations("SouqSafe");
  const SOUQ_ITEMS: SouqItem[] = t.raw("items");

  const [phase, setPhase]       = useState<"intro" | "play" | "done">("intro");
  const [items, setItems]       = useState<SouqItem[]>([]);
  const [current, setCurrent]   = useState(0);
  const [score, setScore]       = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; why: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [chest, setChest]       = useState<(SouqItem & { correct: boolean })[]>([]);
  const [cart, setCart]         = useState<(SouqItem & { correct: boolean })[]>([]);

  const start = () => {
    setItems(shuffle([...SOUQ_ITEMS]).slice(0, TOTAL_ROUNDS));
    setCurrent(0);
    setScore(0);
    setFeedback(null);
    setChest([]);
    setCart([]);
    setPhase("play");
  };

  const handleDrop = (zone: "safe" | "cart") => {
    if (feedback) return; // prevent double-tap
    const item = items[current];
    const correct = (zone === "safe" && item.safe) || (zone === "cart" && !item.safe);
    if (correct) setScore((s) => s + 1);
    if (zone === "safe") setChest((c) => [...c, { ...item, correct }]);
    else setCart((c) => [...c, { ...item, correct }]);
    setFeedback({ correct, why: item.why });
    setDragOver(null);
  };

  const next = () => {
    setFeedback(null);
    if (current + 1 >= TOTAL_ROUNDS) setPhase("done");
    else setCurrent((c) => c + 1);
  };

  const zones = [
    { zone: "safe" as const, label: t("zones.safe.label"), sub: t("zones.safe.sub") },
    { zone: "cart" as const, label: t("zones.cart.label"), sub: t("zones.cart.sub") },
  ];

  if (phase === "intro") {
    return (
      <GameShell>
        <Intro
          char={CHARS.oryx}
          title={t("intro.title")}
          lines={t.raw("intro.lines")}
          onStart={start}
        />
      </GameShell>
    );
  }

  if (phase === "done") {
    return (
      <GameShell>
        <Result
          score={score}
          total={TOTAL_ROUNDS}
          char={CHARS.oryx}
          title={t("result.title")}
          message={
            score >= 8
              ? t("result.excellent")
              : score >= PASSING_SCORE
              ? t("result.pass")
              : t("result.fail", { score: PASSING_SCORE })
          }
          onRestart={start}
          onHome={() => onHome(score >= PASSING_SCORE ? GAME_XP : 0)}
        />
      </GameShell>
    );
  }

  const item = items[current];

  return (
    <GameShell>
      <GameHeader
        name={t("title")}
        onBack={() => onHome(0)}
        score={score}
        round={current + 1}
        maxRound={TOTAL_ROUNDS}
      />

      <div className="px-6 py-6 max-w-2xl mx-auto">

        {/* ── Fixed-height interaction area — no jumping ── */}
        <div style={{ minHeight: 180 }} className="mb-6 flex flex-col items-center justify-center">
          {!feedback ? (
            /* Draggable item card */
            <div
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text", "item")}
              className="w-full bg-white border-2 border-stone-200 rounded-2xl px-6 py-8 text-center cursor-grab shadow-sm hover:shadow-md transition-shadow select-none animate-fade-in"
            >
              <div className="text-xs text-stone-400 mb-3 tracking-wide uppercase">{t("question")}</div>
              <div className="text-2xl font-bold text-stone-700">{item.text}</div>
              <div className="text-xs text-stone-400 mt-3">{t("dragHint")}</div>
            </div>
          ) : (
            /* Feedback — same height slot */
            <div className="w-full animate-fade-in">
              <div className={`text-center text-xl font-bold mb-3 ${feedback.correct ? "text-emerald-600" : "text-red-500"}`}>
                {feedback.correct ? t("correct") : t("wrong")}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 mb-4">
                <p className="text-base text-stone-600 leading-relaxed">{feedback.why}</p>
              </div>
              <div className="text-center">
                <button
                  onClick={next}
                  className="px-8 py-3 bg-[#632024] text-amber-50 rounded-xl text-sm font-bold cursor-pointer hover:-translate-y-0.5 transition-transform"
                >
                  {current + 1 >= TOTAL_ROUNDS ? t("seeResults") : t("next")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Drop zones — always visible below ── */}
        <div className="grid grid-cols-2 gap-4">
          {zones.map((z) => (
            <div
              key={z.zone}
              onDragOver={(e) => { e.preventDefault(); setDragOver(z.zone); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(z.zone)}
              onClick={() => !feedback && handleDrop(z.zone)}
              className={`rounded-2xl p-5 text-center border-2 border-dashed cursor-pointer transition-all min-h-[140px] ${
                dragOver === z.zone
                  ? "border-[#632024] bg-[#632024]/5 scale-[1.02]"
                  : "border-stone-200 bg-white/60 hover:border-stone-300"
              }`}
            >
              <div className="text-4xl mb-2">{z.label.split(" ")[0]}</div>
              <div className="text-base font-bold text-stone-700">{z.label.split(" ").slice(1).join(" ")}</div>
              <div className="text-sm text-stone-400 mt-1">{z.sub}</div>

              {/* Placed items */}
              {(z.zone === "safe" ? chest : cart).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 justify-center">
                  {(z.zone === "safe" ? chest : cart).map((it, j) => (
                    <span
                      key={j}
                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                        it.correct
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-red-50 text-red-500 border border-red-200"
                      }`}
                    >
                      {it.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}