import { auth, googleProvider, isConfigured } from './firebaseConfig';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

// State to track current user
let currentUser: User | null = null;

// Helper to map Firebase User to our User type
const mapUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL
});

// LOGIN FUNCTION
export const loginWithGoogle = async (): Promise<User | null> => {
  if (!isConfigured || !auth || !googleProvider) {
    // Fallback Mock for Demo if no firebase keys
    console.warn("Firebase not configured. Using Mock Login.");
    const mockUser: User = {
      uid: 'mock-user-123',
      displayName: 'Demo User',
      email: 'demo@dkv.its.ac.id',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    };
    localStorage.setItem('mock_auth', 'true');
    currentUser = mockUser;
    return mockUser;
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

// LOGOUT FUNCTION
export const logout = async (): Promise<void> => {
  if (!isConfigured || !auth) {
    localStorage.removeItem('mock_auth');
    currentUser = null;
    return;
  }
  await firebaseSignOut(auth);
  currentUser = null;
};

// GET CURRENT USER
export const getCurrentUser = (): User | null => {
  // If we have a firebase instance, auth.currentUser is the source of truth
  if (isConfigured && auth?.currentUser) {
    return mapUser(auth.currentUser);
  }
  // Fallback check for mock
  if (!isConfigured && localStorage.getItem('mock_auth')) {
    return currentUser || {
        uid: 'mock-user-123',
        displayName: 'Demo User',
        email: 'demo@dkv.its.ac.id',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    };
  }
  return null;
};

// CHECK IF AUTHENTICATED
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// LISTENER FOR AUTH STATE CHANGES
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (isConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      const mapped = user ? mapUser(user) : null;
      currentUser = mapped;
      callback(mapped);
    });
  } else {
    // Mock listener
    callback(getCurrentUser());
    return () => {};
  }
};