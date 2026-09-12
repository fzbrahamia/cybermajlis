// ============================================================
// WHY YOU
//
// The other two tracks answer "what is this" and "what did it cost". This one
// answers the question that actually stops people: why would anyone come for
// me. It is addressed to a person, not to a topic, and it is written in the
// second person the whole way through.
//
// Two claims, and the second is the one everybody skips:
//   1. you hold something worth taking
//   2. you are a way in to somebody who does
// A lesson that only makes the first claim leaves every small supplier
// believing they are too small to be worth an attacker's afternoon, which is
// precisely the belief the supply chain runs on.
//
// SHAPE. No film. There are enough films. A lesson here is a run of short
// beats on one lit stage, each beat a different picture, with Hamad and Rouda
// talking over it. The renderer is components/cyber/Stage.tsx; every beat kind
// below is a case in that switch, so a new kind means a new picture and both
// have to be added together.
// ============================================================

/* `pose` is optional: left out the speaker simply talks, and whoever is not
   speaking always listens. Name one only where the beat wants a reaction. */
import type { Pose } from "@/components/cyber/Character";

export type Say = {
  who: "hamad" | "rouda";
  pose?: Pose;
  en: string; ar: string;
};

type Base = {
  id: string;
  /** What the two of them say while this picture is up. */
  say: Say[];
};

/** One line a person said out loud, on a card, with nothing else on it. */
type Said = Base & {
  kind: "said";
  meta_en: string; meta_ar: string;
  text_en: string; text_ar: string;
};

/** The same card, opened up into the fields it really is. */
type Row = Base & {
  kind: "row";
  head_en: string; head_ar: string;
  fields: {
    label_en: string; label_ar: string;
    value_en: string; value_ar: string;
    /** Why this field is not like the same field at a shop. */
    weight_en: string; weight_ar: string;
    /** The two that carry the beat. Drawn heavier. */
    heavy?: boolean;
  }[];
};

/** Two columns, and one of them does not balance. */
type Worth = Base & {
  kind: "worth";
  left:  { head_en: string; head_ar: string; items_en: string[]; items_ar: string[]; foot_en: string; foot_ar: string };
  right: { head_en: string; head_ar: string; items_en: string[]; items_ar: string[]; foot_en: string; foot_ar: string };
};

/** A thread between two people, and where the thread actually runs. */
type Promise_ = Base & {
  kind: "promise";
  a_en: string; a_ar: string;
  b_en: string; b_ar: string;
  thread_en: string; thread_ar: string;
  /** What the words are actually kept on. Named plainly, in the reader's
      words: "a server" is not a word most of this audience uses. */
  keeps_en: string; keeps_ar: string;
  reveal_en: string; reveal_ar: string;
};

/** It already happened. Facts land one at a time, then the twist. */
type Turn = Base & {
  kind: "turn";
  when_en: string; when_ar: string;
  hits: { head_en: string; head_ar: string; body_en: string; body_ar: string }[];
  twist_en: string; twist_ar: string;
};

/** The camera pulls back and you are a node, not the map. */
type Chain = Base & {
  kind: "chain";
  you_en: string; you_ar: string;
  nodes: { name_en: string; name_ar: string; body_en: string; body_ar: string }[];
  rule_en: string; rule_ar: string;
};

/** Small, real, and none of it technical. */
type Do = Base & {
  kind: "do";
  items: { head_en: string; head_ar: string; body_en: string; body_ar: string }[];
};

/** The sentence the whole run exists for. */
type Close = Base & { kind: "close"; line_en: string; line_ar: string };

export type Beat = Said | Row | Worth | Promise_ | Turn | Chain | Do | Close;

export type WhyYou = {
  slug: string;
  /** Who is being spoken to. This is the title, and it is always a person. */
  who_en: string; who_ar: string;
  /** The maroon half of the title. */
  tail_en: string; tail_ar: string;
  line_en: string; line_ar: string;
  minutes: number;
  /** The real case that shows it has already happened to somebody. */
  case?: string;
  beats: Beat[];
};


