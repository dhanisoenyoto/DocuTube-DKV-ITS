import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// =========================================================================
// KONFIGURASI FIREBASE DOCUTUBE DKV ITS
// =========================================================================

const firebaseConfig = {
  // API Key Anda (Pastikan ini dari project filmdokumenter2025-65628)
  apiKey: "AIzaSyDQqBGDvIEo90JGeRSuVsuf69QqCdNlc8I", 
  
  // Konfigurasi Project (Diupdate sesuai request user)
  authDomain: "filmdokumenter2025-65628.firebaseapp.com",
  projectId: "filmdokumenter2025-65628",
  storageBucket: "filmdokumenter2025-65628.firebasestorage.app",
  messagingSenderId: "KOSONGKAN_TIDAK_APA2",
  appId: "KOSONGKAN_TIDAK_APA2"
};

// =========================================================================

// System Check: Validasi konfigurasi
const isConfigured = firebaseConfig.projectId !== "GANTI_DENGAN_PROJECT_ID" && 
                     !firebaseConfig.projectId.includes("ISI_") &&
                     firebaseConfig.apiKey !== "";

let app;
let auth;
let db;
let googleProvider;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log("✅ Firebase Online: Connected to", firebaseConfig.projectId);
  } catch (error) {
    console.error("❌ Firebase Error:", error);
  }
} else {
  console.log("⚠️ Firebase Offline: Menggunakan Mode Demo (Data Lokal)");
}

export { auth, db, googleProvider, isConfigured, firebaseConfig };