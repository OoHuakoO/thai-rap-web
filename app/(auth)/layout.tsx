'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useHasHydrated } from '@/stores/auth-store'
import { Loading } from '@/components/shared/loading'
import { getDefaultRouteForRole } from '@/constants/nav-config'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role)
  const hasHydrated = useHasHydrated()
  const router = useRouter()

  useEffect(() => {
    if (hasHydrated && isAuthenticated && role) {
      router.replace(getDefaultRouteForRole(role))
    }
  }, [hasHydrated, isAuthenticated, role, router])

  if (!hasHydrated) return <Loading className="min-h-screen" />
  if (isAuthenticated && role) return null

  return <>{children}</>
}
