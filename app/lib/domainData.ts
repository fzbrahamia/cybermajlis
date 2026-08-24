// ============================================================
// THE TAUGHT SPINE
//
// This is the main path, and the order matters.
//
//   1. Learn what a domain actually is, through film
//   2. Take a real failure the world has not solved
//   3. Decompose everyone who has genuinely tried
//   4. Find the wall all of them hit
//   5. Only then propose what comes next
//
// The friction log, the community board and our monthly problems are NOT this.
// They are ways to apply this once a learner has it, and a learner who starts
// there has no idea how to proceed. They are advertised as practice and they
// are reached from here, never the other way round.
// ============================================================

export type Domain = {
  id: string;
  live: boolean;
  name_en: string; name_ar: string;
  /** What the domain is actually about, in one line a child understands. */
  line_en: string; line_ar: string;
  /** The question the whole domain is arguing about right now. */
  open_en: string; open_ar: string;
  tone: string; tint: string;
  /** The majlis that goes properly deep, when one exists. */
  deeper?: { href: string; en: string; ar: string };
};

export const DOMAINS: Domain[] = [
  {
    id: "cybersecurity", live: true,
    name_en: "Cybersecurity", name_ar: "الأمن السيبراني",
    line_en: "Keeping systems working when somebody is actively trying to break them.",
    line_ar: "إبقاء الأنظمة تعمل بينما يحاول أحدهم كسرها فعلاً.",
    open_en: "How do you catch an attack nobody has ever seen before, without drowning in false alarms?",
    open_ar: "كيف تكتشف هجوماً لم يره أحد من قبل، دون أن تغرق في إنذارات كاذبة؟",
    tone: "#A8323F", tint: "rgba(168,50,63,.09)",
    deeper: { href: "/cybermajlis", en: "CyberMajlis", ar: "المجلس السيبراني" },
  },
  {
    id: "water", live: true,
    name_en: "Water", name_ar: "الماء",
    line_en: "Taking the salt out of the sea, and living with what is left over.",
    line_ar: "إخراج الملح من البحر، والتعايش مع ما يتبقّى.",
    open_en: "Everything that takes salt out of water puts it back somewhere. Where should it go?",
    open_ar: "كل ما يُخرج الملح من الماء يعيده إلى مكان ما. فأين يجب أن يذهب؟",
    tone: "#3D6FB5", tint: "rgba(61,111,181,.09)",
  },
  {
    id: "quantum", live: true,
    name_en: "Quantum computing", name_ar: "الحوسبة الكمّية",
    line_en: "A machine that works on possibilities at once instead of one at a time.",
    line_ar: "آلة تعمل على الاحتمالات دفعة واحدة بدل واحد تلو الآخر.",
    open_en: "Today's locks assume some arithmetic is slow to undo. What happens when it is not?",
    open_ar: "تفترض أقفال اليوم أن بعض الحساب بطيء في العكس. فماذا يحدث حين لا يعود كذلك؟",
    tone: "#2E9C6E", tint: "rgba(46,156,110,.09)",
    deeper: { href: "/quantum", en: "QuantumMajlis", ar: "مجلس الكوانتم" },
  },
  {
    id: "ai", live: false,
    name_en: "Artificial intelligence", name_ar: "الذكاء الاصطناعي",
    line_en: "Machines that learn a pattern instead of being told a rule.",
    line_ar: "آلات تتعلم نمطاً بدل أن تُلقّن قاعدة.",
    open_en: "How do you know why it answered that, and who is responsible when it is wrong?",
    open_ar: "كيف تعرف لماذا أجاب بذلك، ومن المسؤول حين يخطئ؟",
    tone: "#3D6FB5", tint: "rgba(61,111,181,.09)",
  },
  {
    id: "space", live: false,
    name_en: "Space technology", name_ar: "تقنيات الفضاء",
    line_en: "Building things that must work with nobody there to repair them.",
    line_ar: "بناء أشياء يجب أن تعمل دون أن يكون هناك من يصلحها.",
    open_en: "How do you run serious computing in orbit, on little power, through radiation?",
    open_ar: "كيف تشغّل حوسبة جادة في المدار، بطاقة قليلة، وسط الإشعاع؟",
    tone: "#5D66AD", tint: "rgba(93,102,173,.09)",
  },
  {
    id: "biotech", live: false,
    name_en: "Biotechnology", name_ar: "التقنية الحيوية",
    line_en: "Using living things as tools, and reading the instructions they run on.",
    line_ar: "استعمال الكائنات الحية أدوات، وقراءة التعليمات التي تعمل بها.",
    open_en: "Why do decades of research still not reach the people who need it most?",
    open_ar: "لماذا لا تصل عقود من البحث إلى من يحتاجونها أكثر من غيرهم؟",
    tone: "#1B6B4C", tint: "rgba(27,107,76,.09)",
  },
  {
    id: "energy", live: false,
    name_en: "Energy for computing", name_ar: "الطاقة للحوسبة",
    line_en: "Every answer a machine gives costs electricity somebody has to make.",
    line_ar: "كل إجابة تعطيها الآلة تكلف كهرباء على أحدهم أن ينتجها.",
    open_en: "Can the machines keep growing without the power to run them growing faster?",
    open_ar: "هل يمكن للآلات أن تكبر دون أن تكبر الطاقة اللازمة لها أسرع منها؟",
    tone: "#A8804A", tint: "rgba(168,128,74,.09)",
  },
];

