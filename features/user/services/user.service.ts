import api from '@/services/api';
import type { User, CreateUserDto, UpdateUserDto, UserQueryParams } from '../types/user.types';

export const userService = {
  getAll: (params?: UserQueryParams) =>
    api.get<User[]>('/users', { params }).then((res) => res.data),
  getById: (id: string) => api.get<User>(`/users/${id}`).then((res) => res.data),
  create: (data: CreateUserDto) => api.post<User>('/users', data).then((res) => res.data),
  update: (id: string, data: UpdateUserDto) =>
    api.patch<User>(`/users/${id}`, data).then((res) => res.data),
  remove: (id: string) => api.delete(`/users/${id}`),
};
