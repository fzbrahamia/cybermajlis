"use client";

// THE CASE JOURNEY
//
// Content: app/lib/domainData.ts (what each attempt actually is)
//          app/lib/caseFlow.ts   (how a learner meets it)
//
// Rules the interface obeys:
//   answers persist. A school device gets closed between periods.
//   every answer is answered. Nothing is typed into a void.
//   a choice wherever a choice will do.
//   support fades across the files: guided, questioned, alone.
//   one column at a time in the comparison. Never twelve cards at once.
//   buttons do not explain themselves. Next is enough.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Lock, Play, Plus, Eye, FolderOpen, Folder } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { caseById, domainById, type Approach } from "@/app/lib/domainData";
import { conceptById } from "@/app/lib/conceptData";
import { flowFor, type Ask } from "@/app/lib/caseFlow";
import { M, sans, mono, label, card, flat, button, ghostButton, quietPill, pill, ROUDA, HUES, R } from "@/components/innovation/theme";
import { Ask as AskBox } from "@/components/innovation/Ask";
import { Face } from "@/components/innovation/Alive";
import VideoSlot from "@/components/innovation/VideoSlot";
import AskHamad from "@/components/innovation/AskHamad";
import { BoardSurface, Pinned, Thread } from "@/components/innovation/Board";

const STAGES = [
  { en: "The case", ar: "القضية" }, { en: "First thoughts", ar: "أول أفكارك" },
  { en: "The board", ar: "اللوحة" }, { en: "Alerts", ar: "التنبيهات" },
  { en: "Name it", ar: "سمّها" }, { en: "Case files", ar: "الملفات" },
  { en: "Compare", ar: "المقارنة" }, { en: "What is missing", ar: "ما الناقص" },
  { en: "The challenge", ar: "التحدي" }, { en: "Your answer", ar: "حلك أنت" },
  { en: "Look back", ar: "انظر خلفك" },
];

/* Four headings a child can say out loud. The eleven stages live underneath
   them, because eleven is for the people who built it and four is for the
   person walking it. */
const PARTS = [
  { from: 0, to: 4,  en: "Look",            ar: "انظر",        hue: HUES.maroon },
  { from: 5, to: 6,  en: "Study",           ar: "ادرس",        hue: HUES.blue },
  { from: 7, to: 8,  en: "What is missing", ar: "ما الناقص",   hue: HUES.gold },
  { from: 9, to: 10, en: "Build",           ar: "ابنِ",        hue: HUES.green },
];

const ROWS = [
  { k: "problem", en: "Problem", ar: "المشكلة" },
  { k: "insight", en: "Insight", ar: "الرؤية" },
  { k: "mechanism", en: "Mechanism", ar: "الآلية" },
  { k: "assumption", en: "Assumption", ar: "الافتراض" },
  { k: "sacrifice", en: "Trade-off", ar: "المقايضة" },
  { k: "works", en: "Works well", ar: "ينجح في" },
  { k: "breaks", en: "Fails when", ar: "يخفق حين" },
] as const;

const COLS = [
  { k: "mechanism", en: "Mechanism", ar: "الآلية" },
  { k: "assumption", en: "Assumption", ar: "الافتراض" },
  { k: "breaks", en: "Failure", ar: "الإخفاق" },
] as const;

const ANIM = `
@keyframes mjIn { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:none } }
@keyframes mjPin { 0% { opacity:0; transform: scale(.9) rotate(-4deg) } 60% { transform: scale(1.04) rotate(1deg) } 100% { opacity:1; transform: none } }
@keyframes mjPop { 0% { transform: scale(1) } 45% { transform: scale(1.06) } 100% { transform: scale(1) } }
@keyframes mjGlow { 0%,100% { box-shadow: 0 0 0 rgba(143,106,56,0) } 50% { box-shadow: 0 0 18px rgba(143,106,56,.28) } }
.mj-in { animation: mjIn .42s cubic-bezier(.16,1,.3,1) both }
.mj-pin { animation: mjPin .55s cubic-bezier(.16,1,.3,1) both }
.mj-pop { animation: mjPop .38s ease }
.mj-glow { animation: mjGlow 1.8s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .mj-in,.mj-pin,.mj-pop,.mj-glow { animation: none !important }
}
`;

