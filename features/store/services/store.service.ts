import api from '@/services/api'
import type {
  Store,
  CreateStoreDto,
  UpdateStoreDto,
  StoreQueryParams,
  PaginatedStores,
  StoreStatus,
  StoreStats,
  StoreDocument,
} from '../types/store.types'

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
    const form = new FormData()
    form.append('file', file)
    return api
      .post<StoreDocument>(`/stores/${storeId}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data)
  },

  deleteDocument: (storeId: string, documentId: string) =>
    api.delete(`/stores/${storeId}/documents/${documentId}`),

  uploadPhoto: (storeId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<string[]>(`/stores/${storeId}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data)
  },

  deletePhoto: (storeId: string, url: string) =>
    api
      .delete<string[]>(`/stores/${storeId}/photos`, { data: { url } })
      .then((res) => res.data),

  uploadLogo: (storeId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<string>(`/stores/${storeId}/logo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data)
  },

  deleteLogo: (storeId: string) => api.delete(`/stores/${storeId}/logo`),

  uploadStorefrontPhoto: (storeId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<string[]>(`/stores/${storeId}/storefront-photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data)
  },

  deleteStorefrontPhoto: (storeId: string, url: string) =>
    api
      .delete<string[]>(`/stores/${storeId}/storefront-photos`, { data: { url } })
      .then((res) => res.data),
}
