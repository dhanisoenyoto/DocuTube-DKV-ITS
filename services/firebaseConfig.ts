import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// PENTING: GANTI KONFIGURASI INI DENGAN DATA DARI FIREBASE CONSOLE
// 1. Buka console.firebase.google.com
// 2. Buat Project Baru
// 3. Masuk ke Project Settings -> General -> Your apps -> Add Web App
// 4. Copy config objectnya ke bawah ini
// ------------------------------------------------------------------

const firebaseConfig = {
  // Ganti string kosong ini dengan API Key asli Anda agar sinkronisasi berjalan
  apiKey: "", 
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase only if config is valid
const isConfigured = !!firebaseConfig.apiKey;

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
  } catch (error) {
    console.error("Firebase init failed:", error);
  }
}

export { auth, db, googleProvider, isConfigured };
