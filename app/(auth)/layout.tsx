'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/stores/auth-store';
import { Loading } from '@/components/shared/loading';
import { resolvePostLoginRoute } from '@/constants/nav-config';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const hasHydrated = useHasHydrated();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && isAuthenticated && role) {
      // Must resolve to the same destination useLogin() picks. This effect also
      // fires the moment login writes the user to the store, and it would
      // otherwise overwrite the `?next=` redirect that just happened.
      //
      // The param is read off `window` instead of useSearchParams() because a
      // layout cannot sit inside the Suspense boundary that hook requires, and
      // this branch only ever runs on the client.
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(resolvePostLoginRoute(role, next));
    }
  }, [hasHydrated, isAuthenticated, role, router]);

  if (!hasHydrated) return <Loading className="min-h-screen" />;
  if (isAuthenticated && role) return null;

  return <>{children}</>;
}
