import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScoreSummary } from './score-summary';
import {
  useAssessmentByRound,
  useAssessmentRank,
  useAssessmentSummaries,
  useDimensions,
} from '../hooks/use-assessment';
import type { Assessment, AssessmentQuestion, Dimension } from '../types/assessment.types';

vi.mock('@/features/store', () => ({
  STORE_STATUS_LABELS: {},
}));

vi.mock('../hooks/use-assessment', () => ({
  useAssessmentByRound: vi.fn(),
  useAssessmentRank: vi.fn(),
  useAssessmentSummaries: vi.fn(),
  useDimensions: vi.fn(),
}));

vi.mock('./score-summary-rank', () => ({
  ScoreSummaryRank: ({ round }: { round: string }) => <div>rank-from-{round}</div>,
}));

vi.mock('./score-summary-chart', () => ({
  ScoreSummaryChart: ({ dimensionScores }: { dimensionScores: { pct: number }[] }) => (
    <div>chart-{dimensionScores.map((d) => d.pct).join('/')}</div>
  ),
}));

const dimensions: Dimension[] = [
  { id: 1, name: 'คุณภาพอาหาร', nameEn: 'Food Quality', weight: 50, questionCount: 1 },
  { id: 2, name: 'ความปลอดภัย', nameEn: 'Food Safety', weight: 50, questionCount: 1 },
];

function makeQuestion(dimensionId: number, rawScore: number | null): AssessmentQuestion {
  return {
    questionId: dimensionId,
    questionNo: dimensionId,
    dimensionId,
    questionText: 'คำถามทดสอบ',
    maxScore: 4,
    rawScore,
    note: null,
    suggestion: null,
    evidence: [],
  };
}

function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: 'a0',
    storeId: 'store-1',
    round: 'T0',
    assessorId: 'assessor-1',
    status: 'SUBMITTED',
    totalScore: 62.5,
    currentScore: 62.5,
    zone: null,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    submittedAt: '2026-01-02T00:00:00.000Z',
    questions: [makeQuestion(1, 1), makeQuestion(2, 4)],
    redFlags: [],
    ...overrides,
  };
}

function renderSummary(props: Partial<Parameters<typeof ScoreSummary>[0]> = {}) {
  return render(
    <ScoreSummary
      storeId="store-1"
      round="T1"
      selectedDimId={1}
      totalScore={null}
      currentScore={0}
      questions={[makeQuestion(1, null), makeQuestion(2, null)]}
      redFlags={[]}
      isSubmitted={false}
      {...props}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useDimensions).mockReturnValue({
    data: dimensions,
  } as unknown as ReturnType<typeof useDimensions>);
  vi.mocked(useAssessmentSummaries).mockReturnValue({
    data: [],
  } as unknown as ReturnType<typeof useAssessmentSummaries>);
  vi.mocked(useAssessmentByRound).mockReturnValue({
    data: undefined,
  } as unknown as ReturnType<typeof useAssessmentByRound>);
  vi.mocked(useAssessmentRank).mockReturnValue({
    data: undefined,
  } as unknown as ReturnType<typeof useAssessmentRank>);
});

