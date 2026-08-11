# Routing

Every path in the app is declared in `constants/routes.ts` (`ROUTES`). Nothing
links to a raw string.

## Route groups

```
app/
├── layout.tsx              root: <html lang="th">, fonts, metadata template, Providers
├── (auth)/layout.tsx       redirects an authenticated user AWAY to their default route
├── (dashboard)/layout.tsx  redirects an unauthenticated/unauthorised user; renders AppShell
└── errors/                 standalone status pages — outside both groups, unguarded
```

`(auth)` pages own the whole viewport (`min-h-screen`, cream background).
`(dashboard)` pages render inside `AppShell` (sidebar + header + banner + a
`p-6` scroll area), so anything full-height inside them must use
`min-h-[60vh]`, not `min-h-screen`.

## Route map

| Path | `ROUTES` key | File | Renders | Guard |
|---|---|---|---|---|
| `/login` | `LOGIN` | `app/(auth)/login/page.tsx` | `LoginForm` in `<Suspense>` | authenticated → bounce out |
| `/register` | `REGISTER` | `app/(auth)/register/page.tsx` | `RegisterForm` | same |
| `/forgot-password` | `FORGOT_PASSWORD` | `app/(auth)/forgot-password/page.tsx` | `ForgotPasswordForm` | same |
| `/` | `HOME` | `app/(dashboard)/page.tsx` | 7 dashboard cards | `dashboard:read` (every role but JUDGE) |
| `/stores` | `STORES` | `.../stores/page.tsx` | `StoreExplorer` | `store:read` + SUPER_ADMIN/ADMIN/ENTREPRENEUR |
| `/stores/new` | `STORE_NEW` | `.../stores/new/page.tsx` | `StoreFormHeader` + `CreateStoreForm` | inherits `/stores` |
| `/stores/[id]` | `STORE_DETAIL(id)` | `.../stores/[id]/page.tsx` | `StoreDetail` + `StoreAnalyticsSection` + `StoreReportSection` | inherits `/stores` |
| `/stores/[id]/edit` | `STORE_EDIT(id)` | `.../stores/[id]/edit/page.tsx` | `StoreEditPage` | inherits `/stores` |
| `/assessment` | `ASSESSMENT` | `.../assessment/page.tsx` | `AssessmentEntry` (redirector) | `assessment:read` + SUPER_ADMIN/ADMIN/ASSESSOR/MENTOR |
| `/assessment/[storeId]` | `ASSESSMENT_PICK_ROUND(id)` | `.../assessment/[storeId]/page.tsx` | `RoundPicker` | inherits `/assessment` |
| `/assessment/[storeId]/[round]` | `ASSESSMENT_DETAIL(id, round)` | `.../[storeId]/[round]/page.tsx` | `AssessmentForm` | inherits `/assessment` |
| `/analytics` | `ANALYTICS` | `.../analytics/page.tsx` | `AnalyticsDashboard` | `analytics:read` |
| `/reports` | `REPORTS` | `.../reports/page.tsx` | `ReportPageHeader` + `ReportWorkspace` | `reports:read` |
| `/pitching` | `PITCHING` | `.../pitching/page.tsx` | `PitchingDashboard` | `pitching:read` + SUPER_ADMIN / ADMIN / JUDGE |
| `/pitching/form` | `PITCHING_FORM` | `.../pitching/form/page.tsx` | `PitchingFormWorkspace` | `pitching:write` + SUPER_ADMIN / ADMIN / JUDGE |
| `/news` | `NEWS` | `.../news/page.tsx` | `NewsPageHeader` + `NewsList` | `news:read` (every role but JUDGE) |
| `/news/new` | `NEWS_NEW` | `.../news/new/page.tsx` | `CreateNewsForm` | `news:write` |
| `/news/[id]/edit` | `NEWS_EDIT(id)` | `.../news/[id]/edit/page.tsx` | `EditNewsForm` | `news:write` |
| `/activities` | `ACTIVITIES` | `.../activities/page.tsx` | `ActivityPageHeader` + `ActivityList` | `activity:read` (every role) |
| `/activities/[id]` | `ACTIVITY_DETAIL(id)` | `.../activities/[id]/page.tsx` | `ActivityDetail` | inherits `/activities` |
| `/activities/new` | `ACTIVITY_NEW` | `.../activities/new/page.tsx` | `CreateActivityForm` | `activity:write` |
| `/activities/[id]/edit` | `ACTIVITY_EDIT(id)` | `.../activities/[id]/edit/page.tsx` | `EditActivityForm` | `activity:write` |
| `/users` | `USERS` | `.../users/page.tsx` | `UserPageHeader` + `UserList` | `users:read` + SUPER_ADMIN only |
| `/errors/403` | `ERROR_403` | `app/errors/403/page.tsx` | `ErrorPage` | none |
| `/errors/429` | `ERROR_429` | `app/errors/429/page.tsx` | `ErrorPage` | none |
| `/errors/500` | `ERROR_500` | `app/errors/500/page.tsx` | `ErrorPage` | none |
| `/errors/503` | `ERROR_503` | `app/errors/503/page.tsx` | `ErrorPage` | none |

