import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types/auth.types';
import { ROLES } from '@/types/auth.types';
import { downloadBlob } from '@/utils/download-blob';
import { dashboardService } from '../services/dashboard.service';
import type { ReportStatusItem } from '../types/dashboard.types';
import { ReportsStatusCard } from './reports-status-card';

vi.mock('../services/dashboard.service');
vi.mock('@/utils/download-blob');

const report: ReportStatusItem = {
  id: 'rpt-01',
  name: 'รายงานผลการประเมิน T1 - ครัวริมธาร',
  format: 'XLSX',
  createdAt: '2026-07-29T02:00:00.000Z',
  status: 'DONE',
  downloadUrl: '/reports/stores/store-1/rounds/T1/export?format=xlsx',
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

describe('ReportsStatusCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAs(ROLES.ADMIN);
    vi.mocked(dashboardService.getReportsStatus).mockResolvedValue([]);
  });

  it('shows the empty state when nothing has been exported yet', async () => {
    renderWithClient(<ReportsStatusCard />);

    await waitFor(() => expect(screen.getByText('ยังไม่มีรายงานที่ส่งออก')).toBeInTheDocument());
  });

  it('lists an exported report', async () => {
    vi.mocked(dashboardService.getReportsStatus).mockResolvedValue([report]);

    renderWithClient(<ReportsStatusCard />);

    await waitFor(() => expect(screen.getByText(report.name)).toBeInTheDocument());
  });

  it('downloads through the api client and saves the returned blob', async () => {
    const blob = new Blob(['x']);
    vi.mocked(dashboardService.getReportsStatus).mockResolvedValue([report]);
    vi.mocked(dashboardService.downloadReport).mockResolvedValue({
      blob,
      filename: 'assessment-report-T1.xlsx',
    });

    renderWithClient(<ReportsStatusCard />);
    await waitFor(() => expect(screen.getByText(report.name)).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: `ดาวน์โหลด ${report.name}` }));

    await waitFor(() =>
      expect(dashboardService.downloadReport).toHaveBeenCalledWith(report.downloadUrl)
    );
    expect(downloadBlob).toHaveBeenCalledWith(blob, 'assessment-report-T1.xlsx');
  });

  it('disables the download for a role without reports:export', async () => {
    signInAs(ROLES.VIEWER);
    vi.mocked(dashboardService.getReportsStatus).mockResolvedValue([report]);

    renderWithClient(<ReportsStatusCard />);
    await waitFor(() => expect(screen.getByText(report.name)).toBeInTheDocument());

    expect(screen.getByRole('button', { name: `ดาวน์โหลด ${report.name}` })).toBeDisabled();
  });
});
