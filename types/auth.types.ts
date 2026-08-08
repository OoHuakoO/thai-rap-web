// ─── Roles ───────────────────────────────────────────────────────────────────
// Matches the Prisma `Role` enum in thai-rap-api exactly (uppercase) — the API
// is the source of truth for this union since JWT payloads/user records carry it.
// Single source of truth: every hardcoded role elsewhere in the app should
// reference ROLES.* instead of retyping the string literal.
// SUPER_ADMIN  — ผู้ดูแลระบบสูงสุด: everything ADMIN has, plus managing user
//                accounts (users:*)
// ADMIN        — ผู้ดูแลระบบ / PMO: runs the programme — every store/assessment
//                function, but no user management
// ASSESSOR     — ผู้ติดตาม / ผู้ประเมิน: the only staff role that scores an
//                assessment (brief "แบบ 50 ข้อ" §3.3)
// MENTOR       — ที่ปรึกษา / Coach: reads the finished assessment and turns it
//                into an IDP — never scores it (brief §3.4)
// ENTREPRENEUR — ผู้ประกอบการ / ร้านค้า: own store + own assessment read-only
// JUDGE        — กรรมการ Pitching: pitching scoring only
// VIEWER       — ผู้ใช้ทั่วไป: only the store fields the project marks public
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  ASSESSOR: 'ASSESSOR',
  MENTOR: 'MENTOR',
  ENTREPRENEUR: 'ENTREPRENEUR',
  JUDGE: 'JUDGE',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES);

/**
 * Display order for the access-control screens — lowest access level first, so
 * the matrix reads left-to-right as widening access.
 */
export const ROLE_DISPLAY_ORDER: Role[] = [
  ROLES.VIEWER,
  ROLES.ENTREPRENEUR,
  ROLES.MENTOR,
  ROLES.ASSESSOR,
  ROLES.JUDGE,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

// ─── Role Labels (Thai) ───────────────────────────────────────────────────────
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'ผู้ดูแลระบบสูงสุด (Super Admin)',
  ADMIN: 'ผู้ดูแลระบบ (Admin / PMO)',
  ASSESSOR: 'ผู้ประเมิน (Assessor)',
  MENTOR: 'ที่ปรึกษา (Mentor / Coach)',
  ENTREPRENEUR: 'ผู้ประกอบการ / ร้านค้า',
  JUDGE: 'กรรมการ Pitching',
  VIEWER: 'ผู้ใช้ทั่วไป (User)',
};

/** Short label for places a full role label won't fit — matrix column headers. */
export const ROLE_SHORT_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  ASSESSOR: 'ผู้ประเมิน',
  MENTOR: 'Mentor',
  ENTREPRENEUR: 'ร้านค้า',
  JUDGE: 'กรรมการ',
  VIEWER: 'ผู้ใช้ทั่วไป',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  VIEWER: 'ดูได้เฉพาะข้อมูลที่โครงการกำหนดว่าเปิดเผยได้',
  ENTREPRENEUR: 'เพิ่ม/แก้ไขข้อมูลร้านของตนเองเท่านั้น และดูข้อมูลเปิดเผยเหมือนผู้ใช้ทั่วไป',
  MENTOR: 'ดูผลประเมินร้านที่ได้รับมอบหมาย ให้คำแนะนำรายมิติ จัดทำแผนพัฒนา และติดตามความก้าวหน้า',
  ASSESSOR: 'ประเมินร้านที่ได้รับมอบหมาย ตรวจหลักฐาน บันทึก Red Flag ดูวิเคราะห์ศักยภาพ และรายงาน',
  JUDGE: 'ให้คะแนน Pitching ของร้านที่ได้รับมอบหมาย',
  ADMIN: 'จัดการข้อมูลร้านค้าทั้งหมด ประเมินร้านที่ได้รับมอบหมาย ดูผลประเมิน วิเคราะห์ และรายงาน',
  SUPER_ADMIN: 'ใช้งานได้ทุกฟังก์ชัน และเป็นผู้กำหนดสิทธิ์การเข้าถึงข้อมูลของทุกระดับ',
};

/**
 * The five access levels in the project brief. Roles sharing a level share the
 * same tier (MENTOR/ASSESSOR/JUDGE are all level-3 staff). The level is
 * descriptive only — it never grants access on its own, permissions do.
 */
