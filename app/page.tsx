"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Volume2, VolumeX, ChevronDown, ArrowRight,
  BookOpen, FlaskConical, Radar, Newspaper, Users, ScanLine, Flag, MessageCircle,
} from "lucide-react";
import { useLocale } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import Footer from "@/components/ui/Footer";

/* ── Fonts ───────────────────────────────────────────────── */
const cinzel  = '"Cinzel", "Trajan Pro", Georgia, serif';
const crimson = '"Crimson Pro", "Crimson Text", Georgia, serif';
const mono    = '"Geist Mono", "JetBrains Mono", Menlo, monospace';

/* ── Palette ─────────────────────────────────────────────── */
const C = {
  ink: "#2a0c0e", maroon: "#3e1316", maroonMid: "#632024", crimson: "#8B2635",
  gold: "#c5a57e", goldLight: "#E8D4BC", sand: "#E3DAC9", sandWarm: "#EDE0CE", cream: "#f5ede0",
};

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Reveal animation variants ───────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 26 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/* ════════════════════════════════════════════════════════════
   Device frame + per-feature visual mocks
   ════════════════════════════════════════════════════════════ */

function Dot({ c }: { c: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />;
}

function DeviceFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: 300, borderRadius: 22, overflow: "hidden", background: "#1d0708",
      border: "1px solid rgba(197,165,126,.28)",
      boxShadow: "0 44px 90px rgba(42,12,14,.5), 0 0 0 1px rgba(197,165,126,.1), inset 0 1px 0 rgba(255,255,255,.06)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, padding: "10px 13px",
        background: "linear-gradient(180deg,#3e1316,#2a0c0e)", borderBottom: "1px solid rgba(197,165,126,.16)",
      }}>
        <Dot c="#a03040" /><Dot c="#b58a4a" /><Dot c="#4a7c59" />
        <span style={{ marginInlineStart: "auto", fontFamily: mono, fontSize: 8.5, letterSpacing: 1, color: "rgba(197,165,126,.6)" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: 16, minHeight: 332, display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function ScreenLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: 2, color: "rgba(197,165,126,.6)" }}>{children}</div>
  );
}

function LessonsMock() {
  const isAR = useLocale() === "ar";
  const rows = [
    { img: "/lessons/virusesCoverPage.jpeg",    en: "Viruses",    ar: "الفيروسات", pct: 100 },
    { img: "/lessons/wormsCoverPage.jpeg",      en: "Worms",      ar: "الديدان",   pct: 60  },
    { img: "/lessons/ransomwareCoverPage.jpeg", en: "Ransomware", ar: "الفدية",    pct: 25  },
  ];
  return (
    <>
      <ScreenLabel>{isAR ? "المسارات" : "TRACKS"}</ScreenLabel>
      <div style={{ display: "flex", gap: 6 }}>
        {[isAR ? "مبتدئ" : "Basic", isAR ? "متقدم" : "Advanced", isAR ? "افعلها بنفسك" : "DIY"].map((t, i) => (
          <span key={i} style={{
            fontFamily: cinzel, fontSize: 8, letterSpacing: 1, fontWeight: 700,
            padding: "4px 9px", borderRadius: 99, color: i === 0 ? C.maroon : C.goldLight,
            background: i === 0 ? C.gold : "rgba(197,165,126,.12)", border: "1px solid rgba(197,165,126,.25)",
          }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 2 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 11,
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(197,165,126,.14)",
          }}>
            <img src={r.img} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: cinzel, fontSize: 11, fontWeight: 700, color: C.goldLight }}>{isAR ? r.ar : r.en}</div>
              <div style={{ height: 4, borderRadius: 99, background: "rgba(197,165,126,.18)", marginTop: 6 }}>
                <div style={{ height: "100%", width: `${r.pct}%`, borderRadius: 99, background: "linear-gradient(90deg,#c5a57e,#E8D4BC)" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SimMock() {
  const isAR = useLocale() === "ar";
  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 8,
        background: "rgba(74,124,89,.16)", border: "1px solid rgba(74,156,110,.35)",
        fontFamily: cinzel, fontSize: 8.5, letterSpacing: 1.5, fontWeight: 700, color: "#8fcfa6",
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4a9c6e", animation: "cmPulse 1.6s infinite" }} />
        {isAR ? "محاكاة · آمنة 100%" : "SIMULATION · 100% SAFE"}
      </div>

      <ScreenLabel>{isAR ? "جرّب: كي لوغر" : "TRY IT · KEYLOGGER"}</ScreenLabel>
      {/* what the user types */}
      <div>
        <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 1, color: "rgba(232,212,188,.5)", marginBottom: 5 }}>{isAR ? "أنت تكتب هنا" : "YOU TYPE HERE"}</div>
        <div style={{ padding: "9px 11px", borderRadius: 9, background: "#120405", border: "1px solid rgba(197,165,126,.22)", fontFamily: mono, fontSize: 12, color: C.goldLight }}>
          my password is qatar123<span style={{ display: "inline-block", width: 7, height: 13, background: C.gold, marginInlineStart: 2, animation: "cmBlink 1s step-end infinite", verticalAlign: "middle" }} />
        </div>
      </div>
      {/* what the keylogger silently captures */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 1, color: "#e0a78f", marginBottom: 5 }}>{isAR ? "↓ يلتقطها الكي لوغر سرًّا" : "↓ SILENTLY CAPTURED BY THE KEYLOGGER"}</div>
        <div style={{ borderRadius: 9, padding: 11, background: "rgba(160,48,64,.12)", border: "1px solid rgba(224,121,106,.3)", fontFamily: mono, fontSize: 11, lineHeight: 1.8, color: "rgba(232,212,188,.85)" }}>
          <div style={{ color: "rgba(197,165,126,.55)" }}>[09:14] keystrokes:</div>
          <div>m·y·p·a·s·s·w·o·r·d·i·s</div>
          <div>q·a·t·a·r·1·2·3</div>
        </div>
      </div>
    </>
  );
}

