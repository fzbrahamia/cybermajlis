// app/api/training/generate/route.ts
import { NextRequest, NextResponse } from "next/server";

const CHAR_PROMPTS: Record<string, (history: any) => string> = {
  saqr: (h) => `You generate SIEM alert triage training questions for a cybersecurity education platform.

Generate 8 realistic SIEM alerts for a SOC analyst to triage. Each alert should feel like a real log entry.

User's previous performance:
- Score: ${h.lastScore}/8
- Alerts they got wrong: ${h.wrongIds?.join(", ") || "none recorded"}
- Attempts: ${h.attempts}

Rules:
${h.attempts > 1 ? "- Make it harder than before — more realistic false positives, more ambiguous edge cases" : "- Similar difficulty to their first attempt but with fresh scenarios"}
- Include a mix: 3-4 TRUE POSITIVES, 2-3 FALSE POSITIVES, 1-2 NEEDS INVESTIGATION
- Use realistic Qatar/Gulf corporate context (company names, user names, systems)
- Each log snippet should look like real SIEM output

Return ONLY valid JSON array — no markdown:
[
  {
    "id": 1,
    "time": "HH:MM",
    "src": "source IP or hostname",
    "dst": "destination",
    "type": "Alert type name",
    "sev": "critical|high|medium|low|info",
    "log": "Realistic multi-line log entry",
    "correct": "tp|fp|inv",
    "why": "One sentence explanation of the correct answer"
  }
]`,

  oryx: (h) => `You generate risk assessment training scenarios for a cybersecurity education platform.

Generate 5 realistic organisational security risk scenarios for a risk assessor to evaluate.

User's previous performance:
- Score: ${h.lastScore}/5
- Attempts: ${h.attempts}
- Tendency: ${h.attempts > 1 ? "Generate scenarios where they must think carefully about likelihood vs impact — don't make it obvious" : "Standard difficulty"}

Each scenario should be a realistic situation a Qatari organisation might face.

Return ONLY valid JSON array — no markdown:
[
  {
    "id": 1,
    "title": "Scenario title",
    "detail": "2-3 sentence description with specific organisational context",
    "expertL": 1-5,
    "expertI": 1-5,
    "correctControl": "mitigate|monitor|accept|transfer",
    "controls": [
      {"id": "mitigate", "label": "Action description"},
      {"id": "monitor",  "label": "Action description"},
      {"id": "accept",   "label": "Action description"},
      {"id": "transfer", "label": "Action description"}
    ],
    "why": "One sentence explaining the correct risk rating and control"
  }
]`,

  hamad: (h) => `You generate social engineering awareness scenarios for a cybersecurity education platform targeting Qatar residents.

Generate 5 realistic social engineering scenarios Hamad (a finance employee in Qatar) might encounter.

User's previous performance:
- Score: ${h.lastScore}/5  
- Attempts: ${h.attempts}

${h.attempts > 1 ? "Make them harder — more convincing attacks, less obvious red flags. Use very realistic Qatari context." : "Use realistic Qatar-specific context: local banks, government services, familiar platforms."}

Each scenario must use a DIFFERENT attack vector from: WhatsApp, email, phone call, LinkedIn, in-person, SMS, QR code, USB.

Return ONLY valid JSON array — no markdown:
[
  {
    "id": 1,
    "type": "Email|WhatsApp|Situation|SMS|LinkedIn|Phone",
    "from": "Sender name/number",
    "subject": "Subject line or context",
    "body": "The message Hamad received, realistic and detailed",
    "question": "What should Hamad do?",
    "redFlags": ["Red flag 1", "Red flag 2", "Red flag 3"],
    "options": [
      {"id": "a", "text": "Option A", "correct": false, "why": "Why this is wrong"},
      {"id": "b", "text": "Option B", "correct": true,  "why": "Why this is right"},
      {"id": "c", "text": "Option C", "correct": false, "why": "Why this is wrong"}
    ]
  }
]`,
};

export async function POST(req: NextRequest) {
  try {
    const { characterId, history } = await req.json();

    const promptFn = CHAR_PROMPTS[characterId];
    if (!promptFn) {
      return NextResponse.json({ error: "Character not supported for adaptive mode" }, { status: 400 });
    }

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
        messages: [{ role: "user", content: promptFn(history) }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API ${res.status}`);
    const data = await res.json();
    const raw = (data.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
    const questions = JSON.parse(raw);

    return NextResponse.json({ success: true, questions });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
