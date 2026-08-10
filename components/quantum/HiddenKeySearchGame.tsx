"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HiddenKeySearchGame.module.css";
import { Atom } from "lucide-react";
import { Box, Eye, KeyRound, Laptop, RotateCcw } from "lucide-react";

type Mode = "normal" | "quantum";
type Stage = "choose" | "play" | "boosting" | "readyToMeasure" | "done";

const TOTAL = 16;
const BEST_BOOSTS = 3;

/**
 * Grover success probability after k rounds on N items:
 *   sin²((2k + 1) · arcsin(1/√N))
 * For N = 16, k = 3 this is 0.9613. So the search misses about one run in
 * twenty five, and the child has to run it again. That is the whole point:
 * the lesson board promises "the most likely key, not a certain one", and a
 * game that always succeeds teaches the opposite.
 */
const successChance = (n: number, k: number) =>
  Math.sin((2 * k + 1) * Math.asin(1 / Math.sqrt(n))) ** 2;

const P_SUCCESS = successChance(TOTAL, BEST_BOOSTS);

export default function HiddenKeySearchGame({ onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [stage, setStage] = useState<Stage>("choose");
  const [target, setTarget] = useState(() => Math.floor(Math.random() * TOTAL));
  const [opened, setOpened] = useState<number[]>([]);
  const [boostRound, setBoostRound] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [message, setMessage] = useState("Choose a computer to start!");
  const [showWhy, setShowWhy] = useState(false);
  const [missed, setMissed] = useState(false);
  const [runs, setRuns] = useState(1);
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
    setMissed(false);
    setRuns(1);
  };

  const choose = (m: Mode) => {
    clearTimers();
    setMode(m);
    setStage("play");
    setOpened([]);
    setBoostRound(0);
    setMessage(
      m === "normal"
        ? "Open boxes one by one"
        : "16 hiding places → about 3 quantum boost rounds."
    );
  };

  const openBox = (i: number) => {
    if (mode !== "normal" || stage !== "play" || opened.includes(i)) return;

    const next = [...opened, i];
    setOpened(next);

    if (i === target) {
      setStage("done");
      setMessage(`Found it in ${next.length} tries.`);
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
    setMessage("Quantum search started");

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
      setMessage("The signal is ready. Now you decide when to reveal it.");
    }, BEST_BOOSTS * 950);

    timers.current.push(doneId);
  };

  const measure = () => {
    if (mode !== "quantum" || stage !== "readyToMeasure") return;

    // Sample honestly. Most of the time the boosted answer wins; sometimes it
    // does not, and that is the fact we are here to teach.
    const hit = Math.random() < P_SUCCESS;
    if (hit) {
      setOpened([target]);
      setStage("done");
      setMissed(false);
      setMessage("Measurement revealed the key.");
      onComplete?.();
      return;
    }

    const wrong = [...Array(TOTAL).keys()].filter(i => i !== target);
    const pick = wrong[Math.floor(Math.random() * wrong.length)];
    setOpened([pick]);
    setMissed(true);
    setStage("done");
    setMessage("That box was empty. The boosted answer is the likely one, not a certain one.");
    // The lab still counts as done: getting a miss and understanding why is
    // the lesson, not a failure to be punished.
    onComplete?.();
  };

  /** Run the whole circuit again, the way a real machine would. */
  const runAgain = () => {
    clearTimers();
    setOpened([]);
    setBoostRound(0);
    setMissed(false);
    setRuns(r => r + 1);
    setStage("play");
    setMessage("Running the search again.");
  };

  return (
    <section className={styles.lab}>
      <header className={styles.header}>
        <div>
          <span className={styles.badge}>SEARCH GAME 1</span>
          <h1>Find the Hidden Key</h1>
          <p>One of 16 boxes has the key.</p>
        </div>
        <button className={styles.smallButton} onClick={reset}><RotateCcw size={13} aria-hidden /> Restart</button>
      </header>

      {stage === "choose" ? (
        <div className={styles.choose}>
          <h2>How do you want to search?</h2>
          <div className={styles.choiceGrid}>
            <button className={styles.choice} onClick={() => choose("normal")}>
              <span className={styles.icon}><Laptop size={22} aria-hidden /></span>
              <strong>Normal Search</strong>
              <small>Check one box at a time</small>
              <span className={styles.play}>PLAY</span>
            </button>

            <button className={`${styles.choice} ${styles.quantum}`} onClick={() => choose("quantum")}>
              <span className={styles.icon}><Atom size={18} aria-hidden /></span>
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
                    {found ? <KeyRound size={20} aria-hidden /> : openedNow ? null : <Box size={20} aria-hidden />}
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
                {showWhy ? "Hide explanation" : "Why 3 rounds?"}
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
                  <Atom size={15} aria-hidden /> START 3-ROUND SEARCH
                </button>
              )}

              {stage === "boosting" && (
                <div className={styles.runningText}>Watch all boxes — none of them gives away the answer.</div>
              )}

              {stage === "readyToMeasure" && (
                <button className={styles.secondary} onClick={measure}>
                  <Eye size={14} aria-hidden /> MEASURE
                </button>
              )}

              <div className={styles.tip}>
                The 3 rounds happen automatically. Your job is to start the search, watch the build-up, then choose when to measure.
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className={styles.finish}>
              <h2>{missed ? "Empty box" : "Mission complete"}</h2>
              <p>
                {mode === "normal"
                  ? `Normal search checked ${opened.length} box${opened.length === 1 ? "" : "es"}.`
                  : missed
                    ? `Run ${runs}: the measurement landed on the wrong box. Run it again.`
                    : `Quantum search used ${BEST_BOOSTS} boost rounds${runs > 1 ? ` across ${runs} runs` : ""}, then one measurement.`}
              </p>
              <div className={styles.tip}>
                After {BEST_BOOSTS} rounds the right box has about a{" "}
                <strong>{Math.round(P_SUCCESS * 100)}% chance</strong> of being the one you measure.
                So roughly one run in {Math.round(1 / (1 - P_SUCCESS))} comes up empty, and you simply
                run it again. That is why a real machine is run more than once and the answer checked.
              </div>
              <div className={styles.actions}>
                {mode === "quantum" && missed && (
                  <button className={styles.primary} onClick={runAgain}>Run it again</button>
                )}
                <button className={styles.again} onClick={reset}>Try the other computer</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
