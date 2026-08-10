"use client";

import { useState } from "react";
import styles from "./SuperpositionCoinGame.module.css";

type Stage = "intro" | "classical" | "quantum" | "measured";
type Result = 0 | 1;

export default function SuperpositionCoinGame({ onComplete }: { onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [result, setResult] = useState<Result>(0);
  const [history, setHistory] = useState<Result[]>([]);

  const reset = () => {
    setStage("intro");
    setResult(0);
    setHistory([]);
  };

  const makeQuantum = () => {
    setStage("quantum");
  };

  const measure = () => {
    const next = (Math.random() < 0.5 ? 0 : 1) as Result;
    setResult(next);
    setHistory((old) => [...old, next]);
    setStage("measured");
    onComplete?.();
  };

  const tryAgain = () => {
    setStage("classical");
  };

  return (
    <section className={styles.lab}>
      <header className={styles.header}>
        <div>
          <span className={styles.badge}>SUPERPOSITION GAME 1</span>
          <h1>Quantum Coin 🪙</h1>
          <p>See what changes when a normal bit becomes a qubit.</p>
        </div>
        <button className={styles.reset} onClick={reset}>
          ↻ Restart
        </button>
      </header>

      <div className={styles.card}>
        {stage === "intro" && (
          <div className={styles.center}>
            <div className={styles.hero}>🪙</div>
            <h2>Normal bit vs quantum bit</h2>
            <p className={styles.prompt}>
              A normal bit is one value: 0 or 1. A qubit can hold a combination
              of both possibilities before we measure it.
            </p>
            <button className={styles.main} onClick={() => setStage("classical")}>
              Start Experiment 🚀
            </button>
          </div>
        )}

        {stage === "classical" && (
          <div className={styles.center}>
            <span className={styles.stepPill}>STEP 1 · NORMAL BIT</span>
            <p className={styles.prompt}>Right now the bit has one clear value:</p>

            <div className={styles.bit}>0</div>

            <div className={styles.smallLesson}>
              Normal bit = <strong>one value at a time</strong>.
            </div>

            <button className={styles.main} onClick={makeQuantum}>
              ✨ MAKE IT QUANTUM
            </button>
          </div>
        )}

        {stage === "quantum" && (
          <div className={styles.center}>
            <span className={styles.stepPill}>STEP 2 · SUPERPOSITION</span>
            <p className={styles.prompt}>
              Before measuring, both 0 and 1 are part of the quantum state.
            </p>

            <div className={styles.quantumCoin}>
              <span>0</span>
              <b>+</b>
              <span>1</span>
            </div>

            <div className={styles.smallLesson}>
              Qubit before measurement = <strong>0 and 1 possibilities together</strong>.
            </div>

            <button className={styles.measure} onClick={measure}>
              👀 MEASURE
            </button>
          </div>
        )}

        {stage === "measured" && (
          <div className={styles.center}>
            <span className={styles.stepPill}>STEP 3 · MEASUREMENT</span>
            <p className={styles.prompt}>After measuring, we get one result:</p>

            <div className={`${styles.bit} ${styles.pop}`}>{result}</div>

            <h2>{result === 0 ? "You measured 0 🎯" : "You measured 1 🎯"}</h2>

            <div className={styles.takeaway}>
              💡 <strong>Big idea:</strong> Before measurement, a qubit can hold
              a combination of 0 and 1. After measurement, we see one result:
              0 or 1.
            </div>

            <button className={styles.main} onClick={tryAgain}>
              Try Again
            </button>

            {history.length > 0 && (
              <div className={styles.historyArea}>
                <strong>Your measurements</strong>
                <div className={styles.history}>
                  {history.slice(-12).map((value, index) => (
                    <span key={`${value}-${index}`}>{value}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
