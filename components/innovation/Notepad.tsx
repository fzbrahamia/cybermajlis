"use client";

/* The notepad, on every page of the track.

   It belongs to nothing: not to a case, not to a lesson, not to an assessment.
   Nobody reads it and nothing is scored. That is the point of it, and it is why
   it has to be reachable from everywhere rather than living inside one page. */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { NotebookPen, X, Minus, Plus, GripHorizontal } from "lucide-react";
import { M, sans, mono, R, type Hue } from "./theme";

const KEY = "mj-notes";
type Note = { id: string; text: string; at: number };

export default function Notepad({ hue }: { hue: Hue }) {
  const isAR = useLocale() === "ar";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch { /* private mode */ }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch { /* private mode */ }
  }, [mounted, notes]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!drag.current) return;
      setPos({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
    };
    const up = () => { drag.current = null; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    setNotes(n => [{ id: String(Date.now()), text: t, at: Date.now() }, ...n]);
    setDraft("");
  };

  if (!mounted) return null;

  const ui = (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="tab"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            whileHover={{ y: -3 }}
            onClick={() => setOpen(true)}
            title={isAR ? "دفترك" : "Your notes"}
            style={{
              position: "fixed", insetInlineEnd: 20, bottom: 84, zIndex: 900,
              width: 52, height: 52, borderRadius: "50%", padding: 0, cursor: "pointer",
              display: "grid", placeItems: "center",
              background: M.card, border: `2px solid ${hue.soft}`, color: hue.deep,
              boxShadow: "0 2px 0 rgba(0,0,0,.05), 0 10px 24px rgba(58,44,28,.14)",
            }}
          >
            <NotebookPen size={20} />
            {notes.length > 0 && (
              <span style={{
                position: "absolute", top: -3, insetInlineEnd: -3,
                fontFamily: mono, fontSize: 10, fontWeight: 600, minWidth: 18,
                background: hue.deep, color: "#FFFDF8", borderRadius: 999, padding: "2px 5px",
              }}>{notes.length}</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="pad"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{
              position: "fixed", insetInlineEnd: 20, bottom: 84, zIndex: 900,
              width: "min(340px, calc(100vw - 44px))",
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              background: M.card, borderRadius: R.card,
              border: `1px solid rgba(42,35,28,.10)`,
              boxShadow: "0 4px 10px rgba(58,44,28,.07), 0 26px 60px rgba(58,44,28,.18)",
              overflow: "hidden",
            }}
          >
            <div
              onMouseDown={e => { drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }; }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "13px 15px",
                background: hue.wash, borderBottom: `1px solid rgba(42,35,28,.07)`, cursor: "grab",
              }}
            >
              <GripHorizontal size={15} color={hue.deep} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: M.heading, fontFamily: sans }}>
                {isAR ? "دفترك" : "Your notes"}
              </span>
              <button onClick={() => setOpen(false)} aria-label={isAR ? "إغلاق" : "Close"}
                style={{ background: "none", border: "none", cursor: "pointer", color: M.body, padding: 4 }}>
                <Minus size={16} />
              </button>
            </div>

            <div style={{ padding: "13px 15px", display: "flex", gap: 8 }}>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") add(); }}
                placeholder={isAR ? "اكتب أي شيء" : "Write anything"}
                style={{
                  flex: 1, minWidth: 0, boxSizing: "border-box", padding: "11px 13px",
                  borderRadius: 12, border: `1px solid rgba(42,35,28,.12)`,
                  background: M.page, color: M.heading, font: "inherit",
                  fontFamily: sans, fontSize: 14,
                }}
              />
              <button onClick={add} aria-label={isAR ? "أضف" : "Add"}
                style={{
                  width: 42, borderRadius: 12, border: "none", cursor: "pointer",
                  background: hue.deep, color: "#FFFDF8", display: "grid", placeItems: "center",
                }}>
                <Plus size={17} />
              </button>
            </div>

            <div style={{ maxHeight: 260, overflowY: "auto", padding: "0 15px 15px", display: "flex", flexDirection: "column", gap: 8 }}>
              {notes.length === 0 && (
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: M.body, fontFamily: sans, padding: "6px 2px" }}>
                  {isAR
                    ? "يتبعك هذا الدفتر في كل صفحة. لا أحد يقرؤه."
                    : "This follows you on every page. Nobody reads it."}
                </div>
              )}
              {notes.map(n => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: "flex", gap: 9, alignItems: "flex-start",
                    padding: "11px 13px", background: M.page, borderRadius: 13,
                  }}
                >
                  <span style={{ flex: 1, fontSize: 13.5, lineHeight: 1.55, color: M.heading, fontFamily: sans }}>
                    {n.text}
                  </span>
                  <button onClick={() => setNotes(list => list.filter(x => x.id !== n.id))}
                    aria-label={isAR ? "حذف" : "Delete"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(42,35,28,.3)", padding: 2 }}>
                    <X size={13} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(ui, document.body);
}
