import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
const isConfigured = !!firebaseConfig.projectId && 
                     !!firebaseConfig.apiKey;

let app;
let db;
let auth;

// Kita hanya menginisialisasi Firestore (Database) dan Auth.
// Namun, Login tetap manual (superadmin) di authService.ts kecuali diubah.

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("✅ Firebase Connected");
  } catch (error) {
    console.error("❌ Firebase Init Error:", error);
  }
} else {
  console.log("⚠️ Firebase Offline: Config Missing");
}

export { db, auth, isConfigured, firebaseConfig };