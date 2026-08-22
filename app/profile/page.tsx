"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { changeUsername } from "@/app/lib/usernames";
import { lessonsData } from "@/app/lib/lessonsData";
import CharacterSelection from "@/components/CharacterSelection";
import { Trophy, UserRound, Sparkles } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { resolveAvatar } from "@/app/lib/avatars";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [uid, setUid] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [newAvatar, setNewAvatar] = useState("");
  const [completedLessons, setCompletedLessons] = useState(0);
  const [saving, setSaving] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const t = useTranslations("Profile");
  const locale = useLocale();

  const totalLessons = lessonsData.malware.filter(l => l.slug).length;

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);

      unsubscribeSnapshot = onSnapshot(doc(db, "user", user.uid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setNewUsername(prev => prev || data.username || "");
          setNewAvatar(prev => prev || resolveAvatar(data.avatar));
        }
        setLoading(false);
      });

      try {
        let count = 0;
        for (const lesson of lessonsData.malware.filter(l => l.slug)) {
          const progressDoc = await getDoc(doc(db, "user", user.uid, "progress", lesson.slug));
          if (progressDoc.exists() && progressDoc.data().quizDone) count++;
        }
        setCompletedLessons(count);
      } catch (error) {
        console.error(error);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot?.();
    };
  }, []);

  useEffect(() => { setAvatarBroken(false); }, [userData?.avatar]);

  const handleSaveUsername = async () => {
    if (!newUsername || newUsername.length < 3) return;
    setSaving(true);
    try {
      await changeUsername(uid, userData?.username, newUsername);
      setUserData((prev: any) => ({ ...prev, username: newUsername.trim() }));
      setEditingUsername(false);
      setUsernameError("");
    } catch (e: any) {
      setUsernameError(e?.message === "username-taken" ? t("username_taken") : t("username_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!newAvatar) return;
    setSaving(true);
    await updateDoc(doc(db, "user", uid), { avatar: newAvatar });
    setUserData((prev: any) => ({ ...prev, avatar: newAvatar }));
    setEditingAvatar(false);
    setSaving(false);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

      :root {
        --maroon: #632024;
        --maroon-deep: #3e1316;
        --maroon-mid: #8B2635;
        --gold: #c5a57e;
        --gold-light: #E8D4BC; 
        --cream: #E3DAC9;
        --cream-dark: #d4c5b0;
        --sand: #FDF8F0;
        --paper: #FDFBF6;
        --heading: #4a1a1d;
        --body: #6a4640;
      }

      .profile-root *, .profile-root *::before, .profile-root *::after { 
        box-sizing: border-box; 
      }

      body {
        font-family: var(--ui);
        background-color: var(--paper);
        color: var(--body);
        overflow-x: hidden;
      }

      .profile-root {
        min-height: 100vh;
        position: relative;
        padding: 0 2rem 6rem;
        overflow: hidden;
      }

      /* ── Background ── */
      .bg-pattern {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background:
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,32,36,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 100% 80%, rgba(197,165,126,0.15) 0%, transparent 60%);
      }

      .orb {
        position: fixed;
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
        filter: blur(80px);
        opacity: 0.12;
        animation: orb-drift 18s ease-in-out infinite alternate;
      }
      .orb-1 { width: 420px; height: 420px; background: var(--maroon); top: -120px; left: -100px; animation-delay: 0s; }
      .orb-2 { width: 280px; height: 280px; background: var(--gold); top: 40%; right: -80px; animation-delay: -6s; }
      .orb-3 { width: 200px; height: 200px; background: var(--maroon-mid); bottom: 10%; left: 30%; animation-delay: -12s; }

      @keyframes orb-drift {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(30px, 40px) scale(1.08); }
      }

      /* ── Content ── */
      .profile-content {
        position: relative;
        z-index: 1;
        max-width: 680px;
        margin: 0 auto;
      }

      /* ── Header ── */
      .profile-header {
        text-align: center;
        padding: calc(80px + 3.5rem) 0 2.5rem;
      }

      .header-eyebrow {
        display: inline-block;
        font-family: var(--ui);
        font-size: 0.7rem;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: var(--maroon-mid);
        background: linear-gradient(135deg, rgba(99,32,36,0.08), rgba(197,165,126,0.18));
        border: 1px solid rgba(99,32,36,0.2);
        padding: 0.45rem 1.4rem;
        border-radius: 999px;
        margin-bottom: 1rem;
      }

      .profile-header h1 {
        font-family: var(--ui);
        font-size: clamp(2rem, 4vw, 3.2rem);
        font-weight: 900;
        line-height: 1.1;
        color: var(--maroon-deep);
        letter-spacing: -0.01em;
        margin-bottom: 1.2rem;
      }

      .profile-header h1 span { color: var(--maroon-mid); }

      .profile-header p {
        font-size: 1.1rem;
        color: #5C4033;
        font-style: italic;
        font-weight: 300;
      }

      /* ── Avatar Card ── */
      .avatar-card {
        background: linear-gradient(135deg, var(--maroon-deep) 0%, var(--maroon) 60%, #7a1e22 100%);
        border-radius: 24px;
        padding: 2.8rem 2.5rem;
        margin-bottom: 1.5rem;
        position: relative;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(99,32,36,0.3), 0 2px 0 rgba(255,255,255,0.08) inset;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.6rem;
      }

      .avatar-card::before {
        content: '';
        position: absolute;
        top: -60px; right: -60px;
        width: 200px; height: 200px;
        border-radius: 50%;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
      }
      .avatar-card::after {
        content: '';
        position: absolute;
        bottom: -40px; left: -40px;
        width: 140px; height: 140px;
        border-radius: 50%;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
      }

      .avatar-ring {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid var(--gold);
        box-shadow: 0 0 0 6px rgba(197,165,126,0.15);
        position: relative;
        z-index: 1;
        margin-bottom: 0.6rem;
      }

      .avatar-ring img,
      .avatar-ring-placeholder {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-ring-placeholder {
        background: var(--gold);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--ui);
        font-size: 2.4rem;
        font-weight: 700;
        color: var(--maroon);
      }

      .avatar-name {
        font-family: var(--ui);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gold-light);
        position: relative;
        z-index: 1;
      }

      .avatar-email {
        font-size: 0.9rem;
        color: rgba(227,218,201,0.65);
        position: relative;
        z-index: 1;
      }

      .avatar-joined {
        font-size: 0.78rem;
        color: rgba(227,218,201,0.4);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        position: relative;
        z-index: 1;
      }

      /* ── Section Cards ── */
      .section-card {
        background: rgba(253,248,240,0.72);
        border: 1px solid rgba(99,32,36,0.12);
        border-radius: 22px;
        padding: 2.2rem 2.4rem;
        margin-bottom: 1.5rem;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(4px);
      }

      .section-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--maroon-mid), var(--gold), transparent);
        opacity: 0.5;
      }

      /* Section header: icon + readable title */
      .section-head {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-bottom: 1.6rem;
      }

      .section-icon {
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

      .section-title {
        font-family: var(--ui);
        font-size: 0.92rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--maroon-deep);
        opacity: 0.95;
        margin-bottom: 0;
      }

      /* Stat tiles */
      .stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.6rem;
      }

      .stat-tile {
        background: linear-gradient(160deg, #ffffff 0%, #f6eee1 100%);
        border: 1px solid rgba(99,32,36,0.12);
        border-radius: 16px;
        padding: 1.2rem 1.3rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }

      .stat-tile-value {
        font-family: var(--ui);
        font-size: 1.9rem;
        font-weight: 700;
        color: var(--maroon-mid);
        line-height: 1;
      }

      .stat-tile-label {
        font-size: 0.9rem;
        color: #5C4033;
        letter-spacing: 0.02em;
      }

      /* Progress bar */
      .progress-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.92rem;
        color: #5C4033;
        margin-bottom: 0.55rem;
        letter-spacing: 0.02em;
      }

      .progress-track {
        width: 100%;
        height: 6px;
        background: rgba(99,32,36,0.1);
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 0.4rem;
      }

      .progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--maroon-mid), var(--gold));
        transition: width 1s ease;
        box-shadow: 0 0 8px rgba(99,32,36,0.3);
      }

      .progress-pct {
        text-align: right;
        font-size: 0.88rem;
        color: #5C4033;
        opacity: 0.75;
      }

      /* Edit rows */
      .edit-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .edit-value {
        font-size: 1.2rem;
        color: var(--maroon-deep);
        font-weight: 400;
      }

      .edit-input {
        flex: 1;
        padding: 0.6rem 1rem;
        border-radius: 10px;
        background: rgba(99,32,36,0.06);
        border: 1px solid rgba(99,32,36,0.2);
        color: var(--maroon-deep);
        font-family: var(--ui);
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
      }

      .edit-input:focus {
        border-color: rgba(99,32,36,0.4);
      }

      .edit-actions {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }

      /* Buttons */
      .btn-primary {
        font-family: var(--ui);
        font-size: 0.65rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        padding: 0.6rem 1.3rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        background: linear-gradient(135deg, var(--maroon-deep), var(--maroon));
        color: var(--gold-light);
        transition: opacity 0.2s, transform 0.15s;
        box-shadow: 0 4px 12px rgba(99,32,36,0.25);
      }

      .btn-primary:hover:not(:disabled) {
        opacity: 0.88;
        transform: translateY(-1px);
      }

      .btn-primary:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .btn-secondary {
        font-family: var(--ui);
        font-size: 0.65rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        padding: 0.6rem 1.3rem;
        border-radius: 999px;
        border: 1px solid rgba(99,32,36,0.25);
        cursor: pointer;
        background: transparent;
        color: var(--maroon);
        transition: background 0.2s, transform 0.15s;
      }

      .btn-secondary:hover {
        background: rgba(99,32,36,0.06);
        transform: translateY(-1px);
      }

      /* Avatar preview in edit row */
      .avatar-preview {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid rgba(99,32,36,0.2);
      }

      .avatar-preview img {
        width: 100%; height: 100%; object-fit: cover;
      }

      /* Back button */
      .btn-back {
        display: block;
        width: 100%;
        padding: 1rem;
        font-family: var(--ui);
        font-size: 0.72rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        text-align: center;
        border: none;
        border-radius: 16px;
        cursor: pointer;
        background: linear-gradient(135deg, var(--maroon-deep), var(--maroon));
        color: var(--gold-light);
        box-shadow: 0 8px 24px rgba(99,32,36,0.22);
        transition: opacity 0.2s, transform 0.2s;
        margin-top: 0.4rem;
      }

      .btn-back:hover {
        opacity: 0.88;
        transform: translateY(-2px);
      }

      /* Loading */
      .loading-screen {
        min-height: 100vh;
        background: var(--paper);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--ui);
        font-size: 1rem;
        letter-spacing: 0.2em;
        color: var(--maroon);
        opacity: 0.6;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  if (loading) return <div className="loading-screen">{t("loading")}</div>;

  const joinedDate = userData?.createdAt?.toDate?.()
    ? new Date(userData.createdAt.toDate()).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="profile-root">
      {/* Background */}
      <div className="bg-pattern" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="profile-content">

        {/* ── Header ── */}
        <header className="profile-header">
          <div className="header-eyebrow">{t("eyebrow")}</div>
          <h1>{t("title")} <span>{t("title_highlight")}</span></h1>
          <p>{t("subtitle")}</p>
        </header>

        {/* ── Avatar Card ── */}
        <div className="avatar-card">
          <div className="avatar-ring">
            {userData?.avatar && !avatarBroken ? (
              <img
                src={userData.avatar}
                alt="avatar"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <div className="avatar-ring-placeholder">
                {userData?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="avatar-name">{userData?.username}</div>
          <div className="avatar-email">{userData?.email}</div>
          <div className="avatar-joined">{t("joined", { date: joinedDate })}</div>
        </div>

        {/* ── XP + Progress ── */}
        <div className="section-card">
          <div className="section-head">
            <span className="section-icon"><Trophy size={20} strokeWidth={1.6} /></span>
            <div className="section-title">{t("progress_title")}</div>
          </div>

          <div className="stat-grid">
            <div className="stat-tile">
              <span className="stat-tile-value">{userData?.xp ?? 0}</span>
              <span className="stat-tile-label">{t("xp_label")}</span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile-value">{completedLessons}/{totalLessons}</span>
              <span className="stat-tile-label">{t("progress_label")}</span>
            </div>
          </div>

          <div className="progress-meta">
            <span>{t("progress_label")}</span>
            <span>{t("progress_completed", { done: completedLessons, total: totalLessons })}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-pct">{progressPercent}%</div>
        </div>

        {/* ── Username ── */}
        <div className="section-card">
          <div className="section-head">
            <span className="section-icon"><UserRound size={20} strokeWidth={1.6} /></span>
            <div className="section-title">{t("username_title")}</div>
          </div>
          {editingUsername ? (
            <>
            <div className="edit-row">
              <input
                value={newUsername}
                onChange={(e) => { setNewUsername(e.target.value); setUsernameError(""); }}
                className="edit-input"
                minLength={3}
              />
              <div className="edit-actions">
                <button
                  onClick={handleSaveUsername}
                  disabled={saving || newUsername.length < 3}
                  className="btn-primary"
                >
                  {saving ? t("saving") : t("save")}
                </button>
                <button
                  onClick={() => { setEditingUsername(false); setNewUsername(userData?.username); setUsernameError(""); }}
                  className="btn-secondary"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
            {usernameError && <p style={{ color: "#b4434e", fontSize: "0.82rem", marginTop: "0.5rem" }}>{usernameError}</p>}
            </>
          ) : (
            <div className="edit-row">
              <span className="edit-value">{userData?.username}</span>
              <button onClick={() => setEditingUsername(true)} className="btn-primary">{t("edit")}</button>
            </div>
          )}
        </div>

        {/* ── Character / Avatar ── */}
        <div className="section-card">
          <div className="section-head">
            <span className="section-icon"><Sparkles size={20} strokeWidth={1.6} /></span>
            <div className="section-title">{t("character_title")}</div>
          </div>
          {editingAvatar ? (
            <div>
              <CharacterSelection onSelect={setNewAvatar} value={newAvatar} />
              <div className="edit-actions" style={{ marginTop: "1.2rem", justifyContent: "flex-end" }}>
                <button
                  onClick={handleSaveAvatar}
                  disabled={saving || !newAvatar}
                  className="btn-primary"
                >
                  {saving ? t("saving") : t("save")}
                </button>
                <button
                  onClick={() => { setEditingAvatar(false); setNewAvatar(userData?.avatar); }}
                  className="btn-secondary"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div className="edit-row">
              <div className="avatar-preview">
                {userData?.avatar && !avatarBroken && (
                  <img
                    src={userData.avatar}
                    alt="avatar"
                    onError={() => setAvatarBroken(true)}
                  />
                )}
              </div>
              <button onClick={() => setEditingAvatar(true)} className="btn-primary">{t("change")}</button>
            </div>
          )}
        </div>

        {/* ── Back ── */}
        <button onClick={() => router.back()} className="btn-back">
          {t("back")}
        </button>

      </div>
    </div>
  );
}