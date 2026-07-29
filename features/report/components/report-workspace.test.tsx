import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storeService } from '@/features/store/services/store.service';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES, type Role } from '@/types/auth.types';
import { reportService } from '../services/report.service';
import { ReportWorkspace } from './report-workspace';

vi.mock('@/features/store/services/store.service');
vi.mock('../services/report.service');

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function signInAs(role: Role) {
  useAuthStore.setState({
    user: { id: 'user-1', name: 'ผู้ใช้', email: 'user@example.com', role },
    isAuthenticated: true,
  });
}

describe('ReportWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storeService.getAll).mockResolvedValue({
      items: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue({
      round: 'T0',
      dimensions: [],
      rows: [],
      averageByDimension: {},
      averageWeightedScore: null,
    });
  });

  it('offers the all-stores matrix to an admin', async () => {
    signInAs(ROLES.ADMIN);
    renderWithClient(<ReportWorkspace />);

    expect(await screen.findByRole('tab', { name: 'รายงานทุกร้าน (รายมิติ)' })).toBeInTheDocument();
  });

  // Only an admin compares one store against another; everyone else keeps the
  // single-store report, with no scope tab strip at all.
  it('shows other roles the store report only', async () => {
    signInAs(ROLES.ENTREPRENEUR);
    renderWithClient(<ReportWorkspace />);

    expect(await screen.findByText('ยังไม่มีร้านที่เข้าถึงได้')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'รายงานทุกร้าน (รายมิติ)' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'รายงานรายร้าน' })).not.toBeInTheDocument();
  });
});
