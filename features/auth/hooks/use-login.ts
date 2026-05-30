'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '../services/auth.service'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/constants/routes'

export function useLogin() {
  const login = useAuthStore((s) => s.login)
  const router = useRouter()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, token }) => {
      login(user, token)
      router.replace(ROUTES.HOME)
    },
  })
}
