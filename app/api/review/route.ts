// app/api/review/route.ts
//
// THE LOOK BACK
//
// Rouda judges one answer at a time. Nothing until now read a whole case at
// once, which meant the only person who could see a child's thinking change
// across eleven stages was us. That is backwards: the child is the one who
// needs to see it.
//
// Hamad gives the reading, because this is helping rather than questioning.
// Rouda supplies the one question at the end, because that is hers.

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { sanitizeUserInput, getClientIp, safeError } from "@/lib/sanitize";

export const runtime = "nodejs";

const SPEC = [
  "You are Hamad. You are a Qatari boy of about thirteen, and you have just watched a friend",
  "work through a whole investigation. You are going to tell them what you saw.",
  "",
  "YOU ARE WRITING TO THEM, NOT ABOUT THEM. Say 'you', never 'the learner' and never 'the student'.",
  "",
  "You will be given every question they were asked and everything they wrote, in order.",
  "The first answer and the later answer to the SAME question are marked. That pair is the",
  "most important thing in the whole record.",
  "",
  "GIVE FOUR THINGS. Each one is two short sentences at most.",
  "",
  "1. MOVED. Where their thinking actually changed. Quote their own words back so they",
  "   recognise the moment. If the two answers are nearly the same, SAY THAT PLAINLY and",
  "   kindly. Never invent a change that did not happen. A child who is told they grew when",
  "   they did not learns that this place does not really read them.",
  "",
  "2. STRONG. The single sharpest thing they noticed anywhere in the case. Quote it.",
  "   Point at what made it sharp, do not just call it good.",
  "",
  "3. MISSED. ONE thing in the evidence they did not pick up, said without any blame.",
  "   Not a list. Not everything. One. Say what was there and where it was.",
  "   If the question had no right answer, they cannot have missed anything on it: pick",
  "   something else, or say there was nothing they walked past.",
  "",
  "4. CARRY. One question for them to take into the next case. This one is Rouda's, so it",
  "   is a question and never advice. It must come out of what THEY wrote, not the topic.",
  "",
  "NEVER:",
  "- praise words: excellent, amazing, great job, well done, impressive",
  "- teacher words: demonstrates, articulates, shows understanding of",
  "- scoring, grading, levels, percentages, or any judgement of them as a person",
  "- inventing a quote they did not write",
  "- more than two short sentences in any of the four",
  "",
  "Speak the way a thirteen year old speaks. Reply in the language they wrote in.",
  "No markdown, no lists, no headings. Plain sentences.",
].join("\n");

/* The second mode reads across cases rather than inside one. Same character,
   different distance: what changed in HOW they think, between their first case
   and their most recent. Nothing else on the platform can see this, because
   every other reader is scoped to one case. */
const ACROSS = [
  "You are Hamad. You are a Qatari boy of about thirteen. A friend has now worked through more",
  "than one investigation, and you are going to tell them what changed in how they think.",
  "",
  "YOU ARE WRITING TO THEM. Say 'you'.",
  "",
  "You get, for each case: the problem they were looking at, what they said before they saw any",
  "evidence, and what they said after. Compare the EARLIEST case with the LATEST one.",
  "",
  "GIVE THREE THINGS, two short sentences each at most.",
  "",
  "1. THEN. What their thinking looked like in the first case. Quote them. Describe it plainly,",
  "   with no judgement in it at all: this is a photograph, not a mark.",
  "",
  "2. NOW. What it looks like in the latest one, quoted the same way. Say what is actually",
  "   different, in terms of what they DO: whether they name a constraint, whether they hold",
  "   two possibilities, whether they say what would prove them wrong.",
  "   IF NOTHING HAS CHANGED, SAY SO PLAINLY AND KINDLY. Do not manufacture growth.",
  "   A child told they improved when they did not learns that nobody here is really reading.",
  "",
  "3. NEXT. One specific thing to try in the next case. A move, not a feeling.",
  "   'Next time, write down what would have to be true' is a move.",
  "   'Keep up the good work' is nothing.",
  "",
  "NEVER: praise words, teacher words, scores, levels, or any judgement of them as a person.",
  "Never invent a quote. Speak the way a thirteen year old speaks.",
  "Reply in the language they wrote in. No markdown, no lists. Plain sentences.",
].join("\n");

/* The third mode weighs an idea rather than reading a case. This is the one
   the platform did not have at all: everything stopped at finding a problem,
   and nothing ever told a learner whether what they built on top of it stood
   up. Rouda takes this one, because weighing is questioning. */
