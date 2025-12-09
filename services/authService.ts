import { auth, googleProvider } from './firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

// --- LOGIN GOOGLE ---
export const loginWithGoogle = async (): Promise<User | null> => {
  if (!auth || !googleProvider) {
    throw new Error("Layanan Auth belum siap. Periksa konfigurasi Firebase.");
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    // Mapping Firebase User ke App User Type
    const appUser: User = {
      uid: fbUser.uid,
      displayName: fbUser.displayName,
      email: fbUser.email,
      photoURL: fbUser.photoURL
    };
    
    return appUser;
  } catch (error: any) {
    console.error("Login Error:", error);
    throw error;
  }
};

// --- LOGOUT ---
export const logout = async () => {
  if (auth) {
    await signOut(auth);
  }
};

// --- CEK USER SAAT INI (Synchronous - hanya snapshot terakhir) ---
export const getCurrentUser = (): User | null => {
  if (!auth?.currentUser) return null;
  const fbUser = auth.currentUser;
  return {
    uid: fbUser.uid,
    displayName: fbUser.displayName,
    email: fbUser.email,
    photoURL: fbUser.photoURL
  };
};

// --- CEK STATUS AUTH ---
export const isAuthenticated = (): boolean => {
  return !!auth?.currentUser;
};

// --- LISTENER PERUBAHAN AUTH (Realtime) ---
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }

  const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      const appUser: User = {
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL
      };
      callback(appUser);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};