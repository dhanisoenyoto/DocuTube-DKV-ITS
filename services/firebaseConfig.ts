import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// =========================================================================
// KONFIGURASI FIREBASE DOCUTUBE DKV ITS
// =========================================================================

const firebaseConfig = {
  // API Key (Tetap menggunakan yang sebelumnya)
  apiKey: "AIzaSyDQqBGDvIEo90JGeRSuVsuf69QqCdNlc8I", 
  
  // Konfigurasi Project Baru
  authDomain: "project-1004961982826.firebaseapp.com",
  projectId: "project-1004961982826",
  storageBucket: "project-1004961982826.firebasestorage.app",
  messagingSenderId: "1004961982826",
  appId: "1:1004961982826:web:custom_app_id_placeholder" 
};

// =========================================================================

// System Check
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
  console.log("⚠️ Firebase Offline: Config Missing");
}

export { auth, db, googleProvider, isConfigured, firebaseConfig };