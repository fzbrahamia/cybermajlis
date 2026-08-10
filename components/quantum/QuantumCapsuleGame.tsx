"use client";

import { useMemo, useState, type DragEvent } from "react";
import styles from "./QuantumCapsuleGame.module.css";
import { Sparkles, Star } from "lucide-react";
import { Eye } from "lucide-react";

type Bit = 0 | 1;
type Stage = "build" | "ready" | "measuring" | "result";

export default function QuantumCapsuleGame({ onComplete }: { onComplete?: () => void }) {
  const [loaded, setLoaded] = useState<Bit[]>([]);
  const [stage, setStage] = useState<Stage>("build");
  const [result, setResult] = useState<Bit | null>(null);
  const [round, setRound] = useState(1);
  const [history, setHistory] = useState<Bit[]>([]);

  const loadedZero = loaded.includes(0);
  const loadedOne = loaded.includes(1);
  const complete = loadedZero && loadedOne;

  const stars = useMemo(() => {
    let count = 0;
    if (loaded.length >= 1) count += 1;
    if (complete) count += 1;
    if (stage === "result") count += 1;
    return count;
  }, [loaded, complete, stage]);

  const addBit = (bit: Bit) => {
    if (stage === "measuring" || stage === "result") return;

    setLoaded((current) => {
      if (current.includes(bit)) return current;
      const next = [...current, bit];
      if (next.includes(0) && next.includes(1)) {
        setStage("ready");
      }
      return next;
    });
  };

  const removeBit = (bit: Bit) => {
    if (stage === "measuring" || stage === "result") return;
    setLoaded((current) => current.filter((value) => value !== bit));
    setStage("build");
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>, bit: Bit) => {
    event.dataTransfer.setData("text/plain", String(bit));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("text/plain");
    if (raw === "0" || raw === "1") addBit(Number(raw) as Bit);
  };

  const measure = () => {
    if (!complete || stage !== "ready") return;

    setStage("measuring");

    window.setTimeout(() => {
      const measured = (Math.random() < 0.5 ? 0 : 1) as Bit;
      setResult(measured);
      setHistory((old) => [...old, measured]);
      setStage("result");
      onComplete?.();
    }, 900);
  };

  const nextRound = () => {
    setLoaded([]);
    setResult(null);
    setStage("build");
    setRound((value) => value + 1);
  };

  const reset = () => {
    setLoaded([]);
    setStage("build");
    setResult(null);
    setRound(1);
    setHistory([]);
  };

  return (
    <section className={styles.lab}>
      <header className={styles.header}>
        <div>
          <span className={styles.badge}>SUPERPOSITION GAME 2</span>
          <h1>Build a Qubit</h1>
          <p>Load both possibilities, then measure the quantum capsule.</p>
        </div>
        <button className={styles.reset} onClick={reset}>
          ↻ Restart
        </button>
      </header>

      <div className={styles.missionBar}>
        <div>
          <span className={styles.missionLabel}>MISSION</span>
          <strong>Build superposition</strong>
        </div>

        <div className={styles.stars} aria-label={`${stars} out of 3 stars`}>
          <span className={stars >= 1 ? styles.starOn : ""}><Star size={16} aria-hidden /></span>
          <span className={stars >= 2 ? styles.starOn : ""}><Star size={16} aria-hidden /></span>
          <span className={stars >= 3 ? styles.starOn : ""}><Star size={16} aria-hidden /></span>
        </div>

        <div className={styles.roundPill}>Round {round}</div>
      </div>

      <div className={styles.gameCard}>
        <div className={styles.instruction}>
          {stage === "build" && (
            <>
              <strong>Step 1:</strong> Put <b>both</b> cards inside the capsule.
              <small>Drag them, or just tap each card.</small>
            </>
          )}

          {stage === "ready" && (
            <>
              <strong>Great!</strong> The capsule now holds both possibilities.
              <small>Now measure it to get one visible result.</small>
            </>
          )}

          {stage === "measuring" && (
            <>
              <strong>Measuring...</strong>
              <small>The quantum state is becoming one result.</small>
            </>
          )}

          {stage === "result" && (
            <>
              <strong>Measurement complete!</strong>
              <small>You got one result: {result}.</small>
            </>
          )}
        </div>

        <div className={styles.playArea}>
          <div className={styles.tokenShelf}>
            <p>Possibility cards</p>

            <div
              className={`${styles.bitCard} ${loadedZero ? styles.usedCard : ""}`}
              draggable={!loadedZero && stage !== "measuring" && stage !== "result"}
              onDragStart={(event) => onDragStart(event, 0)}
              onClick={() => addBit(0)}
            >
              <span>0</span>
              <small>{loadedZero ? "Loaded" : "Tap or drag"}</small>
            </div>

            <div
              className={`${styles.bitCard} ${loadedOne ? styles.usedCard : ""}`}
              draggable={!loadedOne && stage !== "measuring" && stage !== "result"}
              onDragStart={(event) => onDragStart(event, 1)}
              onClick={() => addBit(1)}
            >
              <span>1</span>
              <small>{loadedOne ? "Loaded" : "Tap or drag"}</small>
            </div>
          </div>

          <div
            className={[
              styles.capsuleZone,
              complete ? styles.capsuleReady : "",
              stage === "measuring" ? styles.capsuleMeasuring : "",
              stage === "result" ? styles.capsuleResult : "",
            ].join(" ")}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
          >
            <span className={styles.capsuleTitle}>QUBIT CAPSULE</span>

            {stage !== "result" ? (
              <div className={styles.capsuleCore}>
                {!loadedZero && !loadedOne && (
                  <div className={styles.emptyCore}>
                    <span>＋</span>
                    <small>Drop 0 and 1 here</small>
                  </div>
                )}

                {loadedZero && (
                  <button
                    className={`${styles.loadedOrb} ${styles.zeroOrb}`}
                    onClick={() => removeBit(0)}
                    aria-label="Remove zero"
                  >
                    0
                  </button>
                )}

                {loadedZero && loadedOne && <span className={styles.plus}>+</span>}

                {loadedOne && (
                  <button
                    className={`${styles.loadedOrb} ${styles.oneOrb}`}
                    onClick={() => removeBit(1)}
                    aria-label="Remove one"
                  >
                    1
                  </button>
                )}
              </div>
            ) : (
              <div className={`${styles.resultOrb} ${styles.pop}`}>{result}</div>
            )}

            <div className={styles.stateLabel}>
              {!loadedZero && !loadedOne && stage !== "result" && "Empty"}
              {loaded.length === 1 && stage !== "result" && "Only one possibility loaded"}
              {complete && stage === "ready" && "SUPERPOSITION"}
              {stage === "measuring" && "MEASURING..."}
              {stage === "result" && `RESULT = ${result}`}
            </div>
          </div>

          <div className={styles.lessonPanel}>
            <h3>What are you building?</h3>

            <div className={`${styles.ruleCard} ${loaded.length === 1 ? styles.ruleActive : ""}`}>
              <span className={styles.ruleIcon}>1️⃣</span>
              <div>
                <strong>One card only</strong>
                <p>That is not our superposition yet.</p>
              </div>
            </div>

            <div className={`${styles.ruleCard} ${complete && stage !== "result" ? styles.ruleActive : ""}`}>
              <span className={styles.ruleIcon}><Sparkles size={15} aria-hidden /></span>
              <div>
                <strong>0 + 1 loaded</strong>
                <p>Both possibilities are part of the qubit state.</p>
              </div>
            </div>

            <div className={`${styles.ruleCard} ${stage === "result" ? styles.ruleActive : ""}`}>
              <span className={styles.ruleIcon}><Eye size={15} aria-hidden /></span>
              <div>
                <strong>After measurement</strong>
                <p>You see one result: 0 or 1.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actionArea}>
          {stage === "build" && (
            <div className={styles.helperText}>
              {loaded.length === 0 && "Load both cards to continue."}
              {loaded.length === 1 && "Nice — now add the other possibility!"}
            </div>
          )}

          {stage === "ready" && (
            <button className={styles.measureButton} onClick={measure}>
              MEASURE THE CAPSULE
            </button>
          )}

          {stage === "measuring" && (
            <div className={styles.measureAnimation}>
              <span />
              <span />
              <span />
            </div>
          )}

          {stage === "result" && (
            <>
              <div className={styles.takeaway}>
                <strong>Superposition is before measurement.</strong> We loaded
                both 0 and 1 possibilities. After measuring, the capsule showed one
                result.
              </div>

              <div className={styles.caveat}>
                <strong>Where this picture simplifies.</strong> A qubit is not a
                container you put two values into. Nothing is stored side by side
                inside it. Before you measure there is no hidden 0 or 1 already
                waiting to be found, which is the part no everyday object does.
                The capsule helps you picture it. Real qubits are stranger.
              </div>

              <button className={styles.nextButton} onClick={nextRound}>
                Play Another Round
              </button>
            </>
          )}
        </div>

        {history.length > 0 && (
          <div className={styles.historyBar}>
            <strong>Measurements:</strong>
            {history.slice(-10).map((value, index) => (
              <span key={`${value}-${index}`}>{value}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
