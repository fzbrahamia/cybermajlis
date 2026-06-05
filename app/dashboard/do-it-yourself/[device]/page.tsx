"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { globalLessonStyles, lessons, pageShellStyle } from "./lessonData";

export default function DeviceLessonPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.device as string;
  const lesson = lessons[deviceId];

  if (!lesson) {
    return (
      <main style={pageShellStyle}>
        <style>{globalLessonStyles}</style>
        <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
          <Link href="/dashboard/do-it-yourself" className="back-btn">
            ← Back to CyberMajlis Room
          </Link>
          <h1>Lesson not found</h1>
        </div>
      </main>
    );
  }

  const openMode = (mode: "video" | "reading" | "checklist") => {
    router.push(`/dashboard/do-it-yourself/${deviceId}/${mode}`);
  };

  return (
    <main style={pageShellStyle}>
      <style>{globalLessonStyles}</style>

      <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
        <header style={{ marginTop: "0.5rem", marginBottom: "2rem" }}>
          <Link href="/dashboard/do-it-yourself" className="back-btn">
            ← Back to CyberMajlis Room
          </Link>

          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              margin: 0,
              color: "#3e1316",
            }}
          >
            {lesson.title}
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: "#5C4033",
              lineHeight: 1.7,
              maxWidth: 760,
            }}
          >
            {lesson.description}
          </p>
        </header>

        <section>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1.4rem",
              marginBottom: "1rem",
            }}
          >
            Choose how you want to learn
          </h2>

          <div
            className="choice-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "1.2rem",
            }}
          >
            <button
              onClick={() => openMode("video")}
              className="lesson-card"
              style={{ background: "#fdf8f4", color: "#3e1316" }}
            >
              <div style={{ fontSize: "2.4rem", marginBottom: "0.7rem" }}>🎥</div>
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.5rem",
                  margin: "0 0 0.6rem",
                }}
              >
                Watch Video
              </h3>
              <p style={{ color: "#5C4033", lineHeight: 1.6, margin: 0 }}>
                Enjoy watching a focused video.
              </p>
            </button>

            <button
              onClick={() => openMode("reading")}
              className="lesson-card"
              style={{ background: "#fffaf6", color: "#3e1316" }}
            >
              <div style={{ fontSize: "2.4rem", marginBottom: "0.7rem" }}>📖</div>
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.5rem",
                  margin: "0 0 0.6rem",
                }}
              >
                Read the Steps
              </h3>
              <p style={{ color: "#5C4033", lineHeight: 1.6, margin: 0 }}>
                Enjoy learning by reading the written instructions.
              </p>
            </button>

            <button
              onClick={() => openMode("checklist")}
              className="lesson-card"
              style={{
                background: "linear-gradient(135deg, #3e1316, #632024)",
                color: "#E8D4BC",
              }}
            >
              <div style={{ fontSize: "2.4rem", marginBottom: "0.7rem" }}>✅</div>
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.5rem",
                  margin: "0 0 0.6rem",
                }}
              >
                Quick Checklist
              </h3>
              <p style={{ color: "rgba(232,212,188,0.78)", lineHeight: 1.6, margin: 0 }}>
                Open a checklist page and tick each action after completing it.
              </p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}


// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";

// type ReadingSection = {
//   title: string;
//   body?: string;
//   bullets?: string[];
// };

// type PlatformGuide = {
//   label: string;
//   title: string;
//   videoUrl: string;
//   steps: string[];
//   checklist: string[];
// };

// type Lesson = {
//   title: string;
//   description: string;
//   videoUrl: string;
//   readingTitle: string;
//   readingIntro: string;
//   readingSections: ReadingSection[];
//   checklist: string[];
//   platformGuides?: PlatformGuide[];
// };

