"use client";
import { useTrackLesson } from "@/hooks/useTrackView";
import { useParams, useRouter } from "next/navigation";
import {
  Mail, KeyRound, EyeOff, AlertTriangle, ShoppingCart, Users,
  Lightbulb, Star, HelpCircle, UserRound,
} from "lucide-react";
import CalmNav from "@/components/calm/CalmNav";
import { useCalmLang } from "@/hooks/useCalmLang";

const sans   = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const cinzel = "var(--ui)";

const topicIcons: Record<string, React.ReactNode> = {
  phishing:  <Mail          size={64} color="#1A3A5C" strokeWidth={1.5} />,
  passwords: <KeyRound      size={64} color="#1A3A5C" strokeWidth={1.5} />,
  privacy:   <EyeOff        size={64} color="#1A3A5C" strokeWidth={1.5} />,
  scams:     <AlertTriangle size={64} color="#1A3A5C" strokeWidth={1.5} />,
  shopping:  <ShoppingCart  size={64} color="#1A3A5C" strokeWidth={1.5} />,
  family:    <Users         size={64} color="#1A3A5C" strokeWidth={1.5} />,
};

type Lesson = {
  title: string;
  intro: string;
  steps: { heading: string; body: string; tip?: string }[];
  remember: string;
};

const lessons: Record<string, { en: Lesson; ar: Lesson }> = {
  phishing: {
    en: {
      title: "Tricky Messages",
      intro: "Some people send fake messages to try to trick you. These messages might pretend to be from your bank, your school, or a company you know. Let's learn how to spot them.",
      steps: [
        {
          heading: "What does a tricky message look like?",
          body: "• It makes you feel scared or rushed, 'Your account will close TODAY!'\n• It asks for your password, your ID number, or your bank card\n• The sender's name looks a little wrong or strange\n• There is a link asking you to click it and log in",
          tip: "Real banks and schools never ask for your password in a message.",
        },
        {
          heading: "What should you do?",
          body: "• Do not click any link in the message\n• Do not reply to the message\n• Show the message to a grown-up right away\n• Delete the message after you have shown it",
        },
        {
          heading: "A simple rule to remember",
          body: "If a message makes you feel worried or rushed, stop. Take a breath. Then show it to a grown-up before doing anything.",
        },
      ],
      remember: "You will never get in trouble for ignoring a tricky message. But always show it to a grown-up first.",
    },
    ar: {
      title: "الرسائل المزيفة",
      intro: "بعض الناس يرسلون رسائل وهمية لمحاولة خداعك. قد تتظاهر هذه الرسائل بأنها من بنكك أو مدرستك أو شركة تعرفها. لنتعلم كيف نتعرف عليها.",
      steps: [
        {
          heading: "كيف تبدو الرسالة المزيفة؟",
          body: "• تجعلك تشعر بالخوف أو الاستعجال، 'سيُغلق حسابك اليوم!'\n• تطلب كلمة مرورك أو رقم هويتك أو بيانات بطاقتك البنكية\n• اسم المرسل يبدو غريباً أو فيه خطأ\n• يوجد رابط يطلب منك الضغط عليه وتسجيل الدخول",
          tip: "البنوك الحقيقية والمدارس لا تطلب منك كلمة مرورك أبداً في رسالة.",
        },
        {
          heading: "ماذا يجب أن تفعل؟",
          body: "• لا تضغط على أي رابط في الرسالة\n• لا ترد على الرسالة\n• أظهر الرسالة لشخص بالغ على الفور\n• احذف الرسالة بعد أن تريها له",
        },
        {
          heading: "قاعدة بسيطة لتتذكرها",
          body: "إذا جعلتك رسالة ما تشعر بالقلق أو الاستعجال، توقف. خذ نفساً عميقاً. ثم أرِها لشخص بالغ قبل أن تفعل أي شيء.",
        },
      ],
      remember: "لن تقع في مشكلة لأنك تجاهلت رسالة مزيفة. لكن أرِها دائماً لشخص بالغ أولاً.",
    },
  },
  passwords: {
    en: {
      title: "Your Secret Code",
      intro: "A password is like a secret code that keeps your accounts safe. Only you should know it, like a secret handshake that belongs only to you.",
      steps: [
        {
          heading: "What makes a good password?",
          body: "A good password:\n• Is long, at least 10 letters\n• Has a mix of letters and numbers\n• Is not your name or your birthday\n• Is easy for you to remember but hard for others to guess\n\nExample: MyDog_Spot_2025!",
          tip: "A long sentence you know is always better than a short complicated word.",
        },
        {
          heading: "Keep it secret",
          body: "• Never tell anyone your password, not even your best friend\n• If someone asks for your password, tell a grown-up right away\n• If you think someone found out your password, tell a grown-up immediately",
        },
        {
          heading: "One password for each thing",
          body: "Try to use a different password for different websites. If someone learns one password, they cannot get into everything else.",
        },
      ],
      remember: "Your password is your secret. Keep it private, only you should know it.",
    },
    ar: {
      title: "كودك السري",
      intro: "كلمة المرور هي كود سري يحافظ على حساباتك آمنة. أنت فقط من يجب أن يعرفها، مثل مصافحة سرية تخصك وحدك.",
      steps: [
        {
          heading: "ما الذي يجعل كلمة المرور جيدة؟",
          body: "كلمة المرور الجيدة:\n• طويلة، 10 أحرف على الأقل\n• تحتوي على حروف وأرقام معاً\n• لا تكون اسمك أو تاريخ ميلادك\n• سهلة التذكر لك لكن يصعب على الآخرين تخمينها\n\nمثال: كلبي_سبوت_2025!",
          tip: "جملة طويلة تعرفها دائماً أفضل من كلمة قصيرة معقدة.",
        },
        {
          heading: "احتفظ بها سراً",
          body: "• لا تخبر أحداً بكلمة مرورك، حتى أعز أصدقائك\n• إذا طلب منك أحد كلمة مرورك، أخبر شخصاً بالغاً فوراً\n• إذا ظننت أن أحداً عرف كلمة مرورك، أخبر شخصاً بالغاً على الفور",
        },
        {
          heading: "كلمة مرور لكل شيء",
          body: "حاول استخدام كلمة مرور مختلفة لمواقع مختلفة. إذا عرف أحدهم كلمة مرور واحدة، لن يستطيع الدخول على كل شيء آخر.",
        },
      ],
      remember: "كلمة مرورك هي سرك. احتفظ بها لنفسك، أنت فقط من يجب أن يعرفها.",
    },
  },
  privacy: {
    en: {
      title: "Your Private Info",
      intro: "Some information about you should stay private. This means you should not share it with strangers online, even if they seem friendly.",
      steps: [
        {
          heading: "What should stay private?",
          body: "• Your full name\n• Your home address\n• Your school name\n• Your phone number\n• Your photo\n• Your location, where you are right now",
          tip: "If a stranger online asks for any of this, stop talking to them and tell a grown-up.",
        },
        {
          heading: "Apps and permissions",
          body: "When you download an app, it might ask to see your location or photos. Ask a grown-up before saying yes to any of these.\n\nNot all apps need this information to work. Some just collect it.",
        },
        {
          heading: "Online friends",
          body: "Someone online might say they are your age or that they know your friends. It is hard to know if this is true.\n\nAlways check with a grown-up before talking to someone new online.",
        },
      ],
      remember: "It is okay to be friendly online, but keep your private information to yourself.",
    },
    ar: {
      title: "معلوماتك الخاصة",
      intro: "بعض المعلومات عنك يجب أن تبقى خاصة. هذا يعني أنك لا يجب أن تشاركها مع الغرباء عبر الإنترنت، حتى لو بدوا ودودين.",
      steps: [
        {
          heading: "ما الذي يجب أن يبقى خاصاً؟",
          body: "• اسمك الكامل\n• عنوان منزلك\n• اسم مدرستك\n• رقم هاتفك\n• صورتك\n• موقعك، أين أنت الآن",
          tip: "إذا طلب منك غريب عبر الإنترنت أي من هذه المعلومات، توقف عن التحدث معه وأخبر شخصاً بالغاً.",
        },
        {
          heading: "التطبيقات والصلاحيات",
          body: "عند تنزيل تطبيق، قد يطلب الاطلاع على موقعك أو صورك. اسأل شخصاً بالغاً قبل الموافقة على أي من ذلك.\n\nليست كل التطبيقات تحتاج هذه المعلومات للعمل. بعضها فقط يجمعها.",
        },
        {
          heading: "الأصدقاء على الإنترنت",
          body: "قد يقول شخص ما عبر الإنترنت إنه في نفس عمرك أو أنه يعرف أصدقاءك. من الصعب معرفة إذا كان هذا صحيحاً.\n\nتحقق دائماً مع شخص بالغ قبل التحدث مع شخص جديد على الإنترنت.",
        },
      ],
      remember: "لا بأس في أن تكون ودوداً على الإنترنت، لكن احتفظ بمعلوماتك الخاصة لنفسك.",
    },
  },
  scams: {
    en: {
      title: "Online Tricks",
      intro: "Some people online try to trick you into giving them money or information. Once you know their tricks, they are easy to spot.",
      steps: [
        {
          heading: "Common tricks to watch out for",
          body: "• 'You won a prize!', You never entered a competition\n• 'Your account is in danger!', They want you to panic\n• 'Send me money and I'll send you more back', This is always a scam\n• Someone very friendly online who then asks for help or money",
          tip: "If something sounds too amazing to be true, it is probably not true.",
        },
        {
          heading: "The pause rule",
          body: "When something surprising or scary arrives online, try this:\n\n1. Stop what you are doing\n2. Take three slow breaths\n3. Ask: Is this person asking for money or private info?\n4. If yes, tell a grown-up right away",
        },
        {
          heading: "It is always okay to leave",
          body: "You can always close a message, hang up a call, or close a website. You do not have to respond.\n\nA real person or real company will not be upset if you take time to check with a grown-up first.",
        },
      ],
      remember: "If something feels wrong, trust that feeling. Tell a grown-up, they want to help you.",
    },
    ar: {
      title: "الحيل الإلكترونية",
      intro: "بعض الناس على الإنترنت يحاولون خداعك لتعطيهم أموالاً أو معلومات. عندما تعرف حيلهم، يصبح من السهل اكتشافها.",
      steps: [
        {
          heading: "حيل شائعة يجب الانتباه إليها",
          body: "• 'فزت بجائزة!', أنت لم تشترك في أي مسابقة\n• 'حسابك في خطر!', يريدونك أن تشعر بالذعر\n• 'أرسل لي مالاً وسأرسل لك أكثر', هذه دائماً عملية احتيال\n• شخص ودود جداً على الإنترنت يطلب بعدها مساعدة أو مالاً",
          tip: "إذا بدا شيء ما رائعاً جداً لدرجة يصعب تصديقه، فمن المحتمل أنه غير حقيقي.",
        },
        {
          heading: "قاعدة التوقف",
          body: "عندما يصلك شيء مفاجئ أو مخيف على الإنترنت، جرّب هذا:\n\n1. توقف عما تفعله\n2. خذ ثلاثة أنفاس بطيئة\n3. اسأل: هل هذا الشخص يطلب مالاً أو معلومات خاصة؟\n4. إذا كانت الإجابة نعم، أخبر شخصاً بالغاً فوراً",
        },
        {
          heading: "المغادرة دائماً مقبولة",
          body: "يمكنك دائماً إغلاق رسالة أو إنهاء مكالمة أو إغلاق موقع إلكتروني. لست مضطراً للرد.\n\nالشخص الحقيقي أو الشركة الحقيقية لن تضايقها إذا أخذت وقتك للتحقق مع شخص بالغ أولاً.",
        },
      ],
      remember: "إذا شعرت أن شيئاً ما خطأ، ثق بهذا الشعور. أخبر شخصاً بالغاً، فهو يريد مساعدتك.",
    },
  },
  shopping: {
    en: {
      title: "Safe Shopping",
      intro: "Shopping online can be fun, but not every website is safe. Here is how to tell a safe website from a dangerous one.",
      steps: [
        {
          heading: "Signs of a safe website",
          body: "• It has a small padlock and starts with https://, this keeps what you type private, but it does not always mean the shop is real\n• The website has a real address and phone number\n• You have heard of it before, or a grown-up knows it\n• The safest way to shop online is together with a grown-up",
          tip: "When in doubt, ask a grown-up before buying anything online.",
        },
        {
          heading: "Prices that seem too low",
          body: "If a brand new game or phone costs almost nothing, it is probably a scam. The item will not arrive, or it will be broken and fake.\n\nIf the price seems impossible, it probably is.",
        },
        {
          heading: "How to pay safely",
          body: "• Always ask a grown-up before paying for anything online\n• Never give your card number to a website you are not sure about\n• Check your bank statement with a grown-up to see if all charges are correct",
        },
      ],
      remember: "Always ask a grown-up before buying anything online.",
    },
    ar: {
      title: "التسوق الآمن",
      intro: "التسوق عبر الإنترنت قد يكون ممتعاً، لكن ليس كل موقع إلكتروني آمناً. إليك كيف تميّز الموقع الآمن من الخطير.",
      steps: [
        {
          heading: "علامات الموقع الآمن",
          body: "• فيه رمز قفل صغير ويبدأ بـ https://, هذا يحافظ على خصوصية ما تكتبه، لكنه لا يعني دائماً أن المتجر حقيقي\n• الموقع له عنوان ورقم هاتف حقيقيان\n• سمعت عنه من قبل، أو يعرفه شخص بالغ\n• أأمن طريقة للتسوق عبر الإنترنت هي مع شخص بالغ",
          tip: "عند الشك، اسأل شخصاً بالغاً قبل شراء أي شيء عبر الإنترنت.",
        },
        {
          heading: "الأسعار التي تبدو منخفضة جداً",
          body: "إذا كانت لعبة أو هاتف جديد يكلف شيئاً قليلاً جداً، فمن المحتمل أنه احتيال. السلعة لن تصل، أو ستصل مكسورة ومزيفة.\n\nإذا بدا السعر مستحيلاً، فمن المحتمل أنه كذلك.",
        },
        {
          heading: "كيف تدفع بأمان",
          body: "• اسأل دائماً شخصاً بالغاً قبل الدفع لأي شيء عبر الإنترنت\n• لا تعطِ رقم بطاقتك لموقع لست متأكداً منه\n• راجع كشف حسابك البنكي مع شخص بالغ للتأكد من صحة كل المبالغ",
        },
      ],
      remember: "اسأل دائماً شخصاً بالغاً قبل شراء أي شيء عبر الإنترنت.",
    },
  },
  family: {
    en: {
      title: "Keeping Family Safe",
      intro: "You can help keep your whole family safe online, even younger brothers, sisters, or grandparents. Here is how.",
      steps: [
        {
          heading: "Talk about it together",
          body: "The best thing you can do is talk openly with your family about the internet.\n\nIf you see something strange or scary online, share it. You will not get in trouble. Everyone, even grown-ups, sometimes sees things that seem tricky.",
          tip: "A simple family rule: 'Before you click a link, show a grown-up.'",
        },
        {
          heading: "Help people who need it",
          body: "Older family members like grandparents might not know all the tricks scammers use. You can help them:\n\n• Tell them to check with you before clicking links\n• Help them check if a message looks real\n• Be patient and kind, they are learning too",
        },
        {
          heading: "If something goes wrong",
          body: "If someone in your family is tricked online:\n\n• Tell a grown-up straight away\n• Call the bank if money was involved\n• Do not feel embarrassed, it happens to a lot of people\n• You can report it in Qatar: 2347444",
        },
      ],
      remember: "Looking after each other is the strongest kind of safety. You are not alone.",
    },
    ar: {
      title: "حماية العائلة",
      intro: "يمكنك المساعدة في حماية عائلتك كلها على الإنترنت، حتى إخوتك الأصغر أو أجدادك. إليك الطريقة.",
      steps: [
        {
          heading: "تحدثوا معاً",
          body: "أفضل شيء يمكنك فعله هو التحدث بصراحة مع عائلتك عن الإنترنت.\n\nإذا رأيت شيئاً غريباً أو مخيفاً على الإنترنت، شاركه. لن تقع في مشكلة. الجميع، حتى الكبار، يرون أحياناً أشياء تبدو مشبوهة.",
          tip: "قاعدة عائلية بسيطة: 'قبل أن تضغط على رابط، أرِه لشخص بالغ.'",
        },
        {
          heading: "ساعد من يحتاج إلى المساعدة",
          body: "أفراد العائلة الأكبر سناً كالأجداد قد لا يعرفون كل الحيل التي يستخدمها المحتالون. يمكنك مساعدتهم:\n\n• أخبرهم بالتحقق معك قبل الضغط على أي رابط\n• ساعدهم في التحقق مما إذا كانت الرسالة تبدو حقيقية\n• كن صبوراً ولطيفاً، فهم يتعلمون أيضاً",
        },
        {
          heading: "إذا حدث شيء خطأ",
          body: "إذا وقع أحد أفراد عائلتك ضحية خداع على الإنترنت:\n\n• أخبر شخصاً بالغاً فوراً\n• اتصل بالبنك إذا تعلق الأمر بأموال\n• لا تشعر بالحرج، يحدث هذا لكثير من الناس\n• يمكن الإبلاغ في قطر: 2347444",
        },
      ],
      remember: "حماية بعضنا البعض هي أقوى أنواع الأمان. أنت لست وحدك.",
    },
  },
};

