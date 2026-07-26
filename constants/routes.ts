export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Main
  HOME: '/',

  // Stores
  STORES: '/stores',
  STORE_NEW: '/stores/new',
  STORE_DETAIL: (id: string) => `/stores/${id}`,
  STORE_EDIT: (id: string) => `/stores/${id}/edit`,

  // Assessment
  ASSESSMENT: '/assessment',
  ASSESSMENT_PICK_ROUND: (storeId: string) => `/assessment/${storeId}`,
  ASSESSMENT_DETAIL: (storeId: string, round: string) => `/assessment/${storeId}/${round}`,

  // Analytics
  ANALYTICS: '/analytics',

  // Pitching
  PITCHING: '/pitching',

  // Reports
  REPORTS: '/reports',

  // News / announcements
  NEWS: '/news',
  NEWS_NEW: '/news/new',
  NEWS_EDIT: (id: string) => `/news/${id}/edit`,

  // User management
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  // Access-control matrix — SUPER_ADMIN only
  USER_PERMISSIONS: '/users/permissions',

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