// const lessons: Record<string, Lesson> = {
//   camera: {
//     title: "Smart Camera Security",
//     description: "Learn how to protect your home cameras from unwanted access.",
//     videoUrl: "/videos/camera-security.mp4",
//     readingTitle: "Protect your home cameras in 7 steps",
//     readingIntro:
//       "Home cameras are useful, but they must be secured because they can expose private spaces if someone gets access.",
//     readingSections: [
//       {
//         title: "1. Open the camera app",
//         body: "Open the camera app on your phone, choose the camera, then open its settings.",
//         bullets: [
//           "Settings",
//           "Security",
//           "Account",
//           "Privacy",
//           "Device Info",
//           "Firmware Update",
//         ],
//       },
//       {
//         title: "2. Change the camera password",
//         body: "Do not use weak passwords. Use a strong password that is different from your Wi-Fi password.",
//         bullets: ["Avoid: camera123", "Avoid: 12345678", "Avoid: admin123"],
//       },
//       {
//         title: "3. Change default login details",
//         body: "If the camera uses default login details such as admin/admin, or details printed on the device, change them immediately.",
//       },
//       {
//         title: "4. Update the camera",
//         body: "Open the update section and install the official update if available.",
//         bullets: ["Firmware Update", "Software Update", "Device Update"],
//       },
//       {
//         title: "5. Turn off remote access if you do not need it",
//         body: "If you do not need to view the camera from outside the home, turn off Remote Access. If you need it, use only the official app, a strong password, and two-factor authentication if supported.",
//       },
//       {
//         title: "6. Do not share camera links or QR codes",
//         body: "Avoid sharing camera invitation links, QR codes, or access codes unless you fully trust the person and can remove access later.",
//       },
//       {
//         title: "7. Review users and connected devices",
//         body: "In the camera app, check who has permission to access the camera. Remove any account or device you do not recognize. If possible, place the camera on a separate guest or IoT network.",
//       },
//     ],
//     checklist: [
//       "I opened the camera settings.",
//       "I changed the camera password.",
//       "I changed the default login details.",
//       "I updated the camera.",
//       "I reviewed remote access settings.",
//       "I did not share the camera link or QR code.",
//       "I placed the camera on a separate network if possible.",
//       "I reviewed users connected to the camera.",
//     ],
//   },

