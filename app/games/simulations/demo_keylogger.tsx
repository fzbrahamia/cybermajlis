import { useState, useEffect, useRef } from "react";
import HamadCommentary from "@/components/HamadCommentary";
import { useTranslations } from "next-intl";

// ============================================================
// KEYLOGGER DEMO
// Left: A normal-looking text editor / login form
// Right: Attacker's hidden panel showing every keystroke
// captured in real-time — including backspaces and deletions
// ============================================================

interface KeyLog {
  key: string;
  code: string;
  time: string;
  type: "char" | "special" | "delete";
}

// Rotate scenario context on each visit
const SCENARIOS = [
  { id:"bank",    label:"QNB Online Banking",   icon:"🏦", color:"#1a56db", fakeDomain:"qnb-secure-portal.net" },
  { id:"work",    label:"Corporate Email Login", icon:"💼", color:"#7c3aed", fakeDomain:"mail.qatarenergy-hr.com" },
  { id:"health",  label:"SEHA Health Portal",    icon:"🏥", color:"#059669", fakeDomain:"seha-patient.gov-qa.net" },
  { id:"gov",     label:"Metrash2 Government",   icon:"🏛", color:"#b45309", fakeDomain:"metrash2-verify.com" },
];


export default function DemoKeylogger() {
  const t = useTranslations("DemoKeylogger");
  const [view, setView] = useState<"intro" | "login" | "editor" | "reveal">("intro");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPass, setInputPass] = useState("");
  const [editorText, setEditorText] = useState("");
  const [keyLog, setKeyLog] = useState<KeyLog[]>([]);
  const [showAttacker, setShowAttacker] = useState(false);
  const [activeField, setActiveField] = useState<"email" | "password" | "editor">("email");
  const [commentTrigger, setCommentTrigger] = useState<string|null>(null);
  const [attempts, setAttempts] = useState(1);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cm-game-keylogger");
    const count = saved ? (JSON.parse(saved).attempts || 0) : 0;
    setAttempts(count + 1);
    setScenario(SCENARIOS[count % SCENARIOS.length]);
  }, []);

  const getTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
  };

  // Capture keystrokes globally when in login/editor mode
  useEffect(() => {
    if (view !== "login" && view !== "editor") return;

    const handler = (e: KeyboardEvent) => {
      // Determine key type
      let type: KeyLog["type"] = "char";
      let displayKey = e.key;
      if (e.key === "Backspace" || e.key === "Delete") { type = "delete"; displayKey = t("keys.delete"); }
      else if (e.key === "Enter") { type = "special"; displayKey = t("keys.enter"); }
      else if (e.key === "Tab") { type = "special"; displayKey = t("keys.tab"); }
      else if (["Shift","Control","Alt","Meta"].includes(e.key)) { type = "special"; displayKey = `[${e.key.toUpperCase()}]`; }
      else if (e.key === " ") { displayKey = t("keys.space"); }
      else if (e.key.length > 1) { type = "special"; displayKey = `[${e.key}]`; }
      setKeyLog(prev => { const next = [...prev, { key: displayKey, code: e.code, time: getTime(), type }]; if(next.length === 10) setCommentTrigger("ten_keystrokes"); if(type==="delete" && next.filter(k=>k.type==="delete").length===1) setCommentTrigger("backspace_used"); return next; });
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, t]);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [keyLog]);

  // ── INTRO ──
  if (view === "intro") {
    return (
      <div style={{ width: "100%", height: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Consolas', monospace" }}>
        <div style={{ textAlign: "center", maxWidth: 500, padding: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔑</div>
          <h1 style={{ fontSize: 28, color: "#c9d1d9", fontWeight: 400, marginBottom: 8 }}>
            {t("intro.title")} <span style={{ color: "#f0883e" }}>{t("intro.titleAccent")}</span>
          </h1>
          <p style={{ color: "#8b949e", fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>{t("intro.description")}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => setView("login")} style={{ padding: "12px 28px", background: "linear-gradient(135deg, #d97706, #f0883e)", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {t("intro.loginCta")}
            </button>
            <button onClick={() => setView("editor")} style={{ padding: "12px 28px", background: "transparent", border: "1px solid #30363d", borderRadius: 8, color: "#8b949e", fontSize: 14, cursor: "pointer" }}>
              {t("intro.editorCta")}
            </button>
          </div>
          <div style={{ marginTop: 20, fontSize: 10, color: "#3fb950", padding: "4px 12px", display: "inline-block", borderRadius: 10, border: "1px solid #3fb95030", background: "#3fb95010" }}>
            {t("intro.safeBadge")}
          </div>
        </div>
      </div>
    );
  }

  // ── REVEAL SCREEN ──
  if (view === "reveal") {
    const charCount = keyLog.filter(k => k.type === "char").length;
    const deleteCount = keyLog.filter(k => k.type === "delete").length;
    return (
      <div style={{ width: "100%", height: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Consolas', monospace" }}>
        <div style={{ maxWidth: 560, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💀</div>
          <div style={{ fontSize: 22, color: "#f0883e", fontWeight: 700, marginBottom: 16 }}>{t("reveal.title")}</div>
          <div style={{ background: "#161b22", borderRadius: 12, padding: 20, textAlign: "left", marginBottom: 16, border: "1px solid #30363d" }}>
            <div style={{ fontSize: 10, color: "#f0883e", fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>{t("reveal.capturedLabel")}</div>
            {[
              { label: t("reveal.totalKeystrokes"), value: keyLog.length, color: "#f0883e" },
              { label: t("reveal.charsTyped"), value: charCount, color: "#c9d1d9" },
              { label: t("reveal.deletionsCaptured"), value: deleteCount, color: "#f85149" },
              { label: t("reveal.deletedRecovered"), value: t("reveal.yes"), color: "#f85149" },
            ].map((row, i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid #21262d" : "none" }}>
                <span style={{ color: "#8b949e", fontSize: 11 }}>{row.label}</span>
                <span style={{ color: row.color, fontSize: 12, fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "#f8514908", border: "1px solid #f8514930", borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <div style={{ color: "#f0883e", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{t("reveal.lessonLabel")}</div>
            <div style={{ color: "#8b949e", fontSize: 11, lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: t.raw("reveal.lessonBody") as string }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap:"wrap" }}>
            <button onClick={() => { setView("intro"); setKeyLog([]); setInputEmail(""); setInputPass(""); setEditorText(""); setShowAttacker(false); const cur = JSON.parse(localStorage.getItem("cm-game-keylogger")||"{}"); localStorage.setItem("cm-game-keylogger", JSON.stringify({attempts:(cur.attempts||0)+1})); setAttempts(a=>a+1); setScenario(SCENARIOS[(attempts)%SCENARIOS.length]); }}
              style={{ padding: "10px 24px", background: "#632024", border: "1px solid #ffffff20", borderRadius: 10, color: "#f5ede0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {t("reveal.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOGIN / EDITOR VIEW ──
  const isLogin = view === "login";

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0d1117", fontFamily: "'Consolas', monospace", display: "flex", flexDirection: "column" }}>
      {/* Header bar */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>{["#f85149","#d29922","#3fb950"].map((c,i) => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}</div>
          <span style={{ fontSize: 12, color: "#8b949e" }}>{isLogin ? t("bar.loginTitle") : t("bar.editorTitle")}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setShowAttacker(!showAttacker); if(!showAttacker) setCommentTrigger("attacker_panel_open"); }} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${showAttacker ? "#f0883e" : "#30363d"}`, background: showAttacker ? "#f0883e15" : "transparent", color: showAttacker ? "#f0883e" : "#8b949e", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            {showAttacker ? t("bar.attackerOn") : t("bar.attackerOff")}
          </button>
          <button onClick={() => setView("reveal")}
            style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #f8514930", background: "#f8514910", color: "#f85149", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            {t("bar.endDemo")}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Victim side */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: isLogin ? "#f5f5f5" : "#ffffff" }}>
          {isLogin ? (
            /* Login form — looks like a normal website */
            <div style={{ width: 380, background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,.1)" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{scenario.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#333" }}>{scenario.label}</div>
                <div style={{ fontSize: 12, color: "#e44", marginTop: 4 }}>⚠ {scenario.fakeDomain}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#555", fontWeight: 600, display: "block", marginBottom: 4 }}>{t("login.emailLabel")}</label>
                <input type="text" value={inputEmail} onChange={e => setInputEmail(e.target.value)} onFocus={() => setActiveField("email")}
                  placeholder={t("login.emailPlaceholder")}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#555", fontWeight: 600, display: "block", marginBottom: 4 }}>{t("login.passwordLabel")}</label>
                <input type="password" value={inputPass} onChange={e => setInputPass(e.target.value)} onFocus={() => { setActiveField("password"); setCommentTrigger("password_field"); }}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <button style={{ width: "100%", padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {t("login.signIn")}
              </button>
              <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#999" }}>{t("login.looksNormal")}</div>
            </div>
          ) : (
            /* Notepad-style editor */
            <div style={{ width: "90%", maxWidth: 600, height: "80%", background: "#fff", border: "1px solid #ccc", borderRadius: 4, display: "flex", flexDirection: "column" }}>
              <div style={{ background: "#f0f0f0", padding: "4px 8px", borderBottom: "1px solid #ccc", display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span>📝</span>
                <span style={{ color: "#333" }}>{t("editor.title")}</span>
              </div>
              <textarea value={editorText} onChange={e => setEditorText(e.target.value)} onFocus={() => setActiveField("editor")}
                placeholder={t("editor.placeholder")}
                style={{ flex: 1, padding: 16, border: "none", outline: "none", resize: "none", fontSize: 14, fontFamily: "'Consolas', monospace", lineHeight: 1.7 }} />
            </div>
          )}
        </div>

        {/* Attacker panel */}
        {showAttacker && (
          <div style={{ width: 340, background: "#0d1117", borderLeft: "3px solid #f0883e", display: "flex", flexDirection: "column", fontFamily: "'Consolas', monospace" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #21262d", background: "#161b22" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f85149", animation: "pulse 1s infinite" }} />
                <span style={{ color: "#f0883e", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>{t("attacker.activeLabel")}</span>
              </div>
              <div style={{ fontSize: 9, color: "#484f58" }}>{t("attacker.recordingLabel")}</div>
            </div>

            {/* Live keystroke log */}
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              {keyLog.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#484f58", fontSize: 11 }}>{t("attacker.waiting")}</div>}
              {keyLog.map((k, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 6px", borderBottom: "1px solid #1e293b08", fontSize: 10, background: k.type === "delete" ? "#f8514908" : "transparent" }}>
                  <span style={{ color: "#484f58", fontFamily: "monospace", fontSize: 8, minWidth: 65 }}>{k.time}</span>
                  <span style={{ color: k.type === "delete" ? "#f85149" : k.type === "special" ? "#8b949e" : "#c9d1d9", fontWeight: k.type === "char" ? 700 : 400, textDecoration: k.type === "delete" ? "line-through" : "none" }}>
                    {k.key}
                  </span>
                  <span style={{ color: "#30363d", fontSize: 8, marginLeft: "auto" }}>{k.code}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* Reconstructed text */}
            <div style={{ padding: 10, borderTop: "1px solid #30363d", background: "#161b22" }}>
              <div style={{ fontSize: 9, color: "#f0883e", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>{t("attacker.reconstructedLabel")}</div>
              <div style={{ fontSize: 11, color: "#3fb950", wordBreak: "break-all", fontFamily: "monospace" }}>
                {isLogin ? (
                  <>
                    <div>{t("attacker.emailField")}: <span style={{ color: "#c9d1d9" }}>{inputEmail || t("attacker.typing")}</span></div>
                    <div>{t("attacker.passField")}: <span style={{ color: "#f85149" }}>{inputPass || t("attacker.typing")}</span></div>
                  </>
                ) : (
                  <div style={{ color: "#c9d1d9", maxHeight: 60, overflow: "hidden" }}>{editorText || t("attacker.typing")}</div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ padding: "6px 10px", background: "#0d1117", borderTop: "1px solid #21262d", display: "flex", justifyContent: "space-between", fontSize: 9, color: "#484f58" }}>
              <span>{t("attacker.keysCount", { n: keyLog.length })}</span>
              <span>{t("attacker.deletesCount", { n: keyLog.filter(k => k.type === "delete").length })}</span>
            </div>
          </div>
        )}
      </div>

      {/* Hint bar */}
      {!showAttacker && (
        <div style={{ padding: "8px 14px", background: "#161b22", borderTop: "1px solid #30363d", textAlign: "center" }}>
          <span style={{ fontSize: 11, color: "#8b949e" }}
            dangerouslySetInnerHTML={{ __html: t.raw(isLogin ? "hint.login" : "hint.editor") as string }} />
        </div>
      )}

      <HamadCommentary simId="keylogger" trigger={commentTrigger} accentColor="#f0883e" />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}