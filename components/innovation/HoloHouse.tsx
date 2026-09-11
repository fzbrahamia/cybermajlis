"use client";

/* THE HOUSE, AS A PROJECTION
 *
 * The first version was flat SVG and looked like clip art, which is fair: a
 * drawing of a house is a picture, and this needs to read as an instrument.
 * So it is a real wireframe now, built from 3D points, rotated and projected
 * every frame onto a canvas. Nothing here is a static image.
 *
 * Gold on near black rather than the cyan every hologram defaults to. Gold is
 * already the Majlis line, it reads as an instrument rather than a film prop,
 * and it means this thing belongs to the house it sits in.
 *
 * The teaching is unchanged from the flat version, because that part was right:
 *   a DEFENCE adds geometry.
 *   a THREAT adds nothing and instead lights up whatever is still open.
 * Learning about malware does not make you safer. It makes you able to see.
 *
 * Dark is allowed here. This is an instrument, the way the SOC and the quantum
 * labs are, and it is the only dark surface in the whole of Majlis. */

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "next-intl";

type V = [number, number, number];
type Edge = { a: V; b: V; layer: string; dash?: boolean };

const GOLD    = [209, 173, 96] as const;
const AMBER   = [245, 217, 139] as const;
const ALARM   = [201, 82, 95] as const;
const FLOOR   = [122, 98, 71] as const;

/** Which concept switches on which piece of the projection. */
export const LAYERS: { id: string; kind: "defence" | "threat"; en: string; ar: string }[] = [
  { id: "internet",              kind: "defence", en: "The road in",        ar: "الطريق الداخل" },
  { id: "firewall",              kind: "defence", en: "Wall and gate",      ar: "السور والبوابة" },
  { id: "zero-day",              kind: "defence", en: "Walls patched",      ar: "جدران مُرقّعة" },
  { id: "endpoints",             kind: "defence", en: "Your own door",      ar: "بابك أنت" },
  { id: "encryption",            kind: "defence", en: "The locked vault",   ar: "الخزنة المقفلة" },
  { id: "normal-traffic",        kind: "defence", en: "Who normally comes", ar: "من يأتي عادة" },
  { id: "behavioural-detection", kind: "defence", en: "The sweep",          ar: "المسح" },
  { id: "malware",               kind: "threat",  en: "What walks in",      ar: "ما الذي يدخل" },
  { id: "malware-spread",        kind: "threat",  en: "House to house",     ar: "من بيت لبيت" },
];

/* ── geometry ─────────────────────────────────────────────── */

const box = (x: number, y: number, z: number, w: number, h: number, d: number, layer: string): Edge[] => {
  const p: V[] = [
    [x - w, y,     z - d], [x + w, y,     z - d], [x + w, y,     z + d], [x - w, y,     z + d],
    [x - w, y + h, z - d], [x + w, y + h, z - d], [x + w, y + h, z + d], [x - w, y + h, z + d],
  ];
  const idx = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  return idx.map(([i, j]) => ({ a: p[i], b: p[j], layer }));
};

const HOUSE: Edge[] = (() => {
  const e: Edge[] = box(0, 0, 0, 1, 1.25, 0.85, "shell");
  // the pitched roof, which is what stops it reading as a filing cabinet
  const apex: [V, V] = [[0, 2.05, -0.85], [0, 2.05, 0.85]];
  const eaves: V[] = [[-1, 1.25, -0.85], [1, 1.25, -0.85], [1, 1.25, 0.85], [-1, 1.25, 0.85]];
  e.push({ a: apex[0], b: apex[1], layer: "shell" });
  e.push({ a: eaves[0], b: apex[0], layer: "shell" }, { a: eaves[1], b: apex[0], layer: "shell" });
  e.push({ a: eaves[3], b: apex[1], layer: "shell" }, { a: eaves[2], b: apex[1], layer: "shell" });
  return e;
})();

