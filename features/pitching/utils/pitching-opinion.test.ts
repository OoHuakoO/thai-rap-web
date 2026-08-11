import { describe, expect, it } from 'vitest';
import type { Pitching } from '../types/pitching.types';
import { pickOpinionJudge, readJudgeOpinion } from './pitching-opinion';

function judge(overrides: Partial<Pitching>): Pitching {
  return {
    id: 'p1',
    storeId: 'store-1',
    storeCode: 'RAP69-001',
    storeName: 'บ้านริมน้ำ',
    province: 'จันทบุรี',
    round: 'PITCH_DECK',
    judgeId: 'judge-1',
    judgeName: 'ดร.กฤษฎา',
    status: 'SUBMITTED',
    totalScore: 80,
    currentScore: 80,
    level: 'HIGHLY_SUITABLE',
    recommendation: 'SELECTED',
    evaluatedAt: null,
    updatedAt: '2026-05-20T03:30:00Z',
    submittedAt: '2026-05-20T03:30:00Z',
    createdAt: '2026-05-20T03:00:00Z',
    prototypeProduct: null,
    minimumConditions: null,
    evidenceChecked: [],
    comments: {},
    recommendationReason: null,
    noConflictOfInterest: true,
    criteria: [],
    ...overrides,
  };
}

describe('readJudgeOpinion', () => {
  it('carries every comment box of the round, blank ones included', () => {
    const opinion = readJudgeOpinion(
      judge({
        comments: { strengths: '  เมนูมีเอกลักษณ์  ' },
        recommendationReason: '  แนะนำด้านการตลาด  ',
      })
    );

    expect(opinion.fields.map((field) => field.key)).toEqual([
      'strengths',
      'urgentImprovements',
      'salesCostFeasibility',
      'productMarketPotential',
      'suggestions',
    ]);
    expect(opinion.fields[0]).toMatchObject({ tone: 'positive', text: 'เมนูมีเอกลักษณ์' });
    expect(opinion.fields[1].text).toBe('');
    expect(opinion.summary).toBe('แนะนำด้านการตลาด');
    expect(opinion.isEmpty).toBe(false);
  });

  it('reads the boxes that belong to the round, not the other form’s', () => {
    const acceleration = readJudgeOpinion(
      judge({
        round: 'ACCELERATION',
        comments: { urgentImprovements: 'ไม่ใช่รอบนี้', risks: 'ต้นทุนวัตถุดิบผันผวน' },
      })
    );

    expect(acceleration.fields.map((field) => field.key)).toEqual([
      'strengths',
      'risks',
      'conditions',
      'fundingSuggestions',
    ]);
    expect(acceleration.fields[1].text).toBe('ต้นทุนวัตถุดิบผันผวน');
  });

  it('is empty when the judge scored without writing anything', () => {
    expect(readJudgeOpinion(judge({})).isEmpty).toBe(true);
  });
});

describe('pickOpinionJudge', () => {
  it('skips judges who wrote nothing', () => {
    const silent = judge({ id: 'p1', judgeId: 'judge-1' });
    const wrote = judge({ id: 'p2', judgeId: 'judge-2', comments: { strengths: 'เมนูดี' } });

    expect(pickOpinionJudge([silent, wrote])?.judgeId).toBe('judge-2');
  });

  it('falls back to the first judge when nobody wrote anything', () => {
    const first = judge({ id: 'p1', judgeId: 'judge-1' });
    const second = judge({ id: 'p2', judgeId: 'judge-2' });

    expect(pickOpinionJudge([first, second])?.judgeId).toBe('judge-1');
  });

  it('answers null for a store no judge has scored', () => {
    expect(pickOpinionJudge([])).toBeNull();
  });
});
