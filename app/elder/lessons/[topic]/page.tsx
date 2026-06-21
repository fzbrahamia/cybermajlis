"use client";
import { useTrackLesson } from "@/hooks/useTrackView";
import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ElderNav from "@/components/elder/ElderNav";
import TtsButton from "@/components/elder/TtsButton";
import { useElderLang } from "@/hooks/useElderLang";

const cinzel = "'Cinzel', Georgia, serif";
const body   = "'Crimson Pro', Georgia, serif";

type Lesson = {
  title: string;
  intro: string;
  videoUrl?: string;           // path to a hosted MP4 (e.g. /lessons/vids/ransomware.mp4)
  videoLabel?: string;         // short caption shown above the video
  sections: { heading: string; body: string; tip?: string }[];
  remember: string;
};

const lessons: Record<string, { en: Lesson; ar: Lesson }> = {
  phishing: {
    en: {
      title: "Email & Message Scams",
      intro: "Scammers send fake messages pretending to be from banks, the government, or well-known companies. These messages are designed to trick you into handing over your personal details, or your money.",
      videoUrl: "/lessons/vids/virus.mp4",
      videoLabel: "Watch: How malware enters your device through a malicious link",
      sections: [
        {
          heading: "How to recognise a scam message",
          body: "Look for these warning signs:\n\n• It creates urgency: 'Your account will be closed!', 'Act within 24 hours!'\n• It asks for your password, ID number, or bank card details\n• The sender's email address looks strange or slightly misspelled\n• There is a link asking you to 'log in' or 'verify your account'",
          tip: "Legitimate banks and government offices will never ask for your password by message or phone call.",
        },
        {
          heading: "What to do if you receive one",
          body: "• Do not click any link in the message\n• Do not call any phone number listed in the message\n• Call your bank directly using the number on the back of your card\n• Forward the suspicious message to your family so they can check it\n• Delete the message",
        },
        {
          heading: "Real story from Qatar",
          body: "In 2024, thousands of people across the Gulf received WhatsApp messages claiming they had won a cash prize from a mobile network provider. The message asked them to click a link and enter their bank details to 'receive their prize'. Many lost significant amounts of money.\n\nIf you receive a message like this, close it immediately and tell a family member.",
        },
      ],
      remember: "You will never lose your account for ignoring a message. But you can lose everything by clicking on the wrong one.",
    },
    ar: {
      title: "الرسائل والبريد الاحتيالي",
      intro: "يرسل المحتالون رسائل مزيفة يتظاهرون فيها بأنهم من البنك أو الحكومة أو شركات معروفة. هذه الرسائل مصممة لخداعك وسرقة بياناتك الشخصية، أو أموالك.",
      videoUrl: "/lessons/vids/virus.mp4",
      videoLabel: "شاهد: كيف يدخل البرنامج الخبيث إلى جهازك عبر رابط ضار",
      sections: [
        {
          heading: "كيف تتعرف على رسالة احتيالية",
          body: "انتبه لهذه العلامات:\n\n• توحي بالإلحاح: 'سيُغلق حسابك!'، 'تصرف خلال 24 ساعة!'\n• تطلب كلمة مرورك أو رقم هويتك أو بيانات بطاقتك البنكية\n• عنوان المرسل يبدو غريباً أو فيه خطأ إملائي\n• يوجد رابط يطلب منك تسجيل الدخول أو التحقق من حسابك",
          tip: "البنوك والجهات الحكومية الحقيقية لن تطلب منك كلمة مرورك أبداً عبر الرسائل أو الهاتف.",
        },
        {
          heading: "ماذا تفعل إذا تلقيت مثل هذه الرسالة",
          body: "• لا تضغط على أي رابط في الرسالة\n• لا تتصل بأي رقم هاتف مذكور في الرسالة\n• اتصل ببنكك مباشرةً على الرقم المكتوب على ظهر بطاقتك\n• أرسل الرسالة المشبوهة لأحد أفراد عائلتك ليتحقق منها\n• احذف الرسالة",
        },
        {
          heading: "قصة حقيقية من منطقتنا",
          body: "في عام 2024، تلقى الآلاف في الخليج رسائل واتساب تدّعي أنهم فازوا بجائزة مالية من شركة اتصالات. طلبت منهم الرسالة الضغط على رابط وإدخال بيانات حساباتهم البنكية لـ'استلام الجائزة'. خسر كثيرون مبالغ كبيرة.\n\nإذا وصلتك رسالة من هذا النوع، أغلقها فوراً وأخبر أحد أفراد عائلتك.",
        },
      ],
      remember: "لن تخسر حسابك لأنك تجاهلت رسالة. لكنك قد تخسر كل شيء إن ضغطت على الرابط الخطأ.",
    },
  },
  passwords: {
    en: {
      title: "Protecting Your Accounts",
      intro: "Your password is like the key to your front door. A weak password is like leaving that door unlocked. The good news: creating a strong password is much easier than it sounds.",
      sections: [
        {
          heading: "What makes a password strong",
          body: "A strong password:\n• Is at least 12 characters long\n• Uses a mix of letters, numbers, and symbols\n• Is not your name, date of birth, or 'password123'\n\nThe easiest way: use a phrase you know well.\nFor example: My3GrandchildrenAreMyJoy!",
          tip: "A long phrase is always stronger than a short complicated one.",
        },
        {
          heading: "Never share your password",
          body: "Your password should only be known to you, not your children, not your doctor, and certainly not someone who called asking for it.\n\nIf anyone asks for your password, they are trying to steal from you.",
        },
        {
          heading: "Using the same password everywhere is dangerous",
          body: "If you use the same password on multiple websites and one of them is hacked, criminals can then access all your other accounts, including your email and your bank.\n\nAt minimum, have a different password for your email and your bank accounts.",
        },
      ],
      remember: "You would never give your house key to a stranger. Your password deserves the same protection.",
    },
    ar: {
      title: "حماية حساباتك",
      intro: "كلمة مرورك هي مفتاح بابك الرئيسي. كلمة المرور الضعيفة كأنك تتركه مفتوحاً. والخبر الجيد: إنشاء كلمة مرور قوية أسهل مما تتخيل.",
      sections: [
        {
          heading: "ما الذي يجعل كلمة المرور قوية",
          body: "كلمة المرور القوية:\n• طولها 12 حرفاً على الأقل\n• تجمع بين حروف وأرقام ورموز\n• لا تحتوي على اسمك أو تاريخ ميلادك أو '123456'\n\nأسهل طريقة: استخدم جملة تعرفها جيداً.\nمثال: أحفادي_الثلاثة_فرحتي_2025!",
          tip: "الجملة الطويلة دائماً أقوى من الكلمة القصيرة المعقدة.",
        },
        {
          heading: "لا تشارك كلمة مرورك أبداً",
          body: "كلمة مرورك يجب أن تعرفها أنت وحدك، ليس أبناؤك، وليس طبيبك، وبالتأكيد ليس من اتصل بك يطلبها.\n\nإذا طلب منك أحد كلمة مرورك، فهو يحاول سرقتك.",
        },
        {
          heading: "استخدام نفس كلمة المرور في كل مكان خطر",
          body: "إذا استخدمت نفس كلمة المرور في عدة مواقع وتعرّض أحدها للاختراق، يستطيع المجرمون الدخول على جميع حساباتك الأخرى، بما فيها بريدك وحسابك البنكي.\n\nعلى الأقل، اجعل كلمة مرور بريدك وحسابك البنكي مختلفة عن غيرها.",
        },
      ],
      remember: "لن تعطي مفتاح بيتك لغريب. كلمة مرورك تستحق نفس الحماية.",
    },
  },
  privacy: {
    en: {
      title: "Your Phone & Privacy",
      intro: "Your phone knows more about you than almost anyone, where you go, who you call, what you buy, and sometimes even what you say nearby. Understanding what it shares and with whom puts you back in control.",
      sections: [
        {
          heading: "What apps can access",
          body: "When you install an app, it may ask for permission to access:\n• Your location (where you are right now)\n• Your camera\n• Your contacts (everyone's phone numbers)\n• Your microphone\n\nSome apps need these for good reasons. Others collect this information to sell it.",
          tip: "Go to your phone Settings → Privacy → check each permission. Remove anything that seems unnecessary.",
        },
        {
          heading: "Free apps are never truly free",
          body: "If you are not paying for a product, your personal information is often the product being sold. Free apps frequently make money by collecting and selling data about your habits and interests.",
        },
        {
          heading: "What to do with suspicious messages",
          body: "Your phone should not be linked to unfamiliar accounts. Make sure:\n• Your Apple ID or Google account uses a strong password and recovery phone number\n• You are the only person who can unlock your phone\n• You do not leave your phone unattended in public",
        },
      ],
      remember: "Your phone is as personal as your wallet. Treat it with the same care.",
    },
    ar: {
      title: "هاتفك وخصوصيتك",
      intro: "هاتفك يعرف عنك أكثر من أي شخص تقريباً، أين تذهب، من تتصل به، ماذا تشتري، وأحياناً حتى ما تقوله بالقرب منه. فهم ما يشاركه ومع من يُعيد إليك السيطرة.",
      sections: [
        {
          heading: "ما يمكن للتطبيقات الوصول إليه",
          body: "عند تثبيت تطبيق، قد يطلب صلاحية للوصول إلى:\n• موقعك (أين أنت الآن)\n• كاميرتك\n• جهات اتصالك (أرقام هواتف الجميع)\n• الميكروفون\n\nبعض التطبيقات تحتاج هذا لأسباب مشروعة. وأخرى تجمع هذه المعلومات لبيعها.",
          tip: "اذهب إلى إعدادات هاتفك ← الخصوصية ← تحقق من كل صلاحية. أزل أي شيء يبدو غير ضروري.",
        },
        {
          heading: "التطبيقات المجانية ليست مجانية حقاً",
          body: "إذا كنت لا تدفع مقابل خدمة، فالغالب أن معلوماتك الشخصية هي ما يُباع. كثير من التطبيقات المجانية تجني المال بجمع وبيع بيانات عن عاداتك واهتماماتك.",
        },
        {
          heading: "احمِ حسابك على هاتفك",
          body: "تأكد من:\n• أن حساب آبل أو جوجل الخاص بك يستخدم كلمة مرور قوية ورقم هاتف للاسترداد\n• أنك الشخص الوحيد الذي يستطيع فتح هاتفك\n• عدم تركه دون رقابة في الأماكن العامة",
        },
      ],
      remember: "هاتفك شخصي كمحفظتك. تعامل معه بنفس الحرص.",
    },
  },
  scams: {
    en: {
      title: "Recognising Online Scams",
      intro: "Scammers are skilled at making their traps look real. But once you know the patterns, they become easy to spot, and easy to avoid.",
      videoUrl: "/lessons/vids/ransomware.mp4",
      videoLabel: "Watch: How ransomware works, the digital equivalent of a hostage demand",
      sections: [
        {
          heading: "The most common scam tricks",
          body: "• Prize scams: 'You have won!', you never entered a competition\n• Urgency scams: 'Your account will be locked in 2 hours!'\n• Impersonation: Someone claims to be a doctor, police officer, or government official\n• Romance scams: Someone online becomes very friendly very quickly, then asks for money\n• Investment scams: 'Guaranteed returns', nothing in investing is ever guaranteed",
        },
        {
          heading: "The 30-second rule",
          body: "When something unexpected arrives, a call, message, or email, wait 30 seconds before doing anything. Ask yourself:\n\n• Was I expecting this?\n• Does this feel too urgent?\n• Is someone asking me for money or personal details?\n\nIf any answer is yes, stop and call a family member first.",
          tip: "Scammers rely on panic. The moment you slow down, their trap loses its power.",
        },
        {
          heading: "It is okay to hang up",
          body: "If someone calls and you feel uncertain, hang up. You can always call back using a number you know and trust. A real bank or government office will not mind you verifying who they are.",
        },
      ],
      remember: "If it feels wrong, it probably is. Trust your instincts, they have kept you safe your whole life.",
    },
    ar: {
      title: "كيف تتعرف على عمليات الاحتيال",
      intro: "المحتالون بارعون في جعل فخاخهم تبدو حقيقية. لكن حين تعرف الأنماط، يصبح من السهل اكتشافها، وتجنّبها.",
      videoUrl: "/lessons/vids/ransomware.mp4",
      videoLabel: "شاهد: كيف يعمل برنامج الفدية، النسخة الرقمية من احتجاز الرهائن",
      sections: [
        {
          heading: "أكثر حيل الاحتيال شيوعاً",
          body: "• احتيال الجوائز: 'لقد فزت!', أنت لم تشترك في أي مسابقة\n• احتيال الإلحاح: 'سيُغلق حسابك خلال ساعتين!'\n• انتحال الشخصية: شخص يدّعي أنه طبيب أو ضابط شرطة أو مسؤول حكومي\n• احتيال العواطف: شخص غريب يصادقك بسرعة ثم يطلب مالاً\n• احتيال الاستثمار: 'أرباح مضمونة', لا شيء في الاستثمار مضمون أبداً",
        },
        {
          heading: "قاعدة الثلاثين ثانية",
          body: "حين يصلك شيء غير متوقع، مكالمة أو رسالة أو بريد، انتظر ثلاثين ثانية قبل أي فعل. اسأل نفسك:\n\n• هل كنت أتوقع هذا؟\n• هل يبدو الأمر ملحاً جداً؟\n• هل يطلب أحد مني مالاً أو بياناتي الشخصية؟\n\nإذا كانت إجابتك نعم على أي منها، توقف واتصل بأحد أفراد عائلتك أولاً.",
          tip: "المحتالون يعتمدون على الذعر. حين تتمهّل، يفقد فخّهم قوته.",
        },
        {
          heading: "إغلاق الخط حق مشروع",
          body: "إذا اتصل بك أحد وشعرت بالتردد، أغلق الخط. يمكنك دائماً الاتصال مجدداً على رقم تثق به. البنك الحقيقي أو الجهة الحكومية لن تمانع إن طلبت التحقق من هويتهم.",
        },
      ],
      remember: "إذا شعرت أن شيئاً ما خطأ، فالغالب أنه كذلك. ثق بغريزتك، فقد حمتك طوال حياتك.",
    },
  },
  shopping: {
    en: {
      title: "Safe Online Shopping",
      intro: "Online shopping is convenient, but not every website is trustworthy. Knowing what to look for before you enter your card details can save you a great deal of trouble.",
      sections: [
        {
          heading: "Signs a website is trustworthy",
          body: "• The address uses https:// and shows a padlock, this keeps your connection private, but on its own it does NOT prove the shop is honest (scam sites use it too)\n• The website has clear contact information and a physical address\n• It has realistic reviews, not all five stars with vague praise",
          tip: "When in doubt, use well-known websites you have heard of before, or ask a family member to help.",
        },
        {
          heading: "How to pay safely",
          body: "• Use a credit card when possible, it offers more protection than a debit card\n• Never transfer money directly to an individual seller\n• Check your bank statement regularly and call your bank immediately if you see a charge you do not recognise",
        },
        {
          heading: "Deals that are too good to be true",
          body: "A brand new iPhone for 200 QAR. A designer bag for 50 QAR. These are almost always scams. The item will either never arrive or arrive as a worthless fake.\n\nIf the price seems impossible, it is because it is.",
        },
      ],
      remember: "Shop only on websites you recognise, or that a family member has verified for you.",
    },
    ar: {
      title: "التسوق الآمن عبر الإنترنت",
      intro: "التسوق الإلكتروني مريح، لكن ليس كل موقع جديراً بالثقة. معرفة ما تبحث عنه قبل إدخال بيانات بطاقتك يوفر عليك الكثير من المشاكل.",
      sections: [
        {
          heading: "علامات الموقع الموثوق",
          body: "• عنوان الموقع يستخدم https:// ويظهر رمز قفل، هذا يحافظ على خصوصية اتصالك، لكنه وحده لا يثبت أن المتجر صادق (مواقع الاحتيال تستخدمه أيضاً)\n• الموقع يحتوي على معلومات تواصل واضحة وعنوان فعلي\n• التقييمات تبدو حقيقية، ليست كلها خمس نجوم بمدح مبهم",
          tip: "عند الشك، استخدم المواقع الكبيرة المعروفة التي سمعت بها من قبل، أو اطلب من أحد أفراد عائلتك المساعدة.",
        },
        {
          heading: "كيف تدفع بأمان",
          body: "• استخدم بطاقة الائتمان إن أمكن، توفر حماية أكبر من بطاقة الحساب\n• لا تحوّل المال مباشرةً إلى بائع فرد\n• راجع كشف حسابك البنكي بانتظام واتصل ببنكك فوراً إن رأيت مبلغاً لا تتذكره",
        },
        {
          heading: "العروض الخيالية دائماً مشبوهة",
          body: "آيفون جديد بـ200 ريال. حقيبة فاخرة بـ50 ريالاً. هذه في الغالب عمليات احتيال. إما أن البضاعة لن تصلك أبداً أو ستصل مزيفة لا قيمة لها.\n\nإذا بدا السعر مستحيلاً، فذلك لأنه كذلك.",
        },
      ],
      remember: "تسوّق فقط من مواقع تعرفها أو تحقق منها أحد أفراد عائلتك.",
    },
  },
  family: {
    en: {
      title: "Keeping Your Family Safe",
      intro: "As a parent or grandparent, you play a powerful role in your family's online safety. Here is how to protect your loved ones, and how to open the conversation with them.",
      sections: [
        {
          heading: "Talk openly about online dangers",
          body: "Many people, young and old, feel embarrassed to admit they were almost fooled by a scam. Create a safe environment where family members can share suspicious messages without judgement.\n\nA simple family rule: 'Before you click, show me.'",
          tip: "Children and teenagers are also targeted, by gaming scams, fake friendships, and inappropriate content.",
        },
        {
          heading: "Set up family safety features",
          body: "Most phones have parental control settings. Ask a younger family member to help you set these up for younger children.\n\nFor elderly family members: make sure someone checks in with them regularly about any unusual messages or calls they have received.",
        },
        {
          heading: "When something goes wrong",
          body: "If you or a family member has been scammed:\n• Stay calm\n• Call your bank immediately, they can often stop the transaction\n• Report it to the Ministry of Interior in Qatar: 2347444\n• Do not be embarrassed, scammers are professionals at deception",
        },
      ],
      remember: "Protecting each other is the strongest form of security. You do not need to face the digital world alone.",
    },
    ar: {
      title: "حماية عائلتك",
      intro: "بوصفك أباً أو أماً أو جداً، دورك في حماية عائلتك على الإنترنت قوي جداً. إليك كيف تحمي أحبائك، وكيف تفتح الحديث معهم.",
      sections: [
        {
          heading: "تحدّث بصراحة عن مخاطر الإنترنت",
          body: "كثير من الناس، صغاراً وكباراً، يشعرون بالحرج من الاعتراف بأنهم كادوا يقعون في فخ احتيال. أنشئ بيئة عائلية آمنة يستطيع فيها أفراد العائلة مشاركة الرسائل المشبوهة دون خوف من الحكم عليهم.\n\nقاعدة عائلية بسيطة: 'قبل أن تضغط، أرِني.'",
          tip: "الأطفال والمراهقون أيضاً يُستهدفون، عبر احتيال الألعاب وصداقات وهمية ومحتوى غير لائق.",
        },
        {
          heading: "فعّل ميزات الأمان العائلي",
          body: "معظم الهواتف لديها إعدادات رقابة أبوية. اطلب من أحد أفراد العائلة الشباب مساعدتك في ضبطها للأطفال الصغار.\n\nبالنسبة لكبار السن في العائلة: تأكد من أن أحداً يتابع معهم بانتظام إذا وصلتهم رسائل أو مكالمات غير عادية.",
        },
        {
          heading: "حين تقع مشكلة",
          body: "إذا تعرضت أنت أو أحد أفراد عائلتك لعملية احتيال:\n• تحلَّ بالهدوء\n• اتصل ببنكك فوراً، كثيراً ما يستطيعون إيقاف المعاملة\n• أبلغ وزارة الداخلية في قطر: 2347444\n• لا تشعر بالحرج، المحتالون محترفون في الخداع",
        },
      ],
      remember: "حماية بعضنا البعض هي أقوى أشكال الأمن. لست وحدك في مواجهة العالم الرقمي.",
    },
  },
};

