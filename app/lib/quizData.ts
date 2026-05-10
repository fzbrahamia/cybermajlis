export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export const quizData: Record<string, QuizQuestion[]> = {
  virus: [
    {
      question: "What triggered the virus to escape from the envelope?",
      options: [
        "When Hamad ignored it",
        "When the old man touched it",
        "When Hamad opened it",        
        "Automatically after delivery",
      ],
      correctAnswer: "When Hamad opened it",
    },
    {
      question: "What are common signs of a virus infection?",
      options: [
        "Faster system performance",
        "Strange pop-ups, corrupted files, and slow operation",
        "Clearer display quality",
        "Automatic software updates",
      ],
      correctAnswer: "Strange pop-ups, corrupted files, and slow operation",
    },
    {
      question: "Why should you NOT restart your device after an infection?",
      options: [
        "It can hide or reactivate the malware",
        "It deletes the antivirus",
        "It resets your backups",
        "It may make the virus spread faster",
      ],
      correctAnswer: "It can hide or reactivate the malware",
    },
    {
      question: "Which daily habits reduce virus risk?",
      options: [
        "Disabling updates",
        "Sharing files through USB",
        "Installing pirated software",
        "Scanning files, updating antivirus, avoiding suspicious links",
      ],
      correctAnswer: "Scanning files, updating antivirus, avoiding suspicious links",
    },
    {
      question: "What helps you not lose your data even if a virus attacks?",
      options: [
        "Using dark mode",
        "Regularly backing up your files",
        "Restarting often",
        "Deleting antivirus software",
      ],
      correctAnswer: "Regularly backing up your files",
    },
  ],

  worm: [
    {
      question: "Where was Hamad watching the football match?",
      options: [
        "In a café",
        "In his tent",
        "In a Majlis (LAN) inside his house, within a larger neighborhood (WAN)",
        "At school",
      ],
      correctAnswer: "In a Majlis (LAN) inside his house, within a larger neighborhood (WAN)",
    },
    {
      question: "Why did the worm spread to Ali’s majlis?",
      options: [
        "Hamad forwarded the infected link",
        "They shared a Wi-Fi password",
        "They used the same phone",
        "It was stored on a USB drive",
      ],
      correctAnswer: "Hamad forwarded the infected link",
    },
    {
      question: "What made the worm continue spreading without more clicks?",
      options: [
        "It needed every user to click again",
        "It asked permission before spreading",
        "It attached itself to photos",
        "It used network vulnerabilities to move automatically",
      ],
      correctAnswer: "It used network vulnerabilities to move automatically",
    },
    {
      question: "Which of these is a modern target for worms?",
      options: [
        "Paper files",
        "IoT and smart home devices",
        "Offline calculators",
        "Headphones",
      ],
      correctAnswer: "IoT and smart home devices",
    },
    {
      question: "How can you prevent worms from spreading in your network?",
      options: [
        "Keep software updated and enable firewalls/IDS",
        "Ignore update alerts",
        "Use the same password for all devices",
        "Disable antivirus software",
      ],
      correctAnswer: "Keep software updated and enable firewalls/IDS",
    },
  ],
  "polymorphic-metamorphic": [
    {
      question: "What makes polymorphic and metamorphic malware different from regular malware?",
      options: [
        "They delete files faster",
        "They change themselves to avoid detection",
        "They only attack mobile phones",
        "They can’t be removed once installed",
      ],
      correctAnswer: "They change themselves to avoid detection",
    },
    {
      question: "What makes metamorphic malware MORE sophisticated than polymorphic malware?",
      options: [
        "It completely rewrites its code structure",
        "It spreads faster",
        "It can only infect Windows computers",
        "It asks for a ransom payment",
      ],
      correctAnswer: "It completely rewrites its code structure",
    },
    {
      question: "Why did both interns fail in their task?",
      options: [
        "The man and woman did not come",
        "They were looking for the faces in the posters only",
        "The man and woman went to another gate",
        "They didn’t look for them in the first place",
      ],
      correctAnswer: "They were looking for the faces in the posters only",
    },
    {
      question: "Traditional antivirus software that only uses signature-based detection would FAIL to catch:",
      options: [
        "Only polymorphic malware",
        "Only metamorphic malware",
        "Both polymorphic and metamorphic malware",
        "Neither — signatures catch everything",
      ],
      correctAnswer: "Both polymorphic and metamorphic malware",
    },
    {
      question: "Which type of antivirus detection would be MOST effective against both polymorphic and metamorphic malware?",
      options: [
        "Signature-based detection",
        "Hash matching",
        "Behavior-based and heuristic detection",
        "File name checking",
      ],
      correctAnswer: "Behavior-based and heuristic detection",
    },
  ],

  ransomware: [
    {
      question: "Why did Hamad’s files become locked?",
      options: [
        "He closed the program too fast",
        "He installed an antivirus",
        "He ran a downloaded cheating tool that contained ransomware",
        "He opened an email from his teacher",
      ],
      correctAnswer: "He ran a downloaded cheating tool that contained ransomware",
    },
    {
      question: "What should you do if a “file execution warning” appears and you’re unsure?",
      options: [
        "Click “Run” to see what happens",
        "Ignore it",
        "Click “Cancel” or “Don’t Run”",
        "Restart the device",
      ],
      correctAnswer: "Click “Cancel” or “Don’t Run”",
    },
    {
      question: "How can ransomware commonly enter a device?",
      options: [
        "Phishing attachments, pirated apps, drive-by downloads, or software exploits.",
        "Only via USB",
        "Only via Bluetooth",
        "Only through physical damage",
      ],
      correctAnswer: "Phishing attachments, pirated apps, drive-by downloads, or software exploits.",
    },
    {
      question: "If your files are encrypted by ransomware, what should you NOT do?",
      options: [
        "Report to authorities and disconnect the device",
        "Use recovery tools recommended by experts",
        "Pay the ransom immediately",
        "Notify your IT or Q-CERT",
      ],
      correctAnswer: "Pay the ransom immediately",
    },
    {
      question: "Why are regular offline backups important against ransomware?",
      options: [
        "So you can reinstall games faster",
        "They let you restore files without paying ransom",
        "Backups attract ransomware",
        "They make your device slower",
      ],
      correctAnswer: "They let you restore files without paying ransom",
    },
  ],
};

