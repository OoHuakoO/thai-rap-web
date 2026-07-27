import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ROLES, ROLE_LABELS } from '@/types/auth.types';
import { RegisterForm } from './register-form';
import { useRegister } from '../hooks/use-register';
import { REGISTERABLE_ROLES } from '../schemas/register.schema';

vi.mock('../hooks/use-register');

// jsdom doesn't implement the Pointer Events methods Radix's Select uses to
// open/close on click — without these the dropdown never opens in tests.
Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

function mockUseRegister(overrides: Partial<ReturnType<typeof useRegister>> = {}) {
  vi.mocked(useRegister).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useRegister>);
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors when submitted empty', async () => {
    mockUseRegister();
    render(<RegisterForm />);

    await userEvent.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));

    await waitFor(() =>
      expect(screen.getByText('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')).toBeInTheDocument()
    );
    expect(screen.getByText('อีเมลไม่ถูกต้อง')).toBeInTheDocument();
    expect(screen.getByText('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')).toBeInTheDocument();
  });

  it('shows a mismatch error when password and confirmPassword differ', async () => {
    mockUseRegister();
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('ชื่อ'), 'สมศรี ใจดี');
    await userEvent.type(screen.getByLabelText('อีเมล'), 'somsri@example.com');
    await userEvent.type(screen.getByLabelText('รหัสผ่าน'), 'password123');
    await userEvent.type(screen.getByLabelText('ยืนยันรหัสผ่าน'), 'different123');
    await userEvent.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));

    await waitFor(() => expect(screen.getByText('รหัสผ่านไม่ตรงกัน')).toBeInTheDocument());
  });

  // REGISTERABLE_ROLES mirrors SELF_REGISTERABLE_ROLES in thai-rap-api — staff
  // roles self-register today, only the admin roles are withheld. Asserting
  // against the list keeps this test honest when that product call changes.
  it('offers every self-registerable role and never an admin one', async () => {
    mockUseRegister();
    render(<RegisterForm />);

    await userEvent.click(screen.getByRole('combobox', { name: 'บทบาท' }));

    const listbox = within(await screen.findByRole('listbox'));
    for (const role of REGISTERABLE_ROLES) {
      expect(listbox.getByText(ROLE_LABELS[role])).toBeInTheDocument();
    }
    expect(listbox.queryByText(ROLE_LABELS[ROLES.ADMIN])).not.toBeInTheDocument();
    expect(listbox.queryByText(ROLE_LABELS[ROLES.SUPER_ADMIN])).not.toBeInTheDocument();
  });

  it('submits with the default role and strips confirmPassword from the payload', async () => {
    const mutate = vi.fn();
    mockUseRegister({ mutate });
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('ชื่อ'), 'สมศรี ใจดี');
    await userEvent.type(screen.getByLabelText('อีเมล'), 'somsri@example.com');
    await userEvent.type(screen.getByLabelText('รหัสผ่าน'), 'password123');
    await userEvent.type(screen.getByLabelText('ยืนยันรหัสผ่าน'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /สมัครสมาชิก/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        name: 'สมศรี ใจดี',
        email: 'somsri@example.com',
        password: 'password123',
        role: 'ENTREPRENEUR',
      })
    );
  });

  it('shows the server error message when registration fails', () => {
    mockUseRegister({ isError: true, error: new Error('อีเมลนี้ถูกใช้งานแล้ว') });
    render(<RegisterForm />);

    expect(screen.getByText('อีเมลนี้ถูกใช้งานแล้ว')).toBeInTheDocument();
  });

  it('disables the submit button while pending', () => {
    mockUseRegister({ isPending: true });
    render(<RegisterForm />);

    expect(screen.getByRole('button', { name: /กำลังสมัครสมาชิก/i })).toBeDisabled();
  });
});
