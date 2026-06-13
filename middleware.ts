import { NextRequest, NextResponse } from "next/server";

// Origins allowed to call /api/* from a browser context.
// Flutter and server-to-server calls bypass CORS entirely (not browser-enforced).
const ALLOWED_ORIGINS = new Set([
  "https://cybermajlis.vercel.app",
  "https://www.cybermajlis.qa",
  "https://cybermajlis.qa",
  // Vercel preview deployments
  // pattern checked separately below
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // server-to-server — no Origin header
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Allow Vercel preview deployments: https://cybermajlis-*.vercel.app
  if (/^https:\/\/cybermajlis-[a-z0-9-]+-[a-z0-9]+\.vercel\.app$/.test(origin)) return true;
  // Allow localhost for dev
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only intercept API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const origin = req.headers.get("origin");
  const allowed = isAllowedOrigin(origin);

  // Preflight — respond immediately
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (allowed && origin) res.headers.set("Access-Control-Allow-Origin", origin);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  // Block disallowed cross-origin requests
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const res = NextResponse.next();
  if (origin) res.headers.set("Access-Control-Allow-Origin", origin);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
