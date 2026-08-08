# Data Layer

Every byte that crosses the network goes through `services/api.ts`. No
component or hook calls `fetch` or `axios` directly.

`services/README.md` documents the client itself in Thai, line by line. This
file is the map above it: what the layers are, what every query key is, and
which caches a mutation must invalidate.

## Layers

```
component  →  hook (TanStack Query)  →  <domain>.service.ts  →  services/api.ts  →  API
                    ↑ cache, retry              ↑ typed request        ↑ auth, unwrap, errors
```

| Layer | Owns | Never does |
|---|---|---|
| `services/api.ts` | Auth header, proactive + reactive refresh, envelope unwrapping, error normalisation, global redirects | Know about any domain |
| `<domain>.service.ts` | URL, params, request/response types, `FormData` for uploads | Catch errors, hold state |
| Hook | Query key, `enabled`, `staleTime`, cache invalidation | Render |
| Component | Loading / error / empty / data states | Call a service (one documented exception) |

## The Axios client

`services/api.ts` creates one instance:

```ts
axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_TIMEOUT_MS,     // 10s
  withCredentials: true,       // required — the refresh token is an httpOnly cookie
})
```

### Request interceptor

Attaches `Authorization: Bearer <accessToken>` from the auth store (memory, not
localStorage). Before attaching, it refreshes when either holds:

- `isAuthenticated && !accessToken` — a reload lost the memory-only token and
  `AuthBootstrap`'s refresh has not resolved yet;
- `expiresAt - now < 10_000` — proactive refresh, so the request does not go out
  on a token about to expire.

If that refresh fails, the request is marked `_retry = true` so the reactive 401
handler skips straight to logout instead of refreshing a second doomed time.

### Response interceptor 1 — unwrap

The API wraps success as `{ success, data }`. This interceptor replaces
`response.data` with the inner payload, so every service's
`.then((res) => res.data)` receives the real thing. MSW mocks return flat
payloads with no `success` key and pass through untouched.

### Refresh

`POST /auth/refresh` is called with a bare `axios.post` (not the instance) to
avoid re-entering its own interceptors. The refresh token is never in the body —
it rides the httpOnly cookie. `refreshAccessToken()` memoises the in-flight
promise, so N concurrent 401s share one refresh call. It is exported for
`AuthBootstrap`.

### Response interceptor 2 — errors

Every failure becomes an `ApiError` via `mapToApiError()`, then:

| Condition | Interceptor behaviour |
|---|---|
| Cancelled | reject only |
| Network / timeout | `toast.error(message, { id: 'network-error' })`, then reject |
| 401, not yet retried, not an auth endpoint | refresh once and replay the request |
| 401 after that | `logout()` + hard nav to `/login?returnUrl=<path>` |
| 403 | hard nav to `/errors/403` |
| 429 | `toast.warning` with `retryAfter` seconds |
| 500 / 502 / 504 | hard nav to `/errors/500` |
| 503 | hard nav to `/errors/503` |
| anything else (400, 404, 409, 422 …) | reject untouched — the hook/UI layer handles it |

Two exclusion lists keep auth forms usable:

- `AUTH_ENDPOINTS_WITHOUT_RETRY` = `/auth/login`, `/auth/register`,
  `/auth/refresh` — a wrong password must not trigger a refresh loop.
- `AUTH_ENDPOINTS_WITHOUT_REDIRECT` = `/auth/login`, `/auth/register` — login's
  403 means `AUTH_006` (account still pending approval) and belongs inline in
  the form, not on `/errors/403`. `/auth/refresh` is deliberately absent: if
  refresh itself fails, the session really is gone.

The toasts above are the **only** UI the interceptor produces. Both are
cross-cutting failures with no per-component recovery; everything else is the
component's job.

### `ApiError`

`services/api-error.ts` — `extends Error`, plus `statusCode`, `code`
(`ErrorCode` union), `details` (field-level 422 errors), `requestId` (from
`x-request-id`), `isNetworkError`, `isCancelled`, `retryAfter`.
`Object.setPrototypeOf` is called in the constructor so `instanceof` survives
the TS transpile of a built-in subclass.

Read it through `extractErrorMessage(error)` (`utils/extract-error-message.ts`),
which falls back to `'เกิดข้อผิดพลาดที่ไม่คาดคิด'`. Components never touch
`ApiError` fields directly.

## TanStack Query defaults

`app/providers.tsx`:

