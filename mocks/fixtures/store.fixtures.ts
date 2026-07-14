import type {
  Store,
  UpdateStoreDto,
  StoreStatus,
  StoreDocument,
} from '@/features/store/types/store.types';

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
    avgRevenueMin: 120000,
    avgRevenueMax: 150000,
    mainProblems: ['การบริหารต้นทุนวัตถุดิบสูง', 'การตลาดออนไลน์ยังน้อย'],
    goals: ['เพิ่มยอดขาย 20% ภายใน 6 เดือน', 'พัฒนามาตรฐานบริการ'],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
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
    avgRevenueMin: 210000,
    avgRevenueMax: 240000,
    mainProblems: ['ระบบสต็อกวัตถุดิบ', 'การวางแผนการตลาด'],
    goals: ['ขยายช่องทาง Delivery', 'ทำ Brand Identity'],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
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
    avgRevenueMin: 75000,
    avgRevenueMax: 105000,
    mainProblems: ['ต้นทุนแรงงานสูง', 'Seasonal demand'],
    goals: ['พัฒนา Signature Menu', 'เพิ่มช่องทาง Online'],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
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
    avgRevenueMin: 150000,
    avgRevenueMax: 180000,
    mainProblems: ['ต้นทุนวัตถุดิบผันผวน', 'แรงงานขาดแคลน'],
    goals: ['ทำระบบจัดการ SOP', 'เพิ่ม Catering Service'],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
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
    avgRevenueMin: 55000,
    avgRevenueMax: 85000,
    mainProblems: ['ระบบบัญชียังไม่เป็นระบบ'],
    goals: ['เพิ่มยอดขาย', 'ทำระบบบัญชีพื้นฐาน'],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
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
    avgRevenueMin: 45000,
    avgRevenueMax: 75000,
    mainProblems: ['การตลาดออนไลน์', 'Brand Identity'],
    goals: ['สร้าง Social Media', 'พัฒนาเมนู Signature'],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
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
    avgRevenueMin: 32500,
    avgRevenueMax: 62500,
    mainProblems: ['ต้นทุนสูง', 'ยอดขายไม่สม่ำเสมอ'],
    goals: ['ลดต้นทุน 15%', 'เพิ่มช่องทางขาย'],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
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
    avgRevenueMin: 90000,
    avgRevenueMax: 120000,
    mainProblems: ['การบริหารต้นทุน', 'ระบบ POS'],
    goals: ['ติดตั้งระบบ POS', 'ขยายเมนู'],
    menuPhotos: [],
    coverUrl: null,
    storePhotos: [],
    documents: [],
    status: 'T1_COMPLETED',
    latestScore: 86.74,
    latestAssessorName: 'อ.จิรากรณ์',
    latestAssessedAt: '2026-05-15T00:00:00Z',
    createdAt: '2026-03-06T08:00:00Z',
    updatedAt: '2026-05-15T08:00:00Z',
  },
];

let store: Store[] = [...seed];

export const STORE_TARGET_TOTAL = 400;

// Progression order of a store's incubation stage. Some statuses (WAITING_LIST,
// NOT_SELECTED, FIELD_AUDITED, IDP_CREATED, COMPLETED) are terminal branches
// rather than a strictly linear path, but every branch is only reachable after
// T1_COMPLETED — so index comparison still answers "has this store passed
// stage X" correctly for stats purposes.
const STORE_STATUS_ORDER: StoreStatus[] = [
  'REGISTERED',
  'T0_COMPLETED',
  'CAMP_COMPLETED',
  'T1_COMPLETED',
  'PITCHING_COMPLETED',
  'SELECTED',
  'CONDITIONAL_SELECTED',
  'WAITING_LIST',
  'NOT_SELECTED',
  'FIELD_AUDITED',
  'IDP_CREATED',
  'COMPLETED',
];

export function hasReachedStatus(status: StoreStatus, target: StoreStatus): boolean {
  return STORE_STATUS_ORDER.indexOf(status) >= STORE_STATUS_ORDER.indexOf(target);
}

// Unique suffix for generated upload URLs/ids — using file.name alone collides
// when the same filename is uploaded twice (common re-upload case), which
// broke delete-by-url for menu/store photos and could collide on document ids
// uploaded within the same millisecond.
let mockFileIdCounter = 0;

export function nextMockFileId(): string {
  mockFileIdCounter += 1;
  return `${Date.now()}-${mockFileIdCounter}`;
}

export const storeDb = {
  reset: () => {
    store = [...seed];
    mockFileIdCounter = 0;
  },

  getAll: () => store,

  findById: (id: string): Store | null => store.find((s) => s.id === id) ?? null,

  create: (item: Store): Store => {
    store = [...store, item];
    return item;
  },

  update: (id: string, data: UpdateStoreDto): Store | null => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Store = { ...store[idx], ...data, updatedAt: new Date().toISOString() };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  setStatus: (id: string, status: StoreStatus): Store | null => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Store = { ...store[idx], status, updatedAt: new Date().toISOString() };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  remove: (id: string): boolean => {
    const prev = store.length;
    store = store.filter((s) => s.id !== id);
    return store.length < prev;
  },

  addDocument: (id: string, doc: StoreDocument): Store | null => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Store = { ...store[idx], documents: [...store[idx].documents, doc] };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  removeDocument: (id: string, documentId: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Store = {
      ...store[idx],
      documents: store[idx].documents.filter((d) => d.id !== documentId),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  addMenuPhoto: (id: string, url: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Store = { ...store[idx], menuPhotos: [...store[idx].menuPhotos, url] };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  removeMenuPhoto: (id: string, url: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Store = {
      ...store[idx],
      menuPhotos: store[idx].menuPhotos.filter((p) => p !== url),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  setCover: (id: string, coverUrl: string | null): Store | null => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Store = { ...store[idx], coverUrl };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  addStorePhoto: (id: string, url: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Store = {
      ...store[idx],
      storePhotos: [...store[idx].storePhotos, url],
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  removeStorePhoto: (id: string, url: string): Store | null => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Store = {
      ...store[idx],
      storePhotos: store[idx].storePhotos.filter((p) => p !== url),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },
};