//   router: {
//     title: "Wi-Fi Security",
//     description:
//       "Choose your device first, then learn how to safely enter the router settings and protect your home Wi-Fi.",
//     videoUrl: "/videos/router-security.mp4",
//     readingTitle: "Protect your home Wi-Fi step by step",
//     readingIntro:
//       "The router is the digital gate for the smart home. The first part changes depending on the device you use, then the protection steps become the same for everyone.",
//     platformGuides: [
//       {
//         label: "Windows",
//         title: "Windows: find the router address",
//         videoUrl: "/videos/wifi-windows.mp4",
//         steps: [
//           "Make sure the laptop is connected to the home Wi-Fi.",
//           "Click Search and type cmd.",
//           "Open Command Prompt.",
//           "Type ipconfig and press Enter.",
//           "Find the Wi-Fi section.",
//           "Look for Default Gateway.",
//           "Use the number beside Default Gateway as the router address, for example 192.168.18.1.",
//           "Open Chrome or Edge and type the address in the address bar, not Google Search.",
//         ],
//         checklist: [
//           "I connected my Windows laptop to the home Wi-Fi.",
//           "I opened Command Prompt.",
//           "I typed ipconfig.",
//           "I found Default Gateway.",
//           "I opened the router address in the browser address bar.",
//         ],
//       },
//       {
//         label: "Mac",
//         title: "Mac: find the router address",
//         videoUrl: "/videos/wifi-mac.mp4",
//         steps: [
//           "Make sure the Mac is connected to the home Wi-Fi.",
//           "Open System Settings.",
//           "Choose Wi-Fi.",
//           "Click the connected network.",
//           "Choose Details.",
//           "Open TCP/IP.",
//           "Look for Router.",
//           "Use the number beside Router as the router address.",
//           "Open Safari, Chrome, or another browser and type the address in the address bar.",
//         ],
//         checklist: [
//           "I connected my Mac to the home Wi-Fi.",
//           "I opened Wi-Fi settings.",
//           "I opened Details for the connected network.",
//           "I found Router under TCP/IP.",
//           "I opened the router address in the browser address bar.",
//         ],
//       },
//       {
//         label: "iPhone",
//         title: "iPhone: find the router address",
//         videoUrl: "/videos/wifi-iphone.mp4",
//         steps: [
//           "Open Settings.",
//           "Open Wi-Fi.",
//           "Make sure the iPhone is connected to the home Wi-Fi.",
//           "Tap the information icon (i) beside the network name.",
//           "Scroll and look for Router.",
//           "Use the number beside Router as the router address.",
//           "Open Safari or Chrome.",
//           "Type the address in the address bar, for example http://192.168.18.1, then tap Go.",
//         ],
//         checklist: [
//           "I connected my iPhone to the home Wi-Fi.",
//           "I opened Wi-Fi settings.",
//           "I tapped the information icon beside the network.",
//           "I found Router.",
//           "I opened the router address in Safari or Chrome.",
//         ],
//       },
//       {
//         label: "Android",
//         title: "Android: find the router address",
//         videoUrl: "/videos/wifi-android.mp4",
//         steps: [
//           "Open Settings.",
//           "Open Network & Internet, Connections, or Wi-Fi depending on your phone.",
//           "Make sure the phone is connected to the home Wi-Fi.",
//           "Tap the connected Wi-Fi network.",
//           "Look for Network Details, Manage Router, Gateway, or Router.",
//           "Use the number beside Gateway or Router as the router address.",
//           "If the address does not appear, try common addresses such as 192.168.1.1, 192.168.0.1, or 192.168.18.1.",
//           "You can also use the internet provider app if available.",
//           "Open Chrome and type the router address in the address bar.",
//         ],
//         checklist: [
//           "I connected my Android phone to the home Wi-Fi.",
//           "I opened Wi-Fi network details.",
//           "I looked for Gateway or Router.",
//           "I tried common router addresses if the address was not shown.",
//           "I opened the router address in Chrome.",
//         ],
//       },
//     ],
//     readingSections: [
//       {
//         title: "After opening the router page: log in safely",
//         body: "The router username and password are not the same as the Wi-Fi password. They are used to enter the router control panel.",
//         bullets: [
//           "Check the sticker behind the router.",
//           "Check the installation card or paper.",
//           "Check the internet provider app.",
//           "Check messages from your internet provider.",
//           "Contact support if you cannot find them.",
//           "Do not share these login details with anyone.",
//         ],
//       },
//       {
//         title: "1. Change the Wi-Fi network name",
//         body: "Look for SSID, Wi-Fi Name, or Network Name. Use a general name that does not reveal your family name, personal name, or router model.",
//         bullets: [
//           "Not recommended: HamadFamily_Router123",
//           "Better: HomeNet",
//           "A general name gives less information to people nearby.",
//         ],
//       },
//       {
//         title: "2. Use a strong Wi-Fi password",
//         body: "Look for Wi-Fi Password, Wireless Password, WPA Key, or Pre-Shared Key. Use a long password with uppercase letters, lowercase letters, numbers, and symbols.",
//         bullets: [
//           "Avoid: 12345678",
//           "Avoid: qatar123",
//           "Avoid: password",
//           "Do not use your name, phone number, birthday, or easy words.",
//         ],
//       },
//       {
//         title: "3. Enable strong security mode",
//         body: "Look for Security Mode, Encryption, or Authentication. Choose WPA2-AES or WPA3 if available.",
//         bullets: [
//           "Avoid Open networks with no password.",
//           "Avoid old protection options such as WEP.",
//           "WPA2-AES or WPA3 are safer choices.",
//           "The lock icon beside the Wi-Fi name means the network uses password protection and encryption.",
//         ],
//       },
//       {
//         title: "4. Review connected devices",
//         body: "Look for Connected Devices, Device List, Clients, Online Devices, or Attached Devices. If you find an unknown device, ask your family first. If it is still unknown, change the Wi-Fi password.",
//         bullets: [
//           "Examples: Hamad-iPhone, LivingRoom-TV, Home-Camera, Laptop.",
//           "If you see Unknown Device, do not panic.",
//           "Check if it belongs to someone at home.",
//           "If nobody recognizes it, change the Wi-Fi password so only trusted devices reconnect.",
//         ],
//       },
//       {
//         title: "5. Close the guest network if you do not need it",
//         body: "Look for Guest Network, Guest Wi-Fi, or Guest SSID. If it is open with no password, turn it off or add a strong password.",
//         bullets: [
//           "Turn Guest Network off if you do not use it.",
//           "If you need it, protect it with a strong password.",
//           "Do not leave guest Wi-Fi open for anyone nearby.",
//         ],
//       },
//       {
//         title: "6. Do not change advanced internet settings",
//         body: "Some settings can disconnect the internet if changed incorrectly. Focus only on Wi-Fi name, Wi-Fi password, security mode, connected devices, and guest network.",
//         bullets: [
//           "Do not change WAN if you do not understand it.",
//           "Do not change PPPoE if you do not understand it.",
//           "Do not change VLAN if you do not understand it.",
//           "Do not change DNS, LAN IP, DHCP, or Factory Reset unless you know exactly what you are doing.",
//           "Before changing anything, take a photo of the current settings.",
//           "After changing Wi-Fi name or password, press Save or Apply and reconnect your devices using the new password.",
//         ],
//       },
//     ],
//     checklist: [
//       "I logged in using the router admin details, not the Wi-Fi password.",
//       "I changed the Wi-Fi name to a general name.",
//       "I used a strong Wi-Fi password.",
//       "I enabled WPA2-AES or WPA3 if available.",
//       "I reviewed the connected devices list.",
//       "I closed the guest network or protected it with a strong password.",
//       "I did not change advanced internet settings I do not understand.",
//     ],
//   },

