"use client";

/* Mine.

   Everything of the learner's in one room: what they are working on, what they
   noticed, who they asked, and the record of it. Collecting problems is
   pointless unless collecting leads somewhere, so every problem here carries
   the same short path. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronRight, ChevronDown } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { Stagger, Rise, Lift, RoomHead, Says, Sticker } from "@/components/innovation/Alive";
import { CASES } from "@/app/lib/domainData";
import { M, sans, HUES, R, card, flat, btn, ghost, chip, quiet, label } from "@/components/innovation/theme";

const H = HUES.blue;
const KEY = "mj-mine";

const DECIDED_EN: Record<string, string> = {
  keep: "You decided to keep going", change: "You decided to change it", drop: "You decided to drop it",
};
const DECIDED_AR: Record<string, string> = {
  keep: "قررت أن تكمل", change: "قررت أن تغيّرها", drop: "قررت أن تتركها",
};

type Entry = { id: string; what: string; who: string; often: string; instead: string };
type Answer = { id: string; q: string; a: string };
type Posted = { id: string; what: string; who: string; at: number };
/* One sheet per person asked. It used to be one set of answers for the whole
   account, so interviewing a second person overwrote the first, and asking
   about two different problems was impossible to tell apart afterwards. */
type Sheet = { id: string; person?: string; about?: string; at: number; a?: Record<string, string> };
type Mine = { log?: Entry[]; answers?: Answer[]; sheets?: Sheet[]; posted?: Posted[] };

/* The three that always get asked, and room for whatever else they asked. */
const FIXED = [
  { en: "Show me the last time this happened.", ar: "أرني آخر مرة حدث فيها هذا." },
  { en: "What do you do about it now?", ar: "ماذا تفعل حياله الآن؟" },
  { en: "What would you never give up?", ar: "ما الذي لن تتخلى عنه أبداً؟" },
];

function Field(p: { v: string; set: (v: string) => void; ph: string; wide?: boolean }) {
  return (
    <input value={p.v} onChange={e => p.set(e.target.value)} placeholder={p.ph}
      style={{
        flex: p.wide ? 2 : 1, minWidth: p.wide ? 200 : 120, boxSizing: "border-box",
        padding: "12px 15px", borderRadius: 14, fontFamily: sans, fontSize: 14.5,
        border: "2px solid rgba(42,35,28,.12)", background: M.page, color: M.heading,
      }} />
  );
}

