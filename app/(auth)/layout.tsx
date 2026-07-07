'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useHasHydrated } from '@/stores/useAuthStore'
import { Loading } from '@/components/shared/loading'
import { ROUTES } from '@/constants/routes'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasHydrated = useHasHydrated()
  const router = useRouter()

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace(ROUTES.ASSESSMENT)
    }
  }, [hasHydrated, isAuthenticated, router])

  if (!hasHydrated) return <Loading className="min-h-screen" />
  if (isAuthenticated) return null

  return <>{children}</>
}
