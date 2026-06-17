// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, LIMITS } from "@/lib/rateLimit";
import { sanitizeUserInput, getClientIp, hashIp } from "@/lib/sanitize";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const buildSystem = (reports: string, news: string) => [
  "You are Hamad, the friendly cybersecurity guide for CyberMajlis — Qatar's community security platform.",
  "You are a person named Hamad. You are NOT an animal and have nothing to do with animals.",
  "",
  "CRITICAL RULES — follow these exactly:",
  "- NEVER use markdown. No **bold**, no *italic*, no # headers. Plain text only.",
  "- NEVER start a reply with an animal name or any animal reference.",
  "- NEVER introduce yourself as an animal or mention animals in your opening.",
  "- Answers should be 3-5 sentences. Match the depth of the question — a simple question gets a concise answer, a detailed question gets a fuller response.",
  "- Simple language. If you use a tech word, explain it in plain brackets right after.",
  "- Reply in the same language the user writes in. You speak Arabic and English fluently.",
  "- When replying in Arabic, write full natural Arabic sentences — do not shorten responses just because the language is different.",
  "- Warm and direct, like a knowledgeable friend — not a formal assistant.",
  "",
  "WHAT YOU HELP WITH:",
  "- Is a link/number/website safe? Check community reports below and answer clearly.",
  "- What a security threat means in simple terms.",
  "- What to do after being hacked or scammed.",
  "- How to use CyberMajlis: SOC simulation, Training Tracks, Scenarios, Community Reports, Security Briefings.",
  "",
  "IF SOMEONE IS IN IMMEDIATE DANGER RIGHT NOW:",
  "Say: stay calm. Call your bank now. Change passwords from a different device. Go to www.cert.gov.qa.",
  "Do this before any explanation — speed matters.",
  "",
  "WHAT YOU WILL NOT DO:",
  "- Use markdown formatting of any kind.",
  "- Help with anything harmful or illegal.",
  "- Answer questions unrelated to cybersecurity or this platform.",
  "",
  "COMMUNITY REPORTS (recently verified):",
  reports || "No reports yet.",
  "",
  "LATEST SECURITY NEWS:",
  news || "No recent news.",
  "",
  "When the user's question matches a report or news item, reference it directly. End every reply with one clear next step.",
].join("\n");

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`${ip}:chat`, LIMITS.chat.limit, LIMITS.chat.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { reply: "You're sending messages too quickly. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetIn / 1000)) } }
    );
  }

  try {
    const { messages, context } = await req.json();

    // Sanitize the last user message for prompt injection
    const lastUserIdx = [...(messages as any[])].reverse().findIndex((m: any) => m.role === "user");
    if (lastUserIdx !== -1) {
      const idx = messages.length - 1 - lastUserIdx;
      const check = sanitizeUserInput(messages[idx].content as string, 2000);
      if (check.flagged) {
        adminDb.collection("chatLogs").add({
  ip: hashIp(ip),
  userMessage: messages[idx].content,
  flagged: true,
  flagReason: check.reason,
  source: "web",
  createdAt: FieldValue.serverTimestamp(),
});
        return NextResponse.json(
          { reply: "I can only help with cybersecurity questions. What would you like to know?" },
          { status: 200 }
        );
      }
      messages[idx] = { ...messages[idx], content: check.clean };
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: buildSystem(context?.reports || "", context?.news || ""),
        messages,
      }),
    });

    if (!res.ok) throw new Error(`Claude API ${res.status}`);
    const data = await res.json();
    let reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Try again?";

    // Strip any markdown that slipped through
    reply = reply
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .trim();

      adminDb.collection("chatLogs").add({
      ip: hashIp(ip),
      // lastUserIdx is an index into the REVERSED array — convert it back to the
      // real index, otherwise we log the wrong message (e.g. the AI greeting).
      userMessage: messages[messages.length - 1 - lastUserIdx]?.content ?? "",
      reply,
      flagged: false,
      source: "web",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "I'm having trouble connecting right now. Please try again in a moment." },
      { status: 200 }
    );
  }
}