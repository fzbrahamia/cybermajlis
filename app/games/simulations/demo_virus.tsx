import { useState, useEffect, useRef } from "react";
import HamadCommentary from "@/components/HamadCommentary";
import { useTranslations } from "next-intl";

const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

const CSS = `
@keyframes cmdOpen { from { opacity:0; transform:scale(.8) } to { opacity:1; transform:scale(1) } }
@keyframes errorShake { 0%,100%{transform:translate(-50%,-50%)} 25%{transform:translate(-52%,-48%)} 75%{transform:translate(-48%,-52%)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
`;

const WIN7_BG = "linear-gradient(135deg, #1a78c2 0%, #0e5fa5 30%, #2a8fd5 50%, #0b4e8c 80%, #1a78c2 100%)";

export default function VirusForkBomb() {
  const t = useTranslations("DemoVirus");
  const [phase, setPhase] = useState("desktop");
  const [cmdWindows, setCmdWindows] = useState<Array<{ id: number; x: number; y: number; w: number; h: number; lines: string[] }>>([]);
  const [showError, setShowError] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(3);
  const [ramUsage, setRamUsage] = useState(22);
  const [typing, setTyping] = useState(false);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [commentTrigger, setCommentTrigger] = useState<string|null>(null);
  const [attempts, setAttempts] = useState(1);
  const [prediction, setPrediction] = useState<string|null>(null);
  const [showPrediction, setShowPrediction] = useState(false);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("cm-game-virus");
    const count = saved ? (JSON.parse(saved).attempts || 0) : 0;
    setAttempts(count + 1);
    if (count >= 1) setShowPrediction(true); // Return visitor: ask for prediction
  }, []);

  const CMD_LINES = t.raw("cmdLines") as string[];

  const openFile = () => {
    setPhase("running");
    setCommentTrigger("start");
    setTyping(true);
    setTypedLines([]);
    let lineIdx = 0;
    const typeInterval = setInterval(() => {
      if (lineIdx < CMD_LINES.length) {
        setTypedLines(prev => [...prev, CMD_LINES[lineIdx]]);
        lineIdx++;
      } else {
        clearInterval(typeInterval);
        startSpawning();
      }
    }, 300);
  };

  const startSpawning = () => {
    let count = 0;
    const maxWindows = 30;
    spawnRef.current = setInterval(() => {
      count++;
      const id = ++idRef.current;
      setCmdWindows(prev => {
        if (prev.length >= maxWindows) {
          clearInterval(spawnRef.current!);
          setTimeout(() => setShowError(true), 800);
          setTimeout(() => setPhase("crashed"), 3000);
          return prev;
        }
        const next = [...prev, { id, x: 30 + Math.min(count * 18, 500), y: 20 + Math.min(count * 14, 350), w: rand(280, 380), h: rand(180, 260), lines: count < 5 ? CMD_LINES.slice(0, rand(3, 8)) : CMD_LINES.slice(0, 4) }]; if(next.length === 3) setCommentTrigger("first_windows"); return next;
      });
      setCpuUsage(prev => { const next = Math.min(prev + rand(3, 8), 100); if(next > 60 && prev <= 60) setCommentTrigger("cpu_high"); return next; });
      setRamUsage(prev => Math.min(prev + rand(2, 5), 98));
      if (count > 10) {
        setCommentTrigger("cascade");
        clearInterval(spawnRef.current!);
        spawnRef.current = setInterval(() => {
          const id2 = ++idRef.current;
          setCmdWindows(prev => {
            if (prev.length >= maxWindows) { clearInterval(spawnRef.current!); setTimeout(() => setShowError(true), 500); setTimeout(() => setPhase("crashed"), 2500); return prev; }
            return [...prev, { id: id2, x: rand(0, 500), y: rand(0, 300), w: rand(280, 400), h: rand(180, 280), lines: CMD_LINES.slice(0, rand(2, 6)) }];
          });
          setCpuUsage(prev => Math.min(prev + rand(5, 12), 100));
          setRamUsage(prev => Math.min(prev + rand(3, 7), 99));
        }, 200);
      }
    }, 600);
  };

  const reset = () => {
    if (spawnRef.current) clearInterval(spawnRef.current);
    setCmdWindows([]); setShowError(false); setCpuUsage(3); setRamUsage(22);
    setTyping(false); setTypedLines([]); setPhase("desktop"); idRef.current = 0;
  };

  useEffect(() => () => { if (spawnRef.current) clearInterval(spawnRef.current); }, []);

  const isSpawning = (line: string) =>
    CMD_LINES.some(l => l.includes("Spawning") || l.includes("WARNING")) &&
    (line.includes(CMD_LINES.find(l => l.includes("Spawning")) ?? "__") ||
     line.includes(CMD_LINES.find(l => l.includes("WARNING")) ?? "__"));

  const isHighlight = (line: string) => {
    const spawnKey = CMD_LINES.find(l => l.includes("Spawning"));
    const warnKey  = CMD_LINES.find(l => l.includes("WARNING"));
    return (spawnKey && line.includes(spawnKey.split(" ")[0])) || (warnKey && line.includes(warnKey.split(" ")[0]));
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden", fontFamily: "Segoe UI, Tahoma, sans-serif", userSelect: "none" }}>
      <style>{CSS}</style>
      <div style={{ position: "absolute", inset: 0, background: WIN7_BG }} />

      {/* Desktop */}
      {phase === "desktop" && <>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: .06, fontSize: 200, pointerEvents: "none" }}>🪟</div>

        <div style={{ position: "absolute", top: 20, left: 20, textAlign: "center", width: 70 }}>
          <div style={{ fontSize: 36, filter: "drop-shadow(1px 1px 2px rgba(0,0,0,.5))" }}>🗑</div>
          <div style={{ fontSize: 11, color: "#fff", textShadow: "1px 1px 3px rgba(0,0,0,.8)", marginTop: 2 }}>{t("desktop.recycleBin")}</div>
        </div>

        {showPrediction && !prediction && (
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:"rgba(0,0,0,0.85)", border:"1px solid #d2992250", borderRadius:12, padding:"20px 24px", zIndex:50, maxWidth:360, textAlign:"center" }}>
            <div style={{ fontSize:11, color:"#d29922", fontWeight:700, letterSpacing:"0.15em", marginBottom:10 }}>RETURN VISITOR — PREDICT THE OUTCOME</div>
            <p style={{ fontSize:12, color:"#c9d1d9", lineHeight:1.7, marginBottom:14 }}>You've seen this before. Before you click the file — what do you think will happen first?</p>
            {["CPU hits 100% and the system freezes", "Multiple CMD windows start opening rapidly", "The file deletes itself to hide evidence", "An error message appears immediately"].map((opt,i) => (
              <button key={i} onClick={() => setPrediction(opt)}
                style={{ display:"block", width:"100%", margin:"4px 0", padding:"8px 12px", borderRadius:7, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.03)", color:"#8b949e", fontSize:11, textAlign:"left", cursor:"pointer" }}>
                {opt}
              </button>
            ))}
          </div>
        )}
        <div onClick={showPrediction && !prediction ? undefined : openFile} style={{ position: "absolute", top: 100, left: 20, textAlign: "center", width: 80, cursor: showPrediction && !prediction ? "not-allowed" : "pointer", opacity: showPrediction && !prediction ? 0.4 : 1 }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,.15)"}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
          <div style={{ fontSize: 36, filter: "drop-shadow(1px 1px 2px rgba(0,0,0,.5))" }}>📄</div>
          <div style={{ fontSize: 11, color: "#fff", textShadow: "1px 1px 3px rgba(0,0,0,.8)", marginTop: 2 }}>{t("desktop.fileName")}</div>
        </div>

        <div style={{ position: "absolute", top: 90, left: 110, fontSize: 28, pointerEvents: "none", filter: "drop-shadow(1px 1px 4px rgba(0,0,0,.5))" }}>👆</div>
        <div style={{ position: "absolute", top: 185, left: 20, width: 180, textAlign: "center" }}>
          <div style={{ background: "rgba(0,0,0,.6)", borderRadius: 8, padding: "6px 10px", fontSize: 10, color: "#ff9", border: "1px solid rgba(255,255,0,.3)" }}>
            ⚠ {t("desktop.hint")}
          </div>
        </div>
      </>}

      {/* Running — first CMD window */}
      {phase === "running" && (
        <div style={{ position: "absolute", left: 50, top: 30, width: 460, minHeight: 200, background: "#000", border: "1px solid #888", borderRadius: "4px 4px 0 0", zIndex: 5, boxShadow: "2px 3px 12px rgba(0,0,0,.4)" }}>
          <div style={{ background: "linear-gradient(180deg, #3a7bd5, #2563a8)", padding: "3px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#fff", fontSize: 10 }}>{t("cmd.title")}</span>
            <div style={{ display: "flex", gap: 2 }}>
              {["_","□","×"].map((b,j) => <div key={j} style={{ width: 14, height: 14, borderRadius: 2, background: j === 2 ? "#e44" : "#ccc", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{b}</div>)}
            </div>
          </div>
          <div style={{ padding: 8, fontFamily: "'Consolas','Courier New',monospace", fontSize: 11, color: "#ccc", lineHeight: 1.5 }}>
            {typedLines.map((line, i) => {
              const safe = line ?? "";
              const spawnLine = CMD_LINES.find(l => l?.startsWith("Spawning"));
              const warnLine  = CMD_LINES.find(l => l?.startsWith("WARNING"));
              const hi = (spawnLine && safe.startsWith(spawnLine.split(" ")[0])) || (warnLine && safe.startsWith(warnLine.split(" ")[0]));
              return <div key={i} style={{ color: hi ? "#ff9" : "#ccc" }}>{safe}</div>;
            })}
            {typing && <span style={{ animation: "blink 1s infinite" }}>_</span>}
          </div>
        </div>
      )}

      {/* Cascading windows */}
      {cmdWindows.map((win, i) => (
        <div key={win.id} style={{ position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h, zIndex: 2 + i, animation: "cmdOpen .3s ease", filter: phase === "crashed" ? "blur(0.5px) brightness(.85)" : "none", transition: "filter 1s" }}>
          <div style={{ width: "100%", height: "100%", background: "#000", border: "1px solid #888", borderRadius: "4px 4px 0 0", overflow: "hidden", boxShadow: "2px 3px 12px rgba(0,0,0,.4)" }}>
            <div style={{ background: "linear-gradient(180deg, #3a7bd5, #2563a8)", padding: "3px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#fff", fontSize: 9 }}>{t("cmd.title")}</span>
              <div style={{ display: "flex", gap: 2 }}>
                {["_","□","×"].map((b,j) => <div key={j} style={{ width: 12, height: 12, borderRadius: 2, background: j === 2 ? "#e44" : "#ccc", color: j === 2 ? "#fff" : "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>{b}</div>)}
              </div>
            </div>
            <div style={{ padding: 6, fontFamily: "'Consolas',monospace", fontSize: 9, color: "#ccc", lineHeight: 1.4, overflow: "hidden" }}>
              {(win.lines || []).map((l, j) => {
                const line = l ?? "";
                const spawnLine = CMD_LINES.find(ln => ln?.startsWith("Spawning"));
                const warnLine  = CMD_LINES.find(ln => ln?.startsWith("WARNING"));
                const hi = (spawnLine && line.startsWith(spawnLine.split(" ")[0])) || (warnLine && line.startsWith(warnLine.split(" ")[0]));
                return <div key={j} style={{ color: hi ? "#ff9" : "#ccc" }}>{line}</div>;
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Error dialog */}
      {showError && (
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 380, background: "#f0f0f0", border: "2px solid #999", borderRadius: 6, boxShadow: "4px 6px 30px rgba(0,0,0,.5)", zIndex: 200, animation: "errorShake .5s ease 2" }}>
          <div style={{ background: "linear-gradient(180deg, #3a7bd5, #2563a8)", padding: "5px 10px", display: "flex", alignItems: "center", gap: 6, borderRadius: "4px 4px 0 0" }}>
            <span style={{ fontSize: 12, color: "#fff" }}>⚠</span>
            <span style={{ color: "#fff", fontSize: 11 }}>{t("error.title")}</span>
          </div>
          <div style={{ padding: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 28 }}>❌</div>
            <div>
              <div style={{ fontSize: 12, color: "#333", lineHeight: 1.6 }}>{t("error.message")}</div>
              <div style={{ marginTop: 14, textAlign: "right" }}>
                <button onClick={reset} style={{ padding: "5px 24px", background: "linear-gradient(180deg,#f5f5f5,#e0e0e0)", border: "1px solid #acacac", borderRadius: 3, fontSize: 11, cursor: "pointer" }}>{t("error.ok")}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resource monitor */}
      {(phase === "running") && (
        <div style={{ position: "absolute", bottom: 60, right: 16, background: "rgba(0,0,0,.85)", borderRadius: 8, padding: 12, zIndex: 300, minWidth: 160, border: "1px solid #444" }}>
          <div style={{ color: "#888", fontSize: 9, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>{t("resources.title")}</div>
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginBottom: 2 }}>
              <span>{t("resources.cpu")}</span>
              <span style={{ color: cpuUsage > 80 ? "#ef4444" : cpuUsage > 50 ? "#f59e0b" : "#22c55e", fontWeight: 600 }}>{cpuUsage}%</span>
            </div>
            <div style={{ width: "100%", height: 4, background: "#333", borderRadius: 2 }}>
              <div style={{ width: `${cpuUsage}%`, height: "100%", background: cpuUsage > 80 ? "#ef4444" : cpuUsage > 50 ? "#f59e0b" : "#22c55e", borderRadius: 2, transition: "width .3s" }} />
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginBottom: 2 }}>
              <span>{t("resources.ram")}</span>
              <span style={{ color: ramUsage > 80 ? "#ef4444" : "#f59e0b", fontWeight: 600 }}>{ramUsage}%</span>
            </div>
            <div style={{ width: "100%", height: 4, background: "#333", borderRadius: 2 }}>
              <div style={{ width: `${ramUsage}%`, height: "100%", background: ramUsage > 80 ? "#ef4444" : "#f59e0b", borderRadius: 2, transition: "width .3s" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa" }}>
            <span>{t("resources.processes")}</span>
            <span style={{ color: "#ef4444", fontWeight: 600 }}>{cmdWindows.length + 4}</span>
          </div>
        </div>
      )}

      {/* Crashed screen */}
      {phase === "crashed" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto", padding: 20 }}>
          <div style={{ background: "#111", borderRadius: 16, padding: 28, textAlign: "center", maxWidth: 460, width: "100%", border: "1px solid #333" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>💀</div>
            <div style={{ fontSize: 20, color: "#ef4444", fontWeight: 700, marginBottom: 8 }}>{t("crashed.title")}</div>
            <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7, marginBottom: 16 }}
              dangerouslySetInnerHTML={{ __html: t.raw("crashed.description") as string }} />
            <div style={{ background: "#0a0a0a", borderRadius: 8, padding: 12, marginBottom: 16, textAlign: "left", fontSize: 12, color: "#f59e0b", border: "1px solid #333" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{t("crashed.howTitle")}</div>
              <div style={{ color: "#aaa", fontSize: 11, lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: t.raw("crashed.howBody") as string }} />
            </div>
            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7, marginBottom: 18 }}
              dangerouslySetInnerHTML={{ __html: t.raw("crashed.lesson") as string }} />
            <button onClick={() => { reset(); const cur = JSON.parse(localStorage.getItem("cm-game-virus")||"{}"); localStorage.setItem("cm-game-virus", JSON.stringify({attempts:(cur.attempts||0)+1})); setAttempts(a=>a+1); }}
              style={{ padding: "10px 24px", background: "#632024", border: "1px solid #ffffff20", borderRadius: 10, color: "#f5ede0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {t("crashed.reset")}
            </button>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(180deg, rgba(50,100,170,.95), rgba(20,60,120,.98))", borderTop: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", padding: "0 8px", zIndex: 100 }}>
        <div style={{ width: 48, height: 32, borderRadius: 8, background: "linear-gradient(180deg,#4a9edd,#2a6ab0)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,.3)" }}>
          <span style={{ fontSize: 18 }}>🪟</span>
        </div>
        {cmdWindows.length > 0 && (
          <div style={{ marginLeft: 8, display: "flex", gap: 2, overflow: "hidden", maxWidth: "60%" }}>
            {cmdWindows.slice(0, 15).map((_, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 4, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "1px solid rgba(255,255,255,.1)" }}>⬛</div>
            ))}
            {cmdWindows.length > 15 && <span style={{ color: "#fff", fontSize: 10, alignSelf: "center", marginLeft: 4 }}>+{cmdWindows.length - 15}</span>}
          </div>
        )}
        <div style={{ marginLeft: "auto", color: "#fff", fontSize: 11, paddingRight: 8 }}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}