import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLogin } from './use-login';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/constants/routes';

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));
vi.mock('../services/auth.service');

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const entrepreneur = {
  id: '1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'ENTREPRENEUR' as const,
};
const tokens = { accessToken: 'token-123', expiresIn: 3600 };

async function loginWith(next?: string) {
  if (next) mockSearchParams.set('next', next);
  vi.mocked(authService.login).mockResolvedValue({ user: entrepreneur, tokens });

  const { result } = renderHook(() => useLogin(), { wrapper });
  result.current.mutate({ email: entrepreneur.email, password: 'password123' });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('next');
    useAuthStore.setState({
      user: null,
      accessToken: null,
      expiresAt: null,
      isAuthenticated: false,
    });
  });

  it('stores the user and redirects to the role default route on success', async () => {
    const user = {
      id: '1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'ENTREPRENEUR' as const,
    };
    const tokens = { accessToken: 'token-123', expiresIn: 3600 };
    vi.mocked(authService.login).mockResolvedValue({ user, tokens });

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ email: 'alice@example.com', password: 'password123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('surfaces an error and leaves the store unauthenticated when login fails', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ email: 'alice@example.com', password: 'wrong-password' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('returns the user to the path the guard bounced them off', async () => {
    await loginWith('/stores');
    expect(mockReplace).toHaveBeenCalledWith('/stores');
  });

  it('ignores a return path the role may not access', async () => {
    await loginWith('/users');
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.HOME);
  });

  it('ignores a protocol-relative return path', async () => {
    await loginWith('//evil.example.com');
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.HOME);
  });
});
