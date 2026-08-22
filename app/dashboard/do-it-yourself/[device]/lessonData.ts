export type ReadingSection = {
  title: string;
  body?: string;
  bullets?: string[];
  whyItMatters?: string;
};

export type PlatformGuide = {
  label: string;
  title: string;
  videoUrl: string;
  steps: string[];
  checklist: string[];
  whyPerStep?: string[];
};

export type Lesson = {
  title: string;
  description: string;
  videoUrl: string;
  readingTitle: string;
  readingIntro: string;
  readingSections: ReadingSection[];
  checklist: string[];
  platformGuides?: PlatformGuide[];
};

export const lessons: Record<string, Lesson> = {
  camera: {
    title: "Smart Camera Security",
    description: "Learn how to protect your home cameras from unwanted access.",
    videoUrl: "/videos/camera-security.mp4",
    readingTitle: "Protect your home cameras in 7 steps",
    readingIntro:
      "Home cameras are useful, but they must be secured because they can expose private spaces if someone gets access.",
    readingSections: [
      {
        title: "1. Open the camera app",
        body: "Open the camera app on your phone, choose the camera, then open its settings.",
        bullets: [
          "Settings",
          "Security",
          "Account",
          "Privacy",
          "Device Info",
          "Firmware Update",
        ],
      },
      {
        title: "2. Change the camera password",
        body: "Do not use weak passwords. Use a strong password that is different from your Wi-Fi password.",
        bullets: ["Avoid: camera123", "Avoid: 12345678", "Avoid: admin123"],
      },
      {
        title: "3. Change default login details",
        body: "If the camera uses default login details such as admin/admin, or details printed on the device, change them immediately.",
      },
      {
        title: "4. Update the camera",
        body: "Open the update section and install the official update if available.",
        bullets: ["Firmware Update", "Software Update", "Device Update"],
      },
      {
        title: "5. Turn off remote access if you do not need it",
        body: "If you do not need to view the camera from outside the home, turn off Remote Access. If you need it, use only the official app, a strong password, and two-factor authentication if supported.",
      },
      {
        title: "6. Do not share camera links or QR codes",
        body: "Avoid sharing camera invitation links, QR codes, or access codes unless you fully trust the person and can remove access later.",
      },
      {
        title: "7. Review users and connected devices",
        body: "In the camera app, check who has permission to access the camera. Remove any account or device you do not recognize. If possible, place the camera on a separate guest or IoT network.",
      },
    ],
    checklist: [
      "I opened the camera settings.",
      "I changed the camera password.",
      "I changed the default login details.",
      "I updated the camera.",
      "I reviewed remote access settings.",
      "I did not share the camera link or QR code.",
      "I placed the camera on a separate network if possible.",
      "I reviewed users connected to the camera.",
    ],
  },

  router: {
    title: "Wi-Fi Security",
    description:
      "Choose your device first, then learn how to safely enter the router settings and protect your home Wi-Fi.",
    videoUrl: "/videos/router-security.mp4",
    readingTitle: "Protect your home Wi-Fi step by step",
    readingIntro:
      "",
    platformGuides: [
      {
        label: "Windows",
        title: "Windows: find the router address",
        videoUrl: "/videos/wifi-windows.mp4",
        steps: [
          "Make sure the laptop is connected to the home Wi-Fi.",
          "Click Search and type cmd.",
          "Open Command Prompt.",
          "Type ipconfig and press Enter.",
          "Find the Wi-Fi section.",
          "Look for Default Gateway.",
          "Use the number beside Default Gateway as the router address, for example 192.168.18.1.",
          "Open Chrome or Edge and type the address in the address bar, not Google Search.",
        ],
        checklist: [
          "I connected my Windows laptop to the home Wi-Fi.",
          "I opened Command Prompt.",
          "I typed ipconfig.",
          "I found Default Gateway.",
          "I opened the router address in the browser address bar.",
        ],
      },
      {
        label: "Mac",
        title: "Mac: find the router address",
        videoUrl: "/videos/wifi-mac.mp4",
        steps: [
  "Open System Settings.",
  "Click Wi‑Fi.",
  "Make sure the Mac is connected to the home Wi‑Fi.",
  "Click the connected network, then choose Details.",
  "Open the TCP/IP tab.",
  "Look for Router.",
  "Use the number beside Router as the router address, for example 192.168.18.1.",
  "Open Safari or another browser and type the router address in the address bar, not in a search box.",
],
        checklist: [
          "I connected my Mac to the home Wi-Fi.",
          "I opened Wi-Fi settings.",
          "I opened Details for the connected network.",
          "I found Router under TCP/IP.",
          "I opened the router address in the browser address bar.",
        ],
      },
      {
        label: "iPhone",
        title: "iPhone: find the router address",
        videoUrl: "/videos/wifi-iphone.mp4",
        steps: [
          "Open Settings.",
          "Open Wi-Fi.",
          "Make sure the iPhone is connected to the home Wi-Fi.",
          "Tap the information icon (i) beside the network name.",
          "Scroll and look for Router.",
          "Use the number beside Router as the router address.",
          "Open Safari or Chrome.",
          "Type the address in the address bar, for example http://192.168.18.1, then tap Go.",
        ],
        checklist: [
          "I connected my iPhone to the home Wi-Fi.",
          "I opened Wi-Fi settings.",
          "I tapped the information icon beside the network.",
          "I found Router.",
          "I opened the router address in Safari or Chrome.",
        ],
      },
      {
        label: "Android",
        title: "Android: find the router address",
        videoUrl: "/videos/wifi-android.mp4",
        steps: [
          "Open Settings.",
          "Open Network & Internet, Connections, or Wi-Fi depending on your phone.",
          "Make sure the phone is connected to the home Wi-Fi.",
          "Tap the connected Wi-Fi network.",
          "Look for Network Details, Manage Router, Gateway, or Router.",
          "Use the number beside Gateway or Router as the router address.",
          "If the address does not appear, try common addresses such as 192.168.1.1, 192.168.0.1, or 192.168.18.1.",
          "You can also use the internet provider app if available.",
          "Open Chrome and type the router address in the address bar.",
        ],
        checklist: [
          "I connected my Android phone to the home Wi-Fi.",
          "I opened Wi-Fi network details.",
          "I looked for Gateway or Router.",
          "I tried common router addresses if the address was not shown.",
          "I opened the router address in Chrome.",
        ],
      },
    ],
    readingSections: [
      {
        title: "After opening the router page: log in safely",
        body: "The router username and password are not the same as the Wi-Fi password. They are used to enter the router control panel.",
        bullets: [
          "Check the sticker behind the router.",
          "Check the installation card or paper.",
          "Check the internet provider app.",
          "Check messages from your internet provider.",
          "Contact support if you cannot find them.",
          "Do not share these login details with anyone.",
        ],
      },
      {
        title: "1. Change the Wi-Fi network name",
        body: "Look for SSID, Wi-Fi Name, or Network Name. Use a general name that does not reveal your family name, personal name, or router model.",
        bullets: [
          "Not recommended: HamadFamily_Router123",
          "Better: HomeNet",
          "A general name gives less information to people nearby.",
        ],
      },
      {
        title: "2. Use a strong Wi-Fi password",
        body: "Look for Wi-Fi Password, Wireless Password, WPA Key, or Pre-Shared Key. Use a long password with uppercase letters, lowercase letters, numbers, and symbols.",
        bullets: [
          "Avoid: 12345678",
          "Avoid: qatar123",
          "Avoid: password",
          "Do not use your name, phone number, birthday, or easy words.",
        ],
      },
      {
        title: "3. Enable strong security mode",
        body: "Look for Security Mode, Encryption, or Authentication. Choose WPA2-AES or WPA3 if available.",
        bullets: [
          "Avoid Open networks with no password.",
          "Avoid old protection options such as WEP.",
          "WPA2-AES or WPA3 are safer choices.",
          "The lock icon beside the Wi-Fi name means the network uses password protection and encryption.",
        ],
      },
      {
        title: "4. Review connected devices",
        body: "Look for Connected Devices, Device List, Clients, Online Devices, or Attached Devices. If you find an unknown device, ask your family first. If it is still unknown, change the Wi-Fi password.",
        bullets: [
          "Examples: Hamad-iPhone, LivingRoom-TV, Home-Camera, Laptop.",
          "If you see Unknown Device, do not panic.",
          "Check if it belongs to someone at home.",
          "If nobody recognizes it, change the Wi-Fi password so only trusted devices reconnect.",
        ],
      },
      {
        title: "5. Close the guest network if you do not need it",
        body: "Look for Guest Network, Guest Wi-Fi, or Guest SSID. If it is open with no password, turn it off or add a strong password.",
        bullets: [
          "Turn Guest Network off if you do not use it.",
          "If you need it, protect it with a strong password.",
          "Do not leave guest Wi-Fi open for anyone nearby.",
        ],
      },
      {
        title: "6. Do not change advanced internet settings",
        body: "Some settings can disconnect the internet if changed incorrectly. Focus only on Wi-Fi name, Wi-Fi password, security mode, connected devices, and guest network.",
        bullets: [
          "Do not change WAN if you do not understand it.",
          "Do not change PPPoE if you do not understand it.",
          "Do not change VLAN if you do not understand it.",
          "Do not change DNS, LAN IP, DHCP, or Factory Reset unless you know exactly what you are doing.",
          "Before changing anything, take a photo of the current settings.",
          "After changing Wi-Fi name or password, press Save or Apply and reconnect your devices using the new password.",
        ],
      },
    ],
    checklist: [
      "I logged in using the router admin details, not the Wi-Fi password.",
      "I changed the Wi-Fi name to a general name.",
      "I used a strong Wi-Fi password.",
      "I enabled WPA2-AES or WPA3 if available.",
      "I reviewed the connected devices list.",
      "I closed the guest network or protected it with a strong password.",
      "I did not change advanced internet settings I do not understand.",
    ],
  },

  tv: {
    title: "Smart TV Security",
    description: "Learn how to protect your smart TV, apps, and connected accounts.",
    videoUrl: "/videos/tv-security.mp4",
    readingTitle: "Protect your smart TV in 6 steps",
    readingIntro:
      "Smart TVs connect to the internet, accounts, apps, and sometimes microphones or nearby devices. These steps help you reduce privacy and security risks.",
    readingSections: [
      {
        title: "1. Open the TV settings",
        body: "Go to the settings menu and review the important sections.",
        bullets: ["Settings", "System", "Network", "Apps", "Privacy", "Accounts"],
      },
      {
        title: "2. Update the TV system",
        body: "Check System, Support, or About TV. Look for Software Update, System Update, or Update System. If an official update is available, install it.",
      },
      {
        title: "3. Download apps from the official store only",
        body: "Do not install apps from unknown sources. Delete any app that looks risky or unnecessary.",
        bullets: ["Apps you do not recognize", "Apps you do not use", "Apps you do not trust"],
      },
      {
        title: "4. Review signed-in accounts",
        body: "Open the accounts section and check which accounts are currently signed in.",
        bullets: [
          "Who is signed in?",
          "Are there old accounts?",
          "Do you really need all these accounts?",
          "Sign out from any account you do not need.",
        ],
      },
      {
        title: "5. Review app permissions",
        body: "Check what each app can access and turn off anything unnecessary.",
        bullets: ["Microphone", "Camera", "Location", "Nearby devices"],
      },
      {
        title: "6. Close open casting or pairing",
        body: "If your TV allows nearby devices to cast or connect automatically, change the setting so connection requires your approval, or turn it off if you do not need it.",
      },
    ],
    checklist: [
      "I opened the TV settings and found System, Network, Apps, Privacy, and Accounts.",
      "I checked for an official TV system/software update and installed it if available.",
      "I removed apps I do not recognize, do not use, or do not trust.",
      "I confirmed that apps are installed only from the official TV app store.",
      "I reviewed signed-in accounts and signed out from accounts I do not need.",
      "I reviewed app permissions such as microphone, camera, location, and nearby devices.",
      "I changed casting/pairing so it requires my approval, or turned it off if not needed.",
    ],
  },

  lock: {
    title: "Smart Lock Security",
    description: "Learn how to protect your smart door lock and access codes.",
    videoUrl: "/videos/lock-security.mp4",
    readingTitle: "Protect your smart door lock in 7 steps",
    readingIntro:
      "A smart lock protects the entrance to your home, so you should secure the app, access codes, and connected users.",
    readingSections: [
      {
        title: "1. Open the smart lock app",
        body: "Open the official smart lock app, choose your lock, then open settings.",
        bullets: ["Settings", "Users", "Access Codes", "Security", "Activity Log", "Firmware Update"],
      },
      {
        title: "2. Change weak PIN codes",
        body: "Avoid simple codes like 0000, 1234, birthdays, or phone-number endings. Use a code that is hard to guess.",
      },
      {
        title: "3. Remove unnecessary users",
        body: "Review who has access to the lock and remove old users, temporary guests, or unknown accounts.",
      },
      {
        title: "4. Use temporary codes for visitors",
        body: "If someone needs short-term access, create a temporary code instead of sharing your main code.",
      },
      {
        title: "5. Turn on two-factor authentication",
        body: "If the lock app supports two-factor authentication, enable it for the account that controls the lock.",
      },
      {
        title: "6. Update the smart lock",
        body: "Check for official firmware or software updates in the app and install them if available.",
      },
      {
        title: "7. Review activity history",
        body: "Check the activity log regularly to see when the door was unlocked and by which user or code.",
      },
    ],
    checklist: [
      "I opened the smart lock settings.",
      "I changed weak or default PIN codes.",
      "I removed users I do not recognize or no longer need.",
      "I used temporary codes for visitors instead of sharing my main code.",
      "I enabled two-factor authentication if available.",
      "I checked for smart lock updates.",
      "I reviewed the lock activity history.",
    ],
  },

  phone: {
    title: "Phone Security",
    description: "Learn how to protect your phone from suspicious links and scams.",
    videoUrl: "/videos/phone-security.mp4",
    readingTitle: "Protect your phone in 5 steps",
    readingIntro:
      "Your phone contains accounts, messages, photos, and banking access, so small security habits matter.",
    readingSections: [
      {
        title: "1. Avoid suspicious links",
        body: "Do not open links from unknown senders or messages that create pressure or fear.",
      },
      {
        title: "2. Use screen lock",
        body: "Use a strong passcode, fingerprint, or face unlock.",
      },
      {
        title: "3. Keep apps updated",
        body: "Update apps and your phone system regularly.",
      },
      {
        title: "4. Enable two-factor authentication",
        body: "Turn on two-factor authentication for important accounts.",
      },
      {
        title: "5. Report suspicious messages",
        body: "Use CyberMajlis to report suspicious messages or numbers when needed.",
      },
    ],
    checklist: [
      "I avoided opening suspicious links.",
      "I enabled a strong screen lock.",
      "I updated my apps and phone system.",
      "I enabled two-factor authentication for important accounts.",
      "I reported suspicious messages in CyberMajlis when needed.",
    ],
  },
};

