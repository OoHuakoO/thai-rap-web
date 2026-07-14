'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '../services/auth.service'
import { useAuthStore } from '@/stores/auth-store'
import { ROUTES } from '@/constants/routes'

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      logout()
      router.replace(ROUTES.LOGIN)
    },
  })
}
