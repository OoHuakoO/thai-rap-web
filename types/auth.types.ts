// ─── Roles ───────────────────────────────────────────────────────────────────
// super_admin — ผู้ดูแลระบบสูงสุด: full access รวม user management
// admin       — ผู้ดูแลระบบ: access ทั้งหมดยกเว้น manage super_admin
// evaluator   — ผู้ประเมิน: ทำ assessment + scoring + ดู reports
// viewer      — ผู้ดูข้อมูล: read-only ทุกหน้า ยกเว้น user management
export type Role = 'super_admin' | 'admin' | 'evaluator' | 'viewer'

// ─── Permissions ─────────────────────────────────────────────────────────────
export type Permission =
  | 'dashboard:read'
  | 'restaurant:read'
  | 'restaurant:write'
  | 'restaurant:delete'
  | 'assessment:read'
  | 'assessment:write'
  | 'assessment:delete'
  | 'analytics:read'
  | 'scoring:read'
  | 'scoring:write'
  | 'scoring:delete'
  | 'reports:read'
  | 'reports:export'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'settings:read'
  | 'settings:write'

// ─── Auth User ────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}