export const ROLE_ACCESS_LEVEL: Record<Role, 1 | 2 | 3 | 4 | 5> = {
  VIEWER: 1,
  ENTREPRENEUR: 2,
  MENTOR: 3,
  ASSESSOR: 3,
  JUDGE: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

// ─── Permissions ─────────────────────────────────────────────────────────────
// Single source of truth for every permission — everywhere a permission is
// referenced (ROLE_PERMISSIONS, ROUTE_PERMISSIONS, `can()` calls) should use
// PERMISSIONS.* instead of retyping the 'resource:action' string.
export const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',
  STORE_READ: 'store:read',
  // Read access limited to the fields the project marks disclosable
  // (`publicStoreFields` in the access-control config) — what VIEWER holds
  // instead of the full `store:read`.
  STORE_READ_PUBLIC: 'store:read:public',
  STORE_WRITE: 'store:write',
  STORE_DELETE: 'store:delete',
  // Assigning an assessor/mentor to a store — decides whose ASSIGNED scope a
  // store falls into.
  STORE_ASSIGN: 'store:assign',
  ASSESSMENT_READ: 'assessment:read',
  ASSESSMENT_WRITE: 'assessment:write',
  ASSESSMENT_DELETE: 'assessment:delete',
  ANALYTICS_READ: 'analytics:read',
  PITCHING_READ: 'pitching:read',
  PITCHING_WRITE: 'pitching:write',
  PITCHING_DELETE: 'pitching:delete',
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',
  NEWS_READ: 'news:read',
  NEWS_WRITE: 'news:write',
  NEWS_DELETE: 'news:delete',
  // The user manual — every role holds it by default; it exists as a permission
  // only so ROUTE_PERMISSIONS has an entry to check (canAccessRoute is
  // default-deny, so a route missing from that table is unreachable).
  MANUAL_READ: 'manual:read',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ROLE_PERMISSIONS.SUPER_ADMIN (constants/permissions.ts) spreads this directly
// instead of re-listing every value. Adding a permission to PERMISSIONS above
// is enough to grant it to SUPER_ADMIN; still add it explicitly to any other
// role per auth-permissions.md.
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/**
 * Permissions no role other than SUPER_ADMIN may hold. ADMIN runs the
 * programme, but only SUPER_ADMIN owns the accounts (brief §5) — `hasPermission`
 * re-checks this list independently of ROLE_PERMISSIONS, so user management
 * stays unreachable for every other role even if the table says otherwise.
 */
export const SUPER_ADMIN_ONLY_PERMISSIONS: Permission[] = [
  PERMISSIONS.USERS_READ,
  PERMISSIONS.USERS_WRITE,
  PERMISSIONS.USERS_DELETE,
];

// ─── Data Scope ──────────────────────────────────────────────────────────────
// A permission answers "may this role touch stores at all?"; a scope answers
// "which stores?". MENTOR/ASSESSOR hold assessment:write but only over stores
// assigned to them; ENTREPRENEUR only over the store they own.

export const DATA_SCOPES = {
  ALL: 'ALL',
  ASSIGNED: 'ASSIGNED',
  OWN: 'OWN',
  PUBLIC: 'PUBLIC',
  NONE: 'NONE',
} as const;

export type DataScope = (typeof DATA_SCOPES)[keyof typeof DATA_SCOPES];

export const SCOPED_RESOURCES = {
  STORE: 'store',
  ASSESSMENT: 'assessment',
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
} as const;

export type ScopedResource = (typeof SCOPED_RESOURCES)[keyof typeof SCOPED_RESOURCES];

export type RoleDataScopes = Record<ScopedResource, DataScope>;

// ─── Disclosable Store Fields ────────────────────────────────────────────────
// "ข้อมูลที่ทางโครงการพิจารณาได้ว่าเปิดเผยได้" — the store fields a role scoped
// to PUBLIC (VIEWER) is allowed to see, listed in PUBLIC_STORE_FIELDS.

export const STORE_FIELDS = {
  CODE: 'code',
  NAME: 'name',
  PROVINCE: 'province',
  STORE_TYPE: 'storeType',
  OWNER_NAME: 'ownerName',
  PHONE: 'phone',
  EMAIL: 'email',
  ADDRESS: 'address',
  SOCIAL_LINKS: 'socialLinks',
  AVG_REVENUE: 'avgRevenue',
  MAIN_PROBLEMS: 'mainProblems',
  GOALS: 'goals',
  MENU_PHOTOS: 'menuPhotos',
  STORE_PHOTOS: 'storePhotos',
  DOCUMENTS: 'documents',
  STATUS: 'status',
  LATEST_SCORE: 'latestScore',
} as const;

export type StoreFieldKey = (typeof STORE_FIELDS)[keyof typeof STORE_FIELDS];

// ─── Auth User ────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
