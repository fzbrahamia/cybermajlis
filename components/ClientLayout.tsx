"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Chatbot from "@/components/Chatbot";
import Navbar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import Modal from "@/components/Modal";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useTranslations } from "next-intl";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("SessionTimeout");

  // "/" is Majlis, the parent brand one level above CyberMajlis. It carries its
  // own header and footer (components/majlis/MajlisChrome.tsx), so suppress ours.
  //
  // The innovation track sits at the same level: the five moves are the method,
  // and the method belongs to the company rather than to any one majlis. Those
  // routes carry components/innovation/InnovationChrome.tsx instead.
  // The account is shared across all three majalis, so the door and the
  // account pages belong to Majlis too. They were rendering the CyberMajlis
  // navbar and footer, which made signing in look like entering CyberMajlis.
  // Majlis has its own door at /enter and its own account at /account.
  // /auth, /profile and /settings belong to CyberMajlis, chrome and all.
  const MAJLIS_LEVEL = [
    "/learn", "/board", "/latest", "/mine", "/account", "/enter",
  ];
  const isMajlisRoot =
    pathname === "/" ||
    MAJLIS_LEVEL.some(p => pathname === p || pathname.startsWith(p + "/"));
  // Quantum Majlis is a different majlis, not part of the CyberMajlis site.
  // It carries its own header and footer (components/quantum/QuantumChrome.tsx).
  const isQuantum = pathname.startsWith("/quantum");
  // The CyberMajlis landing renders its own <Footer /> inline.
  const isCyberLanding = pathname === "/cybermajlis";
  const isMainOrAuthPage = isCyberLanding || pathname.startsWith("/auth");
  const isSocPage = pathname.startsWith("/soc");
  const isCalmPage = pathname.startsWith("/calm");
  // The DIY "room" page (the interactive majlis picture) runs full-screen like SOC — just the image + a back button.
  const isDiyRoom = pathname === "/dashboard/do-it-yourself";
  const showFooter = !isMainOrAuthPage && !isSocPage && !isCalmPage && !isDiyRoom && !isMajlisRoot && !isQuantum;
  const hideChatbot = isSocPage || isCalmPage || isDiyRoom || isMajlisRoot || isQuantum;

  const isLoggedIn = !isMainOrAuthPage && !hideChatbot;

  const { showWarning, stayLoggedIn, logOutNow } = useSessionTimeout();

  useEffect(() => {
    if (hideChatbot) {
      const cleanup = () => {
        document.querySelectorAll(
          '[id*="chatbase"], [class*="chatbase"], iframe[src*="chatbase"], iframe[src*="chatbase.co"]'
        ).forEach(el => el.remove());

        const script = document.getElementById("2dhXxK-TRHQhngtvnjxnk");
        if (script) script.remove();

        if (window.chatbase) delete (window as any).chatbase;
      };

      cleanup();
      const t = setTimeout(cleanup, 500);
      return () => clearTimeout(t);
    }
  }, [hideChatbot]);

  return (
    <>
      {!isSocPage && !isCalmPage && !isDiyRoom && !isMajlisRoot && !isQuantum && <Navbar />}
      {!hideChatbot && <Chatbot isLoggedIn={isLoggedIn} />}
      <div>{children}</div>
      {showFooter && <Footer />}
      <Modal
        isOpen={showWarning}
        title={t("warning_title")}
        message={t("warning_msg")}
        onClose={stayLoggedIn}
        onConfirm={logOutNow}
        confirmText={t("logout_btn")}
        closeText={t("stay_btn")}
      />
    </>
  );
}
