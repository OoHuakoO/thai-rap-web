import {
  Home,
  UtensilsCrossed,
  FileCheck2,
  BarChart3,
  Trophy,
  UserCog,
  Settings,
  BookOpen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role } from '@/types/auth.types'
import { ROUTES } from './routes'

export interface NavItem {
  label: string
  labelTh: string
  href: string
  icon: LucideIcon
  allowedRoles: Role[]
  disabled?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Project Overview',
    labelTh: 'ภาพรวมโครงการ',
    href: ROUTES.HOME,
    icon: Home,
    allowedRoles: ['ADMIN', 'ASSESSOR', 'MENTOR', 'ME_TEAM', 'JUDGE'],
  },
  {
    label: 'Restaurant Profiles',
    labelTh: 'ข้อมูลร้านอาหาร',
    href: ROUTES.STORES,
    icon: UtensilsCrossed,
    allowedRoles: ['ADMIN', 'ENTREPRENEUR'],
  },
  {
    label: 'Restaurant Assessment',
    labelTh: 'แบบประเมินร้าน',
    href: ROUTES.ASSESSMENT,
    icon: FileCheck2,
    allowedRoles: ['ADMIN', 'ASSESSOR'],
  },
  {
    label: 'Performance Analytics',
    labelTh: 'วิเคราะห์ผลการดำเนิน',
    href: ROUTES.ANALYTICS,
    icon: BarChart3,
    allowedRoles: ['ADMIN', 'ASSESSOR', 'MENTOR', 'ME_TEAM', 'ENTREPRENEUR'],
    disabled: true,
  },
  {
    label: 'Pitching & Ranking',
    labelTh: 'คะแนนพิชชิ่ง',
    href: ROUTES.PITCHING,
    icon: Trophy,
    allowedRoles: ['ADMIN', 'ASSESSOR', 'JUDGE', 'ME_TEAM'],
    disabled: true,
  },
  {
    label: 'Reports & Export',
    labelTh: 'รายงานและส่งออก',
    href: ROUTES.REPORTS,
    icon: FileCheck2,
    allowedRoles: ['ADMIN', 'ASSESSOR', 'MENTOR', 'ME_TEAM'],
    disabled: true,
  },
  {
    label: 'Users & Roles',
    labelTh: 'ผู้ใช้งานและสิทธิ์',
    href: ROUTES.USERS,
    icon: UserCog,
    allowedRoles: ['ADMIN', 'ME_TEAM'],
    disabled: true,
  },
  {
    label: 'Settings',
    labelTh: 'ตั้งค่า',
    href: ROUTES.SETTINGS,
    icon: Settings,
    allowedRoles: ['ADMIN'],
    disabled: true,
  },
]

export const NAV_BOTTOM_ITEMS: NavItem[] = [
  {
    label: 'User Manual',
    labelTh: 'คู่มือการใช้งาน',
    href: ROUTES.MANUAL,
    icon: BookOpen,
    allowedRoles: ['ADMIN', 'ASSESSOR', 'MENTOR', 'ENTREPRENEUR', 'JUDGE', 'ME_TEAM'],
    disabled: true,
  },
]

export function getNavItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role))
}

export function getBottomNavItemsForRole(role: Role): NavItem[] {
  return NAV_BOTTOM_ITEMS.filter((item) => item.allowedRoles.includes(role))
}

export function getDefaultRouteForRole(role: Role): string {
  const firstAccessible = getNavItemsForRole(role).find((item) => !item.disabled)
  return firstAccessible?.href ?? ROUTES.HOME
}
