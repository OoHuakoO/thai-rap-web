import api from '@/services/api';
import type {
  Store,
  CreateStoreDto,
  UpdateStoreDto,
  StoreQueryParams,
  PaginatedStores,
  StoreStatus,
  StoreStats,
  StoreDocument,
} from '../types/store.types';

export const storeService = {
  getAll: (params?: StoreQueryParams) =>
    api.get<PaginatedStores>('/stores', { params }).then((res) => res.data),

  getStats: () => api.get<StoreStats>('/stores/stats').then((res) => res.data),

  getById: (id: string) => api.get<Store>(`/stores/${id}`).then((res) => res.data),

  create: (data: CreateStoreDto) => api.post<Store>('/stores', data).then((res) => res.data),

  update: (id: string, data: UpdateStoreDto) =>
    api.patch<Store>(`/stores/${id}`, data).then((res) => res.data),

  updateStatus: (id: string, status: StoreStatus) =>
    api.patch<Store>(`/stores/${id}/status`, { status }).then((res) => res.data),

  remove: (id: string) => api.delete(`/stores/${id}`),

  uploadDocument: (storeId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<StoreDocument>(`/stores/${storeId}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  deleteDocument: (storeId: string, documentId: string) =>
    api.delete(`/stores/${storeId}/documents/${documentId}`),

  uploadMenuPhoto: (storeId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<string[]>(`/stores/${storeId}/menu-photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  deleteMenuPhoto: (storeId: string, url: string) =>
    api
      .delete<string[]>(`/stores/${storeId}/menu-photos`, { data: { url } })
      .then((res) => res.data),

  uploadCover: (storeId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<string>(`/stores/${storeId}/cover`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  deleteCover: (storeId: string) => api.delete(`/stores/${storeId}/cover`),

  uploadStorePhoto: (storeId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<string[]>(`/stores/${storeId}/store-photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  deleteStorePhoto: (storeId: string, url: string) =>
    api
      .delete<string[]>(`/stores/${storeId}/store-photos`, { data: { url } })
      .then((res) => res.data),
};
