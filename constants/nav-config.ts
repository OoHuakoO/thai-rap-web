import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  BarChart3,
  Trophy,
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
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    labelTh: 'ภาพรวมโครงการ',
    href: ROUTES.HOME,
    icon: LayoutDashboard,
    allowedRoles: ['admin', 'assessor', 'mentor', 'me_team', 'judge'],
  },
  {
    label: 'Stores',
    labelTh: 'ข้อมูลร้านอาหาร',
    href: ROUTES.STORES,
    icon: UtensilsCrossed,
    allowedRoles: ['admin', 'assessor', 'mentor', 'me_team', 'entrepreneur'],
  },
  {
    label: 'Assessment',
    labelTh: 'แบบประเมินร้าน',
    href: ROUTES.ASSESSMENT,
    icon: ClipboardList,
    allowedRoles: ['admin', 'assessor'],
  },
  {
    label: 'Analytics',
    labelTh: 'วิเคราะห์ศักยภาพ',
    href: ROUTES.ANALYTICS,
    icon: BarChart3,
    allowedRoles: ['admin', 'assessor', 'mentor', 'me_team', 'entrepreneur'],
  },
  {
    label: 'Pitching',
    labelTh: 'คะแนนพิชชิ่ง',
    href: ROUTES.PITCHING,
    icon: Trophy,
    allowedRoles: ['admin', 'assessor', 'judge', 'me_team'],
  },
  {
    label: 'Reports',
    labelTh: 'รายงานและส่งออก',
    href: ROUTES.REPORTS,
    icon: FileText,
    allowedRoles: ['admin', 'assessor', 'mentor', 'me_team'],
  },
  {
    label: 'Users',
    labelTh: 'ผู้ใช้งานและสิทธิ์',
    href: ROUTES.USERS,
    icon: Users,
    allowedRoles: ['admin', 'me_team'],
  },
  {
    label: 'Settings',
    labelTh: 'ตั้งค่า',
    href: ROUTES.SETTINGS,
    icon: Settings,
    allowedRoles: ['admin'],
  },
]

export const NAV_BOTTOM_ITEMS: NavItem[] = [
  {
    label: 'User Manual',
    labelTh: 'คู่มือผู้ใช้งาน',
    href: ROUTES.MANUAL,
    icon: BookOpen,
    allowedRoles: ['admin', 'assessor', 'mentor', 'entrepreneur', 'judge', 'me_team'],
  },
]

export function getNavItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role))
}

export function getBottomNavItemsForRole(role: Role): NavItem[] {
  return NAV_BOTTOM_ITEMS.filter((item) => item.allowedRoles.includes(role))
}
