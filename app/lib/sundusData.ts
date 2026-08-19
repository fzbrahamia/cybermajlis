// ============================================================
// SUNDUS
//
// A second approach to the same teaching, kept side by side with the Case
// pages so the two can be compared honestly.
//
// The Case approach EXPLAINS: story, decomposition, collision, then it hands
// the learner a stated gap.
//
// Sundus DISCOVERS: the learner is dropped into an incident with no framing,
// answers before anything is taught, is walked onto false positives by being
// asked what would go wrong rather than being told, and assembles the
// comparison themselves. The gap is not stated. They are walked to the edge of
// it and asked what is missing.
//
// The scenario is FICTIONAL. It is built from the shape of real ransomware
// incidents and set in Qatar so the stakes are felt, but Al Dana Clinics does
// not exist and no real organisation is being described.
// ============================================================

export type Ask = {
  id: string;
  q_en: string; q_ar: string;
  hint_en?: string; hint_ar?: string;
};

/* ── 1. the cold open ─────────────────────────────────────── */

export const INCIDENT = {
  when_en: "Thursday, 7:40am, August", when_ar: "الخميس، ٧:٤٠ صباحاً، أغسطس",
  where_en: "Al Dana Clinics, fourteen branches across Doha and Al Wakrah",
  where_ar: "عيادات الدانة، أربعة عشر فرعاً في الدوحة والوكرة",
  lede_en: "Every screen turned white at the same moment.",
  lede_ar: "ابيضّت كل الشاشات في اللحظة نفسها.",
  body_en: [
    "A message asked for money. Nothing else would open.",
    "The pharmacy could not print prescriptions. A pharmacist in Al Wakrah had a seven year old in front of her with asthma and no way to confirm his dose. Reception turned people away in 46 degree heat and could not tell them when to come back.",
    "It had started the night before, on one computer in the Al Khor branch, and by morning it had reached all fourteen.",
  ],
  body_ar: [
    "طلبت رسالة مالاً. ولم يعد أي شيء آخر يُفتح.",
    "لم تستطع الصيدلية طباعة الوصفات. ووقفت صيدلانية في الوكرة أمامها طفل في السابعة مصاب بالربو ولا سبيل لتأكيد جرعته. وردّ الاستقبال الناس في حر ست وأربعين درجة دون أن يعرف متى يطلب منهم العودة.",
    "بدأ الأمر في الليلة السابقة، على حاسوب واحد في فرع الخور، وبحلول الصباح كان قد بلغ الأربعة عشر فرعاً كلها.",
  ],
  /** Deliberately the only framing given. No topic, no lesson title. */
  prompt_en: "Al Dana had a security system. They had spent money on it. Nobody saw this coming.",
  prompt_ar: "كان لدى الدانة نظام أمني. وأنفقوا عليه مالاً. ولم يرَ أحد هذا قادماً.",
};

/* ── 2. before anything is taught ─────────────────────────── */

export const FIRST_ASKS: Ask[] = [
  {
    id: "why-unseen",
    q_en: "They had a security system. Why do you think nobody saw this?",
    q_ar: "كان لديهم نظام أمني. لماذا تظن أن أحداً لم يرَ هذا؟",
    hint_en: "There is no right answer yet. Write what you actually think.",
    hint_ar: "لا توجد إجابة صحيحة بعد. اكتب ما تظنه فعلاً.",
  },
  {
    id: "who-hurt",
    q_en: "Who was hurt by this, and who was hurt worst?",
    q_ar: "من تضرر من هذا، ومن تضرر أكثر من غيره؟",
  },
  {
    id: "why-still",
    q_en: "This has happened to hospitals before. Why do you think it still happens?",
    q_ar: "حدث هذا لمستشفيات من قبل. لماذا تظن أنه ما زال يحدث؟",
  },
  {
    id: "if-possible",
    q_en: "If nothing were impossible, what is the best thing anyone could do about it?",
    q_ar: "لو لم يكن هناك مستحيل، فما أفضل شيء يمكن لأحد أن يفعله حيال ذلك؟",
  },
];

/* ── 3. the investigation board ───────────────────────────── */

export type Evidence = {
  id: string;
  tag_en: string; tag_ar: string;
  head_en: string; head_ar: string;
  body_en: string; body_ar: string;
  /** The point the whole board is built to deliver. */
  turn?: boolean;
};

