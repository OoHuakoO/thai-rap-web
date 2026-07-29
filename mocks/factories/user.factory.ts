import type { User, CreateUserDto } from '@/features/user/types/user.types';
import { USER_STATUSES } from '@/features/user/types/user.types';
import { ROLES } from '@/types/auth.types';

// Increments on every call so each generated user gets a unique id.
let idCounter = 100;

export function createUser(overrides: Partial<User> = {}): User {
  const id = String(++idCounter);
  const now = new Date().toISOString();
  const assignedStores = overrides.assignedStores ?? [];
  const ownedStores = overrides.ownedStores ?? [];
  return {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    role: ROLES.ENTREPRENEUR,
    // Matches the API: POST /auth/register lands every account here and it
    // stays unusable until a SUPER_ADMIN approves it.
    status: USER_STATUSES.PENDING,
    lastLogin: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
    assignedStores,
    ownedStores,
    // Derived, never passed in — the two lists must not be able to disagree.
    assignedStoreIds: assignedStores.map((store) => store.id),
    ownedStoreIds: ownedStores.map((store) => store.id),
  };
}

export function createUserFromDto(dto: CreateUserDto): User {
  return createUser({
    name: dto.name,
    email: dto.email,
    role: dto.role,
    status: dto.status ?? USER_STATUSES.PENDING,
  });
}
