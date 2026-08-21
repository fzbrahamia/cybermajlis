// app/api/rouda/route.ts
//
// ROUDA, THE EVALUATOR
//
// The one thing the whole method rests on. Every stage asks a child to write
// something; without this, nothing reads it and the assessment is theatre.
//
// She has exactly three verdicts and one job: decide whether the child actually
// answered the question that was asked. She is not marking correctness, she is
// marking whether reasoning happened.

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { sanitizeUserInput, getClientIp, safeError } from "@/lib/sanitize";

export const runtime = "nodejs";

// ── THE SPEC ────────────────────────────────────────────────
//
// Written out in full because the failure mode here is not a bug, it is a
// model being agreeable. A judge that accepts everything is worse than no
// judge: it tells a child their thinking was checked when it was not.

// She has a second mode. Judging closes a question; talking keeps it open,
// which is what a learner needs when they want to be pushed further rather
// than marked. She still never answers: she asks the next thing.
const FOLLOW = [
  "You are Rouda. You are a Qatari girl of about thirteen who asks the questions nobody else asks.",
  "A learner between 10 and 14 has answered something and asked you to push them further.",
  "",
  "ASK ONE QUESTION. Not two. Not a question with a preamble explaining itself.",
  "",
  "THE QUESTION MUST:",
  "- come out of what they actually wrote, not out of the topic in general",
  "- go one step deeper, not sideways",
  "- be answerable by them, with what they already know",
  "",
  "NEVER:",
  "- give them the answer, or hint at it",
  "- ask something you already asked in this thread",
  "- praise them, or say excellent or good job",
  "- write more than two short sentences in total",
  "",
  "Speak the way a thirteen year old speaks. Reply in the language they wrote in.",
  "No markdown. Plain sentences.",
].join("\n");

const SPEC = [
  "You are Rouda. You are a Qatari girl of about thirteen, and you are the one who asks the hard questions.",
  "A learner between 10 and 14 has just answered a question. Decide whether they actually answered it.",
  "",
  "YOU ARE NOT MARKING WHETHER THEY ARE RIGHT. You are marking whether they thought.",
  "A wrong answer with real reasoning behind it is a good answer. A correct-sounding sentence that repeats the question back is not.",
  "",
  "PUSH BACK (verdict: off) only when one of these is true:",
  "1. The answer does not address the question that was asked.",
  "2. It restates the question, or restates the passage, without adding anything.",
  "3. It is empty, a single word with no content, or keyboard mash.",
  "4. It contradicts evidence the learner has already been shown, and shows no sign of having noticed.",
  "",
  "ACCEPT (verdict: answered) when any of these is true:",
  "- It answers the question, even if the answer is wrong.",
  "- It is short but it is a real answer.",
  "- They say they do not know, honestly. That is an answer. Accept it and say so warmly.",
  "- It is partly right. Accept the part that is right and ask about the rest in your one sentence.",
  "",
  "MARK THIN (verdict: thin) when it is a real attempt but very light. Accept it and move on.",
  "",
  "HARD RULES, in order of importance:",
  "- If the question has no right answer (it asks what they think, or what they would do), you may NEVER push back for being wrong. Only for not answering at all.",
  "- NEVER reveal the answer. Not even a hint at the answer. If you push back, ask again in different words or point at where they could look.",
  "- NEVER be discouraging, sarcastic, or disappointed. You are interested in them, not testing them.",
  "- Say ONE or TWO short sentences. Never more.",
  "- Speak the way a thirteen year old speaks. No teacher words. No praise words like excellent or well done.",
  "- Reply in the same language the learner wrote in. You speak Arabic and English.",
  "- No markdown, no formatting, no lists. Plain sentences.",
  "",
  "You push back at most ONCE on any question. If you are told this is the second attempt, you must accept whatever they wrote and say something kind that moves them on.",
].join("\n");

type Body = {
  /** "judge" closes the question. "talk" keeps it open and asks one more. */
  mode?: "judge" | "talk";
  thread?: { role: string; text: string }[];
  question?: string;
  answer?: string;
  /** Extra context: what the learner has already seen or written. */
  seen?: string;
  /** True when there is no right answer, so being wrong is impossible. */
  open?: boolean;
  /** True when they have already been pushed back once on this question. */
  second?: boolean;
  lang?: "en" | "ar";
};

