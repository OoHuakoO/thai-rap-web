// ─── Roles ───────────────────────────────────────────────────────────────────
// Matches the Prisma `Role` enum in thai-rap-api exactly (uppercase) — the API
// is the source of truth for this union since JWT payloads/user records carry it.
// Single source of truth: every hardcoded role elsewhere in the app should
// reference ROLES.* instead of retyping the string literal.
// ADMIN        — ผู้ดูแลระบบ / PMO: full access + user management
// ASSESSOR     — ผู้ประเมินร้าน: assessment + scoring write
// MENTOR       — ที่ปรึกษา / Coach: IDP + analytics read
// ENTREPRENEUR — ผู้ประกอบการ: own store + own assessment read-only
// JUDGE        — กรรมการ Pitching: pitching scoring only
// ME_TEAM      — ทีม M&E: monitor + view all reports, no write
export const ROLES = {
  ADMIN: 'ADMIN',
  ASSESSOR: 'ASSESSOR',
  MENTOR: 'MENTOR',
  ENTREPRENEUR: 'ENTREPRENEUR',
  JUDGE: 'JUDGE',
  ME_TEAM: 'ME_TEAM',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Role Labels (Thai) ───────────────────────────────────────────────────────
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'ผู้ดูแลระบบ (Admin / PMO)',
  ASSESSOR: 'ผู้ประเมิน (Assessor)',
  MENTOR: 'ที่ปรึกษา (Mentor / Coach)',
  ENTREPRENEUR: 'ผู้ประกอบการ',
  JUDGE: 'กรรมการ Pitching',
  ME_TEAM: 'ทีม M&E',
};

// ─── Permissions ─────────────────────────────────────────────────────────────
// Single source of truth for every permission — everywhere a permission is
// referenced (ROLE_PERMISSIONS, ROUTE_PERMISSIONS, `can()` calls) should use
// PERMISSIONS.* instead of retyping the 'resource:action' string.
export const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',
  STORE_READ: 'store:read',
  STORE_WRITE: 'store:write',
  STORE_DELETE: 'store:delete',
  ASSESSMENT_READ: 'assessment:read',
  ASSESSMENT_WRITE: 'assessment:write',
  ASSESSMENT_DELETE: 'assessment:delete',
  ANALYTICS_READ: 'analytics:read',
  PITCHING_READ: 'pitching:read',
  PITCHING_WRITE: 'pitching:write',
  PITCHING_DELETE: 'pitching:delete',
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ROLE_PERMISSIONS.ADMIN (constants/permissions.ts) spreads this directly
// instead of re-listing all 18 values. Adding a permission to PERMISSIONS
// above is enough to grant it to ADMIN; still add it explicitly to any other
// role per auth-permissions.md.
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// ─── Auth User ────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
