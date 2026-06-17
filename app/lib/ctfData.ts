// ============================================================
// CTF CONTENT — "The Majlis Trials" (main-site kids CTF)
//
// A gentle, real-feeling Capture-The-Flag. Five tracks, each
// mapped to a genuine CTF category so young learners meet the
// actual sections of the field. Flags look like real flags:
//     majlis{...}
//
// Rendering is driven by each challenge's `puzzle.kind`, handled
// by the renderer in app/ctf/page.tsx. All learner-facing prose
// is bilingual (EN/AR). Answers are language-neutral.
// ============================================================

export type PuzzleKind = "mono" | "code" | "table" | "log" | "posts" | "hidden";

export interface MonoPuzzle {
  kind: "mono";
  text: string; // ciphertext / acrostic lines (monospace block)
}
export interface CodePuzzle {
  kind: "code";
  label: string;   // e.g. "index.html" / "login.js"
  text: string;
}
export interface TablePuzzle {
  kind: "table";
  rows: { k: string; kAr: string; v: string }[];
}
export interface LogRow {
  time: string;
  user: string;
  location: string;
  locationAr: string;
  code: string;
}
export interface LogPuzzle {
  kind: "log";
  logs: LogRow[];
}
export interface PostsPuzzle {
  kind: "posts";
  name: string; nameAr: string;
  handle: string;
  bio: string; bioAr: string;
  posts: { text: string; textAr: string }[];
}
export interface HiddenPuzzle {
  kind: "hidden";
  before: string; beforeAr: string;   // visible text
  secret: string;                      // flag text, hidden (same colour as bg)
  after: string; afterAr: string;      // visible text
}

export type Puzzle =
  | MonoPuzzle | CodePuzzle | TablePuzzle | LogPuzzle | PostsPuzzle | HiddenPuzzle;

export interface Challenge {
  id: string;
  sectionId: string;
  points: number;
  difficulty: 1 | 2 | 3;
  title: string; titleAr: string;
  story: string; storyAr: string;       // the framing narrative
  reference?: string; referenceAr?: string; // optional "cheat sheet" (cipher key…)
  puzzle: Puzzle;
  hints: string[]; hintsAr: string[];   // revealed one at a time
  flag: string;                          // canonical inner answer (no majlis{})
  explain: string; explainAr: string;   // shown after capture — the takeaway
}

export interface Section {
  id: string;
  icon: string;        // lucide icon name (mapped in the page)
  accent: string;
  title: string; titleAr: string;
  tagline: string; taglineAr: string;
  realName: string; realNameAr: string; // "In real CTFs this is called…"
  intro: string; introAr: string;
  challenges: Challenge[];
}

