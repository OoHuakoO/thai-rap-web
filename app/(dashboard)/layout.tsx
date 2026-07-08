'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, useHasHydrated } from '@/stores/useAuthStore'
import { AppShell } from '@/components/layout/app-shell'
import { Loading } from '@/components/shared/loading'
import { ROUTES } from '@/constants/routes'
import { canAccessRoute } from '@/constants/permissions'
import { getDefaultRouteForRole } from '@/constants/nav-config'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role)
  const hasHydrated = useHasHydrated()
  const router = useRouter()
  const pathname = usePathname()

  const isAllowed = role ? canAccessRoute(role, pathname) : false

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN)
      return
    }
    if (role && !isAllowed) {
      router.replace(getDefaultRouteForRole(role))
    }
  }, [hasHydrated, isAuthenticated, role, isAllowed, router])

  if (!hasHydrated) return <Loading className="min-h-screen" />
  if (!isAuthenticated) return null
  if (role && !isAllowed) return null

  return <AppShell>{children}</AppShell>
}