export const BOARD: Evidence[] = [
  {
    id: "entry",
    tag_en: "How it got in", tag_ar: "كيف دخل",
    head_en: "An invoice attachment, opened at 9:12pm",
    head_ar: "مرفق فاتورة، فُتح في التاسعة و١٢ دقيقة مساءً",
    body_en: "A clerk in Al Khor opened what looked like a supplier invoice. It looked exactly like the ones that arrive every week, because whoever sent it had seen a real one.",
    body_ar: "فتح موظف في الخور ما بدا فاتورة مورّد. بدت تماماً كتلك التي تصل كل أسبوع، لأن من أرسلها كان قد رأى فاتورة حقيقية.",
  },
  {
    id: "patch",
    tag_en: "The repair", tag_ar: "الإصلاح",
    head_en: "A fix for this exact hole was released in March",
    head_ar: "صدر إصلاح لهذه الثغرة بالذات في مارس",
    body_en: "Eleven of the fourteen branches installed it. Three did not, because those three run the X-ray software, and the company that sells the X-ray software will not support it on an updated system.",
    body_ar: "ثبّته أحد عشر فرعاً من أربعة عشر. ولم تثبته ثلاثة، لأن هذه الثلاثة تشغّل برنامج الأشعة، والشركة التي تبيع برنامج الأشعة لا تدعمه على نظام محدّث.",
  },
  {
    id: "alert",
    tag_en: "The alert", tag_ar: "التنبيه",
    head_en: "The system did notice. It said so at 9:31pm.",
    head_ar: "النظام لاحظ فعلاً. وقال ذلك في التاسعة و٣١ دقيقة مساءً.",
    body_en: "An alert was raised that night, correctly, describing unusual file activity. It was alert number 863 that week. Nobody opened it until Thursday afternoon.",
    body_ar: "أُطلق تنبيه تلك الليلة، وكان صحيحاً، يصف نشاط ملفات غير معتاد. وكان التنبيه رقم ٨٦٣ في ذلك الأسبوع. ولم يفتحه أحد حتى بعد ظهر الخميس.",
    turn: true,
  },
  {
    id: "team",
    tag_en: "The people", tag_ar: "الناس",
    head_en: "Two people, fourteen branches",
    head_ar: "شخصان، وأربعة عشر فرعاً",
    body_en: "The whole security team was two staff, one of whom was on leave. Neither had ever been given time to reduce the number of alerts.",
    body_ar: "كان فريق الأمن كله موظفين اثنين، أحدهما في إجازة. ولم يُمنح أي منهما وقتاً لتقليل عدد التنبيهات.",
  },
  {
    id: "spread",
    tag_en: "How it spread", tag_ar: "كيف انتشر",
    head_en: "Branch to branch, on the network built to share records",
    head_ar: "من فرع إلى فرع، عبر الشبكة التي بُنيت لتشارك السجلات",
    body_en: "Al Dana's branches share patient records so a patient can walk into any of them. That is the point of the network, and it is also the road the attack took.",
    body_ar: "تتشارك فروع الدانة سجلات المرضى ليتمكن المريض من دخول أي فرع. هذا هو الغرض من الشبكة، وهو أيضاً الطريق الذي سلكه الهجوم.",
  },
];

export const BOARD_TURN = {
  head_en: "So whose problem was this?",
  head_ar: "إذاً، مشكلة من كانت هذه؟",
  body_en: "Somebody wrote the attack, and that person is responsible for it. But look at the board again. A repair existed and could not be installed. A warning was raised and nobody read it. A network built to help patients carried the attack to every branch. None of those four are the hacker.",
  body_ar: "كتب أحدهم الهجوم، وهو مسؤول عنه. لكن انظر إلى اللوحة مرة أخرى. إصلاح وُجد ولم يمكن تثبيته. وتحذير أُطلق ولم يقرأه أحد. وشبكة بُنيت لمساعدة المرضى حملت الهجوم إلى كل فرع. ولا شيء من هذه الأربعة هو المخترق.",
};

export const HAMAD_AFTER_BOARD: Ask[] = [
  {
    id: "reread",
    q_en: "Read what you wrote at the start about why nobody saw it. Would you change it now?",
    q_ar: "اقرأ ما كتبته في البداية عن سبب عدم رؤية أحد لهذا. هل تغيّره الآن؟",
  },
  {
    id: "blame",
    q_en: "Of everything on the board, which one would you fix first, and what would that cost someone?",
    q_ar: "من كل ما على اللوحة، أيها تصلحه أولاً، وماذا سيكلف ذلك أحداً؟",
  },
];

/* ── 4. walked into false positives, not told ─────────────── */

