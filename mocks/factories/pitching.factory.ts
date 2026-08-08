import type { CreatePitchingDto, Pitching } from '@/features/pitching';
import { storeDb } from '../fixtures/store.fixtures';
import { userDb } from '../fixtures/user.fixtures';
import { buildMinimumConditions, criteriaForRound } from '../fixtures/pitching.fixtures';

let idCounter = 100;

export function createPitchingFromDto(dto: CreatePitchingDto, judgeId: string): Pitching {
  const now = new Date().toISOString();
  const store = storeDb.findById(dto.storeId);
  const judge = userDb.findById(judgeId);

  return {
    id: `pitching-${++idCounter}`,
    storeId: dto.storeId,
    storeCode: store?.code ?? '',
    storeName: store?.name ?? '',
    province: store?.province ?? null,
    round: dto.round,
    judgeId,
    judgeName: judge?.name ?? '',
    status: 'DRAFT',
    totalScore: null,
    currentScore: 0,
    level: null,
    recommendation: null,
    evaluatedAt: now,
    updatedAt: now,
    submittedAt: null,
    createdAt: now,
    prototypeProduct: null,
    // The pitch deck form has no minimum conditions; the API sends null there.
    minimumConditions: dto.round === 'ACCELERATION' ? buildMinimumConditions(null, null) : null,
    evidenceChecked: [],
    comments: {},
    recommendationReason: null,
    noConflictOfInterest: false,
    criteria: criteriaForRound(dto.round).map((criterion) => ({
      ...criterion,
      score: null,
      note: null,
    })),
  };
}
