import { http, HttpResponse } from 'msw'
import { userDb } from '../fixtures/user.fixtures'
import type { LoginDto, LoginResponse } from '@/features/auth/types/auth-response.types'
import type { ApiErrorResponse } from '@/types/api.types'
import type { AuthUser } from '@/types/auth.types'
import { API_URL } from '@/constants'

const BASE_URL = `${API_URL}/auth`

function getScenario(request: Request): string {
  return request.headers.get('X-Mock-Scenario') ?? 'success'
}

function unauthorized(message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'): Response {
  return HttpResponse.json<ApiErrorResponse>({ message, statusCode: 401 }, { status: 401 })
}

function serverError(): Response {
  return HttpResponse.json<ApiErrorResponse>(
    { message: 'Internal server error', statusCode: 500 },
    { status: 500 }
  )
}

export const authHandlers = [
  http.post(`${BASE_URL}/login`, async ({ request }) => {
    const scenario = getScenario(request)
    if (scenario === 'server-error') return serverError()
    if (scenario === 'invalid-credentials') return unauthorized()

    const body = (await request.json()) as LoginDto

    const found = userDb.getAll().find((u) => u.email === body.email)
    if (!found) return unauthorized()

    const user: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role }
    return HttpResponse.json<LoginResponse>({
      user,
      token: `mock-jwt-${found.role}-${found.id}`,
    })
  }),
]
