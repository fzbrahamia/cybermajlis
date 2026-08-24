"use client";

/* THE CUP
 *
 * A sea you can run, and cannot win.
 *
 * The mechanism is the honest one, which is not the obvious one. A plant does
 * not add salt to the sea: it removes fresh water, and ocean water flows in
 * behind it carrying its own salt. That is what makes the basin saltier.
 *
 * Numbers are the real ones. The Gulf is about 239,000 square kilometres at a
 * mean depth of 34 metres, sits near 40 grams per litre against the ocean's 35,
 * and exchanges along this coast in about three years. Net evaporation is not
 * a free parameter: it is derived from the fact that the Gulf holds at 40, and
 * it lands on 1.6 metres a year, which is what is actually measured. The model
 * being forced to agree with reality before a child touches it is the only
 * reason it is allowed to teach them anything.
 *
 * What they find, in this order: the whole sea barely moves, the pipe moves a
 * lot, and no setting removes the salt. All three are true.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { M, sans, mono, HUES, card, label } from "./theme";

const H = HUES.blue;

const AREA  = 239_000e6;          // m², the Gulf
const DEPTH = 34;                 // m, mean
const VOL   = AREA * DEPTH;       // m³
const OCEAN = 35;                 // g/L coming in through the strait
const START = 40;                 // g/L, where it already sits
const TAU   = 3;                  // years to exchange, this coast

const Q = VOL / TAU;                          // m³/yr traded with the ocean
const EVAP = Q * (START / OCEAN - 1);         // m³/yr the sun takes off the top

type Method = "thermal" | "membrane";

/** One year of it. Volume is fixed: the basin cannot empty, so whatever fresh
    water leaves is replaced by ocean water that brings salt with it. */
function step(salt: number, madePerYear: number) {
  const inflow = madePerYear + EVAP;               // fresh water leaving, replaced
  const gained = inflow * OCEAN;                   // salt that came in behind it
  const traded = Q * (OCEAN - salt);               // exchange pulls back toward 35
  return salt + (gained + traded) / VOL;
}

