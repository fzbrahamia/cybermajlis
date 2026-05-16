// app/community/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection, addDoc, getDocs, query, where, orderBy,
  updateDoc, doc, arrayUnion, serverTimestamp, getDoc, increment,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";

// ── Types ─────────────────────────────────────────────────────────────────────
type WType = "phishing_site"|"scam_call"|"phishing_email"|"social_media"|"story"|"suspicious_link";
type Tier  = "watchman"|"trusted"|"guardian"|null;
interface Report {
  id: string; type: WType; title: string; content: string; detail?: string;
  displayName: string; userId?: string; tier: Tier; approvedCount: number;
  upvotes: number; upvotedBy: string[];
  createdAt: {toDate:()=>Date}|null;
}

// ── Config ────────────────────────────────────────────────────────────────────
const TYPES: Record<WType,{icon:string;label:string;color:string;bg:string;detailLabel:string;placeholder:string}> = {
  phishing_site:  {icon:"🎣",label:"Phishing Website",   color:"#c5253a",bg:"rgba(197,37,58,0.08)",  detailLabel:"Website URL",    placeholder:"e.g. qnb-secure.net"},
  scam_call:      {icon:"📞",label:"Scam Call / SMS",    color:"#d4882a",bg:"rgba(212,136,42,0.08)", detailLabel:"Phone Number",   placeholder:"e.g. +974 XXXX XXXX"},
  phishing_email: {icon:"📧",label:"Phishing Email",     color:"#4b7bec",bg:"rgba(75,123,236,0.08)", detailLabel:"Sender Email",   placeholder:"e.g. support@qnb-help.com"},
  social_media:   {icon:"💬",label:"Social Media Scam",  color:"#7b68ee",bg:"rgba(123,104,238,0.08)",detailLabel:"Account Handle", placeholder:"e.g. @fake_qatar_support"},
  story:          {icon:"📖",label:"Story / Lesson",     color:"#22a05a",bg:"rgba(34,160,90,0.08)",  detailLabel:"",               placeholder:""},
  suspicious_link:{icon:"🔗",label:"Suspicious Link",    color:"#f59e0b",bg:"rgba(245,158,11,0.08)", detailLabel:"The Link",       placeholder:"e.g. bit.ly/win-iphone"},
};

const TIERS: Record<NonNullable<Tier>,{icon:string;label:string;color:string;min:number;max:number}> = {
  watchman: {icon:"🛡",label:"Watchman",         color:"#60a5fa",min:3, max:6},
  trusted:  {icon:"⭐",label:"Trusted Reporter", color:"#f59e0b",min:7, max:Infinity},
  guardian: {icon:"🎖",label:"Verified Guardian",color:"#22c55e",min:0, max:0},
};

// Guardian is subscription-only — not count-based
// Watchman: 3+ approved, Trusted: 7+ approved
const getTier = (count: number, isSubscribed: boolean = false): Tier =>
  isSubscribed ? "guardian" : count >= 7 ? "trusted" : count >= 3 ? "watchman" : null;

const timeAgo = (d: Date) => {
  const s = (Date.now()-d.getTime())/1000;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};



// ── TierBadge ─────────────────────────────────────────────────────────────────
function TierBadge({tier,count}:{tier:Tier;count:number}) {
  if (!tier) return null;
  const t = TIERS[tier];
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:`${t.color}15`,border:`1px solid ${t.color}40`,color:t.color}}>
      {t.icon} {t.label} · {count}
    </span>
  );
}

