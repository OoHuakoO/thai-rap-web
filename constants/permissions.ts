import type {
  AccessControlConfig,
  DataScope,
  Permission,
  Role,
  RoleDataScopes,
  ScopedResource,
  StoreFieldKey,
} from '@/types/auth.types';
import {
  ALL_PERMISSIONS,
  DATA_SCOPES,
  PERMISSIONS,
  ROLES,
  STORE_FIELDS,
  SUPER_ADMIN_ONLY_PERMISSIONS,
} from '@/types/auth.types';
import { useAccessControlStore } from '@/stores/access-control-store';
import { ROUTES } from './routes';

// ─── Role → Permissions (defaults) ───────────────────────────────────────────
// The factory matrix — what every role holds before SUPER_ADMIN customises it
// on /users/permissions. Reads go through getRolePermissions() below, which
// prefers the saved config and falls back here.

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // Spread the single source of truth (types/auth.types.ts) instead of
  // re-listing every value.
  SUPER_ADMIN: [...ALL_PERMISSIONS],

  // Everything SUPER_ADMIN has except user management and defining access
  // itself — ADMIN runs the programme, SUPER_ADMIN owns the accounts and
  // decides who may access what.
  ADMIN: ALL_PERMISSIONS.filter((p) => !SUPER_ADMIN_ONLY_PERMISSIONS.includes(p)),

  // ผู้ติดตาม / Assessor — the one staff role that scores. Brief "แบบ 50 ข้อ"
  // §3.3 + §16: ประเมิน 50 ข้อ, ตรวจหลักฐาน, บันทึก Red Flag, and on the store
  // itself only "ดูร้านที่รับผิดชอบ" — no store editing, which is why
  // STORE_WRITE is absent (the API has always rejected it: StoreService allows
  // writes from admin roles and the owning ENTREPRENEUR only).
  ASSESSOR: [
    PERMISSIONS.MANUAL_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ASSESSMENT_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.PITCHING_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // ที่ปรึกษา / Mentor — "แบบ 50 ข้อ" §3.4 lists eight rights and every one is a
  // read plus its own IDP work; §3.3 gives "ประเมินร้าน 50 ข้อ / ให้คะแนน T0–T4"
  // to ผู้ติดตาม/Assessor alone. So ASSESSMENT_READ, never ASSESSMENT_WRITE.
  //
  // A mentor does write — ข้อเสนอแนะจาก Mentor on the report, หมายเหตุ Mentor on
  // the portfolio, the IDP and Mentoring Log (§8) — but all of that lives on
  // pages this app has not built yet. Granting ASSESSMENT_WRITE is not the way
  // to give it a text box; those pages are.
  MENTOR: [
    PERMISSIONS.MANUAL_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.PITCHING_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // ผู้ประกอบการ — manages its own store only (scope OWN), plus everything a
  // VIEWER sees. Reports are included because the brief gives a store access to
  // its own assessment reports — scoped to OWN below, so it still never sees
  // another store's, and reports/analytics are where it reads its own result
  // ("ดูผลประเมินของตนเอง"). dashboard:read is the same deal: the API answers
  // every /dashboard/* call for an ENTREPRENEUR with the stores it owns, so the
  // overview page carries no other store's numbers. No assessment:read — the
  // scoring page itself is staff-only, see ROUTE_PERMISSIONS below.
  ENTREPRENEUR: [
    PERMISSIONS.MANUAL_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STORE_READ_PUBLIC,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.STORE_WRITE,
    PERMISSIONS.STORE_DELETE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // กรรมการ Pitching — pitching scoring + view dashboard/store for context
  JUDGE: [
    PERMISSIONS.MANUAL_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.PITCHING_READ,
    PERMISSIONS.PITCHING_WRITE,
  ],

  // ทีม M&E — monitor all, view reports, no write. It reads results through
  // analytics and reports ("วิเคราะห์ผลก่อน–หลัง"), not the scoring page, so no
  // assessment:read.
  ME_TEAM: [
    PERMISSIONS.MANUAL_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.PITCHING_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // ผู้ใช้ทั่วไป — the project overview, the manual, and the store fields the
  // project discloses. dashboard:read is what gives this role a landing page at
  // all: ข่าวประชาสัมพันธ์ went admin-only, and it was the only other NAV_ITEMS
  // entry VIEWER had.
  VIEWER: [PERMISSIONS.DASHBOARD_READ, PERMISSIONS.MANUAL_READ, PERMISSIONS.STORE_READ_PUBLIC],
};

// ─── Role → Data Scope (defaults) ────────────────────────────────────────────
// Which records a role's permissions apply to. `assessment: ASSIGNED` is what
// makes "ประเมินได้เฉพาะร้านที่ตนเองได้รับมอบหมาย" true for MENTOR/ASSESSOR/ADMIN.

const ALL_SCOPES: RoleDataScopes = {
  store: DATA_SCOPES.ALL,
  assessment: DATA_SCOPES.ALL,
  analytics: DATA_SCOPES.ALL,
  reports: DATA_SCOPES.ALL,
};

const ASSIGNED_SCOPES: RoleDataScopes = {
  store: DATA_SCOPES.ASSIGNED,
  assessment: DATA_SCOPES.ASSIGNED,
  analytics: DATA_SCOPES.ASSIGNED,
  reports: DATA_SCOPES.ASSIGNED,
};

export const ROLE_DATA_SCOPES: Record<Role, RoleDataScopes> = {
  SUPER_ADMIN: { ...ALL_SCOPES },

  // Manages every store, but only evaluates the ones assigned to them (brief §4).
  ADMIN: { ...ALL_SCOPES, assessment: DATA_SCOPES.ASSIGNED },

  ASSESSOR: { ...ASSIGNED_SCOPES },

  MENTOR: { ...ASSIGNED_SCOPES },

  ENTREPRENEUR: {
    store: DATA_SCOPES.OWN,
    assessment: DATA_SCOPES.OWN,
    analytics: DATA_SCOPES.OWN,
    // Its own assessment reports — per-T and the all-T overview — never another
    // store's. The API enforces the same rule on every /reports/stores/:id call.
    reports: DATA_SCOPES.OWN,
  },

  JUDGE: {
    store: DATA_SCOPES.ASSIGNED,
    assessment: DATA_SCOPES.NONE,
    analytics: DATA_SCOPES.NONE,
    reports: DATA_SCOPES.NONE,
  },

  ME_TEAM: { ...ALL_SCOPES },

  VIEWER: {
    store: DATA_SCOPES.PUBLIC,
    assessment: DATA_SCOPES.NONE,
    analytics: DATA_SCOPES.NONE,
    reports: DATA_SCOPES.NONE,
  },
};

// ─── Public store fields (defaults) ──────────────────────────────────────────
// Deliberately excludes contact details, revenue, documents and scores — those
// are opt-in, and the admin page flags them as sensitive when disclosed.

export const PUBLIC_STORE_FIELDS: StoreFieldKey[] = [
  STORE_FIELDS.NAME,
  STORE_FIELDS.PROVINCE,
  STORE_FIELDS.STORE_TYPE,
  STORE_FIELDS.GOALS,
  STORE_FIELDS.MENU_PHOTOS,
  STORE_FIELDS.STORE_PHOTOS,
  STORE_FIELDS.SOCIAL_LINKS,
  STORE_FIELDS.STATUS,
];

/** The factory config — what "รีเซ็ตเป็นค่าเริ่มต้น" on the admin page restores. */
export const DEFAULT_ACCESS_CONTROL: Pick<
  AccessControlConfig,
  'rolePermissions' | 'roleScopes' | 'publicStoreFields'
> = {
  rolePermissions: ROLE_PERMISSIONS,
  roleScopes: ROLE_DATA_SCOPES,
  publicStoreFields: PUBLIC_STORE_FIELDS,
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
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ENTREPRENEUR],
  },
  {
    path: ROUTES.ASSESSMENT,
    requiredPermission: PERMISSIONS.ASSESSMENT_READ,
    // Staff only. MENTOR is here on read alone — it opens the same page in
    // read-only mode. The role gate sits on top of the permission so a saved
    // matrix handing assessment:read to a store or the M&E team still can't
    // open the scoring page; they read results via reports/analytics instead.
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASSESSOR, ROLES.MENTOR],
  },
  { path: ROUTES.ANALYTICS, requiredPermission: PERMISSIONS.ANALYTICS_READ },
  { path: ROUTES.PITCHING, requiredPermission: PERMISSIONS.PITCHING_READ },
  { path: ROUTES.REPORTS, requiredPermission: PERMISSIONS.REPORTS_READ },
  {
    path: ROUTES.NEWS,
    requiredPermission: PERMISSIONS.NEWS_READ,
    // Admin roles only — publishing and reading announcements both belong to
    // whoever runs the programme. The role gate sits on top of the permission
    // so a saved matrix granting news:read to anyone else still can't open it.
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    path: ROUTES.USERS,
    requiredPermission: PERMISSIONS.USERS_READ,
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    path: ROUTES.USER_PERMISSIONS,
    requiredPermission: PERMISSIONS.PERMISSIONS_MANAGE,
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  { path: ROUTES.SETTINGS, requiredPermission: PERMISSIONS.SETTINGS_READ },
  { path: ROUTES.MANUAL, requiredPermission: PERMISSIONS.MANUAL_READ },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Effective permissions for a role: the SUPER_ADMIN-defined matrix once one has
 * been loaded, the defaults above otherwise. Reading the store through
 * getState() keeps this a plain function usable from route guards.
 */
export function getRolePermissions(role: Role): Permission[] {
  return useAccessControlStore.getState().rolePermissions?.[role] ?? ROLE_PERMISSIONS[role];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  // permissions:manage stays SUPER_ADMIN-only whatever the saved matrix says —
  // a bad config must never be able to hand out the keys.
  if (SUPER_ADMIN_ONLY_PERMISSIONS.includes(permission) && role !== ROLES.SUPER_ADMIN) {
    return false;
  }
  return getRolePermissions(role).includes(permission);
}

export function getRoleScopes(role: Role): RoleDataScopes {
  return useAccessControlStore.getState().roleScopes?.[role] ?? ROLE_DATA_SCOPES[role];
}

export function getDataScope(role: Role, resource: ScopedResource): DataScope {
  return getRoleScopes(role)[resource];
}

export function getPublicStoreFields(): StoreFieldKey[] {
  return useAccessControlStore.getState().publicStoreFields ?? PUBLIC_STORE_FIELDS;
}

/**
 * Whether `role` may see a given store field. Roles scoped to PUBLIC (VIEWER by
 * default) see only the fields the project discloses; any wider scope sees the
 * full record.
 */
export function canViewStoreField(role: Role, field: StoreFieldKey): boolean {
  if (getDataScope(role, 'store') !== DATA_SCOPES.PUBLIC) return true;
  return getPublicStoreFields().includes(field);
}

export function canAccessRoute(role: Role, path: string): boolean {
  // Longest match wins so a nested route (/users/permissions) is checked
  // against its own entry instead of its parent's (/users).
  const config = ROUTE_PERMISSIONS.filter((r) => {
    if (r.path === ROUTES.HOME) return path === ROUTES.HOME;
    return path === r.path || path.startsWith(`${r.path}/`);
  }).sort((a, b) => b.path.length - a.path.length)[0];

  if (!config) return false;
  if (config.allowedRoles && !config.allowedRoles.includes(role)) return false;
  return hasPermission(role, config.requiredPermission);
}
