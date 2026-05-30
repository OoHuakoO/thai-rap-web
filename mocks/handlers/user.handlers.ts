import { http, HttpResponse } from 'msw';
import { userDb } from '../fixtures/user.fixtures';
import { createUserFromDto } from '../factories/user.factory';
import type { User, CreateUserDto } from '@/features/user/types/user.types';
import type { ApiErrorResponse, PaginatedResponse } from '@/types/api.types';
import { API_URL } from '@/constants';

const BASE_URL = `${API_URL}/users`;

// Read the scenario header to simulate specific error states without changing
// the actual request URL. Set X-Mock-Scenario on Axios config.headers for
// targeted testing: 'unauthorized' | 'forbidden' | 'server-error' | 'validation-error'
function getScenario(request: Request): string {
  return request.headers.get('X-Mock-Scenario') ?? 'success';
}

function unauthorized(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { message: 'Unauthorized', statusCode: 401 },
    { status: 401 }
  );
}

function forbidden(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { message: 'Forbidden resource', statusCode: 403 },
    { status: 403 }
  );
}

function serverError(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { message: 'Internal server error', statusCode: 500 },
    { status: 500 }
  );
}

function notFound(entity = 'Resource'): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { message: `${entity} not found`, statusCode: 404 },
    { status: 404 }
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
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
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
      data: users.slice(start, start + limit),
      total,
      page,
      limit,
      totalPages,
    });
  }),

  // GET /users/:id
  http.get(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const user = userDb.findById(params.id as string);
    if (!user) return notFound('User');
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
      return HttpResponse.json<ApiErrorResponse>(
        {
          message: 'Validation failed',
          statusCode: 422,
          errors: {
            ...((!body.name) && { name: ['Name is required'] }),
            ...((!body.email) && { email: ['Email is required'] }),
          },
        },
        { status: 422 }
      );
    }

    const user = createUserFromDto(body);
    userDb.create(user);
    return HttpResponse.json<User>(user, { status: 201 });
  }),

  // PATCH /users/:id
  http.patch(`${BASE_URL}/:id`, async ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const body = (await request.json()) as Partial<CreateUserDto>;
    const updated = userDb.update(params.id as string, body);
    if (!updated) return notFound('User');
    return HttpResponse.json<User>(updated);
  }),

  // DELETE /users/:id
  http.delete(`${BASE_URL}/:id`, ({ request, params }) => {
    const scenario = getScenario(request);
    if (scenario === 'unauthorized') return unauthorized();
    if (scenario === 'forbidden') return forbidden();
    if (scenario === 'server-error') return serverError();

    const removed = userDb.remove(params.id as string);
    if (!removed) return notFound('User');
    return new HttpResponse(null, { status: 204 });
  }),
];
