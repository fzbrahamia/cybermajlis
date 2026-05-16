// app/scan/page.tsx
"use client";
import { useState, useRef } from "react";

type ScanType = "url" | "file" | "hash";
type Severity  = "clean" | "suspicious" | "malicious" | "unknown";

interface ScanResult {
  type: ScanType;
  target: string;
  severity: Severity;
  detected: number;
  total: number;
  engines: { name: string; result: string | null; detected: boolean }[];
  permalink?: string;
}

const SEV: Record<Severity, { color: string; bg: string; border: string; icon: string; label: string; summary: (d:number,t:number,type:string)=>string }> = {
  clean:      { color:"#16a34a", bg:"rgba(22,163,74,0.07)",   border:"rgba(22,163,74,0.25)",   icon:"✅", label:"Clean",
    summary:(d,t,tp)=>`All ${t} security tools checked this ${tp} and found nothing harmful.` },
  suspicious: { color:"#ca8a04", bg:"rgba(202,138,4,0.07)",   border:"rgba(202,138,4,0.25)",   icon:"⚠️", label:"Suspicious",
    summary:(d,t,tp)=>`${d} of ${t} tools flagged this ${tp}. It may be a false alarm, but don't open it until you're certain.` },
  malicious:  { color:"#dc2626", bg:"rgba(220,38,38,0.07)",   border:"rgba(220,38,38,0.25)",   icon:"🚨", label:"Malicious",
    summary:(d,t,tp)=>`${d} of ${t} security tools confirmed this ${tp} is dangerous. Do not open it.` },
  unknown:    { color:"#6b7280", bg:"rgba(107,114,128,0.07)", border:"rgba(107,114,128,0.2)",  icon:"❓", label:"Unknown",
    summary:()=>`No scan results found. The file may not have been analysed before — try uploading it directly.` },
};

const ADVICE: Record<Severity, string[]> = {
  clean:      ["Results look safe, but still be cautious with files from unknown sources.", "Never share personal information through unexpected links, even clean-looking ones."],
  suspicious: ["Do not open or interact with this until you can confirm it is safe.", "Contact your IT department or a trusted person before proceeding.", "If you received this unexpectedly, report it to CERT.Qatar at cert.gov.qa"],
  malicious:  ["Do not open this under any circumstances.", "If you already opened it — change your passwords immediately from a different device.", "If on a work device — contact your IT department right now.", "Report this to CERT.Qatar at cert.gov.qa and your bank if financial details may be at risk."],
  unknown:    ["Try uploading the file directly instead of using the hash.", "If in doubt, don't open it."],
};

const LOADING_MSGS: Record<ScanType, string[]> = {
  url:  ["Submitting link to VirusTotal…", "Checking against 70+ security engines…", "Almost done…"],
  hash: ["Looking up hash in VirusTotal database…", "Retrieving scan history…"],
  file: ["Uploading file securely…", "Scanning with 70+ security engines…", "This can take up to 90 seconds for new files…", "Still scanning — almost there…"],
};

