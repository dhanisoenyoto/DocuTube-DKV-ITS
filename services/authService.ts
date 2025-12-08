
const AUTH_KEY = 'drivestream_auth_session';

export const login = (user: string, pass: string): boolean => {
  // Hardcoded credentials as requested
  if (user === 'superadmin' && pass === '123456') {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};
