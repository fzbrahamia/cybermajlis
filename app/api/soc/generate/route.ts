// app/api/soc/generate/route.ts
import { NextRequest, NextResponse } from "next/server";

const THREAT_CONTEXT: Record<string, string> = {
  phishing: "credential theft via email — fake login portals, harvested passwords, session hijacking",
  virus:    "malicious code execution — file infection, memory injection, AV evasion, lateral spread",
  ransomware: "file encryption for ransom — backup destruction, network share encryption, ransom demand",
  rootkit:  "stealth persistence — kernel-level hiding, process masking, boot sector modification",
  ddos:     "service disruption — volumetric flood, protocol exhaustion, application layer attack",
};

const PROMPT = (threat: string, attempts: number) => `You write realistic cybersecurity SOC simulation content for CyberMajlis, a Qatar cybersecurity education platform.

Generate a new attack variant for a ${threat} attack (${THREAT_CONTEXT[threat]}) on a Qatari organisation.
${attempts > 1 ? `This is the user's visit number ${attempts} — make it more technically sophisticated than a first run.` : ""}

The SOC team has 4 analysts responding in real time. Use Qatar corporate context (banks, government, telecom, energy companies).

Return ONLY valid JSON — no markdown:
{
  "radio": [
    "SIEM alert line 1 — initial detection (terse, technical, realistic)",
    "SIEM alert line 2 — escalation",
    "SIEM alert line 3 — attacker action",
    "SIEM alert line 4 — spread or impact",
    "SIEM alert line 5 — containment"
  ],
  "stepChat": [
    ["Saqr (Threat Detection) line for step 1", "Oryx (Risk) line for step 1"],
    ["Saqr or Tha'lab (Forensics) line for step 2", "Hisan (IR) line for step 2"],
    ["Tha'lab line for step 3", "Oryx line for step 3"],
    ["Hisan line for step 4", "Saqr line for step 4"],
    ["Any analyst — resolution line for step 5", "Any analyst — lesson learned line"]
  ],
  "quiz": {
    "q": "A question testing understanding of this specific attack type (max 20 words, plain English)",
    "opts": ["Wrong option", "Correct answer", "Wrong option", "Wrong option"],
    "ans": 1,
    "why": "One sentence explaining why the correct answer is right (plain English, no jargon)"
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const { threat, attempts = 1 } = await req.json();
    if (!THREAT_CONTEXT[threat]) return NextResponse.json({ error: "Unknown threat" }, { status: 400 });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        messages: [{ role: "user", content: PROMPT(threat, attempts) }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API ${res.status}`);
    const data = await res.json();
    const raw = (data.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
    const variant = JSON.parse(raw);

    return NextResponse.json({ success: true, variant });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
