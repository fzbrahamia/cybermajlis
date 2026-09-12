"use client";

/* ONE SWITCH FOR EVERY ANIMATION ON THE SITE.
 *
 * framer-motion already has the mechanism: MotionConfig's `reducedMotion`
 * governs every motion component underneath it, so every existing animation
 * and every existing useReducedMotion() obeys this without one component
 * being edited. "user" means follow the operating system.
 *
 * CSS transitions and keyframes are not framer's to switch off, so the choice
 * is also stamped on <html> as data-motion and globals.css cuts them there.
 *
 * The control lives in the footer rather than in Settings because Settings is
 * behind a sign-in, and somebody who needs motion turned down needs it turned
 * down before they have an account.
 */

import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { useLocale } from "next-intl";
import { Waves, Minus } from "lucide-react";
import { writePrefs, subscribePrefs, type Motion } from "@/app/lib/prefs";

const MODE: Record<Motion, "user" | "never" | "always"> = {
  system: "user", full: "never", reduced: "always",
};

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [motion, setMotion] = useState<Motion>("system");

  useEffect(() => subscribePrefs(p => setMotion(p.motion ?? "system")), []);

  useEffect(() => {
    const el = document.documentElement;
    if (motion === "reduced") el.setAttribute("data-motion", "reduced");
    else el.removeAttribute("data-motion");
  }, [motion]);

  return <MotionConfig reducedMotion={MODE[motion]}>{children}</MotionConfig>;
}

/** Two states, not three. "System" is the default and needs no button of its
    own: pressing the switch is an explicit choice either way. */
export function MotionToggle({ style }: { style?: React.CSSProperties }) {
  const isAR = useLocale() === "ar";
  const [motion, setMotion] = useState<Motion>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => subscribePrefs(p => { setMotion(p.motion ?? "system"); setReady(true); }), []);

  // Before the preference is read, render the label with no state, so the
  // server and the first client paint agree.
  const reduced = ready && (motion === "reduced" ||
    (motion === "system" && typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches));

  const flip = () => {
    const next: Motion = reduced ? "full" : "reduced";
    writePrefs({ motion: next });
    setMotion(next);
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-pressed={reduced}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        font: "inherit", fontFamily: "var(--ui)", fontSize: ".78rem", fontWeight: 600,
        color: "#6a4640", background: reduced ? "rgba(99,32,36,.08)" : "transparent",
        border: "1px solid rgba(99,32,36,.2)", borderRadius: 999,
        padding: "6px 13px", cursor: "pointer", transition: "background .2s, color .2s",
        ...style,
      }}
    >
      {reduced ? <Minus size={13} /> : <Waves size={13} />}
      {reduced
        ? (isAR ? "الحركة موقوفة" : "Motion off")
        : (isAR ? "إيقاف الحركة" : "Reduce motion")}
    </button>
  );
}