export const quizDataAr: Record<string, QuizQuestion[]> = {
  virus: [
    {
      question: "ما الذي جعل الفيروس يهرب من الظرف؟",
      options: [
        "عندما تجاهله حمد",
        "عندما لمسه الشيخ الكبير",
        "عندما فتحه حمد",
        "تلقائياً بعد التسليم",
      ],
      correctAnswer: "عندما فتحه حمد",
    },
    {
      question: "ما هي العلامات الشائعة لإصابة الفيروس؟",
      options: [
        "أداء أسرع للنظام",
        "نوافذ منبثقة غريبة وملفات تالفة وبطء في التشغيل",
        "جودة عرض أوضح",
        "تحديثات تلقائية للبرامج",
      ],
      correctAnswer: "نوافذ منبثقة غريبة وملفات تالفة وبطء في التشغيل",
    },
    {
      question: "لماذا يجب ألا تعيد تشغيل جهازك بعد الإصابة؟",
      options: [
        "يمكنه إخفاء البرامج الضارة أو إعادة تنشيطها",
        "يحذف برنامج مكافحة الفيروسات",
        "يعيد ضبط النسخ الاحتياطية",
        "قد يجعل الفيروس ينتشر بشكل أسرع",
      ],
      correctAnswer: "يمكنه إخفاء البرامج الضارة أو إعادة تنشيطها",
    },
    {
      question: "أيٌّ من العادات اليومية يقلل من خطر الفيروسات؟",
      options: [
        "تعطيل التحديثات",
        "مشاركة الملفات عبر USB",
        "تثبيت البرامج المقرصنة",
        "فحص الملفات وتحديث مكافح الفيروسات وتجنب الروابط المشبوهة",
      ],
      correctAnswer: "فحص الملفات وتحديث مكافح الفيروسات وتجنب الروابط المشبوهة",
    },
    {
      question: "ما الذي يساعدك على عدم فقدان بياناتك حتى لو هاجمك فيروس؟",
      options: [
        "استخدام الوضع الداكن",
        "النسخ الاحتياطي المنتظم لملفاتك",
        "إعادة التشغيل بشكل متكرر",
        "حذف برنامج مكافح الفيروسات",
      ],
      correctAnswer: "النسخ الاحتياطي المنتظم لملفاتك",
    },
  ],

  worm: [
    {
      question: "أين كان حمد يشاهد مباراة كرة القدم؟",
      options: [
        "في مقهى",
        "في خيمته",
        "في مجلس (شبكة محلية) داخل منزله ضمن حي أكبر (شبكة واسعة)",
        "في المدرسة",
      ],
      correctAnswer: "في مجلس (شبكة محلية) داخل منزله ضمن حي أكبر (شبكة واسعة)",
    },
    {
      question: "لماذا انتشرت الدودة إلى مجلس علي؟",
      options: [
        "قام حمد بإعادة إرسال الرابط المصاب",
        "تشاركا كلمة مرور الواي فاي",
        "استخدما نفس الهاتف",
        "كانت مخزنة على محرك USB",
      ],
      correctAnswer: "قام حمد بإعادة إرسال الرابط المصاب",
    },
    {
      question: "ما الذي جعل الدودة تستمر في الانتشار دون مزيد من النقرات؟",
      options: [
        "احتاجت كل مستخدم للنقر مرة أخرى",
        "طلبت الإذن قبل الانتشار",
        "ارتبطت بالصور",
        "استغلت ثغرات الشبكة للتحرك تلقائياً",
      ],
      correctAnswer: "استغلت ثغرات الشبكة للتحرك تلقائياً",
    },
    {
      question: "أيٌّ من هذه يُعدّ هدفاً حديثاً للديدان؟",
      options: [
        "الملفات الورقية",
        "أجهزة إنترنت الأشياء والمنازل الذكية",
        "الآلات الحاسبة غير المتصلة بالإنترنت",
        "سماعات الأذن",
      ],
      correctAnswer: "أجهزة إنترنت الأشياء والمنازل الذكية",
    },
    {
      question: "كيف يمكنك منع انتشار الديدان في شبكتك؟",
      options: [
        "حافظ على تحديث البرامج وفعّل جدران الحماية وأنظمة كشف التسلل",
        "تجاهل تنبيهات التحديث",
        "استخدم نفس كلمة المرور لجميع الأجهزة",
        "عطّل برنامج مكافحة الفيروسات",
      ],
      correctAnswer: "حافظ على تحديث البرامج وفعّل جدران الحماية وأنظمة كشف التسلل",
    },
  ],

  "polymorphic-metamorphic": [
    {
      question: "ما الذي يجعل البرمجيات الخبيثة متعددة الأشكال والمتحولة مختلفة عن البرمجيات الخبيثة العادية؟",
      options: [
        "تحذف الملفات بشكل أسرع",
        "تغير نفسها لتجنب الكشف",
        "تهاجم الهواتف المحمولة فقط",
        "لا يمكن إزالتها بمجرد تثبيتها",
      ],
      correctAnswer: "تغير نفسها لتجنب الكشف",
    },
    {
      question: "ما الذي يجعل البرمجيات الخبيثة المتحولة أكثر تعقيداً من البرمجيات متعددة الأشكال؟",
      options: [
        "تُعيد كتابة بنية شفرتها بالكامل",
        "تنتشر بشكل أسرع",
        "يمكنها فقط إصابة أجهزة ويندوز",
        "تطلب دفع فدية",
      ],
      correctAnswer: "تُعيد كتابة بنية شفرتها بالكامل",
    },
    {
      question: "لماذا فشل كلا المتدربين في مهمتهما؟",
      options: [
        "الرجل والمرأة لم يأتيا",
        "كانوا يبحثون عن الوجوه في الملصقات فقط",
        "ذهب الرجل والمرأة إلى بوابة أخرى",
        "لم يبحثوا عنهم في المقام الأول",
      ],
      correctAnswer: "كانوا يبحثون عن الوجوه في الملصقات فقط",
    },
    {
      question: "برامج مكافحة الفيروسات التقليدية التي تستخدم فقط الكشف القائم على التوقيع ستفشل في اكتشاف:",
      options: [
        "البرمجيات متعددة الأشكال فقط",
        "البرمجيات المتحولة فقط",
        "كلا البرمجيات متعددة الأشكال والمتحولة",
        "لا شيء — التوقيعات تكتشف كل شيء",
      ],
      correctAnswer: "كلا البرمجيات متعددة الأشكال والمتحولة",
    },
    {
      question: "أي نوع من أنواع الكشف في برامج مكافحة الفيروسات سيكون الأكثر فاعلية ضد كلا البرمجيات متعددة الأشكال والمتحولة؟",
      options: [
        "الكشف القائم على التوقيع",
        "مطابقة الهاش",
        "الكشف القائم على السلوك والاكتشاف التجريبي",
        "فحص أسماء الملفات",
      ],
      correctAnswer: "الكشف القائم على السلوك والاكتشاف التجريبي",
    },
  ],

  ransomware: [
    {
      question: "لماذا أصبحت ملفات حمد مقفلة؟",
      options: [
        "أغلق البرنامج بسرعة كبيرة",
        "قام بتثبيت مكافح الفيروسات",
        "شغّل أداة غش محملة تحتوي على برنامج فدية",
        "فتح بريداً إلكترونياً من معلمه",
      ],
      correctAnswer: "شغّل أداة غش محملة تحتوي على برنامج فدية",
    },
    {
      question: "ما الذي يجب فعله إذا ظهر 'تحذير تنفيذ ملف' وكنت غير متأكد؟",
      options: [
        "انقر 'تشغيل' لترى ما يحدث",
        "تجاهله",
        "انقر 'إلغاء' أو 'عدم التشغيل'",
        "أعد تشغيل الجهاز",
      ],
      correctAnswer: "انقر 'إلغاء' أو 'عدم التشغيل'",
    },
    {
      question: "كيف يمكن لبرنامج الفدية الدخول إلى الجهاز بشكل شائع؟",
      options: [
        "مرفقات التصيد، التطبيقات المقرصنة، التنزيلات التلقائية، أو استغلال الثغرات.",
        "عبر USB فقط",
        "عبر البلوتوث فقط",
        "عبر الضرر المادي فقط",
      ],
      correctAnswer: "مرفقات التصيد، التطبيقات المقرصنة، التنزيلات التلقائية، أو استغلال الثغرات.",
    },
    {
      question: "إذا تم تشفير ملفاتك ببرنامج فدية، ما الذي يجب ألا تفعله؟",
      options: [
        "الإبلاغ للجهات المختصة وفصل الجهاز",
        "استخدام أدوات الاسترداد الموصى بها من الخبراء",
        "دفع الفدية فوراً",
        "إبلاغ فريق تقنية المعلومات أو Q-CERT",
      ],
      correctAnswer: "دفع الفدية فوراً",
    },
    {
      question: "لماذا تُعدّ النسخ الاحتياطية المنتظمة غير المتصلة بالإنترنت مهمة ضد برامج الفدية؟",
      options: [
        "لإعادة تثبيت الألعاب بشكل أسرع",
        "تتيح لك استعادة الملفات دون دفع فدية",
        "النسخ الاحتياطية تجذب برامج الفدية",
        "تجعل جهازك أبطأ",
      ],
      correctAnswer: "تتيح لك استعادة الملفات دون دفع فدية",
    },
  ],
};
