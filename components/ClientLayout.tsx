"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Chatbot from "@/components/Chatbot";
import Navbar from "@/components/ui/NavBar";
import Modal from "@/components/Modal";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useTranslations } from "next-intl";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("SessionTimeout");

  const isMainOrAuthPage = pathname === "/" || pathname.startsWith("/auth");
  const isGamesPage = pathname.startsWith("/games");
  const isSocPage = pathname.startsWith("/soc");
  const hideChatbot = isGamesPage || isSocPage;

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
      {!isGamesPage && !isSocPage && <Navbar />}
      {!hideChatbot && <Chatbot isLoggedIn={isLoggedIn} />}
      <div>{children}</div>
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


// "use client";

// import { usePathname } from "next/navigation";
// import Chatbot from "@/components/Chatbot";
// import Navbar from "@/components/ui/NavBar";

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();

//   const isMainOrAuthPage = pathname === "/" || pathname.startsWith("/auth");
//   const isGamesPage = pathname.startsWith("/games");
//   const isSocPage = pathname.startsWith("/soc");

//   const isLoggedIn = !isMainOrAuthPage && !isGamesPage && !isSocPage;

//   return (
//     <>
//       {!isGamesPage && !isSocPage && <Navbar />}
//       {!isGamesPage && !isSocPage && <Chatbot isLoggedIn={isLoggedIn} />}

//       <Chatbot isLoggedIn={isLoggedIn} />
//       <div>{children}</div>
//     </>
//   );
// }
