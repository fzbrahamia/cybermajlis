"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";

declare global {
  interface Window {
    chatbase: any;
  }
}

export default function Chatbot({ isLoggedIn }: { isLoggedIn: boolean }) {
  const t = useTranslations("Chatbot");
  


  useEffect(() => {
    if (isLoggedIn) {
      let currentUserId: string | null = null;

      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        currentUserId = user.uid;

        try {
          const interactionData = {
            userId: user.uid,
            message: "session_start",
            timestamp: serverTimestamp(),
          };
          await Promise.all([
            addDoc(collection(db, "chatbotInteraction"), interactionData),
            addDoc(collection(db, "user", user.uid, "chatbotInteractions"), interactionData),
          ]);
        } catch (err) {
          console.error("Failed to save chatbot interaction:", err);
        }
        unsubscribeAuth();
      });

      // Listen for messages posted by the Chatbase iframe
      const handleMessage = async (event: MessageEvent) => {
        // Log ALL postMessage events to debug Chatbase's format
        console.log("[Chatbase postMessage]", event.origin, event.data);

        if (!event.origin.includes("chatbase.co")) return;
        const data = event.data;
        if (!data || !currentUserId) return;

        const messageText =
          data.message ||
          data.userMessage ||
          data.text ||
          (typeof data === "string" ? data : null);

        if (!messageText || typeof messageText !== "string") return;

        try {
          const interactionData = {
            userId: currentUserId,
            message: messageText,
            timestamp: serverTimestamp(),
          };
          await Promise.all([
            addDoc(collection(db, "chatbotInteraction"), interactionData),
            addDoc(collection(db, "user", currentUserId, "chatbotInteractions"), interactionData),
          ]);
        } catch (err) {
          console.error("Failed to save chatbot message:", err);
        }
      };

      window.addEventListener("message", handleMessage);

      const saveMessage = async (messageText: string) => {
        if (!currentUserId || !messageText) return;
        try {
          const interactionData = {
            userId: currentUserId,
            message: messageText,
            timestamp: serverTimestamp(),
          };
          await Promise.all([
            addDoc(collection(db, "chatbotInteraction"), interactionData),
            addDoc(collection(db, "user", currentUserId, "chatbotInteractions"), interactionData),
          ]);
        } catch (err) {
          console.error("Failed to save chatbot message:", err);
        }
      };

      // Only load script if not already loaded
      if (!document.getElementById("2dhXxK-TRHQhngtvnjxnk")) {
        const script = document.createElement('script');
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = "2dhXxK-TRHQhngtvnjxnk";
        script.async = true;
        script.onload = () => {
          // Wrap window.chatbase after load to intercept all internal calls
          const original = window.chatbase;
          window.chatbase = (...args: any[]) => {
            console.log("[chatbase internal call]", args);
            // Detect user message events — log all args to identify the correct format
            const [event, ...rest] = args;
            if (
              typeof event === "string" &&
              (event.toLowerCase().includes("message") || event.toLowerCase().includes("user"))
            ) {
              const text = rest.find((a: any) => typeof a === "string");
              if (text) saveMessage(text);
            }
            return original?.(...args);
          };
          window.chatbase.q = original?.q;
        };
        document.body.appendChild(script);
      }

      // Pre-load queue for commands before script loads
      if (!window.chatbase) {
        window.chatbase = (...args: any[]) => {
          if (!window.chatbase.q) window.chatbase.q = [];
          window.chatbase.q.push(args);
        };
      }

      return () => {
        window.removeEventListener("message", handleMessage);
      };
    } else {
      // COMPLETE CLEANUP when logged out
      const script = document.getElementById("2dhXxK-TRHQhngtvnjxnk");
      if (script) {
        script.remove();
      }

      const chatbaseElements = document.querySelectorAll(
        '[id*="chatbase"], [class*="chatbase"], iframe[src*="chatbase"], iframe[src*="embed"]'
      );
      chatbaseElements.forEach(el => el.remove());

      if (window.chatbase) {
        delete window.chatbase;
      }
    }
  }, [isLoggedIn]);

  const handleChatOpen = () => {
    if (!isLoggedIn) {
      return;
    }
    
    if (window.chatbase) {
      window.chatbase('open');
    }
  };

  return (
    <>
      {/* Floating Chatbot Icon - Only for NON-logged-in users */}
      {!isLoggedIn && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <div className="relative group">
            <div className="hidden group-hover:flex absolute right-16 top-1/2 transform -translate-y-1/2 bg-[#D5B893] 
              text-[#632024] text-sm font-semibold px-4 py-2 rounded-lg shadow-md items-center justify-center
              whitespace-nowrap">
              {t("tooltip")}
            </div>
            
            <button
              onClick={handleChatOpen}
              className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#632024] shadow-lg transition 
              opacity-60 cursor-not-allowed"
            >
              <img src="/avatar.png" alt="Hamad" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}