import { useState } from "react";
import { useTranslations } from "next-intl";

const randomByte = () => Math.floor(Math.random() * 256);
const xorEncrypt = (data, key) => data.map((b, i) => b ^ key[i % key.length]);
const hashCode = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, "0"); };
const fakeSHA256 = (data) => { let s = typeof data === "string" ? data : data.join(","); return Array.from({ length: 8 }, (_, i) => hashCode(s + i)).join(""); };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const PAYLOAD_TEXT = "PAYLOAD: print('Hello from the Cyber Majlis!')";
const PAYLOAD_BYTES = Array.from(PAYLOAD_TEXT).map(c => c.charCodeAt(0));
const JUNK_OPS = ["NOP","MOV EAX, EAX","XCHG EBX, EBX","ADD ECX, 0","SUB EDX, 0","PUSH EAX; POP EAX","SHL ESI, 0","OR EDI, 0","LEA EAX, [EAX+0]","CLC; STC; CLC","JMP $+2"];
const REGISTERS = ["EAX","EBX","ECX","EDX","ESI","EDI"];

function polyMutate(gen) {
  const keyLen = 8 + Math.floor(Math.random() * 24);
  const key = Array.from({ length: keyLen }, randomByte);
  const encrypted = xorEncrypt(PAYLOAD_BYTES, key);
  const decrypted = xorEncrypt(encrypted, key);
  const junkBefore = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => pick(JUNK_OPS));
  const junkAfter = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => pick(JUNK_OPS));
  const regs = [...REGISTERS].sort(() => Math.random() - 0.5).slice(0, 3);
  const stub = [
    `; === DECRYPTION STUB (Gen ${gen}) ===`, ...junkBefore.map(j => `  ${j}`),
    `  LEA ${regs[0]}, [encrypted_payload]`, `  MOV ${regs[1]}, ${PAYLOAD_BYTES.length}`, `  LEA ${regs[2]}, [key]`,
    `  XOR_LOOP:`, `    XOR BYTE [${regs[0]}], [${regs[2]} + idx % ${keyLen}]`, `    INC ${regs[0]}; DEC ${regs[1]}; JNZ XOR_LOOP`,
    ...junkAfter.map(j => `  ${j}`), `  JMP decrypted_payload`,
  ];
  const combined = stub.join("\n") + encrypted.map(b => b.toString(16)).join("");
  return { gen, key, encrypted, decrypted, decryptedText: String.fromCharCode(...decrypted), stub, hash: fakeSHA256(combined), keyHex: key.map(b => b.toString(16).padStart(2, "0")), encHex: encrypted.map(b => b.toString(16).padStart(2, "0")), match: decrypted.every((b, i) => b === PAYLOAD_BYTES[i]) };
}

