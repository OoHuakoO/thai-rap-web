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

  it('calls POST /auth/forgot-password with the email', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    await authService.forgotPassword({ email: 'alice@example.com' });
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'alice@example.com',
    });
  });

  it('calls POST /auth/verify-otp with the email and code', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { resetToken: 'token', expiresIn: 600 } });
    const result = await authService.verifyOtp({ email: 'alice@example.com', otp: '123456' });
    expect(api.post).toHaveBeenCalledWith('/auth/verify-otp', {
      email: 'alice@example.com',
      otp: '123456',
    });
    expect(result.resetToken).toBe('token');
  });

  it('calls POST /auth/reset-password with the reset token and new password', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });
    await authService.resetPassword({ resetToken: 'token', password: 'newpassword1' });
    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      resetToken: 'token',
      password: 'newpassword1',
    });
  });
});
