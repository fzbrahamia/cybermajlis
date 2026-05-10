"use client";
import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

const TIMEOUT_MS = 15 * 60 * 1000;        
const WARNING_MS = 14 * 60 * 1000;       
const CHECK_INTERVAL = 30 * 1000;

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
