// ============================================================
// THE WORKBENCH
//
// Learn ends at a gap. Everything else on the platform ended there too:
// interviews, the friction log, the community board, all of it stopped at
// "here is a problem" and nothing carried a learner past it. Collecting
// problems you never work on is a hobby, not a method.
//
// This is the other half. A problem goes in one end, and what comes out is an
// idea that has been weighed rather than admired.
//
// Rules the content obeys, same as the case journey:
//   simple words. If a ten year old would not say it, it is not written here.
//   every step asks for evidence, not opinion.
//   the weighing can fail. An idea you cannot drop is not an idea.
// ============================================================

export type StepKind = "write" | "list" | "weigh" | "decide";

export type Step = {
  id: string;
  part: number;
  kind: StepKind;
  title_en: string; title_ar: string;
  ask_en: string; ask_ar: string;
  hint_en?: string; hint_ar?: string;
  /** Whoever is standing with you at this step. */
  by?: "hamad" | "rouda";
};

/** Four words for the whole path, so nobody has to hold ten steps in mind. */
export const PARTS = [
  { en: "Look",   ar: "انظر",   line_en: "Find out what really goes wrong.",     line_ar: "اعرف ما الذي يسوء فعلاً." },
  { en: "Check",  ar: "تحقّق",  line_en: "See if somebody already made it.",     line_ar: "انظر هل صنعه أحد قبلك." },
  { en: "Make",   ar: "اصنع",   line_en: "Say what you would build.",            line_ar: "قل ما الذي ستبنيه." },
  { en: "Weigh",  ar: "زِن",    line_en: "Find out if it is worth doing.",       line_ar: "اعرف هل يستحق العمل." },
];

export const STEPS: Step[] = [
  {
    id: "saw", part: 0, kind: "write", by: "hamad",
    title_en: "What goes wrong", title_ar: "ما الذي يسوء",
    ask_en: "Say what goes wrong. One sentence, and say it like you saw it happen.",
    ask_ar: "قل ما الذي يسوء. جملة واحدة، وقلها كما رأيتها تحدث.",
    hint_en: "Not what should exist. What actually goes wrong.",
    hint_ar: "لا ما ينبغي أن يوجد. بل ما الذي يسوء فعلاً.",
  },
  {
    id: "who", part: 0, kind: "write", by: "hamad",
    title_en: "Who it happens to", title_ar: "لمن يحدث",
    ask_en: "Who does this happen to, and how often?",
    ask_ar: "لمن يحدث هذا، وكم مرة؟",
    hint_en: "A real person you could go and find, not people in general.",
    hint_ar: "شخص حقيقي يمكنك الذهاب إليه، لا الناس عموماً.",
  },
  {
    id: "instead", part: 0, kind: "write", by: "rouda",
    title_en: "What they do now", title_ar: "ماذا يفعلون الآن",
    ask_en: "It goes wrong, and they still get through the day somehow. What do they do instead?",
    ask_ar: "يسوء الأمر، ومع ذلك يكملون يومهم بطريقة ما. فماذا يفعلون بدلاً منه؟",
    hint_en: "This is the most useful thing on the whole page. The thing people already do is the thing you have to beat.",
    hint_ar: "هذا أنفع ما في الصفحة كلها. فما يفعله الناس أصلاً هو ما عليك أن تتغلب عليه.",
  },
  {
    id: "asked", part: 0, kind: "list", by: "hamad",
    title_en: "Ask them", title_ar: "اسألهم",
    ask_en: "Go and ask one person who has this problem. Write down what they said, in their words and not yours.",
    ask_ar: "اذهب واسأل شخصاً واحداً لديه هذه المشكلة. واكتب ما قاله بكلماته لا بكلماتك.",
    hint_en: "Their words. Even when their words are annoying.",
    hint_ar: "بكلماته هو. حتى لو كانت كلماته مزعجة.",
  },
  {
    id: "exists", part: 1, kind: "write", by: "rouda",
    title_en: "Has somebody made it", title_ar: "هل صنعه أحد",
    ask_en: "Go and look for something that already does this. What did you find?",
    ask_ar: "ابحث عن شيء يفعل هذا أصلاً. ماذا وجدت؟",
    hint_en: "Finding one is good news. It means somebody agreed the problem is real.",
    hint_ar: "أن تجد واحداً خبر جيد. فمعناه أن أحداً وافق أن المشكلة حقيقية.",
  },
  {
    id: "idea", part: 2, kind: "write", by: "hamad",
    title_en: "What you would make", title_ar: "ما الذي ستصنعه",
    ask_en: "What would you make? Say the smallest useful thing, not the whole dream.",
    ask_ar: "ما الذي ستصنعه؟ قل أصغر شيء نافع، لا الحلم كله.",
  },
  {
    id: "true", part: 2, kind: "write", by: "rouda",
    title_en: "What has to be true", title_ar: "ما الذي يجب أن يكون صحيحاً",
    ask_en: "For your idea to work, something has to be true that you have not checked. What is it?",
    ask_ar: "لكي تنجح فكرتك، شيء ما يجب أن يكون صحيحاً ولم تتحقق منه. ما هو؟",
    hint_en: "Every idea rests on one. Yours has one whether you name it or not.",
    hint_ar: "كل فكرة تقوم على واحد. وفكرتك لها واحد، سمّيته أو لم تسمّه.",
  },
  {
    id: "test", part: 2, kind: "write", by: "rouda",
    title_en: "The smallest test", title_ar: "أصغر اختبار",
    ask_en: "What is the smallest thing you could do this week to find out you are wrong?",
    ask_ar: "ما أصغر شيء يمكنك فعله هذا الأسبوع لتكتشف أنك مخطئ؟",
    hint_en: "Something that could come out badly. If nothing could go wrong, it is not a test.",
    hint_ar: "شيء قد تسوء نتيجته. فإن لم يكن شيء قد يسوء، فليس اختباراً.",
  },
];