export const domainById = (id: string) => DOMAINS.find(d => d.id === id);

// ── a case: one real failure, and everyone who has tried ───

export type Approach = {
  id: string;
  name_en: string; name_ar: string;
  /** Not the general domain. The specific version of the problem they attacked. */
  problem_en: string; problem_ar: string;
  /** What they understood that others did not. */
  insight_en: string; insight_ar: string;
  /** The science or logic that makes it work, at a functional level. */
  mechanism_en: string; mechanism_ar: string;
  /** What must be true for their choice to hold. */
  assumption_en: string; assumption_ar: string;
  /** Every technical choice gives something up. */
  sacrifice_en: string; sacrifice_ar: string;
  /** Where it genuinely succeeds. */
  works_en: string; works_ar: string;
  /** A structural observation, not a criticism. */
  breaks_en: string; breaks_ar: string;
};

export type Case = {
  id: string;
  domain: string;
  title_en: string; title_ar: string;
  year: string;
  /** Stage one is feeling, not understanding. A story, and a human consequence. */
  story_en: string[]; story_ar: string[];
  /** Stage two makes the problem harder, not easier. */
  harder_en: { q_en: string; body_en: string }[];
  harder_ar: { q_ar: string; body_ar: string }[];
  /** The two things the problem demands that fight each other. */
  tension_en: string; tension_ar: string;
  approaches: Approach[];
  /** Where the comparison itself teaches something. */
  collision_en: { head_en: string; body_en: string }[];
  collision_ar: { head_ar: string; body_ar: string }[];
  /** Not an opportunity. A precise statement of what is still demanded. */
  gap_en: string; gap_ar: string;
  /** The concepts you must hold before any of this means anything. */
  needs: string[];
};

