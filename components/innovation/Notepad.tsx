"use client";

/* The notepad, on every page of the track.

   It belongs to nothing: not to a case, not to a lesson, not to an assessment.
   Nobody reads it and nothing is scored. That is the point of it, and it is why
   it has to be reachable from everywhere rather than living inside one page.

   It now holds folders, ticks and a search, because a pad that only ever adds
   to one endless list stops being usable at about thirty notes, which is where
   a child who actually uses it arrives in a week. */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import {
  NotebookPen, X, Minus, Plus, GripHorizontal,
  Search, Check, Folder, ListTodo,
} from "lucide-react";
import { M, sans, mono, R, type Hue } from "./theme";

const KEY = "mj-notes";
const ALL = "__all";

type Note = {
  id: string;
  text: string;
  at: number;
  /** Empty string means loose, not filed. Older notes have no folder at all. */
  folder?: string;
  done?: boolean;
};

export default function Notepad({ hue }: { hue: Hue }) {
  const isAR = useLocale() === "ar";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<string>(ALL);
  const [q, setQ] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [naming, setNaming] = useState(false);
  const [newFolder, setNewFolder] = useState("");
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

  /* Folders exist because notes are in them. There is no separate list to keep
     in step, so a folder cannot go missing while its notes are still there. */
  const folders = useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) if (n.folder?.trim()) set.add(n.folder.trim());
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return notes.filter(n => {
      if (tab !== ALL && (n.folder ?? "") !== tab) return false;
      if (onlyOpen && n.done) return false;
      if (needle && !n.text.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [notes, tab, q, onlyOpen]);

  const openCount = notes.filter(n => !n.done).length;

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    // A note written while a folder is open belongs to that folder.
    setNotes(n => [{
      id: String(Date.now()), text: t, at: Date.now(),
      folder: tab === ALL ? "" : tab,
    }, ...n]);
    setDraft("");
  };

  const makeFolder = () => {
    const name = newFolder.trim();
    if (!name) { setNaming(false); return; }
    // A folder with nothing in it cannot survive a reload, so it opens with
    // the note that made it rather than as an empty shelf.
    setNotes(n => [{ id: String(Date.now()), text: name, at: Date.now(), folder: name }, ...n]);
    setTab(name); setNewFolder(""); setNaming(false);
  };

  const move = (id: string, folder: string) =>
    setNotes(list => list.map(n => (n.id === id ? { ...n, folder } : n)));

  if (!mounted) return null;

  const tabStyle = (on: boolean): React.CSSProperties => ({
    font: "inherit", fontFamily: sans, fontSize: 12.5, fontWeight: 700,
    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
    padding: "6px 11px", borderRadius: 999,
    background: on ? hue.deep : "transparent",
    color: on ? "#FFFDF8" : M.body,
    border: `1px solid ${on ? hue.deep : "rgba(42,35,28,.12)"}`,
  });

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
            {openCount > 0 && (
              <span style={{
                position: "absolute", top: -3, insetInlineEnd: -3,
                fontFamily: mono, fontSize: 10, fontWeight: 600, minWidth: 18,
                background: hue.deep, color: "#FFFDF8", borderRadius: 999, padding: "2px 5px",
              }}>{openCount}</span>
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
              width: "min(360px, calc(100vw - 44px))",
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

            {/* folders. Only appear once there is more than one thing to sort. */}
            {(folders.length > 0 || notes.length > 2) && (
              <div style={{
                display: "flex", gap: 6, padding: "11px 15px 0",
                overflowX: "auto", alignItems: "center",
              }}>
                <button onClick={() => setTab(ALL)} style={tabStyle(tab === ALL)}>
                  {isAR ? "الكل" : "All"}
                </button>
                {folders.map(f => (
                  <button key={f} onClick={() => setTab(f)} style={tabStyle(tab === f)}>
                    {f}
                  </button>
                ))}
                {naming ? (
                  <input
                    autoFocus value={newFolder}
                    onChange={e => setNewFolder(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") makeFolder(); if (e.key === "Escape") setNaming(false); }}
                    onBlur={makeFolder}
                    placeholder={isAR ? "اسم المجلد" : "Folder name"}
                    style={{
                      width: 110, flexShrink: 0, boxSizing: "border-box",
                      padding: "6px 10px", borderRadius: 999, font: "inherit",
                      fontFamily: sans, fontSize: 12.5,
                      border: `1px solid ${hue.soft}`, background: M.page, color: M.heading,
                    }} />
                ) : (
                  <button onClick={() => setNaming(true)}
                    title={isAR ? "مجلد جديد" : "New folder"}
                    style={{ ...tabStyle(false), display: "grid", placeItems: "center", padding: "6px 9px" }}>
                    <Folder size={13} />
                  </button>
                )}
              </div>
            )}

            {/* search, once there is enough to lose something in */}
            {notes.length > 4 && (
              <div style={{ display: "flex", gap: 7, padding: "11px 15px 0", alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                  <Search size={13} style={{
                    position: "absolute", insetInlineStart: 11, color: "rgba(42,35,28,.34)", pointerEvents: "none",
                  }} />
                  <input
                    value={q} onChange={e => setQ(e.target.value)}
                    placeholder={isAR ? "ابحث" : "Search"}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "8px 12px", paddingInlineStart: 30,
                      borderRadius: 999, border: `1px solid rgba(42,35,28,.12)`,
                      background: M.page, color: M.heading, font: "inherit",
                      fontFamily: sans, fontSize: 13,
                    }} />
                </div>
                <button onClick={() => setOnlyOpen(v => !v)}
                  title={isAR ? "غير المنجزة فقط" : "Only unticked"}
                  style={{ ...tabStyle(onlyOpen), display: "grid", placeItems: "center", padding: "7px 9px" }}>
                  <ListTodo size={14} />
                </button>
              </div>
            )}

            <div style={{ padding: "11px 15px", display: "flex", gap: 8 }}>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") add(); }}
                placeholder={tab === ALL
                  ? (isAR ? "اكتب أي شيء" : "Write anything")
                  : (isAR ? `أضف إلى ${tab}` : `Add to ${tab}`)}
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

            <div style={{ maxHeight: 264, overflowY: "auto", padding: "0 15px 15px", display: "flex", flexDirection: "column", gap: 8 }}>
              {notes.length === 0 && (
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: M.body, fontFamily: sans, padding: "6px 2px" }}>
                  {isAR
                    ? "يتبعك هذا الدفتر في كل صفحة. لا أحد يقرؤه."
                    : "This follows you on every page. Nobody reads it."}
                </div>
              )}
              {notes.length > 0 && shown.length === 0 && (
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: M.body, fontFamily: sans, padding: "6px 2px" }}>
                  {isAR ? "لا شيء هنا." : "Nothing here."}
                </div>
              )}
              {shown.map(n => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: "flex", gap: 9, alignItems: "flex-start",
                    padding: "11px 13px", background: M.page, borderRadius: 13,
                  }}
                >
                  <button
                    onClick={() => setNotes(list => list.map(x => (x.id === n.id ? { ...x, done: !x.done } : x)))}
                    aria-label={isAR ? "تم" : "Done"}
                    title={isAR ? "علّمها كمنجزة" : "Tick it off"}
                    style={{
                      width: 18, height: 18, flexShrink: 0, marginTop: 1, padding: 0,
                      borderRadius: 6, cursor: "pointer",
                      display: "grid", placeItems: "center",
                      background: n.done ? hue.deep : "transparent",
                      border: `1.5px solid ${n.done ? hue.deep : "rgba(42,35,28,.22)"}`,
                      color: "#FFFDF8",
                    }}>
                    {n.done && <Check size={11} strokeWidth={3.5} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13.5, lineHeight: 1.55, fontFamily: sans,
                      color: n.done ? M.body : M.heading,
                      textDecoration: n.done ? "line-through" : "none",
                      wordBreak: "break-word",
                    }}>
                      {n.text}
                    </div>
                    {/* filing it away, without leaving the note */}
                    {(folders.length > 0 || tab !== ALL) && (
                      <select
                        value={n.folder ?? ""}
                        onChange={e => move(n.id, e.target.value)}
                        aria-label={isAR ? "المجلد" : "Folder"}
                        style={{
                          marginTop: 5, font: "inherit", fontFamily: sans, fontSize: 11,
                          color: M.body, background: "transparent",
                          border: "none", padding: 0, cursor: "pointer", maxWidth: "100%",
                        }}>
                        <option value="">{isAR ? "بدون مجلد" : "No folder"}</option>
                        {folders.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    )}
                  </div>

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
