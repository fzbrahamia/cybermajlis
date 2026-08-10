"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import SuperpositionCoinGame from "./SuperpositionCoinGame";
import QuantumCapsuleGame from "./QuantumCapsuleGame";
import HiddenKeySearchGame from "./HiddenKeySearchGame";
import ActualMazeSearchGame from "./ActualMazeSearchGame";
import { Q, INK, BODY, PAPER, display, bodyFont } from "./theme";
import styles from "./QuantumLessonGames.module.css";

type Props = {
  lessonOrder: number;
  onComplete?: () => void;
};

type GameMeta = {
  icon: string;
  en: string;
  ar: string;
  subEn: string;
  subAr: string;
};

const SUPERPOSITION: GameMeta[] = [
  { icon: "🪙", en: "Quantum Coin", ar: "العملة الكمّية", subEn: "Make it quantum, then measure it.", subAr: "حوّلها إلى حالة كمّية ثم قِسها." },
  { icon: "🧪", en: "Build a Qubit", ar: "ابنِ كيوبِت", subEn: "Load 0 and 1 into the quantum capsule.", subAr: "ضع ٠ و١ داخل الكبسولة الكمّية." },
];

const SEARCH: GameMeta[] = [
  { icon: "🗝️", en: "Find the Hidden Key", ar: "اعثر على المفتاح", subEn: "Compare normal and quantum search.", subAr: "قارن البحث العادي بالبحث الكمّي." },
  { icon: "🧩", en: "Escape the Maze", ar: "اخرج من المتاهة", subEn: "Explore the maze, then try quantum search.", subAr: "استكشف المتاهة ثم جرّب البحث الكمّي." },
];

export default function QuantumLessonGames({ lessonOrder, onComplete }: Props) {
  const isAR = useLocale() === "ar";
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<[boolean, boolean]>([false, false]);
  const fired = useRef(false);

  const metas = lessonOrder === 1 ? SEARCH : SUPERPOSITION;

  useEffect(() => {
    if (done[0] && done[1] && !fired.current) {
      fired.current = true;
      onComplete?.();
    }
  }, [done, onComplete]);

  const finishGame = (index: 0 | 1) => {
    setDone(current => {
      if (current[index]) return current;
      const next: [boolean, boolean] = [...current] as [boolean, boolean];
      next[index] = true;
      return next;
    });
  };

  if (lessonOrder !== 1 && lessonOrder !== 2) {
    return (
      <div className={styles.coming} style={{ fontFamily: bodyFont, color: BODY, background: PAPER }}>
        <span>🧪</span>
        {isAR ? "ألعاب هذا الدرس قيد التجهيز." : "The games for this lesson are being prepared."}
      </div>
    );
  }

  return (
    <section className={styles.wrap} style={{ fontFamily: bodyFont, color: INK }}>
      <div className={styles.topCard}>
        <div>
          <div className={styles.eyebrow} style={{ color: Q.deep }}>
            {isAR ? "وقت اللعب" : "PLAY LAB"}
          </div>
          <h2 style={{ fontFamily: display(isAR) }}>
            {lessonOrder === 1
              ? (isAR ? "تحديات البحث الكمّي 🔎" : "Quantum search challenges 🔎")
              : (isAR ? "جرّب السوبر بوزيشن بنفسك ✨" : "Play with superposition ✨")}
          </h2>
          <p>
            {isAR
              ? "أكمل اللعبتين لاعتبار المختبر منتهياً وفتح المحطة التالية."
              : "Finish both mini-games to complete the lab and unlock the next station."}
          </p>
        </div>

        <div className={styles.progressBubble} style={{ background: Q.tint, color: Q.deep }}>
          <strong>{Number(done[0]) + Number(done[1])}/2</strong>
          <small>{isAR ? "ألعاب" : "GAMES"}</small>
        </div>
      </div>

      <div className={styles.gamePicker}>
        {metas.map((meta, index) => {
          const selected = active === index;
          return (
            <button
              key={meta.en}
              className={`${styles.gameChoice} ${selected ? styles.gameChoiceOn : ""}`}
              style={{ borderColor: selected ? Q.mid : undefined, background: selected ? Q.tint : PAPER }}
              onClick={() => setActive(index)}
            >
              <span className={styles.gameIcon}>{done[index] ? "✅" : meta.icon}</span>
              <span className={styles.gameCopy}>
                <strong style={{ fontFamily: display(isAR) }}>{isAR ? meta.ar : meta.en}</strong>
                <small>{isAR ? meta.subAr : meta.subEn}</small>
              </span>
              <span className={styles.playTag} style={{ background: selected ? Q.deep : "rgba(17,26,21,.06)", color: selected ? "white" : BODY }}>
                {done[index] ? (isAR ? "تم" : "DONE") : selected ? (isAR ? "تلعب الآن" : "PLAYING") : (isAR ? "العب" : "PLAY")}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.gameStage}>
        {lessonOrder === 1 && active === 0 && <HiddenKeySearchGame onComplete={() => finishGame(0)} />}
        {lessonOrder === 1 && active === 1 && <ActualMazeSearchGame onComplete={() => finishGame(1)} />}
        {lessonOrder === 2 && active === 0 && <SuperpositionCoinGame onComplete={() => finishGame(0)} />}
        {lessonOrder === 2 && active === 1 && <QuantumCapsuleGame onComplete={() => finishGame(1)} />}
      </div>

      {done[active] && !(done[0] && done[1]) && (
        <div className={styles.successStrip} style={{ background: Q.tint, borderColor: `${Q.mid}55`, color: Q.deep }}>
          <span>⭐</span>
          <div>
            <strong>{isAR ? "أحسنت! أنهيت هذه اللعبة." : "Nice! You finished this game."}</strong>
            <small>{isAR ? "بقيت لعبة واحدة لإكمال المختبر." : "One more mini-game to complete the lab."}</small>
          </div>
          <button onClick={() => setActive(active === 0 ? 1 : 0)} style={{ background: Q.deep }}>
            {isAR ? "اللعبة التالية →" : "Next game →"}
          </button>
        </div>
      )}

      {done[0] && done[1] && (
        <div className={styles.allDone} style={{ background: Q.deep }}>
          <span className={styles.party}>🎉</span>
          <div>
            <strong style={{ fontFamily: display(isAR) }}>{isAR ? "اكتمل المختبر!" : "Lab complete!"}</strong>
            <p>{isAR ? "تم حفظ تقدّمك. المحطة التالية أصبحت جاهزة." : "Your progress is saved. The next station is ready."}</p>
          </div>
          <span className={styles.party}>⭐</span>
        </div>
      )}
    </section>
  );
}