export default function ElderLessonPage() {
  const params = useParams();
  const router = useRouter();
  const topic = params.topic as string;
  useTrackLesson(topic, "elder");
  const [lang, setLang] = useElderLang();
  const contentRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";

  const lesson = lessons[topic]?.[lang];
  if (!lesson) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.2rem" }}>Lesson not found.</p>
          <button onClick={() => router.push("/elder/lessons")} style={{ marginTop: "1rem", padding: "0.75rem 1.5rem", cursor: "pointer" }}>← Go back</button>
        </div>
      </div>
    );
  }

  const getPageText = () => {
    const root = contentRef.current;
    if (!root) return "";
    // Hide control buttons (Back, Read-aloud) so the TTS reads only the lesson,
    // then restore, synchronous, so there is no visible flicker.
    const skip = Array.from(root.querySelectorAll<HTMLElement>("[data-tts-skip]"));
    const prev = skip.map((el) => el.style.display);
    skip.forEach((el) => { el.style.display = "none"; });
    const text = root.innerText ?? "";
    skip.forEach((el, i) => { el.style.display = prev[i]; });
    return text;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", color: "#3e1316", direction: isRtl ? "rtl" : "ltr", fontFamily: body }}>
      <ElderNav lang={lang} onLangChange={setLang} />

      <main ref={contentRef} style={{ paddingTop: 110, padding: "110px 2rem 5rem", maxWidth: 760, margin: "0 auto" }}>
        {/* Back */}
        <button
          onClick={() => router.push("/elder/lessons")}
          data-tts-skip="true"
          style={{
            fontFamily: cinzel, fontSize: "0.8rem", letterSpacing: "0.08em",
            color: "#632024", background: "none", border: "1px solid rgba(99,32,36,0.3)",
            borderRadius: 999, padding: "0.45rem 1rem", cursor: "pointer", marginBottom: "2rem",
          }}
        >
          {isRtl ? "← العودة" : "← Back to lessons"}
        </button>

        <h1 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "clamp(1.7rem, 4vw, 2.6rem)", color: "#3e1316", marginBottom: "1rem", lineHeight: 1.3 }}>
          {lesson.title}
        </h1>

        <p style={{ fontSize: "1.2rem", color: "#5C4033", lineHeight: 1.8, marginBottom: "2rem", borderLeft: isRtl ? "none" : "4px solid #C5A57E", borderRight: isRtl ? "4px solid #C5A57E" : "none", paddingInlineStart: "1.2rem" }}>
          {lesson.intro}
        </p>

        {/* TTS */}
        <div style={{ marginBottom: "2.5rem" }}>
          <TtsButton getText={getPageText} lang={lang} />
        </div>

        {/* Video, uses the same MP4s as the main site */}
        {lesson.videoUrl && (
          <div style={{ marginBottom: "2.5rem" }}>
            {lesson.videoLabel && (
              <p style={{ fontFamily: cinzel, fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", color: "#8B2635", marginBottom: "0.7rem" }}>
                🎬 {lesson.videoLabel}
              </p>
            )}
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(62,19,22,0.15)", background: "#000" }}>
              <video
                src={lesson.videoUrl}
                controls
                style={{ width: "100%", maxHeight: 420, display: "block" }}
                preload="metadata"
              />
            </div>
          </div>
        )}

        {/* Content sections */}
        {lesson.sections.map((sec, i) => (
          <div key={i} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "1.35rem", color: "#3e1316", marginBottom: "0.8rem" }}>
              {sec.heading}
            </h2>
            <div style={{ fontSize: "1.1rem", color: "#4A3728", lineHeight: 1.85, whiteSpace: "pre-line" }}>
              {sec.body}
            </div>
            {sec.tip && (
              <div style={{
                marginTop: "1.2rem",
                background: "linear-gradient(135deg, #3e1316, #632024)",
                borderRadius: 14, padding: "1.2rem 1.4rem",
                display: "flex", gap: "0.8rem", alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: "1.05rem", color: "#E8D4BC", margin: 0, lineHeight: 1.7 }}>{sec.tip}</p>
              </div>
            )}
          </div>
        ))}

        {/* Remember */}
        <div style={{
          background: "#fff",
          border: "2px solid rgba(197,165,126,0.6)",
          borderRadius: 18,
          padding: "1.8rem 2rem",
          marginTop: "1rem",
          textAlign: "center",
        }}>
          <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", color: "#8B2635", marginBottom: "0.7rem" }}>
            {isRtl ? "تذكّر دائماً" : "ALWAYS REMEMBER"}
          </div>
          <p style={{ fontSize: "1.25rem", color: "#3e1316", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
            "{lesson.remember}"
          </p>
        </div>
      </main>
    </div>
  );
}
