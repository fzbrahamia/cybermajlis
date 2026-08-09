// lib/firebase-admin.ts

// 1. Import the specific functions we need (this is the new v11+ way)
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// 2. Load your JSON key file (using 'require' avoids JSON import errors)
const serviceAccount = require('../firebase-admin-key.json');

// 3. Check if already initialized using getApps()
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// 4. Export the database instance, auth, and FieldValue
export const adminDb = getFirestore();
export const adminAuth = getAuth();
export { FieldValue };