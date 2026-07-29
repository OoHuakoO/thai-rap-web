import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForgotPasswordForm } from './forgot-password-form';
import { useForgotPassword } from '../hooks/use-forgot-password';
import { useVerifyOtp } from '../hooks/use-verify-otp';
import { useResetPassword } from '../hooks/use-reset-password';

vi.mock('../hooks/use-forgot-password');
vi.mock('../hooks/use-verify-otp');
vi.mock('../hooks/use-reset-password');

type MutationLike = { mutate: ReturnType<typeof vi.fn>; isPending: boolean; isError: boolean };

function mockMutation(
  hook: typeof useForgotPassword | typeof useVerifyOtp | typeof useResetPassword,
  overrides: Partial<MutationLike> & { error?: unknown } = {}
) {
  const mutate = overrides.mutate ?? vi.fn();
  vi.mocked(hook).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  } as never);
  return mutate;
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutation(useForgotPassword);
    mockMutation(useVerifyOtp);
    mockMutation(useResetPassword);
  });

  it('shows a validation error when submitted without an email', async () => {
    render(<ForgotPasswordForm />);

    await userEvent.click(screen.getByRole('button', { name: 'ส่งรหัส OTP' }));

    await waitFor(() => expect(screen.getByText('อีเมลไม่ถูกต้อง')).toBeInTheDocument());
  });

  it('requests an otp for the entered email', async () => {
    const mutate = mockMutation(useForgotPassword);
    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText('อีเมล'), 'alice@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'ส่งรหัส OTP' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({ email: 'alice@example.com' }, expect.anything())
    );
  });

  it('moves to the otp step once the request succeeds', async () => {
    mockMutation(useForgotPassword, {
      mutate: vi.fn((_vars, opts) => opts.onSuccess()),
    });
    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText('อีเมล'), 'alice@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'ส่งรหัส OTP' }));

    await waitFor(() => expect(screen.getByLabelText('รหัส OTP')).toBeInTheDocument());
    expect(screen.getByText(/alice@example.com/)).toBeInTheDocument();
  });

  it('rejects an otp that is not six digits', async () => {
    mockMutation(useForgotPassword, { mutate: vi.fn((_vars, opts) => opts.onSuccess()) });
    const verify = mockMutation(useVerifyOtp);
    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText('อีเมล'), 'alice@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'ส่งรหัส OTP' }));

    await userEvent.type(await screen.findByLabelText('รหัส OTP'), '123');
    await userEvent.click(screen.getByRole('button', { name: 'ยืนยันรหัส OTP' }));

    await waitFor(() =>
      expect(screen.getByText('รหัส OTP ต้องเป็นตัวเลข 6 หลัก')).toBeInTheDocument()
    );
    expect(verify).not.toHaveBeenCalled();
  });

  it('walks email → otp → new password → success', async () => {
    mockMutation(useForgotPassword, { mutate: vi.fn((_vars, opts) => opts.onSuccess()) });
    mockMutation(useVerifyOtp, {
      mutate: vi.fn((_vars, opts) => opts.onSuccess({ resetToken: 'reset-token', expiresIn: 600 })),
    });
    const reset = mockMutation(useResetPassword, {
      mutate: vi.fn((_vars, opts) => opts.onSuccess()),
    });
    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText('อีเมล'), 'alice@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'ส่งรหัส OTP' }));

    await userEvent.type(await screen.findByLabelText('รหัส OTP'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'ยืนยันรหัส OTP' }));

    await userEvent.type(await screen.findByLabelText('รหัสผ่านใหม่'), 'newpassword1');
    await userEvent.type(screen.getByLabelText('ยืนยันรหัสผ่านใหม่'), 'newpassword1');
    await userEvent.click(screen.getByRole('button', { name: 'ตั้งรหัสผ่านใหม่' }));

    await waitFor(() =>
      expect(reset).toHaveBeenCalledWith(
        { resetToken: 'reset-token', password: 'newpassword1' },
        expect.anything()
      )
    );
    expect(await screen.findByText('ตั้งรหัสผ่านใหม่เรียบร้อย')).toBeInTheDocument();
  });

  it('shows the server error when the otp is rejected', async () => {
    mockMutation(useForgotPassword, { mutate: vi.fn((_vars, opts) => opts.onSuccess()) });
    mockMutation(useVerifyOtp, { isError: true, error: new Error('รหัส OTP ไม่ถูกต้อง') });
    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText('อีเมล'), 'alice@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'ส่งรหัส OTP' }));

    expect(await screen.findByText('รหัส OTP ไม่ถูกต้อง')).toBeInTheDocument();
  });
});
