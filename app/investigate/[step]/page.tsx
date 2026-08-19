"use client";

// One page per step of a real investigation. The steps are data
// (app/lib/innovationData.ts), so adding one is a row rather than a route.
//
// The seeded run is Maryam's, and it includes the week her build failed,
// because that week is the argument for the whole method.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight, RotateCcw, Play, Mic } from "lucide-react";
import { InnovationPage } from "@/components/innovation/InnovationChrome";
import Spine from "@/components/innovation/Spine";
import {
  STEPS, LOG, GATE_ONE, GATE_TWO, stepById, stepIndex, verbById,
  type Question, type VerbId,
} from "@/app/lib/innovationData";
import { M, mono, label, card, flat, button, ghostButton, pill, quietPill, ROUDA } from "@/components/innovation/theme";

const NOTES_KEY = "mj-presenter-notes";

/* ── shared pieces ─────────────────────────────────────── */

function Hers({ who, children }: { who: string; children: React.ReactNode }) {
  return (
    <div style={{ background: M.goldSoft, border: `1px solid ${M.gold}`, borderRadius: 16, padding: "18px 20px" }}>
      <span style={{ ...label, display: "block", marginBottom: 8, color: M.action }}>{who}</span>
      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: M.heading, fontWeight: 600 }}>{children}</p>
    </div>
  );
}

function Speaker({ who, name, children }: { who: "rouda" | "hamad"; name: string; children: React.ReactNode }) {
  const r = who === "rouda";
  return (
    <div style={{ ...flat, padding: "15px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{
        width: 30, height: 30, borderRadius: "50%", flex: "none",
        display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: "#fff",
        background: r ? ROUDA.mid : M.action,
      }}>
        {r ? "R" : "H"}
      </span>
      <div>
        <div style={{ ...label, fontSize: 10, marginBottom: 5, color: r ? ROUDA.deep : M.action }}>{name}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: M.heading }}>{children}</div>
      </div>
    </div>
  );
}

