"use client";
import { useTrackView } from "@/hooks/useTrackView";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import ElderNav from "@/components/elder/ElderNav";
import { useElderLang } from "@/hooks/useElderLang";

const cinzel = "var(--ui)";
const body   = "var(--ui)";

// `description` is the elder-form field; `content`/`title` come from main-site
// posts written to the same collection, accept either so nothing renders blank.
interface Warning { id: string; description?: string; content?: string; title?: string; channel?: string; status?: string; createdAt?: { toDate: () => Date }; }

const warningText = (w: Warning) => w.description || w.content || w.title || "";

const PAGE_SIZE = 8;

const T = {
  en: {
    title: "Community Warnings",
    sub: "Read what others have reported, and share your own warning to protect the community.",
    tabFeed: "Community Feed",
    tabPost: "Post a Warning",
    feedTitle: "Recent warnings from the community",
    noWarnings: "No warnings yet. Be the first to share.",
    via: "via",
    loadMore: "Load more",
    shareTitle: "Share a Warning",
    shareSub: "If you received a scam call or message, sharing it here could protect someone else in Qatar.",
    what: "What happened?",
    whatPlaceholder: "Describe the scam call or message you received…",
    how: "How did they contact you?",
    options: ["Phone call", "WhatsApp", "SMS", "Email", "Other"],
    send: "Share this warning",
    success: "Thank you for sharing. Your warning will help protect others.",
    note: "Your report is reviewed before publishing.",
    shareAnother: "Share another warning",
    loginNeeded: "Please sign in first, so we know who shared this warning.",
    loginBtn: "Sign in to post",
    ago: (s: number) => s < 60 ? "Just now" : s < 3600 ? Math.floor(s/60) + "m ago" : s < 86400 ? Math.floor(s/3600) + "h ago" : Math.floor(s/86400) + "d ago",
  },
  ar: {
    title: "تحذيرات المجتمع",
    sub: "اقرأ ما أبلغ عنه الآخرون، وشارك تحذيرك الخاص لحماية المجتمع.",
    tabFeed: "تحذيرات المجتمع",
    tabPost: "شارك تحذيراً",
    feedTitle: "أحدث التحذيرات من المجتمع",
    noWarnings: "لا توجد تحذيرات بعد. كن أول من يشارك.",
    via: "عبر",
    loadMore: "تحميل المزيد",
    shareTitle: "شارك تحذيراً",
    shareSub: "إذا تلقيت مكالمة أو رسالة احتيالية، مشاركتها هنا قد تحمي شخصاً آخر في قطر.",
    what: "ماذا حدث؟",
    whatPlaceholder: "صف مكالمة الاحتيال أو الرسالة التي تلقيتها…",
    how: "كيف تواصلوا معك؟",
    options: ["مكالمة هاتفية", "واتساب", "رسالة قصيرة", "بريد إلكتروني", "أخرى"],
    send: "شارك هذا التحذير",
    success: "شكراً لك على المشاركة. تحذيرك سيساعد في حماية الآخرين.",
    note: "تقريرك يُراجع قبل النشر.",
    shareAnother: "شارك تحذيراً آخر",
    loginNeeded: "يرجى تسجيل الدخول أولاً، حتى نعرف من شارك هذا التحذير.",
    loginBtn: "سجّل الدخول للنشر",
    ago: (s: number) => s < 60 ? "الآن" : s < 3600 ? Math.floor(s/60) + " د" : s < 86400 ? Math.floor(s/3600) + " س" : Math.floor(s/86400) + " ي",
  },
};

