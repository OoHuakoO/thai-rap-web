import { http, HttpResponse } from 'msw';
import { API_URL } from '@/constants';
import { hasPermission } from '@/constants/permissions';
import type {
  Activity,
  ActivityPhoto,
  CreateActivityDto,
  UpdateActivityDto,
} from '@/features/activity/types/activity.types';
import type { PaginatedResponse } from '@/types/api.types';
import { PERMISSIONS } from '@/types/auth.types';
import { createActivityFromDto } from '../factories/activity.factory';
import { activityDb } from '../fixtures/activity.fixtures';
import { userDb } from '../fixtures/user.fixtures';
import {
  forbidden,
  getMockUserId,
  getScenario,
  notFound,
  serverError,
  unauthorized,
} from '../utils/scenario';

const BASE_URL = `${API_URL}/activities`;

const ACTIVITY_NOT_FOUND_CODE = 'ACT_001';
const ACTIVITY_NOT_FOUND_MESSAGE = 'ไม่พบกิจกรรม';
const PHOTO_NOT_FOUND_CODE = 'ACT_002';
const PHOTO_NOT_FOUND_MESSAGE = 'ไม่พบภาพกิจกรรม';

const DEFAULT_LIMIT = 10;

function checkScenario(request: Request): Response | null {
  const scenario = getScenario(request);
  if (scenario === 'unauthorized') return unauthorized();
  if (scenario === 'forbidden') return forbidden();
  if (scenario === 'server-error') return serverError();
  return null;
}

// Reads carry no role check at all — every signed-in role holds activity:read,
// which is what the API does too. Writes are the admin pair only.
function refuseWithoutActivityWrite(request: Request): Response | null {
  const id = getMockUserId(request);
  const caller = id ? userDb.findById(id) : null;
  if (caller && !hasPermission(caller.role, PERMISSIONS.ACTIVITY_WRITE)) return forbidden();
  return null;
}

export const activityHandlers = [
  http.get(BASE_URL, ({ request }) => {
    const refusal = checkScenario(request);
    if (refusal) return refusal;

    const params = new URL(request.url).searchParams;
    const page = Number(params.get('page') ?? 1);
    const limit = Number(params.get('limit') ?? DEFAULT_LIMIT);
    const all = activityDb.getAll(params.get('search') ?? undefined);
    const items = all.slice((page - 1) * limit, page * limit);

    return HttpResponse.json<PaginatedResponse<Activity>>({
      items,
      meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) },
    });
  }),

  http.get(`${BASE_URL}/:id`, ({ request, params }) => {
    const refusal = checkScenario(request);
    if (refusal) return refusal;

    const activity = activityDb.findById(String(params.id));
    if (!activity) return notFound(ACTIVITY_NOT_FOUND_CODE, ACTIVITY_NOT_FOUND_MESSAGE);

    return HttpResponse.json<Activity>(activity);
  }),

  http.post(BASE_URL, async ({ request }) => {
    const refusal = checkScenario(request) ?? refuseWithoutActivityWrite(request);
    if (refusal) return refusal;

    const body = (await request.json()) as CreateActivityDto;
    return HttpResponse.json<Activity>(activityDb.create(createActivityFromDto(body)));
  }),

  http.patch(`${BASE_URL}/:id`, async ({ request, params }) => {
    const refusal = checkScenario(request) ?? refuseWithoutActivityWrite(request);
    if (refusal) return refusal;

    const body = (await request.json()) as UpdateActivityDto;
    const updated = activityDb.update(String(params.id), body);
    if (!updated) return notFound(ACTIVITY_NOT_FOUND_CODE, ACTIVITY_NOT_FOUND_MESSAGE);

    return HttpResponse.json<Activity>(updated);
  }),

  http.delete(`${BASE_URL}/:id`, ({ request, params }) => {
    const refusal = checkScenario(request) ?? refuseWithoutActivityWrite(request);
    if (refusal) return refusal;

    if (!activityDb.remove(String(params.id))) {
      return notFound(ACTIVITY_NOT_FOUND_CODE, ACTIVITY_NOT_FOUND_MESSAGE);
    }
    return HttpResponse.json(null);
  }),

  http.post(`${BASE_URL}/:id/photos`, async ({ request, params }) => {
    const refusal = checkScenario(request) ?? refuseWithoutActivityWrite(request);
    if (refusal) return refusal;

    const form = await request.formData();
    const updated = activityDb.addPhotos(String(params.id), form.getAll('files').length);
    if (!updated) return notFound(ACTIVITY_NOT_FOUND_CODE, ACTIVITY_NOT_FOUND_MESSAGE);

    return HttpResponse.json<Activity>(updated);
  }),

  // Mirrors the API's reorder route. The app has no caller for it — photos keep
  // their upload order — but the mock exists so the contract stays covered.
  http.patch(`${BASE_URL}/:id/photos/:photoId`, async ({ request, params }) => {
    const refusal = checkScenario(request) ?? refuseWithoutActivityWrite(request);
    if (refusal) return refusal;

    if (!activityDb.findById(String(params.id))) {
      return notFound(ACTIVITY_NOT_FOUND_CODE, ACTIVITY_NOT_FOUND_MESSAGE);
    }

    const body = (await request.json()) as { sortOrder?: number };
    const updated = activityDb.updatePhoto(String(params.id), String(params.photoId), body);
    if (!updated) return notFound(PHOTO_NOT_FOUND_CODE, PHOTO_NOT_FOUND_MESSAGE);

    return HttpResponse.json<ActivityPhoto>(updated);
  }),

  http.delete(`${BASE_URL}/:id/photos/:photoId`, ({ request, params }) => {
    const refusal = checkScenario(request) ?? refuseWithoutActivityWrite(request);
    if (refusal) return refusal;

    if (!activityDb.findById(String(params.id))) {
      return notFound(ACTIVITY_NOT_FOUND_CODE, ACTIVITY_NOT_FOUND_MESSAGE);
    }
    if (!activityDb.removePhoto(String(params.id), String(params.photoId))) {
      return notFound(PHOTO_NOT_FOUND_CODE, PHOTO_NOT_FOUND_MESSAGE);
    }
    return HttpResponse.json(null);
  }),
];
