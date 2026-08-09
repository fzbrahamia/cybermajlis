// Username uniqueness.
//
// We keep a `usernames` collection keyed by the *normalised* (lower-cased,
// trimmed) username. Reserving a name is a create of `usernames/{key}`, which —
// together with the Firestore rules (create only if the doc doesn't already
// exist) — guarantees two people can never hold the same name, even under a race.
// The user doc keeps the display-cased username; the reservation is the lock.

import { doc, getDoc, runTransaction, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const normalizeUsername = (u: string) => u.trim().toLowerCase();

/** Fast availability check for UI feedback. The transaction below is the authority. */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const key = normalizeUsername(username);
  if (key.length < 3) return false;
  const snap = await getDoc(doc(db, "usernames", key));
  return !snap.exists();
}

/**
 * Reserve `username` for `uid` and write the user doc in one atomic transaction.
 * Throws `Error("username-taken")` if the name is already held by someone else.
 */
export async function claimUsernameAndCreateUser(
  uid: string,
  username: string,
  userData: Record<string, unknown>,
): Promise<void> {
  const key = normalizeUsername(username);
  const unameRef = doc(db, "usernames", key);
  const userRef = doc(db, "user", uid);
  await runTransaction(db, async (tx) => {
    const existing = await tx.get(unameRef);
    if (existing.exists() && existing.data().uid !== uid) throw new Error("username-taken");
    tx.set(unameRef, { uid, username: username.trim(), createdAt: serverTimestamp() });
    tx.set(userRef, userData);
  });
}

/**
 * Change an existing user's username: claim the new reservation and release the
 * old one atomically. Throws `Error("username-taken")` if the new name is in use.
 */
export async function changeUsername(uid: string, oldUsername: string | undefined, newUsername: string): Promise<void> {
  const newKey = normalizeUsername(newUsername);
  const oldKey = oldUsername ? normalizeUsername(oldUsername) : "";

  // Only casing / whitespace changed — nothing to re-reserve.
  if (newKey === oldKey) {
    await updateDoc(doc(db, "user", uid), { username: newUsername.trim() });
    return;
  }

  const newRef = doc(db, "usernames", newKey);
  await runTransaction(db, async (tx) => {
    const existing = await tx.get(newRef);
    if (existing.exists() && existing.data().uid !== uid) throw new Error("username-taken");
    tx.set(newRef, { uid, username: newUsername.trim(), createdAt: serverTimestamp() });
    if (oldKey) tx.delete(doc(db, "usernames", oldKey));
    tx.update(doc(db, "user", uid), { username: newUsername.trim() });
  });
}
