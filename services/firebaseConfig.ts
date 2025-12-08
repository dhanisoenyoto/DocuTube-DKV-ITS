import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// =========================================================================
// KONFIGURASI FIREBASE DOCUTUBE DKV ITS
// =========================================================================

const firebaseConfig = {
  // API Key Anda
  apiKey: "AIzaSyDQqBGDvIEo90JGeRSuVsuf69QqCdNlc8I", 
  
  // Konfigurasi Project
  authDomain: "filmdokumenter2025-65628.firebaseapp.com",
  projectId: "filmdokumenter2025-65628",
  storageBucket: "filmdokumenter2025-65628.firebasestorage.app",
  
  // App ID sangat disarankan diisi. Jika Anda punya, ganti string kosong di bawah.
  // Jika tidak punya, biarkan kosong (auth mungkin masih bisa jalan tanpa ini).
  // appId: "1:914219490:web:xxxxxx" 
};

// =========================================================================

// System Check: Validasi konfigurasi minimal
const isConfigured = !!firebaseConfig.projectId && 
                     !!firebaseConfig.apiKey &&
                     !firebaseConfig.projectId.includes("ISI_");

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