export const ALERTING_DISCOVERY = {
  setup_en: "One answer people reach for is simple: alert on everything. If the system had shouted about every single unusual thing, someone would have seen this one.",
  setup_ar: "أحد الحلول التي يهرع إليها الناس بسيط: نبّه على كل شيء. فلو صرخ النظام عند كل شيء غير معتاد، لرآه أحد.",
  asks: [
    {
      id: "everything",
      q_en: "If a system warned you about everything unusual, every second, what would go wrong?",
      q_ar: "لو حذرك نظام من كل شيء غير معتاد، كل ثانية، فماذا سيسوء؟",
    },
    {
      id: "human",
      q_en: "You are the person receiving those warnings, all day, every day. What do you start doing after a week?",
      q_ar: "أنت من يتلقى تلك التحذيرات، طوال اليوم، كل يوم. ماذا تبدأ بفعله بعد أسبوع؟",
    },
  ] as Ask[],
  reveal_en: "You just described the thing that beat Al Dana. There is a name for it, and a whole field built around it.",
  reveal_ar: "لقد وصفت للتو ما هزم الدانة. ولهذا اسم، وحوله مجال كامل.",
  concept_en: "False alarms", concept_ar: "الإنذارات الكاذبة",
};

export const FALSE_POSITIVE_NODE = {
  name_en: "False alarms", name_ar: "الإنذارات الكاذبة",
  body_en: [
    "A false alarm is the system saying something is wrong when nothing is. On its own, one costs a minute. The damage is what a thousand of them do to a person.",
    "After a week of alerts that were nothing, a human being stops reading them carefully. After a month they stop reading them at all. This is not laziness and it cannot be trained away, it is what attention does under load.",
    "So a system that catches everything and a system that catches nothing can end at the same place, because a warning nobody reads is not a warning.",
  ],
  body_ar: [
    "الإنذار الكاذب هو أن يقول النظام إن هناك خطأ ولا خطأ. الواحد منه يكلف دقيقة. أما الضرر فهو ما يفعله ألف منها بإنسان.",
    "بعد أسبوع من تنبيهات لا شيء وراءها، يكف الإنسان عن قراءتها بتمعن. وبعد شهر يكف عن قراءتها أصلاً. وهذا ليس كسلاً ولا يُعالج بالتدريب، بل هو ما يفعله الانتباه تحت الحمل.",
    "فالنظام الذي يمسك كل شيء والنظام الذي لا يمسك شيئاً قد ينتهيان إلى المكان نفسه، لأن التحذير الذي لا يقرؤه أحد ليس تحذيراً.",
  ],
  check_en: "Al Dana's alert was correct. Explain, in your own words, why being correct was not enough.",
  check_ar: "كان تنبيه الدانة صحيحاً. اشرح بكلماتك أنت لماذا لم يكن الصواب كافياً.",
};

/* ── 5. write the problem precisely (V2) ──────────────────── */

export const PRECISE = {
  ask_en: "Now write the problem. Not what happened. What the problem actually is, in one sentence, as exactly as you can.",
  ask_ar: "الآن اكتب المشكلة. لا ما حدث، بل ما هي المشكلة فعلاً، في جملة واحدة، بأدق ما تستطيع.",
  guard_en: "This is the assessment. Nobody is scoring your spelling. We are comparing this sentence to the one you wrote before you knew anything.",
  guard_ar: "هذا هو التقييم. لا أحد يقيّم إملاءك. نحن نقارن هذه الجملة بالتي كتبتها قبل أن تعرف شيئاً.",
};

/* ── 6. the case files ────────────────────────────────────── */

export type CaseFile = {
  id: string;
  n: string;
  /** How much help Hamad gives. It falls away across the three. */
  support: "guided" | "questioned" | "alone";
  name_en: string; name_ar: string;
  watched_en: string; watched_ar: string;
  mechanism_en: string; mechanism_ar: string;
  /** What the learner is asked to work out for themselves at this support level. */
  task_en: string; task_ar: string;
  /** Only shown when Hamad is guiding. */
  hamad_en?: string; hamad_ar?: string;
  broke_en: string; broke_ar: string;
};

