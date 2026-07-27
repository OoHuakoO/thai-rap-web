import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types/auth.types';
import { ROLES } from '@/types/auth.types';
import { dashboardService } from '../services/dashboard.service';
import type { Top20Entry } from '../types/dashboard.types';
import { Top20Card } from './top20-card';

vi.mock('../services/dashboard.service');

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const entry: Top20Entry = {
  rank: 1,
  storeId: 'store-01',
  storeName: 'ครัวริมธารจันทบุรี',
  province: 'จันทบุรี',
  storeType: 'อาหารไทย',
  t1Score: 92.45,
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function signInAs(role: Role) {
  useAuthStore.setState({
    user: { id: 'u1', name: 'ทดสอบ', email: 'test@example.com', role },
    isAuthenticated: true,
  });
}

beforeAll(() => {
  // Radix Select relies on pointer-capture and scrollIntoView, neither of which
  // jsdom implements — without these stubs opening the dropdown throws.
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

describe('Top20Card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAs(ROLES.ADMIN);
  });

  it('shows the empty state when the API returns no stores', async () => {
    vi.mocked(dashboardService.getTop20).mockResolvedValue([]);
    renderWithClient(<Top20Card />);

    await waitFor(() => expect(screen.getByText('ยังไม่มีข้อมูลคะแนนร้านค้า')).toBeInTheDocument());
  });

  it('renders the returned stores', async () => {
    vi.mocked(dashboardService.getTop20).mockResolvedValue([entry]);
    renderWithClient(<Top20Card />);

    await waitFor(() => expect(screen.getByText('ครัวริมธารจันทบุรี')).toBeInTheDocument());
    expect(screen.getByText('92.45')).toBeInTheDocument();
  });

  it('refetches with the selected round when the filter changes', async () => {
    vi.mocked(dashboardService.getTop20).mockResolvedValue([entry]);
    renderWithClient(<Top20Card />);

    await waitFor(() => expect(dashboardService.getTop20).toHaveBeenCalledWith('all'));

    await userEvent.click(screen.getByRole('combobox', { name: 'รอบการประเมิน' }));
    await userEvent.click(await screen.findByRole('option', { name: 'T1' }));

    await waitFor(() => expect(dashboardService.getTop20).toHaveBeenCalledWith('T1'));
  });

  it('shows the error message when the API fails', async () => {
    vi.mocked(dashboardService.getTop20).mockRejectedValue(new Error('โหลดข้อมูลไม่สำเร็จ'));
    renderWithClient(<Top20Card />);

    await waitFor(() => expect(screen.getByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument());
  });

  it('opens the store detail page when a row is clicked', async () => {
    vi.mocked(dashboardService.getTop20).mockResolvedValue([entry]);
    renderWithClient(<Top20Card />);

    await userEvent.click(await screen.findByText('ครัวริมธารจันทบุรี'));

    expect(push).toHaveBeenCalledWith('/stores/store-01');
  });

  // A general user reads the ranking on the overview but /stores does not admit
  // them — navigating would only bounce them straight back here.
  it('does not navigate or offer the store link for a role that cannot open /stores', async () => {
    signInAs(ROLES.VIEWER);
    vi.mocked(dashboardService.getTop20).mockResolvedValue([entry]);
    renderWithClient(<Top20Card />);

    await userEvent.click(await screen.findByText('ครัวริมธารจันทบุรี'));

    expect(push).not.toHaveBeenCalled();
    expect(screen.queryByText('ดูรายชื่อทั้งหมด 20 ร้าน')).not.toBeInTheDocument();
  });
});
