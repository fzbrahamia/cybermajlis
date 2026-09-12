"use client";

/* The CyberMajlis look, taken from the Malware lessons page rather than guessed.
 *
 * What makes a CyberMajlis page recognisable, and what the first attempt at
 * these pages threw away:
 *   the header is CENTRED, not left aligned
 *   the eyebrow is a bordered pill reading CYBER MAJLIS · SECTION
 *   the title is two tone: dark brown, then maroon
 *   a rule with a gold lozenge in the middle sits under it
 *   the subtitle is italic and light
 *   the back button is a bordered box BELOW the header, not a link above it
 *   the ground is flat #FDFBF6. No orbs. Those belong to the dashboard only.
 *
 * Everything here is that page's own CSS, lifted so the two cannot drift apart.
 */

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";

export const C = {
  maroon: "#632024",
  deep:   "#3e1316",
  mid:    "#8B2635",
  gold:   "#c5a57e",
  light:  "#E8D4BC",
  cream:  "#E3DAC9",
  sand:   "#FDF8F0",
  paper:  "#FDFBF6",
  head:   "#4a1a1d",
  body:   "#6a4640",
  line:   "rgba(99,32,36,.15)",
};

/** Everything is maroon, gold and beige. The per-area colours read as a
    different website, so they are gone; a section is told apart by its words. */
export const ACCENT = {
  concepts: C.maroon,
  cases:    C.maroon,
  quantum:  C.maroon,
  ai:       C.maroon,
  space:    C.maroon,
  ot:       C.maroon,
} as const;

const CSS = `
.cy-card {
  position: relative; display: flex; flex-direction: column; text-decoration: none;
  background: linear-gradient(160deg, #FDFBF6 0%, #F3EBDB 100%);
  border: 1px solid rgba(99,32,36,.15); border-radius: 20px; overflow: hidden;
  box-shadow: 0 4px 24px rgba(99,32,36,.08);
  transition: transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease;
}
a.cy-card:hover, button.cy-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 24px 60px rgba(99,32,36,.18), 0 0 0 1px rgba(197,165,126,.3);
}
/* Press. A card that does not move under the finger feels dead on a phone,
   where there is no hover to tell you the thing is live. */
a.cy-card:active, button.cy-card:active {
  transform: translateY(-2px) scale(.988);
  transition-duration: .09s;
}
:root[data-motion="reduced"] a.cy-card:active,
:root[data-motion="reduced"] button.cy-card:active { transform: none !important; }
a.cy-card:focus-visible { outline: 2px solid var(--tone, ${C.gold}); outline-offset: 3px; }
.cy-stripe { height: 3px; flex-shrink: 0;
  background: linear-gradient(90deg, var(--tone, ${C.maroon}), ${C.gold}); }
.cy-arrow { display: flex; align-items: center; justify-content: center; gap: 7px;
  margin-top: 1.2rem; padding-top: 1rem; border-top: 1px solid rgba(99,32,36,.1);
  font-size: .65rem; letter-spacing: .15em; text-transform: uppercase;
  color: ${C.mid}; opacity: 0; transform: translateY(4px);
  transition: opacity .25s, transform .25s; }
.cy-card:hover .cy-arrow { opacity: 1; transform: translateY(0); }

.cy-back {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: .7rem; letter-spacing: .1em; text-transform: uppercase;
  color: ${C.maroon}; text-decoration: none; padding: 9px 18px; border-radius: 8px;
  border: 1px solid rgba(99,32,36,.25); background: rgba(99,32,36,.05);
  transition: background .2s; font-weight: 700;
}
.cy-back:hover { background: rgba(99,32,36,.1); }

.cy-chip { display: inline-flex; align-items: center; gap: 6px;
  font-size: .62rem; letter-spacing: .15em; text-transform: uppercase;
  border-radius: 999px; padding: 6px 12px;
  background: rgba(99,32,36,.055); color: ${C.body}; white-space: nowrap; }

/* One frame for every film on the site. The picture fills it: the films are
   all 16:9, so nothing is cropped and no dark bars are left over. The radius
   lives on the wrapper as well as the video, because Safari does not clip a
   video to its own corners. */
.cy-film { position: relative; width: 100%; aspect-ratio: 16 / 9;
  overflow: hidden; border-radius: 14px; background: #2c1011;
  border: 1px solid rgba(99,32,36,.15); }
.cy-film > video { position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block; border-radius: 14px; }

.cy-art { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block;
  border-radius: 10px; border: 1px solid rgba(99,32,36,.12);
  background: rgba(99,32,36,.05); }
.cy-art-empty { display: grid; place-items: center; color: ${C.mid}; }

.cy-panel {
  background: linear-gradient(160deg, #FDFBF6 0%, #F3EBDB 100%);
  border: 1px solid rgba(99,32,36,.15); border-radius: 20px;
  box-shadow: 0 4px 24px rgba(99,32,36,.08);
}

@media (prefers-reduced-motion: reduce) { .cy-card { transition: none } }
`;

/* ── the frame ───────────────────────────────────────────── */

export function CyberPage({ children, tint }: { children: React.ReactNode; tint?: string }) {
  const isAR = useLocale() === "ar";
  return (
    <div style={{
      minHeight: "100vh",
      /* A section may tint the ground its own colour. Quantum is green here for
         the same reason it is green in its own majlis. */
      background: tint
        ? `radial-gradient(ellipse 90% 60% at 50% -5%, ${tint}, ${C.paper} 62%)`
        : C.paper,
      position: "relative",
      overflow: "hidden", paddingBottom: "4rem",
      fontFamily: "var(--ui)", color: C.body,
      direction: isAR ? "rtl" : "ltr",
    }}>
      <style>{CSS}</style>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
        {children}
      </div>
    </div>
  );
}

