// app/api/news/refresh/route.ts
//
// Headless news refresh. Unlike /api/news/fetch (which only RETURNS summaries
// and relies on the browser to persist them), this endpoint fetches fresh
// articles AND writes them to Firestore via the admin SDK. That makes it safe
// to call from a schedule (Vercel cron, a Claude /loop, etc.) with no browser.
//
// It dedupes against existing docs, reuses the same stable doc IDs the client
// uses (so the two paths never duplicate an article), and stamps createdAt
// server-side.
import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { safeError } from "@/lib/sanitize";
import { newsDocId } from "@/lib/newsId";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Claude summarisation can take a while

// Retention: keep critical Qatar-related stories longer; everything else is
// short-lived so the page never crowds up with old news.
const TTL_CRITICAL_QATAR = 48 * 60 * 60 * 1000; // 48h
const TTL_DEFAULT = 24 * 60 * 60 * 1000; // 24h

export async function GET(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url);

    // Optional shared-secret protection (set NEWS_REFRESH_SECRET in prod to lock it down).
    const secret = process.env.NEWS_REFRESH_SECRET;
    if (secret && searchParams.get("key") !== secret) {
      return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
    }

    // 1. Which articles do we already have? (dedupe by source_url)
    const snap = await adminDb.collection("securityNews").get();
    const existing = new Set<string>();
    snap.forEach((d) => {
      const u = d.data().source_url;
      if (u) existing.add(u);
    });

    // 2. Reuse the existing fetch+summarise pipeline (RSS + Claude).
    const res = await fetch(
      `${origin}/api/news/fetch?existing=${encodeURIComponent([...existing].join(","))}`,
      { signal: AbortSignal.timeout(55000) },
    );
    const data = await res.json();
    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "fetch failed" },
        { status: 502 },
      );
    }

    // 3. Persist the new ones with a server timestamp.
    let added = 0;
    for (const s of (data.summaries || []) as { source_url?: string }[]) {
      if (!s.source_url || existing.has(s.source_url)) continue;
      await adminDb
        .collection("securityNews")
        .doc(newsDocId(s.source_url))
        .set({ ...s, createdAt: FieldValue.serverTimestamp(), auto_generated: true }, { merge: true });
      existing.add(s.source_url);
      added++;
    }

    // 4. Prune old news so the page stays fresh.
    const now = Date.now();
    let deleted = 0;
    const after = await adminDb.collection("securityNews").get();
    for (const d of after.docs) {
      const x = d.data();
      const created = x.createdAt?.toDate?.()?.getTime?.();
      if (!created) continue; // skip docs whose server timestamp hasn't resolved
      const ttl = x.severity === "critical" && x.qatar_relevant === true ? TTL_CRITICAL_QATAR : TTL_DEFAULT;
      if (now - created > ttl) { await d.ref.delete(); deleted++; }
    }

    return NextResponse.json({
      success: true,
      added,
      deleted,
      returned: (data.summaries || []).length,
      totalInDb: after.size - deleted,
    });
  } catch (err) {
    console.error("[news/refresh]", err);
    return NextResponse.json(
      { success: false, error: safeError(err, "News refresh failed.") },
      { status: 500 },
    );
  }
}
