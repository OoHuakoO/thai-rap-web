import type { User } from '@/features/user/types/user.types';

export const mockUsers: User[] = [
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
];