function SOCMock() {
  const isAR = useLocale() === "ar";
  const alerts = [
    { sev: "#e0796a", en: "Brute-force · 88.x.x.x", ar: "هجوم تخمين · 88.x.x.x" },
    { sev: "#d9a14a", en: "Phishing domain flagged", ar: "نطاق تصيّد مرصود" },
    { sev: "#4a9c6e", en: "Patch deployed · web-03", ar: "تحديث مطبّق · web-03" },
  ];
  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 8,
        background: "rgba(217,161,74,.14)", border: "1px solid rgba(217,161,74,.32)",
        fontFamily: cinzel, fontSize: 8.5, letterSpacing: 1.5, fontWeight: 700, color: "#e0c184",
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#d9a14a", animation: "cmPulse 1.8s infinite" }} />
        {isAR ? "محاكاة تدريبية · ليست هجمات حقيقية" : "SIMULATED · TRAINING SCENARIO"}
      </div>
      <div style={{ borderRadius: 12, padding: "14px 14px", background: "linear-gradient(135deg,rgba(99,32,36,.4),rgba(42,12,14,.4))", border: "1px solid rgba(197,165,126,.18)" }}>
        <div style={{ fontFamily: cinzel, fontSize: 26, fontWeight: 900, color: C.goldLight, letterSpacing: 0.5 }}>1,284</div>
        <div style={{ fontFamily: crimson, fontSize: 11, color: "rgba(197,165,126,.8)", fontStyle: "italic" }}>
          {isAR ? "تنبيه فرزته في التدريب" : "alerts triaged in training"}
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 10, alignItems: "flex-end", height: 26 }}>
          {[40, 70, 35, 90, 55, 75, 48, 95, 60, 80].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 2, background: "linear-gradient(180deg,#c5a57e,rgba(197,165,126,.25))" }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {alerts.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, background: "rgba(255,255,255,.04)", border: "1px solid rgba(197,165,126,.12)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.sev, animation: `cmPulse 1.8s ${i * 0.3}s infinite`, flexShrink: 0 }} />
            <span style={{ fontFamily: mono, fontSize: 9.5, color: "rgba(232,212,188,.78)" }}>{isAR ? a.ar : a.en}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function NewsMock() {
  const isAR = useLocale() === "ar";
  const rows = [
    { tag: isAR ? "تصيّد" : "PHISHING", c: "#e0796a", en: "Fake Ooredoo bill SMS spreading", ar: "رسائل فاتورة Ooredoo مزيفة تنتشر", time: "2h" },
    { tag: isAR ? "ثغرة" : "CVE", c: "#d9a14a", en: "Router firmware patch released", ar: "تحديث أمني لأجهزة الراوتر", time: "5h" },
    { tag: isAR ? "احتيال" : "SCAM", c: "#9c7bd4", en: "QR parking-fine fraud in Doha", ar: "احتيال غرامات المواقف في الدوحة", time: "1d" },
  ];
  return (
    <>
      <ScreenLabel>{isAR ? "آخر الأخبار" : "LATEST"}</ScreenLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ padding: 11, borderRadius: 11, background: "rgba(255,255,255,.04)", border: "1px solid rgba(197,165,126,.14)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <span style={{ fontFamily: cinzel, fontSize: 7.5, letterSpacing: 1.5, fontWeight: 700, color: r.c, padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,.05)", border: `1px solid ${r.c}55` }}>{r.tag}</span>
              <span style={{ marginInlineStart: "auto", fontFamily: mono, fontSize: 8.5, color: "rgba(197,165,126,.5)" }}>{r.time}</span>
            </div>
            <div style={{ fontFamily: crimson, fontSize: 12.5, color: "rgba(232,212,188,.88)", lineHeight: 1.4 }}>{isAR ? r.ar : r.en}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function CommunityMock() {
  const isAR = useLocale() === "ar";
  const reports = [
    { av: "/characters/saqr.GIF", name: isAR ? "نورة" : "Noora", tag: isAR ? "احتيال هاتفي" : "SCAM CALL", c: "#e0796a", en: "Caller posing as the bank asked for my OTP. Reported the number.", ar: "متصل يدّعي أنه البنك طلب رمز التحقق. أبلغت عن الرقم.", warned: 38 },
    { av: "/characters/oryx.GIF", name: isAR ? "خالد" : "Khalid", tag: isAR ? "تصيّد" : "PHISHING", c: "#d9a14a", en: "Fake 'Ooredoo bill' SMS with a payment link. Reported so others are warned.", ar: "رسالة 'فاتورة Ooredoo' مزيفة برابط دفع. أبلغت عنها لتحذير الآخرين.", warned: 52 },
  ];
  return (
    <>
      <ScreenLabel>{isAR ? "بلاغات المجتمع" : "INCIDENT REPORTS"}</ScreenLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reports.map((r, i) => (
          <div key={i} style={{ padding: 11, borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(197,165,126,.14)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <img src={r.av} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(197,165,126,.4)" }} />
              <span style={{ fontFamily: cinzel, fontSize: 10.5, fontWeight: 700, color: C.goldLight }}>{r.name}</span>
              <span style={{ marginInlineStart: "auto", fontFamily: cinzel, fontSize: 7, letterSpacing: 1, fontWeight: 700, color: r.c, padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,.05)", border: `1px solid ${r.c}55` }}>{r.tag}</span>
            </div>
            <div style={{ fontFamily: crimson, fontSize: 12, color: "rgba(232,212,188,.82)", lineHeight: 1.45 }}>{isAR ? r.ar : r.en}</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: "#8fcfa6", marginTop: 7 }}>🛡 {isAR ? `حذّر ${r.warned} شخصًا` : `warned ${r.warned} people`}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function ScanMock() {
  const isAR = useLocale() === "ar";
  return (
    <>
      <ScreenLabel>{isAR ? "فاحص الروابط" : "LINK SCANNER"}</ScreenLabel>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ flex: 1, padding: "9px 11px", borderRadius: 9, background: "#120405", border: "1px solid rgba(197,165,126,.2)", fontFamily: mono, fontSize: 9.5, color: "rgba(232,212,188,.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          0oredoo-qatar.win/pay
        </div>
        <button style={{ fontFamily: cinzel, fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "0 12px", borderRadius: 9, border: "none", background: C.gold, color: C.maroon, cursor: "default" }}>
          {isAR ? "افحص" : "SCAN"}
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 12, background: "rgba(160,48,64,.14)", border: "1px solid rgba(224,121,106,.35)", padding: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(224,121,106,.16)", border: "1.5px solid rgba(224,121,106,.5)", animation: "cmPulseRing 2.2s infinite" }}>
          <ScanLine size={26} color="#e0796a" />
        </div>
        <div style={{ fontFamily: cinzel, fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#e0967a" }}>{isAR ? "خطر" : "DANGER"}</div>
        <div style={{ fontFamily: crimson, fontSize: 11.5, fontStyle: "italic", color: "rgba(232,212,188,.7)", textAlign: "center" }}>
          {isAR ? "نطاق تصيّد يحاكي Ooredoo" : "Phishing domain impersonating Ooredoo"}
        </div>
      </div>
    </>
  );
}

function CTFMock() {
  const isAR = useLocale() === "ar";
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {["WEB", "CRYPTO", "FORENSICS", "OSINT", "PWN"].map((t, i) => (
          <span key={i} style={{ fontFamily: mono, fontSize: 8, letterSpacing: 1, padding: "3px 8px", borderRadius: 6, color: i === 2 ? C.maroon : "rgba(197,165,126,.8)", background: i === 2 ? C.gold : "rgba(197,165,126,.1)", border: "1px solid rgba(197,165,126,.2)" }}>{t}</span>
        ))}
      </div>
      <div style={{ flex: 1, borderRadius: 12, padding: 14, background: "rgba(255,255,255,.04)", border: "1px solid rgba(197,165,126,.16)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: cinzel, fontSize: 8, letterSpacing: 1.5, fontWeight: 700, color: "#d9a14a" }}>FORENSICS</span>
          <span style={{ fontFamily: mono, fontSize: 9.5, color: C.gold }}>250 pts</span>
        </div>
        <div style={{ fontFamily: cinzel, fontSize: 14, fontWeight: 700, color: C.goldLight, margin: "8px 0 4px" }}>
          {isAR ? "مخفي على مرأى الجميع" : "Hidden in Plain Sight"}
        </div>
        <div style={{ fontFamily: crimson, fontSize: 11, fontStyle: "italic", color: "rgba(232,212,188,.65)", lineHeight: 1.5 }}>
          {isAR ? "هناك سرّ داخل هذه الصورة. استخرج العلم." : "A secret hides in this image. Recover the flag."}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "#120405", border: "1px solid rgba(197,165,126,.22)", fontFamily: mono, fontSize: 10, color: "rgba(232,212,188,.55)" }}>
            flag&#123;<span style={{ animation: "cmBlink 1s step-end infinite" }}>_</span>&#125;
          </div>
          <button style={{ fontFamily: cinzel, fontSize: 8.5, fontWeight: 700, letterSpacing: 1, padding: "0 12px", borderRadius: 8, border: "none", background: C.gold, color: C.maroon, cursor: "default" }}>
            {isAR ? "أرسل" : "SUBMIT"}
          </button>
        </div>
      </div>
    </>
  );
}

function ChatMock() {
  const isAR = useLocale() === "ar";
  const bubble = (side: "l" | "r", text: string) => (
    <div style={{ display: "flex", justifyContent: side === "l" ? "flex-start" : "flex-end" }}>
      <div style={{
        maxWidth: "82%", padding: "9px 12px", borderRadius: 14,
        borderBottomLeftRadius: side === "l" ? 4 : 14, borderBottomRightRadius: side === "r" ? 4 : 14,
        fontFamily: crimson, fontSize: 12, lineHeight: 1.45,
        background: side === "l" ? "rgba(197,165,126,.14)" : C.gold,
        color: side === "l" ? "rgba(232,212,188,.92)" : C.maroon,
        border: side === "l" ? "1px solid rgba(197,165,126,.2)" : "none",
      }}>{text}</div>
    </div>
  );
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <img src="/avatar.png" alt="Hamad" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(197,165,126,.5)" }} />
        <div>
          <div style={{ fontFamily: cinzel, fontSize: 11, fontWeight: 700, color: C.goldLight }}>HAMAD</div>
          <div style={{ fontFamily: mono, fontSize: 8, color: "#4a9c6e" }}>● {isAR ? "متصل" : "online"}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9, justifyContent: "center" }}>
        {bubble("l", isAR ? "مرحباً! أنا حمد. كيف أساعدك؟ 👋" : "Hi! I'm Hamad. How can I help? 👋")}
        {bubble("r", isAR ? "وصلني رابط غريب، آمن؟" : "Got a weird link — is it safe?")}
        {bubble("l", isAR ? "أرسله لي وسأفحصه فوراً 🔎" : "Send it over and I'll check it right away 🔎")}
        <div style={{ display: "flex", gap: 4, paddingInlineStart: 4 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(197,165,126,.6)", animation: `cmBlink 1.2s ${i * 0.2}s infinite` }} />)}
        </div>
      </div>
    </>
  );
}

/* ── Feature data ────────────────────────────────────────── */
type Feature = {
  id: string; route: string; Icon: React.ElementType; Mock: React.FC;
  frame: string;
  kicker: { en: string; ar: string };
  motto:  { en: string; ar: string };
  desc:   { en: string; ar: string };
  points: { en: string[]; ar: string[] };
  cta:    { en: string; ar: string };
};

const FEATURES: Feature[] = [
  {
    id: "lessons", route: "/dashboard", Icon: BookOpen, Mock: LessonsMock, frame: "cybermajlis.qa/learn",
    kicker: { en: "LESSONS", ar: "الدروس" },
    motto:  { en: "Knowledge is the first shield.", ar: "المعرفة هي الدرع الأول." },
    desc:   { en: "Story-driven lessons on the malware that actually targets us — viruses, worms, ransomware and the shape-shifters — each grounded in real Qatari scenarios.", ar: "دروس بأسلوب القصة حول البرمجيات الخبيثة التي تستهدفنا فعلاً — الفيروسات والديدان والفدية والمتحوّلة — كلها مبنية على سيناريوهات قطرية واقعية." },
    points: { en: ["Basic, Advanced & Do-It-Yourself tracks", "Animated stories, live demos & quizzes", "Earn XP and rise through the ranks"], ar: ["مسارات: مبتدئ، متقدم، وافعلها بنفسك", "قصص متحركة وعروض حية واختبارات", "اكسب نقاط الخبرة وارتقِ في الرتب"] },
    cta:    { en: "Start learning", ar: "ابدأ التعلّم" },
  },
  {
    id: "simulations", route: "/games?view=simulations", Icon: FlaskConical, Mock: SimMock, frame: "sandbox://try-it",
    kicker: { en: "SIMULATIONS", ar: "المحاكاة" },
    motto:  { en: "Don't just read it. Try it.", ar: "لا تكتفِ بالقراءة. جرّبه." },
    desc:   { en: "Safe, hands-on demos where you drive. Type into a keylogger and watch it capture every word, lock and unlock a machine like ransomware does, or run a program and watch windows multiply — feel how each threat behaves, no code and nothing real ever touched.", ar: "عروض آمنة وتفاعلية أنت من يقودها. اكتب في الكي لوغر وشاهده يلتقط كل كلمة، اقفل جهازًا وافتحه كما تفعل الفدية، أو شغّل برنامجًا وشاهد النوافذ تتكاثر — لتشعر بكيفية عمل كل تهديد، دون أي شفرة ودون المساس بشيء حقيقي." },
    points: { en: ["You drive the demo — not a script", "Keylogger, ransomware, virus & more", "100% safe — nothing real is touched"], ar: ["أنت تقود العرض — لا شفرة مكتوبة", "كي لوغر، فدية، فيروس وأكثر", "آمن 100% — لا شيء حقيقي يُمَسّ"] },
    cta:    { en: "Try a simulation", ar: "جرّب محاكاة" },
  },
  {
    id: "soc", route: "/soc", Icon: Radar, Mock: SOCMock, frame: "soc.cybermajlis.qa · training",
    kicker: { en: "SOC SIMULATION", ar: "محاكاة مركز العمليات" },
    motto:  { en: "The watch never sleeps.", ar: "العين الساهرة لا تنام." },
    desc:   { en: "Sit in a simulated Security Operations Center and practice the real job. Triage realistic — but simulated — alerts, follow the playbook, and respond to an attack scenario as it unfolds. It's training, not a live wire.", ar: "اجلس في مركز عمليات أمنية محاكى وتدرّب على المهمة الحقيقية. افرز تنبيهات واقعية — لكنها محاكاة — واتبع الإجراءات، واستجب لسيناريو هجوم وهو يتطوّر. إنه تدريب، وليست هجمات حقيقية." },
    points: { en: ["A realistic, simulated SOC", "Practice triage & incident response", "Scenario-based — not real attacks"], ar: ["مركز عمليات محاكى وواقعي", "تدرّب على الفرز والاستجابة للحوادث", "قائم على سيناريوهات — ليست هجمات حقيقية"] },
    cta:    { en: "Enter the SOC", ar: "ادخل المركز" },
  },
  {
    id: "news", route: "/news", Icon: Newspaper, Mock: NewsMock, frame: "cybermajlis.qa/news",
    kicker: { en: "NEWS", ar: "الأخبار" },
    motto:  { en: "Stay one step ahead.", ar: "ابقَ متقدّمًا بخطوة." },
    desc:   { en: "Curated cyber news that actually matters to Qatar — every story decoded into plain language and a clear next step you can act on today.", ar: "أخبار سيبرانية مختارة تهمّ قطر فعلاً — كل خبر مُبسّط بلغة واضحة وخطوة عملية يمكنك اتخاذها اليوم." },
    points: { en: ["Local & regional threats first", "Jargon translated into plain talk", "Always an action you can take"], ar: ["التهديدات المحلية والإقليمية أولاً", "مصطلحات مترجمة بلغة بسيطة", "دائماً خطوة عملية يمكنك اتخاذها"] },
    cta:    { en: "Read the news", ar: "اقرأ الأخبار" },
  },
  {
    id: "community", route: "/community", Icon: Users, Mock: CommunityMock, frame: "cybermajlis.qa/community",
    kicker: { en: "COMMUNITY", ar: "المجتمع" },
    motto:  { en: "Report it. Protect everyone.", ar: "أبلغ عنه. واحمِ الجميع." },
    desc:   { en: "Spotted a scam call, a phishing text or a suspicious number? Report it here. Every incident you submit warns the whole community and helps protect the people around you before they get caught.", ar: "رصدت اتصال احتيال أو رسالة تصيّد أو رقمًا مشبوهًا؟ أبلغ عنه هنا. كل حادثة ترفعها تحذّر المجتمع كله وتساعد على حماية من حولك قبل أن يقعوا في الفخ." },
    points: { en: ["Report scams, phishing & incidents", "Warn others before they're hit", "Build a safer community together"], ar: ["أبلغ عن الاحتيال والتصيّد والحوادث", "حذّر الآخرين قبل أن يقعوا ضحية", "ابنِ مجتمعًا أكثر أمانًا معًا"] },
    cta:    { en: "Report an incident", ar: "أبلغ عن حادثة" },
  },
  {
    id: "scan", route: "/scan", Icon: ScanLine, Mock: ScanMock, frame: "cybermajlis.qa/scan",
    kicker: { en: "LINK SCANNER", ar: "فاحص الروابط" },
    motto:  { en: "When in doubt, scan it.", ar: "إن شككت، فافحصه." },
    desc:   { en: "Paste a suspicious link or drop a file and get an instant, clear verdict — safe or dangerous — before you ever click. No guessing, no regret.", ar: "الصق رابطًا مشبوهًا أو أسقِط ملفًا واحصل على حكم فوري وواضح — آمن أم خطر — قبل أن تنقر. لا تخمين ولا ندم." },
    points: { en: ["Instant link & file analysis", "Plain verdict: safe or danger", "Catches phishing & impersonation"], ar: ["تحليل فوري للروابط والملفات", "حكم واضح: آمن أم خطر", "يكشف التصيّد وانتحال الهوية"] },
    cta:    { en: "Scan a link", ar: "افحص رابطًا" },
  },
  {
    id: "ctf", route: "/ctf", Icon: Flag, Mock: CTFMock, frame: "ctf.cybermajlis.qa",
    kicker: { en: "CAPTURE THE FLAG", ar: "التقط العلم" },
    motto:  { en: "Prove your skill. Capture the flag.", ar: "أثبت مهارتك. التقط العلم." },
    desc:   { en: "Real capture-the-flag challenges across five categories — web, crypto, forensics, OSINT and pwn. Solve, submit the flag, and climb the leaderboard.", ar: "تحديات حقيقية لالتقاط العلم عبر خمس فئات — الويب، التشفير، التحقيق الجنائي، الاستخبارات، والاختراق. حلّ، وأرسل العلم، وتصدّر القائمة." },
    points: { en: ["Five real CTF categories", "From beginner to expert", "Live leaderboard & points"], ar: ["خمس فئات حقيقية لالتقاط العلم", "من المبتدئ إلى الخبير", "قائمة متصدرين ونقاط حيّة"] },
    cta:    { en: "Take the challenge", ar: "ابدأ التحدي" },
  },
  {
    id: "chatbot", route: "", Icon: MessageCircle, Mock: ChatMock, frame: "Hamad · your guide",
    kicker: { en: "HAMAD · AI GUIDE", ar: "حمد · الدليل الذكي" },
    motto:  { en: "Hamad has your back, 24/7.", ar: "حمد بجانبك، على مدار الساعة." },
    desc:   { en: "Ask anything, anytime. Is this link safe? Was I scammed? What does this news mean for me? Hamad answers — in Arabic or English — and even speaks back.", ar: "اسأل أي شيء، في أي وقت. هل هذا الرابط آمن؟ هل تعرّضت للاحتيال؟ ماذا يعني هذا الخبر لي؟ حمد يجيب — بالعربية أو الإنجليزية — وحتى يتحدّث إليك." },
    points: { en: ["Arabic & English, voice or text", "Checks links, numbers & scams", "Always one tap away"], ar: ["عربي وإنجليزي، صوت أو نص", "يفحص الروابط والأرقام والاحتيال", "دائماً على بُعد نقرة واحدة"] },
    cta:    { en: "Talk to Hamad", ar: "تحدّث مع حمد" },
  },
];

/* ── Hooks ───────────────────────────────────────────────── */
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-48% 0px -48% 0px" }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);
  return active;
}

/* ── Feature section ─────────────────────────────────────── */
function FeatureSection({ f, index, isAR, onCTA }: { f: Feature; index: number; isAR: boolean; onCTA: () => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const y: MotionValue<number> | number = reduce ? 0 : yRaw;

  const dark = index % 2 === 0;
  const Icon = f.Icon;
  const flip = index % 2 === 1;

  const heading = dark ? C.goldLight : C.maroon;
  const body    = dark ? "rgba(232,212,188,.78)" : "#5a2428";
  const bg = dark
    ? "linear-gradient(180deg,#3e1316 0%,#2a0c0e 100%)"
    : (index === 1 ? C.sand : C.sandWarm);

  const btn: React.CSSProperties = dark
    ? { color: C.maroon, background: "linear-gradient(135deg,#E8D4BC,#c5a57e)", boxShadow: "0 6px 22px rgba(197,165,126,.3)" }
    : { color: C.cream, background: "linear-gradient(135deg,#632024,#8B2635)", boxShadow: "0 6px 22px rgba(99,32,36,.32)" };

  return (
    <section
      id={f.id}
      ref={ref}
      style={{
        position: "relative", zIndex: 1, background: bg,
        borderTop: dark ? "1px solid rgba(197,165,126,.18)" : "1px solid rgba(197,165,126,.22)",
        padding: "clamp(72px,11vh,128px) 4rem", overflow: "hidden",
      }}
    >
      {/* faint feature number watermark */}
      <div aria-hidden style={{
        position: "absolute", top: "50%", insetInlineEnd: 30, transform: "translateY(-50%)",
        fontFamily: cinzel, fontWeight: 900, fontSize: "26vh", lineHeight: 1,
        color: dark ? "rgba(197,165,126,.05)" : "rgba(99,32,36,.05)", pointerEvents: "none", userSelect: "none",
      }}>
        {String(index + 1).padStart(2, "0")}
      </div>

      <div style={{
        position: "relative", maxWidth: 1180, margin: "0 auto",
        display: "flex", gap: "clamp(40px,6vw,90px)", alignItems: "center",
        flexWrap: "wrap", flexDirection: flip ? "row-reverse" : "row",
      }}>
        {/* —— Copy —— */}
        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}
          style={{ flex: "1 1 380px", maxWidth: 520 }}
        >
          <motion.div variants={item} style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 22 }}>
            <span style={{
              width: 42, height: 42, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
              background: dark ? "rgba(197,165,126,.14)" : "rgba(99,32,36,.07)",
              border: `1px solid ${dark ? "rgba(197,165,126,.3)" : "rgba(99,32,36,.2)"}`,
            }}>
              <Icon size={20} color={dark ? C.gold : C.maroonMid} strokeWidth={1.6} />
            </span>
            <span style={{ fontFamily: cinzel, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: dark ? C.gold : C.crimson }}>
              {isAR ? f.kicker.ar : f.kicker.en}
            </span>
          </motion.div>

          <motion.h2 variants={item} style={{
            fontFamily: cinzel, fontWeight: 900, fontSize: "clamp(1.9rem,3.4vw,3rem)",
            lineHeight: 1.08, color: heading, margin: "0 0 8px",
          }}>
            {isAR ? f.motto.ar : f.motto.en}
          </motion.h2>

          <motion.div variants={item} style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 18px" }}>
            <div style={{ width: 48, height: 1, background: `linear-gradient(90deg,${C.maroonMid},${C.gold})` }} />
            <div style={{ width: 5, height: 5, background: C.gold, transform: "rotate(45deg)" }} />
          </motion.div>

          <motion.p variants={item} style={{
            fontFamily: crimson, fontSize: "1.12rem", fontStyle: "italic", lineHeight: 1.6, color: body, margin: 0,
          }}>
            {isAR ? f.desc.ar : f.desc.en}
          </motion.p>

          <motion.ul variants={item} style={{ listStyle: "none", padding: 0, margin: "22px 0 30px", display: "flex", flexDirection: "column", gap: 11 }}>
            {(isAR ? f.points.ar : f.points.en).map((p, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontFamily: crimson, fontSize: "1rem", color: body }}>
                <span style={{ width: 6, height: 6, background: C.gold, transform: "rotate(45deg)", flexShrink: 0 }} />
                {p}
              </li>
            ))}
          </motion.ul>

          <motion.button
            variants={item}
            onClick={onCTA}
            style={{
              fontFamily: cinzel, fontSize: 12.5, fontWeight: 700, letterSpacing: 1.4,
              padding: "13px 26px", borderRadius: 11, border: "none", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 10, transition: "all .25s ease", ...btn,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
          >
            {isAR ? f.cta.ar : f.cta.en}
            <ArrowRight size={16} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
          </motion.button>
        </motion.div>

        {/* —— Visual —— */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ flex: "0 0 auto", marginInline: "auto", position: "relative" }}
        >
          {/* halo */}
          <div aria-hidden style={{
            position: "absolute", inset: -40, borderRadius: 40,
            background: `radial-gradient(circle, ${dark ? "rgba(197,165,126,.18)" : "rgba(99,32,36,.1)"}, transparent 68%)`,
            filter: "blur(20px)", pointerEvents: "none",
          }} />
          <motion.div style={{ y }}>
            <DeviceFrame title={f.frame}><f.Mock /></DeviceFrame>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Store badges (placeholder links) ────────────────────── */
function StoreBadge({ kind, isAR }: { kind: "apple" | "play"; isAR: boolean }) {
  const top = kind === "apple" ? (isAR ? "حمّله من" : "Download on the") : (isAR ? "احصل عليه من" : "GET IT ON");
  const bottom = kind === "apple" ? "App Store" : "Google Play";
  return (
    // TODO: replace href="#" with the real store URL once the app is published
    <a href="#" onClick={e => e.preventDefault()} aria-label={bottom} style={{
      display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none",
      padding: "9px 18px", borderRadius: 11, background: "#1d0708",
      border: "1px solid rgba(197,165,126,.4)", cursor: "pointer", transition: "transform .2s ease, border-color .2s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(197,165,126,.7)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(197,165,126,.4)"; }}
    >
      {kind === "apple" ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={C.goldLight} aria-hidden>
          <path d="M16.4 12.9c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .7.9 1.4 2 2.5 1.9 1-.04 1.4-.6 2.6-.6s1.5.6 2.6.6 1.7-.9 2.4-1.8c.7-1 1-2 1-2-.04-.02-1.9-.75-1.9-2.9zM14.6 6.7c.5-.7.9-1.6.8-2.5-.8.03-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.07 1.7-.4 2.3-1.1z"/>
        </svg>
      ) : (
        <svg width="20" height="22" viewBox="0 0 24 24" aria-hidden>
          <path d="M3.6 2.3 13 12 3.6 21.7c-.3-.2-.5-.6-.5-1V3.3c0-.4.2-.8.5-1z" fill="#c5a57e"/>
          <path d="M16.5 8.6 5.2 2.1 14 11z" fill="#E8D4BC"/>
          <path d="M16.5 15.4 14 13l-8.8 8.9z" fill="#a07060"/>
          <path d="M20.3 11.1c.6.4.6 1.4 0 1.8l-2.6 1.5L14.8 12l2.9-2.4z" fill="#d9a14a"/>
        </svg>
      )}
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span style={{ fontFamily: cinzel, fontSize: 7.5, letterSpacing: 1, color: "rgba(232,212,188,.6)", textTransform: "uppercase" }}>{top}</span>
        <span style={{ fontFamily: cinzel, fontSize: 14, fontWeight: 700, color: C.goldLight }}>{bottom}</span>
      </span>
    </a>
  );
}

/* ── Mobile-app section ──────────────────────────────────── */
function MobileSection({ isAR }: { isAR: boolean }) {
  const tabs = [
    { e: "🎮", en: "Games", ar: "ألعاب" },
    { e: "📰", en: "News", ar: "أخبار" },
    { e: "🛡", en: "Community", ar: "المجتمع" },
    { e: "💬", en: "Chat", ar: "محادثة" },
  ];
  const points: [string, string][] = isAR
    ? [["🎮", "ألعاب صغيرة محمولة وحماسية"], ["🔥", "حافظ على سلسلتك اليومية"], ["📰", "أخبار ومجتمع أينما كنت"], ["💬", "تحدّث مع حمد في أي وقت"]]
    : [["🎮", "Arcade-style mini-games on the go"], ["🔥", "Keep your daily learning streak"], ["📰", "News & community in your pocket"], ["💬", "Chat with Hamad anytime"]];

  return (
    <section id="mobile" style={{
      position: "relative", zIndex: 1, background: C.sand, overflow: "hidden",
      borderTop: "1px solid rgba(197,165,126,.22)", padding: "clamp(72px,11vh,128px) 4rem",
    }}>
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", display: "flex", gap: "clamp(40px,6vw,90px)", alignItems: "center", flexWrap: "wrap" }}>
        {/* copy */}
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} style={{ flex: "1 1 380px", maxWidth: 540 }}>
          <motion.div variants={item} style={{ fontFamily: cinzel, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: C.crimson, marginBottom: 18 }}>
            {isAR ? "سايبر مجلس على الجوال" : "CYBERMAJLIS ON MOBILE"}
          </motion.div>
          <motion.h2 variants={item} style={{ fontFamily: cinzel, fontWeight: 900, fontSize: "clamp(1.9rem,3.4vw,3rem)", lineHeight: 1.08, color: C.maroon, margin: 0 }}>
            {isAR ? "مجلسك في جيبك." : "Your majlis, in your pocket."}
          </motion.h2>
          <motion.div variants={item} style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 18px" }}>
            <div style={{ width: 48, height: 1, background: `linear-gradient(90deg,${C.maroonMid},${C.gold})` }} />
            <div style={{ width: 5, height: 5, background: C.gold, transform: "rotate(45deg)" }} />
          </motion.div>
          <motion.p variants={item} style={{ fontFamily: crimson, fontSize: "1.12rem", fontStyle: "italic", lineHeight: 1.6, color: "#5a2428", margin: 0 }}>
            {isAR
              ? "خذ سايبر مجلس معك أينما ذهبت. العب الألعاب الصغيرة، وحافظ على سلسلتك اليومية، واقرأ الأخبار، وتحدّث مع حمد — كل ذلك من هاتفك."
              : "Take CyberMajlis everywhere. Play the mini-games, keep your daily streak alive, read the news, and chat with Hamad — all from your phone."}
          </motion.p>
          <motion.ul variants={item} style={{ listStyle: "none", padding: 0, margin: "22px 0 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 18px" }}>
            {points.map(([e, txt], i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: crimson, fontSize: "0.98rem", color: "#5a2428" }}>
                <span style={{ fontSize: 16 }}>{e}</span>{txt}
              </li>
            ))}
          </motion.ul>
          <motion.div variants={item} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <StoreBadge kind="apple" isAR={isAR} />
            <StoreBadge kind="play" isAR={isAR} />
          </motion.div>
          <motion.div variants={item} style={{ fontFamily: crimson, fontStyle: "italic", fontSize: 13, color: "rgba(99,32,36,.55)", marginTop: 14 }}>
            {isAR ? "متوفر قريبًا على App Store و Google Play." : "Coming soon to the App Store & Google Play."}
          </motion.div>
        </motion.div>

        {/* phone mockup */}
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.94 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: EASE }} style={{ flex: "0 0 auto", marginInline: "auto", position: "relative" }}>
          <div aria-hidden style={{ position: "absolute", inset: -40, borderRadius: 40, background: "radial-gradient(circle, rgba(99,32,36,.12), transparent 68%)", filter: "blur(20px)" }} />
          <div style={{
            position: "relative", width: 248, height: 506, borderRadius: 38, padding: 11,
            background: "linear-gradient(160deg,#3e1316,#1d0708)", border: "1px solid rgba(197,165,126,.3)",
            boxShadow: "0 44px 90px rgba(42,12,14,.5), inset 0 1px 0 rgba(255,255,255,.08)", animation: "cmFloat 6s ease-in-out infinite",
          }}>
            {/* notch */}
            <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 96, height: 20, borderRadius: "0 0 14px 14px", background: "#1d0708", zIndex: 2 }} />
            {/* screen */}
            <div style={{ width: "100%", height: "100%", borderRadius: 28, overflow: "hidden", background: "linear-gradient(180deg,#2c1010,#1d0708)", display: "flex", flexDirection: "column" }}>
              {/* app header */}
              <div style={{ padding: "26px 16px 12px", display: "flex", alignItems: "center", gap: 9 }}>
                <img src="/avatar.png" alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(197,165,126,.5)" }} />
                <div>
                  <div style={{ fontFamily: cinzel, fontSize: 11, fontWeight: 700, color: C.goldLight }}>{isAR ? "أهلاً 👋" : "Welcome 👋"}</div>
                  <div style={{ fontFamily: mono, fontSize: 8, color: "#e0a78f" }}>🔥 {isAR ? "سلسلة ٥ أيام" : "5-day streak"}</div>
                </div>
              </div>
              {/* featured card */}
              <div style={{ margin: "4px 14px", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(197,165,126,.2)" }}>
                <img src="/icons/games.gif" alt="" style={{ width: "100%", height: 92, objectFit: "cover" }} />
                <div style={{ padding: "9px 11px", background: "rgba(255,255,255,.04)" }}>
                  <div style={{ fontFamily: cinzel, fontSize: 10.5, fontWeight: 700, color: C.goldLight }}>{isAR ? "مفتّش البريد" : "Inbox Inspector"}</div>
                  <div style={{ fontFamily: crimson, fontSize: 10, fontStyle: "italic", color: "rgba(197,165,126,.7)" }}>{isAR ? "العب · ٢ دقيقة" : "Play · 2 min"}</div>
                </div>
              </div>
              {/* mini list */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, padding: "10px 14px" }}>
                {[isAR ? "تحدي اليوم" : "Daily challenge", isAR ? "أحدث الأخبار" : "Latest news"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, background: "rgba(255,255,255,.04)", border: "1px solid rgba(197,165,126,.12)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
                    <span style={{ fontFamily: crimson, fontSize: 11, color: "rgba(232,212,188,.8)" }}>{t}</span>
                  </div>
                ))}
              </div>
              {/* bottom tab bar */}
              <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 8px 16px", borderTop: "1px solid rgba(197,165,126,.16)", background: "rgba(0,0,0,.2)" }}>
                {tabs.map((tb, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: i === 0 ? 1 : 0.5 }}>
                    <span style={{ fontSize: 15 }}>{tb.e}</span>
                    <span style={{ fontFamily: cinzel, fontSize: 7, letterSpacing: 0.5, color: i === 0 ? C.gold : "rgba(232,212,188,.5)" }}>{isAR ? tb.ar : tb.en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Side rail ───────────────────────────────────────────── */
function SideRail({ ids, labels, active, isAR }: { ids: string[]; labels: string[]; active: string; isAR: boolean }) {
  return (
    <div className="cm-rail" style={{ insetInlineEnd: 24 }}>
      {ids.map((id, i) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
            aria-label={labels[i]}
            style={{
              position: "relative", width: 12, height: 12, padding: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", cursor: "pointer",
            }}
          >
            {/* dot — fixed-size box keeps every dot perfectly aligned */}
            <span style={{
              width: on ? 10 : 7, height: on ? 10 : 7, borderRadius: "50%",
              background: on ? C.maroonMid : "rgba(99,32,36,.26)",
              boxShadow: on ? "0 0 0 4px rgba(99,32,36,.12)" : "none", transition: "all .3s ease",
            }} />
            {/* label — absolutely positioned so it never pushes the dot */}
            <span className="cm-rail-label" style={{
              position: "absolute", [isAR ? "left" : "right"]: 20, top: "50%",
              transform: "translateY(-50%)", whiteSpace: "nowrap",
              fontFamily: cinzel, fontSize: 9, letterSpacing: 1.5, fontWeight: 700, color: C.maroonMid,
              opacity: on ? 1 : 0, transition: "opacity .25s ease", pointerEvents: "none",
            }}>{labels[i]}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const router = useRouter();
  const isAR = useLocale() === "ar";

  const [isMuted, setIsMuted] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollY = useScrollY();
  const { scrollYProgress } = useScroll();

  const railIds = ["top", ...FEATURES.map(f => f.id), "mobile", "join"];
  const railLabels = [
    isAR ? "البداية" : "Start",
    ...FEATURES.map(f => (isAR ? f.kicker.ar : f.kicker.en)),
    isAR ? "التطبيق" : "Mobile App",
    isAR ? "انضم" : "Join",
  ];
  const active = useActiveSection(railIds);

  // load brand fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (!hasPlayed) {
      setHasPlayed(true); setIsMuted(false);
      videoRef.current.muted = false; videoRef.current.play();
    } else {
      const next = !isMuted; setIsMuted(next); videoRef.current.muted = next;
    }
  };
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const next = !isMuted; setIsMuted(next); videoRef.current.muted = next;
  };

  const onFeatureCTA = (f: Feature) => {
    if (f.id === "chatbot") { window.dispatchEvent(new Event("cm:open-chat")); return; }
    router.push(f.route);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, fontFamily: crimson, color: C.maroon, position: "relative" }}>

      <style>{`
        @keyframes cmBlink     { 0%,100%{opacity:.25} 50%{opacity:1} }
        @keyframes cmPulse     { 0%,100%{box-shadow:0 0 0 0 currentColor;opacity:1} 50%{opacity:.55} }
        @keyframes cmPulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(224,121,106,.4)} 50%{box-shadow:0 0 0 12px rgba(224,121,106,0)} }
        @keyframes cmScroll    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
        @keyframes cmDot       { 0%,100%{box-shadow:0 0 0 0 rgba(139,38,53,.5)} 50%{box-shadow:0 0 0 5px rgba(139,38,53,0)} }
        @keyframes cmFloat     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes cmVidPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.015)} }
        @keyframes cmPlay      { 0%,100%{box-shadow:0 0 0 0 rgba(232,212,188,.35)} 50%{box-shadow:0 0 0 14px rgba(232,212,188,0)} }
        .cm-rail { position: fixed; top: 50%; transform: translateY(-50%); z-index: 40; display:flex; flex-direction:column; gap:16px; }
        .cm-rail button:hover .cm-rail-label { opacity: 1 !important; transform: none !important; }
        @media (max-width: 1180px){ .cm-rail{ display:none } }
        @media (prefers-reduced-motion: reduce){ *,*::before,*::after{ animation-duration:.01ms !important } }
      `}</style>

      {/* scroll progress bar */}
      <motion.div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 60, transformOrigin: isAR ? "100% 0" : "0% 0",
        scaleX: scrollYProgress, background: "linear-gradient(90deg,#632024,#c5a57e)",
      }} />

      <SideRail ids={railIds} labels={railLabels} active={active} isAR={isAR} />

      {/* ambient background */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 700, height: 700, top: -220, insetInlineStart: -200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,32,36,.09), transparent 65%)", filter: "blur(40px)", transform: `translateY(${scrollY * 0.06}px)` }} />
        <div style={{ position: "absolute", width: 500, height: 500, bottom: -200, insetInlineEnd: -200, borderRadius: "50%", background: "radial-gradient(circle, rgba(197,165,126,.14), transparent 65%)", filter: "blur(40px)", transform: `translateY(${scrollY * -0.04}px)` }} />
      </div>

      {/* ════════ HERO ════════ */}
      <section id="top" style={{
        position: "relative", zIndex: 1, minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "calc(76px + 4rem) 4rem 4rem", maxWidth: 1280, margin: "0 auto",
      }}>
        <div style={{ display: "flex", gap: "clamp(40px,5vw,80px)", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>

          {/* copy */}
          <motion.div variants={container} initial="hidden" animate="show" style={{ flex: "1 1 440px", maxWidth: 580 }}>
            <motion.div variants={item} style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99,
              background: "rgba(197,165,126,.18)", border: "1px solid rgba(197,165,126,.4)",
              fontFamily: cinzel, fontWeight: 600, fontSize: 9.5, letterSpacing: 2.5, color: C.maroonMid,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.crimson, animation: "cmDot 2s infinite" }} />
              {isAR ? "أكاديمية قطر للأمن السيبراني" : "QATAR'S CYBERSECURITY ACADEMY"}
            </motion.div>

            <motion.h1 variants={item} style={{
              fontFamily: cinzel, fontWeight: 900, fontSize: "clamp(3rem,5.5vw,4.6rem)",
              lineHeight: 1.02, letterSpacing: "-0.5px", margin: "22px 0 6px",
            }}>
              <span style={{ color: C.maroon }}>Cyber</span><span style={{ color: C.crimson }}> Majlis</span>
            </motion.h1>

            {isAR && (
              <motion.div variants={item} style={{ fontFamily: crimson, fontSize: 24, color: "#a07060", marginBottom: 4 }}>
                المجلس السيبراني
              </motion.div>
            )}

            <motion.div variants={item} style={{ display: "flex", alignItems: "center", gap: 8, margin: "18px 0" }}>
              <div style={{ width: 52, height: 1, background: `linear-gradient(90deg,${C.maroonMid},${C.gold})` }} />
              <div style={{ width: 5, height: 5, background: C.gold, transform: "rotate(45deg)" }} />
              <div style={{ flex: 1, maxWidth: 120, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
            </motion.div>

            <motion.p variants={item} style={{
              fontFamily: crimson, fontSize: "1.25rem", fontStyle: "italic", color: "#5a2428", lineHeight: 1.55, maxWidth: 500,
            }}>
              {isAR
                ? "كل ما تحتاجه لتتعلّم الأمن السيبراني وتعيشه وتدافع به — في مكان واحد. مرّر للأسفل لتكتشف كل ميزة."
                : "Everything you need to learn cybersecurity, live it, and defend with it — in one place. Scroll to meet every feature."}
            </motion.p>

            <motion.div variants={item} style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/auth?signup=true")}
                style={{
                  fontFamily: cinzel, fontSize: 13, fontWeight: 700, letterSpacing: 1.6,
                  padding: "14px 30px", borderRadius: 11, border: "none", cursor: "pointer", color: C.cream,
                  background: "linear-gradient(135deg,#632024,#8B2635 60%,#a03040)",
                  boxShadow: "0 6px 24px rgba(99,32,36,.4)", transition: "all .25s ease",
                  display: "inline-flex", alignItems: "center", gap: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
              >
                {isAR ? "انضم الآن" : "Join now"}
                <ArrowRight size={16} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
              </button>
              <button
                onClick={() => document.getElementById("lessons")?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  fontFamily: cinzel, fontSize: 13, fontWeight: 700, letterSpacing: 1,
                  padding: "14px 28px", borderRadius: 11, cursor: "pointer", color: C.maroonMid,
                  background: "rgba(99,32,36,.06)", border: "1.5px solid rgba(99,32,36,.3)", transition: "all .25s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,32,36,.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,32,36,.06)"; }}
              >
                {isAR ? "اكتشف الميزات" : "Explore features"}
              </button>
            </motion.div>
          </motion.div>

          {/* video card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            style={{ flex: "0 0 auto", position: "relative", animation: "cmFloat 6s ease-in-out infinite" }}
          >
            <div aria-hidden style={{ position: "absolute", inset: -30, borderRadius: 30, background: "radial-gradient(circle, rgba(197,165,126,.35), transparent 65%)", filter: "blur(16px)" }} />
            <div onClick={handleVideoClick} style={{
              position: "relative", width: 300, height: 540, borderRadius: 24, overflow: "hidden",
              border: "2px solid rgba(99,32,36,.35)", background: "#2c1010", cursor: "pointer",
              boxShadow: "0 32px 80px rgba(99,32,36,.25), 0 0 0 1px rgba(197,165,126,.2)",
            }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#3e1316,#1d0708)" }} />
              <video ref={videoRef} src="/hamad.mp4" autoPlay loop muted={isMuted}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", animation: "cmVidPulse 5s ease-in-out infinite" }} />
              {!hasPlayed && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "linear-gradient(180deg,rgba(62,19,22,.15),rgba(62,19,22,.6))" }}>
                  <div style={{ width: 74, height: 74, borderRadius: "50%", border: "1.5px solid rgba(232,212,188,.85)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(62,19,22,.45)", animation: "cmPlay 2.2s infinite" }}>
                    <div style={{ width: 0, height: 0, marginLeft: 5, borderLeft: "16px solid #E8D4BC", borderTop: "10px solid transparent", borderBottom: "10px solid transparent" }} />
                  </div>
                  <div style={{ fontFamily: cinzel, fontSize: 11, letterSpacing: 4, color: C.goldLight, fontWeight: 700 }}>{isAR ? "شاهد المقدمة" : "MEET HAMAD"}</div>
                </div>
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top,rgba(62,19,22,.82),transparent)" }} />
              <div style={{ position: "absolute", bottom: 20, insetInlineStart: 20 }}>
                <div style={{ fontFamily: cinzel, fontSize: 8.5, letterSpacing: "0.15em", color: "rgba(232,212,188,.65)", fontWeight: 600 }}>{isAR ? "دليلك" : "YOUR GUIDE"}</div>
                <div style={{ fontFamily: cinzel, fontSize: 15, letterSpacing: 1.4, color: C.goldLight, fontWeight: 700 }}>HAMAD</div>
              </div>
              {hasPlayed && (
                <button onClick={toggleMute} style={{ position: "absolute", bottom: 12, insetInlineEnd: 12, borderRadius: "50%", padding: 7, cursor: "pointer", background: "rgba(62,19,22,.75)", border: "1px solid rgba(197,165,126,.3)", color: C.goldLight, display: "flex" }}>
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: cinzel, fontSize: 9, letterSpacing: 3, color: "rgba(99,32,36,.5)", fontWeight: 600 }}>{isAR ? "مرّر" : "SCROLL"}</span>
          <ChevronDown size={14} color={C.gold} style={{ animation: "cmScroll 1.6s ease-in-out infinite" }} />
        </motion.div>
      </section>

      {/* ════════ FEATURE SECTIONS ════════ */}
      {FEATURES.map((f, i) => (
        <FeatureSection key={f.id} f={f} index={i} isAR={isAR} onCTA={() => onFeatureCTA(f)} />
      ))}

      {/* ════════ MOBILE APP ════════ */}
      <MobileSection isAR={isAR} />

      {/* ════════ JOIN NOW ════════ */}
      <section id="join" style={{
        position: "relative", zIndex: 1, overflow: "hidden",
        background: "linear-gradient(160deg,#3e1316 0%,#2a0c0e 100%)",
        borderTop: "1px solid rgba(197,165,126,.25)",
        padding: "clamp(96px,16vh,180px) 4rem", textAlign: "center",
      }}>
        <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(197,165,126,.16), transparent 60%)", filter: "blur(60px)" }} />
        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
          style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}
        >
          <motion.div variants={item} style={{ fontFamily: cinzel, fontSize: 10, letterSpacing: 4, color: C.gold, fontWeight: 700, marginBottom: 18 }}>
            {isAR ? "انضم إلى المجلس" : "JOIN THE MAJLIS"}
          </motion.div>
          <motion.h2 variants={item} style={{ fontFamily: cinzel, fontWeight: 900, fontSize: "clamp(2rem,4.5vw,3.4rem)", lineHeight: 1.1, color: C.goldLight, margin: 0 }}>
            {isAR ? "قطر تحتاج جيلها القادم من المدافعين." : "Qatar needs its next generation of defenders."}
          </motion.h2>
          <motion.div variants={item} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "22px auto", maxWidth: 280 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }} />
            <div style={{ width: 5, height: 5, background: C.gold, transform: "rotate(45deg)" }} />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
          </motion.div>
          <motion.p variants={item} style={{ fontFamily: crimson, fontStyle: "italic", fontSize: "1.2rem", color: "rgba(232,212,188,.78)", lineHeight: 1.6, margin: "0 auto 36px", maxWidth: 560 }}>
            {isAR
              ? "ابدأ مجانًا اليوم. تعلّم، العب، حاكِ، وراقب — وكن جزءًا من المجلس الذي يحمي قطر."
              : "Start free today. Learn, play, simulate and watch — and become part of the majlis that keeps Qatar safe."}
          </motion.p>
          <motion.div variants={item} style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/auth?signup=true")}
              style={{ fontFamily: cinzel, fontSize: 14, fontWeight: 700, letterSpacing: 1.6, padding: "16px 38px", borderRadius: 12, border: "none", cursor: "pointer", color: C.maroon, background: "linear-gradient(135deg,#E8D4BC,#c5a57e)", boxShadow: "0 10px 30px rgba(197,165,126,.35)", transition: "all .25s ease", display: "inline-flex", alignItems: "center", gap: 10 }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
            >
              {isAR ? "أنشئ حسابك" : "Create your account"}
              <ArrowRight size={17} style={{ transform: isAR ? "scaleX(-1)" : "none" }} />
            </button>
            <button
              onClick={() => router.push("/auth")}
              style={{ fontFamily: cinzel, fontSize: 14, fontWeight: 700, letterSpacing: 1, padding: "16px 34px", borderRadius: 12, cursor: "pointer", color: C.goldLight, background: "rgba(197,165,126,.08)", border: "1.5px solid rgba(197,165,126,.4)", transition: "all .25s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(197,165,126,.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(197,165,126,.08)"; }}
            >
              {isAR ? "لديّ حساب" : "I have an account"}
            </button>
          </motion.div>
        </motion.div>
      </section>

      <Footer />

      {/* back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        style={{
          position: "fixed", bottom: 36, insetInlineStart: 36, zIndex: 9999, width: 46, height: 46, borderRadius: "50%",
          border: "1px solid rgba(197,165,126,.55)", background: "linear-gradient(135deg,#3e1316,#7a1e22)", color: C.goldLight,
          fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          boxShadow: "0 6px 24px rgba(62,19,22,.5)", transition: "opacity .3s ease, transform .2s ease",
          opacity: scrollY > 400 ? 1 : 0, pointerEvents: scrollY > 400 ? "auto" : "none",
          transform: scrollY > 400 ? "translateY(0)" : "translateY(12px)",
        }}
      >
        ↑
      </button>
    </div>
  );
}
