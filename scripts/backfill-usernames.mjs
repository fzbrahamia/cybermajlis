// Backfill the `usernames` reservation collection from existing `user` docs, so
// names already in use can't be claimed by new signups. Pairs with app/lib/usernames.ts.
//
// Usage:
//   node scripts/backfill-usernames.mjs            # DRY RUN — reports only, writes nothing
//   node scripts/backfill-usernames.mjs --commit   # actually create the reservations
//
// Requires firebase-admin-key.json in the repo root (same as refresh-news.mjs).

import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const COMMIT = process.argv.includes("--commit");

const serviceAccount = require(join(ROOT, "firebase-admin-key.json"));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const norm = (u) => (u ?? "").trim().toLowerCase();
const millis = (d) => d?.createdAt?.toMillis?.() ?? (d?.createdAt?._seconds ?? 0) * 1000 ?? Infinity;

const snap = await db.collection("user").get();

// Group accounts by their normalized username.
const groups = new Map();
let noName = 0;
snap.forEach((doc) => {
  const d = doc.data();
  const key = norm(d.username);
  if (!key) { noName++; return; }
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ uid: doc.id, username: (d.username || "").trim(), createdAt: d.createdAt });
});

// Oldest account in each group keeps the name; the rest are conflicts to rename.
const conflicts = [];
const toReserve = [];
for (const [key, members] of groups) {
  members.sort((a, b) => millis(a) - millis(b));
  toReserve.push({ key, ...members[0] });
  if (members.length > 1) conflicts.push({ key, keep: members[0], rename: members.slice(1) });
}

console.log(`\nScanned ${snap.size} users (${noName} without a username).`);
console.log(`Distinct usernames: ${groups.size}`);
console.log(`Duplicate usernames: ${conflicts.length}\n`);

if (conflicts.length) {
  console.log("⚠️  DUPLICATES — the oldest account keeps the name; the others must be renamed:");
  for (const c of conflicts) {
    console.log(`  "${c.key}"  keep=${c.keep.uid}  rename=[${c.rename.map((m) => m.uid).join(", ")}]`);
  }
  console.log("");
}

let created = 0, skipped = 0;
for (const r of toReserve) {
  const ref = db.collection("usernames").doc(r.key);
  if ((await ref.get()).exists) { skipped++; continue; }
  if (COMMIT) await ref.set({ uid: r.uid, username: r.username, createdAt: FieldValue.serverTimestamp() });
  created++;
}

console.log(COMMIT
  ? `✅ Reserved ${created} usernames (${skipped} already reserved).`
  : `DRY RUN — would reserve ${created} usernames (${skipped} already reserved). Re-run with --commit to write.`);
console.log("Reservations use the lower-cased username as the document id.\n");
process.exit(0);
