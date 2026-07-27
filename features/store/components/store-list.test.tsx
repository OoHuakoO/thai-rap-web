import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialogProvider } from '@/components/shared/confirm-dialog';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types/auth.types';
import { ROLES } from '@/types/auth.types';
import { createStore } from '@/mocks/factories/store.factory';
import { storeService } from '../services/store.service';
import { StoreList } from './store-list';

vi.mock('../services/store.service');

const OWN_STORE_ID = 'store-own';
const OTHER_STORE_ID = 'store-other';
const USER_ID = 'user-1';

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>{ui}</ConfirmDialogProvider>
    </QueryClientProvider>
  );
}

function signInAs(role: Role) {
  useAuthStore.setState({
    user: { id: USER_ID, name: 'ทดสอบ', email: 'test@example.com', role },
    isAuthenticated: true,
  });
}

describe('StoreList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storeService.getAll).mockResolvedValue({
      items: [
        createStore({ id: OWN_STORE_ID, name: 'ร้านของฉัน', ownerId: USER_ID }),
        createStore({ id: OTHER_STORE_ID, name: 'ร้านคนอื่น', ownerId: 'user-2' }),
      ],
      meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
    });
  });

  // An entrepreneur browses the whole directory but manages only its own store,
  // so store:write alone must not put an edit button on every row.
  it('offers edit and delete to an entrepreneur on its own store only', async () => {
    signInAs(ROLES.ENTREPRENEUR);
    renderWithClient(<StoreList />);

    await waitFor(() => expect(screen.getByText('ร้านของฉัน')).toBeInTheDocument());

    expect(screen.getAllByTitle('แก้ไขร้าน')).toHaveLength(1);
    expect(screen.getAllByTitle('ลบร้าน')).toHaveLength(1);
    // Both rows stay readable — browsing is not gated on ownership.
    expect(screen.getAllByTitle('ดูรายละเอียดเต็ม')).toHaveLength(2);
  });

  it('offers edit and delete to an admin on every store', async () => {
    signInAs(ROLES.ADMIN);
    renderWithClient(<StoreList />);

    await waitFor(() => expect(screen.getByText('ร้านของฉัน')).toBeInTheDocument());

    expect(screen.getAllByTitle('แก้ไขร้าน')).toHaveLength(2);
    expect(screen.getAllByTitle('ลบร้าน')).toHaveLength(2);
  });
});
