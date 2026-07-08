'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '../services/auth.service'
import { useAuthStore } from '@/stores/useAuthStore'
import { getDefaultRouteForRole } from '@/constants/nav-config'

export function useRegister() {
  const login = useAuthStore((s) => s.login)
  const router = useRouter()

  return useMutation({
    mutationFn: authService.register,
    onSuccess: ({ user, tokens }) => {
      login(user, tokens)
      router.replace(getDefaultRouteForRole(user.role))
    },
  })
}
