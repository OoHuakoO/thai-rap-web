import { PERMISSIONS } from '@/types/auth.types';
import type { PermissionGroup, PermissionLabels } from '../types/access-control.types';

// Thai label per permission — the matrix rows. Every value of PERMISSIONS must
// appear here; the Record type makes a missing one a compile error.
export const PERMISSION_LABELS: PermissionLabels = {
  'dashboard:read': 'ดูภาพรวมโครงการ',
  'store:read': 'ดูข้อมูลร้านค้าทั้งหมด',
  'store:read:public': 'ดูข้อมูลร้านเฉพาะที่เปิดเผย',
  'store:write': 'เพิ่ม/แก้ไขข้อมูลร้าน',
  'store:delete': 'ลบข้อมูลร้าน',
  'store:assign': 'มอบหมายผู้ประเมินให้ร้าน',
  'assessment:read': 'ดูผลการประเมิน',
  'assessment:write': 'ประเมินร้าน',
  'assessment:delete': 'ลบผลการประเมิน',
  'analytics:read': 'ดูการวิเคราะห์ศักยภาพ',
  'pitching:read': 'ดูคะแนน Pitching',
  'pitching:write': 'ให้คะแนน Pitching',
  'pitching:delete': 'ลบคะแนน Pitching',
  'reports:read': 'ดูรายงาน',
  'reports:export': 'ส่งออกรายงาน',
  'news:read': 'ดูข่าวประชาสัมพันธ์',
  'news:write': 'เขียน/แก้ไขข่าว',
  'news:delete': 'ลบข่าว',
  'users:read': 'ดูรายชื่อผู้ใช้งาน',
  'users:write': 'เพิ่ม/แก้ไขผู้ใช้งาน',
  'users:delete': 'ลบผู้ใช้งาน',
  'settings:read': 'ดูการตั้งค่าระบบ',
  'settings:write': 'แก้ไขการตั้งค่าระบบ',
  'permissions:manage': 'กำหนดสิทธิ์การเข้าถึงของทุกระดับ',
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'dashboard',
    label: 'ภาพรวมโครงการ',
    permissions: [PERMISSIONS.DASHBOARD_READ],
  },
  {
    key: 'store',
    label: 'ข้อมูลร้านค้า',
    permissions: [
      PERMISSIONS.STORE_READ_PUBLIC,
      PERMISSIONS.STORE_READ,
      PERMISSIONS.STORE_WRITE,
      PERMISSIONS.STORE_DELETE,
      PERMISSIONS.STORE_ASSIGN,
    ],
  },
  {
    key: 'assessment',
    label: 'การประเมินร้าน',
    permissions: [
      PERMISSIONS.ASSESSMENT_READ,
      PERMISSIONS.ASSESSMENT_WRITE,
      PERMISSIONS.ASSESSMENT_DELETE,
    ],
  },
  {
    key: 'analytics',
    label: 'วิเคราะห์และรายงาน',
    permissions: [
      PERMISSIONS.ANALYTICS_READ,
      PERMISSIONS.REPORTS_READ,
      PERMISSIONS.REPORTS_EXPORT,
    ],
  },
  {
    key: 'pitching',
    label: 'Pitching',
    permissions: [
      PERMISSIONS.PITCHING_READ,
      PERMISSIONS.PITCHING_WRITE,
      PERMISSIONS.PITCHING_DELETE,
    ],
  },
  {
    key: 'news',
    label: 'ข่าวประชาสัมพันธ์',
    permissions: [PERMISSIONS.NEWS_READ, PERMISSIONS.NEWS_WRITE, PERMISSIONS.NEWS_DELETE],
  },
  {
    key: 'users',
    label: 'ผู้ใช้งานและระบบ',
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_WRITE,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.SETTINGS_READ,
      PERMISSIONS.SETTINGS_WRITE,
      PERMISSIONS.PERMISSIONS_MANAGE,
    ],
  },
];
