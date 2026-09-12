"use client";
import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

/* Exported so the tests measure against the real thresholds. They were
   hardcoded to 14 minutes in the test, which was right when the timeout was
   15 minutes and silently wrong from the day it became 6 hours. */
export const TIMEOUT_MS = 6 * 60 * 60 * 1000;      // 6 hours idle before auto-logout
export const WARNING_MS = TIMEOUT_MS - 60 * 1000;  // warn 1 minute before
export const CHECK_INTERVAL = 30 * 1000;

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const lastActivity = useRef(Date.now());
  const warningSent = useRef(false);

  useEffect(() => {
    const onActivity = () => {
      lastActivity.current = Date.now();
    };

    const interval = setInterval(async () => {
      // Use auth.currentUser directly — not affected by token-refresh 400 errors
      if (!auth.currentUser) return;

      const idle = Date.now() - lastActivity.current;

      if (idle >= TIMEOUT_MS) {
        setShowWarning(false);
        try { await signOut(auth); } catch (_) {}
        window.location.href = "/auth";
      } else if (idle >= WARNING_MS && !warningSent.current) {
        warningSent.current = true;
        setShowWarning(true);
      }
    }, CHECK_INTERVAL);

    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      clearInterval(interval);
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, onActivity));
    };
  }, []);

  const stayLoggedIn = () => {
    lastActivity.current = Date.now();
    warningSent.current = false;
    setShowWarning(false);
  };

  const logOutNow = async () => {
    setShowWarning(false);
    try { await signOut(auth); } catch (_) {}
    window.location.href = "/auth";
  };

  return { showWarning, stayLoggedIn, logOutNow };
}
