export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Main
  HOME: '/',

  // Stores
  STORES: '/stores',
  STORE_DETAIL: (id: string) => `/stores/${id}`,

  // Assessment
  ASSESSMENT: '/assessment',
  ASSESSMENT_DETAIL: (storeId: string, round: string) => `/assessment/${storeId}/${round}`,

  // Analytics
  ANALYTICS: '/analytics',

  // Pitching
  PITCHING: '/pitching',

  // Reports
  REPORTS: '/reports',

  // User management
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,

  // Settings
  SETTINGS: '/settings',

  // Help
  MANUAL: '/manual',

  // Error pages
  ERROR_403: '/errors/403',
  ERROR_429: '/errors/429',
  ERROR_500: '/errors/500',
  ERROR_503: '/errors/503',
} as const