function Gate({ questions, isAR }: { questions: Question[]; isAR: boolean }) {
  return (
    <>
      <div style={{
        background: ROUDA.tint, border: `1px solid ${ROUDA.line}`,
        borderRadius: 18, padding: "20px 22px",
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{
            width: 30, height: 30, borderRadius: "50%", background: ROUDA.mid,
            display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: "#fff",
          }}>R</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: ROUDA.deep }}>
            {isAR ? "رودة" : "Rouda"}
          </span>
          <span style={{ ...quietPill, marginInlineStart: "auto", gap: 6 }}>
            <Mic size={11} />
            {isAR ? "إجابات منطوقة" : "Spoken answers"}
          </span>
        </div>

        {questions.map((q, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", gap: 6,
            padding: "14px 0",
            borderTop: i === 0 ? "none" : `1px solid rgba(27,107,76,.14)`,
          }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: M.heading, lineHeight: 1.5 }}>
              {i + 1}. {isAR ? q.q_ar : q.q_en}
            </div>
            <div style={{
              fontSize: 13.5, lineHeight: 1.6, color: M.body,
              paddingInlineStart: 13, borderInlineStart: `2px solid rgba(46,156,110,.35)`,
            }}>
              {isAR ? q.a_ar : q.a_en}
            </div>

            {q.reask_en && (
              <>
                <div style={{
                  marginTop: 8, padding: "11px 14px", background: "rgba(255,255,255,.7)",
                  borderRadius: 11, fontSize: 13, lineHeight: 1.55, color: M.heading,
                }}>
                  <b style={{ color: ROUDA.deep }}>{isAR ? "تسأل رودة مرة أخرى: " : "Rouda asks again: "}</b>
                  {isAR ? q.reask_ar : q.reask_en}
                </div>
                <div style={{
                  marginTop: 8, fontSize: 13.5, lineHeight: 1.6, color: M.heading, fontWeight: 700,
                  paddingInlineStart: 13, borderInlineStart: `2px solid rgba(46,156,110,.35)`,
                }}>
                  {isAR ? q.again_ar : q.again_en}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <span style={button}>{isAR ? "المرحلة التالية" : "Next phase"}</span>
        <span style={ghostButton}>{isAR ? "اسأليني سؤالاً آخر" : "Ask me one more question"}</span>
      </div>
    </>
  );
}

/* ── the step bodies ───────────────────────────────────── */

function Body({ id, isAR }: { id: string; isAR: boolean }) {
  const cols = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", gap: 14 } as const;

  switch (id) {
    case "log":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {LOG.map((row, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "28px minmax(0,1.3fr) minmax(0,.7fr) minmax(0,.6fr) minmax(0,1.2fr)",
              gap: 12, alignItems: "start", padding: "13px 15px",
              background: M.card, borderRadius: 13,
              border: row.flagged ? `2px dashed ${M.goldDeep}` : `1px solid rgba(42,35,28,.08)`,
            }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: M.goldDeep }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: M.heading }}>
                {isAR ? row.what_ar : row.what_en}
              </span>
              <span style={{ fontSize: 12.5 }}>{isAR ? row.who_ar : row.who_en}</span>
              <span style={{ fontSize: 12.5 }}>{isAR ? row.often_ar : row.often_en}</span>
              <span style={{
                fontSize: 12.5, lineHeight: 1.5,
                color: row.instead_en ? M.heading : M.body,
                fontWeight: row.instead_en ? 600 : 400,
                fontStyle: row.instead_en ? "normal" : "italic",
              }}>
                {row.instead_en
                  ? (isAR ? row.instead_ar : row.instead_en)
                  : (isAR ? "تُرك فارغاً" : "Left empty")}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 7 }}>
            <Speaker who="rouda" name={isAR ? "رودة" : "Rouda"}>
              {isAR
                ? "المدخل الرابع لا شيء في عموده الأخير. إن لم يلتف أحد حول المشكلة، فهل هي تزعجهم فعلاً؟"
                : "Entry four has nothing in the last column. If nobody has worked around it, are they actually bothered by it?"}
            </Speaker>
          </div>
        </div>
      );

    case "gate-one":
      return <Gate questions={GATE_ONE} isAR={isAR} />;

    case "gate-two":
      return <Gate questions={GATE_TWO} isAR={isAR} />;

    case "interview":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...flat, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{
              width: 42, height: 42, borderRadius: "50%", background: M.goldSoft,
              display: "grid", placeItems: "center", color: M.action, fontSize: 15, fontWeight: 800, flex: "none",
            }}>
              {isAR ? "أم" : "UK"}
            </span>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: M.heading }}>
                {isAR ? "جدتي، أم خالد" : "My grandmother, Umm Khalid"}
              </div>
              <div style={{ fontSize: 12.5 }}>
                {isAR ? "أربعة أقراص يومياً. الجمعة بعد الغداء، عشرون دقيقة." : "Four tablets a day. Friday after lunch, 20 minutes."}
              </div>
            </div>
            <span style={pill}>{isAR ? "مسجلة" : "Recorded"}</span>
          </div>

          <div style={{ ...flat, padding: "16px 20px" }}>
            <div style={{ ...label, fontSize: 10, marginBottom: 6 }}>
              {isAR ? "السؤال ٢: ماذا تفعلين حيالها الآن؟" : "Question 2: what do you do about it now?"}
            </div>
            <div style={{
              fontSize: 14, lineHeight: 1.6, color: M.heading,
              paddingInlineStart: 13, borderInlineStart: `2px solid ${M.gold}`,
            }}>
              {isAR
                ? "تخدش غطاء إحدى العلبتين بسكين لتميزها باللمس دون نظارتها. تفعل هذا منذ سنوات ولم تخبر أحداً."
                : "She scratches the lid of one box with a knife so she can feel which is which without her glasses. She has done this for years and never told anyone."}
            </div>
          </div>

          <div style={{ ...flat, padding: "16px 20px" }}>
            <div style={{ ...label, fontSize: 10, marginBottom: 6 }}>
              {isAR ? "السؤال ٣: ما الذي لن تتخلي عنه أبداً؟" : "Question 3: what would you never give up?"}
            </div>
            <div style={{
              fontSize: 14, lineHeight: 1.6, color: M.heading,
              paddingInlineStart: 13, borderInlineStart: `2px solid ${M.gold}`,
            }}>
              {isAR
                ? "لا تريد شيئاً يصدر صوتاً. قالت إن ذلك سيشعرها بأنها مراقبة في بيتها."
                : "She does not want anything that beeps. She said it would make her feel like she is being watched in her own house."}
            </div>
          </div>

          <Hers who={isAR ? "ما الذي أخطأت فيه" : "What I got wrong"}>
            {isAR
              ? "ظننت أنها لا تستطيع قراءة الملصقات. هي تقرؤها جيداً. المشكلة أنها تأخذ الدواء في الخامسة فجراً في الظلام قبل الصلاة ولا تشعل الضوء."
              : "I thought she could not read the labels. She reads them fine. The problem is she takes them at 5am in the dark before prayer and does not turn the light on."}
          </Hers>

          <Speaker who="hamad" name={isAR ? "حمد" : "Hamad"}>
            {isAR
              ? "هذا السطر الأخير أنفع ما في الصفحة كلها، فاحتفظي به. وسؤال واحد ينساه الناس دائماً: اسأليها من غيرها في البيت يعرف بأمر الخدش. إن لم يعرف أحد، فذلك يخبرك بشيء عمن يجب أن يعمل الحل من أجله."
              : "That last line is the most useful thing on this whole page, so keep it. One more question people always forget: ask her who else in the house knows about the scratch. If nobody does, that tells you something about who a solution has to work for."}
          </Speaker>
        </div>
      );

    case "name":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Hers who={isAR ? "صياغتها للفجوة، النسخة الثانية" : "Her gap statement, version two"}>
            {isAR
              ? "تحتاج جدتي أن تميز علبتين متطابقتين في الخامسة فجراً، في الظلام، دون أن تشعل ضوءاً لأن جدي نائم، ودون أي شيء يصدر صوتاً."
              : "My grandmother needs to tell two identical boxes apart at 5am, in the dark, without turning on a light because my grandfather is asleep, and without anything that makes a sound."}
          </Hers>

          <div style={cols}>
            <div style={{ ...flat, padding: "18px 20px" }}>
              <div style={{ ...label, fontSize: 10, marginBottom: 10 }}>
                {isAR ? "هل هي حقيقية؟ تجيب بنفسها" : "Is it real? She answers herself"}
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                {(isAR
                  ? ["من غيرها لديه هذا؟ كل مسن يأخذ أكثر من قرص.",
                     "ماذا يفعلون اليوم؟ يخدشون، أو يخمنون، أو يسألون أحداً.",
                     "كم مرة؟ كل صباح.",
                     "هل يمكن أن يثبت خطئي خلال أسبوع؟ نعم، إن توقفت عن استعماله."]
                  : ["Who else has this? Every older person taking more than one tablet.",
                     "What do they do today? Scratch, or guess, or ask someone.",
                     "How often? Every single morning.",
                     "Could I be proved wrong in a week? Yes, if she stops using it."]
                ).map((t, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.55, color: M.heading }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: M.action, marginTop: 8, flex: "none" }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ ...flat, padding: "18px 20px", background: M.goldSoft, borderColor: M.gold }}>
              <div style={{ ...label, fontSize: 10, marginBottom: 10, color: M.action }}>
                {isAR ? "سبقها أحدهم" : "Someone got there first"}
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.6, color: M.heading }}>
                {isAR
                  ? "علب تنظيم الأدوية تُباع في كل صيدلية في الدوحة. ظنت مريم أن مشروعها انتهى."
                  : "Pill organiser boxes are sold in every pharmacy in Doha. Maryam thought this ended her project."}
              </p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
                {isAR
                  ? "بل العكس. هذا يثبت أن الكبار بنوا عملاً على هذه المشكلة، فهي حقيقية. ثم إن علبة التنظيم يجب أن يملأها يوم السبت شخص يرى جيداً، وهذا ينقل المشكلة ولا يزيلها."
                  : "It does the opposite. It proves adults built a business on this problem, so it is real. And an organiser still has to be filled correctly on Saturday by someone who can see, which moves the problem rather than removing it."}
              </p>
            </div>
          </div>
        </div>
      );

    case "make":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={cols}>
            {[
              { t_en: "A card with very large print", t_ar: "بطاقة بخط كبير جداً",
                d_en: "Paper, one afternoon. Tape it to the front of one box.", d_ar: "ورقة، وبعد ظهر واحد. تُلصق على وجه إحدى العلبتين.", picked: true },
              { t_en: "A sticker with a different texture", t_ar: "ملصق بملمس مختلف",
                d_en: "Something rough on one lid so it feels different.", d_ar: "شيء خشن على أحد الغطاءين ليختلف ملمسه." },
              { t_en: "Move one box to another drawer", t_ar: "نقل إحدى العلبتين إلى درج آخر",
                d_en: "No object at all. Change where they live.", d_ar: "بلا أي شيء مصنوع. غيّر مكانهما فقط." },
            ].map((o, i) => (
              <div key={i} style={{
                ...card, padding: "20px 22px",
                border: o.picked ? `2px solid ${M.action}` : `1px solid rgba(42,35,28,.08)`,
              }}>
                {o.picked && (
                  <span style={{ ...pill, background: M.action, color: M.cream, marginBottom: 10 }}>
                    {isAR ? "المختار" : "Picked"}
                  </span>
                )}
                <div style={{ fontSize: 16, fontWeight: 800, color: M.heading, marginBottom: 6 }}>
                  {isAR ? o.t_ar : o.t_en}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.55 }}>{isAR ? o.d_ar : o.d_en}</div>
              </div>
            ))}
          </div>
          <Speaker who="hamad" name={isAR ? "حمد، حين سألته" : "Hamad, when she asked"}>
            {isAR
              ? "أي من الثلاثة يصلح للبداية. الهدف من أولها ليس أن يكون صحيحاً، بل أن يكشف لك شيئاً ما كنت لتعرفه بالتفكير وحده."
              : "Any of the three is fine to start with. The point of the first one is not to be right, it is to find out something you could not find out by thinking."}
          </Speaker>
        </div>
      );

    case "try":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{
            border: `2px solid ${M.goldDeep}`, borderRadius: 20,
            padding: "24px 26px", background: M.card,
          }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: M.heading, lineHeight: 1.4, marginBottom: 12 }}>
              {isAR
                ? "كانت البطاقة عديمة الفائدة. خط كبير، في الظلام."
                : "The card was useless. It was large print, in the dark."}
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 14.5, lineHeight: 1.7 }}>
              {isAR
                ? "استعملتها جدتها مرة واحدة، مجاملةً، في الصباح الأول. ثم عادت إلى تحسس خدش السكين."
                : "Her grandmother used it once, politely, on the first morning. Then she went back to feeling for the knife scratch."}
            </p>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: M.heading, fontWeight: 600 }}>
              {isAR
                ? "صنعت مريم حلاً للمشكلة التي كتبتها في الأسبوع الأول، لا التي كتبتها في الأسبوع الثالث."
                : "Maryam built a solution to the problem she wrote down in week one, not the one she wrote down in week three."}
            </p>

            <div style={{
              display: "flex", alignItems: "center", gap: 14, marginTop: 16,
              padding: "15px 18px", background: M.goldSoft, borderRadius: 14,
            }}>
              <RotateCcw size={26} color={M.action} strokeWidth={2} style={{ flex: "none" }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: M.heading, marginBottom: 3 }}>
                  {isAR ? "ارجع إلى الصنع. لا إلى البداية." : "Back to Make. Not back to the beginning."}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                  {isAR
                    ? "صياغتك للفجوة ما زالت قائمة. الحل وحده كان خاطئاً. لم يضع شيء مما فعلتِه حتى الآن."
                    : "Your gap statement still stands. Only the answer was wrong. Nothing you have done so far is lost."}
                </div>
              </div>
            </div>
          </div>
          <div style={{ ...flat, padding: "16px 20px", fontSize: 13.5, lineHeight: 1.6 }}>
            {isAR
              ? "في أي مسابقة، هذا الأسبوع هو موعد التسليم، وهذه الشاشة خسارة."
              : "In a competition, this week is the submission deadline and this screen is a loss."}
          </div>
        </div>
      );

    case "remake":
      return (
        <div style={cols}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <div style={{ ...label, fontSize: 10, marginBottom: 12 }}>
              {isAR ? "مقابل جملتها هي" : "Checked against her own sentence"}
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
              {(isAR
                ? ["الخامسة فجراً: لا شيء يُشغَّل أو يُشحن",
                   "في الظلام: يُعد بالأصابع",
                   "بلا ضوء: لا شيء يُرى",
                   "بلا صوت: إنه رباط مطاطي",
                   "لا شيء يُملأ خطأً: بخلاف علبة التنظيم"]
                : ["At 5am: nothing to switch on or charge",
                   "In the dark: counted by finger",
                   "No light: nothing to see",
                   "No sound: it is a rubber band",
                   "Nothing to fill in wrong: unlike an organiser"]
              ).map((t, i) => (
                <li key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.55, color: M.heading }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: M.action, marginTop: 8, flex: "none" }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ ...flat, padding: "20px 22px" }}>
            <p style={{ margin: "0 0 10px", fontSize: 14.5, lineHeight: 1.65, color: M.heading }}>
              {isAR
                ? "ليس مبهراً. ليس تقنية. ولن يفوز بمعرض علوم."
                : "It is not impressive. It is not technology. It would not win a science fair."}
            </p>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65 }}>
              {isAR
                ? "لكنه الحل الصحيح للجملة التي كتبتها في الأسبوع الثالث، وهذا هو المعيار الوحيد هنا."
                : "It is the correct answer to the sentence she wrote in week three, which is the only standard that applies here."}
            </p>
          </div>
        </div>
      );

    case "retry":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...card, padding: "22px 24px" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {Array.from({ length: 11 }, (_, i) => (
                <span key={i} style={i === 0 ? quietPill : pill}>
                  {isAR ? `يوم ${i + 1}` : `Day ${i + 1}`}{i === 0 ? (isAR ? " · توقف" : " · paused") : ""}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: M.heading, lineHeight: 1.5, marginBottom: 8 }}>
              {isAR
                ? "من اليوم الثاني صارت تمد يدها إلى العلبة الصحيحة دون تردد."
                : "From day two she reached for the right box without pausing."}
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>
              {isAR
                ? "وقد أبقت الرباط عليها منذ ذلك الحين. هذا هو القياس الوحيد المهم، ولم يكن رقماً اضطر أحد إلى اختراعه."
                : "She has kept the band on since. That is the only measurement that matters, and it is not a number anyone had to invent."}
            </p>
          </div>
          <Speaker who="rouda" name={isAR ? "رودة" : "Rouda"}>
            {isAR
              ? "انتبهي. قد تكون تجاملك مرة أخرى. كيف ستعرفين الفرق هذه المرة؟"
              : "Careful. She might be being kind again. How would you know the difference this time?"}
          </Speaker>
        </div>
      );

    case "tell":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...card, padding: "22px 24px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 18px", background: M.goldSoft, borderRadius: 14, marginBottom: 16,
            }}>
              <span style={{
                width: 44, height: 44, borderRadius: "50%", background: M.action,
                display: "grid", placeItems: "center", flex: "none",
              }}>
                <Play size={17} fill={M.cream} color={M.cream} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: M.heading }}>
                  {isAR ? "مريم تشرح قصة العلبتين" : "Maryam explains the boxes"}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: M.body }}>
                  {isAR ? "٢:٠٤ · بالعربية" : "2:04 · Arabic"}
                </div>
              </div>
            </div>
            <Hers who={isAR ? "من تسجيلها" : "From her recording"}>
              {isAR
                ? "ثلاثة أسابيع وأنا أحل مشكلة عينيها. عيناها بخير. كنت أحل مشكلة الشخص الخطأ، لأنني لم أسألها قط، بل اكتفيت بمراقبتها."
                : "For three weeks I was solving her eyes. Her eyes are fine. I was solving the wrong person's problem, because I never asked her, I just watched her."}
            </Hers>
          </div>
          <div style={{ ...flat, padding: "16px 20px", fontSize: 13.5, lineHeight: 1.6 }}>
            {isAR
              ? "تلك الجملة هي ناتج الأسابيع الستة. أما الرباط المطاطي فأثر جانبي."
              : "That sentence is the output of the six weeks. The rubber band is a side effect."}
          </div>
          <Link href="/passport" style={button}>
            {isAR ? "افتح جوازها" : "Open her passport"}
          </Link>
        </div>
      );

    default:
      return null;
  }
}

