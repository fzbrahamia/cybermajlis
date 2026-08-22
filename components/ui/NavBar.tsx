"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MajlisMark } from "@/components/majlis/MajlisChrome";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from "firebase/firestore";
import Modal from "@/components/Modal";
import { useTranslations, useLocale } from "next-intl";
import { DirectionProvider } from "@radix-ui/react-direction";
import { resolveAvatar } from "@/app/lib/avatars";

declare global {
  interface Window { chatbase: any; }
}

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
  window.location.reload();
}

const NAV_LINK_KEYS = [
  { key: "dashboard",   href: "/dashboard"   },
  { key: "diy",         href: "/dashboard/do-it-yourself" },
  { key: "soc",         href: "/soc"         },
  { key: "ctf",         href: "/ctf"         },
  { key: "scanner",     href: "/scan"        },
  { key: "news",        href: "/news"        },
  { key: "community",   href: "/community"   },
];

export default function Navbar() {
  const t = useTranslations("Hub.navbar");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname.startsWith("/auth");
  // Longest matching nav href wins, so a nested page highlights its own link.
  const activeHref = NAV_LINK_KEYS
    .map(l => l.href)
    .filter(h => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];
  // Light theme is scoped to the landing page for now; the rest of the site keeps
  // the dark maroon navbar until we roll the new look out.
  // light theme now covers the landing + dashboard as we roll the new look out
  const isLanding = pathname === "/cybermajlis" || pathname.startsWith("/dashboard") || pathname.startsWith("/auth") || pathname.startsWith("/simulations") || pathname.startsWith("/ctf") || pathname.startsWith("/scan") || pathname.startsWith("/news") || pathname.startsWith("/community") || pathname.startsWith("/profile") || pathname.startsWith("/settings");

  const navBg = isLanding
    ? "rgba(251,248,243,0.82)"
    : "linear-gradient(135deg, #3e1316 0%, #632024 60%, #7a1e22 100%)";
  const navBorder = isLanding ? "rgba(99,32,36,.12)" : "rgba(197,165,126,.15)";
  const navShadow = isLanding ? "0 2px 20px rgba(99,32,36,.07)" : "0 2px 20px rgba(62,19,22,.4)";
  const linkColor = isLanding ? "rgba(74,26,29,.72)" : "rgba(227,218,201,0.85)";
  const linkActiveColor = isLanding ? "#8B2635" : "#E8D4BC";
  const linkActiveBorder = isLanding ? "rgba(139,38,53,.55)" : "rgba(197,165,126,.7)";
  const pillTrackBg = isLanding ? "rgba(99,32,36,0.05)" : "rgba(255,255,255,0.07)";
  const pillTrackBorder = isLanding ? "rgba(99,32,36,0.16)" : "rgba(197,165,126,0.18)";
  const pillActiveText = isLanding ? "#7a1e22" : "#E3DAC9";
  const pillIdleText = isLanding ? "rgba(74,26,29,0.4)" : "rgba(227,218,201,0.42)";
  const usernameColor = isLanding ? "#7a1e22" : "#D5B893";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean; title: string; message: string;
    onConfirm?: () => void; confirmText?: string;
  }>({ isOpen: false, title: "", message: "" });

  const showModal = (title: string, message: string, onConfirm?: () => void, confirmText?: string) =>
    setModal({ isOpen: true, title, message, onConfirm, confirmText });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }
      if (user) {
        setCurrentUser(user);
        setUserEmail(user.email || "");
        const userRef = doc(db, "user", user.uid);
        unsubscribeDoc = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUsername(snap.data().username || "User");
            setUserAvatar(resolveAvatar(snap.data().avatar));
          }
        });
      } else {
        setCurrentUser(null);
        setUsername("");
        setUserEmail("");
      }
    });
    return () => {
      unsubscribe();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const handleHelpClick = async () => {
    // Opens our own assistant (components/Chatbot.tsx), the same way the footer
    // and the landing page do. The old third-party chatbase widget is gone, so
    // checking window.chatbase here only ever showed the "loading" modal.
    window.dispatchEvent(new Event("cm:open-chat"));
    if (currentUser) {
      const interactionData = {
        userId: currentUser.uid,
        message: "session_start",
        timestamp: serverTimestamp(),
      };
      await Promise.all([
        addDoc(collection(db, "chatbotInteraction"), interactionData),
        addDoc(collection(db, "user", currentUser.uid, "chatbotInteractions"), interactionData),
      ]).catch(() => {});
    }
  };

  const handleConfirmLogout = async () => {
    try {
      await firebaseSignOut(auth);
      setOpenDialog(false);
      router.push("/cybermajlis");
    } catch (error) {
      console.error("Error signing out:", error);
      showModal(t("logout_failed_title"), t("logout_failed_message"));
    }
  };

  const menuItems = [
    { icon: User,       label: t("profile"),  action: () => router.push("/profile")  },
    { icon: Settings,   label: t("settings"), action: () => router.push("/settings") },
    { icon: HelpCircle, label: t("help"),     action: handleHelpClick                },
  ];

  const navLinkStyle: React.CSSProperties = {
    fontFamily: "var(--ui)",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 600,
    color: linkColor,
    textDecoration: "none",
    cursor: "pointer",
  };

  const btnSmStyle: React.CSSProperties = {
    fontFamily: "var(--ui)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    padding: "9px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    color: isLanding ? "#FBF8F3" : "#3e1316",
    background: isLanding
      ? "linear-gradient(135deg, #7a1e22, #8B2635)"
      : "linear-gradient(135deg, #e8d4bc, #c5a57e)",
    boxShadow: isLanding ? "0 4px 16px rgba(99,32,36,.22)" : "0 2px 12px rgba(197,165,126,.35)",
    transition: "all .25s ease",
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, width: "100%", zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 56px",
        borderBottom: `1px solid ${navBorder}`,
        background: navBg,
        backdropFilter: "blur(8px)",
        boxShadow: navShadow,
      }}>
        {/* Brand */}
        <a
          href={currentUser ? "/dashboard" : "/cybermajlis"}
          style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}
          aria-label="CyberMajlis home"
        >
          <MajlisMark size={20} here="cyber" />

          {isLanding ? (
            <span style={{ fontFamily: "var(--ui)", fontWeight: 900, fontSize: isArabic ? 21 : 23, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
              {isArabic ? (
                <span style={{ fontFamily: "var(--font-arabic), var(--ui)", color: "#7a1e22" }}>المجلس السيبراني</span>
              ) : (
                <><span style={{ color: "#3e1316" }}>Cyber</span><span style={{ color: "#8B2635" }}> Majlis</span></>
              )}
            </span>
          ) : (
            <img
              src={isArabic ? "/logoAr.png" : "/logoEn.png"}
              alt="CyberMajlis"
              style={{ height: 40, width: "auto" }}
            />
          )}
        </a>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 40 }}>
          {NAV_LINK_KEYS.map(({ key, href }) => {
            const resolvedHref = key === "dashboard" && !currentUser ? "/auth" : href;
            // DIY sits under /dashboard, so a plain startsWith would light up both.
            // The active link is the deepest one the path actually sits inside.
            const isActive = href === activeHref;
            return (
              <a
                key={key}
                href={resolvedHref}
                style={{
                  ...navLinkStyle,
                  ...(isActive
                    ? { color: linkActiveColor, borderBottom: `1.5px solid ${linkActiveBorder}`, paddingBottom: 4 }
                    : {}),
                }}
              >
                {t(`nav_links.${key}`)}
              </a>
            );
          })}
        </div>

        {/* Auth + locale */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Up to Majlis. Quantum keeps it here too, beside language. */}
          <a
            href="/"
            title={isArabic ? "العودة إلى المجلس" : "Back to Majlis"}
            style={{
              textDecoration: "none",
              fontFamily: "var(--ui)",
              fontSize: 11, fontWeight: 800, letterSpacing: "0.12em",
              color: isLanding ? "rgba(90,45,40,.7)" : "rgba(232,212,188,.7)",
              padding: "7px 14px", borderRadius: 99,
              border: `1px solid ${isLanding ? "rgba(99,32,36,.18)" : "rgba(197,165,126,.28)"}`,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            <MajlisMark size={14} />
            {isArabic ? "المجلس" : "MAJLIS"}
          </a>

          {/* EN / AR pill toggle */}
          <div
            suppressHydrationWarning
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              background: pillTrackBg,
              borderRadius: 999,
              padding: "3px",
              direction: "ltr",
              border: `1px solid ${pillTrackBorder}`,
              gap: 0,
            }}
          >
            {/* Sliding pill indicator */}
            <span
              suppressHydrationWarning
              aria-hidden
              style={{
                position: "absolute",
                top: 3,
                bottom: 3,
                left: isArabic ? "calc(50% - 1.5px)" : "3px",
                width: "calc(50% - 3px)",
                borderRadius: 999,
                background: isLanding
                  ? "linear-gradient(135deg, rgba(139,38,53,0.14), rgba(99,32,36,0.10))"
                  : "linear-gradient(135deg, rgba(227,218,201,0.22), rgba(197,165,126,0.18))",
                border: `1px solid ${isLanding ? "rgba(139,38,53,0.30)" : "rgba(197,165,126,0.35)"}`,
                transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
                pointerEvents: "none",
              }}
            />
            <button
              onClick={() => isArabic && setLocaleCookie("en")}
              suppressHydrationWarning
              style={{
                position: "relative", zIndex: 1,
                fontFamily: "var(--ui)",
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
                padding: "5px 14px", borderRadius: 999, border: "none",
                background: "transparent",
                color: !isArabic ? pillActiveText : pillIdleText,
                cursor: isArabic ? "pointer" : "default",
                transition: "color 0.25s ease",
                whiteSpace: "nowrap",
              }}
            >
              EN
            </button>
            <button
              onClick={() => !isArabic && setLocaleCookie("ar")}
              suppressHydrationWarning
              style={{
                position: "relative", zIndex: 1,
                fontFamily: "var(--ui)",
                fontSize: "0.8rem", fontWeight: 600,
                padding: "5px 14px", borderRadius: 999, border: "none",
                background: "transparent",
                color: isArabic ? pillActiveText : pillIdleText,
                cursor: !isArabic ? "pointer" : "default",
                transition: "color 0.25s ease",
                whiteSpace: "nowrap",
              }}
            >
              عربي
            </button>
          </div>

          {/* Auth section */}
          {!currentUser ? (
            <>
              <a href="/auth" style={{ ...navLinkStyle }}>
                {t("login")}
              </a>
              <button
                onClick={() => router.push("/auth?signup=true")}
                style={btnSmStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(99,32,36,.35)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(197,165,126,.35)";
                }}
              >
                {t("signup")}
              </button>
            </>
          ) : isAuthPage ? (
            <button onClick={() => router.push("/dashboard")} style={btnSmStyle}>
              {t("dashboard")}
            </button>
          ) : (
            <DirectionProvider dir={isArabic ? "rtl" : "ltr"}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div
                      className="flex items-center justify-center overflow-hidden"
                      style={{
                        width: 36, height: 42, borderRadius: "50%",
                        background: "linear-gradient(135deg, #D5B893, #c5a57e)",
                        border: "2px solid rgba(197,165,126,0.4)",
                        color: "#632024", fontFamily: "var(--ui)",
                        fontWeight: 700, fontSize: "0.9rem", flexShrink: 0,
                      }}
                    >
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt="avatar"
                          className="w-full h-full object-cover rounded-full"
                          onError={() => setUserAvatar("")}
                        />
                      ) : (
                        username.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <span style={{
                      fontFamily: "var(--ui)", fontSize: "0.78rem",
                      fontWeight: 600, letterSpacing: "0.04em", color: usernameColor,
                    }}>
                      {username}
                    </span>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end" sideOffset={20}
                  className="w-56 p-0 overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)",
                    border: "1px solid rgba(99,32,36,0.10)",
                    borderRadius: 16,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), 0 2px 6px rgba(58,44,28,.06), 0 18px 44px rgba(58,44,28,.12)",
                    zIndex: 9999,
                  }}
                >
                  <div style={{ height: 2, background: "linear-gradient(90deg, #c5a57e, rgba(197,165,126,0.15))" }} />

                  <DropdownMenuLabel className="font-normal" style={{ padding: "12px 18px" }}>
                    <div className="flex flex-col gap-0.5">
                      <p style={{ fontFamily: "var(--ui)", fontSize: "0.8rem", fontWeight: 700, color: "#4a1a1d", letterSpacing: "0.04em" }}>
                        {username}
                      </p>
                      <p style={{ fontFamily: "var(--ui)", fontSize: "0.82rem", color: "rgba(106,70,64,0.75)", fontStyle: "italic" }}>
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator style={{ background: "rgba(99,32,36,0.10)", margin: 0 }} />

                  <div style={{ padding: "4px 0" }}>
                    {menuItems.map(({ icon: Icon, label, action }) => (
                      <DropdownMenuItem
                        key={label}
                        onClick={action}
                        className="cursor-pointer focus:bg-transparent"
                        style={{
                          fontFamily: "var(--ui)", fontSize: "0.75rem",
                          fontWeight: 600, letterSpacing: "0.05em",
                          color: "#5a2d28",
                          padding: "10px 18px", gap: 12,
                          display: "flex", alignItems: "center",
                          background: "transparent", border: "none",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,32,36,0.055)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <Icon size={15} style={{ color: "#8B2635", flexShrink: 0 }} />
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator style={{ background: "rgba(99,32,36,0.10)", margin: 0 }} />

                  <div style={{ padding: "4px 0" }}>
                    <DropdownMenuItem
                      onClick={() => setOpenDialog(true)}
                      className="cursor-pointer focus:bg-transparent"
                      style={{
                        fontFamily: "var(--ui)", fontSize: "0.75rem",
                        fontWeight: 600, letterSpacing: "0.05em",
                        color: "rgba(90,45,40,0.62)",
                        padding: "10px 18px", gap: 12,
                        display: "flex", alignItems: "center",
                        background: "transparent", border: "none",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,32,36,0.045)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={15} style={{ color: "rgba(139,38,53,0.55)", flexShrink: 0 }} />
                      {t("logout")}
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </DirectionProvider>
          )}
        </div>
      </nav>

      {/* Logout confirmation dialog */}
      {/* Logout confirmation. Uses the shared Modal so it stays on theme;
          this used to be a hand-rolled dark maroon copy of it. */}
      <Modal
        isOpen={openDialog}
        title={t("logout_dialog.title")}
        message={t("logout_dialog.message")}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirmLogout}
        confirmText={t("logout_dialog.confirm")}
        closeText={t("logout_dialog.cancel")}
      />

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
      />
    </>
  );
}
