"use client";

// ============================================================
// QUANTUM MAJLIS — PROFILE
//
// The account is shared across every majlis: one Firebase user, one username,
// one avatar. So this page edits the same record CyberMajlis does, and says so
// rather than pretending to be a separate identity.
//
// What is specific to this majlis is the progress: which stations are charted,
// which beats are done, which benches have been visited.
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import { changeUsername } from "@/app/lib/usernames";
import {
  ArrowLeft, ArrowRight, Check, FlaskConical, Film, LayoutGrid,
  LogIn, Pencil, Route, X,
} from "lucide-react";
import { QUANTUM_PATH, QUANTUM_LABS, QUANTUM_UPCOMING, STEP_ORDER } from "@/app/lib/quantumData";
import { useQuantumProgress } from "@/hooks/useQuantumProgress";
import { QuantumHeader, QuantumFooter } from "@/components/quantum/QuantumChrome";
import CharacterSelection from "@/components/CharacterSelection";
import {
  Q, INK, BODY, LINE, PAPER, PAGE, GOLD_DEEP,
  display, bodyFont, mono, EASE, CARD_SHADOW,
} from "@/components/quantum/theme";
import { resolveAvatar } from "@/app/lib/avatars";


export default function QuantumProfilePage() {
  const isAR = useLocale() === "ar";
  const reduce = useReducedMotion();
  const { loaded, doneCount, stepCount, isStepDone, isLessonDone } = useQuantumProgress();

  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<any>(null);

  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, u => {
      setUser(u);
      setReady(true);
      if (!u) { setData(null); return; }
      return onSnapshot(doc(db, "user", u.uid), snap => {
        if (snap.exists()) {
          setData(snap.data());
          setDraftName(prev => prev || snap.data().username || "");
        }
      });
    });
    return () => unsubAuth();
  }, []);

  const saveName = async () => {
    const next = draftName.trim();
    if (!user || next.length < 3) { setNameError(isAR ? "ثلاثة أحرف على الأقل" : "At least three characters"); return; }
    setSaving(true); setNameError("");
    try {
      await changeUsername(user.uid, data?.username, next);
      setData((p: any) => ({ ...p, username: next }));
      setEditingName(false);
    } catch (e: any) {
      setNameError(e?.message === "username-taken"
        ? (isAR ? "هذا الاسم مأخوذ" : "That name is taken")
        : (isAR ? "تعذّر الحفظ" : "Could not save"));
    } finally { setSaving(false); }
  };

  const saveAvatar = async (src: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "user", user.uid), { avatar: src });
      setData((p: any) => ({ ...p, avatar: src }));
      setEditingAvatar(false);
    } catch { /* rules may refuse; the picker just stays open */ }
  };

  const avatar = resolveAvatar(data?.avatar);
  const written = QUANTUM_PATH.length;
  const totalStations = written + QUANTUM_UPCOMING.length;
  const totalSteps = written * STEP_ORDER.length;
  const pct = totalSteps ? Math.round((stepCount / totalSteps) * 100) : 0;
  const joined = data?.createdAt?.toDate?.()
    ? new Date(data.createdAt.toDate()).toLocaleDateString(isAR ? "ar-QA" : "en-GB", { year: "numeric", month: "long" })
    : null;

  const card: React.CSSProperties = {
    background: PAPER, border: `1px solid ${LINE}`, borderRadius: 22,
    padding: "24px", boxShadow: CARD_SHADOW,
  };
  const label: React.CSSProperties = {
    fontFamily: mono, fontSize: 9, letterSpacing: "0.2em", color: GOLD_DEEP, marginBottom: 12,
  };
  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
    padding: "10px 18px", borderRadius: 999, border: "none", textDecoration: "none",
    fontFamily: display(isAR), fontSize: 12, fontWeight: 700,
    background: Q.deep, color: "#fff",
  };
  const ghost: React.CSSProperties = {
    ...btn, background: "transparent", color: INK, border: `1px solid ${LINE}`,
  };

  const STEP_META = [
    { id: "video" as const, Icon: Film,         en: "Story", ar: "القصّة" },
    { id: "board" as const, Icon: LayoutGrid,   en: "Board", ar: "اللوح" },
    { id: "lab"   as const, Icon: FlaskConical, en: "Lab",   ar: "المختبر" },
  ];

  return (
    <div style={{ background: PAGE, minHeight: "100vh", color: INK, fontFamily: bodyFont }}>
      <QuantumHeader />

      <div style={{
        maxWidth: 780, margin: "0 auto",
        padding: "calc(62px + clamp(28px,4vw,46px)) clamp(18px,4vw,36px) clamp(56px,8vw,90px)",
      }}>
        <Link href="/quantum" style={{
          display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 22,
          fontFamily: mono, fontSize: 9, letterSpacing: "0.18em", color: BODY,
        }}>
          {isAR ? <ArrowRight size={11} /> : <ArrowLeft size={11} />}
          {isAR ? "مجلس الكوانتم" : "QUANTUM MAJLIS"}
        </Link>

        {/* ── who you are ── */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ ...card, marginBottom: 16 }}
        >
          {ready && !user ? (
            <div>
              <h1 style={{ fontFamily: display(isAR), fontSize: 22, fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                {isAR ? "لم تسجّل الدخول بعد" : "You are not signed in"}
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: BODY, margin: "0 0 18px" }}>
                {isAR
                  ? "تقدّمك في المسار محفوظ على هذا الجهاز. سجّل الدخول ليتبعك اسمك وصورتك عبر المجالس الثلاثة."
                  : "Your path progress is saved on this device. Sign in so your name and picture follow you across all three majalis."}
              </p>
              <a href="/auth?next=/quantum/profile&guest=0" style={btn}>
                <LogIn size={14} /> {isAR ? "سجّل الدخول" : "Sign in"}
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt=""
                style={{
                  width: 84, height: 84, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
                  background: Q.tint, border: `2px solid ${Q.mid}44`,
                }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                {editingName ? (
                  <div>
                    <input
                      value={draftName}
                      onChange={e => setDraftName(e.target.value)}
                      aria-label={isAR ? "اسم المستخدم" : "Username"}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 10,
                        border: `1px solid ${LINE}`, background: PAGE, color: INK,
                        font: "inherit", fontSize: 16,
                      }}
                    />
                    {nameError && (
                      <p style={{ margin: "6px 0 0", fontSize: 13, color: "#B4434E" }}>{nameError}</p>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={saveName} disabled={saving} style={{ ...btn, opacity: saving ? 0.6 : 1 }}>
                        <Check size={13} /> {saving ? (isAR ? "يحفظ" : "Saving") : (isAR ? "احفظ" : "Save")}
                      </button>
                      <button onClick={() => { setEditingName(false); setNameError(""); }} style={ghost}>
                        <X size={13} /> {isAR ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 style={{ fontFamily: display(isAR), fontSize: 24, fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                      {data?.username || (isAR ? "مستكشف" : "Explorer")}
                    </h1>
                    <p style={{ margin: 0, fontSize: 14, color: BODY }}>{data?.email || user?.email}</p>
                    {joined && (
                      <p style={{ margin: "2px 0 0", fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", color: BODY }}>
                        {isAR ? `انضممت ${joined}` : `JOINED ${joined.toUpperCase()}`}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <button onClick={() => setEditingName(true)} style={ghost}>
                        <Pencil size={12} /> {isAR ? "غيّر الاسم" : "Change name"}
                      </button>
                      <button onClick={() => setEditingAvatar(v => !v)} style={ghost}>
                        <Pencil size={12} /> {isAR ? "غيّر الصورة" : "Change picture"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {user && (
            <p style={{
              margin: "18px 0 0", paddingTop: 14, borderTop: `1px solid ${LINE}`,
              fontSize: 13.5, lineHeight: 1.6, color: BODY,
            }}>
              {isAR
                ? "اسمك وصورتك مشتركة بين المجالس الثلاثة. تغييرها هنا يغيّرها في المجلس السيبراني أيضاً."
                : "Your name and picture are shared across all three majalis. Changing them here changes them in CyberMajlis too."}
            </p>
          )}
        </motion.section>

        {/* ── avatar picker ── */}
        {user && editingAvatar && (
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ ...card, marginBottom: 16 }}
          >
            <div style={label}>{isAR ? "اختر صورتك" : "CHOOSE YOUR PICTURE"}</div>
            <CharacterSelection value={avatar} onSelect={saveAvatar} />
          </motion.section>
        )}

        {/* ── your path ── */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: EASE }}
          style={{ ...card, marginBottom: 16 }}
        >
          <div style={label}>{isAR ? "رحلتك في مجلس الكوانتم" : "YOUR JOURNEY IN QUANTUM MAJLIS"}</div>

          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", marginBottom: 20 }}>
            {([
              { n: `${doneCount}/${totalStations}`, en: "stations charted", ar: "محطات أنهيتها" },
              { n: `${stepCount}`,                  en: "beats finished",   ar: "خطوة أتممتها" },
              { n: `${pct}%`,                       en: "of what is written", ar: "ممّا كُتب" },
            ] as const).map(k => (
              <div key={k.en}>
                <div style={{ fontFamily: display(isAR), fontSize: "1.9rem", fontWeight: 900, color: Q.deep, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {k.n}
                </div>
                <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.16em", color: BODY, marginTop: 7, textTransform: "uppercase" }}>
                  {isAR ? k.ar : k.en}
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 8, borderRadius: 99, background: "rgba(17,26,21,.06)", overflow: "hidden", marginBottom: 18 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: EASE }}
              style={{ height: "100%", borderRadius: 99, background: Q.mid }}
            />
          </div>

          {/* per station, which beats are done */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {QUANTUM_PATH.map(lesson => {
              const done = loaded && isLessonDone(lesson.slug);
              return (
                <Link
                  key={lesson.slug}
                  href={`/quantum/paths/${lesson.slug}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
                    padding: "12px 14px", borderRadius: 14,
                    background: done ? Q.tint : PAGE,
                    border: `1px solid ${done ? Q.mid + "44" : LINE}`,
                  }}
                >
                  <span style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    display: "grid", placeItems: "center",
                    fontFamily: mono, fontSize: 11, fontWeight: 700,
                    background: done ? Q.deep : "transparent", color: done ? "#fff" : BODY,
                    border: `1px solid ${done ? Q.mid : LINE}`,
                  }}>
                    {done ? <Check size={12} /> : lesson.order}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: display(isAR), fontSize: 15, fontWeight: 700, color: INK }}>
                    {isAR ? lesson.name_ar : lesson.name_en}
                  </span>
                  <span style={{ display: "flex", gap: 5 }}>
                    {STEP_META.map(st => {
                      const on = loaded && isStepDone(lesson.slug, st.id);
                      return (
                        <span
                          key={st.id}
                          title={isAR ? st.ar : st.en}
                          style={{
                            width: 24, height: 24, borderRadius: 7,
                            display: "grid", placeItems: "center",
                            background: on ? Q.mid : "rgba(17,26,21,.05)",
                            color: on ? "#fff" : BODY,
                          }}
                        >
                          <st.Icon size={11} />
                        </span>
                      );
                    })}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.section>

        {/* ── benches ── */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
          style={card}
        >
          <div style={label}>{isAR ? "المختبرات" : "THE BENCHES"}</div>
          <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.6, color: BODY }}>
            {isAR
              ? "المختبرات مفتوحة دائماً، بدرس أو بدونه."
              : "The benches are always open, with or without a lesson."}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {QUANTUM_LABS.map(lab => (
              <span key={lab.id} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "8px 14px", borderRadius: 999,
                fontSize: 13.5, fontWeight: 600,
                color: lab.ready ? INK : BODY,
                background: lab.ready ? PAGE : "transparent",
                border: `1px ${lab.ready ? "solid" : "dashed"} ${LINE}`,
              }}>
                <FlaskConical size={12} style={{ color: lab.ready ? Q.deep : BODY }} />
                {isAR ? lab.title_ar : lab.title_en}
              </span>
            ))}
          </div>
          <Link href="/quantum/labs" style={{ ...btn, marginTop: 18 }}>
            <Route size={13} /> {isAR ? "افتح المختبرات" : "Open the labs"}
          </Link>
        </motion.section>
      </div>

      <QuantumFooter />
    </div>
  );
}
