// ============================================================
// THE CASE JOURNEY
//
// Rules this content obeys:
//   short. A child reads less than half of a long paragraph.
//   a choice wherever a choice will do. Writing is reserved for evidence.
//   every answer gets answered. Nothing is typed into a void.
//   support fades: guided, then questioned, then alone.
//   what was taught comes back later, at least once.
//   no button explains itself. Next is enough.
// ============================================================

export type Choice = {
  en: string; ar: string;
  /** Said back the moment it is chosen. This is what turns a form into a person. */
  react_en: string; react_ar: string;
};

export type Ask = {
  id: string;
  q_en: string; q_ar: string;
  hint_en?: string; hint_ar?: string;
  /** No right answer exists. Rouda may only push back for not answering. */
  open?: boolean;
  /** Present means it is a choice, not a box. */
  choices?: Choice[];
  /** For free text: said back once something is written. */
  react_en?: string; react_ar?: string;
  by?: "hamad" | "rouda";
};

export type Beat = { en: string; ar: string };

export type Evidence = {
  id: string;
  tag_en: string; tag_ar: string;
  head_en: string; head_ar: string;
  body_en: string; body_ar: string;
  turn?: boolean;
};

export type Flow = {
  scene_en: string[]; scene_ar: string[];
  hook_en: string; hook_ar: string;
  initial: Ask[];
  evidence: Evidence[];
  reconsider: Ask[];
  discovery: {
    open_en: string; open_ar: string;
    asks: Ask[];
    reveal_en: string; reveal_ar: string;
    concept_en: string; concept_ar: string;
    body_en: string[]; body_ar: string[];
    check: Ask;
  };
  /** The assessment. Write the problem precisely. */
  precise: Ask;
  /** Support level per approach id, in the order they are opened. */
  films: Record<string, {
    support: "guided" | "questioned" | "alone";
    beats: Beat[];
    ask: Ask;
  }>;
  /** What was taught at Discovery, asked again here. */
  retrieval: Ask;
  discussion: Ask[];
  gap: Ask;
  challenge: {
    parts_en: string[]; parts_ar: string[];
    hints_en: string[]; hints_ar: string[];
    rule_en: string; rule_ar: string;
  };
  next: Ask[];
  reflect: Ask;
};

