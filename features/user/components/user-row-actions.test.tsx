import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialogProvider } from '@/components/shared/confirm-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/types/auth.types';
import { createStore } from '@/mocks/factories/store.factory';
import { createUser } from '@/mocks/factories/user.factory';
import { storeService } from '@/features/store/services/store.service';
import { userService } from '../services/user.service';
import { USER_STATUSES } from '../types/user.types';
import { UserRowActions } from './user-row-actions';

vi.mock('@/features/store/services/store.service');
vi.mock('../services/user.service');

const OWNED_STORE_ID = 'store-1';

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>{ui}</ConfirmDialogProvider>
    </QueryClientProvider>
  );
}

function entrepreneur(ownedStores: { id: string; code: string; name: string }[]) {
  return createUser({
    id: 'user-1',
    name: 'ผู้ประกอบการ',
    role: ROLES.ENTREPRENEUR,
    status: USER_STATUSES.ACTIVE,
    ownedStores,
  });
}

function pendingApplicant() {
  return createUser({
    id: 'user-2',
    name: 'ผู้สมัครใหม่',
    role: ROLES.ASSESSOR,
    status: USER_STATUSES.PENDING,
  });
}

describe('UserRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        name: 'ผู้ดูแลระบบสูงสุด',
        email: 'super@example.com',
        role: ROLES.SUPER_ADMIN,
      },
      isAuthenticated: true,
    });
  });

  // Regression: the dialog used to stay mounted between opens, so its draft
  // selection froze at whatever the user held on first render. A store deleted
  // afterwards kept its tick — and its id went back to the API on save, which
  // 404s the whole request.
  it('drops a store from the selection once it is gone from the user', async () => {
    vi.mocked(storeService.getAll).mockResolvedValue({
      items: [createStore({ id: OWNED_STORE_ID, name: 'ร้านทดสอบ' })],
      meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
    });

    const owned = [{ id: OWNED_STORE_ID, code: 'S001', name: 'ร้านทดสอบ' }];
    const { rerender } = renderWithClient(<UserRowActions user={entrepreneur(owned)} />);

    await userEvent.click(screen.getByRole('button', { name: /กำหนดร้านที่เป็นเจ้าของ/ }));
    await waitFor(() => expect(screen.getByText('เลือกแล้ว 1 ร้าน')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));
    await waitFor(() => expect(screen.queryByText('เลือกแล้ว 1 ร้าน')).not.toBeInTheDocument());

    // The store is deleted elsewhere: the user list refetches without it, and
    // the store picker comes back empty.
    vi.mocked(storeService.getAll).mockResolvedValue({
      items: [],
      meta: { total: 0, page: 1, limit: 100, totalPages: 0 },
    });
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <ConfirmDialogProvider>
          <UserRowActions user={entrepreneur([])} />
        </ConfirmDialogProvider>
      </QueryClientProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: /กำหนดร้านที่เป็นเจ้าของ/ }));
    await waitFor(() => expect(screen.getByText('เลือกแล้ว 0 ร้าน')).toBeInTheDocument());
  });

  // A mentor takes the same assignment list an assessor does — it is how it
  // reaches a store's assessment at all — so the row must offer the dialog and
  // seed it from assignedStoreIds, not from the owned list.
  it('assigns stores to a mentor from the assignment list', async () => {
    vi.mocked(storeService.getAll).mockResolvedValue({
      items: [createStore({ id: OWNED_STORE_ID, name: 'ร้านทดสอบ' })],
      meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
    });
    const mentor = createUser({
      id: 'user-3',
      name: 'ที่ปรึกษา',
      role: ROLES.MENTOR,
      status: USER_STATUSES.ACTIVE,
      assignedStores: [{ id: OWNED_STORE_ID, code: 'S001', name: 'ร้านทดสอบ' }],
    });
    vi.mocked(userService.assignStores).mockResolvedValue(mentor);

    renderWithClient(<UserRowActions user={mentor} />);

    await userEvent.click(screen.getByRole('button', { name: /มอบหมายร้าน/ }));
    await waitFor(() => expect(screen.getByText('กำหนดร้านที่ให้คำปรึกษา')).toBeInTheDocument());
    expect(screen.getByText('เลือกแล้ว 1 ร้าน')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'บันทึก' }));

    await waitFor(() =>
      expect(userService.assignStores).toHaveBeenCalledWith('user-3', {
        storeIds: [OWNED_STORE_ID],
      })
    );
  });

  it('deletes the account when a pending sign-up is rejected', async () => {
    vi.mocked(userService.remove).mockResolvedValue(null);

    renderWithClient(<UserRowActions user={pendingApplicant()} />);

    await userEvent.click(screen.getByRole('button', { name: /ไม่อนุมัติ/ }));
    await userEvent.click(screen.getByRole('button', { name: 'ไม่อนุมัติและลบบัญชี' }));

    await waitFor(() => expect(userService.remove).toHaveBeenCalledWith('user-2'));
  });

  it('keeps the account when the reject confirmation is cancelled', async () => {
    renderWithClient(<UserRowActions user={pendingApplicant()} />);

    await userEvent.click(screen.getByRole('button', { name: /ไม่อนุมัติ/ }));
    await userEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));

    expect(userService.remove).not.toHaveBeenCalled();
  });

  // Rejecting is the other half of the approval decision, so it disappears the
  // moment the account is live — /users is not a place to delete real accounts.
  it('offers no reject action once the account is active', () => {
    renderWithClient(<UserRowActions user={entrepreneur([])} />);

    expect(screen.queryByRole('button', { name: /ไม่อนุมัติ/ })).not.toBeInTheDocument();
  });
});
