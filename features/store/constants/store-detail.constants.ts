// Display text and labels for the store detail page.

import type { StatusVariant } from '@/components/shared/status-badge';
import type { StoreStatus } from '../types/store.types';

export const STORE_DETAIL_STATUS_VARIANT: Record<StoreStatus, StatusVariant> = {
  REGISTERED: 'new',
  T0_COMPLETED: 'pending',
  CAMP_COMPLETED: 'pending',
  T1_COMPLETED: 'pending',
  PITCHING_COMPLETED: 'pending',
  SELECTED: 'pass',
  CONDITIONAL_SELECTED: 'warning',
  WAITING_LIST: 'pending',
  NOT_SELECTED: 'fail',
  FIELD_AUDITED: 'pending',
  IDP_CREATED: 'pending',
  COMPLETED: 'active',
};

// Statuses past the pitching stage where the store has a final decision —
// used to mark the "รอประกาศผลการคัดเลือก" timeline step as done.
export const DECIDED_STORE_STATUSES: StoreStatus[] = [
  'SELECTED',
  'CONDITIONAL_SELECTED',
  'WAITING_LIST',
  'NOT_SELECTED',
];

// How many items the compact (side-panel) view shows before "ดูทั้งหมด".
export const COMPACT_DOC_LIMIT = 3;
export const COMPACT_MENU_PHOTO_LIMIT = 4;
export const COMPACT_STORE_PHOTO_LIMIT = 4;

export const STORE_DETAIL_TEXT = {
  notFound: 'ไม่พบร้านนี้',
  editStoreTitle: 'แก้ไขร้าน',

  contactInfoTitle: 'ข้อมูลติดต่อ',
  ownerNameLabel: 'เจ้าของร้าน',
  phoneLabel: 'เบอร์โทร',
  emailLabel: 'อีเมล',
  emailEmpty: 'ยังไม่ระบุ',
  addressLabel: 'ที่อยู่',
  avgRevenueLabel: 'ยอดขายเฉลี่ย/เดือน',
  avgRevenueRangeSeparator: '–',
  avgRevenueEmpty: 'ยังไม่ระบุ',
  currencyUnit: 'บาท',

  onlineChannelsLabel: 'ช่องทางออนไลน์',
  onlineChannelsEmpty: 'ยังไม่มีช่องทางออนไลน์',
  viewMoreLabel: 'ดูเพิ่มเติม',
  viewAllLabel: 'ดูทั้งหมด',
  viewPhotoLabel: (label: string) => `ดู${label}`,
  facebookTitle: 'Facebook',
  lineTitle: 'LINE',
  instagramTitle: 'Instagram',

  mainProblemsTitle: 'ปัญหาสำคัญ',
  mainProblemsEmpty: 'ยังไม่มีข้อมูลปัญหาสำคัญ',
  goalsTitle: 'เป้าหมายการพัฒนา',
  goalsEmpty: 'ยังไม่มีข้อมูลเป้าหมายการพัฒนา',

  storePhotosTitle: 'รูปร้านค้า',
  storePhotoAlt: 'รูปร้านค้า',
  storePhotoGalleryEmpty: 'ยังไม่มีรูปเพิ่มเติม',

  documentsTitle: 'เอกสารที่อัปโหลด',
  documentsEmpty: 'ยังไม่มีเอกสารอัปโหลด',

  menuPhotosTitle: 'ภาพเมนูอาหาร',
  menuPhotoAlt: 'ภาพเมนูอาหาร',
  menuPhotosEmpty: 'ยังไม่มีภาพเมนูอาหาร',

  progressStatusTitle: 'สถานะการเข้าร่วมโครงการ',
  assessmentSectionTitle: 'ประเมินร้าน',

  timelineRegistered: 'ลงทะเบียนร้านอาหาร',
  timelineT0: 'ประเมิน T0',
  timelineT1: 'ประเมิน T1',
  timelinePendingResult: 'รอประกาศผลการคัดเลือก',
} as const;

export const ASSESSMENT_ROUND_LABELS = [
  { round: 'T0', label: 'T0 — ก่อนเข้าค่าย' },
  { round: 'T1', label: 'T1 — หลังค่าย' },
  { round: 'T2', label: 'T2 — Field Audit' },
  { round: 'T3', label: 'T3 — ติดตาม 1 เดือน' },
  { round: 'T4', label: 'T4 — ติดตาม 3 เดือน' },
] as const;
