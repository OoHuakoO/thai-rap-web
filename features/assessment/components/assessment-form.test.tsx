import { useState, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssessmentForm } from './assessment-form';
import { useStore } from '@/features/store';
import { useConfirm, useAlert } from '@/components/shared/confirm-dialog';
import { useAuthStore } from '@/stores/auth-store';
import {
  useAssessment,
  useAssessmentSummaries,
  useDimensions,
  useUpdateScore,
  useSubmitAssessment,
  useUploadEvidence,
  useDeleteEvidence,
} from '../hooks/use-assessment';
import type { Assessment, AssessmentQuestion, Dimension } from '../types/assessment.types';

vi.mock('@/features/store', () => ({
  useStore: vi.fn(),
}));

vi.mock('@/components/shared/confirm-dialog', () => ({
  useConfirm: vi.fn(),
  useAlert: vi.fn(),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../hooks/use-assessment', () => ({
  assessmentKeys: {
    byStoreRound: (storeId: string, round: string) => ['assessments', storeId, round],
  },
  useAssessment: vi.fn(),
  useAssessmentSummaries: vi.fn(),
  useDimensions: vi.fn(),
  useUpdateScore: vi.fn(),
  useSubmitAssessment: vi.fn(),
  useUploadEvidence: vi.fn(),
  useDeleteEvidence: vi.fn(),
}));

vi.mock('./assessment-form-header', () => ({
  AssessmentFormHeader: ({
    children,
    onProvinceChange,
    onStoreSelect,
  }: {
    children?: ReactNode;
    onProvinceChange: () => void;
    onStoreSelect?: () => void;
  }) => (
    <div>
      <button onClick={onProvinceChange}>change-province</button>
      {onStoreSelect && <button onClick={onStoreSelect}>select-store</button>}
      {children}
    </div>
  ),
}));

vi.mock('./dimension-list', () => ({
  DimensionList: () => <div>dimension-list</div>,
}));

vi.mock('./assess-table', () => ({
  AssessTable: ({
    onScoreChange,
  }: {
    onScoreChange: (questionId: number, score: number) => void;
  }) => <button onClick={() => onScoreChange(1, 3)}>score-q1</button>,
}));

vi.mock('./score-summary', () => ({
  ScoreSummary: () => <div>score-summary</div>,
}));

vi.mock('./timeline-area', () => ({
  TimelineArea: () => <div>timeline-area</div>,
}));

function makeQuestion(overrides: Partial<AssessmentQuestion> = {}): AssessmentQuestion {
  return {
    questionId: 1,
    questionNo: 1,
    dimensionId: 1,
    questionText: 'คำถามทดสอบ',
    maxScore: 4,
    rawScore: null,
    note: null,
    suggestion: null,
    evidence: [],
    ...overrides,
  };
}

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
    questions: [makeQuestion()],
    redFlags: [],
    ...overrides,
  };
}

const dimensions: Dimension[] = [
  { id: 1, name: 'ครัว', nameEn: 'Kitchen', weight: 10, questionCount: 1 },
];

function Wrapper({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useStore).mockReturnValue({
    data: { id: 'store-1', name: 'ร้านทดสอบ', coverUrl: null },
  } as unknown as ReturnType<typeof useStore>);
  vi.mocked(useAssessmentSummaries).mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useAssessmentSummaries>);
  vi.mocked(useDimensions).mockReturnValue({
    data: dimensions,
  } as unknown as ReturnType<typeof useDimensions>);
  vi.mocked(useAssessment).mockReturnValue({
    data: makeAssessment(),
    isLoading: false,
    isError: false,
    error: null,
    retry: vi.fn(),
  } as unknown as ReturnType<typeof useAssessment>);
  vi.mocked(useUpdateScore).mockReturnValue({
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof useUpdateScore>);
  vi.mocked(useSubmitAssessment).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useSubmitAssessment>);
  vi.mocked(useUploadEvidence).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUploadEvidence>);
  vi.mocked(useDeleteEvidence).mockReturnValue({
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof useDeleteEvidence>);
  vi.mocked(useConfirm).mockReturnValue(vi.fn().mockResolvedValue(true));
  vi.mocked(useAlert).mockReturnValue(vi.fn());
  vi.mocked(useAuthStore).mockImplementation(((selector: (s: { can: () => boolean }) => unknown) =>
    selector({ can: () => true })) as unknown as typeof useAuthStore);
});

