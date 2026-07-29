import api from '@/services/api';
import type {
  AssignStoresDto,
  CreateUserDto,
  PaginatedUsers,
  UpdateUserRoleDto,
  User,
  UserQueryParams,
  UserStats,
} from '../types/user.types';

// Accounts are normally made by registering and then being approved here —
// that is what the PENDING status is for. `create` has no endpoint behind it
// (see CreateUserDto) and no caller in the UI.
export const userService = {
  getAll: (params?: UserQueryParams) =>
    api.get<PaginatedUsers>('/users', { params }).then((res) => res.data),

  getStats: () => api.get<UserStats>('/users/stats').then((res) => res.data),

  getById: (id: string) => api.get<User>(`/users/${id}`).then((res) => res.data),

  create: (data: CreateUserDto) => api.post<User>('/users', data).then((res) => res.data),

  approve: (id: string) => api.patch<User>(`/users/${id}/approve`).then((res) => res.data),

  suspend: (id: string) => api.patch<User>(`/users/${id}/suspend`).then((res) => res.data),

  updateRole: (id: string, data: UpdateUserRoleDto) =>
    api.patch<User>(`/users/${id}/role`, data).then((res) => res.data),

  assignStores: (id: string, data: AssignStoresDto) =>
    api.patch<User>(`/users/${id}/assigned-stores`, data).then((res) => res.data),

  assignOwnedStores: (id: string, data: AssignStoresDto) =>
    api.patch<User>(`/users/${id}/owned-stores`, data).then((res) => res.data),

  remove: (id: string) => api.delete(`/users/${id}`),
};
