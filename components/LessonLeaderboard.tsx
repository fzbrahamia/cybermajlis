"use client";
// ============================================================
// LESSON LEADERBOARD
// Ranks learners by lessons completed (100 XP per fully-finished
// lesson, read from the `progress` collection). This is a
// learning-progress metric, so it lives on the dashboard.
// Reuses the existing `Hub.rankings.*` translation keys.
//
// Layout: top-3 podium, then the ranked list continues from #4
// (capped to `listLimit` rows so it height-matches its neighbour).
// "You" is always shown — in the podium, the list, or pinned below.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import { useTranslations, useLocale } from "next-intl";
import { Crown, Medal } from "lucide-react";

interface LBEntry {
  uid: string;
  name: string;
  avatar: string;
  xp: number;
  isYou: boolean;
}

const PODIUM_COLORS = ["#cbd5e1", "#e8c17a", "#cd9b62"]; // [2nd silver, 1st gold, 3rd bronze]

export default function LessonLeaderboard({ youXP, listLimit = 5 }: { youXP: number; listLimit?: number }) {
  const t = useTranslations("Hub");
  const isRtl = useLocale() === "ar";
  const lbFeats = t.raw("lbFeats") as string[];

  const [uid, setUid] = useState<string | null>(null);
  const [entries, setEntries] = useState<LBEntry[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(false);
        const snap = await getDocs(collection(db, "progress"));

        // Aggregate XP per user: 100 XP per fully completed lesson.
        const userXP: Record<string, number> = {};
        snap.docs.forEach((d) => {
          const { userID, storyDone, demoDone, posterDone, quizDone } = d.data();
          if (!userID) return;
          if (!userXP[userID]) userXP[userID] = 0;
          if (storyDone && demoDone && posterDone && quizDone) userXP[userID] += 100;
        });

        const built: LBEntry[] = await Promise.all(
          Object.entries(userXP).map(async ([id, xp]) => {
            // A single denied read (guest rules) must not abort the board.
            let data: { username?: string; avatar?: string } = {};
            try {
              const us = await getDoc(doc(db, "user", id));
              if (us.exists()) data = us.data() as { username?: string; avatar?: string };
            } catch { /* anonymised entry */ }
            return {
              uid: id,
              name: data.username || "Anonymous",
              avatar: data.avatar || "/characters/falcon.jpeg",
              xp,
              isYou: id === uid,
            };
          }),
        );

        if (!cancelled) setEntries(built);
      } catch (e) {
        console.error("Leaderboard fetch error (check Firestore rules for /progress collection):", e);
        if (!cancelled) setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [uid]);

  // Override "you" with the live dashboard XP, and make sure "you"
  // always appears even before a progress doc has been written.
  const lb = useMemo(() => {
    const rows = entries.map((p) => (p.isYou ? { ...p, xp: youXP } : p));
    if (uid && !rows.some((p) => p.isYou)) {
      rows.push({ uid, name: t("rankings.you"), avatar: "/characters/falcon.jpeg", xp: youXP, isYou: true });
    }
    return rows.sort((a, b) => b.xp - a.xp);
  }, [entries, youXP, uid, t]);

  const hasPodium = lb.length >= 3;
  // List continues from #4 when there's a podium, else from #1.
  const listStart = hasPodium ? 3 : 0;
  const visible = lb.slice(listStart, listStart + listLimit);
  const youRank = lb.findIndex((p) => p.isYou);
  const youShown = lb.slice(0, listStart + (hasPodium ? listLimit : visible.length)).some((p) => p.isYou)
    || visible.some((p) => p.isYou);
  const pinnedYou = !youShown && youRank >= 0 ? lb[youRank] : null;

  const card: React.CSSProperties = {
    background: "rgba(253,248,240,0.55)",
    border: "1px solid rgba(99,32,36,0.12)",
    borderRadius: 24,
    padding: "1.8rem 1.9rem",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 14px 40px rgba(99,32,36,0.1)",
    direction: isRtl ? "rtl" : "ltr",
    height: "100%",
  };

  const row = (p: LBEntry, rank: number, last: boolean) => (
    <div
      key={p.uid}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0.6rem 0.65rem", borderRadius: 12,
        borderBottom: !last ? "1px solid rgba(99,32,36,0.08)" : "none",
        background: p.isYou ? "rgba(160,125,62,0.14)" : "transparent",
      }}
    >
      <div style={{ width: 22, textAlign: "center", fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 800, color: p.isYou ? "#4a1a1d" : "rgba(106,70,64,0.55)" }}>
        {rank}
      </div>
      <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: p.isYou ? "2px solid #a07d3e" : "1px solid rgba(99,32,36,0.14)" }}>
        <img src={p.avatar} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.8rem", fontWeight: p.isYou ? 800 : 600, color: "#4a1a1d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.isYou ? t("rankings.you") : p.name}
        </div>
        <div style={{ fontSize: "0.66rem", color: "rgba(106,70,64,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {lbFeats[(rank - 1) % lbFeats.length]}
        </div>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 700, color: "#a07d3e" }}>
        {p.xp.toLocaleString()} XP
      </div>
    </div>
  );

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.4rem" }}>
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.05rem", fontWeight: 700, color: "#4a1a1d", letterSpacing: "0.04em" }}>
            {t("rankings.title")}
          </div>
          <div style={{ fontSize: "0.7rem", color: "rgba(106,70,64,0.65)", fontStyle: "italic", marginTop: 2 }}>
            {isRtl ? "حسب الدروس المكتملة" : "Ranked by lessons completed"}
          </div>
        </div>
        <span style={{ fontSize: "0.65rem", color: "rgba(106,70,64,0.55)", whiteSpace: "nowrap" }}>
          {t("rankings.updated")}
        </span>
      </div>

      {error || lb.length === 0 ? (
        <div style={{ textAlign: "center", padding: "1.5rem 0", color: "rgba(106,70,64,0.7)", fontSize: "0.9rem" }}>
          {isRtl
            ? "أكمل درسًا لتظهر على لوحة المتصدرين."
            : "Complete a lesson to appear on the leaderboard."}
        </div>
      ) : (
        <>
          {/* Top-3 podium */}
          {hasPodium && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 14, marginBottom: "1.4rem" }}>
              {[lb[1], lb[0], lb[2]].map((p, pi) => {
                const heights = [60, 84, 48];
                const sizes = [50, 62, 46];
                const color = PODIUM_COLORS[pi];
                return (
                  <div key={p.uid} style={{ textAlign: "center", flex: "0 0 auto" }}>
                    {pi === 1 && <Crown size={20} color="#e8c17a" fill="#e8c17a" style={{ marginBottom: 2 }} />}
                    <div style={{
                      width: sizes[pi], height: sizes[pi], borderRadius: "50%", overflow: "hidden", margin: "0 auto 6px",
                      border: pi === 1 ? "2px solid #a07d3e" : "1px solid rgba(99,32,36,0.15)",
                      boxShadow: pi === 1 ? "0 0 18px rgba(197,165,126,0.4)" : "none",
                    }}>
                      <img src={p.avatar} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 800, color: "#4a1a1d", maxWidth: 84, margin: "0 auto", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.isYou ? t("rankings.you") : p.name}
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700, color: "#a07d3e" }}>
                      {p.xp.toLocaleString()} XP
                    </div>
                    <div style={{
                      width: 44, height: heights[pi], margin: "8px auto 0", borderRadius: "8px 8px 0 0",
                      background: pi === 1 ? "linear-gradient(180deg, rgba(197,165,126,0.35), rgba(197,165,126,0.08))" : "rgba(99,32,36,0.05)",
                      border: "1px solid rgba(197,165,126,0.18)", borderBottom: "none",
                      display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 7,
                    }}>
                      <Medal size={17} color={color} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ranked list (continues from #4 when a podium is shown) */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {visible.map((p, i) => row(p, listStart + i + 1, i === visible.length - 1 && !pinnedYou))}
            {pinnedYou && (
              <>
                <div style={{ textAlign: "center", color: "rgba(106,70,64,0.4)", fontSize: "0.9rem", lineHeight: 1, padding: "2px 0" }}>···</div>
                {row(pinnedYou, youRank + 1, true)}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
