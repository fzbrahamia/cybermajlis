// ============================================================
// THE INNOVATION TRACK
//
// Majlis level, not inside any one majlis: the five moves are the method, and
// the method is the trunk. The majalis are scope, and this track reaches into
// them for depth. The dependency runs one way and never back.
//
// VERBS is the framework. PROBLEMS is the board people post to.
// ============================================================

export type VerbId = "notice" | "name" | "make" | "try" | "tell";

export type Verb = {
  id: VerbId;
  en: string; ar: string;
  does_en: string; does_ar: string;
  keeps_en: string; keeps_ar: string;
};

export const VERBS: Verb[] = [
  {
    id: "notice",
    en: "Notice", ar: "جوفه",
    does_en: "Watch, and write down what people do instead.",
    does_ar: "راقب، واكتب ما يفعله الناس بدلاً من ذلك.",
    keeps_en: "A friction log and one interview",
    keeps_ar: "سجل ملاحظات ومقابلة واحدة",
  },
  {
    id: "name",
    en: "Name", ar: "سمّه",
    does_en: "Say exactly what is missing, and check somebody else has not already made it.",
    does_ar: "قل بالضبط ما هو الناقص، وتأكد أن أحداً لم يصنعه قبلك.",
    keeps_en: "A gap stated with evidence",
    keeps_ar: "فجوة محددة بالأدلة",
  },
  {
    id: "make",
    en: "Make", ar: "سوّه",
    does_en: "Think of three answers. Build the smallest one that could be wrong in a week.",
    does_ar: "فكر في ثلاثة حلول. اصنع أصغرها، الذي يمكن أن يثبت خطؤه خلال أسبوع.",
    keeps_en: "Something real, however small",
    keeps_ar: "شيء حقيقي، مهما كان صغيراً",
  },
  {
    id: "try",
    en: "Try", ar: "جربه",
    does_en: "Take it back to the person it is for. Find out whether it helped.",
    does_ar: "خذه إلى الشخص المقصود. اكتشف إن كان قد ساعده فعلاً.",
    keeps_en: "What actually happened",
    keeps_ar: "ما حدث فعلاً",
  },
  {
    id: "tell",
    en: "Tell", ar: "اشرحه",
    does_en: "Explain what you found, including where you were wrong.",
    does_ar: "اشرح ما اكتشفته، بما في ذلك أين كنت مخطئاً.",
    keeps_en: "Two minutes, in your own language",
    keeps_ar: "دقيقتان، بلغتك أنت",
  },
];

// ── the problem library ─────────────────────────────────────

export type Problem = {
  id: string;
  source_en: string; source_ar: string;
  /** Which engine this problem can actually complete. */
  engine: "build" | "propose" | "solved";
  title_en: string; title_ar: string;
  body_en: string; body_ar: string;
  featured?: boolean;
};

export const PROBLEMS: Problem[] = [
  {
    id: "carpark",
    source_en: "This month, everyone", source_ar: "هذا الشهر، للجميع",
    engine: "build",
    featured: true,
    title_en: "The men who wash cars in mall car parks work through the afternoon in 46 degree heat.",
    title_ar: "الرجال الذين يغسلون السيارات في مواقف المجمعات يعملون بعد الظهر في حرارة ست وأربعين درجة.",
    body_en: "We are deliberately not explaining this one, and we are not telling you what the problem is. Go and look. Talk to one of them before you write a single word down. You may find the problem is not the one you expected.",
    body_ar: "لن نشرح هذه المشكلة عمداً، ولن نخبرك ما هي. اذهب وانظر. تحدث إلى أحدهم قبل أن تكتب كلمة واحدة. قد تكتشف أن المشكلة ليست ما توقعت.",
  },
  {
    id: "wards",
    source_en: "Posted by a nurse, Hamad Hospital", source_ar: "نشرتها ممرضة، مستشفى حمد",
    engine: "build",
    title_en: "Families cannot tell which ward their relative moved to, and ask us the same question forty times a day.",
    title_ar: "لا تعرف العائلات إلى أي جناح نُقل قريبهم، ويسألوننا السؤال نفسه أربعين مرة يومياً.",
    body_en: "Everyone assumes this is a signage problem. It is not. Half the people asking cannot read the signs in either language.",
    body_ar: "يفترض الجميع أنها مشكلة لافتات. ليست كذلك. نصف السائلين لا يستطيعون قراءة اللافتات بأي من اللغتين.",
  },
  {
    id: "falls",
    source_en: "Someone got there first", source_ar: "سبقها أحدهم",
    engine: "solved",
    title_en: "An elderly person falls at home and nobody knows for hours.",
    title_ar: "يسقط شخص مسن في بيته ولا يعلم أحد لساعات.",
    body_en: "Sara posted this in April. Three weeks later she found a company already selling a camera that detects a fall and calls someone. That is a good outcome, not a wasted month: the problem was real enough that adults built a business on it. She is now working on what that camera still cannot do.",
    body_ar: "نشرتها سارة في أبريل. وبعد ثلاثة أسابيع وجدت شركة تبيع كاميرا تكتشف السقوط وتتصل بأحد. هذه نتيجة جيدة لا شهر ضائع: فالمشكلة حقيقية بما يكفي ليبني عليها الكبار عملاً. وهي الآن تعمل على ما لا تزال تلك الكاميرا عاجزة عنه.",
  },
  {
    id: "wannacry",
    source_en: "CyberMajlis", source_ar: "المجلس السيبراني",
    engine: "propose",
    title_en: "In 2017 hospitals across the world were shut down by ransomware. They had firewalls. Why did the firewalls not help?",
    title_ar: "في 2017 توقفت مستشفيات حول العالم بسبب برمجية فدية. كانت لديها جدران حماية. لماذا لم تنفع؟",
    body_en: "You cannot build and test the answer to this one, and we will not pretend you can. You can take three companies apart, find the wall all three hit, and defend a proposal about what is still missing.",
    body_ar: "لا يمكنك صنع الحل واختباره هنا، ولن ندعي غير ذلك. لكن يمكنك تفكيك ثلاث شركات، وإيجاد الجدار الذي اصطدمت به ثلاثتها، والدفاع عن مقترح لما لا يزال ناقصاً.",
  },
];