export default function ScanPage() {
  const [mode, setMode]       = useState<ScanType>("url");
  const [input, setInput]     = useState("");
  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [result, setResult]   = useState<ScanResult | null>(null);
  const [error, setError]     = useState("");
  const [showAll, setShowAll] = useState(false);
  const fileRef               = useRef<HTMLInputElement>(null);
  const msgInterval           = useRef<NodeJS.Timeout | null>(null);

  const canScan = mode === "file" ? !!file : input.trim().length > 3;

  const startLoadingMsgs = (type: ScanType) => {
    const msgs = LOADING_MSGS[type];
    let i = 0;
    setLoadMsg(msgs[0]);
    msgInterval.current = setInterval(() => {
      i = Math.min(i + 1, msgs.length - 1);
      setLoadMsg(msgs[i]);
    }, type === "file" ? 18000 : 5000);
  };

  const stopLoadingMsgs = () => {
    if (msgInterval.current) clearInterval(msgInterval.current);
  };

  const handleScan = async () => {
    setLoading(true); setError(""); setResult(null); setShowAll(false);
    startLoadingMsgs(mode);

    try {
      let res: Response;
      if (mode === "file" && file) {
        const form = new FormData();
        form.append("type", "file");
        form.append("file", file, file.name);
        res = await fetch("/api/scan", { method: "POST", body: form });
      } else {
        res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: mode, target: input.trim() }),
        });
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult({ type: mode, target: mode === "file" ? file!.name : input.trim(), ...data });
    } catch (e: any) {
      setError(e.message || "Scan failed. Please try again.");
    }
    stopLoadingMsgs();
    setLoading(false);
  };

  const reset = () => { setResult(null); setInput(""); setFile(null); setError(""); setShowAll(false); };

  const s    = result ? SEV[result.severity] : null;
  const flagged = result?.engines.filter(e => e.detected) || [];
  const clean   = result?.engines.filter(e => !e.detected) || [];

  return (
    <div style={{ minHeight:"100vh", background:"#f5ede2", fontFamily:"'DM Sans',sans-serif", paddingTop:"5rem" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>

      <div style={{ maxWidth:740, margin:"0 auto", padding:"2rem 1.5rem 4rem" }}>

        {/* Header */}
        <div style={{ marginBottom:"2rem" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.35em", color:"rgba(99,32,36,0.5)", textTransform:"uppercase", marginBottom:8 }}>CyberMajlis · Threat Scanner</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.1rem)", color:"#3e1316", fontWeight:700, margin:"0 0 10px" }}>File & Link Scanner</h1>
          <div style={{ width:44, height:2, background:"linear-gradient(90deg,#632024,transparent)", marginBottom:12 }}/>
          <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:"1rem", color:"#5C4033", lineHeight:1.75, maxWidth:540 }}>
            Check any suspicious file, link, or file hash against 70+ security tools. Results are explained in plain language — no technical knowledge needed.
          </p>
        </div>

        {/* Scanner card */}
        {!result && (
          <div style={{ background:"white", borderRadius:18, padding:"1.8rem", boxShadow:"0 4px 24px rgba(99,32,36,0.08)", border:"1px solid rgba(99,32,36,0.09)", marginBottom:"1.5rem" }}>

            {/* Mode tabs */}
            <div style={{ display:"flex", gap:5, background:"#f5ede2", borderRadius:10, padding:4, marginBottom:"1.4rem" }}>
              {([["url","🔗 Paste Link"],["hash","#️⃣ File Hash"],["file","📁 Upload File"]] as [ScanType,string][]).map(([m,label]) => (
                <button key={m} onClick={()=>{setMode(m);setInput("");setFile(null);setError("");}}
                  style={{ flex:1, padding:"8px 4px", borderRadius:8, border:"none", background:mode===m?"white":"transparent", color:mode===m?"#3e1316":"rgba(99,32,36,0.5)", fontSize:12, fontWeight:mode===m?700:400, cursor:"pointer", boxShadow:mode===m?"0 1px 6px rgba(99,32,36,0.1)":"none", transition:"all .2s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Input */}
            {mode === "file" ? (
              <div onClick={()=>fileRef.current?.click()}
                onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)setFile(f);}}
                style={{ border:"2px dashed rgba(99,32,36,0.2)", borderRadius:12, padding:"2.5rem 1rem", textAlign:"center", cursor:"pointer", background:"#faf6f1", marginBottom:"1rem", transition:"border-color .2s" }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(99,32,36,0.5)")}
                onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(99,32,36,0.2)")}>
                <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>{if(e.target.files?.[0])setFile(e.target.files[0]);}}/>
                {file ? (
                  <>
                    <div style={{ fontSize:32, marginBottom:8 }}>📄</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.75rem", color:"#3e1316", fontWeight:700 }}>{file.name}</div>
                    <div style={{ fontSize:11, color:"rgba(99,32,36,0.4)", marginTop:4 }}>{(file.size/1024).toFixed(1)} KB · Click to change</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize:36, marginBottom:8 }}>📁</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.68rem", color:"rgba(99,32,36,0.55)", letterSpacing:"0.12em" }}>DRAG & DROP OR CLICK TO SELECT</div>
                    <div style={{ fontSize:11, color:"rgba(99,32,36,0.35)", marginTop:6 }}>Max 32MB · Any file type</div>
                  </>
                )}
              </div>
            ) : (
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&canScan)handleScan();}}
                placeholder={mode==="url" ? "https://suspicious-link.com/…" : "MD5, SHA-1, or SHA-256 hash"}
                style={{ width:"100%", padding:"0.85rem 1rem", borderRadius:10, border:"1.5px solid rgba(99,32,36,0.18)", fontFamily:mode==="hash"?"'JetBrains Mono',monospace":"'Crimson Pro',serif", fontSize:mode==="hash"?12:15, color:"#3e1316", background:"#faf6f1", outline:"none", marginBottom:"1rem", boxSizing:"border-box", transition:"border-color .2s" }}
                onFocus={e=>e.target.style.borderColor="#632024"} onBlur={e=>e.target.style.borderColor="rgba(99,32,36,0.18)"}/>
            )}

            <button onClick={handleScan} disabled={!canScan||loading}
              style={{ width:"100%", padding:"0.95rem", borderRadius:11, border:"none", background:canScan&&!loading?"linear-gradient(135deg,#3e1316,#632024)":"rgba(99,32,36,0.1)", color:canScan&&!loading?"#E8D4BC":"rgba(99,32,36,0.3)", fontFamily:"'Cinzel',serif", fontSize:"0.7rem", letterSpacing:"0.18em", textTransform:"uppercase", fontWeight:700, cursor:canScan&&!loading?"pointer":"not-allowed", transition:"all .2s" }}>
              🔍 Scan Now
            </button>

            {error && (
              <div style={{ marginTop:"1rem", padding:"12px 16px", background:"rgba(220,38,38,0.07)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:10, color:"#dc2626", fontSize:13, lineHeight:1.6, fontFamily:"'Crimson Pro',serif" }}>
                {error}
              </div>
            )}

            {/* Info strip */}
            <div style={{ marginTop:"1.2rem", display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
              {["Powered by VirusTotal", "70+ security engines", "Results in plain language"].map((t,i) => (
                <span key={i} style={{ fontSize:10, color:"rgba(99,32,36,0.35)", fontFamily:"'Cinzel',serif", letterSpacing:"0.1em" }}>
                  {i>0&&<span style={{ marginRight:16, opacity:0.3 }}>·</span>}{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ background:"white", borderRadius:18, padding:"3rem 2rem", textAlign:"center", boxShadow:"0 4px 24px rgba(99,32,36,0.08)", border:"1px solid rgba(99,32,36,0.09)" }}>
            <div style={{ fontSize:44, marginBottom:16, display:"inline-block", animation:"spin 2.5s linear infinite" }}>🔍</div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem", letterSpacing:"0.15em", color:"rgba(99,32,36,0.7)", marginBottom:6 }}>{loadMsg}</div>
            {mode === "file" && <div style={{ fontSize:11, color:"rgba(99,32,36,0.35)", marginTop:4 }}>File scans can take 60–90 seconds</div>}
          </div>
        )}

        {/* Result */}
        {result && s && !loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

            {/* Verdict */}
            <div style={{ background:"white", borderRadius:18, overflow:"hidden", boxShadow:"0 4px 24px rgba(99,32,36,0.08)", border:"1px solid rgba(99,32,36,0.09)" }}>
              <div style={{ height:4, background:s.color }}/>
              <div style={{ padding:"1.6rem" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:14 }}>
                  <div style={{ fontSize:48, flexShrink:0 }}>{s.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.25em", color:s.color, textTransform:"uppercase", marginBottom:5 }}>Verdict</div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.3rem", fontWeight:700, color:"#3e1316", marginBottom:8 }}>{s.label}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ height:7, flex:1, background:"rgba(99,32,36,0.1)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${result.total ? (result.detected/result.total)*100 : 0}%`, background:s.color, borderRadius:4 }}/>
                      </div>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:s.color, fontWeight:700, flexShrink:0 }}>{result.detected}/{result.total} engines</span>
                    </div>
                  </div>
                </div>

                <div style={{ background:"#faf6f1", borderRadius:8, padding:"8px 12px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#5C4033", wordBreak:"break-all", marginBottom:14 }}>
                  {result.type === "url" ? "🔗" : result.type === "file" ? "📄" : "#️⃣"} {result.target}
                </div>

                <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:"1.05rem", color:"#3e1316", lineHeight:1.75, margin:"0 0 16px" }}>
                  {s.summary(result.detected, result.total, result.type)}
                </p>

                <div style={{ background:s.bg, borderRadius:10, padding:"12px 16px", border:`1px solid ${s.border}` }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.58rem", letterSpacing:"0.2em", color:s.color, textTransform:"uppercase", marginBottom:8 }}>What to do</div>
                  {ADVICE[result.severity].map((a,i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:i<ADVICE[result.severity].length-1?6:0 }}>
                      <span style={{ color:s.color, flexShrink:0 }}>→</span>
                      <span style={{ fontFamily:"'Crimson Pro',serif", fontSize:"0.95rem", color:"#3e1316", lineHeight:1.6 }}>{a}</span>
                    </div>
                  ))}
                </div>

                {result.permalink && (
                  <a href={result.permalink} target="_blank" rel="noreferrer"
                    style={{ display:"inline-block", marginTop:10, fontSize:11, color:"rgba(99,32,36,0.4)", fontFamily:"'Cinzel',serif", letterSpacing:"0.08em", textDecoration:"none" }}>
                    Full report on VirusTotal ↗
                  </a>
                )}
              </div>
            </div>

            {/* Engine breakdown */}
            {result.engines.length > 0 && (
              <div style={{ background:"white", borderRadius:18, padding:"1.4rem", boxShadow:"0 4px 24px rgba(99,32,36,0.08)", border:"1px solid rgba(99,32,36,0.09)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.62rem", letterSpacing:"0.2em", color:"rgba(99,32,36,0.5)", textTransform:"uppercase" }}>Engine Details</div>
                  <button onClick={()=>setShowAll(!showAll)}
                    style={{ fontSize:11, color:"rgba(99,32,36,0.45)", background:"none", border:"none", cursor:"pointer", fontFamily:"'Cinzel',serif" }}>
                    {showAll ? "Show less" : `Show all ${result.engines.length} engines`}
                  </button>
                </div>

                {flagged.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10, color:"#dc2626", fontWeight:700, marginBottom:7, letterSpacing:"0.1em" }}>FLAGGED AS MALICIOUS ({flagged.length})</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {flagged.map((e,i) => (
                        <div key={i} style={{ padding:"4px 10px", borderRadius:6, background:"rgba(220,38,38,0.07)", border:"1px solid rgba(220,38,38,0.18)", fontSize:11 }}>
                          <span style={{ color:"#dc2626", fontWeight:700 }}>{e.name}</span>
                          {e.result && <span style={{ color:"rgba(220,38,38,0.55)", marginLeft:4 }}>· {e.result}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {flagged.length === 0 && (
                  <div style={{ padding:"10px 14px", background:"rgba(22,163,74,0.06)", borderRadius:8, border:"1px solid rgba(22,163,74,0.2)", fontSize:13, color:"#16a34a", fontFamily:"'Crimson Pro',serif", marginBottom:10 }}>
                    ✓ No engines flagged this — all {result.total} tools returned clean results.
                  </div>
                )}

                {showAll && clean.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, color:"#16a34a", fontWeight:700, marginBottom:6, letterSpacing:"0.1em" }}>CLEAN ({clean.length})</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {clean.map((e,i) => (
                        <span key={i} style={{ padding:"3px 8px", borderRadius:5, background:"rgba(22,163,74,0.06)", border:"1px solid rgba(22,163,74,0.15)", fontSize:10, color:"rgba(22,163,74,0.8)" }}>{e.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CERT banner for malicious */}
            {result.severity === "malicious" && (
              <div style={{ background:"rgba(99,32,36,0.04)", borderRadius:14, padding:"1.2rem 1.4rem", border:"1px solid rgba(99,32,36,0.12)", display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ fontSize:28, flexShrink:0 }}>🛡</div>
                <div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.68rem", fontWeight:700, color:"#3e1316", marginBottom:5 }}>Report to Qatar's Cybersecurity Authority</div>
                  <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:"0.93rem", color:"#5C4033", lineHeight:1.7, margin:"0 0 8px" }}>
                    If you received this through a message or email, report it to CERT.Qatar — the National Cybersecurity Agency.
                  </p>
                  <a href="https://www.cert.gov.qa" target="_blank" rel="noreferrer"
                    style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"0.12em", color:"#632024", textDecoration:"none", fontWeight:700 }}>
                    CERT.QATAR → www.cert.gov.qa
                  </a>
                </div>
              </div>
            )}

            <button onClick={reset}
              style={{ padding:"0.8rem", borderRadius:10, border:"1.5px solid rgba(99,32,36,0.2)", background:"white", color:"rgba(99,32,36,0.6)", fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer" }}>
              ← Scan Something Else
            </button>
          </div>
        )}
      </div>
    </div>
  );
}