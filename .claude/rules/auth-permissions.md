# Auth & Permissions

Rules for role-based access control (RBAC) and route protection. For token
storage, refresh flow, and the axios interceptor pipeline, see
[services/README.md](../../services/README.md) — this file does not repeat
that; it covers roles/permissions and where access checks belong.

---

## The Permission Model

Six roles (`Role`, `types/auth.types.ts`), eighteen permissions
(`Permission`, same file) in the shape `<resource>:<action>` — `store:read`,
`assessment:write`, `users:delete`, etc.

`constants/permissions.ts` is the single source of truth mapping roles to
permissions:

```ts
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ['dashboard:read', 'store:read', 'store:write', /* ... */],
  ENTREPRENEUR: ['store:read', 'assessment:read', 'analytics:read'],
  // ...
}
```

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
`ROLE_PERMISSIONS` that should have it (explicit, not opt-out — a role not
listed for a permission does not have it).

---

## Route Protection

Route guarding is **client-side, layout-level** — there is no
`middleware.ts`. Two layouts do the gating:

- `app/(auth)/layout.tsx` — if already authenticated, redirect *away* from
  login/register to the role's default route.
- `app/(dashboard)/layout.tsx` — if not authenticated, redirect to login; if
  authenticated but the role can't access the current path
  (`canAccessRoute(role, pathname)`), redirect to the role's default route.

```tsx
const isAllowed = role ? canAccessRoute(role, pathname) : false

useEffect(() => {
  if (!hasHydrated) return
  if (!isAuthenticated) { router.replace(ROUTES.LOGIN); return }
  if (role && !isAllowed) { router.replace(getDefaultRouteForRole(role)) }
}, [...])

if (!hasHydrated) return <Loading className="min-h-screen" />
if (!isAuthenticated) return null
if (role && !isAllowed) return null
```

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

### `hasHydrated` gate

Every route guard must wait on `useHasHydrated()` before making a redirect
decision or rendering protected content. Zustand's `persist` middleware
rehydrates `user`/`isAuthenticated` from `localStorage` asynchronously — 
checking `isAuthenticated` before hydration finishes reads a false `false`
and redirects a logged-in user to login on every reload.

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

**Gap today:** no component in the codebase calls `can()` or `hasRole()` —
write and delete actions render for any role that can reach the page at all,
relying entirely on the backend to reject the request. When you add or touch
a write/delete action in a page reachable by more than one role, gate it:

```tsx
// ✓ Hide, don't just disable — a hidden control also means no dead click
const can = useAuthStore((s) => s.can);

{can('store:write') && <Button onClick={openCreateStore}>{STORE_TEXT.addStore}</Button>}
```

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