/* ── the weighing ────────────────────────────────────────── */

export type Weigh = {
  id: string;
  q_en: string; q_ar: string;
  /** What "yes" would have to be backed by. Opinion is not evidence. */
  proof_en: string; proof_ar: string;
};

export const WEIGH: Weigh[] = [
  {
    id: "real",
    q_en: "Does it fix the thing that actually goes wrong?",
    q_ar: "هل يصلح الشيء الذي يسوء فعلاً؟",
    proof_en: "Point at the sentence you wrote at the start and show it is the same thing.",
    proof_ar: "أشر إلى الجملة التي كتبتها في البداية وبيّن أنها الشيء نفسه.",
  },
  {
    id: "build",
    q_en: "Could you actually make it, with what you have?",
    q_ar: "هل تستطيع صنعه فعلاً، بما لديك؟",
    proof_en: "Say what you would use. If you need something you cannot get, say that instead.",
    proof_ar: "قل بماذا ستصنعه. وإن كنت تحتاج ما لا تستطيع الحصول عليه، فقل ذلك.",
  },
  {
    id: "want",
    q_en: "Does anybody actually want it?",
    q_ar: "هل يريده أحد فعلاً؟",
    proof_en: "Name one person and say what they said. Not what you think they would say.",
    proof_ar: "سمّ شخصاً واحداً وقل ما قاله. لا ما تظن أنه سيقوله.",
  },
  {
    id: "cost",
    q_en: "What does it cost the person using it?",
    q_ar: "ماذا يكلّف من يستعمله؟",
    proof_en: "Money, time, or changing something they already do. The last one is the dearest.",
    proof_ar: "مالاً أو وقتاً أو تغيير شيء يفعلونه أصلاً. والأخير أغلاها.",
  },
  {
    id: "already",
    q_en: "Is yours different from the one that already exists?",
    q_ar: "هل يختلف عن الموجود أصلاً؟",
    proof_en: "Say what yours does that theirs does not. If nothing, say nothing.",
    proof_ar: "قل ما يفعله لك ولا يفعله لهم. وإن كان لا شيء، فقل لا شيء.",
  },
  {
    id: "kills",
    q_en: "What is most likely to kill it?",
    q_ar: "ما أرجح ما يقتلها؟",
    proof_en: "One thing. The real one, not a small one you are comfortable saying.",
    proof_ar: "شيء واحد. الحقيقي، لا صغير تريح نفسك بقوله.",
  },
];

export type Verdict = "yes" | "unsure" | "no";

export const VERDICTS: { id: Verdict; en: string; ar: string; tone: string }[] = [
  { id: "yes",    en: "Yes",       ar: "نعم",       tone: "#1B6B4C" },
  { id: "unsure", en: "Not sure",  ar: "لست متأكداً", tone: "#8F6A38" },
  { id: "no",     en: "No",        ar: "لا",        tone: "#7A1E22" },
];

export const DECISIONS = [
  { id: "keep",   en: "Keep going with it",  ar: "أكمل فيها",
    line_en: "It held up. Go and run your test.", line_ar: "صمدت. اذهب ونفّذ اختبارك." },
  { id: "change", en: "Change it",           ar: "غيّرها",
    line_en: "Something did not hold. Change that part and weigh it again.", line_ar: "شيء لم يصمد. غيّر ذلك الجزء وزنها مرة أخرى." },
  { id: "drop",   en: "Drop it",             ar: "اتركها",
    line_en: "Dropping one is not losing. It is the fastest thing you can learn.", line_ar: "ترك واحدة ليس خسارة. بل أسرع ما يمكن أن تتعلمه." },
];
