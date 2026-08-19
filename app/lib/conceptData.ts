// ============================================================
// BACKGROUND KNOWLEDGE
//
// The other half of the innovation track, and the half that carries the same
// weight as the gates. A learner cannot judge a limitation until they
// understand the mechanism, or they read a fundamental constraint as a design
// failure and the whole analysis is worthless.
//
// These are NOT the majalis' own lessons. A QuantumMajlis film is one beat of a
// gated story path: four minutes, a hook at the end, meaningless out of order.
// A concept film here is self-contained and ends by releasing you: enough to
// picture a mechanism, then a door to the majlis that goes properly deep.
//
// EDGES ARE TYPED FROM DAY ONE. The ontology engine is a later problem, but the
// relationships are recorded now, so nothing has to be re-authored when the
// library is big enough for the engine to pay for itself.
// ============================================================

export type EdgeType =
  /** You genuinely cannot understand the next thing without this. */
  | "hard"
  /** Having it makes the next thing easier. Its absence does not block. */
  | "soft"
  /** Enriches understanding but is not needed to enter. */
  | "enriches"
  /** Crosses into another majlis. Real transfer, not a decorative link. */
  | "bridge";

export type Edge = { from: string; to: string; type: EdgeType };

export type ConceptState = "known" | "open" | "loop" | "locked";

export type Check = {
  q_en: string; q_ar: string;
  /** "explain" cannot be marked by a machine alone; "recall" can. Both are kept
      because a multiple choice question cannot test whether someone understood. */
  kind: "recall" | "explain";
};

export type Concept = {
  id: string;
  /** Which domain's map this sits on. Concepts can be shared later; the bridge
      edge already records where one reaches into another majlis. */
  domain: string;
  state: ConceptState;
  name_en: string; name_ar: string;
  /** One line, on the card. */
  line_en: string; line_ar: string;
  minutes: number;
  /** What the learner can picture afterwards. Written as a capability, not a topic. */
  picture_en: string; picture_ar: string;
  /** The mechanism, in plain words. This is the actual teaching. */
  body_en: string[]; body_ar: string[];
  /** Where the simple version stops being true. Same move the quantum lesson
      boards make, carried here so the whole company teaches one way. */
  caveat_en: string; caveat_ar: string;
  checks: Check[];
  /** The majlis that goes properly deep on this, if there is one. */
  deeper?: { href: string; en: string; ar: string; tone: string };
};

