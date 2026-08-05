# Access Control

Client-side access control is a **UX guard, not a security boundary**. The API
re-checks every request and is what actually protects data. Everything here
exists so a user is never shown a control that would only 403.

Source files: `types/auth.types.ts` (roles, permissions, scopes, fields),
`constants/permissions.ts` (the matrices + helpers), `constants/nav-config.ts`
(nav visibility + default routes), `stores/auth-store.ts` (`can`, `canRoute`,
`hasRole`).

Rules and checklists: `.claude/rules/auth-permissions.md`.

## Three independent questions

| Question | Answered by | Lives in |
|---|---|---|
| May this role do X at all? | `ROLE_PERMISSIONS` | `constants/permissions.ts` |
| Over which records? | `ROLE_DATA_SCOPES` | `constants/permissions.ts` |
| Which fields of a store may a PUBLIC-scoped role see? | `PUBLIC_STORE_FIELDS` | `constants/permissions.ts` |

All three are **fixed in code**. There is no runtime permission editor —
changing a role's access is a reviewed code change. (`/users/permissions` was
deleted; do not reintroduce a UI for this.)

## Permission matrix

Permissions are `<resource>:<action>` strings from `PERMISSIONS`.
`SUPER_ADMIN` spreads `ALL_PERMISSIONS`; `ADMIN` is `ALL_PERMISSIONS` minus
`SUPER_ADMIN_ONLY_PERMISSIONS`.

| Permission | SUPER_ADMIN | ADMIN | ASSESSOR | MENTOR | ENTREPRENEUR | JUDGE | ME_TEAM | VIEWER |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| `dashboard:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `manual:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `news:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `news:write` | ✓ | ✓ | | | | | | |
| `news:delete` | ✓ | ✓ | | | | | | |
| `store:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `store:read:public` | ✓ | ✓ | | | ✓ | | | ✓ |
| `store:write` | ✓ | ✓ | | | ✓ | | | |
| `store:delete` | ✓ | ✓ | | | ✓ | | | |
| `store:assign` | ✓ | ✓ | | | | | | |
| `assessment:read` | ✓ | ✓ | ✓ | ✓ | | | | |
| `assessment:write` | ✓ | ✓ | ✓ | | | | | |
| `assessment:delete` | ✓ | ✓ | | | | | | |
| `analytics:read` | ✓ | ✓ | ✓ | ✓ | | | ✓ | |
| `pitching:read` | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| `pitching:write` | ✓ | ✓ | | | | ✓ | | |
| `pitching:delete` | ✓ | ✓ | | | | | | |
| `reports:read` | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | |
| `reports:export` | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | |
| `users:read` | ✓ | | | | | | | |
| `users:write` | ✓ | | | | | | | |
| `users:delete` | ✓ | | | | | | | |

Decisions worth knowing, all documented in comments at the definition:

- **ASSESSOR is the only staff role with `assessment:write`.** MENTOR reads the
  same page in read-only mode; its writing (IDP, mentoring log, notes) belongs
  to pages that do not exist yet, not to a widened permission.
- **ASSESSOR has no `store:write`.** Its store right is "ดูร้านที่รับผิดชอบ";
  the API only ever accepted store writes from admin roles and the owning
  entrepreneur.
- **ENTREPRENEUR has no `analytics:read`.** วิเคราะห์ศักยภาพ is staff tooling.
  It does hold `reports:read`/`reports:export`, scoped to its own stores.
- **`users:*` is SUPER_ADMIN-only twice over.** `hasPermission()` re-checks
  `SUPER_ADMIN_ONLY_PERMISSIONS` independently of the table, so a bad edit to
  `ROLE_PERMISSIONS` still cannot hand out account management.

## Data scopes

`DataScope` is `ALL | ASSIGNED | OWN | PUBLIC | NONE`, applied per resource
(`store`, `assessment`, `analytics`, `reports`).

