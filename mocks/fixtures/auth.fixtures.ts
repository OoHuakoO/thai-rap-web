// Stands in for the httpOnly refresh cookie: tracks which user the last
// login/register issued a session for, so the mock /auth/refresh handler
// has something to refresh without needing real cookie support in MSW.
let sessionUserId: string | null = null;

export const authSession = {
  set: (userId: string) => {
    sessionUserId = userId;
  },
  get: () => sessionUserId,
  clear: () => {
    sessionUserId = null;
  },
  reset: () => {
    sessionUserId = null;
  },
};
