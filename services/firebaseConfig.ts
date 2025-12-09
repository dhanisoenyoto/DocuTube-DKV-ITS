import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

// PENTING: Kita TIDAK menginisialisasi 'auth' (getAuth) di sini.
// Mengapa? Karena API Key Anda memblokir akses ke Identity Toolkit (Auth),
// yang menyebabkan error 'requests-to-this-api... are blocked'.
// Karena kita menggunakan login manual (superadmin), kita hanya butuh 'db' (Firestore).

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ Firebase Database Connected");
  } catch (error) {
    console.error("❌ Firebase Init Error:", error);
  }
} else {
  console.log("⚠️ Firebase Offline: Config Missing");
}

// Export db saja, tanpa auth
export { db, isConfigured, firebaseConfig };