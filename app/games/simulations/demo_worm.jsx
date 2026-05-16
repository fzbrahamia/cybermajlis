import { useState, useEffect, useRef } from "react";
import HamadCommentary from "@/components/HamadCommentary";
import { useTranslations } from "next-intl";

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const NETWORK_DEVICES = [
  { id: "router", label: "Router (Entry)", ip: "192.168.1.1", type: "router", x: 50, y: 8, ports: [53, 80], vuln: null, icon: "📡", difficulty: "entry" },
  // Branch 1: Office path (left)
  { id: "pc1", label: "Office PC", ip: "192.168.1.108", type: "computer", x: 15, y: 30, ports: [21, 80, 445], vuln: "ftp", icon: "🖥", difficulty: "medium" },
  { id: "printer", label: "Network Printer", ip: "192.168.1.55", type: "iot", x: 5, y: 55, ports: [9100, 631], vuln: "open_port", icon: "🖨", difficulty: "easy" },
  { id: "nas", label: "NAS Storage", ip: "192.168.1.120", type: "server", x: 25, y: 60, ports: [21, 445, 8080], vuln: "ftp", icon: "💾", difficulty: "medium" },
  // Branch 2: Server path (center)
  { id: "server", label: "File Server", ip: "192.168.1.200", type: "server", x: 50, y: 35, ports: [21, 22, 80, 445], vuln: "ftp", icon: "🗄", difficulty: "medium" },
  { id: "db", label: "Database", ip: "192.168.1.201", type: "server", x: 45, y: 60, ports: [3306, 5432], vuln: null, icon: "🛢", difficulty: "hard" },
  // Branch 3: Smart home path (right)
  { id: "laptop", label: "Laptop", ip: "192.168.1.109", type: "computer", x: 85, y: 30, ports: [80, 443], vuln: null, icon: "💻", difficulty: "hard" },
  { id: "camera", label: "IP Camera", ip: "192.168.1.50", type: "iot", x: 75, y: 55, ports: [80, 554, 8080], vuln: "default_pw", icon: "📹", difficulty: "easy" },
  { id: "fridge", label: "Smart Fridge", ip: "192.168.1.60", type: "iot", x: 92, y: 55, ports: [80, 8443], vuln: "default_pw", icon: "🧊", difficulty: "easy" },
  { id: "speaker", label: "Smart Speaker", ip: "192.168.1.70", type: "iot", x: 85, y: 78, ports: [8008, 8443], vuln: "default_pw", icon: "🔊", difficulty: "easy" },
  // Hidden deep target
  { id: "scada", label: "HVAC Controller", ip: "192.168.1.250", type: "iot", x: 50, y: 88, ports: [502, 80], vuln: "default_pw", icon: "🌡", difficulty: "easy" },
];

// Network topology — NOT everything connects to router directly
// Creates branching paths the worm must navigate
const CONNECTIONS = [
  // Router connects to 3 main branches
  ["router", "pc1"],      // Left: office
  ["router", "server"],   // Center: server room
  ["router", "laptop"],   // Right: personal devices
  // Office branch
  ["pc1", "printer"],     // Printer behind office PC
  ["pc1", "nas"],         // NAS behind office PC
  // Server branch
  ["server", "db"],       // Database behind server
  ["server", "scada"],    // HVAC connected to server network
  ["nas", "scada"],       // NAS also reaches HVAC (alternate path!)
  // Smart home branch
  ["laptop", "camera"],   // Camera behind laptop
  ["laptop", "fridge"],   // Fridge behind laptop
  ["camera", "speaker"],  // Speaker only reachable through camera
  // Cross-connections (alternate paths)
  ["printer", "camera"],  // Printer and camera on same IoT VLAN
];

const VULN_DETAILS = {
  ftp: { name: "FTP (Port 21)", method: "Anonymous FTP login", exploit: "Uploaded payload to Startup folder" },
  default_pw: { name: "Default Password", method: "admin:admin login", exploit: "Gained full device control" },
  open_port: { name: "Unprotected Service", method: "Direct service access", exploit: "Injected payload via open port" },
};

