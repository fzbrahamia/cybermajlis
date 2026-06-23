import { useState } from "react";
import { useTranslations } from "next-intl";

const CSS = `
@keyframes lockScreen { from { opacity:0 } to { opacity:1 } }
@keyframes textGlow { 0%,100% { text-shadow: 0 0 10px rgba(255,165,0,.3) } 50% { text-shadow: 0 0 30px rgba(255,165,0,.6) } }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
`;

const VICTIMS = [
  { fingerprint: "ASUSTeK COMP...", user: "LAPTOP-H46AC...", statusKey: "locked" },
  { fingerprint: "HP-HP Pavilion L...", user: "LAPTOP-LBJDO...", statusKey: "unlocked" },
  { fingerprint: "LENOVO 21AJS", user: "QUAD\\AN14595", statusKey: "locked" },
];

export default function RansomwareDemo() {
  const  t = useTranslations();
  const [victims, setVictims] = useState(VICTIMS.map((v, i) => ({ ...v, id: i, locked: v.statusKey === "locked" })));
  const [selected, setSelected] = useState(2);
  const [viewMode, setViewMode] = useState("attacker"); // attacker | victim | split

  const toggleLock = (action) => {
    setVictims(prev => prev.map((v, i) => i === selected ? { ...v, locked: action === "lock", statusKey: action === "lock" ? "locked" : "unlocked" } : v));
  };

  const refresh = () => {
    setVictims(prev => prev.map(v => ({ ...v })));
  };

  const selectedVictim = victims[selected];

  // ── ATTACKER PANEL ──
  const AttackerPanel = () => (
    <div style={{ height: "100%", background: "#f0f0f0", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>
      {/* Title bar */}
      <div style={{ background: "#e8e8e8", borderBottom: "1px solid #ccc", padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#333" }}>🔒 {t("DemoRansomware.attacker.titleBar")}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "#ddd", border: "1px solid #bbb" }} />
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "#ddd", border: "1px solid #bbb" }} />
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "#e44", border: "1px solid #c33" }} />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Controls sidebar */}
        <div style={{ width: 90, borderRight: "1px solid #ccc", padding: 10, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "#666", fontWeight: 600 }}>{t("DemoRansomware.attacker.controls")}</div>
          <button onClick={() => toggleLock("lock")} style={{ width: 64, height: 64, border: "1px solid #bbb", borderRadius: 4, background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: 28 }}>🔒</span>
            <span style={{ fontSize: 9, color: "#333" }}>{t("DemoRansomware.attacker.activate")}</span>
          </button>
          <button onClick={() => toggleLock("unlock")} style={{ width: 64, height: 64, border: "1px solid #bbb", borderRadius: 4, background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: 28 }}>🔓</span>
            <span style={{ fontSize: 9, color: "#333" }}>{t("DemoRansomware.attacker.deactivate")}</span>
          </button>
          <button onClick={refresh} style={{ width: 64, height: 64, border: "1px solid #bbb", borderRadius: 4, background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: 28 }}>🔄</span>
            <span style={{ fontSize: 9, color: "#333" }}>{t("DemoRansomware.attacker.refresh")}</span>
          </button>
        </div>

        {/* Victim table */}
        <div style={{ flex: 1, padding: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#e0e0e0" }}>
                <th style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #ccc", fontWeight: 600, color: "#555" }}>{t("DemoRansomware.table.fingerprint")}</th>
                <th style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #ccc", fontWeight: 600, color: "#555" }}>{t("DemoRansomware.table.currentUser")}</th>
                <th style={{ padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #ccc", fontWeight: 600, color: "#555" }}>{t("DemoRansomware.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {victims.map((v, i) => (
                <tr key={i} onClick={() => setSelected(i)} style={{
                  cursor: "pointer", background: i === selected ? "#0078d7" : i % 2 === 0 ? "#fff" : "#f8f8f8",
                  color: i === selected ? "#fff" : "#333",
                }}>
                  <td style={{ padding: "5px 8px", borderBottom: "1px solid #eee" }}>{i === selected ? "▶ " : ""}{v.fingerprint}</td>
                  <td style={{ padding: "5px 8px", borderBottom: "1px solid #eee" }}>{v.user}</td>
                  <td style={{ padding: "5px 8px", borderBottom: "1px solid #eee", color: i === selected ? "#fff" : v.locked ? "#c00" : "#080", fontWeight: 600 }}>{t(`DemoRansomware.table.${v.statusKey}`)}</td>
                </tr>
              ))}
              <tr><td style={{ padding: "5px 8px", color: "#999" }}>*</td><td></td><td></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── VICTIM SCREEN ──
  const VictimScreen = () => (
    <div style={{ height: "100%", position: "relative" }}>
      {selectedVictim?.locked ? (
        // LOCKED — ransom message
        <div style={{ height: "100%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", animation: "lockScreen .5s ease" }}>
          <div style={{ padding: 40, textAlign: "center", maxWidth: 500 }}>
            <div style={{ color: "#ff8c00", fontSize: 24, fontWeight: 700, lineHeight: 1.6, fontFamily: "'Consolas', 'Courier New', monospace", animation: "textGlow 3s ease-in-out infinite" }}>
              {t("DemoRansomware.victim.lockedMessage")}<br /><br />
              {t("DemoRansomware.victim.fineMessage")}
            </div>
            <div style={{ marginTop: 30, animation: "blink 2s infinite" }}>
              <span style={{ color: "#666", fontSize: 12, fontFamily: "'Consolas', monospace" }}>{t("DemoRansomware.victim.lockedBy")}</span>
            </div>
          </div>
        </div>
      ) : (
        // UNLOCKED — normal desktop
        <div style={{ height: "100%", background: "linear-gradient(135deg, #2b5797, #1e3a5f)", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, padding: 20 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ textAlign: "center", cursor: "default" }}>
                <div style={{ fontSize: 32 }}>🗑</div>
                <div style={{ fontSize: 10, color: "#fff", textShadow: "1px 1px 3px rgba(0,0,0,.5)" }}>{t("DemoRansomware.desktop.recycleBin")}</div>
              </div>
              <div style={{ textAlign: "center", cursor: "default" }}>
                <div style={{ fontSize: 32 }}>📁</div>
                <div style={{ fontSize: 10, color: "#fff", textShadow: "1px 1px 3px rgba(0,0,0,.5)" }}>{t("DemoRansomware.desktop.documents")}</div>
              </div>
              <div style={{ textAlign: "center", cursor: "default" }}>
                <div style={{ fontSize: 32 }}>🌐</div>
                <div style={{ fontSize: 10, color: "#fff", textShadow: "1px 1px 3px rgba(0,0,0,.5)" }}>{t("DemoRansomware.desktop.browser")}</div>
              </div>
            </div>
          </div>
          {/* Taskbar */}
          <div style={{ height: 32, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", padding: "0 8px" }}>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🪟</div>
            <div style={{ marginLeft: "auto", color: "#fff", fontSize: 10 }}>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100vh", background: "#222", fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>

      {/* Top toolbar */}
      <div style={{ background: "#1a1a1a", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #444" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>🔐</span>
          <span style={{ color: "#ff8c00", fontSize: 16, fontWeight: 700 }}>{t("DemoRansomware.toolbar.title")}</span>
          <span style={{ color: "#666", fontSize: 11 }}>— {t("DemoRansomware.toolbar.subtitle")}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "split", label: t("DemoRansomware.toolbar.splitView") },
            { id: "attacker", label: t("DemoRansomware.toolbar.attackerOnly") },
            { id: "victim", label: t("DemoRansomware.toolbar.victimOnly") },
          ].map(m => (
            <button key={m.id} onClick={() => setViewMode(m.id)} style={{
              padding: "5px 14px", borderRadius: 6, border: "1px solid #555",
              background: viewMode === m.id ? "#ff8c00" : "transparent",
              color: viewMode === m.id ? "#000" : "#aaa",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {(viewMode === "attacker" || viewMode === "split") && (
          <div style={{ flex: 1, borderRight: viewMode === "split" ? "3px solid #ff8c00" : "none" }}>
            <div style={{ background: "#333", padding: "4px 10px", borderBottom: "1px solid #555" }}>
              <span style={{ color: "#ff8c00", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>{t("DemoRansomware.panels.attacker")}</span>
            </div>
            <div style={{ height: "calc(100% - 28px)" }}><AttackerPanel /></div>
          </div>
        )}
        {(viewMode === "victim" || viewMode === "split") && (
          <div style={{ flex: 1 }}>
            <div style={{ background: "#333", padding: "4px 10px", borderBottom: "1px solid #555" }}>
              <span style={{ color: "#4a9edd", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>{t("DemoRansomware.panels.victim")} — {selectedVictim?.fingerprint}</span>
            </div>
            <div style={{ height: "calc(100% - 28px)" }}><VictimScreen /></div>
          </div>
        )}
      </div>

      {/* Lesson bar */}
      <div style={{ background: "#111", padding: "10px 16px", borderTop: "1px solid #333", textAlign: "center" }}>
        <span style={{ color: "#888", fontSize: 11, lineHeight: 1.6 }}>
          🔒 <strong style={{ color: "#ff8c00" }}>{t("DemoRansomware.lesson.label")}</strong> {t("DemoRansomware.lesson.body")} <strong style={{ color: "#4a9edd" }}>{t("DemoRansomware.lesson.defenseLabel")}</strong> {t("DemoRansomware.lesson.defenseBody")}
        </span>
      </div>
    </div>
  );
}
