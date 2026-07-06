// ─── Roles ───────────────────────────────────────────────────────────────────
// Matches the Prisma `Role` enum in thai-rap-api exactly (uppercase) — the API
// is the source of truth for this union since JWT payloads/user records carry it.
// ADMIN        — ผู้ดูแลระบบ / PMO: full access + user management
// ASSESSOR     — ผู้ประเมินร้าน: assessment + scoring write
// MENTOR       — ที่ปรึกษา / Coach: IDP + analytics read
// ENTREPRENEUR — ผู้ประกอบการ: own store + own assessment read-only
// JUDGE        — กรรมการ Pitching: pitching scoring only
// ME_TEAM      — ทีม M&E: monitor + view all reports, no write
export type Role =
  | 'ADMIN'
  | 'ASSESSOR'
  | 'MENTOR'
  | 'ENTREPRENEUR'
  | 'JUDGE'
  | 'ME_TEAM'

// ─── Role Labels (Thai) ───────────────────────────────────────────────────────
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN:        'ผู้ดูแลระบบ (Admin / PMO)',
  ASSESSOR:     'ผู้ประเมิน (Assessor)',
  MENTOR:       'ที่ปรึกษา (Mentor / Coach)',
  ENTREPRENEUR: 'ผู้ประกอบการ',
  JUDGE:        'กรรมการ Pitching',
  ME_TEAM:      'ทีม M&E',
}

// ─── Permissions ─────────────────────────────────────────────────────────────
export type Permission =
  | 'dashboard:read'
  | 'store:read'
  | 'store:write'
  | 'store:delete'
  | 'assessment:read'
  | 'assessment:write'
  | 'assessment:delete'
  | 'analytics:read'
  | 'pitching:read'
  | 'pitching:write'
  | 'pitching:delete'
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