export const pageShellStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(99,32,36,0.12), transparent 35%), #FDFBF6",
  padding: "2rem",
  color: "#4a1a1d",
  fontFamily: "var(--ui)",
} as const;

export const globalLessonStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

  .lesson-card {
    border-radius: 20px;
    border: 1px solid rgba(99,32,36,0.16);
    padding: 1.2rem;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    text-align: left;
    min-height: 160px;
  }

  .lesson-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 60px rgba(99,32,36,0.22);
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--ui);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #E8D4BC;
    background: linear-gradient(135deg, #4a1a1d, #632024);
    border: 1px solid rgba(197,165,126,0.45);
    padding: 0.7rem 1.1rem;
    border-radius: 999px;
    margin-bottom: 1.25rem;
    text-decoration: none;
    font-weight: 700;
    box-shadow: 0 8px 24px rgba(62,19,22,0.22);
    cursor: pointer;
  }

  .soft-back-btn {
    border: none;
    background: rgba(99,32,36,0.1);
    color: #632024;
    padding: 0.65rem 1rem;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 700;
    text-decoration: none;
    display: inline-flex;
  }

  .check-item {
    display: flex;
    gap: 0.9rem;
    align-items: flex-start;
    padding: 1rem;
    border-radius: 16px;
    background: white;
    border: 1px solid rgba(99,32,36,0.1);
    cursor: pointer;
    transition: 0.2s ease;
  }

  .check-item.done {
    background: rgba(197,165,126,0.28);
    border-color: rgba(99,32,36,0.18);
  }

  .check-item input {
    margin-top: 0.25rem;
    accent-color: #632024;
    transform: scale(1.2);
  }

  .reading-step {
    background: white;
    border: 1px solid rgba(99,32,36,0.1);
    border-radius: 18px;
    padding: 1.2rem;
  }

  .reading-step h3 {
    font-family: var(--ui);
    margin: 0 0 0.6rem;
    color: #4a1a1d;
  }

  .reading-step p {
    color: #6a4640;
    line-height: 1.7;
    margin: 0;
  }

  .reading-step ul {
    margin: 0.7rem 0 0;
    color: #6a4640;
    line-height: 1.8;
  }

  .platform-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1.2rem;
  }

  @media (max-width: 900px) {
    .choice-grid, .platform-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 700px) {
    main {
      padding: 1rem !important;
    }
  }