// ── Certificate ───────────────────────────────────────────────────────────────
function Certificate({displayName,count,date,onClose}:{displayName:string;count:number;date:string;onClose:()=>void}) {
  const certRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const el = certRef.current;
    if (!el) return;
    const w = window.open("","_blank","width=900,height=640");
    if (!w) return;
    w.document.write(`<html><head><style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,600;1,300&display=swap');
      body{margin:0;background:#0d0407;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    </style></head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    setTimeout(()=>w.print(),800);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:800,width:"100%"}}>
        {/* Certificate */}
        <div ref={certRef} style={{
          background:"linear-gradient(160deg,#0d0407,#1c0810)",
          border:"2px solid rgba(197,165,126,0.4)",
          borderRadius:16,padding:"48px 56px",position:"relative",overflow:"hidden",fontFamily:"'Cinzel',serif",
          boxShadow:"0 0 0 1px rgba(197,165,126,0.1) inset, 0 40px 80px rgba(0,0,0,0.6)",
        }}>
          {/* Corner ornaments */}
          {[{t:-2,l:-2,r:"auto",b:"auto"},{t:-2,r:-2,l:"auto",b:"auto"},{b:-2,l:-2,t:"auto",r:"auto"},{b:-2,r:-2,t:"auto",l:"auto"}].map((pos,i)=>(
            <div key={i} style={{position:"absolute",...pos,width:40,height:40,border:"2px solid rgba(197,165,126,0.5)",borderRadius:4}} />
          ))}
          {/* Top gold bar */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,transparent,#c5a57e,rgba(197,165,126,0.4),#c5a57e,transparent)"}} />
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:"linear-gradient(90deg,transparent,#c5a57e,rgba(197,165,126,0.4),#c5a57e,transparent)"}} />

          <div style={{textAlign:"center"}}>
            {/* Logo */}
            <div style={{fontSize:10,letterSpacing:"0.35em",color:"rgba(197,165,126,0.5)",textTransform:"uppercase",marginBottom:6}}>CyberMajlis Community</div>
            <div style={{width:60,height:1,background:"linear-gradient(90deg,transparent,#c5a57e,transparent)",margin:"0 auto 20px"}}/>

            <div style={{fontSize:9,letterSpacing:"0.5em",color:"rgba(197,165,126,0.4)",textTransform:"uppercase",marginBottom:16}}>Certificate of Recognition</div>

            <div style={{fontSize:13,color:"rgba(197,165,126,0.5)",marginBottom:10,fontFamily:"'Crimson Pro',serif",fontStyle:"italic",fontWeight:300}}>This is to certify that</div>

            <h1 style={{fontSize:36,fontWeight:700,color:"#E8D4BC",margin:"0 0 14px",letterSpacing:"0.05em"}}>{displayName}</h1>

            <div style={{width:100,height:1,background:"linear-gradient(90deg,transparent,#c5a57e,transparent)",margin:"0 auto 18px"}}/>

            <div style={{fontSize:11,letterSpacing:"0.2em",color:"#22c55e",marginBottom:14}}>🎖 VERIFIED GUARDIAN</div>

            <p style={{fontFamily:"'Crimson Pro',serif",fontSize:15,color:"rgba(232,212,188,0.7)",lineHeight:1.8,maxWidth:480,margin:"0 auto 24px",fontWeight:300}}>
              For outstanding and sustained contributions to Qatar's cybersecurity community through{" "}
              <strong style={{color:"#E8D4BC"}}>{count} verified security reports</strong>{" "}
              that have helped protect members of the public from digital threats.
            </p>

            <div style={{display:"flex",justifyContent:"center",gap:40,marginTop:8}}>
              <div style={{textAlign:"center"}}>
                <div style={{width:80,height:1,background:"rgba(197,165,126,0.3)",marginBottom:6}}/>
                <div style={{fontSize:8,letterSpacing:"0.2em",color:"rgba(197,165,126,0.4)"}}>DATE AWARDED</div>
                <div style={{fontSize:11,color:"rgba(197,165,126,0.7)",marginTop:2}}>{date}</div>
              </div>
              <div style={{fontSize:28}}>🛡</div>
              <div style={{textAlign:"center"}}>
                <div style={{width:80,height:1,background:"rgba(197,165,126,0.3)",marginBottom:6}}/>
                <div style={{fontSize:8,letterSpacing:"0.2em",color:"rgba(197,165,126,0.4)"}}>REPORTS APPROVED</div>
                <div style={{fontSize:11,color:"rgba(197,165,126,0.7)",marginTop:2}}>{count} verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16}}>
          <button onClick={handlePrint} style={{padding:"10px 24px",borderRadius:8,border:"1.5px solid rgba(197,165,126,0.5)",background:"transparent",color:"#D5B893",fontSize:11,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Cinzel',serif"}}>
            🖨 Print / Save
          </button>
          <button onClick={onClose} style={{padding:"10px 24px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:11,cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:"0.1em"}}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Report Card ───────────────────────────────────────────────────────────────
function ReportCard({r,userId,onUpvote}:{r:Report;userId:string|null;onUpvote:(id:string)=>void}) {
  const cfg = TYPES[r.type];
  const hasVoted = userId ? r.upvotedBy?.includes(userId) : false;
  return (
    <div style={{background:"white",borderRadius:14,border:"1px solid rgba(99,32,36,0.09)",boxShadow:"0 2px 14px rgba(99,32,36,0.06)",padding:"1.2rem 1.4rem",transition:"box-shadow .2s",position:"relative",overflow:"hidden"}}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.boxShadow="0 6px 24px rgba(99,32,36,0.11)"}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.boxShadow="0 2px 14px rgba(99,32,36,0.06)"}
    >
      <div style={{position:"absolute",top:0,left:0,bottom:0,width:3,background:`linear-gradient(to bottom,${cfg.color},${cfg.color}40)`}}/>
      <div style={{paddingLeft:8}}>
        {/* Top row */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:20,background:cfg.bg,color:cfg.color,letterSpacing:"0.04em",flexShrink:0}}>
            {cfg.icon} {cfg.label}
          </span>
          {r.tier&&<TierBadge tier={r.tier} count={r.approvedCount}/>}
          <span style={{marginLeft:"auto",fontSize:10,color:"rgba(99,32,36,0.35)",fontFamily:"'Cinzel',serif",letterSpacing:"0.08em",flexShrink:0}}>
            {r.createdAt ? timeAgo(r.createdAt.toDate()) : ""}
          </span>
        </div>
        {/* Title */}
        <h3 style={{fontFamily:"'Cinzel',serif",fontSize:"0.92rem",fontWeight:700,color:"#3e1316",lineHeight:1.4,margin:"0 0 6px"}}>{r.title}</h3>
        {/* Content */}
        <p style={{fontFamily:"'Crimson Pro',Georgia,serif",fontSize:"0.93rem",color:"#5C4033",lineHeight:1.65,margin:"0 0 10px"}}>{r.content}</p>
        {/* Detail + actions */}
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          {r.detail&&(
            <div style={{background:"rgba(99,32,36,0.04)",borderRadius:7,padding:"5px 10px",border:"1px solid rgba(99,32,36,0.09)",fontFamily:"monospace",fontSize:11,color:cfg.color,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {cfg.icon} {r.detail}
            </div>
          )}
          <button onClick={()=>userId&&onUpvote(r.id)}
            style={{display:"flex",alignItems:"center",gap:4,padding:"5px 13px",borderRadius:20,border:`1px solid ${hasVoted?cfg.color:"rgba(99,32,36,0.14)"}`,background:hasVoted?cfg.bg:"transparent",color:hasVoted?cfg.color:"rgba(99,32,36,0.45)",fontSize:11,fontWeight:700,cursor:userId?"pointer":"default",transition:"all .2s",flexShrink:0}}>
            ▲ {r.upvotes||0} helpful
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Submit Modal ──────────────────────────────────────────────────────────────
function SubmitModal({userId,userTier,approvedCount,onClose,onSubmitted}:{userId:string|null;userTier:Tier;approvedCount:number;onClose:()=>void;onSubmitted:()=>void}) {
  const [step,setStep]=useState<"login"|"type"|"form"|"gate"|"done">(
    !userId ? "login" : approvedCount>=10&&userTier!=="guardian" ? "gate" : "type"
  );
  const [type,setType]=useState<WType|null>(null);
  const [form,setForm]=useState({title:"",content:"",detail:"",anon:true});
  const [loading,setLoading]=useState(false);
  const cfg = type ? TYPES[type] : null;

  const handleSubmit = async()=>{
    if(!form.title||!form.content)return;
    setLoading(true);
    await addDoc(collection(db,"communityWarnings"),{
      type,title:form.title,content:form.content,detail:form.detail||null,
      displayName:form.anon?null:"Member",userId:userId||null,
      tier:userTier,approvedCount,
      status:"pending",upvotes:0,upvotedBy:[],createdAt:serverTimestamp(),
    });
    setLoading(false);
    onSubmitted();
    setStep("done");
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:9998,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#faf6f1",borderRadius:24,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(62,19,22,0.35)",border:"1px solid rgba(197,165,126,0.2)",position:"relative"}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#3e1316,#632024)",padding:"1.3rem 1.5rem",borderRadius:"24px 24px 0 0",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#c5a57e,rgba(197,165,126,0.2))"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,letterSpacing:"0.3em",color:"rgba(197,165,126,0.6)",textTransform:"uppercase",marginBottom:5}}>File a Report</div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"1.1rem",color:"#E8D4BC",fontWeight:700,margin:0}}>Community Security Report</h2>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(232,212,188,0.6)",fontSize:18,width:30,height:30,borderRadius:"50%",cursor:"pointer"}}>✕</button>
          </div>
        </div>

        <div style={{padding:"1.5rem"}}>
          {/* LOGIN REQUIRED */}
          {step==="login"&&(
            <div style={{textAlign:"center",padding:"1.5rem 0"}}>
              <div style={{fontSize:44,marginBottom:12}}>🔐</div>
              <h3 style={{fontFamily:"'Cinzel',serif",color:"#3e1316",marginBottom:8}}>Login Required</h3>
              <p style={{fontFamily:"'Crimson Pro',serif",color:"#5C4033",lineHeight:1.7,marginBottom:20}}>
                You need to be logged in to file a report. Your account lets us verify submissions and track your badge tier.
              </p>
              <button onClick={onClose} style={{padding:"0.8rem 2rem",borderRadius:10,border:"1px solid rgba(99,32,36,0.2)",background:"transparent",fontFamily:"'Cinzel',serif",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#632024",cursor:"pointer"}}>
                Close and Log In
              </button>
            </div>
          )}

          {/* GATE — subscription required */}
          {step==="gate"&&(
            <div style={{textAlign:"center",padding:"1rem 0"}}>
              <div style={{fontSize:40,marginBottom:12}}>🎖</div>
              <h3 style={{fontFamily:"'Cinzel',serif",color:"#3e1316",marginBottom:8}}>You've reached Verified Guardian</h3>
              <p style={{fontFamily:"'Crimson Pro',serif",color:"#5C4033",lineHeight:1.7,marginBottom:20}}>
                You've contributed {approvedCount} verified reports to this community. To continue filing reports at this level, a Guardian subscription is required.
              </p>
              <div style={{background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#22a05a",fontFamily:"'Crimson Pro',serif"}}>
                Your reports have helped protect real people in Qatar. Thank you.
              </div>
              <button style={{padding:"11px 28px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#3e1316,#632024)",color:"#E8D4BC",fontFamily:"'Cinzel',serif",fontSize:"0.7rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontWeight:700,marginBottom:8,width:"100%"}}>
                Subscribe — Guardian Tier
              </button>
              <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(99,32,36,0.4)",fontSize:12,cursor:"pointer"}}>Maybe later</button>
            </div>
          )}

          {/* TYPE SELECTION */}
          {step==="type"&&(
            <div>
              <p style={{fontFamily:"'Crimson Pro',serif",fontSize:"1rem",color:"#5C4033",fontStyle:"italic",marginBottom:"1rem",lineHeight:1.6}}>What type of threat are you reporting?</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem"}}>
                {(Object.entries(TYPES) as [WType,typeof TYPES[WType]][]).map(([k,c])=>(
                  <button key={k} onClick={()=>{setType(k);setStep("form");}}
                    style={{padding:"0.9rem",borderRadius:12,border:`1.5px solid ${type===k?c.color:"rgba(99,32,36,0.15)"}`,background:type===k?c.bg:"white",cursor:"pointer",textAlign:"center",transition:"all .2s"}}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=c.color)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor=type===k?c.color:"rgba(99,32,36,0.15)")}
                  >
                    <div style={{fontSize:20,marginBottom:3}}>{c.icon}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.08em",color:c.color,fontWeight:700}}>{c.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FORM */}
          {step==="form"&&cfg&&(
            <div style={{display:"flex",flexDirection:"column",gap:"0.9rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 11px",background:cfg.bg,borderRadius:9,border:`1px solid ${cfg.color}30`}}>
                <span style={{fontSize:15}}>{cfg.icon}</span>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.65rem",letterSpacing:"0.1em",color:cfg.color,fontWeight:700,flex:1}}>{cfg.label}</span>
                <button onClick={()=>setStep("type")} style={{background:"none",border:"none",color:"rgba(99,32,36,0.4)",fontSize:10,cursor:"pointer",fontFamily:"'Cinzel',serif"}}>change</button>
              </div>

              {/* Title */}
              <div>
                <label style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(99,32,36,0.5)",display:"block",marginBottom:5}}>Report Title *</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                  placeholder="A clear, concise title for this threat"
                  style={{width:"100%",padding:"0.7rem 0.9rem",borderRadius:9,border:"1.5px solid rgba(99,32,36,0.2)",fontFamily:"'Crimson Pro',serif",fontSize:"0.95rem",color:"#3e1316",background:"white",outline:"none",boxSizing:"border-box"}}
                  onFocus={e=>(e.target.style.borderColor=cfg.color)} onBlur={e=>(e.target.style.borderColor="rgba(99,32,36,0.2)")}
                />
              </div>

              {/* Detail */}
              {cfg.detailLabel&&(
                <div>
                  <label style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(99,32,36,0.5)",display:"block",marginBottom:5}}>{cfg.detailLabel}</label>
                  <input value={form.detail} onChange={e=>setForm(f=>({...f,detail:e.target.value}))}
                    placeholder={cfg.placeholder}
                    style={{width:"100%",padding:"0.7rem 0.9rem",borderRadius:9,border:"1.5px solid rgba(99,32,36,0.2)",fontFamily:"monospace",fontSize:"0.85rem",color:cfg.color,background:"white",outline:"none",boxSizing:"border-box"}}
                    onFocus={e=>(e.target.style.borderColor=cfg.color)} onBlur={e=>(e.target.style.borderColor="rgba(99,32,36,0.2)")}
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(99,32,36,0.5)",display:"block",marginBottom:5}}>What Happened *</label>
                <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} rows={4}
                  placeholder="Describe what happened in enough detail for others to recognise and avoid this threat..."
                  style={{width:"100%",padding:"0.7rem 0.9rem",borderRadius:9,border:"1.5px solid rgba(99,32,36,0.2)",fontFamily:"'Crimson Pro',serif",fontSize:"0.95rem",color:"#3e1316",background:"white",outline:"none",resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}}
                  onFocus={e=>(e.target.style.borderColor=cfg.color)} onBlur={e=>(e.target.style.borderColor="rgba(99,32,36,0.2)")}
                />
              </div>

              {/* Anonymous */}
              <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                <div style={{position:"relative",width:38,height:20}}>
                  <input type="checkbox" checked={form.anon} onChange={e=>setForm(f=>({...f,anon:e.target.checked}))} style={{opacity:0,position:"absolute",inset:0,cursor:"pointer"}}/>
                  <div style={{position:"absolute",inset:0,borderRadius:10,background:form.anon?"#632024":"rgba(99,32,36,0.15)",transition:"background .2s"}}/>
                  <div style={{position:"absolute",top:2,left:form.anon?"calc(100% - 18px)":2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
                </div>
                <span style={{fontFamily:"'Crimson Pro',serif",fontSize:"0.9rem",color:"#5C4033"}}>Post anonymously</span>
                {userTier&&<TierBadge tier={userTier} count={approvedCount}/>}
              </label>

              {/* Notice */}
              <div style={{background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.22)",borderRadius:9,padding:"9px 13px",display:"flex",gap:8}}>
                <span style={{fontSize:13,flexShrink:0}}>ⓘ</span>
                <p style={{fontFamily:"'Crimson Pro',serif",fontSize:"0.83rem",color:"#92650a",lineHeight:1.6,margin:0}}>
                  Reports are reviewed before publishing. Approved reports count toward your badge tier.
                </p>
              </div>

              <button onClick={handleSubmit} disabled={!form.title||!form.content||loading}
                style={{padding:"0.85rem 2rem",borderRadius:11,border:"none",background:(form.title&&form.content)?"linear-gradient(135deg,#3e1316,#632024)":"rgba(99,32,36,0.1)",color:(form.title&&form.content)?"#E8D4BC":"rgba(99,32,36,0.3)",fontFamily:"'Cinzel',serif",fontSize:"0.7rem",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,cursor:(form.title&&form.content)?"pointer":"not-allowed",transition:"all .2s"}}>
                {loading?"Submitting…":"Submit Report →"}
              </button>
            </div>
          )}

          {/* DONE */}
          {step==="done"&&(
            <div style={{textAlign:"center",padding:"1.5rem 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>🛡</div>
              <h3 style={{fontFamily:"'Cinzel',serif",color:"#3e1316",marginBottom:8}}>Report Filed</h3>
              <p style={{fontFamily:"'Crimson Pro',serif",color:"#5C4033",lineHeight:1.7,maxWidth:340,margin:"0 auto 1.2rem"}}>
                Your report is under review. Once approved, it will appear in the feed and count toward your badge tier.
              </p>
              <button onClick={onClose} style={{padding:"0.75rem 2rem",borderRadius:10,border:"1px solid rgba(99,32,36,0.2)",background:"transparent",fontFamily:"'Cinzel',serif",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#632024",cursor:"pointer"}}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const [reports,setReports]=useState<Report[]>([]);
  const [filter,setFilter]=useState<WType|"all">("all");
  const [search,setSearch]=useState("");
  const [loading,setLoading]=useState(true);
  const [userId,setUserId]=useState<string|null>(null);
  const [displayName,setDisplayName]=useState("Community Member");
  const [approvedCount,setApprovedCount]=useState(0);
  const [showSubmit,setShowSubmit]=useState(false);
  const [showCert,setShowCert]=useState(false);

  const userTier = getTier(approvedCount); // isSubscribed flag can be added from user profile later

  // Auth
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,async u=>{
      setUserId(u?.uid??null);
      if(u){
        // Display name from Firestore user doc
        try{
          const ud=await getDoc(doc(db,"user",u.uid));
          if(ud.exists()) setDisplayName(ud.data().nickname||ud.data().displayName||"Member");
        }catch{}
        // Count approved reports
        const q=query(collection(db,"communityWarnings"),where("userId","==",u.uid),where("status","==","approved"));
        const snap=await getDocs(q);
        setApprovedCount(snap.size);
      }
    });
    return unsub;
  },[]);

  const loadReports=useCallback(async()=>{
    setLoading(true);
    try{
      const q=query(collection(db,"communityWarnings"),where("status","==","approved"),orderBy("createdAt","desc"));
      const snap=await getDocs(q);
      setReports(snap.docs.map(d=>({id:d.id,...d.data()} as Report)));
    }catch(e){ console.error(e); }
    setLoading(false);
  },[]);

  useEffect(()=>{loadReports();},[loadReports]);

  const handleUpvote=async(id:string)=>{
    if(!userId)return;
    const ref=doc(db,"communityWarnings",id);
    const snap=await getDoc(ref);
    if(!snap.exists())return;
    const d=snap.data();
    const voted=(d.upvotedBy||[]).includes(userId);
    await updateDoc(ref,{upvotes:(d.upvotes||0)+(voted?-1:1),upvotedBy:voted?d.upvotedBy.filter((x:string)=>x!==userId):arrayUnion(userId)});
    loadReports();
  };

  const filtered=reports.filter(r=>{
    const mt=filter==="all"||r.type===filter;
    const q=search.toLowerCase();
    const ms=!q||r.title.toLowerCase().includes(q)||r.content.toLowerCase().includes(q)||(r.detail||"").toLowerCase().includes(q);
    return mt&&ms;
  });

  const certDate = new Date().toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"});

  return(
    <div style={{minHeight:"100vh",background:"#f5ede2",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,600;1,300;1,600&family=DM+Sans:wght@300;400;600;700&display=swap" rel="stylesheet"/>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"5.5rem 1.5rem 3rem",display:"grid",gridTemplateColumns:"280px 1fr",gap:"2rem",alignItems:"start"}}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
        <aside style={{position:"sticky",top:"5.5rem",display:"flex",flexDirection:"column",gap:"1.2rem"}}>

          {/* Branding card */}
          <div style={{background:"white",borderRadius:16,padding:"1.6rem",boxShadow:"0 2px 16px rgba(99,32,36,0.07)",border:"1px solid rgba(99,32,36,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:3,height:28,background:"linear-gradient(to bottom,#632024,#c5a57e)",borderRadius:2}}/>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.55rem",letterSpacing:"0.25em",color:"rgba(99,32,36,0.45)",textTransform:"uppercase"}}>CyberMajlis</div>
                <h1 style={{fontFamily:"'Cinzel',serif",fontSize:"1.05rem",fontWeight:700,color:"#3e1316",margin:0,lineHeight:1.2}}>Security Reports</h1>
              </div>
            </div>
            <p style={{fontFamily:"'Crimson Pro',serif",fontSize:"0.9rem",color:"#5C4033",lineHeight:1.7,margin:"0 0 1.2rem",fontWeight:300}}>
              Be part of our community awareness. Report any incidents that you have faced to help others avoid it.
            </p>
            <button onClick={()=>setShowSubmit(true)}
              style={{width:"100%",padding:"0.8rem",borderRadius:10,border:"none",background:"linear-gradient(135deg,#3e1316,#632024)",color:"#E8D4BC",fontFamily:"'Cinzel',serif",fontSize:"0.65rem",letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(62,19,22,0.2)",transition:"all .2s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              + File a Report
            </button>
            {!userId&&<p style={{fontFamily:"'Cinzel',serif",fontSize:"0.55rem",letterSpacing:"0.1em",color:"rgba(99,32,36,0.35)",textAlign:"center",marginTop:8,marginBottom:0}}>Log in to earn badges</p>}
            {userId&&userTier&&(
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
                <TierBadge tier={userTier} count={approvedCount}/>
                {userTier==="guardian"&&(
                  <button onClick={()=>setShowCert(true)} style={{padding:"5px",borderRadius:8,border:"1px solid rgba(34,197,94,0.4)",background:"rgba(34,197,94,0.07)",color:"#22c55e",fontSize:11,fontWeight:700,cursor:"pointer",width:"100%"}}>
                    🎖 View My Certificate
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tier legend card */}
          <div style={{background:"white",borderRadius:16,padding:"1.3rem",boxShadow:"0 2px 16px rgba(99,32,36,0.07)",border:"1px solid rgba(99,32,36,0.08)"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.55rem",letterSpacing:"0.2em",color:"rgba(99,32,36,0.4)",textTransform:"uppercase",marginBottom:12}}>Reporter Tiers</div>
            {(Object.entries(TIERS) as [NonNullable<Tier>,typeof TIERS[NonNullable<Tier>]][]).map(([k,t])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:k!=="guardian"?"1px solid rgba(99,32,36,0.06)":"none"}}>
                <span style={{fontSize:16}}>{t.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:t.color}}>{t.label}</div>
                  <div style={{fontSize:10,color:"rgba(99,32,36,0.4)"}}>
                    {k==="guardian"?"Subscription · any report count":k==="trusted"?"7+ approved reports":"3–6 approved reports"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:.35}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reports…"
              style={{width:"100%",padding:"0.65rem 1rem 0.65rem 2.3rem",borderRadius:10,border:"1.5px solid rgba(99,32,36,0.14)",fontFamily:"'Crimson Pro',serif",fontSize:"0.95rem",color:"#3e1316",background:"white",outline:"none",boxSizing:"border-box",boxShadow:"0 2px 10px rgba(99,32,36,0.05)"}}
              onFocus={e=>{e.target.style.borderColor="#632024";e.target.style.boxShadow="0 0 0 3px rgba(99,32,36,0.08)";}}
              onBlur={e=>{e.target.style.borderColor="rgba(99,32,36,0.14)";e.target.style.boxShadow="0 2px 10px rgba(99,32,36,0.05)";}}
            />
          </div>

          {/* Filters */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {[{key:"all",icon:"🛡",label:"All Reports",color:"#632024"},...(Object.entries(TYPES) as [WType,typeof TYPES[WType]][]).map(([k,c])=>({key:k,icon:c.icon,label:c.label,color:c.color}))].map(f=>(
              <button key={f.key} onClick={()=>setFilter(f.key as WType|"all")}
                style={{padding:"8px 12px",borderRadius:9,border:"none",background:filter===f.key?`${f.color}12`:"transparent",color:filter===f.key?f.color:"rgba(99,32,36,0.55)",fontSize:12,fontWeight:filter===f.key?700:400,cursor:"pointer",textAlign:"left",transition:"all .15s",display:"flex",alignItems:"center",gap:8}}>
                <span>{f.icon}</span> {f.label}
                {filter===f.key&&<span style={{marginLeft:"auto",fontSize:10,background:`${f.color}20`,color:f.color,padding:"1px 7px",borderRadius:10,fontWeight:700}}>{filtered.length}</span>}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.55rem",letterSpacing:"0.15em",color:"rgba(99,32,36,0.35)",textAlign:"center",textTransform:"uppercase"}}>
            {reports.length} verified reports in database
          </div>
        </aside>

        {/* ── RIGHT: REPORTS FEED ──────────────────────────────────── */}
        <main>
          {loading?(
            <div style={{textAlign:"center",padding:"4rem",color:"rgba(99,32,36,0.35)",fontFamily:"'Cinzel',serif",fontSize:"0.7rem",letterSpacing:"0.2em"}}>Loading reports…</div>
          ):filtered.length===0?(
            <div style={{textAlign:"center",padding:"4rem",background:"white",borderRadius:16,border:"1px solid rgba(99,32,36,0.08)"}}>
              <div style={{fontSize:36,marginBottom:10}}>🛡</div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:"0.75rem",letterSpacing:"0.15em",color:"rgba(99,32,36,0.4)"}}>No reports found</p>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              {filtered.map(r=><ReportCard key={r.id} r={r} userId={userId} onUpvote={handleUpvote}/>)}
            </div>
          )}
        </main>
      </div>

      {showSubmit&&<SubmitModal userId={userId} userTier={userTier} approvedCount={approvedCount} onClose={()=>setShowSubmit(false)} onSubmitted={()=>{loadReports();setApprovedCount(c=>c+1);}}/>}
      {showCert&&<Certificate displayName={displayName} count={approvedCount} date={certDate} onClose={()=>setShowCert(false)}/>}
    </div>
  );
}