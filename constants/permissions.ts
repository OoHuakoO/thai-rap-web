import type { Permission, Role } from '@/types/auth.types'
import { ROUTES } from './routes'

// ─── Role → Permissions ───────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'dashboard:read',
    'restaurant:read',
    'restaurant:write',
    'restaurant:delete',
    'assessment:read',
    'assessment:write',
    'assessment:delete',
    'analytics:read',
    'scoring:read',
    'scoring:write',
    'scoring:delete',
    'reports:read',
    'reports:export',
    'users:read',
    'users:write',
    'users:delete',
    'settings:read',
    'settings:write',
  ],

  admin: [
    'dashboard:read',
    'restaurant:read',
    'restaurant:write',
    'restaurant:delete',
    'assessment:read',
    'assessment:write',
    'assessment:delete',
    'analytics:read',
    'scoring:read',
    'scoring:write',
    'scoring:delete',
    'reports:read',
    'reports:export',
    'users:read',
    'users:write',
    'settings:read',
    'settings:write',
  ],

  evaluator: [
    'dashboard:read',
    'restaurant:read',
    'restaurant:write',
    'assessment:read',
    'assessment:write',
    'analytics:read',
    'scoring:read',
    'scoring:write',
    'reports:read',
    'reports:export',
  ],

  viewer: [
    'dashboard:read',
    'restaurant:read',
    'assessment:read',
    'analytics:read',
    'scoring:read',
    'reports:read',
  ],
}

// ─── Route → Allowed Roles ────────────────────────────────────────────────────

export interface RoutePermissionConfig {
  path: string
  allowedRoles: Role[]
  requiredPermission?: Permission
}

export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  { path: ROUTES.HOME,        allowedRoles: ['super_admin', 'admin', 'evaluator', 'viewer'], requiredPermission: 'dashboard:read' },
  { path: ROUTES.RESTAURANTS, allowedRoles: ['super_admin', 'admin', 'evaluator', 'viewer'], requiredPermission: 'restaurant:read' },
  { path: ROUTES.ASSESSMENT,  allowedRoles: ['super_admin', 'admin', 'evaluator'],           requiredPermission: 'assessment:read' },
  { path: ROUTES.ANALYTICS,   allowedRoles: ['super_admin', 'admin', 'evaluator', 'viewer'], requiredPermission: 'analytics:read' },
  { path: ROUTES.SCORING,     allowedRoles: ['super_admin', 'admin', 'evaluator'],           requiredPermission: 'scoring:read' },
  { path: ROUTES.REPORTS,     allowedRoles: ['super_admin', 'admin', 'evaluator', 'viewer'], requiredPermission: 'reports:read' },
  { path: ROUTES.USERS,       allowedRoles: ['super_admin', 'admin'],                        requiredPermission: 'users:read' },
  { path: ROUTES.SETTINGS,    allowedRoles: ['super_admin', 'admin'],                        requiredPermission: 'settings:read' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function canAccessRoute(role: Role, path: string): boolean {
  const config = ROUTE_PERMISSIONS.find((r) => path === r.path || path.startsWith(`${r.path}/`))
  if (!config) return true
  return config.allowedRoles.includes(role)
}
