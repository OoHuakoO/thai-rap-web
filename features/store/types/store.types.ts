import type { PaginatedResponse } from '@/types/api.types'

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
  | 'COMPLETED'

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  REGISTERED: 'ลงทะเบียนแล้ว',
  T0_COMPLETED: 'ประเมิน T0 แล้ว',
  CAMP_COMPLETED: 'เข้าค่ายแล้ว',
  T1_COMPLETED: 'ประเมิน T1 แล้ว',
  PITCHING_COMPLETED: 'นำเสนอ Pitching แล้ว',
  SELECTED: 'ผ่านเข้า Incubation',
  CONDITIONAL_SELECTED: 'ผ่านแบบมีเงื่อนไข',
  WAITING_LIST: 'รายชื่อสำรอง',
  NOT_SELECTED: 'ยังไม่ผ่าน',
  FIELD_AUDITED: 'ลงพื้นที่ตรวจแล้ว',
  IDP_CREATED: 'มีแผนพัฒนาแล้ว',
  COMPLETED: 'ติดตามผลครบแล้ว',
}

export interface Store {
  id: string
  name: string
  province: string
  storeType: string
  ownerName: string
  phone: string
  email: string | null
  address: string
  socialLinks: Record<string, string>
  avgRevenue: number | null
  mainProblems: string | null
  goals: string | null
  photos: string[]
  status: StoreStatus
  createdAt: string
  updatedAt: string
}

export interface CreateStoreDto {
  name: string
  province: string
  storeType: string
  ownerName: string
  phone: string
  email?: string
  address: string
  socialLinks?: Record<string, string>
  avgRevenue?: number
  mainProblems?: string
  goals?: string
}

export type UpdateStoreDto = Partial<CreateStoreDto>

export interface StoreQueryParams {
  page?: number
  limit?: number
  search?: string
  province?: string
  storeType?: string
  status?: StoreStatus
}

export type PaginatedStores = PaginatedResponse<Store>
