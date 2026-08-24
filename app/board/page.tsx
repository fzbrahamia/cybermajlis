"use client";

/* Community.
   
   Problems people posted, ours for the month, and a way to add your own.
   CyberMajlis has its own /community for security reports; this is a different
   board with a different job, which is why it has its own route. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Lock, PenLine, X, Send } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { Stagger, Rise, Lift, RoomHead, Says } from "@/components/innovation/Alive";
import { PROBLEMS, type Problem } from "@/app/lib/innovationData";
import { NEEDED_FOR, conceptById } from "@/app/lib/conceptData";
import { M, sans, HUES, R, card, flat, btn, ghost, chip, quiet, label } from "@/components/innovation/theme";

const H = HUES.maroon;
const MINE_KEY = "mj-mine";

type Mine = { posted?: { id: string; what: string; who: string; at: number }[] };

export default function BoardPage() {
  const isAR = useLocale() === "ar";
  const router = useRouter();
  const featured = PROBLEMS.find(p => p.featured);
  const rest = PROBLEMS.filter(p => !p.featured);

  const [writing, setWriting] = useState(false);
  const [what, setWhat] = useState("");
  const [who, setWho] = useState("");
  const [mine, setMine] = useState<Mine>({});

  useEffect(() => {
    try { setMine(JSON.parse(localStorage.getItem(MINE_KEY) ?? "{}")); } catch { /* private mode */ }
  }, []);

  const post = () => {
    if (!what.trim()) return;
    const next: Mine = {
      ...mine,
      posted: [{ id: String(Date.now()), what: what.trim(), who: who.trim(), at: Date.now() }, ...(mine.posted ?? [])],
    };
    setMine(next);
    try { localStorage.setItem(MINE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
    setWhat(""); setWho(""); setWriting(false);
  };

  /* "Take it" used to drop you on your own page with the problem sitting there
     and nothing to do next. It now files the problem and opens the path it
     goes through, because collecting problems you never work on is a hobby. */
  const take = (id: string, what_: string, who_: string) => {
    if (!(mine.posted ?? []).some(p => p.id === id)) {
      const next: Mine = { ...mine, posted: [{ id, what: what_, who: who_, at: Date.now() }, ...(mine.posted ?? [])] };
      setMine(next);
      try { localStorage.setItem(MINE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
    }
    router.push(`/mine/problem/${id}`);
  };

  const tag = (p: Problem) =>
    p.engine === "build" ? { t: isAR ? "يمكنك صنعه" : "You can build this", s: chip(HUES.green) }
    : p.engine === "propose" ? { t: isAR ? "اقتراح فقط" : "Proposal only", s: quiet }
    : { t: isAR ? "سبقك أحدهم" : "Someone got there first", s: chip(HUES.gold) };

  return (
    <InnovationPage>
      <RoomHead hue={H}
        eyebrow={isAR ? "المجتمع" : "Community"}
        title={isAR ? "أشياء لم يصلحها أحد بعد" : "Things nobody has fixed yet"}
        sub={isAR
          ? "بعضها من الناس الذين يعيشونها، وبعضها لاحظه شخص في مثل عمرك."
          : "Some from the people who live them, some noticed by someone your age."} />

      <div style={{ marginTop: 26, marginBottom: 22 }}>
        <button onClick={() => setWriting(w => !w)} style={writing ? ghost(H) : btn(H)}>
          {writing ? <X size={18} /> : <PenLine size={18} />}
          {writing ? (isAR ? "إغلاق" : "Close") : (isAR ? "اكتب مشكلة رأيتها" : "Post a problem you saw")}
        </button>
      </div>

      <AnimatePresence>
        {writing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 22 }}
          >
            <div style={{ ...card, padding: "24px 26px" }}>
              <div style={{ ...label, marginBottom: 14 }}>{isAR ? "ما الذي حدث؟" : "What happened?"}</div>
              <textarea value={what} onChange={e => setWhat(e.target.value)} rows={3}
                placeholder={isAR ? "صف ما رأيته. بلا حلول." : "Describe what you saw. No solutions."}
                style={{
                  width: "100%", boxSizing: "border-box", resize: "vertical", marginBottom: 14,
                  padding: "13px 16px", borderRadius: 16, fontFamily: sans, fontSize: 15.5, lineHeight: 1.6,
                  border: "2px solid rgba(42,35,28,.12)", background: M.page, color: M.heading,
                }} />
              <div style={{ ...label, marginBottom: 10 }}>{isAR ? "لمن يحدث؟" : "Who does it happen to?"}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input value={who} onChange={e => setWho(e.target.value)}
                  placeholder={isAR ? "جدتي، عامل النظافة، صفي..." : "My grandmother, the cleaner, my class..."}
                  style={{
                    flex: 1, minWidth: 200, boxSizing: "border-box", padding: "13px 16px", borderRadius: 16,
                    fontFamily: sans, fontSize: 15.5, border: "2px solid rgba(42,35,28,.12)",
                    background: M.page, color: M.heading,
                  }} />
                <button onClick={post} disabled={!what.trim()}
                  style={{ ...btn(H), opacity: what.trim() ? 1 : 0.4 }}>
                  <Send size={17} />{isAR ? "انشر" : "Post"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Stagger gap={0.07}>
        {(mine.posted ?? []).length > 0 && (
          <Rise>
            <div style={{ ...flat, padding: "20px 22px", marginBottom: 16, borderColor: H.tint }}>
              <div style={{ ...label, marginBottom: 12, color: H.deep }}>{isAR ? "ما نشرته أنت" : "Posted by you"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(mine.posted ?? []).map(x => (
                  <div key={x.id}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: M.heading, lineHeight: 1.45, fontFamily: sans }}>
                      {x.what}
                    </div>
                    {x.who && <div style={{ fontSize: 13, color: M.body, marginTop: 3, fontFamily: sans }}>{x.who}</div>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                {(mine.posted ?? []).map(x => (
                  <Link key={x.id} href={`/mine/problem/${x.id}`} style={{ ...chip(H), textDecoration: "none", alignSelf: "flex-start" }}>
                    {isAR ? "اعمل عليها" : "Work on it"}
                    <ChevronRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
          </Rise>
        )}

        {featured && (
          <Rise>
            <div style={{ ...card, padding: 0, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ height: 6, background: H.mid }} />
              <div style={{ padding: "24px 26px 26px" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <span style={chip(H, true)}>{isAR ? featured.source_ar : featured.source_en}</span>
                  <span style={tag(featured).s}>{tag(featured).t}</span>
                </div>
                <div style={{
                  fontSize: "clamp(19px,2.8vw,24px)", fontWeight: 900, color: M.heading,
                  lineHeight: 1.32, letterSpacing: "-0.015em", marginBottom: 10, maxWidth: "26ch", fontFamily: sans,
                }}>
                  {isAR ? featured.title_ar : featured.title_en}
                </div>
                <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.65, color: M.body, maxWidth: "46ch", fontFamily: sans }}>
                  {isAR ? featured.body_ar : featured.body_en}
                </p>
                <button
                  onClick={() => take(featured.id, isAR ? featured.title_ar : featured.title_en, isAR ? featured.source_ar : featured.source_en)}
                  style={btn(H)}>
                  {isAR ? "خذها" : "Take it"}
                </button>
              </div>
            </div>
          </Rise>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,20rem),1fr))", gap: 13 }}>
          {rest.map(p => {
            const needs = NEEDED_FOR[p.id] ?? [];
            return (
              <Lift key={p.id} hue={H} style={{ ...card, padding: "22px 24px 24px", height: "100%" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={quiet}>{isAR ? p.source_ar : p.source_en}</span>
                  <span style={tag(p).s}>{tag(p).t}</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, color: M.heading, lineHeight: 1.38, marginBottom: 9, letterSpacing: "-0.01em", fontFamily: sans }}>
                  {isAR ? p.title_ar : p.title_en}
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.6, color: M.body, fontFamily: sans }}>
                  {isAR ? p.body_ar : p.body_en}
                </p>
                {needs.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 12, borderTop: "1px solid rgba(42,35,28,.08)" }}>
                    {needs.map(id => {
                      const c = conceptById(id);
                      if (!c) return null;
                      const ok = c.state === "known";
                      return (
                        <Link key={id} href={`/learn/${c.domain}/concept/${id}`} style={{
                          ...(ok ? chip(HUES.green) : quiet), textDecoration: "none", fontSize: 11.5, padding: "5px 11px",
                        }}>
                          {ok ? <Check size={11} strokeWidth={3} /> : <Lock size={10} strokeWidth={2.4} />}
                          {isAR ? c.name_ar : c.name_en}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </Lift>
            );
          })}
        </div>
      </Stagger>

      <div style={{ marginTop: 26 }}>
        <Says who="rouda" hue={H}>
          {isAR ? "أفضل مشكلة هنا هي التي تخص شخصاً غيرك." : "The best problem here is one that belongs to somebody else."}
        </Says>
      </div>
    </InnovationPage>
  );
}