### Declared but not built

`ROUTES` carries one entry with no page behind it.

| Path | Key | Status |
|---|---|---|
| `/users/[id]` | `USER_DETAIL(id)` | Helper exists; no page and no caller. |

Do not stub it. Building it means building it properly, with its page,
permission check, and feature folder.

### `NEWS_EDIT_PATTERN` / `ACTIVITY_EDIT_PATTERN`

`ROUTES.NEWS_EDIT` and `ROUTES.ACTIVITY_EDIT` are functions, so neither can be
matched against a visited path. `ROUTES.NEWS_EDIT_PATTERN = '/news/:id/edit'`
and `ROUTES.ACTIVITY_EDIT_PATTERN = '/activities/:id/edit'` are the static twins
that `ROUTE_PERMISSIONS` uses. Any future parameterised protected route needs
the same pair.

`/activities/[id]` needs no such twin — it is a read at the same permission as
its parent, so the plain `/activities` entry covers it by prefix.

## Page file conventions

```tsx
// app/(dashboard)/<x>/page.tsx
import type { Metadata } from 'next';
import { Thing } from '@/features/<x>';

export const metadata: Metadata = { title: 'ชื่อหน้า' };   // page name only

export default function XPage() {
  return (
    <section className="space-y-4">
      <Thing />
    </section>
  );
}
```

Rules, all currently held by every page:

- Default export only; no `'use client'`; no fetching; no business logic.
- `metadata.title` carries the page's own Thai name. The root layout's
  `title.template` appends `| ${APP_NAME}` — repeating it produces a doubled
  suffix.
- Single `<section className="space-y-4">` wrapper, even for one child. Page
  spacing lives with the page, not in `AppShell`.
- Dynamic segments: `params` is a `Promise` in Next 15 and must be awaited.

## Boundaries

| File | Purpose |
|---|---|
| `app/(dashboard)/loading.tsx` | Route-transition fallback, `min-h-[60vh]`, `size="lg"` |
| `app/(dashboard)/error.tsx` | `'use client'` — `ErrorPage` with a `reset` action, `min-h-[60vh]` |
| `app/(dashboard)/not-found.tsx` | Keeps a `notFound()` inside the shell instead of falling to the root |
| `app/not-found.tsx` | Root 404, standalone |
| `app/global-error.tsx` | Last-resort boundary above the root layout |

`error.tsx` is for unexpected render crashes. It does **not** replace `isError`
handling inside a Client Component — see [04-data-layer.md](04-data-layer.md).

## Status pages

`app/errors/<code>/page.tsx` are deliberate destinations the Axios interceptor
navigates to, not boundaries. Each one is a Server Component exporting
`metadata` and rendering the shared `ErrorPage` with `code` from `HTTP_STATUS`
and `actions[].href` from `ROUTES`. Never build a bespoke layout per status.
Full rules in `.claude/rules/error-pages.md`.

## Redirect flows

| Trigger | Destination | Owner |
|---|---|---|
| Not signed in, hits a dashboard route | `/login?next=<path>` | `(dashboard)/layout.tsx` |
| Signed in, hits an auth route | `resolvePostLoginRoute(role, next)` | `(auth)/layout.tsx` |
| Signed in, role can't see the path | `getDefaultRouteForRole(role)` | `(dashboard)/layout.tsx` |
| Login succeeds | `resolvePostLoginRoute(role, next)` | `useLogin()` |
| 401 after a failed refresh | `/login?returnUrl=<path>` (hard nav) | `services/api.ts` |
| 403 / 5xx / 503 from the API | `/errors/403`, `/errors/500`, `/errors/503` | `services/api.ts` |
| `/assessment` with no round chosen | `/assessment/<firstStoreId>/<currentRound>` | `AssessmentEntry` |

`next` is untrusted input: `resolvePostLoginRoute()` accepts it only when it is
a same-origin path (starts with `/`, not `//`) **and** passes `canAccessRoute`.
Note the two different param names — the layout writes `?next=`, the
interceptor's hard redirect writes `?returnUrl=`, and only `next` is read back.