export const FILES: CaseFile[] = [
  {
    id: "watch-network",
    n: "01",
    support: "guided",
    name_en: "Watch the whole network", name_ar: "راقب الشبكة كلها",
    watched_en: "Everything moving between machines",
    watched_ar: "كل ما يتحرك بين الأجهزة",
    mechanism_en: "Learn what an ordinary week looks like for every machine, then report anything that stops looking like itself.",
    mechanism_ar: "تعلّم كيف يبدو أسبوع عادي لكل جهاز، ثم بلّغ عن أي شيء يكف عن مشابهة نفسه.",
    task_en: "Find the sentence in this file that explains why it produced 863 alerts.",
    task_ar: "جد الجملة في هذا الملف التي تفسر لماذا أنتج ٨٦٣ تنبيهاً.",
    hamad_en: "I will do this one with you. Look at what it watches, then at what it has to decide. It sees everything and knows nothing about which of those things matters to a clinic. That is where the number comes from.",
    hamad_ar: "سأفعل هذا معك. انظر إلى ما يراقبه، ثم إلى ما عليه أن يقرره. إنه يرى كل شيء ولا يعرف أياً منها يهم عيادة. ومن هنا يأتي الرقم.",
    broke_en: "It was right and nobody read it",
    broke_ar: "كان محقاً ولم يقرأه أحد",
  },
  {
    id: "watch-machine",
    n: "02",
    support: "questioned",
    name_en: "Watch each machine", name_ar: "راقب كل جهاز",
    watched_en: "What programs actually do on one computer",
    watched_ar: "ما تفعله البرامج فعلاً على حاسوب واحد",
    mechanism_en: "Put a small watcher on every computer that records what each program does, and share what one machine learns with all the others within the hour.",
    mechanism_ar: "ضع مراقباً صغيراً على كل حاسوب يسجل ما يفعله كل برنامج، وشارك ما يتعلمه جهاز مع البقية خلال ساعة.",
    task_en: "Three Al Dana branches could not take this. Work out which three, and why.",
    task_ar: "ثلاثة من فروع الدانة لم تستطع قبول هذا. استنتج أيها الثلاثة، ولماذا.",
    hamad_en: "You have everything you need on the board. I am not going to point at it this time.",
    hamad_ar: "لديك كل ما تحتاجه على اللوحة. ولن أشير إليه هذه المرة.",
    broke_en: "Blind exactly where the X-ray machines were",
    broke_ar: "أعمى تماماً حيث أجهزة الأشعة",
  },
  {
    id: "watch-spread",
    n: "03",
    support: "alone",
    name_en: "Watch for spreading", name_ar: "راقب الانتشار",
    watched_en: "Movement from one machine toward the next",
    watched_ar: "التحرك من جهاز نحو الذي يليه",
    mechanism_en: "Ignore how it arrived. Watch for the small number of things anything must do to move sideways through a network, and rank by how far along it has got.",
    mechanism_ar: "تجاهل كيف وصل. راقب الأفعال القليلة التي يضطر أي شيء إلى فعلها ليتحرك جانبياً في شبكة، ورتّب بحسب المسافة التي قطعها.",
    task_en: "This one is yours. Say what it watches, what it assumes, and where it breaks. No help.",
    task_ar: "هذا لك. قل ماذا يراقب، وماذا يفترض، وأين ينكسر. بلا مساعدة.",
    broke_en: "Only speaks once something is already inside",
    broke_ar: "لا ينطق إلا بعد أن يكون شيء قد دخل فعلاً",
  },
];

/* ── 7. the table the learner builds ──────────────────────── */

export type Card = { id: string; file: string; slot: "watched" | "broke"; en: string; ar: string };

export const CARDS: Card[] = FILES.flatMap(f => ([
  { id: `${f.id}-watched`, file: f.id, slot: "watched" as const, en: f.watched_en, ar: f.watched_ar },
  { id: `${f.id}-broke`,   file: f.id, slot: "broke"   as const, en: f.broke_en,   ar: f.broke_ar },
]));

/* ── 8. toward the gap, without stating it ────────────────── */

export const GAP_ASKS: Ask[] = [
  {
    id: "opposite",
    q_en: "Two of the three watch opposite things. Which two, and what does each one call the truth?",
    q_ar: "اثنان من الثلاثة يراقبان أشياء متعاكسة. أيهما، وماذا يسمي كل منهما الحقيقة؟",
  },
  {
    id: "same-problem",
    q_en: "Were all three even solving the same problem? Say what problem each one thought it was solving.",
    q_ar: "هل كان ثلاثتهم يحلون المشكلة نفسها أصلاً؟ قل ما المشكلة التي ظن كل واحد أنه يحلها.",
  },
  {
    id: "shared",
    q_en: "Look at your table. Is there something every one of the three needs that Al Dana did not have?",
    q_ar: "انظر إلى جدولك. هل هناك شيء يحتاجه كل واحد من الثلاثة ولم يكن لدى الدانة؟",
    hint_en: "Two people. One on leave.",
    hint_ar: "شخصان. أحدهما في إجازة.",
  },
  {
    id: "missing",
    q_en: "So what is still missing?",
    q_ar: "إذاً، ما الذي ما زال ناقصاً؟",
  },
];

