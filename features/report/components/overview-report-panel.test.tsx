import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob } from '@/utils/download-blob';
import { reportService } from '../services/report.service';
import type { OverviewReport } from '../types/report.types';
import { OverviewReportPanel } from './overview-report-panel';

vi.mock('../services/report.service');
vi.mock('@/utils/download-blob');

const report: OverviewReport = {
  store: {
    id: 'store-1',
    name: 'ครัวริมธารจันทบุรี',
    province: 'จันทบุรี',
    storeType: 'อาหารไทย',
    ownerName: 'นางสาวศิริวรรณ',
  },
  rounds: [
    {
      round: 'T0',
      totalScore: 62.1,
      zone: 'Improve Zone',
      delta: null,
      submittedAt: '2026-05-20T00:00:00.000Z',
    },
    {
      round: 'T1',
      totalScore: 75.8,
      zone: 'Growth Zone',
      delta: 13.7,
      submittedAt: '2026-05-20T00:00:00.000Z',
    },
  ],
  dimensionTrends: [
    {
      dimensionId: 1,
      dimensionName: 'ความปลอดภัยอาหาร',
      weight: 14,
      scoresByRound: { T0: 60, T1: 72 },
    },
  ],
  unresolvedRedFlagCount: 2,
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('OverviewReportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists every assessed round with its delta', async () => {
    vi.mocked(reportService.getOverviewReport).mockResolvedValue(report);
    renderWithClient(<OverviewReportPanel storeId="store-1" />);

    expect(await screen.findByText('ครัวริมธารจันทบุรี')).toBeInTheDocument();
    expect(screen.getByText('62.10')).toBeInTheDocument();
    expect(screen.getByText('+13.70')).toBeInTheDocument();
    expect(screen.getByText('Growth Zone')).toBeInTheDocument();
    expect(screen.getByText('สัญญาณเตือนที่ยังไม่แก้ไข 2 รายการ')).toBeInTheDocument();
  });

  it('shows a dash for a round the dimension was never scored in', async () => {
    vi.mocked(reportService.getOverviewReport).mockResolvedValue(report);
    renderWithClient(<OverviewReportPanel storeId="store-1" />);

    await screen.findByText('ความปลอดภัยอาหาร');
    // T2 and T3 have no score in the trend row
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
  });

  it('downloads the Excel export under the server filename', async () => {
    const blob = new Blob(['x']);
    vi.mocked(reportService.getOverviewReport).mockResolvedValue(report);
    vi.mocked(reportService.exportOverviewReport).mockResolvedValue({
      blob,
      filename: 'assessment-report-overview.xlsx',
    });
    renderWithClient(<OverviewReportPanel storeId="store-1" />);

    await userEvent.click(await screen.findByRole('button', { name: 'ดาวน์โหลด Excel' }));

    await waitFor(() =>
      expect(reportService.exportOverviewReport).toHaveBeenCalledWith('store-1', 'xlsx')
    );
    expect(downloadBlob).toHaveBeenCalledWith(blob, 'assessment-report-overview.xlsx');
  });

  it('requests a pdf when the PDF button is used', async () => {
    vi.mocked(reportService.getOverviewReport).mockResolvedValue(report);
    vi.mocked(reportService.exportOverviewReport).mockResolvedValue({ blob: new Blob(['x']) });
    renderWithClient(<OverviewReportPanel storeId="store-1" />);

    await userEvent.click(await screen.findByRole('button', { name: 'ดาวน์โหลด PDF' }));

    await waitFor(() =>
      expect(reportService.exportOverviewReport).toHaveBeenCalledWith('store-1', 'pdf')
    );
  });

  it('disables the download buttons when no round is assessed', async () => {
    vi.mocked(reportService.getOverviewReport).mockResolvedValue({ ...report, rounds: [] });
    renderWithClient(<OverviewReportPanel storeId="store-1" />);

    expect(await screen.findByRole('button', { name: 'ดาวน์โหลด Excel' })).toBeDisabled();
    expect(screen.getByText('ยังไม่มีผลการประเมินที่ส่งแล้ว')).toBeInTheDocument();
  });

  it('shows the error message when the API fails', async () => {
    vi.mocked(reportService.getOverviewReport).mockRejectedValue(new Error('โหลดข้อมูลไม่สำเร็จ'));
    renderWithClient(<OverviewReportPanel storeId="store-1" />);

    await waitFor(() => expect(screen.getByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument());
  });
});
