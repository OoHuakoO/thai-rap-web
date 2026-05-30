export const ROUTES = {
  // Auth
  LOGIN: '/login',

  // Main
  HOME: '/',

  // Restaurant
  RESTAURANTS: '/restaurants',
  RESTAURANT_DETAIL: (id: string) => `/restaurants/${id}`,

  // Assessment
  ASSESSMENT: '/assessment',
  ASSESSMENT_DETAIL: (id: string) => `/assessment/${id}`,

  // Analytics
  ANALYTICS: '/analytics',

  // Scoring
  SCORING: '/scoring',
  SCORING_DETAIL: (id: string) => `/scoring/${id}`,

  // Reports
  REPORTS: '/reports',

  // User management
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,

  // Settings
  SETTINGS: '/settings',

  // Help
  MANUAL: '/manual',
} as const
