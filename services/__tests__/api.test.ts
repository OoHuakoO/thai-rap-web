import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { API_URL } from '@/constants'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth-store'

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), warning: vi.fn() },
}))

import { toast } from 'sonner'
import { api, refreshAccessToken } from '../api'

const server = setupServer()

function setLocation(pathname: string) {
  Object.defineProperty(window, 'location', {
    value: { href: `http://localhost${pathname}`, pathname },
    writable: true,
    configurable: true,
  })
}

function resetAuthStore() {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    expiresAt: null,
    isAuthenticated: false,
  })
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

beforeEach(() => {
  resetAuthStore()
  setLocation('/dashboard')
})

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

describe('request interceptor', () => {
  it('attaches Authorization header when the token is valid', async () => {
    useAuthStore.setState({ accessToken: 'valid-token', expiresAt: Date.now() + 60_000 })
    server.use(
      http.get(`${API_URL}/ping`, ({ request }) =>
        HttpResponse.json({ authHeader: request.headers.get('authorization') })
      )
    )

    const res = await api.get('/ping')

    expect(res.data.authHeader).toBe('Bearer valid-token')
  })

  it('sends no Authorization header when there is no token', async () => {
    server.use(
      http.get(`${API_URL}/ping`, ({ request }) =>
        HttpResponse.json({ authHeader: request.headers.get('authorization') })
      )
    )

    const res = await api.get('/ping')

    expect(res.data.authHeader).toBeNull()
  })

  it('proactively refreshes the token when close to expiry', async () => {
    useAuthStore.setState({ accessToken: 'stale-token', expiresAt: Date.now() + 5_000 })
    let refreshCalls = 0
    server.use(
      http.post(`${API_URL}/auth/refresh`, () => {
        refreshCalls += 1
        return HttpResponse.json({
          success: true,
          data: { accessToken: 'fresh-token', expiresIn: 900 },
        })
      }),
      http.get(`${API_URL}/ping`, ({ request }) =>
        HttpResponse.json({ authHeader: request.headers.get('authorization') })
      )
    )

    const res = await api.get('/ping')

    expect(refreshCalls).toBe(1)
    expect(res.data.authHeader).toBe('Bearer fresh-token')
    expect(useAuthStore.getState().accessToken).toBe('fresh-token')
  })
})

describe('response interceptor — envelope unwrap', () => {
  it('unwraps a { success, data } envelope into response.data', async () => {
    server.use(
      http.get(`${API_URL}/users`, () => HttpResponse.json({ success: true, data: [{ id: '1' }] }))
    )

    const res = await api.get('/users')

    expect(res.data).toEqual([{ id: '1' }])
  })

  it('passes through a flat mock payload unchanged', async () => {
    server.use(http.get(`${API_URL}/users`, () => HttpResponse.json([{ id: '1' }])))

    const res = await api.get('/users')

    expect(res.data).toEqual([{ id: '1' }])
  })
})

describe('response interceptor — error handling', () => {
  it('shows a network-error toast and rejects with NETWORK_ERROR', async () => {
    server.use(http.get(`${API_URL}/ping`, () => HttpResponse.error()))

    await expect(api.get('/ping')).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
    expect(toast.error).toHaveBeenCalledWith(expect.any(String), { id: 'network-error' })
  })

  it('refreshes once on 401 and retries the original request', async () => {
    useAuthStore.setState({ accessToken: 'expired-token', expiresAt: Date.now() + 60_000 })
    let secureCalls = 0
    server.use(
      http.get(`${API_URL}/secure`, ({ request }) => {
        secureCalls += 1
        if (secureCalls === 1) return new HttpResponse(null, { status: 401 })
        return HttpResponse.json({ authHeader: request.headers.get('authorization') })
      }),
      http.post(`${API_URL}/auth/refresh`, () =>
        HttpResponse.json({ success: true, data: { accessToken: 'new-token', expiresIn: 900 } })
      )
    )

    const res = await api.get('/secure')

    expect(secureCalls).toBe(2)
    expect(res.data.authHeader).toBe('Bearer new-token')
  })

  it('logs out and redirects to login when refresh fails after a 401', async () => {
    useAuthStore.setState({
      accessToken: 'expired-token',
      expiresAt: Date.now() + 60_000,
      isAuthenticated: true,
    })
    server.use(
      http.get(`${API_URL}/secure`, () => new HttpResponse(null, { status: 401 })),
      http.post(`${API_URL}/auth/refresh`, () => new HttpResponse(null, { status: 401 }))
    )

    await expect(api.get('/secure')).rejects.toMatchObject({ statusCode: 401 })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(window.location.href).toBe(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent('/dashboard')}`)
  })

  it('does not attempt a refresh for auth endpoints (e.g. login)', async () => {
    let refreshCalls = 0
    server.use(
      http.post(`${API_URL}/auth/login`, () => new HttpResponse(null, { status: 401 })),
      http.post(`${API_URL}/auth/refresh`, () => {
        refreshCalls += 1
        return new HttpResponse(null, { status: 401 })
      })
    )

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({ statusCode: 401 })

    expect(refreshCalls).toBe(0)
  })

  it('does not log out or redirect on a login/register 401 — the form shows the error inline', async () => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: 'some-token' })
    server.use(http.post(`${API_URL}/auth/login`, () => new HttpResponse(null, { status: 401 })))

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({ statusCode: 401 })

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(window.location.href).toBe('http://localhost/dashboard')
  })

  it('redirects to the 403 error page on FORBIDDEN', async () => {
    server.use(http.get(`${API_URL}/secure`, () => new HttpResponse(null, { status: 403 })))

    await expect(api.get('/secure')).rejects.toMatchObject({ statusCode: 403 })

    expect(window.location.href).toBe(ROUTES.ERROR_403)
  })

  it('shows a rate-limit toast with the retry-after seconds on 429', async () => {
    server.use(
      http.get(
        `${API_URL}/secure`,
        () => new HttpResponse(null, { status: 429, headers: { 'retry-after': '42' } })
      )
    )

    await expect(api.get('/secure')).rejects.toMatchObject({ statusCode: 429, retryAfter: 42 })

    expect(toast.warning).toHaveBeenCalledWith(expect.stringContaining('42'), { id: 'rate-limit' })
  })

  it('redirects to the 500 error page on SERVER_ERROR', async () => {
    server.use(http.get(`${API_URL}/secure`, () => new HttpResponse(null, { status: 500 })))

    await expect(api.get('/secure')).rejects.toMatchObject({ statusCode: 500 })

    expect(window.location.href).toBe(ROUTES.ERROR_500)
  })

  it('redirects to the 503 error page on SERVICE_UNAVAILABLE', async () => {
    server.use(http.get(`${API_URL}/secure`, () => new HttpResponse(null, { status: 503 })))

    await expect(api.get('/secure')).rejects.toMatchObject({ statusCode: 503 })

    expect(window.location.href).toBe(ROUTES.ERROR_503)
  })
})

describe('refreshAccessToken', () => {
  it('dedupes concurrent calls into a single in-flight request', async () => {
    let refreshCalls = 0
    server.use(
      http.post(`${API_URL}/auth/refresh`, async () => {
        refreshCalls += 1
        await new Promise((resolve) => setTimeout(resolve, 10))
        return HttpResponse.json({
          success: true,
          data: { accessToken: 'dedup-token', expiresIn: 900 },
        })
      })
    )

    const [a, b] = await Promise.all([refreshAccessToken(), refreshAccessToken()])

    expect(refreshCalls).toBe(1)
    expect(a).toBe('dedup-token')
    expect(b).toBe('dedup-token')
  })
})
