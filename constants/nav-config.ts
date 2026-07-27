import { Megaphone, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '@/types/auth.types';
import { ROLES } from '@/types/auth.types';
import { canAccessRoute } from './permissions';
import { ROUTES } from './routes';

export const NAV_ICONS = {
  overview: '/icons/nav/overview.png',
  stores: '/icons/nav/stores.png',
  assessment: '/icons/nav/assessment.png',
  analytics: '/icons/nav/analytics.png',
  pitching: '/icons/nav/pitching.png',
  reports: '/icons/nav/reports.png',
  manual: '/icons/nav/manual.png',
} as const;

/** A brand icon asset path from `NAV_ICONS`, or a Lucide component for items with no asset yet. */
export type NavIcon = string | LucideIcon;

export interface NavItem {
  label: string;
  labelTh: string;
  href: string;
  icon: NavIcon;
  allowedRoles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Project Overview',
    labelTh: 'ภาพรวมโครงการ',
    href: ROUTES.HOME,
    icon: NAV_ICONS.overview,
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.ASSESSOR,
      ROLES.MENTOR,
      ROLES.ME_TEAM,
      ROLES.JUDGE,
      ROLES.ENTREPRENEUR,
      ROLES.VIEWER,
    ],
  },
  {
    label: 'Restaurant Profiles',
    labelTh: 'ข้อมูลร้านอาหาร',
    href: ROUTES.STORES,
    icon: NAV_ICONS.stores,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ENTREPRENEUR],
  },
  {
    label: 'Restaurant Assessment',
    labelTh: 'แบบประเมินร้าน',
    href: ROUTES.ASSESSMENT,
    icon: NAV_ICONS.assessment,
    // MENTOR belongs here on assessment:read alone — "แบบ 50 ข้อ" §3.4 gives it
    // "ดูผลประเมินรายร้าน", and the form renders read-only without
    // assessment:write.
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASSESSOR, ROLES.MENTOR],
  },
  {
    label: 'Performance Analytics',
    labelTh: 'วิเคราะห์ศักยภาพ',
    href: ROUTES.ANALYTICS,
    icon: NAV_ICONS.analytics,
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.ASSESSOR,
      ROLES.MENTOR,
      ROLES.ME_TEAM,
      ROLES.ENTREPRENEUR,
    ],
  },
  {
    label: 'Pitching & Ranking',
    labelTh: 'คะแนนพิชชิ่ง',
    href: ROUTES.PITCHING,
    icon: NAV_ICONS.pitching,
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.ASSESSOR,
      ROLES.MENTOR,
      ROLES.JUDGE,
      ROLES.ME_TEAM,
    ],
  },
  {
    label: 'Reports & Export',
    labelTh: 'รายงานและส่งออก',
    href: ROUTES.REPORTS,
    icon: NAV_ICONS.reports,
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.ASSESSOR,
      ROLES.MENTOR,
      ROLES.ME_TEAM,
      ROLES.ENTREPRENEUR,
    ],
  },
  {
    label: 'News & Announcements',
    labelTh: 'ข่าวประชาสัมพันธ์',
    href: ROUTES.NEWS,
    icon: Megaphone,
    // Admin roles only — the route guard enforces it too, this just hides the link.
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  // Users & Roles (/users) and Access Control (/users/permissions) are
  // deliberately absent. Both pages are built and both are SUPER_ADMIN-only,
  // but the API they call does not exist yet — thai-rap-api registers no
  // `users` and no `access-control` controller, so opening either one 404s.
  // Linking them from the sidebar would only advertise a dead end.
  //
  // Their ROUTE_PERMISSIONS entries stay in place, so restoring the links is
  // just re-adding two NAV_ITEMS entries here once the endpoints ship:
  //   { label: 'Users & Roles', labelTh: 'ผู้ใช้งานและสิทธิ์',
  //     href: ROUTES.USERS, icon: UserCog, allowedRoles: [ROLES.SUPER_ADMIN] }
  //   { label: 'Access Control', labelTh: 'กำหนดสิทธิ์การเข้าถึง',
  //     href: ROUTES.USER_PERMISSIONS, icon: ShieldCheck, allowedRoles: [ROLES.SUPER_ADMIN] }
  {
    label: 'Settings',
    labelTh: 'ตั้งค่า',
    href: ROUTES.SETTINGS,
    icon: Settings,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
];

export const NAV_BOTTOM_ITEMS: NavItem[] = [
  {
    label: 'User Manual',
    labelTh: 'คู่มือการใช้งาน',
    href: ROUTES.MANUAL,
    icon: NAV_ICONS.manual,
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.ASSESSOR,
      ROLES.MENTOR,
      ROLES.ENTREPRENEUR,
      ROLES.JUDGE,
      ROLES.ME_TEAM,
      ROLES.VIEWER,
    ],
  },
];

export function getNavItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));
}

export function getBottomNavItemsForRole(role: Role): NavItem[] {
  return NAV_BOTTOM_ITEMS.filter((item) => item.allowedRoles.includes(role));
}

/**
 * Where to send a role when it has no specific destination — after login, or
 * after being bounced off a route it may not see.
 *
 * `allowedRoles` on a nav item only decides whether the link is *shown*; the
 * route guard runs `canAccessRoute()` against the SUPER_ADMIN-defined matrix,
 * which can be narrower. Re-checking here keeps the two in step: without it, a
 * revoked permission leaves this returning a route the guard rejects, and the
 * dashboard layout redirects to it forever.
 *
 * Falls back to 403 rather than HOME because HOME is itself permission-gated
 * (`dashboard:read`) — returning it for a role that lacks it would restart the
 * same loop. `/errors/403` sits outside both route groups, so nothing guards it.
 */
export function getDefaultRouteForRole(role: Role): string {
  const firstAccessible = getNavItemsForRole(role).find((item) =>
    canAccessRoute(role, item.href)
  );
  return firstAccessible?.href ?? ROUTES.ERROR_403;
}

/**
 * Post-login destination: the path the guard bounced the user off (`?next=`)
 * when it is safe and the role may see it, otherwise the role's default route.
 *
 * `next` arrives from a query string, so it is treated as untrusted: only a
 * same-origin absolute path is accepted (a protocol-relative `//evil.com` would
 * otherwise be an open redirect), and it must still pass the route guard.
 */
export function resolvePostLoginRoute(role: Role, next?: string | null): string {
  const isSameOriginPath = !!next && next.startsWith('/') && !next.startsWith('//');
  if (isSameOriginPath && canAccessRoute(role, next)) return next;
  return getDefaultRouteForRole(role);
}
