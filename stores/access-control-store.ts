'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AccessControlConfig,
  Permission,
  Role,
  RoleDataScopes,
  StoreFieldKey,
} from '@/types/auth.types';

interface AccessControlState {
  // Null until the SUPER_ADMIN-defined config has been fetched at least once —
  // every reader falls back to the DEFAULT_* tables in constants/permissions.ts
  // while it is null, so the app is never permission-less on first paint.
  rolePermissions: Record<Role, Permission[]> | null;
  roleScopes: Record<Role, RoleDataScopes> | null;
  publicStoreFields: StoreFieldKey[] | null;
  updatedAt: string | null;
  setConfig: (config: AccessControlConfig) => void;
  reset: () => void;
}

const EMPTY_STATE = {
  rolePermissions: null,
  roleScopes: null,
  publicStoreFields: null,
  updatedAt: null,
} as const;

// Persisted so a reload doesn't briefly fall back to the built-in defaults and
// flash nav items the SUPER_ADMIN has revoked. This is a UX cache only — the
// backend re-checks every request, so a stale local copy grants nothing.
export const useAccessControlStore = create<AccessControlState>()(
  persist(
    (set) => ({
      ...EMPTY_STATE,

      setConfig: (config) =>
        set({
          rolePermissions: config.rolePermissions,
          roleScopes: config.roleScopes,
          publicStoreFields: config.publicStoreFields,
          updatedAt: config.updatedAt,
        }),

      reset: () => set({ ...EMPTY_STATE }),
    }),
    { name: 'access-control-storage' }
  )
);

export function useAccessControlHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAccessControlStore.persist.onFinishHydration(() => setHasHydrated(true));
    setHasHydrated(useAccessControlStore.persist.hasHydrated());
    return unsub;
  }, []);

  return hasHydrated;
}
