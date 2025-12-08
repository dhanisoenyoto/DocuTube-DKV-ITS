import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- KONFIGURASI FIREBASE ---
// TUGAS ANDA:
// 1. Buka https://console.firebase.google.com/
// 2. Buat Project baru atau pilih project yang ada.
// 3. Masuk ke Project Settings -> General -> Your apps -> SDK setup and configuration.
// 4. Pilih 'Config' (bukan CDN).
// 5. Salin nilai-nilai tersebut ke dalam object di bawah ini.

const firebaseConfig = {
  // Ganti string kosong "" dengan API Key asli Anda
  apiKey: "ISI_API_KEY_ANDA_DISINI", 
  authDomain: "ISI_PROJECT_ID_ANDA.firebaseapp.com",
  projectId: "ISI_PROJECT_ID_ANDA",
  storageBucket: "ISI_PROJECT_ID_ANDA.appspot.com",
  messagingSenderId: "ISI_SENDER_ID_ANDA",
  appId: "ISI_APP_ID_ANDA"
};

// --- INITIALIZATION ---
// Mengecek apakah config sudah diisi user atau belum
const isConfigured = firebaseConfig.apiKey !== "ISI_API_KEY_ANDA_DISINI" && firebaseConfig.apiKey !== "";

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
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase init failed:", error);
  }
} else {
  console.warn("⚠️ PERINGATAN: API Key Firebase belum diisi di services/firebaseConfig.ts. Aplikasi berjalan dalam Mode Offline (Data tidak akan tersimpan online).");
}

// Tidak ada lagi fungsi save/reset dinamis karena sekarang hardcoded di file
export const saveFirebaseConfig = () => {}; 
export const resetFirebaseConfig = () => {};

export { auth, db, googleProvider, isConfigured, firebaseConfig };