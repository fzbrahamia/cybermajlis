"use client";

/* Majlis settings.

   CyberMajlis keeps its own at /settings. This one belongs to Majlis and only
   holds things that actually do something: no toggle here is decoration. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, Volume2, Sparkles, NotebookPen, Trash2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { RoomHead, Stagger, Rise, Says } from "@/components/innovation/Alive";
import PolicyDialog from "@/components/PolicyDialog";
import { CASES } from "@/app/lib/domainData";
import { M, sans, mono, HUES, R, card, flat, btn, ghost, quiet, label } from "@/components/innovation/theme";

const H = HUES.blue;
const PREFS_KEY = "mj-prefs";

type Prefs = { motion?: boolean; voice?: boolean };

function Row({
  icon, title, note, children,
}: { icon: React.ReactNode; title: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ ...card, padding: "20px 22px" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <span style={{
          width: 42, height: 42, borderRadius: 14, flex: "none",
          background: H.tint, color: H.deep, display: "grid", placeItems: "center",
        }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 190 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: M.heading, fontFamily: sans, marginBottom: note ? 5 : 0 }}>
            {title}
          </div>
          {note && (
            <div style={{ fontSize: 13.5, lineHeight: 1.6, color: M.body, fontFamily: sans, maxWidth: "44ch" }}>
              {note}
            </div>
          )}
        </div>
        <div style={{ flex: "none" }}>{children}</div>
      </div>
    </div>
  );
}

function Switch({ on, onChange, labelOn, labelOff }: {
  on: boolean; onChange: (v: boolean) => void; labelOn: string; labelOff: string;
}) {
  return (
    <button onClick={() => onChange(!on)} style={{
      minHeight: 44, padding: "0 18px", borderRadius: R.pill, cursor: "pointer",
      fontFamily: sans, fontSize: 14, fontWeight: 800,
      background: on ? H.deep : "transparent",
      color: on ? "#FFFDF8" : M.body,
      border: `2px solid ${on ? H.deep : "rgba(42,35,28,.16)"}`,
      transition: "background .18s, color .18s, border-color .18s",
    }}>
      {on ? labelOn : labelOff}
    </button>
  );
}

export default function SettingsPage() {
  const isAR = useLocale() === "ar";
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>({ motion: true, voice: true });
  const [notes, setNotes] = useState(0);
  const [work, setWork] = useState(0);
  const [cleared, setCleared] = useState("");

  useEffect(() => {
    try {
      setPrefs({ motion: true, voice: true, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") });
      setNotes(JSON.parse(localStorage.getItem("mj-notes") ?? "[]").length);
      setWork(CASES.filter(c => localStorage.getItem(`mj-case-${c.id}`)).length);
    } catch { /* private mode */ }
  }, []);

  const save = (next: Prefs) => {
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      // motion is applied by a class on the document, so every page obeys it
      document.documentElement.classList.toggle("mj-still", next.motion === false);
    } catch { /* private mode */ }
  };

  const switchLocale = () => {
    document.cookie = `locale=${isAR ? "en" : "ar"}; path=/; max-age=31536000`;
    router.refresh();
  };

  const clearNotes = () => {
    try { localStorage.removeItem("mj-notes"); } catch { /* */ }
    setNotes(0); setCleared("notes");
  };

  const clearWork = () => {
    try {
      for (const c of CASES) localStorage.removeItem(`mj-case-${c.id}`);
      localStorage.removeItem("mj-mine");
    } catch { /* */ }
    setWork(0); setCleared("work");
  };

  return (
    <InnovationPage>
      <Link href="/account" style={{
        display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16,
        fontFamily: mono, fontSize: 11, letterSpacing: "0.1em",
        textTransform: "uppercase", color: H.deep, textDecoration: "none",
      }}>
        {isAR ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
        {isAR ? "حسابك" : "Your account"}
      </Link>

      <RoomHead hue={H} eyebrow={isAR ? "الإعدادات" : "Settings"}
        title={isAR ? "كيف يتصرف المجلس معك" : "How Majlis behaves for you"} />

      <Stagger gap={0.07}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
          <Rise>
            <Row icon={<Globe size={20} />}
              title={isAR ? "اللغة" : "Language"}
              note={isAR ? "يتغير كل شيء، بما في ذلك اتجاه الصفحة." : "Everything changes, including which way the page runs."}>
              <button onClick={switchLocale} style={ghost(H)}>
                {isAR ? "English" : "العربية"}
              </button>
            </Row>
          </Rise>

          <Rise>
            <Row icon={<Sparkles size={20} />}
              title={isAR ? "الحركة" : "Movement"}
              note={isAR
                ? "أوقفها إن كانت الحركة تشتتك. كل شيء يبقى كما هو، لكنه يتوقف عن التحرك."
                : "Turn it off if movement distracts you. Everything stays, it just stops moving."}>
              <Switch on={prefs.motion !== false} onChange={v => save({ ...prefs, motion: v })}
                labelOn={isAR ? "تعمل" : "On"} labelOff={isAR ? "متوقفة" : "Off"} />
            </Row>
          </Rise>

          <Rise>
            <Row icon={<Volume2 size={20} />}
              title={isAR ? "صوت رودة" : "Rouda's voice"}
              note={isAR
                ? "تتكلم رودة بصوت عال حين تسأل. الكلام مكتوب دائماً أيضاً."
                : "Rouda speaks her questions out loud. They are always written as well."}>
              <Switch on={prefs.voice !== false} onChange={v => save({ ...prefs, voice: v })}
                labelOn={isAR ? "يعمل" : "On"} labelOff={isAR ? "صامت" : "Muted"} />
            </Row>
          </Rise>

          <Rise>
            <Row icon={<NotebookPen size={20} />}
              title={isAR ? "دفترك" : "Your notes"}
              note={isAR ? `${notes} ملاحظة على هذا الجهاز.` : `${notes} on this device.`}>
              <button onClick={clearNotes} disabled={notes === 0}
                style={{ ...ghost(H), opacity: notes === 0 ? 0.4 : 1 }}>
                {cleared === "notes" ? <Check size={17} /> : <Trash2 size={17} />}
                {isAR ? "امسحها" : "Clear"}
              </button>
            </Row>
          </Rise>

          <Rise>
            <Row icon={<Trash2 size={20} />}
              title={isAR ? "عملك على هذا الجهاز" : "Your work on this device"}
              note={isAR
                ? `${work} قضية محفوظة هنا. المسح لا يحذف حسابك.`
                : `${work} case saved here. Clearing this does not delete your account.`}>
              <button onClick={clearWork} disabled={work === 0}
                style={{ ...ghost(H), opacity: work === 0 ? 0.4 : 1, color: "#7A1E22", borderColor: "rgba(122,30,34,.3)" }}>
                {cleared === "work" ? <Check size={17} /> : <Trash2 size={17} />}
                {isAR ? "امسحه" : "Clear"}
              </button>
            </Row>
          </Rise>

          <Rise>
            <div style={{ ...flat, padding: "20px 22px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 190 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: M.heading, fontFamily: sans, marginBottom: 5 }}>
                  {isAR ? "ما نحفظه عنك" : "What we keep about you"}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: M.body, fontFamily: sans, maxWidth: "44ch" }}>
                  {isAR ? "سياسة واحدة للمجالس الثلاثة." : "One policy for all three majalis."}
                </div>
              </div>
              <span style={{ ...quiet, cursor: "pointer" }}>
                <PolicyDialog accent={H.deep} label={isAR ? "اقرأها" : "Read it"} />
              </span>
            </div>
          </Rise>
        </div>
      </Stagger>

      <div style={{ marginTop: 28 }}>
        <Says who="hamad" hue={H}>
          {isAR
            ? "ملاحظاتك وعملك محفوظان على هذا الجهاز وحده."
            : "Your notes and your work are kept on this device only."}
        </Says>
      </div>
    </InnovationPage>
  );
}
