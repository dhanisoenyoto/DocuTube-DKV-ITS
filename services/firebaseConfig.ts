import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// =========================================================================
// KONFIGURASI FIREBASE DOCUTUBE DKV ITS
// =========================================================================

const firebaseConfig = {
  apiKey: "AIzaSyDqkIXntNeclWgY-XSaH8U7hVroG-Gjrek",
  authDomain: "filmdokumenter2025-65628.firebaseapp.com",
  projectId: "filmdokumenter2025-65628",
  storageBucket: "filmdokumenter2025-65628.firebasestorage.app",
  messagingSenderId: "1004961982826",
  appId: "1:1004961982826:web:1787ed34a044946bda1d13",
  measurementId: "G-1L5KSQK8GH"
};

// =========================================================================

// System Check
const isConfigured = !!firebaseConfig.projectId && !!firebaseConfig.apiKey;

let app;
let db;
let auth;
let googleProvider;
let analytics;

if (isConfigured) {
  try {
    // SINGLETON PATTERN: Prevent "App already exists" error during hot-reload
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    db = getFirestore(app);
    auth = getAuth(app);
    
    // Set up Google Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    
    // Use device language for auth flow
    auth.useDeviceLanguage();
    
    // Analytics (Optional, handle fail gracefully)
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Analytics init skipped (likely blocked by client):", e);
      }
    }
    
    console.log("✅ Firebase Connected");
  } catch (error) {
    console.error("❌ Firebase Init Error:", error);
  }
} else {
  console.log("⚠️ Firebase Config Missing");
}

export { db, auth, googleProvider, isConfigured, firebaseConfig, analytics };
