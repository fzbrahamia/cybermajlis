"use client";
import { useState, useRef } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface Props {
  getText: () => string;
  lang?: string;
}

export default function TtsButton({ getText, lang = "en" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setState("idle");
  };

  const speak = async () => {
    if (state === "playing") { stop(); return; }
    const text = getText();
    if (!text) return;

    // Create Audio element synchronously inside the click handler to satisfy
    // browser autoplay policy — must happen before any await
    const audio = new Audio();
    audioRef.current = audio;

    setState("loading");
    try {
      const res = await fetch("/api/elder/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.onended = () => { URL.revokeObjectURL(url); setState("idle"); };
      audio.onerror = () => { URL.revokeObjectURL(url); setState("idle"); };
      setState("playing");
      await audio.play();
    } catch {
      audioRef.current = null;
      setState("idle");
    }
  };

  const label = lang === "ar"
    ? (state === "playing" ? "إيقاف القراءة" : "اقرأ لي")
    : (state === "playing" ? "Stop reading" : "Read this page aloud");

  return (
    <button
      onClick={speak}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        background: state === "playing"
          ? "linear-gradient(135deg, #632024, #8B2635)"
          : "linear-gradient(135deg, #3e1316, #632024)",
        color: "#E8D4BC",
        border: "1px solid rgba(197,165,126,0.45)",
        borderRadius: 999,
        padding: "0.75rem 1.4rem",
        fontSize: "1rem",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(62,19,22,0.25)",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      {state === "loading" ? (
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
      ) : state === "playing" ? (
        <VolumeX size={20} />
      ) : (
        <Volume2 size={20} />
      )}
      {label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
