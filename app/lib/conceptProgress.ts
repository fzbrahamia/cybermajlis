// What a particular learner has actually finished: concepts, Why You lessons,
// and the Majlis concept gates. `state` in the data files is the shape of the
// map; this is where one person has walked on it.
//
// PER ACCOUNT. The first version kept everything under one global
// `mj-concepts` key, which meant localStorage — a property of the browser —
// was being used as if it were a property of the user. Signing in showed
// whatever anybody had clicked in that browser: a guest, a shared laptop, a
// previous session. The reported symptom was logging in and being told you had
// finished the Concepts lessons when you never had.
//
// So the key is namespaced by uid, and signed out is its own bucket. Guest work
// is NOT carried into an account on sign-in: an account's progress has to mean
// what that account did, which is the whole point of the bug above.
//
// Still localStorage rather than Firestore, so it is per device and there is no
// sign-in wall in front of a lesson. Moving it to Firestore is a separate job
// and needs the rules work.

import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const BASE = "mj-concepts";
const GUEST = `${BASE}:guest`;

export type Done = Record<string, { at: number }>;

const bucket = (uid: string | null) => (uid ? `${BASE}:${uid}` : GUEST);

/* The old un-namespaced key becomes the guest bucket, once. Anything already
   finished on this device stays reachable while signed out, and stops being
   silently credited to whoever signs in next. */
function migrateLegacy() {
  try {
    const legacy = localStorage.getItem(BASE);
    if (legacy === null) return;
    if (localStorage.getItem(GUEST) === null) localStorage.setItem(GUEST, legacy);
    localStorage.removeItem(BASE);
  } catch { /* private mode */ }
}

function read(uid: string | null): Done {
  try {
    migrateLegacy();
    return JSON.parse(localStorage.getItem(bucket(uid)) ?? "{}");
  } catch { return {}; }
}

/** Whoever is signed in right now. Null before Firebase restores the session,
    which is why components should subscribe rather than read once. */
export function readDone(): Done {
  if (typeof window === "undefined") return {};
  return read(auth.currentUser?.uid ?? null);
}

export function markDone(id: string): Done {
  const uid = auth.currentUser?.uid ?? null;
  const next = { ...read(uid), [id]: { at: Date.now() } };
  try { localStorage.setItem(bucket(uid), JSON.stringify(next)); } catch { /* private mode */ }
  return next;
}

/** Read now, and read again whenever the signed-in user changes.
 *
 * A one-shot `readDone()` in an effect runs before Firebase has restored the
 * session, so it reads the guest bucket and never corrects itself. Every screen
 * that shows progress uses this instead. Returns the unsubscribe. */
export function subscribeDone(cb: (done: Done) => void): () => void {
  if (typeof window === "undefined") return () => {};
  cb(readDone());
  return onAuthStateChanged(auth, user => cb(read(user?.uid ?? null)));
}

export const isDone = (done: Done, id: string) => Boolean(done[id]);
