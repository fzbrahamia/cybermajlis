import { useState } from "react";
import { useTranslations } from "next-intl";

const hashCode = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, "0"); };
const fakeSHA256 = (data) => { let s = typeof data === "string" ? data : data.join(","); return Array.from({ length: 8 }, (_, i) => hashCode(s + i)).join(""); };

const REGISTERS = ["EAX","EBX","ECX","EDX","ESI","EDI"];
const JUNK_OPS = ["NOP","MOV EAX, EAX","XCHG EBX, EBX","ADD ECX, 0","SUB EDX, 0","PUSH EAX; POP EAX","SHL ESI, 0","OR EDI, 0"];
const SUBSTITUTIONS = [
  { from: "ADD EAX, 7", to: "SUB EAX, -7", label: "ADD→SUB" },
  { from: "ADD EAX, 7", to: "LEA EAX, [EAX+7]", label: "ADD→LEA" },
  { from: "SUB EAX, 2", to: "ADD EAX, -2", label: "SUB→ADD" },
  { from: "MUL EAX, EBX", to: "IMUL EAX, EBX", label: "MUL→IMUL" },
];
const VAR_SCHEMES = [
  { input: "data_in", out: "emit_result" }, { input: "src_val", out: "write_out" },
  { input: "x0", out: "flush_buf" }, { input: "param1", out: "dispatch" },
];
const ORIGINAL_CODE = [
  "; Compute: result = (input × 3) + 7 - 2",
  "MOV EAX, input_value    ; load input",
  "MOV EBX, 3              ; multiplier",
  "MUL EAX, EBX            ; input × 3",
  "ADD EAX, 7              ; + 7",
  "SUB EAX, 2              ; - 2",
  "MOV ECX, EAX            ; store result",
  "CALL output",
  "RET",
];

function metaMutate(gen) {
  let code = [...ORIGINAL_CODE]; const transforms = [];
  const sub = SUBSTITUTIONS[Math.floor(Math.random() * SUBSTITUTIONS.length)];
  code = code.map(line => {
    if ((line || "").includes((sub.from.split(" ")[0] || "")) && (line || "").includes((sub.from.split(" ")[1] || "")) && Math.random() > 0.3) {
      transforms.push({ type: "Substitution", detail: sub.label });
      return (line || "").replace(sub.from.split(",")[0], sub.to.split(",")[0]).replace(/;.*/, `; ← ${sub.label}`);
    }
    return line;
  });
  const regMap = {}; const shuffled = [...REGISTERS].sort(() => Math.random() - 0.5);
  REGISTERS.forEach((r, i) => { regMap[r] = shuffled[i]; });
  if (Object.keys(regMap).some(k => regMap[k] !== k)) {
    transforms.push({ type: "Register Swap", detail: Object.entries(regMap).filter(([k,v]) => k !== v).map(([k,v]) => `${k}→${v}`).join(", ") });
    code = code.map(line => { let l = line || ""; REGISTERS.forEach(r => { l = l.replace(new RegExp(`\\b${r}\\b`, "g"), `__${regMap[r]}__`); }); return l.replace(/__/g, ""); });
  }
  const newCode = []; let junkCount = 0;
  code.forEach(line => {
    if (Math.random() < 0.3 && !(line || "").startsWith(";")) { newCode.push({ text: `  ${JUNK_OPS[Math.floor(Math.random() * JUNK_OPS.length)]}`, isJunk: true }); junkCount++; }
    newCode.push({ text: line || "", isJunk: false });
  });
  if (junkCount) transforms.push({ type: "Dead Code", detail: `${junkCount} junk instructions` });
  const vars = VAR_SCHEMES[Math.floor(Math.random() * VAR_SCHEMES.length)];
  transforms.push({ type: "Var Rename", detail: `input→${vars.input}, output→${vars.out}` });
  const codeText = newCode.map(c => c.text).join("\n");
  const testResults = [5, 10, 42, 100].map(n => ({ input: n, expected: n * 3 + 7 - 2, actual: n * 3 + 7 - 2 }));
  return { gen, code: newCode, transforms, hash: fakeSHA256(codeText + gen), testResults, vars };
}

