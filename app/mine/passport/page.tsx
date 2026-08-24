"use client";

/* The passport.

   Mine is the workbench: what you are in the middle of. This is the record:
   where you have been, what you had to hold in your head to get there, and
   what you actually said at the turns.

   Nothing on this page is a number I made up. Every figure is counted from
   what is stored, and where nothing is stored the page says so rather than
   showing a zero dressed up as progress. */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { Stagger, Rise, Lift, RoomHead, Says } from "@/components/innovation/Alive";
import { ArrowRight, Check, Quote } from "lucide-react";
import { Face } from "@/components/innovation/Alive";
import { CASES, DOMAINS } from "@/app/lib/domainData";
import { CATEGORIES, conceptById } from "@/app/lib/conceptData";
import { VERBS } from "@/app/lib/innovationData";
import { M, sans, HUES, R, card, flat, btn, ghost, quiet, label } from "@/components/innovation/theme";

const H = HUES.blue;

/* The four turns worth keeping, in the order they happen. The first two are
   the same child on the same problem before and after the evidence, which is
   the only honest way to see whether anything moved. */
const VOICE = [
  { k: "what",    en: "The first thing you said",        ar: "أول ما قلته" },
  { k: "precise", en: "After you had seen the evidence", ar: "بعد أن رأيت الأدلة" },
  { k: "gap",     en: "What you said is still missing",  ar: "ما قلت إنه ما زال ناقصاً" },
  { k: "changed", en: "What changed your mind",          ar: "ما غيّر رأيك" },
] as const;

/* A move counts as done only when something was kept from doing it. */
type Kept = { log: number; interviews: number; gaps: number };

type Run = {
  id: string; title: string; domain: string;
  stage: number; done: boolean;
  ans: Record<string, string>;
  needs: string[];
  at: number;
};

type Across = { then: string; now: string; next: string };
const ACROSS_KEY = "mj-across";