//   tv: {
//     title: "Smart TV Security",
//     description: "Learn how to protect your smart TV, apps, and connected accounts.",
//     videoUrl: "/videos/tv-security.mp4",
//     readingTitle: "Protect your smart TV in 6 steps",
//     readingIntro:
//       "Smart TVs connect to the internet, accounts, apps, and sometimes microphones or nearby devices. These steps help you reduce privacy and security risks.",
//     readingSections: [
//       {
//         title: "1. Open the TV settings",
//         body: "Go to the settings menu and review the important sections.",
//         bullets: ["Settings", "System", "Network", "Apps", "Privacy", "Accounts"],
//       },
//       {
//         title: "2. Update the TV system",
//         body: "Look for one of these update options. If an official update is available, install it.",
//         bullets: ["Software Update", "System Update", "Update System"],
//       },
//       {
//         title: "3. Download apps from the official store only",
//         body: "Do not install apps from unknown sources. Delete any app that looks risky or unnecessary.",
//         bullets: ["Apps you do not recognize", "Apps you do not use", "Apps you do not trust"],
//       },
//       {
//         title: "4. Review signed-in accounts",
//         body: "Open the accounts section and check which accounts are currently signed in.",
//         bullets: [
//           "Who is signed in?",
//           "Are there old accounts?",
//           "Do you really need all these accounts?",
//           "Sign out from any account you do not need.",
//         ],
//       },
//       {
//         title: "5. Review app permissions",
//         body: "Check what each app can access and turn off anything unnecessary.",
//         bullets: ["Microphone", "Camera", "Location", "Nearby devices"],
//       },
//       {
//         title: "6. Close open casting or pairing",
//         body: "If your TV allows nearby devices to cast or connect automatically, change the setting so connection requires your approval, or turn it off if you do not need it.",
//       },
//     ],
//     checklist: [
//       "I opened the TV settings and found System, Network, Apps, Privacy, and Accounts.",
//       "I checked for an official TV system/software update and installed it if available.",
//       "I removed apps I do not recognize, do not use, or do not trust.",
//       "I confirmed that apps are installed only from the official TV app store.",
//       "I reviewed signed-in accounts and signed out from accounts I do not need.",
//       "I reviewed app permissions such as microphone, camera, location, and nearby devices.",
//       "I changed casting/pairing so it requires my approval, or turned it off if not needed.",
//     ],
//   },

//   lock: {
//     title: "Smart Lock Security",
//     description: "Learn how to protect your smart door lock and access codes.",
//     videoUrl: "/videos/lock-security.mp4",
//     readingTitle: "Protect your smart door lock in 7 steps",
//     readingIntro:
//       "A smart lock protects the entrance to your home, so you should secure the app, access codes, and connected users.",
//     readingSections: [
//       {
//         title: "1. Open the smart lock app",
//         body: "Open the official smart lock app, choose your lock, then open settings.",
//         bullets: ["Settings", "Users", "Access Codes", "Security", "Activity Log", "Firmware Update"],
//       },
//       {
//         title: "2. Change weak PIN codes",
//         body: "Avoid simple codes like 0000, 1234, birthdays, or phone-number endings. Use a code that is hard to guess.",
//       },
//       {
//         title: "3. Remove unnecessary users",
//         body: "Review who has access to the lock and remove old users, temporary guests, or unknown accounts.",
//       },
//       {
//         title: "4. Use temporary codes for visitors",
//         body: "If someone needs short-term access, create a temporary code instead of sharing your main code.",
//       },
//       {
//         title: "5. Turn on two-factor authentication",
//         body: "If the lock app supports two-factor authentication, enable it for the account that controls the lock.",
//       },
//       {
//         title: "6. Update the smart lock",
//         body: "Check for official firmware or software updates in the app and install them if available.",
//       },
//       {
//         title: "7. Review activity history",
//         body: "Check the activity log regularly to see when the door was unlocked and by which user or code.",
//       },
//     ],
//     checklist: [
//       "I opened the smart lock settings.",
//       "I changed weak or default PIN codes.",
//       "I removed users I do not recognize or no longer need.",
//       "I used temporary codes for visitors instead of sharing my main code.",
//       "I enabled two-factor authentication if available.",
//       "I checked for smart lock updates.",
//       "I reviewed the lock activity history.",
//     ],
//   },

