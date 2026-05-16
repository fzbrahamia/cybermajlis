// app/api/games/generate/route.ts
import { NextRequest, NextResponse } from "next/server";

// ── Per-game prompts ──────────────────────────────────────────────────────────
const PROMPTS: Record<string, (attempts: number, weak: string) => string> = {

  inbox: (attempts, weak) => `You generate phishing email training content for CyberMajlis, a Qatar cybersecurity platform.

Generate 8 emails — a realistic mix for a Qatar professional's inbox. Include 4-5 phishing and 3-4 legitimate.
${attempts > 1 ? `Focus extra attention on these weak areas the user struggled with: ${weak || "phishing emails that look very legitimate"}.` : ""}
${attempts > 2 ? "Make phishing emails harder to spot — subtle domain typos, professional language, realistic sender names." : ""}

Use Qatar/Gulf context: QNB, QIIB, Ooredoo, KAHRAMAA, Metrash, Qatar Airways, QNET, local HR portals.

CRITICAL RULE: Vary answer lengths. The correct answer must NOT always be the longest. Wrong answers should sometimes be longer than correct ones.

Return ONLY a valid JSON array, no markdown:
[{
  "from": "sender@domain.com",
  "fromD": "Display Name",
  "subj": "Email subject",
  "body": "Full email body text. Be realistic — 3-5 sentences.",
  "url": "http://suspicious-domain.com/path or null if no link",
  "phish": true or false,
  "flags": ["Red flag or green flag explanation 1", "Flag 2", "Flag 3"]
}]`,

  dm: (attempts, weak) => `You generate suspicious DM training content for CyberMajlis, a Qatar cybersecurity platform.

Generate 10 direct messages — a mix of suspicious and legitimate messages someone in Qatar might receive.
Include 5-6 suspicious and 4-5 legitimate messages across different platforms (WhatsApp, Instagram, Snapchat, LinkedIn, SMS).
${attempts > 1 ? `These types were most missed before: ${weak || "messages that seem urgent but are scams"}. Include more of these.` : ""}
${attempts > 2 ? "Make suspicious messages more convincing — less obvious red flags, more professional language." : ""}

Use Qatar context: local banks, government services, familiar brands, Arabic names mixed with English.

CRITICAL RULE: Vary answer lengths. The correct answer must NOT always be the longest. Wrong answers should sometimes be longer than correct ones.

Return ONLY a valid JSON array, no markdown:
[{
  "from": "Sender Name or Number",
  "msg": "The message content. Be realistic.",
  "sus": true or false,
  "flags": ["Explanation flag 1", "Flag 2", "Flag 3"]
}]`,

  chatshield: (attempts, weak) => `You generate online chat safety scenarios for CyberMajlis, a Qatar cybersecurity platform.

Generate 6 realistic chat situations a Qatar resident might encounter online.
Each scenario has a chat message and 3 response options — only one is the safest response.
${attempts > 1 ? `Weak area from previous attempt: ${weak || "responding to strangers who seem friendly"}. Include more of these.` : ""}

Use Qatar/Gulf context. Platforms: WhatsApp, Instagram, gaming chats, work chats.

CRITICAL RULE: Vary answer lengths. The correct answer must NOT always be the longest. Wrong answers should sometimes be longer than correct ones.

Return ONLY a valid JSON array, no markdown:
[{
  "context": "Platform or situation context (e.g., WhatsApp group, Instagram DM)",
  "speaker": "Who is messaging (e.g., Unknown Number, @shop_qatar)",
  "msg": "The message they sent",
  "opts": [
    {"text": "Response option", "correct": false, "tip": "Why this is risky"},
    {"text": "Safe response option", "correct": true, "tip": "Why this is the right choice"},
    {"text": "Another option", "correct": false, "tip": "Why this is risky"}
  ]
}]`,

  hacklab: (attempts, weak) => `You generate ethical hacking scenarios for CyberMajlis, a Qatar cybersecurity platform.
The game teaches defense by making players think like attackers.

Generate 5 attack missions. Each has a target system and asks: "how would you exploit this weakness?"
The point is that understanding the attack teaches you to defend against it.
${attempts > 1 ? `Focus on: ${weak || "social engineering and phishing attacks"}.` : ""}
${attempts > 2 ? "Use more technically sophisticated scenarios appropriate for intermediate learners." : ""}

Use realistic Qatar organisational context (hospitals, banks, government portals, universities).

CRITICAL RULE: Vary answer lengths. The correct answer must NOT always be the longest. Wrong answers should sometimes be longer than correct ones.

Return ONLY a valid JSON array, no markdown:
[{
  "target": "System or organisation name",
  "icon": "One emoji representing the target",
  "defense": "The specific weakness being exploited",
  "opts": [
    {"text": "Attack method option", "correct": false, "lesson": "Why this wouldn't work or is less effective"},
    {"text": "Most effective attack method", "correct": true, "lesson": "Why this works AND how to defend against it"},
    {"text": "Another option", "correct": false, "lesson": "Why this is wrong"},
    {"text": "Another option", "correct": false, "lesson": "Why this is wrong"}
  ]
}]`,

  ransom: (attempts, weak) => `You generate ransomware incident response scenarios for CyberMajlis, a Qatar cybersecurity platform.

Generate 1 complete incident response scenario with 6 decision steps.
${attempts === 1 ? "Use a mid-sized Qatar company (e.g., a law firm, logistics company, or retail chain)." : ""}
${attempts === 2 ? "Use a hospital or healthcare provider in Qatar. Stakes are higher." : ""}
${attempts === 3 ? "Use a government ministry or critical infrastructure." : ""}
${attempts > 3 ? "Generate a novel scenario with unusual attack vector (supply chain, insider threat, etc.)." : ""}

Each step is a crisis decision with 3 options — one correct, two plausible but wrong.

CRITICAL RULE: Vary decision option lengths. Correct steps should NOT always be the most detailed. Wrong steps should sometimes be more verbose.

Return ONLY a valid JSON object, no markdown:
{
  "title": "Scenario name",
  "icon": "One relevant emoji",
  "banner": "One-sentence urgent situation description",
  "steps": [{
    "q": "What should you do right now?",
    "opts": [
      {"text": "Option A", "correct": false, "tip": "Why this is wrong"},
      {"text": "Correct action", "correct": true, "tip": "Why this is right"},
      {"text": "Option C", "correct": false, "tip": "Why this is wrong"}
    ]
  }]
}`,

  smarttrap: (attempts, weak) => `You generate IoT security scenarios for CyberMajlis, a Qatar cybersecurity platform.

Generate 5 smart home/office IoT security challenges set in rooms of a Qatar home or office.
Each room has one IoT device with a security problem to solve.
${attempts > 1 ? `Previously weak area: ${weak || "understanding why default passwords are dangerous"}.` : ""}

CRITICAL RULE: Vary answer lengths. The correct answer must NOT always be the longest. Wrong answers should sometimes be longer than correct ones.

Return ONLY a valid JSON array, no markdown:
[{
  "room": "Room name (e.g., Living Room, Office)",
  "device": "Device name",
  "icon": "One emoji for the device",
  "puzzle": "What is the security question or problem?",
  "opts": [
    {"text": "Option", "correct": false, "tip": "Why wrong"},
    {"text": "Correct security action", "correct": true, "tip": "Why this is right"},
    {"text": "Option", "correct": false, "tip": "Why wrong"}
  ]
}]`,
};

