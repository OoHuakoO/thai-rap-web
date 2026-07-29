import type { Role } from '@/types/auth.types';
import type { User, UserStatus, UserStoreLink } from '@/features/user/types/user.types';
import { USER_STATUSES } from '@/features/user/types/user.types';
import { ROLES } from '@/types/auth.types';

// Mirrors the ids/codes in store.fixtures.ts — the API embeds the real store
// rows in every user, so a link pointing at a store that isn't there would
// render a label the app can never reconcile against /stores.
const STORE_LINKS: Record<string, UserStoreLink> = {
  '1': { id: '1', code: 'RAP69-001', name: 'บ้านริมน้ำ จันทบุรี' },
  '2': { id: '2', code: 'RAP69-002', name: 'ครัวทะเลสด' },
  '3': { id: '3', code: 'RAP69-003', name: 'สวนริมสุข Cafe' },
  '4': { id: '4', code: 'RAP69-004', name: 'ตราดซีฟู้ด' },
  '5': { id: '5', code: 'RAP69-005', name: 'ฉะเชิงเทรา กูร์เมต์' },
};

function storeLinks(ids: string[]): UserStoreLink[] {
  return ids.map((id) => STORE_LINKS[id]).filter((link): link is UserStoreLink => !!link);
}

function makeUser(input: {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  assignedStoreIds?: string[];
  ownedStoreIds?: string[];
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}): User {
  const assignedStores = storeLinks(input.assignedStoreIds ?? []);
  const ownedStores = storeLinks(input.ownedStoreIds ?? []);
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    role: input.role,
    status: input.status,
    assignedStores,
    ownedStores,
    assignedStoreIds: assignedStores.map((store) => store.id),
    ownedStoreIds: ownedStores.map((store) => store.id),
    lastLogin: input.lastLogin,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

const seed: User[] = [
  makeUser({
    id: '1',
    name: 'นายคมศักดิ์ กรณย์ประกิตต์',
    email: 'komsak01@gmail.com',
    role: ROLES.ADMIN,
    status: USER_STATUSES.ACTIVE,
    lastLogin: '2024-05-20T09:15:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
  }),
  makeUser({
    id: '7',
    name: 'นางสาวศิริวรรณ จันทร์ดี',
    email: 'siriwan.j@nstda.or.th',
    role: ROLES.SUPER_ADMIN,
    status: USER_STATUSES.ACTIVE,
    lastLogin: '2024-05-22T14:40:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
  }),
  makeUser({
    id: '2',
    name: 'นายสมชาย วงษ์สมบัติ',
    email: 'somchai.w@rbru.ac.th',
    role: ROLES.ASSESSOR,
    status: USER_STATUSES.ACTIVE,
    assignedStoreIds: ['1', '3', '5'],
    lastLogin: '2024-05-19T08:05:00Z',
    createdAt: '2024-02-01T09:30:00Z',
    updatedAt: '2024-04-10T15:00:00Z',
  }),
  // Assigned nothing on purpose: an ASSESSOR with an empty list can score no
  // store at all, which is the state the assignment flow exists to fix.
  makeUser({
    id: '9',
    name: 'นางสาวอารยา แสงทอง',
    email: 'araya.s@rbru.ac.th',
    role: ROLES.ASSESSOR,
    status: USER_STATUSES.ACTIVE,
    lastLogin: null,
    createdAt: '2024-05-05T09:00:00Z',
    updatedAt: '2024-05-05T09:00:00Z',
  }),
  makeUser({
    id: '3',
    name: 'ผศ.ดร.เมฆนนา พรหมคำ',
    email: 'meknana.p@rbru.ac.th',
    role: ROLES.MENTOR,
    status: USER_STATUSES.ACTIVE,
    lastLogin: '2024-05-18T11:20:00Z',
    createdAt: '2024-02-14T11:00:00Z',
    updatedAt: '2024-04-11T10:00:00Z',
  }),
  makeUser({
    id: '4',
    name: 'ดร.กฤษฎา วงษ์สมบัติ',
    email: 'kritsada.w@example.com',
    role: ROLES.JUDGE,
    status: USER_STATUSES.ACTIVE,
    lastLogin: '2024-05-02T13:00:00Z',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-05-01T09:00:00Z',
  }),
  makeUser({
    id: '5',
    name: 'นายสมศักดิ์ ร่มเย็น',
    email: 'somsak.r@example.com',
    role: ROLES.ENTREPRENEUR,
    status: USER_STATUSES.ACTIVE,
    ownedStoreIds: ['1'],
    lastLogin: '2024-05-21T07:45:00Z',
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-05-10T11:00:00Z',
  }),
  makeUser({
    id: '6',
    name: 'นางสาวพิมพ์ชนก สุขใจ',
    email: 'pimchanok.s@nstda.or.th',
    role: ROLES.ME_TEAM,
    status: USER_STATUSES.ACTIVE,
    lastLogin: '2024-05-17T16:30:00Z',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-05-15T14:00:00Z',
  }),
  makeUser({
    id: '8',
    name: 'นายธนากร ใจงาม',
    email: 'thanakorn.j@example.com',
    role: ROLES.VIEWER,
    status: USER_STATUSES.PENDING,
    lastLogin: null,
    createdAt: '2024-05-12T10:00:00Z',
    updatedAt: '2024-05-12T10:00:00Z',
  }),
  makeUser({
    id: '10',
    name: 'นางสาวจิราพร มีสุข',
    email: 'jiraporn.m@example.com',
    role: ROLES.ENTREPRENEUR,
    status: USER_STATUSES.PENDING,
    lastLogin: null,
    createdAt: '2024-05-23T10:00:00Z',
    updatedAt: '2024-05-23T10:00:00Z',
  }),
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

  update: (id: string, data: Partial<User>): User | null => {
    const idx = store.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const updated: User = { ...store[idx], ...data, updatedAt: new Date().toISOString() };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return updated;
  },

  // Ownership is single-holder, same as Store.ownerId — assigning a store to
  // one entrepreneur has to take it off whoever held it before, or the mock
  // reports two owners for one store.
  setOwnedStores: (id: string, storeIds: string[]): User | null => {
    const target = store.find((u) => u.id === id);
    if (!target) return null;
    const ownedStores = storeLinks(storeIds);
    const ownedIds = new Set(storeIds);
    store = store.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          ownedStores,
          ownedStoreIds: ownedStores.map((s) => s.id),
          updatedAt: new Date().toISOString(),
        };
      }
      const kept = user.ownedStores.filter((s) => !ownedIds.has(s.id));
      if (kept.length === user.ownedStores.length) return user;
      return { ...user, ownedStores: kept, ownedStoreIds: kept.map((s) => s.id) };
    });
    return store.find((u) => u.id === id) ?? null;
  },

  setAssignedStores: (id: string, storeIds: string[]): User | null => {
    const assignedStores = storeLinks(storeIds);
    return userDb.update(id, {
      assignedStores,
      assignedStoreIds: assignedStores.map((s) => s.id),
    });
  },

  remove: (id: string): boolean => {
    const prev = store.length;
    store = store.filter((u) => u.id !== id);
    return store.length < prev;
  },
};
