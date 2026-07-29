import type { PaginatedResponse } from '@/types/api.types';

export type StoreStatus =
  | 'REGISTERED'
  | 'T0_COMPLETED'
  | 'CAMP_COMPLETED'
  | 'T1_COMPLETED'
  | 'PITCHING_COMPLETED'
  | 'SELECTED'
  | 'CONDITIONAL_SELECTED'
  | 'WAITING_LIST'
  | 'NOT_SELECTED'
  | 'FIELD_AUDITED'
  | 'IDP_CREATED'
  | 'COMPLETED';

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  REGISTERED: 'ลงทะเบียนแล้ว',
  T0_COMPLETED: 'ประเมิน T0 แล้ว',
  CAMP_COMPLETED: 'เข้าค่ายแล้ว',
  T1_COMPLETED: 'ประเมิน T1 แล้ว',
  PITCHING_COMPLETED: 'นำเสนอ Pitching แล้ว',
  SELECTED: 'ผ่านเข้ารอบ',
  CONDITIONAL_SELECTED: 'ผ่านแบบมีเงื่อนไข',
  WAITING_LIST: 'รายชื่อสำรอง',
  NOT_SELECTED: 'ยังไม่ผ่าน',
  FIELD_AUDITED: 'ลงพื้นที่ตรวจแล้ว',
  IDP_CREATED: 'มีแผนพัฒนาแล้ว',
  COMPLETED: 'ติดตามผลครบแล้ว',
};

export interface StoreDocument {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

// GET /stores and GET /stores/:id return a narrowed object (the API's
// PublicStoreResult) to a VIEWER on every store — contact details, revenue,
// mainProblems, documents and every score key are absent from the payload,
// not null. (An ENTREPRENEUR needs no narrowing: it is only ever handed the
// stores it owns, and another owner's store 403s.) The fields below
// are still typed as present because most callers see the full record; guard
// with `!= null` / `?? fallback` rather than `!== null` when reading any of
// them, or an omitted key reaches the render as undefined.
export interface Store {
  id: string;
  // The project-wide RAP69-XXX identifier printed on the offline forms and the
  // Excel workbook — how a spreadsheet row maps back to this record.
  code: string;
  name: string;
  // Null for a store imported from the intake workbook before its profile is
  // filled in; the create/edit forms still require every one of these.
  province: string | null;
  storeType: string | null;
  ownerName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  socialLinks: Record<string, string>;
  avgRevenueMin: number | null;
  avgRevenueMax: number | null;
  mainProblems: string[];
  goals: string[];
  menuPhotos: string[];
  coverUrl: string | null;
  storePhotos: string[];
  documents: StoreDocument[];
  status: StoreStatus;
  // The User this store belongs to, null for one an admin registered without
  // naming an owner. Distinct from `ownerName`, which is free text. Every role
  // browses every store, so this is what decides who may edit/delete one —
  // the API enforces the same rule in StoreService.assertCanManage.
  ownerId: string | null;
  latestScore: number | null;
  latestAssessorName: string | null;
  latestAssessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreDto {
  code: string;
  name: string;
  province: string;
  storeType: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  socialLinks?: Record<string, string>;
  avgRevenueMin?: number;
  avgRevenueMax?: number;
  mainProblems?: string[];
  goals?: string[];
}

export type UpdateStoreDto = Partial<CreateStoreDto>;

export interface StoreQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  province?: string;
  storeType?: string;
  status?: StoreStatus;
}

export type PaginatedStores = PaginatedResponse<Store>;

export interface StoreStats {
  total: number;
  targetTotal: number;
  t0CompletedCount: number;
  t1CompletedCount: number;
  t2CompletedCount: number;
  t3CompletedCount: number;
  storeTypes: string[];
}
