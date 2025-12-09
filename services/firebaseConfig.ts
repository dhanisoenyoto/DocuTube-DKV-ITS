import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// =========================================================================
// KONFIGURASI FIREBASE DOCUTUBE DKV ITS
// =========================================================================

const firebaseConfig = {
  apiKey: "AIzaSyDqkIXntNeclWgY-XSaH8U7hVroG-Gjrek",
  authDomain: "filmdokumenter2025-65628.firebaseapp.com", // Gunakan default dulu agar stabil
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

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("✅ Firebase Connected: Database & Auth Active");
  } catch (error) {
    console.error("❌ Firebase Init Error:", error);
  }
} else {
  console.log("⚠️ Firebase Config Missing");
}

export { db, auth, googleProvider, isConfigured, firebaseConfig };