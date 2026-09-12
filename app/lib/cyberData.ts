// ============================================================
// CYBERMAJLIS: CONCEPTS AND REAL CASES
//
// This is not Majlis. Majlis raises people who find problems worth solving.
// CyberMajlis does the older and plainer job: making somebody understand what
// they are protecting and what happens when it is not protected.
//
// So no gap framing, no company decomposition, no Company Next. A concept, what
// it really is, the kinds of it that exist, where it stops working, and then the
// real cases that show why any of it mattered.
//
// The order is reversed from Majlis on purpose. There, you hold the concepts
// before you may read a case. Here, the case sits underneath the concept as the
// reason to care about it.
// ============================================================

export type BoardList = { name_en: string; name_ar: string; body_en: string; body_ar: string };

export type Concept = {
  slug: string;
  name_en: string; name_ar: string;
  /** The metaphor, in the child's words, before anything technical. */
  line_en: string; line_ar: string;
  /** A film, or the storybook. */
  media: { kind: "video" | "book"; src?: string; minutes: number };
  cover?: string;
  board: {
    /** What they just watched, said back. */
    saw_en: string; saw_ar: string;
    /** The same thing, named. */
    is_en: string; is_ar: string;
    /** Why anyone bothers. */
    why_en: string; why_ar: string;
    kinds_title_en: string; kinds_title_ar: string;
    kinds: BoardList[];
    /** Where the simple picture stops being true. */
    stops_en: string; stops_ar: string;
  };
  quiz: {
    q_en: string; q_ar: string;
    options_en: string[]; options_ar: string[];
    right: number;
    why_en: string; why_ar: string;
  };
  /** Real cases that show why this one matters. */
  cases: string[];
};

