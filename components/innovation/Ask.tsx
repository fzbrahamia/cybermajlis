"use client";

/* One question, and a real answer back.

   Two kinds of question, deliberately handled differently:

   A CHOICE has a written reply per option, because the options are known and a
   written reply is instant, warm and never wrong.

   FREE TEXT is sent to Rouda (app/api/rouda/route.ts) and she reads it. Before
   this, the gate opened on three characters and she said something encouraging
   no matter what was typed, which meant the whole assessment was theatre.
   She now decides, and she can send you back once. */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageCirclePlus } from "lucide-react";
import { M, sans, R, HUES, type Hue } from "./theme";

const ROUDA_FACE = { still: "/rouda/still.png", thinking: "/rouda/Thinking.png", smiling: "/rouda/smiling.png" };
const HAMAD_FACE = "/characters/HamadAvatars/hamad-1.png";

/* What she says when the reply did not arrive.

   She used to say nothing at all: a 429 or a 500 returns a body with no `say`
   in it, the code read `out?.say ?? ""`, and an empty bubble appeared. An
   empty bubble is worse than an error, because the learner assumes she read
   their answer and had nothing to say about it. */
const BUSY_MSG = {
  en: "Too many at once. Give me a second, then send it again.",
  ar: "كثير في وقت واحد. أمهلني لحظة ثم أرسلها مرة أخرى.",
};
const GOT_IT = { en: "Got it. Keep going.", ar: "وصلتني. واصل." };
const WHY = { en: "And why do you think that?", ar: "ولماذا تظن ذلك؟" };

export type Choice = { en: string; ar: string; react_en: string; react_ar: string };
export type AskShape = {
  id: string;
  q_en: string; q_ar: string;
  hint_en?: string; hint_ar?: string;
  choices?: Choice[];
  react_en?: string; react_ar?: string;
  by?: "hamad" | "rouda";
  /** No right answer exists, so she may never push back for being wrong. */
  open?: boolean;
};

export type Verdict = "answered" | "thin" | "off";

function Portrait({ who, thinking, size = 36 }: { who: "hamad" | "rouda"; thinking?: boolean; size?: number }) {
  const src = who === "rouda" ? (thinking ? ROUDA_FACE.thinking : ROUDA_FACE.smiling) : HAMAD_FACE;
  const ring = who === "rouda" ? HUES.green.mid : HUES.gold.mid;
  return (
    <motion.span
      animate={thinking ? { rotate: [0, -3, 0, 2, 0] } : {}}
      transition={{ duration: 2.4, repeat: thinking ? Infinity : 0, ease: "easeInOut" }}
      style={{
        width: size, height: size, borderRadius: "50%", flex: "none", display: "block",
        overflow: "hidden", background: M.card, border: `2px solid ${ring}`,
      }}
    >
      <img src={src} alt="" width={size} height={size}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </motion.span>
  );
}