const FALLBACK = {
  en: { verdict: "answered", say: "Got it. Keep going." },
  ar: { verdict: "answered", say: "وصلتني. واصل." },
} as const;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`${ip}:rouda`, LIMITS.chat.limit, LIMITS.chat.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetIn / 1000)) } }
    );
  }

  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }

  const lang = body.lang === "ar" ? "ar" : "en";
  const q = sanitizeUserInput(String(body.question ?? ""), 600);
  const a = sanitizeUserInput(String(body.answer ?? ""), 1200);
  const s = sanitizeUserInput(String(body.seen ?? ""), 1200);

  // A learner trying to talk the judge into passing them is still a learner.
  // Do not scold, do not judge, just decline to evaluate that turn.
  if (a.flagged) {
    return NextResponse.json({
      verdict: "thin",
      say: lang === "ar" ? "لنعد إلى السؤال نفسه. ما رأيك؟" : "Let us go back to the question. What do you think?",
    });
  }

  const question = q.clean;
  const answer = a.clean;
  const seen = s.clean;

  if (!question) return NextResponse.json({ error: "No question." }, { status: 400 });

  // Nothing typed at all does not need a model call. Talk mode carries a
  // thread instead of an answer, so this only guards the judging path.
  if (body.mode !== "talk" && answer.trim().length === 0) {
    return NextResponse.json({
      verdict: "off",
      say: lang === "ar" ? "لم تكتب شيئاً بعد. ما رأيك أنت؟" : "You have not written anything yet. What do you think?",
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  // Without a key the platform must still work. It simply stops judging.
  if (!apiKey) return NextResponse.json(FALLBACK[lang]);

  // ── talk: she asks one more, and the thread stays open ──
  if (body.mode === "talk") {
    const thread = (body.thread ?? []).slice(-8).map(t => ({
      role: t.role === "rouda" ? "assistant" as const : "user" as const,
      content: sanitizeUserInput(String(t.text ?? ""), 600).clean || "...",
    }));
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
          max_tokens: 300,
          output_config: { effort: "low" },
          system: `${FOLLOW}\n\nTHE QUESTION THEY WERE ORIGINALLY ASKED: ${question}`,
          messages: thread.length
            ? thread
            : [{ role: "user", content: answer || "..." }],
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const say = (data?.content ?? []).find((b: { type: string }) => b.type === "text")?.text?.trim();
      return NextResponse.json({
        verdict: "answered",
        say: say || (lang === "ar" ? "ولماذا تظن ذلك؟" : "And why do you think that?"),
      });
    } catch (err) {
      console.error("rouda talk:", safeError(err, "follow-up failed"));
      return NextResponse.json({
        verdict: "answered",
        say: lang === "ar" ? "ولماذا تظن ذلك؟" : "And why do you think that?",
      });
    }
  }

  const user = [
    `QUESTION ASKED: ${question}`,
    body.open ? "THIS QUESTION HAS NO RIGHT ANSWER." : "",
    seen ? `WHAT THEY HAVE ALREADY SEEN OR WRITTEN: ${seen}` : "",
    body.second ? "THIS IS THEIR SECOND ATTEMPT. You must accept it." : "",
    "",
    `THEIR ANSWER: ${answer}`,
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
        max_tokens: 400,
        // Low effort keeps her fast. A child waiting eight seconds for a reply
        // stops believing anyone is there.
        output_config: {
          effort: "low",
          format: {
            type: "json_schema",
            schema: {
              type: "object",
              properties: {
                verdict: { type: "string", enum: ["answered", "thin", "off"] },
                say: { type: "string" },
              },
              required: ["verdict", "say"],
              additionalProperties: false,
            },
          },
        },
        system: SPEC,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) return NextResponse.json(FALLBACK[lang]);

    const data = await res.json();
    const text = (data?.content ?? []).find((b: { type: string }) => b.type === "text")?.text ?? "";
    const out = JSON.parse(text);

    const verdict = ["answered", "thin", "off"].includes(out?.verdict) ? out.verdict : "answered";
    const say = typeof out?.say === "string" && out.say.trim() ? out.say.trim() : FALLBACK[lang].say;

    // Her own rule, enforced in code rather than trusted to the prompt.
    return NextResponse.json({
      verdict: body.second && verdict === "off" ? "thin" : verdict,
      say,
    });
  } catch (err) {
    console.error("rouda:", safeError(err, "evaluation failed"));
    return NextResponse.json(FALLBACK[lang]);
  }
}
