import { useState } from "react";
import { useTranslations } from "next-intl";

export default function DemoRootkit() {
  const t = useTranslations("DemoRootkit");
  const [phase, setPhase] = useState<"intro" | "taskman" | "lesson">("intro");
  const [showHidden, setShowHidden] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null);

  const NORMAL_PROCESSES = t.raw("normalProcesses") as Array<{
    name: string; cpu: number; ram: number; pid: number; user: string;
  }>;

  const HIDDEN_PROCESSES = t.raw("hiddenProcesses") as Array<{
    name: string; cpu: number; ram: number; pid: number; user: string;
    type: string; icon: string; color: string; desc: string;
  }>;

  const visibleCpu = NORMAL_PROCESSES.reduce((s, p) => s + p.cpu, 0);
  const hiddenCpu = HIDDEN_PROCESSES.reduce((s, p) => s + p.cpu, 0);
  const totalCpu = showHidden ? visibleCpu + hiddenCpu : visibleCpu;
  const totalRam = showHidden
    ? [...NORMAL_PROCESSES, ...HIDDEN_PROCESSES].reduce((s, p) => s + p.ram, 0)
    : NORMAL_PROCESSES.reduce((s, p) => s + p.ram, 0);

  const selProc = selectedProcess !== null ? HIDDEN_PROCESSES[selectedProcess] : null;
  if (phase === "intro") {
    return (
      <div style={{ width: "100%", height: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Consolas', monospace" }}>
        <div style={{ textAlign: "center", maxWidth: 500, padding: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💀</div>
          <h1 style={{ fontSize: 28, color: "#c9d1d9", fontWeight: 400, marginBottom: 8 }}>
            {t("intro.title")} <span style={{ color: "#a855f7" }}>{t("intro.titleAccent")}</span>
          </h1>
          <p style={{ color: "#8b949e", fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
            {t("intro.description")}
          </p>
          <button onClick={() => setPhase("taskman")} style={{ padding: "12px 28px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {t("intro.cta")}
          </button>
          <div style={{ marginTop: 20, fontSize: 10, color: "#3fb950", padding: "4px 12px", display: "inline-block", borderRadius: 10, border: "1px solid #3fb95030", background: "#3fb95010" }}>
            {t("intro.safeBadge")}
          </div>
          <div style={{ marginTop: 10, maxWidth: 380, fontSize: 10, color: "#8b949e", lineHeight: 1.6, textAlign: "center" }}>
            {t("intro.disclaimer")}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "lesson") {
    return (
      <div style={{ width: "100%", height: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Consolas', monospace" }}>
        <div style={{ maxWidth: 520, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👻</div>
          <div style={{ fontSize: 22, color: "#a855f7", fontWeight: 700, marginBottom: 16 }}>{t("lesson.title")}</div>
          <div style={{ background: "#161b22", borderRadius: 12, padding: 16, textAlign: "left", marginBottom: 16, border: "1px solid #30363d" }}>
            {HIDDEN_PROCESSES.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < HIDDEN_PROCESSES.length - 1 ? "1px solid #21262d" : "none" }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.type}</div>
                  <div style={{ fontSize: 9, color: "#8b949e" }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#a855f710", border: "1px solid #a855f730", borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <div style={{ color: "#a855f7", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{t("lesson.warningLabel")}</div>
            <div style={{ color: "#8b949e", fontSize: 11, lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: t.raw("lesson.body") as string }} />
          </div>
          <button onClick={() => { setPhase("intro"); setShowHidden(false); setSelectedProcess(null); }}
            style={{ padding: "10px 24px", background: "#7c3aed", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {t("lesson.tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  // ── TASK MANAGER VIEW ──
  return (
    <div style={{ width: "100%", height: "100vh", background: "#1e1e1e", fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Title bar */}
      <div style={{ background: "#2d2d2d", padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #404040" }}>
        <span style={{ fontSize: 12, color: "#ccc" }}>📊 {t("taskman.title")}</span>
        <div style={{ display: "flex", gap: 4 }}>
          {["_", "□", "×"].map((b, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 2, background: i === 2 ? "#e44" : "#555", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, cursor: "pointer" }}>{b}</div>)}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#2d2d2d", padding: "0 12px", display: "flex", gap: 0, borderBottom: "1px solid #404040" }}>
        {(t.raw("taskman.tabs") as string[]).map((tab, i) => (
          <div key={i} style={{ padding: "8px 16px", fontSize: 11, color: i === 0 ? "#fff" : "#999", borderBottom: i === 0 ? "2px solid #0078d4" : "none", cursor: "pointer" }}>{tab}</div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ background: "#1e1e1e", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setShowHidden(!showHidden); if (showHidden) setSelectedProcess(null); }}
            style={{ padding: "5px 14px", borderRadius: 4, border: `1px solid ${showHidden ? "#a855f7" : "#555"}`, background: showHidden ? "#a855f720" : "#333", color: showHidden ? "#a855f7" : "#ccc", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            {showHidden ? t("taskman.hiddenRevealedBtn") : t("taskman.showHiddenBtn")}
          </button>
          {showHidden && (
            <button onClick={() => setPhase("lesson")} style={{ padding: "5px 14px", borderRadius: 4, border: "1px solid #f8514930", background: "#f8514910", color: "#f85149", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              {t("taskman.analysisBtn")}
            </button>
          )}
        </div>
        <div style={{ fontSize: 10, color: "#999" }}>
          {t("taskman.cpuLabel")}: <span style={{ color: totalCpu > 50 ? "#f85149" : "#22c55e", fontWeight: 700 }}>{totalCpu.toFixed(1)}%</span>
          {" · "}
          {t("taskman.ramLabel")}: <span style={{ color: "#ccc", fontWeight: 600 }}>{Math.round(totalRam)} MB</span>
        </div>
      </div>

      {/* Process table */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#252526", position: "sticky", top: 0 }}>
              {(t.raw("taskman.columns") as string[]).map((col, i) => (
                <th key={i} style={{ padding: "6px 12px", textAlign: i >= 1 && i <= 3 ? "right" : "left", color: "#999", fontWeight: 600, borderBottom: "1px solid #333" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NORMAL_PROCESSES.map((p, i) => (
              <tr key={`n-${i}`} style={{ background: i % 2 === 0 ? "#1e1e1e" : "#252526" }}>
                <td style={{ padding: "5px 12px", color: "#ccc" }}>{p.name}</td>
                <td style={{ padding: "5px 12px", color: "#ccc", textAlign: "right" }}>{p.cpu.toFixed(1)}%</td>
                <td style={{ padding: "5px 12px", color: "#ccc", textAlign: "right" }}>{p.ram} MB</td>
                <td style={{ padding: "5px 12px", color: "#888", textAlign: "right" }}>{p.pid}</td>
                <td style={{ padding: "5px 12px", color: "#888" }}>{p.user}</td>
              </tr>
            ))}
            {showHidden && HIDDEN_PROCESSES.map((p, i) => (
              <tr key={`h-${i}`}
                onClick={() => setSelectedProcess(selectedProcess === i ? null : i)}
                style={{ background: selectedProcess === i ? `${p.color}15` : "#0d1117", cursor: "pointer", borderLeft: `3px solid ${p.color}` }}>
                <td style={{ padding: "5px 12px", color: p.color, fontWeight: 700 }}>
                  {p.icon} {p.name}
                  <span style={{ fontSize: 8, marginLeft: 6, padding: "1px 6px", borderRadius: 4, background: `${p.color}20`, color: p.color }}>{p.type}</span>
                </td>
                <td style={{ padding: "5px 12px", color: p.cpu > 5 ? "#f85149" : p.color, textAlign: "right", fontWeight: p.cpu > 5 ? 700 : 400 }}>{p.cpu.toFixed(1)}%</td>
                <td style={{ padding: "5px 12px", color: p.color, textAlign: "right" }}>{p.ram} MB</td>
                <td style={{ padding: "5px 12px", color: p.color, textAlign: "right" }}>{p.pid}</td>
                <td style={{ padding: "5px 12px", color: "#f85149" }}>{p.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected process detail */}
      {selProc && (
        <div style={{ padding: "10px 16px", background: "#0d1117", borderTop: `2px solid ${selProc.color}`, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>{selProc.icon}</span>
          <div>
            <div style={{ fontSize: 12, color: selProc.color, fontWeight: 700 }}>{selProc.type}: {selProc.name}</div>
            <div style={{ fontSize: 10, color: "#8b949e" }}>{selProc.desc}</div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div style={{ padding: "4px 12px", background: "#007acc", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#fff" }}>
        <span>{t("taskman.processCount", { count: NORMAL_PROCESSES.length + (showHidden ? HIDDEN_PROCESSES.length : 0), hidden: HIDDEN_PROCESSES.length })}{showHidden ? ` (${t("taskman.hiddenCount", { n: HIDDEN_PROCESSES.length })})` : ""}</span>
        <span>{showHidden ? t("taskman.statusRevealed") : t("taskman.statusNormal")}</span>
      </div>
    </div>
  );
}