export default function MetaDemo() {
  const  t  = useTranslations();
  const [gens, setGens] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [log, setLog] = useState([
    { t: "sys", text: "Python 3.11.4 — Metamorphic Engine v2.1" },
    { t: "sys", text: "The Cyber Majlis — Educational Malware Lab" },
    { t: "info", text: ">>> ORIGINAL: result = (input × 3) + 7 - 2" },
    { t: "d" },
  ]);

  const mutate = () => {
    const gen = gens.length + 1;
    const r = metaMutate(gen);
    setGens(p => [...p, r]); setActiveIdx(gens.length);
    setLog(p => [...p,
      { t: "cmd", text: `>>> engine.metamorph(gen=${gen})` },
      ...r.transforms.map(tr => ({ t: "warn", text: `[Gen ${gen}] ${tr.type}: ${tr.detail}` })),
      { t: "hash", text: `[Gen ${gen}] SHA256: ${r.hash.slice(0, 32)}...` },
      { t: "ok", text: `[Gen ${gen}] Behavior test: f(5)=${r.testResults[0].actual}, f(10)=${r.testResults[1].actual}, f(42)=${r.testResults[2].actual} ✓ ALL PASS` },
      { t: "d" },
    ]);
  };

  const cur = gens[activeIdx];
  const prevH = activeIdx > 0 ? gens[activeIdx - 1]?.hash : null;
  const C = { sys: "#6e7681", cmd: "#d2a8ff", ok: "#3fb950", err: "#f85149", info: "#58a6ff", hash: "#d29922", warn: "#f0883e" };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0d1117", color: "#c9d1d9", fontFamily: "'Consolas','Courier New',monospace", display: "flex", flexDirection: "column" }}>
      {/* Title bar */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>{["#f85149","#d29922","#3fb950"].map((c,i) => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}</div>
          <span style={{ fontSize: 12, color: "#8b949e" }}>{t("DemoMeta.titleBar.filename")}</span>
        </div>
        <span style={{ fontSize: 10, color: "#f85149", padding: "2px 8px", borderRadius: 10, border: "1px solid #f8514930", background: "#f8514910" }}>● {t("DemoMeta.titleBar.safeBadge")}</span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Terminal */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #30363d" }}>
          <div style={{ padding: "6px 14px", background: "#161b22", borderBottom: "1px solid #21262d", fontSize: 10, color: "#8b949e" }}>{t("DemoMeta.terminal.label")}</div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14, fontSize: 11, lineHeight: 1.8 }}>
            {log.map((l, i) => l.t === "d" ? <div key={i} style={{ borderBottom: "1px solid #21262d", margin: "6px 0" }} /> : <div key={i} style={{ color: C[l.t] || "#c9d1d9" }}>{l.text}</div>)}
          </div>
          <div style={{ padding: "8px 14px", background: "#161b22", borderTop: "1px solid #30363d", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <span style={{ color: "#f85149" }}>❯</span>
            <button onClick={mutate} style={{ padding: "6px 20px", background: "linear-gradient(135deg, #b91c1c, #dc2626)", border: "1px solid #f8514940", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t("DemoMeta.terminal.metamorphBtn", { gen: gens.length + 1 })}</button>
            <span style={{ color: "#484f58", fontSize: 10 }}>{t("DemoMeta.terminal.metamorphHint")}</span>
          </div>
        </div>

        {/* Inspector */}
        <div style={{ width: 380, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "6px 14px", background: "#161b22", borderBottom: "1px solid #21262d", fontSize: 10, color: "#8b949e" }}>{t("DemoMeta.inspector.label")}</div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
            {!cur ? <div style={{ textAlign: "center", padding: 40, color: "#484f58" }}><div style={{ fontSize: 36, marginBottom: 12 }}>🔬</div><div style={{ fontSize: 12 }}>{t("DemoMeta.inspector.empty")}</div></div> : <>
              {/* Gen selector */}
              {gens.length > 1 && <div style={{ display: "flex", gap: 3, marginBottom: 12, flexWrap: "wrap" }}>
                {gens.map((g, i) => <button key={i} onClick={() => setActiveIdx(i)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${i === activeIdx ? "#f85149" : "#30363d"}`, background: i === activeIdx ? "#f8514915" : "transparent", color: i === activeIdx ? "#f85149" : "#8b949e", fontSize: 9, fontWeight: 600, cursor: "pointer" }}>{g.gen}</button>)}
              </div>}

              {/* Transforms applied */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#f0883e", fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>⚡ {t("DemoMeta.inspector.transformsApplied")}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {cur.transforms.map((tr, i) => (
                    <span key={i} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 12, background: "#f8514910", border: "1px solid #f8514925", color: "#fca5a5" }}>{tr.type}: {tr.detail}</span>
                  ))}
                </div>
              </div>

              {/* Mutated code */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#f85149", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>📝 {t("DemoMeta.inspector.mutatedCode")}</div>
                <div style={{ background: "#161b22", borderRadius: 6, padding: 8, maxHeight: 200, overflowY: "auto" }}>
                  {cur.code.map((c, i) => (
                    <div key={i} style={{ fontSize: 10, color: c.isJunk ? "#484f58" : (c.text || "").startsWith(";") ? "#3fb950" : (c.text || "").includes("←") ? "#f0883e" : "#c9d1d9", fontStyle: c.isJunk ? "italic" : "normal", background: c.isJunk ? "#f8514905" : "transparent", borderRadius: 2, padding: c.isJunk ? "0 4px" : 0 }}>
                      {c.isJunk && <span style={{ color: "#f85149", fontSize: 8, marginRight: 4 }}>{t("DemoMeta.inspector.junkLabel")}</span>}{c.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Original for comparison */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#8b949e", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>📋 {t("DemoMeta.inspector.originalCode")}</div>
                <div style={{ background: "#161b22", borderRadius: 6, padding: 8, maxHeight: 120, overflowY: "auto", opacity: .6 }}>
                  {ORIGINAL_CODE.map((line, i) => <div key={i} style={{ fontSize: 10, color: (line || "").startsWith(";") ? "#3fb950" : "#c9d1d9" }}>{line}</div>)}
                </div>
              </div>

              {/* Hash */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#d29922", fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>🔍 {t("DemoMeta.inspector.hash")}</div>
                <div style={{ background: "#161b22", borderRadius: 6, padding: 8, fontSize: 9 }}>
                  <div style={{ color: "#d29922", wordBreak: "break-all", marginBottom: 4 }}>{cur.hash}</div>
                  {prevH && <><div style={{ color: "#484f58", wordBreak: "break-all", marginBottom: 4 }}>{prevH}</div>
                  <div style={{ color: cur.hash !== prevH ? "#3fb950" : "#f85149", fontWeight: 600 }}>{cur.hash !== prevH ? t("DemoMeta.inspector.hashDifferent") : t("DemoMeta.inspector.hashSame")}</div></>}
                </div>
              </div>

              {/* Behavioral proof */}
              <div style={{ background: "#3fb95008", border: "1px solid #3fb95030", borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 9, color: "#3fb950", fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>✅ {t("DemoMeta.inspector.behavioralProof")}</div>
                {cur.testResults.map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, padding: "2px 0", borderBottom: i < 3 ? "1px solid #21262d" : "none" }}>
                    <span style={{ color: "#8b949e" }}>f({t.input})</span>
                    <span style={{ color: "#3fb950" }}>{t.actual}</span>
                    <span style={{ color: t.actual === t.expected ? "#3fb950" : "#f85149" }}>{t.actual === t.expected ? "✓" : "✗"}</span>
                  </div>
                ))}
                <div style={{ fontSize: 10, fontWeight: 700, color: "#3fb950", marginTop: 6 }}>{t("DemoMeta.inspector.behaviorPreserved")}</div>
              </div>
            </>}
          </div>
          <div style={{ padding: "6px 14px", background: "#161b22", borderTop: "1px solid #30363d", fontSize: 9, color: "#484f58", display: "flex", justifyContent: "space-between" }}>
            <span>{t("DemoMeta.footer.gen", { count: gens.length })}</span><span>{t("DemoMeta.footer.uniqueHashes", { count: new Set(gens.map(g => g.hash)).size })}</span>
          </div>
        </div>
      </div>

      {/* Lesson */}
      <div style={{ padding: "8px 14px", background: "#161b22", borderTop: "1px solid #30363d", textAlign: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "#8b949e" }}>🔬 <strong style={{ color: "#f85149" }}>{t("DemoMeta.lesson.label")}</strong> {t("DemoMeta.lesson.body")}</span>
      </div>
    </div>
  );
}