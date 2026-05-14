"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Character config ─────────────────────────────────────────────────────────
const CHARS = {
  saqr: {
    name: "Saqr", role: "Threat Detection", color: "#D5B893", img: "/characters/saqr.GIF",
    bg: "linear-gradient(160deg,#100900,#1c1100)",
    title: "Alert Triage Lab",
    welcome: "In threat detection, speed and accuracy are everything. I'll give you 8 live alerts straight from our SIEM. Triage each one — True Positive, False Positive, or Needs Investigation. I'll tell you exactly where you got it right and where you didn't.",
  },
  oryx: {
    name: "Oryx", role: "Risk Assessor", color: "#818cf8", img: "/characters/oryx.GIF",
    bg: "linear-gradient(160deg,#06061a,#0d0d2e)",
    title: "Risk Assessment Chamber",
    welcome: "Risk is two numbers multiplied: how likely it is, and how badly it hurts. I'll give you 5 real scenarios. Rate the likelihood, rate the impact, recommend a control. Then I'll show you where your judgment aligns with mine — and where it doesn't.",
  },
  thalab: {
    name: "Tha'lab", role: "Forensics", color: "#f59e0b", img: "/characters/fox.GIF",
    bg: "linear-gradient(160deg,#110900,#1d1000)",
    title: "Digital Forensics Workshop",
    welcome: "Attackers leave traces. Always. You'll see 10 log entries from a real incident — some are attack artifacts, some are normal noise. Tag each one. After you're done, I'll show you exactly what happened and in what order.",
  },
  hisan: {
    name: "Hisan", role: "Incident Response", color: "#f87171", img: "/characters/hisan.GIF",
    bg: "linear-gradient(160deg,#130000,#210808)",
    title: "Incident Response Simulator",
    welcome: "When a real incident hits, every decision has a consequence and there is no undo. I'll walk you through a live ransomware attack — five critical decision points. Your choices determine whether this becomes a minor incident or a catastrophe.",
  },
  hamad: {
    name: "Hamad", role: "Awareness & Social Engineering", color: "#60a5fa", img: "/avatar.png",
    bg: "linear-gradient(160deg,#020b18,#061525)",
    title: "Social Engineering Lab",
    welcome: "I'm Hamad — I work in the Finance department. I'm not a security expert. But I've learned the hard way that attackers don't just target IT systems — they target people like me. Let's go through what I should have caught before it was too late.",
  },
} as const;
type CharId = keyof typeof CHARS;

// ── Saqr data ────────────────────────────────────────────────────────────────
const SAQR_ALERTS = [
  { id:1, time:"02:14", src:"185.220.101.42 (Tor exit node)", dst:"10.0.1.55 — admin account",
    type:"Failed Authentication ×847", sev:"high",
    log:"FAILED LOGIN: user=admin — 847 attempts in 4 minutes\nSource IP: 185.220.101.42 (Tor exit node, NL)",
    correct:"tp", why:"847 login attempts in 4 minutes from a Tor node is an active brute-force. TRUE POSITIVE — block the IP and lock the account immediately." },
  { id:2, time:"09:03", src:"WKSTN-08 (h.alqatari)", dst:"External / C2",
    type:"Encoded PowerShell — Outlook parent", sev:"critical",
    log:"Process: powershell.exe -EncodedCommand UwB0AGEAcgB0...\nParent: OUTLOOK.EXE (PID 4821)",
    correct:"tp", why:"Outlook spawning encoded PowerShell is a textbook phishing payload. This is an Emotet-style dropper. TRUE POSITIVE — isolate WKSTN-08 immediately and capture memory." },
  { id:3, time:"14:22", src:"WKSTN-12 (standard employee)", dst:"10.0.0.0/16 — 254 hosts",
    type:"Internal Network Scan", sev:"medium",
    log:"nmap SYN scan from WKSTN-12 → /16 subnet\nPorts: 22, 80, 443, 3389 | User: m.hassan",
    correct:"inv", why:"Could be IT doing network inventory OR an attacker doing lateral movement recon. The user is a standard employee, not IT. INVESTIGATE FURTHER before classifying." },
  { id:4, time:"23:47", src:"WKSTN-15 (h.alqatari)", dst:"api.transfernow.net",
    type:"Large Data Upload — Off Hours", sev:"high",
    log:"HTTPS POST → api.transfernow.net\nSize: 287MB | User: h.alqatari | Time: 23:47 local",
    correct:"tp", why:"287MB upload to a file-sharing site at midnight by a regular employee is almost certainly data exfiltration. TRUE POSITIVE — freeze the account and pull the connection logs." },
  { id:5, time:"03:12", src:"WKSTN-19 (m.hassan)", dst:"FILESERVER-01 /HR/",
    type:"After-Hours File Access", sev:"medium",
    log:"User m.hassan accessed /HR/payroll/Q1-2025.xlsx at 03:12\n6 payroll files opened in 8 minutes",
    correct:"inv", why:"After-hours access to HR payroll could be a legitimate late worker OR an insider threat. Unusual but not conclusive. INVESTIGATE FURTHER — verify with the employee before escalating." },
  { id:6, time:"11:04", src:"WKSTN-33", dst:"ghost.update-service.xyz",
    type:"DNS Query — Threat Intel Flagged Domain", sev:"critical",
    log:"DNS: ghost.update-service.xyz | Domain age: 6 days\nThreat intel hits: 3 feeds (Abuse.ch, Feodo, OTX)",
    correct:"tp", why:"A 6-day-old domain appearing in 3 threat intel feeds is almost certainly C2 infrastructure. TRUE POSITIVE — WKSTN-33 is beaconing. Isolate immediately and pull the process tree." },
  { id:7, time:"16:30", src:"WKSTN-55 (it.helpdesk.admin)", dst:"Internal",
    type:"Antivirus Alert — PUA Quarantined", sev:"low",
    log:"AV quarantined: Advanced_IP_Scanner_v3.exe\nClassification: PUA | User: it.helpdesk.admin",
    correct:"fp", why:"Advanced IP Scanner is a legitimate IT tool commonly misclassified as PUA. The user is an IT admin. FALSE POSITIVE — whitelist the tool for IT accounts and close the alert." },
  { id:8, time:"08:55", src:"41.156.x.x (Cairo, EG)", dst:"vpn.company.qa",
    type:"VPN Auth — Unusual Location", sev:"low",
    log:"VPN AUTH SUCCESS: user=sara.m | Location: Cairo, EG\nPrevious: Doha, QA (90 min ago) | MFA: ✓ verified",
    correct:"fp", why:"MFA was verified and Doha→Cairo in 90 minutes is geographically plausible. The unusual-location flag is expected for travelling staff. FALSE POSITIVE — log for awareness, no action needed." },
];

