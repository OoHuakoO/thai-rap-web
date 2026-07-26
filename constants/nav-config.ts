import { Megaphone, Settings, ShieldCheck, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '@/types/auth.types';
import { ROLES } from '@/types/auth.types';
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
  disabled?: boolean;
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
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASSESSOR],
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
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ASSESSOR, ROLES.JUDGE, ROLES.ME_TEAM],
    disabled: true,
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
  {
    label: 'Users & Roles',
    labelTh: 'ผู้ใช้งานและสิทธิ์',
    href: ROUTES.USERS,
    icon: UserCog,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ME_TEAM],
  },
  {
    label: 'Access Control',
    labelTh: 'กำหนดสิทธิ์การเข้าถึง',
    href: ROUTES.USER_PERMISSIONS,
    icon: ShieldCheck,
    // SUPER_ADMIN only — the route guard enforces it too, this just hides the link.
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    label: 'Settings',
    labelTh: 'ตั้งค่า',
    href: ROUTES.SETTINGS,
    icon: Settings,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    disabled: true,
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
    disabled: true,
  },
];

export function getNavItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));
}

export function getBottomNavItemsForRole(role: Role): NavItem[] {
  return NAV_BOTTOM_ITEMS.filter((item) => item.allowedRoles.includes(role));
}

export function getDefaultRouteForRole(role: Role): string {
  const firstAccessible = getNavItemsForRole(role).find((item) => !item.disabled);
  return firstAccessible?.href ?? ROUTES.HOME;
}
