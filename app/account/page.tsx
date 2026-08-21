"use client";

/* The Majlis account.

   Not a re-skin of the CyberMajlis profile, which keeps its own page and its
   own look. One account opens all three majalis, so this one says that plainly
   and is written in the Majlis voice. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { LogOut, Trash2, Check, Loader2, Settings } from "lucide-react";
import { auth, db } from "@/app/lib/firebase";
import { changeUsername } from "@/app/lib/usernames";
import { resolveAvatar } from "@/app/lib/avatars";
import CharacterSelection from "@/components/CharacterSelection";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { RoomHead, Stagger, Rise, Says } from "@/components/innovation/Alive";
import { M, sans, HUES, R, card, flat, btn, ghost, quiet, label } from "@/components/innovation/theme";

const H = HUES.blue;
const BRANCH = [
  { en: "CyberMajlis", ar: "المجلس السيبراني", tone: "#A8323F" },
  { en: "QuantumMajlis", ar: "مجلس الكم", tone: "#2E9C6E" },
  { en: "MajlisAI", ar: "مجلس الذكاء", tone: "#3D6FB5" },
];

export default function AccountPage() {
  const isAR = useLocale() === "ar";
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState("");
  const [draftName, setDraftName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => onAuthStateChanged(auth, async u => {
    setUser(u);
    if (u) {
      const snap = await getDoc(doc(db, "user", u.uid));
      const d = snap.data();
      setUsername(d?.username ?? "");
      setDraftName(d?.username ?? "");
      setAvatar(resolveAvatar(d?.avatar));
    }
    setReady(true);
  }), []);

  const saveName = async () => {
    if (!user || !draftName.trim() || draftName === username) return;
    setBusy("name"); setNote("");
    try {
      await changeUsername(user.uid, username, draftName.trim());
      setUsername(draftName.trim());
      setNote(isAR ? "تم تغيير اسمك." : "Your name is changed.");
    } catch {
      setNote(isAR ? "هذا الاسم مأخوذ. جرّب غيره." : "That name is taken. Try another one.");
    } finally { setBusy(""); }
  };

  const saveAvatar = async (next: string) => {
    if (!user) return;
    setAvatar(next); setPicking(false); setBusy("avatar");
    try { await updateDoc(doc(db, "user", user.uid), { avatar: next }); } finally { setBusy(""); }
  };

  const remove = async () => {
    if (!user) return;
    setBusy("delete");
    try {
      const token = await user.getIdToken();
      await fetch("/api/account/delete", { method: "POST", headers: { authorization: `Bearer ${token}` } });
      await signOut(auth);
      router.push("/");
    } finally { setBusy(""); }
  };

  if (!ready) {
    return <InnovationPage><div style={{ fontSize: 15, color: M.body }}>...</div></InnovationPage>;
  }

  if (!user) {
    return (
      <InnovationPage>
        <RoomHead hue={H}
          title={isAR ? "لست داخلاً بعد" : "You are not signed in"}
          sub={isAR ? "ادخل لترى اسمك ووجهك وكل ما حفظته." : "Sign in to see your name, your face, and everything you saved."} />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <Link href="/enter?next=/account" style={btn(H)}>{isAR ? "تسجيل الدخول" : "Sign in"}</Link>
          <Link href="/enter?signup=true&next=/account" style={ghost(H)}>{isAR ? "أنشئ حساباً" : "Make an account"}</Link>
        </div>
      </InnovationPage>
    );
  }

  return (
    <InnovationPage>
      <RoomHead hue={H} eyebrow={isAR ? "حسابك" : "Your account"} title={username || (isAR ? "أهلاً" : "Hello")} />

      <Stagger gap={0.08}>
        <Rise>
          <div style={{ ...card, padding: "24px 26px", marginTop: 28, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
              {avatar && (
                <img src={avatar} alt="" width={92} height={92} style={{
                  width: 92, height: 92, borderRadius: "50%", objectFit: "cover",
                  border: `3px solid ${H.mid}`, background: M.page, flex: "none",
                }} />
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ ...label, marginBottom: 8 }}>{isAR ? "وجهك" : "Your face"}</div>
                <button onClick={() => setPicking(p => !p)} style={ghost(H)}>
                  {picking ? (isAR ? "إغلاق" : "Close") : (isAR ? "غيّره" : "Change it")}
                </button>
              </div>
            </div>
            {picking && (
              <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid rgba(42,35,28,.09)" }}>
                <CharacterSelection onSelect={saveAvatar} value={avatar} />
              </div>
            )}
          </div>
        </Rise>

        <Rise>
          <div style={{ ...card, padding: "24px 26px", marginBottom: 14 }}>
            <div style={{ ...label, marginBottom: 12 }}>{isAR ? "اسمك" : "Your name"}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input value={draftName} onChange={e => setDraftName(e.target.value)} style={{
                flex: 1, minWidth: 200, boxSizing: "border-box", padding: "13px 16px",
                borderRadius: 16, border: "2px solid rgba(42,35,28,.12)",
                background: M.page, color: M.heading, fontFamily: sans, fontSize: 15.5,
              }} />
              <button onClick={saveName}
                disabled={!draftName.trim() || draftName === username || busy === "name"}
                style={{ ...btn(H), opacity: (!draftName.trim() || draftName === username) ? 0.4 : 1 }}>
                {busy === "name" ? <Loader2 size={17} /> : <Check size={17} />}
                {isAR ? "احفظ" : "Save"}
              </button>
            </div>
            {note && <div style={{ marginTop: 12, fontSize: 13.5, color: M.body, fontFamily: sans }}>{note}</div>}
          </div>
        </Rise>

        <Rise>
          <div style={{ ...flat, padding: "20px 24px", marginBottom: 14 }}>
            <div style={{ ...label, marginBottom: 12 }}>{isAR ? "حساب واحد يفتح" : "One account opens"}</div>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {BRANCH.map(b => (
                <span key={b.en} style={{ ...quiet, color: b.tone, background: `${b.tone}14` }}>
                  {isAR ? b.ar : b.en}
                </span>
              ))}
            </div>
          </div>
        </Rise>

        <Rise>
          <div style={{ ...card, padding: "22px 24px" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/account/settings" style={ghost(H)}>
                <Settings size={17} />{isAR ? "الإعدادات" : "Settings"}
              </Link>
              <button onClick={async () => { await signOut(auth); router.push("/"); }} style={ghost(H)}>
                <LogOut size={17} />{isAR ? "خروج" : "Sign out"}
              </button>
              <button onClick={() => setConfirmDelete(true)} style={{
                ...ghost(H), color: "#7A1E22", border: "2px solid rgba(122,30,34,.3)",
              }}>
                <Trash2 size={17} />{isAR ? "احذف حسابي" : "Delete my account"}
              </button>
            </div>

            {confirmDelete && (
              <div style={{
                marginTop: 18, padding: "18px 20px", borderRadius: R.panel,
                background: "rgba(168,50,63,.06)", border: "1px solid rgba(122,30,34,.22)",
              }}>
                <p style={{ margin: "0 0 14px", fontSize: 14.5, lineHeight: 1.65, color: M.heading, fontFamily: sans }}>
                  {isAR
                    ? "سيُحذف كل شيء في المجالس الثلاثة: اسمك، ووجهك، وكل ما كتبته. لا رجعة."
                    : "Everything goes, in all three majalis: your name, your face, and everything you wrote. There is no undo."}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={remove} disabled={busy === "delete"} style={{
                    ...btn(H), background: "#7A1E22", boxShadow: "none",
                  }}>
                    {busy === "delete" ? <Loader2 size={17} /> : <Trash2 size={17} />}
                    {isAR ? "احذف كل شيء" : "Delete everything"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={ghost(H)}>
                    {isAR ? "تراجع" : "Keep it"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Rise>
      </Stagger>

      <div style={{ marginTop: 28 }}>
        <Says who="hamad" hue={H}>
          {isAR ? "اسمك ووجهك يتبعانك في كل مجلس تدخله." : "Your name and your face follow you into every majlis."}
        </Says>
      </div>
    </InnovationPage>
  );
}
