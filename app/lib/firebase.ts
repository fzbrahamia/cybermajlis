// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIKcqcisFquLO3CO-qe_yOKgripiEtWB8",
  authDomain: "cybermajlis-4014a.firebaseapp.com",
  projectId: "cybermajlis-4014a",
  storageBucket: "cybermajlis-4014a.firebasestorage.app",
  messagingSenderId: "1046861774107",
  appId: "1:1046861774107:web:bf7634c02ecd526f34a7be",
  measurementId: "G-G3DCNVC1JN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);