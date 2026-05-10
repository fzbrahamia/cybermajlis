# CyberMajlis — المجلس السيبراني

An interactive, gamified cybersecurity education platform that teaches digital threats, defenses, and safe online practices through mini-games, lessons, and simulations. Supports English and Arabic (with full RTL layout).

---

## Features

- **16 Mini-Games** — Beginner to advanced challenges covering phishing, ransomware, network security, encryption, forensics, and more
- **Educational Lessons** — Story videos, live demos, posters, and quizzes for each cybersecurity topic
- **Live SOC Dashboard** — Real-time Security Operations Center simulation
- **XP & Progression System** — Earn experience points, level up (Beginner → Aware → Defender → Guardian), and compete on the leaderboard
- **Character Guides** — Four Qatari animal mascots (Falcon, Oryx, Fox, Arabian Horse) each with a unique security role
- **Multi-Language** — Full English and Arabic translations with RTL support
- **Guest Mode** — Play without an account; progress saved in session storage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + Framer Motion + Radix UI |
| Auth & DB | Firebase Auth + Firestore |
| i18n | next-intl (en / ar) |
| Icons | Lucide React |
| Security | bcryptjs (password hashing) |

---

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables (not implemented yet)

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
sdp-app-Hala/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── auth/                     # Sign up / Login
│   ├── dashboard/                # Lessons by category
│   ├── games/                    # 16 mini-games + simulations
│   ├── profile/                  # User profile & XP
│   ├── soc/                      # Live SOC dashboard
│   └── lib/                      # Firebase, game data, lesson data, auth helpers
├── components/                   # Shared UI components (NavBar, GameShell, Quiz, etc.)
├── hooks/
│   └── useLessonProgress.ts      # Firestore-backed progress tracking
├── i18n/
│   └── locales/
│       ├── en.json               # English translations
│       └── ar.json               # Arabic translations
└── public/                       # Videos, images, posters, captions
```

---

## Games

| # | Game | Difficulty | Topic |
|---|---|---|---|
| 1 | Souq Safe | ⭐ | Data protection |
| 2 | DM Detector | ⭐ | Suspicious messages |
| 3 | Chat Shield | ⭐ | Safe replies |
| 4 | Password Forge | ⭐ | Strong passwords |
| 5 | Ransom Rescue | ⭐ | Ransomware |
| 6 | Inbox Inspector | ⭐⭐ | Phishing emails |
| 7 | Virus Outbreak | ⭐⭐ | Malware quarantine |
| 8 | Worm Hunt | ⭐⭐ | Network worms |
| 9 | Lock & Key | ⭐⭐ | Encryption |
| 10 | Evidence Trail | ⭐⭐ | Digital forensics |
| 11 | Packet Rush | ⭐⭐ | Network traffic filtering |
| 12 | Phish Crafter | ⭐⭐ | Phishing analysis |
| 13 | Smart Trap | ⭐⭐ | IoT vulnerabilities |
| 14 | Defense Builder | ⭐⭐⭐ | Layered defenses |
| 15 | Hack Lab | ⭐⭐⭐ | Attacker mindset |
| 16 | Digital Detective | ⭐⭐⭐ | Cybercrime investigation |

---

## Characters

| Character | Role |
|---|---|
| Saqr (Falcon) | Threat Hunter |
| Oryx | Security Architect |
| Tha'lab (Fox) | Investigator |
| Hisan (Arabian Horse) | First Responder |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
