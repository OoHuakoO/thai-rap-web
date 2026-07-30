import { http, HttpResponse } from 'msw';
import {
  assessmentDb,
  dimensionSeed,
  questionSeed,
  getDimensionAverages,
} from '../fixtures/assessment.fixtures';
import { storeDb } from '../fixtures/store.fixtures';
import { userDb } from '../fixtures/user.fixtures';
import {
  getScenario,
  unauthorized,
  forbidden,
  serverError,
  notFound,
  validationError,
  getMockUserId,
} from '../utils/scenario';
import { HTTP_STATUS } from '@/constants/http-status';
import type {
  Assessment,
  AssessmentSummary,
  AssessmentHistoryItem,
  AssessmentQuestion,
  AssessmentRank,
  CreateAssessmentDto,
  EvidenceFile,
  UpdateScoreDto,
  Dimension,
  Question,
  Round,
} from '@/features/assessment/types/assessment.types';
import type { ApiErrorResponse, PaginatedResponse } from '@/types/api.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}`;

// Fallback when the request carries no recognizable mock access token
// (e.g. a direct test call) — real requests attribute to the logged-in user.
const FALLBACK_ASSESSOR_ID = 'mock-assessor';

function conflict(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    {
      success: false,
      error: { code: 'ASSESS_002', message: 'มีการประเมินรอบนี้สำหรับร้านนี้อยู่แล้ว' },
    },
    { status: HTTP_STATUS.CONFLICT }
  );
}

// Mirrors REQUIRED_PRIOR_ROUND in the API's AssessmentService.create().
const REQUIRED_PRIOR_ROUND: Partial<Record<Round, Round>> = {
  T1: 'T0',
  T2: 'T1',
  T3: 'T1',
};

function priorRoundLock(storeId: string, round: Round): Response | null {
  const requiredPriorRound = REQUIRED_PRIOR_ROUND[round];
  if (!requiredPriorRound) return null;
  const prior = assessmentDb.findByStoreAndRound(storeId, requiredPriorRound);
  if (prior?.status === 'SUBMITTED' || prior?.status === 'APPROVED') return null;
  return HttpResponse.json<ApiErrorResponse>(
    {
      success: false,
      error: {
        code: 'ASSESS_003',
        message: `ต้องส่งผลประเมินรอบ ${requiredPriorRound} ก่อน จึงจะเริ่มประเมินรอบ ${round} ได้`,
      },
    },
    { status: HTTP_STATUS.BAD_REQUEST }
  );
}

function badRequest(code: string, message: string): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code, message } },
    { status: HTTP_STATUS.BAD_REQUEST }
  );
}

// Mirrors assertDraftOrInProgress in the API — a submitted or approved round
// rejects the status writes (draft, submit) outright.
function completedLock(assessmentId: string): Response | null {
  if (!assessmentDb.isCompleted(assessmentId)) return null;
  return badRequest('ASSESS_004', 'ไม่สามารถแก้ไขการประเมินที่ส่งไปแล้ว');
}

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

// Mirrors assertEditable — the content writes (score, evidence, notes) stay open
// to an admin role on a finished round so a wrong score can still be corrected.
// A request with no mock token is left unscoped, as everywhere else in the mocks.
function contentLock(assessmentId: string, request: Request): Response | null {
  if (!assessmentDb.isCompleted(assessmentId)) return null;
  const callerId = getMockUserId(request);
  const caller = callerId ? userDb.findById(callerId) : null;
  if (!caller || ADMIN_ROLES.includes(caller.role)) return null;
  return badRequest('ASSESS_004', 'ไม่สามารถแก้ไขการประเมินที่ส่งไปแล้ว');
}

function guard(request: Request): Response | null {
  const scenario = getScenario(request);
  if (scenario === 'unauthorized') return unauthorized();
  if (scenario === 'forbidden') return forbidden();
  if (scenario === 'server-error') return serverError();
  return null;
}

