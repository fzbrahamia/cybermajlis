import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const SECURITY_HEADERS = [
  // Never render inside an iframe — prevents clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers guessing MIME types — prevents MIME-sniffing attacks
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send referrer on same-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features the site doesn't use
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Force HTTPS for 1 year once visited (preload-ready)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  // Isolate our browsing context from cross-origin windows (Spectre mitigation);
  // "-allow-popups" keeps the Firebase auth popup working.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // Don't leak DNS lookups by pre-fetching links
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // Block legacy Flash/PDF cross-domain policies
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  // Content Security Policy — tight rules, allow only what we actually use
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + inline (Next.js needs this) + Vercel analytics
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: self + inline (CSS-in-JS / styled-jsx)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs + Firebase Storage + blob
      "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://firebasestorage.googleapis.com",
      // Media (video/audio): self + Firebase Storage
      "media-src 'self' blob: https://firebasestorage.googleapis.com",
      // Connections: only self (our own /api routes) + Firebase. The 3rd-party APIs
      // (Anthropic/VirusTotal/ElevenLabs) are called server-side, so the browser never needs them.
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com",
      // No plugins, no object embeds
      "object-src 'none'",
      // Frames: allow Google (Firebase auth popup), deny everything else
      "frame-src 'self' https://*.firebaseapp.com https://*.firebase.com",
      // Base URI: only self (prevents base-tag injection)
      "base-uri 'self'",
      // Forms: only submit to self
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Build output directory. A production build normally overwrites the same
  // .next that `next dev` is serving from, which leaves an already-open browser
  // asking for chunk files that no longer exist ("Loading chunk ... failed").
  // Setting NEXT_DIST_DIR lets a verification build go somewhere else, so it
  // can run without disturbing a dev server:
  //   NEXT_DIST_DIR=.next-verify npm run build
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Pin the file-tracing root to this project so a stray lockfile in a parent
  // directory isn't inferred as the workspace root (which can corrupt the .next cache).
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // basic/advanced were difficulty tiers of one subject and are now a single
      // Malware track. Keep old links and bookmarks working.
      // the innovation track's rooms were renamed; old links still land
      { source: "/problems", destination: "/board", permanent: true },
      { source: "/investigate", destination: "/mine", permanent: true },
      { source: "/passport", destination: "/mine", permanent: true },
      { source: "/dashboard/basic", destination: "/dashboard/malware", permanent: true },
      { source: "/dashboard/advanced", destination: "/dashboard/malware", permanent: true },
      { source: "/dashboard/basic/:slug", destination: "/dashboard/malware/:slug", permanent: true },
      { source: "/dashboard/advanced/:slug", destination: "/dashboard/malware/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      // Security headers on every route
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
      // Long-cache for static assets
      {
        source: "/posters/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/lessons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
