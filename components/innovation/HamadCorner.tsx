"use client";

/* Hamad in the corner, for anything.

   Different from the panel under a film: that one is scoped to the mechanism
   in front of you. This one is for wandering questions, on any Majlis page,
   about anything the platform covers. Same agent, no lesson context. */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { Send, X, Loader2 } from "lucide-react";
import { M, sans, R, HUES, type Hue } from "./theme";

const FACE = "/characters/HamadAvatars/hamad-1.png";
type Turn = { role: "you" | "hamad"; text: string };

export default function HamadCorner({ hue }: { hue: Hue }) {
  const isAR = useLocale() === "ar";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [turns, busy]);

  // the Help button elsewhere on the site already fires this
  useEffect(() => {
    const openMe = () => setOpen(true);
    window.addEventListener("cm:open-chat", openMe);
    return () => window.removeEventListener("cm:open-chat", openMe);
  }, []);

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
        body: JSON.stringify({ question: q, lang: isAR ? "ar" : "en", history }),
      });
      const out = await res.json();
      setTurns(t => [...t, { role: "hamad", text: out?.say ?? "" }]);
    } catch {
      setTurns(t => [...t, { role: "hamad", text: isAR ? "لا أستطيع الرد الآن." : "I cannot answer right now." }]);
    } finally { setBusy(false); }
  };

  if (!mounted) return null;

  const ui = (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="tab"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ y: -3 }}
            onClick={() => setOpen(true)}
            aria-label={isAR ? "اسأل حمد" : "Ask Hamad"}
            title={isAR ? "اسأل حمد" : "Ask Hamad"}
            style={{
              position: "fixed", insetInlineEnd: 20, bottom: 20, zIndex: 900,
              width: 52, height: 52, borderRadius: "50%", padding: 0, cursor: "pointer",
              overflow: "hidden", background: M.card,
              border: `2px solid ${HUES.gold.mid}`,
              boxShadow: "0 2px 0 rgba(0,0,0,.05), 0 10px 24px rgba(58,44,28,.16)",
            }}
          >
            <img src={FACE} alt="" width={52} height={52}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{
              position: "fixed", insetInlineEnd: 22, bottom: 22, zIndex: 900,
              width: "min(370px, calc(100vw - 44px))",
              background: "#FFFFFF", borderRadius: R.card,
              border: `2px solid ${HUES.gold.mid}`,
              boxShadow: "0 4px 10px rgba(58,44,28,.07), 0 26px 60px rgba(58,44,28,.20)",
              overflow: "hidden", direction: isAR ? "rtl" : "ltr",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 11, padding: "14px 16px",
              background: HUES.gold.wash, borderBottom: `1px solid ${HUES.gold.tint}`,
            }}>
              <span style={{
                width: 34, height: 34, borderRadius: "50%", overflow: "hidden",
                border: `2px solid ${HUES.gold.mid}`, display: "block", flex: "none",
              }}>
                <img src={FACE} alt="" width={34} height={34}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 900, color: HUES.gold.deep, fontFamily: sans }}>
                {isAR ? "حمد" : "Hamad"}
              </span>
              <button onClick={() => setOpen(false)} aria-label={isAR ? "إغلاق" : "Close"}
                style={{ background: "none", border: "none", cursor: "pointer", color: M.body, padding: 4 }}>
                <X size={17} />
              </button>
            </div>

            <div style={{ padding: "16px 18px", maxHeight: 340, minHeight: 120, overflowY: "auto" }}>
              {turns.length === 0 && (
                <div style={{ fontSize: 14.5, lineHeight: 1.6, color: M.body, fontFamily: sans }}>
                  {isAR
                    ? "اسألني عن أي شيء هنا، أو عن أي مجال نُدرّسه."
                    : "Ask me about anything here, or about any domain we teach."}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <AnimatePresence initial={false}>
                  {turns.map((t, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        alignSelf: t.role === "you" ? "flex-end" : "flex-start",
                        maxWidth: "88%", padding: "12px 15px",
                        borderRadius: t.role === "you" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: t.role === "you" ? HUES.gold.tint : M.page,
                        fontSize: 14.5, lineHeight: 1.6, color: M.heading, fontFamily: sans,
                      }}>
                      {t.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {busy && (
                  <div style={{
                    alignSelf: "flex-start", display: "flex", gap: 5, padding: "14px 16px",
                    borderRadius: "16px 16px 16px 4px", background: M.page,
                  }}>
                    {[0, 1, 2].map(i => (
                      <motion.span key={i}
                        animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.16 }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: HUES.gold.mid, display: "block" }} />
                    ))}
                  </div>
                )}
              </div>
              <div ref={end} />
            </div>

            <div style={{
              display: "flex", gap: 9, padding: "13px 16px",
              borderTop: `1px solid ${HUES.gold.tint}`, background: "#FFFFFF",
            }}>
              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") send(); }}
                placeholder={isAR ? "اكتب سؤالك" : "Type your question"}
                style={{
                  flex: 1, minWidth: 0, boxSizing: "border-box", padding: "12px 15px",
                  borderRadius: R.pill, fontFamily: sans, fontSize: 15,
                  border: `2px solid ${HUES.gold.tint}`, background: M.page, color: M.heading,
                }} />
              <button onClick={send} disabled={!text.trim() || busy} aria-label={isAR ? "أرسل" : "Send"}
                style={{
                  width: 46, height: 46, borderRadius: "50%", border: "none", flex: "none",
                  cursor: text.trim() && !busy ? "pointer" : "default",
                  background: text.trim() && !busy ? HUES.gold.deep : "rgba(42,35,28,.1)",
                  color: "#FFFDF8", display: "grid", placeItems: "center",
                }}>
                {busy ? <Loader2 size={18} /> : <Send size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(ui, document.body);
}