/** The rule with the lozenge. It is the single most recognisable thing here. */
export function Rule({ width = 48 }: { width?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: ".8rem" }}>
      <div style={{ height: 1.5, width, background: `linear-gradient(90deg, transparent, ${C.maroon})`, borderRadius: 2 }} />
      <div style={{ width: 5, height: 5, background: C.gold, transform: "rotate(45deg)" }} />
      <div style={{ height: 1.5, width, background: `linear-gradient(90deg, ${C.maroon}, transparent)`, borderRadius: 2 }} />
    </div>
  );
}

export function Head({ section, title, tail, sub, back, backLabel }: {
  /** Shown after CYBER MAJLIS in the pill. */
  section: string;
  /** The dark half of the title. */
  title: string;
  /** The maroon half. */
  tail?: string;
  sub?: string;
  back?: string;
  backLabel?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", padding: "7rem 0 3rem" }}
      >
        <div style={{
          display: "inline-block", fontSize: ".65rem",
          letterSpacing: ".35em", textTransform: "uppercase", color: C.mid,
          background: "linear-gradient(135deg, rgba(99,32,36,.08), rgba(197,165,126,.18))",
          border: "1px solid rgba(99,32,36,.2)",
          padding: ".4rem 1.4rem", borderRadius: 999, marginBottom: "1rem",
        }}>
          {section}
        </div>

        <h1 style={{
          fontFamily: "var(--title)",
          fontSize: "clamp(1.9rem, 3.8vw, 3rem)", fontWeight: 700,
          color: C.head, margin: "0 0 .8rem", lineHeight: 1.18,
        }}>
          {title}{tail && <> <span style={{ color: C.mid }}>{tail}</span></>}
        </h1>

        <Rule />

        {sub && (
          <p style={{ fontSize: "1.05rem", fontStyle: "italic", color: C.body, fontWeight: 300, margin: 0 }}>
            {sub}
          </p>
        )}
      </motion.div>

      {back && (
        <div style={{ marginBottom: "2rem" }}>
          <Link href={back} className="cy-back">{backLabel}</Link>
        </div>
      )}
    </>
  );
}

/** A centred section heading with the same rule underneath. */
export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
      <h2 style={{
        fontFamily: "var(--title)",
        fontSize: "clamp(1.35rem, 2.3vw, 1.8rem)", fontWeight: 700,
        color: C.head, margin: "0 0 .5rem",
      }}>{title}</h2>
      <Rule width={36} />
      {sub && (
        <p style={{ fontSize: "1rem", fontStyle: "italic", color: C.body, fontWeight: 300, margin: 0 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/** A film, in the frame every film on the site wears. */
export function Film({ src, poster, onError }: {
  src: string; poster?: string; onError?: () => void;
}) {
  return (
    <div className="cy-film">
      <video controls preload="metadata" playsInline src={src} poster={poster} onError={onError} />
    </div>
  );
}

/** The lesson’s own picture, carried the way the Malware cards carry one.
    A slug with no file yet falls back to whatever the card showed before, so a
    missing cover is never a broken image. */
export function CardArt({ slug, src, alt, fallback, style }: {
  slug: string;
  src?: string;
  alt: string;
  fallback?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [missing, setMissing] = useState(false);

  const coverImages: Record<string, string> = {
    firewall: "/lessons/covers/cover_firewall.png",
    "zero-day": "/lessons/covers/cover_zeroday.png",
  };

  if (missing) {
    return (
      <div className="cy-art cy-art-empty" style={style}>
        {fallback}
      </div>
    );
  }

  return (
    <img
      className="cy-art"
      src={src ?? coverImages[slug] ?? `/lessons/covers/${slug}.jpg`}
      alt={alt}
      loading="lazy"
      onError={() => setMissing(true)}
      style={style}
    />
  );
}

/* ── entrances ───────────────────────────────────────────── */

/* Lives in hooks/useReveal.ts. Re-exported because half the CyberMajlis
   components already import it from here. */
export { useReveal };


/* Reveals as it comes into view rather than all at once on mount, so a long
   page arrives in the order you read it. `once` means it never replays, and
   the negative margin starts it just before the row reaches the fold. */
export function Stagger({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  const [ref, shown] = useReveal<HTMLDivElement>();
  return (
    <motion.div ref={ref} initial="off" animate={shown ? "on" : "off"} style={style}
      variants={{ on: { transition: { staggerChildren: reduce ? 0 : .07 } } }}
    >{children}</motion.div>
  );
}

export function Item({ children, style, className }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className}
      variants={{
        off: reduce ? {} : { opacity: 0, y: 20 },
        on:  { opacity: 1, y: 0,
               transition: reduce
                 ? { duration: .2 }
                 : { type: "spring", stiffness: 170, damping: 24, mass: .9 } },
      }}
      style={style}
    >{children}</motion.div>
  );
}

export function Rise({ children, delay = 0, style }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const [ref, shown] = useReveal<HTMLDivElement>();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={shown || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={reduce
        ? { duration: .2, delay }
        : { type: "spring", stiffness: 180, damping: 25, mass: .9, delay }}
      style={style}
    >{children}</motion.div>
  );
}

/** Cards of one height, centred like the lessons grid. */
export function Grid({ min = 300, children, style }: {
  min?: number; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <Stagger style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
      gap: "1.5rem", justifyContent: "center", gridAutoRows: "1fr",
      ...style,
    }}>{children}</Stagger>
  );
}