const IDEA = [
  "You are Rouda. You are a Qatari girl of about thirteen who asks the questions nobody else asks.",
  "A learner between 10 and 14 has found a problem, had an idea, and weighed it. Now they need",
  "somebody honest to tell them where it stands.",
  "",
  "YOU ARE WRITING TO THEM. Say 'you'.",
  "",
  "You get: the problem they found, what people already do about it, their idea, what they said has",
  "to be true, their test, and six checks they answered yes, not sure or no, each with their reason.",
  "",
  "GIVE FOUR THINGS. Two short sentences each at most.",
  "",
  "1. HOLDS. The part of this that actually stands up, quoted from what they wrote.",
  "   If nothing stands up yet, say that instead. Do not invent a strength.",
  "",
  "2. WEAKEST. The single thing most likely to be wrong. Not the one they marked worst:",
  "   the one YOU think is worst, which is often one they were confident about.",
  "",
  "3. GUESSING. Where they answered yes without knowing. A yes backed by 'I think people would'",
  "   is a guess wearing a yes. Name one, gently, and say what would turn it into knowing.",
  "   If every yes is backed by something real, say so, because that is rare and worth saying.",
  "",
  "4. GO AND FIND OUT. One specific thing to go and do before touching the idea again.",
  "   Something they could do this week, with people they can actually reach.",
  "",
  "NEVER:",
  "- tell them the idea is good or bad overall. That is theirs to decide.",
  "- praise words, teacher words, scores, marks out of ten, or levels.",
  "- suggest a different idea. It is their idea. You are weighing it, not replacing it.",
  "- invent a quote they did not write.",
  "",
  "Speak the way a thirteen year old speaks. Reply in the language they wrote in.",
  "No markdown, no lists. Plain sentences.",
].join("\n");

type Turn = { q?: string; a?: string };
type Across = { title?: string; first?: string; after?: string };
type Body = {
  mode?: "case" | "across" | "idea";
  cases?: Across[];
  /** The workbench: every step they wrote, then the six checks. */
  steps?: Turn[];
  checks?: { q?: string; said?: string; why?: string }[];
  title?: string;
  gap?: string;
  turns?: Turn[];
  /** The same question asked before the evidence and after it. */
  first?: string;
  after?: string;
  lang?: "en" | "ar";
};

/* Without a key, or when anything fails, the page must still work. It simply
   shows their own words back and says the reading is not available, rather
   than pretending to have read them. */
