# Auth & Permissions

Rules for role-based access control (RBAC) and route protection. For token
storage, refresh flow, and the axios interceptor pipeline, see
[services/README.md](../../services/README.md) — this file does not repeat
that; it covers roles/permissions and where access checks belong.

---

## The Permission Model

Eight roles (`Role`, `types/auth.types.ts`) across the five access levels in
the project brief, and permissions (`Permission`, same file) in the shape
`<resource>:<action>` — `store:read`, `assessment:write`, `users:delete`, etc.

`constants/permissions.ts` holds the matrix. It is **fixed in code** — there is
no runtime editor, so changing a role's access is a code change, reviewed like
any other:

```ts
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ['dashboard:read', 'store:read', 'store:write', /* ... */],
  ENTREPRENEUR: ['store:read', 'assessment:read', 'analytics:read'],
  // ...
}
```

Three things make up a role's access:

| Piece | Lives in | Answers |
|---|---|---|
| Permission | `ROLE_PERMISSIONS` | may this role do X at all? |
| Data scope | `ROLE_DATA_SCOPES` | over which records — `ALL` / `ASSIGNED` / `OWN` / `PUBLIC` / `NONE`? |
| Public fields | `PUBLIC_STORE_FIELDS` | which store fields a `PUBLIC`-scoped role (VIEWER) may see |

Read through `getRolePermissions()`, `getDataScope()`,
`getPublicStoreFields()` and `canViewStoreField()` (all in
`constants/permissions.ts`) rather than indexing the tables at every call
site — the helpers are what `hasPermission()` and `canAccessRoute()` build on.

`SUPER_ADMIN_ONLY_PERMISSIONS` (`types/auth.types.ts`) — `users:read`,
`users:write`, `users:delete` — is re-checked by `hasPermission()`
independently of `ROLE_PERMISSIONS`, so a bad edit to that table can never hand
out user management. `/users` also carries `allowedRoles: [SUPER_ADMIN]` in
`ROUTE_PERMISSIONS`.

Never hardcode a role check like `user.role === 'ADMIN'` anywhere in the
app. Always go through one of:

- `hasPermission(role, permission)` — plain function, usable outside React
- `useAuthStore().can(permission)` — for use inside components/hooks
- `useAuthStore().hasRole(role | role[])` — when the check is genuinely
  role-specific rather than permission-specific (rare — prefer permissions)

```tsx
// ✓
const can = useAuthStore((s) => s.can);
if (!can('store:delete')) return null;

// ✗ Don't do this
if (user.role === 'ADMIN' || user.role === 'ASSESSOR') { ... }
```

Adding a new permission means: add it to the `Permission` union
(`types/auth.types.ts`), then add it to every role's array in
`ROLE_PERMISSIONS` that should have it — explicit, not opt-out; a role not
listed for a permission does not have it.

---

## Route Protection

Route guarding is **client-side, layout-level** — there is no
`middleware.ts`. Two layouts do the gating:

This is a UX guard, not a security boundary. The API lives on a different
origin and owns the httpOnly refresh cookie, so a Next middleware could not
read the session even if one existed — the backend re-checks every request,
and that is what actually protects data. Keep it that way: never move data
fetching into a Server Component in `app/(dashboard)/`, because the RSC
payload is produced before this guard ever runs.

- `app/(auth)/layout.tsx` — if already authenticated, redirect *away* from
  login/register to the role's default route.
- `app/(dashboard)/layout.tsx` — if not signed in, redirect to login carrying
  `?next=` so login can return the user to where they were headed; if signed
  in but the role can't access the current path
  (`canAccessRoute(role, pathname)`), redirect to the role's default route.

```tsx
const isAllowed = useMemo(
  () => (isAuthenticated && role ? canAccessRoute(role, pathname) : false),
  [isAuthenticated, role, pathname]
)

useEffect(() => {
  if (!hasHydrated) return
  if (!isAuthenticated || !role) {
    router.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(pathname)}`)
    return
  }
  if (!isAllowed) { router.replace(getDefaultRouteForRole(role)) }
}, [...])

