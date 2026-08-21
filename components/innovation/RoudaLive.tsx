"use client";

/* ROUDA, LIVE

   She asks, the learner answers by voice or by keyboard, and she answers back.
   The evaluation is app/api/rouda/route.ts.

   Her portrait is 2D with layered motion, not a rigged 3D head: she breathes,
   tilts, nods while she is listening, and pulses while she is thinking. If four
   expression frames are ever drawn (still, listening, thinking, speaking) they
   drop into FRAMES below and she becomes noticeably more alive for the cost of
   four PNGs. */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { Mic, Keyboard, Send, Volume2, VolumeX } from "lucide-react";
import { M, sans, R, HUES } from "./theme";

const G = HUES.green;

/* Swap any of these for a drawn expression when the art exists. */
const FRAMES = {
  still:     "/rouda/still.png",
  listening: "/rouda/listening.png",
  thinking:  "/rouda/Thinking.png",
  speaking:  "/rouda/speaking.png",
  smiling:   "/rouda/smiling.png",
};

type State = "asking" | "waiting" | "listening" | "thinking" | "replying";
export type Verdict = "answered" | "thin" | "off";

/* The browser's own recogniser and voice. No third party, nothing recorded. */
type Rec = { start(): void; stop(): void; lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null };

function getRecogniser(lang: string): Rec | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  const C = W.SpeechRecognition ?? W.webkitSpeechRecognition;
  if (!C) return null;
  const r = new C();
  r.lang = lang; r.interimResults = true; r.continuous = false;
  return r;
}

