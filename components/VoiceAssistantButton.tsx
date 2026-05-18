"use client";

import { useEffect, useState } from "react";

export default function VoiceAssistantButton() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechLang, setSpeechLang] = useState<"ar-QA" | "en-US">("ar-QA");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);

      const preferredVoice =
        allVoices.find(v => v.lang.startsWith("ar")) ||
        allVoices.find(v => v.lang.startsWith("en")) ||
        allVoices[0];

      if (preferredVoice && !selectedVoice) {
        setSelectedVoice(preferredVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  const speak = (text: string) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const isArabic = /[\u0600-\u06FF]/.test(text);
    utterance.lang = isArabic ? "ar-QA" : "en-US";

    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInteraction = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.continuous = false;

    setListening(true);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: transcript,
              },
            ],
            context: {
              reports: "",
              news: "",
            },
          }),
        });

        const data = await res.json();
        speak(data.reply);
      } catch {
        speak(
          speechLang === "ar-QA"
            ? "حدثت مشكلة في الاتصال. حاول مرة أخرى."
            : "Connection issue. Please try again."
        );
      }
    };

    recognition.onerror = () => {
      setListening(false);
      speak(
        speechLang === "ar-QA"
          ? "لم أستطع سماعك بوضوح. حاول مرة أخرى."
          : "I could not hear you clearly. Please try again."
      );
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      <button
        onClick={startVoiceInteraction}
        disabled={listening || speaking}
        aria-label="Start voice interaction with Hamad"
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "2.5px solid #632024",
          background: listening ? "#22c55e" : speaking ? "#c5a57e" : "white",
          color: "#632024",
          fontSize: 24,
          cursor: listening || speaking ? "default" : "pointer",
          boxShadow: "0 4px 20px rgba(99,32,36,0.35)",
        }}
      >
        {listening ? "🎧" : speaking ? "🔊" : "🎙️"}
      </button>

      <select
        value={speechLang}
        onChange={e => setSpeechLang(e.target.value as "ar-QA" | "en-US")}
        style={{
          padding: "6px 10px",
          borderRadius: 12,
          border: "1px solid rgba(99,32,36,0.25)",
          color: "#632024",
          background: "white",
          fontSize: 12,
        }}
      >
        <option value="ar-QA">Arabic</option>
        <option value="en-US">English</option>
      </select>

      <select
        value={selectedVoice}
        onChange={e => setSelectedVoice(e.target.value)}
        style={{
          maxWidth: 180,
          padding: "6px 10px",
          borderRadius: 12,
          border: "1px solid rgba(99,32,36,0.25)",
          color: "#632024",
          background: "white",
          fontSize: 12,
        }}
      >
        {voices.map(voice => (
          <option key={voice.name} value={voice.name}>
            {voice.name} - {voice.lang}
          </option>
        ))}
      </select>
    </div>
  );
}