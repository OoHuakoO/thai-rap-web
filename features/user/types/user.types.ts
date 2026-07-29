import type { Role } from '@/types/auth.types';
import type { PaginatedResponse } from '@/types/api.types';

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

/** The store shape `/users` embeds — enough to label a row without a second fetch. */
export interface UserStoreLink {
  id: string;
  code: string;
  name: string;
}

// Mirrors UserResult in the API's modules/user/user.service.ts. `phone` and
// `organization` are deliberately absent: the Prisma User model has no such
// columns, so every row would render them undefined.
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  /** Stores this assessor may score — what the ASSIGNED data scope resolves against. */
  assignedStores: UserStoreLink[];
  /** Stores this entrepreneur owns — what the OWN scope resolves against. */
  ownedStores: UserStoreLink[];
  assignedStoreIds: string[];
  ownedStoreIds: string[];
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaginatedUsers = PaginatedResponse<User>;

export interface UserStats {
  total: number;
  pending: number;
  active: number;
  suspended: number;
}

// Kept for CreateUserForm, which has no live endpoint — thai-rap-api exposes no
// POST /users, and Prisma's User model has no phone/organization column. The
// form is unreachable from the UI until that ships; see UserPageHeader.
export interface CreateUserDto {
  name: string;
  email: string;
  role: Role;
  phone?: string;
  organization?: string;
  status?: UserStatus;
}

/** The complete assignment list — an omitted store is revoked, `[]` clears every one. */
export interface AssignStoresDto {
  storeIds: string[];
}

export interface UserQueryParams {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}
