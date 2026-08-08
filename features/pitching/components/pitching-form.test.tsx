import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConfirm } from '@/components/shared/confirm-dialog';
import {
  useSubmitPitching,
  useUpdatePitching,
  useUpdatePitchingScore,
} from '../hooks/use-pitching-mutations';
import type { Pitching, PitchingCriterionScore } from '../types/pitching.types';
import { PitchingForm } from './pitching-form';

vi.mock('@/components/shared/confirm-dialog', () => ({ useConfirm: vi.fn() }));
vi.mock('../hooks/use-pitching-mutations', () => ({
  useUpdatePitching: vi.fn(),
  useUpdatePitchingScore: vi.fn(),
  useSubmitPitching: vi.fn(),
}));

const updateForm = vi.fn();
const updateScore = vi.fn();
const submitForm = vi.fn();

function criterion(overrides: Partial<PitchingCriterionScore> = {}): PitchingCriterionScore {
  return {
    id: 101,
    round: 'PITCH_DECK',
    code: '1',
    section: null,
    title: 'แนะนำร้านและข้อมูลพื้นฐาน',
    guideline: 'บอกได้ชัดเจนว่าร้านคือใคร',
    maxScore: 5,
    sortOrder: 1,
    score: null,
    note: null,
    ...overrides,
  };
}

function pitching(overrides: Partial<Pitching> = {}): Pitching {
  return {
    id: 'pitch-1',
    storeId: 'store-1',
    storeCode: 'RAP69-001',
    storeName: 'หมึกสดริมเล',
    province: 'จันทบุรี',
    round: 'PITCH_DECK',
    judgeId: 'judge-1',
    judgeName: 'ดร.กฤษฎา',
    status: 'DRAFT',
    totalScore: null,
    currentScore: 0,
    level: null,
    recommendation: null,
    evaluatedAt: '2026-05-20T00:00:00Z',
    updatedAt: '2026-05-20T00:00:00Z',
    submittedAt: null,
    createdAt: '2026-05-20T00:00:00Z',
    prototypeProduct: null,
    minimumConditions: null,
    evidenceChecked: [],
    comments: {},
    recommendationReason: null,
    noConflictOfInterest: false,
    criteria: [criterion()],
    ...overrides,
  };
}

describe('PitchingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConfirm).mockReturnValue(vi.fn().mockResolvedValue(true));
    vi.mocked(useUpdatePitching).mockReturnValue({
      mutate: updateForm,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdatePitching>);
    vi.mocked(useUpdatePitchingScore).mockReturnValue({
      mutate: updateScore,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdatePitchingScore>);
    vi.mocked(useSubmitPitching).mockReturnValue({
      mutate: submitForm,
      isPending: false,
    } as unknown as ReturnType<typeof useSubmitPitching>);
  });

  it('saves a criterion score when the field loses focus', async () => {
    render(<PitchingForm pitching={pitching()} />);

    const input = screen.getByLabelText(/คะแนนที่ได้/);
    await userEvent.type(input, '4');
    await userEvent.tab();

    expect(updateScore).toHaveBeenCalledWith({ criterionId: 101, score: 4 }, expect.anything());
  });

  it('does not send a score above the criterion maximum', async () => {
    render(<PitchingForm pitching={pitching()} />);

    await userEvent.type(screen.getByLabelText(/คะแนนที่ได้/), '9');
    await userEvent.tab();

    expect(updateScore).not.toHaveBeenCalled();
  });

  it('offers MINIMUM_NOT_MET only on the acceleration form', () => {
    const { rerender } = render(<PitchingForm pitching={pitching()} />);
    expect(screen.queryByLabelText('ไม่ผ่านเงื่อนไขขั้นต่ำ')).not.toBeInTheDocument();

    rerender(
      <PitchingForm
        pitching={pitching({
          round: 'ACCELERATION',
          minimumConditions: {
            scoreCardTotal: null,
            participationPct: null,
            scoreCardPassed: false,
            participationPassed: false,
            passed: false,
          },
          criteria: [criterion({ id: 201, round: 'ACCELERATION', code: '1.1', section: 'A' })],
        })}
      />
    );
    expect(screen.getByLabelText('ไม่ผ่านเงื่อนไขขั้นต่ำ')).toBeInTheDocument();
  });

  it('locks every field and hides submit once the form is sent', () => {
    render(<PitchingForm pitching={pitching({ status: 'SUBMITTED', totalScore: 83 })} />);

    expect(screen.getByLabelText(/คะแนนที่ได้/)).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'ส่งแบบประเมิน' })).not.toBeInTheDocument();
    expect(screen.getByText('แบบประเมินนี้ส่งแล้ว ไม่สามารถแก้ไขได้')).toBeInTheDocument();
  });

  // The whole point of the feature: a judge's submit is a scoring act, not a
  // selection act — the store's own status is decided elsewhere.
  it('tells the judge the store status will not change', () => {
    render(<PitchingForm pitching={pitching()} />);

    expect(screen.getByText('การส่งแบบประเมินจะไม่เปลี่ยนสถานะของร้านค้า')).toBeInTheDocument();
  });

  it('confirms before submitting', async () => {
    render(<PitchingForm pitching={pitching()} />);

    await userEvent.click(screen.getByRole('button', { name: 'ส่งแบบประเมิน' }));

    expect(submitForm).toHaveBeenCalled();
  });
});