//   phone: {
//     title: "Phone Security",
//     description: "Learn how to protect your phone from suspicious links and scams.",
//     videoUrl: "/videos/phone-security.mp4",
//     readingTitle: "Protect your phone in 5 steps",
//     readingIntro:
//       "Your phone contains accounts, messages, photos, and banking access, so small security habits matter.",
//     readingSections: [
//       {
//         title: "1. Avoid suspicious links",
//         body: "Do not open links from unknown senders or messages that create pressure or fear.",
//       },
//       {
//         title: "2. Use screen lock",
//         body: "Use a strong passcode, fingerprint, or face unlock.",
//       },
//       {
//         title: "3. Keep apps updated",
//         body: "Update apps and your phone system regularly.",
//       },
//       {
//         title: "4. Enable two-factor authentication",
//         body: "Turn on two-factor authentication for important accounts.",
//       },
//       {
//         title: "5. Report suspicious messages",
//         body: "Use CyberMajlis to report suspicious messages or numbers when needed.",
//       },
//     ],
//     checklist: [
//       "I avoided opening suspicious links.",
//       "I enabled a strong screen lock.",
//       "I updated my apps and phone system.",
//       "I enabled two-factor authentication for important accounts.",
//       "I reported suspicious messages in CyberMajlis when needed.",
//     ],
//   },
// };

// export default function DeviceLessonPage() {
//   const params = useParams();
//   const deviceId = params.device as string;
//   const lesson = lessons[deviceId];

//   const [mode, setMode] = useState<"choice" | "video" | "reading" | "checklist">("choice");
//   const [checked, setChecked] = useState<boolean[]>([]);
//   const [activePlatform, setActivePlatform] = useState(0);

//   const activePlatformGuide = lesson?.platformGuides?.[activePlatform];
//   const checklistItems = activePlatformGuide
//     ? [...activePlatformGuide.checklist, ...lesson.checklist]
//     : lesson?.checklist || [];
//   const checklistStorageKey = activePlatformGuide
//     ? `diy-checklist-${deviceId}-${activePlatformGuide.label}`
//     : `diy-checklist-${deviceId}`;

//   useEffect(() => {
//     if (!lesson) return;

//     const saved = localStorage.getItem(checklistStorageKey);

//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);

//         if (Array.isArray(parsed)) {
//           const fixedLengthChecked = checklistItems.map((_, index) => Boolean(parsed[index]));
//           setChecked(fixedLengthChecked);
//           return;
//         }
//       } catch {
//         // If saved data is broken, reset below.
//       }
//     }

//     setChecked(checklistItems.map(() => false));
//   }, [deviceId, lesson, checklistStorageKey, checklistItems.length]);

//   useEffect(() => {
//     if (!lesson || checked.length !== checklistItems.length) return;
//     localStorage.setItem(checklistStorageKey, JSON.stringify(checked));
//   }, [checked, checklistStorageKey, checklistItems.length, lesson]);

//   if (!lesson) {
//     return (
//       <main
//         style={{
//           minHeight: "100vh",
//           background: "#E3DAC9",
//           padding: "2rem",
//           color: "#3e1316",
//           fontFamily: "'Crimson Pro', Georgia, serif",
//         }}
//       >
//         <h1>Lesson not found</h1>
//       </main>
//     );
//   }

//   const completed = checked.filter(Boolean).length;
//   const progress = checklistItems.length
//     ? Math.round((completed / checklistItems.length) * 100)
//     : 0;

//   const renderPlatformTabs = () => {
//     if (!lesson.platformGuides) return null;

