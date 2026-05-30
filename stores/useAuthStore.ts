import { useState, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, Role, Permission } from '@/types/auth.types'
import { hasPermission } from '@/constants/permissions'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (user: AuthUser, token: string) => void
  logout: () => void
  can: (permission: Permission) => boolean
  hasRole: (role: Role | Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

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
        token: state.token,
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
