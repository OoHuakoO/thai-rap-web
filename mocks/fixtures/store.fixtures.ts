import type {
  Store,
  UpdateStoreDto,
  StoreStatus,
  StoreDocument,
} from '@/features/store/types/store.types'

const seed: Store[] = [
  {
    id: '1',
    name: 'บ้านริมน้ำ จันทบุรี',
    province: 'จันทบุรี',
    storeType: 'อาหารไทย',
    ownerName: 'สมชาย ริมเอิน',
    phone: '0812345678',
    email: 'banrimnam.cbt@gmail.com',
    address: '12/3 หมู่ 2 ต.วัดใหม่ อ.เมืองจันทบุรี จ.จันทบุรี 22000',
    socialLinks: { facebook: 'https://facebook.com/banrimnam' },
    avgRevenue: 135000,
    mainProblems: ['การบริหารต้นทุนวัตถุดิบสูง', 'การตลาดออนไลน์ยังน้อย'],
    goals: ['เพิ่มยอดขาย 20% ภายใน 6 เดือน', 'พัฒนามาตรฐานบริการ'],
    photos: [],
    logoUrl: null,
    storefrontPhotos: [],
    documents: [
      {
        id: 'doc-1',
        filename: 'สำเนาใบประเมิน.pdf',
        fileType: 'application/pdf',
        fileSize: 245000,
        url: '/uploads/stores/1/documents/doc-1.pdf',
        uploadedAt: '2026-05-20T00:00:00Z',
      },
      {
        id: 'doc-2',
        filename: 'ใบคูณต้นทุน.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSize: 58000,
        url: '/uploads/stores/1/documents/doc-2.xlsx',
        uploadedAt: '2026-05-20T00:00:00Z',
      },
    ],
    status: 'T1_COMPLETED',
    latestScore: 92.45,
    latestAssessorName: 'อ.กัณฑ์กัส',
    latestAssessedAt: '2026-05-20T00:00:00Z',
    createdAt: '2026-03-12T08:00:00Z',
    updatedAt: '2026-05-20T08:00:00Z',
  },
  {
    id: '2',
    name: 'ครัวทะเลสด',
    province: 'ชลบุรี',
    storeType: 'อาหารทะเล',
    ownerName: 'วิชัย ทะเลสวย',
    phone: '0893456789',
    email: 'kuatale@gmail.com',
    address: '45 ถ.ชลบุรี-พัทยา ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000',
    socialLinks: {},
    avgRevenue: 225000,
    mainProblems: ['ระบบสต็อกวัตถุดิบ', 'การวางแผนการตลาด'],
    goals: ['ขยายช่องทาง Delivery', 'ทำ Brand Identity'],
    photos: [],
    logoUrl: null,
    storefrontPhotos: [],
    documents: [],
    status: 'T0_COMPLETED',
    latestScore: 91.12,
    latestAssessorName: 'อ.พิสุทธิ์',
    latestAssessedAt: '2026-05-18T00:00:00Z',
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-05-18T08:00:00Z',
  },
  {
    id: '3',
    name: 'สวนริมสุข Cafe',
    province: 'ระยอง',
    storeType: 'คาเฟ่',
    ownerName: 'พรทิพย์ สุขใจ',
    phone: '0854567890',
    email: 'suanrimsuk@gmail.com',
    address: '78 หมู่ 5 ต.เนินพระ อ.เมืองระยอง จ.ระยอง 21000',
    socialLinks: { facebook: 'https://facebook.com/suanrimsukcafe' },
    avgRevenue: 90000,
    mainProblems: ['ต้นทุนแรงงานสูง', 'Seasonal demand'],
    goals: ['พัฒนา Signature Menu', 'เพิ่มช่องทาง Online'],
    photos: [],
    logoUrl: null,
    storefrontPhotos: [],
    documents: [],
    status: 'SELECTED',
    latestScore: 90.31,
    latestAssessorName: 'อ.จิรากรณ์',
    latestAssessedAt: '2026-05-17T00:00:00Z',
    createdAt: '2026-03-08T08:00:00Z',
    updatedAt: '2026-05-17T08:00:00Z',
  },
  {
    id: '4',
    name: 'ตราดซีฟู้ด',
    province: 'ตราด',
    storeType: 'อาหารทะเล',
    ownerName: 'สุรชัย ทะเลตราด',
    phone: '0875678901',
    email: 'tradseafood@gmail.com',
    address: '22 ถ.ตราด-แหลมงอบ ต.วังกระแจะ อ.เมืองตราด จ.ตราด 23000',
    socialLinks: {},
    avgRevenue: 165000,
    mainProblems: ['ต้นทุนวัตถุดิบผันผวน', 'แรงงานขาดแคลน'],
    goals: ['ทำระบบจัดการ SOP', 'เพิ่ม Catering Service'],
    photos: [],
    logoUrl: null,
    storefrontPhotos: [],
    documents: [],
    status: 'T1_COMPLETED',
    latestScore: 89.78,
    latestAssessorName: 'อ.กัณฑ์กัส',
    latestAssessedAt: '2026-05-16T00:00:00Z',
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-05-16T08:00:00Z',
  },
  {
    id: '5',
    name: 'ฉะเชิงเทรา กูร์เมต์',
    province: 'ฉะเชิงเทรา',
    storeType: 'อาหารไทย',
    ownerName: 'นภา แปดริ้ว',
    phone: '0826789012',
    email: 'ccgourmet@gmail.com',
    address: '55 ถ.มหาจักรพรรดิ์ ต.หน้าเมือง อ.เมืองฉะเชิงเทรา จ.ฉะเชิงเทรา 24000',
    socialLinks: {},
    avgRevenue: 70000,
    mainProblems: ['ระบบบัญชียังไม่เป็นระบบ'],
    goals: ['เพิ่มยอดขาย', 'ทำระบบบัญชีพื้นฐาน'],
    photos: [],
    logoUrl: null,
    storefrontPhotos: [],
    documents: [],
    status: 'REGISTERED',
    latestScore: null,
    latestAssessorName: null,
    latestAssessedAt: null,
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-03-15T08:00:00Z',
  },
  {
    id: '6',
    name: 'บ้านสวนเพลินใจ',
    province: 'ปราจีนบุรี',
    storeType: 'อาหารไทย',
    ownerName: 'มานะ เพลินใจ',
    phone: '0837890123',
    email: 'baansuan@gmail.com',
    address: '12 ม.3 ต.ดงขี้เหล็ก อ.เมืองปราจีนบุรี จ.ปราจีนบุรี 25000',
    socialLinks: {},
    avgRevenue: 60000,
    mainProblems: ['การตลาดออนไลน์', 'Brand Identity'],
    goals: ['สร้าง Social Media', 'พัฒนาเมนู Signature'],
    photos: [],
    logoUrl: null,
    storefrontPhotos: [],
    documents: [],
    status: 'T0_COMPLETED',
    latestScore: 88.21,
    latestAssessorName: 'อ.พิสุทธิ์',
    latestAssessedAt: '2026-05-15T00:00:00Z',
    createdAt: '2026-03-18T08:00:00Z',
    updatedAt: '2026-05-15T08:00:00Z',
  },
  {
    id: '7',
    name: 'ครัวบ้านคลอง',
    province: 'สระแก้ว',
    storeType: 'อาหารไทย',
    ownerName: 'สมพร คลองสวย',
    phone: '0868901234',
    email: 'kruaklhong@gmail.com',
    address: '88 ม.1 ต.สระแก้ว อ.เมืองสระแก้ว จ.สระแก้ว 27000',
    socialLinks: {},
    avgRevenue: 47500,
    mainProblems: ['ต้นทุนสูง', 'ยอดขายไม่สม่ำเสมอ'],
    goals: ['ลดต้นทุน 15%', 'เพิ่มช่องทางขาย'],
    photos: [],
    logoUrl: null,
    storefrontPhotos: [],
    documents: [],
    status: 'REGISTERED',
    latestScore: null,
    latestAssessorName: null,
    latestAssessedAt: null,
    createdAt: '2026-03-20T08:00:00Z',
    updatedAt: '2026-03-20T08:00:00Z',
  },
  {
    id: '8',
    name: 'เม็ดทราย ซีไซด์',
    province: 'ชลบุรี',
    storeType: 'คาเฟ่/เบเกอรี่',
    ownerName: 'อุษา ทรายทอง',
    phone: '0849012345',
    email: 'metsai.seaside@gmail.com',
    address: '234 ถ.พัทยาเหนือ ต.นาเกลือ อ.บางละมุง จ.ชลบุรี 20150',
    socialLinks: { facebook: 'https://facebook.com/metsaiseaside' },
    avgRevenue: 105000,
    mainProblems: ['การบริหารต้นทุน', 'ระบบ POS'],
    goals: ['ติดตั้งระบบ POS', 'ขยายเมนู'],
    photos: [],
    logoUrl: null,
    storefrontPhotos: [],
    documents: [],
    status: 'T1_COMPLETED',
    latestScore: 86.74,
    latestAssessorName: 'อ.จิรากรณ์',
    latestAssessedAt: '2026-05-15T00:00:00Z',
    createdAt: '2026-03-06T08:00:00Z',
    updatedAt: '2026-05-15T08:00:00Z',
  },
]

