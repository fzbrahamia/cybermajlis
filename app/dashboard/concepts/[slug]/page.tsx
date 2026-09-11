"use client";

/* One concept, in one of two shapes.
 *
 * A BOOK is wide and wants to be looked at, so it goes across the top and the
 * board sits under it. Squeezing a storybook into half a column is what cut it
 * in half before.
 *
 * A FILM is a rectangle and sits happily on the left, with the board beside it.
 *
 * Either way the board is the same pieces: what you saw, what it really is, why
 * it matters, then the kinds as separate boxes in a row rather than a list,
 * because six things in a row read and six things in a list do not. */

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { CyberPage, Head, SectionHead, Rise, Item, Grid, Rule, Film, C, ACCENT } from "@/components/cyber/shell";
import { conceptBySlug, caseBySlug } from "@/app/lib/cyberData";
import { markDone, readDone } from "@/app/lib/conceptProgress";
import FirewallBook from "@/components/innovation/FirewallBook";

const TONE = ACCENT.concepts;

const over: React.CSSProperties = {
  fontSize: ".62rem", letterSpacing: ".28em", textTransform: "uppercase",
  color: C.mid, marginBottom: ".7rem",
};

export default function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isAR = useLocale() === "ar";
  const c = conceptBySlug(slug);

  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [filmMissing, setFilmMissing] = useState(false);
  useEffect(() => { setDone(Boolean(readDone()[`cm-${slug}`])); }, [slug]);

  if (!c) {
    return <CyberPage><Head section="Cyber Majlis" title="Not" tail="Found"
      back="/dashboard/concepts" backLabel="← Back" /></CyberPage>;
  }

  const right = picked !== null && picked === c.quiz.right;
  const options = isAR ? c.quiz.options_ar : c.quiz.options_en;
  const isBook = c.media.kind === "book";

  const choose = (i: number) => {
    setPicked(i);
    if (i === c.quiz.right) { markDone(`cm-${slug}`); setDone(true); }
  };

  /* The three paragraphs of the board, used by both shapes. */
  const Words = () => (
    <div className="cy-panel" style={{ overflow: "hidden", height: "100%" }}>
      <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
      <div className="cy-board" style={{ padding: "1.9rem 2rem .5rem" }}>
        <div>
          <div style={over}>{isAR ? "ما شاهدته" : "What you saw"}</div>
          <p style={{ margin: 0, fontSize: ".97rem", lineHeight: 1.72, color: C.body, fontWeight: 300 }}>
            {isAR ? c.board.saw_ar : c.board.saw_en}
          </p>
        </div>
        <div>
          <div style={over}>{isAR ? "ما هو فعلاً" : "What it really is"}</div>
          <p style={{ margin: 0, fontSize: ".97rem", lineHeight: 1.72, color: C.body, fontWeight: 300 }}>
            {isAR ? c.board.is_ar : c.board.is_en}
          </p>
        </div>
        <div>
          <div style={over}>{isAR ? "لماذا يهم" : "Why it matters"}</div>
          <p style={{ margin: 0, fontSize: ".97rem", lineHeight: 1.72, color: C.body, fontWeight: 300 }}>
            {isAR ? c.board.why_ar : c.board.why_en}
          </p>
        </div>
        <div style={{
          padding: "1rem 1.15rem", borderRadius: 14,
          background: "rgba(99,32,36,.055)", border: `1px solid ${C.line}`,
        }}>
          <div style={{ ...over, marginBottom: ".45rem" }}>{isAR ? "أين يتوقف" : "Where it stops"}</div>
          <p style={{ margin: 0, fontSize: ".95rem", lineHeight: 1.65, color: C.head }}>
            {isAR ? c.board.stops_ar : c.board.stops_en}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <CyberPage>
      <style>{`
        /* Columns, not a grid: a grid made the short side leave a hole under
           itself. Columns let the text flow on and the box ends where it ends. */
        .cy-board { columns: 2; column-gap: 2.4rem; }
        .cy-board > * { break-inside: avoid; margin-bottom: 1.6rem; }
        @media (max-width: 56rem) { .cy-board { columns: 1 } }
      `}</style>
      <Head
        section={isAR ? "المجلس السيبراني · مفهوم" : "Cyber Majlis · Concept"}
        title={isAR ? c.name_ar : c.name_en}
        sub={isAR ? c.line_ar : c.line_en}
        back="/dashboard/concepts"
        backLabel={isAR ? "← العودة إلى المفاهيم" : "← Back to Concepts"}
      />

      <Rise style={{ marginBottom: "2rem" }}>
        <div className="cy-panel" style={{ overflow: "hidden" }}>
          <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
          <div style={{ padding: isBook ? ".6rem .6rem 1rem" : "1rem" }}>
            {isBook ? (
              <div style={{ ["--fb-fit" as string]: ".78" }}>
                <FirewallBook titleEn={c.name_en} titleAr={c.name_ar} />
              </div>
            ) : filmMissing ? (
              <div style={{
                padding: "4rem 2rem", textAlign: "center", borderRadius: 12,
                background: "rgba(99,32,36,.04)", border: `1px dashed ${C.line}`,
              }}>
                <p style={{ margin: "0 0 .4rem", fontSize: "1.05rem", fontWeight: 700, color: C.head }}>
                  {isAR ? "الفيلم لم يُرفع بعد" : "The film is not uploaded yet"}
                </p>
                <p style={{ margin: 0, fontSize: ".93rem", color: C.body, fontWeight: 300 }}>
                  {isAR ? "اللوح أسفله جاهز." : "The board below it is ready."}
                </p>
              </div>
            ) : (
              <Film src={c.media.src!} poster={`/lessons/covers/${c.slug}.jpg`}
                onError={() => setFilmMissing(true)} />
            )}
          </div>
        </div>
      </Rise>

      <Rise delay={.06} style={{ marginBottom: "2rem" }}><Words /></Rise>

      {/* ── the kinds, as boxes in a row ── */}
      <SectionHead title={isAR ? c.board.kinds_title_ar : c.board.kinds_title_en} />
      <Grid min={240} style={{ marginBottom: "3rem" }}>
        {c.board.kinds.map(k => (
          <Item key={k.name_en} style={{ height: "100%" }}>
            <div className="cy-card" style={{ ["--tone" as string]: TONE, height: "100%" }}>
              <div className="cy-stripe" style={{ ["--tone" as string]: TONE }} />
              <div style={{ padding: "1.3rem 1.4rem 1.5rem", display: "flex", flexDirection: "column", gap: ".45rem", flex: 1 }}>
                <b style={{ fontSize: "1.02rem", fontWeight: 800, color: C.head, lineHeight: 1.3 }}>
                  {isAR ? k.name_ar : k.name_en}
                </b>
                <span style={{ fontSize: ".9rem", lineHeight: 1.62, color: C.body, fontWeight: 300 }}>
                  {isAR ? k.body_ar : k.body_en}
                </span>
              </div>
            </div>
          </Item>
        ))}
      </Grid>

      {/* ── the question ── */}
      <Rise>
        <div className="cy-panel" style={{
          overflow: "hidden", marginBottom: "3rem",
          background: done || right
            ? "linear-gradient(160deg, #FBF3E2 0%, #F2E6CC 100%)"
            : undefined,
          borderColor: done || right ? C.gold : undefined,
        }}>
          <div className="cy-stripe" style={{ ["--tone" as string]: done || right ? C.gold : TONE }} />
          <div style={{ padding: "2rem 2.1rem 2.2rem", textAlign: "center" }}>
            <div style={{ ...over, marginBottom: ".8rem" }}>
              {done && picked === null
                ? (isAR ? "أنهيته" : "You finished this one")
                : (isAR ? "سؤال واحد" : "One question")}
            </div>
            <p style={{
              margin: "0 auto 1.4rem", fontSize: "clamp(1.15rem,2.2vw,1.45rem)", fontWeight: 800,
              lineHeight: 1.42, color: C.head, maxWidth: "32ch",
            }}>
              {isAR ? c.quiz.q_ar : c.quiz.q_en}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", maxWidth: "34rem", margin: "0 auto" }}>
              {options.map((opt, i) => {
                const on = picked === i;
                const good = on && i === c.quiz.right;
                const bad = on && i !== c.quiz.right;
                return (
                  <button key={i} onClick={() => choose(i)} disabled={right}
                    style={{
                      font: "inherit", fontFamily: "var(--ui)", fontSize: "1rem", fontWeight: 600,
                      textAlign: "start", cursor: right ? "default" : "pointer",
                      padding: "1rem 1.2rem", borderRadius: 14,
                      display: "flex", alignItems: "center", gap: 12,
                      background: good ? "rgba(197,165,126,.3)" : bad ? "rgba(139,38,53,.07)" : "rgba(255,255,255,.7)",
                      color: C.head,
                      border: `1px solid ${good ? C.gold : bad ? "rgba(139,38,53,.3)" : C.line}`,
                      transition: "background .2s, border-color .2s",
                    }}>
                    <span aria-hidden style={{
                      width: 22, height: 22, borderRadius: "50%", flex: "none",
                      display: "grid", placeItems: "center",
                      background: good ? C.maroon : "transparent",
                      border: good ? "none" : `1.5px solid rgba(99,32,36,.22)`, color: "#fff",
                    }}>{good && <Check size={13} strokeWidth={3.5} />}</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {picked !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: "1.4rem" }}>
                  {right ? (
                    <>
                      <Rule width={36} />
                      <p style={{ margin: "0 auto", fontSize: "1rem", lineHeight: 1.68, color: C.head, maxWidth: "44ch" }}>
                        {isAR ? c.quiz.why_ar : c.quiz.why_en}
                      </p>
                      <p style={{
                        margin: ".9rem 0 0", fontSize: ".68rem", letterSpacing: ".2em",
                        textTransform: "uppercase", color: C.maroon, fontWeight: 700,
                      }}>
                        {isAR ? "بيتك صار أكثر أماناً" : "Your house just got safer"}
                      </p>
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                      <span style={{ fontSize: ".97rem", color: C.body, fontWeight: 300 }}>
                        {isAR ? "ليست هذه. اقرأ اللوحة مرة أخرى." : "Not that one. Read the board again."}
                      </span>
                      <button onClick={() => setPicked(null)} className="cy-back"
                        style={{ cursor: "pointer", font: "inherit", fontFamily: "var(--ui)" }}>
                        <RotateCcw size={13} />{isAR ? "مرة أخرى" : "Again"}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Rise>

      {/* ── why it mattered ── */}
      {c.cases.length > 0 && (
        <>
          <SectionHead
            title={isAR ? "حدث هذا فعلاً" : "This Actually Happened"}
            sub={isAR ? "ما كلّفه غياب هذا أناساً حقيقيين" : "What its absence cost real people"}
          />
          <Grid min={320}>
            {c.cases.map(id => {
              const k = caseBySlug(id);
              if (!k) return null;
              return (
                <Item key={id} style={{ height: "100%" }}>
                  <Link href={`/dashboard/cases/${k.slug}`} className="cy-card"
                    style={{ ["--tone" as string]: ACCENT.cases, height: "100%" }}>
                    <div className="cy-stripe" style={{ ["--tone" as string]: ACCENT.cases }} />
                    <div style={{ padding: "1.5rem 1.6rem 1.7rem", display: "flex", flexDirection: "column", flex: 1, textAlign: "center", alignItems: "center" }}>
                      <span className="cy-chip" style={{ marginBottom: ".8rem" }}>{isAR ? k.when_ar : k.when_en}</span>
                      <h3 style={{ margin: "0 0 .5rem", fontSize: "1.15rem", fontWeight: 800, color: C.head, lineHeight: 1.32 }}>
                        {isAR ? k.name_ar : k.name_en}
                      </h3>
                      <p style={{ margin: 0, fontSize: ".93rem", lineHeight: 1.62, color: C.body, fontWeight: 300 }}>
                        {isAR ? k.line_ar : k.line_en}
                      </p>
                      <div className="cy-arrow" style={{ width: "100%" }}>{isAR ? "افتحها" : "Open it"}</div>
                    </div>
                  </Link>
                </Item>
              );
            })}
          </Grid>
        </>
      )}
    </CyberPage>
  );
}
