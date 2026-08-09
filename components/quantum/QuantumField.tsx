"use client";

/* An ambient motif for quantum headers: particles that drift and breathe, and
   a slow probability wave beneath them. Decorative, aria-hidden, and it stops
   completely under prefers-reduced-motion. */

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Q } from "./theme";

const r2px = (n: number) => Math.round(n * 100) / 100;

export default function QuantumField({ height = 220 }: { height?: number }) {
  const reduce = useReducedMotion();

  // Fixed pseudo-random layout so the server and client agree on positions.
  const dots = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const a = (i * 137.508 * Math.PI) / 180; // golden angle, spreads evenly
        // Rounded on purpose. A raw float like 20.026231728753014 is written
        // to the HTML at full precision but read back rounded, which React
        // reports as a hydration mismatch on every particle.
        const r2 = (n: number) => Math.round(n * 100) / 100;
        return {
          x: r2(4 + ((Math.abs(Math.sin(a)) * 92) % 92)),
          y: r2(6 + ((Math.abs(Math.cos(a * 1.7)) * 84) % 84)),
          r: r2(1.4 + ((i * 7) % 5) * 0.5),
          d: r2(3.6 + ((i * 11) % 40) / 10),
          delay: r2(((i * 13) % 30) / 10),
        };
      }),
    [],
  );

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, height, overflow: "hidden", pointerEvents: "none" }}>
      {/* probability wave */}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: "absolute", insetInline: 0, bottom: 0, width: "100%", height: "62%", opacity: 0.5 }}>
        <defs>
          <linearGradient id="qf-fade" x1="0" x2="1">
            <stop offset="0%" stopColor={Q.mid} stopOpacity="0" />
            <stop offset="50%" stopColor={Q.mid} stopOpacity=".55" />
            <stop offset="100%" stopColor={Q.mid} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map(k => (
          <motion.path
            key={k}
            d={`M0 ${26 + k * 3} Q 12 ${14 + k * 4}, 25 ${24 + k * 2} T 50 ${24 + k * 2} T 75 ${24 + k * 2} T 100 ${24 + k * 2}`}
            fill="none"
            stroke="url(#qf-fade)"
            strokeWidth={0.55}
            animate={reduce ? undefined : { d: [
              `M0 ${26 + k * 3} Q 12 ${14 + k * 4}, 25 ${24 + k * 2} T 50 ${24 + k * 2} T 75 ${24 + k * 2} T 100 ${24 + k * 2}`,
              `M0 ${24 + k * 3} Q 12 ${30 + k * 2}, 25 ${20 + k * 2} T 50 ${28 + k * 2} T 75 ${20 + k * 2} T 100 ${26 + k * 2}`,
              `M0 ${26 + k * 3} Q 12 ${14 + k * 4}, 25 ${24 + k * 2} T 50 ${24 + k * 2} T 75 ${24 + k * 2} T 100 ${24 + k * 2}`,
            ] }}
            transition={{ duration: 9 + k * 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* particles, each one still undecided */}
      {dots.map((d, i) => (
        <motion.span
          key={i}
          animate={reduce ? undefined : { y: [0, -13, 0], opacity: [0.25, 0.8, 0.25], scale: [1, 1.35, 1] }}
          transition={{ duration: d.d + 4, repeat: Infinity, ease: "easeInOut", delay: d.delay }}
          style={{
            position: "absolute", left: `${d.x}%`, top: `${d.y}%`,
            width: `${r2px(d.r * 2)}px`, height: `${r2px(d.r * 2)}px`, borderRadius: "50%",
            background: Q.soft, boxShadow: `0 0 ${r2px(d.r * 5)}px ${Q.mid}`,
            opacity: 0.35,
          }}
        />
      ))}
    </div>
  );
}
