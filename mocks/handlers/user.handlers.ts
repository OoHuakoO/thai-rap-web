import { http, HttpResponse } from 'msw';
import { userDb } from '../fixtures/user.fixtures';
import { createUserFromDto } from '../factories/user.factory';
import {
  getScenario,
  unauthorized,
  forbidden,
  serverError,
  validationError,
} from '../utils/scenario';
import { HTTP_STATUS } from '@/constants/http-status';
import type { User, CreateUserDto } from '@/features/user/types/user.types';
import type { ApiErrorResponse, PaginatedResponse } from '@/types/api.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/users`;

function notFound(message = 'ไม่พบข้อมูล'): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { success: false, error: { code: 'DB_002', message } },
    { status: HTTP_STATUS.NOT_FOUND }
  );
}

export const userHandlers = [
  // GET /users
  // Returns User[] when no pagination params are present (backward-compatible
  // with existing userService.getAll).
  // Returns PaginatedResponse<User> when ?page= or ?limit= params are present.
  http.get(BASE_URL, ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const url = new URL(request.url);
    const role = url.searchParams.get('role') as User['role'] | null;
    const search = url.searchParams.get('search')?.toLowerCase();

    let users = userDb.getAll();
    if (role) users = users.filter((u) => u.role === role);
    if (search) {
      users = users.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      );
    }

    const hasPagination = url.searchParams.has('page') || url.searchParams.has('limit');
    if (!hasPagination) {
      return HttpResponse.json<User[]>(users);
    }

    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;

    return HttpResponse.json<PaginatedResponse<User>>({
      items: users.slice(start, start + limit),
      meta: { page, limit, total, totalPages },
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

  // POST /users
  http.post(BASE_URL, async ({ request }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as CreateUserDto;

    if (scenario === 'validation-error' || !body.name || !body.email) {
      return validationError([
        ...(!body.name ? [{ field: 'name', message: 'Name is required' }] : []),
        ...(!body.email ? [{ field: 'email', message: 'Email is required' }] : []),
      ]);
    }

    const user = createUserFromDto(body);
    userDb.create(user);
    return HttpResponse.json<User>(user, { status: HTTP_STATUS.CREATED });
  }),

  // PATCH /users/:id
  http.patch(`${BASE_URL}/:id`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as Partial<CreateUserDto>;
    const updated = userDb.update(params.id as string, body);
    if (!updated) return notFound('ไม่พบผู้ใช้งาน');
    return HttpResponse.json<User>(updated);
  }),

  // DELETE /users/:id
  http.delete(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const removed = userDb.remove(params.id as string);
    if (!removed) return notFound('ไม่พบผู้ใช้งาน');
    return new HttpResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  }),
];
