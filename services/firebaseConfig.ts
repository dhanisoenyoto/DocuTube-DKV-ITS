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
    // SINGLETON PATTERN: Cek apakah app sudah ada sebelum inisialisasi
    // Ini mencegah error "Firebase App named '[DEFAULT]' already exists" saat hot-reload
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp(); // Gunakan instance yang sudah ada
    }

    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Analytics (Optional)
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        // Analytics sering diblokir oleh adblocker, jangan biarkan ini menghentikan aplikasi
        console.warn("Analytics init skipped:", e);
      }
    }
    
    console.log("✅ Firebase Connected: Database & Auth Active");
  } catch (error) {
    console.error("❌ Firebase Init Error:", error);
  }
} else {
  console.log("⚠️ Firebase Config Missing");
}

export { db, auth, googleProvider, isConfigured, firebaseConfig, analytics };