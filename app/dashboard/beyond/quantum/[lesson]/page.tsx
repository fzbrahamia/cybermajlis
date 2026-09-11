"use client";

/* A quantum lesson, hosted inside CyberMajlis.
 *
 * Same three beats QuantumMajlis uses, because that ordering is the pedagogy:
 * the story, then what it meant, then run it yourself. What changes is the
 * dress. Nothing here links out to the other majlis, including the labs, which
 * are the same components rendered on this side of the house. */

import { use, useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Film, LayoutGrid, FlaskConical, Check, Hammer } from "lucide-react";
import { CyberPage, Head, SectionHead, Rise, Rule, Film as FilmFrame, C, ACCENT } from "@/components/cyber/shell";
import { QUANTUM_PATH, labsForLesson } from "@/app/lib/quantumData";
import DrawerSearchLab from "@/components/quantum/DrawerSearchLab";
import ScaleLab from "@/components/quantum/ScaleLab";

const TONE = ACCENT.quantum;
const over: React.CSSProperties = {
  fontSize: ".62rem", letterSpacing: ".28em", textTransform: "uppercase",
  color: C.mid, marginBottom: ".7rem",
};

type Step = "video" | "board" | "lab";

function Bench({ id }: { id: string }) {
  if (id === "drawer-search") return <DrawerSearchLab />;
  if (id === "scale") return <ScaleLab />;
  return null;
}

