// app/api/scan/route.ts
import { NextRequest, NextResponse } from "next/server";

const VT = "https://www.virustotal.com/api/v3";
const KEY = () => process.env.VT_API_KEY!;

// ── Helpers ───────────────────────────────────────────────────────────────────
function vtHeaders(extra: Record<string, string> = {}) {
  return { "x-apikey": KEY(), ...extra };
}

function parseEngines(results: Record<string, any>) {
  return Object.entries(results).map(([name, v]: [string, any]) => ({
    name,
    result:   v.result   ?? null,
    detected: v.category === "malicious",
  }));
}

function getSeverity(detected: number, total: number) {
  if (total === 0)      return "unknown";
  if (detected === 0)   return "clean";
  if (detected / total < 0.1) return "suspicious";
  return "malicious";
}

// Poll until analysis is complete (max attempts × interval ms)
async function pollAnalysis(id: string, maxAttempts = 10, interval = 6000) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, interval));
    const res = await fetch(`${VT}/analyses/${id}`, { headers: vtHeaders() });
    const data = await res.json();
    if (data.data?.attributes?.status === "completed") {
      return data.data.attributes.results as Record<string, any>;
    }
  }
  return null; // timed out
}

// ── URL scan ──────────────────────────────────────────────────────────────────
async function scanURL(url: string) {
  const submit = await fetch(`${VT}/urls`, {
    method: "POST",
    headers: vtHeaders({ "content-type": "application/x-www-form-urlencoded" }),
    body: `url=${encodeURIComponent(url)}`,
  });
  const submitData = await submit.json();
  const id = submitData.data?.id;
  if (!id) throw new Error("VirusTotal did not accept the URL. Check it is a valid http/https address.");

  const results = await pollAnalysis(id, 10, 4000);
  if (!results) throw new Error("The scan is taking longer than usual. Try again in a minute — VirusTotal may still be processing it.");

  const engines  = parseEngines(results);
  const detected = engines.filter(e => e.detected).length;
  return { engines, detected, total: engines.length, severity: getSeverity(detected, engines.length) };
}

// ── Hash lookup ───────────────────────────────────────────────────────────────
async function lookupHash(hash: string) {
  const res = await fetch(`${VT}/files/${hash}`, { headers: vtHeaders() });
  if (res.status === 404) throw new Error("This hash was not found in VirusTotal's database. The file may never have been scanned before — try uploading it directly.");
  if (!res.ok) throw new Error(`VirusTotal error: ${res.status}`);
  const data = await res.json();
  const raw = data.data?.attributes?.last_analysis_results || {};
  const engines  = parseEngines(raw);
  const detected = engines.filter(e => e.detected).length;
  return { engines, detected, total: engines.length, severity: getSeverity(detected, engines.length), permalink: data.data?.links?.self };
}

// ── File scan ─────────────────────────────────────────────────────────────────
async function scanFile(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file received.");
  if (file.size > 32 * 1024 * 1024) throw new Error("File too large. VirusTotal's free tier accepts files up to 32MB.");

  const vtForm = new FormData();
  vtForm.append("file", file, file.name);

  const submit = await fetch(`${VT}/files`, {
    method: "POST",
    headers: vtHeaders(),
    body: vtForm,
  });
  const submitData = await submit.json();
  const id = submitData.data?.id;
  if (!id) throw new Error("VirusTotal did not accept the file upload.");

  // Files take longer — poll up to 12 times × 8 seconds = ~96 seconds
  const results = await pollAnalysis(id, 12, 8000);
  if (!results) throw new Error("The scan is still running — VirusTotal needs more time for this file. Wait a minute then try the hash lookup with this file's SHA-256.");

  const engines  = parseEngines(results);
  const detected = engines.filter(e => e.detected).length;
  return { engines, detected, total: engines.length, severity: getSeverity(detected, engines.length) };
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!KEY()) {
    return NextResponse.json({ error: "VT_API_KEY not configured on the server." }, { status: 500 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let type: string, target: string, data: any;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      type   = form.get("type") as string || "file";
      target = (form.get("file") as File)?.name || "";
      data   = await scanFile(form);
    } else {
      const body = await req.json();
      type   = body.type;
      target = body.target;
      if (type === "url")  data = await scanURL(target);
      else if (type === "hash") data = await lookupHash(target);
      else throw new Error("Unknown scan type.");
    }

    return NextResponse.json({ success: true, type, target, ...data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Scan failed." }, { status: 200 });
    // 200 so the client always gets JSON (not a Next.js error page)
  }
}

export const maxDuration = 120; // Allow up to 2 minutes for file scans
export const dynamic = "force-dynamic";
