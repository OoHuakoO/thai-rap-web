import type { User, CreateUserDto } from '@/features/user/types/user.types';
import { ROLES } from '@/types/auth.types';

// Increments on every call so each generated user gets a unique id.
let idCounter = 100;

export function createUser(overrides: Partial<User> = {}): User {
  const id = String(++idCounter);
  const now = new Date().toISOString();
  return {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    role: ROLES.ENTREPRENEUR,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createUserFromDto(dto: CreateUserDto): User {
  return createUser({
    name: dto.name,
    email: dto.email,
    role: dto.role,
  });
}
