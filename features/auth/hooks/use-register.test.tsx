import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRegister } from './use-register';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/stores/auth-store';

vi.mock('../services/auth.service');

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      expiresAt: null,
      isAuthenticated: false,
    });
  });

  it('leaves the store unauthenticated on success — the account is pending approval', async () => {
    const user = { id: '2', name: 'Bob', email: 'bob@example.com', role: 'ENTREPRENEUR' as const };
    vi.mocked(authService.register).mockResolvedValue({ user });

    const { result } = renderHook(() => useRegister(), { wrapper });
    result.current.mutate({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      role: 'ENTREPRENEUR',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('surfaces an error and leaves the store unauthenticated when registration fails', async () => {
    vi.mocked(authService.register).mockRejectedValue(new Error('Email already in use'));

    const { result } = renderHook(() => useRegister(), { wrapper });
    result.current.mutate({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      role: 'ENTREPRENEUR',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
