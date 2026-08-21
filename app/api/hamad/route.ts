// app/api/hamad/route.ts
//
// HAMAD, IN MAJLIS
//
// Different from the CyberMajlis Hamad at /api/chat, who is a security guide.
// This one belongs to the whole platform: he answers about the mechanism a
// learner is looking at, in any domain, and he answers rather than questions.
//
// The split with Rouda is the rule the whole track runs on:
//   knowledge  -> Hamad answers
//   thinking   -> Rouda asks

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { sanitizeUserInput, getClientIp, safeError } from "@/lib/sanitize";

export const runtime = "nodejs";

const SPEC = [
  "You are Hamad. You are a Qatari boy of about thirteen who is good at explaining how things work.",
  "You are talking to a learner between 10 and 14 who is in the middle of a lesson and has a question.",
  "",
  "YOUR JOB IS TO ANSWER. Rouda is the one who asks questions. Do not turn a question back on them.",
  "If they ask what something means, tell them. If they ask why, explain why.",
  "",
  "HOW YOU ANSWER:",
  "- Two or three short sentences. Stop there.",
  "- Plain words. If you must use a technical word, say what it means in the same breath.",
  "- Concrete before abstract: a thing they can picture beats a definition.",
  "- If you do not know, say so. Never invent a fact, a number or a company.",
  "- If they ask something outside what is being taught, answer briefly and bring them back.",
  "- Reply in the same language they wrote in. You speak Arabic and English.",
  "- No markdown, no bullet points, no headings. Plain sentences.",
  "",
  "WHAT YOU KNOW ABOUT THIS PLACE:",
  "Majlis teaches young people to find problems worth solving. Learn holds the domains and their",
  "cases. Community is where problems get posted. News takes stories apart. Mine is where a learner",
  "keeps what they noticed. There are three majalis: CyberMajlis, QuantumMajlis, and MajlisAI.",
  "",
  "WHAT YOU DO NOT DO:",
  "- You do not tell them the answer to an assessment question. If they are clearly trying to get",
  "  you to answer something Rouda asked them, say that one is theirs to work out, warmly.",
  "- You do not help with anything harmful.",
].join("\n");

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`${ip}:hamad`, LIMITS.chat.limit, LIMITS.chat.windowMs);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many questions at once." }, { status: 429 });
  }

  let body: { question?: string; about?: string; lang?: "en" | "ar"; history?: { role: string; text: string }[] };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }

  const lang = body.lang === "ar" ? "ar" : "en";
  const q = sanitizeUserInput(String(body.question ?? ""), 600);
  const about = sanitizeUserInput(String(body.about ?? ""), 2000);

  if (!q.clean) {
    return NextResponse.json({
      say: lang === "ar" ? "اسألني أي شيء عن هذا." : "Ask me anything about this.",
    });
  }
  if (q.flagged) {
    return NextResponse.json({
      say: lang === "ar" ? "لنبقَ على الدرس. ما الذي لم يتضح؟" : "Let us stay on the lesson. What part is unclear?",
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      say: lang === "ar" ? "لا أستطيع الرد الآن. جرّب بعد قليل." : "I cannot answer right now. Try again shortly.",
    });
  }

  // Keep the thread, so a follow-up makes sense.
  const turns = (body.history ?? []).slice(-6).map(h => ({
    role: h.role === "hamad" ? "assistant" as const : "user" as const,
    content: sanitizeUserInput(String(h.text ?? ""), 600).clean || "...",
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
        max_tokens: 400,
        output_config: { effort: "low" },
        system: about.clean ? `${SPEC}\n\nWHAT THEY ARE LOOKING AT RIGHT NOW:\n${about.clean}` : SPEC,
        messages: [...turns, { role: "user", content: q.clean }],
      }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const say = (data?.content ?? []).find((b: { type: string }) => b.type === "text")?.text?.trim();
    return NextResponse.json({
      say: say || (lang === "ar" ? "لم أفهم. أعد صياغته؟" : "I did not follow that. Say it another way?"),
    });
  } catch (err) {
    console.error("hamad:", safeError(err, "chat failed"));
    return NextResponse.json({
      say: lang === "ar" ? "لا أستطيع الرد الآن." : "I cannot answer that right now.",
    });
  }
}
