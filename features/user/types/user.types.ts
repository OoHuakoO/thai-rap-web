import type { Role } from '@/types/auth.types';

// Mirrors the Prisma `UserStatus` enum in thai-rap-api.
export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'ใช้งานอยู่',
  PENDING: 'รออนุมัติ',
  SUSPENDED: 'ระงับการใช้งาน',
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  phone: string | null;
  organization: string | null;
  /** Stores this user may assess — what the ASSIGNED data scope resolves against. */
  assignedStoreIds: string[];
  /** The store this user owns — set for ENTREPRENEUR, what the OWN scope resolves against. */
  ownedStoreId: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: Role;
  phone?: string;
  organization?: string;
  status?: UserStatus;
}

export type UpdateUserDto = Partial<CreateUserDto> & {
  assignedStoreIds?: string[];
};

export interface UserQueryParams {
  role?: Role;
  status?: UserStatus;
  search?: string;
}