| Role | store | assessment | analytics | reports |
|---|---|---|---|---|
| SUPER_ADMIN | ALL | ALL | ALL | ALL |
| ADMIN | ALL | **ASSIGNED** | ALL | ALL |
| ASSESSOR | ASSIGNED | ASSIGNED | ASSIGNED | ASSIGNED |
| MENTOR | ASSIGNED | ASSIGNED | ASSIGNED | ASSIGNED |
| ENTREPRENEUR | OWN | OWN | NONE | OWN |
| JUDGE | ASSIGNED | NONE | NONE | NONE |
| ME_TEAM | ALL | ALL | ALL | ALL |
| VIEWER | PUBLIC | NONE | NONE | NONE |

ADMIN manages every store but only evaluates the ones assigned to it — the one
asymmetric row. Scope is enforced **server-side**: the client sends the same
request for everyone and receives a narrowed answer. `useStores()` on `/reports`
and `/analytics` therefore doubles as a "my stores" picker without any
client-side filtering.

`ASSIGNED` resolves against `User.assignedStores`, `OWN` against
`User.ownedStores` — both managed on `/users` (see
[features/user.md](features/user.md)).

## Public store fields

A `PUBLIC`-scoped role (VIEWER) receives a narrowed store object from the API —
excluded keys are **absent, not null**. Mirrors `PublicStoreResult` in the API;
the two must change together.

Included: `code`, `name`, `province`, `storeType`, `goals`, `menuPhotos`,
`storePhotos`, `socialLinks`, `status`.

Excluded: contact details, address, revenue, `mainProblems`, `documents`, every
score field, `ownerId`.

Consequence for rendering: guard with `!= null` or `?? fallback`, never
`!== null` — an omitted key arrives as `undefined`.
`canViewStoreField(role, field)` exists for the same check on the client.

## Route protection

Two layouts do all the gating; there is no `middleware.ts` (see
[01-architecture.md](01-architecture.md) for why).

