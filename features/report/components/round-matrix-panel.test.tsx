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
      overallLevel: 'ดี',
      redFlagCount: 2,
      unresolvedRedFlagCount: 1,
      criticalDimensionId: 2,
      criticalDimensionName: 'การเงินและต้นทุน',
      scoresByDimension: { 1: 85.7, 2: 60.7 },
    },
  ],
  averageByDimension: { 1: 85.7, 2: 60.7 },
  averageWeightedScore: 74.1,
  meta: { page: 1, limit: 25, total: 1, totalPages: 1 },
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
    expect(screen.getByText('มิติ 2')).toBeInTheDocument();
  });

  it('names the dimension to fix first by number, with the full name in a tooltip', async () => {
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue(report);
    renderWithClient(<RoundMatrixPanel round="T0" />);

    await userEvent.hover(await screen.findByText('มิติ 2'));

    await waitFor(() => expect(screen.getAllByText('การเงินและต้นทุน').length).toBeGreaterThan(0));
  });

  it('shows the overall level of each store and no zone column', async () => {
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue(report);
    renderWithClient(<RoundMatrixPanel round="T0" />);

    expect(await screen.findByText('ระดับรวม')).toBeInTheDocument();
    expect(screen.getByText('ดี')).toBeInTheDocument();
    expect(screen.queryByText('Zone')).not.toBeInTheDocument();
  });

  it('numbers the dimension columns and keeps the full name in a tooltip', async () => {
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue(report);
    renderWithClient(<RoundMatrixPanel round="T0" />);

    expect(await screen.findByText('มิติ 1 (14%)')).toBeInTheDocument();
    expect(screen.getByText('มิติ 2 (16%)')).toBeInTheDocument();
    expect(screen.queryByText('ความปลอดภัยอาหาร')).not.toBeInTheDocument();

    await userEvent.hover(screen.getByText('มิติ 1 (14%)'));
    await waitFor(() => expect(screen.getAllByText('ความปลอดภัยอาหาร').length).toBeGreaterThan(0));
  });

  it('says so when no store submitted the round', async () => {
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue({
      ...report,
      rows: [],
      averageByDimension: {},
      averageWeightedScore: null,
      meta: { page: 1, limit: 25, total: 0, totalPages: 0 },
    });
    renderWithClient(<RoundMatrixPanel round="T3" />);

    expect(await screen.findByText('ยังไม่มีร้านที่ส่งผลการประเมินรอบนี้')).toBeInTheDocument();
    expect(screen.queryByLabelText('หน้าถัดไป')).not.toBeInTheDocument();
  });

  it('asks for one page of stores and counts the whole round', async () => {
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue({
      ...report,
      meta: { page: 1, limit: 25, total: 120, totalPages: 5 },
    });
    renderWithClient(<RoundMatrixPanel round="T0" />);

    expect(await screen.findByText('ร้านที่ส่งผลการประเมินรอบนี้ 120 ร้าน')).toBeInTheDocument();
    expect(reportService.getRoundMatrix).toHaveBeenCalledWith('T0', { page: 1, limit: 25 });
  });

  it('fetches the next page when the reader pages forward', async () => {
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue({
      ...report,
      meta: { page: 1, limit: 25, total: 120, totalPages: 5 },
    });
    renderWithClient(<RoundMatrixPanel round="T0" />);

    await userEvent.click(await screen.findByLabelText('หน้าถัดไป'));

    await waitFor(() =>
      expect(reportService.getRoundMatrix).toHaveBeenCalledWith('T0', { page: 2, limit: 25 })
    );
  });

  // The table pages; the file must not. Downloading page 3 of 5 would hand back
  // a document nobody can work from.
  it('downloads every store of the round, not the page on screen', async () => {
    const blob = new Blob(['x']);
    vi.mocked(reportService.getRoundMatrix).mockResolvedValue({
      ...report,
      meta: { page: 2, limit: 25, total: 120, totalPages: 5 },
    });
    vi.mocked(reportService.exportRoundMatrix).mockResolvedValue({
      blob,
      filename: 'assessment-report-stores-T0.xlsx',
    });
    renderWithClient(<RoundMatrixPanel round="T0" />);

    expect(
      await screen.findByText('ไฟล์ที่ดาวน์โหลดมีครบทุกร้านในรอบนี้ (120 ร้าน)')
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'ดาวน์โหลด Excel' }));

    await waitFor(() => expect(reportService.exportRoundMatrix).toHaveBeenCalledWith('T0', 'xlsx'));
    expect(downloadBlob).toHaveBeenCalledWith(blob, 'assessment-report-stores-T0.xlsx');
  });
});
