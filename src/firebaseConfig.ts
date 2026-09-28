/// <reference types="vite/client" />

// Firebase Configuration for GovtBharat Portal
// Provides safe, resilient configuration with environment variable support for Vercel, Netlify, and local development.

export const defaultFirebaseConfig = {
  projectId: "direct-stone-dxctm",
  appId: "1:993642021377:web:98bdd8dc2f5d577e283600",
  apiKey: "AIzaSyBPobsHpRVFbi4PKiomkK-46hYr1ylhSec",
  authDomain: "direct-stone-dxctm.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-fastarcgovtresul-21912eff-20ad-4387-bde5-7cb20bed357a",
  storageBucket: "direct-stone-dxctm.firebasestorage.app",
  messagingSenderId: "993642021377",
  measurementId: "",
  recaptchaSiteKey: ""
};

const metaEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

// Defensive check: If the user accidentally set all env vars to their name "Vikaspatelaoc" or similar invalid strings, 
// we fallback to the default correct configuration provided by AI Studio.
const isEnvValid = metaEnv.VITE_FIREBASE_API_KEY && metaEnv.VITE_FIREBASE_API_KEY.startsWith('AIza');

export const firebaseConfig = {
  projectId: isEnvValid ? metaEnv.VITE_FIREBASE_PROJECT_ID : defaultFirebaseConfig.projectId,
  appId: isEnvValid ? metaEnv.VITE_FIREBASE_APP_ID : defaultFirebaseConfig.appId,
  apiKey: isEnvValid ? metaEnv.VITE_FIREBASE_API_KEY : defaultFirebaseConfig.apiKey,
  authDomain: isEnvValid ? metaEnv.VITE_FIREBASE_AUTH_DOMAIN : defaultFirebaseConfig.authDomain,
  firestoreDatabaseId: isEnvValid ? metaEnv.VITE_FIREBASE_DATABASE_ID : defaultFirebaseConfig.firestoreDatabaseId,
  storageBucket: isEnvValid ? metaEnv.VITE_FIREBASE_STORAGE_BUCKET : defaultFirebaseConfig.storageBucket,
  messagingSenderId: isEnvValid ? metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID : defaultFirebaseConfig.messagingSenderId,
  measurementId: defaultFirebaseConfig.measurementId,
  recaptchaSiteKey: defaultFirebaseConfig.recaptchaSiteKey
};

export default firebaseConfig;