/* ── the page ──────────────────────────────────────────── */

export default function StepPage() {
  const isAR = useLocale() === "ar";
  const router = useRouter();
  const params = useParams<{ step: string }>();
  const step = stepById(params.step);
  const [notes, setNotes] = useState(false);

  useEffect(() => {
    setNotes(localStorage.getItem(NOTES_KEY) === "1");
  }, []);

  const toggleNotes = () => {
    setNotes(prev => {
      localStorage.setItem(NOTES_KEY, prev ? "0" : "1");
      return !prev;
    });
  };

  if (!step) {
    return (
      <InnovationPage>
        <p style={{ fontSize: 15 }}>{isAR ? "لا توجد هذه الخطوة." : "There is no such step."}</p>
        <Link href="/investigate" style={button}>{isAR ? "العودة" : "Back to Investigate"}</Link>
      </InnovationPage>
    );
  }

  const i = stepIndex(step.id);
  const prev = i > 0 ? STEPS[i - 1] : null;
  const next = i < STEPS.length - 1 ? STEPS[i + 1] : null;
  const verb = verbById(step.verb);

  // Which verbs are behind her at this point in the run.
  const order: VerbId[] = ["notice", "name", "make", "try", "tell"];
  const done = order.slice(0, Math.max(0, order.indexOf(step.verb)));

  return (
    <InnovationPage>
      <div style={{ marginBottom: 20 }}>
        <Spine done={done} current={step.verb} compact />
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={label}>{isAR ? step.week_ar : step.week_en}</span>
          <span style={quietPill}>{isAR ? verb.ar : verb.en}</span>
        </div>
        <h1 style={{
          margin: 0, fontSize: "clamp(21px,3vw,27px)", fontWeight: 800,
          lineHeight: 1.25, letterSpacing: "-0.01em", color: M.heading,
          maxWidth: "44rem", textWrap: "balance",
        }}>
          {isAR ? step.title_ar : step.title_en}
        </h1>
        {step.intro_en && (
          <p style={{ margin: "10px 0 0", maxWidth: "44rem", fontSize: 15, lineHeight: 1.65 }}>
            {isAR ? step.intro_ar : step.intro_en}
          </p>
        )}
      </div>

      <Body id={step.id} isAR={isAR} />

      {/* presenter note, off by default and remembered */}
      {notes && (
        <div style={{
          marginTop: 22, padding: "14px 18px",
          background: "rgba(42,35,28,.05)", borderRadius: 14,
          borderInlineStart: `3px solid ${M.gold}`,
          fontSize: 13, lineHeight: 1.6,
        }}>
          <span style={{ ...label, fontSize: 9.5, display: "block", marginBottom: 4 }}>
            {isAR ? "ملاحظة للعرض" : "Presenter note"}
          </span>
          {isAR ? step.note_ar : step.note_en}
        </div>
      )}

      {/* walk */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 14, flexWrap: "wrap", marginTop: 26, paddingTop: 18,
        borderTop: `1px solid ${M.line}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => prev && router.push(`/investigate/${prev.id}`)}
            disabled={!prev}
            aria-label={isAR ? "السابق" : "Previous"}
            style={{
              width: 44, height: 44, borderRadius: "50%", cursor: prev ? "pointer" : "default",
              background: "transparent", border: `1px solid ${M.line}`, color: M.heading,
              display: "grid", placeItems: "center", opacity: prev ? 1 : 0.35,
            }}
          >
            {isAR ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          </button>
          <span style={{ fontFamily: mono, fontSize: 12, color: M.body, fontVariantNumeric: "tabular-nums" }}>
            {i + 1} / {STEPS.length}
          </span>
          <button
            onClick={() => next && router.push(`/investigate/${next.id}`)}
            disabled={!next}
            aria-label={isAR ? "التالي" : "Next"}
            style={{
              width: 44, height: 44, borderRadius: "50%", cursor: next ? "pointer" : "default",
              background: next ? M.action : "transparent",
              border: next ? "none" : `1px solid ${M.line}`,
              color: next ? M.cream : M.heading,
              display: "grid", placeItems: "center", opacity: next ? 1 : 0.35,
            }}
          >
            {isAR ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>

        <button
          onClick={toggleNotes}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: mono, fontSize: 10.5, letterSpacing: "0.1em",
            textTransform: "uppercase", color: M.goldDeep, padding: "10px 4px",
          }}
        >
          {notes
            ? (isAR ? "إخفاء ملاحظات العرض" : "Hide presenter notes")
            : (isAR ? "إظهار ملاحظات العرض" : "Show presenter notes")}
        </button>
      </div>
    </InnovationPage>
  );
}
