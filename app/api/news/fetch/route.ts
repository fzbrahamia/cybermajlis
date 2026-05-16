// app/api/news/fetch/route.ts
import { NextResponse } from "next/server";

const SOURCES = [
  { name: "The Hacker News",   url: "https://feeds.feedburner.com/TheHackersNews" },
  { name: "Bleeping Computer", url: "https://www.bleepingcomputer.com/feed/" },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
];

const NCSA_URL = "https://ncsa.gov.qa/en/media/cybersecurity-advisories";

const PROMPT = (title: string, content: string) => [
  "You write short security alerts for everyday people in Qatar. No tech background assumed.",
  "Reply ONLY with valid JSON — no markdown, nothing else:",
  JSON.stringify({
    headline: "Max 10 plain words. What happened.",
    what_happened: "2 short sentences. Simple words. Explain any tech term in brackets.",
    who_affected: "Regular Users | Businesses | Both | Government | Everyone",
    severity: "critical | high | medium | low",
    action_steps: ["One clear action", "Second if needed"],
    qatar_relevant: "true or false",
    qatar_note: "One sentence for Qatar residents if relevant, otherwise empty string"
  }, null, 2),
  "",
  "Severity: critical=act today, high=act this week, medium=good to know, low=no rush",
  "",
  `Title: ${title}`,
  `Content: ${content}`,
].join("\n");

function parseRSS(xml: string) {
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  return blocks.map(b => ({
    title: (b.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || b.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").trim(),
    link:  (b.match(/<link>(https?[^<\s]+)<\/link>/)?.[1] || b.match(/<guid[^>]*>(https?[^<]+)<\/guid>/)?.[1] || "").trim(),
    desc:  (b.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || b.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "")
             .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1000),
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
      max_tokens: 600,
      messages: [{ role: "user", content: PROMPT(title, content) }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json();
  const raw = (data.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(raw);
  // Ensure boolean types
  parsed.qatar_relevant = parsed.qatar_relevant === true || parsed.qatar_relevant === "true";
  return { ...parsed, source_name: sourceName };
}

async function scrapeNCSA(existingUrls: Set<string>) {
  const results: object[] = [];
  try {
    const res = await fetch(NCSA_URL, {
      headers: { "User-Agent": "CyberMajlis/1.0" },
      signal: AbortSignal.timeout(7000),
    });
    const html = await res.text();

    // Extract advisory links and titles from NCSA page
    const linkMatches = [...html.matchAll(/href="([^"]*advisory[^"]*)"[^>]*>([^<]{10,100})</gi)];
    const directMatches = [...html.matchAll(/href="([^"]*ncsa\.gov\.qa[^"]*)"[^>]*>\s*([^<]{15,120})\s*</gi)];
    const titleMatches = [...html.matchAll(/class="[^"]*title[^"]*"[^>]*>\s*([^<]{15,120})\s*</gi)];

    const advisories: {title: string; url: string}[] = [];

    for (const m of [...linkMatches, ...directMatches]) {
      const url = m[1].startsWith("http") ? m[1] : `https://ncsa.gov.qa${m[1]}`;
      const title = m[2].trim();
      if (title.length > 10 && !existingUrls.has(url)) {
        advisories.push({ title, url });
      }
    }

    // Also try to get titles from the page structure
    for (const m of titleMatches) {
      const title = m[1].trim();
      if (title.length > 10 && !advisories.find(a => a.title === title)) {
        advisories.push({ title, url: NCSA_URL });
      }
    }

    for (const { title, url } of advisories.slice(0, 3)) {
      if (existingUrls.has(url)) continue;
      try {
        const summary = await summarise(
          title,
          `Official NCSA Qatar cybersecurity advisory: "${title}". Qatar residents and businesses should review this official security notice from the National Cybersecurity Agency of Qatar and take any recommended protective actions.`,
          "NCSA Qatar"
        );
        results.push({ ...summary, source_url: url, qatar_relevant: true, qatar_note: "Official advisory from Qatar's National Cybersecurity Agency (NCSA)." });
        existingUrls.add(url);
        await new Promise(r => setTimeout(r, 400));
      } catch { /* skip failed items */ }
    }
  } catch { /* NCSA unavailable */ }
  return results;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const existingUrls = new Set((searchParams.get("existing") || "").split(",").filter(Boolean));

    const summaries: object[] = [];

    // NCSA Qatar first — highest local relevance
    const ncsaResults = await scrapeNCSA(existingUrls);
    summaries.push(...ncsaResults);

    // Global RSS sources — 2 articles each
    for (const source of SOURCES) {
      if (summaries.length >= 10) break; // cap total per run
      try {
        const rssRes = await fetch(source.url, {
          headers: { "User-Agent": "CyberMajlis/1.0" },
          signal: AbortSignal.timeout(7000),
        });
        if (!rssRes.ok) continue;
        const xml = await rssRes.text();
        const items = parseRSS(xml).filter(i => !existingUrls.has(i.link)).slice(0, 2);

        for (const item of items) {
          try {
            const summary = await summarise(item.title, item.desc, source.name);
            summaries.push({ ...summary, source_url: item.link });
            existingUrls.add(item.link);
            await new Promise(r => setTimeout(r, 400));
          } catch { /* skip */ }
        }
      } catch { /* skip source */ }
    }

    return NextResponse.json({ success: true, summaries, total: summaries.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;