export default function ElderCommunityPage() {
  useTrackView("elder_community");
  const [lang, setLang]         = useElderLang();
  const [tab, setTab]           = useState<"feed" | "post">("feed");
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [page, setPage]         = useState(1);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [text, setText]         = useState("");
  const [channel, setChannel]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const router = useRouter();

  const isRtl = lang === "ar";
  const c = T[lang];

  const loadFeed = () => {
    setLoadingFeed(true);
    const apply = (snap: { docs: { id: string; data: () => Record<string, unknown> }[] }, ordered: boolean) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Warning));
      // hide only rejected posts; require some text so nothing renders blank
      const visible = all.filter(w => w.status !== "rejected" && warningText(w));
      setWarnings(ordered ? visible : visible.reverse());
    };
    getDocs(query(collection(db, "communityWarnings"), orderBy("createdAt", "desc")))
      .then(snap => apply(snap, true))
      .catch((err) => {
        // Surface the real reason (e.g. permission-denied / missing index) and
        // retry unordered so a missing createdAt index alone can't blank the feed.
        console.error("Elder community feed (ordered) failed, retrying unordered:", err);
        getDocs(collection(db, "communityWarnings"))
          .then(snap => apply(snap, false))
          .catch((e) => console.error("Elder community feed failed:", e));
      })
      .finally(() => setLoadingFeed(false));
  };

  useEffect(() => { loadFeed(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!text.trim()) return;
    const user = auth.currentUser;
    if (!user) { setNeedsLogin(true); return; }   // ask them to sign in first
    setSubmitting(true);
    try {
      await addDoc(collection(db, "communityWarnings"), {
        description: text.trim(),
        channel: channel || "Unknown",
        status: "pending",
        source: "elder",
        userID: user.uid,
        displayName: user.displayName || null,
        lang,
        createdAt: serverTimestamp(),
      });
      setDone(true);
      setText(""); setChannel("");
      loadFeed(); // show the new post immediately
    } catch (err) {
      console.error("Elder community post failed:", err);
    }
    setSubmitting(false);
  };

  const timeAgo = (w: Warning) => {
    if (!w.createdAt) return "";
    try { return c.ago(Math.floor((Date.now() - w.createdAt.toDate().getTime()) / 1000)); } catch { return ""; }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: cinzel,
    fontWeight: 700,
    fontSize: "1rem",
    padding: "0.65rem 1.6rem",
    border: active ? "2px solid #632024" : "2px solid rgba(99,32,36,0.15)",
    background: active ? "linear-gradient(135deg, #4a1a1d, #632024)" : "#fff",
    color: active ? "#E8D4BC" : "#6a4640",
    borderRadius: 999,
    cursor: "pointer",
    transition: "all 0.18s ease",
    letterSpacing: "0.04em",
  });

  const displayed = warnings.slice(0, page * PAGE_SIZE);
  const hasMore   = displayed.length < warnings.length;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", color: "#4a1a1d", direction: isRtl ? "rtl" : "ltr", fontFamily: body }}>
      <ElderNav lang={lang} onLangChange={setLang} />
      <main style={{ padding: "110px 2rem 4rem", maxWidth: 760, margin: "0 auto" }}>

        <h1 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "0.5rem" }}>
          {c.title}
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#6a4640", marginBottom: "2rem", lineHeight: 1.75 }}>
          {c.sub}
        </p>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2.5rem" }}>
          <button style={tabStyle(tab === "feed")} onClick={() => setTab("feed")}>{c.tabFeed}</button>
          <button style={tabStyle(tab === "post")} onClick={() => setTab("post")}>{c.tabPost}</button>
        </div>

        {/* ── Feed tab ── */}
        {tab === "feed" && (
          <section>
            <h2 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.2rem", marginBottom: "1.4rem", color: "#4a1a1d" }}>
              {c.feedTitle}
            </h2>

            {loadingFeed && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "1.3rem 1.5rem", opacity: 0.5, animation: "pulse 1.5s infinite" }}>
                    <div style={{ height: 16, background: "#e5d6c6", borderRadius: 8, marginBottom: 8 }} />
                    <div style={{ height: 60, background: "#f0e8dc", borderRadius: 8 }} />
                  </div>
                ))}
              </div>
            )}

            {!loadingFeed && warnings.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>🤝</div>
                <p style={{ fontFamily: cinzel, fontSize: "1.1rem", color: "#8B6555" }}>{c.noWarnings}</p>
                <button
                  onClick={() => setTab("post")}
                  style={{ marginTop: "1rem", fontFamily: cinzel, fontSize: "0.9rem", background: "linear-gradient(135deg,#4a1a1d,#632024)", color: "#E8D4BC", border: "none", borderRadius: 999, padding: "0.6rem 1.5rem", cursor: "pointer" }}
                >
                  {c.tabPost} →
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {displayed.map(w => (
                <div key={w.id} style={{
                  background: "#fff", borderRadius: 16,
                  border: "1px solid rgba(99,32,36,0.1)",
                  padding: "1.3rem 1.5rem",
                  boxShadow: "0 2px 12px rgba(62,19,22,0.05)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.6rem" }}>
                    <span style={{ background: "rgba(139,38,53,0.08)", color: "#8B2635", fontFamily: cinzel, fontSize: "0.75rem", fontWeight: 700, padding: "2px 10px", borderRadius: 999 }}>
                      {w.channel ? `${c.via} ${w.channel}` : "⚠"}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#8B6555", whiteSpace: "nowrap" }}>{timeAgo(w)}</span>
                  </div>
                  <p style={{ fontSize: "1.05rem", color: "#4A3728", margin: 0, lineHeight: 1.75 }}>{warningText(w)}</p>
                </div>
              ))}
            </div>

            {hasMore && (
              <button
                onClick={() => setPage(p => p + 1)}
                style={{ marginTop: "1.5rem", width: "100%", fontFamily: cinzel, fontSize: "0.95rem", background: "none", border: "2px solid rgba(99,32,36,0.2)", borderRadius: 999, padding: "0.7rem 1.5rem", cursor: "pointer", color: "#632024" }}
              >
                {c.loadMore} ({warnings.length - displayed.length} {isRtl ? "متبقٍ" : "more"})
              </button>
            )}
          </section>
        )}

        {/* ── Post tab ── */}
        {tab === "post" && (
          <section>
            <h2 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.5rem" }}>{c.shareTitle}</h2>
            <p style={{ fontSize: "1rem", color: "#6a4640", marginBottom: "1.8rem" }}>{c.shareSub}</p>

            {done ? (
              <div style={{ background: "#f0fdf4", border: "2px solid #16a34a40", borderRadius: 20, padding: "2.5rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>🤝</div>
                <p style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.2rem", color: "#16a34a", margin: "0 0 0.4rem" }}>{c.success}</p>
                <p style={{ color: "#6a4640", fontSize: "0.95rem", margin: 0 }}>{c.note}</p>
                <button
                  onClick={() => { setDone(false); setTab("feed"); }}
                  style={{ marginTop: "1.2rem", fontFamily: cinzel, fontSize: "0.85rem", background: "none", border: "1px solid rgba(99,32,36,0.3)", borderRadius: 999, padding: "0.45rem 1.2rem", cursor: "pointer", color: "#632024" }}
                >
                  {isRtl ? "← العودة للتحذيرات" : "← Back to feed"}
                </button>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(99,32,36,0.1)", padding: "2rem", boxShadow: "0 4px 24px rgba(62,19,22,0.07)" }}>
                <label style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1rem", display: "block", marginBottom: "0.6rem" }}>{c.what}</label>
                <textarea
                  value={text} onChange={e => setText(e.target.value)}
                  placeholder={c.whatPlaceholder} rows={5}
                  style={{ width: "100%", boxSizing: "border-box", fontFamily: body, fontSize: "1.1rem", lineHeight: 1.6, border: "2px solid rgba(99,32,36,0.15)", borderRadius: 12, padding: "1rem", color: "#4a1a1d", background: "#F7F3EE", outline: "none", resize: "none", direction: isRtl ? "rtl" : "ltr" }}
                />

                <label style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1rem", display: "block", marginTop: "1.5rem", marginBottom: "0.6rem" }}>{c.how}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {c.options.map(opt => (
                    <button key={opt} onClick={() => setChannel(opt)} style={{ fontFamily: body, fontSize: "1rem", padding: "0.5rem 1.1rem", borderRadius: 999, background: channel === opt ? "linear-gradient(135deg,#4a1a1d,#632024)" : "#F7F3EE", color: channel === opt ? "#E8D4BC" : "#4a1a1d", border: channel === opt ? "1px solid transparent" : "1px solid rgba(99,32,36,0.2)", cursor: "pointer" }}>
                      {opt}
                    </button>
                  ))}
                </div>

                {needsLogin && (
                  <div style={{ marginTop: "1.5rem", background: "#FBF6EF", border: "1px solid #E4C9A1", borderRadius: 14, padding: "1.1rem 1.3rem", textAlign: "center" }}>
                    <p style={{ fontSize: "1rem", color: "#7a5c2e", margin: "0 0 0.9rem", lineHeight: 1.6 }}>{c.loginNeeded}</p>
                    <button
                      onClick={() => router.push("/auth")}
                      style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1rem", background: "linear-gradient(135deg, #4a1a1d, #632024)", color: "#E8D4BC", border: "none", borderRadius: 999, padding: "0.7rem 1.8rem", cursor: "pointer" }}
                    >
                      {c.loginBtn}
                    </button>
                  </div>
                )}

                <button
                  onClick={submit}
                  disabled={!text.trim() || submitting}
                  style={{ marginTop: "1.8rem", width: "100%", fontFamily: cinzel, fontWeight: 700, fontSize: "1.1rem", background: "linear-gradient(135deg, #4a1a1d, #632024)", color: "#E8D4BC", border: "none", borderRadius: 999, padding: "0.9rem 2rem", cursor: text.trim() && !submitting ? "pointer" : "not-allowed", opacity: text.trim() && !submitting ? 1 : 0.5 }}
                >
                  {submitting ? "…" : c.send}
                </button>
                <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#8B6555", marginTop: "0.8rem" }}>{c.note}</p>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
