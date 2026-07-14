'use client'

import { useState, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, Role, Permission } from '@/types/auth.types'
import type { AuthTokens } from '@/features/auth/types/auth-response.types'
import { hasPermission } from '@/constants/permissions'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  expiresAt: number | null
  isAuthenticated: boolean
  login: (user: AuthUser, tokens: AuthTokens) => void
  setTokens: (tokens: AuthTokens) => void
  logout: () => void
  can: (permission: Permission) => boolean
  hasRole: (role: Role | Role[]) => boolean
}

// refreshToken lives in an httpOnly cookie set by the backend — never held here.
// accessToken is intentionally excluded from `partialize` so it never touches
// localStorage; on reload it's re-obtained via a silent /auth/refresh call.
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      expiresAt: null,
      isAuthenticated: false,

      login: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken,
          expiresAt: Date.now() + tokens.expiresIn * 1000,
          isAuthenticated: true,
        }),

      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          expiresAt: Date.now() + tokens.expiresIn * 1000,
        }),

      logout: () =>
        set({ user: null, accessToken: null, expiresAt: null, isAuthenticated: false }),

      can: (permission) => {
        const { user } = get()
        if (!user) return false
        return hasPermission(user.role, permission)
      },

      hasRole: (role) => {
        const { user } = get()
        if (!user) return false
        const roles = Array.isArray(role) ? role : [role]
        return roles.includes(user.role)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true))
    setHasHydrated(useAuthStore.persist.hasHydrated())
    return unsub
  }, [])

  return hasHydrated
}
