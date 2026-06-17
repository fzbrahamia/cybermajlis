import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web config. These are PUBLIC client identifiers (not secrets) — read
// from env in production, with the project defaults as a fallback so the app
// still runs locally. Real access control is enforced by Firestore Security
// Rules + Firebase Auth, not by hiding these values.
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY             || "AIzaSyDIKcqcisFquLO3CO-qe_yOKgripiEtWB8",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         || "cybermajlis-4014a.firebaseapp.com",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID          || "cybermajlis-4014a",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      || "cybermajlis-4014a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1046861774107",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID              || "1:1046861774107:web:bf7634c02ecd526f34a7be",
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID      || "G-G3DCNVC1JN",
};

// Reuse the existing app on hot-reload instead of re-initialising.
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);