'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccessControlStore } from '@/stores/access-control-store';
import type { AccessControlConfig } from '@/types/auth.types';
import { accessControlService } from '../services/access-control.service';

export const accessControlKeys = {
  all: ['access-control'] as const,
};

/**
 * Loads the SUPER_ADMIN-defined matrix and mirrors it into the Zustand store so
 * `hasPermission()` / route guards resolve against it. The query cache stays the
 * source of truth for the admin page; the store is only the non-React read path.
 */
export function useAccessControl() {
  const setConfig = useAccessControlStore((s) => s.setConfig);

  return useQuery({
    queryKey: accessControlKeys.all,
    queryFn: async () => {
      const config = await accessControlService.get();
      setConfig(config);
      return config;
    },
  });
}

export function useUpdateAccessControl() {
  const queryClient = useQueryClient();
  const setConfig = useAccessControlStore((s) => s.setConfig);

  return useMutation({
    mutationFn: accessControlService.update,
    onSuccess: (config: AccessControlConfig) => {
      setConfig(config);
      queryClient.setQueryData(accessControlKeys.all, config);
    },
  });
}

export function useResetAccessControl() {
  const queryClient = useQueryClient();
  const setConfig = useAccessControlStore((s) => s.setConfig);

  return useMutation({
    mutationFn: accessControlService.reset,
    onSuccess: (config: AccessControlConfig) => {
      setConfig(config);
      queryClient.setQueryData(accessControlKeys.all, config);
    },
  });
}
