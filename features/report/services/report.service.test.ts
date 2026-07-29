import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/services/api';
import { reportService } from './report.service';

vi.mock('@/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: {}, headers: {} });
  });

  it('calls GET for a single round report', async () => {
    await reportService.getRoundReport('store-1', 'T1');
    expect(api.get).toHaveBeenCalledWith('/reports/stores/store-1/rounds/T1');
  });

  it('calls GET for the overview report', async () => {
    await reportService.getOverviewReport('store-1');
    expect(api.get).toHaveBeenCalledWith('/reports/stores/store-1/overview');
  });

  it('requests the round export as a blob in the chosen format', async () => {
    const blob = new Blob(['x']);
    vi.mocked(api.get).mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="assessment-report-T1.pdf"' },
    });

    const result = await reportService.exportRoundReport('store-1', 'T1', 'pdf');

    expect(api.get).toHaveBeenCalledWith('/reports/stores/store-1/rounds/T1/export', {
      params: { format: 'pdf' },
      responseType: 'blob',
    });
    expect(result).toEqual({ blob, filename: 'assessment-report-T1.pdf' });
  });

  it('asks the all-stores matrix for one page', async () => {
    await reportService.getRoundMatrix('T0', { page: 2, limit: 25 });

    expect(api.get).toHaveBeenCalledWith('/reports/rounds/T0/stores', {
      params: { page: 2, limit: 25 },
    });
  });

  // The table pages, the file does not — the export carries no page or limit.
  it('requests the matrix export without a page', async () => {
    await reportService.exportRoundMatrix('T0', 'xlsx');

    expect(api.get).toHaveBeenCalledWith('/reports/rounds/T0/stores/export', {
      params: { format: 'xlsx' },
      responseType: 'blob',
    });
  });

  it('requests the overview export as a blob in the chosen format', async () => {
    await reportService.exportOverviewReport('store-1', 'xlsx');

    expect(api.get).toHaveBeenCalledWith('/reports/stores/store-1/overview/export', {
      params: { format: 'xlsx' },
      responseType: 'blob',
    });
  });

  it('leaves the filename undefined when the header is missing', async () => {
    const result = await reportService.exportOverviewReport('store-1', 'xlsx');
    expect(result.filename).toBeUndefined();
  });
});
