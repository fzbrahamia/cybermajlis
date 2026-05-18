"use client";
import { useState, useRef, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

interface Message { role: "user" | "assistant"; content: string; }
type SpeechLang = "ar-QA" | "en-US";

const WELCOME = `مرحباً! I'm Hamad, your CyberMajlis guide 👋

I can help you with:
• Is a suspicious link or number safe?
• What the latest security news means for you
• What to do if you think you've been scammed
• How to use CyberMajlis features

What's on your mind?`;

const SUGGESTIONS = [
  { ar: true,  text: "هل هذا الرابط آمن؟ الرابط: " },
  { ar: false, text: "I got a suspicious message from this number: " },
  { ar: true,  text: "أظن أنني تعرضت للاختراق — " },
  { ar: false, text: "Explain this threat to me: " },
];

export default function Chatbot({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice interaction states
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);
  const [speechLang, setSpeechLang] = useState<SpeechLang>("en-US");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const speakReply = async (text: string) => {
    if (!text || typeof window === "undefined") return;

    try {
      setSpeaking(true);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS request failed");

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch {
      setSpeaking(false);
      const fallback = speechLang === "ar-QA"
        ? "حدثت مشكلة في تشغيل صوت حمد. تأكد من إعدادات ElevenLabs."
        : "Hamad voice could not play. Please check the ElevenLabs setup.";
      setMessages(prev => [...prev, { role: "assistant", content: fallback }]);
    }
  };

  const sendMessage = async (text?: string, speakAfterReply = false) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Fetch live context from Firestore
    let reports = "", news = "";
    try {
      const [rSnap, nSnap] = await Promise.all([
        getDocs(query(collection(db, "communityWarnings"), where("status","==","approved"), orderBy("createdAt","desc"), limit(10))),
        getDocs(query(collection(db, "securityNews"), orderBy("createdAt","desc"), limit(6))),
      ]);
      reports = rSnap.docs.map(d => {
        const r = d.data();
        return `[${r.type}] "${r.title}"${r.detail ? ` — ${r.detail}` : ""}: ${r.content?.slice(0,120)}`;
      }).join("\n");
      news = nSnap.docs.map(d => {
        const n = d.data();
        return `[${n.severity?.toUpperCase()}] ${n.headline}: ${n.what_happened?.slice(0,100)}`;
      }).join("\n");
    } catch { /* proceed without context if Firestore unavailable */ }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: { reports, news },
        }),
      });
      const data = await res.json();
      const assistantReply = data.reply || "Sorry, I could not generate a response.";
      setMessages(prev => [...prev, { role: "assistant", content: assistantReply }]);
      if (speakAfterReply) speakReply(assistantReply);
    } catch {
      const errorReply = speechLang === "ar-QA" ? "حدثت مشكلة في الاتصال — حاول مرة أخرى." : "Connection issue — please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: errorReply }]);
      if (speakAfterReply) speakReply(errorReply);
    }
    setLoading(false);
  };

  const startVoiceInteraction = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const unsupported = speechLang === "ar-QA"
        ? "التعرف على الصوت غير مدعوم في هذا المتصفح. جرب Google Chrome أو Microsoft Edge."
        : "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.";
      setMessages(prev => [...prev, { role: "assistant", content: unsupported }]);
      speakReply(unsupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.continuous = false;

    setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setListening(false);
      if (transcript.trim()) {
        sendMessage(transcript, true);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      const errorText = speechLang === "ar-QA"
        ? "لم أستطع سماعك بوضوح. حاول مرة أخرى."
        : "I could not hear you clearly. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: errorText }]);
      speakReply(errorText);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setSpeaking(false);
  };

  const toggleSpeechLanguage = () => {
    setSpeechLang(prev => (prev === "ar-QA" ? "en-US" : "ar-QA"));
  };

  const hasSuggestions = messages.length === 1;

  return (
    <>
      <style>{`
        @keyframes hamadSlideUp { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:none} }
        @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes blink { 0%,100%{opacity:.35} 50%{opacity:1} }
        .hamad-msg { animation: msgIn 0.25s ease both; }
        .hamad-window { animation: hamadSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
        .hamad-input:focus { outline:none; border-color:#632024 !important; }
        .hamad-input::placeholder { color:rgba(99,32,36,0.35); }
        .hamad-send:hover { background:#7a1e22 !important; }
        .hamad-suggest:hover { background:rgba(99,32,36,0.07) !important; border-color:rgba(99,32,36,0.3) !important; }
        .hamad-voice-btn:hover { transform:scale(1.05); }
      `}</style>

      {/* Floating button */}
      <div style={{ position:"fixed", bottom:24, right:24, zIndex:9000 }}>
        <button onClick={() => setOpen(o => !o)}
          style={{ width:56, height:56, borderRadius:"50%", border:"2.5px solid #632024", overflow:"hidden", cursor:"pointer", boxShadow:"0 4px 20px rgba(99,32,36,0.35)", transition:"transform .2s, box-shadow .2s", background:"white", padding:0 }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.08)";(e.currentTarget as HTMLElement).style.boxShadow="0 8px 28px rgba(99,32,36,0.45)";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";(e.currentTarget as HTMLElement).style.boxShadow="0 4px 20px rgba(99,32,36,0.35)";}}>
          <img src="/avatar.png" alt="Hamad" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        </button>
        {/* Unread dot */}
        {!open && (
          <div style={{ position:"absolute", top:2, right:2, width:12, height:12, borderRadius:"50%", background:"#22c55e", border:"2px solid white", animation:"blink 2s ease-in-out infinite" }} />
        )}
      </div>

      {/* Chat window */}
      {open && (
        <div className="hamad-window" style={{ position:"fixed", bottom:92, right:24, zIndex:9001, width:360, maxHeight:"72vh", display:"flex", flexDirection:"column", borderRadius:20, overflow:"hidden", boxShadow:"0 20px 60px rgba(62,19,22,0.3), 0 0 0 1px rgba(99,32,36,0.1)", fontFamily:"'DM Sans',sans-serif" }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#3e1316,#632024)", padding:"12px 16px", display:"flex", alignItems:"center", gap:10, flexShrink:0, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,#c5a57e,rgba(197,165,126,0.3))" }} />
            <div style={{ width:36, height:36, borderRadius:"50%", border:"2px solid rgba(197,165,126,0.5)", overflow:"hidden", flexShrink:0 }}>
              <img src="/avatar.png" alt="Hamad" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, color:"#E8D4BC", lineHeight:1.2 }}>Hamad</div>
              <div style={{ fontSize:10, color:"rgba(197,165,126,0.6)", display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
                CyberMajlis Guide
              </div>
            </div>
            <button onClick={() => setVoiceSettingsOpen(v => !v)}
              aria-label="Voice settings"
              title="Voice settings"
              style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(232,212,188,0.85)", fontSize:15, width:28, height:28, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              ⚙️
            </button>
            <button onClick={() => setOpen(false)}
              style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(232,212,188,0.7)", fontSize:16, width:28, height:28, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              ✕
            </button>
          </div>

          {/* Voice settings */}
          {voiceSettingsOpen && (
            <div style={{ padding:"10px 12px", background:"#fffaf6", borderBottom:"1px solid rgba(99,32,36,0.08)", display:"flex", gap:8, flexDirection:"column" }}>
              <div style={{ display:"flex", gap:8 }}>
                <select
                  value={speechLang}
                  onChange={e => setSpeechLang(e.target.value as SpeechLang)}
                  aria-label="Speech language"
                  style={{ flex:1, padding:"7px 9px", borderRadius:10, border:"1px solid rgba(99,32,36,0.18)", background:"white", color:"#632024", fontSize:12 }}
                >
                  <option value="ar-QA">Arabic / عربي</option>
                  <option value="en-US">English</option>
                </select>
                <button
                  onClick={stopSpeaking}
                  style={{ padding:"7px 10px", borderRadius:10, border:"1px solid rgba(99,32,36,0.18)", background:"white", color:"#632024", fontSize:12, cursor:"pointer" }}
                >
                  Stop voice
                </button>
              </div>
              <div style={{ padding:"7px 9px", borderRadius:10, background:"rgba(99,32,36,0.06)", color:"#632024", fontSize:12, lineHeight:1.4 }}>
                Hamad voice is powered by ElevenLabs. Use the AR / EN button beside the mic to choose the microphone language.
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"14px 12px", background:"#fdf8f4", display:"flex", flexDirection:"column", gap:10 }}>
            {messages.map((msg, i) => (
              <div key={i} className="hamad-msg" style={{ display:"flex", gap:8, alignItems:"flex-end", flexDirection: msg.role==="user"?"row-reverse":"row" }}>
                {msg.role === "assistant" && (
                  <div style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid rgba(99,32,36,0.2)", overflow:"hidden", flexShrink:0 }}>
                    <img src="/avatar.png" alt="Hamad" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                )}
                <div style={{
                  maxWidth:"78%", padding:"9px 13px", borderRadius: msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  background: msg.role==="user" ? "linear-gradient(135deg,#3e1316,#632024)" : "white",
                  color: msg.role==="user" ? "#E8D4BC" : "#3e1316",
                  fontSize:13, lineHeight:1.65,
                  boxShadow: msg.role==="user" ? "0 2px 8px rgba(62,19,22,0.2)" : "0 1px 6px rgba(0,0,0,0.07)",
                  border: msg.role==="assistant" ? "1px solid rgba(99,32,36,0.08)" : "none",
                  whiteSpace:"pre-wrap",
                  fontFamily:"'Crimson Pro',serif", fontWeight:400,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="hamad-msg" style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid rgba(99,32,36,0.2)", overflow:"hidden", flexShrink:0 }}>
                  <img src="/avatar.png" alt="Hamad" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
                <div style={{ padding:"10px 14px", background:"white", borderRadius:"16px 16px 16px 4px", border:"1px solid rgba(99,32,36,0.08)", boxShadow:"0 1px 6px rgba(0,0,0,0.07)", display:"flex", gap:4, alignItems:"center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"rgba(99,32,36,0.35)", animation:`blink 1.2s ease-in-out ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {hasSuggestions && !loading && (
              <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:4 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="hamad-suggest"
                    onClick={() => { setInput(s.text); setTimeout(() => inputRef.current?.focus(), 50); }}
                    style={{ padding:"8px 12px", borderRadius:10, border:"1px solid rgba(99,32,36,0.15)", background:"white", color:"rgba(99,32,36,0.7)", fontSize:s.ar?14:12, textAlign: s.ar?"right":"left", cursor:"pointer", fontFamily: s.ar?"'Noto Sans Arabic',sans-serif":"'Crimson Pro',serif", direction: s.ar?"rtl":"ltr", transition:"all .15s" }}>
                    {s.text}<span style={{ color:"rgba(99,32,36,0.35)", fontSize:10 }}>✏️</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:"10px 12px", background:"white", borderTop:"1px solid rgba(99,32,36,0.08)", display:"flex", gap:8, flexShrink:0 }}>
            <input ref={inputRef} className="hamad-input" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={listening ? (speechLang === "ar-QA" ? "أستمع الآن..." : "Listening...") : "Ask Hamad anything…"}
              style={{ flex:1, padding:"9px 14px", borderRadius:22, border:"1.5px solid rgba(99,32,36,0.18)", background:"#fdf8f4", fontSize:13, fontFamily:"'Crimson Pro',serif", color:"#3e1316" }}
            />
            <button
              onClick={toggleSpeechLanguage}
              disabled={loading || listening}
              className="hamad-voice-btn"
              aria-label="Switch speech language"
              title={speechLang === "ar-QA" ? "Arabic microphone is active. Click to switch to English." : "English microphone is active. Click to switch to Arabic."}
              style={{ width:36, height:36, borderRadius:"50%", border:"none", background: speechLang === "ar-QA" ? "rgba(99,32,36,0.18)" : "#632024", color: speechLang === "ar-QA" ? "#632024" : "#E8D4BC", fontSize:11, fontWeight:800, cursor: loading || listening ? "default" : "pointer", flexShrink:0, transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", letterSpacing:.3 }}>
              {speechLang === "ar-QA" ? "AR" : "EN"}
            </button>
            <button
              onClick={startVoiceInteraction}
              disabled={loading || listening || speaking}
              className="hamad-voice-btn"
              aria-label="Start voice interaction"
              title={speechLang === "ar-QA" ? "تحدث مع حمد بالعربية" : "Talk to Hamad in English"}
              style={{ width:36, height:36, borderRadius:"50%", border:"none", background: listening ? "#22c55e" : speaking ? "#c5a57e" : "rgba(99,32,36,0.12)", color:"#632024", fontSize:15, cursor: loading || listening || speaking ? "default" : "pointer", flexShrink:0, transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {listening ? "🎧" : speaking ? "🔊" : "🎙️"}
            </button>
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="hamad-send"
              style={{ width:36, height:36, borderRadius:"50%", border:"none", background: input.trim() && !loading ? "#632024" : "rgba(99,32,36,0.12)", color: input.trim() && !loading ? "white" : "rgba(99,32,36,0.3)", fontSize:15, cursor: input.trim() && !loading ? "pointer" : "default", flexShrink:0, transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// "use client";
// import { useState, useRef, useEffect } from "react";
// import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
// import { db } from "@/app/lib/firebase";

// interface Message { role: "user" | "assistant"; content: string; }

// const WELCOME = `مرحباً! I'm Hamad, your CyberMajlis guide 👋

// I can help you with:
// • Is a suspicious link or number safe?
// • What the latest security news means for you
// • What to do if you think you've been scammed
// • How to use CyberMajlis features

// What's on your mind?`;

// const SUGGESTIONS = [
//   { ar: true,  text: "هل هذا الرابط آمن؟ الرابط: " },
//   { ar: false, text: "I got a suspicious message from this number: " },
//   { ar: true,  text: "أظن أنني تعرضت للاختراق — " },
//   { ar: false, text: "Explain this threat to me: " },
// ];

// export default function Chatbot({ isLoggedIn }: { isLoggedIn: boolean }) {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([
//     { role: "assistant", content: WELCOME },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   useEffect(() => {
//     if (open) setTimeout(() => inputRef.current?.focus(), 300);
//   }, [open]);

//   const sendMessage = async (text?: string) => {
//     const msg = (text || input).trim();
//     if (!msg || loading) return;
//     setInput("");
//     const userMsg: Message = { role: "user", content: msg };
//     setMessages(prev => [...prev, userMsg]);
//     setLoading(true);

//     // Fetch live context from Firestore
//     let reports = "", news = "";
//     try {
//       const [rSnap, nSnap] = await Promise.all([
//         getDocs(query(collection(db, "communityWarnings"), where("status","==","approved"), orderBy("createdAt","desc"), limit(10))),
//         getDocs(query(collection(db, "securityNews"), orderBy("createdAt","desc"), limit(6))),
//       ]);
//       reports = rSnap.docs.map(d => {
//         const r = d.data();
//         return `[${r.type}] "${r.title}"${r.detail ? ` — ${r.detail}` : ""}: ${r.content?.slice(0,120)}`;
//       }).join("\n");
//       news = nSnap.docs.map(d => {
//         const n = d.data();
//         return `[${n.severity?.toUpperCase()}] ${n.headline}: ${n.what_happened?.slice(0,100)}`;
//       }).join("\n");
//     } catch { /* proceed without context if Firestore unavailable */ }

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
//           context: { reports, news },
//         }),
//       });
//       const data = await res.json();
//       setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
//     } catch {
//       setMessages(prev => [...prev, { role: "assistant", content: "Connection issue — please try again." }]);
//     }
//     setLoading(false);
//   };

//   const hasSuggestions = messages.length === 1;

//   return (
//     <>
//       <style>{`
//         @keyframes hamadSlideUp { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:none} }
//         @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
//         .hamad-msg { animation: msgIn 0.25s ease both; }
//         .hamad-window { animation: hamadSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
//         .hamad-input:focus { outline:none; border-color:#632024 !important; }
//         .hamad-input::placeholder { color:rgba(99,32,36,0.35); }
//         .hamad-send:hover { background:#7a1e22 !important; }
//         .hamad-suggest:hover { background:rgba(99,32,36,0.07) !important; border-color:rgba(99,32,36,0.3) !important; }
//       `}</style>

//       {/* Floating button */}
//       <div style={{ position:"fixed", bottom:24, right:24, zIndex:9000 }}>
//         <button onClick={() => setOpen(o => !o)}
//           style={{ width:56, height:56, borderRadius:"50%", border:"2.5px solid #632024", overflow:"hidden", cursor:"pointer", boxShadow:"0 4px 20px rgba(99,32,36,0.35)", transition:"transform .2s, box-shadow .2s", background:"white", padding:0 }}
//           onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.08)";(e.currentTarget as HTMLElement).style.boxShadow="0 8px 28px rgba(99,32,36,0.45)";}}
//           onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";(e.currentTarget as HTMLElement).style.boxShadow="0 4px 20px rgba(99,32,36,0.35)";}}>
//           <img src="/avatar.png" alt="Hamad" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
//         </button>
//         {/* Unread dot */}
//         {!open && (
//           <div style={{ position:"absolute", top:2, right:2, width:12, height:12, borderRadius:"50%", background:"#22c55e", border:"2px solid white", animation:"blink 2s ease-in-out infinite" }} />
//         )}
//       </div>

//       {/* Chat window */}
//       {open && (
//         <div className="hamad-window" style={{ position:"fixed", bottom:92, right:24, zIndex:9001, width:360, maxHeight:"72vh", display:"flex", flexDirection:"column", borderRadius:20, overflow:"hidden", boxShadow:"0 20px 60px rgba(62,19,22,0.3), 0 0 0 1px rgba(99,32,36,0.1)", fontFamily:"'DM Sans',sans-serif" }}>

//           {/* Header */}
//           <div style={{ background:"linear-gradient(135deg,#3e1316,#632024)", padding:"12px 16px", display:"flex", alignItems:"center", gap:10, flexShrink:0, position:"relative", overflow:"hidden" }}>
//             <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,#c5a57e,rgba(197,165,126,0.3))" }} />
//             <div style={{ width:36, height:36, borderRadius:"50%", border:"2px solid rgba(197,165,126,0.5)", overflow:"hidden", flexShrink:0 }}>
//               <img src="/avatar.png" alt="Hamad" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
//             </div>
//             <div style={{ flex:1 }}>
//               <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, color:"#E8D4BC", lineHeight:1.2 }}>Hamad</div>
//               <div style={{ fontSize:10, color:"rgba(197,165,126,0.6)", display:"flex", alignItems:"center", gap:4 }}>
//                 <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
//                 CyberMajlis Guide
//               </div>
//             </div>
//             <button onClick={() => setOpen(false)}
//               style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(232,212,188,0.7)", fontSize:16, width:28, height:28, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
//               ✕
//             </button>
//           </div>

//           {/* Messages */}
//           <div style={{ flex:1, overflowY:"auto", padding:"14px 12px", background:"#fdf8f4", display:"flex", flexDirection:"column", gap:10 }}>
//             {messages.map((msg, i) => (
//               <div key={i} className="hamad-msg" style={{ display:"flex", gap:8, alignItems:"flex-end", flexDirection: msg.role==="user"?"row-reverse":"row" }}>
//                 {msg.role === "assistant" && (
//                   <div style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid rgba(99,32,36,0.2)", overflow:"hidden", flexShrink:0 }}>
//                     <img src="/avatar.png" alt="Hamad" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
//                   </div>
//                 )}
//                 <div style={{
//                   maxWidth:"78%", padding:"9px 13px", borderRadius: msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
//                   background: msg.role==="user" ? "linear-gradient(135deg,#3e1316,#632024)" : "white",
//                   color: msg.role==="user" ? "#E8D4BC" : "#3e1316",
//                   fontSize:13, lineHeight:1.65,
//                   boxShadow: msg.role==="user" ? "0 2px 8px rgba(62,19,22,0.2)" : "0 1px 6px rgba(0,0,0,0.07)",
//                   border: msg.role==="assistant" ? "1px solid rgba(99,32,36,0.08)" : "none",
//                   whiteSpace:"pre-wrap",
//                   fontFamily:"'Crimson Pro',serif", fontWeight:400,
//                 }}>
//                   {msg.content}
//                 </div>
//               </div>
//             ))}

//             {/* Typing indicator */}
//             {loading && (
//               <div className="hamad-msg" style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
//                 <div style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid rgba(99,32,36,0.2)", overflow:"hidden", flexShrink:0 }}>
//                   <img src="/avatar.png" alt="Hamad" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
//                 </div>
//                 <div style={{ padding:"10px 14px", background:"white", borderRadius:"16px 16px 16px 4px", border:"1px solid rgba(99,32,36,0.08)", boxShadow:"0 1px 6px rgba(0,0,0,0.07)", display:"flex", gap:4, alignItems:"center" }}>
//                   {[0,1,2].map(i => (
//                     <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"rgba(99,32,36,0.35)", animation:`blink 1.2s ease-in-out ${i*0.2}s infinite` }} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Suggested questions */}
//             {hasSuggestions && !loading && (
//               <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:4 }}>
//                 {SUGGESTIONS.map((s, i) => (
//                   <button key={i} className="hamad-suggest"
//                     onClick={() => { setInput(s.text); setTimeout(() => inputRef.current?.focus(), 50); }}
//                     style={{ padding:"8px 12px", borderRadius:10, border:"1px solid rgba(99,32,36,0.15)", background:"white", color:"rgba(99,32,36,0.7)", fontSize:s.ar?14:12, textAlign: s.ar?"right":"left", cursor:"pointer", fontFamily: s.ar?"'Noto Sans Arabic',sans-serif":"'Crimson Pro',serif", direction: s.ar?"rtl":"ltr", transition:"all .15s" }}>
//                     {s.text}<span style={{ color:"rgba(99,32,36,0.35)", fontSize:10 }}>✏️</span>
//                   </button>
//                 ))}
//               </div>
//             )}

//             <div ref={bottomRef} />
//           </div>

//           {/* Input */}
//           <div style={{ padding:"10px 12px", background:"white", borderTop:"1px solid rgba(99,32,36,0.08)", display:"flex", gap:8, flexShrink:0 }}>
//             <input ref={inputRef} className="hamad-input" value={input} onChange={e => setInput(e.target.value)}
//               onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
//               placeholder="Ask Hamad anything…"
//               style={{ flex:1, padding:"9px 14px", borderRadius:22, border:"1.5px solid rgba(99,32,36,0.18)", background:"#fdf8f4", fontSize:13, fontFamily:"'Crimson Pro',serif", color:"#3e1316" }}
//             />
//             <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="hamad-send"
//               style={{ width:36, height:36, borderRadius:"50%", border:"none", background: input.trim() && !loading ? "#632024" : "rgba(99,32,36,0.12)", color: input.trim() && !loading ? "white" : "rgba(99,32,36,0.3)", fontSize:15, cursor: input.trim() && !loading ? "pointer" : "default", flexShrink:0, transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
//               ↑
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }