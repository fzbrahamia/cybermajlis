"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HiddenKeySearchGame.module.css";

type Mode = "normal" | "quantum";
type Stage = "choose" | "play" | "boosting" | "readyToMeasure" | "done";

const TOTAL = 16;
const BEST_BOOSTS = 3;

export default function HiddenKeySearchGame({ onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [stage, setStage] = useState<Stage>("choose");
  const [target, setTarget] = useState(() => Math.floor(Math.random() * TOTAL));
  const [opened, setOpened] = useState<number[]>([]);
  const [boostRound, setBoostRound] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [message, setMessage] = useState("Choose a computer to start!");
  const [showWhy, setShowWhy] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => timers.current.forEach((id) => window.clearTimeout(id));
  }, []);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const reset = () => {
    clearTimers();
    setMode(null);
    setStage("choose");
    setTarget(Math.floor(Math.random() * TOTAL));
    setOpened([]);
    setBoostRound(0);
    setPulse(false);
    setMessage("Choose a computer to start!");
    setShowWhy(false);
  };

  const choose = (m: Mode) => {
    clearTimers();
    setMode(m);
    setStage("play");
    setOpened([]);
    setBoostRound(0);
    setMessage(
      m === "normal"
        ? "Open boxes one by one 🔎"
        : "16 hiding places → about 3 quantum boost rounds."
    );
  };

  const openBox = (i: number) => {
    if (mode !== "normal" || stage !== "play" || opened.includes(i)) return;

    const next = [...opened, i];
    setOpened(next);

    if (i === target) {
      setStage("done");
      setMessage(`Found it in ${next.length} tries! 🎉`);
      onComplete?.();
    } else {
      setMessage("Not here — try another box!");
    }
  };

  const startQuantumSearch = () => {
    if (mode !== "quantum" || stage !== "play") return;

    clearTimers();
    setStage("boosting");
    setBoostRound(0);
    setMessage("Quantum search started ✨");

    for (let round = 1; round <= BEST_BOOSTS; round++) {
      const startId = window.setTimeout(() => {
        setBoostRound(round);
        setPulse(true);
        setMessage(`Boosting the hidden answer... ${round}/${BEST_BOOSTS}`);
      }, (round - 1) * 950);

      const stopId = window.setTimeout(() => {
        setPulse(false);
      }, (round - 1) * 950 + 560);

      timers.current.push(startId, stopId);
    }

    const doneId = window.setTimeout(() => {
      setPulse(false);
      setStage("readyToMeasure");
      setMessage("The signal is ready. Now you decide when to reveal it 👀");
    }, BEST_BOOSTS * 950);

    timers.current.push(doneId);
  };

  const measure = () => {
    if (mode !== "quantum" || stage !== "readyToMeasure") return;
    setOpened([target]);
    setStage("done");
    setMessage("Measurement revealed the key! 🗝️");
    onComplete?.();
  };

  return (
    <section className={styles.lab}>
      <header className={styles.header}>
        <div>
          <span className={styles.badge}>SEARCH GAME 1</span>
          <h1>Find the Hidden Key 🗝️</h1>
          <p>One of 16 boxes has the key.</p>
        </div>
        <button className={styles.smallButton} onClick={reset}>↻ Restart</button>
      </header>

      {stage === "choose" ? (
        <div className={styles.choose}>
          <h2>How do you want to search?</h2>
          <div className={styles.choiceGrid}>
            <button className={styles.choice} onClick={() => choose("normal")}>
              <span className={styles.icon}>💻</span>
              <strong>Normal Search</strong>
              <small>Check one box at a time</small>
              <span className={styles.play}>PLAY</span>
            </button>

            <button className={`${styles.choice} ${styles.quantum}`} onClick={() => choose("quantum")}>
              <span className={styles.icon}>⚛️</span>
              <strong>Quantum Search</strong>
              <small>Boost the answer, then measure</small>
              <span className={styles.play}>PLAY</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.status}>{message}</div>

          <div className={pulse ? `${styles.board} ${styles.pulseAll}` : styles.board}>
            {Array.from({ length: TOTAL }, (_, i) => {
              const openedNow = opened.includes(i);
              const found = openedNow && i === target;

              return (
                <button
                  key={i}
                  className={`${styles.tile} ${openedNow ? styles.opened : ""} ${found ? styles.found : ""}`}
                  onClick={() => openBox(i)}
                  disabled={mode !== "normal" || stage === "done"}
                >
                  <span className={styles.tileIcon}>
                    {found ? "🗝️" : openedNow ? "⬜" : "📦"}
                  </span>
                  <small>Box {i + 1}</small>
                </button>
              );
            })}
          </div>

          {mode === "quantum" && (stage === "play" || stage === "boosting" || stage === "readyToMeasure") && (
            <div className={styles.quantumPanel}>
              <div className={styles.mathHint}>
                <span>16 choices</span>
                <span className={styles.arrow}>→</span>
                <strong>about 3 boost rounds</strong>
              </div>

              <button
                className={styles.whyButton}
                onClick={() => setShowWhy((value) => !value)}
              >
                {showWhy ? "Hide explanation ↑" : "Why 3? 🤔"}
              </button>

              {showWhy && (
                <div className={styles.whyCard}>
                  <strong>Why about 3 rounds?</strong>
                  <p>
                    The number of rounds depends on how many places we are searching.
                    With 16 possibilities, a Grover-style search reaches its strongest
                    point after about 3 rounds.
                  </p>
                  <div className={styles.simpleScale}>
                    <span>Too few</span>
                    <b>→</b>
                    <span className={styles.bestPoint}>Best point: ~3</span>
                    <b>→</b>
                    <span>Too many</span>
                  </div>
                  <small>
                    Too few rounds: the correct answer is not strong enough yet.
                    Too many: the probability can begin to fall again.
                  </small>
                  <details className={styles.moreDetails}>
                    <summary>Learn more</summary>
                    <p>
                      A common estimate is (π/4) × √N. For N = 16, that is about
                      3.14, so we use about 3 rounds.
                    </p>
                  </details>
                </div>
              )}

              <div className={styles.boostRow}>
                {Array.from({ length: BEST_BOOSTS }, (_, i) => (
                  <span key={i} className={i < boostRound ? styles.on : ""} />
                ))}
              </div>

              {stage === "play" && (
                <button className={styles.primary} onClick={startQuantumSearch}>
                  ⚛️ START 3-ROUND SEARCH
                </button>
              )}

              {stage === "boosting" && (
                <div className={styles.runningText}>Watch all boxes — none of them gives away the answer.</div>
              )}

              {stage === "readyToMeasure" && (
                <button className={styles.secondary} onClick={measure}>
                  👀 MEASURE
                </button>
              )}

              <div className={styles.tip}>
                The 3 rounds happen automatically. Your job is to start the search, watch the build-up, then choose when to measure.
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className={styles.finish}>
              <h2>Mission complete! ⭐</h2>
              <p>
                {mode === "normal"
                  ? `Normal search checked ${opened.length} box${opened.length === 1 ? "" : "es"}.`
                  : `Quantum search used ${BEST_BOOSTS} boost rounds, then one measurement.`}
              </p>
              <div className={styles.tip}>
                💡 With 16 possibilities, a Grover-style search reaches its best point after about 3 rounds.
              </div>
              <button className={styles.again} onClick={reset}>Play Again 🎮</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