export default function PolyDemo() {
  const  t  = useTranslations();
  const [gens, setGens] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [log, setLog] = useState([
    { t: "sys", text: "Python 3.11.4 — Polymorphic Engine v2.1" },
    { t: "sys", text: "The Cyber Majlis — Educational Malware Lab" },
    { t: "info", text: `>>> ORIGINAL_PAYLOAD = "${PAYLOAD_TEXT}"` },
    { t: "d" },
  ]);

  const mutate = () => {
    const gen = gens.length + 1;
    const r = polyMutate(gen);
    setGens(p => [...p, r]); setActiveIdx(gens.length);
    setLog(p => [...p,
      { t: "cmd", text: `>>> engine.mutate(gen=${gen})` },
      { t: "ok", text: `[Gen ${gen}] XOR key: ${r.keyHex.slice(0, 8).join(" ")}... (${r.key.length} bytes)` },
      { t: "info", text: `[Gen ${gen}] Encrypted: ${r.encHex.slice(0, 10).join(" ")}...` },
      { t: "info", text: `[Gen ${gen}] Stub: ${r.stub.length} lines, junk injected` },
      { t: "hash", text: `[Gen ${gen}] SHA256: ${r.hash.slice(0, 32)}...` },
      { t: r.match ? "ok" : "err", text: `[Gen ${gen}] Decrypt verify: ${r.match ? "✓ MATCH" : "✗ FAIL"}` },
      { t: "d" },
    ]);
  };

  const cur = gens[activeIdx];
  const prevH = activeIdx > 0 ? gens[activeIdx - 1]?.hash : null;
  const C = { sys: "#6e7681", cmd: "#d2a8ff", ok: "#3fb950", err: "#f85149", info: "#58a6ff", hash: "#d29922" };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0d1117", color: "#c9d1d9", fontFamily: "'Consolas','Courier New',monospace", display: "flex", flexDirection: "column" }}>
      {/* Title bar */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>{["#f85149","#d29922","#3fb950"].map((c,i) => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}</div>
          <span style={{ fontSize: 12, color: "#8b949e" }}>{t("DemoPoly.titleBar.filename")}</span>
        </div>
        <span style={{ fontSize: 10, color: "#3fb950", padding: "2px 8px", borderRadius: 10, border: "1px solid #3fb95030", background: "#3fb95010" }}>● {t("DemoPoly.titleBar.safeBadge")}</span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Terminal */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #30363d" }}>
          <div style={{ padding: "6px 14px", background: "#161b22", borderBottom: "1px solid #21262d", fontSize: 10, color: "#8b949e" }}>{t("DemoPoly.terminal.label")}</div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14, fontSize: 11, lineHeight: 1.8 }}>
            {log.map((l, i) => l.t === "d" ? <div key={i} style={{ borderBottom: "1px solid #21262d", margin: "6px 0" }} /> : <div key={i} style={{ color: C[l.t] || "#c9d1d9" }}>{l.text}</div>)}
          </div>
          <div style={{ padding: "8px 14px", background: "#161b22", borderTop: "1px solid #30363d", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <span style={{ color: "#3fb950" }}>❯</span>
            <button onClick={mutate} style={{ padding: "6px 20px", background: "linear-gradient(135deg, #238636, #2ea043)", border: "1px solid #3fb95040", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t("DemoPoly.terminal.mutateBtn", { gen: gens.length + 1 })}</button>
            <span style={{ color: "#484f58", fontSize: 10 }}>{t("DemoPoly.terminal.mutateHint")}</span>
          </div>
        </div>

        {/* Inspector */}
        <div style={{ width: 360, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "6px 14px", background: "#161b22", borderBottom: "1px solid #21262d", fontSize: 10, color: "#8b949e" }}>{t("DemoPoly.inspector.label")}</div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
            {!cur ? <div style={{ textAlign: "center", padding: 40, color: "#484f58" }}><div style={{ fontSize: 36, marginBottom: 12 }}>🎭</div><div style={{ fontSize: 12 }}>{t("DemoPoly.inspector.empty")}</div></div> : <>
              {/* Gen selector */}
              {gens.length > 1 && <div style={{ display: "flex", gap: 3, marginBottom: 12, flexWrap: "wrap" }}>
                {gens.map((g, i) => <button key={i} onClick={() => setActiveIdx(i)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${i === activeIdx ? "#3fb950" : "#30363d"}`, background: i === activeIdx ? "#3fb95015" : "transparent", color: i === activeIdx ? "#3fb950" : "#8b949e", fontSize: 9, fontWeight: 600, cursor: "pointer" }}>{g.gen}</button>)}
              </div>}

              {/* Key hex */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#3fb950", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>🔑 {t("DemoPoly.inspector.xorKey", { count: cur.key.length })}</div>
                <div style={{ background: "#161b22", borderRadius: 6, padding: 8, display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {cur.keyHex.slice(0, 32).map((b, i) => { const v = parseInt(b, 16); return <span key={i} style={{ fontSize: 9, color: `hsl(${(v/255)*120},80%,65%)`, background: `hsl(${(v/255)*120},40%,12%)`, padding: "1px 3px", borderRadius: 2 }}>{b}</span>; })}
                  {cur.keyHex.length > 32 && <span style={{ color: "#484f58", fontSize: 9 }}>+{cur.keyHex.length - 32}</span>}
                </div>
              </div>

              {/* Encrypted */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#f85149", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>🔒 {t("DemoPoly.inspector.encryptedPayload")}</div>
                <div style={{ background: "#161b22", borderRadius: 6, padding: 8, display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {cur.encHex.slice(0, 32).map((b, i) => <span key={i} style={{ fontSize: 9, color: "#f8514980", padding: "1px 3px" }}>{b}</span>)}
                </div>
              </div>

              {/* Stub */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#d2a8ff", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>📜 {t("DemoPoly.inspector.decryptionStub")}</div>
                <div style={{ background: "#161b22", borderRadius: 6, padding: 8, maxHeight: 140, overflowY: "auto" }}>
                  {cur.stub.map((line, i) => <div key={i} style={{ fontSize: 10, color: (line || "").includes("===") ? "#3fb950" : (line || "").includes("NOP") || (line || "").includes("XCHG") || (line || "").includes("SHL") || (line || "").includes("CLC") ? "#484f58" : "#c9d1d9" }}>{line}</div>)}
                </div>
              </div>

              {/* Hash */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#d29922", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>🔍 {t("DemoPoly.inspector.hash")}</div>
                <div style={{ background: "#161b22", borderRadius: 6, padding: 8, fontSize: 9 }}>
                  <div style={{ color: "#d29922", wordBreak: "break-all", marginBottom: 4 }}>{cur.hash}</div>
                  {prevH && <><div style={{ color: "#484f58", wordBreak: "break-all", marginBottom: 4 }}>{prevH}</div>
                  <div style={{ color: cur.hash !== prevH ? "#3fb950" : "#f85149", fontWeight: 600 }}>{cur.hash !== prevH ? t("DemoPoly.inspector.hashDifferent") : t("DemoPoly.inspector.hashSame")}</div></>}
                </div>
              </div>

              {/* Proof */}
              <div style={{ background: cur.match ? "#3fb95008" : "#f8514908", border: `1px solid ${cur.match ? "#3fb95030" : "#f8514930"}`, borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 9, color: "#3fb950", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>✅ {t("DemoPoly.inspector.decrypted")}</div>
                <div style={{ fontSize: 10, color: "#3fb950", wordBreak: "break-all", marginBottom: 4 }}>{cur.decryptedText}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: cur.match ? "#3fb950" : "#f85149" }}>{cur.match ? t("DemoPoly.inspector.matchesOriginal") : t("DemoPoly.inspector.mismatch")}</div>
              </div>
            </>}
          </div>
          <div style={{ padding: "6px 14px", background: "#161b22", borderTop: "1px solid #30363d", fontSize: 9, color: "#484f58", display: "flex", justifyContent: "space-between" }}>
            <span>{t("DemoPoly.footer.gen", { count: gens.length })}</span><span>{t("DemoPoly.footer.uniqueHashes", { count: new Set(gens.map(g => g.hash)).size })}</span>
          </div>
        </div>
      </div>

      {/* Lesson */}
      <div style={{ padding: "8px 14px", background: "#161b22", borderTop: "1px solid #30363d", textAlign: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "#8b949e" }}>🎭 <strong style={{ color: "#3fb950" }}>{t("DemoPoly.lesson.label")}</strong> {t("DemoPoly.lesson.body")}</span>
      </div>
    </div>
  );
}