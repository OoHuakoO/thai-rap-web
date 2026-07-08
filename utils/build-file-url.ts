import { API_URL } from '@/constants'

/** Resolve a server-relative upload path (e.g. /uploads/...) against the API origin. */
export function buildFileUrl(relativeUrl: string): string {
  if (/^https?:\/\//.test(relativeUrl)) return relativeUrl
  return new URL(relativeUrl, API_URL).origin + relativeUrl
}
