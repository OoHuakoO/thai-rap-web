import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { API_URL, API_TIMEOUT_MS, HTTP_STATUS } from '@/constants'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/useAuthStore'
import type { AuthTokens } from '@/features/auth/types/auth-response.types'
import { mapToApiError } from './error-mapper'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
})

const REFRESH_BUFFER_MS = 10_000

api.interceptors.request.use(async (config) => {
  const { accessToken, expiresAt, isAuthenticated } = useAuthStore.getState()
  let token = accessToken

  // After a reload, isAuthenticated rehydrates from localStorage but
  // accessToken is memory-only and starts null — without this branch every
  // request fired before AuthBootstrap's refresh resolves goes out with no
  // Authorization header and 401s.
  const tokenMissingButShouldExist = isAuthenticated && !token
  const tokenExpiringSoon = token && expiresAt && expiresAt - Date.now() < REFRESH_BUFFER_MS

  if (tokenMissingButShouldExist || tokenExpiringSoon) {
    token = await refreshAccessToken()
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// The backend wraps every success response as { success: true, data }. Unwrap
// it here so every service's `.then((res) => res.data)` keeps getting the real
// payload, instead of every call site unwrapping twice. Mocks return flat
// payloads directly (no `success` key), so they pass through untouched.
api.interceptors.response.use((response) => {
  const body = response.data as Record<string, unknown> | null
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.data = body.data
  }
  return response
})

const AUTH_ENDPOINTS_WITHOUT_RETRY = ['/auth/login', '/auth/register', '/auth/refresh']

// Login/register failures are shown inline on the auth form — a global
// logout+redirect on their 401 would blow away that form before the user
// ever sees why (e.g. wrong password).
const AUTH_ENDPOINTS_WITHOUT_REDIRECT = ['/auth/login', '/auth/register']

function matchesAuthEndpoint(url: string | undefined, endpoints: string[]): boolean {
  return !!url && endpoints.some((path) => url.includes(path))
}

let refreshPromise: Promise<string | null> | null = null

// refreshToken is never held client-side — it travels only as an httpOnly
// cookie, sent automatically via `withCredentials`.
async function doRefreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post<{ success: boolean; data: AuthTokens }>(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    )
    const tokens = res.data.data
    useAuthStore.getState().setTokens(tokens)
    return tokens.accessToken
  } catch {
    return null
  }
}

// Concurrent 401s (and concurrent proactive refreshes) share a single
// in-flight call instead of each triggering their own POST /auth/refresh.
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = mapToApiError(error)

    if (apiError.isCancelled) return Promise.reject(apiError)

    if (apiError.isNetworkError) {
      toast.error(apiError.message, { id: 'network-error' })
      return Promise.reject(apiError)
    }

    const originalRequest = axios.isAxiosError(error)
      ? (error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined)
      : undefined

    if (
      apiError.statusCode === HTTP_STATUS.UNAUTHORIZED &&
      originalRequest &&
      !originalRequest._retry &&
      !matchesAuthEndpoint(originalRequest.url, AUTH_ENDPOINTS_WITHOUT_RETRY)
    ) {
      originalRequest._retry = true
      const newAccessToken = await refreshAccessToken()
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      }
    }

    if (typeof window !== 'undefined') {
      switch (apiError.statusCode) {
        case HTTP_STATUS.UNAUTHORIZED:
          if (!matchesAuthEndpoint(originalRequest?.url, AUTH_ENDPOINTS_WITHOUT_REDIRECT)) {
            useAuthStore.getState().logout()
            window.location.href = `${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(window.location.pathname)}`
          }
          break

        case HTTP_STATUS.FORBIDDEN:
          window.location.href = ROUTES.ERROR_403
          break

        case HTTP_STATUS.RATE_LIMITED: {
          const seconds = apiError.retryAfter
          const msg = seconds
            ? `คำขอมากเกินไป กรุณาลองอีกครั้งใน ${seconds} วินาที`
            : 'คำขอมากเกินไป กรุณาลองอีกครั้งในอีกสักครู่'
          toast.warning(msg, { id: 'rate-limit' })
          break
        }

        case HTTP_STATUS.SERVER_ERROR:
        case HTTP_STATUS.BAD_GATEWAY:
        case HTTP_STATUS.GATEWAY_TIMEOUT:
          window.location.href = ROUTES.ERROR_500
          break

        case HTTP_STATUS.SERVICE_UNAVAILABLE:
          window.location.href = ROUTES.ERROR_503
          break
      }
    }

    return Promise.reject(apiError)
  }
)

export default api
