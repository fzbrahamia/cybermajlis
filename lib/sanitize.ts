import { createHash } from "crypto";

// Prompt injection and input sanitization utilities

// Patterns that attempt to override system prompts or extract instructions
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/i,
  /forget\s+(everything|all|your|the\s+system)/i,
  /you\s+are\s+now\s+(a\s+)?(different|new|evil|dan|jailbreak)/i,
  /\[system\]/i,
  /\[assistant\]/i,
  /act\s+as\s+(if\s+)?(you\s+are\s+)?(not|no longer|unrestricted)/i,
  /reveal\s+(your\s+)?(system\s+prompt|instructions|prompt)/i,
  /print\s+(your\s+)?(system\s+prompt|instructions)/i,
  /disregard\s+(your\s+)?(guidelines|rules|instructions)/i,
  /<\|.*?\|>/,                          // <|im_start|> style tokens
  /###\s*(instruction|system|prompt)/i,
];

// Characters that could break JSON or template strings in prompts
const DANGEROUS_CHARS = /[`${}]/g;

export interface SanitizeResult {
  clean: string;
  flagged: boolean;
  reason?: string;
}

export function sanitizeUserInput(input: string, maxLength = 2000): SanitizeResult {
  const trimmed = input.trim().slice(0, maxLength);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        clean: "",
        flagged: true,
        reason: `Prompt injection attempt detected: ${pattern.source.slice(0, 40)}`,
      };
    }
  }

  // Remove chars that can break template interpolation but keep message readable
  const clean = trimmed.replace(DANGEROUS_CHARS, "");

  return { clean, flagged: false };
}

// In production, never send internal error details to the client.
// Log the real error server-side; return a generic message to the caller.
export function safeError(err: unknown, fallback: string): string {
  if (process.env.NODE_ENV !== "production") return String(err);
  console.error("[api-error]", err);
  return fallback;
}

// Extract IP from Next.js request (handles proxies)
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Hash an IP before persisting it, so a child's raw IP address is never stored.
// Salted/peppered so the short IPv4 space can't simply be brute-forced back.
// The hash is still stable per-IP, which is all abuse investigation needs.
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "cybermajlis-ip-pepper-v1";
  return createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 16);
}
