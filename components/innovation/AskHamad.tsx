"use client";

/* Hamad, under the film.

   Not the floating corner chatbot. This is a panel that belongs to the lesson:
   white inside a gold frame, sitting directly under the video, so asking a
   question about the mechanism is part of watching it rather than a detour
   into a support widget. */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { Send, Loader2 } from "lucide-react";
import { M, sans, R, HUES } from "./theme";

const G = HUES.gold;
const FACE = "/characters/HamadAvatars/hamad-1.png";

type Turn = { role: "you" | "hamad"; text: string };

export default function AskHamad({
  about, opener_en, opener_ar,
}: {
  /** What the learner is looking at, so his answers stay on it. */
  about: string;
  opener_en?: string;
  opener_ar?: string;
}) {
  const isAR = useLocale() === "ar";
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [turns, busy]);

  const send = async () => {
    const q = text.trim();
    if (!q || busy) return;
    const history = turns;
    setTurns(t => [...t, { role: "you", text: q }]);
    setText(""); setBusy(true);
    try {
      const res = await fetch("/api/hamad", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q, about, lang: isAR ? "ar" : "en", history }),
      });
      const out = await res.json();
      setTurns(t => [...t, { role: "hamad", text: out?.say ?? "" }]);
    } catch {
      setTurns(t => [...t, { role: "hamad", text: isAR ? "لا أستطيع الرد الآن." : "I cannot answer right now." }]);
    } finally { setBusy(false); }
  };

  const opener = isAR
    ? (opener_ar ?? "لم يتضح شيء؟ اسألني.")
    : (opener_en ?? "Something not clear? Ask me.");

  return (
    <div style={{
      background: "#FFFFFF",
      border: `2px solid ${G.mid}`,
      borderRadius: R.card,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 18px", background: G.wash,
        borderBottom: `1px solid ${G.tint}`,
      }}>
        <span style={{
          width: 34, height: 34, borderRadius: "50%", overflow: "hidden",
          border: `2px solid ${G.mid}`, background: "#fff", flex: "none", display: "block",
        }}>
          <img src={FACE} alt="" width={34} height={34}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </span>
        <span style={{ fontSize: 15, fontWeight: 900, color: G.deep, fontFamily: sans }}>
          {isAR ? "اسأل حمد" : "Ask Hamad"}
        </span>
      </div>

      <div style={{ padding: "16px 18px", maxHeight: 320, overflowY: "auto" }}>
        {turns.length === 0 && (
          <div style={{ fontSize: 14.5, lineHeight: 1.6, color: M.body, fontFamily: sans }}>
            {opener}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AnimatePresence initial={false}>
            {turns.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  alignSelf: t.role === "you" ? (isAR ? "flex-start" : "flex-end") : (isAR ? "flex-end" : "flex-start"),
                  maxWidth: "86%",
                  padding: "12px 15px",
                  borderRadius: t.role === "you" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: t.role === "you" ? G.tint : M.page,
                  fontSize: 14.5, lineHeight: 1.6, color: M.heading, fontFamily: sans,
                }}
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                alignSelf: isAR ? "flex-end" : "flex-start",
                display: "flex", gap: 5, padding: "14px 16px",
                borderRadius: "16px 16px 16px 4px", background: M.page,
              }}>
              {[0, 1, 2].map(i => (
                <motion.span key={i}
                  animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.16 }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: G.mid, display: "block" }} />
              ))}
            </motion.div>
          )}
        </div>
        <div ref={end} />
      </div>

      <div style={{
        display: "flex", gap: 10, padding: "14px 18px",
        borderTop: `1px solid ${G.tint}`, background: "#FFFFFF",
      }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder={isAR ? "اكتب سؤالك" : "Type your question"}
          style={{
            flex: 1, minWidth: 0, boxSizing: "border-box", padding: "13px 16px",
            borderRadius: R.pill, fontFamily: sans, fontSize: 15,
            border: `2px solid ${G.tint}`, background: M.page, color: M.heading,
          }}
        />
        <button onClick={send} disabled={!text.trim() || busy}
          aria-label={isAR ? "أرسل" : "Send"}
          style={{
            width: 50, height: 50, borderRadius: "50%", border: "none", flex: "none",
            cursor: text.trim() && !busy ? "pointer" : "default",
            background: text.trim() && !busy ? G.deep : "rgba(42,35,28,.1)",
            color: "#FFFDF8", display: "grid", placeItems: "center",
          }}>
          {busy ? <Loader2 size={19} /> : <Send size={19} />}
        </button>
      </div>
    </div>
  );
}
