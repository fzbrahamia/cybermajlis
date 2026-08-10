"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ActualMazeSearchGame.module.css";

type Mode = "classical" | "quantum";
type Stage = "choose" | "play" | "boosting" | "readyToMeasure" | "revealing" | "done";
type Pos = [number, number];

const SIZE = 7;
const START: Pos = [6, 0];
const EXIT: Pos = [0, 6];
const BEST_BOOSTS = 2;

// Open cells create a real maze with branches/dead ends.
const OPEN: Pos[] = [
  [6,0],[5,0],[4,0],[4,1],[4,2],[5,2],[6,2],[6,3],
  [3,2],[2,2],[2,1],[1,1],[1,0],                 // branch/dead end
  [2,3],[2,4],[3,4],[4,4],[4,3],                 // branch
  [1,4],[0,4],[0,5],[0,6],                       // winning route
  [1,5],[2,5],[2,6],[3,6],[4,6],[5,6],[6,6],   // long branch
];

const SAFE_PATH: Pos[] = [
  [6,0],[5,0],[4,0],[4,1],[4,2],[3,2],[2,2],[2,3],
  [2,4],[1,4],[0,4],[0,5],[0,6],
];

const keyOf = ([r,c]: Pos) => `${r}-${c}`;
const OPEN_SET = new Set(OPEN.map(keyOf));
const SAFE_SET = new Set(SAFE_PATH.map(keyOf));