```ts
queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false }
```

Per-query overrides in use:

| Query | Override | Why |
|---|---|---|
| `useDimensions()` | `staleTime: Infinity` | 8 seeded rows, never change at runtime |
| `useProvinces()`, `useStoreTypes()` | `staleTime: 24h` | seeded reference data |
| `useAssessmentRank()` | `staleTime: 60s` | cohort aggregate; re-runs on every remount otherwise |
| `useRoundMatrix()` | `placeholderData: keepPreviousData` | a 40-column table must not blank out on page change |
| `useStore(id)`, `useUser(id)`, `useAssessment*` | `enabled: !!id` | never fire on an empty id |
| `useStoreStats()` | `enabled: hasRole([SUPER_ADMIN, ADMIN, ENTREPRENEUR])` | the API 403s everyone else |
| `useStoreAnalytics()` | `enabled: Boolean(storeId)` | store is picked client-side |

## Query key inventory

Keys are always built from a `*Keys` object — never inline.

| Feature | Object | Keys |
|---|---|---|
| dashboard | `dashboardKeys` (`hooks/dashboard-keys.ts`) | `all`, `kpis()`, `provinceDistribution()`, `top20(round)`, `incubationProgress()`, `provinceComparison(pair)`, `storeRoundScores()`, `activities()`, `reportsStatus()` |
| store | `storeKeys` (`hooks/use-stores.ts`) | `all`, `list(params)`, `detail(id)`, `stats()` |
| assessment | `assessmentKeys` (`hooks/use-assessment.ts`) | `all`, `byStore(storeId)`, `byStoreRound(storeId, round)`, `history(storeId)`, `rank(storeId, round)` |
| assessment | `dimensionKeys` | `all` |
| analytics | `analyticsKeys` (`hooks/analytics-keys.ts`) | `all`, `store(storeId, params)` |
| report | `reportKeys` (`hooks/report-keys.ts`) | `all`, `round(storeId, round)`, `overview(storeId)`, `matrix(round, params)` |
| news | `newsKeys` (`hooks/news-keys.ts`) | `all`, `list(query)`, `detail(id)` |
| pitching | `pitchingKeys` (`hooks/pitching-keys.ts`) | `all`, `detail(id)`, `mine(storeId, round)`, `ranking(round, province, page, limit)`, `cohort(round)`, `storeReport(storeId, round)` |
| user | `userKeys` (`hooks/use-users.ts`) | `all`, `list(params)`, `stats()`, `detail(id)` |
| province | `provinceKeys` | `all` |
| store type | `storeTypeKeys` | `all` |

## Cache invalidation map

The non-obvious part of this codebase. A mutation must invalidate everything a
server-side side effect touched, not just its own resource.

| Mutation | Invalidates / patches |
|---|---|
| `useCreateStore` | `storeKeys.all` |
| `useUpdateStore(id)`, `useUpdateStoreStatus(id)` | `storeKeys.all`, `storeKeys.detail(id)` |
| `useDeleteStore` | `storeKeys.all` |
| any store upload/delete (`document`, `menuPhoto`, `cover`, `storePhoto`) | `storeKeys.detail(storeId)` |
| `useUpdateScore` | **patches** the cached assessment with the returned question, recomputes `currentScore` from cached dimensions; invalidates `assessmentKeys.history`. If the round was already submitted, additionally invalidates `byStoreRound`, `byStore`, `rank`, and `storeKeys.detail` — the API re-freezes `totalScore` and rebuilds red flags, none of which the single-question response carries |
| `useSaveDraft` | sets `byStoreRound`; invalidates `byStore`, `history` (DRAFT → IN_PROGRESS shows on the pills and timeline) |
| `useSubmitAssessment` | `byStoreRound`, `byStore`, `rank`, `history`, `storeKeys.detail(storeId)` (submission can advance `Store.status`) |
| `useUpdateNotes` | `byStoreRound` |
| `useUploadEvidence` / `useDeleteEvidence` | `byStoreRound` |
| `useCreateNews` / `useUpdateNews` / `useDeleteNews` | `newsKeys.all` **and** `dashboardKeys.activities()` — the dashboard activity feed renders the same items |
| `useCreatePitching`, `useUpdatePitching`, `useUpdatePitchingScore` | **sets** `pitchingKeys.mine(storeId, round)` and `detail(id)` from the response — every pitching write answers with the whole form, so nothing has to be refetched while a judge is still typing |
| `useSubmitPitching` | the same two, plus invalidates `pitchingKeys.all` — the ranking and every store report move when a form lands. It deliberately does **not** touch `storeKeys`: submitting a pitching form never changes `Store.status` |
| `useApproveUser`, `useRejectUser`, `useAssignStores` | `userKeys.all` |
| `useAssignOwnedStores` | `userKeys.all` **and** `storeKeys.all` — ownership is what an entrepreneur's store list resolves against |