export const CONCEPTS: Concept[] = [
  {
    id: "internet",
    domain: "cybersecurity",
    state: "known",
    name_en: "How a message crosses the world", name_ar: "كيف تعبر الرسالة العالم",
    line_en: "Nothing travels. It is copied, over and over.",
    line_ar: "لا شيء يسافر. بل يُنسخ، مرة بعد مرة.",
    minutes: 4,
    picture_en: "A message being cut into pieces, taking different roads, and being put back together at the other end.",
    picture_ar: "رسالة تُقطّع إلى أجزاء، تسلك طرقاً مختلفة، ثم تُجمع من جديد في الطرف الآخر.",
    body_en: [
      "When you send a photo to your cousin, the photo does not fly anywhere. It is chopped into small numbered pieces, and each piece is copied from one machine to the next until it arrives.",
      "The pieces do not have to travel together, and often they do not. They take whatever road is free, arrive out of order, and get reassembled by the number written on each one.",
      "This is why a bad connection loses part of a picture rather than all of it, and it is the fact everything else in this track rests on.",
    ],
    body_ar: [
      "حين ترسل صورة إلى ابن عمك، فالصورة لا تطير إلى أي مكان. بل تُقطَّع إلى أجزاء صغيرة مرقّمة، ويُنسخ كل جزء من جهاز إلى الذي يليه حتى يصل.",
      "ولا يلزم أن تسافر الأجزاء معاً، وغالباً لا تفعل. تسلك أي طريق خال، وتصل غير مرتبة، ثم تُجمع بالرقم المكتوب على كل جزء.",
      "لهذا يضيع جزء من الصورة عند ضعف الاتصال لا الصورة كلها، وهذه هي الحقيقة التي يقوم عليها كل ما بعدها في هذا المسار.",
    ],
    caveat_en: "The film draws one clean road between two machines. In reality a message may cross twenty machines owned by twenty different companies, and you do not get to choose any of them.",
    caveat_ar: "يرسم الفيلم طريقاً واحداً نظيفاً بين جهازين. أما في الواقع فقد تعبر الرسالة عشرين جهازاً تملكها عشرون شركة مختلفة، ولا تختار أنت أياً منها.",
    checks: [
      { q_en: "If the pieces arrive out of order, how does the other machine know how to put them back?", q_ar: "إذا وصلت الأجزاء غير مرتبة، فكيف يعرف الجهاز الآخر كيف يجمعها؟", kind: "recall" },
      { q_en: "In your own words, why does a weak connection lose part of a photo instead of all of it?", q_ar: "بكلماتك أنت، لماذا يضيع جزء من الصورة عند ضعف الاتصال بدل أن تضيع كلها؟", kind: "explain" },
    ],
  },
  {
    id: "malware",
    domain: "cybersecurity",
    state: "known",
    name_en: "Software written to work against you", name_ar: "برمجيات كُتبت ضدك",
    line_en: "It is not magic and it is not alive. Somebody wrote it.",
    line_ar: "ليست سحراً وليست حية. أحدهم كتبها.",
    minutes: 4,
    picture_en: "A program doing exactly what it was told, where what it was told is bad for you.",
    picture_ar: "برنامج يفعل تماماً ما أُمر به، وما أُمر به ضار بك.",
    body_en: [
      "Every program is a list of instructions. Malware is a list of instructions somebody wrote on purpose to do something you would not agree to: copy your files, lock them, watch what you type, or quietly use your machine to attack someone else.",
      "It does not break into a computer the way a thief breaks a window. Almost always it is invited in, because it arrived looking like something you wanted, or because it used a mistake in software you already trusted.",
      "Nothing about it is clever in the way films suggest. Most of it is ordinary code doing an ordinary thing to the wrong person.",
    ],
    body_ar: [
      "كل برنامج قائمة تعليمات. والبرمجية الخبيثة قائمة تعليمات كتبها أحدهم عمداً لتفعل ما لن ترضى به: نسخ ملفاتك، أو قفلها، أو مراقبة ما تكتب، أو استعمال جهازك بهدوء لمهاجمة غيرك.",
      "وهي لا تقتحم الحاسوب كما يكسر اللص نافذة. بل تُدعى للدخول في الغالب، لأنها وصلت بمظهر شيء أردته، أو لأنها استغلت خطأ في برنامج كنت تثق به أصلاً.",
      "ولا شيء فيها بارع كما توحي الأفلام. معظمها شيفرة عادية تفعل شيئاً عادياً بالشخص الخطأ.",
    ],
    caveat_en: "Calling it a virus makes it sound like it spreads by itself the way an illness does. Most of it needs a person to click something first, which is why the person matters more than the software.",
    caveat_ar: "تسميتها فيروساً توحي بأنها تنتشر وحدها كما ينتشر المرض. ومعظمها يحتاج إلى شخص ينقر شيئاً أولاً، ولهذا فالإنسان أهم من البرنامج.",
    checks: [
      { q_en: "Name two different things malware might be written to do.", q_ar: "اذكر شيئين مختلفين قد تُكتب البرمجية الخبيثة لفعلهما.", kind: "recall" },
      { q_en: "Why do we say most malware is invited in rather than breaking in?", q_ar: "لماذا نقول إن معظم البرمجيات الخبيثة تُدعى للدخول بدل أن تقتحم؟", kind: "explain" },
    ],
    deeper: { href: "/dashboard/malware", en: "Four malware lessons in CyberMajlis", ar: "أربعة دروس عن البرمجيات الخبيثة في المجلس السيبراني", tone: "#A8323F" },
  },
  {
    id: "normal-traffic",
    domain: "cybersecurity",
    state: "known",
    name_en: "What normal looks like", name_ar: "كيف يبدو الوضع الطبيعي",
    line_en: "You cannot notice something strange until you know what ordinary is.",
    line_ar: "لا يمكنك ملاحظة الغريب قبل أن تعرف المألوف.",
    minutes: 5,
    picture_en: "A week of ordinary behaviour on a network, and the shape it makes.",
    picture_ar: "أسبوع من السلوك العادي على الشبكة، والشكل الذي يرسمه.",
    body_en: [
      "A school network has a rhythm. Machines wake at seven, the library computers talk to the printer and almost nothing else, and the office machine that handles salaries talks to two servers and never to a laptop in a classroom.",
      "None of that is written down anywhere. It is just what happens, every week, and it can be measured.",
      "Once you have measured it, you have something to compare against. The interesting question stops being is this file dangerous and becomes has this machine ever done this before.",
    ],
    body_ar: [
      "لشبكة المدرسة إيقاع. تستيقظ الأجهزة في السابعة، وتتحدث حواسيب المكتبة إلى الطابعة ولا شيء غيرها تقريباً، وجهاز الإدارة الذي يتولى الرواتب يتحدث إلى خادمين ولا يتحدث أبداً إلى حاسوب في فصل.",
      "ولا شيء من هذا مكتوب في أي مكان. إنه فقط ما يحدث، كل أسبوع، ويمكن قياسه.",
      "وحين تقيسه يصبح لديك ما تقارن به. فيتوقف السؤال المهم عن كونه هل هذا الملف خطير، ويصير هل سبق لهذا الجهاز أن فعل هذا من قبل.",
    ],
    caveat_en: "Normal is not one fixed thing. A school in the first week of term looks nothing like the same school in the holidays, and a system that has not learned that will cry wolf every September.",
    caveat_ar: "الطبيعي ليس شيئاً واحداً ثابتاً. فالمدرسة في أول أسبوع دراسي لا تشبه نفسها في العطلة، والنظام الذي لم يتعلم ذلك سيطلق إنذاراً كاذباً كل سبتمبر.",
    checks: [
      { q_en: "Give one example of normal behaviour on a school network.", q_ar: "أعط مثالاً واحداً على سلوك طبيعي في شبكة مدرسة.", kind: "recall" },
      { q_en: "Why is has this machine ever done this before a more useful question than is this file dangerous?", q_ar: "لماذا يكون سؤال هل فعل هذا الجهاز ذلك من قبل أنفع من سؤال هل هذا الملف خطير؟", kind: "explain" },
    ],
  },
  {
    id: "behavioural-detection",
    domain: "cybersecurity",
    state: "loop",
    name_en: "Catching what you have never seen", name_ar: "اصطياد ما لم تره قط",
    line_en: "Watch behaviour instead of matching a list.",
    line_ar: "راقب السلوك بدل مطابقة قائمة.",
    minutes: 5,
    picture_en: "Why a list of known threats can never catch a threat written yesterday.",
    picture_ar: "لماذا لا تستطيع قائمة التهديدات المعروفة اصطياد تهديد كُتب البارحة.",
    body_en: [
      "The old way was a list. Somebody finds a nasty program, writes down what it looks like, and every machine checks new files against the list. It works, and it is fast, and it has one fatal hole: it can only ever catch something that has already been caught somewhere else first.",
      "So the question changed. Instead of what does this look like, ask what is this doing. A program that suddenly opens ten thousand files and rewrites every one of them is behaving like ransomware whether or not anyone has seen this particular ransomware before.",
      "That is the whole idea, and it is why the previous concept mattered: behaviour only means something if you already measured what ordinary behaviour was.",
    ],
    body_ar: [
      "كانت الطريقة القديمة قائمة. يجد أحدهم برنامجاً خبيثاً، ويسجل شكله، فتقارن كل الأجهزة الملفات الجديدة بالقائمة. وهي تنجح وتكون سريعة، لكن فيها ثغرة قاتلة: لا تصطاد إلا ما سبق اصطياده في مكان آخر.",
      "فتغيّر السؤال. بدل ما شكل هذا، صار ماذا يفعل هذا. فالبرنامج الذي يفتح فجأة عشرة آلاف ملف ويعيد كتابتها كلها يتصرف كبرمجية فدية، سواء رأى أحد هذه البرمجية بعينها من قبل أم لا.",
      "هذه هي الفكرة كلها، ولهذا كان المفهوم السابق مهماً: فالسلوك لا يعني شيئاً إن لم تكن قد قست أصلاً ما هو السلوك العادي.",
    ],
    caveat_en: "Watching behaviour does not remove the problem, it moves it. Now you get false alarms instead of misses, and a team drowning in false alarms eventually stops reading them, which is its own kind of blindness.",
    caveat_ar: "مراقبة السلوك لا تزيل المشكلة بل تنقلها. فصرت تحصل على إنذارات كاذبة بدل الإخفاق في الاصطياد، والفريق الغارق في الإنذارات الكاذبة يكف عن قراءتها في النهاية، وهذا عمى من نوع آخر.",
    checks: [
      { q_en: "What is the one thing a list of known threats can never catch?", q_ar: "ما الشيء الوحيد الذي لا تستطيع قائمة التهديدات المعروفة اصطياده أبداً؟", kind: "recall" },
      { q_en: "In your own words, why does watching behaviour create a new problem of its own?", q_ar: "بكلماتك أنت، لماذا تصنع مراقبة السلوك مشكلة جديدة خاصة بها؟", kind: "explain" },
      { q_en: "A machine in the library starts sending files to an address in another country at 3am. Which question catches this, and why?", q_ar: "جهاز في المكتبة يبدأ بإرسال ملفات إلى عنوان في بلد آخر عند الثالثة فجراً. أي سؤال يكشف هذا، ولماذا؟", kind: "explain" },
    ],
  },
  {
    id: "endpoints",
    domain: "cybersecurity",
    state: "open",
    name_en: "The machine on the desk", name_ar: "الجهاز على الطاولة",
    line_en: "The last place a defence can stand, and the place people actually sit.",
    line_ar: "آخر موضع يمكن أن يقف فيه الدفاع، وهو الموضع الذي يجلس فيه الناس فعلاً.",
    minutes: 4,
    picture_en: "Why guarding the door of a building does not protect what happens between its rooms.",
    picture_ar: "لماذا لا تحمي حراسة باب المبنى ما يحدث بين غرفه.",
    body_en: [
      "An endpoint is any machine a person actually uses: a laptop, a phone, the computer at reception. It is where the work happens, and it is where the mistake happens.",
      "For years the defence was built at the edge, like a guard on the door of a building. That guard checks everyone coming in from the street, and checks nobody walking between rooms once they are inside.",
      "So defenders moved inwards and started putting a watcher on each machine. It sees things the door guard cannot, and it costs more, and somebody has to install it on every single one.",
    ],
    body_ar: [
      "الجهاز الطرفي أي جهاز يستعمله إنسان فعلاً: حاسوب محمول، أو هاتف، أو حاسوب الاستقبال. وهو موضع العمل، وهو موضع الخطأ.",
      "وسنوات طويلة بُني الدفاع عند الحافة، كحارس على باب مبنى. يفتش ذلك الحارس كل قادم من الشارع، ولا يفتش أحداً يمشي بين الغرف بعد أن يدخل.",
      "فانتقل المدافعون إلى الداخل وبدأوا يضعون مراقباً على كل جهاز. يرى ما لا يراه حارس الباب، ويكلف أكثر، ويحتاج من يثبته على كل جهاز بلا استثناء.",
    ],
    caveat_en: "A watcher on every machine sounds complete until you count the machines nobody remembered: the old computer running one hospital scanner, which cannot be updated because the scanner would stop working.",
    caveat_ar: "يبدو وضع مراقب على كل جهاز حلاً كاملاً حتى تعد الأجهزة التي لم يتذكرها أحد: الحاسوب القديم الذي يشغل جهاز مسح في مستشفى، ولا يمكن تحديثه لأن جهاز المسح سيتوقف.",
    checks: [
      { q_en: "What is an endpoint? Give two examples.", q_ar: "ما الجهاز الطرفي؟ أعط مثالين.", kind: "recall" },
      { q_en: "Explain why a guard at the door of a building is a good picture of a firewall, and where the picture stops being true.", q_ar: "اشرح لماذا يصلح حارس باب المبنى صورةً لجدار الحماية، وأين تتوقف الصورة عن الصدق.", kind: "explain" },
    ],
    deeper: { href: "/dashboard/do-it-yourself", en: "Secure your own devices in CyberMajlis", ar: "أمّن أجهزتك أنت في المجلس السيبراني", tone: "#A8323F" },
  },
  {
    id: "encryption",
    domain: "cybersecurity",
    state: "known",
    name_en: "Locking a message", name_ar: "قفل الرسالة",
    line_en: "Scrambling something so only one person can unscramble it.",
    line_ar: "خلط شيء بحيث لا يفكه إلا شخص واحد.",
    minutes: 5,
    picture_en: "A message that stays sealed even while a stranger is holding it.",
    picture_ar: "رسالة تبقى مغلقة حتى وهي في يد غريب.",
    body_en: [
      "Your message crosses machines you do not own, so you have to assume a stranger will hold it at some point. Encryption accepts that and makes it not matter: what the stranger holds is scrambled, and unscrambling it requires a key they do not have.",
      "The clever part is that the lock and the key can be different. You can hand out the lock to the whole world, let anyone seal a message to you, and keep the only thing that opens it.",
      "That trick is what makes buying something online possible at all, and it rests on a piece of arithmetic that is easy to do forwards and enormously slow to undo.",
    ],
    body_ar: [
      "تعبر رسالتك أجهزة لا تملكها، فعليك أن تفترض أن غريباً سيمسكها في لحظة ما. والتشفير يقبل ذلك ويجعله بلا أثر: فما يمسكه الغريب مخلوط، وفكه يحتاج مفتاحاً لا يملكه.",
      "والبارع في الأمر أن القفل والمفتاح قد يختلفان. فيمكنك أن توزع القفل على العالم كله، وتدع أي أحد يغلق رسالة إليك، وتحتفظ وحدك بما يفتحها.",
      "وهذه الحيلة هي ما يجعل الشراء عبر الإنترنت ممكناً أصلاً، وهي تقوم على عملية حسابية سهلة في اتجاه وبطيئة جداً في عكسه.",
    ],
    caveat_en: "Easy forwards and slow backwards is a statement about the machines we have now. It is not a law of nature, which is exactly why the next door matters.",
    caveat_ar: "سهلة في اتجاه وبطيئة في عكسه عبارة عن الأجهزة التي نملكها اليوم. وليست قانوناً من قوانين الطبيعة، ولهذا بالضبط يهم الباب التالي.",
    checks: [
      { q_en: "Why can you safely give the lock to everyone?", q_ar: "لماذا يمكنك أن تعطي القفل للجميع بأمان؟", kind: "recall" },
      { q_en: "The arithmetic is easy forwards and slow backwards. What would break if a machine arrived that made it fast backwards?", q_ar: "العملية الحسابية سهلة في اتجاه وبطيئة في عكسه. ماذا سينكسر لو ظهر جهاز يجعلها سريعة في العكس؟", kind: "explain" },
    ],
    deeper: { href: "/quantum", en: "Quantum Keys, in QuantumMajlis", ar: "المفاتيح الكمّية، في مجلس الكم", tone: "#2E9C6E" },
  },
  {
    id: "zero-day",
    domain: "cybersecurity",
    state: "locked",
    name_en: "A hole nobody has patched", name_ar: "ثغرة لم يرقّعها أحد",
    line_en: "The mistake that is already in the software you trust.",
    line_ar: "الخطأ الموجود أصلاً في البرنامج الذي تثق به.",
    minutes: 4,
    picture_en: "Why a repair existing is not the same as a repair being installed.",
    picture_ar: "لماذا وجود الإصلاح شيء وتثبيته شيء آخر.",
    body_en: [
      "Software is written by people, so it contains mistakes. Some of those mistakes can be used to make the program do something it was never meant to do.",
      "A zero day is one of those mistakes that the people who wrote the software do not know about yet. They have had zero days to fix it.",
      "The uncomfortable part is what happens after they do know. A repair gets released, and then somebody has to install it on every machine, and that is where the story usually goes wrong.",
    ],
    body_ar: [
      "يكتب الناس البرمجيات، فتحتوي على أخطاء. وبعض تلك الأخطاء يمكن استعماله لجعل البرنامج يفعل ما لم يُقصد له قط.",
      "وثغرة اليوم صفر واحدة من تلك الأخطاء التي لا يعلم بها بعد من كتبوا البرنامج. فقد مرّ عليهم صفر من الأيام لإصلاحها.",
      "والجزء المزعج ما يحدث بعد أن يعلموا. إذ يصدر الإصلاح، ثم يجب أن يثبته أحد على كل جهاز، وهنا تسوء القصة عادة.",
    ],
    caveat_en: "The name suggests speed is the problem. Usually it is not. The 2017 hospital attack used a hole that had been repaired two months earlier.",
    caveat_ar: "يوحي الاسم بأن السرعة هي المشكلة. وغالباً ليست كذلك. فهجوم المستشفيات عام 2017 استعمل ثغرة كانت قد أُصلحت قبل شهرين.",
    checks: [
      { q_en: "Why is it called a zero day?", q_ar: "لماذا سميت ثغرة اليوم صفر؟", kind: "recall" },
      { q_en: "Give one reason a hospital might not install a repair it knows about.", q_ar: "أعط سبباً واحداً قد يمنع مستشفى من تثبيت إصلاح يعلم به.", kind: "explain" },
    ],
  },
];