const NONE = { ok: false as const };

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`${ip}:review`, LIMITS.chat.limit, LIMITS.chat.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetIn / 1000)) } }
    );
  }

  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }

  const lang = body.lang === "ar" ? "ar" : "en";
  const apiKeyEarly = process.env.ANTHROPIC_API_KEY;

  // ── weighing an idea ─────────────────────────────────────
  if (body.mode === "idea") {
    const steps = (body.steps ?? []).slice(0, 12).map(t => ({
      q: sanitizeUserInput(String(t.q ?? ""), 300).clean,
      a: sanitizeUserInput(String(t.a ?? ""), 700).clean,
    })).filter(t => t.q && t.a);
    const checks = (body.checks ?? []).slice(0, 8).map(c => ({
      q: sanitizeUserInput(String(c.q ?? ""), 200).clean,
      said: ["yes", "unsure", "no"].includes(String(c.said)) ? String(c.said) : "",
      why: sanitizeUserInput(String(c.why ?? ""), 500).clean,
    })).filter(c => c.q && c.said);

    // Nothing honest can be said about three sentences and no weighing.
    if (steps.length < 3 || checks.length < 3 || !apiKeyEarly) return NextResponse.json(NONE);

    const ideaUser = [
      "WHAT THEY WROTE, IN ORDER:",
      ...steps.map((t, i) => `${i + 1}. ${t.q}\n   ${t.a}`),
      "",
      "HOW THEY WEIGHED IT:",
      ...checks.map(c => `- ${c.q}  ->  ${c.said.toUpperCase()}${c.why ? `, because: ${c.why}` : ", and gave no reason"}`),
      "",
      `Write the four things. Reply in ${lang === "ar" ? "Arabic" : "English"}.`,
    ].join("\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKeyEarly,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-5",
          max_tokens: 900,
          output_config: {
            effort: "medium",
            format: {
              type: "json_schema",
              schema: {
                type: "object",
                properties: {
                  holds:    { type: "string" },
                  weakest:  { type: "string" },
                  guessing: { type: "string" },
                  find:     { type: "string" },
                },
                required: ["holds", "weakest", "guessing", "find"],
                additionalProperties: false,
              },
            },
          },
          system: IDEA,
          messages: [{ role: "user", content: ideaUser }],
        }),
      });
      if (!res.ok) return NextResponse.json(NONE);
      const data = await res.json();
      const text = (data?.content ?? []).find((b: { type: string }) => b.type === "text")?.text ?? "";
      const out = JSON.parse(text);
      const line = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");
      const holds = line(out?.holds), weakest = line(out?.weakest);
      const guessing = line(out?.guessing), find = line(out?.find);
      if (!holds && !weakest) return NextResponse.json(NONE);
      return NextResponse.json({ ok: true, holds, weakest, guessing, find });
    } catch (err) {
      console.error("review idea:", safeError(err, "weighing failed"));
      return NextResponse.json(NONE);
    }
  }

  // ── across cases ─────────────────────────────────────────
  if (body.mode === "across") {
    const runs = (body.cases ?? []).slice(0, 8).map(c => ({
      title: sanitizeUserInput(String(c.title ?? ""), 200).clean,
      first: sanitizeUserInput(String(c.first ?? ""), 700).clean,
      after: sanitizeUserInput(String(c.after ?? ""), 700).clean,
    })).filter(c => c.first || c.after);

    // One case is not a comparison.
    if (runs.length < 2 || !apiKeyEarly) return NextResponse.json(NONE);

    const acrossUser = [
      "THEIR CASES, EARLIEST FIRST:",
      ...runs.map((c, i) => [
        `CASE ${i + 1}: ${c.title || "untitled"}`,
        c.first ? `  Before the evidence: ${c.first}` : "",
        c.after ? `  After the evidence: ${c.after}` : "",
      ].filter(Boolean).join("\n")),
      "",
      `Write the three things. Reply in ${lang === "ar" ? "Arabic" : "English"}.`,
    ].join("\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKeyEarly,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-5",
          max_tokens: 800,
          output_config: {
            effort: "medium",
            format: {
              type: "json_schema",
              schema: {
                type: "object",
                properties: {
                  then: { type: "string" },
                  now:  { type: "string" },
                  next: { type: "string" },
                },
                required: ["then", "now", "next"],
                additionalProperties: false,
              },
            },
          },
          system: ACROSS,
          messages: [{ role: "user", content: acrossUser }],
        }),
      });
      if (!res.ok) return NextResponse.json(NONE);
      const data = await res.json();
      const text = (data?.content ?? []).find((b: { type: string }) => b.type === "text")?.text ?? "";
      const out = JSON.parse(text);
      const line = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");
      const then = line(out?.then), now = line(out?.now), next = line(out?.next);
      if (!then && !now) return NextResponse.json(NONE);
      return NextResponse.json({ ok: true, then, now, next });
    } catch (err) {
      console.error("review across:", safeError(err, "comparison failed"));
      return NextResponse.json(NONE);
    }
  }

  const turns = (body.turns ?? [])
    .slice(0, 30)
    .map(t => ({
      q: sanitizeUserInput(String(t.q ?? ""), 300).clean,
      a: sanitizeUserInput(String(t.a ?? ""), 700).clean,
    }))
    .filter(t => t.q && t.a);

  // Two or three sentences is not a case. Nothing honest can be said about it.
  if (turns.length < 3) return NextResponse.json(NONE);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json(NONE);

  const first = sanitizeUserInput(String(body.first ?? ""), 700).clean;
  const after = sanitizeUserInput(String(body.after ?? ""), 700).clean;
  const gap = sanitizeUserInput(String(body.gap ?? ""), 500).clean;
  const title = sanitizeUserInput(String(body.title ?? ""), 200).clean;

  const user = [
    title ? `THE CASE: ${title}` : "",
    gap ? `WHAT THE CASE SAYS IS STILL MISSING: ${gap}` : "",
    "",
    first ? `THEIR FIRST ANSWER, BEFORE ANY EVIDENCE: ${first}` : "",
    after ? `THEIR ANSWER TO THE SAME QUESTION, AFTER THE EVIDENCE: ${after}` : "",
    "",
    "EVERYTHING THEY WROTE, IN ORDER:",
    ...turns.map((t, i) => `${i + 1}. Asked: ${t.q}\n   Wrote: ${t.a}`),
    "",
    `Write the four things. Reply in ${lang === "ar" ? "Arabic" : "English"}.`,
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-5",
        max_tokens: 900,
        output_config: {
          effort: "medium",
          format: {
            type: "json_schema",
            schema: {
              type: "object",
              properties: {
                moved:  { type: "string" },
                strong: { type: "string" },
                missed: { type: "string" },
                carry:  { type: "string" },
              },
              required: ["moved", "strong", "missed", "carry"],
              additionalProperties: false,
            },
          },
        },
        system: SPEC,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) return NextResponse.json(NONE);

    const data = await res.json();
    const text = (data?.content ?? []).find((b: { type: string }) => b.type === "text")?.text ?? "";
    const out = JSON.parse(text);

    const line = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");
    const moved = line(out?.moved), strong = line(out?.strong);
    const missed = line(out?.missed), carry = line(out?.carry);
    if (!moved && !strong) return NextResponse.json(NONE);

    return NextResponse.json({ ok: true, moved, strong, missed, carry });
  } catch (err) {
    console.error("review:", safeError(err, "look back failed"));
    return NextResponse.json(NONE);
  }
}
