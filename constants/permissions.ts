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

  // viewer: read-only dashboard, restaurants, analytics, reports only
  // assessment + scoring require evaluator role minimum
  viewer: [
    'dashboard:read',
    'restaurant:read',
    'analytics:read',
    'reports:read',
  ],
}

// ─── Route → Required Permission ─────────────────────────────────────────────
// Single source of truth. canAccessRoute derives from hasPermission — no
// separate allowedRoles array to keep in sync.

export interface RoutePermissionConfig {
  path: string
  requiredPermission: Permission
}

export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  { path: ROUTES.HOME,        requiredPermission: 'dashboard:read' },
  { path: ROUTES.RESTAURANTS, requiredPermission: 'restaurant:read' },
  { path: ROUTES.ASSESSMENT,  requiredPermission: 'assessment:read' },
  { path: ROUTES.ANALYTICS,   requiredPermission: 'analytics:read' },
  { path: ROUTES.SCORING,     requiredPermission: 'scoring:read' },
  { path: ROUTES.REPORTS,     requiredPermission: 'reports:read' },
  { path: ROUTES.USERS,       requiredPermission: 'users:read' },
  { path: ROUTES.SETTINGS,    requiredPermission: 'settings:read' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function canAccessRoute(role: Role, path: string): boolean {
  const config = ROUTE_PERMISSIONS.find((r) => {
    // Root '/' must be exact-matched only — every path starts with '/'
    if (r.path === '/') return path === '/'
    return path === r.path || path.startsWith(`${r.path}/`)
  })
  // Deny by default — unregistered routes require explicit permission entry
  if (!config) return false
  return hasPermission(role, config.requiredPermission)
}
