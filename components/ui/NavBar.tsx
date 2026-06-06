"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

declare global {
  interface Window { chatbase: any; }
}

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
  window.location.reload();
}

const NAV_LINK_KEYS = [
  { key: "dashboard", href: "/dashboard" },
  { key: "community", href: "/community" },
  { key: "games",     href: "/games"     },
  { key: "news",      href: "/news"      },
  { key: "scanner",   href: "/scan"      },
  { key: "soc",       href: "/soc"       },
];

export default function Navbar() {
  const t = useTranslations("Hub.navbar");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname.startsWith("/auth");

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
            setUserAvatar(snap.data().avatar || "");
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
    if (window.chatbase) {
      window.chatbase("open");
    } else {
      showModal(t("chatbot_loading_title"), t("chatbot_loading_message"));
    }
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
      router.push("/");
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
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 600,
    color: "rgba(227,218,201,0.85)",
    textDecoration: "none",
    cursor: "pointer",
  };

  const btnSmStyle: React.CSSProperties = {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    padding: "9px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    color: "#3e1316",
    background: "linear-gradient(135deg, #e8d4bc, #c5a57e)",
    boxShadow: "0 2px 12px rgba(197,165,126,.35)",
    transition: "all .25s ease",
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, width: "100%", zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 56px",
        borderBottom: "1px solid rgba(197,165,126,.15)",
        background: "linear-gradient(135deg, #3e1316 0%, #632024 60%, #7a1e22 100%)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 20px rgba(62,19,22,.4)",
      }}>
        {/* Brand */}
        <a
          href={currentUser ? "/dashboard" : "/"}
          style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          aria-label="CyberMajlis home"
        >
          <img
            src={isArabic ? "/logoAr.png" : "/logoEn.png"}
            alt="CyberMajlis"
            style={{ height: 40, width: "auto" }}
          />
        </a>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 40 }}>
          {NAV_LINK_KEYS.map(({ key, href }) => {
            const resolvedHref = key === "dashboard" && !currentUser ? "/auth" : href;
            return (
              <a
                key={key}
                href={resolvedHref}
                style={{
                  ...navLinkStyle,
                  ...(pathname.startsWith(href)
                    ? { color: "#E8D4BC", borderBottom: "1.5px solid rgba(197,165,126,.7)", paddingBottom: 4 }
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
          {/* EN / AR sliding toggle */}
          <div
            className="relative flex rounded-[10px] p-[3px]"
            style={{ background: "rgba(255,255,255,0.12)", width: 110, direction: "ltr" }}
          >
            <div
              className="absolute top-[3px] bottom-[3px] rounded-[8px] transition-transform duration-300 ease-in-out"
              style={{
                background: "#E3DAC9",
                width: "calc(50% - 3px)",
                left: "3px",
                transform: isArabic ? "translateX(100%)" : "translateX(0)",
              }}
            />
            <button
              onClick={() => !isArabic || setLocaleCookie("en")}
              suppressHydrationWarning
              className="relative z-10 w-1/2 py-[7px] rounded-[8px] transition-all duration-300"
              style={{
                fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600,
                color: !isArabic ? "#632024" : "rgba(227,218,201,0.7)",
                cursor: !isArabic ? "default" : "pointer",
                border: "none", background: "transparent",
              }}
            >
              EN
            </button>
            <button
              onClick={() => isArabic || setLocaleCookie("ar")}
              suppressHydrationWarning
              className="relative z-10 w-1/2 py-[7px] rounded-[8px] transition-all duration-300"
              style={{
                fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600,
                color: isArabic ? "#632024" : "rgba(227,218,201,0.7)",
                cursor: isArabic ? "default" : "pointer",
                border: "none", background: "transparent",
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
                        color: "#632024", fontFamily: "'Cinzel', serif",
                        fontWeight: 700, fontSize: "0.9rem", flexShrink: 0,
                      }}
                    >
                      {userAvatar ? (
                        <img src={userAvatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        username.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <span style={{
                      fontFamily: "'Cinzel', serif", fontSize: "0.78rem",
                      fontWeight: 600, letterSpacing: "0.04em", color: "#D5B893",
                    }}>
                      {username}
                    </span>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end" sideOffset={20}
                  className="w-56 p-0 overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, #3e1316 0%, #5a1c20 100%)",
                    border: "1px solid rgba(197,165,126,0.2)",
                    borderRadius: 14,
                    boxShadow: "0 16px 48px rgba(62,19,22,0.5)",
                    zIndex: 9999,
                  }}
                >
                  <div style={{ height: 2, background: "linear-gradient(90deg, #c5a57e, rgba(197,165,126,0.1))" }} />

                  <DropdownMenuLabel className="font-normal" style={{ padding: "12px 18px" }}>
                    <div className="flex flex-col gap-0.5">
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.8rem", fontWeight: 700, color: "#E8D4BC", letterSpacing: "0.04em" }}>
                        {username}
                      </p>
                      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.82rem", color: "rgba(197,165,126,0.65)", fontStyle: "italic" }}>
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator style={{ background: "rgba(197,165,126,0.15)", margin: 0 }} />

                  <div style={{ padding: "4px 0" }}>
                    {menuItems.map(({ icon: Icon, label, action }) => (
                      <DropdownMenuItem
                        key={label}
                        onClick={action}
                        className="cursor-pointer focus:bg-transparent"
                        style={{
                          fontFamily: "'Cinzel', serif", fontSize: "0.75rem",
                          fontWeight: 600, letterSpacing: "0.05em",
                          color: "rgba(227,218,201,0.85)",
                          padding: "10px 18px", gap: 12,
                          display: "flex", alignItems: "center",
                          background: "transparent", border: "none",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(197,165,126,0.1)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <Icon size={15} style={{ color: "#c5a57e", flexShrink: 0 }} />
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator style={{ background: "rgba(197,165,126,0.15)", margin: 0 }} />

                  <div style={{ padding: "4px 0" }}>
                    <DropdownMenuItem
                      onClick={() => setOpenDialog(true)}
                      className="cursor-pointer focus:bg-transparent"
                      style={{
                        fontFamily: "'Cinzel', serif", fontSize: "0.75rem",
                        fontWeight: 600, letterSpacing: "0.05em",
                        color: "rgba(227,218,201,0.55)",
                        padding: "10px 18px", gap: 12,
                        display: "flex", alignItems: "center",
                        background: "transparent", border: "none",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(197,165,126,0.08)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={15} style={{ color: "rgba(197,165,126,0.45)", flexShrink: 0 }} />
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
      {openDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div style={{
            background: "linear-gradient(135deg, #3e1316 0%, #632024 60%, #7a1e22 100%)",
            borderRadius: 20, padding: "2rem 2.2rem",
            width: "100%", maxWidth: 380,
            position: "relative", overflow: "hidden",
            boxShadow: "0 24px 64px rgba(62,19,22,0.45), inset 0 2px 0 rgba(255,255,255,0.07)",
            border: "1px solid rgba(197,165,126,0.15)",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #c5a57e, rgba(197,165,126,0.2))" }} />
            <div style={{ position: "absolute", top: -50, right: -50, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />

            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", fontWeight: 700, color: "#E8D4BC", letterSpacing: "0.05em", marginBottom: "0.8rem", position: "relative", zIndex: 1 }}>
              {t("logout_dialog.title")}
            </h2>
            <div style={{ height: 1, width: 40, background: "linear-gradient(90deg, #c5a57e, transparent)", marginBottom: "1rem" }} />
            <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "0.98rem", lineHeight: 1.65, color: "rgba(227,218,201,0.8)", fontWeight: 300, marginBottom: "1.6rem", position: "relative", zIndex: 1 }}>
              {t("logout_dialog.message")}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", position: "relative", zIndex: 1 }}>
              <button
                onClick={handleConfirmLogout}
                style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, padding: "0.6rem 1.3rem", borderRadius: 10, border: "none", background: "#c5a57e", color: "#3e1316", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {t("logout_dialog.confirm")}
              </button>
              <button
                onClick={() => setOpenDialog(false)}
                style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, padding: "0.6rem 1.3rem", borderRadius: 10, border: "1px solid rgba(227,218,201,0.25)", background: "transparent", color: "rgba(227,218,201,0.75)", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {t("logout_dialog.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

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
