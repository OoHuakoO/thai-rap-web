import { describe, expect, it, vi } from 'vitest';
import api from '@/services/api';
import { pitchingService } from './pitching.service';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}));

describe('pitchingService', () => {
  it('narrows the list to the caller’s own form when looking it up', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [], meta: {} } });

    await pitchingService.findMine('store-1', 'PITCH_DECK', 'judge-1');

    expect(api.get).toHaveBeenCalledWith('/pitching', {
      params: { storeId: 'store-1', round: 'PITCH_DECK', judgeId: 'judge-1', limit: 1 },
    });
  });

  it('resolves to null when the judge has no form yet', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [], meta: {} } });

    await expect(pitchingService.findMine('store-1', 'PITCH_DECK', 'judge-1')).resolves.toBeNull();
  });

  it('sends the round and province with the ranking request', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [], meta: {} } });

    await pitchingService.getRanking('ACCELERATION', 'ตราด', 2, 25);

    expect(api.get).toHaveBeenCalledWith('/pitching/summary', {
      params: { round: 'ACCELERATION', province: 'ตราด', page: 2, limit: 25 },
    });
  });

  // The API answers the whole round whatever page the table is on, so sending
  // one would only suggest otherwise.
  it('sends no page or limit with the ranking export', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: new Blob(), headers: {} });

    await pitchingService.exportRanking('PITCH_DECK', undefined, 'pdf');

    expect(api.get).toHaveBeenCalledWith('/pitching/summary/export', {
      params: { round: 'PITCH_DECK', province: undefined, format: 'pdf' },
      responseType: 'blob',
    });
  });

  it('downloads a store report as a blob', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: new Blob(), headers: {} });

    await pitchingService.exportStoreReport('store-1', 'ACCELERATION', 'xlsx');

    expect(api.get).toHaveBeenCalledWith('/pitching/stores/store-1/export', {
      params: { round: 'ACCELERATION', format: 'xlsx' },
      responseType: 'blob',
    });
  });

  it('submits the whole form in one POST', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    const payload = {
      recommendation: 'SELECTED' as const,
      scores: [{ criterionId: 101, score: 4 }],
    };

    await pitchingService.submit('pitch-1', payload);

    expect(api.post).toHaveBeenCalledWith('/pitching/pitch-1/submit', payload);
  });
});
