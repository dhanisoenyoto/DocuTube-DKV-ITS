
import { auth, googleProvider } from './firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, Auth } from 'firebase/auth';
import { User } from '../types';

// --- LOGIN GOOGLE ---
export const loginWithGoogle = async (forceSwitch: boolean = false): Promise<User | null> => {
  if (!auth || !googleProvider) {
    console.error("Auth Service Error: Auth or Provider is undefined. Check firebaseConfig.");
    throw new Error("Layanan Autentikasi belum siap. Silakan refresh halaman dan coba lagi.");
  }

  try {
    console.log("Initiating Google Sign-In...");
    
    // Force account selection if requested (Switch User feature)
    if (forceSwitch) {
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
    } else {
      // Clear custom parameters to allow auto-login if preferred in standard flow
      googleProvider.setCustomParameters({});
    }

    // Casting auth to Auth to satisfy strict TypeScript checks because we verified it above
    const result = await signInWithPopup(auth as Auth, googleProvider);
    const fbUser = result.user;
    
    console.log("Login Successful:", fbUser.email);

    // Map Firebase User to App User
    const appUser: User = {
      uid: fbUser.uid,
      displayName: fbUser.displayName,
      email: fbUser.email,
      photoURL: fbUser.photoURL
    };
    
    return appUser;
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    // Rethrow to be handled by the UI
    throw error;
  }
};

// --- LOGOUT ---
export const logout = async () => {
  if (auth) {
    try {
      await signOut(auth as Auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
};

// --- GET CURRENT USER (Snapshot) ---
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

// --- CHECK AUTH STATUS ---
export const isAuthenticated = (): boolean => {
  return !!auth?.currentUser;
};

// --- AUTH STATE LISTENER ---
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!auth) {
    // If auth isn't initialized, we can't subscribe. 
    // Return a dummy unsubscribe function.
    callback(null);
    return () => {};
  }

  const unsubscribe = onAuthStateChanged(auth as Auth, (fbUser: FirebaseUser | null) => {
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