const WALL: Edge[] = (() => {
  const e: Edge[] = [];
  const r = 2.5, h = 0.62;
  const ring: V[] = [];
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * Math.PI * 2;
    ring.push([Math.cos(t) * r, 0, Math.sin(t) * r]);
  }
  ring.forEach((p, i) => {
    const q = ring[(i + 1) % ring.length];
    // the gateway is a gap in the ring, not a decoration on it
    const gate = i === 5 || i === 6;
    if (!gate) {
      e.push({ a: [p[0], 0, p[2]], b: [q[0], 0, q[2]], layer: "wall" });
      e.push({ a: [p[0], h, p[2]], b: [q[0], h, q[2]], layer: "wall" });
      e.push({ a: [p[0], 0, p[2]], b: [p[0], h, p[2]], layer: "wall" });
    }
  });
  // gate posts, taller than the wall so the way in is obvious
  for (const i of [5, 7]) {
    const p = ring[i];
    e.push({ a: [p[0], 0, p[2]], b: [p[0], 1.05, p[2]], layer: "wall" });
  }
  return e;
})();

const DOOR: Edge[] = box(0, 0, 0.85, 0.26, 0.66, 0.02, "door");
const VAULT: Edge[] = box(0.34, 0.05, -0.1, 0.24, 0.34, 0.24, "vault");
const ROAD: Edge[] = [
  { a: [-0.55, 0, 2.5], b: [-0.55, 0, 6.2], layer: "road" },
  { a: [ 0.55, 0, 2.5], b: [ 0.55, 0, 6.2], layer: "road" },
];
const PATHS: Edge[] = [
  { a: [0, 0.02, 0.9], b: [0, 0.02, 2.45], layer: "paths", dash: true },
  { a: [-0.5, 0.02, 1.4], b: [0, 0.02, 2.2], layer: "paths", dash: true },
  { a: [0.5, 0.02, 1.4], b: [0, 0.02, 2.2], layer: "paths", dash: true },
];
const NEIGHBOURS: Edge[] = [
  ...box(-3.9, 0, -1.2, 0.5, 0.62, 0.44, "spread"),
  ...box( 3.9, 0, -1.2, 0.5, 0.62, 0.44, "spread"),
  { a: [-1, 0.9, -0.4], b: [-3.4, 0.5, -1.2], layer: "spread", dash: true },
  { a: [ 1, 0.9, -0.4], b: [ 3.4, 0.5, -1.2], layer: "spread", dash: true },
];

/** Where the gaps are when the walls have not been patched. */
const HOLES: V[] = [[-1, 0.62, 0.3], [1, 0.85, -0.35], [-0.3, 0.42, -0.85]];

