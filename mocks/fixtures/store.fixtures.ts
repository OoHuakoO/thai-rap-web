import type { Store, UpdateStoreDto, StoreStatus } from '@/features/store/types/store.types'

const seed: Store[] = [
  {
    id: '1',
    name: 'ร้านส้มตำป้าแดง',
    province: 'ชลบุรี',
    storeType: 'อาหารตามสั่ง',
    ownerName: 'สมศรี ใจดี',
    phone: '0812345678',
    email: 'somsri@example.com',
    address: '123 หมู่ 4 ต.บางพระ อ.ศรีราชา จ.ชลบุรี',
    socialLinks: { facebook: 'https://facebook.com/somtamdaeng' },
    avgRevenue: 15000,
    mainProblems: 'ยอดขายไม่แน่นอน ต้นทุนสูง',
    goals: 'เพิ่มยอดขาย 20% ใน 6 เดือน',
    photos: [],
    status: 'REGISTERED',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: '2',
    name: 'ร้านก๋วยเตี๋ยวลุงมี',
    province: 'ระยอง',
    storeType: 'ก๋วยเตี๋ยว',
    ownerName: 'มานะ ตั้งใจ',
    phone: '0898765432',
    email: null,
    address: '45 ถ.สุขุมวิท ต.เชิงเนิน อ.เมือง จ.ระยอง',
    socialLinks: {},
    avgRevenue: 22000,
    mainProblems: null,
    goals: 'ขยายสาขาที่ 2',
    photos: [],
    status: 'T0_COMPLETED',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-02-01T08:00:00Z',
  },
]

let store: Store[] = [...seed]

export const storeDb = {
  reset: () => {
    store = [...seed]
  },

  getAll: () => store,

  findById: (id: string): Store | null => store.find((s) => s.id === id) ?? null,

  create: (item: Store): Store => {
    store = [...store, item]
    return item
  },

  update: (id: string, data: UpdateStoreDto): Store | null => {
    const idx = store.findIndex((s) => s.id === id)
    if (idx === -1) return null
    const updated: Store = { ...store[idx], ...data, updatedAt: new Date().toISOString() }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },

  setStatus: (id: string, status: StoreStatus): Store | null => {
    const idx = store.findIndex((s) => s.id === id)
    if (idx === -1) return null
    const updated: Store = { ...store[idx], status, updatedAt: new Date().toISOString() }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },

  remove: (id: string): boolean => {
    const prev = store.length
    store = store.filter((s) => s.id !== id)
    return store.length < prev
  },
}
