import { http, HttpResponse } from 'msw';
import { API_URL } from '@/constants';
import type {
  CreatePitchingDto,
  Pitching,
  PitchingCriterion,
  PitchingRankingRow,
  PitchingRecommendationCounts,
  PitchingRound,
  PitchingStoreReport,
  PitchingSummaryRow,
  UpdatePitchingDto,
  UpdatePitchingScoreDto,
} from '@/features/pitching';
import type { PaginatedResponse } from '@/types/api.types';
import { createPitchingFromDto } from '../factories/pitching.factory';
import { criteriaForRound, levelFor, pitchingDb } from '../fixtures/pitching.fixtures';
import { storeDb } from '../fixtures/store.fixtures';
import {
  forbidden,
  getMockUserId,
  getScenario,
  notFound,
  serverError,
  unauthorized,
} from '../utils/scenario';

const BASE_URL = `${API_URL}/pitching`;

const PITCHING_NOT_FOUND_CODE = 'PITCH_001';
const PITCHING_NOT_FOUND_MESSAGE = 'ไม่พบแบบประเมิน Pitching';

function checkScenario(request: Request): Response | null {
  const scenario = getScenario(request);
  if (scenario === 'unauthorized') return unauthorized();
  if (scenario === 'forbidden') return forbidden();
  if (scenario === 'server-error') return serverError();
  return null;
}

function readRound(request: Request): PitchingRound {
  return new URL(request.url).searchParams.get('round') === 'ACCELERATION'
    ? 'ACCELERATION'
    : 'PITCH_DECK';
}