export default function CalmLessonPage() {
  const params  = useParams();
  const router  = useRouter();
  const topic   = params.topic as string;
  useTrackLesson(topic, "calm");
  const [lang, setLang] = useCalmLang();
  const isRtl = lang === "ar";

  const lesson = lessons[topic]?.[lang];

  if (!lesson) {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F9FF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}><HelpCircle size={64} color="#1A3A5C" strokeWidth={1.5} /></div>
          <p style={{ fontSize: "1.3rem", color: "#1A3A5C", marginBottom: "1.5rem" }}>
            {isRtl ? "لم يتم العثور على هذا الدرس." : "Lesson not found."}
          </p>
          <button
            onClick={() => router.push("/calm/lessons")}
            style={{ fontFamily: sans, fontSize: "1.05rem", padding: "0.75rem 1.6rem", cursor: "pointer", background: "#3B82F6", color: "#fff", border: "none", borderRadius: 12 }}
          >
            {isRtl ? "← العودة للدروس" : "← Go back to lessons"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F9FF", color: "#1A2233", direction: isRtl ? "rtl" : "ltr", fontFamily: sans }}>
      <CalmNav lang={lang} onLangChange={setLang} />

      <main style={{ padding: "110px 2rem 5rem", maxWidth: 740, margin: "0 auto" }}>

        {/* Back button */}
        <button
          onClick={() => router.push("/calm/lessons")}
          style={{
            fontFamily: sans,
            fontSize: "1rem",
            color: "#1D4ED8",
            background: "#DBEAFE",
            border: "2px solid #93C5FD",
            borderRadius: 12,
            padding: "0.5rem 1.2rem",
            cursor: "pointer",
            marginBottom: "2rem",
          }}
        >
          {isRtl ? "← العودة للدروس" : "← Back to lessons"}
        </button>

        {/* Icon + Title */}
        <div style={{ marginBottom: "0.8rem", display: "flex" }}>{topicIcons[topic]}</div>
        <h1 style={{
          fontFamily: cinzel,
          fontWeight: 700,
          fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
          color: "#1A3A5C",
          marginBottom: "1.2rem",
          lineHeight: 1.3,
        }}>
          {lesson.title}
        </h1>

        {/* Intro */}
        <p style={{
          fontSize: "1.2rem",
          color: "#334155",
          lineHeight: 1.8,
          marginBottom: "2.5rem",
          paddingInlineStart: "1.2rem",
          borderInlineStart: "4px solid #3B82F6",
        }}>
          {lesson.intro}
        </p>

        {/* Lesson steps */}
        {lesson.steps.map((step, i) => (
          <div key={i} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{
              fontFamily: cinzel,
              fontWeight: 700,
              fontSize: "1.3rem",
              color: "#1A3A5C",
              marginBottom: "0.8rem",
            }}>
              {step.heading}
            </h2>
            <div style={{
              fontSize: "1.15rem",
              color: "#334155",
              lineHeight: 1.9,
              whiteSpace: "pre-line",
            }}>
              {step.body}
            </div>
            {step.tip && (
              <div style={{
                marginTop: "1.2rem",
                background: "#DBEAFE",
                border: "2px solid #93C5FD",
                borderRadius: 14,
                padding: "1.2rem 1.5rem",
                display: "flex",
                gap: "0.8rem",
                alignItems: "flex-start",
              }}>
                <span style={{ flexShrink: 0, paddingTop: "0.15rem" }}><Lightbulb size={22} color="#1D4ED8" strokeWidth={1.5} /></span>
                <p style={{ fontSize: "1.1rem", color: "#1E3A5F", margin: 0, lineHeight: 1.7 }}>{step.tip}</p>
              </div>
            )}
          </div>
        ))}

        {/* Remember */}
        <div style={{
          background: "#F0FDF4",
          border: "2px solid #86EFAC",
          borderRadius: 20,
          padding: "2rem",
          marginTop: "1rem",
          textAlign: "center",
        }}>
          <div style={{ marginBottom: "0.7rem", display: "flex", justifyContent: "center" }}>
            <Star size={32} fill="#FBBF24" color="#FBBF24" strokeWidth={1.5} />
          </div>
          <div style={{
            fontFamily: cinzel,
            fontWeight: 700,
            fontSize: "0.9rem",
            letterSpacing: "0.08em",
            color: "#15803D",
            marginBottom: "0.7rem",
            textTransform: "uppercase",
          }}>
            {isRtl ? "تذكّر دائماً" : "ALWAYS REMEMBER"}
          </div>
          <p style={{
            fontSize: "1.25rem",
            color: "#14532D",
            margin: 0,
            lineHeight: 1.7,
            fontWeight: 600,
          }}>
            "{lesson.remember}"
          </p>
        </div>

        {/* Ask grown-up banner */}
        <div style={{
          marginTop: "2rem",
          background: "#FEF9C3",
          border: "2px solid #FDE047",
          borderRadius: 16,
          padding: "1.2rem 1.5rem",
          display: "flex",
          gap: "0.8rem",
          alignItems: "center",
        }}>
          <span style={{ flexShrink: 0 }}><UserRound size={28} color="#92400E" strokeWidth={1.5} /></span>
          <p style={{ fontSize: "1.1rem", color: "#713F12", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
            {isRtl
              ? "لست متأكداً من شيء؟ اسأل شخصاً بالغاً تثق به، دائماً."
              : "Not sure about something? Ask a grown-up you trust, always."}
          </p>
        </div>

      </main>

      <footer style={{
        textAlign: "center",
        padding: "2.5rem",
        fontSize: "1rem",
        color: "#64748B",
        background: "#F0F9FF",
        borderTop: "2px solid #BFDBFE",
      }}>
        {isRtl ? "مجلس الأمن السيبراني، قطر" : "CyberMajlis, Qatar"} ·{" "}
        <a href="/calm" style={{ color: "#1D7FCC", textDecoration: "none" }}>
          {isRtl ? "← الرئيسية" : "← Home"}
        </a>
      </footer>
    </div>
  );
}