export const CONCEPTS: Concept[] = [
  {
    slug: "firewall",
    name_en: "Firewall", name_ar: "جدار الحماية",
    line_en: "A guard at the gate, deciding what is allowed in.",
    line_ar: "حارس على البوابة، يقرر ما الذي يُسمح له بالدخول.",
    media: { kind: "book", minutes: 5 },
    board: {
      saw_en: "A guard stands at the gate of a neighbourhood. He checks what arrives and decides what may come through. But once a delivery is inside, it moves from house to house without passing him again.",
      saw_ar: "يقف حارس على بوابة حيّ. يفحص ما يصل ويقرر ما الذي يمر. لكن متى دخلت التوصيلة، انتقلت من بيت إلى بيت دون أن تمر به مرة أخرى.",
      is_en: "That guard is a firewall. It sits where your network meets everything else, and every piece of traffic has to go past it. It checks each one against a list of rules and either lets it through or drops it.",
      is_ar: "ذلك الحارس هو جدار الحماية. يقف حيث تلتقي شبكتك بكل ما عداها، وكل ما يمر لا بد أن يمر به. يفحص كل قطعة مقابل قائمة قواعد، فإما يمررها أو يسقطها.",
      why_en: "Without one, anything on the internet can knock on any door you have. A firewall is what makes most of those doors stop answering.",
      why_ar: "بدونه يستطيع أي شيء على الإنترنت أن يطرق أي باب لديك. وجدار الحماية هو ما يجعل معظم تلك الأبواب تتوقف عن الرد.",
      kinds_title_en: "Kinds of guard", kinds_title_ar: "أنواع الحرّاس",
      kinds: [
        { name_en: "Packet filter", name_ar: "مرشّح الحزم",
          body_en: "Reads only the label: where it came from, where it is going, which door it wants. Fast, and it never looks inside.",
          body_ar: "يقرأ العنوان فقط: من أين جاء، وإلى أين، وأي باب يريد. سريع، ولا ينظر إلى الداخل أبداً." },
        { name_en: "Stateful firewall", name_ar: "الجدار المتتبّع",
          body_en: "Remembers conversations. A reply is allowed in only if you were the one who started it.",
          body_ar: "يتذكّر المحادثات. فلا يُسمح للرد بالدخول إلا إن كنت أنت من بدأها." },
        { name_en: "Web application firewall", name_ar: "جدار حماية التطبيقات",
          body_en: "Stands in front of a website and reads the actual request, so it can stop somebody hiding a command inside a search box.",
          body_ar: "يقف أمام موقع ويقرأ الطلب نفسه، فيمنع من يخبئ أمراً داخل خانة البحث." },
        { name_en: "Next generation firewall", name_ar: "الجدار من الجيل التالي",
          body_en: "Recognises which app and which person, not just which address. A rule can then say Ahmed may, and a stranger may not.",
          body_ar: "يميّز أي تطبيق وأي شخص، لا العنوان فحسب. فتستطيع القاعدة أن تقول: أحمد نعم، والغريب لا." },
        { name_en: "Block list and allow list", name_ar: "قائمة المنع وقائمة السماح",
          body_en: "A block list says everyone except these. An allow list says nobody except these. The second is much safer and much more work.",
          body_ar: "قائمة المنع تقول: الجميع إلا هؤلاء. وقائمة السماح تقول: لا أحد إلا هؤلاء. والثانية أأمن بكثير وأشق بكثير." },
        { name_en: "Behaviour based", name_ar: "القائم على السلوك",
          body_en: "Learns what your ordinary traffic looks like and flags what does not fit. Catches things nobody has seen before, and cries wolf more often.",
          body_ar: "يتعلّم شكل حركتك المعتادة ويشير إلى ما لا يشبهها. يلتقط ما لم يره أحد من قبل، ويطلق إنذارات كاذبة أكثر." },
      ],
      stops_en: "A gate sees what crosses the gate. It cannot see what happens between the houses. That is why one firewall at the edge is never the whole answer.",
      stops_ar: "البوابة ترى ما يعبرها. ولا ترى ما يحدث بين البيوت. ولهذا لا يكون جدار واحد على الحافة هو الجواب كله.",
    },
    quiz: {
      q_en: "A delivery moves from one house to another inside the neighbourhood. Does the guard see it?",
      q_ar: "تنتقل توصيلة من بيت إلى آخر داخل الحي. هل يراها الحارس؟",
      options_en: ["No, it never passes the gate again", "Yes, he sees everything in the neighbourhood", "Only if it is carrying something heavy"],
      options_ar: ["لا، فهي لا تمر بالبوابة مرة أخرى", "نعم، فهو يرى كل شيء في الحي", "فقط إن كانت تحمل شيئاً ثقيلاً"],
      right: 0,
      why_en: "That is the whole limit of a gate, and it is exactly how one infected machine can reach a hundred others.",
      why_ar: "وهذا هو حدّ البوابة كله، وهو بعينه كيف يصل جهاز واحد مصاب إلى مئة غيره.",
    },
    cases: ["hospital", "therapy-notes"],
  },
  {
    slug: "zero-day",
    name_en: "Zero day", name_ar: "ثغرة اليوم صفر",
    line_en: "A hole in the wall that nobody has fixed yet.",
    line_ar: "ثقب في الجدار لم يصلحه أحد بعد.",
    media: { kind: "video", src: "/concepts/Hole.mp4", minutes: 4 },
    board: {
      saw_en: "A wall built out of thousands of small blocks, and one of them has a gap all the way through. Nobody in the street is looking at it. Later a new block arrives on every doorstep, and some houses never pick theirs up.",
      saw_ar: "جدار مبني من آلاف القوالب الصغيرة، وفي أحدها فتحة تنفذ إلى الجهة الأخرى. ولا أحد في الشارع ينظر إليها. ثم يصل قالب جديد إلى كل عتبة، وبعض البيوت لا ترفع قالبها أبداً.",
      is_en: "Software is written by people, so it has mistakes in it. Some mistakes are a way in. A zero day is one that the people who built it do not know about yet: they have had zero days to fix it.",
      is_ar: "يكتب الناس البرمجيات، ففيها أخطاء. وبعض الأخطاء طريق للدخول. وثغرة اليوم صفر واحدة لا يعلم بها من بنوها بعد: فقد مرّ عليهم صفر من الأيام لإصلاحها.",
      why_en: "There is no repair to install, so being careful and up to date does not save you. That is what makes this one different from every other kind of hole.",
      why_ar: "لا يوجد إصلاح لتثبّته، فالحذر والتحديث لا ينقذانك. وهذا ما يجعل هذه مختلفة عن كل ثقب آخر.",
      kinds_title_en: "The words people use", kinds_title_ar: "الكلمات التي يستعملها الناس",
      kinds: [
        { name_en: "The hole itself", name_ar: "الثغرة نفسها",
          body_en: "A vulnerability: the mistake sitting in the software, doing nothing, waiting to be found.",
          body_ar: "ثغرة: الخطأ القابع في البرنامج، لا يفعل شيئاً، ينتظر من يجده." },
        { name_en: "The tool for it", name_ar: "الأداة لها",
          body_en: "An exploit: something written on purpose to use that hole. The hole is the gap; this is the crowbar.",
          body_ar: "استغلال: شيء كُتب عمداً لاستعمال تلك الثغرة. الثغرة هي الفتحة، وهذا هو العتلة." },
        { name_en: "The repair", name_ar: "الإصلاح",
          body_en: "A patch: the new block. It has to be carried to every single machine, and that is where it usually goes wrong.",
          body_ar: "رقعة: القالب الجديد. ويجب حملها إلى كل جهاز، وهنا تسوء الأمور عادة." },
        { name_en: "Known but not fixed", name_ar: "معروفة ولم تُصلح",
          body_en: "Far more common than a true zero day. The repair exists, everyone knows about the hole, and the machine still has it.",
          body_ar: "أكثر شيوعاً بكثير من ثغرة اليوم صفر الحقيقية. الإصلاح موجود، والثغرة معروفة للجميع، وما زالت في الجهاز." },
        { name_en: "The machine that cannot be fixed", name_ar: "الجهاز الذي لا يُصلَح",
          body_en: "Some machines are approved as one whole thing. Change the software and the approval no longer holds, so nobody changes it.",
          body_ar: "بعض الأجهزة معتمدة ككتلة واحدة. غيّر البرنامج فيسقط الاعتماد، فلا يغيّره أحد." },
        { name_en: "A patch you can fake", name_ar: "رقعة مؤقتة",
          body_en: "Virtual patching: a rule on the firewall that blocks the attack while you wait for the real repair.",
          body_ar: "الترقيع الافتراضي: قاعدة على جدار الحماية تمنع الهجوم ريثما ينتظر الإصلاح الحقيقي." },
      ],
      stops_en: "The name makes it sound like a race against time. Usually it is not. The hospitals in 2017 were hit through a hole that had been repaired two months earlier.",
      stops_ar: "يوحي الاسم بأنها سباق مع الوقت. وغالباً ليست كذلك. فمستشفيات ٢٠١٧ أُصيبت عبر ثغرة كانت قد أُصلحت قبل شهرين.",
    },
    quiz: {
      q_en: "A repair for the hole has existed for two months. Why did the hospitals still get hit?",
      q_ar: "وُجد إصلاح للثغرة قبل شهرين. فلماذا أُصيبت المستشفيات رغم ذلك؟",
      options_en: [
        "Nobody had installed it on those machines",
        "The repair did not actually work",
        "The attackers found a brand new hole",
      ],
      options_ar: [
        "لم يثبّته أحد على تلك الأجهزة",
        "لأن الإصلاح لم ينجح فعلاً",
        "لأن المهاجمين وجدوا ثغرة جديدة تماماً",
      ],
      right: 0,
      why_en: "A repair that exists and a repair that is installed are two different things, and the gap between them is where most of the damage lives.",
      why_ar: "الإصلاح الموجود والإصلاح المثبَّت شيئان مختلفان، وفي المسافة بينهما يعيش معظم الضرر.",
    },
    cases: ["hospital"],
  },
];