```tsx
// app/(dashboard)/layout.tsx — the shape every guard must follow
if (!hasHydrated) return <Loading className="min-h-screen" />;
if (!isAuthenticated || !role) → router.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(pathname)}`)
if (!canAccessRoute(role, pathname)) → router.replace(getDefaultRouteForRole(role))
if (!isAuthenticated || !role || !isAllowed) return null;
return <AppShell>{children}</AppShell>;
```

Two invariants that are easy to break:

1. **Guard on `!isAuthenticated || !role`, never `isAuthenticated` alone.**
   `auth-storage` is hand-editable localStorage, so a roleless session is
   reachable; it satisfies no permission check and must count as signed out.
2. **Wait for `useHasHydrated()`.** Zustand's `persist` rehydrates
   asynchronously; deciding before it finishes reads a false `false` and kicks
   a signed-in user to login on every reload.

### `ROUTE_PERMISSIONS`

```ts
{ path, requiredPermission, allowedRoles? }
```

`allowedRoles` is a rarely-used role gate **on top of** the permission — used
where a permission tier is too wide:

| Route | Permission | `allowedRoles` |
|---|---|---|
| `/stores` | `store:read` | SUPER_ADMIN, ADMIN, ENTREPRENEUR |
| `/assessment` | `assessment:read` | SUPER_ADMIN, ADMIN, ASSESSOR, MENTOR |
| `/users` | `users:read` | SUPER_ADMIN |

Matching (`canAccessRoute`): longest matching entry wins, so `/news/new` is
checked against its own `news:write` entry rather than `/news`'s `news:read`.
A plain entry covers itself and everything beneath it (`/users` covers
`/users/42`); an entry containing `:param` matches segment-by-segment at its own
depth only. `HOME` matches exactly, never as a prefix.

**`canAccessRoute` is default-deny.** A path with no entry is unreachable —
which is why `manual:read` exists at all.

### Adding a protected route

Three files, together, or you ship either a broken link or an unguarded page:

1. `constants/routes.ts` — the `ROUTES` entry (plus a `*_PATTERN` twin if it
   has params).
2. `constants/permissions.ts` — a `ROUTE_PERMISSIONS` entry.
3. `constants/nav-config.ts` — a `NAV_ITEMS` entry whose `allowedRoles` match
   the roles holding the permission.

Then update [02-routing.md](02-routing.md) and this file.

## Nav visibility vs. access

`NAV_ITEMS[].allowedRoles` only decides whether a **link is rendered**. It is a
separate list from the permission matrix, and the matrix is the narrower one at
runtime. Never rely on nav filtering for safety — a user can type the URL.

`getDefaultRouteForRole()` therefore re-checks its candidate with
`canAccessRoute()` and falls back to `ROUTES.ERROR_403`, never `ROUTES.HOME`
(which is itself gated on `dashboard:read`). Any redirect target must survive
the same check that runs on arrival, or the layout loops forever.

## Component-level gating

Inside a page several roles can reach, gate the write/delete controls:

```tsx
const can = useAuthStore((s) => s.can);
{can(PERMISSIONS.STORE_WRITE) && <Button …>เพิ่มร้าน</Button>}
```

Hide, don't disable — a hidden control is also a click that cannot fail.

Every gating call site in the app today:

| Component | Check | Effect |
|---|---|---|
| `store/store-explorer.tsx` | `can(STORE_WRITE)` | hides "เพิ่มร้าน" |
| `store/store-list.tsx` | `can(...)`, `hasRole(ENTREPRENEUR)` | hides row-level write/delete; adjusts the entrepreneur's single-store view |
| `assessment/assessment-form.tsx` | `can(ASSESSMENT_WRITE)`, `hasRole([SUPER_ADMIN, ADMIN])` | read-only mode for MENTOR; admin-only correction of an already-submitted round |
| `report/report-workspace.tsx`, `report/round-report-panel.tsx` | `hasRole(REPORT_DETAIL_ROLES)` | hides the cross-store matrix tab and the per-question breakdown |
| `report/store-report-section.tsx` | `can(...)` | hides the report block on the store detail page |
| `analytics/store-analytics-section.tsx` | `hasRole(STORE_ANALYTICS_SECTION_ROLES)`, `can(...)` | hides the analytics block on the store detail page |
| `news/news-list.tsx` | `can(NEWS_WRITE)`, `can(NEWS_DELETE)` | hides create/edit/delete controls |
| `user/user-row-actions.tsx` | `can(USERS_WRITE)`, `can(USERS_DELETE)` | hides approve / reject / assign |
| `dashboard/top20-card.tsx`, `dashboard/province-comparison-card.tsx` | `hasRole(ENTREPRENEUR)` | hides cross-store cards from an entrepreneur |
| `dashboard/activity-feed-card.tsx`, `reports-status-card.tsx`, `top20-card.tsx` | `canRoute(ROUTES.X)` | renders the card's footer link only when the target is reachable |
| `dashboard/reports-status-card.tsx` | `can(REPORTS_EXPORT)` | hides the download button |

Two extra notes:

- `canRoute()` — not `can()` — is what gates a **link**. `/stores` needs
  `store:read` but admits only three roles, so `can('store:read')` alone would
  render a link the dashboard layout bounces straight back.
- `useStoreStats()` sets `enabled: hasRole([ADMIN, ENTREPRENEUR])` because the
  API 403s `/stores/stats` for everyone else. Skipping the call beats letting
  it fail, retry, and trip the interceptor's 403 redirect.

Prefer `can(permission)`. Reach for `hasRole()` only when the restriction is
genuinely about identity rather than capability (the three cases above).
Never write `user.role === 'ADMIN'` anywhere.

## Auth session state

`useAuthStore` (Zustand + `persist`, key `auth-storage`):

| Field | Persisted? | Notes |
|---|---|---|
| `user` | ✓ | `{ id, name, email, role }` |
| `isAuthenticated` | ✓ | |
| `accessToken` | ✗ | **memory only** — excluded from `partialize` |
| `expiresAt` | ✗ | derived from `expiresIn` at login |

The refresh token is never held here: it lives in an httpOnly cookie set by the
API and travels via `withCredentials`. On reload, `AuthBootstrap` trades that
cookie for a fresh access token before authenticated data renders.

Selectors: `can(permission)`, `canRoute(path)`, `hasRole(role | role[])`.
`canRoute` exists for gating a **link** — a permission check alone is not
enough when the route also carries a narrower `allowedRoles`.