export default function WaterCup() {
  const isAR = useLocale() === "ar";
  const [made, setMade] = useState(30);            // million m³/day, region-wide
  const [method, setMethod] = useState<Method>("thermal");
  const [recovery, setRecovery] = useState(45);    // % , membrane only
  const [years, setYears] = useState(0);
  const [ran, setRan] = useState(false);
  const cv = useRef<HTMLCanvasElement | null>(null);

  const perYear = made * 1e6 * 365;

  /* Thermal recovers little and then blends a great deal of cooling water in,
     so it returns a lot at a mild strength. Membranes return a little at a
     severe one. Neither is free, and that is the whole exercise. */
  const r = method === "thermal" ? 0.35 : recovery / 100;
  const blend = method === "thermal" ? 5.2 : 0.15;   // cooling water per unit product

  const series = useMemo(() => {
    const out: number[] = [START];
    let s = START;
    for (let y = 1; y <= 60; y++) { s = step(s, perYear); out.push(s); }
    return out;
  }, [perYear]);

  const basin = series[Math.min(years, 60)];
  const backVolume = (1 - r) / r + blend;                    // m³ returned per m³ made
  // salt is conserved in the returned stream, then diluted by the cooling water
  const pipe = (basin / (1 - r) * ((1 - r) / r) + basin * blend) / backVolume;
  const warmer = method === "thermal" ? 8 : 0;
  const energy = (method === "thermal" ? 11 : 3.2) * (basin / START);

  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const w = c.width = c.clientWidth * 2;
    const h = c.height = c.clientHeight * 2;
    ctx.clearRect(0, 0, w, h);

    const lo = 39.8, hi = 41.6;
    const px = (i: number) => (i / 60) * w;
    const py = (v: number) => h - ((v - lo) / (hi - lo)) * h;

    ctx.strokeStyle = "rgba(42,35,28,.09)"; ctx.lineWidth = 2;
    for (let v = 40; v <= 41.5; v += 0.5) {
      ctx.beginPath(); ctx.moveTo(0, py(v)); ctx.lineTo(w, py(v)); ctx.stroke();
    }

    ctx.beginPath();
    series.forEach((v, i) => (i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v))));
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = "rgba(61,111,181,.10)"; ctx.fill();

    ctx.beginPath();
    series.forEach((v, i) => (i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v))));
    ctx.strokeStyle = "rgba(43,78,134,.75)"; ctx.lineWidth = 4; ctx.stroke();

    const x = px(Math.min(years, 60));
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h);
    ctx.strokeStyle = "rgba(143,106,56,.5)"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, py(basin), 9, 0, Math.PI * 2);
    ctx.fillStyle = "#2B4E86"; ctx.fill();
  }, [series, years, basin]);

  const band = pipe > 60 ? "gone" : pipe > 50 ? "bad" : pipe > 45 ? "stressed" : "ok";
  const bandText = {
    ok:       { en: "About what lives there is used to.", ar: "قريب مما اعتادته الحياة هناك.", c: "#1B6B4C" },
    stressed: { en: "Enough to push most things away from the pipe.", ar: "يكفي لإبعاد معظم الأحياء عن الأنبوب.", c: "#8F6A38" },
    bad:      { en: "Little that lived on this seabed stays on it.", ar: "قليل مما عاش على هذا القاع يبقى عليه.", c: "#A8323F" },
    gone:     { en: "Nothing much survives where this lands.", ar: "لا يبقى الكثير حيث يستقر هذا.", c: "#7A1E22" },
  }[band];

  const Stat = ({ k, v, u, note, tone }: { k: string; v: string; u: string; note?: string; tone?: string }) => (
    <div style={{ padding: "14px 16px", borderRadius: 14, background: M.page, border: "1px solid rgba(42,35,28,.08)" }}>
      <div style={{ ...label, fontSize: 9, marginBottom: 6, color: tone ?? H.deep }}>{k}</div>
      <div style={{ fontFamily: mono, fontSize: 21, fontWeight: 500, color: tone ?? M.heading, fontVariantNumeric: "tabular-nums" }}>
        {v}<span style={{ fontSize: 12, color: M.body, marginInlineStart: 4 }}>{u}</span>
      </div>
      {note && <div style={{ fontSize: 12, lineHeight: 1.45, color: M.body, marginTop: 5 }}>{note}</div>}
    </div>
  );

  return (
    <div style={{ ...card, padding: "22px 24px" }}>
      <div style={{ ...label, marginBottom: 4, color: H.deep }}>{isAR ? "الكأس" : "The Cup"}</div>
      <p style={{ margin: "0 0 18px", fontSize: 14.5, lineHeight: 1.6, color: M.body, maxWidth: "46ch" }}>
        {isAR
          ? "الخليج، ومحطات المنطقة كلها. غيّر ما تشاء وشغّل السنوات. حاول أن تجعل الملح يختفي."
          : "The Gulf, and every plant around it. Change whatever you like and run the years forward. Try to make the salt go away."}
      </p>

      <canvas ref={cv} style={{
        width: "100%", height: 130, display: "block", borderRadius: 14,
        background: M.page, border: "1px solid rgba(42,35,28,.08)",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 10.5, color: M.body, marginTop: 6 }}>
        <span>{isAR ? "اليوم" : "today"}</span><span>{isAR ? "بعد ٦٠ سنة" : "60 years on"}</span>
      </div>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: M.heading }}>{isAR ? "اركض بالسنوات" : "Run the years"}</span>
            <span style={{ fontFamily: mono, fontSize: 13, color: H.deep }}>{years}</span>
          </div>
          <input type="range" min={0} max={60} value={years}
            onChange={e => { setYears(+e.target.value); setRan(true); }}
            style={{ width: "100%", accentColor: H.mid, cursor: "pointer" }} />
        </div>

        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,13rem),1fr))" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: M.heading }}>{isAR ? "ماء يُصنع يومياً" : "Water made each day"}</span>
              <span style={{ fontFamily: mono, fontSize: 13, color: H.deep }}>{made}{isAR ? " مليون م٣" : "M m³"}</span>
            </div>
            <input type="range" min={0} max={120} value={made} onChange={e => setMade(+e.target.value)}
              style={{ width: "100%", accentColor: H.mid, cursor: "pointer" }} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: M.heading, marginBottom: 8 }}>{isAR ? "الطريقة" : "Method"}</div>
            <div style={{ display: "flex", gap: 7 }}>
              {(["thermal", "membrane"] as Method[]).map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{
                  font: "inherit", fontFamily: sans, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  padding: "8px 13px", borderRadius: 999, flex: 1,
                  background: method === m ? H.deep : "transparent",
                  color: method === m ? "#FFFDF8" : M.body,
                  border: `1px solid ${method === m ? H.deep : "rgba(42,35,28,.14)"}`,
                }}>
                  {m === "thermal" ? (isAR ? "غلي" : "Boil it") : (isAR ? "غشاء" : "Membrane")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {method === "membrane" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: M.heading }}>{isAR ? "كم تستخلص من كل دفعة" : "How much you recover"}</span>
              <span style={{ fontFamily: mono, fontSize: 13, color: H.deep }}>{recovery}%</span>
            </div>
            <input type="range" min={30} max={70} value={recovery} onChange={e => setRecovery(+e.target.value)}
              style={{ width: "100%", accentColor: H.mid, cursor: "pointer" }} />
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 18, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,11rem),1fr))" }}>
        <Stat k={isAR ? "البحر كله" : "The whole sea"} v={basin.toFixed(2)} u="g/L"
          note={isAR ? `بدأ من ${START}` : `started at ${START}`} />
        <Stat k={isAR ? "عند الأنبوب" : "At the pipe"} v={pipe.toFixed(0)} u="g/L" tone={bandText.c}
          note={isAR ? bandText.ar : bandText.en} />
        <Stat k={isAR ? "ما يعود" : "What goes back"} v={backVolume.toFixed(1)} u={isAR ? ": ١" : ": 1"}
          note={isAR ? "لكل متر تشربه" : "per m³ you drink"} />
        <Stat k={isAR ? "الطاقة" : "Energy"} v={energy.toFixed(1)} u="kWh/m³"
          note={warmer ? (isAR ? `وأدفأ بـ ${warmer}°` : `and ${warmer}° warmer`) : (isAR ? "بدرجة البحر" : "at sea temperature")} />
      </div>

      {ran && (
        <div style={{
          marginTop: 16, padding: "15px 17px", borderRadius: 14,
          background: "rgba(197,165,126,.13)", border: "1px solid rgba(197,165,126,.5)",
        }}>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.62, color: M.heading }}>
            {made === 0
              ? (isAR
                ? "أوقفت كل المحطات. البحر يهدأ، ولا أحد يشرب. هذا ليس حلاً، إنه الامتناع عن المسألة."
                : "You turned every plant off. The sea settles, and nobody drinks. That is not a solution, it is refusing the question.")
              : method === "membrane" && recovery >= 60
                ? (isAR
                  ? "استخلصت أكثر، فقلّ ما يعود. لكن انظر إلى الرقم عند الأنبوب: الكمية أصغر والقوة أشدّ. الملح نفسه، في ماء أقل."
                  : "You recovered more, so less goes back. But look at the number at the pipe: smaller amount, stronger. The same salt, in less water.")
                : (isAR
                  ? "لاحظ الفرق: البحر كله بالكاد يتحرك، بينما الرقم عند الأنبوب يتحرك كثيراً. المعدّل يخفي الضرر."
                  : "Notice the gap: the whole sea barely moves, while the number at the pipe moves a lot. The average hides the damage.")}
          </p>
        </div>
      )}

      <p style={{
        margin: "16px 0 0", paddingTop: 12, borderTop: "1px solid rgba(42,35,28,.08)",
        fontSize: 12.5, lineHeight: 1.55, color: M.body,
      }}>
        {isAR
          ? "ما لا تريه هذه الكأس: البحر هنا وعاء واحد مخلوط جيداً، وليس كذلك. فيه تيارات وطبقات وزوايا ضحلة حارة، والمحطات متجمعة في بعضها. والضرر أسوأ ما يكون حيث هذا النموذج أضعف ما يكون."
          : "What this Cup does not show you: the sea here is one well stirred bowl, and it is not one. It has currents, layers and hot shallow corners, and the plants are clustered in some of them. The damage is worst exactly where this model is weakest."}
      </p>
    </div>
  );
}
