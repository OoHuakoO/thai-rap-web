import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLogout } from './use-logout';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/constants/routes';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));
vi.mock('../services/auth.service');

let queryClient: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const loggedInUser = {
  id: '1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'ENTREPRENEUR' as const,
};

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useAuthStore.setState({
      user: loggedInUser,
      accessToken: 'token-123',
      expiresAt: Date.now() + 3600_000,
      isAuthenticated: true,
    });
  });

  it('clears the store and redirects to login when the API call succeeds', async () => {
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false));
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it('still clears the store and redirects to login when the API call fails', async () => {
    vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false));
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  // The next account to sign in must not be served the previous one's data
  // from cache while its own refetch is still in flight.
  it('empties the query cache so no data outlives the session', async () => {
    vi.mocked(authService.logout).mockResolvedValue(undefined);
    queryClient.setQueryData(['users'], [loggedInUser]);

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(queryClient.getQueryData(['users'])).toBeUndefined());
  });
});
