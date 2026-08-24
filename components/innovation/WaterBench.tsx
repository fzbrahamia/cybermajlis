"use client";

/* THE BENCH
 *
 * One tank, one membrane, one pressure dial. It computes the real relationship
 * rather than illustrating it: osmotic pressure by van 't Hoff, and water
 * crossing only when the applied pressure beats it.
 *
 * The point is the threshold. Below it nothing happens, or water runs the wrong
 * way, and no amount of wanting changes that. A child who has pushed the dial
 * up and felt where it gives has learned something a diagram cannot hand over.
 */

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { M, sans, mono, HUES, R, card, label } from "./theme";

const H = HUES.blue;

/* van 't Hoff, simplified for seawater at room temperature. Sodium chloride
   splits in two, so roughly 0.77 bar per gram of salt per litre. Ordinary
   seawater at 35 g/L lands near 27 bar, which is the number that matters. */
const osmotic = (gPerL: number) => 0.77 * gPerL;

export default function WaterBench() {
  const isAR = useLocale() === "ar";
  const [salt, setSalt] = useState(35);
  const [push, setPush] = useState(0);
  const [touched, setTouched] = useState(false);
  const cv = useRef<HTMLCanvasElement | null>(null);

  const pi = osmotic(salt);
  const net = push - pi;
  // Which way water is actually moving, and how fast.
  const dir = net > 0.5 ? 1 : net < -0.5 ? -1 : 0;
  const rate = Math.min(1, Math.abs(net) / 40);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dots = Array.from({ length: 46 }, () => ({
      x: Math.random(), y: Math.random(), salty: false, r: 0,
    }));
    dots.forEach((d, i) => {
      d.salty = i % 3 === 0;
      d.x = d.salty ? 0.55 + Math.random() * 0.42 : Math.random();
      d.r = d.salty ? 4.2 : 2.6;
    });

    let raf = 0;
    let stop = false;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const draw = () => {
      const w = c.width = c.clientWidth * 2;
      const h = c.height = c.clientHeight * 2;
      ctx.clearRect(0, 0, w, h);

      const wallX = w * 0.5;

      // the two bodies of water
      ctx.fillStyle = "rgba(61,111,181,.07)";
      ctx.fillRect(0, 0, wallX, h);
      ctx.fillStyle = "rgba(61,111,181,.14)";
      ctx.fillRect(wallX, 0, w - wallX, h);

      // the wall, with holes
      ctx.fillStyle = "rgba(42,35,28,.16)";
      ctx.fillRect(wallX - 5, 0, 10, h);
      ctx.fillStyle = "rgba(252,246,234,1)";
      for (let y = h * 0.06; y < h; y += h * 0.1) ctx.fillRect(wallX - 5, y, 10, h * 0.028);

      for (const d of dots) {
        if (!still && dir !== 0 && !d.salty) {
          d.x += dir * rate * 0.0055;
          if (d.x > 1.02) d.x = -0.02;
          if (d.x < -0.02) d.x = 1.02;
        }
        // salt drifts but can never cross: it is the wrong shape, not unwilling
        if (!still && d.salty) {
          d.y += Math.sin(d.x * 9 + d.y * 5) * 0.0011;
          if (d.y > 1) d.y = 0; if (d.y < 0) d.y = 1;
          if (d.x < 0.54) d.x = 0.56;
        }
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.r * 2, 0, Math.PI * 2);
        ctx.fillStyle = d.salty ? "rgba(122,30,34,.6)" : "rgba(43,78,134,.55)";
        ctx.fill();
      }

      if (!stop) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { stop = true; cancelAnimationFrame(raf); };
  }, [dir, rate]);

  const Slider = ({ v, set, min, max, step, name, unit }: {
    v: number; set: (n: number) => void; min: number; max: number;
    step: number; name: string; unit: string;
  }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: M.heading }}>{name}</span>
        <span style={{ fontFamily: mono, fontSize: 13, color: H.deep, fontVariantNumeric: "tabular-nums" }}>
          {v}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v}
        onChange={e => { set(+e.target.value); setTouched(true); }}
        style={{ width: "100%", accentColor: H.mid, cursor: "pointer" }} />
    </div>
  );

  const verdict = dir === 1
    ? (isAR ? "الماء يعبر، تاركاً الملح خلفه." : "Water is crossing, leaving the salt behind.")
    : dir === -1
      ? (isAR ? "الماء يذهب في الاتجاه الخطأ، نحو الملح." : "Water is going the wrong way, toward the salt.")
      : (isAR ? "لا شيء يعبر. أنت عند العتبة تماماً." : "Nothing is crossing. You are sitting right on the threshold.");

  return (
    <div style={{ ...card, padding: "22px 24px" }}>
      <div style={{ ...label, marginBottom: 4, color: H.deep }}>{isAR ? "المنضدة" : "The bench"}</div>
      <p style={{ margin: "0 0 16px", fontSize: 14.5, lineHeight: 1.6, color: M.body, maxWidth: "44ch" }}>
        {isAR
          ? "ادفع بقوة كافية وسيعبر الماء. أقل من ذلك، ولن يعبر. جرّب أن تجد النقطة."
          : "Push hard enough and water crosses. Less than that, and it will not. Try to find the point."}
      </p>

      <canvas ref={cv} style={{
        width: "100%", height: 150, display: "block", borderRadius: 14,
        background: M.page, border: "1px solid rgba(42,35,28,.08)",
      }} />

      <div style={{ display: "grid", gap: 16, marginTop: 18, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,13rem),1fr))" }}>
        <Slider v={salt} set={setSalt} min={5} max={70} step={1}
          name={isAR ? "ملح في الماء" : "Salt in the water"} unit={isAR ? " غ/ل" : " g/L"} />
        <Slider v={push} set={setPush} min={0} max={90} step={1}
          name={isAR ? "كم تدفع" : "How hard you push"} unit={isAR ? " بار" : " bar"} />
      </div>

      <div style={{
        marginTop: 16, padding: "14px 16px", borderRadius: 14,
        background: dir === 1 ? "rgba(46,156,110,.09)" : dir === -1 ? "rgba(168,50,63,.07)" : "rgba(42,35,28,.04)",
        border: `1px solid ${dir === 1 ? "rgba(46,156,110,.24)" : dir === -1 ? "rgba(168,50,63,.18)" : "rgba(42,35,28,.1)"}`,
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px", marginBottom: 8 }}>
          <span style={{ fontFamily: mono, fontSize: 12, color: M.body }}>
            {isAR ? "الملح يشدّ بـ " : "The salt pulls with "}
            <b style={{ color: M.heading }}>{pi.toFixed(0)}</b>{isAR ? " بار" : " bar"}
          </span>
          <span style={{ fontFamily: mono, fontSize: 12, color: M.body }}>
            {isAR ? "أنت تدفع بـ " : "You are pushing with "}
            <b style={{ color: M.heading }}>{push}</b>{isAR ? " بار" : " bar"}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: M.heading, fontWeight: 600 }}>{verdict}</p>
      </div>

      {touched && salt > 45 && (
        <p style={{ margin: "14px 0 0", fontSize: 13.5, lineHeight: 1.6, color: M.body, maxWidth: "46ch" }}>
          {isAR
            ? "لاحظ: كلما زدت الملح ارتفعت العتبة أمامك. البحر الأملح يعني مضخات أقوى إلى الأبد."
            : "Notice: every time you add salt, the threshold moves up in front of you. A saltier sea means stronger pumps, forever."}
        </p>
      )}

      <p style={{
        margin: "16px 0 0", paddingTop: 12, borderTop: "1px solid rgba(42,35,28,.08)",
        fontSize: 12.5, lineHeight: 1.55, color: M.body,
      }}>
        {isAR
          ? "ما لا تريه هذه المنضدة: الغشاء الحقيقي صفيحة ملفوفة بطول أمتار، وينسدّ، ويحتاج تنظيف الماء قبله."
          : "What this bench does not show you: a real membrane is a sheet rolled up metres long, it clogs, and the water has to be cleaned before it ever gets there."}
      </p>
    </div>
  );
}
