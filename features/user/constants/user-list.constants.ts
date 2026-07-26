import { ROLE_LABELS, ROLE_DISPLAY_ORDER } from '@/types/auth.types';
import type { Role } from '@/types/auth.types';
import { USER_STATUSES, USER_STATUS_LABELS } from '../types/user.types';
import type { UserStatus } from '../types/user.types';

export const USER_LIST_TEXT = {
  pageTitle: 'ผู้ใช้งานและสิทธิ์',
  pageDescription: 'จัดการบัญชีผู้ใช้และกำหนดระดับการเข้าถึงข้อมูลของแต่ละคน',
  addUser: 'เพิ่มผู้ใช้งาน',
  managePermissions: 'กำหนดสิทธิ์การเข้าถึง',
  searchPlaceholder: 'ค้นหาชื่อหรืออีเมล',
  filterAllRoles: 'ทุกระดับผู้ใช้',
  filterAllStatuses: 'ทุกสถานะ',
  loadError: 'โหลดรายชื่อผู้ใช้งานไม่สำเร็จ',
  empty: 'ไม่พบผู้ใช้งาน',
  total: (count: number) => `ทั้งหมด ${count} คน`,

  columnName: 'ชื่อ-นามสกุล',
  columnRole: 'ระดับผู้ใช้',
  columnOrganization: 'หน่วยงาน',
  columnPhone: 'เบอร์ติดต่อ',
  columnScope: 'ขอบเขตข้อมูล',
  columnStatus: 'สถานะ',
  columnLastLogin: 'เข้าใช้ล่าสุด',
  columnActions: '',

  assignedCount: (count: number) => `${count} ร้าน`,
  neverLoggedIn: 'ยังไม่เคยเข้าใช้',
  deleteTitle: 'ลบผู้ใช้งาน',
  deleteDescription: (name: string) =>
    `ต้องการลบผู้ใช้ "${name}" ใช่หรือไม่? การลบไม่สามารถกู้คืนได้`,
  deleteConfirmLabel: 'ลบ',
  deleteSuccess: 'ลบผู้ใช้งานแล้ว',
  roleChangeSuccess: 'เปลี่ยนระดับผู้ใช้แล้ว',
} as const;

export const USER_ROLE_FILTER_OPTIONS: { value: Role; label: string }[] = ROLE_DISPLAY_ORDER.map(
  (role) => ({ value: role, label: ROLE_LABELS[role] })
);

export const USER_STATUS_FILTER_OPTIONS: { value: UserStatus; label: string }[] = Object.values(
  USER_STATUSES
).map((status) => ({ value: status, label: USER_STATUS_LABELS[status] }));

/** Filter selects can't hold an empty string as a value, so "all" needs a sentinel. */
export const FILTER_ALL_VALUE = 'ALL';
