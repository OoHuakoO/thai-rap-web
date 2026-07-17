import { useState, type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useDimensions,
  useAssessmentSummaries,
  useAssessment,
  useUpdateScore,
  useUploadEvidence,
  useDeleteEvidence,
  useSubmitAssessment,
  useUpdateNotes,
  useAssessmentRank,
} from './use-assessment';
import { assessmentService, dimensionService } from '../services/assessment.service';
import type { Assessment, AssessmentSummary, Round } from '../types/assessment.types';

vi.mock('../services/assessment.service', () => ({
  assessmentService: {
    findByStoreAndRound: vi.fn(),
    findAllByStore: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    updateScore: vi.fn(),
    uploadEvidence: vi.fn(),
    deleteEvidence: vi.fn(),
    submit: vi.fn(),
    updateNotes: vi.fn(),
    getRank: vi.fn(),
  },
  dimensionService: {
    getAll: vi.fn(),
  },
}));

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: 'a1',
    storeId: 'store-1',
    round: 'T0',
    assessorId: 'assessor-1',
    status: 'DRAFT',
    totalScore: null,
    zone: null,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    submittedAt: null,
    questions: [],
    redFlags: [],
    ...overrides,
  };
}

function makeSummary(overrides: Partial<AssessmentSummary> = {}): AssessmentSummary {
  return {
    id: 'a1',
    storeId: 'store-1',
    round: 'T0',
    assessorId: 'assessor-1',
    status: 'DRAFT',
    totalScore: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    submittedAt: null,
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  // useState (not a plain `new QueryClient()`) so the client survives
  // `rerender()` — recreating it on every wrapper re-render would drop the
  // cache between renders and hide bugs that only show up across a prop
  // change, like the round-switch regression this file tests for.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => vi.clearAllMocks());

describe('useDimensions', () => {
  it('returns dimensions when the API succeeds', async () => {
    vi.mocked(dimensionService.getAll).mockResolvedValue([
      { id: 1, name: 'ครัว', nameEn: 'Kitchen', weight: 10, questionCount: 5 },
    ]);

    const { result } = renderHook(() => useDimensions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useAssessmentSummaries', () => {
  it('returns summaries for a store', async () => {
    vi.mocked(assessmentService.findAllByStore).mockResolvedValue([makeSummary()]);

    const { result } = renderHook(() => useAssessmentSummaries('store-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(assessmentService.findAllByStore).toHaveBeenCalledWith('store-1');
  });

  it('does not fetch when storeId is empty', () => {
    const { result } = renderHook(() => useAssessmentSummaries(''), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(assessmentService.findAllByStore).not.toHaveBeenCalled();
  });
});

describe('useAssessment', () => {
  it('returns the existing assessment without creating one', async () => {
    const existing = makeAssessment({ id: 'a1' });
    vi.mocked(assessmentService.findByStoreAndRound).mockResolvedValue(makeSummary({ id: 'a1' }));
    vi.mocked(assessmentService.getById).mockResolvedValue(existing);

    const { result } = renderHook(() => useAssessment('store-1', 'T0'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(existing));
    expect(assessmentService.create).not.toHaveBeenCalled();
  });

  it('creates an assessment when none exists yet, and only once', async () => {
    const created = makeAssessment({ id: 'a2' });
    vi.mocked(assessmentService.findByStoreAndRound).mockResolvedValue(null);
    vi.mocked(assessmentService.create).mockResolvedValue(created);

    const { result } = renderHook(() => useAssessment('store-1', 'T0'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(created));
    expect(assessmentService.create).toHaveBeenCalledTimes(1);
    expect(assessmentService.create).toHaveBeenCalledWith({ storeId: 'store-1', round: 'T0' });
  });

  it('surfaces a create failure as an error without retrying the write', async () => {
    vi.mocked(assessmentService.findByStoreAndRound).mockResolvedValue(null);
    vi.mocked(assessmentService.create).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useAssessment('store-1', 'T0'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(assessmentService.create).toHaveBeenCalledTimes(1);
  });

  // Regression: switching rounds (e.g. via RoundPills) re-renders the same
  // component instance with a new round instead of unmounting it, so the
  // create mutation is a single long-lived instance shared across rounds.
  // Only tracking "have we tried this round" via a ref (not mutation
  // isIdle/isSuccess) keeps a create for round 2 from being skipped just
  // because round 1's create already succeeded on the same instance.
  it('creates a new assessment again after switching to a different round without unmounting', async () => {
    const createdT0 = makeAssessment({ id: 'a-t0', round: 'T0' });
    const createdT1 = makeAssessment({ id: 'a-t1', round: 'T1' });
    vi.mocked(assessmentService.findByStoreAndRound).mockResolvedValue(null);
    vi.mocked(assessmentService.create).mockImplementation((dto) =>
      Promise.resolve(dto.round === 'T0' ? createdT0 : createdT1)
    );

    const { result, rerender } = renderHook(
      ({ round }: { round: Round }) => useAssessment('store-1', round),
      { wrapper, initialProps: { round: 'T0' as Round } }
    );

    await waitFor(() => expect(result.current.data).toEqual(createdT0));

    rerender({ round: 'T1' });

    await waitFor(() => expect(result.current.data).toEqual(createdT1));
    expect(assessmentService.create).toHaveBeenCalledTimes(2);
    expect(assessmentService.create).toHaveBeenNthCalledWith(1, {
      storeId: 'store-1',
      round: 'T0',
    });
    expect(assessmentService.create).toHaveBeenNthCalledWith(2, {
      storeId: 'store-1',
      round: 'T1',
    });
  });
});

describe('useUpdateScore', () => {
  it('updates a question score', async () => {
    vi.mocked(assessmentService.updateScore).mockResolvedValue({
      questionId: 1,
      questionNo: 1,
      dimensionId: 1,
      questionText: 'q',
      maxScore: 4,
      rawScore: 3,
      note: null,
      suggestion: null,
      evidence: [],
    });

    const { result } = renderHook(() => useUpdateScore('store-1', 'T0', 'a1'), { wrapper });
    result.current.mutate({ questionId: 1, rawScore: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(assessmentService.updateScore).toHaveBeenCalledWith('a1', 1, { rawScore: 3 });
  });
});

describe('useUploadEvidence', () => {
  it('uploads a file for a question', async () => {
    vi.mocked(assessmentService.uploadEvidence).mockResolvedValue({
      id: 'e1',
      filename: 'photo.jpg',
      fileType: 'image/jpeg',
      fileSize: 100,
      url: '/files/photo.jpg',
      uploadedAt: '2026-01-01T00:00:00.000Z',
    });
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

    const { result } = renderHook(() => useUploadEvidence('store-1', 'T0', 'a1'), { wrapper });
    result.current.mutate({ questionId: 1, file });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(assessmentService.uploadEvidence).toHaveBeenCalledWith('a1', 1, file);
  });
});

describe('useDeleteEvidence', () => {
  it('deletes an evidence file', async () => {
    const { result } = renderHook(() => useDeleteEvidence('store-1', 'T0', 'a1'), { wrapper });
    result.current.mutate('e1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(assessmentService.deleteEvidence).toHaveBeenCalledWith('a1', 'e1');
  });
});

describe('useSubmitAssessment', () => {
  it('submits the assessment', async () => {
    vi.mocked(assessmentService.submit).mockResolvedValue(makeAssessment({ status: 'SUBMITTED' }));

    const { result } = renderHook(() => useSubmitAssessment('store-1', 'T0', 'a1'), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(assessmentService.submit).toHaveBeenCalledWith('a1');
  });
});

describe('useUpdateNotes', () => {
  it('updates notes', async () => {
    vi.mocked(assessmentService.updateNotes).mockResolvedValue(makeAssessment({ notes: 'hello' }));

    const { result } = renderHook(() => useUpdateNotes('store-1', 'T0', 'a1'), { wrapper });
    result.current.mutate('hello');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(assessmentService.updateNotes).toHaveBeenCalledWith('a1', 'hello');
  });
});

describe('useAssessmentRank', () => {
  it('returns rank data', async () => {
    vi.mocked(assessmentService.getRank).mockResolvedValue({
      overallRank: 1,
      overallTotal: 10,
      provinceRank: 1,
      provinceTotal: 5,
      dimensionAverages: [],
    });

    const { result } = renderHook(() => useAssessmentRank('store-1', 'T0'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(assessmentService.getRank).toHaveBeenCalledWith('store-1', 'T0');
  });
});
