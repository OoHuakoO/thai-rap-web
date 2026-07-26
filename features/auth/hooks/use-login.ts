'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { resolvePostLoginRoute } from '@/constants/nav-config';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  // The dashboard guard appends `?next=` when it bounces a signed-out user, so
  // logging in returns them to where they were headed instead of the role's
  // landing page. resolvePostLoginRoute() validates it before trusting it.
  const next = useSearchParams().get('next');

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, tokens }) => {
      login(user, tokens);
      router.replace(resolvePostLoginRoute(user.role, next));
    },
  });
}