if (!hasHydrated) return <Loading className="min-h-screen" />
if (!isAuthenticated || !role || !isAllowed) return null
```

Guard on `!isAuthenticated || !role`, never on `isAuthenticated` alone. A
session carrying no role satisfies no permission check, so `isAllowed` is
`false` — but a `role && !isAllowed` test skips over it and renders the shell
on every route. `auth-storage` is hand-editable `localStorage`, so a roleless
session is reachable, not hypothetical.

Every route's required permission lives in `ROUTE_PERMISSIONS`
(`constants/permissions.ts`):

```ts
export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  { path: ROUTES.STORES, requiredPermission: 'store:read' },
  // ...
]
```

### Adding a new protected route

All three of these must be updated together — missing one leaves either a
broken nav link or an unguarded page:

1. `constants/routes.ts` — add the `ROUTES` entry.
2. `constants/permissions.ts` — add a `{ path, requiredPermission }` entry to
   `ROUTE_PERMISSIONS`.
3. `constants/nav-config.ts` — add a `NAV_ITEMS` entry with `allowedRoles`
   matching whichever roles have the required permission in
   `ROLE_PERMISSIONS`.

Don't rely on the nav (`allowedRoles`) alone to keep a page safe — a user can
type the URL directly. `ROUTE_PERMISSIONS` + the dashboard layout check is
what actually blocks access; `allowedRoles` on the nav item is only for
hiding the link.

Nav `allowedRoles` and the permission matrix are two different lists, and the
matrix is the narrower one at runtime. `getDefaultRouteForRole()` therefore
re-checks its candidate with `canAccessRoute()` and falls back to
`ROUTES.ERROR_403` — never `ROUTES.HOME`, which is itself gated on
`dashboard:read`. Any redirect target the guard would reject sends the layout
into an endless `router.replace` loop, so a redirect target must always be
verified against the same check that will run on arrival.

### `hasHydrated` gate

Every route guard must wait on `useHasHydrated()` before making a redirect
decision or rendering protected content. Zustand's `persist` middleware
rehydrates from `localStorage` asynchronously — checking `isAuthenticated`
before hydration finishes reads a false `false` and redirects a logged-in user
to login on every reload.

```tsx
if (!hasHydrated) return <Loading className="min-h-screen" />
```

---

## Component-Level Gating

`can()` and `hasRole()` exist on `useAuthStore` specifically for hiding
individual actions inside an otherwise-accessible page — e.g. an
`ENTREPRENEUR` can view `/stores` (`store:read`) but has no `store:write`, so
the "Add Store" button and edit/delete controls on that page should check
`can('store:write')` / `can('store:delete')` before rendering.

Any write/delete action on a page more than one role can reach must be gated
this way. (`spec/03-access-control.md` inventories the call sites.)

```tsx
// ✓ Hide, don't just disable — a hidden control also means no dead click
const can = useAuthStore((s) => s.can);

{can('store:write') && <Button onClick={openCreateStore}>{STORE_TEXT.addStore}</Button>}
```

Gate a **link** with `canRoute(path)`, not `can(permission)` — a route can carry
an `allowedRoles` list narrower than the permission it requires (`/stores` needs
`store:read` but admits only SUPER_ADMIN/ADMIN/ENTREPRENEUR), so a permission
check alone renders a link the dashboard layout bounces straight back.

This is a client-side UX guard only, not a security boundary — the backend
must still enforce the same permission on the endpoint. Never treat a hidden
button as sufficient protection for a sensitive action.

---

## Checklist Before Adding a Protected Feature

- [ ] New permission added to `Permission` union and to every role that should have it in `ROLE_PERMISSIONS`
- [ ] New route added to `ROUTES`, `ROUTE_PERMISSIONS`, and `NAV_ITEMS` together
- [ ] No inline `role === 'X'` checks — use `can()` / `hasRole()` / `hasPermission()`
- [ ] Write/delete UI in a multi-role page is gated with `can()`, not just left to the backend
- [ ] Backend enforces the same permission independently — client-side gating is UX only
