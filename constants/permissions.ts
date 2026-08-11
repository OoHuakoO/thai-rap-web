import type {
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
import { ROUTES } from './routes';

// ─── Role → Permissions ──────────────────────────────────────────────────────
// What every role holds. Fixed in code — there is no runtime editor for this
// matrix; changing a role's access is a code change, reviewed like any other.

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
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.NEWS_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ASSESSMENT_WRITE,
    PERMISSIONS.ANALYTICS_READ,
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
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.NEWS_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // ผู้ประกอบการ — manages its own store only (scope OWN), plus everything a
  // VIEWER sees. dashboard:read is what gives it the overview — the API answers
  // every /dashboard/* call for an ENTREPRENEUR with the stores it owns, so the
  // page carries no other store's numbers.
  //
  // reports:read / reports:export at scope OWN: รายงานและส่งออก reads its own
  // result the same way the overview does. The store picker on that page is fed
  // by the already-owner-scoped store list, and the one cross-store report —
  // the dimension matrix — is gated separately on REPORT_DETAIL_ROLES, so this
  // opens its own report and nobody else's.
  //
  // No analytics:read — วิเคราะห์ศักยภาพ stays programme-wide staff tooling. No
  // assessment:read either — the scoring page is staff-only, see
  // ROUTE_PERMISSIONS below.
  ENTREPRENEUR: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.NEWS_READ,
    PERMISSIONS.STORE_READ_PUBLIC,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.STORE_WRITE,
    PERMISSIONS.STORE_DELETE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // กรรมการ Pitching — scores the stores it is assigned, and reads nothing else
  // about them. reports:read / reports:export are here for the พิชชิ่ง scope of
  // รายงานและส่งออก only; every assessment scope of that page is gated
  // separately on REPORT_ASSESSMENT_ROLES, which this role is not in, and the
  // API 403s it from /reports/* anyway.
  //
  // No dashboard:read and no news:read: a judge is a guest on the panel, not a
  // participant in the programme, so ภาพรวมโครงการ and ข่าวประชาสัมพันธ์ are not
  // its business. That makes it the only role without the overview, and
  // getDefaultRouteForRole therefore lands it on คะแนนพิชชิ่ง instead.
  JUDGE: [
    PERMISSIONS.STORE_READ,
    PERMISSIONS.PITCHING_READ,
    PERMISSIONS.PITCHING_WRITE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // ผู้ใช้ทั่วไป — the project overview, ข่าวประชาสัมพันธ์, and the store fields
  // the project discloses. news:read is read-only for every role
  // below the admin pair: news:write / news:delete stay with SUPER_ADMIN and
  // ADMIN, so this role sees announcements and cannot publish one.
  VIEWER: [PERMISSIONS.DASHBOARD_READ, PERMISSIONS.NEWS_READ, PERMISSIONS.STORE_READ_PUBLIC],
};

// ─── Role → Data Scope ───────────────────────────────────────────────────────
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
    // NONE, matching the permissions above — วิเคราะห์ศักยภาพ is staff-only for
    // this role, so there is no record set for it to be scoped to. reports is
    // OWN, not ALL: the role reads รายงานและส่งออก for the stores it owns.
    analytics: DATA_SCOPES.NONE,
    reports: DATA_SCOPES.OWN,
  },

  // ASSIGNED throughout: a judging panel is assembled per store, so a judge
  // reaches the stores a SUPER_ADMIN gave it and no others — the API enforces
  // the same through ASSIGNMENT_SCOPED_ROLES. `reports` is ASSIGNED rather than
  // NONE because the พิชชิ่ง scope of รายงานและส่งออก is its own report.
  JUDGE: {
    store: DATA_SCOPES.ASSIGNED,
    assessment: DATA_SCOPES.NONE,
    analytics: DATA_SCOPES.NONE,
    reports: DATA_SCOPES.ASSIGNED,
  },

  VIEWER: {
    store: DATA_SCOPES.PUBLIC,
    assessment: DATA_SCOPES.NONE,
    analytics: DATA_SCOPES.NONE,
    reports: DATA_SCOPES.NONE,
  },
};

// ─── Public store fields ─────────────────────────────────────────────────────
// Deliberately excludes contact details, revenue, documents and scores. Mirrors
// PublicStoreResult in the API (store/types/store-result.type.ts) — the two must
// change together.

