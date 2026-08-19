"use client";

// SUNDUS
//
// The discovery-led alternative to the Case pages, kept alongside them so the
// two approaches can be compared on the same teaching.
//
// The rules this page follows, and the Case pages do not:
//   nothing is framed as a lesson until after the learner has answered
//   false positives are walked into by question, never stated first
//   the concept node is skippable by anyone who already knows it
//   support fades across the three files: guided, questioned, alone
//   the learner assembles the comparison from their own cards
//   the gap is never printed. They are walked to its edge and asked.

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight, ArrowLeft, Play, Check, Pin } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import {
  INCIDENT, FIRST_ASKS, BOARD, BOARD_TURN, HAMAD_AFTER_BOARD,
  ALERTING_DISCOVERY, FALSE_POSITIVE_NODE, PRECISE, FILES, CARDS, GAP_ASKS,
  CHALLENGE, NEXT_ASKS, NEXT_CLOSE,
  type Ask,
} from "@/app/lib/sundusData";
import { M, mono, label, card, flat, button, ghostButton, quietPill, pill, ROUDA } from "@/components/innovation/theme";

const STAGES = [
  { en: "The call",       ar: "البلاغ" },
  { en: "Your first read", ar: "قراءتك الأولى" },
  { en: "The board",      ar: "اللوحة" },
  { en: "What if",        ar: "ماذا لو" },
  { en: "Name it",        ar: "سمّها" },
  { en: "Case files",     ar: "ملفات القضية" },
  { en: "Your table",     ar: "جدولك" },
  { en: "What is missing", ar: "ما الناقص" },
  { en: "The challenge",  ar: "التحدي" },
  { en: "Company Next",   ar: "الشركة التالية" },
];