describe('AssessmentForm', () => {
  it('shows a loading spinner while the assessment is loading', () => {
    vi.mocked(useAssessment).mockReturnValue({
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useAssessment>);

    render(<AssessmentForm storeId="store-1" round="T0" />, { wrapper: Wrapper });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error message with a retry button when the assessment fails to load', async () => {
    const retry = vi.fn();
    vi.mocked(useAssessment).mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('เกิดข้อผิดพลาด'),
      retry,
    } as unknown as ReturnType<typeof useAssessment>);

    render(<AssessmentForm storeId="store-1" round="T0" />, { wrapper: Wrapper });

    expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'ลองใหม่' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('shows the locked-round notice when a required prior round is not completed', () => {
    vi.mocked(useAssessmentSummaries).mockReturnValue({
      data: [{ round: 'T0', status: 'DRAFT' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useAssessmentSummaries>);

    render(<AssessmentForm storeId="store-1" round="T1" />, { wrapper: Wrapper });

    expect(screen.getByText('ต้องทำรอบ T0 ก่อน')).toBeInTheDocument();
  });

  it('renders the assessment table once the assessment loads', () => {
    render(<AssessmentForm storeId="store-1" round="T0" />, { wrapper: Wrapper });

    expect(screen.getByText('score-q1')).toBeInTheDocument();
    expect(screen.getByText('dimension-list')).toBeInTheDocument();
  });

  it('saves a score through updateScore when a score changes', async () => {
    const mutate = vi.fn();
    vi.mocked(useUpdateScore).mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof useUpdateScore>);

    render(<AssessmentForm storeId="store-1" round="T0" />, { wrapper: Wrapper });
    await userEvent.click(screen.getByRole('button', { name: 'score-q1' }));

    expect(mutate).toHaveBeenCalledWith(
      { questionId: 1, rawScore: 3, note: undefined, suggestion: undefined },
      expect.any(Object)
    );
  });

  it('hides the save buttons when the user lacks assessment:write permission', () => {
    vi.mocked(useAuthStore).mockImplementation(((
      selector: (s: { can: () => boolean }) => unknown
    ) => selector({ can: () => false })) as unknown as typeof useAuthStore);

    render(<AssessmentForm storeId="store-1" round="T0" />, { wrapper: Wrapper });

    expect(screen.queryByRole('button', { name: 'บันทึกและถัดไป →' })).not.toBeInTheDocument();
  });

  it('shows the no-store-selected message after the store is cleared via province change', async () => {
    render(<AssessmentForm storeId="store-1" round="T0" />, { wrapper: Wrapper });

    await userEvent.click(screen.getByText('change-province'));

    expect(screen.getByText('กรุณาเลือกร้านที่ต้องการประเมิน')).toBeInTheDocument();
  });

  // Regression: isStoreCleared used to stick after a province change even
  // once storeId changed from outside the picker (e.g. browser back), so the
  // form kept showing "no store selected" instead of loading the new store.
  it('resets the cleared-store state when storeId changes from outside the picker', async () => {
    const { rerender } = render(<AssessmentForm storeId="store-1" round="T0" />, {
      wrapper: Wrapper,
    });

    await userEvent.click(screen.getByText('change-province'));
    expect(screen.getByText('กรุณาเลือกร้านที่ต้องการประเมิน')).toBeInTheDocument();

    rerender(<AssessmentForm storeId="store-2" round="T0" />);

    expect(screen.queryByText('กรุณาเลือกร้านที่ต้องการประเมิน')).not.toBeInTheDocument();
    expect(screen.getByText('score-q1')).toBeInTheDocument();
  });
});
