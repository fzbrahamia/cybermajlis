"use client";

/* Chrome for the innovation track.

   The room's colour runs through the mark, the active tab, the light behind
   the page and the notepad, so moving between rooms feels like moving inside
   one building rather than opening four different websites. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import { resolveAvatar } from "@/app/lib/avatars";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Globe, User } from "lucide-react";
import { M, sans, mono, display, R, roomFor, ROOM, HUES, type Hue } from "./theme";
import { Blobs } from "./Alive";
import Notepad from "./Notepad";
import HamadCorner from "./HamadCorner";

/* Four rooms. The paths avoid /community and /news because those belong to
   CyberMajlis and two brands must never share one route. */
const TABS = [
  { href: "/learn",  en: "Learn",     ar: "تعلّم" },
  { href: "/board",  en: "Community", ar: "المجتمع" },
  { href: "/latest", en: "News",      ar: "الأخبار" },
  { href: "/mine",   en: "Mine",      ar: "أشيائي" },
];

/** Four dots, one per room, and the room you are in grows. */
function Mark({ active }: { active: string }) {
  const reduce = useReducedMotion();
  const dots = TABS.map(t => ROOM[t.href] ?? HUES.gold);
  return (
    <span aria-hidden style={{ display: "grid", gridTemplateColumns: "repeat(2, 9px)", gap: 3 }}>
      {dots.map((h, i) => {
        const on = TABS[i].href === active;
        return (
          <motion.span
            key={i}
            animate={reduce ? undefined : { scale: on ? 1.35 : 1, opacity: on ? 1 : 0.55 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            style={{ width: 9, height: 9, borderRadius: "50%", background: h.mid, display: "block" }}
          />
        );
      })}
    </span>
  );
}

export function InnovationHeader({ hue }: { hue: Hue }) {
  const isAR = useLocale() === "ar";
  // Your own face in the corner, not a generic silhouette.
  const [face, setFace] = useState<string | null>(null);
  useEffect(() => onAuthStateChanged(auth, async u => {
    if (!u) { setFace(null); return; }
    try {
      const snap = await getDoc(doc(db, "user", u.uid));
      setFace(resolveAvatar(snap.data()?.avatar));
    } catch { setFace(null); }
  }), []);
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const active = TABS.map(t => t.href)
    .filter(h => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const switchLocale = () => {
    document.cookie = `locale=${isAR ? "en" : "ar"}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 60,
      background: "rgba(252,246,234,.92)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${hue.tint}`,
    }}>
      <div style={{
        maxWidth: 1180, margin: "0 auto",
        padding: "0 clamp(16px,4vw,34px)", height: 68,
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <Mark active={active} />
          <span style={{
            fontFamily: display(isAR), fontSize: isAR ? 18 : 16, fontWeight: 900,
            letterSpacing: isAR ? 0 : "0.08em",
            textTransform: isAR ? "none" : "uppercase", color: M.heading,
          }}>
            {isAR ? "مجلس" : "Majlis"}
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "clamp(4px,1.4vw,10px)", flex: 1, minWidth: 0, overflowX: "auto" }}>
          {TABS.map(tab => {
            const on = tab.href === active;
            const h = ROOM[tab.href] ?? HUES.gold;
            return (
              <Link key={tab.href} href={tab.href} style={{ textDecoration: "none", position: "relative", flexShrink: 0 }}>
                <span style={{
                  display: "block", padding: "9px 15px", borderRadius: R.pill,
                  fontFamily: display(isAR), fontSize: isAR ? 15.5 : 14, fontWeight: 800,
                  color: on ? h.deep : M.body, whiteSpace: "nowrap", position: "relative", zIndex: 1,
                }}>
                  {isAR ? tab.ar : tab.en}
                </span>
                {on && (
                  <motion.span
                    layoutId="room"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                    style={{
                      position: "absolute", inset: 0, borderRadius: R.pill,
                      background: h.tint, display: "block",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button onClick={switchLocale} aria-label={isAR ? "English" : "العربية"} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          minHeight: 40, padding: "0 13px", cursor: "pointer",
          background: "transparent", border: `1px solid rgba(42,35,28,.12)`,
          borderRadius: R.pill, color: M.body,
          fontFamily: mono, fontSize: 11, letterSpacing: "0.08em", flexShrink: 0,
        }}>
          <Globe size={14} />{isAR ? "EN" : "AR"}
        </button>

        <Link href="/account" aria-label={isAR ? "حسابي" : "My account"} style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          border: `2px solid ${hue.soft}`, background: M.card,
          display: "grid", placeItems: "center", color: hue.deep, textDecoration: "none",
          overflow: "hidden", padding: 0,
        }}>
          {face
            ? <img src={face} alt="" width={44} height={44}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <User size={19} strokeWidth={2} />}
        </Link>
      </div>
    </header>
  );
}

export function InnovationPage({ children }: { children: React.ReactNode }) {
  const isAR = useLocale() === "ar";
  const pathname = usePathname();
  const hue = roomFor(pathname);

  // the movement preference is a class on the document, applied on every load
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("mj-prefs") ?? "{}");
      document.documentElement.classList.toggle("mj-still", p.motion === false);
    } catch { /* private mode */ }
  }, []);

  return (
    <div style={{
      position: "relative", minHeight: "100vh", background: M.page,
      fontFamily: display(isAR), color: M.body,
      direction: isAR ? "rtl" : "ltr",
      fontSize: 16,
    }}>
      <Blobs hue={hue} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <InnovationHeader hue={hue} />
        <main style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(26px,4vw,44px) clamp(16px,4vw,34px) 110px" }}>
          {children}
        </main>
      </div>
      <Notepad hue={hue} />
      <HamadCorner hue={hue} />
    </div>
  );
}