export default function HoloHouse({ done }: { done: Record<string, unknown> }) {
  const isAR = useLocale() === "ar";
  const cv = useRef<HTMLCanvasElement | null>(null);
  const has = useMemo(() => (id: string) => Boolean(done[id]), [done]);

  const defences = LAYERS.filter(l => l.kind === "defence");
  const built = defences.filter(l => has(l.id)).length;
  const openHole = !has("zero-day");
  const openDoor = !has("endpoints");
  const sees = has("malware") || has("malware-spread");

  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    let raf = 0, stop = false, t = 0;

    const on: Record<string, boolean> = {
      shell: true,
      wall:   has("firewall"),
      door:   has("endpoints"),
      vault:  has("encryption"),
      road:   has("internet"),
      paths:  has("normal-traffic"),
      spread: has("malware-spread"),
    };

    const draw = () => {
      const w = c.width  = c.clientWidth  * 2;
      const h = c.height = c.clientHeight * 2;
      const cx = w / 2, cy = h * 0.62;
      const zoom = Math.min(w, h) * 0.148;
      const spin = still ? 0.62 : t * 0.00022;

      // project one point, and report depth so far things dim
      const P = (v: V): [number, number, number] => {
        const s = Math.sin(spin), co = Math.cos(spin);
        const x = v[0] * co - v[2] * s;
        const z = v[0] * s + v[2] * co;
        const y = v[1];
        const tilt = 0.44;
        const yy = y * Math.cos(tilt) - z * Math.sin(tilt) * 0.42;
        const zz = z * Math.cos(tilt) + 6.2;
        const f = 5.4 / zz;
        return [cx + x * f * zoom, cy - yy * f * zoom, zz];
      };

      ctx.fillStyle = "#0C0A09";
      ctx.fillRect(0, 0, w, h);

      // the pad it stands on
      ctx.lineWidth = 1.4;
      for (let i = -6; i <= 6; i++) {
        for (const [a, b] of [
          [[i, 0, -6] as V, [i, 0, 6] as V],
          [[-6, 0, i] as V, [6, 0, i] as V],
        ]) {
          const p = P(a), q = P(b);
          const fade = 1 - Math.min(1, Math.abs(i) / 7);
          ctx.strokeStyle = `rgba(${FLOOR[0]},${FLOOR[1]},${FLOOR[2]},${0.05 + fade * 0.13})`;
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        }
      }

      const stroke = (edges: Edge[], rgb: readonly number[], alpha: number, width: number) => {
        ctx.save();
        ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.85)`;
        ctx.shadowBlur = 14;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        for (const e of edges) {
          const p = P(e.a), q = P(e.b);
          const depth = Math.max(0.34, Math.min(1, 8.6 / ((p[2] + q[2]) / 2) - 0.32));
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * depth})`;
          ctx.setLineDash(e.dash ? [7, 9] : []);
          ctx.lineDashOffset = e.dash ? -t * 0.05 : 0;
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        }
        ctx.restore();
      };

      const flick = 0.9 + Math.sin(t * 0.006) * 0.06;

      if (on.road)   stroke(ROAD,       GOLD,  0.42 * flick, 2);
      if (on.wall)   stroke(WALL,       GOLD,  0.62 * flick, 2);
      if (on.paths)  stroke(PATHS,      AMBER, 0.5  * flick, 2);
      if (on.spread) stroke(NEIGHBOURS, ALARM, 0.5  * flick, 2);

      stroke(HOUSE, openHole ? GOLD : AMBER, (openHole ? 0.66 : 0.92) * flick, 2.6);

      if (on.vault) stroke(VAULT, AMBER, 0.8 * flick, 2);
      if (on.door)  stroke(DOOR,  AMBER, 0.9 * flick, 2.6);

      // an unpatched wall is drawn as what it is: a hole with an edge round it
      if (openHole) {
        ctx.save();
        for (let i = 0; i < HOLES.length; i++) {
          const p = P(HOLES[i]);
          const pulse = 0.5 + Math.sin(t * 0.004 + i * 1.7) * 0.28;
          const r = (10 + i * 2) * (p[2] < 8 ? 1 : 0.8);
          ctx.shadowColor = `rgba(${ALARM[0]},${ALARM[1]},${ALARM[2]},.9)`;
          ctx.shadowBlur = 18;
          ctx.strokeStyle = `rgba(${ALARM[0]},${ALARM[1]},${ALARM[2]},${0.4 + pulse * 0.45})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      }

      // the doorway, standing open until there is a door in it
      if (openDoor) {
        ctx.save();
        const p = P([0, 0.33, 0.86]);
        ctx.shadowColor = `rgba(${ALARM[0]},${ALARM[1]},${ALARM[2]},.9)`;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = `rgba(${ALARM[0]},${ALARM[1]},${ALARM[2]},.6)`;
        ctx.lineWidth = 2;
        ctx.strokeRect(p[0] - 13, p[1] - 24, 26, 48);
        ctx.restore();
      }

      // the sweep: it knows what is odd because it knows what is ordinary
      if (has("behavioural-detection")) {
        const a = still ? 0.8 : t * 0.0011;
        const r = 2.5;
        ctx.save();
        ctx.shadowColor = `rgba(${AMBER[0]},${AMBER[1]},${AMBER[2]},.8)`;
        ctx.shadowBlur = 16;
        for (let k = 0; k < 16; k++) {
          const th = a - k * 0.05;
          const p = P([0, 1.5, 0]), q = P([Math.cos(th) * r, 0.06, Math.sin(th) * r]);
          ctx.strokeStyle = `rgba(${AMBER[0]},${AMBER[1]},${AMBER[2]},${0.34 * (1 - k / 16)})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        }
        ctx.restore();
      }

      // and what comes through, once they can see it
      if (sees && (openHole || openDoor)) {
        const march = still ? 0.45 : (t * 0.00035) % 1;
        const from: V = [0, 0.2, 5.4];
        const to: V   = openDoor ? [0, 0.2, 0.9] : HOLES[0];
        const at: V = [
          from[0] + (to[0] - from[0]) * march,
          from[1] + (to[1] - from[1]) * march,
          from[2] + (to[2] - from[2]) * march,
        ];
        const p = P(at);
        ctx.save();
        ctx.shadowColor = `rgba(${ALARM[0]},${ALARM[1]},${ALARM[2]},1)`;
        ctx.shadowBlur = 24;
        ctx.fillStyle = `rgba(${ALARM[0]},${ALARM[1]},${ALARM[2]},.95)`;
        ctx.beginPath(); ctx.arc(p[0], p[1], 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // scan lines and a slow sweep, so it reads as projected rather than drawn
      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      ctx.fillStyle = "rgba(0,0,0,.30)";
      for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1.4);
      ctx.restore();

      if (!still) {
        const band = ((t * 0.05) % (h + 260)) - 130;
        const g = ctx.createLinearGradient(0, band - 130, 0, band + 130);
        g.addColorStop(0,   "rgba(209,173,96,0)");
        g.addColorStop(0.5, "rgba(209,173,96,.045)");
        g.addColorStop(1,   "rgba(209,173,96,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, band - 130, w, 260);
      }

      t += 16;
      if (!stop) raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { stop = true; cancelAnimationFrame(raf); };
  }, [done, has, openHole, openDoor, sees]);

  const missing = defences.filter(l => !has(l.id));

  return (
    <figure style={{ margin: 0 }}>
      <div style={{
        position: "relative", borderRadius: 24, overflow: "hidden",
        background: "#0C0A09", border: "1px solid rgba(209,173,96,.26)",
        boxShadow: "0 24px 60px rgba(12,10,9,.34)",
      }}>
        <canvas ref={cv} style={{ display: "block", width: "100%", height: "clamp(260px, 42vw, 420px)" }}
          role="img"
          aria-label={isAR
            ? `مجسّم بيتك، ${built} من ${defences.length} أنظمة تعمل`
            : `A projection of your house, ${built} of ${defences.length} systems running`} />

        {/* the readout, which is the only text allowed on the instrument */}
        <div style={{
          position: "absolute", insetInlineStart: 18, top: 16,
          display: "flex", flexDirection: "column", gap: 7, pointerEvents: "none",
        }}>
          <span style={{
            fontFamily: '"Geist Mono", ui-monospace, Menlo, monospace',
            fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(209,173,96,.72)",
          }}>
            {isAR ? "بيتك" : "Your house"}
          </span>
          <span style={{
            fontFamily: '"Geist Mono", ui-monospace, Menlo, monospace',
            fontSize: 22, color: "#F5D98B", fontVariantNumeric: "tabular-nums",
          }}>
            {built}<span style={{ opacity: .45 }}> / {defences.length}</span>
          </span>
        </div>

        {/* every system, lit or dark, down the side */}
        <div style={{
          position: "absolute", insetInlineEnd: 16, top: 16, bottom: 16,
          display: "flex", flexDirection: "column", justifyContent: "center",
          gap: 6, pointerEvents: "none",
        }}>
          {LAYERS.map(l => {
            const lit = has(l.id);
            const threat = l.kind === "threat";
            return (
              <span key={l.id} style={{
                display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end",
                fontFamily: '"Geist Mono", ui-monospace, Menlo, monospace',
                fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase",
                color: lit
                  ? (threat ? "rgba(201,82,95,.9)" : "rgba(245,217,139,.92)")
                  : "rgba(209,173,96,.24)",
              }}>
                {isAR ? l.ar : l.en}
                <span aria-hidden style={{
                  width: 6, height: 6, borderRadius: "50%", flex: "none",
                  background: lit ? (threat ? "#C9525F" : "#F5D98B") : "rgba(209,173,96,.2)",
                  boxShadow: lit ? `0 0 9px ${threat ? "#C9525F" : "#F5D98B"}` : "none",
                }} />
              </span>
            );
          })}
        </div>
      </div>

      <figcaption style={{
        marginTop: 14, display: "flex", flexWrap: "wrap",
        alignItems: "baseline", gap: "6px 12px",
      }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: "#2A231C" }}>
          {built === 0
            ? (isAR ? "لا شيء يعمل بعد." : "Nothing is running yet.")
            : built === defences.length
              ? (isAR ? "كل الأنظمة تعمل." : "Every system is running.")
              : (isAR ? `${built} من ${defences.length} تعمل.` : `${built} of ${defences.length} running.`)}
        </span>
        {missing.length > 0 && (
          <span style={{ fontSize: 15, color: "#6E6357", lineHeight: 1.55 }}>
            {isAR ? "ما زال مطفأً: " : "Still dark: "}
            <b style={{ color: "#8F6A38" }}>
              {missing.slice(0, 3).map(l => (isAR ? l.ar : l.en)).join(isAR ? "، " : ", ")}
            </b>
            {missing.length > 3 && (isAR ? ` و${missing.length - 3} غيرها` : ` and ${missing.length - 3} more`)}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
