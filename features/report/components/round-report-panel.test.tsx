import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob } from '@/utils/download-blob';
import { reportService } from '../services/report.service';
import type { RoundReport } from '../types/report.types';
import { RoundReportPanel } from './round-report-panel';

vi.mock('../services/report.service');
vi.mock('@/utils/download-blob');

const report: RoundReport = {
  store: {
    id: 'store-1',
    name: 'ครัวริมธารจันทบุรี',
    province: 'จันทบุรี',
    storeType: 'อาหารไทย',
    ownerName: 'นางสาวศิริวรรณ',
  },
  round: 'T1',
  totalScore: 75.8,
  zone: 'Growth Zone',
  assessorName: 'นายสมชาย วงษ์สมบัติ',
  submittedAt: '2026-05-20T00:00:00.000Z',
  notes: 'ผ่านเกณฑ์ทุกมิติ',
  dimensions: [
    { dimensionId: 1, dimensionName: 'ความปลอดภัยอาหาร', weight: 14, scorePct: 80.5 },
  ],
  redFlags: [
    { type: 'FINANCIAL', severity: 'CRITICAL', triggerQuestions: [28], resolved: false },
  ],
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('RoundReportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the round result, dimensions and red flags', async () => {
    vi.mocked(reportService.getRoundReport).mockResolvedValue(report);
    renderWithClient(<RoundReportPanel storeId="store-1" round="T1" />);

    expect(await screen.findByText('ครัวริมธารจันทบุรี')).toBeInTheDocument();
    expect(screen.getByText('75.80')).toBeInTheDocument();
    expect(screen.getByText('Growth Zone')).toBeInTheDocument();
    expect(screen.getByText('นายสมชาย วงษ์สมบัติ')).toBeInTheDocument();
    expect(screen.getByText('80.50')).toBeInTheDocument();
    expect(screen.getByText('ยังไม่แก้ไข')).toBeInTheDocument();
  });

  it('says there is no red flag when the round has none', async () => {
    vi.mocked(reportService.getRoundReport).mockResolvedValue({ ...report, redFlags: [] });
    renderWithClient(<RoundReportPanel storeId="store-1" round="T1" />);

    expect(await screen.findByText('ไม่พบสัญญาณเตือน')).toBeInTheDocument();
  });

  it('downloads the round report as PDF', async () => {
    const blob = new Blob(['x']);
    vi.mocked(reportService.getRoundReport).mockResolvedValue(report);
    vi.mocked(reportService.exportRoundReport).mockResolvedValue({
      blob,
      filename: 'assessment-report-T1.pdf',
    });
    renderWithClient(<RoundReportPanel storeId="store-1" round="T1" />);

    await userEvent.click(await screen.findByRole('button', { name: 'ดาวน์โหลด PDF' }));

    await waitFor(() =>
      expect(reportService.exportRoundReport).toHaveBeenCalledWith('store-1', 'T1', 'pdf')
    );
    expect(downloadBlob).toHaveBeenCalledWith(blob, 'assessment-report-T1.pdf');
  });

  it('treats a missing round as "not assessed yet" rather than an error', async () => {
    vi.mocked(reportService.getRoundReport).mockRejectedValue(
      new Error('ยังไม่มีผลการประเมินรอบ T3 ของร้านนี้')
    );
    renderWithClient(<RoundReportPanel storeId="store-1" round="T3" />);

    await waitFor(() =>
      expect(screen.getByText('ยังไม่มีผลการประเมินรอบ T3 ของร้านนี้')).toBeInTheDocument()
    );
  });
});