function countRecommendations(rows: Pitching[]): PitchingRecommendationCounts {
  const counts: PitchingRecommendationCounts = {
    SELECTED: 0,
    WAITING_LIST: 0,
    MINIMUM_NOT_MET: 0,
    NOT_SELECTED: 0,
  };
  for (const row of rows) {
    if (row.recommendation) counts[row.recommendation] += 1;
  }
  return counts;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const EXPORT_CONTENT_TYPE: Record<string, string> = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

function exportStub(basename: string, request: Request): Response {
  const format = new URL(request.url).searchParams.get('format') === 'pdf' ? 'pdf' : 'xlsx';
  return new HttpResponse(new Blob([basename]), {
    headers: {
      'Content-Type': EXPORT_CONTENT_TYPE[format],
      'Content-Disposition': `attachment; filename="${basename}.${format}"`,
    },
  });
}

// Same shape the API's rankCohort() produces: one row per store with at least
// one submitted form, ordered by average, equal averages sharing a rank.
function buildRanking(round: PitchingRound, province?: string | null): PitchingRankingRow[] {
  const byStore = new Map<string, Pitching[]>();
  for (const row of pitchingDb.getAll()) {
    if (row.round !== round || row.status !== 'SUBMITTED') continue;
    byStore.set(row.storeId, [...(byStore.get(row.storeId) ?? []), row]);
  }

  const items = [...byStore.values()]
    .map((rows) => {
      const avgScore = round2(
        rows.reduce((total, row) => total + (row.totalScore ?? 0), 0) / rows.length
      );
      return {
        storeId: rows[0].storeId,
        storeCode: rows[0].storeCode,
        storeName: rows[0].storeName,
        province: rows[0].province,
        rank: 0,
        judgeCount: rows.length,
        avgScore,
        level: levelFor(avgScore),
        recommendationCounts: countRecommendations(rows),
        minimumPassedCount: rows.filter((row) => row.minimumConditions?.passed).length,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore || a.storeCode.localeCompare(b.storeCode));

  let lastScore: number | null = null;
  let lastRank = 0;
  const ranked = items.map((item, index) => {
    if (item.avgScore !== lastScore) {
      lastRank = index + 1;
      lastScore = item.avgScore;
    }
    return { ...item, rank: lastRank };
  });

  // Filtered after ranking, like the API: `rank` stays the store's position in
  // the whole round.
  return province ? ranked.filter((item) => item.province === province) : ranked;
}

function toSummaryRow(row: Pitching): PitchingSummaryRow {
  const { criteria: _criteria, ...summary } = row;
  return summary;
}

export const pitchingHandlers = [
  http.get(`${BASE_URL}/criteria`, ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;
    return HttpResponse.json<PitchingCriterion[]>(criteriaForRound(readRound(request)));
  }),

  // The export routes answer a Blob, so the fixture only has to prove the URL,
  // params and headers line up — the real writers live on the API.
  http.get(`${BASE_URL}/summary/export`, ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;
    return exportStub(`pitching-ranking-${readRound(request)}`, request);
  }),

  http.get(`${BASE_URL}/summary`, ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const params = new URL(request.url).searchParams;
    const page = Number(params.get('page') ?? 1);
    const limit = Number(params.get('limit') ?? 25);
    const items = buildRanking(readRound(request), params.get('province'));

    return HttpResponse.json<PaginatedResponse<PitchingRankingRow>>({
      items: items.slice((page - 1) * limit, page * limit),
      meta: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
    });
  }),

  http.get(`${BASE_URL}/stores/:storeId/export`, ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;
    return exportStub(`pitching-report-${readRound(request)}`, request);
  }),

  http.get(`${BASE_URL}/stores/:storeId`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const storeId = String(params.storeId);
    const store = storeDb.findById(storeId);
    if (!store) return notFound('STORE_001', 'ไม่พบร้านค้า');

    const round = readRound(request);
    const ranking = buildRanking(round);
    const entry = ranking.find((item) => item.storeId === storeId);
    const judges = pitchingDb
      .getAll()
      .filter(
        (row) => row.storeId === storeId && row.round === round && row.status === 'SUBMITTED'
      );

    return HttpResponse.json<PitchingStoreReport>({
      storeId,
      storeCode: store.code,
      storeName: store.name,
      province: store.province ?? null,
      round,
      avgScore: entry?.avgScore ?? null,
      level: entry?.level ?? null,
      rank: entry?.rank ?? null,
      rankedStoreCount: ranking.length,
      judgeCount: judges.length,
      recommendationCounts: countRecommendations(judges),
      criteria: criteriaForRound(round).map((criterion) => {
        const scores = judges
          .map((judge) => judge.criteria.find((item) => item.id === criterion.id)?.score)
          .filter((score): score is number => typeof score === 'number');
        const avgScore =
          scores.length === 0
            ? 0
            : round2(scores.reduce((total, score) => total + score, 0) / scores.length);
        return {
          ...criterion,
          avgScore,
          avgPct: criterion.maxScore === 0 ? 0 : round2((avgScore / criterion.maxScore) * 100),
        };
      }),
      judges,
    });
  }),

  http.get(BASE_URL, ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const params = new URL(request.url).searchParams;
    const storeId = params.get('storeId');
    const judgeId = params.get('judgeId');
    const status = params.get('status');
    const roundParam = params.get('round');

    const items = pitchingDb
      .getAll()
      .filter((row) => (storeId ? row.storeId === storeId : true))
      .filter((row) => (judgeId ? row.judgeId === judgeId : true))
      .filter((row) => (status ? row.status === status : true))
      .filter((row) => (roundParam ? row.round === roundParam : true))
      .map(toSummaryRow);

    const page = Number(params.get('page') ?? 1);
    const limit = Number(params.get('limit') ?? 10);

    return HttpResponse.json<PaginatedResponse<PitchingSummaryRow>>({
      items: items.slice((page - 1) * limit, page * limit),
      meta: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
    });
  }),

  http.get(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const row = pitchingDb.findById(String(params.id));
    if (!row) return notFound(PITCHING_NOT_FOUND_CODE, PITCHING_NOT_FOUND_MESSAGE);
    return HttpResponse.json<Pitching>(row);
  }),

  http.post(BASE_URL, async ({ request }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const dto = (await request.json()) as CreatePitchingDto;
    const judgeId = getMockUserId(request) ?? '4';

    const existing = pitchingDb.findMine(dto.storeId, dto.round, judgeId);
    if (existing) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PITCH_002', message: 'คุณได้สร้างแบบประเมินของร้านนี้ในรอบนี้ไว้แล้ว' },
        },
        { status: 409 }
      );
    }

    return HttpResponse.json<Pitching>(pitchingDb.create(createPitchingFromDto(dto, judgeId)), {
      status: 201,
    });
  }),

  http.patch(`${BASE_URL}/:id`, async ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const dto = (await request.json()) as UpdatePitchingDto;
    const updated = pitchingDb.update(String(params.id), dto);
    if (!updated) return notFound(PITCHING_NOT_FOUND_CODE, PITCHING_NOT_FOUND_MESSAGE);
    return HttpResponse.json<Pitching>(updated);
  }),

  http.put(`${BASE_URL}/:id/scores/:criterionId`, async ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const dto = (await request.json()) as UpdatePitchingScoreDto;
    const updated = pitchingDb.setScore(
      String(params.id),
      Number(params.criterionId),
      dto.score,
      dto.note
    );
    if (!updated) return notFound(PITCHING_NOT_FOUND_CODE, PITCHING_NOT_FOUND_MESSAGE);
    return HttpResponse.json<Pitching>(updated);
  }),

  http.post(`${BASE_URL}/:id/submit`, ({ request, params }) => {
    const scenarioResponse = checkScenario(request);
    if (scenarioResponse) return scenarioResponse;

    const row = pitchingDb.findById(String(params.id));
    if (!row) return notFound(PITCHING_NOT_FOUND_CODE, PITCHING_NOT_FOUND_MESSAGE);

    const unscored = row.criteria.filter((criterion) => criterion.score === null);
    if (unscored.length > 0) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'PITCH_005',
            message: `ยังให้คะแนนไม่ครบ เหลืออีก ${unscored.length} ข้อ`,
          },
        },
        { status: 400 }
      );
    }
    if (!row.recommendation) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'PITCH_009',
            message: 'กรุณาเลือกความเห็นสรุปของกรรมการก่อนส่งแบบประเมิน',
          },
        },
        { status: 400 }
      );
    }

    return HttpResponse.json<Pitching>(pitchingDb.submit(String(params.id)) as Pitching);
  }),
];