export default function MinePage() {
  const isAR = useLocale() === "ar";
  const [mine, setMine] = useState<Mine>({});
  const [ready, setReady] = useState(false);
  const [runs, setRuns] = useState<{ id: string; title: string; stage: number; done: boolean; gap?: string; v1?: string; v2?: string }[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Entry>({ id: "", what: "", who: "", often: "", instead: "" });

  useEffect(() => {
    try { setMine(JSON.parse(localStorage.getItem(KEY) ?? "{}")); } catch { /* private mode */ }
    const out = [];
    for (const c of CASES) {
      try {
        const raw = localStorage.getItem(`mj-case-${c.id}`);
        if (!raw) continue;
        const s = JSON.parse(raw); const a = s.ans ?? {};
        out.push({
          id: c.id, title: isAR ? c.title_ar : c.title_en,
          stage: s.stage ?? 0, done: (s.stage ?? 0) >= 10,
          gap: a.gap, v1: a.what, v2: a.precise,
        });
      } catch { /* private mode */ }
    }
    setRuns(out); setReady(true);
  }, [isAR]);

  const save = (next: Mine) => {
    setMine(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
  };

  const addEntry = () => {
    if (!draft.what.trim()) return;
    save({ ...mine, log: [{ ...draft, id: String(Date.now()) }, ...(mine.log ?? [])] });
    setDraft({ id: "", what: "", who: "", often: "", instead: "" });
  };

  /* Anything written before sheets existed becomes the first sheet, so nobody
     loses what they already asked somebody. */
  const sheets: Sheet[] = mine.sheets ?? ((mine.answers ?? []).length
    ? [{
        id: "first", at: 0, person: "",
        a: Object.fromEntries((mine.answers ?? []).map(x => [x.q, x.a])),
      }]
    : []);

  const putSheets = (list: Sheet[]) => save({ ...mine, sheets: list, answers: [] });
  const newSheet = () => {
    const id = String(Date.now());
    putSheets([{ id, at: Date.now(), person: "", about: "", a: {} }, ...sheets]);
    setOpen(id);
  };
  const setSheet = (id: string, patch: Partial<Sheet>) =>
    putSheets(sheets.map(x => (x.id === id ? { ...x, ...patch } : x)));
  const dropSheet = (id: string) => putSheets(sheets.filter(x => x.id !== id));

  const collected: Posted[] = mine.posted ?? [];
  /* How far each collected problem has actually got. Reading it here is what
     turns a list of problems into a list of things in progress. */
  const [work, setWork] = useState<Record<string, { at?: number; decision?: string }>>({});
  useEffect(() => {
    const out: Record<string, { at?: number; decision?: string }> = {};
    for (const c of collected) {
      try {
        const raw = localStorage.getItem(`mj-problem-${c.id}`);
        if (raw) { const p = JSON.parse(raw); out[c.id] = { at: p.at, decision: p.decision }; }
      } catch { /* private mode */ }
    }
    setWork(out);
  }, [mine.posted]);
  const finished = runs.filter(r => r.done).length;

  return (
    <InnovationPage>
      <RoomHead hue={H}
        eyebrow={isAR ? "شغلي" : "My work"}
        title={isAR ? "ما تعمل عليه الآن" : "What you are working on"} />

      {/* This room is the desk. The record of what you have been through is a
          different thing and lives in its own room. */}
      <Link href="/mine/passport" style={{ ...chip(H), marginTop: 18, textDecoration: "none" }}>
        {isAR ? "جوازك" : "Your passport"}<ChevronRight size={15} />
      </Link>

      {!ready && <div style={{ marginTop: 26, color: M.body }}>...</div>}

      {ready && (
        <Stagger gap={0.08}>
          {finished > 0 && (
            <Rise style={{ marginTop: 26 }}>
              <Sticker seed={finished} isAR={isAR} who="rouda" />
            </Rise>
          )}

          {/* what you are in the middle of */}
          {runs.length > 0 && (
            <Rise>
              <div style={{ marginTop: 26 }}>
                <div style={{ ...label, marginBottom: 12 }}>{isAR ? "قضايا فتحتها" : "Cases you opened"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {runs.map(r => (
                    <div key={r.id} style={{ ...card, padding: "20px 22px" }}>
                      <span style={r.done ? chip(H, true) : quiet}>
                        {r.done ? (isAR ? "مكتمل" : "Finished") : `${r.stage + 1} / 11`}
                      </span>
                      <div style={{
                        fontSize: 16.5, fontWeight: 900, color: M.heading, lineHeight: 1.4,
                        margin: "12px 0", maxWidth: "32ch", fontFamily: sans,
                      }}>{r.title}</div>
                      {r.gap && (
                        <div style={{ padding: "14px 16px", borderRadius: R.chip, background: H.tint, marginBottom: 12 }}>
                          <div style={{ ...label, fontSize: 9, marginBottom: 6, color: H.deep }}>
                            {isAR ? "ما وجدته ناقصاً" : "What you found missing"}
                          </div>
                          <div style={{ fontSize: 14.5, lineHeight: 1.6, color: M.heading, fontWeight: 600, fontFamily: sans }}>
                            {r.gap}
                          </div>
                        </div>
                      )}
                      <Link href={`/learn/cybersecurity/case/${r.id}`} style={{ ...chip(H), textDecoration: "none" }}>
                        {r.done ? (isAR ? "افتحها" : "Open") : (isAR ? "أكملها" : "Continue")}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </Rise>
          )}

          {/* problems you collected, each with the same short path */}
          <Rise>
            <div style={{ marginTop: 30 }}>
              <div style={{ ...label, marginBottom: 12 }}>{isAR ? "مشكلات جمعتها" : "Problems you collected"}</div>
              {collected.length === 0 ? (
                <div style={{ ...flat, padding: "22px 24px" }}>
                  <p style={{ margin: "0 0 16px", fontSize: 14.5, lineHeight: 1.65, color: M.body, fontFamily: sans }}>
                    {isAR ? "لم تجمع شيئاً بعد." : "Nothing collected yet."}
                  </p>
                  <Link href="/board" style={btn(H)}>{isAR ? "افتح المجتمع" : "Open Community"}</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {collected.map(c => {
                    const w = work[c.id];
                    const done = w?.decision;
                    return (
                      <Link key={c.id} href={`/mine/problem/${c.id}`} style={{ textDecoration: "none" }}>
                        <div style={{
                          ...card, padding: "20px 22px", display: "flex",
                          alignItems: "center", gap: 14, flexWrap: "wrap",
                        }}>
                          <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: M.heading, lineHeight: 1.4, fontFamily: sans }}>
                              {c.what}
                            </div>
                            {c.who && (
                              <div style={{ fontSize: 13.5, color: M.body, marginTop: 4, fontFamily: sans }}>
                                {isAR ? "يحدث لـ " : "Happens to "}{c.who}
                              </div>
                            )}
                            <div style={{ fontSize: 13, color: done ? H.deep : M.body, marginTop: 8, fontFamily: sans, fontWeight: done ? 700 : 400 }}>
                              {done
                                ? (isAR ? DECIDED_AR[done] : DECIDED_EN[done])
                                : w
                                  ? (isAR ? `توقفت عند الخطوة ${(w.at ?? 0) + 1}` : `You stopped at step ${(w.at ?? 0) + 1}`)
                                  : (isAR ? "لم تبدأ بعد" : "Not started")}
                            </div>
                          </div>
                          <ChevronRight size={18} color={H.deep} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </Rise>

          {/* the friction log */}
          <Rise>
            <div style={{ marginTop: 30 }}>
              <div style={{ ...label, marginBottom: 6 }}>{isAR ? "سجل ما يسوء" : "What goes wrong"}</div>
              <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: M.body, maxWidth: "44ch", fontFamily: sans }}>
                {isAR
                  ? "العمود الأخير هو المهم: ماذا يفعل الناس بدلاً من ذلك."
                  : "The last box is the one that matters: what people do instead."}
              </p>

              <div style={{ ...card, padding: "20px 22px", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <Field v={draft.what} set={v => setDraft(d => ({ ...d, what: v }))} wide
                    ph={isAR ? "ما الذي حدث؟" : "What happened?"} />
                  <Field v={draft.who} set={v => setDraft(d => ({ ...d, who: v }))}
                    ph={isAR ? "لمن؟" : "To whom?"} />
                  <Field v={draft.often} set={v => setDraft(d => ({ ...d, often: v }))}
                    ph={isAR ? "كم مرة؟" : "How often?"} />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Field v={draft.instead} set={v => setDraft(d => ({ ...d, instead: v }))} wide
                    ph={isAR ? "ماذا فعلوا بدلاً من ذلك؟" : "What did they do instead?"} />
                  <button onClick={addEntry} disabled={!draft.what.trim()}
                    style={{ ...btn(H), opacity: draft.what.trim() ? 1 : 0.4 }}>
                    <Plus size={17} />{isAR ? "أضف" : "Add"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(mine.log ?? []).map((e, i) => (
                  <div key={e.id} style={{
                    ...flat, padding: "16px 18px",
                    borderColor: e.instead.trim() ? "rgba(42,35,28,.07)" : HUES.gold.soft,
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ ...quiet, flex: "none" }}>{String(i + 1).padStart(2, "0")}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: M.heading, lineHeight: 1.45, fontFamily: sans }}>
                          {e.what}
                        </div>
                        <div style={{ fontSize: 13, color: M.body, marginTop: 4, fontFamily: sans }}>
                          {[e.who, e.often].filter(Boolean).join(" · ")}
                        </div>
                        <div style={{
                          fontSize: 13.5, marginTop: 8, fontFamily: sans, lineHeight: 1.55,
                          color: e.instead.trim() ? M.heading : HUES.gold.deep,
                          fontWeight: e.instead.trim() ? 600 : 400,
                          fontStyle: e.instead.trim() ? "normal" : "italic",
                        }}>
                          {e.instead.trim() || (isAR ? "لم تكتب ماذا فعلوا بدلاً من ذلك" : "You did not say what they do instead")}
                        </div>
                      </div>
                      <button onClick={() => save({ ...mine, log: (mine.log ?? []).filter(x => x.id !== e.id) })}
                        aria-label={isAR ? "حذف" : "Delete"}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(42,35,28,.3)" }}>
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Rise>

          {/* the interview sheet, one sheet per person you asked */}
          <Rise>
            <div style={{ marginTop: 30 }}>
              <div style={{ ...label, marginBottom: 6 }}>{isAR ? "من سألت" : "People you asked"}</div>
              <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: M.body, maxWidth: "44ch", fontFamily: sans }}>
                {isAR
                  ? "ورقة لكل شخص. اسأل عشرة عن المشكلة نفسها وسترى ما يتكرر."
                  : "One sheet per person. Ask ten people about the same problem and you start to see what repeats."}
              </p>

              {sheets.length === 0 && (
                <div style={{ ...flat, padding: "20px 22px", marginBottom: 12, fontSize: 14.5, lineHeight: 1.6, color: M.body }}>
                  {isAR ? "لم تسأل أحداً بعد." : "You have not asked anybody yet."}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sheets.map(sh => {
                  const isOpen = open === sh.id;
                  const filled = FIXED.filter(q => sh.a?.[q.en]?.trim()).length;
                  return (
                    <div key={sh.id} style={{ ...card, padding: 0, overflow: "hidden" }}>
                      <button onClick={() => setOpen(isOpen ? null : sh.id)} style={{
                        width: "100%", textAlign: isAR ? "right" : "left", cursor: "pointer",
                        border: "none", background: isOpen ? H.tint : "transparent",
                        padding: "18px 20px", font: "inherit", fontFamily: sans,
                        display: "flex", alignItems: "center", gap: 12,
                      }}>
                        <span style={{ flex: 1 }}>
                          <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: M.heading }}>
                            {sh.person?.trim() || (isAR ? "بدون اسم" : "No name yet")}
                          </span>
                          <span style={{ display: "block", fontSize: 13, color: M.body, marginTop: 3 }}>
                            {sh.about?.trim()
                              ? sh.about
                              : (isAR ? "لم تقل عن ماذا" : "You did not say what about")}
                            {" · "}
                            {isAR ? `${filled} من ${FIXED.length}` : `${filled} of ${FIXED.length}`}
                          </span>
                        </span>
                        {isOpen ? <ChevronDown size={18} color={H.deep} /> : <ChevronRight size={18} color={M.body} />}
                      </button>

                      {isOpen && (
                        <div style={{ padding: "4px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <Field v={sh.person ?? ""} set={v => setSheet(sh.id, { person: v })}
                              ph={isAR ? "من سألت" : "Who you asked"} />
                            <Field v={sh.about ?? ""} set={v => setSheet(sh.id, { about: v })} wide
                              ph={isAR ? "عن أي مشكلة" : "About which problem"} />
                          </div>
                          {FIXED.map(q => (
                            <div key={q.en}>
                              <div style={{ fontSize: 14.5, fontWeight: 700, color: M.heading, marginBottom: 7, fontFamily: sans }}>
                                {isAR ? q.ar : q.en}
                              </div>
                              <textarea
                                value={sh.a?.[q.en] ?? ""}
                                onChange={e => setSheet(sh.id, { a: { ...(sh.a ?? {}), [q.en]: e.target.value } })}
                                rows={2}
                                placeholder={isAR ? "ماذا قالوا؟" : "What did they say?"}
                                style={{
                                  width: "100%", boxSizing: "border-box", resize: "vertical",
                                  padding: "12px 15px", borderRadius: 14, fontFamily: sans,
                                  fontSize: 14.5, lineHeight: 1.6,
                                  border: "2px solid rgba(42,35,28,.12)", background: M.page, color: M.heading,
                                }} />
                            </div>
                          ))}
                          <button onClick={() => dropSheet(sh.id)} style={{
                            ...quiet, alignSelf: "flex-start", cursor: "pointer",
                            border: "none", font: "inherit", fontFamily: sans,
                          }}>
                            <X size={13} />{isAR ? "احذف الورقة" : "Delete this sheet"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button onClick={newSheet} style={{ ...btn(H), marginTop: 14 }}>
                <Plus size={16} />{isAR ? "ورقة جديدة" : "New sheet"}
              </button>
            </div>
          </Rise>
        </Stagger>
      )}

      <div style={{ marginTop: 30 }}>
        <Says who="hamad" hue={H}>
          {isAR ? "كل ما هنا لك. لا أحد يقيّمه." : "Everything here is yours. Nobody marks it."}
        </Says>
      </div>
    </InnovationPage>
  );
}
