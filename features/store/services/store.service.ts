import api from '@/services/api'
import type {
  Store,
  CreateStoreDto,
  UpdateStoreDto,
  StoreQueryParams,
  PaginatedStores,
  StoreStatus,
  StoreStats,
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
}
