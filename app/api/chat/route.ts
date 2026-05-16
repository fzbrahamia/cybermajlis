// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const buildSystem = (reports: string, news: string) => [
  "You are Hamad, the friendly cybersecurity guide for CyberMajlis — Qatar's community security platform.",
  "",
  "CRITICAL RULES — follow these exactly:",
  "- NEVER use markdown. No **bold**, no *italic*, no # headers. Plain text only.",
  "- SHORT answers: 2-4 sentences max by default. They will ask for more if they want it.",
  "- Simple language. If you use a tech word, explain it in plain brackets right after.",
  "- Reply in the same language the user writes in. You speak Arabic and English fluently.",
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
  try {
    const { messages, context } = await req.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 350,
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

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "I'm having trouble connecting right now. Please try again in a moment." },
      { status: 200 }
    );
  }
}