// Simple in-memory rate limiter. Works per-serverless-instance.
// For multi-region production, replace with Redis / Upstash KV.

interface Window {
  count: number;
  reset: number; // unix ms
}

const store = new Map<string, Window>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetIn: number; // ms until window resets
}

/**
 * @param key      Unique key (e.g. IP + route)
 * @param limit    Max requests per window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let w = store.get(key);

  if (!w || now > w.reset) {
    w = { count: 0, reset: now + windowMs };
    store.set(key, w);
  }

  w.count++;
  const remaining = Math.max(0, limit - w.count);
  return {
    ok: w.count <= limit,
    remaining,
    resetIn: w.reset - now,
  };
}

// Limits per route (requests per window)
export const LIMITS = {
  chat:     { limit: 20,  windowMs: 60_000 },        // 20 messages/min
  soc:      { limit: 10,  windowMs: 60_000 },        // 10 SOC generations/min
  tts:      { limit: 15,  windowMs: 60_000 },        // 15 TTS calls/min
  scan:     { limit: 5,   windowMs: 60_000 },        // 5 scans/min (VT rate limit)
  default:  { limit: 60,  windowMs: 60_000 },        // 60 req/min catch-all
} as const;