//     return (
//       <div className="platform-tabs">
//         {lesson.platformGuides.map((guide, index) => (
//           <button
//             key={guide.label}
//             onClick={() => setActivePlatform(index)}
//             className={`platform-tab ${activePlatform === index ? "active" : ""}`}
//           >
//             {guide.label}
//           </button>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <main
//       style={{
//         minHeight: "100vh",
//         background:
//           "radial-gradient(circle at top left, rgba(99,32,36,0.12), transparent 35%), #E3DAC9",
//         padding: "2rem",
//         color: "#3e1316",
//         fontFamily: "'Crimson Pro', Georgia, serif",
//       }}
//     >
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

//         .lesson-card {
//           border-radius: 24px;
//           border: 1px solid rgba(99,32,36,0.16);
//           padding: 2rem;
//           cursor: pointer;
//           transition: transform 0.25s ease, box-shadow 0.25s ease;
//           text-align: left;
//           min-height: 230px;
//         }

//         .lesson-card:hover {
//           transform: translateY(-8px);
//           box-shadow: 0 24px 60px rgba(99,32,36,0.22);
//         }

//         .back-btn {
//           border: none;
//           background: rgba(99,32,36,0.1);
//           color: #632024;
//           padding: 0.65rem 1rem;
//           border-radius: 999px;
//           cursor: pointer;
//           font-weight: 700;
//         }

//         .check-item {
//           display: flex;
//           gap: 0.9rem;
//           align-items: flex-start;
//           padding: 1rem;
//           border-radius: 16px;
//           background: white;
//           border: 1px solid rgba(99,32,36,0.1);
//           cursor: pointer;
//           transition: 0.2s ease;
//         }

//         .check-item.done {
//           background: rgba(197,165,126,0.28);
//           border-color: rgba(99,32,36,0.18);
//         }

//         .check-item input {
//           margin-top: 0.25rem;
//           accent-color: #632024;
//           transform: scale(1.2);
//         }

//         .reading-step {
//           background: white;
//           border: 1px solid rgba(99,32,36,0.1);
//           border-radius: 18px;
//           padding: 1.2rem;
//         }

//         .reading-step h3 {
//           font-family: 'Cinzel', serif;
//           margin: 0 0 0.6rem;
//           color: #3e1316;
//         }

//         .reading-step p {
//           color: #5C4033;
//           line-height: 1.7;
//           margin: 0;
//         }

//         .reading-step ul {
//           margin: 0.7rem 0 0;
//           color: #5C4033;
//           line-height: 1.8;
//         }

//         .platform-tabs {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 0.6rem;
//           margin: 1.2rem 0;
//         }

//         .platform-tab {
//           border: 1px solid rgba(99,32,36,0.18);
//           background: white;
//           color: #632024;
//           padding: 0.65rem 1rem;
//           border-radius: 999px;
//           cursor: pointer;
//           font-weight: 700;
//         }

//         .platform-tab.active {
//           background: linear-gradient(135deg, #3e1316, #632024);
//           color: #E8D4BC;
//           border-color: rgba(197,165,126,0.45);
//         }

//         @media (max-width: 900px) {
//           .choice-grid {
//             grid-template-columns: 1fr !important;
//           }
//         }

//         @media (max-width: 700px) {
//           main {
//             padding: 1rem !important;
//           }
//         }
//       `}</style>

//       <div style={{ maxWidth: 1050, margin: "0 auto", paddingTop: "5rem" }}>
//         <header style={{ marginTop: "0.5rem", marginBottom: "2rem" }}>
//           <Link
//             href="/dashboard/do-it-yourself"
//             style={{
//               display: "inline-flex",
//               fontFamily: "'Cinzel', serif",
//               fontSize: "0.75rem",
//               letterSpacing: "0.08em",
//               textTransform: "uppercase",
//               color: "#E8D4BC",
//               background: "linear-gradient(135deg, #3e1316, #632024)",
//               border: "1px solid rgba(197,165,126,0.45)",
//               padding: "0.7rem 1.1rem",
//               borderRadius: 999,
//               marginBottom: "1.25rem",
//               textDecoration: "none",
//               fontWeight: 700,
//               boxShadow: "0 8px 24px rgba(62,19,22,0.22)",
//             }}
//           >
//             ← Back to CyberMajlis Room
//           </Link>

//           <h1
//             style={{
//               fontFamily: "'Cinzel', serif",
//               fontSize: "clamp(2rem, 5vw, 3.8rem)",
//               margin: 0,
//               color: "#3e1316",
//             }}
//           >
//             {lesson.title}
//           </h1>