// ── Oryx data ────────────────────────────────────────────────────────────────
const ORYX_SCENARIOS = [
  { id:1, title:"Unpatched web server exposed to the internet",
    detail:"Public-facing Apache 2.2 (EOL since 2017). Last patched 14 months ago. No WAF. Hosts the customer portal with PII.",
    expertL:4, expertI:5, correctControl:"mitigate",
    controls:[
      {id:"mitigate",label:"Patch immediately and add a WAF"},
      {id:"monitor", label:"Enable enhanced monitoring and logging"},
      {id:"accept",  label:"Accept the risk — patching causes downtime"},
      {id:"transfer",label:"Transfer risk via cyber insurance"},
    ],
    why:"L4 — known exploits exist for Apache 2.2 and it's easily discoverable. I5 — public breach means customer PII exposure and regulatory penalties. Patching + WAF is the only acceptable response here." },
  { id:2, title:"Stolen company laptop (full-disk encryption active)",
    detail:"Laptop reported stolen. BitLocker + TPM + PIN required on boot. Remote wipe initiated within 30 minutes of report.",
    expertL:2, expertI:2, correctControl:"accept",
    controls:[
      {id:"mitigate",label:"Mandate a new device security policy for all staff"},
      {id:"monitor", label:"Audit all systems the employee had access to"},
      {id:"accept",  label:"Accept residual risk — encryption protects the data"},
      {id:"transfer",label:"File a police report and claim insurance"},
    ],
    why:"L2 — recovering data from a BitLocker device without the PIN is extremely difficult. I2 — encryption + remote wipe makes an actual breach very unlikely. Accepting low residual risk is the correct and proportionate response." },
  { id:3, title:"Shared admin account used by 3 IT staff",
    detail:"Single 'admin' account for all server management. Password unchanged for 18 months. No MFA. No individual audit trail.",
    expertL:5, expertI:4, correctControl:"mitigate",
    controls:[
      {id:"mitigate",label:"Assign individual admin accounts with MFA immediately"},
      {id:"monitor", label:"Add detailed logging to the shared account"},
      {id:"accept",  label:"Accept — IT staff are trusted employees"},
      {id:"transfer",label:"Document and schedule a fix next quarter"},
    ],
    why:"L5 — shared credentials are frequently already leaked without anyone knowing. I4 — a compromised admin account means full domain access with no accountability and no quick revocation path. This cannot wait." },
  { id:4, title:"Windows XP controlling server room HVAC",
    detail:"Single XP machine manages air conditioning for the primary data centre. Network-isolated but connected to corporate VLAN for vendor remote access.",
    expertL:3, expertI:5, correctControl:"mitigate",
    controls:[
      {id:"mitigate",label:"Isolate from VLAN and deploy compensating controls"},
      {id:"monitor", label:"Monitor all traffic to and from the device"},
      {id:"accept",  label:"Accept — it's a minor system with limited access"},
      {id:"transfer",label:"Make the HVAC vendor responsible for its security"},
    ],
    why:"L3 — not internet-facing, but VLAN access is a viable pivot path for an attacker already inside the network. I5 — HVAC failure in the data centre could destroy millions in hardware. Never accept catastrophic-impact risks, even at moderate likelihood." },
  { id:5, title:"Staff phishing simulation: 38% click rate",
    detail:"Quarterly phishing simulation shows 38% of staff clicked the link. Finance and HR: 55% click rate. No mandatory awareness training exists.",
    expertL:5, expertI:4, correctControl:"mitigate",
    controls:[
      {id:"mitigate",label:"Mandatory training programme + quarterly simulations"},
      {id:"monitor", label:"Deploy advanced email filtering and sandbox attachments"},
      {id:"accept",  label:"Accept — some clicking is inevitable"},
      {id:"transfer",label:"Add phishing coverage to cyber insurance"},
    ],
    why:"L5 — 38% means an attacker only needs to send 3 emails to guarantee one victim. I4 — phishing is the #1 initial access vector and one click can mean full domain compromise. Technical controls help but the root cause is human — training is non-optional." },
];

// ── Tha'lab data ──────────────────────────────────────────────────────────────
const THALAB_ENTRIES = [
  { id:1,  time:"07:45", event:"VPN auth success — user: h.alqatari — source: 185.220.x.x (Amsterdam, NL)",           isAttack:true,  label:"Initial Access — attacker authenticates with stolen credentials from overseas" },
  { id:2,  time:"08:12", event:"OUTLOOK.EXE opened email attachment: shipping_update_Q2.xlsm",                          isAttack:true,  label:"Delivery — victim opens malicious macro-enabled Excel document" },
  { id:3,  time:"08:14", event:"EXCEL.EXE → CMD.EXE → powershell.exe -EncodedCommand [base64 blob]",                   isAttack:true,  label:"Execution — macro triggers encoded PowerShell to download payload" },
  { id:4,  time:"08:20", event:"PowerShell downloaded 2.3MB binary from cdn77-redirect-service.xyz",                    isAttack:true,  label:"Payload Delivery — ransomware executable retrieved from attacker C2" },
  { id:5,  time:"08:30", event:"wmic.exe executed: net view /all — 23 shares discovered across domain",                 isAttack:true,  label:"Reconnaissance — mapping accessible network shares before encryption begins" },
  { id:6,  time:"08:45", event:"Scheduled task: Windows Defender definition update v1.403.1 — completed successfully",  isAttack:false, label:"Normal — routine AV update, completely unrelated to the attack" },
  { id:7,  time:"09:00", event:"DNS: mail.cybermajlis.local → resolved — standard mail client activity",                isAttack:false, label:"Normal — legitimate email client doing a routine DNS lookup" },
  { id:8,  time:"09:15", event:"vssadmin.exe delete shadows /all /quiet — executed as SYSTEM privilege",                isAttack:true,  label:"Defense Evasion — shadow copies deleted to prevent recovery without paying the ransom" },
  { id:9,  time:"09:17", event:"Mass file writes: .locked extension on 1,240 files/min across 6 shares on FILE-SERVER-01", isAttack:true, label:"Impact — ransomware encryption actively in progress" },
  { id:10, time:"09:52", event:"README_DECRYPT.txt created in 23 directories — demand: 4.5 BTC within 72 hours",        isAttack:true,  label:"Extortion — ransom notes deployed across all affected directories, attack complete" },
];

