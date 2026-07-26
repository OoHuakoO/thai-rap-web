// Stands in for the httpOnly refresh cookie: tracks which user the last
// login/register issued a session for, so the mock /auth/refresh handler
// has something to refresh without needing real cookie support in MSW.
//
// Backed by localStorage because the real refresh cookie survives a reload.
// Keeping it in memory logged the user out on every refresh — the opposite of
// what the cookie it stands in for does.
const STORAGE_KEY = 'mock-auth-session';

function readSession(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function writeSession(userId: string | null): void {
  if (typeof window === 'undefined') return;
  if (userId === null) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, userId);
}

export const authSession = {
  set: (userId: string) => writeSession(userId),
  get: () => readSession(),
  clear: () => writeSession(null),
  reset: () => writeSession(null),
};
