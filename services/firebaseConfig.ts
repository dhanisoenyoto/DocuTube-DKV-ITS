import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Key untuk penyimpanan konfigurasi di browser
const LOCAL_STORAGE_KEY = 'docutube_firebase_config';

// Fungsi untuk mendapatkan config tersimpan
const getStoredConfig = () => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

// Config default (kosong)
const defaultConfig = {
  apiKey: "", 
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Gunakan config dari storage jika ada, jika tidak gunakan default
const storedConfig = getStoredConfig();
const firebaseConfig = storedConfig || defaultConfig;

// Initialize Firebase only if config is valid (has apiKey)
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
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase init failed:", error);
    // Jika init gagal (misal config salah), reset biar ga error terus
    console.warn("Invalid config detected, resetting...");
  }
}

// Fungsi Helper untuk menyimpan config dari UI
export const saveFirebaseConfig = (config: any) => {
  if (!config.apiKey) return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  window.location.reload(); // Reload halaman untuk menerapkan perubahan
};

// Fungsi Helper untuk menghapus config (Reset ke Mode Offline)
export const resetFirebaseConfig = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.location.reload();
};

export { auth, db, googleProvider, isConfigured, firebaseConfig };