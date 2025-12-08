import { auth, googleProvider, isConfigured } from './firebaseConfig';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

// State to track current user
let currentUser: User | null = null;
const LOCAL_AUTH_KEY = 'docutube_local_user';

// Helper to map Firebase User to our User type
const mapUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL
});

// --- CREDENTIAL LOGIN (SUPERADMIN) ---
export const loginWithCredentials = async (username: string, pass: string): Promise<User> => {
  // Simulasi delay network
  await new Promise(resolve => setTimeout(resolve, 800));

  if (username === 'superadmin' && pass === '123456') {
    const adminUser: User = {
      uid: 'superadmin-local-id',
      displayName: 'Super Admin',
      email: 'admin@dkv.its.ac.id',
      photoURL: null 
    };
    
    // Simpan sesi di localStorage agar tahan refresh
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminUser));
    currentUser = adminUser;
    return adminUser;
  }
  
  throw new Error('Username atau password salah.');
};

// --- GOOGLE LOGIN (OPTIONAL / LEGACY) ---
export const loginWithGoogle = async (): Promise<User | null> => {
  if (!isConfigured || !auth || !googleProvider) {
    throw new Error('Firebase belum dikonfigurasi.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    currentUser = mapUser(result.user);
    return currentUser;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

// --- LOGOUT ---
export const logout = async (): Promise<void> => {
  // 1. Clear Local Session
  localStorage.removeItem(LOCAL_AUTH_KEY);
  localStorage.removeItem('mock_auth');
  
  // 2. Clear Firebase Session (if exists)
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
  // 1. Cek sesi lokal (Superadmin)
  const localSession = localStorage.getItem(LOCAL_AUTH_KEY);
  if (localSession) {
    return JSON.parse(localSession);
  }

  // 2. Cek Firebase SDK
  if (isConfigured && auth?.currentUser) {
    return mapUser(auth.currentUser);
  }

  // 3. Fallback variable memory
  return currentUser;
};

// --- CHECK AUTH STATUS ---
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// --- AUTH LISTENER ---
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  // Cek state awal
  callback(getCurrentUser());

  // Jika pakai Firebase, listen perubahannya
  let unsubscribeFirebase = () => {};
  if (isConfigured && auth) {
    unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
      // Prioritaskan sesi lokal jika ada
      if (localStorage.getItem(LOCAL_AUTH_KEY)) return;
      
      const mapped = user ? mapUser(user) : null;
      currentUser = mapped;
      callback(mapped);
    });
  }

  return () => {
    unsubscribeFirebase();
  };
};