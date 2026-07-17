import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/services/api';
import { assessmentService, dimensionService } from './assessment.service';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

beforeEach(() => vi.clearAllMocks());

describe('dimensionService', () => {
  it('calls GET /dimensions', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    await dimensionService.getAll();
    expect(api.get).toHaveBeenCalledWith('/dimensions');
  });
});

describe('assessmentService', () => {
  it('finds an assessment by store and round, returning the first item', async () => {
    const summary = { id: 'a1' };
    vi.mocked(api.get).mockResolvedValue({ data: { items: [summary] } });

    const result = await assessmentService.findByStoreAndRound('store-1', 'T0');

    expect(api.get).toHaveBeenCalledWith('/assessments', {
      params: { storeId: 'store-1', round: 'T0', limit: 1 },
    });
    expect(result).toEqual(summary);
  });

  it('returns null when no assessment exists for the store and round', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [] } });

    const result = await assessmentService.findByStoreAndRound('store-1', 'T0');

    expect(result).toBeNull();
  });

  it('finds all assessments for a store', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { items: [{ id: 'a1' }] } });

    const result = await assessmentService.findAllByStore('store-1');

    expect(api.get).toHaveBeenCalledWith('/assessments', {
      params: { storeId: 'store-1', limit: 5 },
    });
    expect(result).toEqual([{ id: 'a1' }]);
  });

  it('gets an assessment by id', async () => {
    const assessment = { id: 'a1' };
    vi.mocked(api.get).mockResolvedValue({ data: assessment });

    const result = await assessmentService.getById('a1');

    expect(api.get).toHaveBeenCalledWith('/assessments/a1');
    expect(result).toEqual(assessment);
  });

  it('creates an assessment', async () => {
    const dto = { storeId: 'store-1', round: 'T0' as const };
    const created = { id: 'a1', ...dto };
    vi.mocked(api.post).mockResolvedValue({ data: created });

    const result = await assessmentService.create(dto);

    expect(api.post).toHaveBeenCalledWith('/assessments', dto);
    expect(result).toEqual(created);
  });

  it('updates a question score', async () => {
    const updated = { questionId: 1, rawScore: 3 };
    vi.mocked(api.put).mockResolvedValue({ data: updated });

    const result = await assessmentService.updateScore('a1', 1, { rawScore: 3 });

    expect(api.put).toHaveBeenCalledWith('/assessments/a1/scores/1', { rawScore: 3 });
    expect(result).toEqual(updated);
  });

  it('submits an assessment', async () => {
    const submitted = { id: 'a1', status: 'SUBMITTED' };
    vi.mocked(api.post).mockResolvedValue({ data: submitted });

    const result = await assessmentService.submit('a1');

    expect(api.post).toHaveBeenCalledWith('/assessments/a1/submit');
    expect(result).toEqual(submitted);
  });

  it('uploads evidence as multipart form data', async () => {
    const evidence = { id: 'e1', filename: 'photo.jpg' };
    vi.mocked(api.post).mockResolvedValue({ data: evidence });
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

    const result = await assessmentService.uploadEvidence('a1', 1, file);

    expect(api.post).toHaveBeenCalledWith(
      '/assessments/a1/scores/1/evidence',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    expect(result).toEqual(evidence);
  });

  it('deletes evidence', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: undefined });

    await assessmentService.deleteEvidence('a1', 'e1');

    expect(api.delete).toHaveBeenCalledWith('/assessments/a1/evidence/e1');
  });

  it('updates notes', async () => {
    const updated = { id: 'a1', notes: 'hello' };
    vi.mocked(api.patch).mockResolvedValue({ data: updated });

    const result = await assessmentService.updateNotes('a1', 'hello');

    expect(api.patch).toHaveBeenCalledWith('/assessments/a1/notes', { notes: 'hello' });
    expect(result).toEqual(updated);
  });

  it('gets rank data for a store and round', async () => {
    const rank = { overallRank: 1 };
    vi.mocked(api.get).mockResolvedValue({ data: rank });

    const result = await assessmentService.getRank('store-1', 'T0');

    expect(api.get).toHaveBeenCalledWith('/assessments/rank', {
      params: { storeId: 'store-1', round: 'T0' },
    });
    expect(result).toEqual(rank);
  });
});
