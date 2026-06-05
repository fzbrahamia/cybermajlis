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
    return (
      "أنت تكتب محتوى محاكاة مركز عمليات الأمن السيبراني لمنصة CyberMajlis القطرية.\n\n" +
      "اكتب متغيراً جديداً لهجوم " + threat + " (" + ctx.ar + ") على مؤسسة قطرية.\n" +
      (attempts > 1 ? "هذه زيارة رقم " + attempts + " للمستخدم — اجعل المحتوى أكثر تعقيداً تقنياً.\n" : "") +
      "فريق مركز العمليات: صقر (كشف التهديدات)، أوركس (تقييم المخاطر)، ثعلب (التحليل الجنائي)، حصان (الاستجابة للحوادث).\n" +
      "استخدم سياقاً قطرياً: بنوك، جهات حكومية، شركات اتصالات، شركات طاقة.\n\n" +
      "أعد فقط JSON صحيحاً — بدون markdown:\n" +
      "{\n" +
      "  \"radio\": [\n" +
      "    \"تنبيه SIEM 1 — الكشف الأولي (موجز، تقني، واقعي بالعربية)\",\n" +
      "    \"تنبيه SIEM 2 — تصعيد\",\n" +
      "    \"تنبيه SIEM 3 — إجراء المهاجم\",\n" +
      "    \"تنبيه SIEM 4 — الانتشار أو التأثير\",\n" +
      "    \"تنبيه SIEM 5 — الاحتواء\"\n" +
      "  ],\n" +
      "  \"stepChat\": [\n" +
      "    [\"صقر: سطر للخطوة 1\", \"أوركس: سطر للخطوة 1\"],\n" +
      "    [\"ثعلب: سطر للخطوة 2\", \"حصان: سطر للخطوة 2\"],\n" +
      "    [\"ثعلب: سطر للخطوة 3\", \"أوركس: سطر للخطوة 3\"],\n" +
      "    [\"حصان: سطر للخطوة 4\", \"صقر: سطر للخطوة 4\"],\n" +
      "    [\"أي محلل — سطر الحل للخطوة 5\", \"أي محلل — الدرس المستفاد\"]\n" +
      "  ],\n" +
      "  \"quiz\": {\n" +
      "    \"q\": \"سؤال باللغة العربية البسيطة عن هذا النوع من الهجوم (20 كلمة كحد أقصى)\",\n" +
      "    \"opts\": [\"خيار خاطئ\", \"الإجابة الصحيحة\", \"خيار خاطئ\", \"خيار خاطئ\"],\n" +
      "    \"ans\": 1,\n" +
      "    \"why\": \"جملة واحدة تشرح لماذا الإجابة الصحيحة صحيحة (بالعربية البسيطة)\"\n" +
      "  }\n" +
      "}"
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
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: buildPrompt(threat, attempts, locale) }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error("Claude API " + res.status + ": " + errBody.slice(0, 200));
    }
    const data = await res.json();
    const raw = (data.content?.[0]?.text || "")
      .replace(/```json[\s\S]*?```/g, (m: string) => m.slice(7, -3))
      .replace(/```/g, "")
      .trim();

    // Find the JSON object in the response (Claude sometimes adds preamble)
    const jsonStart = raw.indexOf("{");
    const jsonEnd   = raw.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON object in response. Raw: " + raw.slice(0, 300));
    }
    const variant = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    return NextResponse.json({ success: true, variant, locale });
  } catch (err) {
    console.error("[soc/generate]", String(err));
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}