// Text for the store list table (columns, row action tooltips, empty state).

import type { StatusVariant } from '@/components/shared/status-badge';
import type { StoreStatus } from '../types/store.types';

export const STORE_LIST_STATUS_VARIANT: Record<StoreStatus, StatusVariant> = {
  REGISTERED: 'inactive',
  T0_COMPLETED: 'new',
  CAMP_COMPLETED: 'pending',
  T1_COMPLETED: 'purple',
  PITCHING_COMPLETED: 'pending',
  SELECTED: 'pass',
  CONDITIONAL_SELECTED: 'warning',
  WAITING_LIST: 'pending',
  NOT_SELECTED: 'fail',
  FIELD_AUDITED: 'pending',
  IDP_CREATED: 'pending',
  COMPLETED: 'active',
};

export const STORE_LIST_TEXT = {
  nameHeader: 'ชื่อร้าน',
  provinceHeader: 'จังหวัด',
  storeTypeHeader: 'ประเภท',
  statusHeader: 'สถานะ',
  latestScoreHeader: 'คะแนนล่าสุด',
  latestAssessorHeader: 'ผู้ประเมิน',
  actionsHeader: 'การจัดการ',
  viewDetailTitle: 'ดูรายละเอียดเต็ม',
  editStoreTitle: 'แก้ไขร้าน',
  deleteStoreTitle: 'ลบร้าน',
  emptyMessage: 'ยังไม่มีร้านในระบบ',
} as const;