export function Ask({
  a, isAR, value, picked, verdict, seen, onText, onPick, onVerdict, hue = HUES.gold,
}: {
  a: AskShape;
  isAR: boolean;
  value: string;
  picked?: number;
  verdict?: Verdict;
  /** What they have already written, so she can notice a contradiction. */
  seen?: string;
  onText: (v: string) => void;
  onPick: (i: number) => void;
  onVerdict: (v: Verdict, said: string) => void;
  hue?: Hue;
}) {
  const rouda = a.by === "rouda";
  const accent = rouda ? HUES.green : hue;
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  const [pushed, setPushed] = useState(false);
  /** Transport trouble, kept apart from what she actually said. */
  const [note, setNote] = useState("");
  // she can keep going, if they want to be pushed further
  const [thread, setThread] = useState<{ role: "you" | "rouda"; text: string }[]>([]);
  const [more, setMore] = useState("");

  const written = value.trim().length > 0;
  const settled = verdict === "answered" || verdict === "thin";

  const chosenReact = a.choices && picked !== undefined
    ? (isAR ? a.choices[picked].react_ar : a.choices[picked].react_en) : null;

  const send = async () => {
    if (!written || busy) return;
    setBusy(true);
    setNote("");
    try {
      const res = await fetch("/api/rouda", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: isAR ? a.q_ar : a.q_en,
          answer: value,
          seen, open: a.open, second: pushed,
          lang: isAR ? "ar" : "en",
        }),
      });

      // Rate limited. Nothing read the answer, so nothing may be settled:
      // marking it answered here would be exactly the theatre she exists to
      // prevent. Say so plainly and leave the send button live.
      if (res.status === 429) { setNote(isAR ? BUSY_MSG.ar : BUSY_MSG.en); return; }

      const out = res.ok ? await res.json().catch(() => null) : null;
      const text = typeof out?.say === "string" && out.say.trim()
        ? out.say.trim()
        : (isAR ? GOT_IT.ar : GOT_IT.en);
      const v: Verdict = out?.verdict === "off" || out?.verdict === "thin" ? out.verdict : "answered";

      setSaid(text);
      if (v === "off" && !pushed) {
        setPushed(true);           // one push back, then she lets you through
        onVerdict("off", text);
      } else {
        onVerdict(v === "off" ? "thin" : v, text);
        setThread([{ role: "you", text: value }, { role: "rouda", text }]);
      }
    } catch {
      // The network went, not the learner. Let them through rather than
      // trapping them on a question nobody can read.
      const text = isAR ? GOT_IT.ar : GOT_IT.en;
      setSaid(text);
      onVerdict("answered", text);
      setThread([{ role: "you", text: value }, { role: "rouda", text }]);
    } finally {
      setBusy(false);
    }
  };

  const askMore = async (mine?: string) => {
    if (busy) return;
    const next = mine?.trim()
      ? [...thread, { role: "you" as const, text: mine.trim() }]
      : thread;
    setThread(next); setMore(""); setBusy(true); setNote("");
    try {
      const res = await fetch("/api/rouda", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "talk", question: isAR ? a.q_ar : a.q_en,
          answer: value, thread: next, lang: isAR ? "ar" : "en",
        }),
      });
      if (res.status === 429) { setNote(isAR ? BUSY_MSG.ar : BUSY_MSG.en); return; }
      const out = res.ok ? await res.json().catch(() => null) : null;
      const text = typeof out?.say === "string" && out.say.trim()
        ? out.say.trim()
        : (isAR ? WHY.ar : WHY.en);
      setThread(t => [...t, { role: "rouda", text }]);
    } catch {
      setThread(t => [...t, { role: "rouda", text: isAR ? WHY.ar : WHY.en }]);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 16, fontWeight: 700, color: M.heading,
        lineHeight: 1.5, marginBottom: a.hint_en ? 5 : 10, fontFamily: sans,
      }}>
        {isAR ? a.q_ar : a.q_en}
      </div>
      {a.hint_en && (
        <div style={{ fontSize: 13.5, color: M.body, marginBottom: 10, fontStyle: "italic", fontFamily: sans }}>
          {isAR ? a.hint_ar : a.hint_en}
        </div>
      )}

      {a.choices ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {a.choices.map((c, i) => {
            const on = picked === i;
            return (
              <button key={i} onClick={() => onPick(i)} style={{
                font: "inherit", fontFamily: sans, fontSize: 14.5, fontWeight: 700,
                cursor: "pointer", minHeight: 48, padding: "0 20px", borderRadius: R.pill,
                background: on ? accent.deep : M.card,
                color: on ? "#FFFDF8" : M.heading,
                border: `2px solid ${on ? accent.deep : "rgba(42,35,28,.12)"}`,
                transition: "background .18s, color .18s, border-color .18s",
              }}>
                {isAR ? c.ar : c.en}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={value}
            onChange={e => onText(e.target.value)}
            rows={3}
            placeholder={isAR ? "اكتب هنا" : "Write here"}
            style={{
              flex: 1, minWidth: 0, resize: "vertical", boxSizing: "border-box",
              padding: "13px 16px", borderRadius: 16, fontFamily: sans,
              border: `2px solid ${settled ? accent.tint : written ? accent.soft : "rgba(42,35,28,.12)"}`,
              background: M.page, color: M.heading, fontSize: 15.5, lineHeight: 1.6,
            }}
          />
          <button
            onClick={send}
            disabled={!written || busy}
            aria-label={isAR ? "أرسل" : "Send"}
            style={{
              width: 52, height: 52, borderRadius: "50%", border: "none", flex: "none",
              cursor: written && !busy ? "pointer" : "default",
              background: written && !busy ? accent.deep : "rgba(42,35,28,.1)",
              color: "#FFFDF8", display: "grid", placeItems: "center",
            }}
          >
            {busy
              ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ display: "grid" }}><Loader2 size={19} /></motion.span>
              : <Send size={19} />}
          </button>
        </div>
      )}

      {/* Not her, so not in her bubble: the request never reached her. */}
      {note && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: R.panel,
          background: "rgba(42,35,28,.04)", border: "1px solid rgba(42,35,28,.10)",
          fontSize: 13.5, lineHeight: 1.55, color: M.body, fontFamily: sans,
        }}>
          {note}
        </div>
      )}

      {/* what comes back: written for a choice, hers for free text */}
      <AnimatePresence>
        {(busy || (chosenReact ?? said).trim().length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 330, damping: 24 }}
            style={{
              display: "flex", gap: 12, alignItems: "flex-start", marginTop: 12,
              padding: "13px 16px", borderRadius: R.panel,
              background: rouda || !a.choices ? HUES.green.wash : hue.wash,
              border: `1px solid ${verdict === "off" ? HUES.green.soft : (rouda || !a.choices ? HUES.green.tint : hue.tint)}`,
            }}
          >
            <Portrait who={a.choices ? (rouda ? "rouda" : "hamad") : "rouda"} thinking={busy} size={36} />
            <span style={{ fontSize: 14.5, lineHeight: 1.6, color: M.heading, fontFamily: sans, paddingTop: 3 }}>
              {busy ? (isAR ? "لحظة، أقرأ..." : "One second, reading...") : (chosenReact ?? said)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* she does not have to stop when the question is answered */}
      {settled && !a.choices && (
        <div style={{ marginTop: 12 }}>
          {thread.slice(2).map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10,
                padding: "12px 15px", borderRadius: R.panel,
                background: t.role === "rouda" ? HUES.green.wash : M.page,
                border: t.role === "rouda" ? `1px solid ${HUES.green.tint}` : "1px solid rgba(42,35,28,.07)",
              }}>
              {t.role === "rouda" && <Portrait who="rouda" size={32} />}
              <span style={{ fontSize: 14.5, lineHeight: 1.6, color: M.heading, fontFamily: sans, paddingTop: 2 }}>
                {t.text}
              </span>
            </motion.div>
          ))}

          {thread.length > 2 ? (
            <div style={{ display: "flex", gap: 9, alignItems: "flex-end" }}>
              <textarea value={more} onChange={e => setMore(e.target.value)} rows={2}
                placeholder={isAR ? "أجبها" : "Answer her"}
                style={{
                  flex: 1, minWidth: 0, resize: "vertical", boxSizing: "border-box",
                  padding: "11px 14px", borderRadius: 14, fontFamily: sans, fontSize: 14.5,
                  lineHeight: 1.6, border: `2px solid ${HUES.green.tint}`,
                  background: M.page, color: M.heading,
                }} />
              <button onClick={() => askMore(more)} disabled={!more.trim() || busy}
                aria-label={isAR ? "أرسل" : "Send"}
                style={{
                  width: 46, height: 46, borderRadius: "50%", border: "none", flex: "none",
                  cursor: more.trim() && !busy ? "pointer" : "default",
                  background: more.trim() && !busy ? HUES.green.deep : "rgba(42,35,28,.1)",
                  color: "#FFFDF8", display: "grid", placeItems: "center",
                }}>
                {busy ? <Loader2 size={17} /> : <Send size={17} />}
              </button>
            </div>
          ) : (
            <button onClick={() => askMore()} disabled={busy} style={{
              display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44,
              padding: "0 18px", borderRadius: R.pill, cursor: busy ? "default" : "pointer",
              background: "transparent", border: `2px solid ${HUES.green.soft}`,
              color: HUES.green.deep, fontFamily: sans, fontSize: 14, fontWeight: 800,
            }}>
              {busy ? <Loader2 size={16} /> : <MessageCirclePlus size={16} />}
              {isAR ? "اسأليني سؤالاً آخر" : "Ask me one more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
