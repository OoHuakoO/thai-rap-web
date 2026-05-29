export const ROUTES = {
  HOME: '/',
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
} as const;
