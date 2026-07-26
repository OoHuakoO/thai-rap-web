import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/services/api';
import { dashboardService } from './dashboard.service';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: [] });
  });

  it('calls GET /dashboard/kpis', async () => {
    await dashboardService.getKpis();
    expect(api.get).toHaveBeenCalledWith('/dashboard/kpis');
  });

  it('calls GET /dashboard/province-distribution', async () => {
    await dashboardService.getProvinceDistribution();
    expect(api.get).toHaveBeenCalledWith('/dashboard/province-distribution');
  });

  it('calls GET /dashboard/top20 with the round param', async () => {
    await dashboardService.getTop20('T2');
    expect(api.get).toHaveBeenCalledWith('/dashboard/top20', { params: { round: 'T2' } });
  });

  it('sends round=all when no round is selected', async () => {
    await dashboardService.getTop20('all');
    expect(api.get).toHaveBeenCalledWith('/dashboard/top20', { params: { round: 'all' } });
  });

  it('calls GET /dashboard/incubation-progress', async () => {
    await dashboardService.getIncubationProgress();
    expect(api.get).toHaveBeenCalledWith('/dashboard/incubation-progress');
  });

  it('calls GET /dashboard/province-comparison with the requested round pair', async () => {
    await dashboardService.getProvinceComparison({ from: 'T2', to: 'T3' });
    expect(api.get).toHaveBeenCalledWith('/dashboard/province-comparison', {
      params: { from: 'T2', to: 'T3' },
    });
  });

  it('calls GET /dashboard/store-scores', async () => {
    await dashboardService.getStoreRoundScores();
    expect(api.get).toHaveBeenCalledWith('/dashboard/store-scores');
  });

  it('requests the export as a blob and reads the filename from the header', async () => {
    const blob = new Blob(['x']);
    vi.mocked(api.get).mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="store-round-scores.xlsx"' },
    });

    const result = await dashboardService.exportStoreRoundScores();

    expect(api.get).toHaveBeenCalledWith('/dashboard/store-scores/export', {
      responseType: 'blob',
    });
    expect(result).toEqual({ blob, filename: 'store-round-scores.xlsx' });
  });

  it('leaves the export filename undefined when the header is missing', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: new Blob(['x']), headers: {} });

    const result = await dashboardService.exportStoreRoundScores();

    expect(result.filename).toBeUndefined();
  });

  it('calls GET /dashboard/activities', async () => {
    await dashboardService.getActivities();
    expect(api.get).toHaveBeenCalledWith('/dashboard/activities');
  });

  it('calls GET /dashboard/reports-status', async () => {
    await dashboardService.getReportsStatus();
    expect(api.get).toHaveBeenCalledWith('/dashboard/reports-status');
  });

  it('returns the unwrapped response payload', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [{ rank: 1 }] });
    await expect(dashboardService.getTop20('all')).resolves.toEqual([{ rank: 1 }]);
  });
});
