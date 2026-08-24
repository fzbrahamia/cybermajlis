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
  "brine-gulf": {
    scene_en: [
      "The water in your glass was in the Gulf a few days ago.",
      "It was pumped ashore, the salt was taken out of it, and it came to your tap. That part works, and it has worked for sixty years.",
      "The salt that was taken out left the plant through a second pipe, thicker than the first, and went back into the same sea.",
    ],
    scene_ar: [
      "الماء في كأسك كان في الخليج قبل أيام.",
      "ضُخّ إلى البرّ، وأُخرِج منه الملح، فوصل إلى صنبورك. وهذا الجزء ينجح، وقد نجح ستين عاماً.",
      "أما الملح المُخرَج فغادر المحطة عبر أنبوب ثانٍ أسمك من الأول، وعاد إلى البحر نفسه.",
    ],
    hook_en: "Nothing was spilled and nothing broke. So why is this a problem at all?",
    hook_ar: "لم يُسكب شيء ولم ينكسر شيء. فلماذا تُعدّ هذه مشكلة أصلاً؟",

    initial: [
      {
        id: "what", open: true, by: "hamad",
        q_en: "What do you think the problem is here?", q_ar: "ما المشكلة هنا في رأيك؟",
        hint_en: "No right answer yet.", hint_ar: "لا إجابة صحيحة بعد.",
        react_en: "Saved. You will read this back at the end and see how far you moved.",
        react_ar: "حُفظت. ستقرؤها في النهاية وترى كم تحركت.",
      },
      {
        id: "guess", by: "hamad",
        q_en: "Where do you think most of that second pipe goes?", q_ar: "إلى أين يذهب معظم ما في الأنبوب الثاني في ظنك؟",
        choices: [
          { en: "Back into the sea", ar: "إلى البحر مرة أخرى",
            react_en: "Yes. Almost all of it, almost everywhere.", react_ar: "نعم. جلّه تقريباً، في كل مكان تقريباً." },
          { en: "Into the ground", ar: "إلى باطن الأرض",
            react_en: "Some places do this. It costs more and there is nowhere near enough room.", react_ar: "بعض الأماكن تفعل هذا. وهو أغلى، ولا مكان يكفي أصلاً." },
          { en: "It gets dried into salt", ar: "يُجفَّف ليصير ملحاً",
            react_en: "Drying it would take more energy than making the water did.", react_ar: "تجفيفه يستهلك طاقة أكثر مما استهلكه صنع الماء." },
        ],
      },
    ],

    evidence: [
      { id: "how-much", tag_en: "How much", tag_ar: "كم",
        head_en: "Two litres back for every one you drink",
        head_ar: "لتران يعودان مقابل كل لتر تشربه",
        body_en: "Across this region, roughly two cubic metres go back to the sea for every cubic metre of drinking water made. It is not a trickle. It is more than what comes out of the tap.",
        body_ar: "في هذه المنطقة يعود نحو مترين مكعبين إلى البحر مقابل كل متر مكعب من ماء الشرب. وليس هذا رشحاً. بل أكثر مما يخرج من الصنبور." },
      { id: "method", tag_en: "It depends how", tag_ar: "يعتمد على الطريقة", turn: true,
        head_en: "Seven to one, or one to one",
        head_ar: "سبعة إلى واحد، أو واحد إلى واحد",
        body_en: "Plants that boil the water send back around seven for every one they make. Plants that push it through a membrane send back around one for one. The older and larger plants on this coast are the ones that boil.",
        body_ar: "المحطات التي تغلي الماء تعيد نحو سبعة مقابل كل واحد تصنعه. والتي تدفعه عبر غشاء تعيد نحو واحد لواحد. والمحطات الأقدم والأكبر على هذا الساحل هي التي تغلي." },
      { id: "shallow", tag_en: "The sea itself", tag_ar: "البحر نفسه",
        head_en: "Thirty four metres deep, one narrow way out",
        head_ar: "أربعة وثلاثون متراً عمقاً، ومخرج ضيق واحد",
        body_en: "The Gulf is shallow for a sea and opens to the ocean through a single narrow strait. Along this coast the water takes about three years to be exchanged.",
        body_ar: "الخليج ضحل بمقياس البحار، وينفتح على المحيط عبر مضيق ضيق واحد. وعلى هذا الساحل يستغرق تبديل الماء نحو ثلاث سنوات." },
      { id: "already", tag_en: "Before anyone added anything", tag_ar: "قبل أن يضيف أحد شيئاً",
        head_en: "It was already saltier than the ocean",
        head_ar: "كان أملح من المحيط أصلاً",
        body_en: "Around forty parts of salt per thousand, against about thirty five in the open ocean, because the sun lifts fresh water off the top faster than rain puts it back.",
        body_ar: "نحو أربعين جزءاً من الملح في الألف، مقابل خمسة وثلاثين في المحيط المفتوح، لأن الشمس ترفع الماء العذب من السطح أسرع مما يعيده المطر." },
      { id: "everyone", tag_en: "Who else", tag_ar: "ومن غيرك",
        head_en: "Every country around it does the same thing",
        head_ar: "كل دولة حوله تفعل الشيء ذاته",
        body_en: "Every coast on this sea drinks from it and returns to it. Nobody is doing anything unusual, and that is what makes it hard.",
        body_ar: "كل ساحل على هذا البحر يشرب منه ويعيد إليه. لا أحد يفعل شيئاً غير معتاد، وهذا بعينه ما يجعلها صعبة." },
    ],

    reconsider: [
      {
        id: "revise", by: "hamad",
        q_en: "Now that you have read all five, which one changed your mind the most?",
        q_ar: "بعد أن قرأت الخمسة، أيها غيّر رأيك أكثر؟",
        choices: [
          { en: "Seven to one", ar: "سبعة إلى واحد",
            react_en: "It is the one most people have never heard. The method matters more than the amount of water.", react_ar: "هو ما لم يسمعه معظم الناس. الطريقة أهم من كمية الماء." },
          { en: "The sea is shallow", ar: "البحر ضحل",
            react_en: "A deep open coast would forgive most of this. This one does not.", react_ar: "الساحل العميق المفتوح يغفر معظم هذا. وهذا لا يغفر." },
          { en: "It was already salty", ar: "كان مالحاً أصلاً",
            react_en: "So you are not starting from zero. You are adding to something already high.", react_ar: "إذن أنت لا تبدأ من صفر. بل تضيف إلى شيء مرتفع أصلاً." },
          { en: "Everybody does it", ar: "الجميع يفعلها",
            react_en: "That is what makes it a hard problem rather than a bad company.", react_ar: "هذا ما يجعلها مشكلة صعبة لا شركة سيئة." },
        ],
      },
      {
        id: "cost", open: true, by: "hamad",
        q_en: "Somebody says: just recover more water from each batch, then less goes back. What is wrong with that?",
        q_ar: "يقول أحدهم: استخلص ماء أكثر من كل دفعة، فيعود أقل. ما الخطأ في ذلك؟",
        hint_en: "Think about what is left behind, not how much of it there is.",
        hint_ar: "فكّر فيما يتبقّى، لا في كميته.",
      },
    ],

    discovery: {
      open_en: "Before you go any further, there is one thing you have to be able to feel, or none of the rest will make sense.",
      open_ar: "قبل أن تمضي أبعد، ثمة شيء واحد يجب أن تحسّه، وإلا لن يكون لبقية الأمر معنى.",
      asks: [
        {
          id: "which-way", by: "hamad",
          q_en: "Fresh water on one side of a wall, salty water on the other, and the holes are too small for salt. Nobody touches it. Which way does the water go?",
          q_ar: "ماء عذب على جانب من جدار، وماء مالح على الآخر، والثقوب أضيق من أن يمر بها الملح. ولا يلمسه أحد. في أي اتجاه يذهب الماء؟",
          choices: [
            { en: "Toward the salt", ar: "نحو الملح",
              react_en: "Yes. On its own, for free, with nobody pushing.", react_ar: "نعم. وحده، بلا مقابل، ولا أحد يدفعه." },
            { en: "Away from the salt", ar: "بعيداً عن الملح",
              react_en: "The other way. It goes toward the salt, which is the surprising part.", react_ar: "بل العكس. يذهب نحو الملح، وهذا هو المدهش." },
            { en: "It stays still", ar: "يبقى ساكناً",
              react_en: "It moves. Toward the salt, until both sides pull equally.", react_ar: "بل يتحرك. نحو الملح، حتى يتساوى شدّ الجانبين." },
          ],
        },
        {
          id: "so-what", open: true, by: "rouda",
          q_en: "If water goes toward salt for free, what does that tell you about sending it the other way?",
          q_ar: "إذا كان الماء يذهب نحو الملح بلا مقابل، فماذا يخبرك ذلك عن إرساله في الاتجاه الآخر؟",
        },
      ],
      reveal_en: "You have just worked out why drinking water costs anything at all.",
      reveal_ar: "لقد استنتجت للتو لماذا يكلّف ماء الشرب أي شيء أصلاً.",
      concept_en: "Osmosis, and the price of going back",
      concept_ar: "التناضح، وثمن العودة",
      body_en: [
        "Water crosses toward salt by itself. To send it back the other way you have to push harder than the salt pulls, and that pushing is the entire cost.",
        "The pull has a number. For ordinary seawater it is about twenty seven bar, roughly thirteen times the pressure in a car tyre. Below that, nothing crosses.",
        "And the saltier the water gets, the higher that number climbs. Hold onto that. It is going to come back.",
      ],
      body_ar: [
        "يعبر الماء نحو الملح وحده. ولإعادته في الاتجاه الآخر عليك أن تدفع أشدّ مما يشدّ الملح، وذلك الدفع هو التكلفة كلها.",
        "وللشدّ رقم. ففي ماء البحر العادي نحو سبعة وعشرين باراً، أي نحو ثلاثة عشر ضعف الضغط في إطار سيارة. ودون ذلك لا يعبر شيء.",
        "وكلما ازداد الماء ملوحة ارتفع ذلك الرقم. تمسّك بهذا. فسيعود.",
      ],
      check: {
        id: "check-osmosis", by: "rouda",
        q_en: "A plant has been running for twenty years and the sea around it has got slightly saltier. What happens to its electricity bill?",
        q_ar: "محطة تعمل منذ عشرين عاماً وازداد البحر حولها ملوحة قليلاً. ماذا يحدث لفاتورة كهربائها؟",
        choices: [
          { en: "It goes up", ar: "ترتفع",
            react_en: "Right, and that is the loop. Saltier sea, harder push, more electricity, more going back.", react_ar: "صحيح، وهذه هي الحلقة. بحر أملح، دفع أشدّ، كهرباء أكثر، وعائد أكثر." },
          { en: "It goes down", ar: "تنخفض",
            react_en: "The other way. More salt means it pulls harder, so the pumps must push harder.", react_ar: "بل العكس. ملح أكثر يعني شدّاً أقوى، فيجب أن تدفع المضخات أشدّ." },
          { en: "It stays the same", ar: "تبقى كما هي",
            react_en: "It moves. The pull got stronger, so beating it costs more.", react_ar: "بل تتغير. صار الشدّ أقوى، فصار التغلب عليه أغلى." },
        ],
      },
    },

    precise: {
      id: "precise", open: true, by: "rouda",
      q_en: "Say the problem again, as exactly as you can now. Not what is bad about it. What is actually being demanded.",
      q_ar: "قل المشكلة مرة أخرى، بأدقّ ما تستطيع الآن. لا ما هو سيئ فيها. بل ما هو مطلوب فعلاً.",
      hint_en: "The one you wrote at the start is still saved. Nobody is comparing them yet.",
      hint_ar: "ما كتبته في البداية ما زال محفوظاً. ولا أحد يقارن بينهما بعد.",
    },

    films: {
      boil: {
        support: "guided",
        beats: [
          { en: "Heat the seawater until it flashes into steam.", ar: "سخّن ماء البحر حتى يتحول فجأة إلى بخار." },
          { en: "Salt cannot evaporate, so it stays behind.", ar: "الملح لا يتبخر، فيبقى خلفه." },
          { en: "Catch the steam and cool it. What condenses is fresh.", ar: "التقط البخار وبرّده. فما يتكثف عذب." },
          { en: "It only makes sense beside a power station that is wasting heat anyway.", ar: "ولا معنى له إلا بجوار محطة كهرباء تهدر حرارتها أصلاً." },
        ],
        ask: {
          id: "film-boil", by: "hamad",
          q_en: "What does this one need in order to exist at all?",
          q_ar: "ما الذي يحتاجه هذا كي يوجد أصلاً؟",
          choices: [
            { en: "A power station next door", ar: "محطة كهرباء مجاورة",
              react_en: "Yes. Take that away and the whole idea stops making sense.", react_ar: "نعم. أزلها وتفقد الفكرة كلها معناها." },
            { en: "Very clean seawater", ar: "ماء بحر نظيف جداً",
              react_en: "That is the other method. This one does not care how dirty the water is.", react_ar: "تلك هي الطريقة الأخرى. وهذه لا يعنيها كم الماء متسخ." },
            { en: "A buyer for the salt", ar: "مشترٍ للملح",
              react_en: "That is a different approach again. This one just returns it.", react_ar: "تلك طريقة أخرى أيضاً. وهذه تعيده فحسب." },
          ],
        },
      },
      membrane: {
        support: "guided",
        beats: [
          { en: "Push seawater against a wall with holes too small for salt.", ar: "ادفع ماء البحر على جدار بثقوب أضيق من أن يمر بها الملح." },
          { en: "Push harder than the salt pulls, and water crosses the wrong way.", ar: "ادفع أشدّ مما يشدّ الملح، فيعبر الماء عكس اتجاهه." },
          { en: "Far less energy than boiling, and it can be built at any size.", ar: "طاقة أقل بكثير من الغلي، ويمكن بناؤه بأي حجم." },
          { en: "But the water has to be cleaned first, in a whole second plant.", ar: "لكن يجب تنظيف الماء أولاً، في محطة ثانية كاملة." },
        ],
        ask: {
          id: "film-membrane", by: "hamad",
          q_en: "You met this wall already. Where?",
          q_ar: "قابلت هذا الجدار من قبل. أين؟",
          choices: [
            { en: "The one water crossed by itself", ar: "الذي عبره الماء وحده",
              react_en: "The same wall, run backwards. That is the whole trick.", react_ar: "الجدار نفسه، معكوساً. وهذه هي الحيلة كلها." },
            { en: "I have not", ar: "لم أقابله",
              react_en: "Go back a step. It is the wall the water crossed toward the salt.", react_ar: "ارجع خطوة. إنه الجدار الذي عبره الماء نحو الملح." },
          ],
        },
      },
      recovery: {
        support: "questioned",
        beats: [
          { en: "The water leaving the membrane is still under almost full pressure.", ar: "الماء الخارج من الغشاء ما زال تحت الضغط الكامل تقريباً." },
          { en: "For years it was let out through a valve and lost as noise and heat.", ar: "وسنوات طويلة كان يُطلق عبر صمام فيضيع ضجيجاً وحرارة." },
          { en: "A spinning ceramic wheel lets it push the incoming seawater instead.", ar: "عجلة خزفية دوّارة تدعه يدفع ماء البحر الداخل بدلاً من ذلك." },
          { en: "It cut the energy roughly in half.", ar: "خفض الطاقة إلى النصف تقريباً." },
        ],
        ask: {
          id: "film-recovery", open: true, by: "rouda",
          q_en: "This one made the water much cheaper. Does that help the sea, hurt it, or both? Say why.",
          q_ar: "هذه جعلت الماء أرخص كثيراً. فهل تساعد البحر أم تضرّه أم الاثنين؟ وقل لماذا.",
        },
      },
      mining: {
        support: "alone",
        beats: [
          { en: "What comes back is seawater with everything valuable in it doubled.", ar: "ما يعود هو ماء بحر تضاعف فيه كل ثمين." },
          { en: "Pull out magnesium, bromine and salt in stages.", ar: "استخرج المغنيسيوم والبروم والملح على مراحل." },
          { en: "Ideally send nothing liquid back at all.", ar: "والأمثل ألا تعيد سائلاً أبداً." },
          { en: "Mostly still in pilots, not in service.", ar: "وما زال أغلبه تجارب لا خدمة." },
        ],
        ask: {
          id: "film-mining", open: true, by: "rouda",
          q_en: "This one has to sell what it takes out. What could go wrong with that, if every plant did it?",
          q_ar: "هذه عليها أن تبيع ما تستخرجه. فما الذي قد يسوء لو فعلت كل محطة ذلك؟",
        },
      },
    },

    retrieval: {
      id: "retrieval", by: "rouda",
      q_en: "You worked something out earlier about a sea getting saltier. Say it again, in your own words.",
      q_ar: "استنتجت شيئاً سابقاً عن بحر يزداد ملوحة. قله مرة أخرى بكلماتك.",
      hint_en: "It connects to why every one of these four costs what it costs.",
      hint_ar: "يرتبط بسبب تكلفة كل واحدة من هذه الأربع.",
    },

    discussion: [
      {
        id: "opposite", by: "hamad",
        q_en: "Which two of these four are furthest apart in what they believe?",
        q_ar: "أي اثنتين من هذه الأربع أبعد ما تكونان في ما تؤمنان به؟",
        choices: [
          { en: "Boiling and selling the salt", ar: "الغلي وبيع الملح",
            react_en: "One treats what comes back as waste, the other as the product. That is as far apart as it gets.", react_ar: "إحداهما تعدّ العائد نفاية، والأخرى تعدّه المنتج. وهذا أبعد ما يكون." },
          { en: "Boiling and membranes", ar: "الغلي والأغشية",
            react_en: "Different machines, same belief: make water, return the rest.", react_ar: "آلتان مختلفتان، والاعتقاد واحد: اصنع الماء وأعد الباقي." },
          { en: "Membranes and handing the pressure back", ar: "الأغشية وإعادة الضغط",
            react_en: "Those two are on the same side. One is a part inside the other.", react_ar: "هاتان في صف واحد. إحداهما جزء داخل الأخرى." },
        ],
      },
      {
        id: "shared", open: true, by: "rouda",
        q_en: "Read the last row of all four again. What is the one thing none of them did?",
        q_ar: "اقرأ الصف الأخير للأربع مرة أخرى. ما الشيء الوحيد الذي لم تفعله أي منها؟",
      },
    ],

    gap: {
      id: "gap", open: true, by: "hamad",
      q_en: "Write what is still missing. One sentence, and put the hard part at the end of it.",
      q_ar: "اكتب ما زال ناقصاً. جملة واحدة، وضع الجزء الصعب في آخرها.",
      hint_en: "A wish has no cost in it. A gap does.",
      hint_ar: "الأمنية لا تكلفة فيها. أما الفجوة ففيها.",
    },

    challenge: {
      parts_en: [
        "I want to help ", " by ", ". It only works if ", " is true, and I would know I was wrong if ", "." ,
      ],
      parts_ar: [
        "أريد أن أساعد ", " عن طريق ", ". ولا ينجح هذا إلا إذا كان ", " صحيحاً، وسأعرف أنني مخطئ إذا ", ".",
      ],
      hints_en: [
        "who or what",
        "the smallest thing you would actually do",
        "the thing that has to be true",
        "what you would see happen",
      ],
      hints_ar: [
        "من أو ما",
        "أصغر شيء ستفعله فعلاً",
        "الشيء الذي يجب أن يكون صحيحاً",
        "ما الذي سترى حدوثه",
      ],
      rule_en: "The last blank is the important one. Anything you cannot be wrong about is not an idea yet.",
      rule_ar: "الفراغ الأخير هو المهم. فما لا يمكن أن تخطئ فيه ليس فكرة بعد.",
    },

    next: [
      {
        id: "proposal", open: true, by: "hamad",
        q_en: "What is the smallest thing you could build or measure to test it? Small enough to do in a week.",
        q_ar: "ما أصغر شيء يمكنك بناؤه أو قياسه لاختبارها؟ صغير بما يكفي لتفعله في أسبوع.",
      },
      {
        id: "hypothesis", open: true, by: "rouda",
        q_en: "What would you see that would make you drop this idea completely?",
        q_ar: "ما الذي لو رأيته لتركت هذه الفكرة تماماً؟",
      },
    ],

    reflect: {
      id: "changed", open: true, by: "rouda",
      q_en: "Look at the two answers above. What do you see now that you did not see at the start?",
      q_ar: "انظر إلى الجوابين أعلاه. ما الذي تراه الآن ولم تكن تراه في البداية؟",
    },
  },
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