let store: Store[] = [...seed]

export const STORE_TARGET_TOTAL = 400

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

  addDocument: (id: string, doc: StoreDocument): Store | null => {
    const idx = store.findIndex((s) => s.id === id)
    if (idx === -1) return null
    const updated: Store = { ...store[idx], documents: [...store[idx].documents, doc] }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },

  removeDocument: (id: string, documentId: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id)
    if (idx === -1) return null
    const updated: Store = {
      ...store[idx],
      documents: store[idx].documents.filter((d) => d.id !== documentId),
    }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },

  addPhoto: (id: string, url: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id)
    if (idx === -1) return null
    const updated: Store = { ...store[idx], photos: [...store[idx].photos, url] }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },

  removePhoto: (id: string, url: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id)
    if (idx === -1) return null
    const updated: Store = { ...store[idx], photos: store[idx].photos.filter((p) => p !== url) }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },

  setLogo: (id: string, logoUrl: string | null): Store | null => {
    const idx = store.findIndex((s) => s.id === id)
    if (idx === -1) return null
    const updated: Store = { ...store[idx], logoUrl }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },

  addStorefrontPhoto: (id: string, url: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id)
    if (idx === -1) return null
    const updated: Store = {
      ...store[idx],
      storefrontPhotos: [...store[idx].storefrontPhotos, url],
    }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },

  removeStorefrontPhoto: (id: string, url: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id)
    if (idx === -1) return null
    const updated: Store = {
      ...store[idx],
      storefrontPhotos: store[idx].storefrontPhotos.filter((p) => p !== url),
    }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },
}
