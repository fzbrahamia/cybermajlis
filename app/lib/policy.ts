// ============================================================
// PRIVACY POLICY — one text, every majlis
//
// There is deliberately only one policy. Three majalis with three policies
// would drift apart, and a family reading one of them would not know it did
// not cover the others. This array is the whole text; components/PolicyDialog
// renders it in the footer of every majlis.
// ============================================================

export interface PolicySection { t: string; tAr: string; body: (string | string[])[]; bodyAr: (string | string[])[]; }

const UPDATED = "1 August 2026";

export const POLICY: PolicySection[] = [
  {
    t: "Who we are",
    tAr: "من نحن",
    body: ["CyberMajlis is an educational platform that teaches cybersecurity awareness to children, families, and seniors in Qatar through lessons, games, and simulations. This page explains, in simple terms, what information we collect and how we look after it."],
    bodyAr: ["مجلس الأمن السيبراني منصّة تعليمية تُعلّم الوعي بالأمن السيبراني للأطفال والعائلات وكبار السن في قطر من خلال الدروس والألعاب والمحاكاة. تشرح هذه الصفحة بلغة بسيطة ما المعلومات التي نجمعها وكيف نعتني بها."],
  },
  {
    t: "What we collect",
    tAr: "ما الذي نجمعه",
    body: [
      "We collect only what we need to run the learning experience:",
      [
        "Account details, your email, a username, and the guardian character you pick. Your password is stored securely by Firebase and is never visible to us.",
        "Learning progress, lessons completed, quiz scores, game scores and XP, the CTF flags you capture (by skill area), and how you do in SOC scenarios.",
        "Usage analytics, which pages and features you open. These are anonymous counts tied to your account, not the content of anything you write.",
        "Community posts, any warning or report you choose to share in the Community.",
        "AI assistant, messages you send to the assistant, kept for safety and abuse monitoring, together with a one-way hashed network identifier (not your real IP address).",
        "Scanner, links or files you submit for a safety check.",
      ],
    ],
    bodyAr: [
      "نجمع فقط ما نحتاجه لتشغيل تجربة التعلّم:",
      [
        "بيانات الحساب، بريدك الإلكتروني واسم المستخدم والشخصية الحارسة التي تختارها. تُخزَّن كلمة مرورك بأمان عبر Firebase ولا نراها أبداً.",
        "تقدّم التعلّم، الدروس المكتملة ونتائج الاختبارات ونقاط الألعاب وXP والأعلام التي تلتقطها في التحدّيات (حسب المهارة) وأداؤك في سيناريوهات مركز العمليات.",
        "تحليلات الاستخدام، أي الصفحات والميزات التي تفتحها. وهي أعداد مجهولة مرتبطة بحسابك، وليست محتوى ما تكتبه.",
        "منشورات المجتمع، أي تحذير أو بلاغ تختار مشاركته في المجتمع.",
        "المساعد الذكي، الرسائل التي ترسلها للمساعد، تُحفظ للأمان ومراقبة إساءة الاستخدام، مع معرّف شبكة مُجزّأ باتجاه واحد (وليس عنوان IP الحقيقي).",
        "الماسح، الروابط أو الملفات التي ترسلها للفحص.",
      ],
    ],
  },
  {
    t: "How we use it",
    tAr: "كيف نستخدمها",
    body: [
      "We use this information only to: run your account and save your progress; show you a leaderboard and achievements; understand which lessons and features help most, so we can improve them and remove ones that don't; keep the platform safe from abuse; and answer your questions through the assistant.",
      "We do not sell your data, we do not show third-party advertising, and we do not use your data to build profiles for marketing.",
    ],
    bodyAr: [
      "نستخدم هذه المعلومات فقط من أجل: تشغيل حسابك وحفظ تقدّمك؛ عرض لوحة المتصدّرين والإنجازات؛ فهم أي الدروس والميزات الأكثر فائدة لتحسينها وإزالة غير المفيد؛ حماية المنصّة من إساءة الاستخدام؛ والإجابة عن أسئلتك عبر المساعد.",
      "نحن لا نبيع بياناتك، ولا نعرض إعلانات من أطراف ثالثة، ولا نستخدم بياناتك لبناء ملفات تسويقية.",
    ],
  },
  {
    t: "Who processes data for us",
    tAr: "من يعالج البيانات نيابة عنا",
    body: [
      "We rely on a small number of trusted providers to deliver the service:",
      [
        "Google Firebase, accounts, database and hosting.",
        "Anthropic (Claude), powers the AI assistant, news summaries, and scenario generation.",
        "ElevenLabs, turns lesson text into audio for the read-aloud feature.",
        "VirusTotal, analyses links and files you submit to the scanner.",
        "Public security news sources (The Hacker News, BleepingComputer, Krebs on Security), we read their public feeds; we never send them your information.",
      ],
    ],
    bodyAr: [
      "نعتمد على عدد قليل من مزوّدي الخدمات الموثوقين لتقديم الخدمة:",
      [
        "Google Firebase, الحسابات وقاعدة البيانات والاستضافة.",
        "Anthropic (Claude), يشغّل المساعد الذكي وملخّصات الأخبار وتوليد السيناريوهات.",
        "ElevenLabs, يحوّل نص الدرس إلى صوت لميزة القراءة الصوتية.",
        "VirusTotal, يحلّل الروابط والملفات التي ترسلها للماسح.",
        "مصادر أخبار أمنية عامة (The Hacker News وBleepingComputer وKrebs on Security), نقرأ خلاصاتها العامة ولا نرسل إليها معلوماتك أبداً.",
      ],
    ],
  },
  {
    t: "Children's privacy",
    tAr: "خصوصية الأطفال",
    body: ["CyberMajlis is designed for young learners. We collect the minimum information needed, and we encourage a parent or guardian to be involved. Parents and guardians may ask to see or delete a child's data at any time. If you believe a child has given us information without a guardian's involvement, contact us and we will remove it."],
    bodyAr: ["صُمّم مجلس الأمن السيبراني للمتعلّمين الصغار. نجمع الحد الأدنى من المعلومات اللازمة، ونشجّع على مشاركة أحد الوالدين أو ولي الأمر. يمكن للوالدين وأولياء الأمور طلب الاطّلاع على بيانات الطفل أو حذفها في أي وقت. إذا كنت تعتقد أن طفلاً قدّم لنا معلومات دون مشاركة وليّ أمره، تواصل معنا وسنحذفها."],
  },
  {
    t: "Your choices and rights",
    tAr: "خياراتك وحقوقك",
    body: ["You stay in control. From Settings you can view and edit your profile, change your password, and permanently delete your account along with the data linked to it. You can also browse most of the site without signing in."],
    bodyAr: ["تبقى أنت المتحكّم. من الإعدادات يمكنك عرض ملفك وتعديله وتغيير كلمة مرورك وحذف حسابك نهائياً مع البيانات المرتبطة به. ويمكنك أيضاً تصفّح معظم الموقع دون تسجيل دخول."],
  },
  {
    t: "Deleting your account",
    tAr: "حذف حسابك",
    body: [
      "When you delete your account, from Settings on the web or in the app, we remove it completely. Deletion is immediate and permanent: there is no hidden “deactivated” state and no recovery period.",
      "In a single step we erase everything linked to you:",
      [
        "your profile and login (email, username, avatar) and your reserved username, so it becomes free for others;",
        "all learning progress, quiz results, game scores, XP and achievements;",
        "your messages to the AI assistant, and your usage analytics;",
        "and finally the sign-in account itself.",
      ],
      "Scam warnings you shared in the Community are the one exception: to keep protecting other people, the warning itself stays published — but we remove your account from it, so once you are deleted it can no longer be traced back to you.",
      "The only other thing that may remain is aggregate safety records that carry no account identifier — just a one-way hashed network value we cannot trace back to you — kept briefly to protect the platform from abuse. Once deletion is complete, nothing that identifies you is left on our systems.",
    ],
    bodyAr: [
      "عند حذف حسابك، من الإعدادات على الويب أو في التطبيق، نزيله بالكامل. الحذف فوري ونهائي: لا توجد حالة “معطّلة” مخفية ولا فترة استرجاع.",
      "في خطوة واحدة نمحو كل ما يرتبط بك:",
      [
        "ملفك الشخصي وتسجيل دخولك (البريد الإلكتروني واسم المستخدم والصورة الرمزية) واسم المستخدم المحجوز، ليصبح متاحاً للآخرين؛",
        "كل تقدّم التعلّم ونتائج الاختبارات ونقاط الألعاب وXP والإنجازات؛",
        "رسائلك إلى المساعد الذكي، وتحليلات استخدامك؛",
        "وأخيراً حساب الدخول نفسه.",
      ],
      "التحذيرات من عمليات الاحتيال التي شاركتها في المجتمع هي الاستثناء الوحيد: لحماية الآخرين يبقى التحذير نفسه منشوراً — لكننا نزيل حسابك منه، فبعد حذفك لا يمكن ربطه بك.",
      "الشيء الآخر الوحيد الذي قد يبقى هو سجلّات أمان مجمّعة لا تحمل أي معرّف للحساب — مجرّد قيمة شبكة مُجزّأة باتجاه واحد لا يمكننا تتبّعها إليك — تُحفظ لفترة قصيرة لحماية المنصّة من إساءة الاستخدام. بمجرد اكتمال الحذف، لا يبقى في أنظمتنا أي شيء يعرّف بهويتك.",
    ],
  },
  {
    t: "How we keep data safe",
    tAr: "كيف نحافظ على أمان البيانات",
    body: ["Data is encrypted in transit (HTTPS). Access is controlled by Firebase Authentication and Firestore Security Rules, so each person can only reach their own data; administrative access is restricted to authorised staff. Passwords are hashed by Firebase, and network identifiers we keep for safety are stored only as one-way hashes."],
    bodyAr: ["تُشفَّر البيانات أثناء النقل (HTTPS). يُتحكَّم بالوصول عبر مصادقة Firebase وقواعد أمان Firestore، فلا يصل كل شخص إلا إلى بياناته؛ والوصول الإداري مقصور على الموظفين المخوَّلين. تُجزَّأ كلمات المرور بواسطة Firebase، ولا نحتفظ بمعرّفات الشبكة إلا كقيم مُجزّأة باتجاه واحد."],
  },
  {
    t: "Contact",
    tAr: "تواصل معنا",
    body: ["For any privacy question, or to request access to or deletion of data, contact the CyberMajlis team by email at h.bint.mh@gmail.com, or through the Help option in the app. You can also delete your account yourself at any time from Settings."],
    bodyAr: ["لأي سؤال يخص الخصوصية، أو لطلب الاطّلاع على البيانات أو حذفها، تواصل مع فريق مجلس الأمن السيبراني عبر البريد الإلكتروني h.bint.mh@gmail.com، أو من خلال خيار المساعدة في التطبيق. ويمكنك أيضاً حذف حسابك بنفسك في أي وقت من الإعدادات."],
  },
];

export const POLICY_UPDATED = "1 August 2026";