export const SECTIONS: Section[] = [
  // ─────────────────────────────────────────────────────────
  // 1 · CRYPTOGRAPHY
  // ─────────────────────────────────────────────────────────
  {
    id: "crypto",
    icon: "KeyRound",
    accent: "#8B2635",
    title: "Secret Codes", titleAr: "الشيفرات السرية",
    tagline: "Crack hidden writing", taglineAr: "فك الكتابة المخفية",
    realName: "Cryptography", realNameAr: "التعمية (Cryptography)",
    intro: "For thousands of years people have scrambled messages so only a friend could read them. In CTFs, this skill is called Cryptography. Unscramble each message to reveal the flag.",
    introAr: "منذ آلاف السنين والناس يشفّرون رسائلهم ليقرأها الصديق فقط. في مسابقات CTF تُسمّى هذه المهارة «التعمية». فك تشفير كل رسالة لتكشف العلَم.",
    challenges: [
      {
        id: "crypto-caesar",
        sectionId: "crypto",
        points: 100, difficulty: 1,
        title: "The Caesar's Shift", titleAr: "إزاحة قيصر",
        story: "Two thousand years ago a Roman general hid his orders by pushing every letter 3 steps forward in the alphabet. Push them back to read the secret word.",
        storyAr: "قبل ألفي عام أخفى قائد روماني أوامره بدفع كل حرف 3 خطوات للأمام في الأبجدية. أرجِعها للخلف لتقرأ الكلمة السرية.",
        reference: "A→D · B→E · C→F · … each letter moved 3 forward. To DECODE, move each letter 3 BACK (D→A, E→B, F→C…).",
        referenceAr: "أ→د بمعنى أن كل حرف أُزيح 3 للأمام. لفك الشيفرة أرجِع كل حرف 3 خطوات للخلف (D→A، E→B، F→C…).",
        puzzle: { kind: "mono", text: "I D O F R Q" },
        hints: [
          "Write the alphabet, then for each letter count 3 letters backwards.",
          "I → F, D → A … keep going.",
        ],
        hintsAr: [
          "اكتب الأبجدية، ثم لكل حرف عُدّ 3 أحرف للخلف.",
          "I → F، D → A … أكمل.",
        ],
        flag: "FALCON",
        explain: "You just used the Caesar cipher — one of the oldest codes in history. It is weak because there are only 25 possible shifts, but it is where every cryptographer begins.",
        explainAr: "لقد استخدمت شيفرة قيصر — من أقدم الشيفرات في التاريخ. هي ضعيفة لأن الإزاحات الممكنة 25 فقط، لكنها بداية كل خبير تعمية.",
      },
      {
        id: "crypto-reverse",
        sectionId: "crypto",
        points: 100, difficulty: 1,
        title: "Mirror Writing", titleAr: "الكتابة المعكوسة",
        story: "Some messages are simply written back-to-front. Flip this one around to read it.",
        storyAr: "بعض الرسائل تُكتب بالمقلوب ببساطة. اقلب هذه لتقرأها.",
        puzzle: { kind: "mono", text: "D L E I H S" },
        hints: [
          "Read it from right to left instead of left to right.",
          "The last letter D is really the first letter.",
        ],
        hintsAr: [
          "اقرأها من اليمين إلى اليسار بدل اليسار إلى اليمين.",
          "الحرف الأخير D هو في الحقيقة أول حرف.",
        ],
        flag: "SHIELD",
        explain: "Reversing text is the simplest form of hiding a message. Real attackers sometimes reverse data to slip past filters that only read it one way.",
        explainAr: "عكس النص أبسط طرق إخفاء الرسالة. أحياناً يعكس المهاجمون البيانات ليتجاوزوا المرشّحات التي تقرأها باتجاه واحد فقط.",
      },
      {
        id: "crypto-morse",
        sectionId: "crypto",
        points: 200, difficulty: 2,
        title: "Dots & Dashes", titleAr: "نقاط وشُرَط",
        story: "Long before the internet, people sent messages down a wire as short and long beeps: Morse code. Decode the beeps below.",
        storyAr: "قبل الإنترنت بزمن طويل أرسل الناس الرسائل عبر سلك على شكل نبضات قصيرة وطويلة: شيفرة مورس. فك الرموز أدناه.",
        reference: "A ·−  E ·  I ··  J ·−−−  L ·−··  M −−  S ···   (each group of dots/dashes = one letter)",
        referenceAr: "A ·−  E ·  I ··  J ·−−−  L ·−··  M −−  S ···   (كل مجموعة نقاط/شُرَط = حرف واحد)",
        puzzle: { kind: "mono", text: "−−   ·−   ·−−−   ·−··   ··   ···" },
        hints: [
          "Each space separates one letter. There are six letters.",
          "−− is M, ·− is A … keep matching with the chart.",
        ],
        hintsAr: [
          "كل فراغ يفصل حرفاً. عدد الأحرف ستة.",
          "−− هو M، ·− هو A … تابع المطابقة مع الجدول.",
        ],
        flag: "MAJLIS",
        explain: "Morse code is an encoding — a way of representing letters, not a secret. Telling the difference between encoding (anyone can reverse it) and encryption (you need a key) is a core idea in cybersecurity.",
        explainAr: "شيفرة مورس «ترميز» — طريقة لتمثيل الأحرف وليست سرّاً. التمييز بين الترميز (يفكّه أي أحد) والتشفير (يحتاج مفتاحاً) فكرة أساسية في الأمن السيبراني.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2 · FORENSICS
  // ─────────────────────────────────────────────────────────
  {
    id: "forensics",
    icon: "Search",
    accent: "#7a5c2e",
    title: "Digital Clues", titleAr: "الأدلة الرقمية",
    tagline: "Examine the evidence", taglineAr: "افحص الأدلة",
    realName: "Forensics", realNameAr: "التحقيق الرقمي (Forensics)",
    intro: "Every file and every login leaves traces, like fingerprints. Digital investigators read those traces to learn what really happened. In CTFs this track is called Forensics.",
    introAr: "كل ملف وكل تسجيل دخول يترك أثراً مثل بصمات الأصابع. يقرأ المحققون الرقميون تلك الآثار ليعرفوا ما حدث فعلاً. في مسابقات CTF يُسمّى هذا المسار «التحقيق الرقمي».",
    challenges: [
      {
        id: "forensics-metadata",
        sectionId: "forensics",
        points: 150, difficulty: 2,
        title: "Hidden in the Details", titleAr: "مخفي في التفاصيل",
        story: "A photo is more than the picture you see — it secretly stores extra details called metadata: the camera, the date, even who made it. Open this photo's details and find what the owner hid.",
        storyAr: "الصورة أكثر من المشهد الذي تراه — فهي تخزّن سرّاً تفاصيل إضافية تُسمّى «البيانات الوصفية»: الكاميرا، التاريخ، وحتى صاحبها. افتح تفاصيل هذه الصورة واعثر على ما أخفاه المالك.",
        puzzle: {
          kind: "table",
          rows: [
            { k: "File name", kAr: "اسم الملف", v: "desert_trip.jpg" },
            { k: "Camera", kAr: "الكاميرا", v: "Pixel 7 Pro" },
            { k: "Date taken", kAr: "تاريخ الالتقاط", v: "2024-03-12 16:40" },
            { k: "Size", kAr: "الحجم", v: "4.2 MB" },
            { k: "Dimensions", kAr: "الأبعاد", v: "4032 × 3024" },
            { k: "Copyright", kAr: "حقوق النشر", v: "majlis{HIDDEN_OWNER}" },
            { k: "Software", kAr: "البرنامج", v: "Adobe Lightroom" },
          ],
        },
        hints: [
          "Read every row, not just the obvious ones.",
          "One field looks like a flag instead of a normal value.",
        ],
        hintsAr: [
          "اقرأ كل صف، لا الصفوف الواضحة فقط.",
          "أحد الحقول يبدو كعلَم بدل قيمة عادية.",
        ],
        flag: "HIDDEN_OWNER",
        explain: "That hidden data is called EXIF metadata. Photos you post online can quietly reveal your phone model, the time, and even the GPS location where you stood. Always think about what your files carry.",
        explainAr: "تلك البيانات المخفية تُسمّى «بيانات EXIF». الصور التي تنشرها قد تكشف بهدوء نوع هاتفك والوقت وحتى موقع GPS الذي وقفت فيه. فكّر دائماً فيما تحمله ملفاتك.",
      },
      {
        id: "forensics-logs",
        sectionId: "forensics",
        points: 250, difficulty: 3,
        title: "The Intruder's Footprint", titleAr: "أثر الدخيل",
        story: "Every time someone signs in, the system writes a line in a log. Here are six logins to one account. Five belong to the owner in Doha. One is an intruder. Find the odd login and submit its code.",
        storyAr: "في كل مرة يسجّل أحد دخوله يكتب النظام سطراً في السجل. أمامك ستة تسجيلات لحساب واحد. خمسة منها للمالك في الدوحة، وواحد لدخيل. اعثر على التسجيل الغريب وأرسل رمزه.",
        puzzle: {
          kind: "log",
          logs: [
            { time: "08:14", user: "owner", location: "Doha, Qatar", locationAr: "الدوحة، قطر", code: "majlis{SAFE_01}" },
            { time: "12:30", user: "owner", location: "Doha, Qatar", locationAr: "الدوحة، قطر", code: "majlis{SAFE_02}" },
            { time: "13:05", user: "owner", location: "Doha, Qatar", locationAr: "الدوحة، قطر", code: "majlis{SAFE_03}" },
            { time: "03:47", user: "owner", location: "Unknown — 6,800 km away", locationAr: "غير معروف — على بُعد 6,800 كم", code: "majlis{ROGUE_LOGIN}" },
            { time: "18:22", user: "owner", location: "Doha, Qatar", locationAr: "الدوحة، قطر", code: "majlis{SAFE_04}" },
            { time: "21:10", user: "owner", location: "Doha, Qatar", locationAr: "الدوحة، قطر", code: "majlis{SAFE_05}" },
          ],
        },
        hints: [
          "Five logins happen during the day in Doha. One does not.",
          "Look for the login at 3:47 AM from very far away.",
        ],
        hintsAr: [
          "خمسة تسجيلات تحدث نهاراً في الدوحة، وواحد لا.",
          "ابحث عن التسجيل الساعة 3:47 فجراً ومن مكان بعيد جداً.",
        ],
        flag: "ROGUE_LOGIN",
        explain: "Spotting the 'odd one out' in logs is exactly how security teams catch hackers. A login at a strange time from an impossible place is a classic warning sign of a stolen password.",
        explainAr: "اكتشاف «الغريب» في السجلات هو بالضبط كيف تمسك فرق الأمن المخترقين. تسجيل دخول في وقت غريب ومن مكان مستحيل علامة تحذير كلاسيكية على كلمة مرور مسروقة.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3 · OSINT
  // ─────────────────────────────────────────────────────────
  {
    id: "osint",
    icon: "Eye",
    accent: "#4a7c59",
    title: "Detective Work", titleAr: "عمل المحقق",
    tagline: "Find clues in plain sight", taglineAr: "اعثر على أدلة ظاهرة",
    realName: "OSINT", realNameAr: "الاستخبارات المفتوحة (OSINT)",
    intro: "OSINT means Open-Source Intelligence: finding out about someone using only the things they post in public. It shows why oversharing online can be risky. Read carefully and answer each puzzle.",
    introAr: "OSINT تعني «الاستخبارات مفتوحة المصدر»: معرفة معلومات عن شخص من خلال ما ينشره علناً فقط. تُظهر لماذا المشاركة المفرطة على الإنترنت خطيرة. اقرأ بعناية وأجب عن كل لغز.",
    challenges: [
      {
        id: "osint-overshare",
        sectionId: "osint",
        points: 150, difficulty: 2,
        title: "The Careless Profile", titleAr: "الحساب المتهاون",
        story: "Here is a public profile. A stranger could guess this person's password from what they share. What pet name are they almost certainly using? Submit it as the flag.",
        storyAr: "أمامك حساب عام. يمكن لغريب أن يخمّن كلمة مرور هذا الشخص مما يشاركه. ما اسم الحيوان الأليف الذي يستخدمه على الأرجح؟ أرسله كعلَم.",
        puzzle: {
          kind: "posts",
          name: "Noora A.", nameAr: "نورة أ.",
          handle: "@noora_loves_cats",
          bio: "Cat mum 🐱 · Grade 6 · Al Wakrah",
          bioAr: "أمّ قطط 🐱 · الصف السادس · الوكرة",
          posts: [
            { text: "Happy 5th birthday to my fluffy boy Simba! 🎂🐱 #catsofqatar", textAr: "كل عام وقطّي الرقيق سيمبا بخير في عيده الخامس! 🎂🐱" },
            { text: "My password reminder is literally my cat's name lol 🙈", textAr: "تلميح كلمة مروري هو ببساطة اسم قطّتي 🙈" },
            { text: "Beach day at Al Wakrah 🌊", textAr: "يوم على شاطئ الوكرة 🌊" },
          ],
        },
        hints: [
          "Two of the posts point at the same word.",
          "The cat's name appears in the birthday post.",
        ],
        hintsAr: [
          "اثنان من المنشورات يشيران إلى الكلمة نفسها.",
          "اسم القطة يظهر في منشور عيد الميلاد.",
        ],
        flag: "SIMBA",
        explain: "Attackers really do read public posts to guess passwords and security answers. Pet names, birthdays and school names are favourite targets — keep them out of your passwords.",
        explainAr: "المهاجمون يقرؤون فعلاً المنشورات العامة لتخمين كلمات المرور وأسئلة الأمان. أسماء الحيوانات والمواليد وأسماء المدارس أهداف مفضّلة — أبقِها بعيداً عن كلمات مرورك.",
      },
      {
        id: "osint-geo",
        sectionId: "osint",
        points: 200, difficulty: 2,
        title: "Where Was This Taken?", titleAr: "أين التُقطت هذه؟",
        story: "Investigators can work out where a photo was taken just from clues in it — this is called geolocation. Read this caption and name the city. Submit the city as the flag.",
        storyAr: "يستطيع المحققون معرفة مكان التقاط الصورة من الأدلة داخلها فقط — وهذا يُسمّى تحديد الموقع الجغرافي. اقرأ الوصف وسمِّ المدينة. أرسل اسم المدينة كعلَم.",
        puzzle: {
          kind: "posts",
          name: "Travel Diary", nameAr: "مذكرة سفر",
          handle: "@gulf_wanderer",
          bio: "Photos from around the Gulf 📸", bioAr: "صور من حول الخليج 📸",
          posts: [
            { text: "Sunset behind the spiral Torch Tower, with the Aspire dome glowing nearby. This city hosted the 2022 World Cup! 🇶🇦", textAr: "غروب خلف برج الشعلة الحلزوني وقبة أسباير تتوهّج قربه. هذه المدينة استضافت كأس العالم 2022! 🇶🇦" },
            { text: "Walking along the Corniche by the Museum of Islamic Art. ⛵", textAr: "أتمشّى على الكورنيش قرب متحف الفن الإسلامي. ⛵" },
          ],
        },
        hints: [
          "The Torch Tower, Aspire, and the 2022 World Cup are all in one city.",
          "It is the capital of Qatar.",
        ],
        hintsAr: [
          "برج الشعلة وأسباير وكأس العالم 2022 كلها في مدينة واحدة.",
          "إنها عاصمة قطر.",
        ],
        flag: "DOHA",
        explain: "Landmarks, flags, signs and even the angle of the sun can reveal a location. That is why posting live photos of where you are can quietly tell strangers exactly where to find you.",
        explainAr: "المعالم والأعلام واللافتات وحتى زاوية الشمس قد تكشف الموقع. لذلك نشر صور لحظية لمكانك قد يخبر الغرباء بهدوء أين يجدونك بالضبط.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4 · WEB
  // ─────────────────────────────────────────────────────────
  {
    id: "web",
    icon: "Code2",
    accent: "#b5642e",
    title: "Look Behind the Page", titleAr: "انظر خلف الصفحة",
    tagline: "Read a website's code", taglineAr: "اقرأ شيفرة الموقع",
    realName: "Web Exploitation", realNameAr: "استغلال الويب (Web)",
    intro: "Every website is built from code your browser can show you. Secrets that developers forget to remove can be hiding right there. In CTFs this track is called Web Exploitation.",
    introAr: "كل موقع مبنيّ من شيفرة يمكن لمتصفّحك أن يُظهرها لك. والأسرار التي ينسى المطوّرون إزالتها قد تكون مختبئة هناك تماماً. في مسابقات CTF يُسمّى هذا المسار «استغلال الويب».",
    challenges: [
      {
        id: "web-source",
        sectionId: "web",
        points: 150, difficulty: 2,
        title: "View the Source", titleAr: "اعرض المصدر",
        story: "Real hackers press 'View Source' to read the hidden code behind a page. Developers sometimes leave notes to themselves — called comments — that they forget to delete. Read the page code and find the comment.",
        storyAr: "يضغط المخترقون الحقيقيون «عرض المصدر» لقراءة الشيفرة المخفية خلف الصفحة. أحياناً يترك المطوّرون ملاحظات لأنفسهم — تُسمّى «تعليقات» — وينسون حذفها. اقرأ شيفرة الصفحة واعثر على التعليق.",
        puzzle: {
          kind: "code",
          label: "index.html",
          text:
`<!DOCTYPE html>
<html>
  <head><title>Majlis Fan Club</title></head>
  <body>
    <h1>Welcome to the club!</h1>
    <!-- TODO: remove before launch -> majlis{VIEW_SOURCE} -->
    <p>Members only.</p>
  </body>
</html>`,
        },
        hints: [
          "Anything between <!-- and --> is a comment — invisible on the page, but visible in the code.",
          "Look at the line that starts with <!-- TODO.",
        ],
        hintsAr: [
          "كل ما بين <!-- و --> هو تعليق — غير مرئي على الصفحة لكنه ظاهر في الشيفرة.",
          "انظر إلى السطر الذي يبدأ بـ <!-- TODO.",
        ],
        flag: "VIEW_SOURCE",
        explain: "Comments are meant for developers, but they ship to everyone who opens the page. Real breaches have happened because a password or secret key was left in an HTML comment.",
        explainAr: "التعليقات مخصّصة للمطوّرين، لكنها تصل لكل من يفتح الصفحة. وقعت اختراقات حقيقية لأن كلمة مرور أو مفتاحاً سرّياً تُرك في تعليق HTML.",
      },
      {
        id: "web-clientside",
        sectionId: "web",
        points: 250, difficulty: 3,
        title: "The Password in the Code", titleAr: "كلمة المرور داخل الشيفرة",
        story: "This login page checks the password using code that runs inside your own browser — which means you can read it! Find the password the code is looking for and submit it as the flag.",
        storyAr: "صفحة الدخول هذه تفحص كلمة المرور بشيفرة تعمل داخل متصفّحك أنت — أي أنه يمكنك قراءتها! اعثر على كلمة المرور التي تبحث عنها الشيفرة وأرسلها كعلَم.",
        puzzle: {
          kind: "code",
          label: "login.js",
          text:
`function checkPassword(input) {
  const secret = "OpenSesame123";
  if (input === secret) {
    unlockVault();
  } else {
    alert("Wrong password!");
  }
}`,
        },
        hints: [
          "The password is stored in a variable called 'secret'.",
          "Read the text inside the quotation marks.",
        ],
        hintsAr: [
          "كلمة المرور مخزّنة في متغيّر اسمه 'secret'.",
          "اقرأ النص داخل علامات التنصيص.",
        ],
        flag: "OpenSesame123",
        explain: "Never trust the browser with a secret. Anything checked in front-end JavaScript can be read by the visitor. Real apps must check passwords on the server, where users cannot peek.",
        explainAr: "لا تأتمن المتصفّح على سرّ. أي شيء يُفحص في جافاسكربت الواجهة يمكن للزائر قراءته. التطبيقات الحقيقية يجب أن تفحص كلمات المرور على الخادم حيث لا يستطيع المستخدم النظر.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5 · STEGANOGRAPHY
  // ─────────────────────────────────────────────────────────
  {
    id: "stego",
    icon: "EyeOff",
    accent: "#6b4a8a",
    title: "Hidden Messages", titleAr: "الرسائل المخفية",
    tagline: "A message inside a message", taglineAr: "رسالة داخل رسالة",
    realName: "Steganography", realNameAr: "إخفاء المعلومات (Steganography)",
    intro: "Cryptography scrambles a message so you cannot read it. Steganography goes further — it hides the fact that there is a message at all, tucked inside something ordinary. Find the secret hidden in each one.",
    introAr: "التعمية تشوّش الرسالة فلا تقرأها. أما إخفاء المعلومات فيذهب أبعد — يُخفي وجود الرسالة أصلاً، مدسوسةً داخل شيء عادي. اعثر على السرّ المخبّأ في كل منها.",
    challenges: [
      {
        id: "stego-acrostic",
        sectionId: "stego",
        points: 150, difficulty: 2,
        title: "The First Letters", titleAr: "الأحرف الأولى",
        story: "This little poem looks innocent. But read only the FIRST letter of each line, from top to bottom, and a hidden word appears.",
        storyAr: "هذه القصيدة الصغيرة تبدو بريئة. لكن اقرأ الحرف الأول فقط من كل سطر، من الأعلى للأسفل، وستظهر كلمة مخفية.",
        puzzle: {
          kind: "mono",
          text:
`Dunes stretch out for miles.
Each night the cold stars shine.
Silent winds carry the sand.
Endless waves of glowing gold.
Riders cross the open land.
Travellers always find their way.`,
        },
        hints: [
          "Ignore whole words — take just the first letter of every line.",
          "D, E, S … what six-letter word is forming?",
        ],
        hintsAr: [
          "تجاهل الكلمات كاملة — خذ الحرف الأول من كل سطر فقط.",
          "D، E، S … ما الكلمة المكوّنة من ستة أحرف التي تتشكّل؟",
        ],
        flag: "DESERT",
        explain: "Hiding a word in the first letters of lines is called an acrostic — a simple form of steganography. The message is in plain sight, yet invisible until you know the trick.",
        explainAr: "إخفاء كلمة في الأحرف الأولى للأسطر يُسمّى «أكروستيك» — صورة بسيطة من إخفاء المعلومات. الرسالة أمام عينيك، لكنها خفية حتى تعرف الحيلة.",
      },
      {
        id: "stego-invisible",
        sectionId: "stego",
        points: 250, difficulty: 3,
        title: "Invisible Ink", titleAr: "الحبر السرّي",
        story: "An old trick is to write a secret in the same colour as the paper, so it is invisible until you highlight it. Drag your mouse across the note below — or tap and hold — to reveal the hidden flag.",
        storyAr: "حيلة قديمة هي كتابة السرّ بلون الورقة نفسه، فيكون خفياً حتى تظلّله. اسحب الفأرة فوق الملاحظة أدناه — أو اضغط مطوّلاً — لتكشف العلَم المخفي.",
        puzzle: {
          kind: "hidden",
          before: "Dear member, thank you for visiting the Majlis. There is nothing more to see here… ",
          beforeAr: "عزيزي العضو، شكراً لزيارتك المجلس. لا يوجد المزيد لتراه هنا… ",
          secret: "majlis{INVISIBLE_INK}",
          after: " …or is there? Well done for looking closely.",
          afterAr: " …أم أن هناك المزيد؟ أحسنت على نظرك الدقيق.",
        },
        hints: [
          "There is white text on the white note. Select all of it.",
          "Click just before the words and drag across the empty-looking space.",
        ],
        hintsAr: [
          "يوجد نص أبيض على ملاحظة بيضاء. ظلّله كله.",
          "انقر قبل الكلمات مباشرة واسحب فوق المساحة التي تبدو فارغة.",
        ],
        flag: "INVISIBLE_INK",
        explain: "Hiding text by matching the background colour is a classic steganography trick still used today in scam documents. Selecting or 'highlighting' text reveals anything hidden this way.",
        explainAr: "إخفاء النص بمطابقة لون الخلفية حيلة كلاسيكية في إخفاء المعلومات لا تزال تُستخدم في مستندات الاحتيال. تظليل النص يكشف أي شيء مخفيّ بهذه الطريقة.",
      },
    ],
  },
];

// Convenience: flat list + lookup
export const ALL_CHALLENGES: Challenge[] = SECTIONS.flatMap((s) => s.challenges);
export const TOTAL_POINTS = ALL_CHALLENGES.reduce((sum, c) => sum + c.points, 0);

// Normalise a flag guess so majlis{...}, casing and spacing don't matter.
export function normaliseFlag(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^majlis\s*\{?/, "")
    .replace(/\}$/, "")
    .replace(/\s+/g, "");
}

export function isFlagCorrect(guess: string, answer: string): boolean {
  return normaliseFlag(guess) === normaliseFlag(answer);
}