// ── Commentary prompt for simulations ────────────────────────────────────────
const COMMENTARY_PROMPTS: Record<string, string> = {
  worm: `You are Hamad, cybersecurity guide for CyberMajlis Qatar. Generate commentary for a network worm simulation.
The user is watching a worm spread across a simulated network.

Generate short observations tied to these events. Write like you're standing next to the user explaining what they're seeing.
Short sentences, no jargon (explain any tech word in brackets immediately after).
No markdown, no asterisks. Max 2 sentences each.

Return ONLY valid JSON:
{
  "start": "Comment when the simulation begins",
  "iot_infected": "Comment when an IoT device like a camera or smart fridge gets infected",
  "ftp_exploit": "Comment when a device is infected via FTP anonymous login",
  "default_pw": "Comment when a device falls to default password attack",
  "half_network": "Comment when half the network is infected",
  "all_done": "Comment shown at the end of the simulation"
}`,

  keylogger: `You are Hamad, cybersecurity guide for CyberMajlis Qatar. Generate commentary for a keylogger simulation.

The user is typing into what looks like a normal login form or text editor, while an attacker panel secretly captures every keystroke.
Generate short observations that appear at key moments.
Simple language, no jargon. Max 2 sentences each. No markdown.

Return ONLY valid JSON:
{
  "start": "Comment when the demo begins — what the user should pay attention to",
  "password_field": "Comment when user starts typing in the password field",
  "backspace_used": "Comment when the user presses backspace — noting this is captured too",
  "attacker_panel_open": "Comment when user opens the attacker view panel",
  "ten_keystrokes": "Comment after 10 keystrokes have been captured",
  "reveal": "Comment at the reveal screen"
}`,

  virus: `You are Hamad, cybersecurity guide for CyberMajlis Qatar. Generate commentary for a fork bomb virus simulation.

The user is watching CMD windows multiply until the system crashes.
Generate short observations at key moments. Simple language. Max 2 sentences each. No markdown.

Return ONLY valid JSON:
{
  "start": "Comment when user is looking at the desktop file",
  "first_windows": "Comment when first 3-5 CMD windows open",
  "cpu_high": "Comment when CPU usage passes 60%",
  "cascade": "Comment when windows are opening faster",
  "crashed": "Comment at the crash screen"
}`,
};

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { gameId, attempts = 1, weak = "", mode = "game" } = await req.json();

    const prompt = mode === "commentary"
      ? COMMENTARY_PROMPTS[gameId]
      : PROMPTS[gameId]?.(attempts, weak);

    if (!prompt) return NextResponse.json({ error: "Unknown game" }, { status: 400 });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API ${res.status}`);
    const data = await res.json();
    const raw = (data.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
    const content = JSON.parse(raw);

    return NextResponse.json({ success: true, content });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
