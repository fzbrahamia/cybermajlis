"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeOffIcon, Check, Circle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CharacterSelection from "./CharacterSelection";
import { auth, db } from "../app/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { isUsernameAvailable, claimUsernameAndCreateUser } from "../app/lib/usernames";
import { FirebaseError } from "firebase/app";
import Modal from "@/components/Modal";
import { useTranslations, useLocale } from "next-intl";
import bcrypt from "bcryptjs";

/**
 * Only ever redirect to a path on this site.
 *
 * An attacker who can hand someone a link controls `next`, so anything that
 * could resolve to another origin has to be rejected: absolute URLs, and
 * protocol-relative ones like //evil.com, which a browser treats as external.
 * Backslashes are rejected too because browsers normalise them to slashes,
 * making /\evil.com another way to leave the site.
 */
function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  if (raw.includes("\\")) return null;
  return raw;
}

export default function StepperFlow({ brand = "cyber" }: { brand?: "cyber" | "majlis" } = {}) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [step, setStep] = useState(1);
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const router = useRouter();

  // Step titles come from the JSON so they switch with locale
  const stepTitles = [
    t("signup.steps.1"),
    t("signup.steps.2"),
    t("signup.steps.3"),
  ];

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, stepTitles.length));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isUsernameValid = username.length >= 3;
  const passwordChecks = {
    length: password.length >= 8,
    number: /\d/.test(password),
    upper: /[A-Z]/.test(password),
    symbol: /[!@#$%^&*]/.test(password),
  };
  const isConfirmMatch = password === confirmPassword;

  const [modal, setModal] = useState<{
    isOpen: boolean; title: string; message: string;
    onConfirm?: () => void; confirmText?: string;
  }>({ isOpen: false, title: "", message: "" });

  const showModal = (title: string, message: string, onConfirm?: () => void, confirmText?: string) =>
    setModal({ isOpen: true, title, message, onConfirm, confirmText });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setShowSignUp(true);
    }
  }, [searchParams]);

  // Where to land after a successful sign-in. Callers pass ?next=/ctf so people
  // return to the page that sent them here instead of always the dashboard.
  const afterAuth = safeNext(searchParams.get("next")) ?? (brand === "majlis" ? "/learn" : "/dashboard");
  // Pages that need a real account (CTF saves your flags) pass ?guest=0 to hide
  // the "continue as a guest" escape hatch.
  // Majlis keeps your first sentence, your gap and your passport, none of
  // which survive a guest session, so there is no guest door here.
  const allowGuest = brand !== "majlis" && searchParams.get("guest") !== "0";
  // Keep next/guest attached when moving between the login and sign-up views.
  const authHref = (() => {
    const q = new URLSearchParams();
    const n = searchParams.get("next");
    if (n) q.set("next", n);
    if (!allowGuest) q.set("guest", "0");
    const s = q.toString();
    const door = brand === "majlis" ? "/enter" : "/auth";
    return s ? `${door}?${s}` : door;
  })();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      :root { --maroon: #632024; --maroon-deep: #3e1316; --maroon-mid: #8B2635; --gold: #c5a57e; --gold-light: #E8D4BC; --cream: #E3DAC9; --heading: #4a1a1d; --body: #6a4640;
              --tint: 99,32,36; --tint2: 139,38,53; --paper1: #FDFBF6; --paper2: #F3EBDB; --stripe: linear-gradient(90deg, var(--maroon), var(--gold)); --btn-ink: #F3EAD7; }

      /* Majlis has its own door at /enter. Same flow underneath, because the
         Firebase calls, the username reservation and the open-redirect guard
         are security-relevant and must never drift apart. Only the look and
         the destination differ, and they differ completely. */
      .brand-majlis { --maroon: #8F6A38; --maroon-deep: #6E5228; --maroon-mid: #A8804A; --gold: #C5A57E; --gold-light: #F0E4CE; --cream: #FCF6EA; --heading: #2A231C; --body: #6E6357;
              --tint: 42,35,28; --tint2: 197,165,126; --paper1: #FFFDF8; --paper2: #FBF4E6; --stripe: linear-gradient(90deg, #A8323F, #C5A57E, #3D6FB5, #2E9C6E); --btn-ink: #FFFDF8; }
      .auth-root { min-height: 100vh; background: #FDFBF6; display: flex; align-items: center; justify-content: center; padding: 2rem; }
      .login-card { background: linear-gradient(160deg, var(--paper1) 0%, var(--paper2) 100%); border: 1px solid rgba(var(--tint),0.14); border-radius: 24px; padding: 3rem 2.5rem; width: 100%; max-width: 440px; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(var(--tint),0.12); }
      .login-card::before { content: ''; position: absolute; top: -70px; right: -70px; width: 220px; height: 220px; border-radius: 50%; background: rgba(var(--tint),0.03); border: 1px solid rgba(var(--tint),0.06); pointer-events: none; }
      .login-card::after { content: ''; position: absolute; bottom: -50px; left: -50px; width: 160px; height: 160px; border-radius: 50%; background: rgba(var(--tint),0.02); border: 1px solid rgba(var(--tint),0.05); pointer-events: none; }
      .login-card-stripe { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--stripe); opacity: 0.9; --unused: linear-gradient(90deg, var(--gold), rgba(197,165,126,0.2)); }
      .auth-eyebrow { display: inline-block; font-family: 'Cinzel', serif; font-size: 0.6rem; letter-spacing: 0.35em; text-transform: uppercase; color: var(--maroon-mid); border: 1px solid rgba(var(--tint2),0.25); padding: 0.35rem 1.2rem; border-radius: 999px; margin-bottom: 1rem; display: block; text-align: center; }
      .auth-title { font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 900; color: var(--heading); text-align: center; margin-bottom: 0.6rem; line-height: 1.1; }
      .auth-divider { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 2rem; }
      .auth-input-wrap { position: relative; margin-bottom: 0.85rem; }
      .auth-input { width: 100%; padding: 0.8rem 2.8rem 0.8rem 1rem; border-radius: 12px; background: rgba(var(--tint),0.04); border: 1px solid rgba(var(--tint),0.2); color: var(--heading); font-family: 'Crimson Pro', serif; font-size: 1rem; outline: none; transition: border-color 0.2s; }
      .auth-input::placeholder { color: rgba(106,70,64,0.5); }
      .auth-input:focus { border-color: rgba(var(--tint),0.4); }
      .auth-eye { position: absolute; inset-y: 0; right: 0.75rem; display: flex; align-items: center; background: none; border: none; color: rgba(var(--tint),0.45); cursor: pointer; transition: color 0.2s; }
      .auth-eye:hover { color: var(--maroon); }
      .auth-error { font-family: 'Crimson Pro', serif; font-size: 0.85rem; color: #b04a4a; margin: -0.4rem 0 0.6rem 0.2rem; }
      .btn-auth-primary { width: 100%; padding: 0.85rem; font-family: 'Cinzel', serif; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; border: none; border-radius: 12px; cursor: pointer; background: linear-gradient(135deg, var(--maroon), var(--maroon-mid)); color: var(--btn-ink); font-weight: 700; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 6px 18px rgba(var(--tint),0.28); margin-top: 0.4rem; }
      .btn-auth-primary:hover { opacity: 0.88; transform: translateY(-1px); }
      .btn-auth-ghost { background: none; border: none; font-family: 'Crimson Pro', serif; font-size: 0.9rem; cursor: pointer; transition: color 0.2s; padding: 0; }
      .auth-footer { text-align: center; margin-top: 1.4rem; font-family: 'Crimson Pro', serif; font-size: 0.9rem; color: rgba(106,70,64,0.55); }
      .signup-card { background: linear-gradient(160deg, var(--paper1) 0%, var(--paper2) 100%); border: 1px solid rgba(var(--tint),0.14); border-radius: 24px; width: 100%; max-width: 500px; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(var(--tint),0.12); }
      .signup-card-stripe { height: 3px; background: var(--stripe); }
      .signup-card-body { padding: 2.5rem 2.5rem 2rem; }
      .step-indicators { display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 2rem; }
      .step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-size: 0.75rem; font-weight: 700; transition: all 0.3s; }
      .step-dot.completed { background: linear-gradient(135deg, var(--maroon-deep), var(--maroon)); color: var(--gold-light); box-shadow: 0 4px 12px rgba(var(--tint),0.3); }
      .step-dot.active { background: var(--maroon); color: var(--gold-light); border: 2px solid var(--gold); box-shadow: 0 0 0 3px rgba(197,165,126,0.2); }
      .step-dot.inactive { background: rgba(var(--tint),0.08); color: rgba(106,70,64,0.4); border: 1px solid rgba(var(--tint),0.12); }
      .step-line { flex: 1; height: 1.5px; max-width: 40px; background: rgba(var(--tint),0.15); border-radius: 2px; }
      .signup-title { font-family: 'Cinzel', serif; font-size: 1.5rem; font-weight: 700; color: var(--heading); text-align: center; margin-bottom: 1.8rem; }
      .signup-input-wrap { position: relative; margin-bottom: 0.85rem; }
      .signup-input { width: 100%; padding: 0.8rem 2.8rem 0.8rem 1rem; border-radius: 12px; background: rgba(var(--tint),0.04); border: 1px solid rgba(var(--tint),0.2); color: var(--heading); font-family: 'Crimson Pro', serif; font-size: 1rem; outline: none; transition: border-color 0.2s; box-shadow: inset 0 1px 3px rgba(var(--tint),0.05); }
      .signup-input::placeholder { color: rgba(106,70,64,0.5); }
      .signup-input:focus { border-color: rgba(var(--tint),0.4); }
      .signup-input.error { border-color: var(--maroon-mid); }
      .signup-input:disabled { opacity: 0.4; cursor: not-allowed; }
      .signup-eye { position: absolute; inset-y: 0; right: 0.75rem; display: flex; align-items: center; background: none; border: none; color: rgba(var(--tint),0.45); cursor: pointer; transition: color 0.2s; }
      .signup-eye:hover { color: var(--maroon); }
      .signup-error { font-family: 'Crimson Pro', serif; font-size: 0.85rem; color: #b04a4a; margin: -0.4rem 0 0.6rem 0.2rem; }
      .pw-checks { list-style: none; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 4px; }
      .pw-check { font-family: 'Crimson Pro', serif; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; }
      .pw-check.valid { color: rgba(106,70,64,0.6); text-decoration: line-through; opacity: 0.85; }
      .pw-check.invalid { color: var(--heading); }
      .step-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 1.8rem; }
      .btn-step-back { display: flex; align-items: center; gap: 6px; font-family: 'Cinzel', serif; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.7rem 1.4rem; border-radius: 10px; border: 1px solid rgba(var(--tint),0.25); background: transparent; color: var(--heading); cursor: pointer; transition: background 0.2s; }
      .btn-step-back:hover { background: rgba(var(--tint),0.06); }
      .btn-step-next { display: flex; align-items: center; gap: 6px; font-family: 'Cinzel', serif; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.7rem 1.6rem; border-radius: 10px; border: none; background: linear-gradient(135deg, var(--maroon-deep), var(--maroon)); color: var(--gold-light); cursor: pointer; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 4px 14px rgba(var(--tint),0.25); }
      .btn-step-next:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      .btn-step-next:disabled { opacity: 0.35; cursor: not-allowed; }
      .signup-footer { text-align: center; margin-top: 1.2rem; font-family: 'Crimson Pro', serif; font-size: 0.9rem; color: rgba(106,70,64,0.55); }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────
  if (!showSignUp) {
    return (
      <div className={`auth-root brand-${brand}`}>
        <div className="login-card">
          <div className="login-card-stripe" />
          <span className="auth-eyebrow">{t("login.eyebrow")}</span>
          <h2 className="auth-title">{t("login.title")}</h2>
          <div className="auth-divider">
            <div style={{ height: 1, width: 40, background: "linear-gradient(90deg, transparent, rgba(197,165,126,.4))", borderRadius: 2 }} />
            <div style={{ width: 4, height: 4, background: "#c5a57e", transform: "rotate(45deg)", opacity: 0.6 }} />
            <div style={{ height: 1, width: 40, background: "linear-gradient(90deg, rgba(197,165,126,.4), transparent)", borderRadius: 2 }} />
          </div>

          <div className="auth-input-wrap">
            <input type="email" placeholder={t("login.email_placeholder")} value={email}
              onChange={e => setEmail(e.target.value)} className="auth-input" />
          </div>

          <div className="auth-input-wrap">
            <input type={showPassword ? "text" : "password"} placeholder={t("login.password_placeholder")}
              value={password} onChange={e => setPassword(e.target.value)} className="auth-input" />
            <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>

          <button type="button" className="btn-auth-primary"
            onClick={async () => {
              if (!email || !password) {
                showModal(t("modals.missing_fields_title"), t("modals.missing_fields_msg"));
                return;
              }
              try {
                  const userCredential = await signInWithEmailAndPassword(auth, email, password);
                  const user = userCredential.user;

                  await user.reload(); 
                  const freshUser = auth.currentUser;

                  if (!freshUser?.emailVerified) {
                    await signOut(auth);
                    showModal(
                      t("modals.verify_email_title"),
                      t("modals.verify_email_msg", { email: freshUser?.email ?? email }),
                    async () => {
                      try {
                        const tempCredential = await signInWithEmailAndPassword(auth, email, password);
                        await sendEmailVerification(tempCredential.user);
                        await signOut(auth);
                        closeModal();
                        showModal(t("modals.reset_sent_title"), t("modals.reset_sent_msg", { email }));
                      } catch {
                        closeModal();
                        showModal(t("modals.error_title"), t("modals.error_generic"));
                      }
                    },
                    t("modals.verify_email_resend"),
                  );
                  return;
                  }
                sessionStorage.setItem("loginSuccess", "true");
                router.push(afterAuth);
              } catch (error: any) {
                if (error.code === "auth/user-not-found") {
                  showModal(
                    t("modals.account_not_found_title"),
                    t("modals.account_not_found_msg"),
                    () => { closeModal(); setShowSignUp(true); setShowPassword(false); },
                    t("modals.account_not_found_confirm"),
                  );
                } else {
                  showModal(t("modals.login_failed_title"), t("modals.login_failed_msg"));
                }
              }
            }}>
            {t("login.submit")}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button type="button" className="btn-auth-ghost"
              style={{ color: "rgba(106,70,64,0.75)", fontSize: "0.85rem", fontFamily: "'Crimson Pro', serif" }}
              onClick={async () => {
                if (!email) { showModal(t("modals.missing_email_title"), t("modals.missing_email_msg")); return; }
                try {
                  await sendPasswordResetEmail(auth, email);
                  showModal(t("modals.reset_sent_title"), t("modals.reset_sent_msg", { email }));
                } catch {
                  showModal(t("modals.reset_failed_title"), t("modals.reset_failed_msg"));
                }
              }}>
              {t("login.forgot")}
            </button>
          </div>

          <div className="auth-footer">
            {t("login.footer_text")}{" "}
            <button className="btn-auth-ghost" style={{ color: "var(--maroon-mid)", textDecoration: "underline" }}
              onClick={() => { setShowSignUp(true); setShowPassword(false); }}>
              {t("login.footer_link")}
            </button>
          </div>

          {allowGuest && (
            <div style={{ textAlign: "center", marginTop: "0.9rem" }}>
              <button type="button" className="btn-auth-ghost"
                style={{ color: "rgba(106,70,64,0.6)", fontSize: "0.82rem", fontStyle: "italic" }}
                onClick={() => router.push("/dashboard")}>
                {t("login.guest_link")}
              </button>
            </div>
          )}
        </div>

        <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message}
          onClose={closeModal} onConfirm={modal.onConfirm} confirmText={modal.confirmText} />
      </div>
    );
  }

  // ── SIGNUP ─────────────────────────────────────────────────
  return (
    <div className={`auth-root brand-${brand}`}>
      <div className="signup-card">
        <div className="signup-card-stripe" />
        <div className="signup-card-body">

          {/* Step indicators */}
          <div className="step-indicators">
            {stepTitles.map((_, index) => {
              const isActive = index + 1 === step;
              const isCompleted = index + 1 < step;
              return (
                <React.Fragment key={index}>
                  {index > 0 && <div className="step-line" />}
                  <div className={`step-dot ${isCompleted ? "completed" : isActive ? "active" : "inactive"}`}>
                    {isCompleted ? <Check size={15} /> : index + 1}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <h2 className="signup-title" style={{ color: "#4a1a1d" }}>{stepTitles[step - 1]}</h2>

          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.25 }}>

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className="signup-input-wrap">
                    <input type="email" placeholder={t("signup.email_placeholder")} value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`signup-input ${email && !isEmailValid ? "error" : ""}`} />
                  </div>
                  {email && !isEmailValid && (
                    <p className="signup-error" style={{ color: "#b04a4a" }}>
                      {t("signup.errors.invalid_email")}
                    </p>
                  )}
                  <div className="signup-input-wrap">
                    <input type="text" placeholder={t("signup.username_placeholder")} value={username}
                      onChange={e => setUsername(e.target.value)}
                      className={`signup-input ${username && !isUsernameValid ? "error" : ""}`} />
                  </div>
                  {username && !isUsernameValid && (
                    <p className="signup-error" style={{ color: "#b04a4a" }}>
                      {t("signup.errors.username_short")}
                    </p>
                  )}
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <div className="signup-input-wrap">
                    <input type={showPassword ? "text" : "password"} placeholder={t("signup.password_placeholder")}
                      value={password} onChange={e => setPassword(e.target.value)} className="signup-input" />
                    <button type="button" className="signup-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="signup-input-wrap">
                    <input type={showConfirm ? "text" : "password"} placeholder={t("signup.confirm_placeholder")}
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className={`signup-input ${confirmPassword && !isConfirmMatch ? "error" : ""}`} disabled={!Object.values(passwordChecks).every(Boolean)} />
                    <button type="button" className="signup-eye" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && !isConfirmMatch && (
                    <p className="signup-error" style={{ color: "#b04a4a" }}>
                      {t("signup.errors.passwords_no_match")}
                    </p>
                  )}
                  {password && (
                    <ul className="pw-checks">
                      {(Object.entries(passwordChecks) as [keyof typeof passwordChecks, boolean][]).map(([rule, valid]) => (
                        <li key={rule} className={`pw-check ${valid ? "valid" : "invalid"}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {valid ? <Check size={13} /> : <Circle size={13} />} {t(`signup.pw_checks.${rule}`)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <CharacterSelection onSelect={setSelectedCharacter} value={selectedCharacter} />
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="step-nav">
            {step > 1 ? (
              <button onClick={handleBack} className="btn-step-back">
                {isRtl ? "→" : "←"} {t("signup.back_btn")}
              </button>
            ) : <div />}

            {step < stepTitles.length ? (
              <button onClick={handleNext} className="btn-step-next"
                disabled={
                  (step === 1 && (!isEmailValid || !isUsernameValid)) ||
                  (step === 2 && (!Object.values(passwordChecks).every(Boolean) || !isConfirmMatch || !confirmPassword))
                }>
                {t("signup.continue_btn")} {isRtl ? "←" : "→"}
              </button>
            ) : (
              <button className="btn-step-next" disabled={!selectedCharacter}
                onClick={async () => {
                  try {
                    // Enforce a unique username before creating the account.
                    if (!(await isUsernameAvailable(username))) {
                      showModal(t("modals.error_title"), t("signup.errors.username_taken"));
                      return;
                    }

                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    const hashedPassword = await bcrypt.hash(password, 10);

                    try {
                      await claimUsernameAndCreateUser(user.uid, username, {
                        userID: user.uid,
                        username,
                        email,
                        password: hashedPassword,
                        avatar: selectedCharacter,
                        createdAt: serverTimestamp(),
                      });
                    } catch (e: any) {
                      // Lost the race for this name — roll back the just-created auth user.
                      if (e?.message === "username-taken") {
                        await user.delete().catch(() => {});
                        showModal(t("modals.error_title"), t("signup.errors.username_taken"));
                        return;
                      }
                      throw e;
                    }

                    await sendEmailVerification(user);
                    await signOut(auth);
                    showModal(
                      t("modals.account_created_title"),
                      t("modals.account_created_msg", { email }),
                      () => { closeModal(); setShowSignUp(false); },
                      t("modals.account_created_confirm"),
                    );
                  } catch (error: any) {
                    console.error("❌ Full error:", error);
                    if (error.code === "auth/email-already-in-use") {
                      showModal(
                        t("modals.email_in_use_title"),
                        t("modals.email_in_use_msg"),
                        () => { closeModal(); setShowSignUp(false); },
                        t("modals.email_in_use_confirm"),
                      );
                    } else if (error instanceof FirebaseError) {
                      showModal(t("modals.error_title"), error.message);
                    } else {
                      showModal(t("modals.error_title"), t("modals.error_generic"));
                    }
                  }
                }}>
                {t("signup.complete_btn")} {isRtl ? "←" : "→"}
              </button>
            )}
          </div>

          <div className="signup-footer" style={{ color: "rgba(106,70,64,0.55)" }}>
            {t("signup.footer_text")}{" "}
            <button className="btn-auth-ghost" style={{ color: "var(--maroon-mid)", textDecoration: "underline" }}
              onClick={() => { setShowSignUp(false); setShowPassword(false); router.push(authHref); }}>
              {t("signup.footer_link")}
            </button>
          </div>

          {allowGuest && (
            <div style={{ textAlign: "center", marginTop: "0.9rem" }}>
              <button type="button" className="btn-auth-ghost"
                style={{ color: "rgba(106,70,64,0.6)", fontSize: "0.82rem", fontStyle: "italic" }}
                onClick={() => router.push("/dashboard")}>
                {t("signup.guest_link")}
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message}
        onClose={closeModal} onConfirm={modal.onConfirm} confirmText={modal.confirmText} />
    </div>
  );
}