export default function CasePage() {
  const isAR = useLocale() === "ar";
  const params = useParams<{ domain: string; case: string }>();
  const cs = caseById(params.case);
  const d = domainById(params.domain);
  const flow = cs ? flowFor(cs.id) : undefined;
  const KEY = `mj-case-${params.case}`;

  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  const [ans, setAns] = useState<Record<string, string>>({});
  const [pick, setPick] = useState<Record<string, number>>({});
  const [shown, setShown] = useState(1);
  const [taught, setTaught] = useState<boolean | null>(null);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [held, setHeld] = useState<string | null>(null);
  const [col, setCol] = useState(0);
  const [faded, setFaded] = useState(false);
  const [verd, setVerd] = useState<Record<string, "answered" | "thin" | "off">>({});

  // load, then save on every change. A school device gets closed mid lesson.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setStage(s.stage ?? 0); setAns(s.ans ?? {}); setPick(s.pick ?? {});
        setShown(s.shown ?? 1); setTaught(s.taught ?? null);
        setRevealed(s.revealed ?? {}); setPlaced(s.placed ?? {});
        setCol(s.col ?? 0); setFaded(s.faded ?? false); setVerd(s.verd ?? {});
      }
    } catch { /* private mode */ }
    setReady(true);
  }, [KEY]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ stage, ans, pick, shown, taught, revealed, placed, col, faded, verd }));
    } catch { /* private mode */ }
  }, [ready, KEY, stage, ans, pick, shown, taught, revealed, placed, col, faded, verd]);

  const set = (id: string, v: string) => setAns(a => ({ ...a, [id]: v }));

  if (!cs || !d || !flow) {
    return (
      <InnovationPage>
        <p style={{ fontSize: 15 }}>{isAR ? "لا توجد هذه الحالة." : "There is no such case."}</p>
        <Link href="/learn" style={button}>{isAR ? "العودة" : "Back"}</Link>
      </InnovationPage>
    );
  }

  const home = `/learn/${d.id}`;
  const missing = cs.needs.filter(id => conceptById(id)?.state !== "known");
  // A choice is answered by choosing. Free text is answered when Rouda says so,
  // which is the whole difference between an assessment and a formality.
  const answered = (a: Ask) =>
    a.choices ? pick[a.id] !== undefined : verd[a.id] === "answered" || verd[a.id] === "thin";

  // What they have written so far, so she can notice a contradiction.
  const seenSoFar = () => Object.entries(ans)
    .filter(([, v]) => typeof v === "string" && v.trim().length > 3)
    .slice(-4).map(([, v]) => v).join(" / ");

  const Nav = ({ disabled, last }: { disabled?: boolean; last?: boolean }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 14, marginTop: 28, paddingTop: 18, borderTop: `1px solid ${M.line}`, flexWrap: "wrap",
    }}>
      <button onClick={() => setStage(s => Math.max(0, s - 1))} disabled={stage === 0}
        style={{ ...ghostButton, opacity: stage === 0 ? 0.35 : 1, cursor: stage === 0 ? "default" : "pointer" }}>
        {isAR ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
        {isAR ? "رجوع" : "Back"}
      </button>
      {!last && (
        <button onClick={() => setStage(s => Math.min(STAGES.length - 1, s + 1))} disabled={disabled}
          className={!disabled ? "mj-glow" : undefined}
          style={{ ...button, opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer" }}>
          {isAR ? "التالي" : "Next"}
          {isAR ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
        </button>
      )}
    </div>
  );

  const H1 = ({ children }: { children: React.ReactNode }) => (
    <h1 style={{
      margin: "0 0 14px", fontSize: "clamp(21px,3.1vw,28px)", fontWeight: 800,
      lineHeight: 1.24, letterSpacing: "-0.015em", color: M.heading,
      maxWidth: "42rem", textWrap: "balance",
    }}>{children}</h1>
  );

  const order = ["darktrace", "crowdstrike", "vectra", "segmentation"];
  const approaches = order.map(id => cs.approaches.find(a => a.id === id)).filter(Boolean) as Approach[];

  return (
    <InnovationPage>
      <style>{ANIM}</style>

      <Link href={home} style={{
        display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14,
        fontFamily: mono, fontSize: 11, letterSpacing: "0.1em",
        textTransform: "uppercase", color: M.goldDeep, textDecoration: "none",
      }}>
        {isAR ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
        {isAR ? d.name_ar : d.name_en}
      </Link>

      {/* One continuous row. Only the part you are in is named, so there are
          no gaps and nothing competes with the page for attention. */}
      <div style={{ marginBottom: 30 }}>
        {(() => {
          const part = PARTS.find(x => stage >= x.from && stage <= x.to)!;
          return (
            <>
              <motion.div key={part.en} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  fontFamily: sans, fontSize: "clamp(15px,2.2vw,18px)", fontWeight: 900,
                  letterSpacing: "-0.01em", color: part.hue.deep, marginBottom: 10,
                }}>
                {isAR ? part.ar : part.en}
              </motion.div>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {STAGES.map((st, i) => {
                  const own = PARTS.find(x => i >= x.from && i <= x.to)!;
                  return (
                    <button key={i} onClick={() => setStage(i)}
                      aria-label={isAR ? st.ar : st.en} title={isAR ? st.ar : st.en}
                      style={{
                        width: i === stage ? 30 : 11, height: 11, borderRadius: 999,
                        border: "none", cursor: "pointer", padding: 0, flex: "none",
                        transition: "width .32s cubic-bezier(.16,1,.3,1), background .3s ease",
                        background: i === stage ? own.hue.deep
                          : i < stage ? own.hue.mid : "rgba(42,35,28,.13)",
                      }} />
                  );
                })}
              </div>
            </>
          );
        })()}
      </div>

      {/* 0 ── the case */}
      {stage === 0 && (
        <div className="mj-in">
          {missing.length > 0 && (
            <div style={{
              ...flat, padding: "14px 18px", marginBottom: 20, background: M.goldSoft, borderColor: M.gold,
              display: "flex", flexWrap: "wrap", gap: "8px 10px", alignItems: "center",
            }}>
              <span style={{ ...label, fontSize: 9.5 }}>{isAR ? "ينقصك أولاً" : "Missing first"}</span>
              {missing.map(id => {
                const c = conceptById(id);
                return c ? (
                  <Link key={id} href={`${home}/concept/${id}`} style={{
                    ...quietPill, textDecoration: "none", background: M.card, gap: 5,
                    border: `1px dashed rgba(42,35,28,.22)`,
                  }}><Lock size={9} strokeWidth={2.4} />{isAR ? c.name_ar : c.name_en}</Link>
                ) : null;
              })}
            </div>
          )}

          <div style={{ ...label, marginBottom: 8 }}>{cs.year}</div>
          <H1>{isAR ? cs.title_ar : cs.title_en}</H1>

          <div style={{ marginBottom: 18 }}>
            <VideoSlot
              hue={HUES.maroon} minutes={3}
              brief_en="The morning it happened. Screens going white, an ambulance turning around, a cancelled operation. No explanation, no narrator telling anyone what to think."
              brief_ar="صباح ما حدث. شاشات تبيضّ، وسيارة إسعاف تعود من حيث أتت، وعملية تُلغى. بلا شرح، وبلا راوٍ يخبر أحداً بما يجب أن يفكر فيه."
            />
          </div>

          <div style={{ ...card, padding: "26px 28px", marginBottom: 18 }}>
            {(isAR ? flow.scene_ar : flow.scene_en).map((p, i) => (
              <p key={i} className="mj-in" style={{
                margin: "0 0 12px", maxWidth: "40rem", animationDelay: `${i * 260}ms`,
                fontSize: i === 0 ? 19 : 16, lineHeight: 1.75,
                color: i === 0 ? M.heading : M.body, fontWeight: i === 0 ? 700 : 400,
              }}>{p}</p>
            ))}
          </div>

          <div className="mj-in" style={{
            padding: "22px 26px", borderRadius: 20, background: M.card,
            border: `2px solid ${M.action}`, animationDelay: "800ms",
          }}>
            <p style={{ margin: 0, fontSize: 17.5, lineHeight: 1.6, color: M.heading, fontWeight: 700, maxWidth: "38rem" }}>
              {isAR ? flow.hook_ar : flow.hook_en}
            </p>
          </div>
          <Nav />
        </div>
      )}

      {/* 1 ── first thoughts */}
      {stage === 1 && (
        <div className="mj-in">
          <H1>{isAR ? "ما رأيك أنت؟" : "What do you make of it?"}</H1>
          <div style={{ ...card, padding: "24px 26px" }}>
            {flow.initial.map(a => <AskBox key={a.id} a={a} isAR={isAR} value={ans[a.id] ?? ""} picked={pick[a.id]} onText={v => set(a.id, v)} onPick={i => setPick(pp => ({ ...pp, [a.id]: i }))} verdict={verd[a.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [a.id]: v }))} />)}
          </div>
          <Nav disabled={!flow.initial.every(answered)} />
        </div>
      )}

      {/* 2 ── the board */}
      {stage === 2 && (
        <div className="mj-in">
          <H1>{isAR ? "لوحة التحقيق" : "The investigation board"}</H1>
          <div style={{ position: "relative", marginBottom: 18 }}>
            <BoardSurface>
              <Thread show={shown >= flow.evidence.length} />
              <div style={{
                position: "relative", zIndex: 2,
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",
                gap: "clamp(16px, 2.6vw, 26px)",
              }}>
                {flow.evidence.map((e, i) => (
                  <Pinned
                    key={e.id} i={i} turn={e.turn}
                    hidden={i >= shown}
                    onOpen={() => setShown(n => Math.max(n, i + 1))}
                    tag={isAR ? e.tag_ar : e.tag_en}
                    head={isAR ? e.head_ar : e.head_en}
                    body={isAR ? e.body_ar : e.body_en}
                  />
                ))}
              </div>
            </BoardSurface>
          </div>

          {shown < flow.evidence.length ? (
            <button onClick={() => setShown(s => s + 1)} className="mj-glow" style={{ ...ghostButton, marginBottom: 18 }}>
              <Plus size={15} />{shown} / {flow.evidence.length}
            </button>
          ) : (
            <div style={{ ...card, padding: "24px 26px" }}>
              {flow.reconsider.map(a => <AskBox key={a.id} a={a} isAR={isAR} value={ans[a.id] ?? ""} picked={pick[a.id]} onText={v => set(a.id, v)} onPick={i => setPick(pp => ({ ...pp, [a.id]: i }))} verdict={verd[a.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [a.id]: v }))} />)}
            </div>
          )}
          <Nav disabled={shown < flow.evidence.length || !flow.reconsider.every(answered)} />
        </div>
      )}

      {/* 3 ── discovery */}
      {stage === 3 && (
        <div className="mj-in">
          <p style={{ margin: "0 0 20px", maxWidth: "40rem", fontSize: 17, lineHeight: 1.7, color: M.heading, fontWeight: 600 }}>
            {isAR ? flow.discovery.open_ar : flow.discovery.open_en}
          </p>
          <div style={{ ...card, padding: "24px 26px", marginBottom: 16 }}>
            {flow.discovery.asks.map(a => <AskBox key={a.id} a={a} isAR={isAR} value={ans[a.id] ?? ""} picked={pick[a.id]} onText={v => set(a.id, v)} onPick={i => setPick(pp => ({ ...pp, [a.id]: i }))} verdict={verd[a.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [a.id]: v }))} />)}
          </div>

          {pick["after-month"] !== undefined && (
            <div className="mj-in" style={{ padding: "20px 24px", background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 20, marginBottom: 16 }}>
              <p style={{ margin: "0 0 12px", fontSize: 16, lineHeight: 1.6, color: M.heading, fontWeight: 700 }}>
                {isAR ? flow.discovery.reveal_ar : flow.discovery.reveal_en}
              </p>
              <span style={{ ...pill, background: M.action, color: M.cream, fontSize: 11 }}>
                {isAR ? flow.discovery.concept_ar : flow.discovery.concept_en}
              </span>
              {taught === null && (
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <button onClick={() => setTaught(true)} style={button}><Play size={14} />{isAR ? "اشرح لي" : "Show me"}</button>
                  <button onClick={() => setTaught(false)} style={ghostButton}>{isAR ? "أعرفه" : "I know it"}</button>
                </div>
              )}
            </div>
          )}

          {taught === true && (
            <div className="mj-in" style={{ ...card, padding: "24px 26px", marginBottom: 16 }}>
              {(isAR ? flow.discovery.body_ar : flow.discovery.body_en).map((p, i) => (
                <p key={i} style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.75, maxWidth: "40rem" }}>{p}</p>
              ))}
            </div>
          )}

          {taught !== null && (
            <div className="mj-in" style={{ padding: "22px 24px", background: ROUDA.tint, border: `1px solid ${ROUDA.line}`, borderRadius: 18 }}>
              <AskBox a={flow.discovery.check} isAR={isAR} value={ans[flow.discovery.check.id] ?? ""} picked={pick[flow.discovery.check.id]} onText={v => set(flow.discovery.check.id, v)} onPick={i => setPick(p => ({ ...p, [flow.discovery.check.id]: i }))} verdict={verd[flow.discovery.check.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [flow.discovery.check.id]: v }))} />
            </div>
          )}
          <Nav disabled={taught === null || !answered(flow.discovery.check)} />
        </div>
      )}

      {/* 4 ── name it */}
      {stage === 4 && (
        <div className="mj-in">
          <H1>{isAR ? "سمِّ المشكلة" : "Name the problem"}</H1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 19rem), 1fr))", gap: 14 }}>
            <div style={{ ...flat, padding: "18px 20px", background: M.page }}>
              <div style={{ ...label, fontSize: 9.5, marginBottom: 8 }}>{isAR ? "ما قلته أول مرة" : "What you said first"}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.65, color: M.body, fontStyle: "italic" }}>
                {ans["what"] || (isAR ? "لا شيء." : "Nothing written.")}
              </div>
            </div>
            <div style={{ ...card, padding: "20px 22px", border: `2px solid ${M.action}` }}>
              <AskBox a={flow.precise} isAR={isAR} value={ans[flow.precise.id] ?? ""} picked={pick[flow.precise.id]} onText={v => set(flow.precise.id, v)} onPick={i => setPick(p => ({ ...p, [flow.precise.id]: i }))} verdict={verd[flow.precise.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [flow.precise.id]: v }))} />
            </div>
          </div>
          <Nav disabled={!answered(flow.precise)} />
        </div>
      )}

      {/* 5 ── case files */}
      {stage === 5 && (
        <div className="mj-in">
          <H1>{isAR ? "أربع محاولات" : "Four attempts"}</H1>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {approaches.map(a => {
              const open = openFile === a.id;
              const film = flow.films[a.id];
              if (!film) return null;
              const supportText = {
                guided: { en: "Hamad does this one with you", ar: "حمد يعمل هذه معك" },
                questioned: { en: "Hamad only asks", ar: "حمد يسأل فقط" },
                alone: { en: "On your own", ar: "لك وحدك" },
              }[film.support];
              return (
                <div key={a.id} style={{ ...card, padding: 0, overflow: "hidden" }}>
                  <button onClick={() => setOpenFile(open ? null : a.id)} style={{
                    width: "100%", textAlign: isAR ? "right" : "left", cursor: "pointer",
                    background: open ? M.goldSoft : "transparent", border: "none",
                    padding: "18px 22px", font: "inherit",
                    display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap",
                  }}>
                    {open ? <FolderOpen size={18} color={M.action} /> : <Folder size={18} color={M.goldDeep} />}
                    <span style={{ fontSize: 16.5, fontWeight: 800, color: M.heading, flex: 1, minWidth: 120 }}>
                      {isAR ? a.name_ar : a.name_en}
                    </span>
                    <span style={{
                      ...quietPill,
                      background: film.support === "alone" ? "rgba(42,35,28,.06)" : M.goldSoft,
                      color: film.support === "alone" ? M.body : M.action,
                    }}>{isAR ? supportText.ar : supportText.en}</span>
                    {answered(film.ask) && <Check size={16} strokeWidth={2.6} color={M.action} />}
                  </button>

                  {open && (
                    <div className="mj-in" style={{ padding: "4px 22px 22px" }}>
                      <div style={{ marginBottom: 16 }}>
                        <VideoSlot
                          hue={HUES.blue} minutes={2}
                          brief_en={`How ${isAR ? a.name_ar : a.name_en} actually works, shown rather than described: what it watches, what it does when it sees something, and the moment it gets it wrong.`}
                          brief_ar={`كيف يعمل ${isAR ? a.name_ar : a.name_en} فعلاً، مصوَّراً لا موصوفاً: ماذا يراقب، وماذا يفعل حين يرى شيئاً، واللحظة التي يخطئ فيها.`}
                        />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <AskHamad
                          about={[
                            `Approach: ${a.name_en}`,
                            `The problem they attacked: ${a.problem_en}`,
                            `Their insight: ${a.insight_en}`,
                            `The mechanism: ${a.mechanism_en}`,
                            `What they assumed: ${a.assumption_en}`,
                            `What they gave up: ${a.sacrifice_en}`,
                            `Where it works: ${a.works_en}`,
                            `Where it breaks: ${a.breaks_en}`,
                          ].join("\n")}
                          opener_en={`Ask me anything about how ${a.name_en} works.`}
                          opener_ar="اسألني أي شيء عن كيف يعمل هذا."
                        />
                      </div>

                      <div style={{ ...flat, padding: "18px 20px", background: M.page, marginBottom: 16 }}>
                        <ol style={{ margin: 0, paddingInlineStart: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                          {film.beats.map((b, i) => (
                            <li key={i} className="mj-in" style={{ fontSize: 14.5, lineHeight: 1.6, color: M.heading, animationDelay: `${i * 140}ms` }}>
                              {isAR ? b.ar : b.en}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* the seven-row form is gone. It was twenty eight cells across
                          four files, and the Reveal button made guessing optional, so
                          nobody guessed. The same facts now sit behind one toggle, as
                          a reference you consult rather than a form you fill. */}
                      <details style={{ marginBottom: 16 }}>
                        <summary style={{
                          cursor: "pointer", listStyle: "none", padding: "12px 16px",
                          borderRadius: R.chip, background: M.page, fontFamily: sans,
                          fontSize: 13.5, fontWeight: 800, color: M.action,
                        }}>
                          {isAR ? "التفاصيل الكاملة" : "The full detail"}
                        </summary>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                          {ROWS.map(r => (
                            <div key={r.k} style={{
                              display: "grid", gridTemplateColumns: "minmax(84px,104px) 1fr",
                              gap: 12, padding: "10px 12px", borderRadius: 12, background: M.page,
                            }}>
                              <span style={{ ...label, fontSize: 9.5 }}>{isAR ? r.ar : r.en}</span>
                              <span style={{ fontSize: 13, lineHeight: 1.55, color: M.heading, fontFamily: sans }}>
                                {(a as unknown as Record<string, string>)[isAR ? `${r.k}_ar` : `${r.k}_en`]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>

                      <div style={{
                        padding: "18px 20px", borderRadius: 16,
                        background: film.ask.by === "rouda" ? ROUDA.tint : M.goldSoft,
                        border: `1px solid ${film.ask.by === "rouda" ? ROUDA.line : M.gold}`,
                      }}>
                        <AskBox a={film.ask} isAR={isAR} value={ans[film.ask.id] ?? ""} picked={pick[film.ask.id]} onText={v => set(film.ask.id, v)} onPick={i => setPick(p => ({ ...p, [film.ask.id]: i }))} verdict={verd[film.ask.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [film.ask.id]: v }))} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Nav disabled={approaches.some(a => flow.films[a.id] && !answered(flow.films[a.id].ask))} />
        </div>
      )}

      {/* 6 ── compare, one column at a time */}
      {stage === 6 && (() => {
        const active = COLS[col];
        const cards = approaches.map(a => ({
          id: `${a.id}:${active.k}`,
          text: (a as unknown as Record<string, string>)[isAR ? `${active.k}_ar` : `${active.k}_en`],
        }));
        const loose = cards.filter(c => !placed[c.id]);
        const colDone = loose.length === 0;
        const allDone = col === COLS.length - 1 && colDone;

        return (
          <div className="mj-in">
            <H1>{isAR ? "ضع كل بطاقة عند صاحبها" : "Put each card next to the one it belongs to"}</H1>

            <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>
              {COLS.map((c, i) => (
                <span key={c.k} style={{
                  ...quietPill,
                  background: i === col ? M.action : i < col ? M.goldSoft : "rgba(42,35,28,.05)",
                  color: i === col ? M.cream : i < col ? M.action : M.body,
                }}>{isAR ? c.ar : c.en}</span>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20, minHeight: 46 }}>
              {loose.map(c => (
                <button key={c.id} draggable className="mj-in"
                  onDragStart={() => setHeld(c.id)}
                  onClick={() => setHeld(held === c.id ? null : c.id)}
                  style={{
                    cursor: "grab", font: "inherit", textAlign: "start",
                    fontSize: 12.5, lineHeight: 1.45, maxWidth: 260,
                    padding: "11px 14px", borderRadius: 12,
                    background: held === c.id ? M.action : M.card,
                    color: held === c.id ? M.cream : M.heading,
                    border: `1px solid ${held === c.id ? M.action : M.gold}`,
                  }}>{c.text}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {approaches.map(a => {
                const key = `${a.id}:${active.k}`;
                const filled = Object.keys(placed).find(id => placed[id] === key);
                const right = filled === key;
                const text = cards.find(x => x.id === filled)?.text;
                return (
                  <div key={a.id} style={{ display: "grid", gridTemplateColumns: "minmax(120px,0.8fr) 1.6fr", gap: 10 }}>
                    <div style={{ ...flat, padding: "13px 15px", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: M.heading }}>{isAR ? a.name_ar : a.name_en}</span>
                    </div>
                    <div
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => { if (held) { setPlaced(p => ({ ...p, [held]: key })); setHeld(null); } }}
                      onClick={() => { if (held) { setPlaced(p => ({ ...p, [held]: key })); setHeld(null); } }}
                      className={right ? "mj-pop" : undefined}
                      style={{
                        minHeight: 54, padding: "11px 14px", borderRadius: 12,
                        display: "flex", alignItems: "center", gap: 7,
                        cursor: held ? "pointer" : "default",
                        background: text ? (right ? M.goldSoft : M.card) : "transparent",
                        border: text ? `1px solid ${right ? M.gold : "rgba(42,35,28,.16)"}`
                                     : `1px dashed ${held ? M.action : "rgba(42,35,28,.20)"}`,
                      }}>
                      {right && <Check size={12} strokeWidth={3} color={M.action} style={{ flex: "none" }} />}
                      <span style={{ fontSize: 12.5, lineHeight: 1.45, color: M.heading }}>{text}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {colDone && col < COLS.length - 1 && (
              <button onClick={() => setCol(c => c + 1)} className="mj-glow" style={{ ...button, marginTop: 18 }}>
                {isAR ? "التالي" : "Next"}
              </button>
            )}

            {/* the payoff. Finishing the failure column should show you the thing
                it was built to show: four different routes, one shared wall. */}
            {allDone && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 240, damping: 22 }}
                  style={{
                    marginTop: 22, padding: "24px 26px", borderRadius: R.card,
                    background: HUES.gold.tint, border: `2px solid ${HUES.gold.mid}`,
                  }}
                >
                  <div style={{ ...label, fontSize: 10, marginBottom: 12, color: HUES.gold.deep }}>
                    {isAR ? "انظر إلى عمود الإخفاق" : "Look down the failure column"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {approaches.map((a, i) => (
                      <motion.div key={a.id}
                        initial={{ opacity: 0, x: isAR ? 14 : -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + i * 0.14 }}
                        style={{ display: "flex", alignItems: "center", gap: 12 }}
                      >
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%", flex: "none",
                          background: HUES.gold.deep,
                        }} />
                        <span style={{ fontSize: 14, lineHeight: 1.5, color: M.heading, fontFamily: sans }}>
                          {(a as unknown as Record<string, string>)[isAR ? "breaks_ar" : "breaks_en"]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    style={{
                      margin: "18px 0 0", paddingTop: 16,
                      borderTop: `1px solid ${HUES.gold.soft}`,
                      fontSize: 15.5, lineHeight: 1.6, color: M.heading,
                      fontWeight: 700, fontFamily: sans, maxWidth: "44ch",
                    }}
                  >
                    {isAR
                      ? "أربع طرق مختلفة تماماً. اقرأها كلها مرة أخرى: إلى أين تنتهي؟"
                      : "Four completely different routes. Read them again: where do they all end up?"}
                  </motion.p>
                </motion.div>

                <div className="mj-in" style={{ ...card, padding: "22px 24px", marginTop: 20 }}>
                  <AskBox a={flow.retrieval} isAR={isAR} value={ans[flow.retrieval.id] ?? ""} picked={pick[flow.retrieval.id]} onText={v => set(flow.retrieval.id, v)} onPick={i => setPick(p => ({ ...p, [flow.retrieval.id]: i }))} verdict={verd[flow.retrieval.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [flow.retrieval.id]: v }))} />
                </div>
                <div className="mj-in" style={{ ...card, padding: "22px 24px", marginTop: 12 }}>
                  {flow.discussion.map(a => <AskBox key={a.id} a={a} isAR={isAR} value={ans[a.id] ?? ""} picked={pick[a.id]} onText={v => set(a.id, v)} onPick={i => setPick(pp => ({ ...pp, [a.id]: i }))} verdict={verd[a.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [a.id]: v }))} />)}
                </div>
              </>
            )}

            <Nav disabled={!allDone || !answered(flow.retrieval) || !flow.discussion.every(answered)} />
          </div>
        );
      })()}

      {/* 7 ── what is missing. The names fade as you arrive; pressing a button
             to make that happen was a chore, and the point is the noticing. */}
      {stage === 7 && (
        <div className="mj-in" ref={() => { if (!faded) setTimeout(() => setFaded(true), 900); }}>
          <H1>{isAR ? "ما الذي لم يحله أي منهم؟" : "What did none of them solve?"}</H1>
          <div style={{ ...card, padding: "clamp(22px,4vw,38px)", marginBottom: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "clamp(10px,3vw,26px)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: faded ? 0.1 : 1, transition: "opacity 1.6s ease" }}>
                {approaches.map(a => (
                  <div key={a.id} style={{ ...flat, padding: "11px 14px", textAlign: "center", fontSize: 13.5, fontWeight: 800, color: M.heading }}>
                    {isAR ? a.name_ar : a.name_en}
                  </div>
                ))}
              </div>
              <svg width="56" height="150" viewBox="0 0 56 150" aria-hidden style={{ overflow: "visible" }}>
                <path d="M0 16 H24 M0 61 H24 M0 106 H24 M0 148 H24 M24 16 V148 M24 82 H48"
                      fill="none" stroke={M.gold} strokeWidth="2" strokeLinecap="round" />
                <path d="M42 76 L52 82 L42 88 Z" fill={M.gold} />
              </svg>
              <div className={faded ? "mj-glow" : undefined} style={{
                minHeight: 130, borderRadius: 18, background: M.goldSoft,
                border: `2px solid ${M.gold}`, display: "grid", placeItems: "center", padding: 18, textAlign: "center",
              }}>
                <div>
                  <div style={{ fontSize: 44, fontWeight: 900, color: M.action, lineHeight: 1 }}>?</div>
                  <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: M.heading, fontWeight: 700 }}>
                    {isAR ? "الناقص" : "Missing"}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {faded && (
            <div className="mj-in" style={{ ...card, padding: "24px 26px" }}>
              <AskBox a={flow.gap} isAR={isAR} value={ans[flow.gap.id] ?? ""} picked={pick[flow.gap.id]} onText={v => set(flow.gap.id, v)} onPick={i => setPick(p => ({ ...p, [flow.gap.id]: i }))} verdict={verd[flow.gap.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [flow.gap.id]: v }))} />
            </div>
          )}
          <Nav disabled={!answered(flow.gap)} />
        </div>
      )}

      {/* 8 ── the challenge */}
      {stage === 8 && (() => {
        const parts = isAR ? flow.challenge.parts_ar : flow.challenge.parts_en;
        const hints = isAR ? flow.challenge.hints_ar : flow.challenge.hints_en;
        const keys = ["ch1", "ch2", "ch3", "ch4"];
        const done = keys.every(k => (ans[k] ?? "").trim().length > 0);
        const Blank = ({ i }: { i: number }) => {
          const v = ans[keys[i]] ?? "";
          return (
            <input value={v} onChange={e => set(keys[i], e.target.value)} placeholder={hints[i]}
              size={Math.max(hints[i].length, v.length + 1)}
              style={{
                font: "inherit", fontSize: "inherit", lineHeight: "inherit", fontWeight: 700,
                color: M.action, background: v ? M.goldSoft : "transparent", border: "none",
                borderBottom: `2px solid ${v ? M.action : M.gold}`, borderRadius: v ? 6 : 0,
                padding: "2px 8px", margin: "0 3px", minWidth: 84, outline: "none",
              }} />
          );
        };
        return (
          <div className="mj-in">
            <H1>{isAR ? "اكتبها تحدياً" : "Write it as a challenge"}</H1>
            <p style={{ margin: "0 0 18px", maxWidth: "40rem", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>
              {isAR ? flow.challenge.rule_ar : flow.challenge.rule_en}
            </p>
            {ans["gap"] && (
              <div style={{ ...flat, padding: "14px 18px", marginBottom: 18, background: M.page }}>
                <div style={{ ...label, fontSize: 9, marginBottom: 5 }}>{isAR ? "ما وجدته ناقصاً" : "What you found missing"}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: M.heading, fontStyle: "italic" }}>{ans["gap"]}</div>
              </div>
            )}
            <div style={{ ...card, padding: "28px 30px", border: `2px solid ${done ? M.action : M.gold}` }}>
              <p style={{ margin: 0, fontSize: "clamp(16px,2.2vw,19px)", lineHeight: 2.2, color: M.heading, fontWeight: 600 }}>
                {parts[0]}<Blank i={0} />{parts[1]}<Blank i={1} />{parts[2]}<Blank i={2} />{parts[3]}<Blank i={3} />{parts[4]}
              </p>
            </div>
            {done && (
              <div className="mj-in" style={{ padding: "18px 22px", marginTop: 16, background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 18 }}>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: M.heading }}>
                  {parts[0]}<b>{ans.ch1}</b>{parts[1]}<b>{ans.ch2}</b>{parts[2]}<b>{ans.ch3}</b>{parts[3]}<b>{ans.ch4}</b>{parts[4]}
                </p>
              </div>
            )}
            <Nav disabled={!done} />
          </div>
        );
      })()}

      {/* 9 ── Company Next */}
      {stage === 9 && (() => {
        const parts = isAR ? flow.challenge.parts_ar : flow.challenge.parts_en;
        return (
          <div className="mj-in">
            <H1>{isAR ? "صمّم حلك" : "Design yours"}</H1>
            <div style={{ padding: "18px 22px", marginBottom: 20, background: M.card, border: `2px solid ${M.action}`, borderRadius: 18 }}>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: M.heading }}>
                {parts[0]}<b>{ans.ch1}</b>{parts[1]}<b>{ans.ch2}</b>{parts[2]}<b>{ans.ch3}</b>{parts[3]}<b>{ans.ch4}</b>{parts[4]}
              </p>
            </div>
            <div style={{ ...card, padding: "24px 26px" }}>
              {flow.next.map(a => <AskBox key={a.id} a={a} isAR={isAR} value={ans[a.id] ?? ""} picked={pick[a.id]} onText={v => set(a.id, v)} onPick={i => setPick(pp => ({ ...pp, [a.id]: i }))} verdict={verd[a.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [a.id]: v }))} />)}
            </div>
            <Nav disabled={!flow.next.every(answered)} />
          </div>
        );
      })()}

      {/* 10 ── reflection */}
      {stage === 10 && (
        <div className="mj-in">
          <H1>{isAR ? "كيف تغيّر تفكيرك" : "How your thinking moved"}</H1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 19rem), 1fr))", gap: 14, marginBottom: 18 }}>
            <div style={{ ...flat, padding: "18px 20px", background: M.page }}>
              <div style={{ ...label, fontSize: 9.5, marginBottom: 8 }}>{isAR ? "أول مرة" : "First"}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.65, color: M.body, fontStyle: "italic" }}>
                {ans["what"] || (isAR ? "لا شيء." : "Nothing written.")}
              </div>
            </div>
            <div style={{ ...card, padding: "18px 20px", background: M.goldSoft, borderColor: M.gold }}>
              <div style={{ ...label, fontSize: 9.5, marginBottom: 8, color: M.action }}>{isAR ? "بعد التحقيق" : "After the investigation"}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.65, color: M.heading }}>
                {ans["precise"] || (isAR ? "لا شيء." : "Nothing written.")}
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: "24px 26px", marginBottom: 18 }}>
            <AskBox a={flow.reflect} isAR={isAR} value={ans[flow.reflect.id] ?? ""} picked={pick[flow.reflect.id]} onText={v => set(flow.reflect.id, v)} onPick={i => setPick(p => ({ ...p, [flow.reflect.id]: i }))} verdict={verd[flow.reflect.id]} seen={seenSoFar()} onVerdict={(v) => setVerd(w => ({ ...w, [flow.reflect.id]: v }))} />
          </div>

          {ans["gap"] && (
            <div style={{ padding: "22px 26px", background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 20, marginBottom: 20 }}>
              <div style={{ ...label, fontSize: 9.5, marginBottom: 8, color: M.action }}>{isAR ? "ما وجدته ناقصاً" : "What you found missing"}</div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: M.heading, fontWeight: 700 }}>{ans["gap"]}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 18, borderTop: `1px solid ${M.line}` }}>
            <Link href="/mine" style={button}>{isAR ? "جوازي" : "My passport"}</Link>
            <Link href={home} style={ghostButton}>{isAR ? "عودة" : "Back"}</Link>
            <button onClick={() => { try { localStorage.removeItem(KEY); } catch {} location.reload(); }}
              style={{ ...ghostButton, border: "none", color: M.body }}>
              {isAR ? "من البداية" : "Start again"}
            </button>
          </div>
        </div>
      )}
    </InnovationPage>
  );
}
