import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  BarChart3,
  Star,
  FileText,
  Users,
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
  children?: Omit<NavItem, 'icon' | 'children'>[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    labelTh: 'ภาพรวมโครงการ',
    href: ROUTES.HOME,
    icon: LayoutDashboard,
    allowedRoles: ['super_admin', 'admin', 'evaluator', 'viewer'],
  },
  {
    label: 'Restaurants',
    labelTh: 'ข้อมูลร้านอาหาร',
    href: ROUTES.RESTAURANTS,
    icon: UtensilsCrossed,
    allowedRoles: ['super_admin', 'admin', 'evaluator', 'viewer'],
  },
  {
    label: 'Assessment',
    labelTh: 'แบบประเมินร้าน',
    href: ROUTES.ASSESSMENT,
    icon: ClipboardList,
    allowedRoles: ['super_admin', 'admin', 'evaluator'],
  },
  {
    label: 'Analytics',
    labelTh: 'วิเคราะห์ผลคะแนน',
    href: ROUTES.ANALYTICS,
    icon: BarChart3,
    allowedRoles: ['super_admin', 'admin', 'evaluator', 'viewer'],
  },
  {
    label: 'Scoring',
    labelTh: 'คะแนนผล',
    href: ROUTES.SCORING,
    icon: Star,
    allowedRoles: ['super_admin', 'admin', 'evaluator'],
  },
  {
    label: 'Reports',
    labelTh: 'รายงาน & ส่งออก',
    href: ROUTES.REPORTS,
    icon: FileText,
    allowedRoles: ['super_admin', 'admin', 'evaluator', 'viewer'],
  },
  {
    label: 'Users',
    labelTh: 'ผู้ใช้งาน & Links',
    href: ROUTES.USERS,
    icon: Users,
    allowedRoles: ['super_admin', 'admin'],
  },
  {
    label: 'Settings',
    labelTh: 'ตั้งค่า',
    href: ROUTES.SETTINGS,
    icon: Settings,
    allowedRoles: ['super_admin', 'admin'],
  },
]

// Bottom nav (help/manual — accessible by all)
export const NAV_BOTTOM_ITEMS: NavItem[] = [
  {
    label: 'User Manual',
    labelTh: 'คู่มือผู้ใช้งาน',
    href: ROUTES.MANUAL,
    icon: BookOpen,
    allowedRoles: ['super_admin', 'admin', 'evaluator', 'viewer'],
  },
]

export function getNavItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role))
}

export function getBottomNavItemsForRole(role: Role): NavItem[] {
  return NAV_BOTTOM_ITEMS.filter((item) => item.allowedRoles.includes(role))
}
