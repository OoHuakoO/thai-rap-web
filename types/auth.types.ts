// ─── Roles ───────────────────────────────────────────────────────────────────
// admin       — ผู้ดูแลระบบ / PMO: full access + user management
// assessor    — ผู้ประเมินร้าน: assessment + scoring write
// mentor      — ที่ปรึกษา / Coach: IDP + analytics read
// entrepreneur — ผู้ประกอบการ: own store + own assessment read-only
// judge       — กรรมการ Pitching: pitching scoring only
// me_team     — ทีม M&E: monitor + view all reports, no write
export type Role =
  | 'admin'
  | 'assessor'
  | 'mentor'
  | 'entrepreneur'
  | 'judge'
  | 'me_team'

// ─── Role Labels (Thai) ───────────────────────────────────────────────────────
export const ROLE_LABELS: Record<Role, string> = {
  admin:        'ผู้ดูแลระบบ (Admin / PMO)',
  assessor:     'ผู้ประเมิน (Assessor)',
  mentor:       'ที่ปรึกษา (Mentor / Coach)',
  entrepreneur: 'ผู้ประกอบการ',
  judge:        'กรรมการ Pitching',
  me_team:      'ทีม M&E',
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
