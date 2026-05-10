"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

const rand = (a: number, b: number): number => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

// ANALYSTS - roles are now localized
const ANALYSTS_BASE = [
  { id: "saqr",  emoji: "🦅", img: "/characters/saqr.GIF",profile:"/characters/falcon.jpeg",  name: "Saqr",   full: "Saker Falcon",   roleKey: "saqr",   color: "#D5B893" },
  { id: "oryx",  emoji: "🦌", img: "/characters/oryx.GIF",profile:"/characters/oryx.jpeg",  name: "Oryx",   full: "Arabian Oryx",   roleKey: "oryx",   color: "#6366f1" },
  { id: "thalab",emoji: "🦊", img: "/characters/fox.GIF",profile:"/characters/fox.jpeg",   name: "Tha'lab",full: "Red Fox",         roleKey: "thalab", color: "#f59e0b" },
  { id: "hisan", emoji: "🐴", img: "/characters/hisan.GIF",profile:"/characters/ArabianHorse.jpeg", name: "Hisan",  full: "Arabian Horse",  roleKey: "hisan",  color: "#ef4444" },
];

// Hamad — the victim employee. Add /characters/hamad.GIF + /characters/hamad.jpeg to your assets.
const HAMAD = {
  id: "hamad", emoji: "🧑‍💻",
  img: "/characters/hamad.GIF",
  profile: "/avatar.png",
  name: "Hamad", full: "Employee", roleKey: "hamad", color: "#60a5fa",
};

// Per-threat victim scenario: when Hamad sends a distress message, which analyst replies, and what Hamad says after recovery
const HAMAD_SCENARIOS: Record<string, { step: number; msg: string; analystId: string; analystReply: string; recovery: string }> = {
  phishing: {
    step: 1,
    msg: "I think I made a mistake 😰 An email from 'IT Support' asked me to verify my login. I entered my credentials before I realised it looked off... what do I do?",
    analystId: "saqr",
    analystReply: "Hamad — stop touching the keyboard. Change your password RIGHT NOW from your phone, not the laptop. We're isolating your machine from the network.",
    recovery: "Password changed, machine is clean. Thank you for acting so fast. I'll never enter credentials from an email link again — lesson absolutely learned.",
  },
  virus: {
    step: 0,
    msg: "My antivirus just went off like an alarm and now everything is crawling. I didn't open anything weird... should I restart it?",
    analystId: "hisan",
    analystReply: "Hamad — do NOT restart. Leave it exactly as is, we need the memory state. Disconnect from WiFi physically if you can. IT is on the way to you now.",
    recovery: "Reimaged from yesterday's backup. Lost maybe 15 minutes of work. You all responded in under 4 minutes — really impressive.",
  },
  ransomware: {
    step: 2,
    msg: "🚨 MY FILES. Everything in my documents folder is gone — replaced with something called README_DECRYPT.txt. There's a Bitcoin address on my screen. My entire project is encrypted.",
    analystId: "saqr",
    analystReply: "Hamad — do NOT pay. Hard shutdown your machine right now, hold the power button. We have a 6am backup of everything. Your data is safe. Do not touch it.",
    recovery: "6am backup fully restored. Lost about 3 hours of work but everything is recoverable. Hard lesson on attachments. Thank you all — this was terrifying.",
  },
  rootkit: {
    step: 1,
    msg: "This is strange — my antivirus icon disappeared from the taskbar and I can't reinstall it. Also getting an unusual login prompt I've never seen before.",
    analystId: "thalab",
    analystReply: "Hamad, that's a rootkit masking itself. Stop everything immediately. We'll need to reimage your machine — do not save or copy any files, they may be compromised.",
    recovery: "Fresh OS image deployed, network drive backup restored. Rootkits are nasty — really glad the team caught the signature early.",
  },
  ddos: {
    step: 2,
    msg: "I'm on a live client call and all our web apps are down — they can't access anything. Getting a lot of pressure. Any idea on restoration ETA? What do I tell them?",
    analystId: "oryx",
    analystReply: "Hamad — tell them we're experiencing a service disruption and estimate 15-20 minutes to full restoration. Don't mention DDoS. We're rerouting traffic now.",
    recovery: "Services back up. Client stayed on the call — 18 minutes was acceptable to them. They didn't lose confidence. Thanks for handling it calmly.",
  },
};

const SCRIPT_VARIANTS: Record<string, Array<{ radio: string[]; stepChat: [string, string][] }>> = {
  virus: [
    {
      radio: [
        "ALERT: Virus detected disguised as invoice PDF — multiple users on email gateway flagged",
        "WARNING: Payload executing from outlook.exe on WKSTN-14 — process injection underway",
        "DETECTION: Memory injection into system process confirmed — antivirus signatures failing",
        "PROPAGATION: Virus copying to 6 mapped network shares — write activity accelerating",
        "CONTAINMENT: Network isolation applied — scanning all endpoints for persistence artifacts",
      ],
      stepChat: [
        ["Tracking the signature — it's hitting multiple users from the same spoofed sender domain.", "Risk HIGH. If this reaches the backup server we lose 72 hours of snapshots."],
        ["Confirmed execution on WKSTN-14. Checking for lateral movement indicators now.", "Running memory forensics — payload appears fileless. No disk writes detected yet."],
        ["Memory injection into NTDLL.DLL confirmed — this is why AV missed it entirely.", "Coordinating with WKSTN-14 user. Isolating the endpoint remotely right now."],
        ["6 mapped drives affected. Pulling write logs to trace exactly which files were modified.", "Threat contained on primary endpoint. Starting remediation playbook — ETA 40 minutes."],
        ["Baseline restored. Virus variant catalogued and submitted to threat intelligence feed.", "Post-incident report drafted. Recommending mandatory file attachment filtering policy update."],
      ],
    },
    {
      radio: [
        "SUSPICIOUS: Unknown executable auto-ran from unregistered removable media on WKSTN-07",
        "PROPAGATION: Virus spreading via autorun to mapped network shares — 3 shares compromised",
        "EVASION: Malware deleting own files post-execution — memory-only persistence confirmed",
        "SPREAD: Admin shares being probed — network-wide propagation attempt underway",
        "ISOLATION: Affected segment quarantined — full environment scan in progress",
      ],
      stepChat: [
        ["USB autorun event on WKSTN-07. Checking physical access logs for who used that machine today.", "Threat is a dropper variant. The USB was likely left in the building intentionally — physical security involved."],
        ["3 shares compromised. Pushing autorun disable policy to all endpoints now via GPO.", "Fileless execution confirmed — capturing memory dump before isolation destroys evidence."],
        ["Malware wiped its own footprint. Working from memory artifacts and network logs only.", "Physical security flagged — that USB device is not in our registered asset inventory."],
        ["Admin share probe blocked. Temporary SMB traffic restrictions applied at perimeter firewall.", "Quarantine complete. No exfiltration indicators — this appears to be a destructive payload, not espionage."],
        ["Remediation complete. USB device controls being added to the next security policy review cycle.", "Incident documented. Recommending physical security audit for all unsecured USB access points in the building."],
      ],
    },
  ],
  phishing: [
    {
      radio: [
        "WARNING: Credential harvesting page detected — users redirected from HR impersonation email",
        "ALERT: User credentials submitted to external domain — account compromise confirmed",
        "DETECTION: Attacker authenticated using harvested credentials from external IP in Eastern Europe",
        "LATERAL: Compromised account accessing resources significantly beyond normal user scope",
        "RECOVERY: Account locked, sessions terminated, password reset and MFA re-enrollment initiated",
      ],
      stepChat: [
        ["Phishing domain mimics our HR portal exactly — even has a valid SSL cert. Blocking domain now.", "3 users clicked. Confirming who submitted credentials vs who just opened the link."],
        ["One credential set confirmed stolen — active login from Eastern European IP right now.", "Terminating all active sessions for the compromised account immediately across all services."],
        ["Attacker accessed shared drive and pulled 4 files within 8 minutes of logging in.", "Files were sales contracts. Notifying legal team and affected client accounts now."],
        ["Account pivot attempted — they tried the same credentials on the CRM system. Blocked.", "Email gateway rule deployed — blocking sender domain and all registered variants."],
        ["Account fully secured, password reset complete, phishing URL globally blacklisted.", "Scheduling awareness training for all staff who received this email — roughly 140 people."],
      ],
    },
    {
      radio: [
        "ALERT: Mass phishing campaign — 14 users received fake IT department password reset requests",
        "CONFIRMATION: 2 accounts compromised — credentials entered on spoofed internal IT portal",
        "BREACH: External login with valid stolen credentials — MFA push notification accepted",
        "ESCALATION: Compromised account accessing admin panel and exporting user directory",
        "CONTAINMENT: Accounts locked, tokens revoked, breach notification process started",
      ],
      stepChat: [
        ["14 recipients, 2 clicked the link. Spoofed page matches our real IT portal design exactly.", "Attacker harvested session tokens too — standard password reset alone won't be sufficient here."],
        ["MFA push was approved — one victim accepted it on their phone at 3am local time.", "SIEM shows login from Amsterdam — clearly not the real user. Blocking the session now."],
        ["Admin panel accessed — they're actively browsing user lists and export functionality.", "Hard-blocking the session. Forcing MFA re-enrollment on all affected accounts immediately."],
        ["Attacker exported 200 user records before we blocked them. Data breach assessment started.", "Compliance team notified. Checking breach notification obligations under applicable regulations."],
        ["All accounts secured. Configuring SIEM alerts for off-hours admin panel access going forward.", "Drafting communication to the 200 users whose records were exported. Legal is reviewing the language."],
      ],
    },
  ],
  ransomware: [
    {
      radio: [
        "CRITICAL: Ransomware dropper on email gateway — disguised as shipping notification attachment",
        "EXECUTION: Ransomware binary unpacked in memory — encryption keys being generated",
        "STAGING: Ransomware mapping 23 network shares before beginning mass encryption",
        "ENCRYPTION: 847 files encrypted in under 3 minutes — spread continues",
        "RECOVERY: Backup restoration initiated — environment being rebuilt from clean 6am snapshot",
      ],
      stepChat: [
        ["Ransomware family identified — known variant that targets backup systems first. Isolating now.", "Risk CRITICAL. If backup server is reachable from this host, we could lose everything. Checking now."],
        ["Encryption keys generated in memory only — never written to disk. Signature-based AV missed it completely.", "Running Yara rules on memory dump. Attempting to extract the key before encryption begins."],
        ["Ransomware mapped 23 shares. Blocking SMB traffic from the host — cutting off the spread path.", "SMB blocked. 847 files encrypted before we cut access — could have been much worse without the fast response."],
        ["Ransom note dropped in every affected directory. Not paying — initiating full recovery procedure.", "Verified backup integrity at the 6am snapshot — all critical data is fully recoverable."],
        ["Restoration complete. Post-mortem scheduled. Email filtering hardened to block this attachment class.", "Cyber insurance notified. Incident classified as contained — no data confirmed exfiltrated to attacker."],
      ],
    },
    {
      radio: [
        "ALERT: RDP brute-force succeeded — external attacker gained foothold on exposed port 3389",
        "STAGING: Attacker downloading ransomware toolkit via RDP — 47MB transfer in progress",
        "PREPARATION: Ransomware disabling Volume Shadow Copies and all backup agents",
        "EXECUTION: Mass file encryption across 6 servers simultaneously — coordinated attack",
        "RESPONSE: DR site activated — severing connections and beginning full restoration",
      ],
      stepChat: [
        ["RDP on port 3389 exposed to the internet with no account lockout policy. Brute-forced in 4 hours.", "Attacker is inside. Closing RDP externally now — too late to prevent initial access, containing spread."],
        ["47MB download identified as a ransomware toolkit plus Cobalt Strike beacon deployment.", "Isolating the compromised server from the rest of the environment via network ACL changes."],
        ["Volume Shadow Copies deleted. Backup agent on this server killed by the ransomware preparation script.", "DR site confirmed clean. Verifying backup integrity before we cut over from the primary environment."],
        ["Encryption across 6 servers simultaneously — this is clearly a professional, organised threat group.", "All affected servers isolated. DR site coming online now. No customer-facing downtime expected."],
        ["DR site fully active. Services restored. RDP closed permanently, MFA enforced on all remote access.", "Engaging threat intelligence — this group may be targeting others in our sector. Sharing IOCs with ISAC."],
      ],
    },
  ],
  rootkit: [
    {
      radio: [
        "ANOMALY: Kernel-level hook detected — rootkit attempting to hide processes from security tools",
        "PERSISTENCE: Rootkit modifying boot sector — achieving persistence below the operating system",
        "EVASION: Security tool processes being actively terminated by rootkit self-defence mechanisms",
        "ESCALATION: Rootkit granting SYSTEM privileges to previously low-privilege malware process",
        "REMEDIATION: Affected system quarantined — secure wipe and clean OS imaging initiated",
      ],
      stepChat: [
        ["Kernel hook on SSDT — this rootkit intercepts system calls to hide its own presence from the OS.", "Risk HIGH. Once it's in the kernel layer, traditional antivirus tools simply cannot see it."],
        ["Boot sector modified — this will survive a standard reimage. We need secure wipe first.", "Capturing volatile memory now — evidence is gone permanently if someone restarts that machine."],
        ["Our EDR agent just went silent on this host — the rootkit killed it to prevent detection.", "Deploying out-of-band management channel to isolate without alerting the rootkit's self-defence."],
        ["Rootkit granted SYSTEM privileges to a process that was previously running as a standard user.", "Isolation complete via network switch ACL — the machine has zero network connectivity now."],
        ["Drive wiped using secure erase. Clean OS deployed. Rootkit variant submitted to threat intel.", "Scanning all 400 endpoints for the same kernel hook pattern — this may not be an isolated incident."],
      ],
    },
    {
      radio: [
        "DETECTION: Anti-forensics activity detected — rootkit hiding files and processes from operating system",
        "INSTALLATION: Rootkit achieved ring-0 privilege — operating below OS visibility layer",
        "DEFENSE_EVASION: Security queries returning falsified system state — machine effectively blind",
        "PERSISTENCE: Rootkit survived reboot — confirmed hook into bootloader sequence",
        "ERADICATION: Secure wipe initiated — firmware reflashed, environment rebuilt from verified image",
      ],
      stepChat: [
        ["Process list from OS shows nothing suspicious. Memory dump from hardware layer tells a very different story.", "This rootkit lies to the operating system about what is running. Sophisticated and deliberate."],
        ["Ring-0 confirmed — this threat has full hardware-level control of the machine. Standard tools useless.", "Standard forensics methodology is broken here. Switching to hardware memory analyzer for truth."],
        ["Every security query returning falsified clean results. The machine is completely blind to itself.", "Out-of-band access via iLO confirmed. We can see reality from the hardware management layer."],
        ["Bootloader compromise confirmed via out-of-band BIOS hash verification against known good baseline.", "Pulling the machine from the environment entirely. No data from this host can be trusted."],
        ["Secure erase complete. New OS from verified hash-checked image. Firmware also reflashed to known good.", "IOCs shared with sector ISAC. Recommending firmware integrity verification sweep across the entire server fleet."],
      ],
    },
  ],
  ddos: [
    {
      radio: [
        "CRITICAL: 2.4 million requests per second hitting API gateway — DDoS attack underway",
        "ESCALATION: Attack shifting to DNS infrastructure — attempting to make our domain unresolvable",
        "AMPLIFICATION: DNS reflection attack confirmed — open resolvers being weaponised against us",
        "MITIGATION: Traffic scrubbing centre active — filtering malicious from legitimate traffic",
        "RECOVERY: Attack subsiding — services fully restored, rate limiting permanently enforced",
      ],
      stepChat: [
        ["2.4M RPS from 80 countries — this is a large botnet, not a single targeted source.", "Risk CRITICAL. All public-facing services offline in 3 minutes if we don't reroute now."],
        ["Attack pivoting to DNS — they want to make our domain completely unresolvable to anyone.", "Switching to anycast DNS routing across multiple providers. This will significantly slow them."],
        ["Amplification factor of 4000x — they turned our 14 open DNS resolvers against us.", "Rate-limiting and closing all open resolvers now. Attack bandwidth will drop immediately."],
        ["Scrubbing centre absorbing 80% of attack volume. Services running at 60% capacity currently.", "CDN provider engaged — they have 10Tbps absorption capacity. More than enough for this attack."],
        ["Attack ended after 23 minutes. 3 services briefly offline. Full recovery achieved across all systems.", "Post-attack hardening: 12,000 botnet IPs added to perimeter blocklist. Open resolvers permanently closed."],
      ],
    },
    {
      radio: [
        "ALERT: SYN flood targeting authentication service — connection state table approaching saturation",
        "ESCALATION: 8 million packets per second — upstream ISP reporting 40Gbps inbound volume",
        "LAYER7: Attack shifted to HTTP flood — 1 million login attempts per minute on auth endpoint",
        "DEFENSE: WAF challenge pages deployed — scrubbing legitimate from attack traffic at edge",
        "STABILIZATION: Auth service restored to full capacity — DDoS protection permanently configured",
      ],
      stepChat: [
        ["SYN flood filling the firewall state table — new legitimate connections being rejected.", "AUTH service is the specific target — someone wants to prevent all logins deliberately."],
        ["8M PPS. Upstream ISP seeing 40Gbps. Calling them now to request upstream traffic black-holing.", "Enabling SYN cookies at the firewall — reduces state table exhaustion significantly."],
        ["They switched to HTTP flood — 1 million login attempts per minute consuming all resources.", "Deploying Captcha and rate limiting on the auth endpoint. Real users will need to solve a challenge."],
        ["WAF blocking 94% of attack traffic. Legitimate traffic getting through the challenge pages.", "Authentication service recovering. Monitoring closely for attacker adapting their pattern."],
        ["DDoS concluded. Uptime maintained for most users throughout. Excellent coordination today.", "Permanent scrubbing service contract being procured. This cannot be the last time we see this."],
      ],
    },
  ],
};

