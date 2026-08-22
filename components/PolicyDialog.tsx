"use client";

// ============================================================
// PRIVACY POLICY — the popup
//
// One policy, opened from any majlis. This sheet is its only home: the text
// lives in app/lib/policy.ts and is read here and nowhere else. It takes its
// accent from wherever it was opened, so it belongs to that majlis without
// becoming a different document.
//
//   <PolicyDialog accent="#7A1E22" />   CyberMajlis
//   <PolicyDialog accent="#1B6B4C" />   Quantum
//   <PolicyDialog accent="#8F6A38" />   Majlis
// ============================================================

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import { POLICY, POLICY_UPDATED } from "@/app/lib/policy";

export default function PolicyDialog({
  accent,
  label,
  triggerStyle,
}: {
  /** The majlis this is being opened from. Colours the heading and the rules. */
  accent: string;
  /** Override the trigger text; defaults to "Privacy". */
  label?: string;
  triggerStyle?: React.CSSProperties;
}) {
  const isAR = useLocale() === "ar";
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Escape closes it, and the page behind must not scroll under the sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const trigger = (
    <button
      onClick={() => setOpen(true)}
      style={{
        background: "none", border: "none", padding: 0, cursor: "pointer",
        font: "inherit", color: "inherit", textDecoration: "underline",
        textUnderlineOffset: 3, ...triggerStyle,
      }}
    >
      {label ?? (isAR ? "الخصوصية" : "Privacy")}
    </button>
  );

  if (!mounted || !open) return trigger;

  const sheet = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAR ? "سياسة الخصوصية" : "Privacy policy"}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(12px, 4vw, 40px)",
        background: "rgba(20, 16, 12, .55)", backdropFilter: "blur(6px)",
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{
          width: "min(760px, 100%)", maxHeight: "min(86vh, 900px)",
          display: "flex", flexDirection: "column", outline: "none",
          background: "#FFFDF8", borderRadius: 22, overflow: "hidden",
          boxShadow: "0 30px 80px rgba(20,16,12,.35)",
          direction: isAR ? "rtl" : "ltr",
        }}
      >
        {/* the one line that changes per majlis */}
        <div aria-hidden style={{ height: 3, background: accent }} />

        <header style={{
          display: "flex", alignItems: "flex-start", gap: 16,
          padding: "20px 22px 16px", borderBottom: "1px solid rgba(42,35,28,.10)",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              margin: "0 0 4px", fontSize: 20, fontWeight: 800,
              letterSpacing: "-0.01em", color: accent,
              fontFamily: isAR ? "var(--ui)" : "inherit",
            }}>
              {isAR ? "سياسة الخصوصية" : "Privacy Policy"}
            </h2>
            <p style={{ margin: 0, fontSize: 12.5, color: "rgba(42,35,28,.6)" }}>
              {isAR
                ? `سياسة واحدة لكل المجالس · آخر تحديث ${POLICY_UPDATED}`
                : `One policy for every majlis · last updated ${POLICY_UPDATED}`}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label={isAR ? "إغلاق" : "Close"}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
              display: "grid", placeItems: "center",
              background: "rgba(42,35,28,.06)", border: "none", color: "rgba(42,35,28,.7)",
            }}
          >
            <X size={16} />
          </button>
        </header>

        <div style={{ overflowY: "auto", padding: "18px 22px 26px" }}>
          {POLICY.map((s, i) => (
            <section key={i} style={{ marginBottom: 22 }}>
              <h3 style={{
                margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: "#2A231C",
                fontFamily: isAR ? "var(--ui)" : "inherit",
              }}>
                {isAR ? s.tAr : s.t}
              </h3>
              {(isAR ? s.bodyAr : s.body).map((part, j) =>
                Array.isArray(part) ? (
                  <ul key={j} style={{ margin: "8px 0", paddingInlineStart: 20 }}>
                    {part.map((li, k) => (
                      <li key={k} style={{
                        marginBottom: 6, fontSize: 14.5, lineHeight: 1.65, color: "rgba(42,35,28,.82)",
                      }}>
                        {li}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={j} style={{
                    margin: "0 0 8px", fontSize: 14.5, lineHeight: 1.7, color: "rgba(42,35,28,.82)",
                  }}>
                    {part}
                  </p>
                ),
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {trigger}
      {createPortal(sheet, document.body)}
    </>
  );
}
