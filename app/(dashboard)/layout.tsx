'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Loading } from '@/components/shared/loading';
import { getDefaultRouteForRole } from '@/constants/nav-config';
import { canAccessRoute } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useAuthStore, useHasHydrated } from '@/stores/auth-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const pathname = usePathname();

  const isAllowed = useMemo(
    () => (isAuthenticated && role ? canAccessRoute(role, pathname) : false),
    [isAuthenticated, role, pathname]
  );

  useEffect(() => {
    // The persisted auth store must have rehydrated before the guard can trust
    // what it reads — deciding on the pre-hydration defaults bounces people off
    // pages they are in fact allowed to see.
    if (!hasHydrated) return;
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
  }, [hasHydrated, isAuthenticated, role, isAllowed, pathname, router]);

  if (!hasHydrated) return <Loading className="min-h-screen" />;
  if (!isAuthenticated || !role || !isAllowed) return null;

  return <AppShell>{children}</AppShell>;
}
