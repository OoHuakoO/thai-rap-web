import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { useSubmitPitching } from '../hooks/use-pitching-mutations';
import type { Pitching, PitchingCriterionScore } from '../types/pitching.types';
import { PitchingForm } from './pitching-form';

vi.mock('@/components/shared/confirm-dialog', () => ({ useConfirm: vi.fn() }));
vi.mock('../hooks/use-pitching-mutations', () => ({ useSubmitPitching: vi.fn() }));

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

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

function accelerationPitching(overrides: Partial<Pitching> = {}): Pitching {
  return pitching({
    round: 'ACCELERATION',
    minimumConditions: {
      scoreCardTotal: null,
      participationPct: null,
      scoreCardPassed: false,
      participationPassed: false,
      passed: false,
    },
    criteria: [criterion({ id: 201, round: 'ACCELERATION', code: '1.1', section: 'A' })],
    ...overrides,
  });
}

describe('PitchingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConfirm).mockReturnValue(vi.fn().mockResolvedValue(true));
    vi.mocked(useSubmitPitching).mockReturnValue({
      mutate: submitForm,
      isPending: false,
    } as unknown as ReturnType<typeof useSubmitPitching>);
  });

  // The judge fills the form offline — nothing may reach the API until submit.
  it('writes nothing while the judge is filling the form in', async () => {
    render(<PitchingForm pitching={pitching()} />);

    await userEvent.type(screen.getByLabelText(/คะแนนที่ได้/), '4');
    await userEvent.tab();

    expect(submitForm).not.toHaveBeenCalled();
  });

  it('sends every field in one submit payload', async () => {
    render(<PitchingForm pitching={pitching()} />);

    await userEvent.type(screen.getByLabelText(/คะแนนที่ได้/), '4');
    await userEvent.type(screen.getByLabelText('จุดแข็งของร้าน'), 'เมนูเด่น');
    await userEvent.click(screen.getByLabelText('เห็นควรคัดเลือก'));
    await userEvent.click(screen.getByRole('button', { name: 'ส่งแบบประเมิน' }));

    expect(submitForm).toHaveBeenCalledWith(
      {
        comments: { strengths: 'เมนูเด่น' },
        recommendation: 'SELECTED',
        recommendationReason: undefined,
        noConflictOfInterest: false,
        scores: [{ criterionId: 101, score: 4 }],
      },
      expect.anything()
    );
  });

  // `max` on a number input does not stop typing, so the bound is enforced in
  // the change handler: the keystroke is refused outright.
  it('refuses a score above the criterion maximum', async () => {
    render(<PitchingForm pitching={pitching({ criteria: [criterion({ score: 4 })] })} />);

    const score = screen.getByLabelText(/คะแนนที่ได้/);
    await userEvent.clear(score);
    await userEvent.type(score, '9');

    expect(score).toHaveValue(null);
    expect(screen.getByText('กรอกได้เฉพาะจำนวนเต็ม 0–5')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'ส่งแบบประเมิน' }));

    expect(submitForm).toHaveBeenCalledWith(
      expect.objectContaining({ scores: [{ criterionId: 101, score: null }] }),
      expect.anything()
    );
  });

  it('refuses a fractional score the API would reject', async () => {
    render(<PitchingForm pitching={pitching()} />);

    const score = screen.getByLabelText(/คะแนนที่ได้/);
    await userEvent.click(score);
    await userEvent.paste('4.5');

    expect(score).toHaveValue(null);
    expect(screen.getByText('กรอกได้เฉพาะจำนวนเต็ม 0–5')).toBeInTheDocument();
  });

  it('refuses a Score Card reading above its maximum', async () => {
    render(<PitchingForm pitching={accelerationPitching()} />);

    await userEvent.type(screen.getByLabelText('Score Card 8 มิติ (เต็ม 40)'), '41');

    expect(screen.getByLabelText('Score Card 8 มิติ (เต็ม 40)')).toHaveValue(4);
    expect(screen.getByText('กรอกได้เฉพาะจำนวนเต็ม 0–40')).toBeInTheDocument();
  });

  it('shows the running total and the band it currently falls in', async () => {
    render(<PitchingForm pitching={pitching({ criteria: [criterion({ maxScore: 100 })] })} />);

    const summary = within(screen.getByRole('region', { name: 'คะแนนรวมปัจจุบัน' }));
    expect(summary.getByText('กรอกแล้ว 0 จาก 1 ข้อ')).toBeInTheDocument();
    expect(
      summary.getByText('ยังกรอกไม่ครบทุกข้อ ระดับผลการประเมินจะเปลี่ยนเมื่อกรอกครบ')
    ).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/คะแนนที่ได้/), '85');

    expect(summary.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '85');
    expect(summary.getByText('เหมาะสมมาก')).toBeInTheDocument();
    expect(summary.getByText('กรอกแล้ว 1 จาก 1 ข้อ')).toBeInTheDocument();
    expect(
      summary.queryByText('ยังกรอกไม่ครบทุกข้อ ระดับผลการประเมินจะเปลี่ยนเมื่อกรอกครบ')
    ).not.toBeInTheDocument();
  });

  it('carries the acceleration-only sections in the payload', async () => {
    render(<PitchingForm pitching={accelerationPitching()} />);

    await userEvent.type(screen.getByLabelText('Score Card 8 มิติ (เต็ม 40)'), '32');
    await userEvent.tab();
    await userEvent.click(screen.getByRole('button', { name: 'ส่งแบบประเมิน' }));

    expect(submitForm).toHaveBeenCalledWith(
      expect.objectContaining({
        scoreCardTotal: 32,
        participationPct: null,
        evidenceChecked: [],
        scores: [{ criterionId: 201, score: null, note: '' }],
      }),
      expect.anything()
    );
  });

  // หลักฐาน/ข้อสังเกต is a column on the acceleration paper form only.
  it('hides the per-criterion note field on the pitch deck form', () => {
    render(<PitchingForm pitching={pitching()} />);

    expect(screen.queryByLabelText('หลักฐาน / ข้อสังเกต')).not.toBeInTheDocument();
  });

  it('shows the per-criterion note field on the acceleration form', () => {
    render(<PitchingForm pitching={accelerationPitching()} />);

    expect(screen.getByLabelText('หลักฐาน / ข้อสังเกต')).toBeInTheDocument();
  });

  it('shows the round’s selection bands', () => {
    render(<PitchingForm pitching={pitching()} />);

    expect(screen.getByText('เกณฑ์พิจารณาผลการคัดเลือก')).toBeInTheDocument();
    expect(screen.getByText('ควรได้รับการพิจารณาเข้า Incubation เป็นลำดับต้น')).toBeInTheDocument();
  });

  it('offers MINIMUM_NOT_MET only on the acceleration form', () => {
    const { unmount } = render(<PitchingForm pitching={pitching()} />);
    expect(screen.queryByLabelText('ไม่ผ่านเงื่อนไขขั้นต่ำ')).not.toBeInTheDocument();
    unmount();

    render(<PitchingForm pitching={accelerationPitching()} />);
    expect(screen.getByLabelText('ไม่ผ่านเงื่อนไขขั้นต่ำ')).toBeInTheDocument();
  });

  // Submitting does not freeze the form, so a sent one opens like a draft —
  // it has to say so, or the judge cannot tell a correction from a first send.
  it('stays editable after the form is sent, and says it is a correction', async () => {
    render(
      <PitchingForm
        pitching={pitching({
          status: 'SUBMITTED',
          totalScore: 83,
          recommendation: 'SELECTED',
          criteria: [criterion({ score: 4 })],
        })}
      />
    );

    expect(screen.getByText(/แบบประเมินนี้ส่งแล้ว/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ส่งแบบประเมิน' })).not.toBeInTheDocument();

    const score = screen.getByLabelText(/คะแนนที่ได้/);
    expect(score).toBeEnabled();

    await userEvent.clear(score);
    await userEvent.type(score, '5');
    await userEvent.click(screen.getByRole('button', { name: 'บันทึกการแก้ไข' }));

    expect(submitForm).toHaveBeenCalledWith(
      expect.objectContaining({ scores: [{ criterionId: 101, score: 5 }] }),
      expect.anything()
    );
  });

  it('keeps the first-submission wording on a draft', () => {
    render(<PitchingForm pitching={pitching()} />);

    expect(screen.getByRole('button', { name: 'ส่งแบบประเมิน' })).toBeInTheDocument();
    expect(screen.queryByText(/แบบประเมินนี้ส่งแล้ว/)).not.toBeInTheDocument();
  });

  // The header block (judge, วันที่ประเมิน, ผลิตภัณฑ์ต้นแบบ) is server-side data
  // now — the form neither renders nor writes it.
  it('renders no evaluation-header fields', () => {
    render(<PitchingForm pitching={accelerationPitching()} />);

    expect(screen.queryByText('ข้อมูลการประเมิน')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('วันที่ประเมิน')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('ผลิตภัณฑ์ / เมนูต้นแบบ')).not.toBeInTheDocument();
  });

  it('goes back to the pitching dashboard after a successful submit', async () => {
    submitForm.mockImplementation((_dto, { onSuccess }) => onSuccess());
    render(<PitchingForm pitching={pitching()} />);

    await userEvent.click(screen.getByRole('button', { name: 'ส่งแบบประเมิน' }));

    expect(push).toHaveBeenCalledWith('/pitching');
  });

  it('confirms before submitting', async () => {
    const confirm = vi.fn().mockResolvedValue(false);
    vi.mocked(useConfirm).mockReturnValue(confirm);
    render(<PitchingForm pitching={pitching()} />);

    await userEvent.click(screen.getByRole('button', { name: 'ส่งแบบประเมิน' }));

    expect(confirm).toHaveBeenCalled();
    expect(submitForm).not.toHaveBeenCalled();
  });
});
