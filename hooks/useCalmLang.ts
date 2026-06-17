"use client";
import { useState, useEffect } from "react";

const FALLBACK_KEY = "calm-lang";

function readLocaleCookie(): "en" | "ar" | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)locale=(en|ar)\b/);
  return m ? (m[1] as "en" | "ar") : null;
}

export function useCalmLang(): ["en" | "ar", (l: "en" | "ar") => void] {
  // Start in "en" so the first client render matches the server (no hydration
  // mismatch), then sync to the real language in the effect below.
  const [lang, setLangState] = useState<"en" | "ar">("en");

  // Open calm mode in the same language the user is already using on the main
  // site (the shared `locale` cookie). Falls back to any saved calm preference.
  useEffect(() => {
    const cookieLang = readLocaleCookie();
    if (cookieLang) { setLangState(cookieLang); return; }
    const stored = localStorage.getItem(FALLBACK_KEY);
    if (stored === "ar" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: "en" | "ar") => {
    // Keep calm mode and the main site in sync via the shared locale cookie.
    document.cookie = `locale=${l}; path=/; max-age=31536000`;
    localStorage.setItem(FALLBACK_KEY, l);
    setLangState(l);
  };

  return [lang, setLang];
}
