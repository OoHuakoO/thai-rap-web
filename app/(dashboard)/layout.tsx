'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Loading } from '@/components/shared/loading';
import { getDefaultRouteForRole } from '@/constants/nav-config';
import { canAccessRoute } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useAccessControlHasHydrated, useAccessControlStore } from '@/stores/access-control-store';
import { useAuthStore, useHasHydrated } from '@/stores/auth-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const hasHydrated = useHasHydrated();
  const accessControlHasHydrated = useAccessControlHasHydrated();
  const rolePermissions = useAccessControlStore((s) => s.rolePermissions);
  const router = useRouter();
  const pathname = usePathname();

  // Both persisted stores must have rehydrated before the guard can trust what
  // it reads: auth for who the user is, access-control for the matrix
  // canAccessRoute() checks against. Deciding on the pre-hydration defaults
  // bounces people off pages they are in fact allowed to see.
  const isReady = hasHydrated && accessControlHasHydrated;

  const isAllowed = useMemo(
    () => (isAuthenticated && role ? canAccessRoute(role, pathname) : false),
    // canAccessRoute() reads the saved matrix through getState(), which React
    // cannot track — listing the subscribed `rolePermissions` here is what
    // re-runs the guard when SUPER_ADMIN saves new permissions, instead of
    // leaving a user on a page they just lost access to until they navigate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, role, pathname, rolePermissions]
  );

  useEffect(() => {
    if (!isReady) return;
    // A session with no role satisfies no permission check, so it counts as
    // signed out. Guarding on `isAuthenticated` alone let a roleless session
    // (e.g. a hand-edited `auth-storage` entry) fall through both checks below
    // and render the shell on every route.
    if (!isAuthenticated || !role) {
      router.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isAllowed) {
      router.replace(getDefaultRouteForRole(role));
    }
  }, [isReady, isAuthenticated, role, isAllowed, pathname, router]);

  if (!isReady) return <Loading className="min-h-screen" />;
  if (!isAuthenticated || !role || !isAllowed) return null;

  return <AppShell>{children}</AppShell>;
}
