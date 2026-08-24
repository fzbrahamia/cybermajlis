"use client";

/* News.

   Not a feed. Every story is taken apart the same way an approach is: what
   everyone assumed, where the assumption broke, and one question before you
   move on. CyberMajlis has its own /news for threats near you; this one is
   about where the world is, across domains, so it has its own route. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronRight, Clock } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import { Stagger, Rise, Lift, RoomHead, Says } from "@/components/innovation/Alive";
import { DOMAINS } from "@/app/lib/domainData";
import { M, sans, HUES, R, card, flat, chip, quiet, label } from "@/components/innovation/theme";

const H = HUES.green;

/* Two kinds of story, because news is not only things going wrong.
   
   An INCIDENT gets: what everyone assumed, and where the assumption broke.
   An ARRIVAL gets: what problem it solves, and what it costs to solve it.
   
   Both shapes end in one question, because a story nobody has to think about
   is just a headline.
   
   Written by hand for now. When a feed arrives it fills this same array. */
type Kind = "incident" | "arrival";

const PANELS: Record<Kind, { a_en: string; a_ar: string; b_en: string; b_ar: string }> = {
  incident: {
    a_en: "What everyone assumed", a_ar: "ما كان الجميع يفترضه",
    b_en: "Where it broke",        b_ar: "أين انكسر",
  },
  arrival: {
    a_en: "The problem it solves", a_ar: "المشكلة التي يحلها",
    b_en: "What it costs",         b_ar: "وماذا يكلف",
  },
};

const STORIES: {
  id: string; domain: string; kind: Kind;
  when_en: string; when_ar: string;
  head_en: string; head_ar: string;
  lede_en: string; lede_ar: string;
  a_en: string; a_ar: string;
  b_en: string; b_ar: string;
  ask_en: string; ask_ar: string;
  read: number; caseHref?: string;
}[] = [
  {
    id: "hospitals-2017",
    domain: "cybersecurity", kind: "incident",
    when_en: "2017", when_ar: "٢٠١٧",
    head_en: "Hospitals had to turn patients away. Everyone had a firewall.",
    head_ar: "اضطرت مستشفيات إلى رد المرضى. وكان لدى الجميع جدار حماية.",
    lede_en: "Nineteen thousand appointments did not happen. A repair for the exact hole had existed for two months.",
    lede_ar: "تسعة عشر ألف موعد لم تتم. وكان إصلاح الثغرة نفسها موجوداً منذ شهرين.",
    a_en: "Danger comes from outside, so a strong wall at the edge keeps it out.",
    a_ar: "الخطر يأتي من الخارج، فجدار قوي عند الحافة يمنعه.",
    b_en: "The guard on the door does not watch what happens between rooms.",
    b_ar: "حارس الباب لا يراقب ما يحدث بين الغرف.",
    ask_en: "A repair existed and was not installed. Name one reason a hospital could not install it.",
    ask_ar: "كان الإصلاح موجوداً ولم يُثبَّت. اذكر سبباً واحداً يمنع مستشفى من تثبيته.",
    read: 4,
    caseHref: "/learn/cybersecurity/case/ransomware-hospitals",
  },
  {
    id: "qubits-steady",
    domain: "quantum", kind: "arrival",
    when_en: "This month", when_ar: "هذا الشهر",
    head_en: "A machine held its qubits steady for longer than the last one",
    head_ar: "آلة أبقت كيوبتّاتها ثابتة أطول من سابقتها",
    lede_en: "Headlines called it a breakthrough. The number that moved was small, and it is still real.",
    lede_ar: "سمّته العناوين اختراقاً. والرقم الذي تحرك كان صغيراً، وهو حقيقي رغم ذلك.",
    a_en: "A qubit forgets almost immediately. Holding it steady for longer means the machine can finish a longer sum before the answer falls apart.",
    a_ar: "الكيوبت ينسى فوراً تقريباً. وإبقاؤه ثابتاً أطول يعني أن الآلة تنهي عملية أطول قبل أن تتفكك الإجابة.",
    b_en: "Cold, and a lot of it. These machines run close to the coldest anything gets, and every extra second of steadiness is bought with power and space.",
    b_ar: "برودة، وكثير منها. تعمل هذه الآلات قرب أبرد ما يمكن، وكل ثانية ثبات إضافية تُشترى بالطاقة والمساحة.",
    ask_en: "Why would a headline round this number up, and who does that help?",
    ask_ar: "لماذا يبالغ عنوان في هذا الرقم، ومن يستفيد من ذلك؟",
    read: 3,
  },
];

