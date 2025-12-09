import { User } from '../types';

// Hardcoded Admin Credentials
const ADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: '123456'
};

const ADMIN_USER: User = {
  uid: 'superadmin-local-id',
  displayName: 'Super Admin',
  email: 'admin@docutube.its.ac.id',
  photoURL: null
};

const SESSION_KEY = 'docutube_admin_session';

// --- LOGIN MANUAL ---
export const loginWithCredentials = (username: string, pass: string): boolean => {
  if (username === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(ADMIN_USER));
    return true;
  }
  return false;
};

// --- LOGOUT ---
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  // Trigger event storage agar UI update di tab lain (opsional)
  window.dispatchEvent(new Event('storage'));
};

// --- CEK USER SAAT INI ---
export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

// --- CEK STATUS AUTH ---
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// --- LISTENER PERUBAHAN AUTH ---
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  // 1. Panggil saat inisialisasi
  callback(getCurrentUser());

  // 2. Listener untuk perubahan storage (login/logout dari tab lain)
  const handleStorageChange = () => {
    callback(getCurrentUser());
  };

  window.addEventListener('storage', handleStorageChange);
  
  // Custom event untuk login/logout di tab yang sama
  // Kita bisa memodifikasi fungsi login/logout untuk dispatch event, 
  // atau cukup polling sederhana/re-render di React. 
  // Di React App.tsx biasanya kita memanggil isAuthenticated() secara reaktif.
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};