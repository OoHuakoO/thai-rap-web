export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

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
  PITCHING_FORM: '/pitching/form',
  // The form opened on a store the dashboard was already showing. The query is
  // a hint, not a guarantee — the form falls back to its own first store when
  // the caller may not score this one.
  PITCHING_FORM_FOR: (storeId: string, round: string) =>
    `/pitching/form?storeId=${encodeURIComponent(storeId)}&round=${encodeURIComponent(round)}`,

  // Reports
  REPORTS: '/reports',

  // News / announcements
  NEWS: '/news',
  NEWS_NEW: '/news/new',
  NEWS_EDIT: (id: string) => `/news/${id}/edit`,
  // The edit path with its id left as a `:param` placeholder — ROUTE_PERMISSIONS
  // needs a static string to match a visited path against, which the function
  // above cannot give it.
  NEWS_EDIT_PATTERN: '/news/:id/edit',

  // Activity gallery / ประมวลภาพกิจกรรม
  ACTIVITIES: '/activities',
  ACTIVITY_NEW: '/activities/new',
  ACTIVITY_DETAIL: (id: string) => `/activities/${id}`,
  ACTIVITY_EDIT: (id: string) => `/activities/${id}/edit`,
  // Same static twin as NEWS_EDIT_PATTERN — ROUTE_PERMISSIONS matches a visited
  // path against a string, which the function above cannot give it.
  ACTIVITY_EDIT_PATTERN: '/activities/:id/edit',

  // User management
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,

  // Error pages
  ERROR_403: '/errors/403',
  ERROR_429: '/errors/429',
  ERROR_500: '/errors/500',
  ERROR_503: '/errors/503',
} as const;
