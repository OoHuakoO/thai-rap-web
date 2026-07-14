import { describe, it, expect, vi } from 'vitest';
import api from '@/services/api';
import { authService } from './auth.service';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authService', () => {
  it('calls POST /auth/login with credentials', async () => {
    const payload = { email: 'alice@example.com', password: 'password123' };
    vi.mocked(api.post).mockResolvedValue({ data: { user: {}, tokens: {} } });
    await authService.login(payload);
    expect(api.post).toHaveBeenCalledWith('/auth/login', payload);
  });

  it('calls POST /auth/register with the registration payload', async () => {
    const payload = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
      role: 'ENTREPRENEUR' as const,
    };
    vi.mocked(api.post).mockResolvedValue({ data: { user: {}, tokens: {} } });
    await authService.register(payload);
    expect(api.post).toHaveBeenCalledWith('/auth/register', payload);
  });

  it('calls POST /auth/logout with no payload', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: undefined });
    await authService.logout();
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
  });
});
