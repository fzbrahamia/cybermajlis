"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = "intro" | "hamad" | "saqr" | "thalab" | "hisan" | "oryx" | "result";
interface PhaseScore { score: number; max: number; detail: string }

// ── Character config ──────────────────────────────────────────────────────────
const CHARS = {
  hamad:  { name:"Hamad",    role:"Finance Employee",   color:"#60a5fa", img:"/avatar.png",   emoji:"👤" },
  saqr:   { name:"Saqr",     role:"Tier 1 — Alert Triage",   color:"#D5B893", img:"/characters/saqr.GIF",    emoji:"🦅" },
  thalab: { name:"Tha'lab",  role:"Tier 2 — Forensics",      color:"#f59e0b", img:"/characters/fox.GIF",     emoji:"🦊" },
  hisan:  { name:"Hisan",    role:"Tier 2 — Incident Response", color:"#f87171", img:"/characters/hisan.GIF",   emoji:"🐎" },
  oryx:   { name:"Oryx",     role:"Tier 3 — Risk Assessment", color:"#818cf8", img:"/characters/oryx.GIF",    emoji:"🦌" },
};

// ── Shared UI ─────────────────────────────────────────────────────────────────
function LayerBadge({ layer, active }: { layer: string; active: boolean }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, opacity: active ? 1 : 0.3, transition:"opacity .4s" }}>
      <div style={{ width:10, height:10, borderRadius:"50%", background: active ? "#D5B893" : "rgba(197,165,126,0.3)", boxShadow: active ? "0 0 8px #D5B893" : "none" }} />
      <span style={{ fontSize:8, color:"#D5B893", fontFamily:"'JetBrains Mono'", letterSpacing:"0.1em" }}>{layer}</span>
    </div>
  );
}

function CharBubble({ charId, message }: { charId: keyof typeof CHARS; message: string }) {
  const c = CHARS[charId];
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"12px 16px", background:"rgba(255,255,255,0.03)", borderRadius:12, border:`1px solid ${c.color}20`, marginBottom:12, animation:"slideIn .3s ease" }}>
      <div style={{ width:36, height:36, borderRadius:"50%", border:`2px solid ${c.color}50`, overflow:"hidden", flexShrink:0 }}>
        <img src={c.img} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
      </div>
      <div>
        <div style={{ fontSize:9, color:c.color, fontWeight:700, letterSpacing:"0.12em", marginBottom:4 }}>{c.name} · {c.role}</div>
        <div style={{ fontSize:13, color:"#f5ede0cc", lineHeight:1.7 }}>{message}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HAMAD PHASE — Spot the red flags in the phishing email
// ══════════════════════════════════════════════════════════════════════════════
const RED_FLAGS = [
  { id:"sender",  label:"Sender domain",    highlight:"it-support@company-helpdesk.net", x:"14%",  y:"18%", w:"46%", h:"4%",  tip:"'company-helpdesk.net' is NOT the company's real domain. Attackers register lookalike domains." },
  { id:"urgency", label:"Urgency language", highlight:"will be suspended in 2 hours",    x:"8%",   y:"38%", w:"55%", h:"4%",  tip:"Creating panic stops you from thinking clearly. Legitimate IT never gives 2-hour ultimatums." },
  { id:"url",     label:"Fake link URL",    highlight:"company-portal-update.net",        x:"14%",  y:"56%", w:"52%", h:"4%",  tip:"The link goes to a completely different domain — not the company's. This is the phishing trap." },
  { id:"logo",    label:"Off-brand logo",   highlight:"Microsoft",                        x:"72%",  y:"12%", w:"20%", h:"10%", tip:"The logo is slightly wrong — wrong shade, wrong font weight. Attackers copy logos imperfectly." },
];

