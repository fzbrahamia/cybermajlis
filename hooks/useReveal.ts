"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* WHY THIS IS NOT JUST whileInView.
 *
 * Scroll-reveal has one failure mode that matters more than the effect does:
 * content that is never revealed. framer's whileInView fires when an element
 * ENTERS the viewport, and an element that is already above the viewport never
 * enters it. Two ordinary things put content there:
 *
 *   the browser restores your scroll position when you go back, so everything
 *   above where you were mounts already scrolled past, and stays at opacity 0
 *   until you reload
 *
 *   a page taller than the window mounts with most of itself below the fold,
 *   which is fine, but combined with the above you get a page of blank cards
 *
 * So the rule here is not "is it intersecting" but "is it strictly below the
 * fold". Anything at or above the fold is either visible now or was scrolled
 * past, and either way it is shown immediately. Only what is genuinely still
 * coming waits for the observer. The rechecks cover scroll restoration, which
 * lands a frame or two after mount, and bfcache restores, which skip mount
 * altogether. Once shown, always shown. */
const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  const done = useRef(false);

  useIsoLayout(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => { if (!done.current) { done.current = true; setShown(true); } };
    const belowFold = () => el.getBoundingClientRect().top >= window.innerHeight;

    if (!belowFold()) { show(); return; }

    const io = new IntersectionObserver(
      es => { if (es.some(e => e.isIntersecting)) show(); },
      { rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);

    const recheck = () => { if (!belowFold()) show(); };
    const r1 = requestAnimationFrame(recheck);
    const r2 = requestAnimationFrame(() => requestAnimationFrame(recheck));
    window.addEventListener("pageshow", recheck);
    return () => {
      io.disconnect();
      cancelAnimationFrame(r1); cancelAnimationFrame(r2);
      window.removeEventListener("pageshow", recheck);
    };
  }, []);

  return [ref, shown] as const;
}