/* ── 9. the gap becomes a challenge ───────────────────────── */

// The learner has found the gap in their own words. Now it gets forced into a
// shape that can be built against. The template is the discipline: a solution
// that only satisfies the first blank is not an answer, and the last blank is
// what stops a child solving the problem by breaking something else.

export const CHALLENGE = {
  intro_en: "You found the gap. Now write it as a challenge, so somebody could actually build against it.",
  intro_ar: "وجدت الفجوة. الآن اكتبها تحدياً، بحيث يستطيع أحد أن يبني عليها فعلاً.",
  /** The sentence, split at the blanks. */
  parts_en: [
    "What is needed is a solution that can ",
    " while also ",
    " even when ",
    " is present, without causing ",
    ".",
  ],
  parts_ar: [
    "المطلوب حل يستطيع ",
    " وفي الوقت نفسه ",
    " حتى مع وجود ",
    " دون أن يسبب ",
    ".",
  ],
  hints_en: [
    "the thing it must achieve",
    "the second thing, which fights the first",
    "the condition that makes it hard",
    "the price nobody is allowed to pay",
  ],
  hints_ar: [
    "ما يجب أن يحققه",
    "الشيء الثاني، الذي يصارع الأول",
    "الظرف الذي يجعله صعباً",
    "الثمن الذي لا يُسمح بدفعه",
  ],
  rule_en: "Every blank has to come from your table. If one of them is a guess, you are inventing a problem instead of naming the one you found.",
  rule_ar: "كل فراغ يجب أن يأتي من جدولك. فإن كان أحدها تخميناً، فأنت تخترع مشكلة بدل أن تسمي التي وجدتها.",
};

/* ── 10. Company Next ─────────────────────────────────────── */

// Not a pitch and not a business. A reasoned proposal that knows what it
// assumes and knows how it could be shown to be wrong.

export const NEXT_ASKS: Ask[] = [
  {
    id: "cn-approach",
    q_en: "What would your solution actually do? Describe the mechanism, not the feeling.",
    q_ar: "ماذا سيفعل حلك فعلاً؟ صف الآلية، لا الشعور.",
    hint_en: "Not it would be safer. What happens, and to what.",
    hint_ar: "لا تقل سيكون أكثر أماناً. بل ماذا يحدث، ولأي شيء.",
  },
  {
    id: "cn-assume",
    q_en: "What does your idea assume is true?",
    q_ar: "ما الذي يفترض حلك أنه صحيح؟",
    hint_en: "All three of the others had one. Yours has one too.",
    hint_ar: "لكل واحد من الثلاثة افتراض. ولحلك افتراض أيضاً.",
  },
  {
    id: "cn-sacrifice",
    q_en: "What does it give up? Every choice gives something up.",
    q_ar: "ما الذي يتخلى عنه؟ كل اختيار يتخلى عن شيء.",
  },
  {
    id: "cn-break",
    q_en: "Where would yours break? Say it before somebody else does.",
    q_ar: "أين سينكسر حلك؟ قلها قبل أن يقولها غيرك.",
  },
  {
    id: "cn-test",
    q_en: "What is one test that could show you are wrong within a week?",
    q_ar: "ما التجربة الواحدة التي قد تكشف خطأك خلال أسبوع؟",
    hint_en: "If nothing could show you are wrong, it is not a proposal yet.",
    hint_ar: "إن لم يكن هناك ما يكشف خطأك، فهذا ليس مقترحاً بعد.",
  },
];

export const NEXT_CLOSE = {
  head_en: "This is a proposal, not a pitch.",
  head_ar: "هذا مقترح، لا عرض ترويجي.",
  body_en: "You said what it does, what it assumes, what it costs, where it fails, and how you would find out. That is more than most adults bring to a first meeting, and every part of it came out of a table you filled in yourself.",
  body_ar: "قلت ماذا يفعل، وماذا يفترض، وبماذا يكلف، وأين يخفق، وكيف ستتحقق. وهذا أكثر مما يحضره معظم الكبار إلى اجتماع أول، وكل جزء منه خرج من جدول ملأته بنفسك.",
};
