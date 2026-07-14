import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './login-form';
import { useLogin } from '../hooks/use-login';

vi.mock('../hooks/use-login');

function mockUseLogin(overrides: Partial<ReturnType<typeof useLogin>> = {}) {
  vi.mocked(useLogin).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useLogin>);
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors when submitted empty', async () => {
    mockUseLogin();
    render(<LoginForm />);

    await userEvent.click(screen.getByRole('button', { name: /เข้าสู่ระบบ/i }));

    await waitFor(() => expect(screen.getByText('อีเมลไม่ถูกต้อง')).toBeInTheDocument());
    expect(screen.getByText('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')).toBeInTheDocument();
  });

  it('submits with valid credentials', async () => {
    const mutate = vi.fn();
    mockUseLogin({ mutate });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('อีเมล'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('รหัสผ่าน'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /เข้าสู่ระบบ/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'password123',
      })
    );
  });

  it('shows the server error message when login fails', () => {
    mockUseLogin({ isError: true, error: new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง') });
    render(<LoginForm />);

    expect(screen.getByText('อีเมลหรือรหัสผ่านไม่ถูกต้อง')).toBeInTheDocument();
  });

  it('disables the submit button while pending', () => {
    mockUseLogin({ isPending: true });
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /กำลังเข้าสู่ระบบ/i })).toBeDisabled();
  });
});
