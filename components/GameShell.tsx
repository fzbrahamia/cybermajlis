// ============================================================
// GAME SHELL — Shared components for all games
// GameShell: background wrapper
// GameHeader: top bar with score, round, timer, lives
// Intro: multi-step character dialogue before game starts
// Result: end screen with score, stars, and restart
// ============================================================

import { useState } from "react";
import type { Character } from "@/app/lib/characters";
import { useTranslations, useLocale } from "next-intl";

// ── Props ──
interface GameShellProps {
  children: React.ReactNode;
  light?: boolean;
}

interface GameHeaderProps {
  name: string;
  onBack: () => void;
  score?: number;
  round?: number | string;
  maxRound?: number | string;
  timer?: number | null;
  maxTimer?: number;
  lives?: number;
  maxLives?: number;
}

interface IntroProps {
  char: Character;
  title: string;
  lines: string[];     // Each element = one dialogue step
  onStart: () => void;
}

interface ResultProps {
  score: number;
  total: number;
  char: Character;
  title: string;
  message: string;
  onRestart: () => void;
  onHome: () => void;
}

// ── GameShell: background wrapper ──
export function GameShell({ children, light = true }: GameShellProps) {
  return (
    <div className={`min-h-screen font-sans ${light ? "bg-amber-50" : "bg-[#3a1012]"}`}>
      {children}
    </div>
  );
}

// ── GameHeader: top bar during gameplay ──
export function GameHeader({
  name, onBack, score = 0, round, maxRound, timer, maxTimer, lives, maxLives,
}: GameHeaderProps) {
  const t = useTranslations("GameShell");
  const locale = useLocale();
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200/20 bg-white/50 backdrop-blur-sm">
      {/* Left: back button + game name */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-600 text-lg cursor-pointer">{locale === "ar" ? "→" : "←"}</button>
        <div>
          <div className="text-sm font-bold text-stone-700">{name}</div>
          {round && <div className="text-[10px] text-stone-400">{t("round")} {round}/{maxRound}</div>}
        </div>
      </div>

      {/* Right: timer, lives, score */}
      <div className="flex items-center gap-4">
        {/* Timer bar */}
        {timer != null && maxTimer && (
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${timer / maxTimer < 0.25 ? "bg-red-500" : "bg-amber-500"}`}
                style={{ width: `${Math.max(0, (timer / maxTimer) * 100)}%` }}
              />
            </div>
            <span className={`font-mono text-xs font-semibold ${timer / maxTimer < 0.25 ? "text-red-500 animate-pulse" : "text-stone-400"}`}>
              {timer}s
            </span>
          </div>
        )}

        {/* Lives */}
        {lives != null && maxLives && (
          <div className="flex gap-0.5">
            {Array.from({ length: maxLives }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full border transition-all ${
                  i < lives
                    ? "bg-red-500 border-red-500 scale-100"
                    : "bg-stone-200 border-stone-300 scale-75"
                }`}
              />
            ))}
          </div>
        )}

        {/* Score */}
        <span className="font-mono text-lg font-bold text-[#632024]">{score}</span>
      </div>
    </div>
  );
}

// ── Intro: multi-step character dialogue ──
export function Intro({ char, title, lines, onStart }: IntroProps) {
  const [step, setStep] = useState(0);
  const isLast = step >= lines.length - 1;
  const t = useTranslations("GameShell");

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      {/* Character emoji with floating animation */}
      <div className="text-7xl mb-1 animate-bounce" style={{ animationDuration: "3s" }}>
        {char.profile ? <img src={char.profile} style={{ width: 60, height: 65, objectFit: "cover", borderRadius: "50%" }} alt={char.name} className="w-full h-full object-cover rounded-full" /> : char.emoji}
      </div>

      {/* Game title */}
      <h2 className="font-serif text-3xl font-semibold text-stone-700 mb-1">{title}</h2>

      {/* Speech bubble with triangle pointer */}
      <div className="relative max-w-md mt-4 mb-5">
        {/* Triangle */}
        <div className="w-0 h-0 mx-auto border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-stone-200" />
        {/* Bubble */}
        <div className="bg-white border-2 border-stone-200 rounded-2xl px-6 py-5 shadow-sm min-h-[60px]">
          <div key={step} className="text-stone-500 text-sm leading-relaxed animate-fade-in">
            {lines[step]}
          </div>
        </div>
      </div>

      {/* Step dots */}
      {lines.length > 1 && (
        <div className="flex gap-1.5 mb-4">
          {lines.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i <= step ? "bg-[#632024]" : "bg-stone-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Next or Play button */}
      {isLast ? (
        <button
          onClick={onStart}
          className="px-10 py-3.5 bg-[#632024] text-amber-50 rounded-xl text-base font-bold shadow-lg hover:-translate-y-0.5 transition-transform cursor-pointer"
        >
          {t("start")}
        </button>
      ) : (
        <button
          onClick={() => setStep((s) => s + 1)}
          className="px-8 py-3 bg-white border-2 border-stone-200 rounded-xl text-stone-600 text-sm font-semibold hover:border-stone-300 transition-colors cursor-pointer"
        >
          {t("next")}
        </button>
      )}
    </div>
  );
}

// ── Result: end screen with score ──
export function Result({ score, total, char, title, message, onRestart, onHome }: ResultProps) {
  const pct = Math.round((score / Math.max(total, 1)) * 100);
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
  const t = useTranslations("GameShell");

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      {/* Character */}
      <div className="text-6xl mb-3"><img src={char.profile} style={{ width: 60, height: 65, objectFit: "cover", borderRadius: "50%" }} alt={char.name} className="w-full h-full object-cover" /></div>

      {/* Title */}
      <h2 className="font-serif text-2xl text-stone-700 italic mb-2">{title}</h2>

      {/* Stars */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`text-2xl transition-all ${s <= stars ? "opacity-100 scale-100" : "opacity-20 scale-75"}`}
          >
            ⭐
          </span>
        ))}
      </div>

      {/* Score */}
      <div className="font-mono text-4xl font-bold text-[#632024] mb-2">{score}</div>
      <div className="text-xs text-stone-400 mb-4">{t("outOf")} {total}</div>

      {/* Message */}
      <p className="text-sm text-stone-500 max-w-md leading-relaxed mb-6">{message}</p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="px-6 py-2.5 bg-[#632024] text-amber-50 rounded-xl text-sm font-bold cursor-pointer hover:-translate-y-0.5 transition-transform"
        >
          {t("playAgain")}
        </button>
        <button
          onClick={onHome}
          className="px-6 py-2.5 bg-white border-2 border-stone-200 rounded-xl text-stone-500 text-sm cursor-pointer hover:border-stone-300 transition-colors"
        >
          {t("allGames")}
        </button>
      </div>
    </div>
  );
}
