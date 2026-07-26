import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardService } from '../services/dashboard.service';
import type { StoreRoundScores } from '../types/dashboard.types';
import { downloadBlob } from '@/utils/download-blob';
import { StoreScoresDialog } from './store-scores-dialog';

vi.mock('../services/dashboard.service');
vi.mock('@/utils/download-blob');

const row: StoreRoundScores = {
  storeId: 'store-01',
  storeName: 'ครัวริมธารจันทบุรี',
  province: 'จันทบุรี',
  storeType: 'อาหารไทย',
  scores: { T0: 62.1, T1: 75.8, T2: null, T3: null },
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('StoreScoresDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a row per store with a dash for rounds without a score', async () => {
    vi.mocked(dashboardService.getStoreRoundScores).mockResolvedValue([row]);
    renderWithClient(<StoreScoresDialog open onOpenChange={vi.fn()} />);

    expect(await screen.findByText('ครัวริมธารจันทบุรี')).toBeInTheDocument();
    expect(screen.getByText('62.10')).toBeInTheDocument();
    expect(screen.getByText('75.80')).toBeInTheDocument();
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('does not fetch while the dialog is closed', () => {
    vi.mocked(dashboardService.getStoreRoundScores).mockResolvedValue([row]);
    renderWithClient(<StoreScoresDialog open={false} onOpenChange={vi.fn()} />);

    expect(dashboardService.getStoreRoundScores).not.toHaveBeenCalled();
  });

  it('saves the file under the name the server sent', async () => {
    const blob = new Blob(['x']);
    vi.mocked(dashboardService.getStoreRoundScores).mockResolvedValue([row]);
    vi.mocked(dashboardService.exportStoreRoundScores).mockResolvedValue({
      blob,
      filename: 'store-round-scores.csv',
    });
    renderWithClient(<StoreScoresDialog open onOpenChange={vi.fn()} />);

    await userEvent.click(await screen.findByRole('button', { name: 'ดาวน์โหลด Excel' }));

    await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(blob, 'store-round-scores.csv'));
  });

  it('falls back to the xlsx name when the server sends no filename', async () => {
    const blob = new Blob(['x']);
    vi.mocked(dashboardService.getStoreRoundScores).mockResolvedValue([row]);
    vi.mocked(dashboardService.exportStoreRoundScores).mockResolvedValue({ blob });
    renderWithClient(<StoreScoresDialog open onOpenChange={vi.fn()} />);

    await userEvent.click(await screen.findByRole('button', { name: 'ดาวน์โหลด Excel' }));

    await waitFor(() =>
      expect(downloadBlob).toHaveBeenCalledWith(blob, 'store-round-scores.xlsx')
    );
  });

  it('shows the empty state when no store has been assessed', async () => {
    vi.mocked(dashboardService.getStoreRoundScores).mockResolvedValue([]);
    renderWithClient(<StoreScoresDialog open onOpenChange={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByText('ยังไม่มีข้อมูลคะแนนรายร้าน')).toBeInTheDocument()
    );
  });

  it('shows the error message when the API fails', async () => {
    vi.mocked(dashboardService.getStoreRoundScores).mockRejectedValue(
      new Error('โหลดข้อมูลไม่สำเร็จ')
    );
    renderWithClient(<StoreScoresDialog open onOpenChange={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument());
  });
});
