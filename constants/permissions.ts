import type { Permission, Role } from '@/types/auth.types'
import { ROUTES } from './routes'

// ─── Role → Permissions ───────────────────────────────────────────────────────
// Permission matrix (6 roles × 18 permissions)

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'dashboard:read',
    'store:read',       'store:write',       'store:delete',
    'assessment:read',  'assessment:write',  'assessment:delete',
    'analytics:read',
    'pitching:read',    'pitching:write',    'pitching:delete',
    'reports:read',     'reports:export',
    'users:read',       'users:write',       'users:delete',
    'settings:read',    'settings:write',
  ],

  // ผู้ประเมินร้าน — assessment write + view pitching/analytics/reports
  ASSESSOR: [
    'dashboard:read',
    'store:read',       'store:write',
    'assessment:read',  'assessment:write',
    'analytics:read',
    'pitching:read',
    'reports:read',     'reports:export',
  ],

  // ที่ปรึกษา — view assessment + analytics + reports, no write on assessment
  MENTOR: [
    'dashboard:read',
    'store:read',
    'assessment:read',
    'analytics:read',
    'reports:read',     'reports:export',
  ],

  // ผู้ประกอบการ — manage own store (create/edit/delete own), own assessment read-only, analytics own
  ENTREPRENEUR: [
    'store:read',        'store:write',       'store:delete',
    'assessment:read',
    'analytics:read',
  ],

  // กรรมการ Pitching — pitching scoring + view dashboard + store for context
  JUDGE: [
    'dashboard:read',
    'store:read',
    'pitching:read',    'pitching:write',
  ],

  // ทีม M&E — monitor all, view reports, no write
  ME_TEAM: [
    'dashboard:read',
    'store:read',
    'assessment:read',
    'analytics:read',
    'pitching:read',
    'reports:read',     'reports:export',
    'users:read',
  ],
}

// ─── Route → Required Permission ─────────────────────────────────────────────

export interface RoutePermissionConfig {
  path: string
  requiredPermission: Permission
  // Rare: role-specific gate on top of the permission check — use only when
  // access is genuinely restricted to specific roles, not just a permission tier.
  allowedRoles?: Role[]
}

export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  { path: ROUTES.HOME,        requiredPermission: 'dashboard:read'  },
  { path: ROUTES.STORES,      requiredPermission: 'store:read', allowedRoles: ['ADMIN', 'ENTREPRENEUR'] },
  { path: ROUTES.ASSESSMENT,  requiredPermission: 'assessment:read' },
  { path: ROUTES.ANALYTICS,   requiredPermission: 'analytics:read'  },
  { path: ROUTES.PITCHING,    requiredPermission: 'pitching:read'   },
  { path: ROUTES.REPORTS,     requiredPermission: 'reports:read'    },
  { path: ROUTES.USERS,       requiredPermission: 'users:read'      },
  { path: ROUTES.SETTINGS,    requiredPermission: 'settings:read'   },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function canAccessRoute(role: Role, path: string): boolean {
  const config = ROUTE_PERMISSIONS.find((r) => {
    if (r.path === '/') return path === '/'
    return path === r.path || path.startsWith(`${r.path}/`)
  })
  if (!config) return false
  if (config.allowedRoles && !config.allowedRoles.includes(role)) return false
  return hasPermission(role, config.requiredPermission)
}