export const conceptBySlug = (slug: string) => CONCEPTS.find(c => c.slug === slug);

/* ── real cases ───────────────────────────────────────────── */

export type RealCase = {
  slug: string;
  name_en: string; name_ar: string;
  when_en: string; when_ar: string;
  line_en: string; line_ar: string;
  /** Card art and film poster. Falls back to /lessons/covers/<slug>.jpg. */
  cover?: string;
  video?: string;
  minutes: number;
  /** The attack's own name, because a child who hears it on the news should
      be able to connect it to what they watched. */
  called_en: string; called_ar: string;
  /** What happened, plainly. */
  story_en: string[]; story_ar: string[];
  /** How it actually worked, step by step. This is the awareness part: a case
      here exists to be understood, not to be admired for its consequences. */
  how_en: { head_en: string; body_en: string }[];
  how_ar: { head_ar: string; body_ar: string }[];
  /** How it ended. */
  stopped_en: string; stopped_ar: string;
  /** The lesson that teaches the thing this attack used. `why` is the line
      above it: a case pointing at a mechanism lesson and a case pointing at a
      Why You lesson are not there for the same reason, so neither can share
      one hardcoded label. */
  lesson?: { href: string; en: string; ar: string; why_en?: string; why_ar?: string };
  /** The reason this case is here: what it cost people, off the screen. */
  cost_en: { head_en: string; body_en: string }[];
  cost_ar: { head_ar: string; body_ar: string }[];
  /** The sentence the whole case exists for. */
  point_en: string; point_ar: string;
  /** What Hamad and Rouda say once the cost is on the screen. They react to
      this case in particular, so the poses are named per case. */
  react?: { who: "hamad" | "rouda"; pose?: string; en: string; ar: string }[];
  concepts: string[];
};