export const CASES: Case[] = [
  {
    id: "brine-gulf",
    domain: "water",
    title_en: "The water and what comes back", title_ar: "الماء وما يعود",
    year: "now",
    story_en: [
      "Ninety nine out of every hundred litres of drinking water in this country was in the Gulf a few days ago.",
      "It is pumped ashore, the salt is taken out, and it arrives at a tap. That part works. It has worked for sixty years.",
      "The salt that was taken out does not disappear. It leaves the plant through a second pipe, thicker than the first, and it goes back into the same sea.",
    ],
    story_ar: [
      "تسعة وتسعون لتراً من كل مئة لتر من ماء الشرب في هذه البلاد كانت في الخليج قبل أيام.",
      "يُضخّ إلى البرّ، ويُخرَج منه الملح، فيصل إلى الصنبور. وهذا الجزء ينجح. وقد نجح ستين عاماً.",
      "أما الملح المُخرَج فلا يختفي. بل يغادر المحطة عبر أنبوب ثانٍ أسمك من الأول، ويعود إلى البحر نفسه.",
    ],
    harder_en: [
      { q_en: "Why not just put the salt somewhere else?",
        body_en: "There is a great deal of it. A single large plant returns hundreds of thousands of cubic metres a day, and it is a liquid, not a pile. Drying it would take more energy than making the water did." },
      { q_en: "Why does it matter which sea it goes into?",
        body_en: "The Gulf averages about thirty four metres deep and opens to the ocean through one narrow strait. Along this coast the water takes roughly three years to be exchanged. It is already saltier than the open ocean before anybody adds anything." },
      { q_en: "Does the method change how much comes back?",
        body_en: "Enormously. Across the region about two cubic metres return for every one of drinking water made. Split by method it is roughly seven to one for the plants that boil, against about one to one for the plants that push water through a membrane." },
    ],
    harder_ar: [
      { q_ar: "لماذا لا يُوضع الملح في مكان آخر ببساطة؟",
        body_ar: "لأنه كثير جداً. فالمحطة الكبيرة الواحدة تعيد مئات الآلاف من الأمتار المكعبة يومياً، وهو سائل لا كومة. وتجفيفه يستهلك طاقة أكثر مما استهلكه صنع الماء." },
      { q_ar: "ولماذا يهمّ إلى أي بحر يعود؟",
        body_ar: "يبلغ متوسط عمق الخليج نحو أربعة وثلاثين متراً، وينفتح على المحيط عبر مضيق ضيق واحد. وعلى هذا الساحل يستغرق تبديل الماء نحو ثلاث سنوات. وهو أملح من المحيط المفتوح قبل أن يضيف أحد شيئاً." },
      { q_ar: "وهل تغيّر الطريقة كمية ما يعود؟",
        body_ar: "كثيراً جداً. ففي المنطقة يعود نحو مترين مكعبين مقابل كل متر من ماء الشرب. وبحسب الطريقة يبلغ نحو سبعة إلى واحد في المحطات التي تغلي، مقابل نحو واحد إلى واحد في التي تدفع الماء عبر غشاء." },
    ],
    tension_en: "The sea has to give up water and take back salt, and it is the same sea, and everybody around it is doing the same thing to it.",
    tension_ar: "على البحر أن يتنازل عن الماء ويستقبل الملح، وهو البحر نفسه، وكل من حوله يفعل به الشيء ذاته.",
    approaches: [
      {
        id: "boil",
        name_en: "Boiling it", name_ar: "غليه",
        problem_en: "Making very large amounts of water beside a power station that is already throwing away heat.",
        problem_ar: "صنع كميات ضخمة من الماء بجوار محطة كهرباء ترمي حرارتها أصلاً.",
        insight_en: "Do not fight the salt. Take the water away from it instead, as steam, and leave the salt where it is.",
        insight_ar: "لا تصارع الملح. بل خذ الماء منه على هيئة بخار، واترك الملح مكانه.",
        mechanism_en: "Heat seawater until it flashes into vapour, catch the vapour, cool it back into liquid. Salt cannot evaporate, so what condenses is fresh.",
        mechanism_ar: "سخّن ماء البحر حتى يتحول فجأة إلى بخار، ثم التقط البخار وبرّده ليعود سائلاً. والملح لا يتبخر، فما يتكثف عذب.",
        assumption_en: "Heat is nearly free, because a power station next door is producing it and wasting it anyway.",
        assumption_ar: "أن الحرارة شبه مجانية، لأن محطة كهرباء مجاورة تنتجها وتهدرها أصلاً.",
        sacrifice_en: "The plant can only live beside a power station, and it can never be built small.",
        sacrifice_ar: "لا يمكن للمحطة أن تعيش إلا بجوار محطة كهرباء، ولا يمكن بناؤها صغيرة أبداً.",
        works_en: "It does not care how dirty or how salty the water is. It keeps running through the algal blooms that shut other plants down.",
        works_ar: "لا يعنيه كم الماء متسخ أو مالح. ويظل يعمل خلال ازدهارات الطحالب التي توقف غيره.",
        breaks_en: "It returns around seven cubic metres to the sea for every one it makes, and that water is hotter as well as saltier.",
        breaks_ar: "يعيد نحو سبعة أمتار مكعبة إلى البحر مقابل كل متر يصنعه، وذلك الماء أسخن وأملح معاً.",
      },
      {
        id: "membrane",
        name_en: "Pushing it through", name_ar: "دفعه عبر غشاء",
        problem_en: "Getting the cost down far enough that water can be made anywhere, not only beside a power station.",
        problem_ar: "خفض التكلفة بما يكفي لصنع الماء في أي مكان، لا بجوار محطة كهرباء فحسب.",
        insight_en: "You do not have to move the water anywhere. You only have to beat the pull, and the pull has a number.",
        insight_ar: "لا يلزمك نقل الماء إلى أي مكان. يلزمك فقط التغلب على الشدّ، وللشدّ رقم.",
        mechanism_en: "Force seawater against a membrane at high pressure. Water passes through it, salt does not.",
        mechanism_ar: "ادفع ماء البحر على غشاء بضغط عالٍ. فيمر الماء عبره، ولا يمر الملح.",
        assumption_en: "The seawater can be cleaned enough beforehand that the membrane does not clog up.",
        assumption_ar: "أن ماء البحر يمكن تنظيفه مسبقاً بما يكفي لئلا ينسدّ الغشاء.",
        sacrifice_en: "A second plant standing in front of the first one, doing nothing but filtering and adding chemicals.",
        sacrifice_ar: "محطة ثانية تقف أمام الأولى، لا عمل لها إلا الترشيح وإضافة المواد الكيميائية.",
        works_en: "Far less energy than boiling, and it can be built at any size, so it does not need a power station beside it.",
        works_ar: "طاقة أقل بكثير من الغلي، ويمكن بناؤه بأي حجم، فلا يحتاج محطة كهرباء بجواره.",
        breaks_en: "When the Gulf blooms, the membranes clog and the plant has to stop, which tends to happen in the hottest months.",
        breaks_ar: "حين يزدهر الخليج بالطحالب تنسدّ الأغشية وتضطر المحطة للتوقف، وهذا يحدث غالباً في أشدّ الشهور حراً.",
      },
      {
        id: "recovery",
        name_en: "Handing the pressure back", name_ar: "إعادة الضغط",
        problem_en: "Pushing water through a membrane was throwing away most of the energy it had just paid for.",
        problem_ar: "كان دفع الماء عبر الغشاء يهدر معظم الطاقة التي دُفع ثمنها للتو.",
        insight_en: "What leaves the membrane is still under almost full pressure. For years that pressure was let out through a valve and lost as noise and heat.",
        insight_ar: "ما يخرج من الغشاء ما زال تحت الضغط الكامل تقريباً. وسنوات طويلة كان ذلك الضغط يُطلق عبر صمام فيضيع ضجيجاً وحرارة.",
        mechanism_en: "A spinning ceramic wheel lets the outgoing high pressure stream push directly against the incoming seawater, handing the pressure over rather than wasting it.",
        mechanism_ar: "عجلة خزفية دوّارة تدع التيار الخارج عالي الضغط يدفع مباشرة ماء البحر الداخل، فيسلّمه الضغط بدل أن يهدره.",
        assumption_en: "The two streams can touch for a moment without mixing enough to matter.",
        assumption_ar: "أن التيارين يمكن أن يتلامسا لحظة دون أن يختلطا بقدر يُذكر.",
        sacrifice_en: "A little salt does cross over, so the pumps have to work slightly harder than the ideal.",
        sacrifice_ar: "بعض الملح يعبر فعلاً، فتعمل المضخات أشدّ قليلاً من المثالي.",
        works_en: "It cut the energy of pushing water through a membrane roughly in half. It is the largest single saving anyone has found.",
        works_ar: "خفض طاقة الدفع عبر الغشاء إلى النصف تقريباً. وهو أكبر توفير منفرد وجده أحد.",
        breaks_en: "It takes nothing out of the water it returns. What it did was make the low leftover method affordable, so it helped by accident, and cheaper water means more water gets made.",
        breaks_ar: "لا يُخرج شيئاً من الماء الذي يعيده. بل جعل الطريقة قليلة المتبقّي في المتناول، فساعد بالمصادفة، والماء الأرخص يعني صنع ماء أكثر.",
      },
      {
        id: "mining",
        name_en: "Selling the salt", name_ar: "بيع الملح",
        problem_en: "Everyone treats what leaves through the second pipe as rubbish to be got rid of.",
        problem_ar: "الجميع يعامل ما يخرج من الأنبوب الثاني على أنه نفاية يجب التخلص منها.",
        insight_en: "It is not rubbish. It is seawater with everything valuable in it concentrated to double strength, already pumped ashore and sitting there.",
        insight_ar: "ليس نفاية. بل ماء بحر تركّز فيه كل ثمين إلى الضعف، وقد ضُخّ إلى البرّ أصلاً وهو جالس هناك.",
        mechanism_en: "Pull out magnesium, bromine, salt and other minerals in stages, and ideally send nothing liquid back at all.",
        mechanism_ar: "استخرج المغنيسيوم والبروم والملح ومعادن أخرى على مراحل، والأمثل ألا تعيد سائلاً أبداً.",
        assumption_en: "What you take out is worth more than the energy and the plant it took to take it out.",
        assumption_ar: "أن ما تستخرجه يساوي أكثر من الطاقة والمنشأة اللتين لزمتا لاستخراجه.",
        sacrifice_en: "It turns a water company into a mining company, with a mining company's costs and a mining company's customers.",
        sacrifice_ar: "يحوّل شركة ماء إلى شركة تعدين، بتكاليف شركة تعدين وزبائنها.",
        works_en: "For a small number of high value minerals it genuinely does pay for itself.",
        works_ar: "في عدد قليل من المعادن عالية القيمة يغطي تكلفته فعلاً.",
        breaks_en: "For the bulk of what comes back it does not pay, and putting that much of it on the market is exactly what makes it not pay.",
        breaks_ar: "وفي معظم ما يعود لا يغطي تكلفته، وطرح هذا القدر منه في السوق هو بعينه ما يجعله لا يغطيها.",
      },
    ],
    collision_en: [
      { head_en: "Nobody removed the cost. Every one of them moved it.",
        body_en: "Boiling moved it into fuel. Membranes moved it into chemicals and a whole second plant. Handing the pressure back moved it into volume, because cheap water gets made in greater quantities. Selling the salt moved it into building something enormous first." },
      { head_en: "The one that would have worked, and did not happen.",
        body_en: "Reverse osmosis returns about one for one where boiling returns about seven for one. If the region had built membranes from the beginning instead of boilers, the same drinking water would have come with a fraction of the salt going back. It was not built that way because the boilers came first, beside the power stations, and a plant lasts thirty years." },
    ],
    collision_ar: [
      { head_ar: "لم يُزل أحد التكلفة. بل نقلها كل واحد منهم.",
        body_ar: "نقلها الغلي إلى الوقود. ونقلتها الأغشية إلى المواد الكيميائية ومحطة ثانية كاملة. ونقلتها إعادة الضغط إلى الكمية، لأن الماء الرخيص يُصنع بكميات أكبر. ونقلها بيع الملح إلى بناء شيء ضخم أولاً." },
      { head_ar: "الذي كان سينجح، ولم يحدث.",
        body_ar: "التناضح العكسي يعيد نحو واحد إلى واحد بينما يعيد الغلي نحو سبعة إلى واحد. ولو بنت المنطقة الأغشية منذ البداية بدل الغلايات، لجاء ماء الشرب نفسه بجزء يسير من الملح العائد. ولم يُبنَ كذلك لأن الغلايات جاءت أولاً بجوار محطات الكهرباء، ولأن المحطة تعمّر ثلاثين عاماً." },
    ],
    gap_en: "Something has to take the salt out of the water that goes back and keep it out, at a price the water bill can carry, and without needing somebody to buy whatever is taken out, in a sea that takes about three years to change its water.",
    gap_ar: "شيء ما يجب أن يُخرج الملح من الماء العائد ويبقيه خارجاً، بسعر تحتمله فاتورة الماء، ودون الحاجة إلى مشترٍ لما يُخرَج، في بحر يستغرق نحو ثلاث سنوات ليبدّل ماءه.",
    needs: ["osmosis", "osmotic-pressure", "what-is-left", "closed-sea"],
  },
  {
    id: "ransomware-hospitals",
    domain: "cybersecurity",
    year: "2017",
    title_en: "Hospitals had to turn patients away. Everyone had a firewall.",
    title_ar: "اضطرت مستشفيات إلى رد المرضى. وكان لدى الجميع جدار حماية.",
    story_en: [
      "On a Friday in May 2017, computers in hospitals across Britain stopped working within hours of each other. Screens showed a demand for money. Files would not open.",
      "Operations were cancelled. Ambulances were sent to other towns. Test results could not be read. Nineteen thousand appointments did not happen, and some of the people waiting for them were seriously ill.",
      "Nobody had been careless in the way people assume. These were organisations with security teams, security budgets, and firewalls. A repair for the exact hole the attack used had been released two months earlier.",
    ],
    story_ar: [
      "في يوم جمعة من مايو 2017، توقفت حواسيب في مستشفيات عبر بريطانيا عن العمل خلال ساعات من بعضها. وظهرت على الشاشات مطالبة بالمال. ولم تعد الملفات تُفتح.",
      "أُلغيت عمليات. وحُوّلت سيارات الإسعاف إلى مدن أخرى. ولم يمكن قراءة نتائج الفحوص. وتسعة عشر ألف موعد لم تتم، وبعض من كانوا ينتظرونها كانوا مرضى بشدة.",
      "ولم يكن أحد مهملاً بالطريقة التي يفترضها الناس. كانت هذه مؤسسات لديها فرق أمن وميزانيات أمن وجدران حماية. وكان إصلاح الثغرة نفسها التي استُعملت قد صدر قبل شهرين.",
    ],
    harder_en: [
      { q_en: "Who suffers, and how differently?",
        body_en: "A patient loses an operation. A nurse loses the record she needs to give a drug safely. An administrator loses a system she cannot rebuild. The same event is four different problems depending on where you stand." },
      { q_en: "Why has it not been solved?",
        body_en: "Because the repair existing is not the same as the repair being installed. A hospital machine running a scanner may be unable to update, because updating stops the scanner working, and the scanner is worth more than the risk on any ordinary day." },
      { q_en: "What has been tried?",
        body_en: "Walls at the edge, lists of known threats, and rules about what staff may click. Each helped. None of them addressed a program already inside, moving between machines that were all supposed to talk to each other." },
    ],
    harder_ar: [
      { q_ar: "من يتضرر، وكيف يختلف الضرر؟",
        body_ar: "المريض يفقد عملية. والممرضة تفقد السجل الذي تحتاجه لتعطي دواء بأمان. والإدارية تفقد نظاماً لا تستطيع إعادة بنائه. الحدث نفسه أربع مشكلات مختلفة بحسب موقعك منه." },
      { q_ar: "لماذا لم تُحل بعد؟",
        body_ar: "لأن وجود الإصلاح ليس كتثبيته. فجهاز في مستشفى يشغّل ماسحاً قد يتعذر تحديثه، لأن التحديث يوقف الماسح، والماسح أثمن من الخطر في أي يوم عادي." },
      { q_ar: "ماذا جُرّب؟",
        body_ar: "جدران عند الحافة، وقوائم بالتهديدات المعروفة، وقواعد لما يجوز للموظفين النقر عليه. وكل منها ساعد. ولم يعالج أي منها برنامجاً صار داخل الشبكة، يتنقل بين أجهزة يُفترض أن يتحدث بعضها إلى بعض." },
    ],
    tension_en: "A hospital network must let machines talk to each other freely, because a delayed test result can kill someone. It must also stop anything spreading between those same machines. Those two demands fight, and every approach below is a different answer to that one fight.",
    tension_ar: "يجب أن تدع شبكة المستشفى الأجهزة تتحدث بحرية، لأن تأخر نتيجة فحص قد يقتل إنساناً. ويجب أيضاً أن تمنع أي شيء من الانتشار بين تلك الأجهزة نفسها. وهذان المطلبان يتصارعان، وكل نهج أدناه إجابة مختلفة عن هذا الصراع الواحد.",
    approaches: [
      {
        id: "darktrace",
        name_en: "Darktrace", name_ar: "دارك تريس",
        problem_en: "How do you catch something nobody has a description of yet?",
        problem_ar: "كيف تكتشف شيئاً لا يملك أحد وصفاً له بعد؟",
        insight_en: "You do not need to know what the attacker is. You need to know what your own network normally does, and notice the moment it stops behaving like itself.",
        insight_ar: "لست بحاجة إلى معرفة من المهاجم. بل إلى معرفة ما تفعله شبكتك عادة، وملاحظة اللحظة التي تكف فيها عن التصرف على طبيعتها.",
        mechanism_en: "It watches traffic for weeks and builds a statistical picture of ordinary behaviour for every machine, then flags deviations from that picture rather than matching files against a list.",
        mechanism_ar: "يراقب حركة الشبكة أسابيع ويبني صورة إحصائية للسلوك العادي لكل جهاز، ثم ينبه إلى الانحراف عن تلك الصورة بدل مطابقة الملفات بقائمة.",
        assumption_en: "That the network was healthy while it was learning, and that normal is stable enough to be a baseline.",
        assumption_ar: "أن الشبكة كانت سليمة أثناء تعلّمه، وأن الطبيعي مستقر بما يكفي ليكون مرجعاً.",
        sacrifice_en: "Certainty. It reports things that look unusual, which is not the same as things that are dangerous, so a human must judge every one.",
        sacrifice_ar: "اليقين. فهو يبلّغ عما يبدو غير معتاد، وهذا غير الخطير، فيجب أن يحكم إنسان على كل بلاغ.",
        works_en: "Genuinely catches attacks that have never been seen anywhere, including the first machine hit in a new outbreak.",
        works_ar: "يكتشف فعلاً هجمات لم تُر في أي مكان، بما في ذلك أول جهاز يُصاب في موجة جديدة.",
        breaks_en: "In a place where normal changes constantly, it produces so many alerts that a small team stops reading them. The tool still works and the humans have stopped.",
        breaks_ar: "في مكان يتغير طبيعيه باستمرار، يُنتج من التنبيهات ما يجعل فريقاً صغيراً يكف عن قراءتها. فتبقى الأداة تعمل ويتوقف البشر.",
      },
      {
        id: "crowdstrike",
        name_en: "CrowdStrike", name_ar: "كراود سترايك",
        problem_en: "The damage happens on the machine, so why are we watching the door?",
        problem_ar: "الضرر يقع على الجهاز، فلماذا نراقب الباب؟",
        insight_en: "Put the watcher on every individual machine, and let every machine's experience teach all the others in minutes.",
        insight_ar: "ضع المراقب على كل جهاز بمفرده، ودع تجربة كل جهاز تعلّم البقية خلال دقائق.",
        mechanism_en: "A small program on each endpoint records what processes do, sends that to a shared service, and a pattern seen on one customer's machine becomes protection for everyone within the hour.",
        mechanism_ar: "برنامج صغير على كل جهاز يسجل ما تفعله العمليات، ويرسله إلى خدمة مشتركة، فيصير نمط شوهد على جهاز عميل حمايةً للجميع خلال ساعة.",
        assumption_en: "That you can install and maintain software on every machine that matters.",
        assumption_ar: "أنك تستطيع تثبيت برنامج على كل جهاز مهم وصيانته.",
        sacrifice_en: "Reach. Anything you cannot install on is invisible, and it also means trusting one company with a detailed record of what your machines do.",
        sacrifice_ar: "الشمول. فكل ما لا تستطيع التثبيت عليه يبقى خفياً، ويعني أيضاً ائتمان شركة واحدة على سجل مفصل لما تفعله أجهزتك.",
        works_en: "Extremely fast at stopping a known technique everywhere at once, and it sees what a machine actually did rather than guessing from traffic.",
        works_ar: "سريع جداً في إيقاف أسلوب معروف في كل مكان دفعة واحدة، ويرى ما فعله الجهاز فعلاً بدل التخمين من حركة الشبكة.",
        breaks_en: "Exactly at the hospital scanner, the old control system, the machine nobody can touch. Those are the ones that fell in 2017.",
        breaks_ar: "ينكسر تماماً عند ماسح المستشفى، ونظام التحكم القديم، والجهاز الذي لا يستطيع أحد لمسه. وهذه هي التي سقطت عام 2017.",
      },
      {
        id: "vectra",
        name_en: "Vectra AI", name_ar: "فيكترا",
        problem_en: "Forget how it got in. What does spreading actually look like?",
        problem_ar: "انسَ كيف دخل. كيف يبدو الانتشار فعلاً؟",
        insight_en: "An attacker inside a network has to do a small number of recognisable things: look around, find credentials, move sideways. Watch for the behaviour of moving rather than the identity of the thing moving.",
        insight_ar: "المهاجم داخل الشبكة مضطر إلى عدد قليل من الأفعال المميزة: يستطلع، ويبحث عن بيانات دخول، ويتحرك جانبياً. فراقب سلوك التحرك لا هوية المتحرك.",
        mechanism_en: "It sits on the network and scores sequences of behaviour that indicate lateral movement, prioritising by how far along that sequence an intruder appears to be.",
        mechanism_ar: "يجلس على الشبكة ويقيّم تسلسلات السلوك الدالة على التحرك الجانبي، ويرتّبها بحسب مدى تقدم المتسلل في ذلك التسلسل.",
        assumption_en: "That an attacker must move between machines to achieve anything worth stopping.",
        assumption_ar: "أن المهاجم مضطر إلى التنقل بين الأجهزة ليحقق شيئاً يستحق الإيقاف.",
        sacrifice_en: "Earliness. By the time lateral movement is visible, something is already inside and the first machine is already lost.",
        sacrifice_ar: "البكورية. فحين يصير التحرك الجانبي مرئياً يكون شيء ما قد دخل بالفعل وضاع الجهاز الأول.",
        works_en: "Very strong at the exact thing that turned one infected hospital computer into a national shutdown.",
        works_ar: "قوي جداً في الشيء نفسه الذي حوّل حاسوب مستشفى واحداً مصاباً إلى توقف على مستوى دولة.",
        breaks_en: "Against an attack that does its damage on one machine and never moves, it has nothing to see.",
        breaks_ar: "أمام هجوم يُحدث ضرره على جهاز واحد ولا يتحرك، لا يجد ما يراه.",
      },
      {
        id: "segmentation",
        name_en: "Segmentation", name_ar: "التقسيم",
        problem_en: "Why are we trying to see it at all? Stop it moving.",
        problem_ar: "لماذا نحاول رؤيته أصلاً؟ امنع تحركه.",
        insight_en: "Detection is a race you can lose. A wall between rooms is not a race.",
        insight_ar: "الكشف سباق يمكن أن تخسره. أما جدار بين الغرفتين فليس سباقاً.",
        mechanism_en: "Split one flat network into many small ones, and allow each machine to reach only the handful it genuinely needs. The scanner talks to two servers and nothing else, by rule, always.",
        mechanism_ar: "قسّم شبكة واحدة مسطحة إلى شبكات صغيرة كثيرة، ودع كل جهاز يصل إلى القلة التي يحتاجها فعلاً. الماسح يتحدث إلى خادمين ولا شيء غيرهما، بقاعدة ثابتة.",
        assumption_en: "That somebody knows, in advance, which machine legitimately needs to reach which.",
        assumption_ar: "أن أحداً يعرف، مسبقاً، أي جهاز يحتاج فعلاً إلى الوصول إلى أي جهاز.",
        sacrifice_en: "Speed for the people doing the work. Every wall is one more thing that can stand between a doctor and a scan.",
        sacrifice_ar: "سرعة من يؤدون العمل. فكل جدار شيء إضافي قد يقف بين طبيب وصورة أشعة.",
        works_en: "It would have stopped this. One infected machine infects one room, not fourteen hospitals, and it protects the scanner without touching the scanner.",
        works_ar: "كان سيوقف هذا. فالجهاز المصاب يصيب غرفة واحدة لا أربعة عشر مستشفى، ويحمي الماسح دون لمسه.",
        breaks_en: "Against the hospital itself. Clinicians route around anything that slows them down, and a rule that gets in the way of care is switched off within a month.",
        breaks_ar: "ينكسر أمام المستشفى نفسه. فالأطباء يلتفون حول كل ما يبطئهم، والقاعدة التي تعرقل الرعاية تُطفأ خلال شهر.",
      },
    ],
    collision_en: [
      { head_en: "Where their insights contradict each other",
        body_en: "Darktrace says the network is the truth and the machine lies. CrowdStrike says the machine is the truth and the network is a guess. Both are right, which tells you the problem has two halves and no one has both." },
      { head_en: "The assumption all three share",
        body_en: "Every one of them assumes somebody is watching the output. Darktrace needs a human to judge an anomaly, CrowdStrike needs someone to install and maintain agents, Vectra needs someone to act while an intrusion is still in progress. None of them survive a hospital with two overworked staff on a Friday night, and that is the actual condition of most of the places that get hit." },
      { head_en: "The one that would have worked, and did not happen",
        body_en: "Segmentation would have stopped this, and it needs no agent on the scanner at all. It is standard practice and it is written into guidance. It mostly does not get done, because every wall is one more thing between a doctor and a scan, and a rule that slows down care gets switched off within a month. The wall the first three hit is technical. The wall this one hits is a hospital." },
    ],
    collision_ar: [
      { head_ar: "أين تتناقض رؤاهم",
        body_ar: "تقول دارك تريس إن الشبكة هي الحقيقة وإن الجهاز يكذب. وتقول كراود سترايك إن الجهاز هو الحقيقة وإن الشبكة تخمين. وكلاهما محق، وهذا يخبرك أن للمشكلة نصفين ولا أحد يملك النصفين معاً." },
      { head_ar: "الافتراض الذي يشتركون فيه جميعاً",
        body_ar: "كل واحد منهم يفترض أن هناك من يراقب المخرجات. فدارك تريس تحتاج إنساناً يحكم على الشذوذ، وكراود سترايك تحتاج من يثبت الوكلاء ويصونها، وفيكترا تحتاج من يتصرف والاختراق جار. ولا ينجو أي منها في مستشفى فيه موظفان منهكان ليلة جمعة، وهذا هو الحال الفعلي لمعظم الأماكن التي تُصاب." },
      { head_ar: "الحل الذي كان سينجح، ولم يحدث",
        body_ar: "التقسيم كان سيوقف هذا، ولا يحتاج وكيلاً على الماسح إطلاقاً. وهو ممارسة معيارية ومكتوب في الإرشادات. لكنه لا يُنفَّذ غالباً، لأن كل جدار شيء إضافي بين طبيب وصورة أشعة، والقاعدة التي تبطئ الرعاية تُطفأ خلال شهر. الجدار الذي اصطدمت به الثلاثة الأولى تقني. أما جدار هذا فهو المستشفى نفسه." },
    ],
    gap_en: "What is needed is a way to protect a machine that cannot be modified, without a person watching at the moment it matters, and without ever standing between a clinician and the patient in front of them.",
    gap_ar: "المطلوب طريقة لحماية جهاز لا يمكن تعديله، دون أن يراقب شخص في اللحظة الحاسمة، ودون أن تقف يوماً بين طبيب والمريض الذي أمامه.",
    needs: ["malware", "normal-traffic", "behavioural-detection", "endpoints", "zero-day"],
  },
];

export const caseById = (id: string) => CASES.find(c => c.id === id);
export const casesForDomain = (d: string) => CASES.filter(c => c.domain === d);