export default function SundusPage() {
  const isAR = useLocale() === "ar";
  const [stage, setStage] = useState(0);
  const [ans, setAns] = useState<Record<string, string>>({});
  const [openedNode, setOpenedNode] = useState<boolean | null>(null);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({}); // cardId -> cellKey
  const [held, setHeld] = useState<string | null>(null);

  const set = (id: string, v: string) => setAns(a => ({ ...a, [id]: v }));

  /* a question with a real box, because typing an answer is the exercise */
  const Question = ({ a, tone = M.action }: { a: Ask; tone?: string }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: M.heading, lineHeight: 1.5, marginBottom: a.hint_en ? 4 : 8 }}>
        {isAR ? a.q_ar : a.q_en}
      </div>
      {a.hint_en && (
        <div style={{ fontSize: 12.5, color: M.body, marginBottom: 8, fontStyle: "italic" }}>
          {isAR ? a.hint_ar : a.hint_en}
        </div>
      )}
      <textarea
        value={ans[a.id] ?? ""}
        onChange={e => set(a.id, e.target.value)}
        rows={2}
        placeholder={isAR ? "اكتب هنا" : "Write here"}
        style={{
          width: "100%", resize: "vertical", boxSizing: "border-box",
          padding: "11px 14px", borderRadius: 12,
          border: `1px solid ${ans[a.id] ? tone : M.line}`,
          background: M.card, color: M.heading,
          font: "inherit", fontSize: 14, lineHeight: 1.6,
        }}
      />
    </div>
  );

  const Nav = ({ label_en, label_ar, disabled }: { label_en: string; label_ar: string; disabled?: boolean }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 14, marginTop: 26, paddingTop: 18, borderTop: `1px solid ${M.line}`, flexWrap: "wrap",
    }}>
      <button
        onClick={() => setStage(s => Math.max(0, s - 1))}
        disabled={stage === 0}
        style={{
          ...ghostButton, opacity: stage === 0 ? 0.35 : 1,
          cursor: stage === 0 ? "default" : "pointer",
        }}
      >
        {isAR ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
        {isAR ? "رجوع" : "Back"}
      </button>
      <button
        onClick={() => setStage(s => Math.min(STAGES.length - 1, s + 1))}
        disabled={disabled}
        style={{ ...button, opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer" }}
      >
        {isAR ? label_ar : label_en}
        {isAR ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
      </button>
    </div>
  );

  return (
    <InnovationPage>
      {/* where you are */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {STAGES.map((s, i) => (
          <span key={i} style={{
            ...quietPill,
            background: i === stage ? M.action : i < stage ? M.goldSoft : "rgba(42,35,28,.05)",
            color: i === stage ? M.cream : i < stage ? M.action : M.body,
          }}>
            {isAR ? s.ar : s.en}
          </span>
        ))}
      </div>

      {/* ═══ 0. the call ═══════════════════════════════════ */}
      {stage === 0 && (
        <div>
          <div style={{ ...label, marginBottom: 8 }}>
            {isAR ? `${INCIDENT.when_ar} · ${INCIDENT.where_ar}` : `${INCIDENT.when_en} · ${INCIDENT.where_en}`}
          </div>
          <h1 style={{
            margin: "0 0 16px", fontSize: "clamp(24px,3.6vw,32px)", fontWeight: 800,
            lineHeight: 1.2, letterSpacing: "-0.015em", color: M.heading,
            maxWidth: "42rem", textWrap: "balance",
          }}>
            {isAR ? INCIDENT.lede_ar : INCIDENT.lede_en}
          </h1>
          {(isAR ? INCIDENT.body_ar : INCIDENT.body_en).map((p, i) => (
            <p key={i} style={{ margin: "0 0 13px", maxWidth: "44rem", fontSize: 15.5, lineHeight: 1.75 }}>{p}</p>
          ))}

          <div style={{
            marginTop: 20, padding: "20px 24px", borderRadius: 20,
            background: M.card, border: `2px solid ${M.action}`,
          }}>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: M.heading, fontWeight: 700, maxWidth: "40rem" }}>
              {isAR ? INCIDENT.prompt_ar : INCIDENT.prompt_en}
            </p>
          </div>

          <p style={{ margin: "18px 0 0", fontSize: 13, color: M.body, fontStyle: "italic", maxWidth: "40rem" }}>
            {isAR
              ? "عيادات الدانة مكان متخيَّل. السيناريو مبني على شكل حوادث حقيقية."
              : "Al Dana Clinics is invented. The scenario is built from the shape of real incidents."}
          </p>

          <Nav label_en="Can you discover why?" label_ar="هل تكتشف السبب؟" />
        </div>
      )}

      {/* ═══ 1. before anything is taught ══════════════════ */}
      {stage === 1 && (
        <div>
          <div style={{ ...label, marginBottom: 8 }}>{isAR ? "قبل أن نعلّمك أي شيء" : "Before we teach you anything"}</div>
          <h1 style={{
            margin: "0 0 10px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
            lineHeight: 1.25, color: M.heading, maxWidth: "42rem", textWrap: "balance",
          }}>
            {isAR ? "ما رأيك أنت؟" : "What do you make of it?"}
          </h1>
          <p style={{ margin: "0 0 22px", maxWidth: "42rem", fontSize: 14.5, lineHeight: 1.7 }}>
            {isAR
              ? "لن نصحح لك شيئاً هنا. سنحفظ ما تكتبه، وستقرؤه بنفسك بعد أن تعرف ما حدث فعلاً."
              : "Nothing here gets corrected. We keep what you write, and you will read it back yourself once you know what actually happened."}
          </p>
          <div style={{ ...card, padding: "22px 24px" }}>
            {FIRST_ASKS.map(a => <Question key={a.id} a={a} />)}
          </div>
          <Nav label_en="Open the board" label_ar="افتح اللوحة" />
        </div>
      )}

      {/* ═══ 2. the investigation board ════════════════════ */}
      {stage === 2 && (
        <div>
          <div style={{ ...label, marginBottom: 8 }}>{isAR ? "لوحة التحقيق" : "The investigation board"}</div>
          <h1 style={{
            margin: "0 0 20px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
            lineHeight: 1.25, color: M.heading, maxWidth: "42rem",
          }}>
            {isAR ? "خمس قصاصات، وخيط بينها" : "Five scraps, and a thread between them"}
          </h1>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))",
            gap: 16, marginBottom: 22,
          }}>
            {BOARD.map((e, i) => (
              <div key={e.id} style={{
                ...card,
                padding: "18px 20px 20px",
                transform: `rotate(${(i % 2 ? 1 : -1) * (0.5 + (i % 3) * 0.25)}deg)`,
                border: e.turn ? `2px solid ${M.action}` : `1px solid rgba(42,35,28,.08)`,
                position: "relative",
              }}>
                <Pin size={15} color={e.turn ? M.action : M.gold} style={{
                  position: "absolute", top: 12, insetInlineEnd: 14,
                }} />
                <div style={{ ...label, fontSize: 9.5, marginBottom: 8 }}>
                  {isAR ? e.tag_ar : e.tag_en}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: M.heading, lineHeight: 1.4, marginBottom: 7, paddingInlineEnd: 18 }}>
                  {isAR ? e.head_ar : e.head_en}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{isAR ? e.body_ar : e.body_en}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "22px 26px", background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: M.heading, marginBottom: 10 }}>
              {isAR ? BOARD_TURN.head_ar : BOARD_TURN.head_en}
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: M.heading, maxWidth: "46rem" }}>
              {isAR ? BOARD_TURN.body_ar : BOARD_TURN.body_en}
            </p>
          </div>

          <div style={{
            marginTop: 16, padding: "20px 22px",
            background: M.card, border: `1px solid rgba(42,35,28,.08)`, borderRadius: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <span style={{
                width: 30, height: 30, borderRadius: "50%", background: M.action,
                display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: M.cream,
              }}>H</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: M.action }}>{isAR ? "حمد" : "Hamad"}</span>
            </div>
            {HAMAD_AFTER_BOARD.map(a => <Question key={a.id} a={a} />)}
            {ans["why-unseen"] && (
              <div style={{ ...flat, padding: "13px 16px", background: M.page }}>
                <div style={{ ...label, fontSize: 9, marginBottom: 5 }}>
                  {isAR ? "ما كتبته قبل أن ترى اللوحة" : "What you wrote before you saw the board"}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: M.heading, fontStyle: "italic" }}>
                  {ans["why-unseen"]}
                </div>
              </div>
            )}
          </div>

          <Nav label_en="Keep going" label_ar="واصل" />
        </div>
      )}

      {/* ═══ 3. walked into false positives ════════════════ */}
      {stage === 3 && (
        <div>
          <div style={{ ...label, marginBottom: 8 }}>{isAR ? "حل يقفز إلى الذهن" : "The answer people reach for"}</div>
          <p style={{ margin: "0 0 20px", maxWidth: "44rem", fontSize: 16, lineHeight: 1.75, color: M.heading }}>
            {isAR ? ALERTING_DISCOVERY.setup_ar : ALERTING_DISCOVERY.setup_en}
          </p>

          <div style={{ ...card, padding: "22px 24px", marginBottom: 16 }}>
            {ALERTING_DISCOVERY.asks.map(a => <Question key={a.id} a={a} />)}
          </div>

          {(ans["everything"] || ans["human"]) && (
            <div style={{ padding: "20px 24px", background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 20, marginBottom: 16 }}>
              <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.7, color: M.heading, fontWeight: 600 }}>
                {isAR ? ALERTING_DISCOVERY.reveal_ar : ALERTING_DISCOVERY.reveal_en}
              </p>
              <span style={{ ...pill, background: M.action, color: M.cream, fontSize: 11 }}>
                {isAR ? ALERTING_DISCOVERY.concept_ar : ALERTING_DISCOVERY.concept_en}
              </span>

              {openedNode === null && (
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <button onClick={() => setOpenedNode(true)} style={button}>
                    <Play size={14} /> {isAR ? "علّمني هذا" : "Teach me this"}
                  </button>
                  <button onClick={() => setOpenedNode(false)} style={ghostButton}>
                    {isAR ? "أعرفه، اسألني مباشرة" : "I know this. Just ask me"}
                  </button>
                </div>
              )}
            </div>
          )}

          {openedNode === true && (
            <div style={{ ...card, padding: "22px 24px", marginBottom: 16 }}>
              <div style={{ ...label, fontSize: 10, marginBottom: 10 }}>
                {isAR ? "عقدة مفهوم" : "Concept node"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: M.heading, marginBottom: 12 }}>
                {isAR ? FALSE_POSITIVE_NODE.name_ar : FALSE_POSITIVE_NODE.name_en}
              </div>
              {(isAR ? FALSE_POSITIVE_NODE.body_ar : FALSE_POSITIVE_NODE.body_en).map((p, i) => (
                <p key={i} style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.75, maxWidth: "44rem" }}>{p}</p>
              ))}
            </div>
          )}

          {openedNode !== null && (
            <div style={{ padding: "20px 22px", background: ROUDA.tint, border: `1px solid ${ROUDA.line}`, borderRadius: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
                <span style={{
                  width: 30, height: 30, borderRadius: "50%", background: ROUDA.mid,
                  display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: "#fff",
                }}>R</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: ROUDA.deep }}>{isAR ? "رودة" : "Rouda"}</span>
              </div>
              <Question a={{
                id: "fp-check",
                q_en: FALSE_POSITIVE_NODE.check_en, q_ar: FALSE_POSITIVE_NODE.check_ar,
              }} tone={ROUDA.mid} />
            </div>
          )}

          <Nav label_en="Now name the problem" label_ar="الآن سمّ المشكلة" disabled={openedNode === null} />
        </div>
      )}

      {/* ═══ 4. write it precisely ═════════════════════════ */}
      {stage === 4 && (
        <div>
          <div style={{ ...label, marginBottom: 8 }}>{isAR ? "التقييم" : "The assessment"}</div>
          <h1 style={{
            margin: "0 0 10px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
            lineHeight: 1.25, color: M.heading, maxWidth: "42rem", textWrap: "balance",
          }}>
            {isAR ? PRECISE.ask_ar : PRECISE.ask_en}
          </h1>
          <p style={{ margin: "0 0 20px", maxWidth: "42rem", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>
            {isAR ? PRECISE.guard_ar : PRECISE.guard_en}
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 19rem), 1fr))", gap: 14,
          }}>
            <div style={{ ...flat, padding: "18px 20px", background: M.page }}>
              <div style={{ ...label, fontSize: 9.5, marginBottom: 8 }}>
                {isAR ? "الإصدار الأول · قبل أن تعرف شيئاً" : "V1 · before you knew anything"}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.65, color: M.body, fontStyle: "italic" }}>
                {ans["why-unseen"] || (isAR ? "لم تكتب شيئاً في البداية." : "You did not write anything at the start.")}
              </div>
            </div>

            <div style={{ ...card, padding: "18px 20px", border: `2px solid ${M.action}` }}>
              <div style={{ ...label, fontSize: 9.5, marginBottom: 8 }}>
                {isAR ? "الإصدار الثاني · الآن" : "V2 · now"}
              </div>
              <textarea
                value={ans["precise"] ?? ""}
                onChange={e => set("precise", e.target.value)}
                rows={5}
                placeholder={isAR ? "المشكلة هي أن..." : "The problem is that..."}
                style={{
                  width: "100%", resize: "vertical", boxSizing: "border-box",
                  padding: "11px 14px", borderRadius: 12,
                  border: `1px solid ${M.line}`, background: M.page, color: M.heading,
                  font: "inherit", fontSize: 14.5, lineHeight: 1.65,
                }}
              />
            </div>
          </div>

          <Nav label_en="Open the case files" label_ar="افتح ملفات القضية" disabled={!ans["precise"]} />
        </div>
      )}

      {/* ═══ 5. the case files ════════════════════════════ */}
      {stage === 5 && (
        <div>
          <div style={{ ...label, marginBottom: 8 }}>{isAR ? "ملفات القضية" : "Case files"}</div>
          <h1 style={{
            margin: "0 0 10px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
            lineHeight: 1.25, color: M.heading, maxWidth: "42rem",
          }}>
            {isAR ? "ثلاثة حاولوا. افتحها بالترتيب." : "Three of them tried. Open them in order."}
          </h1>
          <p style={{ margin: "0 0 20px", maxWidth: "42rem", fontSize: 14, lineHeight: 1.7 }}>
            {isAR
              ? "في الأول يعمل حمد معك. وفي الثاني يسأل فقط. وأما الثالث فلك وحدك."
              : "On the first, Hamad works with you. On the second he only asks. The third is yours alone."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FILES.map(f => {
              const open = openFile === f.id;
              const supportText = {
                guided:     { en: "Hamad works this one with you", ar: "حمد يعمل هذا معك" },
                questioned: { en: "Hamad only asks",               ar: "حمد يسأل فقط" },
                alone:      { en: "On your own",                   ar: "لك وحدك" },
              }[f.support];
              return (
                <div key={f.id} style={{ ...card, padding: 0, overflow: "hidden" }}>
                  <button
                    onClick={() => setOpenFile(open ? null : f.id)}
                    style={{
                      width: "100%", textAlign: isAR ? "right" : "left", cursor: "pointer",
                      background: open ? M.goldSoft : "transparent", border: "none",
                      padding: "18px 22px", font: "inherit",
                      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontFamily: mono, fontSize: 13, color: M.goldDeep, flex: "none" }}>{f.n}</span>
                    <span style={{ fontSize: 16.5, fontWeight: 800, color: M.heading, flex: 1, minWidth: 140 }}>
                      {isAR ? f.name_ar : f.name_en}
                    </span>
                    <span style={{
                      ...quietPill,
                      background: f.support === "alone" ? "rgba(42,35,28,.06)" : M.goldSoft,
                      color: f.support === "alone" ? M.body : M.action,
                    }}>
                      {isAR ? supportText.ar : supportText.en}
                    </span>
                  </button>

                  {open && (
                    <div style={{ padding: "4px 22px 22px" }}>
                      <div style={{ ...label, fontSize: 9.5, marginBottom: 6 }}>{isAR ? "الآلية" : "The mechanism"}</div>
                      <p style={{ margin: "0 0 16px", fontSize: 14.5, lineHeight: 1.7, maxWidth: "44rem" }}>
                        {isAR ? f.mechanism_ar : f.mechanism_en}
                      </p>

                      <div style={{
                        display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
                        padding: "13px 16px", background: M.page, borderRadius: 13,
                      }}>
                        <Play size={16} color={M.action} style={{ flex: "none" }} />
                        <span style={{ fontSize: 13, color: M.body }}>
                          {isAR ? "فيلم قصير يشرح هذه الآلية" : "A short film showing this mechanism"}
                        </span>
                      </div>

                      {f.hamad_en && (
                        <div style={{ ...flat, padding: "15px 18px", marginBottom: 14, display: "flex", gap: 12 }}>
                          <span style={{
                            width: 28, height: 28, borderRadius: "50%", background: M.action, flex: "none",
                            display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: M.cream,
                          }}>H</span>
                          <span style={{ fontSize: 13.5, lineHeight: 1.65, color: M.heading }}>
                            {isAR ? f.hamad_ar : f.hamad_en}
                          </span>
                        </div>
                      )}

                      <Question a={{ id: `file-${f.id}`, q_en: f.task_en, q_ar: f.task_ar }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Nav label_en="Build your table" label_ar="ابنِ جدولك" />
        </div>
      )}

      {/* ═══ 6. the table the learner builds ══════════════ */}
      {stage === 6 && (() => {
        const unplaced = CARDS.filter(c => !placed[c.id]);
        const drop = (cell: string) => {
          if (!held) return;
          const c = CARDS.find(x => x.id === held);
          if (!c) return;
          setPlaced(p => ({ ...p, [held]: cell }));
          setHeld(null);
        };
        const cellFor = (fileId: string, slot: string) => {
          const key = `${fileId}:${slot}`;
          const cardId = Object.keys(placed).find(id => placed[id] === key);
          return { key, card: CARDS.find(c => c.id === cardId), correct: cardId?.startsWith(fileId) && cardId.endsWith(slot) };
        };

        return (
          <div>
            <div style={{ ...label, marginBottom: 8 }}>{isAR ? "جدولك" : "Your table"}</div>
            <h1 style={{
              margin: "0 0 10px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
              lineHeight: 1.25, color: M.heading, maxWidth: "42rem",
            }}>
              {isAR ? "ضع بطاقاتك في مكانها" : "Put your own cards where they belong"}
            </h1>
            <p style={{ margin: "0 0 18px", maxWidth: "42rem", fontSize: 14, lineHeight: 1.7 }}>
              {isAR
                ? "هذه هي الجمل التي خرجت من الملفات الثلاثة. اسحبها، أو انقر بطاقة ثم انقر خانة."
                : "These are the lines that came out of the three files. Drag one, or tap a card then tap a cell."}
            </p>

            {/* the loose cards */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20,
              minHeight: 52, padding: unplaced.length ? 0 : "14px 0",
            }}>
              {unplaced.length === 0 && (
                <span style={{ fontSize: 13.5, color: M.body, fontStyle: "italic" }}>
                  {isAR ? "كل البطاقات موضوعة." : "Every card is placed."}
                </span>
              )}
              {unplaced.map(c => (
                <button
                  key={c.id}
                  draggable
                  onDragStart={() => setHeld(c.id)}
                  onClick={() => setHeld(held === c.id ? null : c.id)}
                  style={{
                    cursor: "grab", font: "inherit", textAlign: "start",
                    fontSize: 13, lineHeight: 1.45, maxWidth: 230,
                    padding: "11px 14px", borderRadius: 12,
                    background: held === c.id ? M.action : M.card,
                    color: held === c.id ? M.cream : M.heading,
                    border: `1px solid ${held === c.id ? M.action : M.gold}`,
                    boxShadow: held === c.id ? "0 6px 16px rgba(143,106,56,.22)" : "none",
                  }}
                >
                  {isAR ? c.ar : c.en}
                </button>
              ))}
            </div>

            {/* the grid */}
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 560 }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "1.1fr 1.2fr 1.2fr", gap: 10,
                  paddingBottom: 8,
                }}>
                  <span style={{ ...label, fontSize: 9.5 }}>{isAR ? "المحاولة" : "The attempt"}</span>
                  <span style={{ ...label, fontSize: 9.5 }}>{isAR ? "ماذا راقب" : "What it watched"}</span>
                  <span style={{ ...label, fontSize: 9.5 }}>{isAR ? "أين انكسر" : "Where it broke"}</span>
                </div>

                {FILES.map(f => (
                  <div key={f.id} style={{
                    display: "grid", gridTemplateColumns: "1.1fr 1.2fr 1.2fr", gap: 10, marginBottom: 10,
                  }}>
                    <div style={{ ...flat, padding: "14px 16px", display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ fontFamily: mono, fontSize: 11, color: M.goldDeep }}>{f.n}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: M.heading }}>
                        {isAR ? f.name_ar : f.name_en}
                      </span>
                    </div>

                    {(["watched", "broke"] as const).map(slot => {
                      const { key, card: c, correct } = cellFor(f.id, slot);
                      return (
                        <div
                          key={slot}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => drop(key)}
                          onClick={() => drop(key)}
                          style={{
                            minHeight: 56, padding: "12px 14px", borderRadius: 13,
                            display: "flex", alignItems: "center", gap: 8,
                            cursor: held ? "pointer" : "default",
                            background: c ? (correct ? M.goldSoft : M.card) : "transparent",
                            border: c
                              ? `1px solid ${correct ? M.gold : "rgba(42,35,28,.16)"}`
                              : `1px dashed ${held ? M.action : "rgba(42,35,28,.20)"}`,
                          }}
                        >
                          {c ? (
                            <>
                              {correct && <Check size={13} strokeWidth={3} color={M.action} style={{ flex: "none" }} />}
                              <span style={{ fontSize: 13, lineHeight: 1.45, color: M.heading }}>
                                {isAR ? c.ar : c.en}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, color: "rgba(42,35,28,.34)" }}>
                              {held ? (isAR ? "ضعها هنا" : "Drop it here") : ""}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {unplaced.length === 0 && (
              <div style={{ ...flat, padding: "16px 20px", marginTop: 14, background: M.goldSoft, borderColor: M.gold }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: M.heading }}>
                  {isAR
                    ? "انظر إلى عمود أين انكسر. ثلاث طرق مختلفة تماماً، فهل انتهت إلى الشيء نفسه؟"
                    : "Look down the where it broke column. Three completely different routes. Did they end in the same place?"}
                </p>
              </div>
            )}

            <Nav label_en="Ask the last questions" label_ar="اسأل الأسئلة الأخيرة" />
          </div>
        );
      })()}

      {/* ═══ 7. toward the gap, never stating it ══════════ */}
      {stage === 7 && (
        <div>
          <div style={{ ...label, marginBottom: 8 }}>{isAR ? "آخر شيء" : "The last thing"}</div>
          <h1 style={{
            margin: "0 0 20px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
            lineHeight: 1.25, color: M.heading, maxWidth: "42rem",
          }}>
            {isAR ? "لن نخبرك بالفجوة" : "We are not going to tell you the gap"}
          </h1>

          <div style={{ padding: "22px 24px", background: ROUDA.tint, border: `1px solid ${ROUDA.line}`, borderRadius: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
              <span style={{
                width: 30, height: 30, borderRadius: "50%", background: M.action,
                display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: M.cream,
              }}>H</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: M.action }}>{isAR ? "حمد" : "Hamad"}</span>
            </div>
            {GAP_ASKS.map(a => <Question key={a.id} a={a} tone={ROUDA.mid} />)}
          </div>

          {ans["missing"] && (
            <div style={{ ...card, padding: "22px 24px", marginTop: 16, border: `2px solid ${M.action}` }}>
              <div style={{ ...label, fontSize: 10, marginBottom: 10 }}>
                {isAR ? "فجوتك، بكلماتك" : "Your gap, in your words"}
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 16.5, lineHeight: 1.65, color: M.heading, fontWeight: 700 }}>
                {ans["missing"]}
              </p>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65 }}>
                {isAR
                  ? "لم يعطك أحد هذه الجملة. اشتققتها من جدول ملأته بنفسك. هذه هي الفكرة."
                  : "Nobody handed you that sentence. You derived it from a table you filled in yourself. That was the point."}
              </p>
            </div>
          )}

          <Nav label_en="Turn it into a challenge" label_ar="حوّلها إلى تحدٍ" disabled={!ans["missing"]} />
        </div>
      )}

      {/* ═══ 8. the gap becomes a challenge ═══════════════ */}
      {stage === 8 && (() => {
        const parts = isAR ? CHALLENGE.parts_ar : CHALLENGE.parts_en;
        const hints = isAR ? CHALLENGE.hints_ar : CHALLENGE.hints_en;
        const keys = ["ch1", "ch2", "ch3", "ch4"];
        const done = keys.every(k => (ans[k] ?? "").trim().length > 0);

        /* a blank that grows with what is typed, so the sentence stays a sentence */
        const Blank = ({ i }: { i: number }) => {
          const v = ans[keys[i]] ?? "";
          return (
            <input
              value={v}
              onChange={e => set(keys[i], e.target.value)}
              placeholder={hints[i]}
              size={Math.max(hints[i].length, v.length + 1)}
              style={{
                font: "inherit", fontSize: "inherit", lineHeight: "inherit",
                fontWeight: 700, color: M.action,
                background: v ? M.goldSoft : "transparent",
                border: "none", borderBottom: `2px solid ${v ? M.action : M.gold}`,
                borderRadius: v ? 6 : 0, padding: "2px 8px", margin: "0 3px",
                minWidth: 90, outline: "none",
              }}
            />
          );
        };

        return (
          <div>
            <div style={{ ...label, marginBottom: 8 }}>{isAR ? "التحدي" : "The challenge"}</div>
            <h1 style={{
              margin: "0 0 10px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
              lineHeight: 1.25, color: M.heading, maxWidth: "42rem", textWrap: "balance",
            }}>
              {isAR ? CHALLENGE.intro_ar : CHALLENGE.intro_en}
            </h1>
            <p style={{ margin: "0 0 22px", maxWidth: "42rem", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>
              {isAR ? CHALLENGE.rule_ar : CHALLENGE.rule_en}
            </p>

            {ans["missing"] && (
              <div style={{ ...flat, padding: "14px 18px", marginBottom: 18, background: M.page }}>
                <div style={{ ...label, fontSize: 9, marginBottom: 5 }}>
                  {isAR ? "الفجوة كما كتبتها" : "The gap, as you wrote it"}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: M.heading, fontStyle: "italic" }}>
                  {ans["missing"]}
                </div>
              </div>
            )}

            <div style={{
              ...card, padding: "28px 30px",
              border: `2px solid ${done ? M.action : M.gold}`,
            }}>
              <p style={{
                margin: 0, fontSize: "clamp(16px,2.2vw,19px)", lineHeight: 2.2,
                color: M.heading, fontWeight: 600,
              }}>
                {parts[0]}<Blank i={0} />
                {parts[1]}<Blank i={1} />
                {parts[2]}<Blank i={2} />
                {parts[3]}<Blank i={3} />
                {parts[4]}
              </p>
            </div>

            {done && (
              <div style={{ padding: "18px 22px", marginTop: 16, background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 18 }}>
                <div style={{ ...label, fontSize: 9.5, marginBottom: 8, color: M.action }}>
                  {isAR ? "موجز التحدي" : "The brief"}
                </div>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: M.heading }}>
                  {parts[0]}<b>{ans.ch1}</b>{parts[1]}<b>{ans.ch2}</b>{parts[2]}<b>{ans.ch3}</b>{parts[3]}<b>{ans.ch4}</b>{parts[4]}
                </p>
              </div>
            )}

            <Nav label_en="Company Next" label_ar="الشركة التالية" disabled={!done} />
          </div>
        );
      })()}

      {/* ═══ 9. Company Next ═════════════════════════════ */}
      {stage === 9 && (() => {
        const parts = isAR ? CHALLENGE.parts_ar : CHALLENGE.parts_en;
        const answered = NEXT_ASKS.filter(a => (ans[a.id] ?? "").trim().length > 0).length;
        const complete = answered === NEXT_ASKS.length;

        return (
          <div>
            <div style={{ ...label, marginBottom: 8 }}>{isAR ? "الشركة التالية" : "Company Next"}</div>
            <h1 style={{
              margin: "0 0 10px", fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
              lineHeight: 1.25, color: M.heading, maxWidth: "42rem", textWrap: "balance",
            }}>
              {isAR ? "الآن ابنِ الحل" : "Now build the answer"}
            </h1>
            <p style={{ margin: "0 0 20px", maxWidth: "42rem", fontSize: 14.5, lineHeight: 1.7 }}>
              {isAR
                ? "ثلاثة حاولوا قبلك واصطدموا بالجدار نفسه. أنت تعرف الآن أين هو. اقترح ما يأتي بعدهم."
                : "Three tried before you and hit the same wall. You now know where it is. Propose what comes after them."}
            </p>

            {/* their own brief, pinned above the work */}
            <div style={{
              padding: "18px 22px", marginBottom: 20,
              background: M.card, border: `2px solid ${M.action}`, borderRadius: 18,
            }}>
              <div style={{ ...label, fontSize: 9.5, marginBottom: 8 }}>
                {isAR ? "تبني على تحديك أنت" : "You are building against your own brief"}
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: M.heading }}>
                {parts[0]}<b>{ans.ch1}</b>{parts[1]}<b>{ans.ch2}</b>{parts[2]}<b>{ans.ch3}</b>{parts[3]}<b>{ans.ch4}</b>{parts[4]}
              </p>
            </div>

            <div style={{ ...card, padding: "22px 24px" }}>
              {NEXT_ASKS.map(a => <Question key={a.id} a={a} />)}
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginTop: 14,
              fontFamily: mono, fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase", color: M.goldDeep,
            }}>
              {answered} / {NEXT_ASKS.length} {isAR ? "مكتمل" : "answered"}
            </div>

            {complete && (
              <div style={{ padding: "22px 26px", marginTop: 16, background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 20 }}>
                <div style={{ fontSize: 17.5, fontWeight: 800, color: M.heading, marginBottom: 10 }}>
                  {isAR ? NEXT_CLOSE.head_ar : NEXT_CLOSE.head_en}
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: M.heading, maxWidth: "46rem" }}>
                  {isAR ? NEXT_CLOSE.body_ar : NEXT_CLOSE.body_en}
                </p>
              </div>
            )}

            <div style={{
              display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24,
              paddingTop: 18, borderTop: `1px solid ${M.line}`,
            }}>
              <button onClick={() => setStage(s => s - 1)} style={ghostButton}>
                {isAR ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
                {isAR ? "رجوع" : "Back"}
              </button>
              <Link href="/passport" style={{ ...button, opacity: complete ? 1 : 0.45, pointerEvents: complete ? "auto" : "none" }}>
                {isAR ? "احفظه في جوازي" : "Save it to my passport"}
              </Link>
              <Link href="/learn/cybersecurity/case/ransomware-hospitals" style={ghostButton}>
                {isAR ? "قارن بالطريقة الأخرى" : "Compare with the other approach"}
              </Link>
              <button onClick={() => setStage(0)} style={{ ...ghostButton, border: "none", color: M.body }}>
                {isAR ? "من البداية" : "Start again"}
              </button>
            </div>
          </div>
        );
      })()}
    </InnovationPage>
  );
}