export const EDGES: Edge[] = [
  { from: "internet", to: "malware", type: "hard" },
  { from: "internet", to: "normal-traffic", type: "hard" },
  { from: "internet", to: "endpoints", type: "hard" },
  { from: "internet", to: "encryption", type: "hard" },
  { from: "normal-traffic", to: "behavioural-detection", type: "hard" },
  { from: "malware", to: "behavioural-detection", type: "soft" },
  { from: "malware", to: "zero-day", type: "hard" },
  { from: "endpoints", to: "behavioural-detection", type: "enriches" },
  { from: "encryption", to: "quantum-keys", type: "bridge" },
];

export const conceptById = (id: string) => CONCEPTS.find(c => c.id === id);

/** What must be true before this concept opens, with the type of each link. */
export const prereqsOf = (id: string) =>
  EDGES.filter(e => e.to === id).map(e => ({ ...e, concept: conceptById(e.from) }));

/** What this concept opens up once it is known. */
export const unlockedBy = (id: string) =>
  EDGES.filter(e => e.from === id).map(e => ({ ...e, concept: conceptById(e.to) }));

export const EDGE_LABEL: Record<EdgeType, { en: string; ar: string }> = {
  hard:     { en: "You must know this first",     ar: "يجب أن تعرف هذا أولاً" },
  soft:     { en: "Makes it easier",              ar: "يجعله أسهل" },
  enriches: { en: "Adds something extra",         ar: "يضيف شيئاً إضافياً" },
  bridge:   { en: "Crosses into another majlis",  ar: "يعبر إلى مجلس آخر" },
};

/** Concepts a given problem in the library expects you to hold first. */
export const NEEDED_FOR: Record<string, string[]> = {
  wannacry: ["malware", "normal-traffic", "behavioural-detection", "zero-day"],
  falls: ["internet"],
  wards: [],
  carpark: [],
};

export const conceptsForDomain = (d: string) => CONCEPTS.filter(c => c.domain === d);
