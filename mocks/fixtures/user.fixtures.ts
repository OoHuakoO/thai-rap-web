import type { User, UpdateUserDto } from '@/features/user/types/user.types';
import { USER_STATUSES } from '@/features/user/types/user.types';
import { ROLES } from '@/types/auth.types';

const seed: User[] = [
  {
    id: '1',
    name: 'นายคมศักดิ์ กรณย์ประกิตต์',
    email: 'komsak01@gmail.com',
    role: ROLES.ADMIN,
    status: USER_STATUSES.ACTIVE,
    phone: '0812345678',
    organization: 'สำนักงานโครงการ THAI-RAP',
    assignedStoreIds: ['1', '2'],
    ownedStoreId: null,
    lastLogin: '2024-05-20T09:15:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
  },
  {
    id: '7',
    name: 'นางสาวศิริวรรณ จันทร์ดี',
    email: 'siriwan.j@nstda.or.th',
    role: ROLES.SUPER_ADMIN,
    status: USER_STATUSES.ACTIVE,
    phone: '0898765432',
    organization: 'NSTDA',
    assignedStoreIds: [],
    ownedStoreId: null,
    lastLogin: '2024-05-22T14:40:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
  },
  {
    id: '2',
    name: 'นายสมชาย วงษ์สมบัติ',
    email: 'somchai.w@rbru.ac.th',
    role: ROLES.ASSESSOR,
    status: USER_STATUSES.ACTIVE,
    phone: '0851112222',
    organization: 'มหาวิทยาลัยราชภัฏรำไพพรรณี',
    assignedStoreIds: ['1', '3', '5'],
    ownedStoreId: null,
    lastLogin: '2024-05-19T08:05:00Z',
    createdAt: '2024-02-01T09:30:00Z',
    updatedAt: '2024-04-10T15:00:00Z',
  },
  {
    id: '3',
    name: 'ผศ.ดร.เมฆนนา พรหมคำ',
    email: 'meknana.p@rbru.ac.th',
    role: ROLES.MENTOR,
    status: USER_STATUSES.ACTIVE,
    phone: '0863334444',
    organization: 'มหาวิทยาลัยราชภัฏรำไพพรรณี',
    assignedStoreIds: ['2', '4'],
    ownedStoreId: null,
    lastLogin: '2024-05-18T11:20:00Z',
    createdAt: '2024-02-14T11:00:00Z',
    updatedAt: '2024-04-11T10:00:00Z',
  },
  {
    id: '4',
    name: 'ดร.กฤษฎา วงษ์สมบัติ',
    email: 'kritsada.w@example.com',
    role: ROLES.JUDGE,
    status: USER_STATUSES.ACTIVE,
    phone: null,
    organization: 'คณะกรรมการ Pitching',
    assignedStoreIds: [],
    ownedStoreId: null,
    lastLogin: '2024-05-02T13:00:00Z',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-05-01T09:00:00Z',
  },
  {
    id: '5',
    name: 'นายสมศักดิ์ ร่มเย็น',
    email: 'somsak.r@example.com',
    role: ROLES.ENTREPRENEUR,
    status: USER_STATUSES.ACTIVE,
    phone: '0877778888',
    organization: null,
    assignedStoreIds: [],
    ownedStoreId: '1',
    lastLogin: '2024-05-21T07:45:00Z',
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-05-10T11:00:00Z',
  },
  {
    id: '6',
    name: 'นางสาวพิมพ์ชนก สุขใจ',
    email: 'pimchanok.s@nstda.or.th',
    role: ROLES.ME_TEAM,
    status: USER_STATUSES.ACTIVE,
    phone: '0801234567',
    organization: 'NSTDA',
    assignedStoreIds: [],
    ownedStoreId: null,
    lastLogin: '2024-05-17T16:30:00Z',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-05-15T14:00:00Z',
  },
  {
    id: '8',
    name: 'นายธนากร ใจงาม',
    email: 'thanakorn.j@example.com',
    role: ROLES.VIEWER,
    status: USER_STATUSES.PENDING,
    phone: null,
    organization: null,
    assignedStoreIds: [],
    ownedStoreId: null,
    lastLogin: null,
    createdAt: '2024-05-12T10:00:00Z',
    updatedAt: '2024-05-12T10:00:00Z',
  },
];

let store: User[] = [...seed];

export const userDb = {
  reset: () => {
    store = [...seed];
  },

  getAll: () => store,

  findById: (id: string): User | null => store.find((u) => u.id === id) ?? null,

  create: (user: User): User => {
    store = [...store, user];
    return user;
  },

  update: (id: string, data: UpdateUserDto): User | null => {
    const idx = store.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const updated: User = { ...store[idx], ...data, updatedAt: new Date().toISOString() };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  remove: (id: string): boolean => {
    const prev = store.length;
    store = store.filter((u) => u.id !== id);
    return store.length < prev;
  },
};
