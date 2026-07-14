import type { Permission, Role } from '@/types/auth.types';
import { ALL_PERMISSIONS, PERMISSIONS, ROLES } from '@/types/auth.types';
import { ROUTES } from './routes';

// ─── Role → Permissions ───────────────────────────────────────────────────────
// Permission matrix (6 roles × 18 permissions)

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // Admin holds every permission — spread the single source of truth
  // instead of re-listing all 18 values (types/auth.types.ts).
  ADMIN: [...ALL_PERMISSIONS],

  // ผู้ประเมินร้าน — assessment write + view pitching/analytics/reports
  ASSESSOR: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.STORE_WRITE,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ASSESSMENT_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.PITCHING_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // ที่ปรึกษา — view assessment + analytics + reports, no write on assessment
  MENTOR: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // ผู้ประกอบการ — manage own store (create/edit/delete own), own assessment read-only, analytics own
  ENTREPRENEUR: [
    PERMISSIONS.STORE_READ,
    PERMISSIONS.STORE_WRITE,
    PERMISSIONS.STORE_DELETE,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  // กรรมการ Pitching — pitching scoring + view dashboard + store for context
  JUDGE: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.PITCHING_READ,
    PERMISSIONS.PITCHING_WRITE,
  ],

  // ทีม M&E — monitor all, view reports, no write
  ME_TEAM: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.PITCHING_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.USERS_READ,
  ],
};

// ─── Route → Required Permission ─────────────────────────────────────────────

export interface RoutePermissionConfig {
  path: string;
  requiredPermission: Permission;
  // Rare: role-specific gate on top of the permission check — use only when
  // access is genuinely restricted to specific roles, not just a permission tier.
  allowedRoles?: Role[];
}

export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  { path: ROUTES.HOME, requiredPermission: PERMISSIONS.DASHBOARD_READ },
  {
    path: ROUTES.STORES,
    requiredPermission: PERMISSIONS.STORE_READ,
    allowedRoles: [ROLES.ADMIN, ROLES.ENTREPRENEUR],
  },
  { path: ROUTES.ASSESSMENT, requiredPermission: PERMISSIONS.ASSESSMENT_READ },
  { path: ROUTES.ANALYTICS, requiredPermission: PERMISSIONS.ANALYTICS_READ },
  { path: ROUTES.PITCHING, requiredPermission: PERMISSIONS.PITCHING_READ },
  { path: ROUTES.REPORTS, requiredPermission: PERMISSIONS.REPORTS_READ },
  { path: ROUTES.USERS, requiredPermission: PERMISSIONS.USERS_READ },
  { path: ROUTES.SETTINGS, requiredPermission: PERMISSIONS.SETTINGS_READ },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessRoute(role: Role, path: string): boolean {
  const config = ROUTE_PERMISSIONS.find((r) => {
    if (r.path === '/') return path === '/';
    return path === r.path || path.startsWith(`${r.path}/`);
  });
  if (!config) return false;
  if (config.allowedRoles && !config.allowedRoles.includes(role)) return false;
  return hasPermission(role, config.requiredPermission);
}