const STAGE_LABELS = ["INITIAL ACCESS", "EXECUTION", "ESCALATION", "LATERAL MOVE", "IMPACT"];
const STAGE_WHY = [
  "Humans bypass firewalls",
  "Foothold established",
  "Credentials = master key",
  "Reach multiplies",
  "Objective achieved",
];
const STAGE_EDUCATION = [
  {
    why: "Attackers target people because social engineering defeats technical controls instantly. One click bypasses the firewall, EDR, email filters, and network monitoring simultaneously — no vulnerability needed.",
    watch: "Unexpected attachments, mismatched sender domains, login pages linked from email, urgent language pressuring fast action.",
  },
  {
    why: "Execution gives the attacker a process running inside your environment under a legitimate user identity. It looks like normal activity to most monitoring tools, making detection difficult.",
    watch: "Office applications spawning command shells, encoded PowerShell commands, new processes writing files to temp directories.",
  },
  {
    why: "Credentials are master keys. With valid passwords, the attacker moves through the network as a trusted user — no further exploitation required. This is why password hygiene and MFA matter so much.",
    watch: "LSASS process access from unexpected parents, credential dumping tool signatures, unusual authentication volume spikes.",
  },
  {
    why: "A single compromised workstation has limited value. Reaching Active Directory or key servers multiplies the attacker's control across every account in the organisation simultaneously.",
    watch: "Unusual machine-to-machine connections, admin tools running on non-admin systems, service creation on remote hosts.",
  },
  {
    why: "This is the payoff — data theft, ransomware deployment, or service disruption. Everything before this step was preparation for this moment. Defenders who detect early prevent reaching this stage.",
    watch: "Large outbound data transfers, file encryption activity across shares, DNS queries with unusually long or encoded domain names.",
  },
];

// TARGETS - localized - localized
const TARGETS_BASE = ["web_server", "email_gateway", "database", "api_endpoint", "vpn", "dns_resolver", "workstation", "iot_segment", "cloud_vm", "auth_service"];


function nodeIcon(idx: number, ox: number, oy: number, clr: string, op: number) {
  const s = 9;
  switch (idx % 5) {
    case 0: return (
      <g transform={`translate(${ox},${oy})`} opacity={op}>
        <rect x={-s} y={-s*0.7} width={s*2} height={s*1.4} rx={1.5} fill="none" stroke={clr} strokeWidth={1.3}/>
        <polyline points={`${-s},${-s*0.7} 0,${s*0.15} ${s},${-s*0.7}`} fill="none" stroke={clr} strokeWidth={1.3}/>
      </g>
    );
    case 1: return (
      <g transform={`translate(${ox},${oy})`} opacity={op}>
        <rect x={-s} y={-s*0.8} width={s*2} height={s*1.6} rx={2} fill="none" stroke={clr} strokeWidth={1.3}/>
        <polyline points={`${-s*0.5},${-s*0.1} ${-s*0.1},${s*0.25} ${-s*0.5},${s*0.6}`} fill="none" stroke={clr} strokeWidth={1.3}/>
        <line x1={0} y1={s*0.6} x2={s*0.5} y2={s*0.6} stroke={clr} strokeWidth={1.3}/>
      </g>
    );
    case 2: return (
      <g transform={`translate(${ox},${oy})`} opacity={op}>
        <path d={`M0,${-s*0.85} L${s*0.8},${-s*0.28} L${s*0.8},${s*0.28} Q${s*0.8},${s*0.85} 0,${s*0.85} Q${-s*0.8},${s*0.85} ${-s*0.8},${s*0.28} L${-s*0.8},${-s*0.28} Z`} fill="none" stroke={clr} strokeWidth={1.2}/>
        <line x1={0} y1={-s*0.2} x2={0} y2={s*0.32} stroke={clr} strokeWidth={1.6} strokeLinecap="round"/>
        <circle cx={0} cy={-s*0.48} r={1.6} fill={clr}/>
      </g>
    );
    case 3: return (
      <g transform={`translate(${ox},${oy})`} opacity={op}>
        <circle cx={-s*0.55} cy={0} r={s*0.32} fill="none" stroke={clr} strokeWidth={1.1}/>
        <circle cx={s*0.55} cy={0} r={s*0.32} fill="none" stroke={clr} strokeWidth={1.1}/>
        <line x1={-s*0.22} y1={-s*0.18} x2={s*0.22} y2={-s*0.18} stroke={clr} strokeWidth={1.1}/>
        <polyline points={`${s*0.08},${-s*0.32} ${s*0.22},${-s*0.18} ${s*0.08},${-s*0.04}`} fill="none" stroke={clr} strokeWidth={1.1}/>
        <line x1={s*0.22} y1={s*0.18} x2={-s*0.22} y2={s*0.18} stroke={clr} strokeWidth={1.1}/>
        <polyline points={`${-s*0.08},${s*0.04} ${-s*0.22},${s*0.18} ${-s*0.08},${s*0.32}`} fill="none" stroke={clr} strokeWidth={1.1}/>
      </g>
    );
    case 4: return (
      <g transform={`translate(${ox},${oy})`} opacity={op}>
        <circle cx={0} cy={0} r={s*0.88} fill="none" stroke={clr} strokeWidth={1.1}/>
        <circle cx={0} cy={0} r={s*0.52} fill="none" stroke={clr} strokeWidth={1.1}/>
        <circle cx={0} cy={0} r={s*0.18} fill={clr} opacity={0.9}/>
      </g>
    );
    default: return null;
  }
}

