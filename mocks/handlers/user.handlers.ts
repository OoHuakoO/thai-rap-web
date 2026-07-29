import { http, HttpResponse } from 'msw';
import { userDb } from '../fixtures/user.fixtures';
import { getScenario, unauthorized, forbidden, serverError } from '../utils/scenario';
import { HTTP_STATUS } from '@/constants/http-status';
import type {
  AssignStoresDto,
  UpdateUserRoleDto,
  User,
  UserStats,
} from '@/features/user/types/user.types';
import { USER_STATUSES } from '@/features/user/types/user.types';
import type { ApiErrorResponse, PaginatedResponse } from '@/types/api.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/users`;

function notFound(message = 'ไม่พบข้อมูล'): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'DB_002', message } },
    { status: HTTP_STATUS.NOT_FOUND }
  );
}

function conflict(code: string, message: string): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code, message } },
    { status: HTTP_STATUS.CONFLICT }
  );
}

function badRequest(code: string, message: string): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code, message } },
    { status: HTTP_STATUS.BAD_REQUEST }
  );
}

export const userHandlers = [
  // GET /users — always paginated, matching the API's PaginatedResult envelope.
  // Fixture order stands in for the API's createdAt-desc sort.
  http.get(BASE_URL, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const url = new URL(request.url);
    const role = url.searchParams.get('role') as User['role'] | null;
    const status = url.searchParams.get('status') as User['status'] | null;
    const search = url.searchParams.get('search')?.toLowerCase();

    let users = userDb.getAll();
    if (role) users = users.filter((u) => u.role === role);
    if (status) users = users.filter((u) => u.status === status);
    if (search) {
      users = users.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      );
    }

    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const total = users.length;
    const start = (page - 1) * limit;

    return HttpResponse.json<PaginatedResponse<User>>({
      items: users.slice(start, start + limit),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),

  // GET /users/stats — declared before /users/:id so "stats" isn't read as an id.
  http.get(`${BASE_URL}/stats`, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const users = userDb.getAll();
    return HttpResponse.json<UserStats>({
      total: users.length,
      pending: users.filter((u) => u.status === USER_STATUSES.PENDING).length,
      active: users.filter((u) => u.status === USER_STATUSES.ACTIVE).length,
      suspended: users.filter((u) => u.status === USER_STATUSES.SUSPENDED).length,
    });
  }),

  // GET /users/:id
  http.get(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const user = userDb.findById(params.id as string);
    if (!user) return notFound('ไม่พบผู้ใช้งาน');
    return HttpResponse.json<User>(user);
  }),

  // PATCH /users/:id/approve
  http.patch(`${BASE_URL}/:id/approve`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const user = userDb.findById(params.id as string);
    if (!user) return notFound('ไม่พบผู้ใช้งาน');
    if (user.status === USER_STATUSES.ACTIVE) {
      return conflict('USER_004', 'บัญชีนี้เปิดใช้งานอยู่แล้ว');
    }

    return HttpResponse.json<User>(
      userDb.update(user.id, { status: USER_STATUSES.ACTIVE }) as User
    );
  }),

  // PATCH /users/:id/suspend
  http.patch(`${BASE_URL}/:id/suspend`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const user = userDb.findById(params.id as string);
    if (!user) return notFound('ไม่พบผู้ใช้งาน');
    if (user.status === USER_STATUSES.SUSPENDED) {
      return conflict('USER_004', 'บัญชีนี้ถูกระงับอยู่แล้ว');
    }

    return HttpResponse.json<User>(
      userDb.update(user.id, { status: USER_STATUSES.SUSPENDED }) as User
    );
  }),

  // PATCH /users/:id/role
  http.patch(`${BASE_URL}/:id/role`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as UpdateUserRoleDto;
    const updated = userDb.update(params.id as string, { role: body.role });
    if (!updated) return notFound('ไม่พบผู้ใช้งาน');
    return HttpResponse.json<User>(updated);
  }),

  // PATCH /users/:id/assigned-stores — the full list, not a delta.
  http.patch(`${BASE_URL}/:id/assigned-stores`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const user = userDb.findById(params.id as string);
    if (!user) return notFound('ไม่พบผู้ใช้งาน');
    if (user.role !== 'ASSESSOR') {
      return badRequest('USER_006', 'มอบหมายร้านให้ประเมินได้เฉพาะผู้ประเมินเท่านั้น');
    }

    const body = (await request.json()) as AssignStoresDto;
    return HttpResponse.json<User>(userDb.setAssignedStores(user.id, body.storeIds) as User);
  }),

  // PATCH /users/:id/owned-stores — the full list, not a delta.
  http.patch(`${BASE_URL}/:id/owned-stores`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const user = userDb.findById(params.id as string);
    if (!user) return notFound('ไม่พบผู้ใช้งาน');
    if (user.role !== 'ENTREPRENEUR') {
      return badRequest('USER_006', 'กำหนดเจ้าของร้านได้เฉพาะผู้ประกอบการเท่านั้น');
    }

    const body = (await request.json()) as AssignStoresDto;
    return HttpResponse.json<User>(userDb.setOwnedStores(user.id, body.storeIds) as User);
  }),

  // DELETE /users/:id
  http.delete(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const user = userDb.findById(params.id as string);
    if (!user) return notFound('ไม่พบผู้ใช้งาน');
    if (user.ownedStores.length > 0) {
      return conflict('USER_004', 'ต้องย้ายร้านที่ผู้ใช้นี้เป็นเจ้าของออกก่อนลบบัญชี');
    }

    userDb.remove(user.id);
    return new HttpResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  }),
];