export const WHY_YOU: WhyYou[] = [
  {
    slug: "therapist",
    who_en: "You who keep", who_ar: "أنت من يحفظ",
    tail_en: "people's secrets", tail_ar: "أسرار الناس",
    line_en: "Therapy, psychology, counselling, social work. Your patient files hold things people have told nobody else.",
    line_ar: "العلاج النفسي وعلم النفس والإرشاد والعمل الاجتماعي. في ملفات مرضاك أشياء لم يقلها الناس لأحد غيرك.",
    minutes: 5,
    case: "therapy-notes",

    beats: [
      {
        id: "said", kind: "said",
        meta_en: "Session 4 · Tuesday · 2:20 pm", meta_ar: "الجلسة الرابعة · الثلاثاء · ٢:٢٠ ظهراً",
        text_en: "I have never told anyone this before.",
        text_ar: "لم أقل هذا لأحد من قبل.",
        say: [
          { who: "rouda", pose: "curious",
            en: "A patient said this to you. Only to you.",
            ar: "قال لك مريض هذا. لك وحدك." },
          { who: "hamad",
            en: "Then you wrote it in their file. You have to. It is part of the job.",
            ar: "ثم كتبتَه في ملفه. ولا بد لك. فهذا جزء من العمل." },
        ],
      },

      {
        id: "row", kind: "row",
        head_en: "What is in that file", head_ar: "ما الذي في ذلك الملف",
        fields: [
          { label_en: "Their name", label_ar: "اسمه",
            value_en: "The real one", value_ar: "الحقيقي",
            weight_en: "They filled in a clinic form, so they wrote their true name on it.",
            weight_ar: "ملأ استمارة عيادة، فكتب اسمه الحقيقي فيها." },
          { label_en: "Their ID number", label_ar: "رقم هويته",
            value_en: "One number, for life", value_ar: "رقم واحد، مدى العمر", heavy: true,
            weight_en: "You cannot change it the way you change a password. It stays with them forever.",
            weight_ar: "لا يمكن تغييره كما تُغيَّر كلمة السر. يبقى معه إلى الأبد." },
          { label_en: "Their address", label_ar: "عنوانه",
            value_en: "Where they live", value_ar: "أين يسكن",
            weight_en: "Some people come to you because someone already knows where they live.",
            weight_ar: "بعض الناس يأتونك لأن أحداً يعرف أين يسكنون." },
          { label_en: "Their diagnosis", label_ar: "تشخيصه",
            value_en: "Written down", value_ar: "مكتوباً",
            weight_en: "A word about them that they did not choose.",
            weight_ar: "كلمة عنه لم يخترها هو." },
          { label_en: "The session notes", label_ar: "ملاحظات الجلسة",
            value_en: "What they actually said", value_ar: "ما قاله فعلاً", heavy: true,
            weight_en: "Nobody else has this. Not their family, not their friends. Only you.",
            weight_ar: "لا أحد غيرك يملك هذا. لا أهله ولا أصدقاؤه. أنت وحدك." },
        ],
        say: [
          { who: "hamad", pose: "explaining",
            en: "It is not one note. It is a whole file about a person.",
            ar: "ليست ملاحظة واحدة. بل ملف كامل عن إنسان." },
          { who: "rouda",
            en: "And a file can be copied. Copying it takes one second.",
            ar: "والملف يُنسخ. ونسخه يستغرق ثانية واحدة." },
        ],
      },

      {
        id: "worth", kind: "worth",
        left: {
          head_en: "If a bank is robbed", head_ar: "لو سُرق مصرف",
          items_en: ["A card number", "A balance"],
          items_ar: ["رقم بطاقة", "رصيد"],
          foot_en: "The bank cancels the card. A new one arrives in a few days. The money comes back.",
          foot_ar: "يلغي المصرف البطاقة. وتصل بطاقة جديدة بعد أيام. ويعود المال." },
        right: {
          head_en: "If your files are stolen", head_ar: "ولو سُرقت ملفاتك",
          items_en: ["A name", "An ID number", "What someone said in therapy"],
          items_ar: ["اسم", "رقم هوية", "ما قاله أحدهم في العلاج"],
          foot_en: "Nothing can be cancelled. There is no new one. What was said cannot be unsaid.",
          foot_ar: "لا شيء يُلغى. ولا بديل. وما قيل لا يُستعاد." },
        say: [
          { who: "rouda", pose: "asking",
            en: "People ask: who would want my data? Compare the two.",
            ar: "يسأل الناس: ومن يريد بياناتي؟ قارن بين الاثنين." },
          { who: "hamad",
            en: "Money can be replaced. This cannot.",
            ar: "المال يُعوَّض. وهذا لا يُعوَّض." },
        ],
      },

      {
        id: "promise", kind: "promise",
        a_en: "The patient", a_ar: "المريض",
        b_en: "You", b_ar: "أنت",
        thread_en: "trusts", thread_ar: "يثق بـ",
        keeps_en: "A computer in an office", keeps_ar: "حاسوب في مكتب",
        reveal_en: "The patient trusted a person. But their words are saved on a computer. If nobody is protecting that computer, then nobody is protecting the promise either. Keeping their file safe is part of your job, not only the IT team's job.",
        reveal_ar: "وثق المريض بإنسان. لكن كلامه محفوظ على حاسوب. فإن لم يحمِ أحد ذلك الحاسوب، فلا أحد يحمي الوعد أيضاً. حفظ ملفه جزء من عملك أنت، لا من عمل قسم تقنية المعلومات وحده.",
        say: [
          { who: "rouda",
            en: "The patient never saw the computer.",
            ar: "لم يرَ المريض ذلك الحاسوب قط." },
          { who: "hamad", pose: "explaining",
            en: "But that is where their words are kept now.",
            ar: "لكنه المكان الذي يُحفظ فيه كلامه الآن." },
        ],
      },

      {
        id: "turn", kind: "turn",
        when_en: "Finland · 2020", when_ar: "فنلندا · ٢٠٢٠",
        hits: [
          { head_en: "A large therapy company", head_ar: "شركة علاج نفسي كبيرة",
            body_en: "Vastaamo ran 25 clinics in Finland. It also treated patients sent to it by the public health service.",
            body_ar: "كانت فاستامو تدير ٢٥ عيادة في فنلندا. وكانت تعالج أيضاً مرضى ترسلهم إليها الخدمة الصحية العامة." },
          { head_en: "Its database had no password", head_ar: "قاعدة بياناتها بلا كلمة سر",
            body_en: "It was connected to the internet, and the main account had no password on it. Nobody had to break in.",
            body_ar: "كانت موصولة بالإنترنت، والحساب الرئيسي بلا كلمة سر. فلم يحتج أحد إلى اقتحام." },
          { head_en: "33,000 patient files were copied", head_ar: "نُسخ ٣٣ ألف ملف مريض",
            body_en: "Names, addresses, ID numbers and the session notes. All of it was saved as plain text, so all of it could be read.",
            body_ar: "أسماء وعناوين وأرقام هوية وملاحظات الجلسات. كلها محفوظة نصاً عادياً، فكلها تُقرأ." },
        ],
        twist_en: "The attacker asked the company for money. The company said no. So he emailed the patients instead, one by one, and asked each of them for money to keep their own therapy notes private.",
        twist_ar: "طلب المهاجم من الشركة مالاً. فرفضت. فراسل المرضى أنفسهم، واحداً واحداً، وطلب من كل واحد مالاً ليبقى كلامه في العلاج سرّاً.",
        say: [
          { who: "rouda", pose: "scared",
            en: "This really happened.",
            ar: "هذا حدث فعلاً." },
          { who: "hamad", pose: "thinking",
            en: "And look who he asked for the money.",
            ar: "وانظر ممّن طلب المال." },
        ],
      },

      {
        id: "chain", kind: "chain",
        you_en: "Your clinic", you_ar: "عيادتك",
        nodes: [
          { name_en: "The government health service", name_ar: "الخدمة الصحية الحكومية",
            body_en: "It sends you patients. Their files are now on your computer, not on the government's.",
            body_ar: "ترسل إليك مرضى. وملفاتهم الآن على حاسوبك أنت، لا على حاسوبها." },
          { name_en: "The systems you log into", name_ar: "الأنظمة التي تدخل إليها",
            body_en: "You have a login to a ministry system. Anyone who takes your login gets in there too.",
            body_ar: "لديك دخول إلى نظام وزارة. ومن أخذ بيانات دخولك دخل هناك أيضاً." },
          { name_en: "The software you all use", name_ar: "البرنامج الذي تستعملونه",
            body_en: "One company makes the software for forty clinics. Get into that company and you reach all forty.",
            body_ar: "شركة واحدة تصنع البرنامج لأربعين عيادة. من دخل تلك الشركة وصل إلى الأربعين." },
        ],
        rule_en: "Attackers do not always attack the place they want. They attack a smaller place that is connected to it. That smaller place can be you, even when nobody wanted your files at all.",
        rule_ar: "لا يهاجم المهاجمون دائماً المكان الذي يريدونه. بل يهاجمون مكاناً أصغر موصولاً به. وقد يكون ذلك المكان الأصغر أنت، حتى لو لم يُرِد أحد ملفاتك أصلاً.",
        say: [
          { who: "hamad", pose: "explaining",
            en: "You are connected to bigger places than your clinic.",
            ar: "أنت موصول بأماكن أكبر من عيادتك." },
          { who: "rouda",
            en: "So you can be the way in, even when you are not the target.",
            ar: "فقد تكون أنت الطريق، وإن لم تكن أنت الهدف." },
        ],
      },

      {
        id: "do", kind: "do",
        items: [
          { head_en: "Find out where the files are kept", head_ar: "اعرف أين تُحفظ الملفات",
            body_en: "Not the name of the app. The actual computer, in the actual building, and who can reach it from outside. Most people cannot answer this. Ask until you can.",
            body_ar: "لا اسم التطبيق. بل الحاسوب نفسه، في المبنى نفسه، ومن يستطيع بلوغه من الخارج. أكثر الناس لا يعرفون الجواب. اسأل حتى تعرفه." },
          { head_en: "Not everyone needs to see everything", head_ar: "ليس كل أحد يحتاج أن يرى كل شيء",
            body_en: "Reception needs the appointment time. Reception does not need the session notes. If one login opens everything, then one stolen login loses everything.",
            body_ar: "الاستقبال يحتاج موعد الجلسة. ولا يحتاج ملاحظاتها. فإن كان دخول واحد يفتح كل شيء، فدخول واحد مسروق يضيّع كل شيء." },
          { head_en: "Write notes as if a stranger will read them", head_ar: "اكتب الملاحظات وكأن غريباً سيقرؤها",
            body_en: "True and useful, and nothing extra. A lot of what gets typed into a file is habit, not something anyone needs later.",
            body_ar: "صادقة ونافعة، وبلا زيادة. وكثير مما يُكتب في الملفات عادة، لا حاجة لأحد به لاحقاً." },
          { head_en: "Decide now what you would do", head_ar: "قرّر الآن ماذا ستفعل",
            body_en: "If the files were stolen tomorrow: who calls the patients, on what day, and what do they say? In Finland, most patients heard it from the attacker first.",
            body_ar: "لو سُرقت الملفات غداً: من يتصل بالمرضى، وفي أي يوم، وبأي كلام؟ في فنلندا سمع أكثر المرضى الخبر من المهاجم أولاً." },
        ],
        say: [
          { who: "rouda",
            en: "None of these four things needs a technical person.",
            ar: "لا يحتاج أي من هذه الأربعة إلى شخص تقني." },
          { who: "hamad", pose: "thumbs-up",
            en: "Pick the first one and do it this week.",
            ar: "اختر الأول وافعله هذا الأسبوع." },
        ],
      },

      {
        id: "close", kind: "close",
        line_en: "Someone told you something they never told anyone. Keeping it safe is part of taking care of them.",
        line_ar: "قال لك أحدهم شيئاً لم يقله لأحد. وحفظه جزء من رعايتك له.",
        say: [
          { who: "rouda", pose: "satisfied",
            en: "That is the whole lesson.",
            ar: "وهذا هو الدرس كله." },
        ],
      },
    ],
  },
];

export const whyYouBySlug = (slug: string) => WHY_YOU.find(w => w.slug === slug);
