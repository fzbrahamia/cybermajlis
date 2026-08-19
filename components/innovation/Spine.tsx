"use client";

/* The five moves, and the loop.

   The loop is the most important line in the whole component, so it is drawn
   heavily rather than as a dotted afterthought. Drawn as a straight line, Try
   reads as something you pass through once and a first failure reads as the
   end. Drawn as a loop, the same moment reads as the machine working. */

import { useLocale } from "next-intl";
import { Eye, Tag, Hammer, FlaskConical, Mic, Check, Lock } from "lucide-react";
import { VERBS, type VerbId } from "@/app/lib/innovationData";
import { M, mono, RADIUS } from "./theme";

const ICONS: Record<VerbId, React.ElementType> = {
  notice: Eye, name: Tag, make: Hammer, try: FlaskConical, tell: Mic,
};

export default function Spine({
  done = [],
  current,
  compact = false,
}: {
  done?: VerbId[];
  current?: VerbId;
  compact?: boolean;
}) {
  const isAR = useLocale() === "ar";

  return (
    <div style={{ position: "relative", paddingBottom: compact ? 0 : 62 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 10,
      }}>
        {VERBS.map(v => {
          const isDone = done.includes(v.id);
          const isNow = current === v.id;
          const Icon = ICONS[v.id];
          const pale = !isDone && !isNow;

          return (
            <div
              key={v.id}
              style={{
                display: "flex", flexDirection: "column", gap: 8,
                padding: "15px 14px", minHeight: compact ? 0 : 122,
                borderRadius: 15,
                background: isDone ? M.goldSoft : M.card,
                border: isDone
                  ? `1px solid ${M.gold}`
                  : isNow
                    ? `2px solid ${M.action}`
                    : `1px dashed rgba(42,35,28,.18)`,
                boxShadow: isNow ? "0 6px 18px rgba(143,106,56,.14)" : "none",
                opacity: pale ? 0.58 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Icon size={19} strokeWidth={1.8} color={pale ? M.body : M.action} />
                {isDone && <Check size={15} strokeWidth={2.6} color={M.action} />}
                {isNow && (
                  <span style={{
                    fontFamily: mono, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em",
                    background: M.action, color: M.cream, borderRadius: RADIUS.pill, padding: "3px 8px",
                  }}>
                    {isAR ? "الآن" : "NOW"}
                  </span>
                )}
                {pale && <Lock size={13} strokeWidth={2} color={M.body} />}
              </div>

              <div style={{
                fontSize: isAR ? 18 : 16, fontWeight: 900,
                letterSpacing: isAR ? 0 : "0.04em",
                textTransform: isAR ? "none" : "uppercase",
                color: M.heading,
              }}>
                {isAR ? v.ar : v.en}
              </div>

              {!compact && (
                <div style={{ fontSize: 12, lineHeight: 1.45, color: M.body }}>
                  {isAR ? v.does_ar : v.does_en}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div style={{
          position: "absolute", insetInlineStart: 0, insetInlineEnd: 0, bottom: 8,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <svg width="230" height="30" viewBox="0 0 230 30" aria-hidden style={{ overflow: "visible" }}>
            <defs>
              <marker id="spineHead" viewBox="0 0 10 10" refX="8" refY="5"
                      markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill={M.action} />
              </marker>
            </defs>
            <path
              d="M 200 2 C 200 22, 150 26, 115 26 C 80 26, 30 22, 30 2"
              fill="none" stroke={M.action} strokeWidth="2" strokeLinecap="round"
              markerEnd="url(#spineHead)"
            />
          </svg>
          <span style={{
            position: "absolute", background: M.page, padding: "0 10px",
            fontFamily: mono, fontSize: 10.5, letterSpacing: "0.12em",
            textTransform: "uppercase", color: M.action,
          }}>
            {isAR ? "لم ينجح؟ ارجع" : "Didn't work? Go back"}
          </span>
        </div>
      )}
    </div>
  );
}
