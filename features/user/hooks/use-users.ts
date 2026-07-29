import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storeKeys } from '@/features/store';
import { userService } from '../services/user.service';
import type { AssignStoresDto, CreateUserDto, UserQueryParams } from '../types/user.types';

export const userKeys = {
  all: ['users'] as const,
  list: (params?: UserQueryParams) => ['users', 'list', params ?? {}] as const,
  stats: () => ['users', 'stats'] as const,
  detail: (id: string) => ['users', id] as const,
};

export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getAll(params),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userService.getStats(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

/** No endpoint behind this yet — see CreateUserDto. Kept for CreateUserForm. */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useApproveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useAssignStores(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignStoresDto) => userService.assignStores(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useAssignOwnedStores(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignStoresDto) => userService.assignOwnedStores(id, data),
    // Ownership is what an entrepreneur's store list resolves against, so the
    // store cache goes stale the moment this lands — not just the user list.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
}