function wrapDesc(text: string, max = 17): [string, string] {
  const words = text.split(" ");
  let line1 = "";
  for (const w of words) {
    if ((line1 + (line1 ? " " : "") + w).length > max) break;
    line1 += (line1 ? " " : "") + w;
  }
  const rest = text.slice(line1.length).trim();
  return [line1, rest.length > max ? rest.slice(0, max - 1) + "…" : rest];
}

interface AttackState {
  def: ThreatDef;
  loc: LocalizedThreat;
  step: number;
  done: Set<number>;
  victimAffected: boolean;
  variantIdx: number;
}

interface ThreatDef {
  typeKey: string;
  icon: string; 
  sev: number; 
  color: string;
  radioKeys: string[];
  chatKeys: Record<string, string[]>;
  steps: { sKey: string; dKey: string; i: string }[];
  realWorldKey: string; 
  defensesKeys: string[];
  quiz: { qKey: string; optsKeys: string[]; ans: number; whyKey: string };
}

interface LiveAlert { 
  id: string; 
  threat: ThreatDef; 
  targetKey: string; 
  time: string; 
  radioLineKey: string; 
}

interface ChatMsg { 
  id: number;
  from: typeof ANALYSTS_BASE[number]; 
  textKey: string; 
  time: string; 
}

interface LocalizedThreat {
  type: string;
  tagline: string;
  icon: string;
  color: string;
  radio: string[];
  chat: Record<string, string[]>;
  steps: { s: string; d: string; i: string }[];
  realWorld: string;
  defenses: string[];
  quiz: {
    q: string;
    opts: string[];
    ans: number;
    why: string;
  };
}

// Build localized THREATS structure
const THREATS: Record<string, ThreatDef> = {
  virus: {
    typeKey: "virus",
    icon: "🦠", sev: 3, color: "#ef4444",
    radioKeys: ["virus_radio_1", "virus_radio_2", "virus_radio_3"],
    chatKeys: {
      saqr:   ["virus_saqr_1", "virus_saqr_2"],
      oryx:   ["virus_oryx_1", "virus_oryx_2"],
      thalab: ["virus_thalab_1", "virus_thalab_2"],
      hisan:  ["virus_hisan_1", "virus_hisan_2"],
    },
    steps: [
      { sKey: "virus_step_1_s", dKey: "virus_step_1_d", i: "📎" },
      { sKey: "virus_step_2_s", dKey: "virus_step_2_d", i: "▶️" },
      { sKey: "virus_step_3_s", dKey: "virus_step_3_d", i: "📄" },
      { sKey: "virus_step_4_s", dKey: "virus_step_4_d", i: "🔄" },
      { sKey: "virus_step_5_s", dKey: "virus_step_5_d", i: "💥" }
    ],
    realWorldKey: "virus_real_world",
    defensesKeys: ["virus_defense_1", "virus_defense_2", "virus_defense_3", "virus_defense_4"],
    quiz: {
      qKey: "virus_quiz_q",
      optsKeys: ["virus_quiz_opt_1", "virus_quiz_opt_2", "virus_quiz_opt_3", "virus_quiz_opt_4"],
      ans: 0,
      whyKey: "virus_quiz_why"
    },
  },
  ransomware: {
    typeKey: "ransomware",
    icon: "🔐", sev: 4, color: "#dc2626",
    radioKeys: ["ransomware_radio_1", "ransomware_radio_2", "ransomware_radio_3"],
    chatKeys: {
      saqr:   ["ransomware_saqr_1", "ransomware_saqr_2"],
      oryx:   ["ransomware_oryx_1", "ransomware_oryx_2"],
      thalab: ["ransomware_thalab_1", "ransomware_thalab_2"],
      hisan:  ["ransomware_hisan_1", "ransomware_hisan_2"],
    },
    steps: [
      { sKey: "ransomware_step_1_s", dKey: "ransomware_step_1_d", i: "📧" },
      { sKey: "ransomware_step_2_s", dKey: "ransomware_step_2_d", i: "🔑" },
      { sKey: "ransomware_step_3_s", dKey: "ransomware_step_3_d", i: "🗺" },
      { sKey: "ransomware_step_4_s", dKey: "ransomware_step_4_d", i: "🔒" },
      { sKey: "ransomware_step_5_s", dKey: "ransomware_step_5_d", i: "💰" }
    ],
    realWorldKey: "ransomware_real_world",
    defensesKeys: ["ransomware_defense_1", "ransomware_defense_2", "ransomware_defense_3", "ransomware_defense_4"],
    quiz: {
      qKey: "ransomware_quiz_q",
      optsKeys: ["ransomware_quiz_opt_1", "ransomware_quiz_opt_2", "ransomware_quiz_opt_3", "ransomware_quiz_opt_4"],
      ans: 2,
      whyKey: "ransomware_quiz_why"
    },
  },
  phishing: {
    typeKey: "phishing",
    icon: "🎣", sev: 2, color: "#f59e0b",
    radioKeys: ["phishing_radio_1", "phishing_radio_2", "phishing_radio_3"],
    chatKeys: {
      saqr:   ["phishing_saqr_1", "phishing_saqr_2"],
      oryx:   ["phishing_oryx_1", "phishing_oryx_2"],
      thalab: ["phishing_thalab_1", "phishing_thalab_2"],
      hisan:  ["phishing_hisan_1", "phishing_hisan_2"],
    },
    steps: [
      { sKey: "phishing_step_1_s", dKey: "phishing_step_1_d", i: "✉️" },
      { sKey: "phishing_step_2_s", dKey: "phishing_step_2_d", i: "🪤" },
      { sKey: "phishing_step_3_s", dKey: "phishing_step_3_d", i: "🎭" },
      { sKey: "phishing_step_4_s", dKey: "phishing_step_4_d", i: "📋" },
      { sKey: "phishing_step_5_s", dKey: "phishing_step_5_d", i: "💀" }
    ],
    realWorldKey: "phishing_real_world",
    defensesKeys: ["phishing_defense_1", "phishing_defense_2", "phishing_defense_3", "phishing_defense_4"],
    quiz: {
      qKey: "phishing_quiz_q",
      optsKeys: ["phishing_quiz_opt_1", "phishing_quiz_opt_2", "phishing_quiz_opt_3", "phishing_quiz_opt_4"],
      ans: 1,
      whyKey: "phishing_quiz_why"
    },
  },
  ddos: {
    typeKey: "ddos",
    icon: "🌊", sev: 3, color: "#3b82f6",
    radioKeys: ["ddos_radio_1", "ddos_radio_2", "ddos_radio_3"],
    chatKeys: {
      saqr:   ["ddos_saqr_1", "ddos_saqr_2"],
      oryx:   ["ddos_oryx_1", "ddos_oryx_2"],
      thalab: ["ddos_thalab_1", "ddos_thalab_2"],
      hisan:  ["ddos_hisan_1", "ddos_hisan_2"],
    },
    steps: [
      { sKey: "ddos_step_1_s", dKey: "ddos_step_1_d", i: "🤖" },
      { sKey: "ddos_step_2_s", dKey: "ddos_step_2_d", i: "🎯" },
      { sKey: "ddos_step_3_s", dKey: "ddos_step_3_d", i: "🌊" },
      { sKey: "ddos_step_4_s", dKey: "ddos_step_4_d", i: "💥" },
      { sKey: "ddos_step_5_s", dKey: "ddos_step_5_d", i: "📉" }
    ],
    realWorldKey: "ddos_real_world",
    defensesKeys: ["ddos_defense_1", "ddos_defense_2", "ddos_defense_3", "ddos_defense_4"],
    quiz: {
      qKey: "ddos_quiz_q",
      optsKeys: ["ddos_quiz_opt_1", "ddos_quiz_opt_2", "ddos_quiz_opt_3", "ddos_quiz_opt_4"],
      ans: 1,
      whyKey: "ddos_quiz_why"
    },
  },
  rootkit: {
    typeKey: "rootkit",
    icon: "👻", sev: 4, color: "#6366f1",
    radioKeys: ["rootkit_radio_1", "rootkit_radio_2", "rootkit_radio_3"],
    chatKeys: {
      saqr:   ["rootkit_saqr_1", "rootkit_saqr_2"],
      oryx:   ["rootkit_oryx_1", "rootkit_oryx_2"],
      thalab: ["rootkit_thalab_1", "rootkit_thalab_2"],
      hisan:  ["rootkit_hisan_1", "rootkit_hisan_2"],
    },
    steps: [
      { sKey: "rootkit_step_1_s", dKey: "rootkit_step_1_d", i: "📥" },
      { sKey: "rootkit_step_2_s", dKey: "rootkit_step_2_d", i: "🪝" },
      { sKey: "rootkit_step_3_s", dKey: "rootkit_step_3_d", i: "👻" },
      { sKey: "rootkit_step_4_s", dKey: "rootkit_step_4_d", i: "🔑" },
      { sKey: "rootkit_step_5_s", dKey: "rootkit_step_5_d", i: "🛡" }
    ],
    realWorldKey: "rootkit_real_world",
    defensesKeys: ["rootkit_defense_1", "rootkit_defense_2", "rootkit_defense_3", "rootkit_defense_4"],
    quiz: {
      qKey: "rootkit_quiz_q",
      optsKeys: ["rootkit_quiz_opt_1", "rootkit_quiz_opt_2", "rootkit_quiz_opt_3", "rootkit_quiz_opt_4"],
      ans: 1,
      whyKey: "rootkit_quiz_why"
    },
  },
};

