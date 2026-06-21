#!/usr/bin/env node
// scripts/refresh-news.mjs
//
// Standalone local news refresh for CyberMajlis.
// Pulls security RSS, summarises each story bilingually via Claude, writes any
// NEW items straight to Firestore, then prunes old ones. Talks to
// Firestore/Claude/RSS directly, so it does NOT need the Next.js server running
// — perfect for a macOS launchd / cron schedule.
//
//   node scripts/refresh-news.mjs
//
// Requires: firebase-admin-key.json in the repo root, and ANTHROPIC_API_KEY in
// .env.local (or the environment).

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// --- Load ANTHROPIC_API_KEY from .env.local if not already in env ---
try {
  for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* no .env.local, rely on real env */ }

const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY) { console.error("Missing ANTHROPIC_API_KEY"); process.exit(1); }

// --- Firebase admin ---
const serviceAccount = require(join(ROOT, "firebase-admin-key.json"));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// --- Retention (keep critical Qatar stories longer; rest are short-lived) ---
const TTL_CRITICAL_QATAR = 48 * 60 * 60 * 1000; // 48h
const TTL_DEFAULT = 24 * 60 * 60 * 1000; // 24h
const PER_SOURCE = 3;
const MAX_PER_RUN = 9;

// --- Stable doc id (must match lib/newsId.ts exactly) ---
function newsDocId(url) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < url.length; i++) {
    const ch = url.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return "n" + hash.toString(36);
}

// --- Sources + prompt (kept in sync with app/api/news/fetch/route.ts) ---
const SOURCES = [
  { name: "The Hacker News",   url: "https://feeds.feedburner.com/TheHackersNews" },
  { name: "Bleeping Computer", url: "https://www.bleepingcomputer.com/feed/" },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
];
const TONES = [
  "urgent and direct, short sentences, act-now framing",
  "explanatory and calm, help the reader understand what happened and why",
  "practical, lead with what to do, keep background brief",
  "contextual, place this in a broader threat pattern, slightly more detail",
];
let toneIndex = 0;

function buildPrompt(title, content) {
  const tone = TONES[toneIndex++ % TONES.length];
  return (
    "You write bilingual security alerts for CyberMajlis, a Qatar cybersecurity platform.\n" +
    "\nTONE: " + tone +
    "\nVary sentence structure and length to match this tone.\n" +
    "Arabic: clear Modern Standard Arabic, simple vocabulary, Qatar-relevant brands.\n" +
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
    '  "qatar_relevant": false,\n' +
    '  "qatar_note": "",\n' +
    '  "qatar_note_ar": ""\n' +
    "}\n" +
    "Severity: critical=act today, high=act this week, medium=good to know, low=awareness\n" +
    "QATAR RELEVANCE: keep qatar_relevant false by default. Set it true ONLY when the story has a direct, concrete link to Qatar or the Gulf, for example software, apps or services widely used here (iOS/iPhone, Android, WhatsApp, Microsoft, Google, banking apps, Ooredoo, Vodafone Qatar) or a target/victim in Qatar or the GCC. Do NOT mark it relevant just because Qataris might travel or be abroad. When false, leave qatar_note and qatar_note_ar as empty strings.\n" +
    "\nTitle: " + title + "\nContent: " + content
  );
}

function parseRSS(xml) {
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  return blocks.map((b) => ({
    title: (b.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || b.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").trim(),
    link:  (b.match(/<link>(https?[^<\s]+)<\/link>/)?.[1] || b.match(/<guid[^>]*>(https?[^<]+)<\/guid>/)?.[1] || "").trim(),
    desc:  (b.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || b.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "")
             .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 800),
  })).filter((i) => i.title && i.link);
}

async function summarise(title, content, sourceName) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
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

async function main() {
  // What do we already have? (dedupe by source_url)
  const snap = await db.collection("securityNews").get();
  const existing = new Set();
  snap.forEach((d) => { const u = d.data().source_url; if (u) existing.add(u); });

  // Fetch + summarise new articles.
  const summaries = [];
  for (const source of SOURCES) {
    if (summaries.length >= MAX_PER_RUN) break;
    try {
      const rssRes = await fetch(source.url, { headers: { "User-Agent": "CyberMajlis/1.0" }, signal: AbortSignal.timeout(7000) });
      if (!rssRes.ok) continue;
      const items = parseRSS(await rssRes.text()).filter((i) => !existing.has(i.link)).slice(0, PER_SOURCE);
      for (const item of items) {
        try {
          summaries.push({ ...(await summarise(item.title, item.desc, source.name)), source_url: item.link });
          existing.add(item.link);
          await new Promise((r) => setTimeout(r, 300));
        } catch { /* skip article */ }
      }
    } catch { /* skip source */ }
  }

  // Persist new items (unique doc id per URL, so nothing overwrites).
  let added = 0;
  for (const s of summaries) {
    if (!s.source_url) continue;
    await db.collection("securityNews").doc(newsDocId(s.source_url))
      .set({ ...s, createdAt: FieldValue.serverTimestamp(), auto_generated: true }, { merge: true });
    added++;
  }

  // Prune old news so the page stays fresh.
  const now = Date.now();
  let deleted = 0;
  const after = await db.collection("securityNews").get();
  for (const d of after.docs) {
    const x = d.data();
    const created = x.createdAt?.toDate?.()?.getTime?.();
    if (!created) continue; // server timestamp not resolved yet
    const ttl = x.severity === "critical" && x.qatar_relevant === true ? TTL_CRITICAL_QATAR : TTL_DEFAULT;
    if (now - created > ttl) { await d.ref.delete(); deleted++; }
  }

  console.log(`[${new Date().toISOString()}] news refresh: added ${added}, deleted ${deleted}, total now ${after.size - deleted}`);
  process.exit(0);
}

main().catch((e) => { console.error(`[${new Date().toISOString()}] refresh failed:`, e); process.exit(1); });
