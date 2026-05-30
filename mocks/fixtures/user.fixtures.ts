import type { User, UpdateUserDto } from '@/features/user/types/user.types'

const seed: User[] = [
  {
    id: '1',
    name: 'นายคมศักดิ์ กรณย์ประกิตต์',
    email: 'komsak01@gmail.com',
    role: 'admin',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
  },
  {
    id: '2',
    name: 'นายสมชาย วงษ์สมบัติ',
    email: 'somchai.w@rbru.ac.th',
    role: 'assessor',
    createdAt: '2024-02-01T09:30:00Z',
    updatedAt: '2024-04-10T15:00:00Z',
  },
  {
    id: '3',
    name: 'ผศ.ดร.เมฆนนา พรหมคำ',
    email: 'meknana.p@rbru.ac.th',
    role: 'mentor',
    createdAt: '2024-02-14T11:00:00Z',
    updatedAt: '2024-04-11T10:00:00Z',
  },
  {
    id: '4',
    name: 'ดร.กฤษฎา วงษ์สมบัติ',
    email: 'kritsada.w@example.com',
    role: 'judge',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-05-01T09:00:00Z',
  },
  {
    id: '5',
    name: 'นายสมศักดิ์ ร่มเย็น',
    email: 'somsak.r@example.com',
    role: 'entrepreneur',
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-05-10T11:00:00Z',
  },
  {
    id: '6',
    name: 'นางสาวพิมพ์ชนก สุขใจ',
    email: 'pimchanok.s@nstda.or.th',
    role: 'me_team',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-05-15T14:00:00Z',
  },
]

let store: User[] = [...seed]

export const userDb = {
  reset: () => {
    store = [...seed]
  },

  getAll: () => store,

  findById: (id: string): User | null => store.find((u) => u.id === id) ?? null,

  create: (user: User): User => {
    store = [...store, user]
    return user
  },

  update: (id: string, data: UpdateUserDto): User | null => {
    const idx = store.findIndex((u) => u.id === id)
    if (idx === -1) return null
    const updated: User = { ...store[idx], ...data, updatedAt: new Date().toISOString() }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },

  remove: (id: string): boolean => {
    const prev = store.length
    store = store.filter((u) => u.id !== id)
    return store.length < prev
  },
}