// ── Hisan data ────────────────────────────────────────────────────────────────
const HISAN_STEPS = [
  { id:1, phase:"IDENTIFY",
    situation:"09:17 AM. SIEM critical alert: mass file modification on FILE-SERVER-01. .locked extension appearing on 1,200+ files per minute. CPU at 98%, disk I/O maxed. This is ransomware.",
    question:"What is your immediate first action?",
    options:[
      {id:"a",text:"Wait 10 minutes to gather more SIEM data before acting",correct:false,
       consequence:"Ransomware encrypted 14,400 additional files during your wait. Spread reached 2 more workstations via open SMB shares."},
      {id:"b",text:"Immediately isolate FILE-SERVER-01 from the network",correct:true,
       consequence:"Isolation successful. Encryption stopped. 847GB locked but spread fully contained to one machine."},
      {id:"c",text:"Broadcast an all-staff alert to stop using the network",correct:false,
       consequence:"Mass confusion. Staff flood IT. Encryption continued for 8 more minutes — 11,000 additional files locked — before isolation happened."},
    ],
    lesson:"In active ransomware every second costs files. Stop the spread first — always isolate before you investigate." },
  { id:2, phase:"CONTAIN",
    situation:"FILE-SERVER-01 is isolated. Encryption stopped. Three workstations were accessing its shares during the attack window and may be compromised.",
    question:"What do you do next?",
    options:[
      {id:"a",text:"Begin restoring FILE-SERVER-01 from last night's backup immediately",correct:false,
       consequence:"The 3 infected workstations re-encrypt the fresh restore within 40 minutes. You're back to zero."},
      {id:"b",text:"Isolate the 3 workstations and identify the infection source",correct:true,
       consequence:"All 4 machines isolated. Forensics confirms: a phishing email 70 minutes ago started this. No other systems infected."},
      {id:"c",text:"Pay the ransom — downtime is costing too much",correct:false,
       consequence:"Payment attempted but the 3 workstations remain infected and active. 40% of gangs don't provide working decryptors anyway."},
    ],
    lesson:"Never restore before containment is complete. Verify the full scope of infection first — or you restore clean data directly into an active attack." },
  { id:3, phase:"ERADICATE",
    situation:"4 machines confirmed infected (FILE-SERVER-01 + 3 workstations). Infection vector confirmed: a macro in a phishing email attachment opened 80 minutes ago.",
    question:"How do you clean the infected machines?",
    options:[
      {id:"a",text:"Run a full antivirus scan on all 4 machines and quarantine findings",correct:false,
       consequence:"The ransomware disabled AV on all 4 machines before executing. The scans find nothing. All 4 remain compromised."},
      {id:"b",text:"Reimage all 4 machines from verified clean OS images",correct:true,
       consequence:"Full reimage completed. All traces of ransomware removed. Machines are clean and ready for data restoration."},
      {id:"c",text:"Manually delete all files created after the infection timestamp",correct:false,
       consequence:"Ransomware injected into 3 legitimate system processes. Manual file deletion misses the persistence mechanism. Infection remains."},
    ],
    lesson:"You cannot trust AV on a compromised machine — the malware likely disabled or patched it. Reimaging is the only guarantee of a clean state." },
  { id:4, phase:"RECOVER",
    situation:"All 4 machines are clean. Two backup options available: last night at 23:00 (pre-infection, verified clean) and a 7-day-old backup.",
    question:"Which backup do you restore from?",
    options:[
      {id:"a",text:"Restore from the 23:00 backup — most recent clean state",correct:true,
       consequence:"Restoration complete. Only ~8 hours of work lost. Business back online with minimal data loss."},
      {id:"b",text:"Restore from the 7-day backup to be absolutely certain",correct:false,
       consequence:"A full week of work lost across all departments unnecessarily. The 23:00 backup was confirmed clean — this cost 5 days of data for zero security benefit."},
      {id:"c",text:"Ask staff to rebuild their work from memory and email history",correct:false,
       consequence:"Encrypted files cannot be opened without the decryption key. This approach fails completely and extends the incident by days."},
    ],
    lesson:"Restore from the most recent backup that predates the infection — not the discovery. The attack began hours before the SIEM fired." },
  { id:5, phase:"LESSONS LEARNED",
    situation:"Services fully restored. 6 hours of downtime total. Business is back online. The incident cost an estimated $180,000 in lost productivity.",
    question:"What is the essential final step?",
    options:[
      {id:"a",text:"Document a full incident report and implement security improvements",correct:true,
       consequence:"Root causes found: macro execution not blocked + 58% phishing click rate. Both immediately remediated. This attack path is now closed permanently."},
      {id:"b",text:"Resume normal operations — the incident is contained and resolved",correct:false,
       consequence:"No lessons captured. The phishing template circulates among other threat actors. Same attack succeeds again 4 months later."},
      {id:"c",text:"Discipline the employee who opened the phishing attachment",correct:false,
       consequence:"A blame culture forms. Staff stop reporting suspicious emails. The next phishing attempt goes unreported for 72 hours — far worse outcome than today."},
    ],
    lesson:"Post-incident review is not a formality — it turns a costly incident into a lasting improvement. Blame fixes nothing; process changes do." },
];

// ── Hamad data — Social Engineering Awareness ─────────────────────────────────
const HAMAD_SCENARIOS = [
  { id:1,
    type:"Email",
    from:"IT-Support <it.support@company-helpdesk.net>",
    subject:"⚠️ URGENT: Your account will be locked in 2 hours",
    body:"Dear Employee,\n\nOur system detected unusual activity on your account. Your access will be suspended in 2 hours unless you verify your credentials immediately.\n\nClick here to verify: http://company-portal-update.net/verify\n\nIT Security Team",
    question:"What should Hamad do?",
    redFlags:["Sender domain is 'company-helpdesk.net' — not the real company domain","Urgent deadline to create panic and stop you thinking clearly","Link goes to 'company-portal-update.net' — a different domain entirely","IT never asks you to verify credentials via email"],
    options:[
      {id:"a",text:"Click the link and verify — don't want to lose access",correct:false,why:"The sender domain and link domain are both fake. This is a credential phishing attack. Clicking gives attackers your password."},
      {id:"b",text:"Call the real IT helpdesk directly using the number from the company intranet",correct:true,why:"Always verify suspicious IT requests through official channels. The IT team can confirm whether the email is real in 30 seconds."},
      {id:"c",text:"Ignore and delete it",correct:false,why:"Ignoring is better than clicking, but you should report it to your security team. Other colleagues may have received it too."},
    ] },
  { id:2,
    type:"WhatsApp",
    from:"+974 5555 xxxx (unknown)",
    subject:"WhatsApp Message",
    body:"Hello, this is Ahmed from IT. We're doing an urgent security audit. Your employee account was flagged. I need your employee ID and the last 4 digits of your QID to verify your identity and unlock your account. Please respond quickly.",
    question:"What is the correct response?",
    redFlags:["Contacting via personal WhatsApp — IT uses official channels","Asking for personal ID details over an unverified channel","'Ahmed from IT' with no surname or employee number","Urgency is a manipulation tactic"],
    options:[
      {id:"a",text:"Send the information — it's just the last 4 digits, harmless",correct:false,why:"Combined with your employee ID, QID digits can enable identity fraud. IT will NEVER ask for this over WhatsApp. This is social engineering."},
      {id:"b",text:"Don't respond, block the number, and report to real IT security",correct:true,why:"Legitimate IT staff contact employees through official systems. Any unsolicited WhatsApp request for credentials is a social engineering attack."},
      {id:"c",text:"Ask them to call you on your desk phone instead",correct:false,why:"Closer, but still engaging with the attacker. The right move is to disconnect completely and report to your actual IT security team."},
    ] },
  { id:3,
    type:"Situation",
    from:"Parking lot, your office building",
    subject:"USB Drive Found",
    body:"Hamad arrives at work and finds a USB drive in the parking lot. It has a label on it: 'SALARY BONUSES — Q2 2025 — CONFIDENTIAL'. Hamad is curious and wonders if it might contain information about upcoming bonuses.",
    question:"What should Hamad do with the USB drive?",
    redFlags:["Found USB drives are a classic attack — attackers drop them deliberately","The enticing label (salary bonuses) is designed to make you plug it in","Even if it looks innocent, a USB can run malicious code the moment it's inserted","This attack is called 'baiting'"],
    options:[
      {id:"a",text:"Plug it into his work computer quickly just to check what's on it",correct:false,why:"This is exactly what the attacker wants. A malicious USB can execute code the instant it's plugged in — before you even see any files. Used in major infrastructure attacks worldwide."},
      {id:"b",text:"Take it home and check on his personal computer — safer that way",correct:false,why:"Still dangerous. A malicious USB can compromise personal computers too, and personal data is valuable to attackers. Never plug unknown USB drives into ANY device."},
      {id:"c",text:"Hand it to the IT security team without plugging it in anywhere",correct:true,why:"Correct. The IT security team can safely inspect it in an isolated environment. Never plug unknown USB drives into any device, ever. The curiosity bait is the attack."},
    ] },
  { id:4,
    type:"Email",
    from:"support@linkedin.com",
    subject:"Microsoft Security Alert — Action Required",
    body:"We've detected unusual sign-in activity on your Microsoft 365 account.\n\nTo secure your account, please verify your identity immediately:\n→ Click here to verify\n\nIf you don't verify within 24 hours, your account will be suspended.\n\nMicrosoft Security Team",
    question:"How should Hamad handle this?",
    redFlags:["Microsoft does NOT send security alerts via LinkedIn email","The sender would be @microsoft.com for real alerts, not @linkedin.com","Legitimate alerts appear inside the Microsoft 365 portal itself","'24 hours or suspended' is urgency manipulation"],
    options:[
      {id:"a",text:"Click the verification link — Microsoft security alerts are important",correct:false,why:"Microsoft never sends 365 security alerts through LinkedIn emails. This is credential phishing. The link leads to a fake Microsoft login page."},
      {id:"b",text:"Go directly to microsoft.com/security in a fresh browser tab and check there",correct:true,why:"Always navigate directly to official sites — never through links in emails. Real Microsoft security alerts appear inside your M365 account portal, not via email links."},
      {id:"c",text:"Forward it to IT and wait",correct:false,why:"Forwarding is good, but don't click the link yourself before forwarding. Go directly to the official site to check your account status independently."},
    ] },
  { id:5,
    type:"Situation",
    from:"Your colleague Sara (in person)",
    subject:"Tailgating / Access Control",
    body:"Hamad is entering the office building with his access card. Behind him is someone he vaguely recognises — maybe from another floor. They're carrying a heavy box and say 'Could you hold the door? I left my card at my desk.' They look like a normal employee.",
    question:"What should Hamad do?",
    redFlags:["This is called 'tailgating' — a physical social engineering attack","Appearing friendly and helpless creates social pressure to comply","Even if they look like an employee, you cannot verify they are one","Many data breaches begin with physical access gained this way"],
    options:[
      {id:"a",text:"Hold the door — they look like they work here and the box looks heavy",correct:false,why:"Social pressure is exactly what the attacker relies on. Tailgating is a real attack technique. Letting an unverified person through bypasses your entire physical security system."},
      {id:"b",text:"Apologise, let the door close, and direct them to reception to get a visitor pass",correct:true,why:"Correct — and the polite way to handle it. Reception can verify identity. Most real employees understand. If they react badly to a reasonable security request, that itself is a red flag."},
      {id:"c",text:"Call them out loudly in front of everyone",correct:false,why:"Confrontation can create conflict and isn't necessary. Politely directing them to reception achieves the security goal without an awkward scene. De-escalation is always better."},
    ] },
];

