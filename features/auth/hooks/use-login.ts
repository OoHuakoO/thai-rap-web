'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { getDefaultRouteForRole } from '@/constants/nav-config';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, tokens }) => {
      login(user, tokens);
      router.replace(getDefaultRouteForRole(user.role));
    },
  });
}
