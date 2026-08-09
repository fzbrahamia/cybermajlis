"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/lib/firebase";
import {
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { EyeIcon, EyeOffIcon, Lock, Languages, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState("");
  const [language, setLanguage] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const t = useTranslations("Settings");

  const passwordChecks = {
    length: newPassword.length >= 8,
    number: /\d/.test(newPassword),
    upper: /[A-Z]/.test(newPassword),
    symbol: /[!@#$%^&*]/.test(newPassword),
  };
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  const [modal, setModal] = useState<{
    isOpen: boolean; title: string; message: string;
    onConfirm?: () => void; confirmText?: string;
  }>({ isOpen: false, title: "", message: "" });

  const showModal = (title: string, message: string, onConfirm?: () => void, confirmText?: string) =>
    setModal({ isOpen: true, title, message, onConfirm, confirmText });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      try {
        const userDoc = await getDoc(doc(db, "user", user.uid));
        if (userDoc.exists()) setLanguage(userDoc.data().language || "English");
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      :root {
        --maroon: #632024;
        --maroon-deep: #3e1316;
        --maroon-mid: #8B2635;
        --gold: #c5a57e;
        --gold-light: #E8D4BC;
        --cream: #E3DAC9;
        --sand: #FDF8F0;
        --paper: #FDFBF6;
        --heading: #4a1a1d;
        --body: #6a4640;
      }

      .settings-root {
        min-height: 100vh;
        /* matches the dashboard surface: paper plus a soft ambient wash */
        background-color: var(--paper);
        background-image:
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,32,36,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 100% 80%, rgba(197,165,126,0.15) 0%, transparent 60%);
        background-attachment: fixed;
        padding: 0 2rem 6rem;
      }

      .settings-content {
        position: relative;
        z-index: 1;
        max-width: 620px;
        margin: 0 auto;
      }

      /* ── Header ── */
      .settings-header {
        text-align: center;
        padding: calc(80px + 3.5rem) 0 2.5rem;
      }

      .settings-eyebrow {
        display: inline-block;
        font-family: 'Cinzel', serif;
        font-size: 0.65rem;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: var(--maroon-mid);
        background: linear-gradient(135deg, rgba(99,32,36,0.08), rgba(197,165,126,0.18));
        border: 1px solid rgba(99,32,36,0.2);
        padding: 0.4rem 1.4rem;
        border-radius: 999px;
        margin-bottom: 1rem;
      }

      .settings-header h1 {
        font-family: 'Cinzel', serif;
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 900;
        color: var(--maroon-deep);
        margin-bottom: 0.5rem;
        line-height: 1.1;
      }

      .settings-header h1 span { color: var(--maroon-mid); }

      .settings-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin: 0.8rem auto 1rem;
      }

      .settings-header p {
        font-family: 'Crimson Pro', serif;
        font-size: 1.05rem;
        font-style: italic;
        color: #5C4033;
        font-weight: 300;
      }

      /* ── Cards, cream gradient like lesson cards ── */
      .s-card {
        background: linear-gradient(160deg, #f7f0e4 0%, #ece0cc 100%);
        border: 1px solid rgba(99,32,36,0.14);
        border-radius: 22px;
        overflow: hidden;
        margin-bottom: 1.8rem;
        box-shadow: 0 6px 28px rgba(99,32,36,0.09);
      }

      .s-card-stripe {
        height: 3px;
        background: linear-gradient(90deg, var(--maroon), var(--gold));
      }

      .s-card-body {
        padding: 2rem 2.2rem 2.2rem;
      }

      /* Card header: icon + readable title */
      .s-card-head {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-bottom: 1.6rem;
      }

      .s-card-icon {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--maroon);
        background: linear-gradient(135deg, rgba(99,32,36,0.10), rgba(197,165,126,0.22));
        border: 1px solid rgba(99,32,36,0.16);
      }

      .s-card-icon-light {
        color: var(--gold-light);
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(227,218,201,0.22);
      }

      .s-card-title {
        font-family: 'Cinzel', serif;
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--maroon-deep);
        margin-bottom: 0;
        line-height: 1.2;
      }

      /* ── Danger card ── */
      .s-card-danger {
        background: linear-gradient(135deg, var(--maroon-deep) 0%, var(--maroon) 60%, #7a1e22 100%);
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 1.4rem;
        box-shadow: 0 12px 40px rgba(99,32,36,0.25);
        position: relative;
      }

      .s-card-danger::before {
        content: '';
        position: absolute;
        top: -50px; right: -50px;
        width: 160px; height: 160px;
        border-radius: 50%;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        pointer-events: none;
      }

      .s-card-danger-stripe {
        height: 3px;
        background: linear-gradient(90deg, var(--gold), rgba(197,165,126,0.2));
      }

      .s-card-danger-body {
        padding: 1.8rem 2rem 2rem;
        position: relative;
        z-index: 1;
      }

      .s-card-danger .s-card-title {
        color: var(--gold-light);
        opacity: 0.75;
      }

      .s-card-danger p {
        font-family: 'Crimson Pro', serif;
        font-size: 0.95rem;
        color: rgba(227,218,201,0.65);
        font-weight: 300;
        margin-bottom: 1.2rem;
        line-height: 1.65;
      }

      /* ── Inputs ── */
      .s-input-wrap {
        position: relative;
        margin-bottom: 1rem;
      }

      .s-input {
        width: 100%;
        padding: 0.85rem 2.8rem 0.85rem 1.1rem;
        border-radius: 12px;
        background: rgba(253,248,240,0.95);
        border: 1px solid rgba(99,32,36,0.2);
        color: var(--maroon-deep);
        font-family: 'Crimson Pro', serif;
        font-size: 1.05rem;
        outline: none;
        transition: border-color 0.2s;
        box-shadow: inset 0 1px 3px rgba(99,32,36,0.05);
      }

      .s-input::placeholder { color: rgba(99,32,36,0.4); }
      .s-input:focus { border-color: rgba(99,32,36,0.45); }

      .s-input-dark {
        background: rgba(253,248,240,0.08);
        border: 1px solid rgba(227,218,201,0.2);
        color: var(--cream);
      }
      .s-input-dark::placeholder { color: rgba(227,218,201,0.35); }
      .s-input-dark:focus { border-color: rgba(227,218,201,0.4); }

      .s-eye {
        position: absolute;
        inset-y: 0; right: 0.75rem;
        display: flex; align-items: center;
        background: none; border: none;
        color: rgba(99,32,36,0.4);
        cursor: pointer;
        transition: color 0.2s;
      }
      .s-eye:hover { color: var(--maroon); }
      .s-eye-light { color: rgba(227,218,201,0.4); }
      .s-eye-light:hover { color: var(--cream); }

      /* ── Password checks ── */
      .pw-checks {
        list-style: none;
        margin-bottom: 0.85rem;
        display: flex; flex-direction: column; gap: 4px;
      }

      .pw-check {
        font-family: 'Crimson Pro', serif;
        font-size: 1rem;
        display: flex; align-items: center; gap: 6px;
      }
      .pw-check.valid { color: #4d7a3c; text-decoration: line-through; opacity: 0.75; }
      .pw-check.invalid { color: #7a4a30; }

      /* ── Select ── */
      .s-select {
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        background: rgba(253,248,240,0.9);
        border: 1px solid rgba(99,32,36,0.2);
        color: var(--maroon-deep);
        font-family: 'Crimson Pro', serif;
        font-size: 1rem;
        outline: none;
        cursor: pointer;
        margin-bottom: 1rem;
        appearance: none;
      }

      /* ── Buttons ── */
      .btn-primary {
        width: 100%;
        padding: 0.85rem;
        font-family: 'Cinzel', serif;
        font-size: 0.68rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        border: none; border-radius: 12px;
        cursor: pointer;
        background: linear-gradient(135deg, var(--maroon-deep), var(--maroon));
        color: var(--gold-light);
        box-shadow: 0 4px 16px rgba(99,32,36,0.22);
        transition: opacity 0.2s, transform 0.15s;
        margin-top: 0.3rem;
      }
      .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

      .btn-danger {
        width: 100%;
        padding: 0.85rem;
        font-family: 'Cinzel', serif;
        font-size: 0.68rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        border: none; border-radius: 12px;
        cursor: pointer;
        background: #dc2626;
        color: white;
        box-shadow: 0 4px 16px rgba(220,38,38,0.3);
        transition: opacity 0.2s, transform 0.15s;
        margin-top: 0.3rem;
      }
      .btn-danger:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      .btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }

      .btn-back {
        width: 100%;
        padding: 0.85rem;
        font-family: 'Cinzel', serif;
        font-size: 0.68rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        border: none; border-radius: 12px;
        cursor: pointer;
        background: linear-gradient(135deg, var(--maroon-deep), var(--maroon));
        color: var(--gold-light);
        box-shadow: 0 8px 24px rgba(99,32,36,0.2);
        transition: opacity 0.2s, transform 0.2s;
      }
      .btn-back:hover { opacity: 0.88; transform: translateY(-2px); }

      .pw-mismatch {
        font-family: 'Crimson Pro', serif;
        font-size: 0.88rem;
        color: var(--maroon-mid);
        margin: -0.4rem 0 0.6rem;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) { showModal(t("modals.missing_fields_title"), t("modals.missing_fields_msg")); return; }
    if (!isPasswordStrong) { showModal(t("modals.weak_password_title"), t("modals.weak_password_msg")); return; }
    if (newPassword !== confirmNewPassword) { showModal(t("modals.pw_mismatch_title"), t("modals.pw_mismatch_msg")); return; }
    setSaving(true);
    try {
      const user = auth.currentUser!;
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
      showModal(t("modals.pw_changed_title"), t("modals.pw_changed_msg"));
    } catch (error: any) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        showModal(t("modals.wrong_password_title"), t("modals.wrong_password_msg"));
      } else { showModal(t("modals.error_title"), t("modals.pw_error_msg")); }
    } finally { setSaving(false); }
  };

  const handleSaveLanguage = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "user", uid), { language });
      showModal(t("modals.language_saved_title"), t("modals.language_saved_msg", { language }));
    } catch { showModal(t("modals.error_title"), t("modals.language_error_msg")); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) return;
    showModal(t("modals.delete_title"), t("modals.delete_confirm_msg"),
      async () => {
        closeModal();
        try {
          const user = auth.currentUser!;
          const credential = EmailAuthProvider.credential(user.email!, deletePassword);
          // Re-authenticate to confirm identity and get a fresh ID token.
          await reauthenticateWithCredential(user, credential);
          const token = await user.getIdToken();
          // The server purges every trace (profile, progress, quizzes, chat logs,
          // community posts, analytics, username) and deletes the auth account.
          const res = await fetch("/api/account/delete", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("delete-failed");
          await signOut(auth).catch(() => {});
          router.push("/");
        } catch (error: any) {
          if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            showModal(t("modals.wrong_password_title"), t("modals.delete_wrong_password_msg"));
          } else { showModal(t("modals.error_title"), t("modals.delete_error_msg")); }
        }
      }, t("modals.delete_btn")
    );
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FDFBF6", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', serif", color: "#632024", letterSpacing: "0.2em", opacity: 0.6 }}>
      {t("loading")}
    </div>
  );

  return (
    <div className="settings-root">
      <div className="settings-content">

        {/* Header */}
        <header className="settings-header">
          <div className="settings-eyebrow">{t("eyebrow")}</div>
          <h1>{t("title")} <span>{t("title_highlight")}</span></h1>
          <div className="settings-divider">
            <div style={{ height: 1.5, width: 48, background: "linear-gradient(90deg, transparent, #632024)", borderRadius: 2 }} />
            <div style={{ width: 5, height: 5, background: "#c5a57e", transform: "rotate(45deg)" }} />
            <div style={{ height: 1.5, width: 48, background: "linear-gradient(90deg, #632024, transparent)", borderRadius: 2 }} />
          </div>
          <p>{t("subtitle")}</p>
        </header>

        {/* Change Password */}
        <div className="s-card">
          <div className="s-card-stripe" />
          <div className="s-card-body">
            <div className="s-card-head">
              <span className="s-card-icon"><Lock size={20} strokeWidth={1.6} /></span>
              <div className="s-card-title">{t("password_title")}</div>
            </div>

            <div className="s-input-wrap">
              <input type={showCurrentPassword ? "text" : "password"} placeholder={t("current_password")}
                value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="s-input" />
              <button type="button" className="s-eye" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>

            <div className="s-input-wrap">
              <input type={showNewPassword ? "text" : "password"} placeholder={t("new_password")}
                value={newPassword} onChange={e => setNewPassword(e.target.value)} className="s-input" />
              <button type="button" className="s-eye" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>

            {newPassword && (
              <ul className="pw-checks">
                {Object.entries(passwordChecks).map(([rule, valid]) => (
                  <li key={rule} className={`pw-check ${valid ? "valid" : "invalid"}`}>
                    {valid ? "✓" : "○"} { t(`pw_checks.${rule}`) }
                  </li>
                ))}
              </ul>
            )}

            <div className="s-input-wrap">
              <input type={showConfirmNewPassword ? "text" : "password"} placeholder={t("confirm_password")}
                value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="s-input" />
              <button type="button" className="s-eye" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                {showConfirmNewPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>

            {confirmNewPassword && newPassword !== confirmNewPassword && (
              <p className="pw-mismatch">{t("pw_mismatch")}</p>
            )}

            <button onClick={handleChangePassword} className="btn-primary"
              disabled={saving || !isPasswordStrong || newPassword !== confirmNewPassword || !currentPassword}>
              {saving ? t("saving") : t("update_password")}
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="s-card">
          <div className="s-card-stripe" />
          <div className="s-card-body">
            <div className="s-card-head">
              <span className="s-card-icon"><Languages size={20} strokeWidth={1.6} /></span>
              <div className="s-card-title">{t("language_title")}</div>
            </div>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="s-select">
              <option>English</option>
              <option>عربي</option>
            </select>
            <button onClick={handleSaveLanguage} disabled={saving} className="btn-primary">
              {saving ? t("saving") : t("save_language")}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="s-card-danger">
          <div className="s-card-danger-stripe" />
          <div className="s-card-danger-body">
            <div className="s-card-head">
              <span className="s-card-icon s-card-icon-light"><Trash2 size={20} strokeWidth={1.6} /></span>
              <div className="s-card-title">{t("danger_title")}</div>
            </div>
            <p>{t("danger_description")}</p>
            <div className="s-input-wrap">
              <input type={showDeletePassword ? "text" : "password"} placeholder={t("delete_password_placeholder")}
                value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className="s-input s-input-dark" />
              <button type="button" className="s-eye s-eye-light" onClick={() => setShowDeletePassword(!showDeletePassword)}>
                {showDeletePassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            <button onClick={handleDeleteAccount} disabled={!deletePassword} className="btn-danger">
              {t("delete_account")}
            </button>
          </div>
        </div>

        {/* Back */}
        <button onClick={() => router.back()} className="btn-back">{t("back")}</button>

      </div>

      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message}
        onClose={closeModal} onConfirm={modal.onConfirm} confirmText={modal.confirmText} />
    </div>
  );
}