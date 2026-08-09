// ============================================================
// QUANTUM MAJLIS — THE PATH
//
// Not categories. A path: lessons are welded together and run in order.
// "The Locked Chest" ends on Rouda asking how a mind holds a thousand keys,
// and Grandfather reaching for the coin; "The Spinning Coin" answers it and
// loops back. Watching them out of order loses the thread, so the next lesson
// unlocks only once the previous one is done.
//
// Every lesson runs the same three beats:
//   video  — the story, simplified, with an analogy
//   board  — what the analogy really means, and where it breaks
//   lab    — the same idea, hands-on, always classical beside quantum
// ============================================================

export type StepId = "video" | "board" | "lab";

/** A board is built from small widgets rather than a wall of prose. */
export type Widget =
  | { kind: "recap";    title_en: string; title_ar: string; body_en: string; body_ar: string }
  /** The analogy on the left, what it actually maps to on the right. */
  | { kind: "mapping";  title_en: string; title_ar: string;
      rows: { story_en: string; story_ar: string; real_en: string; real_ar: string }[] }
  /**
   * The honest one. Every script here promises it: Grandfather says the coin
   * only helps you *imagine* a qubit, and that real ones are stranger. This is
   * where that debt gets paid, in every lesson.
   */
  | { kind: "caveat";   title_en: string; title_ar: string;
      items: { story_en: string; story_ar: string; truth_en: string; truth_ar: string }[] }
  /** Hard numbers, so "faster" never has to mean "magic". */
  | { kind: "numbers";  title_en: string; title_ar: string; note_en: string; note_ar: string;
      cols: [string, string, string];
      rows: [string, string, string][] }
  | { kind: "realworld"; title_en: string; title_ar: string;
      items: { head_en: string; head_ar: string; body_en: string; body_ar: string }[] };

/**
 * A lab is its own thing now, not a lesson's child. They live at /quantum/labs
 * and the list can grow without touching any path. Adding one is a component
 * plus a row here.
 */
export type Lab = {
  id: string;
  /** Which lesson it belongs beside. Null means it stands on its own. */
  lesson: string | null;
  /** false while someone is still building it. */
  ready: boolean;
  title_en: string; title_ar: string;
  blurb_en: string; blurb_ar: string;
  /** One line on the card: what you will actually do. */
  does_en: string; does_ar: string;
  minutes: number;
};

export const QUANTUM_LABS: Lab[] = [
  {
    id: "drawer-search",
    lesson: "locked-chest",
    ready: true,
    title_en: "The Cabinet of Drawers", title_ar: "خزانة الأدراج",
    blurb_en: "A static computer on the left, a quantum one on the right, on the same cabinet.",
    blurb_ar: "حاسوب ثابت على اليسار وحاسوب كمّي على اليمين، على الخزانة نفسها.",
    does_en: "Open drawers one at a time, or run the rounds and watch the wrong ones fade.",
    does_ar: "افتح الأدراج واحداً تلو الآخر، أو شغّل الجولات وشاهد الخاطئة تخفت.",
    minutes: 5,
  },
  {
    id: "scale",
    lesson: "locked-chest",
    ready: true,
    title_en: "How Big Does It Get?", title_ar: "كم يكبر الفارق؟",
    blurb_en: "The cabinet had sixteen drawers. Real locks have far more.",
    blurb_ar: "الخزانة كان فيها ستة عشر درجاً. الأقفال الحقيقية أكبر بكثير.",
    does_en: "Drag the ring up to a quintillion keys and watch the two machines pull apart.",
    does_ar: "اسحب عدد المفاتيح إلى كوينتليون وشاهد الفارق يتّسع.",
    minutes: 3,
  },
  {
    id: "coin",
    lesson: "spinning-coin",
    ready: false,
    title_en: "Spin, Measure, Repeat", title_ar: "أدِر، قِس، كرّر",
    blurb_en: "One flip proves nothing. A hundred flips show everything.",
    blurb_ar: "رمية واحدة لا تثبت شيئاً. مئة رمية تكشف كل شيء.",
    does_en: "Spin a coin and measure it, then do it a hundred times and watch the pattern appear.",
    does_ar: "أدِر عملة وقِسها، ثم كرّر ذلك مئة مرة وشاهد النمط يظهر.",
    minutes: 5,
  },
];

