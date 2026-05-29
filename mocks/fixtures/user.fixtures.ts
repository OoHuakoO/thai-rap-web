import type { User, UpdateUserDto } from '@/features/user/types/user.types';

const seed: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    createdAt: '2024-02-01T09:30:00Z',
    updatedAt: '2024-04-10T15:00:00Z',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@example.com',
    role: 'user',
    createdAt: '2024-02-14T11:00:00Z',
    updatedAt: '2024-04-11T10:00:00Z',
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david@example.com',
    role: 'user',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-05-01T09:00:00Z',
  },
  {
    id: '5',
    name: 'Eva Martinez',
    email: 'eva@example.com',
    role: 'admin',
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-05-10T11:00:00Z',
  },
];

// Mutable in-memory store — mutations persist for the entire browser session.
// Call reset() in tests to restore the seed state.
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