`;

export const lessonsAr: Record<string, Lesson> = {
  camera: {
    title: "أمان الكاميرا الذكية",
    description: "تعلّم كيف تحمي كاميرات منزلك من الوصول غير المرغوب فيه.",
    videoUrl: "/videos/camera-security.mp4",
    readingTitle: "احمِ كاميرات منزلك في 7 خطوات",
    readingIntro: "الكاميرات مفيدة ولكن يجب تأمينها، لأنها قد تكشف أماكن خاصة إذا وصل إليها شخص غير مصرح له.",
    readingSections: [
      {
        title: "١. افتح تطبيق الكاميرا",
        body: "افتح تطبيق الكاميرا على هاتفك، اختر الكاميرا، ثم افتح إعداداتها.",
        bullets: ["الإعدادات", "الأمان", "الحساب", "الخصوصية", "معلومات الجهاز", "تحديث البرنامج الثابت"],
        whyItMatters: "من هنا يمكنك التحكم في الأمان والخصوصية والتحديثات والحسابات والميزات المتصلة.",
      },
      {
        title: "٢. غيّر كلمة مرور الكاميرا",
        body: "لا تستخدم كلمات مرور ضعيفة. استخدم كلمة مرور قوية مختلفة عن كلمة مرور Wi-Fi.",
        bullets: ["تجنب: camera123", "تجنب: 12345678", "تجنب: admin123"],
        whyItMatters: "كلمات المرور الضعيفة تسهّل على أي شخص الوصول إلى الجهاز أو تطبيقه بدون إذن.",
      },
      {
        title: "٣. غيّر بيانات الدخول الافتراضية",
        body: "إذا كانت الكاميرا تستخدم بيانات دخول افتراضية مثل admin/admin أو بيانات مطبوعة على الجهاز، غيّرها فوراً.",
        whyItMatters: "بيانات الدخول الافتراضية خطيرة لأن كثيراً من الناس يمكنهم تخمينها أو إيجادها على الإنترنت.",
      },
      {
        title: "٤. حدّث الكاميرا",
        body: "افتح قسم التحديث وثبّت التحديث الرسمي إذا كان متاحاً.",
        bullets: ["تحديث البرنامج الثابت", "تحديث البرنامج", "تحديث الجهاز"],
        whyItMatters: "التحديثات تُصلح نقاط الضعف الأمنية وتحسّن طريقة عمل الجهاز بأمان.",
      },
      {
        title: "٥. أوقف الوصول عن بُعد إذا لم تحتجه",
        body: "إذا لم تحتج لمشاهدة الكاميرا من خارج المنزل، أوقف الوصول عن بُعد. إذا كنت بحاجة إليه، استخدم التطبيق الرسمي فقط وكلمة مرور قوية والمصادقة الثنائية إذا كانت مدعومة.",
        whyItMatters: "الوصول عن بُعد مفيد لكنه يفتح باباً آخر للجهاز إذا لم يكن محمياً بشكل صحيح.",
      },
      {
        title: "٦. لا تشارك روابط الكاميرا أو رموز QR",
        body: "تجنب مشاركة روابط دعوة الكاميرا أو رموز QR أو رموز الوصول إلا إذا كنت تثق تماماً بالشخص وتستطيع إزالة وصوله لاحقاً.",
        whyItMatters: "الروابط المشتركة أو رموز QR قد تمنح وصولاً للشخص الخطأ إذا تم تمريرها أو كشفها.",
      },
      {
        title: "٧. راجع المستخدمين والأجهزة المتصلة",
        body: "في تطبيق الكاميرا، تحقق من الأشخاص الذين لديهم إذن بالوصول. احذف أي حساب أو جهاز لا تعرفه. إذا أمكن، ضع الكاميرا على شبكة ضيوف أو IoT منفصلة.",
        whyItMatters: "مراجعة المستخدمين والحسابات تساعدك على إزالة الوصول القديم أو غير المعروف أو غير الضروري.",
      },
    ],
    checklist: [
      "فتحت إعدادات الكاميرا.",
      "غيّرت كلمة مرور الكاميرا.",
      "غيّرت بيانات الدخول الافتراضية.",
      "حدّثت الكاميرا.",
      "راجعت إعدادات الوصول عن بُعد.",
      "لم أشارك رابط الكاميرا أو رمز QR.",
      "وضعت الكاميرا على شبكة منفصلة إذا أمكن.",
      "راجعت المستخدمين المتصلين بالكاميرا.",
    ],
  },

  router: {
    title: "أمان شبكة Wi-Fi",
    description: "اختر جهازك أولاً، ثم تعلّم كيف تدخل إعدادات الراوتر وتحمي شبكتك المنزلية.",
    videoUrl: "/videos/router-security.mp4",
    readingTitle: "احمِ شبكة Wi-Fi المنزلية خطوة بخطوة",
    readingIntro: "",
    platformGuides: [
      {
        label: "Windows",
        title: "Windows: ابحث عن عنوان الراوتر",
        videoUrl: "/videos/wifi-windows.mp4",
        steps: [
          "تأكد من اتصال الجهاز بشبكة Wi-Fi المنزلية.",
          "اضغط على بحث واكتب cmd.",
          "افتح موجه الأوامر (Command Prompt).",
          "اكتب ipconfig واضغط Enter.",
          "ابحث عن قسم Wi-Fi.",
          "ابحث عن Default Gateway.",
          "استخدم الرقم الموجود بجانب Default Gateway كعنوان الراوتر، مثلاً 192.168.18.1.",
          "افتح Chrome أو Edge واكتب العنوان في شريط العنوان وليس في Google.",
        ],
        checklist: [
          "وصّلت جهاز Windows بشبكة Wi-Fi المنزلية.",
          "فتحت موجه الأوامر.",
          "كتبت ipconfig.",
          "وجدت Default Gateway.",
          "فتحت عنوان الراوتر في شريط العنوان.",
        ],
        whyPerStep: [
          "صفحة إعدادات الراوتر تعمل عادةً فقط عندما يكون جهازك متصلاً بنفس شبكة Wi-Fi المنزلية.",
          "يساعدك هذا على الوصول للأداة الصحيحة بدلاً من البحث عشوائياً.",
          "هذه الأداة تُظهر معلومات الشبكة التي يستخدمها جهازك حالياً.",
          "هذا الأمر يكشف التفاصيل التقنية للشبكة بأمان.",
          "قسم Wi-Fi يساعدك على تجنب نسخ معلومات من شبكة خاطئة.",
          "عنوان الراوتر هو البوابة لصفحة إعداداته.",
          "استخدام العنوان الصحيح يساعدك على الوصول لصفحة الراوتر مباشرة.",
          "كتابة العنوان في شريط المتصفح يتجنب البحث عنه في Google بالخطأ.",
        ],
      },
      {
  label: "Mac",
  title: "Mac: ابحث عن عنوان الراوتر",
  videoUrl: "/videos/wifi-mac.mp4",
  steps: [
    "افتح إعدادات النظام (System Settings).",
    "اختر Wi-Fi.",
    "تأكد من اتصال الـ Mac بشبكة Wi-Fi المنزلية.",
    "اضغط على الشبكة المتصل بها، ثم اختر تفاصيل (Details).",
    "افتح TCP/IP.",
    "ابحث عن Router.",
    "استخدم الرقم الموجود بجانب Router كعنوان الراوتر.",
    "افتح Safari أو Chrome أو أي متصفح آخر واكتب العنوان في شريط العنوان.",
  ],
  checklist: [
    "وصّلت الـ Mac بشبكة Wi-Fi المنزلية.",
    "فتحت إعدادات Wi-Fi.",
    "فتحت التفاصيل للشبكة المتصل بها.",
    "وجدت Router تحت TCP/IP.",
    "فتحت عنوان الراوتر في شريط العنوان.",
  ],
  whyPerStep: [
    "يساعدك هذا على الوصول لمكان الإعدادات الصحيح.",
    "قسم Wi-Fi يعرض تفاصيل الشبكة الحالية.",
    "صفحة إعدادات الراوتر تعمل عادةً فقط عندما يكون جهازك متصلاً بنفس شبكة Wi-Fi المنزلية.",
    "قسم التفاصيل يكشف المعلومات التقنية للشبكة المتصل بها.",
    "قسم TCP/IP يحتوي على عنوان الراوتر.",
    "عنوان الراوتر هو البوابة لصفحة إعداداته.",
    "يساعدك على فهم الرقم الذي ستستخدمه.",
    "كتابة العنوان في شريط المتصفح يتجنب البحث عنه في Google بالخطأ.",
  ],
},
      {
        label: "iPhone",
        title: "iPhone: ابحث عن عنوان الراوتر",
        videoUrl: "/videos/wifi-iphone.mp4",
        steps: [
          "افتح الإعدادات.",
          "افتح Wi-Fi.",
          "تأكد من اتصال الـ iPhone بشبكة Wi-Fi المنزلية.",
          "اضغط على أيقونة المعلومات (i) بجانب اسم الشبكة.",
          "مرّر للأسفل وابحث عن Router.",
          "استخدم الرقم الموجود بجانب Router كعنوان الراوتر.",
          "افتح Safari أو Chrome.",
          "اكتب العنوان في شريط العنوان، مثلاً http://192.168.18.1، ثم اضغط Go.",
        ],
        checklist: [
          "وصّلت الـ iPhone بشبكة Wi-Fi المنزلية.",
          "فتحت إعدادات Wi-Fi.",
          "ضغطت على أيقونة المعلومات بجانب الشبكة.",
          "وجدت Router.",
          "فتحت عنوان الراوتر في Safari أو Chrome.",
        ],
        whyPerStep: [
          "صفحة إعدادات الراوتر تعمل عادةً فقط عندما يكون جهازك متصلاً بنفس شبكة Wi-Fi المنزلية.",
          "قسم Wi-Fi يعرض تفاصيل الشبكة الحالية.",
          "التأكد من الاتصال بالشبكة الصحيحة مهم قبل البحث.",
          "أيقونة المعلومات تفتح تفاصيل الشبكة.",
          "عنوان الراوتر هو البوابة لصفحة إعداداته.",
          "يساعدك على فهم الرقم الذي ستستخدمه.",
          "المتصفح هو وسيلة الوصول لصفحة الراوتر.",
          "كتابة العنوان في شريط العنوان يتجنب البحث عنه في Google بالخطأ.",
        ],
      },
      {
        label: "Android",
        title: "Android: ابحث عن عنوان الراوتر",
        videoUrl: "/videos/wifi-android.mp4",
        steps: [
          "افتح الإعدادات.",
          "افتح الشبكة والإنترنت أو الاتصالات أو Wi-Fi حسب هاتفك.",
          "تأكد من اتصال الهاتف بشبكة Wi-Fi المنزلية.",
          "اضغط على شبكة Wi-Fi المتصل بها.",
          "ابحث عن تفاصيل الشبكة أو الراوتر أو Gateway.",
          "استخدم الرقم الموجود بجانب Gateway أو Router كعنوان الراوتر.",
          "إذا لم يظهر العنوان، جرّب العناوين الشائعة مثل 192.168.1.1 أو 192.168.0.1 أو 192.168.18.1.",
          "يمكنك أيضاً استخدام تطبيق مزوّد الإنترنت إذا كان متاحاً.",
          "افتح Chrome واكتب عنوان الراوتر في شريط العنوان.",
        ],
        checklist: [
          "وصّلت هاتف Android بشبكة Wi-Fi المنزلية.",
          "فتحت تفاصيل شبكة Wi-Fi.",
          "بحثت عن Gateway أو Router.",
          "جرّبت عناوين الراوتر الشائعة إذا لم يظهر العنوان.",
          "فتحت عنوان الراوتر في Chrome.",
        ],
        whyPerStep: [
          "صفحة إعدادات الراوتر تعمل عادةً فقط عندما يكون جهازك متصلاً بنفس شبكة Wi-Fi المنزلية.",
          "يساعدك هذا على الوصول لمكان الإعدادات الصحيح.",
          "التأكد من الاتصال بالشبكة الصحيحة مهم قبل البحث.",
          "تفاصيل الشبكة تحتوي على عنوان الراوتر.",
          "عنوان الراوتر هو البوابة لصفحة إعداداته.",
          "يساعدك على فهم الرقم الذي ستستخدمه.",
          "العناوين الشائعة تُستخدم في معظم الراوترات المنزلية.",
          "تطبيق مزوّد الإنترنت قد يوفر الوصول للراوتر بشكل مباشر.",
          "كتابة العنوان في شريط العنوان يتجنب البحث عنه في Google بالخطأ.",
        ],
      },
    ],
    readingSections: [
      {
        title: "بعد فتح صفحة الراوتر: سجّل الدخول بأمان",
        body: "اسم المستخدم وكلمة مرور الراوتر ليسا نفس كلمة مرور Wi-Fi. يُستخدمان للدخول إلى لوحة تحكم الراوتر.",
        bullets: [
          "تحقق من الملصق خلف الراوتر.",
          "تحقق من بطاقة التثبيت أو الورقة.",
          "تحقق من تطبيق مزوّد الإنترنت.",
          "تحقق من رسائل مزوّد الإنترنت.",
          "تواصل مع الدعم إذا لم تجدهم.",
          "لا تشارك بيانات الدخول هذه مع أحد.",
        ],
        whyItMatters: "بيانات دخول الراوتر تتحكم في إعدادات مهمة، لذا يجب التعامل معها بحذر أكثر من كلمة مرور Wi-Fi.",
      },
      {
        title: "١. غيّر اسم شبكة Wi-Fi",
        body: "ابحث عن SSID أو Wi-Fi Name أو Network Name. استخدم اسماً عاماً لا يكشف اسمك أو اسم عائلتك أو موديل الراوتر.",
        bullets: [
          "غير مستحسن: HamadFamily_Router123",
          "أفضل: HomeNet",
          "الاسم العام يعطي معلومات أقل للأشخاص القريبين.",
        ],
        whyItMatters: "اسم Wi-Fi العام يعطي معلومات شخصية أقل للأشخاص القريبين.",
      },
      {
        title: "٢. استخدم كلمة مرور Wi-Fi قوية",
        body: "ابحث عن Wi-Fi Password أو Wireless Password أو WPA Key أو Pre-Shared Key. استخدم كلمة مرور طويلة تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز.",
        bullets: [
          "تجنب: 12345678",
          "تجنب: qatar123",
          "تجنب: password",
          "لا تستخدم اسمك أو رقم هاتفك أو تاريخ ميلادك أو كلمات سهلة.",
        ],
        whyItMatters: "كلمة مرور Wi-Fi القوية تمنع الأشخاص غير المرغوب فيهم من الانضمام لشبكتك المنزلية.",
      },
      {
        title: "٣. فعّل وضع الأمان القوي",
        body: "ابحث عن Security Mode أو Encryption أو Authentication. اختر WPA2-AES أو WPA3 إذا كان متاحاً.",
        bullets: [
          "تجنب الشبكات المفتوحة بدون كلمة مرور.",
          "تجنب خيارات الحماية القديمة مثل WEP.",
          "WPA2-AES أو WPA3 خيارات أكثر أماناً.",
          "أيقونة القفل بجانب اسم Wi-Fi تعني أن الشبكة تستخدم كلمة مرور وتشفيراً.",
        ],
        whyItMatters: "WPA2-AES أو WPA3 يساعد في حماية الاتصال بين أجهزتك والراوتر.",
      },
      {
        title: "٤. راجع الأجهزة المتصلة",
        body: "ابحث عن Connected Devices أو Device List أو Clients أو Online Devices أو Attached Devices. إذا وجدت جهازاً غير معروف، اسأل عائلتك أولاً. إذا كان لا يزال غير معروف، غيّر كلمة مرور Wi-Fi.",
        bullets: [
          "أمثلة: Hamad-iPhone، LivingRoom-TV، Home-Camera، Laptop.",
          "إذا رأيت Unknown Device، لا تتصرف بتسرع.",
          "تحقق إذا كان تابعاً لأحد في المنزل.",
          "إذا لم يعرفه أحد، غيّر كلمة مرور Wi-Fi حتى تتصل الأجهزة الموثوقة فقط من جديد.",
        ],
        whyItMatters: "مراجعة الأجهزة المتصلة تساعدك على اكتشاف الهواتف أو الأجهزة المحمولة أو الأجهزة الذكية غير المعروفة التي تستخدم شبكتك.",
      },
      {
        title: "٥. أغلق شبكة الضيوف إذا لم تحتجها",
        body: "ابحث عن Guest Network أو Guest Wi-Fi أو Guest SSID. إذا كانت مفتوحة بدون كلمة مرور، أوقفها أو أضف كلمة مرور قوية.",
        bullets: [
          "أوقف شبكة الضيوف إذا لم تستخدمها.",
          "إذا كنت بحاجة إليها، احمها بكلمة مرور قوية.",
          "لا تترك Wi-Fi الضيوف مفتوحاً للأشخاص القريبين.",
        ],
        whyItMatters: "شبكة الضيوف المفتوحة قد تسمح للأشخاص القريبين بالاتصال بدون إذن، لذا يجب إغلاقها أو حمايتها.",
      },
      {
        title: "٦. لا تغيّر إعدادات الإنترنت المتقدمة",
        body: "بعض الإعدادات قد تقطع الإنترنت إذا تم تغييرها بشكل خاطئ. ركّز فقط على اسم Wi-Fi وكلمة المرور ووضع الأمان والأجهزة المتصلة وشبكة الضيوف.",
        bullets: [
          "لا تغيّر WAN إذا لم تفهمه.",
          "لا تغيّر PPPoE إذا لم تفهمه.",
          "لا تغيّر VLAN إذا لم تفهمه.",
          "لا تغيّر DNS أو LAN IP أو DHCP أو إعادة الضبط المصنعي إلا إذا كنت تعرف تماماً ما تفعله.",
          "قبل تغيير أي شيء، التقط صورة للإعدادات الحالية.",
          "بعد تغيير اسم Wi-Fi أو كلمة المرور، اضغط Save أو Apply وأعد توصيل أجهزتك بكلمة المرور الجديدة.",
        ],
        whyItMatters: "الإعدادات المتقدمة قد تقطع الاتصال بالإنترنت إذا تم تغييرها بشكل خاطئ، لذا الأفضل تجنبها.",
      },
    ],
    checklist: [
      "سجّلت الدخول باستخدام بيانات المسؤول، وليس كلمة مرور Wi-Fi.",
      "غيّرت اسم Wi-Fi إلى اسم عام.",
      "استخدمت كلمة مرور Wi-Fi قوية.",
      "فعّلت WPA2-AES أو WPA3 إذا كان متاحاً.",
      "راجعت قائمة الأجهزة المتصلة.",
      "أغلقت شبكة الضيوف أو حميتها بكلمة مرور قوية.",
      "لم أغيّر إعدادات الإنترنت المتقدمة التي لا أفهمها.",
    ],
  },

  tv: {
    title: "أمان التلفاز الذكي",
    description: "تعلّم كيف تحمي تلفازك الذكي وتطبيقاته والحسابات المرتبطة به.",
    videoUrl: "/videos/tv-security.mp4",
    readingTitle: "احمِ تلفازك الذكي في 6 خطوات",
    readingIntro: "التلفازات الذكية تتصل بالإنترنت والحسابات والتطبيقات وأحياناً بالميكروفون أو الأجهزة القريبة. هذه الخطوات تساعدك على تقليل مخاطر الخصوصية والأمان.",
    readingSections: [
      {
        title: "١. افتح إعدادات التلفاز",
        body: "اذهب لقائمة الإعدادات وراجع الأقسام المهمة.",
        bullets: ["الإعدادات", "النظام", "الشبكة", "التطبيقات", "الخصوصية", "الحسابات"],
        whyItMatters: "من هنا يمكنك التحكم في الأمان والخصوصية والتحديثات والحسابات والتطبيقات.",
      },
      {
        title: "٢. حدّث نظام التلفاز",
        body: "تحقق من System أو Support أو About TV. ابحث عن Software Update أو System Update أو Update System. إذا كان هناك تحديث رسمي متاح، قم بتثبيته.",
        whyItMatters: "التحديثات تُصلح نقاط الضعف الأمنية وتحسّن طريقة عمل التلفاز بأمان.",
      },
      {
        title: "٣. حمّل التطبيقات من المتجر الرسمي فقط",
        body: "لا تثبّت تطبيقات من مصادر مجهولة. احذف أي تطبيق يبدو خطيراً أو غير ضروري.",
        bullets: ["تطبيقات لا تعرفها", "تطبيقات لا تستخدمها", "تطبيقات لا تثق بها"],
        whyItMatters: "التطبيقات من مصادر مجهولة قد تجمع بياناتك أو تتصرف بطرق غير آمنة.",
      },
      {
        title: "٤. راجع الحسابات المسجّل دخولها",
        body: "افتح قسم الحسابات وتحقق من الحسابات المسجّل دخولها حالياً.",
        bullets: [
          "من هو مسجّل الدخول؟",
          "هل توجد حسابات قديمة؟",
          "هل تحتاج حقاً لكل هذه الحسابات؟",
          "سجّل الخروج من أي حساب لا تحتاجه.",
        ],
        whyItMatters: "مراجعة الحسابات تساعدك على إزالة الوصول القديم أو غير الضروري.",
      },
      {
        title: "٥. راجع أذونات التطبيقات",
        body: "تحقق مما تستطيع كل تطبيق الوصول إليه وأوقف ما هو غير ضروري.",
        bullets: ["الميكروفون", "الكاميرا", "الموقع", "الأجهزة القريبة"],
        whyItMatters: "الأذونات تتحكم فيما يمكن للتطبيقات الوصول إليه مثل الكاميرا والميكروفون والموقع والأجهزة القريبة.",
      },
      {
        title: "٦. أوقف البث أو الإقران المفتوح",
        body: "إذا كان تلفازك يسمح للأجهزة القريبة بالبث أو الاتصال تلقائياً، غيّر الإعداد حتى يتطلب الاتصال موافقتك، أو أوقفه إذا لم تحتجه.",
        whyItMatters: "البث أو الإقران المفتوح قد يسمح للأجهزة القريبة بالاتصال أو إرسال محتوى بدون تحكم كافٍ.",
      },
    ],
    checklist: [
      "فتحت إعدادات التلفاز ووجدت النظام والشبكة والتطبيقات والخصوصية والحسابات.",
      "تحققت من وجود تحديث رسمي لنظام التلفاز وثبّتته إذا كان متاحاً.",
      "حذفت التطبيقات التي لا أعرفها أو لا أستخدمها أو لا أثق بها.",
      "تأكدت من أن التطبيقات مثبّتة من متجر التطبيقات الرسمي للتلفاز فقط.",
      "راجعت الحسابات المسجّل دخولها وخرجت من الحسابات التي لا أحتاجها.",
      "راجعت أذونات التطبيقات مثل الميكروفون والكاميرا والموقع والأجهزة القريبة.",
      "غيّرت إعداد البث/الإقران حتى يتطلب موافقتي، أو أوقفته إذا لم أحتجه.",
    ],
  },

  lock: {
    title: "أمان القفل الذكي",
    description: "تعلّم كيف تحمي قفل بابك الذكي ورموز الدخول.",
    videoUrl: "/videos/lock-security.mp4",
    readingTitle: "احمِ قفل الباب الذكي في 7 خطوات",
    readingIntro: "القفل الذكي يحمي مدخل منزلك، لذا يجب تأمين التطبيق ورموز الدخول والمستخدمين المتصلين به.",
    readingSections: [
      {
        title: "١. افتح تطبيق القفل الذكي",
        body: "افتح تطبيق القفل الرسمي، اختر قفلك، ثم افتح الإعدادات.",
        bullets: ["الإعدادات", "المستخدمون", "رموز الدخول", "الأمان", "سجل النشاط", "تحديث البرنامج الثابت"],
        whyItMatters: "من هنا يمكنك التحكم في رموز الدخول والمستخدمين والتحديثات وسجل النشاط.",
      },
      {
        title: "٢. غيّر رموز PIN الضعيفة",
        body: "تجنب الرموز البسيطة مثل 0000 أو 1234 أو تواريخ الميلاد أو نهايات الهواتف. استخدم رمزاً يصعب تخمينه.",
        whyItMatters: "رموز الدخول تحمي مدخل المنزل، لذا الرموز البسيطة أو المشتركة تشكّل خطراً أمنياً حقيقياً.",
      },
      {
        title: "٣. احذف المستخدمين غير الضروريين",
        body: "راجع من لديه وصول للقفل واحذف المستخدمين القدامى أو الضيوف المؤقتين أو الحسابات المجهولة.",
        whyItMatters: "مراجعة المستخدمين تساعدك على إزالة الوصول القديم أو غير المعروف أو غير الضروري.",
      },
      {
        title: "٤. استخدم رموزاً مؤقتة للزوار",
        body: "إذا احتاج شخص ما للوصول لفترة قصيرة، أنشئ رمزاً مؤقتاً بدلاً من مشاركة رمزك الرئيسي.",
        whyItMatters: "الوصول المؤقت أكثر أماناً لأنه يمكن إزالته بعد انتهاء حاجة الزائر له.",
      },
      {
        title: "٥. فعّل المصادقة الثنائية",
        body: "إذا كان تطبيق القفل يدعم المصادقة الثنائية، فعّلها للحساب الذي يتحكم في القفل.",
        whyItMatters: "المصادقة الثنائية تضيف طبقة حماية إضافية على الحساب الذي يتحكم في قفل بابك.",
      },
      {
        title: "٦. حدّث القفل الذكي",
        body: "تحقق من وجود تحديثات رسمية للبرنامج الثابت أو البرنامج في التطبيق وثبّتها إذا كانت متاحة.",
        whyItMatters: "التحديثات تُصلح نقاط الضعف الأمنية وتحسّن طريقة عمل القفل بأمان.",
      },
      {
        title: "٧. راجع سجل النشاط",
        body: "تحقق من سجل النشاط بانتظام لمعرفة متى تم فتح الباب وبواسطة أي مستخدم أو رمز.",
        whyItMatters: "سجل النشاط يساعدك على ملاحظة أي وصول غير عادي أو أحداث فتح مشبوهة.",
      },
    ],
    checklist: [
      "فتحت إعدادات القفل الذكي.",
      "غيّرت رموز PIN الضعيفة أو الافتراضية.",
      "حذفت المستخدمين الذين لا أعرفهم أو لم أعد بحاجة إليهم.",
      "استخدمت رموزاً مؤقتة للزوار بدلاً من مشاركة رمزي الرئيسي.",
      "فعّلت المصادقة الثنائية إذا كانت متاحة.",
      "تحققت من تحديثات القفل الذكي.",
      "راجعت سجل نشاط القفل.",
    ],
  },

  phone: {
    title: "أمان الهاتف",
    description: "تعلّم كيف تحمي هاتفك من الروابط المشبوهة وعمليات الاحتيال.",
    videoUrl: "/videos/phone-security.mp4",
    readingTitle: "احمِ هاتفك في 5 خطوات",
    readingIntro: "هاتفك يحتوي على حسابات ورسائل وصور ووصول للخدمات المصرفية، لذا العادات الأمنية البسيطة مهمة.",
    readingSections: [
      {
        title: "١. تجنب الروابط المشبوهة",
        body: "لا تفتح روابط من مرسلين مجهولين أو رسائل تُثير الضغط أو الخوف.",
        whyItMatters: "الروابط المشبوهة قد تقودك لمواقع احتيالية أو تثبّت برامج ضارة على هاتفك.",
      },
      {
        title: "٢. استخدم قفل الشاشة",
        body: "استخدم رمز مرور قوياً أو بصمة الإصبع أو قفل الوجه.",
        whyItMatters: "قفل الشاشة يمنع أي شخص من الوصول لهاتفك إذا فقدته أو سُرق.",
      },
      {
        title: "٣. حافظ على التطبيقات محدّثة",
        body: "حدّث التطبيقات ونظام هاتفك بانتظام.",
        whyItMatters: "التحديثات تُصلح نقاط الضعف الأمنية التي قد يستغلها المهاجمون.",
      },
      {
        title: "٤. فعّل المصادقة الثنائية",
        body: "شغّل المصادقة الثنائية للحسابات المهمة.",
        whyItMatters: "المصادقة الثنائية تضيف طبقة حماية إضافية حتى لو تمكن أحد من معرفة كلمة مرورك.",
      },
      {
        title: "٥. أبلغ عن الرسائل المشبوهة",
        body: "استخدم CyberMajlis للإبلاغ عن الرسائل أو الأرقام المشبوهة عند الحاجة.",
        whyItMatters: "الإبلاغ يساعد على حماية الآخرين وتتبع عمليات الاحتيال الرقمية.",
      },
    ],
    checklist: [
      "تجنّبت فتح الروابط المشبوهة.",
      "فعّلت قفل الشاشة القوي.",
      "حدّثت تطبيقاتي ونظام الهاتف.",
      "فعّلت المصادقة الثنائية للحسابات المهمة.",
      "أبلغت عن الرسائل المشبوهة في CyberMajlis عند الحاجة.",
    ],
  },
};