export const assessmentHandlers = [
  http.get(`${BASE_URL}/dimensions`, ({ request }) => {
    return guard(request) ?? HttpResponse.json<Dimension[]>(dimensionSeed);
  }),

  http.get(`${BASE_URL}/questions`, ({ request }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const url = new URL(request.url);
    const dimensionId = url.searchParams.get('dimensionId');
    const items = dimensionId
      ? questionSeed.filter((q) => q.dimensionId === Number(dimensionId))
      : questionSeed;
    return HttpResponse.json<Question[]>(items);
  }),

  http.get(`${BASE_URL}/assessments`, ({ request }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId');
    const round = url.searchParams.get('round');

    let items = storeId ? assessmentDb.findAllByStore(storeId) : [];
    if (round) items = items.filter((a) => a.round === round);

    const total = items.length;
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? total);
    const paged = limit > 0 ? items.slice((page - 1) * limit, page * limit) : items;

    return HttpResponse.json<PaginatedResponse<AssessmentSummary>>({
      items: paged,
      meta: { page, limit, total, totalPages: limit > 0 ? Math.ceil(total / limit) : 1 },
    });
  }),

  http.get(`${BASE_URL}/assessment/:storeId/history`, ({ request, params }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const summaries = assessmentDb.findAllByStore(params.storeId as string);
    const items: AssessmentHistoryItem[] = summaries.map((s) => ({
      round: s.round,
      status: s.status,
      totalScore: s.totalScore,
      assessorName: userDb.findById(s.assessorId)?.name ?? s.assessorId,
      updatedAt: s.updatedAt,
      submittedAt: s.submittedAt,
    }));
    return HttpResponse.json<AssessmentHistoryItem[]>(items);
  }),

  http.get(`${BASE_URL}/assessments/rank`, ({ request }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId');
    const round = url.searchParams.get('round') as Round | null;
    if (!storeId || !round) {
      return validationError([
        ...(!storeId ? [{ field: 'storeId', message: 'storeId is required' }] : []),
        ...(!round ? [{ field: 'round', message: 'round is required' }] : []),
      ]);
    }

    const store = storeDb.findById(storeId);
    const ranked = [...assessmentDb.findCompletedByRound(round)].sort(
      (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0)
    );
    const overallIndex = ranked.findIndex((a) => a.storeId === storeId);
    const provinceRanked = store
      ? ranked.filter((a) => storeDb.findById(a.storeId)?.province === store.province)
      : [];
    const provinceIndex = provinceRanked.findIndex((a) => a.storeId === storeId);

    const dimensionAverages = Array.from(getDimensionAverages(round).entries()).map(
      ([dimensionId, avgPct]) => ({ dimensionId, avgPct })
    );

    return HttpResponse.json<AssessmentRank>({
      overallRank: overallIndex === -1 ? null : overallIndex + 1,
      overallTotal: ranked.length,
      provinceRank: provinceIndex === -1 ? null : provinceIndex + 1,
      provinceTotal: provinceRanked.length,
      dimensionAverages,
    });
  }),

  http.patch(`${BASE_URL}/assessments/:id/notes`, async ({ request, params }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const body = (await request.json()) as { notes: string };
    if (getScenario(request) === 'validation-error' || typeof body.notes !== 'string') {
      return validationError([{ field: 'notes', message: 'Notes is required' }]);
    }
    const completed = contentLock(params.id as string, request);
    if (completed) return completed;
    const updated = assessmentDb.updateNotes(params.id as string, body.notes);
    if (!updated) return notFound('ASSESS_001', 'ไม่พบการประเมิน');
    return HttpResponse.json<Assessment>(updated);
  }),

  http.get(`${BASE_URL}/assessments/:id`, ({ request, params }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const assessment = assessmentDb.findById(params.id as string);
    if (!assessment) return notFound('ASSESS_001', 'ไม่พบการประเมิน');
    return HttpResponse.json<Assessment>(assessment);
  }),

  http.post(`${BASE_URL}/assessments`, async ({ request }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const body = (await request.json()) as CreateAssessmentDto;

    if (getScenario(request) === 'validation-error' || !body.storeId || !body.round) {
      return validationError([
        ...(!body.storeId ? [{ field: 'storeId', message: 'storeId is required' }] : []),
        ...(!body.round ? [{ field: 'round', message: 'round is required' }] : []),
      ]);
    }
    if (assessmentDb.findByStoreAndRound(body.storeId, body.round)) return conflict();

    const locked = priorRoundLock(body.storeId, body.round);
    if (locked) return locked;

    const assessorId = getMockUserId(request) ?? FALLBACK_ASSESSOR_ID;
    const created = assessmentDb.create(body.storeId, body.round, assessorId);
    return HttpResponse.json<Assessment>(created, { status: HTTP_STATUS.CREATED });
  }),

  http.put(`${BASE_URL}/assessments/:id/scores/:questionId`, async ({ request, params }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const body = (await request.json()) as UpdateScoreDto;

    if (getScenario(request) === 'validation-error' || typeof body.rawScore !== 'number') {
      return validationError([{ field: 'rawScore', message: 'rawScore is required' }]);
    }

    const assessmentId = params.id as string;
    const questionId = Number(params.questionId);
    const completed = contentLock(assessmentId, request);
    if (completed) return completed;

    const seeded = questionSeed.find((q) => q.id === questionId);
    if (seeded && body.rawScore > seeded.maxScore) {
      return badRequest('ASSESS_006', `คะแนนต้องไม่เกิน ${seeded.maxScore}`);
    }

    const updated = assessmentDb.updateScore(assessmentId, questionId, body);
    if (!updated) return notFound('ASSESS_001', 'ไม่พบการประเมิน');
    const question = updated.questions.find((q) => q.questionId === questionId);
    if (!question) return notFound('ASSESS_007', 'ไม่พบคำถาม');
    return HttpResponse.json<AssessmentQuestion>(question);
  }),

  http.post(
    `${BASE_URL}/assessments/:id/scores/:questionId/evidence`,
    async ({ request, params }) => {
      const blocked = guard(request);
      if (blocked) return blocked;
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) {
        return validationError([{ field: 'file', message: 'file is required' }]);
      }
      const completed = contentLock(params.id as string, request);
      if (completed) return completed;
      const created = assessmentDb.addEvidence(params.id as string, Number(params.questionId), {
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
      if (!created) return notFound('ASSESS_001', 'ไม่พบการประเมินหรือคำถามที่ให้คะแนนแล้ว');
      return HttpResponse.json<EvidenceFile>(created, { status: HTTP_STATUS.CREATED });
    }
  ),

  http.delete(`${BASE_URL}/assessments/:id/evidence/:evidenceId`, ({ request, params }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const completed = contentLock(params.id as string, request);
    if (completed) return completed;
    const removed = assessmentDb.removeEvidence(params.id as string, params.evidenceId as string);
    if (!removed) return notFound('FILE_003', 'ไม่พบไฟล์หลักฐาน');
    return new HttpResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  }),

  http.patch(`${BASE_URL}/assessments/:id/draft`, ({ request, params }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const completed = completedLock(params.id as string);
    if (completed) return completed;
    const updated = assessmentDb.saveDraft(params.id as string);
    if (!updated) return notFound('ASSESS_001', 'ไม่พบการประเมิน');
    return HttpResponse.json<Assessment>(updated);
  }),

  http.post(`${BASE_URL}/assessments/:id/submit`, ({ request, params }) => {
    const blocked = guard(request);
    if (blocked) return blocked;

    const assessmentId = params.id as string;
    const existing = assessmentDb.findById(assessmentId);
    if (!existing) return notFound('ASSESS_001', 'ไม่พบการประเมิน');
    if (assessmentDb.isCompleted(assessmentId)) {
      return badRequest('ASSESS_004', 'การประเมินนี้ถูกส่งไปแล้ว');
    }

    const locked = priorRoundLock(existing.storeId, existing.round);
    if (locked) return locked;

    // The API refuses a partial submit — a mock that accepts one lets the form
    // look finished against mocks and fail against the real backend.
    const progress = assessmentDb.countScored(assessmentId);
    if (progress && progress.scored < progress.total) {
      return badRequest(
        'ASSESS_005',
        `ต้องให้คะแนนครบทั้ง ${progress.total} ข้อก่อนส่ง (${progress.scored}/${progress.total})`
      );
    }

    const updated = assessmentDb.submit(assessmentId);
    if (!updated) return notFound('ASSESS_001', 'ไม่พบการประเมิน');
    return HttpResponse.json<Assessment>(updated, { status: HTTP_STATUS.CREATED });
  }),

  http.delete(`${BASE_URL}/assessments/:id`, ({ request, params }) => {
    const blocked = guard(request);
    if (blocked) return blocked;
    const removed = assessmentDb.remove(params.id as string);
    if (!removed) return notFound('ASSESS_001', 'ไม่พบการประเมิน');
    return new HttpResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  }),
];
