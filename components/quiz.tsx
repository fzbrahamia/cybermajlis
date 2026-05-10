"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface QuizProps {
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
  onAnswerResult?: (isCorrect: boolean) => void;
  onAnswerFeedback?: (feedback: "correct" | "wrong") => void;
  onQuizDone?: (score: number, total: number) => void;
  onRetake?: () => void;
}

export default function Quiz({ questions, onAnswerResult, onAnswerFeedback, onQuizDone, onRetake }: QuizProps) {
  const t = useTranslations("LessonDetail.quiz_ui");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [attempts, setAttempts] = useState<number[]>(Array(questions.length).fill(0));
  const [hoverMessage, setHoverMessage] = useState(false);

  const currentQuestion = questions[current];
  const selected = selectedAnswers[current];
  const isLocked = selected === currentQuestion?.correctAnswer && attempts[current] === 1;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .quiz-opt {
        width: 100%;
        padding: 0.75rem 0.8rem;
        height: 100%;
        width: 100%;
        border-radius: 12px;
        border: 1.5px solid rgba(99,32,36,0.2);
        background: rgba(253,248,240,0.7);
        color: #3e1316;
        font-family: 'Crimson Pro', Georgia, serif;
        font-size: 0.92rem;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        overflow: hidden;
      }
      .quiz-opt:hover:not(:disabled) {
        background: rgba(99,32,36,0.08);
        border-color: rgba(99,32,36,0.4);
        transform: translateX(4px);
      }
      .quiz-opt.correct {
        background: rgba(106,143,90,0.15);
        border-color: #6a8f5a;
        color: #3a5c2e;
      }
      .quiz-opt.wrong {
        background: rgba(184,92,92,0.12);
        border-color: #b85c5c;
        color: #7a2020;
      }
      .quiz-opt.disabled {
        background: rgba(99,32,36,0.04);
        border-color: rgba(99,32,36,0.1);
        color: rgba(99,32,36,0.3);
        cursor: not-allowed;
      }
      .quiz-opt:disabled { cursor: not-allowed; }

      .quiz-result-correct {
        background: rgba(106,143,90,0.1);
        border: 1px solid rgba(106,143,90,0.3);
        border-radius: 14px;
        padding: 1.2rem 1.4rem;
      }
      .quiz-result-wrong {
        background: rgba(184,92,92,0.08);
        border: 1px solid rgba(184,92,92,0.25);
        border-radius: 14px;
        padding: 1.2rem 1.4rem;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleAnswer = (option: string) => {
    if (selected && attempts[current] >= 2) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[current] = option;
    setSelectedAnswers(newAnswers);
    const newAttempts = [...attempts];
    newAttempts[current] += 1;
    setAttempts(newAttempts);
    const isCorrect = option === currentQuestion.correctAnswer;
    if (onAnswerResult) onAnswerResult(isCorrect);
    if (onAnswerFeedback) onAnswerFeedback(isCorrect ? "correct" : "wrong");
  };

  const nextQuestion = () => {
    if (!selected) return;
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setHoverMessage(false);
    } else {
      const finalScore = questions.reduce((acc, q, i) => acc + (selectedAnswers[i] === q.correctAnswer ? 1 : 0), 0);
      setScore(finalScore);
      setFinished(true);
      if (onQuizDone) onQuizDone(finalScore, questions.length);
    }
  };

  const prevQuestion = () => { if (current > 0) { setCurrent(current - 1); setHoverMessage(false); } };

  const restart = () => {
    setStarted(false); setCurrent(0);
    setSelectedAnswers(Array(questions.length).fill(null));
    setScore(0); setFinished(false);
    setAttempts(Array(questions.length).fill(0));
    setHoverMessage(false);
    if (onRetake) onRetake();
  };

  const cardStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    borderRadius: 0,
    overflow: "hidden",
    boxShadow: "none",
    width: "100%",
    height: "414px",
    overflowY: "auto",
  };

  // START
  if (!started) return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "transparent" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg, #632024, #c5a57e)" }} />
      <div style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(99,32,36,0.5)", marginBottom: "1rem" }}>
          {t("knowledge_check")}
        </div>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.4rem", fontWeight: 700, color: "#3e1316", marginBottom: "0.6rem" }}>
          {t("ready_heading")}
        </h2>
        <div style={{ height: 1, width: 40, background: "linear-gradient(90deg, transparent, #c5a57e, transparent)", margin: "0.8rem auto 1.4rem" }} />
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1rem", color: "#5C4033", fontStyle: "italic", marginBottom: "1.8rem" }}>
          {t("questions_count", { count: questions.length })}
        </p>
        <button onClick={() => setStarted(true)} style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.15em",
          textTransform: "uppercase", fontWeight: 700,
          padding: "0.85rem 2.5rem", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg, #3e1316, #632024)",
          color: "#E8D4BC", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(99,32,36,0.25)",
        }}>
          {t("start")}
        </button>
      </div>
    </div>
  );

  // FINISHED
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
    return (
      <div style={cardStyle}>
        <div style={{ height: 3, background: "linear-gradient(90deg, #632024, #c5a57e)" }} />
        <div style={{ padding: "1.2rem 1.4rem", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
          {/* Score header */}
          <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(99,32,36,0.5)", marginBottom: "0.8rem" }}>
              {t("completed")}
            </div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "2.5rem", fontWeight: 900, color: "#632024", lineHeight: 1 }}>
              {score}<span style={{ fontSize: "1rem", opacity: 0.5 }}>/{questions.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "0.8rem 0" }}>
              {[1,2,3].map(s => (
                <span key={s} style={{ fontSize: "1.4rem", opacity: s <= stars ? 1 : 0.2, transition: "all 0.3s" }}>⭐</span>
              ))}
            </div>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: "#5C4033", fontSize: "0.95rem" }}>
              {pct >= 80 ? t("excellent") : pct >= 60 ? t("good") : t("keep_practicing")}
            </p>
          </div>

          {/* Review */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.6rem" }}>
            {questions.map((q, i) => {
              const userAnswer = selectedAnswers[i];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={i} className={isCorrect ? "quiz-result-correct" : "quiz-result-wrong"}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 700, color: "#3e1316", marginBottom: "0.5rem" }}>
                    {i + 1}. {q.question}
                  </p>
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.9rem", color: "#5C4033" }}>
                    {t("your_answer")} <span style={{ color: isCorrect ? "#3a5c2e" : "#7a2020", fontWeight: 600 }}>{userAnswer || t("no_answer")}</span>
                  </p>
                  {!isCorrect && (
                    <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.9rem", color: "#5C4033", marginTop: "0.2rem" }}>
                      {t("correct_answer")} <span style={{ color: "#3a5c2e", fontWeight: 600 }}>{q.correctAnswer}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center" }}>
            <button onClick={restart} style={{
              fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "0.15em",
              textTransform: "uppercase", fontWeight: 700,
              padding: "0.8rem 2rem", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #3e1316, #632024)",
              color: "#E8D4BC", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99,32,36,0.22)",
            }}>
              {t("retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // IN PROGRESS
  const progressPct = ((current) / questions.length) * 100;

  return (
    <div style={cardStyle}>
      <div style={{ height: 3, background: "linear-gradient(90deg, #632024, #c5a57e)" }} />
      <div style={{ padding: "1rem 1.4rem", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Progress bar */}
        <div style={{ marginBottom: "1.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(99,32,36,0.5)" }}>
              {t("question_of", { current: current + 1, total: questions.length })}
            </span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", color: "rgba(99,32,36,0.45)", letterSpacing: "0.1em" }}>
              {t("attempts", { used: attempts[current] })}
            </span>
          </div>
          <div style={{ width: "100%", height: 5, borderRadius: 999, background: "rgba(99,32,36,0.1)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #632024, #c5a57e)", width: `${progressPct}%`, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Question */}
        <div style={{
          background: "linear-gradient(135deg, #3e1316, #632024)",
          borderRadius: 14, padding: "0.9rem 1.1rem",
          marginBottom: "0.8rem", position: "relative", overflow: "hidden",
          boxShadow: "0 4px 16px rgba(99,32,36,0.2)",
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.95rem", fontWeight: 600, color: "#E8D4BC", lineHeight: 1.6, position: "relative", zIndex: 1 }}>
            {currentQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "0.6rem", marginBottom: "0.8rem", flex: 1, minHeight: 0 }}>
          {currentQuestion.options.map((opt, i) => {
            const isCorrect = opt === currentQuestion.correctAnswer;
            const isSelected = selected === opt;
            const attemptsUsed = attempts[current];

            let className = "quiz-opt";
            if (selected) {
              if (isSelected && !isCorrect) className += " wrong";
              else if (isCorrect && (isSelected || attemptsUsed >= 2)) className += " correct";
              else if (attemptsUsed >= 2) className += " disabled";
            }

            return (
              <button key={i} className={className}
                onClick={() => !isLocked && handleAnswer(opt)}
                disabled={isLocked || (attemptsUsed >= 2 && selected === opt)}>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, width: "100%", height: "100%" }}>
                  <span style={{ opacity: 0.5, fontFamily: "'Cinzel', serif", fontSize: "0.65rem" }}>{String.fromCharCode(65 + i)}.</span>
                  <span>{opt}</span>
                </span>
                {selected && isCorrect && (isSelected || attemptsUsed >= 2) && (
                  <span style={{ float: "right", color: "#3a5c2e" }}>✓</span>
                )}
                {selected && isSelected && !isCorrect && (
                  <span style={{ float: "right", color: "#b85c5c" }}>✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={prevQuestion} disabled={current === 0} style={{
            fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "0.7rem 1.3rem", borderRadius: 10,
            border: "1px solid rgba(99,32,36,0.2)", background: "transparent",
            color: current === 0 ? "rgba(99,32,36,0.25)" : "#632024",
            cursor: current === 0 ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}>
            {t("prev")}
          </button>
          <button onClick={nextQuestion} disabled={!selected} style={{
            fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "0.7rem 1.6rem", borderRadius: 10,
            border: "none",
            background: selected ? "linear-gradient(135deg, #3e1316, #632024)" : "rgba(99,32,36,0.1)",
            color: selected ? "#E8D4BC" : "rgba(99,32,36,0.3)",
            cursor: selected ? "pointer" : "not-allowed",
            boxShadow: selected ? "0 4px 14px rgba(99,32,36,0.22)" : "none",
            transition: "all 0.2s",
          }}>
            {current + 1 === questions.length ? t("finish") : t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}