import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types/auth.types';
import { ROLES } from '@/types/auth.types';
import { storeService } from '../services/store.service';
import { useStoreStats } from './use-stores';

vi.mock('../services/store.service');

const STATS = {
  total: 51,
  targetTotal: 400,
  t0CompletedCount: 40,
  t1CompletedCount: 24,
  t2CompletedCount: 0,
  t3CompletedCount: 0,
  storeTypes: [],
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function signInAs(role: Role) {
  useAuthStore.setState({
    user: { id: 'user-1', name: 'ทดสอบ', email: 'test@example.com', role },
    isAuthenticated: true,
  });
}

describe('useStoreStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storeService.getStats).mockResolvedValue(STATS);
  });

  // SUPER_ADMIN is an ADMIN plus user management on the API side, so the
  // aggregate endpoint answers it — leaving it out of the role list hid the
  // stats bar on /stores from the one role that sees everything else.
  it.each([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ENTREPRENEUR])('fetches for %s', async (role) => {
    signInAs(role);
    const { result } = renderHook(() => useStoreStats(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(STATS);
  });

  it('skips the call for a role the API would 403', async () => {
    signInAs(ROLES.ASSESSOR);
    const { result } = renderHook(() => useStoreStats(), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(storeService.getStats).not.toHaveBeenCalled();
  });
});
