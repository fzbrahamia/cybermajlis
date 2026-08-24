"use client";

/* One problem, taken all the way.
 *
 * Everything before this stopped at finding a problem. This is where a problem
 * becomes an idea, and then where the idea gets weighed hard enough that
 * dropping it is a real outcome rather than a failure.
 *
 * Same shape as a case: short steps, one thing at a time, and Rouda reading
 * what was written rather than counting whether something was written. */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { Face } from "@/components/innovation/Alive";
import { STEPS, PARTS, WEIGH, VERDICTS, DECISIONS, type Verdict } from "@/app/lib/workbench";
import { M, sans, mono, HUES, R, card, flat, btn, ghost, quiet, label } from "@/components/innovation/theme";

const H = HUES.blue;
const LAST = STEPS.length;          // the weighing
const END  = STEPS.length + 1;      // what you decided

type Read = { holds: string; weakest: string; guessing: string; find: string };
type State = {
  title?: string;
  ans: Record<string, string>;
  said: Record<string, Verdict>;
  why: Record<string, string>;
  at: number;
  decision?: string;
  read?: Read;
};

const blank = (): State => ({ ans: {}, said: {}, why: {}, at: 0 });

export default function ProblemPage() {
  const isAR = useLocale() === "ar";
  const params = useParams<{ id: string }>();
  const KEY = `mj-problem-${params.id}`;

  const [ready, setReady] = useState(false);
  const [st, setSt] = useState<State>(blank());
  const [busy, setBusy] = useState(false);
  const at = st.at ?? 0;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { setSt({ ...blank(), ...JSON.parse(raw) }); setReady(true); return; }
      // Straight off the community board, or written here: the title is the
      // problem, so the first step opens already holding it.
      const mine = JSON.parse(localStorage.getItem("mj-mine") ?? "{}");
      const posted = (mine.posted ?? []).find((p: { id: string }) => p.id === params.id);
      setSt({ ...blank(), title: posted?.what, ans: posted?.what ? { saw: posted.what } : {} });
    } catch { /* private mode */ }
    setReady(true);
  }, [KEY, params.id]);

  const save = (next: State) => {
    setSt(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
  };

  const set = (id: string, v: string) => save({ ...st, ans: { ...st.ans, [id]: v } });
  const go  = (n: number) => { save({ ...st, at: Math.max(0, Math.min(END, n)) }); window.scrollTo({ top: 0 }); };

  const weighed = WEIGH.filter(w => st.said[w.id]).length;
  const guesses = useMemo(
    () => WEIGH.filter(w => st.said[w.id] === "yes" && !st.why[w.id]?.trim()).length,
    [st.said, st.why]);

  const read = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "idea", lang: isAR ? "ar" : "en",
          steps: STEPS.filter(s => st.ans[s.id]?.trim())
            .map(s => ({ q: isAR ? s.ask_ar : s.ask_en, a: st.ans[s.id] })),
          checks: WEIGH.filter(w => st.said[w.id])
            .map(w => ({ q: isAR ? w.q_ar : w.q_en, said: st.said[w.id], why: st.why[w.id] })),
        }),
      });
      const out = res.ok ? await res.json().catch(() => null) : null;
      if (out?.ok) save({ ...st, read: out as Read, at: END });
      else go(END);
    } catch { go(END); }
    finally { setBusy(false); }
  };

  if (!ready) return <InnovationPage><p style={{ color: M.body }}>...</p></InnovationPage>;

  const step = STEPS[at];
  const part = at < LAST ? PARTS[step.part] : PARTS[3];
  const written = at < LAST ? (st.ans[step.id]?.trim().length ?? 0) > 2 : true;

  return (
    <InnovationPage>
      <Link href="/mine" style={{ ...quiet, textDecoration: "none", marginBottom: 18 }}>
        {isAR ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
        {isAR ? "شغلي" : "My work"}
      </Link>

      {/* the four words, so nobody holds ten steps in their head */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>
        {PARTS.map((p, i) => {
          const now = p === part;
          const done = at < LAST ? i < step.part : i < 3;
          return (
            <span key={p.en} style={{
              ...quiet,
              background: now ? H.deep : done ? H.tint : "rgba(42,35,28,.05)",
              color: now ? "#FFFDF8" : done ? H.deep : M.body,
            }}>{isAR ? p.ar : p.en}</span>
          );
        })}
      </div>
      <p style={{ margin: "0 0 26px", fontSize: 13.5, color: M.body }}>
        {isAR ? part.line_ar : part.line_en}
      </p>

      {st.title && at === 0 && (
        <div style={{ ...flat, padding: "13px 16px", marginBottom: 18 }}>
          <div style={{ ...label, fontSize: 9, marginBottom: 5 }}>{isAR ? "من المجتمع" : "From the community"}</div>
          <div style={{ fontSize: 14.5, lineHeight: 1.6, color: M.heading }}>{st.title}</div>
        </div>
      )}

      {/* ── the steps ─────────────────────────────────── */}
      {at < LAST && (
        <motion.div key={step.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ ...card, padding: "26px 28px" }}>
          <div style={{ ...label, fontSize: 9.5, marginBottom: 10 }}>
            {isAR ? step.title_ar : step.title_en}
          </div>
          <div style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 14 }}>
            <Face who={step.by ?? "hamad"} size={34} />
            <div>
              <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: M.heading, fontWeight: 700, maxWidth: "40ch" }}>
                {isAR ? step.ask_ar : step.ask_en}
              </p>
              {step.hint_en && (
                <p style={{ margin: "7px 0 0", fontSize: 13.5, lineHeight: 1.55, color: M.body, maxWidth: "44ch" }}>
                  {isAR ? step.hint_ar : step.hint_en}
                </p>
              )}
            </div>
          </div>
          <textarea
            value={st.ans[step.id] ?? ""}
            onChange={e => set(step.id, e.target.value)}
            rows={step.kind === "list" ? 6 : 4}
            placeholder={isAR ? "اكتب هنا" : "Write here"}
            style={{
              width: "100%", boxSizing: "border-box", resize: "vertical",
              padding: "14px 16px", borderRadius: 16, fontFamily: sans,
              fontSize: 15.5, lineHeight: 1.65,
              border: `2px solid ${written ? H.soft : "rgba(42,35,28,.12)"}`,
              background: M.page, color: M.heading,
            }} />
        </motion.div>
      )}

      {/* ── the weighing ──────────────────────────────── */}
      {at === LAST && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{
            margin: "0 0 8px", fontSize: "clamp(21px,3.1vw,28px)", fontWeight: 800,
            color: M.heading, letterSpacing: "-0.015em",
          }}>
            {isAR ? "هل تستحق العمل؟" : "Is it worth doing?"}
          </h1>
          <p style={{ margin: "0 0 22px", fontSize: 14.5, lineHeight: 1.6, color: M.body, maxWidth: "46ch" }}>
            {isAR
              ? "ستة أسئلة. الإجابة وحدها لا تكفي، فقل كيف تعرف. و«لا» جواب جيد."
              : "Six questions. The answer on its own is not enough, so say how you know. And no is a good answer."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {WEIGH.map(w => {
              const said = st.said[w.id];
              const bare = said === "yes" && !st.why[w.id]?.trim();
              return (
                <div key={w.id} style={{
                  ...card, padding: "20px 22px",
                  border: bare ? "1px solid rgba(143,106,56,.4)" : "1px solid rgba(42,35,28,.05)",
                }}>
                  <p style={{ margin: "0 0 12px", fontSize: 15.5, fontWeight: 700, color: M.heading, lineHeight: 1.5 }}>
                    {isAR ? w.q_ar : w.q_en}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {VERDICTS.map(v => (
                      <button key={v.id}
                        onClick={() => save({ ...st, said: { ...st.said, [w.id]: v.id } })}
                        style={{
                          font: "inherit", fontFamily: sans, fontSize: 14, fontWeight: 700,
                          cursor: "pointer", padding: "9px 17px", borderRadius: R.pill,
                          background: said === v.id ? v.tone : "transparent",
                          color: said === v.id ? "#FFFDF8" : M.body,
                          border: `2px solid ${said === v.id ? v.tone : "rgba(42,35,28,.12)"}`,
                        }}>
                        {isAR ? v.ar : v.en}
                      </button>
                    ))}
                  </div>
                  {said && (
                    <>
                      <p style={{ margin: "0 0 7px", fontSize: 13, lineHeight: 1.5, color: M.body }}>
                        {isAR ? w.proof_ar : w.proof_en}
                      </p>
                      <textarea
                        value={st.why[w.id] ?? ""}
                        onChange={e => save({ ...st, why: { ...st.why, [w.id]: e.target.value } })}
                        rows={2}
                        placeholder={isAR ? "كيف تعرف؟" : "How do you know?"}
                        style={{
                          width: "100%", boxSizing: "border-box", resize: "vertical",
                          padding: "11px 14px", borderRadius: 14, fontFamily: sans,
                          fontSize: 14.5, lineHeight: 1.6,
                          border: `2px solid ${st.why[w.id]?.trim() ? H.soft : "rgba(42,35,28,.12)"}`,
                          background: M.page, color: M.heading,
                        }} />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {guesses > 0 && weighed === WEIGH.length && (
            <div style={{
              marginTop: 16, padding: "14px 17px", borderRadius: 14,
              background: "rgba(197,165,126,.13)", border: "1px solid rgba(197,165,126,.5)",
              fontSize: 14.5, lineHeight: 1.6, color: M.heading,
            }}>
              {isAR
                ? `قلت «نعم» ${guesses} مرة دون أن تقول كيف تعرف. «نعم» بلا سبب هي تخمين يلبس نعم.`
                : `You said yes ${guesses} ${guesses === 1 ? "time" : "times"} without saying how you know. A yes with no reason is a guess wearing a yes.`}
            </div>
          )}
        </motion.div>
      )}

      {/* ── what she saw, then what you decide ─────────── */}
      {at === END && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{
            margin: "0 0 20px", fontSize: "clamp(21px,3.1vw,28px)", fontWeight: 800,
            color: M.heading, letterSpacing: "-0.015em",
          }}>
            {isAR ? "أين تقف فكرتك" : "Where your idea stands"}
          </h1>

          {st.read ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 }}>
              {[
                { k: "holds",    t: isAR ? "ما يصمد" : "What holds up",                 v: st.read.holds,    c: HUES.green.deep },
                { k: "weakest",  t: isAR ? "أضعف شيء" : "The weakest thing",            v: st.read.weakest,  c: HUES.maroon.deep },
                { k: "guessing", t: isAR ? "أين تخمّن" : "Where you are guessing",       v: st.read.guessing, c: HUES.gold.deep },
                { k: "find",     t: isAR ? "اذهب واعرف" : "Go and find out",             v: st.read.find,     c: H.deep },
              ].filter(x => x.v).map(x => (
                <div key={x.k} style={{ ...card, padding: "20px 22px", borderTop: `4px solid ${x.c}` }}>
                  <div style={{ ...label, fontSize: 9.5, marginBottom: 9, color: x.c }}>{x.t}</div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Face who="rouda" size={30} />
                    <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: M.heading }}>{x.v}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...flat, padding: "16px 20px", marginBottom: 26, fontSize: 14, color: M.body }}>
              {isAR
                ? "القراءة غير متاحة الآن. كل ما كتبته محفوظ."
                : "The reading is not available right now. Everything you wrote is saved."}
            </div>
          )}

          <div style={{ ...label, marginBottom: 12 }}>{isAR ? "ماذا ستفعل" : "What you will do"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {DECISIONS.map(d => {
              const on = st.decision === d.id;
              return (
                <button key={d.id} onClick={() => save({ ...st, decision: d.id })}
                  style={{
                    font: "inherit", fontFamily: sans, textAlign: "start", cursor: "pointer",
                    padding: "16px 19px", borderRadius: R.panel,
                    background: on ? H.tint : M.card,
                    border: `2px solid ${on ? H.mid : "rgba(42,35,28,.09)"}`,
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {on && <Check size={15} strokeWidth={3} color={H.deep} />}
                    <span style={{ fontSize: 15.5, fontWeight: 800, color: M.heading }}>{isAR ? d.ar : d.en}</span>
                  </div>
                  <span style={{ fontSize: 13.5, lineHeight: 1.55, color: M.body }}>{isAR ? d.line_ar : d.line_en}</span>
                </button>
              );
            })}
          </div>

          {st.decision && (
            <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/mine" style={btn(H)}>{isAR ? "شغلي" : "My work"}</Link>
              {st.decision === "change" && (
                <button onClick={() => go(5)} style={ghost(H)}>{isAR ? "غيّر الفكرة" : "Change the idea"}</button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* ── moving ────────────────────────────────────── */}
      {at < END && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 14, marginTop: 26, paddingTop: 18, borderTop: `1px solid rgba(42,35,28,.10)`, flexWrap: "wrap",
        }}>
          <button onClick={() => go(at - 1)} disabled={at === 0}
            style={{ ...ghost(H), opacity: at === 0 ? 0.35 : 1, cursor: at === 0 ? "default" : "pointer" }}>
            {isAR ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}{isAR ? "رجوع" : "Back"}
          </button>

          <span style={{ fontFamily: mono, fontSize: 11.5, color: M.body }}>
            {at < LAST ? `${at + 1} / ${LAST + 1}` : `${LAST + 1} / ${LAST + 1}`}
          </span>

          {at < LAST ? (
            <button onClick={() => go(at + 1)} disabled={!written}
              style={{ ...btn(H), opacity: written ? 1 : 0.4, cursor: written ? "pointer" : "default" }}>
              {isAR ? "التالي" : "Next"}{isAR ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
            </button>
          ) : (
            <button onClick={read} disabled={weighed < WEIGH.length || busy}
              style={{ ...btn(H), opacity: weighed < WEIGH.length || busy ? 0.4 : 1 }}>
              {busy ? <Loader2 size={15} /> : null}
              {isAR ? "زِن الفكرة" : "Weigh it"}
            </button>
          )}
        </div>
      )}
    </InnovationPage>
  );
}