export const labById = (id: string) => QUANTUM_LABS.find(l => l.id === id);
export const labsForLesson = (slug: string) => QUANTUM_LABS.filter(l => l.lesson === slug);

export type QuantumLesson = {
  slug: string;
  order: number;
  name_en: string; name_ar: string;
  subtitle_en: string; subtitle_ar: string;
  /** The one question the lesson leaves you holding, which the next one answers. */
  hook_en: string; hook_ar: string;
  /** Null until the film is produced; the page shows a placeholder. */
  video: { src: string | null; poster: string | null; minutes: number };
  board: Widget[];
  /** Lab ids that belong beside this lesson. The lesson shows placeholders. */
  labs: string[];
};

export const QUANTUM_PATH: QuantumLesson[] = [
  // ── 1 ─────────────────────────────────────────────────────
  {
    slug: "locked-chest",
    order: 1,
    name_en: "The Locked Chest", name_ar: "الصندوق المقفل",
    subtitle_en: "Regular computers vs quantum computers",
    subtitle_ar: "الحواسيب العادية مقابل الحواسيب الكمّية",
    hook_en: "But how can your mind hold a thousand keys at the same time?",
    hook_ar: "لكن كيف يمكن لعقلك أن يمسك ألف مفتاح في الوقت نفسه؟",
    video: { src: "/quantum/locked-chest.mp4", poster: null, minutes: 4 },
    board: [
      {
        kind: "recap",
        title_en: "What you just saw", title_ar: "ما شاهدته للتو",
        body_en:
          "A thousand keys, one lock. Rouda tried them one at a time. Hamad held them all at once, until the wrong ones faded and one was left glowing.",
        body_ar:
          "ألف مفتاح وقفل واحد. جرّبتها رودة واحداً تلو الآخر. أما حمد فأمسكها كلها معاً، حتى خفتت الخاطئة وبقي واحد يلمع.",
      },
      {
        kind: "mapping",
        title_en: "What the story really means", title_ar: "ماذا تعني القصة حقاً",
        rows: [
          { story_en: "The thousand keys", story_ar: "المفاتيح الألف",
            real_en: "Every answer you could try. Scientists call it the search space.",
            real_ar: "كل إجابة يمكن أن تجرّبها. يسمّيها العلماء فضاء البحث." },
          { story_en: "Rouda, one key at a time", story_ar: "رودة، مفتاح تلو الآخر",
            real_en: "A normal computer: try one, cross it off, try the next.",
            real_ar: "حاسوب عادي: يجرّب واحدة، يشطبها، ثم ينتقل للتالية." },
          { story_en: "Hamad holding all the keys", story_ar: "حمد يمسك كل المفاتيح",
            real_en: "Superposition. The machine holds every possibility at once.",
            real_ar: "التراكب. تحمل الآلة كل الاحتمالات معاً." },
          { story_en: "The wrong keys fading", story_ar: "خفوت المفاتيح الخاطئة",
            real_en: "Interference, and the story got this right. Wrong answers cancel each other out. The right one grows brighter.",
            real_ar: "التداخل، وقد أصابته القصة. الإجابات الخاطئة يلغي بعضها بعضاً، والصحيحة تزداد سطوعاً." },
        ],
      },
      {
        kind: "caveat",
        title_en: "Where the story was simplifying", title_ar: "أين بسّطت القصة",
        items: [
          {
            story_en: "It looked like Hamad checked all thousand keys at once and instantly knew the answer.",
            story_ar: "بدا الأمر وكأن حمد فحص الألف مفتاح دفعة واحدة وعرف الجواب فوراً.",
            truth_en: "This is the thing most people get wrong. The machine does not read a thousand answers at once. Each round it pushes the wrong ones a little closer to cancelling out. That takes many rounds. It is fast, not instant.",
            truth_ar: "هذا أكثر ما يُفهم خطأً. الآلة لا تقرأ ألف إجابة دفعة واحدة. في كل جولة تدفع الخاطئة قليلاً نحو الإلغاء. وهذا يحتاج جولات كثيرة. سريع، لا فوري.",
          },
          {
            story_en: "Hamad simply opened his eyes and lifted the right key.",
            story_ar: "ما إن فتح حمد عينيه حتى رفع المفتاح الصحيح.",
            truth_en: "A real machine gives you the most likely key, not a certain one. So you run it again and check. Trying a key is quick. Finding it was the slow part.",
            truth_ar: "الآلة الحقيقية تعطيك المفتاح الأرجح لا المؤكّد. لذا تشغّلها مرة أخرى وتتحقق. تجربة مفتاح سريعة، والبطيء هو العثور عليه.",
          },
        ],
      },
      {
        kind: "numbers",
        title_en: "So how much faster, really?", title_ar: "إذن كم أسرع فعلاً؟",
        note_en: "Not instant. About the square root of the work. Still an enormous difference, and it is the honest number.",
        note_ar: "ليس فورياً. يقارب الجذر التربيعي للعمل. ويبقى فرقاً هائلاً، وهو الرقم الصادق.",
        cols: ["Keys on the ring", "Rouda's way (average)", "Hamad's way (rounds)"],
        rows: [
          ["16", "8", "3"],
          ["100", "50", "8"],
          ["1,000", "500", "25"],
          ["1,000,000", "500,000", "785"],
        ],
      },
      {
        kind: "realworld",
        title_en: "Where you meet this outside the majlis", title_ar: "أين تلتقي بهذا خارج المجلس",
        items: [
          { head_en: "Your phone is Rouda", head_ar: "هاتفك هو رودة",
            body_en: "Games, messages, photos. Normal computers do almost everything you touch, and do it better. Nobody needs a quantum computer for a cartoon.",
            body_ar: "الألعاب والرسائل والصور. الحواسيب العادية تدير كل ما تلمسه، وأفضل في ذلك. لا أحد يحتاج حاسوباً كمّياً لرسوم متحركة." },
          { head_en: "Quantum is a specialist", head_ar: "الكمّي متخصّص",
            body_en: "It earns its place on huge, messy problems: new medicines, new materials, better batteries.",
            body_ar: "يثبت جدواه في المسائل الضخمة: أدوية جديدة، ومواد جديدة، وبطاريات أفضل." },
          { head_en: "And it can pick some locks", head_ar: "وبإمكانه فتح بعض الأقفال",
            body_en: "Some locks that keep your messages private are exactly its speciality. That is a later lesson.",
            body_ar: "بعض الأقفال التي تحمي رسائلك هي تحديداً تخصّصه. وهذا درس لاحق." },
        ],
      },
    ],
    labs: ["drawer-search", "scale"],
  },

  // ── 2 ─────────────────────────────────────────────────────
  {
    slug: "spinning-coin",
    order: 2,
    name_en: "The Spinning Coin", name_ar: "العملة الدوّارة",
    subtitle_en: "Bits and qubits", subtitle_ar: "البتّات والكيوبتّات",
    hook_en: "Your coin is helping us imagine a qubit. Real qubits are much stranger.",
    hook_ar: "عملتك تساعدنا على تخيّل الكيوبت. أما الكيوبتّات الحقيقية فأغرب بكثير.",
    video: { src: "/quantum/spinning-coin.mp4", poster: null, minutes: 4 },
    board: [
      {
        kind: "recap",
        title_en: "What you just saw", title_ar: "ما شاهدته للتو",
        body_en:
          "Flat on the table, a coin is heads or tails. Spinning, you cannot say. Rouda brought her palm down and one answer was left.",
        body_ar:
          "على الطاولة، العملة إما وجه أو ظهر، لا الاثنين معاً. وحين تدور، لا تستطيع أن تقول أيّهما. وضعت رودة كفّها فمات الدوران وبقيت إجابة واحدة.",
      },
      {
        kind: "mapping",
        title_en: "What the story really means", title_ar: "ماذا تعني القصة حقاً",
        rows: [
          { story_en: "The flat coin", story_ar: "العملة المسطّحة",
            real_en: "A bit. Every photo and game on your phone is millions of these, each a 0 or a 1.",
            real_ar: "بِت. كل صورة وأغنية ولعبة في هاتفك هي ملايين منها، كل واحدة إما صفر أو واحد." },
          { story_en: "The spinning coin", story_ar: "العملة الدوّارة",
            real_en: "A qubit. Not yet 0, not yet 1, until you look.",
            real_ar: "كيوبت في حالة تراكب: ليس صفراً بعد ولا واحداً، يحمل الاثنين حتى يُقاس." },
          { story_en: "Rouda's palm coming down", story_ar: "كفّ رودة ينزل",
            real_en: "Measurement. Look, and all those possibilities collapse into one answer. For good.",
            real_ar: "القياس. انظر إلى الكيوبت فتنهار كل تلك الاحتمالات إلى إجابة واحدة بسيطة، بلا رجعة." },
          { story_en: "A handful spinning together", story_ar: "حفنة تدور معاً",
            real_en: "Each qubit you add doubles the possibilities. Ten hold 1,024. Sixty hold more than every grain of sand on Earth.",
            real_ar: "كل كيوبت تضيفه يضاعف الاحتمالات المحمولة معاً. عشرة كيوبتّات تحمل 1024. وستون تحمل أكثر من كل حبّة رمل على الأرض." },
        ],
      },
      {
        kind: "caveat",
        title_en: "Where the story was simplifying", title_ar: "أين بسّطت القصة",
        items: [
          {
            story_en: "A spinning coin holds heads and tails at the same time.",
            story_ar: "العملة الدوّارة تحمل الوجه والظهر في الوقت نفسه.",
            truth_en: "Grandfather said it himself: the coin only helps you imagine. A spinning coin really does have a side facing up every instant. You just cannot see it. A qubit does not. There is no hidden answer waiting to be found. Nothing you can hold behaves like that.",
            truth_ar: "قالها الجد بنفسه: العملة تساعدك على التخيّل فقط. العملة الدوّارة لها فعلاً وجه محدّد للأعلى في كل لحظة، لكنك لا تراه. أما الكيوبت فلا. قبل أن تقيسه، لا توجد إجابة مخفية محسومة سلفاً تنتظر أن تُكتشف. وهذا هو الجزء الغريب حقاً، ولا يفعله أي شيء نراه في حياتنا.",
          },
          {
            story_en: "Measure it and you get your answer.",
            story_ar: "قِسه فتحصل على إجابتك.",
            truth_en: "One measurement tells you almost nothing. A qubit carries the chance of each answer, so scientists run it hundreds of times and read the pattern. One flip proves nothing. A hundred flips show everything.",
            truth_ar: "قياس واحد لا يخبرك بشيء تقريباً. الكيوبت يحمل احتمال كل نتيجة، لذا يعيد العلماء التجربة مئات المرات ويقرؤون النمط في النتائج. في المختبر سترى أن رمية واحدة لا تثبت شيئاً، ومئة رمية تكشف كل شيء.",
          },
        ],
      },
      {
        kind: "realworld",
        title_en: "Why they are kept so cold", title_ar: "لماذا تُحفظ شديدة البرودة",
        items: [
          { head_en: "The spin is fragile", head_ar: "الدوران هشّ",
            body_en: "A knock on the table stops a spinning coin. Heat and light do the same to a qubit, and the answer collapses too early.",
            body_ar: "طرقة على الطاولة توقف العملة الدوّارة. والحرارة والضوء والاهتزاز تفعل الشيء ذاته بالكيوبت، فتنهار الإجابة قبل أن يكتمل العمل." },
          { head_en: "Colder than space", head_ar: "أبرد من الفضاء",
            body_en: "So they are cooled to almost absolute zero, colder than deep space, just to keep the coins spinning long enough.",
            body_ar: "تُبرَّد كثير من الحواسيب الكمّية إلى ما يقارب الصفر المطلق، أبرد من أعماق الفضاء، فقط لإبقاء العملات تدور مدة كافية لتكون مفيدة." },
        ],
      },
    ],
    labs: ["coin"],
  },
];

/** Stations still being written. They show on the path, greyed, so the shape is visible. */
export const QUANTUM_UPCOMING = [
  { name_en: "Entangled Twins",  name_ar: "التوأمان المتشابكان",
    sub_en: "Two particles that always agree", sub_ar: "جسيمان يتّفقان دائماً" },
  { name_en: "Quantum Keys",     name_ar: "المفاتيح الكمّية",
    sub_en: "The crossover back into CyberMajlis", sub_ar: "التقاطع عودةً إلى المجلس السيبراني" },
  { name_en: "Ask a Scientist",  name_ar: "اسأل عالِماً",
    sub_en: "A live session with a quantum researcher", sub_ar: "جلسة حيّة مع باحث كمّي" },
];

export const lessonBySlug = (slug: string) => QUANTUM_PATH.find(l => l.slug === slug);

/** Steps run in order inside a lesson, and the lesson is done when all three are. */
export const STEP_ORDER: StepId[] = ["video", "board", "lab"];