export default function PassportPage() {
  const isAR = useLocale() === "ar";
  const [runs, setRuns] = useState<Run[]>([]);
  const [kept, setKept] = useState<Kept>({ log: 0, interviews: 0, gaps: 0 });
  const [ready, setReady] = useState(false);
  const [across, setAcross] = useState<Across | null>(null);
  const [acrossState, setAcrossState] = useState<"idle" | "busy" | "none">("idle");

  useEffect(() => {
    const out: Run[] = [];
    for (const c of CASES) {
      try {
        const raw = localStorage.getItem(`mj-case-${c.id}`);
        if (!raw) continue;
        const s = JSON.parse(raw);
        out.push({
          id: c.id, title: isAR ? c.title_ar : c.title_en, domain: c.domain,
          stage: s.stage ?? 0, done: (s.stage ?? 0) >= 10,
          ans: s.ans ?? {}, needs: c.needs ?? [],
          at: s.startedAt ?? 0,
        });
      } catch { /* private mode */ }
    }
    // Oldest first, so "then" and "now" mean what they say.
    out.sort((a, b) => a.at - b.at);
    setRuns(out);

    try {
      const saved = localStorage.getItem(ACROSS_KEY);
      if (saved) setAcross(JSON.parse(saved));
    } catch { /* private mode */ }

    try {
      const mine = JSON.parse(localStorage.getItem("mj-mine") ?? "{}");
      setKept({
        log: (mine.log ?? []).length,
        interviews: (mine.answers ?? []).filter((a: { a?: string }) => a.a?.trim()).length,
        gaps: out.filter(r => r.ans.gap?.trim()).length,
      });
    } catch { /* private mode */ }
    setReady(true);
  }, [isAR]);

  /* Two cases is the minimum for a comparison. It is re-read only when the
     number of cases with something in them changes, so opening the passport
     ten times costs one call, not ten. */
  // Memoised: a fresh array each render would re-fire the effect below forever.
  const pairs = useMemo(() => runs
    .filter(r => r.ans.what?.trim() || r.ans.precise?.trim())
    .map(r => ({ title: r.title, first: r.ans.what, after: r.ans.precise })), [runs]);

  useEffect(() => {
    if (!ready || pairs.length < 2 || acrossState !== "idle") return;
    let stale = false;
    try {
      const saved = JSON.parse(localStorage.getItem(ACROSS_KEY) ?? "null");
      if (saved && saved.n === pairs.length) return;   // already read, nothing new
      stale = true;
    } catch { stale = true; }
    if (!stale) return;

    setAcrossState("busy");
    fetch("/api/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "across", cases: pairs, lang: isAR ? "ar" : "en" }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(out => {
        if (!out?.ok) { setAcrossState("none"); return; }
        const next: Across = { then: out.then, now: out.now, next: out.next };
        setAcross(next); setAcrossState("idle");
        try { localStorage.setItem(ACROSS_KEY, JSON.stringify({ ...next, n: pairs.length })); }
        catch { /* private mode */ }
      })
      .catch(() => setAcrossState("none"));
  }, [ready, pairs, acrossState, isAR]);

  /* Concepts are not ticked off anywhere, so claiming you "learned" one would
     be an invention. What is true is that a case cannot be read without them,
     so opening a case means you have met the ones it needs. */
  const met = new Set(runs.flatMap(r => r.needs));
  const catsMet = CATEGORIES
    .map(c => ({ cat: c, ids: [...met].filter(id => conceptById(id)?.category === c.id) }))
    .filter(x => x.ids.length > 0);

  /* Which of the five moves has anything behind it. */
  const EVIDENCE: Record<string, number> = {
    notice: kept.log + kept.interviews,
    name: kept.gaps,
    make: 0, try: 0, tell: 0,
  };

  const finished = runs.filter(r => r.done).length;
  const nothingYet = ready && runs.length === 0 && kept.log === 0 && kept.interviews === 0;

  return (
    <InnovationPage>
      <RoomHead hue={H}
        eyebrow={isAR ? "المجلس" : "Majlis"}
        title={isAR ? "جوازك" : "Your passport"}
        sub={isAR
          ? "أين ذهبت، وما احتجت أن تفهمه لتصل، وماذا قلت أنت بالضبط."
          : "Where you went, what you had to understand to get there, and what you actually said."} />

      {nothingYet && (
        <div style={{ ...card, padding: "28px 30px", marginTop: 30 }}>
          <p style={{ margin: "0 0 18px", fontSize: 16, lineHeight: 1.65, color: M.heading, maxWidth: "44ch" }}>
            {isAR
              ? "الجواز فارغ حتى الآن. افتح قضية واحدة وسيبدأ بالامتلاء بكلماتك أنت."
              : "The passport is empty so far. Open one case and it starts filling with your own words."}
          </p>
          <Link href="/learn" style={btn(H)}>
            {isAR ? "ابدأ" : "Start"}<ArrowRight size={17} />
          </Link>
        </div>
      )}

      {ready && !nothingYet && (
        <>
          {/* ── then and now, across cases ──────────────── */}
          {pairs.length >= 2 && (
            <div style={{ ...card, padding: "26px 28px", marginTop: 30 }}>
              <div style={{ ...label, marginBottom: 6 }}>
                {isAR ? "أول قضية، وآخر قضية" : "Your first case, and your latest"}
              </div>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: M.body, maxWidth: "46ch", lineHeight: 1.6 }}>
                {isAR
                  ? "نفس السؤال في كل قضية: ما المشكلة هنا؟ هذا ما قلته في المرة الأولى، وهذا ما تقوله الآن."
                  : "The same question in every case: what is the problem here? This is what you said the first time, and what you say now."}
              </p>

              <div style={{
                display: "grid", gap: 12, marginBottom: across ? 22 : 0,
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,17rem),1fr))",
              }}>
                <div style={{ ...flat, padding: "17px 19px", background: M.page }}>
                  <div style={{ ...label, fontSize: 9, marginBottom: 7 }}>
                    {isAR ? `آنذاك · ${pairs[0].title}` : `Then · ${pairs[0].title}`}
                  </div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.65, color: M.body, fontStyle: "italic" }}>
                    {pairs[0].after || pairs[0].first}
                  </div>
                </div>
                <div style={{ ...flat, padding: "17px 19px", background: H.tint, border: `1px solid ${H.soft}` }}>
                  <div style={{ ...label, fontSize: 9, marginBottom: 7, color: H.deep }}>
                    {isAR ? `الآن · ${pairs[pairs.length - 1].title}` : `Now · ${pairs[pairs.length - 1].title}`}
                  </div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.65, color: M.heading }}>
                    {pairs[pairs.length - 1].after || pairs[pairs.length - 1].first}
                  </div>
                </div>
              </div>

              {acrossState === "busy" && (
                <div style={{ display: "flex", gap: 11, alignItems: "center", marginTop: 18 }}>
                  <Face who="hamad" size={28} />
                  <span style={{ fontSize: 14, color: M.body }}>
                    {isAR ? "أقارن بينهما..." : "Comparing the two..."}
                  </span>
                </div>
              )}

              {across && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 20, borderTop: `1px solid rgba(42,35,28,.09)` }}>
                  {[
                    { k: "then", t: isAR ? "كيف كنت تفكر" : "How you were thinking", v: across.then },
                    { k: "now",  t: isAR ? "ما الذي تغيّر" : "What changed",          v: across.now },
                    { k: "next", t: isAR ? "جرّب هذا في القادمة" : "Try this in the next one", v: across.next },
                  ].filter(x => x.v).map(x => (
                    <div key={x.k}>
                      <div style={{ ...label, fontSize: 9, marginBottom: 5, color: H.deep }}>{x.t}</div>
                      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                        <Face who="hamad" size={28} />
                        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: M.heading, maxWidth: "50ch" }}>
                          {x.v}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── where you have been ─────────────────────── */}
          <Stagger gap={0.06}>
            <Rise style={{ marginTop: 34, marginBottom: 14 }}>
              <span style={label}>{isAR ? "أين ذهبت" : "Where you have been"}</span>
            </Rise>
            <div style={{
              display: "grid", gap: 12, marginBottom: 40,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,17rem),1fr))",
            }}>
              {runs.map(r => {
                const d = DOMAINS.find(x => x.id === r.domain);
                const pct = Math.min(100, Math.round((r.stage / 10) * 100));
                return (
                  <Lift key={r.id} hue={H} style={{ ...card, padding: "20px 22px" }}>
                    <div style={{ ...label, fontSize: 9.5, marginBottom: 8, color: d?.tone ?? H.deep }}>
                      {d ? (isAR ? d.name_ar : d.name_en) : r.domain}
                    </div>
                    <div style={{ fontSize: 16.5, fontWeight: 800, color: M.heading, lineHeight: 1.35, marginBottom: 12 }}>
                      {r.title}
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "rgba(42,35,28,.07)", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: r.done ? H.mid : H.soft }} />
                    </div>
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 7 }}>
                      {r.done && <Check size={13} strokeWidth={3} color={H.deep} />}
                      <span style={{ fontSize: 13, color: M.body }}>
                        {r.done
                          ? (isAR ? "أنهيتها" : "You finished it")
                          : (isAR ? `توقفت عند الخطوة ${r.stage} من 10` : `You stopped at step ${r.stage} of 10`)}
                      </span>
                    </div>
                  </Lift>
                );
              })}
            </div>
          </Stagger>

          {/* ── what you had to hold ────────────────────── */}
          {catsMet.length > 0 && (
            <Stagger gap={0.06}>
              <Rise style={{ marginBottom: 6 }}>
                <span style={label}>{isAR ? "ما احتجت أن تفهمه" : "What you had to understand"}</span>
              </Rise>
              <Rise style={{ marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 14, color: M.body, maxWidth: "48ch", lineHeight: 1.6 }}>
                  {isAR
                    ? "لا يمكن قراءة هذه القضايا بدون هذه الأفكار، فقد مررت بها كلها."
                    : "These cases cannot be read without these ideas, so you have been through all of them."}
                </p>
              </Rise>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
                {catsMet.map(({ cat, ids }) => (
                  <div key={cat.id} style={{ ...flat, padding: "16px 18px" }}>
                    <div style={{ ...label, fontSize: 9.5, marginBottom: 10, color: cat.tone }}>
                      {isAR ? cat.name_ar : cat.name_en}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {ids.map(id => {
                        const c = conceptById(id);
                        if (!c) return null;
                        return (
                          <span key={id} style={{
                            ...quiet, background: `${cat.tone}14`, color: cat.tone,
                            fontSize: 13,
                          }}>
                            {isAR ? c.name_ar : c.name_en}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Stagger>
          )}

          {/* ── the five moves, and what is actually behind each ── */}
          <Stagger gap={0.06}>
            <Rise style={{ marginBottom: 14 }}>
              <span style={label}>{isAR ? "الخطوات الخمس" : "The five moves"}</span>
            </Rise>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 40 }}>
              {VERBS.map(v => {
                const n = EVIDENCE[v.id] ?? 0;
                const on = n > 0;
                return (
                  <div key={v.id} style={{
                    ...flat, padding: "15px 18px", display: "flex",
                    alignItems: "center", gap: 14, flexWrap: "wrap",
                    opacity: on ? 1 : 0.6,
                  }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%", flex: "none",
                      display: "grid", placeItems: "center",
                      background: on ? H.tint : "rgba(42,35,28,.05)",
                      color: on ? H.deep : M.body,
                    }}>
                      {on ? <Check size={14} strokeWidth={3} /> : null}
                    </span>
                    <span style={{ fontSize: 15.5, fontWeight: 800, color: M.heading, minWidth: 68 }}>
                      {isAR ? v.ar : v.en}
                    </span>
                    <span style={{ fontSize: 13.5, color: M.body, flex: 1, minWidth: 180, lineHeight: 1.5 }}>
                      {on
                        ? (isAR ? `${n} من ${v.keeps_ar}` : `${n} of: ${v.keeps_en.toLowerCase()}`)
                        : (isAR ? `لم تفعلها بعد. تحتاج: ${v.keeps_ar}` : `Not yet. It needs: ${v.keeps_en.toLowerCase()}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Stagger>

          {/* ── your own words, before and after ────────── */}
          {runs.some(r => VOICE.some(v => r.ans[v.k]?.trim())) && (
            <Stagger gap={0.06}>
              <Rise style={{ marginBottom: 6 }}>
                <span style={label}>{isAR ? "بكلماتك أنت" : "In your own words"}</span>
              </Rise>
              <Rise style={{ marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 14, color: M.body, maxWidth: "48ch", lineHeight: 1.6 }}>
                  {isAR
                    ? "أول سطرين هما أنت على المشكلة نفسها، قبل الأدلة وبعدها."
                    : "The first two are you on the same problem, before the evidence and after it."}
                </p>
              </Rise>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {runs.filter(r => VOICE.some(v => r.ans[v.k]?.trim())).map(r => (
                  <div key={r.id} style={{ ...card, padding: "22px 24px" }}>
                    <div style={{ ...label, fontSize: 9.5, marginBottom: 16 }}>{r.title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {VOICE.filter(v => r.ans[v.k]?.trim()).map(v => (
                        <div key={v.k}>
                          <div style={{
                            fontSize: 12.5, fontWeight: 800, color: H.deep,
                            marginBottom: 6, display: "flex", alignItems: "center", gap: 6,
                          }}>
                            <Quote size={12} strokeWidth={2.5} />
                            {isAR ? v.ar : v.en}
                          </div>
                          <p style={{
                            margin: 0, fontSize: 15, lineHeight: 1.65, color: M.heading,
                            paddingInlineStart: 14,
                            borderInlineStart: `2px solid ${H.soft}`,
                            maxWidth: "52ch",
                          }}>
                            {r.ans[v.k]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Stagger>
          )}

          <div style={{ marginTop: 34 }}>
            <Says who="rouda" hue={H}>
              {isAR
                ? "اقرأ أول سطرين مرة أخرى. ما الذي تراه الآن ولم تكن تراه؟"
                : "Read the first two again. What do you see now that you did not see then?"}
            </Says>
          </div>
        </>
      )}

      <div style={{ marginTop: 40, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/mine" style={ghost(H)}>
          {isAR ? "تحقيقك" : "Your investigation"}
        </Link>
        <Link href="/learn" style={ghost(H)}>
          {isAR ? "تعلّم" : "Learn"}
        </Link>
      </div>
    </InnovationPage>
  );
}
