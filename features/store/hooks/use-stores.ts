import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/types/auth.types';
import { storeService } from '../services/store.service';
import type {
  CreateStoreDto,
  UpdateStoreDto,
  StoreQueryParams,
  StoreStatus,
} from '../types/store.types';

export const storeKeys = {
  all: ['stores'] as const,
  list: (params?: StoreQueryParams) => ['stores', 'list', params ?? {}] as const,
  detail: (id: string) => ['stores', id] as const,
  stats: () => ['stores', 'stats'] as const,
};

export function useStores(params?: StoreQueryParams) {
  return useQuery({
    queryKey: storeKeys.list(params),
    queryFn: () => storeService.getAll(params),
  });
}

export function useStoreStats() {
  // API only allows ADMIN and ENTREPRENEUR on /stores/stats (403 PERM_001 for
  // everyone else) — matches who can open the /stores page. Skip the call for
  // other roles rather than let it fail and retry.
  const canReadStats = useAuthStore((s) => s.hasRole([ROLES.ADMIN, ROLES.ENTREPRENEUR]));
  return useQuery({
    queryKey: storeKeys.stats(),
    queryFn: () => storeService.getStats(),
    enabled: canReadStats,
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: storeKeys.detail(id),
    queryFn: () => storeService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoreDto) => storeService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUpdateStore(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStoreDto) => storeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(id) });
    },
  });
}

export function useUpdateStoreStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: StoreStatus) => storeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(id) });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storeService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  });
}

export function useUploadStoreDocument(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => storeService.uploadDocument(storeId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  });
}

export function useDeleteStoreDocument(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => storeService.deleteDocument(storeId, documentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  });
}

export function useUploadMenuPhoto(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => storeService.uploadMenuPhoto(storeId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  });
}

export function useDeleteMenuPhoto(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => storeService.deleteMenuPhoto(storeId, url),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  });
}

export function useUploadStoreCover(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => storeService.uploadCover(storeId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  });
}

export function useDeleteStoreCover(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => storeService.deleteCover(storeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  });
}

export function useUploadStorePhoto(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => storeService.uploadStorePhoto(storeId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  });
}

export function useDeleteStorePhoto(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => storeService.deleteStorePhoto(storeId, url),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) }),
  });
}
