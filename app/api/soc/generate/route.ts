// app/api/soc/generate/route.ts
import { NextRequest, NextResponse } from "next/server";

const THREAT_CONTEXT: Record<string, { en: string; ar: string }> = {
  phishing:   { en: "credential theft via email — fake login portals, harvested passwords, session hijacking",
                ar: "سرقة بيانات الدخول عبر البريد الإلكتروني — بوابات تسجيل دخول مزيفة، سرقة كلمات المرور" },
  virus:      { en: "malicious code execution — file infection, memory injection, AV evasion, lateral spread",
                ar: "تنفيذ كود خبيث — إصابة الملفات، حقن الذاكرة، التحايل على برامج الحماية" },
  ransomware: { en: "file encryption for ransom — backup destruction, network share encryption, ransom demand",
                ar: "تشفير الملفات مقابل فدية — تدمير النسخ الاحتياطية، تشفير مشاركات الشبكة، طلب الفدية" },
  rootkit:    { en: "stealth persistence — kernel-level hiding, process masking, boot sector modification",
                ar: "ثبات خفي — إخفاء على مستوى النواة، إخفاء العمليات، تعديل قطاع الإقلاع" },
  ddos:       { en: "service disruption — volumetric flood, protocol exhaustion, application layer attack",
                ar: "تعطيل الخدمة — فيضان حجمي، استنزاف البروتوكول، هجوم على طبقة التطبيق" },
};

function buildPrompt(threat: string, attempts: number, locale: string): string {
  const ctx = THREAT_CONTEXT[threat];
  const isAr = locale === "ar";

  if (isAr) {
    // Short Arabic prompt — prevents token overflow and JSON truncation
    const orgs = ["بنك قطر الوطني", "وزارة الداخلية", "أوريدو", "قطر للطاقة"];
    const org = orgs[attempts % orgs.length];
    return (
      "Generate SOC simulation JSON in Arabic for CyberMajlis Qatar.\n" +
      "Attack: " + threat + " on " + org + ".\n" +
      "CRITICAL: Every string value max 10 Arabic words. No newlines in strings. Return pure JSON only.\n\n" +
      '{"radio":["تنبيه قصير 1","تنبيه قصير 2","تنبيه قصير 3","تنبيه قصير 4","تنبيه قصير 5"],' +
      '"stepChat":[["صقر: جملة قصيرة","أوركس: جملة قصيرة"],["ثعلب: جملة","حصان: جملة"],["ثعلب: جملة","أوركس: جملة"],["حصان: جملة","صقر: جملة"],["محلل: خلاصة","محلل: درس"]],' +
      '"quiz":{"q":"سؤال قصير","opts":["خطأ","صحيح","خطأ","خطأ"],"ans":1,"why":"سبب موجز"}}\n\n' +
      "Fill each value with relevant Arabic content for the " + threat + " attack on " + org + "."
    );
  }

  return (
    "You write realistic cybersecurity SOC simulation content for CyberMajlis, a Qatar cybersecurity education platform.\n\n" +
    "Generate a new attack variant for a " + threat + " attack (" + ctx.en + ") on a Qatari organisation.\n" +
    (attempts > 1 ? "This is the user's visit number " + attempts + " — make it more technically sophisticated.\n" : "") +
    "SOC team: Saqr (Threat Detection), Oryx (Risk Assessment), Tha'lab (Forensics), Hisan (Incident Response).\n" +
    "Use Qatar corporate context: banks, government, telecom, energy companies.\n\n" +
    "Return ONLY valid JSON — no markdown:\n" +
    "{\n" +
    "  \"radio\": [\n" +
    "    \"SIEM alert 1 — initial detection (terse, technical, realistic)\",\n" +
    "    \"SIEM alert 2 — escalation\",\n" +
    "    \"SIEM alert 3 — attacker action\",\n" +
    "    \"SIEM alert 4 — spread or impact\",\n" +
    "    \"SIEM alert 5 — containment\"\n" +
    "  ],\n" +
    "  \"stepChat\": [\n" +
    "    [\"Saqr line for step 1\", \"Oryx line for step 1\"],\n" +
    "    [\"Tha'lab line for step 2\", \"Hisan line for step 2\"],\n" +
    "    [\"Tha'lab line for step 3\", \"Oryx line for step 3\"],\n" +
    "    [\"Hisan line for step 4\", \"Saqr line for step 4\"],\n" +
    "    [\"Any analyst — resolution for step 5\", \"Any analyst — lesson learned\"]\n" +
    "  ],\n" +
    "  \"quiz\": {\n" +
    "    \"q\": \"Plain English question about this attack type (max 20 words)\",\n" +
    "    \"opts\": [\"Wrong option\", \"Correct answer\", \"Wrong option\", \"Wrong option\"],\n" +
    "    \"ans\": 1,\n" +
    "    \"why\": \"One sentence explaining the correct answer (plain English, no jargon)\"\n" +
    "  }\n" +
    "}"
  );
}

export async function POST(req: NextRequest) {
  try {
    const { threat, attempts = 1, locale = "en" } = await req.json();
    if (!THREAT_CONTEXT[threat]) return NextResponse.json({ error: "Unknown threat" }, { status: 400 });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: buildPrompt(threat, attempts, locale) }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error("Claude API " + res.status + ": " + errBody.slice(0, 200));
    }
    const data = await res.json();
    const text = data.content?.[0]?.text || "";

    // Try multiple parse strategies — Claude's output format varies
    let variant: any = null;
    const parseAttempts = [
      // 1. Direct parse (Claude returned pure JSON)
      () => JSON.parse(text),
      // 2. Extract between first { and last }
      () => {
        const s = text.indexOf("{"), e = text.lastIndexOf("}");
        if (s === -1 || e === -1) throw new Error("no braces");
        return JSON.parse(text.slice(s, e + 1));
      },
      // 3. Strip markdown fences then extract
      () => {
        const cleaned = text.replace(/```json|```/g, "").trim();
        const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
        if (s === -1 || e === -1) throw new Error("no braces after strip");
        return JSON.parse(cleaned.slice(s, e + 1));
      },
      // 4. Replace literal newlines inside string values (Arabic content)
      () => {
        const s = text.indexOf("{"), e = text.lastIndexOf("}");
        if (s === -1 || e === -1) throw new Error("no braces");
        let inStr = false; let result = "";
        for (const ch of text.slice(s, e + 1)) {
          if (ch === '"') inStr = !inStr;
          result += (inStr && (ch === "\n" || ch === "\r")) ? " " : ch;
        }
        return JSON.parse(result);
      },
    ];

    const strategyErrors: string[] = [];
    for (let i = 0; i < parseAttempts.length; i++) {
      try { variant = parseAttempts[i](); if (variant) break; }
      catch (e) { strategyErrors.push("S" + (i+1) + ": " + String(e).slice(0, 60)); }
    }

    if (!variant) {
      console.error("[soc/generate] All strategies failed:", strategyErrors);
      throw new Error("Could not parse JSON. Strategies: " + strategyErrors.join(" | ") + " Raw: " + text.slice(0, 200));
    }

    return NextResponse.json({ success: true, variant, locale });
  } catch (err) {
    console.error("[soc/generate]", String(err));
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}