describe('ScoreSummary', () => {
  it('falls back to the round open in the form while no round is completed', () => {
    renderSummary({
      round: 'T0',
      totalScore: 40,
      questions: [makeQuestion(1, 2), makeQuestion(2, 2)],
    });

    expect(screen.getByText('รอบ T0 (กำลังประเมิน)')).toBeInTheDocument();
    expect(screen.getByText('rank-from-T0')).toBeInTheDocument();
    expect(screen.getByText('chart-50/50')).toBeInTheDocument();
  });

  it('reads the latest completed round instead of the round being filled in', () => {
    vi.mocked(useAssessmentSummaries).mockReturnValue({
      data: [{ round: 'T0', status: 'SUBMITTED' }],
    } as unknown as ReturnType<typeof useAssessmentSummaries>);
    vi.mocked(useAssessmentByRound).mockReturnValue({
      data: makeAssessment(),
    } as unknown as ReturnType<typeof useAssessmentByRound>);

    // Props carry an empty T1 draft — none of it may reach the card.
    renderSummary({ round: 'T1' });

    expect(screen.getByText('ผลรอบ T0')).toBeInTheDocument();
    expect(screen.getByText('rank-from-T0')).toBeInTheDocument();
    expect(screen.getByText('chart-25/100')).toBeInTheDocument();
    expect(screen.getByText('62.50')).toBeInTheDocument();
    expect(screen.queryByText('ยังไม่มีคะแนน')).not.toBeInTheDocument();
  });

  it('lists every dimension below the pass threshold as a weak point', () => {
    vi.mocked(useAssessmentSummaries).mockReturnValue({
      data: [{ round: 'T0', status: 'SUBMITTED' }],
    } as unknown as ReturnType<typeof useAssessmentSummaries>);
    vi.mocked(useAssessmentByRound).mockReturnValue({
      data: makeAssessment(),
    } as unknown as ReturnType<typeof useAssessmentByRound>);

    renderSummary({ round: 'T1' });

    // dim 1 scores 25%, dim 2 scores 100% — only the first is below 60.
    expect(screen.getByText('คุณภาพอาหาร (มิติ 1)')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.queryByText('ความปลอดภัย (มิติ 2)')).not.toBeInTheDocument();
  });

  it('says every dimension passed when none is below the threshold', () => {
    vi.mocked(useAssessmentSummaries).mockReturnValue({
      data: [{ round: 'T0', status: 'SUBMITTED' }],
    } as unknown as ReturnType<typeof useAssessmentSummaries>);
    vi.mocked(useAssessmentByRound).mockReturnValue({
      data: makeAssessment({ questions: [makeQuestion(1, 3), makeQuestion(2, 4)] }),
    } as unknown as ReturnType<typeof useAssessmentByRound>);

    renderSummary({ round: 'T1' });

    expect(screen.getByText('ทุกมิติผ่านเกณฑ์แล้ว')).toBeInTheDocument();
  });

  it('shows the running score, flagged as provisional, before the round is submitted', () => {
    renderSummary({
      round: 'T0',
      totalScore: null,
      currentScore: 45.5,
      questions: [makeQuestion(1, 2), makeQuestion(2, 2)],
    });

    expect(screen.getByText('45.50')).toBeInTheDocument();
    expect(screen.getByText('ระหว่างประเมิน')).toBeInTheDocument();
    expect(screen.queryByText('ยังไม่มีคะแนน')).not.toBeInTheDocument();
  });

  it('withholds the zone verdict until every question is scored', () => {
    renderSummary({
      round: 'T0',
      totalScore: null,
      currentScore: 12.5,
      // One of two questions scored — a real score, but not a whole round.
      questions: [makeQuestion(1, 1), makeQuestion(2, null)],
    });

    expect(screen.queryByText('Red Zone')).not.toBeInTheDocument();
    expect(screen.getByText('ให้คะแนนแล้ว 1/2 ข้อ')).toBeInTheDocument();
    expect(screen.getByText('โซนจะแสดงเมื่อให้คะแนนครบทุกข้อ')).toBeInTheDocument();
  });

  it('shows the zone once the last question is scored, before submit', () => {
    renderSummary({
      round: 'T0',
      totalScore: null,
      currentScore: 45.5,
      questions: [makeQuestion(1, 2), makeQuestion(2, 2)],
    });

    expect(screen.getByText('Survival Zone')).toBeInTheDocument();
    expect(screen.getByText('ระหว่างประเมิน')).toBeInTheDocument();
  });

  it('withholds a score and a zone until at least one question is scored', () => {
    renderSummary({ round: 'T0', totalScore: null, currentScore: 0 });

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('ยังไม่มีคะแนน')).toBeInTheDocument();
    expect(screen.queryByText('ระหว่างประเมิน')).not.toBeInTheDocument();
  });

  it('offers only the rounds the store has, plus the one open in the form', () => {
    vi.mocked(useAssessmentSummaries).mockReturnValue({
      data: [{ round: 'T0', status: 'SUBMITTED' }],
    } as unknown as ReturnType<typeof useAssessmentSummaries>);
    vi.mocked(useAssessmentByRound).mockReturnValue({
      data: makeAssessment(),
    } as unknown as ReturnType<typeof useAssessmentByRound>);

    renderSummary({ round: 'T1' });

    expect(screen.getByRole('button', { name: 'T0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'T1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'T2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'T3' })).not.toBeInTheDocument();
  });

  it('re-reads the whole card from the round picked in the shared picker', async () => {
    vi.mocked(useAssessmentSummaries).mockReturnValue({
      data: [
        { round: 'T0', status: 'SUBMITTED' },
        { round: 'T1', status: 'SUBMITTED' },
      ],
    } as unknown as ReturnType<typeof useAssessmentSummaries>);
    vi.mocked(useAssessmentByRound).mockImplementation(
      ((_storeId: string, pickedRound: string) => ({
        data: pickedRound === 'T0' ? makeAssessment() : undefined,
      })) as unknown as typeof useAssessmentByRound
    );

    // T1 is both the latest completed round and the one open in the form, so
    // the card starts on the live props.
    renderSummary({
      round: 'T1',
      totalScore: 90,
      questions: [makeQuestion(1, 4), makeQuestion(2, 4)],
    });

    expect(screen.getByText('rank-from-T1')).toBeInTheDocument();
    expect(screen.getByText('chart-100/100')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'T0' }));

    expect(screen.getByText('rank-from-T0')).toBeInTheDocument();
    expect(screen.getByText('chart-25/100')).toBeInTheDocument();
    expect(screen.getByText('62.50')).toBeInTheDocument();
  });

  it('shows a placeholder while the latest round is still loading', () => {
    vi.mocked(useAssessmentSummaries).mockReturnValue({
      data: [{ round: 'T0', status: 'SUBMITTED' }],
    } as unknown as ReturnType<typeof useAssessmentSummaries>);

    renderSummary({ round: 'T1' });

    expect(screen.getByText('ผลรอบ T0')).toBeInTheDocument();
    expect(screen.queryByText('rank-from-T0')).not.toBeInTheDocument();
  });
});