export default function CyberQuantumLesson({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = use(params);
  const isAR = useLocale() === "ar";
  const l = QUANTUM_PATH.find(x => x.slug === lesson);
  const [step, setStep] = useState<Step>("video");
  const [bench, setBench] = useState(0);
  /* The data names a film that is not in the repo yet, so the path resolves to
     a 404 and the player renders broken. Catching the error is the only way to
     know: nothing server side can tell whether the file is really there. */
  const [filmMissing, setFilmMissing] = useState(false);

  if (!l) {
    return <CyberPage><Head section="Cyber Majlis" title="Not" tail="Found"
      back="/dashboard/beyond/quantum" backLabel="← Back" /></CyberPage>;
  }

  const labs = labsForLesson(l.slug);
  type Blk = (typeof l.board)[number];
  const t = (o: Record<string, string>, k: string) => o[`${k}_${isAR ? "ar" : "en"}`] ?? "";

  const STEPS: { id: Step; Icon: typeof Film; en: string; ar: string; note_en: string; note_ar: string }[] = [
    { id: "video", Icon: Film,         en: "The story", ar: "القصّة",  note_en: "Watch first",     note_ar: "شاهد أولاً" },
    { id: "board", Icon: LayoutGrid,   en: "The board", ar: "اللوح",   note_en: "What it means",   note_ar: "ماذا يعني" },
    { id: "lab",   Icon: FlaskConical, en: "The lab",   ar: "المختبر", note_en: "Try it yourself", note_ar: "جرّبه بنفسك" },
  ];

  return (
    <CyberPage>
      <Head
        section={isAR ? "المجلس السيبراني · الكوانتم" : "Cyber Majlis · Quantum"}
        title={isAR ? l.name_ar : l.name_en}
        sub={isAR ? l.subtitle_ar : l.subtitle_en}
        back="/dashboard/beyond/quantum"
        backLabel={isAR ? "← دروس الكوانتم" : "← Quantum Lessons"}
      />

      <div className="cy-rail" style={{
        display: "grid", gap: "1.5rem", alignItems: "start",
        gridTemplateColumns: "14rem minmax(0,1fr)",
      }}>
        {/* ── the three beats, down the side ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", position: "sticky", top: "6rem" }}>
          {STEPS.map(s2 => {
            const on = step === s2.id;
            return (
              <button key={s2.id} onClick={() => setStep(s2.id)}
                style={{
                  font: "inherit", fontFamily: "var(--ui)", cursor: "pointer", textAlign: "start",
                  display: "flex", alignItems: "center", gap: 11,
                  padding: ".85rem .95rem", borderRadius: 14,
                  background: on ? "linear-gradient(160deg, #FBF3E2 0%, #F1E3C8 100%)" : "rgba(255,255,255,.6)",
                  border: `1px solid ${on ? "rgba(197,165,126,.65)" : C.line}`,
                  boxShadow: on ? "0 8px 22px rgba(99,32,36,.1)" : "none",
                  transition: "background .25s, box-shadow .25s, border-color .25s",
                }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 10, flex: "none", display: "grid", placeItems: "center",
                  background: on ? C.maroon : "rgba(99,32,36,.06)",
                  color: on ? C.light : C.mid,
                  transition: "background .25s, color .25s",
                }}>
                  <s2.Icon size={15} strokeWidth={2} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: ".9rem", fontWeight: 800, color: C.head }}>
                    {isAR ? s2.ar : s2.en}
                  </span>
                  <span style={{ display: "block", fontSize: ".7rem", color: C.body, marginTop: 1 }}>
                    {isAR ? s2.note_ar : s2.note_en}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div>
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: .4, ease: [0.16, 1, 0.3, 1] }}>

          {/* ── the story ── */}
          {step === "video" && (
            <div className="cy-panel" style={{ overflow: "hidden", marginBottom: "2rem" }}>
              <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
              <div style={{ padding: "1rem" }}>
                {l.video?.src && !filmMissing ? (
                  <FilmFrame src={l.video.src} poster={`/lessons/covers/${l.slug}.jpg`}
                    onError={() => setFilmMissing(true)} />
                ) : (
                  <div style={{
                    padding: "4rem 2rem", textAlign: "center", borderRadius: 12,
                    background: "rgba(99,32,36,.04)", border: `1px dashed ${C.line}`,
                  }}>
                    <Hammer size={26} color={C.mid} style={{ marginBottom: ".9rem" }} />
                    <p style={{ margin: "0 0 .4rem", fontSize: "1.05rem", fontWeight: 700, color: C.head }}>
                      {isAR ? "الفيلم لم يُرفع بعد" : "The film is not uploaded yet"}
                    </p>
                    <p style={{ margin: 0, fontSize: ".93rem", color: C.body, fontWeight: 300 }}>
                      {isAR
                        ? "اللوح والمختبر جاهزان، فابدأ بأيهما شئت."
                        : "The board and the lab are ready, so start with either of those."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── the board ── */}
          {step === "board" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginBottom: "2rem" }}>
              {l.board.map((w: Blk, i) => {
                const head = t(w as unknown as Record<string, string>, "title");

                /* recap: the one that gets the dark treatment, because it is the
                   story said back and it should feel like the film. */
                if (w.kind === "recap") {
                  return (
                    <div key={i} style={{
                      borderRadius: 20, overflow: "hidden", padding: "2.2rem 2rem",
                      background: `linear-gradient(150deg, #4a1a1d, #2c1011)`,
                      border: `1px solid ${C.gold}55`,
                    }}>
                      <div style={{ ...over, color: "rgba(232,212,188,.9)" }}>{head}</div>
                      <p style={{
                        margin: 0, fontSize: "clamp(1.1rem,2vw,1.35rem)", lineHeight: 1.6,
                        color: "rgba(255,255,255,.93)", maxWidth: "44ch", fontWeight: 300,
                      }}>{t(w as unknown as Record<string, string>, "body")}</p>
                    </div>
                  );
                }

                /* mapping: the story on one line, what it actually is under it */
                if (w.kind === "mapping") {
                  return (
                    <div key={i} className="cy-panel" style={{ overflow: "hidden" }}>
                      <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
                      <div style={{ padding: "1.7rem 1.9rem 1.9rem" }}>
                        <div style={over}>{head}</div>
                        {w.rows.map((r, j) => (
                          <div key={j} style={{
                            display: "grid", gap: "6px 16px", alignItems: "start",
                            gridTemplateColumns: "auto minmax(0,1fr)",
                            padding: "1rem 0", borderTop: j ? `1px solid ${C.line}` : "none",
                          }}>
                            <span aria-hidden style={{
                              width: 9, height: 9, borderRadius: "50%", marginTop: 9,
                              background: TONE, boxShadow: `0 0 0 4px ${TONE}22`,
                            }} />
                            <div>
                              <div style={{ fontSize: "1rem", fontStyle: "italic", color: C.head, marginBottom: 5 }}>
                                {t(r as unknown as Record<string, string>, "story")}
                              </div>
                              <div style={{ fontSize: ".97rem", lineHeight: 1.68, color: C.body, fontWeight: 300 }}>
                                {t(r as unknown as Record<string, string>, "real")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                /* caveat: where the story was lying, and it is owed */
                if (w.kind === "caveat") {
                  return (
                    <div key={i} className="cy-panel" style={{
                      overflow: "hidden",
                      background: "linear-gradient(160deg, #FBF3E2 0%, #F1E3C8 100%)",
                      borderColor: "rgba(197,165,126,.55)",
                    }}>
                      <div className="cy-stripe" style={{ ["--tone" as string]: C.gold }} />
                      <div style={{ padding: "1.7rem 1.9rem 1.9rem" }}>
                        <div style={over}>{head}</div>
                        <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,17rem),1fr))" }}>
                          {w.items.map((it, j) => (
                            <div key={j} style={{
                              padding: "1.1rem 1.2rem", borderRadius: 14,
                              background: "rgba(255,255,255,.6)", border: `1px solid ${C.line}`,
                            }}>
                              <div style={{ fontSize: ".95rem", fontStyle: "italic", color: C.mid, marginBottom: 7 }}>
                                {t(it as unknown as Record<string, string>, "story")}
                              </div>
                              <div style={{ fontSize: ".95rem", lineHeight: 1.65, color: C.head }}>
                                {t(it as unknown as Record<string, string>, "truth")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                /* numbers: so that faster never has to mean magic */
                if (w.kind === "numbers") {
                  return (
                    <div key={i} className="cy-panel" style={{ overflow: "hidden" }}>
                      <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
                      <div style={{ padding: "1.7rem 1.9rem 1.9rem" }}>
                        <div style={over}>{head}</div>
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
                            <thead>
                              <tr>
                                {w.cols.map((c0, j) => (
                                  <th key={j} style={{
                                    textAlign: j ? "end" : "start", padding: ".6rem .8rem",
                                    fontSize: ".64rem", letterSpacing: ".16em", textTransform: "uppercase",
                                    color: C.mid, borderBottom: `1px solid ${C.line}`, fontWeight: 700,
                                  }}>{c0}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {w.rows.map((r, j) => (
                                <tr key={j}>
                                  {r.map((cell, k) => (
                                    <td key={k} style={{
                                      textAlign: k ? "end" : "start", padding: ".7rem .8rem",
                                      fontSize: ".95rem", color: k ? C.head : C.body,
                                      fontWeight: k ? 700 : 400,
                                      borderBottom: `1px solid ${C.line}`,
                                    }}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {t(w as unknown as Record<string, string>, "note") && (
                          <p style={{ margin: "1rem 0 0", fontSize: ".92rem", lineHeight: 1.65, color: C.body, fontWeight: 300 }}>
                            {t(w as unknown as Record<string, string>, "note")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }

                /* realworld: where you meet this outside the majlis */
                return (
                  <div key={i} className="cy-panel" style={{ overflow: "hidden" }}>
                    <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
                    <div style={{ padding: "1.7rem 1.9rem 1.9rem" }}>
                      <div style={over}>{head}</div>
                      <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,16rem),1fr))" }}>
                        {w.items.map((it, j) => (
                          <div key={j} style={{
                            padding: "1.1rem 1.2rem", borderRadius: 14,
                            background: "rgba(255,255,255,.62)", border: `1px solid ${C.line}`,
                          }}>
                            <b style={{ display: "block", fontSize: ".97rem", color: C.head, fontWeight: 800, marginBottom: ".3rem" }}>
                              {t(it as unknown as Record<string, string>, "head")}
                            </b>
                            <span style={{ fontSize: ".92rem", lineHeight: 1.65, color: C.body, fontWeight: 300 }}>
                              {t(it as unknown as Record<string, string>, "body")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── the lab, on this side of the house ── */}
          {step === "lab" && (
            <div style={{ marginBottom: "2rem" }}>
              {labs.length === 0 ? (
                <div className="cy-panel" style={{ padding: "3rem 2rem", textAlign: "center" }}>
                  <p style={{ margin: 0, color: C.body, fontWeight: 300 }}>
                    {isAR ? "لا مختبر لهذا الدرس بعد." : "No lab for this lesson yet."}
                  </p>
                </div>
              ) : (() => {
                const lab = labs[Math.min(bench, labs.length - 1)];
                return (
                  <>
                    {/* more than one bench: pick, do not scroll past */}
                    {labs.length > 1 && (
                      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginBottom: "1.1rem" }}>
                        {labs.map((x, i) => {
                          const on = i === Math.min(bench, labs.length - 1);
                          return (
                            <button key={x.id} onClick={() => setBench(i)}
                              style={{
                                font: "inherit", fontFamily: "var(--ui)", cursor: "pointer",
                                fontSize: ".85rem", fontWeight: 700, padding: ".7rem 1.1rem",
                                borderRadius: 999, color: on ? C.light : C.head,
                                background: on ? C.maroon : "rgba(255,255,255,.65)",
                                border: `1px solid ${on ? C.maroon : C.line}`,
                                transition: "background .25s, color .25s",
                              }}>
                              {isAR ? x.title_ar : x.title_en}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="cy-panel" style={{ overflow: "hidden" }}>
                      <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
                      <div style={{ padding: "1.7rem 1.9rem 2rem" }}>
                        <SectionHead
                          title={isAR ? lab.title_ar : lab.title_en}
                          sub={isAR ? lab.does_ar : lab.does_en}
                        />
                        {lab.ready ? <Bench id={lab.id} /> : (
                          <div style={{ padding: "2.4rem", textAlign: "center", borderRadius: 14, background: "rgba(99,32,36,.04)", border: `1px dashed ${C.line}` }}>
                            <Hammer size={22} color={C.mid} style={{ marginBottom: ".7rem" }} />
                            <p style={{ margin: 0, color: C.body, fontWeight: 300 }}>
                              {isAR ? "هذا المختبر قيد البناء." : "This bench is still being built."}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
        </div>
      </div>
      <style>{`@media (max-width: 58rem){ .cy-rail{ grid-template-columns: 1fr !important } }`}</style>
    </CyberPage>
  );
}