export default function LatestPage() {
  const isAR = useLocale() === "ar";
  const router = useRouter();

  /* Reading is only worth anything if something can come out of it. A story
     that gives you an idea becomes a problem on your own desk, with the same
     path every other problem goes through. */
  const take = (id: string, head: string) => {
    const key = `news-${id}`;
    try {
      const mine = JSON.parse(localStorage.getItem("mj-mine") ?? "{}");
      if (!(mine.posted ?? []).some((p: { id: string }) => p.id === key)) {
        mine.posted = [{ id: key, what: head, who: "", at: Date.now() }, ...(mine.posted ?? [])];
        localStorage.setItem("mj-mine", JSON.stringify(mine));
      }
    } catch { /* private mode */ }
    router.push(`/mine/problem/${key}`);
  };
  const tone = (d: string) => DOMAINS.find(x => x.id === d);

  return (
    <InnovationPage>
      <RoomHead hue={H}
        eyebrow={isAR ? "الأخبار" : "News"}
        title={isAR ? "ما تغيّر هذا الشهر" : "What changed this month"}
        sub={isAR
          ? "اقرأ لتعرف ما الذي تغيّر. وإن أعطاك خبر فكرة، خذها إلى شغلك."
          : "Read to find out what changed. If a story gives you an idea, take it to your work."} />

      <Stagger gap={0.08}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 30 }}>
          {STORIES.map(s => {
            const d = tone(s.domain);
            return (
              <Lift key={s.id} hue={H} style={{ ...card, padding: 0, overflow: "hidden" }}>
                <div style={{ height: 6, background: d?.tone ?? H.mid }} />
                <div style={{ padding: "24px 26px 26px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 13 }}>
                    <span style={{ ...quiet, color: d?.tone, background: `${d?.tone}14` }}>
                      {isAR ? d?.name_ar : d?.name_en}
                    </span>
                    <span style={quiet}>{isAR ? s.when_ar : s.when_en}</span>
                    <span style={s.kind === "arrival" ? chip(HUES.green) : quiet}>
                      {s.kind === "arrival"
                        ? (isAR ? "شيء جديد" : "Something new")
                        : (isAR ? "شيء ساء" : "Something went wrong")}
                    </span>
                    <span style={{ ...quiet, gap: 6 }}>
                      <Clock size={12} />{s.read} {isAR ? "دقائق" : "min"}
                    </span>
                  </div>

                  <div style={{
                    fontSize: "clamp(18px,2.6vw,22px)", fontWeight: 900, color: M.heading,
                    lineHeight: 1.34, letterSpacing: "-0.015em", marginBottom: 9, maxWidth: "28ch", fontFamily: sans,
                  }}>
                    {isAR ? s.head_ar : s.head_en}
                  </div>
                  <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.65, color: M.body, maxWidth: "46ch", fontFamily: sans }}>
                    {isAR ? s.lede_ar : s.lede_en}
                  </p>

                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,17rem),1fr))", gap: 12,
                  }}>
                    <div style={{ padding: "16px 18px", borderRadius: R.chip, background: M.page }}>
                      <div style={{ ...label, fontSize: 9.5, marginBottom: 7 }}>
                        {isAR ? PANELS[s.kind].a_ar : PANELS[s.kind].a_en}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.6, color: M.heading, fontFamily: sans }}>
                        {isAR ? s.a_ar : s.a_en}
                      </div>
                    </div>
                    <div style={{ padding: "16px 18px", borderRadius: R.chip, background: HUES.gold.tint }}>
                      <div style={{ ...label, fontSize: 9.5, marginBottom: 7, color: HUES.gold.deep }}>
                        {isAR ? PANELS[s.kind].b_ar : PANELS[s.kind].b_en}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.6, color: M.heading, fontFamily: sans }}>
                        {isAR ? s.b_ar : s.b_en}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Says who="rouda" hue={H}>{isAR ? s.ask_ar : s.ask_en}</Says>
                  </div>

                  <button
                    onClick={() => take(s.id, isAR ? s.head_ar : s.head_en)}
                    style={{ ...chip(H), marginTop: 16, cursor: "pointer", border: "none", font: "inherit", fontFamily: sans }}>
                    {isAR ? "خذها إلى شغلي" : "Take it to my work"}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </Lift>
            );
          })}
        </div>

        <Rise>
          <div style={{ ...flat, padding: "20px 24px", marginTop: 20, fontSize: 14, lineHeight: 1.65, color: M.body, fontFamily: sans }}>
            {isAR
              ? "تُكتب الأخبار هنا يدوياً حتى الآن. حين تصل التغذية، ستملأ القائمة نفسها."
              : "Stories here are written by hand for now. When a feed arrives it fills this same list."}
          </div>
        </Rise>
      </Stagger>
    </InnovationPage>
  );
}