//           <p
//             style={{
//               fontSize: "1.15rem",
//               color: "#5C4033",
//               lineHeight: 1.7,
//               maxWidth: 760,
//             }}
//           >
//             {lesson.description}
//           </p>
//         </header>

//         {mode === "choice" && (
//           <section>
//             <h2
//               style={{
//                 fontFamily: "'Cinzel', serif",
//                 fontSize: "1.4rem",
//                 marginBottom: "1rem",
//               }}
//             >
//               Choose how you want to learn
//             </h2>

//             <div
//               className="choice-grid"
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
//                 gap: "1.2rem",
//               }}
//             >
//               <button
//                 onClick={() => setMode("video")}
//                 className="lesson-card"
//                 style={{
//                   background: "#fdf8f4",
//                   color: "#3e1316",
//                 }}
//               >
//                 <div style={{ fontSize: "2.4rem", marginBottom: "0.7rem" }}>🎥</div>
//                 <h3
//                   style={{
//                     fontFamily: "'Cinzel', serif",
//                     fontSize: "1.5rem",
//                     margin: "0 0 0.6rem",
//                   }}
//                 >
//                   Watch Video
//                 </h3>
//                 <p style={{ color: "#5C4033", lineHeight: 1.6, margin: 0 }}>
//                   Choose your device and watch the matching Wi-Fi lesson.
//                 </p>
//               </button>

//               <button
//                 onClick={() => setMode("reading")}
//                 className="lesson-card"
//                 style={{
//                   background: "#fffaf6",
//                   color: "#3e1316",
//                 }}
//               >
//                 <div style={{ fontSize: "2.4rem", marginBottom: "0.7rem" }}>📖</div>
//                 <h3
//                   style={{
//                     fontFamily: "'Cinzel', serif",
//                     fontSize: "1.5rem",
//                     margin: "0 0 0.6rem",
//                   }}
//                 >
//                   Read the Steps
//                 </h3>
//                 <p style={{ color: "#5C4033", lineHeight: 1.6, margin: 0 }}>
//                   Choose your device and read the full step-by-step instructions.
//                 </p>
//               </button>

//               <button
//                 onClick={() => setMode("checklist")}
//                 className="lesson-card"
//                 style={{
//                   background: "linear-gradient(135deg, #3e1316, #632024)",
//                   color: "#E8D4BC",
//                 }}
//               >
//                 <div style={{ fontSize: "2.4rem", marginBottom: "0.7rem" }}>✅</div>
//                 <h3
//                   style={{
//                     fontFamily: "'Cinzel', serif",
//                     fontSize: "1.5rem",
//                     margin: "0 0 0.6rem",
//                   }}
//                 >
//                   Quick Checklist
//                 </h3>
//                 <p style={{ color: "rgba(232,212,188,0.78)", lineHeight: 1.6, margin: 0 }}>
//                   Choose your device and tick each action after completing it.
//                 </p>
//               </button>
//             </div>
//           </section>
//         )}

//         {mode === "video" && (
//           <section
//             style={{
//               background: "#fdf8f4",
//               borderRadius: 24,
//               padding: "1.5rem",
//               border: "1px solid rgba(99,32,36,0.15)",
//               boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
//             }}
//           >
//             <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
//               <button className="back-btn" onClick={() => setMode("choice")}>
//                 ← Back to options
//               </button>
//             </div>

//             <h2
//               style={{
//                 fontFamily: "'Cinzel', serif",
//                 marginTop: "1.2rem",
//               }}
//             >
//               Watch Video
//             </h2>

//             {renderPlatformTabs()}

//             {activePlatformGuide && (
//               <p style={{ color: "#5C4033", lineHeight: 1.7 }}>
//                 Showing video lesson for: <strong>{activePlatformGuide.label}</strong>
//               </p>
//             )}

//             <div
//               style={{
//                 marginTop: "1rem",
//                 borderRadius: 20,
//                 overflow: "hidden",
//                 background: "#2a0d0f",
//               }}
//             >
//               <video controls style={{ width: "100%", display: "block" }}>
//                 <source src={activePlatformGuide?.videoUrl || lesson.videoUrl} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>
//             </div>
//           </section>
//         )}