// ── Shared UI ─────────────────────────────────────────────────────────────────
type CharConfig = typeof CHARS[CharId];

function SevBadge({ sev }: { sev: string }) {
  const map: Record<string,[string,string]> = { critical:["#e03040","#ff000018"], high:["#f59e0b","#f59e0b18"], medium:["#60a5fa","#60a5fa15"], low:["#22c55e","#22c55e15"] };
  const [c, bg] = map[sev] ?? ["#aaa","#aaa10"];
  return <span style={{ fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:4, background:bg, border:`1px solid ${c}50`, color:c, letterSpacing:"0.12em", textTransform:"uppercase" }}>{sev}</span>;
}

// ── Intro Phase ───────────────────────────────────────────────────────────────
function IntroPhase({ char, onBegin }: { char: CharConfig; onBegin: () => void }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 62px)", padding:"40px 20px", textAlign:"center" }}>
      <img src={char.img} alt={char.name} style={{ width:140, height:140, objectFit:"cover", borderRadius:16, marginBottom:24, border:`2px solid ${char.color}35` }} />
      <div style={{ fontSize:9, color:`${char.color}70`, letterSpacing:"0.28em", textTransform:"uppercase", marginBottom:8, fontFamily:"'JetBrains Mono'" }}>{char.role}</div>
      <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, color:"#f5ede0", margin:"0 0 6px", fontWeight:600 }}>{char.name}</h1>
      <div style={{ fontSize:12, color:char.color, fontWeight:700, marginBottom:28, letterSpacing:"0.1em" }}>{char.title}</div>
      <div style={{ maxWidth:520, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"20px 24px", border:`1px solid ${char.color}15`, marginBottom:36 }}>
        <p style={{ fontSize:14, color:"#f5ede0bb", lineHeight:1.85, margin:0 }}>{char.welcome}</p>
      </div>
      <button onClick={onBegin}
        style={{ padding:"13px 42px", borderRadius:8, border:`1.5px solid ${char.color}55`, background:"transparent", color:char.color, fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
        onMouseEnter={e => (e.currentTarget.style.background = `${char.color}12`)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >Begin Training →</button>
    </div>
  );
}

// ── Result Phase ──────────────────────────────────────────────────────────────
function ResultPhase({ char, score, total, onBack }: { char: CharConfig; score: number; total: number; onBack: () => void }) {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 87 ? { label:"Expert Analyst", icon:"🎖", color:"#22c55e" } : pct >= 62 ? { label:"Competent Analyst", icon:"🥈", color:"#f59e0b" } : { label:"Keep Practising", icon:"📚", color:"#f87171" };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 62px)", padding:"40px 20px", textAlign:"center" }}>
      <div style={{ fontSize:56, marginBottom:16 }}>{grade.icon}</div>
      <div style={{ fontSize:9, color:`${char.color}70`, letterSpacing:"0.28em", textTransform:"uppercase", marginBottom:10, fontFamily:"'JetBrains Mono'" }}>Training Complete</div>
      <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:38, color:"#f5ede0", margin:"0 0 8px", fontWeight:600 }}>{grade.label}</h1>
      <div style={{ fontSize:52, fontWeight:700, color:grade.color, margin:"18px 0 6px", fontFamily:"'JetBrains Mono'" }}>
        {score}<span style={{ fontSize:24, color:`${grade.color}70` }}>/{total}</span>
      </div>
      <div style={{ fontSize:13, color:"#f5ede0aa", marginBottom:36 }}>{pct}% correct — {char.title}</div>
      <button onClick={onBack}
        style={{ padding:"13px 40px", borderRadius:8, border:`1.5px solid ${char.color}55`, background:"transparent", color:char.color, fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
        onMouseEnter={e => (e.currentTarget.style.background = `${char.color}12`)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >← Back to SOC</button>
    </div>
  );
}

// ── SAQR: Alert Triage ────────────────────────────────────────────────────────
function SaqrTraining({ char, onComplete }: { char: CharConfig; onComplete: (s: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const a = SAQR_ALERTS[idx];
  const chosen = answers[idx];
  const isCorrect = chosen === a.correct;
  const btnStyle = (id: string): React.CSSProperties => {
    const picked = chosen === id;
    const correct = id === a.correct;
    const base: React.CSSProperties = { padding:"12px 18px", borderRadius:8, cursor: chosen ? "default" : "pointer", fontSize:12, fontWeight:700, letterSpacing:"0.08em", border:"1.5px solid", flex:1, transition:"all .2s" };
    if (!chosen) return { ...base, background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.1)", color:"#f5ede0bb" };
    if (correct) return { ...base, background:"rgba(34,197,94,0.12)", borderColor:"rgba(34,197,94,0.4)", color:"#22c55e" };
    if (picked && !correct) return { ...base, background:"rgba(239,68,68,0.12)", borderColor:"rgba(239,68,68,0.4)", color:"#f87171" };
    return { ...base, background:"transparent", borderColor:"rgba(255,255,255,0.06)", color:"rgba(245,237,224,0.3)" };
  };
  const handleSelect = (id: string) => {
    if (chosen) return;
    setAnswers(prev => { const n = [...prev]; n[idx] = id; return n; });
  };
  const handleNext = () => {
    if (idx + 1 >= SAQR_ALERTS.length) {
      const finalAnswers = [...answers];
      const s = SAQR_ALERTS.reduce((acc, al, i) => acc + (finalAnswers[i] === al.correct ? 1 : 0), 0);
      onComplete(s);
    } else { setIdx(i => i + 1); }
  };
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"32px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <span style={{ fontSize:10, color:`${char.color}70`, fontFamily:"'JetBrains Mono'", letterSpacing:"0.15em" }}>ALERT {idx + 1} OF {SAQR_ALERTS.length}</span>
        <div style={{ display:"flex", gap:4 }}>
          {SAQR_ALERTS.map((_, i) => (
            <div key={i} style={{ width:20, height:4, borderRadius:2, background: i < idx ? (answers[i] === SAQR_ALERTS[i].correct ? "#22c55e" : "#ef4444") : i === idx ? char.color : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:14, border:"1px solid rgba(255,255,255,0.08)", padding:"22px 24px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"'JetBrains Mono'", marginBottom:4 }}>{a.time} UTC</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#f5ede0", marginBottom:4 }}>{a.type}</div>
          </div>
          <SevBadge sev={a.sev} />
        </div>
        <div style={{ display:"flex", gap:16, marginBottom:14 }}>
          <div><div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginBottom:2, letterSpacing:"0.1em" }}>SOURCE</div><div style={{ fontSize:11, color:"#f5ede0aa", fontFamily:"'JetBrains Mono'" }}>{a.src}</div></div>
          <div><div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginBottom:2, letterSpacing:"0.1em" }}>DESTINATION</div><div style={{ fontSize:11, color:"#f5ede0aa", fontFamily:"'JetBrains Mono'" }}>{a.dst}</div></div>
        </div>
        <pre style={{ background:"rgba(0,0,0,0.3)", borderRadius:8, padding:"12px 14px", fontFamily:"'JetBrains Mono'", fontSize:11, color:"#f5ede0cc", margin:0, whiteSpace:"pre-wrap", lineHeight:1.6, border:"1px solid rgba(255,255,255,0.06)" }}>{a.log}</pre>
      </div>
      <div style={{ fontSize:12, color:"#f5ede0bb", marginBottom:14, fontWeight:600 }}>Classify this alert:</div>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {[{id:"tp",label:"True Positive"},{id:"fp",label:"False Positive"},{id:"inv",label:"Needs Investigation"}].map(opt => (
          <button key={opt.id} style={btnStyle(opt.id)} onClick={() => handleSelect(opt.id)}
            onMouseEnter={e => { if (!chosen) e.currentTarget.style.borderColor = `${char.color}60`; }}
            onMouseLeave={e => { if (!chosen) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >{opt.label}</button>
        ))}
      </div>
      {chosen && (
        <div style={{ background: isCorrect ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", borderRadius:12, padding:"16px 18px", border:`1px solid ${isCorrect ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, marginBottom:20, animation:"fadeIn .3s ease" }}>
          <div style={{ fontSize:12, fontWeight:700, color: isCorrect ? "#22c55e" : "#f87171", marginBottom:8 }}>{isCorrect ? "✓ Correct" : "✗ Incorrect"}</div>
          <div style={{ fontSize:13, color:"#f5ede0aa", lineHeight:1.7 }}>{a.why}</div>
        </div>
      )}
      {chosen && (
        <button onClick={handleNext}
          style={{ padding:"11px 32px", borderRadius:8, border:`1.5px solid ${char.color}50`, background:"transparent", color:char.color, fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
          onMouseEnter={e => (e.currentTarget.style.background = `${char.color}12`)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >{idx + 1 >= SAQR_ALERTS.length ? "See Results →" : "Next Alert →"}</button>
      )}
    </div>
  );
}

// ── ORYX: Risk Assessment ─────────────────────────────────────────────────────
function OryxTraining({ char, onComplete }: { char: CharConfig; onComplete: (s: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Array<{l:number;i:number;c:string}>>([]);
  const [likelihood, setLikelihood] = useState(0);
  const [impact, setImpact] = useState(0);
  const [control, setControl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const sc = ORYX_SCENARIOS[idx];

  const canSubmit = likelihood > 0 && impact > 0 && control !== "";
  const handleSubmit = () => { setAnswers(prev => { const n = [...prev]; n[idx] = { l: likelihood, i: impact, c: control }; return n; }); setSubmitted(true); };

  const handleNext = () => {
    if (idx + 1 >= ORYX_SCENARIOS.length) {
      const s = answers.reduce((acc, a, i) => {
        const sc = ORYX_SCENARIOS[i];
        const lDiff = Math.abs(a.l - sc.expertL);
        const iDiff = Math.abs(a.i - sc.expertI);
        return acc + (lDiff <= 1 && iDiff <= 1 && a.c === sc.correctControl ? 1 : 0);
      }, 0);
      onComplete(s);
    } else { setIdx(i => i + 1); setLikelihood(0); setImpact(0); setControl(""); setSubmitted(false); }
  };

  const ratingBtns = (val: number, set: (n: number) => void, disabled: boolean) => (
    <div style={{ display:"flex", gap:6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => !disabled && set(n)} style={{ width:38, height:38, borderRadius:8, border:`1.5px solid ${val === n ? char.color : "rgba(255,255,255,0.12)"}`, background: val === n ? `${char.color}18` : "rgba(255,255,255,0.03)", color: val === n ? char.color : "#f5ede0aa", fontSize:14, fontWeight:700, cursor: disabled ? "default" : "pointer" }}>{n}</button>
      ))}
    </div>
  );

  const expertColor = (userVal: number, expertVal: number) => Math.abs(userVal - expertVal) <= 1 ? "#22c55e" : "#f87171";

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"32px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <span style={{ fontSize:10, color:`${char.color}70`, fontFamily:"'JetBrains Mono'", letterSpacing:"0.15em" }}>SCENARIO {idx + 1} OF {ORYX_SCENARIOS.length}</span>
        <div style={{ display:"flex", gap:4 }}>
          {ORYX_SCENARIOS.map((_, i) => <div key={i} style={{ width:20, height:4, borderRadius:2, background: i < idx ? char.color : i === idx ? char.color : "rgba(255,255,255,0.1)", opacity: i < idx ? 0.5 : 1 }} />)}
        </div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:14, border:"1px solid rgba(255,255,255,0.08)", padding:"22px 24px", marginBottom:22 }}>
        <h3 style={{ fontSize:17, fontWeight:700, color:"#f5ede0", margin:"0 0 10px" }}>{sc.title}</h3>
        <p style={{ fontSize:13, color:"#f5ede0aa", lineHeight:1.7, margin:0 }}>{sc.detail}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div style={{ background:"rgba(255,255,255,0.025)", borderRadius:12, padding:"16px 18px", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:"0.15em", marginBottom:12 }}>LIKELIHOOD (1–5)</div>
          {ratingBtns(likelihood, setLikelihood, submitted)}
          {submitted && <div style={{ marginTop:10, fontSize:11, color: expertColor(likelihood, sc.expertL) }}>Your: {likelihood} · Expert: {sc.expertL} {Math.abs(likelihood - sc.expertL) <= 1 ? "✓" : `(off by ${Math.abs(likelihood - sc.expertL)})`}</div>}
        </div>
        <div style={{ background:"rgba(255,255,255,0.025)", borderRadius:12, padding:"16px 18px", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:"0.15em", marginBottom:12 }}>IMPACT (1–5)</div>
          {ratingBtns(impact, setImpact, submitted)}
          {submitted && <div style={{ marginTop:10, fontSize:11, color: expertColor(impact, sc.expertI) }}>Your: {impact} · Expert: {sc.expertI} {Math.abs(impact - sc.expertI) <= 1 ? "✓" : `(off by ${Math.abs(impact - sc.expertI)})`}</div>}
        </div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.025)", borderRadius:12, padding:"16px 18px", border:"1px solid rgba(255,255,255,0.07)", marginBottom:20 }}>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:"0.15em", marginBottom:12 }}>RECOMMENDED CONTROL</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {sc.controls.map(opt => {
            const isChosen = control === opt.id;
            const isCorrect = opt.id === sc.correctControl;
            let bg = "rgba(255,255,255,0.03)", border = "rgba(255,255,255,0.1)", color = "#f5ede0bb";
            if (submitted) {
              if (isCorrect) { bg = "rgba(34,197,94,0.1)"; border = "rgba(34,197,94,0.35)"; color = "#22c55e"; }
              else if (isChosen) { bg = "rgba(239,68,68,0.1)"; border = "rgba(239,68,68,0.35)"; color = "#f87171"; }
            } else if (isChosen) { bg = `${char.color}18`; border = `${char.color}50`; color = char.color; }
            return (
              <button key={opt.id} onClick={() => !submitted && setControl(opt.id)}
                style={{ padding:"10px 14px", borderRadius:8, border:`1.5px solid ${border}`, background:bg, color, fontSize:12, textAlign:"left", cursor: submitted ? "default" : "pointer", fontWeight: isChosen || (submitted && isCorrect) ? 600 : 400 }}
              >{opt.label}</button>
            );
          })}
        </div>
      </div>
      {submitted && <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"16px 18px", border:"1px solid rgba(255,255,255,0.1)", marginBottom:20 }}><p style={{ fontSize:13, color:"#f5ede0aa", lineHeight:1.75, margin:0 }}>{sc.why}</p></div>}
      {!submitted ? (
        <button onClick={handleSubmit} disabled={!canSubmit}
          style={{ padding:"11px 32px", borderRadius:8, border:`1.5px solid ${canSubmit ? char.color+"60" : "rgba(255,255,255,0.1)"}`, background:"transparent", color: canSubmit ? char.color : "rgba(255,255,255,0.25)", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor: canSubmit ? "pointer" : "default", fontFamily:"'JetBrains Mono'" }}
        >Submit Assessment</button>
      ) : (
        <button onClick={handleNext}
          style={{ padding:"11px 32px", borderRadius:8, border:`1.5px solid ${char.color}50`, background:"transparent", color:char.color, fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
          onMouseEnter={e => (e.currentTarget.style.background = `${char.color}12`)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >{idx + 1 >= ORYX_SCENARIOS.length ? "See Results →" : "Next Scenario →"}</button>
      )}
    </div>
  );
}

// ── THALAB: Forensic Analysis ─────────────────────────────────────────────────
function ThalabTraining({ char, onComplete }: { char: CharConfig; onComplete: (s: number) => void }) {
  const shuffled = useState(() => [...THALAB_ENTRIES].sort(() => Math.random() - 0.5))[0];
  const [tags, setTags] = useState<Record<number, "attack" | "normal">>({});
  const [revealed, setRevealed] = useState(false);

  const tagged = Object.keys(tags).length;
  const allTagged = tagged === THALAB_ENTRIES.length;

  const handleTag = (id: number, val: "attack" | "normal") => {
    if (revealed) return;
    setTags(prev => ({ ...prev, [id]: val }));
  };

  const handleReveal = () => {
    const s = THALAB_ENTRIES.reduce((acc, e) => acc + (tags[e.id] === (e.isAttack ? "attack" : "normal") ? 1 : 0), 0);
    setRevealed(true);
    setTimeout(() => onComplete(s), 4000);
  };

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:10, color:`${char.color}70`, fontFamily:"'JetBrains Mono'", letterSpacing:"0.15em", marginBottom:4 }}>INCIDENT LOG ANALYSIS</div>
          <div style={{ fontSize:12, color:"#f5ede0aa" }}>Tag each entry: part of the attack chain, or normal activity?</div>
        </div>
        <div style={{ fontSize:12, color:"#f5ede0aa" }}><span style={{ color:char.color, fontWeight:700 }}>{tagged}</span>/{THALAB_ENTRIES.length} tagged</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
        {shuffled.map(entry => {
          const tag = tags[entry.id];
          const correct = revealed ? (entry.isAttack ? "attack" : "normal") : null;
          const userCorrect = revealed && tag === correct;
          let borderColor = "rgba(255,255,255,0.08)";
          let bgColor = "rgba(255,255,255,0.025)";
          if (tag === "attack" && !revealed) { borderColor = "rgba(239,68,68,0.4)"; bgColor = "rgba(239,68,68,0.08)"; }
          if (tag === "normal" && !revealed) { borderColor = "rgba(34,197,94,0.4)"; bgColor = "rgba(34,197,94,0.08)"; }
          if (revealed) {
            if (userCorrect) { borderColor = "rgba(34,197,94,0.4)"; bgColor = "rgba(34,197,94,0.06)"; }
            else { borderColor = "rgba(239,68,68,0.4)"; bgColor = "rgba(239,68,68,0.06)"; }
          }
          return (
            <div key={entry.id} style={{ background:bgColor, borderRadius:10, border:`1px solid ${borderColor}`, padding:"12px 15px", transition:"all .2s" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ flexShrink:0, fontFamily:"'JetBrains Mono'", fontSize:11, color:`${char.color}80`, paddingTop:1, minWidth:40 }}>{entry.time}</div>
                <div style={{ flex:1, fontSize:12, color:"#f5ede0cc", lineHeight:1.5 }}>{entry.event}</div>
                {!revealed && (
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <button onClick={() => handleTag(entry.id, "attack")} style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${tag === "attack" ? "rgba(239,68,68,0.6)" : "rgba(239,68,68,0.25)"}`, background: tag === "attack" ? "rgba(239,68,68,0.15)" : "transparent", color: tag === "attack" ? "#f87171" : "rgba(239,68,68,0.5)", fontSize:10, fontWeight:700, cursor:"pointer", letterSpacing:"0.08em" }}>ATTACK</button>
                    <button onClick={() => handleTag(entry.id, "normal")} style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${tag === "normal" ? "rgba(34,197,94,0.6)" : "rgba(34,197,94,0.25)"}`, background: tag === "normal" ? "rgba(34,197,94,0.15)" : "transparent", color: tag === "normal" ? "#22c55e" : "rgba(34,197,94,0.5)", fontSize:10, fontWeight:700, cursor:"pointer", letterSpacing:"0.08em" }}>NORMAL</button>
                  </div>
                )}
                {revealed && (
                  <span style={{ fontSize:10, fontWeight:700, color: userCorrect ? "#22c55e" : "#f87171", flexShrink:0 }}>{userCorrect ? "✓" : "✗"}</span>
                )}
              </div>
              {revealed && !userCorrect && (
                <div style={{ marginTop:8, fontSize:11, color:"#f5ede0aa", paddingLeft:52, lineHeight:1.6 }}>
                  <span style={{ color:"rgba(255,255,255,0.4)" }}>Correct: </span>{entry.label}
                </div>
              )}
              {revealed && userCorrect && entry.isAttack && (
                <div style={{ marginTop:6, fontSize:11, color:"rgba(34,197,94,0.7)", paddingLeft:52 }}>{entry.label}</div>
              )}
            </div>
          );
        })}
      </div>
      {!revealed && allTagged && (
        <button onClick={handleReveal}
          style={{ padding:"11px 32px", borderRadius:8, border:`1.5px solid ${char.color}55`, background:"transparent", color:char.color, fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
          onMouseEnter={e => (e.currentTarget.style.background = `${char.color}12`)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >Analyze →</button>
      )}
      {revealed && <div style={{ textAlign:"center", fontSize:13, color:"#f5ede0aa", padding:"12px 0" }}>Calculating results…</div>}
    </div>
  );
}

// ── HISAN: Incident Response ───────────────────────────────────────────────────
function HisanTraining({ char, onComplete }: { char: CharConfig; onComplete: (s: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const step = HISAN_STEPS[idx];
  const chosen = step.options.find(o => o.id === selected);
  const isCorrect = chosen?.correct ?? false;

  const handleSelect = (id: string) => {
    if (selected) return;
    setSelected(id);
    if (step.options.find(o => o.id === id)?.correct) setScore(s => s + 1);
  };
  const handleNext = () => {
    if (idx + 1 >= HISAN_STEPS.length) {
      const finalScore = score + (chosen?.correct ? 0 : 0);
      const s = score; // already updated by setState
      onComplete(s);
    } else { setIdx(i => i + 1); setSelected(null); }
  };

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"32px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:9, color:`${char.color}`, fontWeight:700, fontFamily:"'JetBrains Mono'", letterSpacing:"0.15em", background:`${char.color}15`, border:`1px solid ${char.color}35`, padding:"3px 10px", borderRadius:4 }}>{step.phase}</span>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"'JetBrains Mono'" }}>Step {idx + 1} of {HISAN_STEPS.length}</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {HISAN_STEPS.map((_, i) => <div key={i} style={{ width:20, height:4, borderRadius:2, background: i < idx ? (score > idx - 1 ? "#22c55e" : "#f87171") : i === idx ? char.color : "rgba(255,255,255,0.1)" }} />)}
        </div>
      </div>
      <div style={{ background:"rgba(239,68,68,0.06)", borderRadius:14, border:"1px solid rgba(239,68,68,0.2)", padding:"20px 22px", marginBottom:20 }}>
        <div style={{ fontSize:10, color:"rgba(239,68,68,0.7)", letterSpacing:"0.15em", fontFamily:"'JetBrains Mono'", marginBottom:8 }}>🚨 ACTIVE INCIDENT</div>
        <p style={{ fontSize:13.5, color:"#f5ede0cc", lineHeight:1.8, margin:0 }}>{step.situation}</p>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:"#f5ede0", marginBottom:14 }}>{step.question}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
        {step.options.map(opt => {
          const picked = selected === opt.id;
          let bg = "rgba(255,255,255,0.03)", border = "rgba(255,255,255,0.1)", color = "#f5ede0bb";
          if (selected) {
            if (opt.correct) { bg = "rgba(34,197,94,0.1)"; border = "rgba(34,197,94,0.4)"; color = "#22c55e"; }
            else if (picked) { bg = "rgba(239,68,68,0.1)"; border = "rgba(239,68,68,0.4)"; color = "#f87171"; }
          }
          return (
            <button key={opt.id} onClick={() => handleSelect(opt.id)}
              style={{ padding:"13px 16px", borderRadius:10, border:`1.5px solid ${border}`, background:bg, color, fontSize:13, textAlign:"left", cursor: selected ? "default" : "pointer", fontWeight: picked || (!!selected && opt.correct) ? 600 : 400, transition:"all .2s" }}
              onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = `${char.color}50`; }}
              onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            ><span style={{ opacity:.45, marginRight:8 }}>{opt.id.toUpperCase()}.</span>{opt.text}</button>
          );
        })}
      </div>
      {selected && chosen && (
        <div style={{ background: isCorrect ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", borderRadius:12, border:`1px solid ${isCorrect ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, padding:"16px 18px", marginBottom:16, animation:"fadeIn .3s ease" }}>
          <div style={{ fontSize:11, fontWeight:700, color: isCorrect ? "#22c55e" : "#f87171", marginBottom:8 }}>{isCorrect ? "✓ Correct" : "✗ Wrong decision"}</div>
          <div style={{ fontSize:13, color:"#f5ede0aa", lineHeight:1.7, marginBottom:10 }}><strong>Consequence: </strong>{chosen.consequence}</div>
          <div style={{ fontSize:12, color:`${char.color}cc`, lineHeight:1.7, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:10 }}><strong>Lesson: </strong>{step.lesson}</div>
        </div>
      )}
      {selected && (
        <button onClick={handleNext}
          style={{ padding:"11px 32px", borderRadius:8, border:`1.5px solid ${char.color}50`, background:"transparent", color:char.color, fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
          onMouseEnter={e => (e.currentTarget.style.background = `${char.color}12`)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >{idx + 1 >= HISAN_STEPS.length ? "See Results →" : "Next Decision →"}</button>
      )}
    </div>
  );
}

// ── HAMAD: Social Engineering Awareness ──────────────────────────────────────
function HamadTraining({ char, onComplete }: { char: CharConfig; onComplete: (s: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const sc = HAMAD_SCENARIOS[idx];
  const chosen = answers[idx];

  const msgBg: Record<string, string> = { Email:"#0a1628", WhatsApp:"#0a2010", Situation:"#1a1000" };
  const msgBorder: Record<string, string> = { Email:"rgba(96,165,250,0.2)", WhatsApp:"rgba(34,197,94,0.2)", Situation:"rgba(245,158,11,0.2)" };

  const handleSelect = (id: string) => {
    if (answers[idx]) return;
    setAnswers(prev => { const n = [...prev]; n[idx] = id; return n; });
  };
  const handleNext = () => {
    if (idx + 1 >= HAMAD_SCENARIOS.length) {
      const finalAnswers = [...answers];
      const s = HAMAD_SCENARIOS.reduce((acc, sc, i) => acc + (finalAnswers[i] === sc.options.find(o => o.correct)?.id ? 1 : 0), 0);
      onComplete(s);
    } else { setIdx(i => i + 1); }
  };

  const correctOpt = sc.options.find(o => o.correct);
  const chosenOpt = sc.options.find(o => o.id === chosen);

  return (
    <div style={{ maxWidth:660, margin:"0 auto", padding:"32px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <span style={{ fontSize:10, color:`${char.color}70`, fontFamily:"'JetBrains Mono'", letterSpacing:"0.15em" }}>SCENARIO {idx + 1} OF {HAMAD_SCENARIOS.length}</span>
        <div style={{ display:"flex", gap:4 }}>
          {HAMAD_SCENARIOS.map((_, i) => <div key={i} style={{ width:20, height:4, borderRadius:2, background: i < idx ? char.color : i === idx ? char.color : "rgba(255,255,255,0.1)", opacity: i < idx ? 0.5 : 1 }} />)}
        </div>
      </div>

      {/* Message simulation */}
      <div style={{ background: msgBg[sc.type] || "#0a0a1a", borderRadius:14, border:`1px solid ${msgBorder[sc.type] || "rgba(96,165,250,0.2)"}`, padding:"18px 20px", marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, paddingBottom:10, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", letterSpacing:"0.1em" }}>{sc.type.toUpperCase()}</span>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontFamily:"'JetBrains Mono'" }}>{sc.from}</span>
        </div>
        {sc.type !== "Situation" && <div style={{ fontSize:13, fontWeight:600, color:"#f5ede0", marginBottom:10 }}>{sc.subject}</div>}
        <pre style={{ fontFamily:"'DM Sans', sans-serif", fontSize:13, color:"#f5ede0cc", lineHeight:1.8, margin:0, whiteSpace:"pre-wrap" }}>{sc.body}</pre>
      </div>

      <div style={{ fontSize:13, fontWeight:600, color:"#f5ede0", marginBottom:14 }}>{sc.question}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:18 }}>
        {sc.options.map(opt => {
          const picked = chosen === opt.id;
          let bg = "rgba(255,255,255,0.03)", border = "rgba(255,255,255,0.1)", color = "#f5ede0bb";
          if (chosen) {
            if (opt.correct) { bg = "rgba(34,197,94,0.1)"; border = "rgba(34,197,94,0.4)"; color = "#22c55e"; }
            else if (picked) { bg = "rgba(239,68,68,0.1)"; border = "rgba(239,68,68,0.4)"; color = "#f87171"; }
          }
          return (
            <button key={opt.id} onClick={() => handleSelect(opt.id)}
              style={{ padding:"13px 16px", borderRadius:10, border:`1.5px solid ${border}`, background:bg, color, fontSize:13, textAlign:"left", cursor: chosen ? "default" : "pointer", fontWeight: picked || (!!chosen && opt.correct) ? 600 : 400, transition:"all .2s" }}
              onMouseEnter={e => { if (!chosen) e.currentTarget.style.borderColor = `${char.color}50`; }}
              onMouseLeave={e => { if (!chosen) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            ><span style={{ opacity:.4, marginRight:8 }}>{opt.id.toUpperCase()}.</span>{opt.text}</button>
          );
        })}
      </div>

      {chosen && chosenOpt && (
        <div style={{ animation:"fadeIn .3s ease" }}>
          <div style={{ background: chosenOpt.correct ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", borderRadius:12, border:`1px solid ${chosenOpt.correct ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color: chosenOpt.correct ? "#22c55e" : "#f87171", marginBottom:6 }}>{chosenOpt.correct ? "✓ Good call" : "✗ Not quite"}</div>
            <div style={{ fontSize:13, color:"#f5ede0aa", lineHeight:1.7 }}>{chosenOpt.why}</div>
          </div>
          {/* Red flags */}
          <div style={{ background:"rgba(245,158,11,0.05)", borderRadius:10, border:"1px solid rgba(245,158,11,0.2)", padding:"12px 15px", marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#f59e0b", letterSpacing:"0.12em", marginBottom:8 }}>🚩 RED FLAGS IN THIS SCENARIO</div>
            {sc.redFlags.map((f, i) => <div key={i} style={{ fontSize:12, color:"#f5ede0aa", lineHeight:1.7, paddingLeft:12, borderLeft:"2px solid rgba(245,158,11,0.3)", marginBottom:4 }}>{f}</div>)}
          </div>
          <button onClick={handleNext}
            style={{ padding:"11px 32px", borderRadius:8, border:`1.5px solid ${char.color}50`, background:"transparent", color:char.color, fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'JetBrains Mono'" }}
            onMouseEnter={e => (e.currentTarget.style.background = `${char.color}12`)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >{idx + 1 >= HAMAD_SCENARIOS.length ? "See Results →" : "Next Scenario →"}</button>
        </div>
      )}
    </div>
  );
}


// ── Main export ───────────────────────────────────────────────────────────────
export default function Training({ characterId }: { characterId: string }) {
  const id = characterId as CharId;
  const char = CHARS[id];
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "training" | "result">("intro");
  const [score, setScore] = useState(0);

  const handleComplete = (s: number) => {
    setScore(s);
    setPhase("result");
    // Award badge if passed (>50%)
    const total = id === "saqr" ? SAQR_ALERTS.length : id === "oryx" ? ORYX_SCENARIOS.length : id === "thalab" ? THALAB_ENTRIES.length : id === "hamad" ? HAMAD_SCENARIOS.length : HISAN_STEPS.length;
    if (s / total >= 0.5) {
      try {
        const existing = new Set(JSON.parse(localStorage.getItem("cm-badges") || "[]"));
        existing.add(id);
        localStorage.setItem("cm-badges", JSON.stringify([...existing]));
      } catch {}
    }
  };

  if (!char) return <div style={{ color:"#f5ede0", padding:40 }}>Character not found.</div>;

  const total = id === "saqr" ? SAQR_ALERTS.length : id === "oryx" ? ORYX_SCENARIOS.length : id === "thalab" ? THALAB_ENTRIES.length : HISAN_STEPS.length;

  return (
    <div style={{ minHeight:"100vh", background:char.bg, fontFamily:"'DM Sans', sans-serif", color:"#f5ede0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }`}</style>
      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:50, background: "rgba(0,0,0,0.45)", backdropFilter:"blur(10px)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"0 24px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.45)", fontSize:12, cursor:"pointer", fontFamily:"'JetBrains Mono'", letterSpacing:"0.1em", display:"flex", alignItems:"center", gap:6 }}>← Back to SOC</button>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src={char.img} alt={char.name} style={{ width:28, height:28, borderRadius:6, objectFit:"cover" }} />
          <span style={{ fontSize:13, fontWeight:600, color:"#f5ede0" }}>{char.name}</span>
          <span style={{ fontSize:11, color:char.color, fontFamily:"'JetBrains Mono'" }}>— {char.title}</span>
        </div>
        {phase === "training" && (
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"'JetBrains Mono'" }}>
            {score}/{total} correct
          </div>
        )}
        {phase !== "training" && <div style={{ width:100 }} />}
      </div>
      {/* Content */}
      {phase === "intro"    && <IntroPhase char={char} onBegin={() => setPhase("training")} />}
      {phase === "training" && id === "saqr"   && <SaqrTraining   char={char} onComplete={handleComplete} />}
      {phase === "training" && id === "oryx"   && <OryxTraining   char={char} onComplete={handleComplete} />}
      {phase === "training" && id === "thalab" && <ThalabTraining char={char} onComplete={handleComplete} />}
      {phase === "training" && id === "hisan"  && <HisanTraining  char={char} onComplete={handleComplete} />}
  {phase === "training" && id === "hamad"  && <HamadTraining  char={char} onComplete={handleComplete} />}
      {phase === "result"   && <ResultPhase char={char} score={score} total={total} onBack={() => router.back()} />}
    </div>
  );
}