export const PUBLIC_STORE_FIELDS: StoreFieldKey[] = [
  STORE_FIELDS.CODE,
  STORE_FIELDS.NAME,
  STORE_FIELDS.PROVINCE,
  STORE_FIELDS.STORE_TYPE,
  STORE_FIELDS.GOALS,
  STORE_FIELDS.MENU_PHOTOS,
  STORE_FIELDS.STORE_PHOTOS,
  STORE_FIELDS.SOCIAL_LINKS,
  STORE_FIELDS.STATUS,
];

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
    // read-only mode. The role gate sits on top of the permission so that a
    // role given assessment:read for reports or analytics has to be named
    // here before it reaches the scoring page.
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASSESSOR, ROLES.MENTOR],
  },
  { path: ROUTES.ANALYTICS, requiredPermission: PERMISSIONS.ANALYTICS_READ },
  {
    path: ROUTES.PITCHING,
    requiredPermission: PERMISSIONS.PITCHING_READ,
    // The judging panel and the people running it. A role gate on top of the
    // permission so that granting pitching:read to a future read-only seat is a
    // deliberate two-line change, not a side effect.
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.JUDGE],
  },
  {
    // The scoring form is the one pitching page that writes, so it asks for
    // pitching:write rather than the dashboard's pitching:read. Longest match
    // wins in canAccessRoute, so this entry is what /pitching/form is checked
    // against — never the dashboard's, which would let a read-only seat in.
    path: ROUTES.PITCHING_FORM,
    requiredPermission: PERMISSIONS.PITCHING_WRITE,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.JUDGE],
  },
  { path: ROUTES.REPORTS, requiredPermission: PERMISSIONS.REPORTS_READ },
  // Announcements are readable by every role holding news:read — no
  // allowedRoles gate on top. Publishing
  // is not: the two pages that write one require news:write, which only
  // SUPER_ADMIN and ADMIN hold, and they sit below /news so their longer paths
  // win the match below.
  { path: ROUTES.NEWS, requiredPermission: PERMISSIONS.NEWS_READ },
  { path: ROUTES.NEWS_NEW, requiredPermission: PERMISSIONS.NEWS_WRITE },
  { path: ROUTES.NEWS_EDIT_PATTERN, requiredPermission: PERMISSIONS.NEWS_WRITE },
  {
    path: ROUTES.USERS,
    requiredPermission: PERMISSIONS.USERS_READ,
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  // users:* stays SUPER_ADMIN-only independently of the table above, so a bad
  // edit to ROLE_PERMISSIONS can never hand out account management.
  if (SUPER_ADMIN_ONLY_PERMISSIONS.includes(permission) && role !== ROLES.SUPER_ADMIN) {
    return false;
  }
  return getRolePermissions(role).includes(permission);
}

export function getRoleScopes(role: Role): RoleDataScopes {
  return ROLE_DATA_SCOPES[role];
}

export function getDataScope(role: Role, resource: ScopedResource): DataScope {
  return getRoleScopes(role)[resource];
}

export function getPublicStoreFields(): StoreFieldKey[] {
  return PUBLIC_STORE_FIELDS;
}

/**
 * Whether `role` reaches stores through `Store.assignedUsers` — the API's
 * `ASSIGNMENT_SCOPED_ROLES`. Derived from `ROLE_DATA_SCOPES` rather than listed
 * again, so the roles that get the assign dialog and the roles whose store list
 * is narrowed can never drift apart.
 */
export function isAssignmentScopedRole(role: Role): boolean {
  return getDataScope(role, 'store') === DATA_SCOPES.ASSIGNED;
}

/**
 * Whether `role` may see a given store field. Roles scoped to PUBLIC (VIEWER)
 * see only the fields the project discloses; any wider scope sees the full
 * record.
 */
export function canViewStoreField(role: Role, field: StoreFieldKey): boolean {
  if (getDataScope(role, 'store') !== DATA_SCOPES.PUBLIC) return true;
  return getPublicStoreFields().includes(field);
}

/**
 * Whether a visited path is covered by a ROUTE_PERMISSIONS entry. A plain entry
 * covers itself and everything under it (/users also covers /users/42); an entry
 * carrying `:param` segments (/news/:id/edit) matches segment by segment and
 * only at its own depth, since a placeholder has no fixed prefix to grow from.
 */
function matchesRoutePath(configPath: string, path: string): boolean {
  if (!configPath.includes(':')) {
    return path === configPath || path.startsWith(`${configPath}/`);
  }
  const configSegments = configPath.split('/');
  const pathSegments = path.split('/');
  if (configSegments.length !== pathSegments.length) return false;
  return configSegments.every(
    (segment, i) => segment.startsWith(':') || segment === pathSegments[i]
  );
}

export function canAccessRoute(role: Role, path: string): boolean {
  // Longest match wins so a nested route (/users/permissions) is checked
  // against its own entry instead of its parent's (/users).
  const config = ROUTE_PERMISSIONS.filter((r) => {
    if (r.path === ROUTES.HOME) return path === ROUTES.HOME;
    return matchesRoutePath(r.path, path);
  }).sort((a, b) => b.path.length - a.path.length)[0];

  if (!config) return false;
  if (config.allowedRoles && !config.allowedRoles.includes(role)) return false;
  return hasPermission(role, config.requiredPermission);
}
