// ============================================================
// THE INNOVATION TRACK
//
// Majlis level, not inside any one majlis: the five moves are the method, and
// the method is the trunk. The majalis are scope, and this track reaches into
// them for depth. The dependency runs one way and never back.
//
// This file holds two things:
//   1. VERBS      the framework itself
//   2. MARYAM     one seeded investigation, used for demonstrations
//
// The seeded investigation is deliberately a complete run including the week it
// failed, because the failure is the part that argues for the method.
// ============================================================

export type VerbId = "notice" | "name" | "make" | "try" | "tell";

export type Verb = {
  id: VerbId;
  en: string; ar: string;
  /** What the child actually does. Written to them, not about them. */
  does_en: string; does_ar: string;
  /** What they keep afterwards. One artifact per move, for the passport. */
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

export const verbById = (id: VerbId) => VERBS.find(v => v.id === id)!;

// ── the seeded investigation ────────────────────────────────

export type StepId =
  | "log" | "gate-one" | "interview" | "name"
  | "make" | "try" | "gate-two" | "remake" | "retry" | "tell";

export type Question = {
  q_en: string; q_ar: string;
  a_en: string; a_ar: string;
  /** Rouda pushed back once, then let her through. */
  reask_en?: string; reask_ar?: string;
  again_en?: string; again_ar?: string;
};

export type Step = {
  id: StepId;
  verb: VerbId;
  week_en: string; week_ar: string;
  title_en: string; title_ar: string;
  intro_en?: string; intro_ar?: string;
  /** One line for whoever is presenting. Never shown to a learner. */
  note_en: string; note_ar: string;
};

export const STEPS: Step[] = [
  {
    id: "log", verb: "notice",
    week_en: "Week 1, day 9", week_ar: "الأسبوع الأول، اليوم التاسع",
    title_en: "Seven things that went wrong near her",
    title_ar: "سبعة أشياء ساءت من حولها",
    intro_en: "Ten entries over two weeks, and one rule: no solutions. The last column is the whole exercise, because a workaround is proof somebody was bothered enough to route around it.",
    intro_ar: "عشرة مدخلات خلال أسبوعين، وقاعدة واحدة: ممنوع الحلول. العمود الأخير هو التمرين كله، لأن الحيلة البديلة دليل على أن أحدهم انزعج بما يكفي ليلتف حول المشكلة.",
    note_en: "The fourth column is the exercise. Entry four is flagged because nobody worked around it.",
    note_ar: "العمود الرابع هو التمرين. المدخل الرابع مُعلَّم لأن أحداً لم يلتف حوله.",
  },
  {
    id: "gate-one", verb: "notice",
    week_en: "Week 1, gate one", week_ar: "الأسبوع الأول، البوابة الأولى",
    title_en: "Five questions before Notice closes",
    title_ar: "خمسة أسئلة قبل أن تُغلق مرحلة الملاحظة",
    intro_en: "Two of the five are written from what she actually wrote, not from a template. The fifth is the same at every gate.",
    intro_ar: "سؤالان من الخمسة مكتوبان مما كتبته هي، لا من قالب جاهز. والسؤال الخامس هو نفسه عند كل بوابة.",
    note_en: "She answers thinly, gets re-asked once, and drops her own weak entry unprompted.",
    note_ar: "أجابت إجابة ضعيفة، فأعادت رودة السؤال مرة واحدة، فحذفت هي مدخلها الضعيف من تلقاء نفسها.",
  },
  {
    id: "interview", verb: "notice",
    week_en: "Week 2", week_ar: "الأسبوع الثاني",
    title_en: "The interview that broke her theory",
    title_ar: "المقابلة التي هدمت فرضيتها",
    intro_en: "One person, and not your mother or father. You are not there to describe your idea. You are there to find out you were wrong about something.",
    intro_ar: "شخص واحد، وليس أمك أو أباك. أنت لست هناك لتشرح فكرتك، بل لتكتشف أنك كنت مخطئاً في شيء ما.",
    note_en: "The highest leverage twenty minutes in the whole six weeks, and it costs nothing to run.",
    note_ar: "أهم عشرين دقيقة في الأسابيع الستة كلها، ولا تكلف شيئاً.",
  },
  {
    id: "name", verb: "name",
    week_en: "Week 3", week_ar: "الأسبوع الثالث",
    title_en: "Saying it precisely, then finding out she is not first",
    title_ar: "أن تقولها بدقة، ثم تكتشف أنك لست الأول",
    note_en: "Finding it already exists is the good outcome. It proves the problem was real.",
    note_ar: "اكتشاف أنه موجود مسبقاً نتيجة جيدة. فهو يثبت أن المشكلة حقيقية.",
  },
  {
    id: "make", verb: "make",
    week_en: "Week 4", week_ar: "الأسبوع الرابع",
    title_en: "Three answers before you build any of them",
    title_ar: "ثلاثة حلول قبل أن تصنع أياً منها",
    intro_en: "The first build only has to be something you could prove wrong within one week. Not a product. A test.",
    intro_ar: "أول ما تصنعه يكفي أن يكون شيئاً يمكن إثبات خطئه خلال أسبوع. ليس منتجاً، بل اختباراً.",
    note_en: "She picks the card, because it is the one that looks most like a real solution.",
    note_ar: "اختارت البطاقة، لأنها الأشبه بحل حقيقي في نظرها.",
  },
  {
    id: "try", verb: "try",
    week_en: "Week 4", week_ar: "الأسبوع الرابع",
    title_en: "It did not work",
    title_ar: "لم ينجح",
    note_en: "The load bearing screen. In a competition this is a loss. Here the loop returns her to Make, not to zero.",
    note_ar: "الشاشة الحاملة للفكرة كلها. في المسابقات هذه خسارة. هنا تعيدها الحلقة إلى مرحلة الصنع، لا إلى الصفر.",
  },
  {
    id: "gate-two", verb: "try",
    week_en: "Week 4, gate two", week_ar: "الأسبوع الرابع، البوابة الثانية",
    title_en: "Five questions after a failure",
    title_ar: "خمسة أسئلة بعد الإخفاق",
    note_en: "Question two is the one that lands. She wrote the word herself, three weeks earlier.",
    note_ar: "السؤال الثاني هو الذي أصاب. فقد كتبت الكلمة بنفسها قبل ثلاثة أسابيع.",
  },
  {
    id: "remake", verb: "make",
    week_en: "Week 5", week_ar: "الأسبوع الخامس",
    title_en: "The second one is nearly nothing",
    title_ar: "الحل الثاني يكاد لا يكون شيئاً",
    intro_en: "A rubber band with three knots tied in it, around one box.",
    intro_ar: "رباط مطاطي فيه ثلاث عقد، حول علبة واحدة.",
    note_en: "Not impressive, not technology, and correct. The only standard is her own sentence.",
    note_ar: "ليس مبهراً، وليس تقنية، وهو صحيح. المعيار الوحيد هو جملتها هي.",
  },
  {
    id: "retry", verb: "try",
    week_en: "Week 6", week_ar: "الأسبوع السادس",
    title_en: "Eleven mornings",
    title_ar: "أحد عشر صباحاً",
    note_en: "She kept it on. Rouda still refuses to let the result go unchallenged.",
    note_ar: "أبقت عليه. ومع ذلك ترفض رودة أن تمر النتيجة دون مساءلة.",
  },
  {
    id: "tell", verb: "tell",
    week_en: "Week 6", week_ar: "الأسبوع السادس",
    title_en: "Two minutes, in her own language",
    title_ar: "دقيقتان، بلغتها هي",
    intro_en: "The explanation has to include where you were wrong. Not as an apology. As the content.",
    intro_ar: "يجب أن يتضمن الشرح أين كنت مخطئاً. ليس اعتذاراً، بل باعتباره المحتوى نفسه.",
    note_en: "That sentence is the real output of the six weeks. The rubber band is a side effect.",
    note_ar: "تلك الجملة هي الناتج الحقيقي للأسابيع الستة. أما الرباط المطاطي فأثر جانبي.",
  },
];

export const stepById = (id: string) => STEPS.find(s => s.id === id);
export const stepIndex = (id: string) => STEPS.findIndex(s => s.id === id);

// ── her friction log ────────────────────────────────────────

export const LOG = [
  {
    what_en: "Grandmother took the wrong box. The two look almost identical.",
    what_ar: "أخذت جدتي العلبة الخطأ. العلبتان تكادان تتطابقان.",
    who_en: "My grandmother", who_ar: "جدتي",
    often_en: "Twice a week", often_ar: "مرتان أسبوعياً",
    instead_en: "She scratched a mark into the lid of one with a knife.",
    instead_ar: "خدشت علامة في غطاء إحداهما بسكين.",
  },
  {
    what_en: "The school bus list is read out loud and nobody at the back can hear it.",
    what_ar: "تُقرأ قائمة الحافلة بصوت عال ولا يسمعها أحد في الخلف.",
    who_en: "About 30 of us", who_ar: "نحو ثلاثين منا",
    often_en: "Every day", often_ar: "كل يوم",
    instead_en: "The front row repeats the names backwards to us.",
    instead_ar: "الصف الأمامي يعيد الأسماء إلينا في الخلف.",
  },
  {
    what_en: "The cleaner cannot reach the high windows and stands on a plastic chair.",
    what_ar: "لا يصل عامل النظافة إلى النوافذ العالية فيقف على كرسي بلاستيكي.",
    who_en: "Mr Ranjan", who_ar: "السيد رانجان",
    often_en: "Every Thursday", often_ar: "كل خميس",
    instead_en: "He tapes the cloth to a broom handle.",
    instead_ar: "يلصق القماشة بعصا المكنسة.",
  },
  {
    what_en: "Nobody recycles the plastic bottles at school.",
    what_ar: "لا أحد يعيد تدوير القوارير البلاستيكية في المدرسة.",
    who_en: "Everyone?", who_ar: "الجميع؟",
    often_en: "Not sure", often_ar: "غير متأكدة",
    instead_en: "", instead_ar: "",
    flagged: true,
  },
  {
    what_en: "My father misses the parking payment and gets a fine.",
    what_ar: "ينسى أبي دفع رسوم الموقف فتأتيه مخالفة.",
    who_en: "My father", who_ar: "أبي",
    often_en: "Once a month", often_ar: "مرة شهرياً",
    instead_en: "He sets three alarms and still forgets.",
    instead_ar: "يضبط ثلاثة منبهات وينسى رغم ذلك.",
  },
];

// ── the two gates ───────────────────────────────────────────

export const GATE_ONE: Question[] = [
  {
    q_en: "Which of your seven would still be a problem if you never fixed it?",
    q_ar: "أي من السبعة سيبقى مشكلة لو لم تُصلحيه أبداً؟",
    a_en: "The medicine one. She has been doing the knife thing for years, so it will not stop on its own.",
    a_ar: "مشكلة الدواء. تفعل حكاية السكين منذ سنوات، فهي لن تتوقف من تلقاء نفسها.",
  },
  {
    q_en: "You wrote that the recycling bothers everyone. Who did you actually watch not recycle?",
    q_ar: "كتبتِ أن إعادة التدوير تزعج الجميع. من الذي رأيتِه فعلاً لا يعيد التدوير؟",
    a_en: "Everyone, I think.",
    a_ar: "الجميع، على ما أظن.",
    reask_en: "That is what you assumed. I am asking who you watched.",
    reask_ar: "هذا ما افترضتِه. أنا أسأل عمن رأيتِه بعينك.",
    again_en: "Nobody. I did not watch anyone, I just thought it was true. I want to take entry four out.",
    again_ar: "لا أحد. لم أراقب أحداً، فقط ظننته صحيحاً. أريد حذف المدخل الرابع.",
  },
  {
    q_en: "Your grandmother scratched the lid years ago. Why do you think she never asked for help?",
    q_ar: "خدشت جدتك الغطاء قبل سنوات. لماذا تظنين أنها لم تطلب المساعدة قط؟",
    a_en: "Maybe she did not want anyone to think she cannot manage by herself.",
    a_ar: "ربما لم ترد أن يظن أحد أنها لا تستطيع تدبر أمرها بنفسها.",
  },
  {
    q_en: "Three of your entries are about you. One is not. Which is which?",
    q_ar: "ثلاثة من مدخلاتك عنك أنت، وواحد ليس كذلك. أيها أيها؟",
    a_en: "The bus and the parking are about me. The cleaner and my grandmother are not.",
    a_ar: "الحافلة والموقف عني أنا. عامل النظافة وجدتي ليسا كذلك.",
  },
  {
    q_en: "What do you think now that you did not think on Monday?",
    q_ar: "ما الذي تفكرين فيه الآن ولم تكوني تفكرين فيه يوم الاثنين؟",
    a_en: "That writing everyone means I did not look properly.",
    a_ar: "أن كتابة كلمة الجميع تعني أنني لم أنظر جيداً.",
  },
];

export const GATE_TWO: Question[] = [
  {
    q_en: "Your grandmother used it once. Do you think she was being kind, or do you think it worked once?",
    q_ar: "استعملته جدتك مرة واحدة. أتظنينها كانت تجاملك، أم أنه نجح مرة واحدة؟",
    a_en: "She was being kind. She did not want me to feel bad.",
    a_ar: "كانت تجاملني. لم تشأ أن أشعر بالسوء.",
  },
  {
    q_en: "Read your own week three sentence back to me. Which word did your card ignore?",
    q_ar: "اقرئي عليّ جملتك من الأسبوع الثالث. أي كلمة تجاهلتها بطاقتك؟",
    a_en: "Dark. I wrote in the dark myself and then I made something you have to see.",
    a_ar: "الظلام. كتبتُ في الظلام بنفسي، ثم صنعتُ شيئاً يجب أن تراه بعينك.",
  },
  {
    q_en: "Of your other two ideas, does either survive the word dark?",
    q_ar: "من فكرتيك الأخريين، هل تصمد إحداهما أمام كلمة الظلام؟",
    a_en: "The texture one does. You can feel it without looking.",
    a_ar: "فكرة الملمس تصمد. يمكن تحسسها دون النظر.",
  },
  {
    q_en: "What would you have to believe for the card to have worked?",
    q_ar: "بماذا كان يجب أن تؤمني حتى تنجح البطاقة؟",
    a_en: "That she turns the light on. I never checked, I just thought everyone does.",
    a_ar: "أنها تشعل الضوء. لم أتحقق أبداً، فقط ظننت أن الجميع يفعل.",
  },
  {
    q_en: "What do you think now that you did not think last week?",
    q_ar: "ما الذي تفكرين فيه الآن ولم تكوني تفكرين فيه الأسبوع الماضي؟",
    a_en: "That I can write the right thing down and still not use it.",
    a_ar: "أنني قد أكتب الشيء الصحيح ثم لا أستعمله.",
  },
];

// ── her passport ────────────────────────────────────────────

export const WORK = [
  { en: "One problem, stated with evidence and a named workaround", ar: "مشكلة واحدة، محددة بالأدلة وبحيلة بديلة معروفة" },
  { en: "One recorded interview that contradicted her", ar: "مقابلة مسجلة واحدة ناقضت ما كانت تظنه" },
  { en: "Prior art found, and what it still cannot do", ar: "حلول سابقة وُجدت، وما لا تزال عاجزة عنه" },
  { en: "Two builds. The first one failed", ar: "محاولتا صنع. الأولى أخفقت" },
  { en: "Eleven mornings of use by the person it was for", ar: "أحد عشر صباحاً من الاستعمال من الشخص المقصود" },
  { en: "A two minute defence, in Arabic", ar: "دفاع من دقيقتين، بالعربية" },
];

export const THINKING = [
  { en: "Rewrote her problem twice, both times against her own interest", ar: "أعادت صياغة مشكلتها مرتين، وفي كلتيهما ضد مصلحتها" },
  { en: "Dropped entry four herself after one challenge", ar: "حذفت المدخل الرابع بنفسها بعد مساءلة واحدة" },
  { en: "Chose a problem that was not her own", ar: "اختارت مشكلة ليست مشكلتها هي" },
  { en: "The 5am detail appeared in no other log in her class", ar: "تفصيلة الخامسة فجراً لم ترد في أي سجل آخر في صفها" },
  { en: "Returned after a failure, unprompted, four days later", ar: "عادت بعد الإخفاق من تلقاء نفسها، بعد أربعة أيام" },
  { en: "Answered thinly once, at gate one, question two", ar: "أجابت إجابة ضعيفة مرة واحدة، في البوابة الأولى، السؤال الثاني", thin: true },
];

// ── the problem library ─────────────────────────────────────

export type Problem = {
  id: string;
  source_en: string; source_ar: string;
  /** Which engine this problem can actually complete. */
  engine: "build" | "propose" | "solved";
  title_en: string; title_ar: string;
  body_en: string; body_ar: string;
  count: number;
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
    count: 41,
  },
  {
    id: "wards",
    source_en: "Posted by a nurse, Hamad Hospital", source_ar: "نشرتها ممرضة، مستشفى حمد",
    engine: "build",
    title_en: "Families cannot tell which ward their relative moved to, and ask us the same question forty times a day.",
    title_ar: "لا تعرف العائلات إلى أي جناح نُقل قريبهم، ويسألوننا السؤال نفسه أربعين مرة يومياً.",
    body_en: "Everyone assumes this is a signage problem. It is not. Half the people asking cannot read the signs in either language.",
    body_ar: "يفترض الجميع أنها مشكلة لافتات. ليست كذلك. نصف السائلين لا يستطيعون قراءة اللافتات بأي من اللغتين.",
    count: 12,
  },
  {
    id: "falls",
    source_en: "Someone got there first", source_ar: "سبقها أحدهم",
    engine: "solved",
    title_en: "An elderly person falls at home and nobody knows for hours.",
    title_ar: "يسقط شخص مسن في بيته ولا يعلم أحد لساعات.",
    body_en: "Sara posted this in April. Three weeks later she found a company already selling a camera that detects a fall and calls someone. That is a good outcome, not a wasted month: the problem was real enough that adults built a business on it. She is now working on what that camera still cannot do.",
    body_ar: "نشرتها سارة في أبريل. وبعد ثلاثة أسابيع وجدت شركة تبيع كاميرا تكتشف السقوط وتتصل بأحد. هذه نتيجة جيدة لا شهر ضائع: فالمشكلة حقيقية بما يكفي ليبني عليها الكبار عملاً. وهي الآن تعمل على ما لا تزال تلك الكاميرا عاجزة عنه.",
    count: 7,
  },
  {
    id: "wannacry",
    source_en: "CyberMajlis", source_ar: "المجلس السيبراني",
    engine: "propose",
    title_en: "In 2017 hospitals across the world were shut down by ransomware. They had firewalls. Why did the firewalls not help?",
    title_ar: "في 2017 توقفت مستشفيات حول العالم بسبب برمجية فدية. كانت لديها جدران حماية. لماذا لم تنفع؟",
    body_en: "You cannot build and test the answer to this one, and we will not pretend you can. You can take three companies apart, find the wall all three hit, and defend a proposal about what is still missing.",
    body_ar: "لا يمكنك صنع الحل واختباره هنا، ولن ندعي غير ذلك. لكن يمكنك تفكيك ثلاث شركات، وإيجاد الجدار الذي اصطدمت به ثلاثتها، والدفاع عن مقترح لما لا يزال ناقصاً.",
    count: 23,
  },
];
