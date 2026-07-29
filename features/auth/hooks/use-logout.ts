'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/constants/routes';

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      logout();
      // The cache outlives the session otherwise: the next account to sign in
      // is served the previous one's data from cache while the refetch is in
      // flight, and anything mounting off that first render keeps it.
      queryClient.clear();
      router.replace(ROUTES.LOGIN);
    },
  });
}