function HamadPhase({ onComplete }: { onComplete: (score: number) => void }) {
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [tip, setTip] = useState<string | null>(null);

  const toggle = (id: string, tipText: string) => {
    if (revealed) return;
    setFlagged(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    setTip(tipText);
    setTimeout(() => setTip(null), 3000);
  };

  const handleReveal = () => {
    setRevealed(true);
    setTimeout(() => onComplete(flagged.size), 2500);
  };

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 20px" }}>
      <CharBubble charId="hamad" message="I got this email from IT support this morning. Something felt off but I wasn't sure. Can you spot what's wrong?" />

      <div style={{ fontSize:11, color:"rgba(197,165,126,0.6)", fontFamily:"'JetBrains Mono'", letterSpacing:"0.1em", marginBottom:10 }}>
        CLICK ON ANYTHING THAT LOOKS SUSPICIOUS
      </div>

      {/* Email simulation */}
      <div style={{ background:"#f8f9fa", borderRadius:12, overflow:"hidden", border:"1px solid rgba(0,0,0,0.1)", marginBottom:16, position:"relative" }}>
        {/* Email header bar */}
        <div style={{ background:"#e9ecef", padding:"8px 14px", display:"flex", gap:6, alignItems:"center", borderBottom:"1px solid rgba(0,0,0,0.08)" }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff5f57" }} />
          <div style={{ width:10, height:10, borderRadius:"50%", background:"#febc2e" }} />
          <div style={{ width:10, height:10, borderRadius:"50%", background:"#28c840" }} />
          <span style={{ marginLeft:8, fontSize:11, color:"#666", fontFamily:"monospace" }}>Inbox — Mail Client</span>
        </div>

        {/* Email content */}
        <div style={{ padding:"20px 24px", position:"relative", fontFamily:"Arial, sans-serif", fontSize:13, color:"#333", lineHeight:1.7 }}>
          {/* Fake Microsoft logo */}
          <div style={{ float:"right", marginLeft:16, marginBottom:8 }}>
            <div
              onClick={() => toggle("logo", RED_FLAGS[3].tip)}
              style={{ cursor:"pointer", padding:"6px 10px", background: flagged.has("logo") ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.8)", border:`2px solid ${flagged.has("logo") ? "#ef4444" : "transparent"}`, borderRadius:6, transition:"all .2s", userSelect:"none" }}
            >
              <span style={{ fontSize:18, fontWeight:900, color:"#00a2ed", letterSpacing:-1 }}>M</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#666", marginLeft:3 }}>icrosoft</span>
            </div>
            {flagged.has("logo") && <div style={{ fontSize:9, color:"#ef4444", textAlign:"center", marginTop:2 }}>🚩 FLAGGED</div>}
          </div>

          {/* From field */}
          <div style={{ marginBottom:12, paddingBottom:8, borderBottom:"1px solid #eee" }}>
            <div style={{ fontSize:11, color:"#999", marginBottom:2 }}>FROM</div>
            <span
              onClick={() => toggle("sender", RED_FLAGS[0].tip)}
              style={{ cursor:"pointer", fontFamily:"monospace", fontSize:12, background: flagged.has("sender") ? "rgba(239,68,68,0.12)" : "rgba(0,0,0,0.04)", padding:"3px 8px", borderRadius:4, border:`1px solid ${flagged.has("sender") ? "#ef4444" : "rgba(0,0,0,0.08)"}`, transition:"all .2s", userSelect:"none" }}
            >
              it-support@company-helpdesk.net
            </span>
            {flagged.has("sender") && <span style={{ fontSize:9, color:"#ef4444", marginLeft:6 }}>🚩</span>}
          </div>

          <p style={{ fontWeight:700, marginBottom:10 }}>Security Notice: Immediate Action Required</p>
          <p>Dear Employee,</p>
          <p>Our system has detected unusual activity on your account. Your access{" "}
            <span
              onClick={() => toggle("urgency", RED_FLAGS[1].tip)}
              style={{ cursor:"pointer", background: flagged.has("urgency") ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.1)", padding:"1px 4px", borderRadius:3, border:`1px solid ${flagged.has("urgency") ? "#ef4444" : "transparent"}`, transition:"all .2s", userSelect:"none" }}
            >
              will be suspended in 2 hours
            </span>
            {flagged.has("urgency") && <span style={{ fontSize:9, color:"#ef4444" }}> 🚩</span>}
            {" "}unless you verify your identity immediately.
          </p>
          <p>Please click the link below to secure your account:</p>
          <div style={{ background:"#f0f4ff", padding:"10px 14px", borderRadius:6, margin:"12px 0", border:"1px solid #dde" }}>
            <span style={{ fontSize:11, color:"#666", marginRight:6 }}>→</span>
            <span
              onClick={() => toggle("url", RED_FLAGS[2].tip)}
              style={{ cursor:"pointer", color: flagged.has("url") ? "#ef4444" : "#1a73e8", textDecoration:"underline", background: flagged.has("url") ? "rgba(239,68,68,0.1)" : "transparent", padding:"1px 3px", borderRadius:3, border:`1px solid ${flagged.has("url") ? "#ef4444" : "transparent"}`, transition:"all .2s", fontFamily:"monospace", fontSize:12, userSelect:"none" }}
            >
              https://company-portal-update.net/verify
            </span>
            {flagged.has("url") && <span style={{ fontSize:9, color:"#ef4444", marginLeft:4 }}>🚩</span>}
          </div>
          <p style={{ fontSize:12, color:"#999" }}>IT Security Team</p>
        </div>
      </div>

      {/* Tip popup */}
      {tip && (
        <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:12, color:"#f87171", lineHeight:1.6, animation:"slideIn .2s ease" }}>
          🚩 <strong>Red flag:</strong> {tip}
        </div>
      )}

      {/* Score so far */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ fontSize:11, color:"rgba(197,165,126,0.5)", fontFamily:"'JetBrains Mono'" }}>
          {flagged.size}/{RED_FLAGS.length} red flags spotted
        </span>
        {!revealed && (
          <button onClick={handleReveal}
            style={{ padding:"9px 24px", borderRadius:8, border:"1.5px solid rgba(197,165,126,0.45)", background:"transparent", color:"#D5B893", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
            onMouseEnter={e => (e.currentTarget.style.background="rgba(197,165,126,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background="transparent")}
          >Continue →</button>
        )}
      </div>

      {/* Reveal */}
      {revealed && (
        <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"14px 16px", animation:"slideIn .3s ease" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#f87171", marginBottom:8 }}>📨 Hamad clicked the link.</div>
          <div style={{ fontSize:13, color:"#f5ede0aa", lineHeight:1.7 }}>Despite the warning signs, he clicked. The link opened a fake login page — he entered his password. A malware payload silently installed on his work laptop in the background. The attack has begun.</div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SAQR PHASE — Alert triage queue
// ══════════════════════════════════════════════════════════════════════════════
const ALERTS = [
  { id:1, time:"09:03", type:"Encoded PowerShell — OUTLOOK.EXE parent", src:"WKSTN-14 (h.alqatari)", sev:"critical", correct:"real",  why:"Outlook spawning encoded PowerShell is the malware executing after Hamad clicked. This is the key alert." },
  { id:2, time:"08:55", type:"Antivirus: PUA quarantined",               src:"WKSTN-55 (it.admin)",  sev:"low",      correct:"fp",    why:"Advanced IP Scanner flagged as PUA — legitimate IT tool used by the admin team. Safe to close." },
  { id:3, time:"09:17", type:"Mass file writes — .locked extension",     src:"FILESERVER-01",        sev:"critical", correct:"real",  why:"Ransomware encryption in progress. Hamad's malware has spread to the file server via mapped drives." },
  { id:4, time:"09:00", type:"Scheduled task: Defender update",          src:"All workstations",     sev:"info",     correct:"fp",    why:"Routine Windows Defender definition update. Completely normal — close this." },
  { id:5, time:"09:15", type:"DNS query to ghost.update-service.xyz",    src:"WKSTN-14",             sev:"high",     correct:"real",  why:"Malware beaconing to its C2 server. 6-day-old domain in threat intel feeds. Escalate immediately." },
  { id:6, time:"09:10", type:"Internal port scan from WKSTN-12",         src:"WKSTN-12 (m.hassan)",  sev:"medium",   correct:"inv",   why:"Could be IT or lateral movement. Standard employee account doing a scan warrants investigation, not immediate escalation." },
];

const SEV_COLOR: Record<string,[string,string]> = {
  critical:["#e03040","rgba(224,48,64,0.1)"],
  high:["#f59e0b","rgba(245,158,11,0.1)"],
  medium:["#60a5fa","rgba(96,165,250,0.1)"],
  low:["#22c55e","rgba(34,197,94,0.1)"],
  info:["#94a3b8","rgba(148,163,184,0.1)"],
};

function SaqrPhase({ onComplete }: { onComplete: (score: number) => void }) {
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState(90);
  const [done, setDone] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => {
      if (t <= 1) { clearInterval(timerRef.current!); handleFinish(); return 0; }
      return t - 1;
    }), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const assign = (alertId: number, value: string) => {
    if (assignments[alertId] || done) return;
    setAssignments(prev => ({...prev, [alertId]: value}));
    setRevealed(prev => new Set([...prev, alertId]));
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDone(true);
    const score = ALERTS.reduce((acc, a) => acc + (assignments[a.id] === a.correct ? 1 : 0), 0);
    setTimeout(() => onComplete(score), 3000);
  };

  const allAssigned = Object.keys(assignments).length === ALERTS.length;
  const timerPct = timer / 90;
  const timerColor = timerPct < 0.25 ? "#ef4444" : timerPct < 0.5 ? "#f59e0b" : "#22c55e";

  const btnStyle = (alertId: number, val: string, label: string, activeColor: string): React.CSSProperties => {
    const assigned = assignments[alertId];
    const isThis = assigned === val;
    const correct = ALERTS.find(a=>a.id===alertId)?.correct === val;
    let bg = "rgba(255,255,255,0.04)", border = "rgba(255,255,255,0.12)", color = "#f5ede0aa";
    if (assigned) {
      if (isThis && correct) { bg="rgba(34,197,94,0.12)"; border="#22c55e40"; color="#22c55e"; }
      else if (isThis && !correct) { bg="rgba(239,68,68,0.12)"; border="#ef444440"; color="#f87171"; }
      else if (!isThis && correct && revealed.has(alertId)) { bg="rgba(34,197,94,0.06)"; border="#22c55e25"; color="rgba(34,197,94,0.6)"; }
    }
    return { padding:"5px 10px", borderRadius:6, border:`1px solid ${border}`, background:bg, color, fontSize:10, fontWeight:700, cursor: assigned ? "default" : "pointer", letterSpacing:"0.08em", transition:"all .2s" };
  };

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 20px" }}>
      <CharBubble charId="saqr" message="Alert queue is filling up. I need you to triage these — fast. Mark each as REAL THREAT, FALSE POSITIVE, or INVESTIGATE. The malware is active right now." />

      {/* Timer */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(timer/90)*100}%`, background:timerColor, borderRadius:3, transition:"width 1s linear" }} />
        </div>
        <span style={{ fontSize:12, fontFamily:"'JetBrains Mono'", color:timerColor, fontWeight:700, minWidth:40 }}>{timer}s</span>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontFamily:"'JetBrains Mono'" }}>{Object.keys(assignments).length}/{ALERTS.length} triaged</span>
      </div>

      {/* Alert queue */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
        {ALERTS.map(alert => {
          const [sevClr, sevBg] = SEV_COLOR[alert.sev] ?? ["#aaa","rgba(170,170,170,0.1)"];
          const assigned = assignments[alert.id];
          return (
            <div key={alert.id} style={{ background:assigned?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.02)", borderRadius:10, border:`1px solid ${assigned?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.06)"}`, padding:"12px 14px", transition:"all .2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <span style={{ fontFamily:"'JetBrains Mono'", fontSize:10, color:"rgba(255,255,255,0.35)" }}>{alert.time}</span>
                    <span style={{ fontSize:9, fontWeight:700, padding:"1px 7px", borderRadius:3, background:sevBg, color:sevClr, letterSpacing:"0.08em" }}>{alert.sev.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize:13, color:"#f5ede0", fontWeight:600, marginBottom:2 }}>{alert.type}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontFamily:"'JetBrains Mono'" }}>{alert.src}</div>
                </div>
                <div style={{ display:"flex", gap:5, flexShrink:0, marginLeft:10 }}>
                  <button style={btnStyle(alert.id,"real","REAL","#ef4444")} onClick={() => assign(alert.id,"real")}>⚠ REAL</button>
                  <button style={btnStyle(alert.id,"fp","FP","#22c55e")} onClick={() => assign(alert.id,"fp")}>✓ FALSE POS</button>
                  <button style={btnStyle(alert.id,"inv","INV","#f59e0b")} onClick={() => assign(alert.id,"inv")}>? INVESTIGATE</button>
                </div>
              </div>
              {revealed.has(alert.id) && (
                <div style={{ fontSize:11, color: assignments[alert.id]===alert.correct?"rgba(34,197,94,0.8)":"rgba(239,68,68,0.8)", lineHeight:1.6, paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.05)", animation:"fadeIn .3s ease" }}>
                  {assignments[alert.id]===alert.correct?"✓":"✗"} {alert.why}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(allAssigned || done) && !done && (
        <button onClick={handleFinish}
          style={{ padding:"11px 32px", borderRadius:8, border:"1.5px solid rgba(213,184,147,0.45)", background:"transparent", color:"#D5B893", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
          onMouseEnter={e=>(e.currentTarget.style.background="rgba(197,165,126,0.1)")}
          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
        >Escalate to Tier 2 →</button>
      )}
      {done && <div style={{ textAlign:"center", fontSize:13, color:"rgba(197,165,126,0.6)", padding:"12px 0" }}>Handing off to Tier 2…</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// THA'LAB PHASE — Digital evidence collection
// ══════════════════════════════════════════════════════════════════════════════
const EVIDENCE = [
  { id:1, icon:"📧", title:"Phishing email with malicious link",       type:"Email Client",     relevant:true,  label:"Origin of attack — Hamad's credential theft and malware delivery vector" },
  { id:2, icon:"⚙️", title:"OUTLOOK.EXE → CMD.EXE → powershell.exe",   type:"Process Monitor",  relevant:true,  label:"Malware execution chain — confirms the payload ran after clicking the link" },
  { id:3, icon:"🌐", title:"DNS: ghost.update-service.xyz (C2 beacon)", type:"Network Monitor",  relevant:true,  label:"Active C2 communication — malware calling home for instructions" },
  { id:4, icon:"📁", title:"Mass file writes: .locked extension",       type:"File Activity",    relevant:true,  label:"Ransomware encryption in progress — attack has reached the file server" },
  { id:5, icon:"🛡", title:"Defender definition update — v1.403.1",     type:"System Events",    relevant:false, label:"Routine AV update, unrelated to the incident" },
  { id:6, icon:"🗑", title:"vssadmin delete shadows /all /quiet",       type:"Process Monitor",  relevant:true,  label:"Shadow copies deleted — attacker removing recovery options before demanding ransom" },
  { id:7, icon:"📅", title:"Scheduled task: nightly backup ran OK",     type:"Task Scheduler",   relevant:false, label:"Routine backup, predates the attack. Not relevant to the investigation." },
  { id:8, icon:"🔑", title:"Anomalous login from 185.220.x.x at 03:14", type:"Auth Logs",        relevant:true,  label:"Stolen credentials used — attacker accessed corporate systems overnight" },
];

const TIMELINE_STEPS = [
  "📧 Phishing email delivered to Hamad",
  "🔑 Hamad's credentials stolen via fake portal",
  "🌐 Attacker logs in at 03:14 from Amsterdam",
  "⚙️ Malware payload executed via PowerShell",
  "🌐 Malware beacons to C2 server",
  "🗑 Shadow copies deleted (no recovery without paying)",
  "📁 Ransomware encrypts files across mapped drives",
];

function ThalabPhase({ onComplete }: { onComplete: (score: number) => void }) {
  const [collected, setCollected] = useState<Set<number>>(new Set());
  const [showTimeline, setShowTimeline] = useState(false);
  const relevantCount = EVIDENCE.filter(e=>e.relevant).length;

  const collect = (id: number) => {
    setCollected(prev => new Set([...prev, id]));
  };

  const collectedRelevant = [...collected].filter(id => EVIDENCE.find(e=>e.id===id)?.relevant).length;

  const handleBuild = () => {
    setShowTimeline(true);
    setTimeout(() => onComplete(collectedRelevant), 4000);
  };

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 20px" }}>
      <CharBubble charId="thalab" message="I need you to collect the relevant evidence from Hamad's machine and the network logs. Click what matters, ignore the noise. Every piece you collect builds the attack timeline." />

      {!showTimeline ? (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:10, color:"rgba(245,158,11,0.6)", fontFamily:"'JetBrains Mono'", letterSpacing:"0.1em" }}>EVIDENCE BOARD — {collected.size} COLLECTED</span>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"'JetBrains Mono'" }}>{collectedRelevant}/{relevantCount} relevant items found</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.7rem", marginBottom:16 }}>
            {EVIDENCE.map(ev => {
              const isCollected = collected.has(ev.id);
              return (
                <div key={ev.id}
                  onClick={() => !isCollected && collect(ev.id)}
                  style={{ padding:"12px 14px", borderRadius:10, border:`1.5px solid ${isCollected ? (ev.relevant?"rgba(245,158,11,0.5)":"rgba(239,68,68,0.3)") : "rgba(255,255,255,0.08)"}`, background: isCollected ? (ev.relevant?"rgba(245,158,11,0.08)":"rgba(239,68,68,0.06)") : "rgba(255,255,255,0.02)", cursor: isCollected ? "default" : "pointer", transition:"all .2s" }}
                  onMouseEnter={e => { if (!isCollected) (e.currentTarget as HTMLElement).style.borderColor="rgba(245,158,11,0.4)"; }}
                  onMouseLeave={e => { if (!isCollected) (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.08)"; }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <span style={{ fontSize:20, marginBottom:6, display:"block" }}>{ev.icon}</span>
                    {isCollected && <span style={{ fontSize:11, color: ev.relevant?"#f59e0b":"#ef4444" }}>{ev.relevant?"✓ Evidence":"✗ Irrelevant"}</span>}
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:"#f5ede0", marginBottom:4 }}>{ev.title}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontFamily:"'JetBrains Mono'" }}>{ev.type}</div>
                  {isCollected && <div style={{ fontSize:11, color: ev.relevant?"rgba(245,158,11,0.8)":"rgba(239,68,68,0.6)", marginTop:6, lineHeight:1.5 }}>{ev.label}</div>}
                </div>
              );
            })}
          </div>

          {collectedRelevant >= 4 && (
            <button onClick={handleBuild}
              style={{ padding:"11px 32px", borderRadius:8, border:"1.5px solid rgba(245,158,11,0.5)", background:"transparent", color:"#f59e0b", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(245,158,11,0.08)")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
            >Build Attack Timeline →</button>
          )}
        </>
      ) : (
        <div>
          <div style={{ fontSize:10, color:"rgba(245,158,11,0.6)", fontFamily:"'JetBrains Mono'", letterSpacing:"0.1em", marginBottom:14 }}>ATTACK TIMELINE RECONSTRUCTED</div>
          {TIMELINE_STEPS.map((step, i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10, animation:`fadeIn 0.4s ease ${i*0.3}s both` }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:"#f59e0b", flexShrink:0 }} />
                {i < TIMELINE_STEPS.length-1 && <div style={{ width:2, height:24, background:"rgba(245,158,11,0.3)" }} />}
              </div>
              <div style={{ fontSize:13, color:"#f5ede0cc", lineHeight:1.6, paddingTop:0 }}>{step}</div>
            </div>
          ))}
          <div style={{ marginTop:12, padding:"12px 14px", background:"rgba(245,158,11,0.06)", borderRadius:10, border:"1px solid rgba(245,158,11,0.2)", fontSize:12, color:"rgba(245,158,11,0.8)" }}>
            Full picture confirmed. Handing off to Incident Response for containment.
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HISAN PHASE — Network containment
// ══════════════════════════════════════════════════════════════════════════════
const ACTIONS = [
  { id:"isolate_hamad",   icon:"🔌", label:"Isolate Hamad's laptop",        correct:true,  consequence:"Hamad's machine is cut from the network. Ransomware can no longer access mapped drives. Encryption stops immediately." },
  { id:"block_c2",        icon:"🛡", label:"Block C2 IP at firewall",        correct:true,  consequence:"The malware loses its connection to the attacker's server. It can't receive new commands or exfiltrate data." },
  { id:"reset_creds",     icon:"🔑", label:"Reset Hamad's credentials",      correct:true,  consequence:"The stolen password is invalidated. The attacker's access via Hamad's account is cut off." },
  { id:"shutdown_network",icon:"⚡", label:"Shut down entire office network", correct:false, consequence:"Business operations halt completely. 200 employees can't work. The incident could have been contained without this — this is disproportionate." },
  { id:"delete_files",    icon:"🗑", label:"Delete all files on WKSTN-14",   correct:false, consequence:"You've destroyed forensic evidence needed to understand the full attack. The malware's persistence mechanism might still be on the system anyway." },
  { id:"snapshot",        icon:"📸", label:"Take memory snapshot of WKSTN-14",correct:true,  consequence:"Volatile memory captured before any reboots. This preserves encryption keys and attack artifacts for deeper forensic analysis." },
];

function HisanPhase({ onComplete }: { onComplete: (score: number) => void }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const toggle = (id: string) => {
    if (done || chosen.length >= 3 && !chosen.includes(id)) return;
    setChosen(prev => prev.includes(id) ? prev.filter(c=>c!==id) : [...prev, id]);
  };

  const handleExecute = () => {
    setDone(true);
    const score = chosen.filter(id => ACTIONS.find(a=>a.id===id)?.correct).length;
    setTimeout(() => onComplete(score), 4000);
  };

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 20px" }}>
      <CharBubble charId="hisan" message="The attack is confirmed. I have containment actions available — choose 3 that you'd execute right now. Some will stop the attack, others will make things worse. Choose carefully." />

      <div style={{ fontSize:10, color:"rgba(248,113,113,0.6)", fontFamily:"'JetBrains Mono'", letterSpacing:"0.1em", marginBottom:14 }}>
        SELECT 3 CONTAINMENT ACTIONS ({chosen.length}/3 selected)
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
        {ACTIONS.map(action => {
          const isChosen = chosen.includes(action.id);
          const showResult = done && isChosen;
          return (
            <div key={action.id}
              onClick={() => toggle(action.id)}
              style={{ padding:"12px 16px", borderRadius:10, border:`1.5px solid ${isChosen ? (done?(action.correct?"rgba(34,197,94,0.5)":"rgba(239,68,68,0.5)"):"rgba(248,113,113,0.5)") : "rgba(255,255,255,0.08)"}`, background: isChosen ? (done?(action.correct?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)"):"rgba(248,113,113,0.08)") : "rgba(255,255,255,0.02)", cursor:(done || (chosen.length>=3 && !isChosen)) ? "default":"pointer", transition:"all .2s", opacity:(chosen.length>=3 && !isChosen && !done) ? 0.4 : 1 }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>{action.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#f5ede0" }}>{action.label}</div>
                </div>
                {isChosen && !done && <span style={{ fontSize:11, color:"#f87171", fontWeight:700 }}>SELECTED</span>}
                {showResult && <span style={{ fontSize:11, fontWeight:700, color:action.correct?"#22c55e":"#ef4444" }}>{action.correct?"✓ CORRECT":"✗ WRONG"}</span>}
              </div>
              {showResult && (
                <div style={{ marginTop:8, fontSize:12, color: action.correct?"rgba(34,197,94,0.8)":"rgba(239,68,68,0.8)", lineHeight:1.6, paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  {action.consequence}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {chosen.length === 3 && !done && (
        <button onClick={handleExecute}
          style={{ padding:"11px 32px", borderRadius:8, border:"1.5px solid rgba(248,113,113,0.5)", background:"transparent", color:"#f87171", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
          onMouseEnter={e=>(e.currentTarget.style.background="rgba(248,113,113,0.08)")}
          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
        >Execute Actions →</button>
      )}
      {done && <div style={{ marginTop:12, fontSize:13, color:"rgba(197,165,126,0.6)" }}>Incident contained. Escalating to Tier 3 for risk assessment…</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ORYX PHASE — Risk decision
// ══════════════════════════════════════════════════════════════════════════════
const NOTIFICATION_OPTIONS = [
  { id:"internal",  label:"Internal report only",                correct:false, why:"Data was exfiltrated and credentials were compromised. Affected individuals have a legal right to be notified under Qatar's data protection framework." },
  { id:"clients",   label:"Notify affected clients + CERT.Qatar", correct:true,  why:"Correct. Clients whose data may have been accessed must be informed. CERT.Qatar should receive the report for national cyber threat intelligence." },
  { id:"csuite",    label:"Escalate to C-Suite immediately",      correct:false, why:"Executive notification will follow, but the immediate priority is client notification and CERT.Qatar reporting. C-Suite follows the IR process, not the other way around." },
];

function OryxPhase({ onComplete }: { onComplete: (score: number) => void }) {
  const [likelihood, setLikelihood] = useState(0);
  const [impact, setImpact] = useState(0);
  const [notif, setNotif] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const expertL = 4; const expertI = 5;
  const canSubmit = likelihood > 0 && impact > 0 && notif !== null;

  const handleSubmit = () => {
    setSubmitted(true);
    const lOk = Math.abs(likelihood - expertL) <= 1;
    const iOk = Math.abs(impact - expertI) <= 1;
    const nOk = notif === "clients";
    setTimeout(() => onComplete((lOk?1:0)+(iOk?1:0)+(nOk?1:0)), 3000);
  };

  const ratingBtn = (val: number, sel: number, set: (n:number)=>void, disabled: boolean) => (
    <div style={{ display:"flex", gap:5 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={()=>!disabled&&set(n)}
          style={{ width:36, height:36, borderRadius:8, border:`1.5px solid ${sel===n?"#818cf8":"rgba(255,255,255,0.12)"}`, background:sel===n?"rgba(129,140,248,0.18)":"rgba(255,255,255,0.03)", color:sel===n?"#818cf8":"#f5ede0aa", fontSize:14, fontWeight:700, cursor:disabled?"default":"pointer" }}>
          {n}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 20px" }}>
      <CharBubble charId="oryx" message="The incident is contained. Now I need to assess the organisational risk and decide how we respond. Based on the forensics report — 47 files accessed, Hamad's credentials stolen, possible data exfiltration — how do you rate this?" />

      <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, border:"1px solid rgba(255,255,255,0.08)", padding:"16px 18px", marginBottom:16 }}>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:"0.12em", marginBottom:10 }}>INCIDENT SUMMARY FROM THA'LAB</div>
        {[
          "47 files accessed on file server — includes client contracts and HR records",
          "Hamad's credentials stolen and used from Amsterdam at 03:14",
          "Malware communicated with C2 server for approx. 6 hours before detection",
          "Ransomware encrypted 847GB — now contained, backup restoration ready",
          "No database breach confirmed — PII database access logs show no anomaly",
        ].map((item, i) => (
          <div key={i} style={{ fontSize:12, color:"#f5ede0aa", lineHeight:1.7, paddingLeft:12, borderLeft:"2px solid rgba(129,140,248,0.3)", marginBottom:4 }}>{item}</div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
        <div style={{ background:"rgba(255,255,255,0.025)", borderRadius:10, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.15em", marginBottom:10 }}>LIKELIHOOD (1–5)</div>
          {ratingBtn(likelihood, likelihood, setLikelihood, submitted)}
          {submitted && <div style={{ marginTop:8, fontSize:11, color:Math.abs(likelihood-expertL)<=1?"#22c55e":"#f87171" }}>Your: {likelihood} · Expert: {expertL}</div>}
        </div>
        <div style={{ background:"rgba(255,255,255,0.025)", borderRadius:10, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.15em", marginBottom:10 }}>IMPACT (1–5)</div>
          {ratingBtn(impact, impact, setImpact, submitted)}
          {submitted && <div style={{ marginTop:8, fontSize:11, color:Math.abs(impact-expertI)<=1?"#22c55e":"#f87171" }}>Your: {impact} · Expert: {expertI}</div>}
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.15em", marginBottom:10 }}>NOTIFICATION DECISION</div>
        {NOTIFICATION_OPTIONS.map(opt => {
          const isChosen = notif === opt.id;
          let bg="rgba(255,255,255,0.03)", border="rgba(255,255,255,0.1)", color="#f5ede0bb";
          if (submitted) {
            if (opt.correct) { bg="rgba(34,197,94,0.1)"; border="rgba(34,197,94,0.4)"; color="#22c55e"; }
            else if (isChosen) { bg="rgba(239,68,68,0.1)"; border="rgba(239,68,68,0.4)"; color="#f87171"; }
          } else if (isChosen) { bg="rgba(129,140,248,0.1)"; border="#818cf840"; color="#818cf8"; }
          return (
            <div key={opt.id}>
              <button onClick={()=>!submitted&&setNotif(opt.id)}
                style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${border}`, background:bg, color, fontSize:13, textAlign:"left", cursor:submitted?"default":"pointer", fontWeight:isChosen?600:400, transition:"all .2s", marginBottom:submitted&&isChosen?0:8 }}>
                {opt.label}
              </button>
              {submitted && isChosen && (
                <div style={{ fontSize:12, color: opt.correct?"rgba(34,197,94,0.8)":"rgba(239,68,68,0.7)", lineHeight:1.6, paddingLeft:4, marginBottom:8 }}>{opt.why}</div>
              )}
              {submitted && opt.correct && !isChosen && (
                <div style={{ fontSize:12, color:"rgba(34,197,94,0.6)", lineHeight:1.6, paddingLeft:4, marginBottom:8 }}>✓ {opt.why}</div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} disabled={!canSubmit}
          style={{ padding:"11px 32px", borderRadius:8, border:`1.5px solid ${canSubmit?"rgba(129,140,248,0.5)":"rgba(255,255,255,0.1)"}`, background:"transparent", color:canSubmit?"#818cf8":"rgba(255,255,255,0.25)", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:canSubmit?"pointer":"default", fontFamily:"'JetBrains Mono'" }}>
          Submit Risk Assessment →
        </button>
      ) : (
        <div style={{ marginTop:12, fontSize:13, color:"rgba(197,165,126,0.6)" }}>Assessment filed. Generating final debrief…</div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESULT — Full scenario debrief
// ══════════════════════════════════════════════════════════════════════════════
function ResultPhase({ scores, onBack }: { scores: Record<string, number>; onBack: () => void }) {
  const layers = [
    { key:"hamad",  char:CHARS.hamad,  label:"Red Flag Detection", max:4 },
    { key:"saqr",   char:CHARS.saqr,   label:"Alert Triage",        max:6 },
    { key:"thalab", char:CHARS.thalab, label:"Evidence Collection", max:6 },
    { key:"hisan",  char:CHARS.hisan,  label:"Containment",         max:4 },
    { key:"oryx",   char:CHARS.oryx,   label:"Risk Assessment",     max:3 },
  ];
  const total = layers.reduce((acc, l) => acc + (scores[l.key]??0), 0);
  const maxTotal = layers.reduce((acc, l) => acc + l.max, 0);
  const pct = Math.round((total/maxTotal)*100);
  const grade = pct>=85?"Outstanding Analyst":pct>=65?"Competent Responder":pct>=40?"Developing Analyst":"Keep Practising";
  const gradeColor = pct>=85?"#22c55e":pct>=65?"#f59e0b":pct>=40?"#60a5fa":"#f87171";

  return (
    <div style={{ maxWidth:580, margin:"0 auto", padding:"32px 20px", textAlign:"center" }}>
      <div style={{ fontSize:52, marginBottom:16 }}>{pct>=85?"🎖":pct>=65?"🥈":pct>=40?"📋":"📚"}</div>
      <div style={{ fontSize:9, color:"rgba(197,165,126,0.5)", letterSpacing:"0.3em", fontFamily:"'JetBrains Mono'", marginBottom:10, textTransform:"uppercase" }}>Scenario Complete — Phishing Incident</div>
      <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:32, color:"#f5ede0", margin:"0 0 8px", fontWeight:600 }}>{grade}</h1>
      <div style={{ fontSize:48, fontWeight:700, color:gradeColor, margin:"16px 0 6px", fontFamily:"'JetBrains Mono'" }}>
        {total}<span style={{ fontSize:22, color:`${gradeColor}70` }}>/{maxTotal}</span>
      </div>
      <div style={{ fontSize:13, color:"#f5ede0aa", marginBottom:28 }}>{pct}% across all layers</div>

      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:28, textAlign:"left" }}>
        {layers.map(l => {
          const s = scores[l.key] ?? 0;
          const p = Math.round((s/l.max)*100);
          return (
            <div key={l.key} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)" }}>
              <img src={l.char.img} alt={l.char.name} style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover", border:`2px solid ${l.char.color}40` }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#f5ede0", marginBottom:3 }}>{l.char.name} — {l.label}</div>
                <div style={{ width:"100%", height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${p}%`, background:l.char.color, borderRadius:2, transition:"width 1s ease" }} />
                </div>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:l.char.color, fontFamily:"'JetBrains Mono'", minWidth:40, textAlign:"right" }}>{s}/{l.max}</span>
            </div>
          );
        })}
      </div>

      <button onClick={onBack}
        style={{ padding:"13px 40px", borderRadius:8, border:"1.5px solid rgba(197,165,126,0.45)", background:"transparent", color:"#D5B893", fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
        onMouseEnter={e=>(e.currentTarget.style.background="rgba(197,165,126,0.1)")}
        onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
      >← Return to SOC</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCENARIO COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const PHASES: Phase[] = ["intro","hamad","saqr","thalab","hisan","oryx","result"];
const PHASE_LABELS: Record<Phase, string> = {
  intro:"Briefing", hamad:"Hamad", saqr:"Tier 1", thalab:"Tier 2A", hisan:"Tier 2B", oryx:"Tier 3", result:"Debrief"
};

export default function Scenario() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [scores, setScores] = useState<Record<string, number>>({});

  const advance = (fromPhase: string, score?: number) => {
    if (score !== undefined) setScores(prev => ({...prev, [fromPhase]: score}));
    const idx = PHASES.indexOf(fromPhase as Phase);
    setPhase(PHASES[idx+1] ?? "result");
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#100408,#1c0810,#1a0a0b)", fontFamily:"'DM Sans', sans-serif", color:"#f5ede0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(10px)", borderBottom:"1px solid rgba(255,255,255,0.06)", height:58, display:"flex", alignItems:"center", padding:"0 24px", gap:16 }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:12, cursor:"pointer", fontFamily:"'JetBrains Mono'", letterSpacing:"0.1em" }}>← Back</button>
        <div style={{ width:1, height:20, background:"rgba(255,255,255,0.1)" }} />
        <span style={{ fontSize:11, color:"#D5B893", fontFamily:"'JetBrains Mono'", letterSpacing:"0.15em" }}>SCENARIO — PHISHING INCIDENT</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:16 }}>
          {(["hamad","saqr","thalab","hisan","oryx"] as const).map(p => (
            <LayerBadge key={p} layer={PHASE_LABELS[p]} active={PHASES.indexOf(phase) >= PHASES.indexOf(p)} />
          ))}
        </div>
      </div>

      {/* Intro */}
      {phase === "intro" && (
        <div style={{ maxWidth:620, margin:"0 auto", padding:"48px 20px", textAlign:"center" }}>
          <div style={{ fontSize:9, color:"rgba(197,165,126,0.5)", letterSpacing:"0.3em", fontFamily:"'JetBrains Mono'", marginBottom:14, textTransform:"uppercase" }}>Live Incident — In Progress</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:38, color:"#f5ede0", margin:"0 0 8px", fontWeight:600 }}>The Phishing Incident</h1>
          <div style={{ width:48, height:1, background:"rgba(197,165,126,0.3)", margin:"20px auto" }} />
          <p style={{ fontSize:14, color:"#f5ede0bb", lineHeight:1.85, maxWidth:480, margin:"0 auto 28px" }}>
            An incident is unfolding right now. You'll work through each layer of the SOC response — from the moment Hamad receives the email to the final risk decision. Each layer unlocks based on what you find in the previous one.
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:36, flexWrap:"wrap" }}>
            {(["hamad","saqr","thalab","hisan","oryx"] as const).map(id => (
              <div key={id} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:"rgba(255,255,255,0.04)", borderRadius:20, border:"1px solid rgba(255,255,255,0.08)" }}>
                <img src={CHARS[id].img} alt={CHARS[id].name} style={{ width:18, height:18, borderRadius:"50%", objectFit:"cover", border:`1px solid ${CHARS[id].color}50` }} />
                <span style={{ fontSize:10, color:CHARS[id].color, fontFamily:"'JetBrains Mono'", letterSpacing:"0.08em" }}>{CHARS[id].name}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setPhase("hamad")}
            style={{ padding:"13px 42px", borderRadius:8, border:"1.5px solid rgba(197,165,126,0.5)", background:"transparent", color:"#D5B893", fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
            onMouseEnter={e=>(e.currentTarget.style.background="rgba(197,165,126,0.1)")}
            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
          >Begin Scenario →</button>
        </div>
      )}

      {phase === "hamad"  && <HamadPhase  onComplete={s => advance("hamad", s)} />}
      {phase === "saqr"   && <SaqrPhase   onComplete={s => advance("saqr", s)}  />}
      {phase === "thalab" && <ThalabPhase onComplete={s => advance("thalab", s)}/>}
      {phase === "hisan"  && <HisanPhase  onComplete={s => advance("hisan", s)} />}
      {phase === "oryx"   && <OryxPhase   onComplete={s => advance("oryx", s)}  />}
      {phase === "result" && <ResultPhase scores={scores} onBack={() => router.back()} />}
    </div>
  );
}
