"use client";

import { useTranslations } from "next-intl";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  closeText?: string;
}

export default function Modal({
  isOpen, title, message, onClose, onConfirm,
  confirmText, closeText,
}: ModalProps) {
  const t = useTranslations("Modal");

  // Fall back to translated defaults if the caller didn't pass explicit text
  const resolvedConfirm = confirmText ?? t("default_confirm");
  const resolvedClose   = closeText   ?? t("default_close");

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #3e1316 0%, #632024 60%, #7a1e22 100%)",
        borderRadius: 20, padding: "2rem 2.2rem",
        width: "100%", maxWidth: 380,
        position: "relative", overflow: "hidden",
        boxShadow: "0 24px 64px rgba(62,19,22,0.45), inset 0 2px 0 rgba(255,255,255,0.07)",
        border: "1px solid rgba(197,165,126,0.15)",
      }}>
        {/* Top stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #c5a57e, rgba(197,165,126,0.2))" }} />

        {/* Ornament */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />

        {/* Title */}
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", fontWeight: 700, color: "#E8D4BC", letterSpacing: "0.05em", marginBottom: "0.8rem", position: "relative", zIndex: 1 }}>
          {title}
        </h2>

        {/* Divider */}
        <div style={{ height: 1, width: 40, background: "linear-gradient(90deg, #c5a57e, transparent)", marginBottom: "1rem" }} />

        {/* Message */}
        <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "0.98rem", lineHeight: 1.65, color: "rgba(227,218,201,0.8)", fontWeight: 300, marginBottom: "1.6rem", position: "relative", zIndex: 1 }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", position: "relative", zIndex: 1 }}>
          {onConfirm && (
            <button onClick={onConfirm} style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, padding: "0.6rem 1.3rem", borderRadius: 10, border: "none", background: "#c5a57e", color: "#3e1316", cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              {resolvedConfirm}
            </button>
          )}
          <button onClick={onClose} style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, padding: "0.6rem 1.3rem", borderRadius: 10, border: "1px solid rgba(227,218,201,0.25)", background: "transparent", color: "rgba(227,218,201,0.75)", cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            {resolvedClose}
          </button>
        </div>
      </div>
    </div>
  );
}