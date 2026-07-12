import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { storeService } from '../services/store.service'
import type {
  CreateStoreDto,
  UpdateStoreDto,
  StoreQueryParams,
  StoreStatus,
} from '../types/store.types'

export const storeKeys = {
  all: ['stores'] as const,
  list: (params?: StoreQueryParams) => ['stores', 'list', params ?? {}] as const,
  detail: (id: string) => ['stores', id] as const,
  stats: () => ['stores', 'stats'] as const,
}

export function useStores(params?: StoreQueryParams) {
  return useQuery({
    queryKey: storeKeys.list(params),
    queryFn: () => storeService.getAll(params),
  })
}

export function useStoreStats() {
  return useQuery({
    queryKey: storeKeys.stats(),
    queryFn: () => storeService.getStats(),
  })
}

export function useStore(id: string) {
  return useQuery({
    queryKey: storeKeys.detail(id),
    queryFn: () => storeService.getById(id),
    enabled: !!id,
  })
}

export function useCreateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStoreDto) => storeService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  })
}

export function useUpdateStore(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateStoreDto) => storeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all })
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(id) })
    },
  })
}

export function useUpdateStoreStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: StoreStatus) => storeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all })
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(id) })
    },
  })
}

export function useDeleteStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => storeService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  })
}

export function useUploadStoreDocument(storeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => storeService.uploadDocument(storeId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  })
}

export function useDeleteStoreDocument(storeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => storeService.deleteDocument(storeId, documentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  })
}

export function useUploadStorePhoto(storeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => storeService.uploadPhoto(storeId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  })
}

export function useDeleteStorePhoto(storeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (url: string) => storeService.deletePhoto(storeId, url),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  })
}

export function useUploadStoreLogo(storeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => storeService.uploadLogo(storeId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  })
}

export function useDeleteStoreLogo(storeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => storeService.deleteLogo(storeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  })
}

export function useUploadStorefrontPhoto(storeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => storeService.uploadStorefrontPhoto(storeId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  })
}

export function useDeleteStorefrontPhoto(storeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (url: string) => storeService.deleteStorefrontPhoto(storeId, url),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  })
}