export default function RoudaLive({
  question, seen, open, onAnswer, hint,
}: {
  question: string;
  seen?: string;
  /** No right answer exists, so she may never push back for being wrong. */
  open?: boolean;
  hint?: string;
  onAnswer: (text: string, verdict: Verdict) => void;
}) {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  const [state, setState] = useState<State>("asking");
  const [said, setSaid] = useState("");
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [voice, setVoice] = useState(true);
  useEffect(() => {
    try { setVoice(JSON.parse(localStorage.getItem("mj-prefs") ?? "{}").voice !== false); }
    catch { /* private mode */ }
  }, []);
  const [second, setSecond] = useState(false);
  const rec = useRef<Rec | null>(null);
  const canMic = typeof window !== "undefined" &&
    !!((window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);

  const speak = (t: string) => {
    if (!voice || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = isAR ? "ar-QA" : "en-GB";
    u.rate = 0.97; u.pitch = 1.15;
    window.speechSynthesis.speak(u);
  };

  // She asks as soon as she appears.
  useEffect(() => {
    setState("asking"); setSaid(question); setText(""); setSecond(false);
    speak(question);
    const t = setTimeout(() => setState("waiting"), 900);
    return () => { clearTimeout(t); window.speechSynthesis?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const listen = () => {
    const r = getRecogniser(isAR ? "ar-SA" : "en-GB");
    if (!r) return;
    rec.current = r;
    setState("listening"); setText("");
    r.onresult = e => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setText(t);
    };
    r.onend = () => setState(s => (s === "listening" ? "waiting" : s));
    r.onerror = () => setState("waiting");
    r.start();
  };

  const send = async () => {
    const a = text.trim();
    if (!a) return;
    rec.current?.stop();
    setState("thinking");
    try {
      const res = await fetch("/api/rouda", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, answer: a, seen, open, second, lang: isAR ? "ar" : "en" }),
      });
      const out = await res.json();
      const verdict: Verdict = out?.verdict ?? "answered";
      const say: string = out?.say ?? "";
      setState("replying"); setSaid(say); speak(say);

      if (verdict === "off" && !second) {
        // One push back, then she lets them through no matter what.
        setSecond(true);
        setTimeout(() => { setState("waiting"); setText(""); }, 1400);
      } else {
        onAnswer(a, verdict);
      }
    } catch {
      onAnswer(a, "answered");
    }
  };

  const frame = FRAMES[state === "listening" ? "listening"
    : state === "thinking" ? "thinking"
    : state === "asking" || state === "replying" ? "speaking" : "still"];

  const glow = state === "waiting";

  return (
    <div style={{
      background: M.card, border: `1px solid ${G.tint}`, borderRadius: R.card,
      padding: "clamp(20px,3vw,30px)", overflow: "hidden",
    }}>
      <div style={{ display: "flex", gap: "clamp(16px,3vw,26px)", alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* her */}
        <div style={{ position: "relative", flex: "none" }}>
          <motion.div
            animate={reduce ? undefined
              : state === "listening" ? { rotate: [0, 2.5, 0, -1.5, 0], y: [0, -2, 0] }
              : state === "thinking" ? { rotate: [0, -3, -3, 0], scale: [1, 1.01, 1] }
              : { y: [0, -3, 0] }}
            transition={
              state === "listening" ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
              : state === "thinking" ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
            }
            style={{
              width: 116, height: 116, borderRadius: "50%", overflow: "hidden",
              border: `3px solid ${G.mid}`, background: M.page,
            }}
          >
            <img src={frame} alt="Rouda" width={116} height={116}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </motion.div>

          {/* the ring says what she is doing without a word of interface copy */}
          <AnimatePresence>
            {(state === "asking" || state === "replying") && !reduce && (
              <motion.span key="sp" aria-hidden
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: "absolute", inset: -9, borderRadius: "50%", border: `2px solid ${G.soft}` }}>
                <motion.span
                  animate={{ scale: [1, 1.13, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ position: "absolute", inset: -2, borderRadius: "50%", border: `2px solid ${G.mid}`, display: "block" }} />
              </motion.span>
            )}
            {state === "listening" && !reduce && (
              <motion.span key="ls" aria-hidden
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  position: "absolute", bottom: -4, insetInlineStart: "50%", transform: "translateX(-50%)",
                  display: "flex", gap: 3, alignItems: "flex-end", height: 18,
                }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.span key={i}
                    animate={{ height: [5, 16, 7, 13, 5] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.11 }}
                    style={{ width: 3, borderRadius: 2, background: G.mid, display: "block" }} />
                ))}
              </motion.span>
            )}
            {state === "thinking" && (
              <motion.span key="th" aria-hidden
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  position: "absolute", top: -6, insetInlineEnd: -6, display: "flex", gap: 4,
                  background: M.card, borderRadius: 999, padding: "6px 9px",
                  border: `1px solid ${G.tint}`,
                }}>
                {[0, 1, 2].map(i => (
                  <motion.span key={i}
                    animate={reduce ? undefined : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.16 }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: G.mid, display: "block" }} />
                ))}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* what she says, always written as well as spoken */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: G.deep, fontFamily: sans }}>
              {isAR ? "رودة" : "Rouda"}
            </span>
            <button onClick={() => { setVoice(v => !v); window.speechSynthesis?.cancel(); }}
              aria-label={voice ? (isAR ? "أوقف الصوت" : "Mute") : (isAR ? "شغّل الصوت" : "Unmute")}
              style={{ background: "none", border: "none", cursor: "pointer", color: M.body, padding: 3 }}>
              {voice ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.p key={said}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                margin: 0, fontSize: "clamp(16px,2.2vw,19px)", lineHeight: 1.55,
                color: M.heading, fontWeight: 700, fontFamily: sans, maxWidth: "34ch",
              }}>
              {said}
            </motion.p>
          </AnimatePresence>

          {hint && state === "waiting" && (
            <p style={{ margin: "10px 0 0", fontSize: 13.5, color: M.body, fontStyle: "italic", fontFamily: sans }}>
              {hint}
            </p>
          )}
        </div>
      </div>

      {/* the learner's turn: both ways offered, both lit */}
      <AnimatePresence>
        {(state === "waiting" || state === "listening") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 22 }}
          >
            {!typing && !text && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {canMic && (
                  <motion.button
                    onClick={listen}
                    animate={reduce || !glow ? undefined : { boxShadow: [
                      `0 0 0 rgba(46,156,110,0)`, `0 0 22px rgba(46,156,110,.5)`, `0 0 0 rgba(46,156,110,0)`,
                    ] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      minHeight: 56, display: "inline-flex", alignItems: "center", gap: 11,
                      padding: "0 26px", borderRadius: R.pill, cursor: "pointer", fontFamily: sans,
                      background: state === "listening" ? G.deep : M.card,
                      color: state === "listening" ? "#FFFDF8" : G.deep,
                      border: `2px solid ${G.mid}`, fontSize: 15.5, fontWeight: 800,
                    }}>
                    <Mic size={19} />
                    {state === "listening" ? (isAR ? "أسمعك" : "Listening") : (isAR ? "تكلّم" : "Speak")}
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setTyping(true)}
                  animate={reduce || !glow ? undefined : { boxShadow: [
                    `0 0 0 rgba(197,165,126,0)`, `0 0 18px rgba(197,165,126,.45)`, `0 0 0 rgba(197,165,126,0)`,
                  ] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  style={{
                    minHeight: 56, display: "inline-flex", alignItems: "center", gap: 11,
                    padding: "0 26px", borderRadius: R.pill, cursor: "pointer", fontFamily: sans,
                    background: M.card, color: M.goldDeep,
                    border: `2px solid ${M.gold}`, fontSize: 15.5, fontWeight: 800,
                  }}>
                  <Keyboard size={19} />
                  {isAR ? "اكتب" : "Type"}
                </motion.button>
              </div>
            )}

            {(typing || text) && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  autoFocus={typing}
                  rows={2}
                  placeholder={isAR ? "اكتب هنا" : "Write here"}
                  style={{
                    flex: 1, minWidth: 0, resize: "vertical", boxSizing: "border-box",
                    padding: "13px 16px", borderRadius: 16, fontFamily: sans,
                    border: `2px solid ${G.tint}`, background: M.page, color: M.heading,
                    fontSize: 15.5, lineHeight: 1.6,
                  }}
                />
                <button onClick={send} disabled={!text.trim()} aria-label={isAR ? "أرسل" : "Send"}
                  style={{
                    width: 56, height: 56, borderRadius: "50%", border: "none", flex: "none",
                    cursor: text.trim() ? "pointer" : "default",
                    background: text.trim() ? G.deep : "rgba(42,35,28,.1)",
                    color: "#FFFDF8", display: "grid", placeItems: "center",
                  }}>
                  <Send size={20} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