export const FLOWS: Record<string, Flow> = {
  "ransomware-hospitals": {
    scene_en: [
      "It is Friday morning.",
      "Hospital computers stop working. Patient records will not open. A screen asks for money.",
      "Operations are cancelled. Ambulances are sent to other towns. Nineteen thousand appointments do not happen.",
    ],
    scene_ar: [
      "إنه صباح الجمعة.",
      "تتوقف حواسيب المستشفيات. لا تُفتح سجلات المرضى. وتطلب شاشة مالاً.",
      "تُلغى العمليات. وتُرسل سيارات الإسعاف إلى مدن أخرى. وتسعة عشر ألف موعد لا تتم.",
    ],
    hook_en: "They had security teams, firewalls and antivirus. Why did this still happen?",
    hook_ar: "كانت لديهم فرق أمن وجدران حماية ومكافح فيروسات. فلماذا حدث هذا رغم ذلك؟",

    initial: [
      {
        id: "what", open: true, by: "hamad",
        q_en: "What do you think happened?", q_ar: "ماذا تظن أنه حدث؟",
        hint_en: "No right answer yet.", hint_ar: "لا إجابة صحيحة بعد.",
        react_en: "Saved. You will read this back at the end and see how far you moved.",
        react_ar: "حُفظت. ستقرؤها في النهاية وترى كم تغيّرت.",
      },
      {
        id: "who", by: "hamad",
        q_en: "Who failed here?", q_ar: "من أخفق هنا؟",
        choices: [
          { en: "The attacker", ar: "المهاجم",
            react_en: "True, and they are responsible. But nobody could have stopped them from outside. Hold that thought.",
            react_ar: "صحيح، وهو المسؤول. لكن لا أحد كان ليوقفه من الخارج. احتفظ بهذه الفكرة." },
          { en: "The staff who clicked", ar: "الموظفون الذين نقروا",
            react_en: "Most people say this. Keep it. We will come back to it, and you may want to change it.",
            react_ar: "معظم الناس يقولون هذا. احتفظ به. سنعود إليه، وقد ترغب في تغييره." },
          { en: "The people who run the computers", ar: "من يديرون الحواسيب",
            react_en: "Closer than most guesses. Watch what happens when you see what they were allowed to change.",
            react_ar: "أقرب من معظم التخمينات. انتبه لما يحدث حين ترى ما كان مسموحاً لهم بتغييره." },
          { en: "Nobody. It was bad luck", ar: "لا أحد. مجرد سوء حظ",
            react_en: "Hold on to that. If the board changes your mind, that is worth noticing.",
            react_ar: "تمسّك بذلك. فإن غيّرت اللوحة رأيك، فذلك يستحق الملاحظة." },
        ],
      },
      {
        id: "fix", by: "hamad",
        q_en: "What would you fix first?", q_ar: "ما أول ما تصلحه؟",
        choices: [
          { en: "Train the staff better", ar: "تدريب الموظفين أفضل",
            react_en: "Reasonable. Notice whether the evidence supports it.",
            react_ar: "معقول. انتبه إن كانت الأدلة تدعمه." },
          { en: "Buy stronger software", ar: "شراء برامج أقوى",
            react_en: "This is the answer most companies sell. We will test it.",
            react_ar: "هذه الإجابة التي تبيعها معظم الشركات. سنختبرها." },
          { en: "Keep everything updated", ar: "إبقاء كل شيء محدّثاً",
            react_en: "Remember you said this. One of the cards will make it harder than it sounds.",
            react_ar: "تذكّر أنك قلت هذا. إحدى البطاقات ستجعله أصعب مما يبدو." },
        ],
      },
    ],

    evidence: [
      { id: "firewalls", tag_en: "Defences", tag_ar: "الدفاعات",
        head_en: "They already had firewalls", head_ar: "كانت لديهم جدران حماية أصلاً",
        body_en: "Security budgets, security teams, equipment at the edge of every network. Nobody was ignoring this.",
        body_ar: "ميزانيات أمن، وفرق أمن، ومعدات عند حافة كل شبكة. لم يكن أحد يتجاهل الأمر." },
      { id: "patch", tag_en: "The repair", tag_ar: "الإصلاح",
        head_en: "A fix existed, two months before the attack",
        head_ar: "كان الإصلاح موجوداً قبل الهجوم بشهرين",
        body_en: "The exact hole was closed in March. Most machines that fell had never installed it.",
        body_ar: "أُغلقت الثغرة نفسها في مارس. ومعظم الأجهزة التي سقطت لم تثبّته قط." },
      { id: "devices", tag_en: "The machines", tag_ar: "الأجهزة", turn: true,
        head_en: "Some medical machines could not be updated at all",
        head_ar: "بعض الأجهزة الطبية لم يكن يمكن تحديثها إطلاقاً",
        body_en: "Update the scanner and the scanner stops working. On an ordinary day, the scanner matters more.",
        body_ar: "حدّث الماسح فيتوقف الماسح. وفي يوم عادي، الماسح أهم." },
      { id: "spread", tag_en: "The spread", tag_ar: "الانتشار",
        head_en: "It travelled on the network built to help patients",
        head_ar: "سافر عبر الشبكة التي بُنيت لمساعدة المرضى",
        body_en: "Records are shared so any hospital can read them. That is the point of it, and it was the road.",
        body_ar: "تُشارَك السجلات ليقرأها أي مستشفى. هذا غرضها، وكان هو الطريق." },
      { id: "staff", tag_en: "The people", tag_ar: "الناس",
        head_en: "Staff were not the main cause",
        head_ar: "لم يكن الموظفون السبب الرئيسي",
        body_en: "The patch, the unpatchable scanner and the trusting network were all there before anyone clicked anything.",
        body_ar: "الإصلاح، والماسح غير القابل للتحديث، والشبكة الواثقة، كانت كلها موجودة قبل أن ينقر أحد." },
    ],

    reconsider: [
      {
        id: "revise", by: "hamad",
        q_en: "You said the failure was somebody's. Still?", q_ar: "قلت إن الإخفاق كان من أحدهم. أما زلت؟",
        choices: [
          { en: "I changed my mind", ar: "غيّرت رأيي",
            react_en: "That is the whole point of the board. Changing your mind on evidence is the skill.",
            react_ar: "هذا هو غرض اللوحة كله. تغيير رأيك أمام الدليل هو المهارة." },
          { en: "Partly", ar: "جزئياً",
            react_en: "Say which part survived. That part is probably the real one.",
            react_ar: "قل أي جزء صمد. فذلك الجزء هو الحقيقي غالباً." },
          { en: "No, I still think the same", ar: "لا، ما زلت أرى الرأي نفسه",
            react_en: "Fine, but be ready to defend it against the scanner card.",
            react_ar: "حسن، لكن كن مستعداً للدفاع عنه أمام بطاقة الماسح." },
        ],
      },
      {
        id: "cost", open: true, by: "hamad",
        q_en: "Pick one card and fix it. Who pays for that fix?",
        q_ar: "اختر بطاقة واحدة وأصلحها. من يدفع ثمن ذلك الإصلاح؟",
        react_en: "Good. Every fix here costs somebody something, and that is why none of them happened.",
        react_ar: "جيد. كل إصلاح هنا يكلف أحداً شيئاً، ولهذا لم يحدث أي منها.",
      },
    ],

    discovery: {
      open_en: "One answer people reach for straight away: alert on everything.",
      open_ar: "حل يهرع إليه الناس فوراً: نبّه على كل شيء.",
      asks: [
        {
          id: "alert-all", by: "hamad",
          q_en: "Should security alert every time something unusual happens?",
          q_ar: "هل ينبه الأمن كلما حدث شيء غير معتاد؟",
          choices: [
            { en: "Yes, catch everything", ar: "نعم، أمسك كل شيء",
              react_en: "Alright. Let us follow that.", react_ar: "حسناً. لنتبع ذلك." },
            { en: "No, only important things", ar: "لا، المهم فقط",
              react_en: "Then who decides what is important, before anyone knows what it is?",
              react_ar: "فمن يقرر ما هو المهم، قبل أن يعرف أحد ما هو؟" },
          ],
        },
        {
          id: "how-many", by: "hamad",
          q_en: "That gives about a thousand alerts a week. Who reads them?",
          q_ar: "هذا يعطي نحو ألف تنبيه أسبوعياً. من يقرؤها؟",
          choices: [
            { en: "The security team", ar: "فريق الأمن",
              react_en: "Two people. Sometimes one, if somebody is away.",
              react_ar: "شخصان. وأحياناً واحد، إن كان أحدهم غائباً." },
            { en: "A computer", ar: "حاسوب",
              react_en: "A computer raised them. Something still has to decide which ones are real.",
              react_ar: "الحاسوب هو من أطلقها. ويبقى شيء ما عليه أن يقرر أيها حقيقي." },
          ],
        },
        {
          id: "after-month", by: "hamad",
          q_en: "You read them, every day, for a month. Nearly all are nothing. What happens to you?",
          q_ar: "تقرؤها كل يوم لشهر. وكلها تقريباً لا شيء. ماذا يحدث لك؟",
          choices: [
            { en: "I read them all carefully", ar: "أقرؤها كلها بتمعن",
              react_en: "Honestly? Nobody does. Not for a month.",
              react_ar: "بصدق؟ لا أحد يفعل. ليس لشهر." },
            { en: "I start skimming", ar: "أبدأ بالتصفح السريع",
              react_en: "Yes. And skimming is how the real one goes past.",
              react_ar: "نعم. والتصفح السريع هو كيف يمر الحقيقي." },
            { en: "I stop reading them", ar: "أتوقف عن قراءتها",
              react_en: "You just described what beat these hospitals.",
              react_ar: "لقد وصفت للتو ما هزم هذه المستشفيات." },
          ],
        },
      ],
      reveal_en: "That has a name.",
      reveal_ar: "لهذا اسم.",
      concept_en: "False alarms", concept_ar: "الإنذارات الكاذبة",
      body_en: [
        "The old defence was a list of known bad programs. Fast, and blind to anything written yesterday.",
        "So the question changed to what is this doing. A program rewriting ten thousand files is behaving like ransomware, seen before or not.",
        "The price is false alarms. One costs a minute. A thousand costs you the reader, and a warning nobody reads is not a warning.",
      ],
      body_ar: [
        "كان الدفاع القديم قائمة ببرامج خبيثة معروفة. سريع، وأعمى عن أي شيء كُتب البارحة.",
        "فتغيّر السؤال إلى ماذا يفعل هذا. فالبرنامج الذي يعيد كتابة عشرة آلاف ملف يتصرف كبرمجية فدية، رُئي من قبل أم لا.",
        "والثمن إنذارات كاذبة. الواحد يكلف دقيقة. والألف تكلفك القارئ، والتحذير الذي لا يقرؤه أحد ليس تحذيراً.",
      ],
      check: {
        id: "fp-check", by: "rouda",
        q_en: "In your own words: how can a system be completely right and still fail?",
        q_ar: "بكلماتك: كيف يكون النظام صحيحاً تماماً ويخفق رغم ذلك؟",
        react_en: "Keep that sentence. You will need it when you compare the four attempts.",
        react_ar: "احتفظ بهذه الجملة. ستحتاجها حين تقارن المحاولات الأربع.",
      },
    },

    precise: {
      id: "precise", open: true, by: "rouda",
      q_en: "Now write the problem. Not what happened. What the problem is, in one sentence, as exactly as you can.",
      q_ar: "الآن اكتب المشكلة. لا ما حدث، بل ما هي المشكلة، في جملة واحدة، بأدق ما تستطيع.",
      hint_en: "This is the assessment. We compare it to what you wrote at the start.",
      hint_ar: "هذا هو التقييم. نقارنه بما كتبته في البداية.",
      react_en: "Saved beside your first answer.",
      react_ar: "حُفظت بجانب إجابتك الأولى.",
    },

    films: {
      darktrace: {
        support: "guided",
        beats: [
          { en: "A hospital has thousands of devices and no list of what each should do.", ar: "في المستشفى آلاف الأجهزة ولا قائمة بما ينبغي أن يفعله كل منها." },
          { en: "Matching against known threats misses anything new.", ar: "المطابقة بالتهديدات المعروفة تفوّت كل جديد." },
          { en: "So: learn what normal looks like, then report what stops looking normal.", ar: "إذاً: تعلّم كيف يبدو الطبيعي، ثم بلّغ عما يكف عن كونه طبيعياً." },
          { en: "Catches attacks nobody has seen. Shouts when behaviour changes.", ar: "يمسك هجمات لم يرها أحد. ويصرخ حين يتغير السلوك." },
        ],
        ask: {
          id: "file-darktrace", by: "hamad",
          q_en: "I will do this one with you. It has to learn normal first. So what breaks it?",
          q_ar: "سأفعل هذه معك. عليه أن يتعلم الطبيعي أولاً. فما الذي يكسره؟",
          choices: [
            { en: "When normal keeps changing", ar: "حين يتغير الطبيعي باستمرار",
              react_en: "That is it. A ward in September looks nothing like the same ward in July.",
              react_ar: "هذا هو. فجناح في سبتمبر لا يشبه الجناح نفسه في يوليو." },
            { en: "When the attack is very fast", ar: "حين يكون الهجوم سريعاً جداً",
              react_en: "Speed is not the problem for this one. Look again at what it needs before it can start.",
              react_ar: "السرعة ليست مشكلته. انظر مرة أخرى إلى ما يحتاجه قبل أن يبدأ." },
            { en: "When there are too many devices", ar: "حين تكون الأجهزة كثيرة جداً",
              react_en: "It handles many devices well. The trouble is what those devices do next week.",
              react_ar: "يتعامل مع الأجهزة الكثيرة جيداً. المشكلة فيما تفعله تلك الأجهزة الأسبوع القادم." },
          ],
        },
      },
      crowdstrike: {
        support: "questioned",
        beats: [
          { en: "Damage happens on a machine, not on a network.", ar: "الضرر يقع على جهاز، لا على شبكة." },
          { en: "So put a small watcher on every computer.", ar: "فضع مراقباً صغيراً على كل حاسوب." },
          { en: "What one machine learns protects all of them within the hour.", ar: "وما يتعلمه جهاز يحمي الجميع خلال ساعة." },
          { en: "Very fast. But it has to be installed.", ar: "سريع جداً. لكن يجب تثبيته." },
        ],
        ask: {
          id: "file-crowdstrike", by: "hamad",
          q_en: "You have the board. Which card does this one fail against?",
          q_ar: "لديك اللوحة. أي بطاقة يخفق أمامها هذا؟",
          react_en: "The scanner. Nothing can be installed on it, so this approach is blind exactly where the attack got in.",
          react_ar: "الماسح. لا شيء يمكن تثبيته عليه، فهذا النهج أعمى تماماً حيث دخل الهجوم.",
        },
      },
      vectra: {
        support: "alone",
        beats: [
          { en: "One machine falling is survivable. Spreading is not.", ar: "سقوط جهاز واحد يُحتمل. أما الانتشار فلا." },
          { en: "Anything moving sideways has to do a few recognisable things.", ar: "كل ما يتحرك جانبياً مضطر إلى أفعال قليلة مميزة." },
          { en: "So watch for the shape of spreading.", ar: "فراقب شكل الانتشار." },
          { en: "Aimed at what made this a disaster. Speaks only once something is inside.", ar: "موجّه إلى ما جعل هذا كارثة. ولا ينطق إلا بعد أن يدخل شيء." },
        ],
        ask: {
          id: "file-vectra", by: "rouda",
          q_en: "No help this time. What kind of attack would this never see?",
          q_ar: "بلا مساعدة هذه المرة. أي هجوم لن يراه هذا أبداً؟",
          react_en: "Recorded. We will check it against the table.",
          react_ar: "سُجّلت. سنراجعها أمام الجدول.",
        },
      },
      segmentation: {
        support: "alone",
        beats: [
          { en: "Stop trying to see it. Stop it moving instead.", ar: "كف عن محاولة رؤيته. امنع تحركه بدلاً من ذلك." },
          { en: "Split the network into rooms. The scanner talks to two machines and nothing else.", ar: "قسّم الشبكة إلى غرف. الماسح يتحدث إلى جهازين ولا شيء غيرهما." },
          { en: "Then one infected machine infects one room, not fourteen hospitals.", ar: "فيصيب الجهاز المصاب غرفة واحدة، لا أربعة عشر مستشفى." },
          { en: "It works. Almost nobody does it.", ar: "ينجح. ولا يفعله أحد تقريباً." },
        ],
        ask: {
          id: "file-segmentation", by: "rouda",
          q_en: "This one would have stopped it. So why do hospitals not do it?",
          q_ar: "هذا كان سيوقفه. فلماذا لا تفعله المستشفيات؟",
          react_en: "Because a doctor who cannot reach a scan in ten seconds is a real problem today, and the attack is only a problem one day. That is the answer, and it is the most important thing in this case.",
          react_ar: "لأن طبيباً لا يصل إلى صورة أشعة في عشر ثوانٍ مشكلة حقيقية اليوم، أما الهجوم فمشكلة يوم واحد. هذه هي الإجابة، وهي أهم ما في هذه القضية.",
        },
      },
    },

    retrieval: {
      id: "retrieval", by: "rouda",
      q_en: "Before the table. Two of these four drown a small team in alerts. Which two?",
      q_ar: "قبل الجدول. اثنان من هذه الأربعة يغرقان فريقاً صغيراً بالتنبيهات. أيهما؟",
      choices: [
        { en: "The two that watch behaviour", ar: "الاثنان اللذان يراقبان السلوك",
          react_en: "Yes. Watching behaviour always costs false alarms. You worked that out yourself earlier.",
          react_ar: "نعم. مراقبة السلوك تكلف دائماً إنذارات كاذبة. وقد استنتجت ذلك بنفسك سابقاً." },
        { en: "The two that need installing", ar: "الاثنان اللذان يحتاجان تثبيتاً",
          react_en: "Installing is a different cost. Think about which ones have to guess what is unusual.",
          react_ar: "التثبيت كلفة أخرى. فكّر في أيها مضطر إلى تخمين ما هو غير معتاد." },
        { en: "None of them", ar: "لا أحد منها",
          react_en: "Go back to what you said about reading a thousand alerts for a month.",
          react_ar: "عد إلى ما قلته عن قراءة ألف تنبيه لشهر." },
      ],
    },

    discussion: [
      {
        id: "opposite", by: "hamad",
        q_en: "Two of them disagree about where the truth is. Which two?",
        q_ar: "اثنان منها يختلفان على مكان الحقيقة. أيهما؟",
        choices: [
          { en: "Network watcher and machine watcher", ar: "مراقب الشبكة ومراقب الجهاز",
            react_en: "Right. One says the network is the truth, the other says the machine is. Both are correct, which means the problem has two halves.",
            react_ar: "صحيح. أحدهما يقول الشبكة هي الحقيقة، والآخر يقول الجهاز. وكلاهما محق، ما يعني أن للمشكلة نصفين." },
          { en: "Spread watcher and segmentation", ar: "مراقب الانتشار والتقسيم",
            react_en: "Those two actually agree: spreading is the danger. They differ on watching versus preventing.",
            react_ar: "هذان يتفقان فعلاً: الانتشار هو الخطر. ويختلفان في المراقبة مقابل المنع." },
        ],
      },
      {
        id: "shared", by: "hamad",
        q_en: "Three of the four need the same thing that this hospital did not have. What?",
        q_ar: "ثلاثة من الأربعة تحتاج الشيء نفسه الذي لم يكن لدى هذا المستشفى. ما هو؟",
        choices: [
          { en: "Money", ar: "المال",
            react_en: "They had budget. Look for something you cannot buy in a hurry.",
            react_ar: "كان لديهم ميزانية. ابحث عن شيء لا يُشترى على عجل." },
          { en: "A person, watching, at the right moment", ar: "شخص، يراقب، في اللحظة الصحيحة",
            react_en: "That is the blind spot all three share. Two staff, one on leave.",
            react_ar: "هذه هي النقطة العمياء المشتركة بينها. موظفان، أحدهما في إجازة." },
          { en: "Newer computers", ar: "حواسيب أحدث",
            react_en: "Newer machines would help the scanner problem, not the alert problem.",
            react_ar: "الأجهزة الأحدث تساعد في مشكلة الماسح، لا في مشكلة التنبيهات." },
        ],
      },
      {
        id: "none", open: true, by: "hamad",
        q_en: "Look down the failure column. Is there a case none of the four can handle?",
        q_ar: "انظر إلى عمود الإخفاق. هل من حالة لا يتعامل معها أي من الأربعة؟",
        react_en: "Write it exactly. This is what the whole case has been walking toward.",
        react_ar: "اكتبها بدقة. فهذا ما كانت القضية كلها تمشي نحوه.",
      },
    ],

    gap: {
      id: "gap", open: true, by: "hamad",
      q_en: "Forget the names. What does this problem still need that nobody has given it?",
      q_ar: "انسَ الأسماء. ما الذي ما زالت هذه المشكلة تحتاجه ولم يعطها إياه أحد؟",
      react_en: "That sentence is yours. Nobody handed it to you.",
      react_ar: "هذه الجملة لك. لم يعطك إياها أحد.",
    },

    challenge: {
      parts_en: [
        "What is needed is a solution that can ", " while also ", " even when ",
        " is present, without causing ", ".",
      ],
      parts_ar: [
        "المطلوب حل يستطيع ", " وفي الوقت نفسه ", " حتى مع وجود ", " دون أن يسبب ", ".",
      ],
      hints_en: ["what it must do", "the thing that fights it", "the hard condition", "the price nobody may pay"],
      hints_ar: ["ما يجب أن يفعله", "ما يصارعه", "الظرف الصعب", "الثمن الممنوع"],
      rule_en: "Every blank comes from your table.",
      rule_ar: "كل فراغ يأتي من جدولك.",
    },

    next: [
      { id: "proposal", open: true, by: "hamad",
        q_en: "What would yours do? The mechanism, not the feeling.",
        q_ar: "ماذا سيفعل حلك؟ الآلية، لا الشعور.",
        hint_en: "Not safer. What happens, and to what.", hint_ar: "لا أكثر أماناً. بل ماذا يحدث، ولأي شيء.",
        react_en: "Now the harder half.", react_ar: "الآن النصف الأصعب." },
      { id: "assumption", open: true, by: "hamad",
        q_en: "What must be true for it to work?", q_ar: "ما الذي يجب أن يكون صحيحاً كي ينجح؟",
        hint_en: "All four of the others had one.", hint_ar: "لكل من الأربعة افتراض.",
        react_en: "Good. Anyone can attack that sentence, which is what makes it a proposal.",
        react_ar: "جيد. يمكن لأي أحد مهاجمة تلك الجملة، وهذا ما يجعلها مقترحاً." },
      { id: "experiment", open: true, by: "hamad",
        q_en: "What would you do to find out whether you are wrong?",
        q_ar: "ماذا ستفعل لتعرف إن كنت مخطئاً؟",
        react_en: "If nothing could show you are wrong, it is not a proposal yet.",
        react_ar: "إن لم يكن هناك ما يكشف خطأك، فهذا ليس مقترحاً بعد." },
      { id: "hypothesis", open: true, by: "rouda",
        q_en: "If I am right, ___ happens. If I am wrong, ___ happens instead.",
        q_ar: "إن كنت محقاً يحدث ___. وإن كنت مخطئاً يحدث ___ بدلاً منه.",
        react_en: "That is a real hypothesis. Most adults do not bring one to a first meeting.",
        react_ar: "هذه فرضية حقيقية. ومعظم الكبار لا يحضرون واحدة إلى اجتماع أول." },
    ],

    reflect: {
      id: "changed", open: true, by: "rouda",
      q_en: "What do you understand now that you did not on the first screen?",
      q_ar: "ما الذي تفهمه الآن ولم تكن تفهمه في الشاشة الأولى؟",
      react_en: "That is the part worth keeping.",
      react_ar: "هذا هو الجزء الذي يستحق الاحتفاظ به.",
    },
  },
};

export const flowFor = (caseId: string) => FLOWS[caseId];