//         {mode === "reading" && (
//           <section
//             style={{
//               background: "#fdf8f4",
//               borderRadius: 24,
//               padding: "1.5rem",
//               border: "1px solid rgba(99,32,36,0.15)",
//               boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
//             }}
//           >
//             <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
//               <button className="back-btn" onClick={() => setMode("choice")}>
//                 ← Back to options
//               </button>
//             </div>

//             <h2
//               style={{
//                 fontFamily: "'Cinzel', serif",
//                 marginTop: "1.2rem",
//                 marginBottom: "0.5rem",
//               }}
//             >
//               {lesson.readingTitle}
//             </h2>

//             <p style={{ color: "#5C4033", lineHeight: 1.7 }}>
//               {lesson.readingIntro}
//             </p>

//             {renderPlatformTabs()}

//             {activePlatformGuide && (
//               <article className="reading-step" style={{ marginBottom: "1rem" }}>
//                 <h3>{activePlatformGuide.title}</h3>
//                 <ul>
//                   {activePlatformGuide.steps.map((step, index) => (
//                     <li key={index}>{step}</li>
//                   ))}
//                 </ul>
//               </article>
//             )}

//             <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.2rem" }}>
//               {lesson.readingSections.map((section, index) => (
//                 <article key={index} className="reading-step">
//                   <h3>{section.title}</h3>
//                   {section.body && <p>{section.body}</p>}
//                   {section.bullets && (
//                     <ul>
//                       {section.bullets.map((bullet, bulletIndex) => (
//                         <li key={bulletIndex}>{bullet}</li>
//                       ))}
//                     </ul>
//                   )}
//                 </article>
//               ))}
//             </div>
//           </section>
//         )}

//         {mode === "checklist" && (
//           <section
//             style={{
//               background: "#fdf8f4",
//               borderRadius: 24,
//               padding: "1.5rem",
//               border: "1px solid rgba(99,32,36,0.15)",
//               boxShadow: "0 20px 55px rgba(99,32,36,0.16)",
//             }}
//           >
//             <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
//               <button className="back-btn" onClick={() => setMode("choice")}>
//                 ← Back to options
//               </button>
//             </div>

//             <h2
//               style={{
//                 fontFamily: "'Cinzel', serif",
//                 marginTop: "1.2rem",
//                 marginBottom: "0.5rem",
//               }}
//             >
//               Quick Checklist
//             </h2>

//             {renderPlatformTabs()}

//             <p style={{ color: "#5C4033" }}>
//               Complete the steps for your selected device, then continue with the shared router protection steps.
//             </p>

//             <div
//               style={{
//                 height: 9,
//                 background: "rgba(99,32,36,0.12)",
//                 borderRadius: 999,
//                 overflow: "hidden",
//                 margin: "1rem 0 0.5rem",
//               }}
//             >
//               <div
//                 style={{
//                   height: "100%",
//                   width: `${progress}%`,
//                   background: "linear-gradient(90deg, #632024, #c5a57e)",
//                   transition: "width 0.25s ease",
//                 }}
//               />
//             </div>

//             <p
//               style={{
//                 color: "#8B2635",
//                 fontWeight: 700,
//                 marginBottom: "1.2rem",
//               }}
//             >
//               {completed}/{checklistItems.length} completed
//             </p>

//             <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
//               {checklistItems.map((step, index) => (
//                 <label
//                   key={index}
//                   className={`check-item ${checked[index] ? "done" : ""}`}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={checked[index] || false}
//                     onChange={() => {
//                       setChecked((prev) => {
//                         const fixed = checklistItems.map((_, i) => Boolean(prev[i]));
//                         fixed[index] = !fixed[index];
//                         return fixed;
//                       });
//                     }}
//                   />
//                   <span
//                     style={{
//                       color: "#3e1316",
//                       lineHeight: 1.6,
//                       textDecoration: checked[index] ? "line-through" : "none",
//                     }}
//                   >
//                     {step}
//                   </span>
//                 </label>
//               ))}
//             </div>

//             {completed === checklistItems.length && (
//               <div
//                 style={{
//                   marginTop: "1.2rem",
//                   padding: "1rem",
//                   borderRadius: 16,
//                   background: "rgba(34,197,94,0.12)",
//                   border: "1px solid rgba(34,197,94,0.25)",
//                   color: "#14532d",
//                   fontWeight: 700,
//                 }}
//               >
//                 Great job! You completed this security checklist.
//               </div>
//             )}
//           </section>
//         )}
//       </div>
//     </main>
//   );
// }

