// Account deletion — "delete all traces".
//
// One authenticated endpoint that both the web app and the Flutter app call. The
// caller proves who they are with their own Firebase ID token; we then purge every
// document linked to that uid using the Admin SDK (which runs above the security
// rules), and finally delete the auth account itself. Because the server does the
// purge, the Firestore rules stay strict — clients never get broad delete rights.

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth, FieldValue } from "@/lib/firebase-admin";

// Top-level collections whose docs carry a `userID` field identifying the owner
// and are deleted outright. (communityWarnings are kept but anonymized — see below.)
const OWNED_COLLECTIONS = ["progress", "quizAttempt", "chatbotInteraction", "analyticsEvent"];

export async function POST(req: NextRequest) {
  // 1. Authenticate: caller must present their own valid, unexpired ID token.
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7).trim() : "";
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  try {
    // 2. Read the username so we can release its reservation.
    const userRef = adminDb.collection("user").doc(uid);
    const username = String((await userRef.get()).data()?.username ?? "").trim().toLowerCase();

    // 3. Delete every account-linked document (userID == uid) across collections.
    const bulk = adminDb.bulkWriter();
    let removed = 0;
    for (const coll of OWNED_COLLECTIONS) {
      const snap = await adminDb.collection(coll).where("userID", "==", uid).get();
      snap.forEach((d) => { bulk.delete(d.ref); removed++; });
    }

    // 3b. Community scam warnings are PUBLIC SAFETY content — keep them live, but
    //     strip the account link so they can no longer be traced back to the person.
    let anonymized = 0;
    const warnings = await adminDb.collection("communityWarnings").where("userID", "==", uid).get();
    warnings.forEach((d) => { bulk.update(d.ref, { userID: FieldValue.delete() }); anonymized++; });

    await bulk.close();

    // 4. Delete the user document and all of its subcollections.
    await adminDb.recursiveDelete(userRef);

    // 5. Release the username reservation so the name can be used again.
    if (username) await adminDb.collection("usernames").doc(username).delete();

    // 6. Delete the authentication account itself.
    try {
      await adminAuth.deleteUser(uid);
    } catch (e: unknown) {
      // If the auth user is already gone, that's fine — the data purge still succeeded.
      if ((e as { code?: string })?.code !== "auth/user-not-found") throw e;
    }

    return NextResponse.json({ ok: true, removed, anonymized });
  } catch (e) {
    console.error("account deletion failed for", uid, e);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
