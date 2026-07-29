import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob } from '@/utils/download-blob';
import { reportService } from '../services/report.service';
import type { RoundMatrixReport } from '../types/report.types';
import { RoundMatrixPanel } from './round-matrix-panel';

vi.mock('../services/report.service');
vi.mock('@/utils/download-blob');

const report: RoundMatrixReport = {
  round: 'T0',
  dimensions: [
    { dimensionId: 1, dimensionName: 'ความปลอดภัยอาหาร', weight: 14 },
    { dimensionId: 2, dimensionName: 'การเงินและต้นทุน', weight: 16 },
  ],
  rows: [
    {
      storeId: 'store-1',
      storeCode: 'RAP69-001',
      storeName: 'ครัวริมธารจันทบุรี',
      province: 'จันทบุรี',
      completionPct: 100,
      rawScore: 150,
      rawScorePct: 75,
      weightedScore: 74.1,
      zone: 'Improve Zone',
      redFlagCount: 2,
      unresolvedRedFlagCount: 1,
      criticalDimensionId: 2,
      criticalDimensionName: 'การเงินและต้นทุน',
      scoresByDimension: { 1: 85.7, 2: 60.7 },
    },
  ],
  averageByDimension: { 1: 85.7, 2: 60.7 },
  averageWeightedScore: 74.1,
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('RoundMatrixPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders one row per store with its dimension scores', async () => {
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue(report);
    renderWithClient(<RoundMatrixPanel round="T0" />);

    expect(await screen.findByText('RAP69-001')).toBeInTheDocument();
    expect(screen.getByText('ครัวริมธารจันทบุรี')).toBeInTheDocument();
    expect(screen.getAllByText('85.70').length).toBeGreaterThan(0);
    expect(screen.getAllByText('60.70').length).toBeGreaterThan(0);
    expect(screen.getAllByText('การเงินและต้นทุน').length).toBeGreaterThan(0);
  });

  it('says so when no store submitted the round', async () => {
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue({
      ...report,
      rows: [],
      averageByDimension: {},
      averageWeightedScore: null,
    });
    renderWithClient(<RoundMatrixPanel round="T3" />);

    expect(await screen.findByText('ยังไม่มีร้านที่ส่งผลการประเมินรอบนี้')).toBeInTheDocument();
  });

  it('downloads the all-stores matrix as Excel', async () => {
    const blob = new Blob(['x']);
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue(report);
    vi.mocked(reportService.exportRoundMatrix).mockResolvedValue({
      blob,
      filename: 'assessment-report-stores-T0.xlsx',
    });
    renderWithClient(<RoundMatrixPanel round="T0" />);

    await userEvent.click(await screen.findByRole('button', { name: 'ดาวน์โหลด Excel' }));

    await waitFor(() => expect(reportService.exportRoundMatrix).toHaveBeenCalledWith('T0', 'xlsx'));
    expect(downloadBlob).toHaveBeenCalledWith(blob, 'assessment-report-stores-T0.xlsx');
  });
});