export const CASES: RealCase[] = [
  {
    slug: "hospital",
    name_en: "The hospitals that had to say no", name_ar: "المستشفيات التي اضطرت أن تعتذر",
    called_en: "WannaCry", called_ar: "واناكراي",
    when_en: "May 2017", when_ar: "مايو ٢٠١٧",
    line_en: "Software locked the computers. What broke was the care.",
    line_ar: "قفلت برمجية الحواسيب. لكن الذي انكسر هو الرعاية.",
    video: "/Hospital-case.mp4",
    minutes: 5,
    /* The first line is the lead, set on its own. The rest sit beside each
       other, because one narrow column in a wide panel leaves half of it
       empty. */
    story_en: [
      "On a Friday morning in May 2017, the computers in a hospital turned red one after another and asked for money.",
      "By Sunday the same red screen was on more than two hundred thousand computers in over a hundred and fifty countries. Factory lines stopped. Train boards went blank. It wanted three hundred dollars, and six hundred if you waited three days.",
      "Nobody clicked on anything. No one opened a strange message. The computers were switched on that morning like any other morning.",
    ],
    story_ar: [
      "في صباح جمعة من مايو ٢٠١٧، احمرّت حواسيب مستشفى واحداً بعد الآخر وطلبت مالاً.",
      "وبحلول الأحد كانت الشاشة الحمراء نفسها على أكثر من مئتي ألف حاسوب في أكثر من مئة وخمسين دولة. توقفت خطوط مصانع. وفرغت لوحات محطات القطار. وطلبت ثلاثمئة دولار، وستمئة إن انتظرت ثلاثة أيام.",
      "لم يضغط أحد على شيء. ولم يفتح أحد رسالة غريبة. شُغّلت الحواسيب ذلك الصباح كأي صباح.",
    ],
    how_en: [
      { head_en: "It locked the files",
        body_en: "WannaCry is ransomware. It scrambles your files with a key and keeps the key, so everything is still there and none of it can be read. It is the same locking that protects your own messages, turned around." },
      { head_en: "It walked in through a hole in Windows",
        body_en: "Older Windows machines had a flaw in the part that shares files between computers on the same network. A tool for using that flaw had been stolen and published online weeks earlier." },
      { head_en: "The repair already existed",
        body_en: "Microsoft had released a fix in March, two months before. Any machine that had installed it was safe. Enormous numbers of machines had not." },
      { head_en: "It copied itself, machine to machine",
        body_en: "This is what made it different. Once inside one computer on a network it looked for others and let itself in, without a person, without an email, without a click. One infected machine could take a whole hospital." },
      { head_en: "Some machines could not be repaired at all",
        body_en: "The scanners that photograph people are approved as one whole thing, software included. Changing that software would have meant the machine was no longer approved for use on patients. So it stayed as it was, hole and all." },
    ],
    how_ar: [
      { head_ar: "قفلت الملفات",
        body_ar: "واناكراي برمجية فدية. تخلط ملفاتك بمفتاح وتحتفظ بالمفتاح، فيبقى كل شيء موجوداً ولا يُقرأ منه شيء. إنه القفل نفسه الذي يحمي رسائلك، معكوساً." },
      { head_ar: "دخلت من ثغرة في ويندوز",
        body_ar: "في أجهزة ويندوز القديمة خلل في الجزء الذي يتشارك الملفات بين حواسيب الشبكة الواحدة. وكانت أداة لاستعمال ذلك الخلل قد سُرقت ونُشرت على الإنترنت قبل أسابيع." },
      { head_ar: "الإصلاح كان موجوداً أصلاً",
        body_ar: "أصدرت مايكروسوفت إصلاحاً في مارس، قبل شهرين. وكل جهاز ثبّته كان بأمان. وأعداد هائلة من الأجهزة لم تثبّته." },
      { head_ar: "نسخت نفسها من جهاز إلى جهاز",
        body_ar: "وهذا ما جعلها مختلفة. فمتى دخلت حاسوباً واحداً في شبكة، بحثت عن غيره وأدخلت نفسها، بلا إنسان وبلا بريد وبلا ضغطة. جهاز واحد مصاب يكفي لأخذ مستشفى كامل." },
      { head_ar: "وبعض الأجهزة تعذّر إصلاحها أصلاً",
        body_ar: "أجهزة الفحص التي تصوّر الناس معتمدة ككتلة واحدة، ببرمجياتها. وتغيير تلك البرمجيات يعني أن الجهاز لم يعد معتمداً للاستعمال على المرضى. فبقي كما هو، بثغرته." },
    ],
    stopped_en: "It was stopped almost by accident. A researcher taking the software apart noticed it checked for a particular web address before doing anything, and that nobody owned that address. He bought it, for about ten dollars, and the spreading stopped. Nothing about the damage already done was undone.",
    stopped_ar: "أُوقفت بالمصادفة تقريباً. لاحظ باحث يفكك البرمجية أنها تتحقق من عنوان إلكتروني معيّن قبل أن تفعل أي شيء، وأن ذلك العنوان لا يملكه أحد. فاشتراه بنحو عشرة دولارات، فتوقف الانتشار. ولم يُلغَ شيء من الضرر الذي وقع.",
    lesson: { href: "/dashboard/malware/ransomware", en: "The Ransomware lesson", ar: "درس برمجيات الفدية" },
    cost_en: [
      { head_en: "Nineteen thousand appointments did not happen",
        body_en: "Almost seven thousand were confirmed cancelled and the full figure was estimated at over nineteen thousand. Every one of them was a person who had waited for that date." },
      { head_en: "Five hospitals turned ambulances away",
        body_en: "Emergency departments sent patients somewhere else, which means somebody who was already unwell travelled further before anybody saw them." },
      { head_en: "Operations were postponed",
        body_en: "Not cancelled forever. Postponed, which for somebody waiting on a result is not a small word." },
    ],
    cost_ar: [
      { head_ar: "تسعة عشر ألف موعد لم يحدث",
        body_ar: "أُلغي نحو سبعة آلاف مؤكدة، وقُدّر الرقم الكامل بأكثر من تسعة عشر ألفاً. وكل واحد منها إنسان انتظر ذلك التاريخ." },
      { head_ar: "خمسة مستشفيات ردّت سيارات الإسعاف",
        body_ar: "أرسلت أقسام الطوارئ المرضى إلى مكان آخر، أي أن مريضاً متعباً أصلاً سافر أبعد قبل أن يراه أحد." },
      { head_ar: "تأجلت عمليات",
        body_ar: "لم تُلغَ إلى الأبد. بل أُجّلت، وهي كلمة ليست صغيرة على من ينتظر نتيجة." },
    ],
    react: [
      { who: "hamad", pose: "thinking",
        en: "Nobody clicked anything. That is the part people find hardest to believe.",
        ar: "لم يضغط أحد على شيء. وهذا أصعب ما يصدّقه الناس." },
      { who: "rouda", pose: "curious",
        en: "And the repair had been sitting there for two months. Having a fix and installing it are two different things.",
        ar: "وكان الإصلاح موجوداً منذ شهرين. فوجود الإصلاح وتثبيته شيئان مختلفان." },
    ],
    point_en: "When people hear about an attack they think of stolen files. This one stole time from people who had none to spare. It walked out of the computer and into a hospital corridor.",
    point_ar: "حين يسمع الناس بهجوم يفكرون في ملفات مسروقة. أما هذا فسرق وقتاً من أناس لا فائض لديهم منه. خرج من الحاسوب ودخل ممرّ مستشفى.",
    concepts: ["zero-day", "firewall"],
  },
  {
    slug: "therapy-notes",
    name_en: "The notes that were sent back to the people who said them",
    name_ar: "الملاحظات التي أُعيدت إلى من قالوها",
    called_en: "The Vastaamo breach", called_ar: "اختراق فاستامو",
    when_en: "Finland · 2018 to 2024", when_ar: "فنلندا · ٢٠١٨ إلى ٢٠٢٤",
    line_en: "A therapy company was robbed. The demand for money went to the patients.",
    line_ar: "سُرقت شركة علاج نفسي. فذهب طلب المال إلى المرضى.",
    cover: "/cases/vastaamo.jpeg",
    video: "/cases/vastaamo.mp4",
    minutes: 3,
    story_en: [
      "In 2020, tens of thousands of people in Finland opened their email and found a stranger quoting their own therapy sessions back at them.",
      "Vastaamo was the largest private therapy company in the country. It ran 25 clinics, and it also treated patients sent to it by the public health service. Every session note went from the clinic computer into one central database.",
      "That database had been left open on the internet two years earlier. Nobody told the patients until the stranger did.",
    ],
    story_ar: [
      "في سنة ٢٠٢٠ فتح عشرات الآلاف في فنلندا بريدهم، فوجدوا غريباً يقتبس عليهم جلساتهم النفسية هم.",
      "كانت فاستامو أكبر شركة علاج نفسي خاصة في البلاد. تدير ٢٥ عيادة، وتعالج أيضاً مرضى ترسلهم إليها الخدمة الصحية العامة. وكانت كل ملاحظة جلسة تنتقل من حاسوب العيادة إلى قاعدة بيانات مركزية واحدة.",
      "وكانت تلك القاعدة قد تُركت مفتوحة على الإنترنت قبل ذلك بسنتين. ولم يخبر أحد المرضى حتى أخبرهم الغريب.",
    ],
    how_en: [
      { head_en: "Everything was kept in one place",
        body_en: "A therapist wrote a note on the clinic computer, and the note went into a single central database run by the company. One database held the records of every patient in every clinic. Reaching that one place meant reaching all of them." },
      { head_en: "The database had no password",
        body_en: "In 2018 it was connected straight to the internet, and the account that controlled all of it had no password on it. The attacker did not have to break anything open. The door was already open." },
      { head_en: "The records were not encrypted",
        body_en: "Names, ID numbers and the session notes were saved as ordinary readable text, with nothing removed to hide who was who. So whatever was copied could be read immediately. Around 33,000 people's records were taken." },
      { head_en: "Nobody noticed for almost two years",
        body_en: "There was not enough record-keeping to say exactly when the data left. The company knew about the security problem in 2019. The patients found out in 2020, when the extortion emails arrived." },
      { head_en: "The demand moved from the company to the patients",
        body_en: "The attacker asked the company for 40 bitcoin, around 450,000 euros. The company did not pay, and records began being released. He then emailed patients one at a time, asking each of them for about 200 euros, rising if they waited. Around 24,000 people went to the police." },
    ],
    how_ar: [
      { head_ar: "كان كل شيء محفوظاً في مكان واحد",
        body_ar: "يكتب المعالج ملاحظة على حاسوب العيادة، فتذهب الملاحظة إلى قاعدة بيانات مركزية واحدة تديرها الشركة. قاعدة واحدة فيها سجلات كل مريض في كل عيادة. فالوصول إلى ذلك المكان الواحد وصول إليهم جميعاً." },
      { head_ar: "ولم يكن على القاعدة كلمة سر",
        body_ar: "في سنة ٢٠١٨ كانت موصولة بالإنترنت مباشرة، والحساب المتحكم بها كلها بلا كلمة سر. فلم يحتج المهاجم إلى كسر شيء. كان الباب مفتوحاً أصلاً." },
      { head_ar: "ولم تكن السجلات مشفّرة",
        body_ar: "كانت الأسماء وأرقام الهوية وملاحظات الجلسات محفوظة نصاً عادياً مقروءاً، ولم يُحذف منها ما يخفي هوية أصحابها. فما نُسخ منها قُرئ فوراً. وأُخذت سجلات نحو ٣٣ ألف إنسان." },
      { head_ar: "ولم ينتبه أحد قرابة سنتين",
        body_ar: "لم يكن التدوين كافياً لمعرفة وقت خروج البيانات بالضبط. عرفت الشركة بالمشكلة الأمنية سنة ٢٠١٩. وعرف المرضى سنة ٢٠٢٠، حين وصلت رسائل الابتزاز." },
      { head_ar: "وانتقل الطلب من الشركة إلى المرضى",
        body_ar: "طلب المهاجم من الشركة أربعين بتكوين، نحو أربعمئة وخمسين ألف يورو. فلم تدفع، وبدأ نشر السجلات. ثم راسل المرضى واحداً واحداً، وطلب من كل واحد نحو مئتي يورو، تزيد إن تأخر. وذهب نحو ٢٤ ألف شخص إلى الشرطة." },
    ],
    stopped_en: "The company did not survive. Vastaamo went bankrupt in 2021, and Finland's data protection authority fined it 608,000 euros. The attacker, Aleksanteri Kivimäki, was arrested in France in 2023 and convicted by a Finnish court in 2024, and went to prison for more than six years. None of that put the notes back.",
    stopped_ar: "لم تنجُ الشركة. أفلست فاستامو سنة ٢٠٢١، وغرّمتها هيئة حماية البيانات الفنلندية ستمئة وثمانية آلاف يورو. أما المهاجم، أليكسانتيري كيفيماكي، فاعتُقل في فرنسا سنة ٢٠٢٣، وأدانته محكمة فنلندية سنة ٢٠٢٤، ودخل السجن أكثر من ست سنوات. ولم يُعِد شيء من ذلك الملاحظات.",
    lesson: {
      href: "/dashboard/why-you/therapist",
      en: "Why You: the people who keep other people's secrets",
      ar: "لماذا أنت: من يحفظون أسرار الناس",
      why_en: "If this is your work", why_ar: "إن كان هذا عملك",
    },
    cost_en: [
      { head_en: "About 33,000 people",
        body_en: "Every one of them had told somebody something they had told nobody else. Written down, that was the file." },
      { head_en: "About 24,000 went to the police",
        body_en: "One of the largest numbers of criminal complaints ever filed over a single case in Finland." },
      { head_en: "Finland changed the law",
        body_en: "An ID number normally stays with a person for life and cannot be changed. Thousands of them were now public, so the country made it possible to be given a new one." },
    ],
    cost_ar: [
      { head_ar: "نحو ٣٣ ألف إنسان",
        body_ar: "كل واحد منهم قال لأحد شيئاً لم يقله لغيره. وذلك، مكتوباً، هو الملف." },
      { head_ar: "ونحو ٢٤ ألفاً ذهبوا إلى الشرطة",
        body_ar: "من أكبر أعداد البلاغات الجنائية التي قُدّمت في قضية واحدة في فنلندا." },
      { head_ar: "وغيّرت فنلندا القانون",
        body_ar: "رقم الهوية يبقى مع صاحبه مدى العمر ولا يُغيَّر عادة. وصارت آلاف منها علنية، فأتاحت البلاد إعطاء رقم جديد." },
    ],
    react: [
      { who: "rouda", pose: "scared",
        en: "The part I cannot get past is that they were asked to pay to keep their own words private.",
        ar: "ما لا أستطيع تجاوزه أنهم طُلب منهم أن يدفعوا ليبقى كلامهم هم سرّاً." },
      { who: "hamad", pose: "explaining",
        en: "And none of the four things that went wrong needed a clever attacker. They needed somebody to check.",
        ar: "ولم يحتج أي من الأخطاء الأربعة إلى مهاجم ذكي. بل احتاجت إلى من يتفقّد." },
    ],
    point_en: "There was no single mistake here, and no single fix. One password, or encryption, or someone watching the records, or telling the patients in 2019 would each have made this smaller. All four were missing at once. The door of the therapy room was closed the whole time. The question is who was supposed to be checking the other doors.",
    point_ar: "لم يكن هنا خطأ واحد، ولا إصلاح واحد. كلمة سر، أو تشفير، أو من يراقب السجلات، أو إخبار المرضى سنة ٢٠١٩: كل واحد منها كان سيصغّر ما حدث. وقد غابت الأربعة معاً. أما باب غرفة العلاج فكان مغلقاً طوال الوقت. والسؤال: من كان عليه أن يتفقد الأبواب الأخرى؟",
    concepts: ["firewall"],
  },
];

export const caseBySlug = (slug: string) => CASES.find(c => c.slug === slug);