Writing the response into the cache instead of refetching is used by
`useUpdateScore` (a patch of one question) and by every pitching write (the
whole form comes back). Both are for the same reason: refetching after every
keystroke-sized save is the wrong trade. Everywhere else, invalidate.

## Service conventions

```ts
export const storeService = {
  getAll: (params?) => api.get<PaginatedStores>('/stores', { params }).then((r) => r.data),
  getById: (id) => api.get<Store>(`/stores/${id}`).then((r) => r.data),
  create: (data) => api.post<Store>('/stores', data).then((r) => r.data),
  update: (id, data) => api.patch<Store>(`/stores/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/stores/${id}`),
};
```

- Method names follow REST semantics — `getAll`, `getById`, `create`, `update`,
  `remove` — never HTTP verbs.
- Uploads get their own named method per target (`uploadDocument`,
  `uploadCover`, `uploadMenuPhoto`, `uploadEvidence`), each building a
  `FormData` with key `'file'` and setting `Content-Type: multipart/form-data`
  explicitly — the JSON default would make axios serialise the FormData.
- Deletes get their own method too, never a boolean flag on the upload.
- Services never `try/catch`. Errors propagate to the hook layer.

### Response envelope shapes

| Shape | Used by |
|---|---|
| `PaginatedResponse<T>` = `{ items, meta: { page, limit, total, totalPages } }` | `/stores`, `/users`, `/assessments` |
| Plain array | `/news`, `/dimensions`, `/provinces`, `/store-types`, all `/dashboard/*` list endpoints |
| Single object | detail endpoints, all `/analytics/*`, all `/reports/*` |
| `Blob` + `content-disposition` | every export endpoint |

### File downloads

Exports return `{ blob, filename }` — the server owns the format (mock ships
CSV, real API ships XLSX), so the filename is parsed out of
`content-disposition` rather than built on the client:

```ts
api.get<Blob>(url, { responseType: 'blob' }).then((res) => ({
  blob: res.data,
  filename: parseFilename(res.headers['content-disposition']),
}));
```

`parseFilename` is shared (`utils/parse-filename.ts`); the hook then calls
`downloadBlob(blob, filename)` (`utils/download-blob.ts`).

A download URL that comes back inside a payload (`ReportStatusItem.downloadUrl`)
is still fetched through `api`, never put in an `<a href>`: the access token is
in memory, so a plain link would hit the endpoint unauthenticated.

Uploaded files are rendered through `buildFileUrl(relativeUrl)`
(`utils/build-file-url.ts`), which resolves a server-relative `/uploads/...`
path against the API origin.

## Error handling contract

Four layers, all required:

1. **Interceptor** — normalise, refresh, redirect, and the two global toasts.
2. **Service** — propagate.
3. **Hook** — `isError`/`error` come free; mutations use `onError` for side
   effects.
4. **Component** — must render all four states:

```tsx
if (isLoading) return <CardSkeleton />;                    // or <Loading />
if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;
if (!data?.length) return <AlertCard variant="info" message={TEXT.empty} />;
return <Table data={data} />;
```

Toast vs inline:

| Situation | Pattern |
|---|---|
| Query error | Inline, next to the affected data |
| Mutation success | Toast |
| Mutation error, recoverable (form) | Inline above the submit button |
| Mutation error, unactionable (upload, delete) | `toast.error(extractErrorMessage(err))` in `onError` |
| Auth expiry, 403, 5xx | Interceptor redirect |
| Render crash | `error.tsx` |

Full rules and anti-patterns: `.claude/rules/error-handling-patterns.md`.

## Forms

React Hook Form + Zod, resolver from `@hookform/resolvers/zod`. Schemas live in
`features/<domain>/schemas/*.schema.ts`, named `camelCaseSchema`, with the
inferred type dropping the suffix (`type LoginFormValues = z.infer<typeof
loginSchema>`). Validation errors render under the field via `FieldError`; API
errors render above the submit button. Never hand-roll validation.
