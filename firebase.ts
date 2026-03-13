// Update to Firebase v9 modular syntax
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: "job-crafting.firebaseapp.com",
  projectId: "job-crafting",
  storageBucket: "job-crafting.firebasestorage.app",
  messagingSenderId: "303950806430",
  appId: "1:303950806430:web:dda3acccb2fd1d6fdeea8f",
  measurementId: "G-0PVS7M6KQL"
};

if (!firebaseConfig.apiKey) {
  console.error("FIREBASE_API_KEY is not defined");
}

// Initialize Firebase only if not already initialized
const app = firebaseConfig.apiKey ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]) : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
