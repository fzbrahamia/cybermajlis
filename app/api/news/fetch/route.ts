// app/api/news/fetch/route.ts
import { NextResponse } from "next/server";
import { safeError } from "@/lib/sanitize";

const SOURCES = [
  { name: "The Hacker News",   url: "https://feeds.feedburner.com/TheHackersNews" },
  { name: "Bleeping Computer", url: "https://www.bleepingcomputer.com/feed/" },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
];

const TONES = [
  "urgent and direct — short sentences, act-now framing",
  "explanatory and calm — help the reader understand what happened and why",
  "practical — lead with what to do, keep background brief",
  "contextual — place this in a broader threat pattern, slightly more detail",
];
let toneIndex = 0;

function buildPrompt(title: string, content: string): string {
  const tone = TONES[toneIndex++ % TONES.length];
  return (
    "You write bilingual security alerts for CyberMajlis, a Qatar cybersecurity platform.\n" +
    "\nTONE: " + tone +
    "\nVary sentence structure and length to match this tone.\n" +
    "Arabic: clear Modern Standard Arabic, simple vocabulary, Qatar-relevant brands.\n" +
    "Use: التصيد الاحتيالي (phishing) · برامج خبيثة (malware) · برامج الفدية (ransomware) · اختراق البيانات (breach)\n" +
    "\nReturn ONLY valid JSON, no markdown:\n" +
    "{\n" +
    '  "headline": "Max 10 words English",\n' +
    '  "headline_ar": "العنوان بالعربية",\n' +
    '  "what_happened": "1-3 English sentences varying by tone",\n' +
    '  "what_happened_ar": "1-3 جمل بالعربية",\n' +
    '  "who_affected": "Regular Users | Businesses | Both | Government | Everyone",\n' +
    '  "severity": "critical | high | medium | low",\n' +
    '  "action_steps": ["Clear action"],\n' +
    '  "action_steps_ar": ["إجراء واضح بصيغة الأمر"],\n' +
    '  "qatar_relevant": true,\n' +
    '  "qatar_note": "One sentence for Qatar residents or empty string",\n' +
    '  "qatar_note_ar": "جملة لسكان قطر أو نص فارغ"\n' +
    "}\n" +
    "Severity: critical=act today · high=act this week · medium=good to know · low=awareness\n" +
    "\nTitle: " + title + "\nContent: " + content
  );
}

function parseRSS(xml: string) {
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  return blocks.map(b => ({
    title: (b.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || b.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").trim(),
    link:  (b.match(/<link>(https?[^<\s]+)<\/link>/)?.[1] || b.match(/<guid[^>]*>(https?[^<]+)<\/guid>/)?.[1] || "").trim(),
    desc:  (b.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || b.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "")
             .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 800),
  })).filter(i => i.title && i.link);
}

async function summarise(title: string, content: string, sourceName: string): Promise<object> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      messages: [{ role: "user", content: buildPrompt(title, content) }],
    }),
  });
  if (!res.ok) throw new Error("Claude " + res.status);
  const data = await res.json();
  const raw = (data.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(raw);
  parsed.qatar_relevant = parsed.qatar_relevant === true || parsed.qatar_relevant === "true";
  return { ...parsed, source_name: sourceName };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const existingUrls = new Set(
      (searchParams.get("existing") || "").split(",").filter(Boolean)
    );
    const summaries: object[] = [];

    for (const source of SOURCES) {
      if (summaries.length >= 8) break;
      try {
        const rssRes = await fetch(source.url, {
          headers: { "User-Agent": "CyberMajlis/1.0" },
          signal: AbortSignal.timeout(7000),
        });
        if (!rssRes.ok) continue;
        const xml = await rssRes.text();
        const items = parseRSS(xml)
          .filter(i => !existingUrls.has(i.link))
          .slice(0, 2);

        for (const item of items) {
          try {
            const summary = await summarise(item.title, item.desc, source.name);
            summaries.push({ ...summary, source_url: item.link });
            existingUrls.add(item.link);
            await new Promise(r => setTimeout(r, 300));
          } catch { /* skip article */ }
        }
      } catch { /* skip source */ }
    }

    return NextResponse.json({ success: true, summaries, total: summaries.length });
  } catch (err) {
    console.error("[news/fetch]", err);
    return NextResponse.json({ success: false, error: safeError(err, "News fetch failed. Please try again.") }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";