const STEP_ALERTS: Record<string, Array<{
  entity: { icon: string; type: string; name: string };
  alert: string; mitre: string; severity: "critical" | "high" | "medium";
  ioc: string; action: string;
}>> = {
  phishing: [
    { entity:{icon:"👤",type:"User",name:"hamad@cybermajlis.qa"}, alert:"Suspicious URL clicked from ZAP-quarantined email", mitre:"T1566.001 · Spearphishing Attachment", severity:"high", ioc:"Sender domain registered 4h ago, Let's Encrypt SSL, IP shared with 12 other phishing sites", action:"Force MFA re-enrollment, revoke all active sessions, warn colleagues who received the same email" },
    { entity:{icon:"🖥️",type:"Device",name:"WKSTN-14.cybermajlis.local"}, alert:"User submitted credentials to spoofed login portal", mitre:"T1056.003 · Web Portal Capture", severity:"critical", ioc:"POST to feanqfllaj.mycompanyportal.xyz — base64 credentials in body, session cookie exfiled to attacker endpoint", action:"Reset compromised credentials immediately, notify user via phone, enable conditional access policies" },
    { entity:{icon:"🌐",type:"Network",name:"185.220.101.42 (Tor exit node, Amsterdam)"}, alert:"Successful login from Tor exit node using stolen credentials", mitre:"T1078 · Valid Accounts", severity:"critical", ioc:"Login at 03:14 AM — 11 resource accesses in 8 minutes, 4x above 30-day baseline velocity", action:"Block external IP, revoke OAuth tokens, audit all resources accessed in past 24h by this account" },
    { entity:{icon:"📁",type:"Share",name:"SharePoint · Sales & HR directories"}, alert:"Compromised account accessing high-value directories beyond normal scope", mitre:"T1078.002 · Domain Accounts", severity:"high", ioc:"4 sensitive directories in 8 minutes — sales contracts, HR data, client PII — velocity 4x above baseline", action:"Revoke OAuth tokens, enable step-up auth for admin resources, notify legal of potential data exposure" },
    { entity:{icon:"📄",type:"File",name:"sales-contracts-Q1-2025.zip · 287MB"}, alert:"Sensitive data exfiltrated via HTTPS upload to external storage", mitre:"T1567.002 · Exfiltration to Cloud Storage", severity:"critical", ioc:"287MB to api.transfernow.net at 03:22 AM — 900x daily average, destination in 6 threat intel feeds", action:"Notify legal and compliance, contact affected clients, preserve forensic evidence, engage IR" },
  ],
  virus: [
    { entity:{icon:"📄",type:"File",name:"invoice_2025.pdf.exe"}, alert:"Malicious executable auto-ran from email attachment", mitre:"T1204.002 · Malicious File", severity:"high", ioc:"UPX-packed, matches Emotet dropper, 0 AV detections at delivery (zero-day variant)", action:"Quarantine file hash across endpoints, isolate WKSTN-14, capture memory before process terminates" },
    { entity:{icon:"⚙️",type:"Process",name:"powershell.exe (child of OUTLOOK.EXE)"}, alert:"Office application spawning encoded PowerShell — process injection underway", mitre:"T1059.001 · PowerShell", severity:"critical", ioc:"-EncodedCommand decodes to: download payload from pastebin + persist via scheduled task", action:"Kill process tree, enable PowerShell Script Block Logging, capture memory dump" },
    { entity:{icon:"⚙️",type:"Process",name:"svchost.exe · PID 4821 (hollowed)"}, alert:"Process hollowing — malware injected into legitimate system process", mitre:"T1055.012 · Process Hollowing", severity:"critical", ioc:"svchost.exe connecting outbound port 443 to known C2 — PE header mismatch in memory", action:"Memory dump first, then terminate PID 4821" },
    { entity:{icon:"📁",type:"Share",name:"\\FILESERVER-01 · 6 shares · 847 files"}, alert:"Virus replicating across mapped network shares via SMB", mitre:"T1021.002 · SMB/Windows Admin Shares", severity:"high", ioc:"847 files modified in 3 minutes across 6 shares — automated copy velocity", action:"Block SMB from WKSTN-14, snapshot all shares before further damage" },
    { entity:{icon:"🌐",type:"Network",name:"91.108.4.52 (Emotet C2)"}, alert:"Malware beaconing to known command-and-control infrastructure", mitre:"T1071.001 · Web Protocols", severity:"critical", ioc:"HTTPS beacons every 47s — encrypted payload contains host fingerprint", action:"Block at perimeter, force reimage WKSTN-14, submit IOCs to threat intel platform" },
  ],
  ransomware: [
    { entity:{icon:"📄",type:"File",name:"shipping_notification.xlsm"}, alert:"Macro-enabled document executed ransomware dropper via PowerShell", mitre:"T1204.002 · Malicious File", severity:"high", ioc:"VBA macro downloads 2.3MB payload from attacker CDN via encoded PowerShell", action:"Block sender domain, issue org-wide warning, enforce macro blocking for all Office documents" },
    { entity:{icon:"⚙️",type:"Process",name:"wmic.exe (child of EXCEL.EXE)"}, alert:"Ransomware mapping network shares — pre-encryption reconnaissance", mitre:"T1135 · Network Share Discovery", severity:"high", ioc:"23 shares enumerated in 8 seconds via Win32_NetworkConnection and Win32_Share queries", action:"Block WMI from infected host via GPO, preserve share access logs" },
    { entity:{icon:"🖥️",type:"System",name:"VSS · Volume Shadow Service · FILE-SERVER-01"}, alert:"Volume Shadow Copies deleted — all local recovery options eliminated", mitre:"T1490 · Inhibit System Recovery", severity:"critical", ioc:"vssadmin.exe delete shadows /all /quiet at 02:31 AM as SYSTEM — all recovery points wiped", action:"IMMEDIATELY verify off-site backup — shadow copies gone, off-site is the ONLY recovery path" },
    { entity:{icon:"📁",type:"Share",name:"\\FILE-SERVER-01 · 23 shares · 847GB"}, alert:"Mass file encryption in progress across file servers", mitre:"T1486 · Data Encrypted for Impact", severity:"critical", ioc:".locked extension on 1,200+ files/minute — AES-256, key held only by attacker C2", action:"Physically disconnect FILE-SERVER-01 NOW. Activate DR site immediately" },
    { entity:{icon:"📄",type:"Ransom Note",name:"README_DECRYPT.txt · all affected systems"}, alert:"Ransom note deployed — LockBit 3.0 affiliate, extortion phase active", mitre:"T1491 · Defacement", severity:"critical", ioc:"Bitcoin wallet — 4.5 BTC (~$280K), 72h deadline, wallet linked to LockBit 3.0 in threat intel", action:"Do NOT pay. Activate DR. Engage cyber insurance and law enforcement" },
  ],
  rootkit: [
    { entity:{icon:"📄",type:"File",name:"NvStrMicMon.sys (unsigned kernel driver)"}, alert:"Unsigned kernel driver loaded — rootkit installation detected", mitre:"T1014 · Rootkit", severity:"critical", ioc:"Driver not in WHQL database, compiled 6h ago, cert from revoked CA — bypassed Secure Boot", action:"Block unsigned drivers via WDAC, quarantine file, force reboot to safe mode" },
    { entity:{icon:"🔩",type:"Kernel",name:"SSDT hook · WKSTN-07"}, alert:"Kernel hook intercepting OS calls — rootkit hiding itself from security tools", mitre:"T1014 · Rootkit (Kernel Mode)", severity:"critical", ioc:"NtQuerySystemInformation hooked — filters ghost_ prefixed processes from all OS queries", action:"Do NOT restart — loses volatile evidence. Deploy hardware memory analyzer via out-of-band management" },
    { entity:{icon:"⚙️",type:"Process",name:"[HIDDEN] PID 4292 — invisible to OS"}, alert:"Anti-forensics active — malicious process hidden from OS, AV, and EDR", mitre:"T1564.001 · Hidden Files and Directories", severity:"critical", ioc:"Hardware memory dump confirms PID 4292 with SYSTEM token — all OS-level tools report zero match", action:"Use iLO/IPMI/BMC for all analysis — OS commands are compromised" },
    { entity:{icon:"🖥️",type:"System",name:"WKSTN-07 · Full kernel compromise"}, alert:"SYSTEM-level backdoor active — unrestricted hardware access confirmed", mitre:"T1543 · Create or Modify System Process", severity:"critical", ioc:"C2 commands via DNS TXT queries to attacker domain — uses legitimate DNS to blend in", action:"Isolate via network switch ACL (not OS firewall — rootkit intercepts those)" },
    { entity:{icon:"🔌",type:"Firmware",name:"UEFI / BIOS · WKSTN-07"}, alert:"Bootloader persistence — rootkit survives full OS reinstall", mitre:"T1542.003 · Bootkit", severity:"critical", ioc:"BIOS hash mismatch vs vendor baseline — bootkit confirmed in EFI partition", action:"Reimage alone INSUFFICIENT — requires secure erase + firmware reflash from vendor-verified image" },
  ],
  ddos: [
    { entity:{icon:"🌐",type:"Botnet",name:"80,000+ nodes · 147 ASNs · 80 countries"}, alert:"Coordinated DDoS attack — global botnet targeting infrastructure", mitre:"T1499 · Endpoint Denial of Service", severity:"high", ioc:"Identical HTTP header fingerprint, request variance < 2% — highly coordinated botnet", action:"Enable DDoS protection on edge routers, contact ISP for BGP traffic black-hole" },
    { entity:{icon:"🔧",type:"Service",name:"api.cybermajlis.qa · /auth/login · Port 443"}, alert:"Authentication endpoint targeted — 340K req/sec exhausting connection pools", mitre:"T1498.001 · Direct Network Flood", severity:"high", ioc:"Unique User-Agent per request to bypass rate limiting — crafted to exhaust TCP connection pool", action:"Activate CAPTCHA and rate limiting on /auth, enable geo-blocking for non-Qatar IPs" },
    { entity:{icon:"🌐",type:"Network",name:"Edge Router · 15Gbps saturated"}, alert:"DNS amplification flood — 2.4M req/sec, 60Gbps inbound at upstream ISP", mitre:"T1498.002 · Reflection Amplification", severity:"critical", ioc:"Amplification factor 4000x — 14 open DNS resolvers weaponised including 3 on our network", action:"Close all open resolvers NOW, reroute to DDoS scrubbing center" },
    { entity:{icon:"⚙️",type:"System",name:"Load Balancer · Connection table 99.8% full"}, alert:"Services degrading — SYN flood exhausting firewall state table", mitre:"T1499.002 · Service Exhaustion Flood", severity:"critical", ioc:"Half-open SYN connections filling state table — legitimate users rejected at 94% rate", action:"Enable SYN cookies at firewall, activate CDN offload, escalate to DDoS provider SLA" },
    { entity:{icon:"🛡️",type:"Defense",name:"Scrubbing Center · 96% attack absorbed"}, alert:"Mitigation active — scrubbing center filtering attack traffic at edge", mitre:"T1499 · Mitigated", severity:"medium", ioc:"Clean traffic restored to 94% — 2.3M malicious req/sec dropped, 140K legitimate reaching origin", action:"Maintain scrubbing 2h after normalisation, file ISP abuse reports, close remaining resolvers" },
  ],
};
export default function ThreatAcademy() {
  const t = useTranslations('SOC');
  
  // Memoize localized analysts
  const ANALYSTS = useMemo(() => {
    return ANALYSTS_BASE.map(a => ({
      ...a,
      role: t(`analysts.${a.roleKey}.role`)
    }));
  }, [t]);
  
  // Memoize localized threats to prevent recreation on every render
  const localizedThreatsMap = useMemo(() => {
    const threats: Record<string, LocalizedThreat> = {};
    Object.entries(THREATS).forEach(([key, threatDef]) => {
      threats[key] = {
        type: t(`threats.${threatDef.typeKey}.name`),
        tagline: t(`threats.${threatDef.typeKey}.tagline`),
        icon: threatDef.icon,
        color: threatDef.color,
        radio: threatDef.radioKeys.map(key => t(`threats.${threatDef.typeKey}.radio.${key}`)),
        chat: Object.fromEntries(
          Object.entries(threatDef.chatKeys).map(([analyst, keys]) => [
            analyst,
            keys.map(key => t(`threats.${threatDef.typeKey}.chat.${analyst}.${key}`))
          ])
        ),
        steps: threatDef.steps.map(step => ({
          s: t(`threats.${threatDef.typeKey}.steps.${step.sKey}`),
          d: t(`threats.${threatDef.typeKey}.steps.${step.dKey}`),
          i: step.i
        })),
        realWorld: t(`threats.${threatDef.typeKey}.real_world`),
        defenses: threatDef.defensesKeys.map(key => t(`threats.${threatDef.typeKey}.defenses.${key}`)),
        quiz: {
          q: t(`threats.${threatDef.typeKey}.quiz.question`),
          opts: threatDef.quiz.optsKeys.map(key => t(`threats.${threatDef.typeKey}.quiz.options.${key}`)),
          ans: threatDef.quiz.ans,
          why: t(`threats.${threatDef.typeKey}.quiz.why`)
        }
      };
    });
    return threats;
  }, [t]);
  
  // Memoize localized targets
  const localizedTargetsMap = useMemo(() => {
    const targets: Record<string, string> = {};
    TARGETS_BASE.forEach(targetKey => {
      targets[targetKey] = t(`targets.${targetKey}`);
    });
    return targets;
  }, [t]);
  
  // Helper function to get localized threat (now just returns from memoized object)
  const getLocalizedThreat = useCallback((threatDef: ThreatDef): LocalizedThreat => {
    return localizedThreatsMap[threatDef.typeKey];
  }, [localizedThreatsMap]);
  
  const getLocalizedTarget = useCallback((targetKey: string): string => {
    return localizedTargetsMap[targetKey];
  }, [localizedTargetsMap]);
  
  // State
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [threatLevel, setThreatLevel] = useState(0);
  const [trafficHist, setTrafficHist] = useState<number[]>(Array(40).fill(0));
  const [typeStats, setTypeStats] = useState<Record<string, number>>({});
  const [radioText, setRadioText] = useState("");
  const [radioFull, setRadioFull] = useState("");
  const radioRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [popupThreats, setPopupThreats] = useState<Array<{loc: LocalizedThreat; activeStep: number; animating: boolean; quizAnswer: number | null}>>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [panelPopups, setPanelPopups] = useState<string[]>([]);
  const [attackState, setAttackState] = useState<AttackState | null>(null);
  const [clickedStep, setClickedStep] = useState<number | null>(null);
  const [replayStep, setReplayStep] = useState<number | null>(null);
  
  // Refs for unique IDs
  const alertIdCounter = useRef(0);

  const PANEL_INFO: Record<string, { title: string; icon: string; explanation: string; why: string }> = {
    traffic: { title: t('panels.traffic.title'), icon: "📊", explanation: t('panels.traffic.explanation'), why: t('panels.traffic.why') },
    attacks: { title: t('panels.attacks.title'), icon: "🎯", explanation: t('panels.attacks.explanation'), why: t('panels.attacks.why') },
    severity: { title: t('panels.severity.title'), icon: "🔴", explanation: t('panels.severity.explanation'), why: t('panels.severity.why') },
    status: { title: t('panels.status.title'), icon: "🖥", explanation: t('panels.status.explanation'), why: t('panels.status.why') },
    chat: { title: t('panels.chat.title'), icon: "💬", explanation: t('panels.chat.explanation'), why: t('panels.chat.why') },
  };

  const openPanel = (key: string) => setPanelPopups(p => p.includes(key) ? p : [...p, key]);
  const closePanel = (key: string) => setPanelPopups(p => p.filter(k => k !== key));
  const openLessonFor = (def: ThreatDef) => {
    const loc = getLocalizedThreat(def);
    if (!loc) return;
    setCompleted(p => new Set([...p, def.typeKey]));
    setPopupThreats(p => p.some(x => x.loc.type === loc.type) ? p : [...p, {loc, activeStep: 0, animating: false, quizAnswer: null}]);
  };
  const closeLesson = (type: string) => setPopupThreats(p => p.filter(x => x.loc.type !== type));
  const updateLesson = (type: string, patch: Partial<{activeStep:number;animating:boolean;quizAnswer:number|null}>) =>
    setPopupThreats(p => p.map(x => x.loc.type === type ? {...x, ...patch} : x));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getTime = (): string => new Date().toLocaleTimeString("en-US", { hour12: false });

  const typeRadio = useCallback((text: string) => {
    if (radioRef.current) clearTimeout(radioRef.current);
    setRadioFull(text); setRadioText("");
    let i = 0;
    const type = () => { if (i <= text.length) { setRadioText(text.slice(0, i)); i++; radioRef.current = setTimeout(type, 28); } };
    type();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  useEffect(() => {
    if (attackState?.done.size === 5) {
      const t = setTimeout(() => setClickedStep(null), 3000);
      return () => clearTimeout(t);
    }
  }, [attackState?.done.size]);

  // Sequential attack orchestration — one threat at a time, step by step
  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

    const CHAT_PLAN: [string, string][] = [
      ["saqr",   "oryx"  ],
      ["oryx",   "thalab"],
      ["thalab", "hisan" ],
      ["hisan",  "saqr"  ],
      ["saqr",   "oryx"  ],
    ];

    const runAttack = async (threatKey: string, lastVariant: Record<string, number>) => {
      const def = THREATS[threatKey];
      const loc = localizedThreatsMap[threatKey];
      if (!loc || cancelled) return;

      alertIdCounter.current += 1;
      const targetKey = pick(TARGETS_BASE);
      const alert: LiveAlert = {
        id: `${Date.now()}-${alertIdCounter.current}`,
        threat: def, targetKey, time: getTime(), radioLineKey: loc.radio[0],
      };
      setAlerts(prev => [alert, ...prev].slice(0, 15));
      setTotal(prev => prev + 1);
      setTypeStats(prev => ({ ...prev, [def.typeKey]: (prev[def.typeKey] || 0) + 1 }));
      setThreatLevel(prev => Math.min(100, prev + def.sev * 4));
      setTrafficHist(prev => [...prev.slice(1), prev[prev.length - 1] + rand(2, 6)]);
      // Pick a variant that wasn't used last time for this threat
      const variants = SCRIPT_VARIANTS[threatKey] || [];
      const lastIdx = lastVariant[threatKey] ?? -1;
      const available = variants.map((_, i) => i).filter(i => i !== lastIdx);
      const variantIdx = available.length > 0 ? pick(available) : rand(0, variants.length - 1);
      lastVariant[threatKey] = variantIdx;
      const variant = variants[variantIdx] || null;

      setClickedStep(null);
      setReplayStep(null);
      setAttackState({ def, loc, step: -1, done: new Set(), victimAffected: false, variantIdx });
      typeRadio(`ALERT: ${loc.type} — ${loc.tagline}`);

      await sleep(2000);

      for (let i = 0; i < loc.steps.length; i++) {
        if (cancelled) return;

        setAttackState(prev => prev ? {
          ...prev, step: i, done: new Set(Array.from({ length: i }, (_, k) => k))
        } : null);
        setTrafficHist(prev => [...prev.slice(1), prev[prev.length - 1] + rand(3, 8)]);

        // Analysts react using variant script (radio only announces at start/end)
        const [a1id, a2id] = CHAT_PLAN[i];
        const a1 = ANALYSTS.find(a => a.id === a1id);
        const a2 = ANALYSTS.find(a => a.id === a2id);
        const [chat1, chat2] = variant?.stepChat[i] ?? ["", ""];

        // First analyst fires 2s after step starts
        if (a1 && chat1 && !cancelled) {
          setTimeout(() => {
            if (cancelled) return;
            setChatMsgs(prev => [...prev, { id: Date.now() + Math.random(), from: a1, textKey: chat1, time: getTime() }].slice(-25));
          }, 2000);
        }
        // Second analyst only on steps 0 and 4, with a longer gap
        if (a2 && chat2 && !cancelled && (i === 0 || i === 4)) {
          setTimeout(() => {
            if (cancelled) return;
            setChatMsgs(prev => [...prev, { id: Date.now() + Math.random() + 1, from: a2, textKey: chat2, time: getTime() }].slice(-25));
          }, rand(7000, 9000));
        }

        // Hamad's distress message fires at his designated step for this threat
        const hamadScene = HAMAD_SCENARIOS[threatKey];
        if (hamadScene && i === hamadScene.step && !cancelled) {
          setTimeout(() => {
            if (cancelled) return;
            setChatMsgs(prev => [...prev, {
              id: Date.now() + Math.random() + 5,
              from: HAMAD as typeof ANALYSTS_BASE[number],
              textKey: hamadScene.msg,
              time: getTime(),
            }].slice(-25));
            // Mark victim as affected on the graph
            setAttackState(prev => prev ? { ...prev, victimAffected: true } : null);
          }, rand(5000, 7000));

          const replyAnalyst = ANALYSTS.find(a => a.id === hamadScene.analystId);
          if (replyAnalyst) {
            setTimeout(() => {
              if (cancelled) return;
              setChatMsgs(prev => [...prev, {
                id: Date.now() + Math.random() + 6,
                from: replyAnalyst,
                textKey: hamadScene.analystReply,
                time: getTime(),
              }].slice(-25));
            }, rand(9000, 11000));
          }
        }

        await sleep(rand(12000, 16000));
      }

      // Hamad recovery message — fires after all steps finish
      const hamadScene = HAMAD_SCENARIOS[threatKey];
      if (hamadScene && !cancelled) {
        await sleep(2200);
        setChatMsgs(prev => [...prev, {
          id: Date.now() + Math.random() + 10,
          from: HAMAD as typeof ANALYSTS_BASE[number],
          textKey: hamadScene.recovery,
          time: getTime(),
        }].slice(-25));
      }

      // Mark all steps done, clear victim indicator
      setAttackState(prev => prev ? { ...prev, step: -1, done: new Set([0,1,2,3,4]), victimAffected: false } : null);
      await sleep(1500);
      typeRadio(`INCIDENT CONTAINED — ${loc.type} resolved. Monitoring for next threat.`);
      await sleep(rand(3000, 5000));
    };

    // Track last variant used per threat so scripts don't repeat back-to-back
    const lastVariant: Record<string, number> = {};

    const loop = async () => {
      await sleep(2000);
      let queue: string[] = [];
      while (!cancelled) {
        // Refill queue with a fresh shuffle when empty — guarantees all 5 threats
        // appear before any repeats, and never in the same order twice
        if (queue.length === 0) queue = shuffle(Object.keys(THREATS));
        const threatKey = queue.shift()!;
        await runAttack(threatKey, lastVariant);
      }
    };

    loop();
    return () => { cancelled = true; chatTimersRef.current.forEach(clearTimeout); };
  }, [localizedThreatsMap, typeRadio, ANALYSTS]);

  useEffect(() => { 
    const i = setInterval(() => setThreatLevel(t => Math.max(0, t - 1)), 600); 
    return () => clearInterval(i); 
  }, []);


  const openLesson = (threatDef: ThreatDef) => openLessonFor(threatDef);
  
  const answerQuiz = (_key: string, _idx: number) => {}; // handled via updateLesson

  const tl = threatLevel;
  const tlColor = tl > 60 ? "#ef4444" : tl > 30 ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ width: "100%", height: "100vh", background: "#1a0a0b", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: "#2a0e10", padding: "8px 20px 8px 110px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #D5B89315", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: tlColor, boxShadow: `0 0 10px ${tlColor}`, animation: tl > 50 ? "blink .8s infinite" : "none" }} />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#f5ede0" }}>{t("title.main")} <span style={{ color: "#D5B893", fontStyle: "italic" }}>{t("title.soc")}</span></span>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: `${tlColor}20`, color: tlColor, fontWeight: 700 }}>{tl > 60 ? t('severity.critical') : tl > 30 ? t('severity.elevated') : t('severity.normal')}</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 13, color: "#f5ede0aa" }}>
          <span>{t('Threats')}: <span style={{ color: "#D5B893", fontWeight: 700, fontFamily: "'JetBrains Mono'" }}>{total}</span></span>
          <span>{t('learned')}: <span style={{ color: "#22c55e", fontWeight: 700 }}>{completed.size}/{Object.keys(THREATS).length}</span></span>
          <div style={{ width: 70, height: 5, background: "#ffffff10", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${tl}%`, height: "100%", background: tlColor, borderRadius: 3, transition: "all .3s" }} />
          </div>
        </div>
      </div>

      {/* RADIO */}
      <div style={{ background: "#2a0e10", padding: "6px 20px", borderBottom: "1px solid #D5B89310", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, minHeight: 34 }}>
        <span style={{ fontSize: 16, animation: radioText ? "pulse 1s infinite" : "none" }}>📻</span>
        <div style={{ flex: 1, fontSize: 14, color: "#D5B893", fontStyle: "italic", overflow: "hidden", whiteSpace: "nowrap" }}>
          {radioText || <span style={{ color: "#f5ede022" }}>{t('radio.waiting')}</span>}
          {radioText && radioText.length < radioFull.length && <span style={{ animation: "blink .5s infinite" }}>▌</span>}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT: MAP + DASHBOARD */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {/* MAP */}
          <div style={{ flex: 1, position: "relative", background: "linear-gradient(180deg, #1a0a0b, #2a0e10)", cursor: "default" }}>
            <div style={{ position: "absolute", inset: 0, opacity: .02, backgroundImage: "repeating-linear-gradient(0deg,#D5B893 0px,transparent 1px,transparent 50px),repeating-linear-gradient(90deg,#D5B893 0px,transparent 1px,transparent 50px)" }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* XDR ATTACK GRAPH — live, step-by-step */}
            {/* XDR ATTACK GRAPH PANEL */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(58%, 560px)",
              background: "transparent",
              zIndex: 10, overflow: "hidden",
            }}>
              {/* Panel header */}
              <div style={{ padding: "9px 16px", display: "flex", alignItems: "center", gap: 9, borderBottom: "1px solid rgba(197,165,126,0.1)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e03040", display: "inline-block", flexShrink: 0, animation: "blink 1.4s ease-in-out infinite", boxShadow: "0 0 6px #e03040" }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(197,165,126,0.6)", textTransform: "uppercase", flex: 1 }}>XDR · Attack Graph</span>
                {attackState && (
                  <span style={{ fontSize: 9, color: attackState.def.color, fontWeight: 700, letterSpacing: "0.12em", background: `${attackState.def.color}12`, border: `1px solid ${attackState.def.color}30`, padding: "2px 10px", borderRadius: 5 }}>
                    {attackState.loc.icon} {attackState.loc.type.toUpperCase()}
                  </span>
                )}
                {attackState && attackState.step === -1 && attackState.done.size === 5 && (
                  <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, letterSpacing: "0.12em", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", padding: "2px 10px", borderRadius: 5 }}>
                    ✓ CONTAINED
                  </span>
                )}
                {attackState && (
                  <button
                    onClick={() => setReplayStep(prev => prev !== null ? null : 0)}
                    style={{ background: replayStep !== null ? "rgba(197,165,126,0.18)" : "rgba(197,165,126,0.08)", border: "1px solid rgba(197,165,126,0.3)", borderRadius: 6, color: "#D5B893", fontSize: 9, fontWeight: 700, cursor: "pointer", padding: "3px 10px", letterSpacing: "0.1em", flexShrink: 0 }}
                  >
                    {replayStep !== null ? "✕ EXIT" : "▶ WATCH STORY"}
                  </button>
                )}
              </div>

              <div style={{ padding: "12px 14px 14px" }}>
                {attackState ? (() => {
                  const { def, loc, step, done, victimAffected, variantIdx } = attackState;
                  const color = def.color;
                  const n = loc.steps.length;

                  // Dynamic layout: first 2 nodes in row 1 (entry phase),
                  // remaining in row 2. Single row if n ≤ 2.
                  const NW = 104, NH = 68, GAP = 9, PAD = 5;
                  const ROW1 = Math.min(2, n);
                  const ROW2 = n - ROW1;
                  const r1y = ROW2 > 0 ? 28 : 50; // center vertically if single row
                  const r2y = 118;

                  // Each node position: row 2 starts at column index 1 (under node 1)
                  const sp = [
                    ...Array.from({ length: ROW1 }, (_, i) => ({ x: PAD + i * (NW + GAP), y: r1y })),
                    ...Array.from({ length: ROW2 }, (_, i) => ({ x: PAD + (i + 1) * (NW + GAP), y: r2y })),
                  ];

                  // viewBox sized to fit the widest row
                  const lastX = Math.max(...sp.map(p => p.x)) + NW + PAD;
                  const vbW = lastX;
                  const vbH = (ROW2 > 0 ? r2y + NH : r1y + NH) + 10;

                  // Neutral mode: graph is static, all nodes visible at equal weight
                  // Replay mode: nodes light up step by step as user clicks Next
                  const isReplay = replayStep !== null;
                  const dispStep = isReplay ? replayStep : -1;
                  const dispDone = isReplay
                    ? new Set(Array.from({ length: replayStep! }, (_, k) => k))
                    : new Set<number>();

                  const fillOp = (i: number) =>
                    dispStep === i ? 0.2 : (isReplay && dispDone.has(i)) ? 0.08 : isReplay ? 0.03 : 0.07;
                  const strokeOp = (i: number) =>
                    dispStep === i ? 1 : (isReplay && dispDone.has(i)) ? 0.45 : isReplay ? 0.14 : 0.3;
                  const textOp = (i: number) =>
                    dispStep === i ? 1 : (isReplay && dispDone.has(i)) ? 0.62 : isReplay ? 0.2 : 0.6;

                  const cx = (i: number) => sp[i].x + NW / 2;
                  const cy = (i: number) => sp[i].y + NH / 2;

                  // Hoist Watch Story alert data (safe to compute here, used below)
                  const sa = replayStep !== null ? (STEP_ALERTS[def.typeKey] || [])[replayStep] : null;
                  const sevColor = sa?.severity === "critical" ? "#e03040" : sa?.severity === "high" ? "#c5253a" : "#d4882a";

                  // Dynamic arrows: connect consecutive nodes in sequence
                  const arrows = Array.from({ length: n - 1 }, (_, i) => {
                    const sameRow = sp[i].y === sp[i + 1].y;
                    return {
                      x1: sameRow ? sp[i].x + NW : cx(i),
                      y1: sameRow ? cy(i) : sp[i].y + NH,
                      x2: sameRow ? sp[i + 1].x : cx(i + 1),
                      y2: sameRow ? cy(i + 1) : sp[i + 1].y,
                      dashed: !sameRow,
                      lit: isReplay && dispDone.has(i),
                    };
                  });

                  return (
                    <>
                      <div key={`${def.typeKey}-${variantIdx}`} style={{ animation: "graphIn 0.5s ease both" }}>
                      <svg viewBox={`0 0 ${vbW} ${vbH}`} style={{ width: "100%", display: "block" }}>
                        <defs>
                          <marker id="ag-arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </marker>
                        </defs>

                        {/* Dynamic arrows */}
                        {arrows.map((a, i) => (
                          <line key={i}
                            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                            stroke={color}
                            strokeWidth={a.lit ? 1.3 : 0.7}
                            opacity={isReplay ? (a.lit ? 0.75 : 0.12) : 0.2}
                            strokeDasharray={a.dashed ? "5 3" : undefined}
                            markerEnd="url(#ag-arr2)"
                          />
                        ))}
                        {/* Dashed diagonal: node 1 → last node (correlated path, only when multi-row) */}
                        {ROW2 > 0 && n > 3 && (
                          <line
                            x1={sp[1].x + NW} y1={sp[1].y + NH}
                            x2={sp[n - 1].x} y2={sp[n - 1].y}
                            stroke={color} strokeWidth={0.6}
                            opacity={isReplay ? 0.18 : 0.15}
                            strokeDasharray="4 4"
                          />
                        )}

                        {/* Stage labels inside SVG above each node */}
                        {sp.map(({ x, y }, i) => (
                          <text key={i}
                            x={x + NW / 2} y={y - 8}
                            textAnchor="middle"
                            fill={isReplay && dispStep === i ? color : "rgba(197,165,126,0.28)"}
                            fontSize={7} fontWeight={700}
                            style={{ letterSpacing: "0.13em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}
                          >{STAGE_LABELS[i] ?? `STEP ${i + 1}`}</text>
                        ))}

                        {/* Step nodes */}
                        {loc.steps.map((st, i) => {
                          const { x, y } = sp[i];
                          return (
                            <g key={i} style={{ cursor: "pointer" }} onClick={() => setClickedStep(prev => prev === i ? null : i)}>
                              <rect x={x} y={y} width={NW} height={NH} rx={8}
                                fill={color} fillOpacity={fillOp(i)}
                                stroke={color} strokeOpacity={strokeOp(i)}
                                strokeWidth={dispStep === i ? 1.6 : 0.7}
                              />
                              {dispStep === i && (
                                <rect x={x - 2} y={y - 2} width={NW + 4} height={NH + 4} rx={10}
                                  fill="none" stroke={color} strokeWidth={0.5} opacity={0.28}
                                  style={{ animation: "pulse 2s ease-in-out infinite" }}
                                />
                              )}
                              {dispDone.has(i) && dispStep !== i && <text x={x + NW - 10} y={y + 12} fill={color} fontSize={8} opacity={0.6} textAnchor="middle" dominantBaseline="central">✓</text>}
                              <text x={x + 8} y={y + 12} fill={color} fillOpacity={dispStep === i ? 0.9 : 0.5} fontSize={7.5} fontWeight={700} dominantBaseline="central" style={{ fontFamily: "monospace" }}>{String(i + 1).padStart(2, "0")}</text>
                              {nodeIcon(i, x + NW / 2, y + 30, color, textOp(i))}
                              <text x={x + NW / 2} y={y + 52} textAnchor="middle" dominantBaseline="central"
                                fill="#f5ede0" fillOpacity={textOp(i)} fontSize={9.5} fontWeight={700}
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >{st.s.length > 13 ? st.s.slice(0, 12) + "…" : st.s}</text>
                            </g>
                          );
                        })}
                      </svg>
                      </div>

                      {/* Watch Story nav + XDR investigation card */}
                      {replayStep !== null && (
                        <div>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"8px 0 6px" }}>
                            <button onClick={() => setReplayStep(prev => Math.max(0, (prev??0)-1))} disabled={replayStep===0} style={{ background:"rgba(197,165,126,0.08)", border:"1px solid rgba(197,165,126,0.25)", borderRadius:6, color:replayStep===0?"rgba(197,165,126,0.25)":"#D5B893", fontSize:10, fontWeight:700, cursor:replayStep===0?"default":"pointer", padding:"4px 12px" }}>◀ Back</button>
                            <span style={{ fontSize:9, color:"rgba(197,165,126,0.45)", letterSpacing:"0.08em" }}>Step {replayStep+1} / {n}</span>
                            <button onClick={() => setReplayStep(prev => Math.min(n-1, (prev??0)+1))} disabled={replayStep===n-1} style={{ background:"rgba(197,165,126,0.08)", border:"1px solid rgba(197,165,126,0.25)", borderRadius:6, color:replayStep===n-1?"rgba(197,165,126,0.25)":"#D5B893", fontSize:10, fontWeight:700, cursor:replayStep===n-1?"default":"pointer", padding:"4px 12px" }}>Next ▶</button>
                          </div>
                          {sa && (
                            <div style={{ marginTop:4, padding:"11px 13px", borderRadius:10, background:"rgba(18,6,8,0.92)", border:`1px solid ${sevColor}28`, animation:"slideIn .2s ease" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8, padding:"5px 9px", background:"rgba(197,165,126,0.05)", borderRadius:7, border:"1px solid rgba(197,165,126,0.1)" }}>
                                <span style={{ fontSize:14 }}>{sa.entity.icon}</span>
                                <span style={{ fontSize:9, color:"rgba(197,165,126,0.5)", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", flexShrink:0 }}>{sa.entity.type}</span>
                                <span style={{ fontSize:10, color:"#f5ede0cc", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sa.entity.name}</span>
                              </div>
                              <div style={{ fontSize:12, color:"#f5ede0", fontWeight:700, marginBottom:6, lineHeight:1.4 }}>{sa.alert}</div>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
                                <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:4, background:`${sevColor}16`, border:`1px solid ${sevColor}40`, color:sevColor, letterSpacing:"0.1em" }}>{sa.severity.toUpperCase()}</span>
                                <span style={{ fontSize:9, color:"rgba(197,165,126,0.45)", fontFamily:"monospace" }}>{sa.mitre}</span>
                              </div>
                              <p style={{ margin:"0 0 7px", fontSize:11, color:"#f5ede0aa", lineHeight:1.55 }}><span style={{ color:"#c5a57e", fontWeight:700, fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase" }}>IOC  </span>{sa.ioc}</p>
                              <div style={{ borderTop:"1px solid rgba(197,165,126,0.1)", paddingTop:7 }}><span style={{ color:"#c5a57e", fontWeight:700, fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase" }}>ACTION  </span><span style={{ fontSize:11, color:"#f5ede0cc", lineHeight:1.55 }}>{sa.action}</span></div>
                            </div>
                          )}
                        </div>
                      )}
                      {replayStep === null && (
                        <div style={{ textAlign: "center", padding: "8px 0 2px" }}>
                          <span style={{ fontSize: 10, color: "rgba(197,165,126,0.28)", letterSpacing: "0.08em" }}>Tap any stage to read · ▶ Watch Story for real alert investigation</span>
                        </div>
                      )}
                      {/* Click-revealed description */}
                      {clickedStep !== null && (() => {
                        const cst = loc.steps[clickedStep];
                        const isLive = isReplay && step === clickedStep;
                        const isPast = isReplay && dispDone.has(clickedStep);
                        const badgeColor = isLive ? color : isPast ? "#22c55e" : "rgba(197,165,126,0.45)";
                        const badgeBg = isLive ? `${color}15` : isPast ? "rgba(34,197,94,0.1)" : "rgba(197,165,126,0.06)";
                        const badgeBorder = isLive ? `1px solid ${color}40` : isPast ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(197,165,126,0.2)";
                        const badgeText = isLive ? "● LIVE" : isPast ? "✓ PASSED" : `STEP ${clickedStep + 1}`;
                        return (
                          <div style={{ marginTop: 10, padding: "11px 14px", borderRadius: 10, background: "rgba(42,14,16,0.88)", border: `1px solid ${isLive ? color + "30" : "rgba(197,165,126,0.12)"}`, animation: "slideIn .2s ease", position: "relative" }}>
                            <button onClick={(e) => { e.stopPropagation(); setClickedStep(null); }} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "rgba(197,165,126,0.35)", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 2 }}>✕</button>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingRight: 20 }}>
                              <span style={{ fontSize: 16 }}>{cst.i}</span>
                              <span style={{ fontSize: 13, color: "#f5ede0", fontWeight: 700 }}>{cst.s}</span>
                              <span style={{ fontSize: 9, color: "rgba(197,165,126,0.5)", marginLeft: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>{STAGE_LABELS[clickedStep]}</span>
                              <span style={{ marginLeft: "auto", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: badgeColor, background: badgeBg, border: badgeBorder, padding: "2px 8px", borderRadius: 4, animation: isLive ? "blink 1.8s ease-in-out infinite" : "none" }}>{badgeText}</span>
                            </div>
                            <p style={{ fontSize: 12, color: "#f5ede0bb", lineHeight: 1.65, margin: "0 0 10px" }}>{cst.d}</p>
                            <div style={{ borderTop: "1px solid rgba(197,165,126,0.1)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                              <p style={{ margin: 0, fontSize: 11, color: "#f5ede0aa", lineHeight: 1.6 }}>
                                <span style={{ color: "#c5a57e", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 9 }}>Why attackers do this: </span>
                                {STAGE_EDUCATION[clickedStep].why}
                              </p>
                              <p style={{ margin: 0, fontSize: 11, color: "#f5ede0aa", lineHeight: 1.6 }}>
                                <span style={{ color: "#c5a57e", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 9 }}>Watch for: </span>
                                {STAGE_EDUCATION[clickedStep].watch}
                              </p>
                            </div>
                            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5, opacity: 0.5 }}>
                              <span style={{ width: 4, height: 4, borderRadius: "50%", background: isReplay ? color : "rgba(197,165,126,0.5)", display: "inline-block" }} />
                              <span style={{ fontSize: 9, color: isReplay ? color : "rgba(197,165,126,0.5)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                {isReplay ? `Watching story · Step ${replayStep! + 1} / 5` : "Browse mode · ▶ Watch Story to see live progression"}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Contained state */}
                      {step === -1 && done.size === 5 && clickedStep === null && (
                        <div style={{ marginTop: 10, padding: "9px 14px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.22)", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 16 }}>✅</span>
                          <span style={{ fontSize: 12, color: "#86efac", fontWeight: 600 }}>Attack contained — all stages logged. Monitoring for next incident.</span>
                        </div>
                      )}

                      {/* Legend */}
                      <div style={{ display: "flex", gap: 18, marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(197,165,126,0.1)", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#e03040", display: "inline-block" }}/><span style={{ fontSize: 9, color: "rgba(197,165,126,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Active</span></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#e0304060", display: "inline-block" }}/><span style={{ fontSize: 9, color: "rgba(197,165,126,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Complete</span></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#3a1a1c", display: "inline-block", border: "0.5px solid rgba(197,165,126,0.25)" }}/><span style={{ fontSize: 9, color: "rgba(197,165,126,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Pending</span></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <svg width="24" height="6"><line x1="0" y1="3" x2="24" y2="3" stroke="rgba(197,165,126,0.4)" strokeWidth="0.8" strokeDasharray="4 3"/></svg>
                          <span style={{ fontSize: 9, color: "rgba(197,165,126,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Correlated</span>
                        </div>

                      </div>
                    </>
                  );
                })() : (
                  <div style={{ textAlign: "center", padding: "24px 0 12px" }}>
                    <p style={{ fontSize: 10, color: "rgba(213,184,147,0.22)", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Initialising threat detection…</p>
                  </div>
                )}
              </div>
            </div>

                      {/* Character stations */}
            {ANALYSTS.map((a, i) => {
              const positions = [
                { left: 12, top: 12 },
                { right: 12, top: 12 },
                { left: 12, bottom: 12 },
                { right: 12, bottom: 12 },
              ];
              return (
                <div key={a.id} style={{ position: "absolute", ...positions[i], zIndex: 15 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#2a0e10dd", borderRadius: 14,
                    padding: "10px 20px 10px 10px",
                    border: `1.5px solid ${a.color}30`,
                    backdropFilter: "blur(6px)",
                    width: 220, minWidth: 220, 
                  }}>
                    <CharFrame analyst={a} width={110} />
                    <div>
                      <div style={{ fontSize: 18, color: "#f5ede0", fontWeight: 700 }}>{a.name}</div>
                      <div style={{ fontSize: 13, color: a.color, fontWeight: 600 }}>{a.role}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SOC DASHBOARD STRIP */}
          <div style={{ height: 100, background: "#2a0e10", borderTop: "2px solid #D5B89318", display: "flex", gap: 0, flexShrink: 0, overflow: "hidden" }}>
            {/* Panel 1: Traffic */}
            <div onClick={() => openPanel("traffic")} style={{ flex: 1, padding: "8px 12px", background: "#1a0a0b", margin: 3, borderRadius: 6, border: "1px solid #D5B89315", cursor: "pointer" }}>
              <div style={{ fontSize: 9, color: "#D5B89350", fontWeight: 700, letterSpacing: 2, marginBottom: 5 }}>{t('panels.traffic.title').toUpperCase()}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 52 }}>
                {trafficHist.slice(-30).map((v, i) => {
                  const max = Math.max(...trafficHist, 1);
                  const h = Math.max(2, (v / max) * 48);
                  return <div key={i} style={{ flex: 1, height: h, background: i > 24 ? "#D5B89360" : "#D5B89325", borderRadius: "2px 2px 0 0", transition: "height .5s" }} />;
                })}
              </div>
            </div>

            {/* Panel 2: Attack types */}
            <div onClick={() => openPanel("attacks")} style={{ flex: 1, padding: "8px 12px", background: "#1a0a0b", margin: 3, borderRadius: 6, border: "1px solid #D5B89315", cursor: "pointer" }}>
              <div style={{ fontSize: 9, color: "#D5B89350", fontWeight: 700, letterSpacing: 2, marginBottom: 5 }}>{t('panels.attacks.title').toUpperCase()}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {Object.entries(typeStats).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 4).map(([typeKey, count]) => {
                  const max = Math.max(...(Object.values(typeStats) as number[]), 1);
                  const threatDef = THREATS[typeKey];
                  return (
                    <div key={typeKey} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, width: 12, textAlign: "center" }}>{threatDef?.icon || "?"}</span>
                      <div style={{ flex: 1, height: 8, background: "#ffffff06", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${((count as number) / max) * 100}%`, background: (threatDef?.color || "#D5B893") + "60", borderRadius: 4, transition: "width .5s" }} />
                      </div>
                      <span style={{ fontSize: 8, color: "#f5ede040", fontFamily: "'JetBrains Mono'", minWidth: 14, textAlign: "right" }}>{count}</span>
                    </div>
                  );
                })}
                {Object.keys(typeStats).length === 0 && <div style={{ fontSize: 9, color: "#f5ede015", textAlign: "center", paddingTop: 8 }}>{t('panels.attacks.collecting')}</div>}
              </div>
            </div>

            {/* Panel 3: Severity */}
            <div onClick={() => openPanel("severity")} style={{ flex: 1, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, background: "#1a0a0b", margin: 3, borderRadius: 6, border: "1px solid #D5B89315", cursor: "pointer" }}>
              {(() => {
                const sevCounts = [0, 0, 0, 0];
                alerts.forEach(a => { 
                  if (a && a.threat && a.threat.sev) {
                    sevCounts[Math.min(a.threat.sev - 1, 3)]++; 
                  }
                });
                const totalSev = sevCounts.reduce((s, c) => s + c, 0) || 1;
                const colors = ["#22c55e", "#f59e0b", "#ef4444", "#dc2626"];
                const labels = [t('severity.low'), t('severity.med'), t('severity.high'), t('severity.crit')];
                let cumPct = 0;
                const segments = sevCounts.map((c, i) => { const pct = (c / totalSev) * 100; const start = cumPct; cumPct += pct; return { start, pct, color: colors[i] }; });
                const maxSev = Math.max(...sevCounts, 1);
                return (
                  <>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", position: "relative", background: `conic-gradient(${segments.map(s => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(", ")})`, flexShrink: 0 }}>
                      <div style={{ position: "absolute", inset: 7, borderRadius: "50%", background: "#1a0a0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 10, color: "#f5ede066", fontWeight: 700 }}>{total}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {labels.map((l, i) => (
                        <div key={l} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8 }}>
                          <div style={{ width: 5, height: 5, borderRadius: 1, background: colors[i] }} />
                          <span style={{ color: "#f5ede040", width: 22 }}>{l}</span>
                          <span style={{ color: colors[i], fontWeight: 700, fontFamily: "'JetBrains Mono'", fontSize: 8 }}>{sevCounts[i]}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 3, height: 55, marginLeft: 4 }}>
                      {labels.map((l, i) => (
                        <div key={l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <span style={{ fontSize: 7, color: colors[i], fontFamily: "'JetBrains Mono'", fontWeight: 700 }}>{sevCounts[i]}</span>
                          <div style={{ width: "100%", background: "#ffffff06", borderRadius: 3, height: 40, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
                            <div style={{ width: "100%", height: `${Math.max(4, (sevCounts[i] / maxSev) * 100)}%`, background: `${colors[i]}50`, borderRadius: 3, transition: "height .5s" }} />
                          </div>
                          <span style={{ fontSize: 6, color: "#f5ede030" }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Panel 4: Status */}
            <div onClick={() => openPanel("status")} style={{ width: 110, padding: "8px 12px", background: "#1a0a0b", margin: 3, borderRadius: 6, border: "1px solid #D5B89315", cursor: "pointer" }}>
              <div style={{ fontSize: 9, color: "#D5B89350", fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>{t('panels.status.title').toUpperCase()}</div>
              {[
                { label: t('status.firewall'),  status: "UP",                      color: "#22c55e" },
                { label: t('status.ids'),  status: "UP",                      color: "#22c55e" },
                { label: t('status.siem'),     status: "UP",                      color: "#22c55e" },
                { label: t('status.endpoints'),status: total > 8 ? "ALERT" : "OK",color: total > 8 ? "#f59e0b" : "#22c55e" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 8, color: "#f5ede040" }}>{s.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
                    <span style={{ fontSize: 7, color: s.color, fontWeight: 700, fontFamily: "'JetBrains Mono'" }}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: CHAT + FEED */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", borderLeft: "1px solid #D5B89315" }}>

          {/* CHAT */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "rgba(255,255,255,.06)", backdropFilter: "blur(12px)" }}>
            <div onClick={() => openPanel("chat")} style={{ padding: "8px 14px", background: "#2a0e10", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 12, color: "#D5B89380", fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <span>💬</span> {t('panels.chat.title')} <span style={{ fontSize: 8, color: "#f5ede020", marginLeft: "auto" }}>ⓘ</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 10, minHeight: 0 }}>
              {chatMsgs.length === 0 && <div style={{ color: "#f5ede020", fontSize: 13, textAlign: "center", paddingTop: 30 }}>{t('chat.waiting')}</div>}
              {chatMsgs.map((msg) => (
                <div key={msg.id} style={{ display: "flex", gap: 8, marginBottom: 12, animation: "slideIn .3s ease" }}>
                  <ChatAvatar analyst={msg.from} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color: msg.from.color, fontWeight: 700 }}>{msg.from.name}</span>
                      <span style={{ fontSize: 8, color: "#f5ede020" }}>{msg.time}</span>
                    </div>
                    <div style={{
                      fontSize: 13, color: "#f5ede0dd", lineHeight: 1.5, wordBreak: "break-word",
                      background: "rgba(255,255,255,.05)", borderRadius: "2px 12px 12px 12px",
                      padding: "8px 12px", border: "1px solid rgba(255,255,255,.04)",
                    }}>
                      {msg.textKey}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* FEED */}
          <div style={{ height: 180, display: "flex", flexDirection: "column", borderTop: "1px solid #D5B89310", flexShrink: 0 }}>
            <div style={{ padding: "5px 14px", borderBottom: "1px solid #D5B89310", fontSize: 11, color: "#D5B89350", fontWeight: 700, letterSpacing: 2, flexShrink: 0 }}>📋 {t('feed.title')}</div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {alerts.map((a) => {
                const localizedThreat = getLocalizedThreat(a.threat);
                return (
                  <div key={a.id} onClick={(e) => { e.stopPropagation(); openLesson(a.threat); }} style={{ padding: "6px 14px", borderBottom: "1px solid #ffffff04", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 13 }}>{a.threat.icon}</span>
                        <span style={{ fontSize: 13, color: a.threat.color, fontWeight: 600 }}>{localizedThreat.type}</span>
                        {completed.has(a.threat.typeKey) && <span style={{ fontSize: 10, color: "#22c55e" }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 10, color: "#f5ede025", fontFamily: "'JetBrains Mono'" }}>{a.time}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#f5ede040", marginTop: 1 }}>→ {getLocalizedTarget(a.targetKey)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL INFO POPUPS — multiple, close each independently */}
      {panelPopups.map((key, pi) => PANEL_INFO[key] && (
        <DraggableFloater key={key} onClose={() => closePanel(key)} width={440} initialX={180 + pi * 30} initialY={90 + pi * 30}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(197,165,126,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>{PANEL_INFO[key].icon}</span>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#f5ede0", margin: 0, flex: 1 }}>{PANEL_INFO[key].title}</h3>
          </div>
          <div style={{ padding: "16px 18px 20px" }}>
            <div style={{ fontSize: 9, color: "#D5B893", fontWeight: 700, letterSpacing: "0.15em", marginBottom: 6, textTransform: "uppercase" }}>{t('popup.what')}</div>
            <div style={{ fontSize: 13, color: "#f5ede0cc", lineHeight: 1.7, marginBottom: 16 }}>{PANEL_INFO[key].explanation}</div>
            <div style={{ background: "rgba(42,14,16,0.8)", borderRadius: 10, padding: 14, border: "1px solid rgba(197,165,126,0.1)" }}>
              <div style={{ fontSize: 9, color: "#D5B893", fontWeight: 700, letterSpacing: "0.15em", marginBottom: 6, textTransform: "uppercase" }}>{t('popup.real_soc')}</div>
              <div style={{ fontSize: 12, color: "#f5ede0aa", lineHeight: 1.7 }}>{PANEL_INFO[key].why}</div>
            </div>
          </div>
        </DraggableFloater>
      ))}
      {/* EDUCATION POPUPS — multiple, close each independently */}
      {popupThreats.map((item, pi) => {
        const { loc: threat, activeStep, animating, quizAnswer } = item;
        const key = threat.type;
        return (
          <DraggableFloater key={key} onClose={() => closeLesson(key)} width={540} initialX={250 + pi * 35} initialY={60 + pi * 35}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(197,165,126,0.12)", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>{threat.icon}</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#f5ede0", margin: 0 }}>{threat.type}</h2>
                <div style={{ fontSize: 12, color: threat.color, fontWeight: 600 }}>{threat.tagline}</div>
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "#D5B893", fontWeight: 700, letterSpacing: 2 }}>{t('popup.how_it_works')}</span>
                  <button onClick={() => updateLesson(key, {activeStep: 0, animating: true})} style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #D5B89330", background: "transparent", color: "#D5B893", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>{t('popup.play')}</button>
                </div>
                {threat.steps.map((step: {s:string;d:string;i:string}, si: number) => {
                  const on = si <= activeStep;
                  return (
                    <div key={si} onClick={() => updateLesson(key, {activeStep: si, animating: false})} style={{ display: "flex", gap: 12, marginBottom: 8, opacity: on ? 1 : 0.2, transition: "all .4s", cursor: "pointer" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 30 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: on ? `${threat.color}20` : "#ffffff08", border: `2px solid ${on ? threat.color : "#ffffff10"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{step.i}</div>
                        {si < threat.steps.length - 1 && <div style={{ width: 2, height: 16, background: on ? `${threat.color}30` : "#ffffff08" }} />}
                      </div>
                      <div><div style={{ fontSize: 14, fontWeight: 700, color: on ? "#f5ede0" : "#f5ede033" }}>{step.s}</div><div style={{ fontSize: 12, color: on ? "#f5ede099" : "#f5ede022", lineHeight: 1.5 }}>{step.d}</div></div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: "#2a0e10", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #D5B89315" }}>
                <div style={{ fontSize: 11, color: "#D5B893", fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>📰 {t('popup.real_world_case')}</div>
                <div style={{ fontSize: 13, color: "#f5ede0cc", lineHeight: 1.7 }}>{threat.realWorld}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>🛡 {t('popup.defenses')}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {threat.defenses.map((d: string, di: number) => (
                    <div key={di} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: "#22c55e06", borderRadius: 8, border: "1px solid #22c55e12", fontSize: 12, color: "#f5ede0aa" }}>
                      <span style={{ color: "#22c55e" }}>✓</span>{d}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#2a0e10", borderRadius: 12, padding: 16, border: "1px solid #D5B89315" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "#D5B893", fontWeight: 700, letterSpacing: 2 }}>🧠 {t('popup.quiz')}</span>
                  {quizAnswer !== null && <span style={{ fontSize: 12, color: quizAnswer === threat.quiz.ans ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{quizAnswer === threat.quiz.ans ? t('popup.correct') : t('popup.wrong')}</span>}
                </div>
                <div style={{ fontSize: 15, color: "#f5ede0", fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{threat.quiz.q}</div>
                {threat.quiz.opts.map((opt: string, oi: number) => {
                  const isC = oi === threat.quiz.ans; const isS = quizAnswer === oi; const done = quizAnswer !== null;
                  return (
                    <button key={oi} onClick={() => { updateLesson(key, {quizAnswer: oi}); if (oi === threat.quiz.ans) { const tk = Object.entries(THREATS).find(([_,d]) => d.icon === threat.icon)?.[0]; if(tk) setCompleted(p => new Set([...p, tk])); } }} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, textAlign: "left", marginBottom: 5, fontSize: 13, color: "#f5ede0", fontWeight: isS ? 700 : 400, cursor: done ? "default" : "pointer", border: `1.5px solid ${done?(isC?"#22c55e30":isS?"#ef444430":"#ffffff08"):"#ffffff08"}`, background: done?(isC?"#22c55e08":isS?"#ef444408":"transparent"):"#ffffff04" }}>
                      <span style={{ opacity: .4, marginRight: 8 }}>{String.fromCharCode(65+oi)}.</span>{opt}
                      {done && isC && <span style={{ float: "right", color: "#22c55e" }}>✓</span>}
                      {done && isS && !isC && <span style={{ float: "right", color: "#ef4444" }}>✗</span>}
                    </button>
                  );
                })}
                {quizAnswer !== null && <div style={{ marginTop: 10, padding: "10px 14px", background: quizAnswer===threat.quiz.ans?"#22c55e08":"#ef444408", borderRadius: 8, border: `1px solid ${quizAnswer===threat.quiz.ans?"#22c55e20":"#ef444420"}`, fontSize: 13, color: "#f5ede0aa", lineHeight: 1.6 }}>{threat.quiz.why}</div>}
              </div>
            </div>
          </DraggableFloater>
        );
      })}

      <div style={{ padding: "5px 20px", background: "#2a0e10", borderTop: "1px solid #D5B89315", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "#f5ede025" }}>{t('footer.simulated')}</span>
        <span style={{ fontSize: 10, color: "#D5B893" }}>{t('footer.instruction')}</span>
      </div>

      <style>{`
        @keyframes blink   { 0%,100%{opacity:1}  50%{opacity:.3} }
        @keyframes graphIn { from{opacity:0;transform:translateY(8px) scale(0.98)} to{opacity:1;transform:none} }
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}


// DraggableFloater — reusable draggable panel matching SOC aesthetic
function DraggableFloater({
  children, onClose, width = 480, initialX, initialY,
}: {
  children: React.ReactNode; onClose: () => void;
  width?: number; initialX?: number; initialY?: number;
}) {
  const [pos, setPos] = useState(() => ({
    x: initialX ?? (typeof window !== "undefined" ? Math.max(60, window.innerWidth / 2 - width / 2) : 300),
    y: initialY ?? 80,
  }));
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    const move = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: ev.clientX - offset.current.x, y: ev.clientY - offset.current.y });
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div style={{
      position: "fixed", left: pos.x, top: pos.y, width,
      background: "linear-gradient(160deg, #130407 0%, #220b0e 80%, #170608 100%)",
      border: "1px solid rgba(197,165,126,0.28)",
      borderRadius: 16,
      boxShadow: "0 24px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(197,165,126,0.08)",
      zIndex: 500, overflow: "hidden", userSelect: "none",
      maxHeight: "85vh", display: "flex", flexDirection: "column",
    }}>
      {/* Drag handle — invisible, covers the header row */}
      <div onMouseDown={onHeaderMouseDown} style={{
        position: "absolute", top: 0, left: 0, right: 44, height: 46,
        cursor: "grab", zIndex: 1,
      }} />
      {/* Close button */}
      <button onClick={onClose} style={{
        position: "absolute", top: 8, right: 10, zIndex: 2,
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, color: "rgba(197,165,126,0.55)", fontSize: 16, lineHeight: 1,
        cursor: "pointer", width: 30, height: 30,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>✕</button>
      <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
    </div>
  );
}

// CharFrame component
function CharFrame({ analyst, width = 48 }: { analyst: { name: string; emoji: string; img: string; color: string }; width?: number }) {
  const [imgError, setImgError] = useState(false);
  const height = Math.round(width * (4 / 3));
  return (
    <div style={{
      width, height, borderRadius: 10, overflow: "hidden", flexShrink: 0,
      background: `${analyst.color}10`, border: `2px solid ${analyst.color}35`,
    }}>
      {!imgError ? (
        <img
          src={analyst.img}
          alt={analyst.name}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: width * 0.5 }}>
          {analyst.emoji}
        </div>
      )}
    </div>
  );
}

// ChatAvatar component
function ChatAvatar({ analyst }: { analyst: {
  profile: string | Blob | undefined; emoji: string; color: string 
} }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      background: `${analyst.color}18`,
      border: `1.5px solid ${analyst.color}35`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18,
    }}>
      <img src={analyst.profile} alt={analyst.emoji} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
    </div>
  );
}