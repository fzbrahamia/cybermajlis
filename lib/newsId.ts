// lib/newsId.ts
// Stable, collision-resistant Firestore doc ID for a news article, derived from
// its FULL source URL (cyrb53 hash). The web app, the refresh API route, and the
// local refresh script must all produce the same ID for the same URL so an
// article maps to exactly one document. (The old scheme — base64(url).slice(0,28)
// — collided for same-domain URLs because 28 chars only covered the shared
// "https://www.site.com" prefix, so every source could keep just one article.)
export function newsDocId(url: string): string {
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
