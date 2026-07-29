import { ROLE_LABELS, ROLE_DISPLAY_ORDER } from '@/types/auth.types';
import type { Role } from '@/types/auth.types';
import { USER_STATUSES, USER_STATUS_LABELS } from '../types/user.types';
import type { UserStatus } from '../types/user.types';

export const USER_LIST_TEXT = {
  pageTitle: 'ผู้ใช้งานและสิทธิ์',
  pageDescription: 'อนุมัติผู้สมัครใหม่ มอบหมายร้านให้ผู้ประเมิน และกำหนดเจ้าของร้านให้ผู้ประกอบการ',
  managePermissions: 'กำหนดสิทธิ์การเข้าถึง',
  searchPlaceholder: 'ค้นหาชื่อหรืออีเมล',
  filterAllRoles: 'ทุกระดับผู้ใช้',
  filterAllStatuses: 'ทุกสถานะ',
  loadError: 'โหลดรายชื่อผู้ใช้งานไม่สำเร็จ',
  empty: 'ไม่พบผู้ใช้งาน',
  total: (count: number) => `ทั้งหมด ${count} คน`,

  columnName: 'ชื่อ-นามสกุล',
  columnRole: 'ระดับผู้ใช้',
  columnStores: 'ร้านที่เกี่ยวข้อง',
  columnStatus: 'สถานะ',
  columnLastLogin: 'เข้าใช้ล่าสุด',
  columnActions: '',

  neverLoggedIn: 'ยังไม่เคยเข้าใช้',
  noStores: 'ยังไม่ได้มอบหมาย',
  assignedCount: (count: number) => `ประเมินได้ ${count} ร้าน`,
  ownedCount: (count: number) => `เป็นเจ้าของ ${count} ร้าน`,

  approveAction: 'อนุมัติ',
  approveTitle: 'อนุมัติผู้ใช้งาน',
  approveDescription: (name: string) =>
    `อนุมัติให้ "${name}" เข้าใช้งานระบบใช่หรือไม่? หลังอนุมัติจะเข้าสู่ระบบได้ทันที`,
  approveConfirmLabel: 'อนุมัติ',
  approveSuccess: 'อนุมัติผู้ใช้งานแล้ว',

  suspendAction: 'ระงับการใช้งาน',
  rejectAction: 'ปฏิเสธคำขอ',
  suspendTitle: 'ระงับการใช้งาน',
  suspendDescription: (name: string) =>
    `ระงับบัญชี "${name}" ใช่หรือไม่? ผู้ใช้จะถูกออกจากระบบทันทีและเข้าสู่ระบบไม่ได้อีก`,
  rejectDescription: (name: string) =>
    `ปฏิเสธคำขอสมัครของ "${name}" ใช่หรือไม่? บัญชีจะถูกระงับและเข้าสู่ระบบไม่ได้`,
  suspendConfirmLabel: 'ยืนยัน',
  suspendSuccess: 'ระงับบัญชีแล้ว',

  deleteTitle: 'ลบผู้ใช้งาน',
  deleteDescription: (name: string) =>
    `ต้องการลบผู้ใช้ "${name}" ใช่หรือไม่? การลบไม่สามารถกู้คืนได้`,
  deleteConfirmLabel: 'ลบ',
  deleteSuccess: 'ลบผู้ใช้งานแล้ว',
  roleChangeSuccess: 'เปลี่ยนระดับผู้ใช้แล้ว',

  pendingBannerTitle: (count: number) => `มีผู้สมัคร ${count} คนรออนุมัติ`,
  pendingBannerMessage: 'ผู้สมัครใหม่จะเข้าสู่ระบบไม่ได้จนกว่าผู้ดูแลระบบสูงสุดจะอนุมัติ',
  statTotal: 'ผู้ใช้งานทั้งหมด',
  statPending: 'รออนุมัติ',
  statActive: 'ใช้งานอยู่',
  statSuspended: 'ถูกระงับ',
} as const;

export const USER_ROLE_FILTER_OPTIONS: { value: Role; label: string }[] = ROLE_DISPLAY_ORDER.map(
  (role) => ({ value: role, label: ROLE_LABELS[role] })
);

export const USER_STATUS_FILTER_OPTIONS: { value: UserStatus; label: string }[] = Object.values(
  USER_STATUSES
).map((status) => ({ value: status, label: USER_STATUS_LABELS[status] }));

/** Filter selects can't hold an empty string as a value, so "all" needs a sentinel. */
export const FILTER_ALL_VALUE = 'ALL';

export const DEFAULT_USER_PAGE_LIMIT = 10;
