export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const;