function randomiseVulns() {
  const devices = NETWORK_DEVICES.map(d => ({ ...d }));
  const medium = devices.filter(d => d.difficulty === "medium");
  const hard = devices.filter(d => d.difficulty === "hard");
  medium.forEach(d => { d.vuln = null; });
  medium.sort(() => Math.random() - 0.5).slice(0, 2).forEach(d => { d.vuln = pick(["ftp","open_port"]); });
  hard.forEach(d => { d.vuln = null; });
  if (Math.random() > 0.5 && hard.length) hard[0].vuln = "ftp";
  return devices;
}


export default function WormDemo() {
  const  t  = useTranslations();
  const [activeDevices, setActiveDevices] = useState(NETWORK_DEVICES);
  const [commentTrigger, setCommentTrigger] = useState(null);
  const [attempts, setAttempts] = useState(1);

  useEffect(() => {
    setActiveDevices(randomiseVulns());
    const saved = localStorage.getItem("cm-game-worm");
    if (saved) try { setAttempts(JSON.parse(saved).attempts + 1); } catch {}
    const cv = JSON.parse(localStorage.getItem("cm-game-worm")||"{}");
    localStorage.setItem("cm-game-worm", JSON.stringify({attempts:(cv.attempts||0)+1}));
  }, []);
  const [phase, setPhase] = useState("intro"); // intro | terminal | map | complete
  const [termLines, setTermLines] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [infected, setInfected] = useState(new Set(["router"]));
  const [scanning_device, setScanningDevice] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [wormPos, setWormPos] = useState("router");
  const [totalScanned, setTotalScanned] = useState(0);
  const [log, setLog] = useState([]);
  const termRef = useRef(null);
  const intervalRef = useRef(null);

  // Terminal phase — auto-plays the worm scanning sequence
  const startTerminal = async () => {
    setPhase("terminal");
    setTimeout(() => setCommentTrigger("start"), 1000);
    setTermLines([]);
    const addLine = (text, color = "#c9d1d9", delay = 0) => {
      return new Promise(r => setTimeout(() => {
        setTermLines(prev => [...prev, { text, color }]);
        r();
      }, delay));
    };

    await addLine("╔══════════════════════════════════════════╗", "#00bcd4", 200);
    await addLine("║     WORM PROPAGATION SIMULATOR           ║", "#00bcd4", 100);
    await addLine("║     Educational Cyber Range Demo          ║", "#00bcd4", 100);
    await addLine("╚══════════════════════════════════════════╝", "#00bcd4", 200);
    await addLine("", "#666", 300);
    await addLine("✔ Initializing worm propagation system...", "#c9d1d9", 400);
    await addLine("", "#666", 200);
    await addLine("⚡ Attacker Info:", "#c9d1d9", 300);
    await addLine("   IP Address: 192.168.1.110", "#4fc3f7", 150);
    await addLine("   Network:    255.255.255.0", "#4fc3f7", 150);
    await addLine("   Payload:    payload.bat", "#4fc3f7", 200);
    await addLine("─────────────────────────────────────────", "#00bcd4", 400);
    await addLine("🔍 Scanning network for victim hosts...", "#c9d1d9", 500);
    await addLine("", "#666", 300);
    await addLine("Analyzing ARP cache...", "#ffeb3b", 400);
    await addLine("  → Found: 169.254.200.97", "#c9d1d9", 200);
    await addLine("  → Found: 192.168.1.1", "#c9d1d9", 150);
    await addLine("  → Found: 192.168.1.108", "#c9d1d9", 150);
    await addLine("  → Found: 192.168.1.109", "#c9d1d9", 150);
    await addLine("  → Found: 224.0.0.251", "#c9d1d9", 200);
    await addLine("", "#666", 200);
    await addLine("✔ Discovered 5 potential victims!", "#4caf50", 400);
    await addLine("", "#666", 200);
    await addLine("⚠ Beginning attack sequence...", "#ff9800", 600);
    await addLine("═══════════════════════════════════════", "#00bcd4", 300);
    await addLine("🎯 TARGET LOCKED: 192.168.1.108", "#f44336", 400);
    await addLine("═══════════════════════════════════════", "#00bcd4", 200);
    await addLine("🔧 Scanning ports 20-60...", "#c9d1d9", 300);
    await addLine("   Progress ████████████████████ 100.0%", "#c9d1d9", 600);
    await addLine("   ⚠ OPEN PORT: 21 → FTP", "#ff9800", 200);
    await addLine("", "#666", 200);
    await addLine("💀 VULNERABLE FTP DETECTED: [21]", "#f44336", 400);
    await addLine("═══════════════════════════════════════", "#f44336", 200);
    await addLine("🔓 Attempting FTP exploitation on 192.168.1.108:21...", "#ff9800", 500);
    await addLine("   🔐 Trying plain FTP with 'ftpuser1'...", "#ba68c8", 400);
    await addLine("   ✔ FTP login successful!", "#4caf50", 300);
    await addLine("", "#666", 200);
    await addLine("💀 ACCESS GRANTED! Logged in as 'ftpuser1'", "#f44336", 400);
    await addLine("   📂 Current directory: /", "#c9d1d9", 200);
    await addLine("   📁 Searching for Windows Startup folder...", "#ba68c8", 500);
    await addLine("     → Users → sarah → AppData → Roaming", "#888", 200);
    await addLine("     → Microsoft → Windows → Start Menu", "#888", 200);
    await addLine("     → Programs → Startup", "#4caf50", 200);
    await addLine("   ✔ STARTUP FOLDER FOUND!", "#4caf50", 300);
    await addLine("   📤 Uploading payload...", "#ba68c8", 400);
    await addLine("   Upload ████████████████████ 100.0%", "#c9d1d9", 600);
    await addLine("   ✔ PAYLOAD UPLOADED: payload.bat", "#4caf50", 300);
    await addLine("   ⚠ Will AUTO-EXECUTE on system restart!", "#ff9800", 300);
    await addLine("", "#666", 300);
    await addLine("╔══════════════════════════════════════════╗", "#4caf50", 200);
    await addLine("║  🐛 HOST INFECTED: 192.168.1.108         ║", "#4caf50", 200);
    await addLine("║     WORM SUCCESSFULLY PROPAGATED!         ║", "#4caf50", 200);
    await addLine("╚══════════════════════════════════════════╝", "#4caf50", 400);
    await addLine("", "#666", 500);
    await addLine(t("DemoWorm.terminal.transitionPrompt"), "#00bcd4", 300);

    // Auto-transition to map after a pause
    setTimeout(() => setPhase("map"), 3000);
  };

  // Map phase — player clicks devices to scan and exploit
  const scanDevice = (device) => {
    if (device.id === "router" || infected.has(device.id) || scanning) return;
    setScanning(true);
    setScanningDevice(device.id);
    setSelectedDevice(device);
    setScanResult(null);

    // Can reach if connected to ANY infected device
    const canReach = CONNECTIONS.some(([a, b]) =>
      (a === device.id && infected.has(b)) || (b === device.id && infected.has(a))
    );

    const newLog = [...log, { text: `🎯 Scanning ${device.label} (${device.ip})...`, color: "#4fc3f7" }];

    setTimeout(() => {
      if (!canReach) {
        setScanResult({ success: false, reason: t("DemoWorm.scan.unreachable") });
        setLog([...newLog, { text: `✗ ${device.ip} — unreachable from current position`, color: "#f44336" }]);
        setScanning(false);
        return;
      }

      // Scan ports
      const portLog = device.ports.map(p => `  Port ${p}: OPEN`).join("\n");
      newLog.push({ text: `  Ports found: ${device.ports.join(", ")}`, color: "#c9d1d9" });

      if (device.vuln) {
        const v = VULN_DETAILS[device.vuln];
        newLog.push({ text: `  💀 Vulnerable: ${v.name}`, color: "#f44336" });
        newLog.push({ text: `  🔓 ${v.method}`, color: "#ff9800" });
        newLog.push({ text: `  ✔ ${v.exploit}`, color: "#4caf50" });
        newLog.push({ text: `  🐛 HOST INFECTED: ${device.ip}`, color: "#4caf50" });

        setScanResult({ success: true, vuln: v, device });
        setInfected(prev => {
        const next = new Set([...prev, device.id]);
        if (device.type === "iot") setCommentTrigger("iot_infected");
        else if (device.vuln === "ftp") setCommentTrigger("ftp_exploit");
        else if (device.vuln === "default_pw") setCommentTrigger("default_pw");
        if (next.size >= Math.floor(activeDevices.length / 2)) setCommentTrigger("half_network");
        return next;
      });
        setWormPos(device.id);
        setTotalScanned(t => t + 1);

        // Check if all vulnerable devices infected
        const allVuln = NETWORK_DEVICES.filter(d => d.vuln);
        const newInf = new Set([...infected, device.id]);
        if (allVuln.every(d => newInf.has(d.id))) {
          setTimeout(() => setPhase("complete"), 1500);
        }
      } else {
        newLog.push({ text: `  🛡 No exploitable vulnerability found`, color: "#ff9800" });
        newLog.push({ text: `  Host is patched and secure (for now...)`, color: "#888" });
        setScanResult({ success: false, reason: t("DemoWorm.scan.secure") });
        setTotalScanned(t => t + 1);
      }

      setLog(newLog);
      setScanning(false);
    }, 1200);
  };

  if (phase === "intro") {
    return (
      <div style={{ width: "100%", height: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Consolas', monospace" }}>
        <div style={{ textAlign: "center", maxWidth: 520, padding: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🐛</div>
          <h1 style={{ fontSize: 28, color: "#c9d1d9", fontWeight: 400, marginBottom: 8 }}>{t("DemoWorm.intro.title")} <span style={{ color: "#00bcd4" }}>{t("DemoWorm.intro.titleAccent")}</span></h1>
          <p style={{ color: "#8b949e", fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
            {t("DemoWorm.intro.description")}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={startTerminal} style={{ padding: "12px 28px", background: "linear-gradient(135deg, #00838f, #00bcd4)", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{t("DemoWorm.intro.watchBtn")}</button>
            <button onClick={() => setPhase("map")} style={{ padding: "12px 28px", background: "transparent", border: "1px solid #30363d", borderRadius: 8, color: "#8b949e", fontSize: 14, cursor: "pointer" }}>{t("DemoWorm.intro.skipBtn")}</button>
          </div>
          <div style={{ marginTop: 20, fontSize: 10, color: "#3fb950", padding: "4px 12px", display: "inline-block", borderRadius: 10, border: "1px solid #3fb95030", background: "#3fb95010" }}>● {t("DemoWorm.intro.safeBadge")}</div>
        </div>
      </div>
    );
  }

  if (phase === "terminal") {
    return (
      <div style={{ width: "100%", height: "100vh", background: "#1e1e1e", fontFamily: "'Consolas', monospace", display: "flex", flexDirection: "column" }}>
        {/* VS Code style header */}
        <div style={{ background: "#323233", padding: "4px 12px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #3c3c3c", fontSize: 11 }}>
          <span style={{ color: "#999" }}>{t("DemoWorm.vscode.problems")}</span>
          <span style={{ color: "#999" }}>{t("DemoWorm.vscode.output")}</span>
          <span style={{ color: "#999" }}>{t("DemoWorm.vscode.debugConsole")}</span>
          <span style={{ color: "#fff", borderBottom: "1px solid #007acc", paddingBottom: 3 }}>{t("DemoWorm.vscode.terminal")}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#999" }}>⊕ Python</span>
          </div>
        </div>
        {/* Terminal output */}
        <div ref={termRef} style={{ flex: 1, overflowY: "auto", padding: 16, fontSize: 12, lineHeight: 1.7 }}>
          {termLines.map((line, i) => (
            <div key={i} style={{ color: line.color, whiteSpace: "pre-wrap" }}>{line.text}</div>
          ))}
        </div>
        {/* VS Code status bar */}
        <div style={{ background: "#007acc", padding: "2px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#fff" }}>
          <span>Ln 253, Col 36</span>
          <span>Spaces: 4 · UTF-8 · LF · Python · 3.7.4 64-bit</span>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    const vulnDevices = NETWORK_DEVICES.filter(d => d.vuln);
    return (
      <div style={{ width: "100%", height: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Consolas', monospace" }}>
        <div style={{ textAlign: "center", maxWidth: 500, padding: 32, background: "#161b22", borderRadius: 16, border: "1px solid #30363d" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐛</div>
          <div style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #4caf5040", background: "#4caf5010", display: "inline-block", marginBottom: 16 }}>
            <span style={{ color: "#4caf50", fontSize: 16, fontWeight: 700 }}>● {t("DemoWorm.complete.badge")} ●</span>
          </div>
          <div style={{ color: "#c9d1d9", fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
            <div>📊 <strong>{t("DemoWorm.complete.statsTitle")}</strong></div>
            <div style={{ color: "#4fc3f7" }}>  {t("DemoWorm.complete.hostsScanned", { count: totalScanned })}</div>
            <div style={{ color: "#f44336" }}>  {t("DemoWorm.complete.hostsInfected", { count: infected.size })}</div>
          </div>
          <div style={{ textAlign: "left", marginBottom: 16 }}>
            <div style={{ color: "#c9d1d9", fontSize: 11, marginBottom: 6 }}>🐛 {t("DemoWorm.complete.infectedHostsTitle")}</div>
            {[...infected].map(id => {
              const d = NETWORK_DEVICES.find(n => n.id === id);
              return <div key={id} style={{ color: "#f44336", fontSize: 11, marginLeft: 12 }}>● {d?.ip} ({d?.label}) — {d?.type === "iot" ? t("DemoWorm.complete.iotDevice") : d?.type}</div>;
            })}
          </div>
          <div style={{ background: "#ff980810", border: "1px solid #ff980830", borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ color: "#ff9800", fontSize: 11, lineHeight: 1.7 }}>
              <strong>⚠ {t("DemoWorm.complete.lessonLabel")}</strong> {t("DemoWorm.complete.lessonBody", { infected: infected.size, iot: [...infected].filter(id => NETWORK_DEVICES.find(d => d.id === id)?.type === "iot").length })}
            </div>
          </div>
          <button onClick={() => { setPhase("intro"); setInfected(new Set(["router"])); setLog([]); setTotalScanned(0); setSelectedDevice(null); setScanResult(null); setWormPos("router"); }} style={{ padding: "10px 24px", background: "#00838f", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t("DemoWorm.complete.runAgain")}</button>
        </div>
      </div>
    );
  }

  // MAP PHASE — interactive network
  return (
    <div style={{ width: "100%", height: "100vh", background: "#0a0e1a", fontFamily: "'Consolas', monospace", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>{["#f85149","#d29922","#3fb950"].map((c,i) => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}</div>
          <span style={{ fontSize: 12, color: "#8b949e" }}>{t("DemoWorm.map.filename")}</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#f44336" }}>{t("DemoWorm.map.infected", { count: infected.size, total: NETWORK_DEVICES.filter(d => d.vuln).length })}</span>
          <span style={{ fontSize: 10, color: "#8b949e" }}>{t("DemoWorm.map.scanned", { count: totalScanned })}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Network Map */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Instructions */}
          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 20, fontSize: 11, color: "#8b949e", background: "#161b22", padding: "6px 16px", borderRadius: 8, border: "1px solid #30363d" }}>
            {t("DemoWorm.map.instructions")}
          </div>

          {/* Network cables (SVG lines) */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
            {CONNECTIONS.map(([a, b], i) => {
              const da = activeDevices.find(d => d.id === a);
              const db = activeDevices.find(d => d.id === b);
              const bothInf = infected.has(a) && infected.has(b);
              const oneInf = infected.has(a) || infected.has(b);
              return <line key={i} x1={`${da.x}%`} y1={`${da.y}%`} x2={`${db.x}%`} y2={`${db.y}%`}
                stroke={bothInf ? "#f4433660" : oneInf ? "#00bcd430" : "#30363d"} strokeWidth={bothInf ? 2 : 1}
                strokeDasharray={bothInf ? "none" : "4 4"} />;
            })}
          </svg>

          {/* Devices */}
          {activeDevices.map(device => {
            const isInf = infected.has(device.id);
            const isScanning = scanning_device === device.id;
            const isSelected = selectedDevice?.id === device.id;
            return (
              <div key={device.id} onClick={() => scanDevice(device)}
                style={{
                  position: "absolute", left: `${device.x}%`, top: `${device.y}%`, transform: "translate(-50%,-50%)",
                  zIndex: 10, cursor: isInf ? "default" : "pointer", textAlign: "center",
                  transition: "all .3s", filter: isScanning ? "brightness(1.5)" : "none",
                }}
                onMouseEnter={e => { if (!isInf) e.currentTarget.style.transform = "translate(-50%,-50%) scale(1.15)"; }}
                onMouseLeave={e => e.currentTarget.style.transform = "translate(-50%,-50%) scale(1)"}>
                <div style={{
                  width: 52, height: 52, borderRadius: device.type === "iot" ? 12 : 8,
                  background: isInf ? "#f4433620" : isSelected ? "#00bcd420" : "#161b22",
                  border: `2px solid ${isInf ? "#f44336" : isScanning ? "#00bcd4" : "#30363d"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                  boxShadow: isInf ? "0 0 16px #f4433640" : isScanning ? "0 0 16px #00bcd440" : "none",
                  animation: isScanning ? "pulse .5s infinite" : "none", margin: "0 auto",
                }}>
                  {device.icon}
                </div>
                <div style={{ fontSize: 9, color: isInf ? "#f44336" : "#8b949e", marginTop: 3, fontWeight: 600 }}>{device.label}</div>
                <div style={{ fontSize: 8, color: "#484f58" }}>{device.ip}</div>
                {isInf && <div style={{ fontSize: 8, color: "#f44336", fontWeight: 700 }}>🐛 {t("DemoWorm.device.infected")}</div>}
                {device.type === "iot" && !isInf && <div style={{ fontSize: 7, color: "#ff9800" }}>IoT</div>}
              </div>
            );
          })}

          {/* Worm position indicator */}
          <div style={{
            position: "absolute",
            left: `${activeDevices.find(d => d.id === wormPos)?.x || 50}%`,
            top: `${(activeDevices.find(d => d.id === wormPos)?.y || 15) - 8}%`,
            transform: "translate(-50%,-50%)", zIndex: 15, fontSize: 20,
            transition: "all .5s ease", pointerEvents: "none",
          }}>🐛</div>
        </div>

        {/* Right panel: scan log */}
        <div style={{ width: 300, background: "#161b22", borderLeft: "1px solid #30363d", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #21262d", fontSize: 10, color: "#8b949e" }}>{t("DemoWorm.scanLog.label")}</div>
          <div style={{ flex: 1, overflowY: "auto", padding: 10, fontSize: 10, lineHeight: 1.7 }}>
            {log.length === 0 && <div style={{ color: "#484f58", textAlign: "center", padding: 20 }}>{t("DemoWorm.scanLog.empty")}</div>}
            {log.map((l, i) => <div key={i} style={{ color: l.color }}>{l.text}</div>)}
          </div>

          {/* Scan result detail */}
          {scanResult && <div style={{ padding: 12, borderTop: "1px solid #30363d", background: "#0d1117" }}>
            {scanResult.success ? (
              <div>
                <div style={{ fontSize: 11, color: "#f44336", fontWeight: 700, marginBottom: 4 }}>💀 {t("DemoWorm.scanResult.exploited")}: {selectedDevice?.label}</div>
                <div style={{ fontSize: 9, color: "#ff9800" }}>{t("DemoWorm.scanResult.method")}: {scanResult.vuln.method}</div>
                <div style={{ fontSize: 9, color: "#4caf50" }}>{t("DemoWorm.scanResult.result")}: {scanResult.vuln.exploit}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 11, color: "#ff9800", fontWeight: 700, marginBottom: 4 }}>🛡 {selectedDevice?.label} — {t("DemoWorm.scanResult.secure")}</div>
                <div style={{ fontSize: 9, color: "#888" }}>{scanResult.reason}</div>
              </div>
            )}
          </div>}
        </div>
      </div>

      {/* Lesson bar */}
      <div style={{ padding: "8px 14px", background: "#161b22", borderTop: "1px solid #30363d", textAlign: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "#8b949e" }}>
          🐛 <strong style={{ color: "#00bcd4" }}>{t("DemoWorm.lesson.label")}</strong> {t("DemoWorm.lesson.body")} <strong style={{ color: "#ff9800" }}>{t("DemoWorm.lesson.iotLabel")}</strong> {t("DemoWorm.lesson.iotBody")}
        </span>
      </div>

      <HamadCommentary simId="worm" trigger={commentTrigger} accentColor="#00bcd4" />
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:.8} 50%{transform:scale(1.05);opacity:1} }`}</style>
    </div>
  );
}