export default function ActualMazeSearchGame({ onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [stage, setStage] = useState<Stage>("choose");
  const [robot, setRobot] = useState<Pos>(START);
  const [trail, setTrail] = useState<Set<string>>(new Set([keyOf(START)]));
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState("Choose a search style!");
  const [boostRound, setBoostRound] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [showWhy, setShowWhy] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const reset = () => {
    clearTimers();
    setMode(null);
    setStage("choose");
    setRobot(START);
    setTrail(new Set([keyOf(START)]));
    setMoves(0);
    setMessage("Choose a search style!");
    setBoostRound(0);
    setPulse(false);
    setRevealIndex(-1);
    setShowWhy(false);
  };

  const choose = (m: Mode) => {
    clearTimers();
    setMode(m);
    setStage("play");
    setRobot(START);
    setTrail(new Set([keyOf(START)]));
    setMoves(0);
    setBoostRound(0);
    setRevealIndex(-1);
    setMessage(
      m === "classical"
        ? "You are the classical computer. Move the robot and explore the maze!"
        : "Quantum mode compares prepared route possibilities before measurement."
    );
  };

  const move = (dr: number, dc: number) => {
    if (mode !== "classical" || stage !== "play") return;

    const next: Pos = [robot[0] + dr, robot[1] + dc];
    const inside = next[0] >= 0 && next[0] < SIZE && next[1] >= 0 && next[1] < SIZE;

    if (!inside || !OPEN_SET.has(keyOf(next))) {
      setMessage("Wall! 🧱 Try a different direction.");
      return;
    }

    setRobot(next);
    setMoves((m) => m + 1);
    setTrail((old) => {
      const updated = new Set(old);
      updated.add(keyOf(next));
      return updated;
    });

    if (keyOf(next) === keyOf(EXIT)) {
      setStage("done");
      setMessage("You found the exit! 🏁");
      onComplete?.();
    } else {
      setMessage("Keep exploring… 🔎");
    }
  };

  const restartPosition = () => {
    setRobot(START);
    setTrail(new Set([keyOf(START)]));
    setMoves(0);
    setMessage("Back at START. Try another route.");
  };

  const startQuantum = () => {
    if (mode !== "quantum" || stage !== "play") return;

    setStage("boosting");
    setBoostRound(0);
    setMessage("Quantum route search started ✨");

    for (let round = 1; round <= BEST_BOOSTS; round++) {
      const a = window.setTimeout(() => {
        setBoostRound(round);
        setPulse(true);
        setMessage(`Boosting route possibilities… ${round}/${BEST_BOOSTS}`);
      }, (round - 1) * 1000);

      const b = window.setTimeout(() => setPulse(false), (round - 1) * 1000 + 620);
      timers.current.push(a, b);
    }

    const done = window.setTimeout(() => {
      setPulse(false);
      setStage("readyToMeasure");
      setMessage("Ready. Measure to reveal one route.");
    }, BEST_BOOSTS * 1000);

    timers.current.push(done);
  };

  const measure = () => {
    if (mode !== "quantum" || stage !== "readyToMeasure") return;

    setStage("revealing");
    setRevealIndex(0);
    setMessage("Measurement selected the safe route. Follow the robot! 🤖");

    SAFE_PATH.forEach((pos, index) => {
      const id = window.setTimeout(() => {
        setRevealIndex(index);
        setRobot(pos);
        setTrail((old) => {
          const updated = new Set(old);
          updated.add(keyOf(pos));
          return updated;
        });

        if (index === SAFE_PATH.length - 1) {
          setStage("done");
          setMessage("The robot reached the exit! 🏁");
          onComplete?.();
        }
      }, index * 220);

      timers.current.push(id);
    });
  };

  return (
    <section className={styles.lab}>
      <header className={styles.header}>
        <div>
          <span className={styles.badge}>SEARCH GAME 2</span>
          <h1>Escape the Maze 🧩</h1>
          <p>Explore it yourself, then compare with quantum search.</p>
        </div>
        <button className={styles.reset} onClick={reset}>↻ Restart Game</button>
      </header>

      {stage === "choose" ? (
        <div className={styles.choose}>
          <h2>How do you want to solve it?</h2>
          <div className={styles.choiceGrid}>
            <button className={styles.choice} onClick={() => choose("classical")}>
              <span className={styles.icon}>🤖</span>
              <strong>Classical Search</strong>
              <small>You control the robot and explore</small>
              <b>PLAY</b>
            </button>

            <button className={`${styles.choice} ${styles.quantumChoice}`} onClick={() => choose("quantum")}>
              <span className={styles.icon}>⚛️</span>
              <strong>Quantum Search</strong>
              <small>Search route possibilities, then measure</small>
              <b>PLAY</b>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.status}>{message}</div>

          <div className={styles.gameLayout}>
            <div className={`${styles.mazeBoard} ${pulse ? styles.quantumPulse : ""}`}>
              {Array.from({ length: SIZE * SIZE }, (_, index) => {
                const r = Math.floor(index / SIZE);
                const c = index % SIZE;
                const pos: Pos = [r,c];
                const key = keyOf(pos);
                const isOpen = OPEN_SET.has(key);
                const isRobot = robot[0] === r && robot[1] === c;
                const isStart = key === keyOf(START);
                const isExit = key === keyOf(EXIT);
                const visited = trail.has(key);
                const safeVisible =
                  (stage === "revealing" || stage === "done") &&
                  SAFE_SET.has(key) &&
                  SAFE_PATH.findIndex((p) => keyOf(p) === key) <= revealIndex;

                return (
                  <div
                    key={key}
                    className={[
                      styles.cell,
                      isOpen ? styles.openCell : styles.wallCell,
                      visited ? styles.visited : "",
                      safeVisible ? styles.safeCell : "",
                      isStart ? styles.startCell : "",
                      isExit ? styles.exitCell : "",
                    ].join(" ")}
                  >
                    {isRobot && <span className={styles.robot}>🤖</span>}
                    {!isRobot && isStart && <span className={styles.marker}>S</span>}
                    {isExit && <span className={styles.flag}>🏁</span>}
                  </div>
                );
              })}
            </div>

            <aside className={styles.sidePanel}>
              {mode === "classical" && (
                <>
                  <h3>You control the robot</h3>
                  <p>Try directions. Dead ends cost extra moves.</p>

                  <div className={styles.dpad}>
                    <span />
                    <button onClick={() => move(-1,0)}>↑</button>
                    <span />
                    <button onClick={() => move(0,-1)}>←</button>
                    <button onClick={() => move(1,0)}>↓</button>
                    <button onClick={() => move(0,1)}>→</button>
                  </div>

                  <div className={styles.moveCount}>Moves: {moves}</div>
                  <button className={styles.secondary} onClick={restartPosition}>
                    ↩ Back to Start
                  </button>

                  <div className={styles.tip}>
                    💡 Classical search learns by trying routes and discovering dead ends.
                  </div>
                </>
              )}

              {mode === "quantum" && (
                <>
                  <h3>Quantum route search</h3>
                  <div className={styles.mathHint}>
                    <span>9 route ideas</span>
                    <b>→</b>
                    <strong>about 2 rounds</strong>
                  </div>

                  <button className={styles.whyButton} onClick={() => setShowWhy((v) => !v)}>
                    {showWhy ? "Hide explanation ↑" : "Why 2? 🤔"}
                  </button>

                  {showWhy && (
                    <div className={styles.whyCard}>
                      Fewer choices need fewer Grover-style rounds. With about 9 route
                      possibilities, the best point is around 2 rounds.
                    </div>
                  )}

                  <div className={styles.boostRow}>
                    {Array.from({ length: BEST_BOOSTS }, (_, i) => (
                      <span key={i} className={i < boostRound ? styles.on : ""} />
                    ))}
                  </div>

                  {stage === "play" && (
                    <button className={styles.primary} onClick={startQuantum}>
                      ⚛️ START SEARCH
                    </button>
                  )}

                  {stage === "boosting" && (
                    <div className={styles.running}>Searching route possibilities…</div>
                  )}

                  {stage === "readyToMeasure" && (
                    <button className={styles.measure} onClick={measure}>
                      👀 MEASURE ROUTE
                    </button>
                  )}

                  <div className={styles.tip}>
                    💡 This is a simplified search model: the quantum side compares prepared route possibilities. It does not magically understand every maze.
                  </div>
                </>
              )}
            </aside>
          </div>

          {stage === "done" && (
            <div className={styles.finish}>
              <h2>Maze complete! ⭐</h2>
              {mode === "classical" ? (
                <p>You explored the maze yourself in <strong>{moves}</strong> moves.</p>
              ) : (
                <p>The quantum version used <strong>2 boost rounds</strong>, then measured a route.</p>
              )}
              <button className={styles.again} onClick={reset}>Choose Another Mode</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
