'use client'

import { useEffect } from 'react'
import { useAuthStore, useHasHydrated } from '@/stores/useAuthStore'
import { refreshAccessToken } from '@/services/api'

// accessToken is memory-only (see useAuthStore.ts), so a reload always loses
// it even though `isAuthenticated` persisted. Trade it back in for a fresh
// one using the httpOnly refresh cookie before the rest of the app renders
// authenticated data.
export function AuthBootstrap() {
  const hasHydrated = useHasHydrated()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken = useAuthStore((s) => s.accessToken)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || accessToken) return

    let cancelled = false
    refreshAccessToken().then((token) => {
      if (!cancelled && !token) logout()
    })
    return () => {
      cancelled = true
    }
  }, [hasHydrated, isAuthenticated, accessToken, logout])

  return null
}
