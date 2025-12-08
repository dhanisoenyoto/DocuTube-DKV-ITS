import { auth, googleProvider, isConfigured } from './firebaseConfig';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

// State to track current user
let currentUser: User | null = null;
const LOCAL_AUTH_KEY = 'docutube_user_session';

// Helper to map Firebase User to our User type
const mapUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL
});

// --- GOOGLE LOGIN (PRIMARY) ---
export const loginWithGoogle = async (): Promise<User | null> => {
  if (!isConfigured || !auth || !googleProvider) {
    throw new Error('Konfigurasi Firebase tidak valid atau belum dimuat.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    currentUser = mapUser(result.user);
    // Simpan copy sesi di local storage untuk akses cepat saat refresh (optional)
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(currentUser));
    return currentUser;
  } catch (error: any) {
    console.error("Login failed", error);
    // Lempar error asli agar bisa ditangkap di UI (untuk debugging authorized domain)
    throw error;
  }
};

// --- LOGOUT ---
export const logout = async (): Promise<void> => {
  localStorage.removeItem(LOCAL_AUTH_KEY);
  
  if (isConfigured && auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase signout error", e);
    }
  }
  
  currentUser = null;
};

// --- GET CURRENT USER ---
export const getCurrentUser = (): User | null => {
  // 1. Cek Firebase SDK (Paling akurat)
  if (isConfigured && auth?.currentUser) {
    return mapUser(auth.currentUser);
  }

  // 2. Cek variabel memori
  if (currentUser) return currentUser;

  // 3. Fallback LocalStorage (Hanya jika firebase belum init)
  const localSession = localStorage.getItem(LOCAL_AUTH_KEY);
  if (localSession) {
    return JSON.parse(localSession);
  }

  return null;
};

// --- CHECK AUTH STATUS ---
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// --- AUTH LISTENER ---
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  // Panggil callback segera dengan state saat ini
  callback(getCurrentUser());

  let unsubscribeFirebase = () => {};
  
  if (isConfigured && auth) {
    unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
      const mapped = user ? mapUser(user) : null;
      currentUser = mapped;
      
      if (mapped) {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mapped));
      } else {
        localStorage.removeItem(LOCAL_AUTH_KEY);
      }
      
      callback(mapped);
    });
  }

  return () => {
    unsubscribeFirebase();
  };
};