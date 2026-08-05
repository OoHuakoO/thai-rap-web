# Feature: User

`features/user/` — ผู้ใช้งานและสิทธิ์. The SUPER_ADMIN's account console: approve
sign-ups, reject them, and decide which stores a user is attached to.

## Route

`/users` — `UserPageHeader` + `UserList`.

Access is the narrowest in the app: `users:read` **and**
`allowedRoles: [SUPER_ADMIN]`. `users:*` also sits in
`SUPER_ADMIN_ONLY_PERMISSIONS`, which `hasPermission()` re-checks independently
of `ROLE_PERMISSIONS` — so even a bad edit to that table cannot hand account
management to anyone else.

This is the **only** user-administration page. `/users/permissions` was deleted;
the permission matrix is code, not data, and gets no runtime editor.

## What the page can and cannot do

| Action | Available | Why |
|---|---|---|
| Approve a `PENDING` sign-up | ✓ | The account exists but cannot log in until approved |
| Reject a `PENDING` sign-up | ✓ | Deletes the row (see below) |
| Assign stores | ✓ | Assigned (assessor/mentor) or owned (entrepreneur) |
| Create a user | ✗ | No `POST /users` in the API; the form exists but is unreachable |
| Change a role | ✗ | A user keeps the role it registered with |
| Suspend an account | ✗ | Deliberately absent, though the API exposes the endpoint |
| Act on a SUPER_ADMIN row | ✗ | The API rejects it, and an account that can lock itself out has no way back |

**Rejecting deletes rather than suspends.** A `PENDING` account has never logged
in, owns nothing and has scored nothing, so there is no history to keep
attributable — and leaving the row behind would hold its email hostage against a
second, genuine registration. `userService.remove` is called for this one case
only.

## Endpoints

| Method | Path | Service method | Used |
|---|---|---|---|
| GET | `/users?role&status&search&page&limit` | `getAll` | ✓ |
| GET | `/users/stats` | `getStats` | ✓ |
| GET | `/users/:id` | `getById` | ✓ (`useUser`, no page yet) |
| PATCH | `/users/:id/approve` | `approve` | ✓ |
| DELETE | `/users/:id` | `remove` | ✓ — reject only |
| PATCH | `/users/:id/assigned-stores` | `assignStores` | ✓ |
| PATCH | `/users/:id/owned-stores` | `assignOwnedStores` | ✓ |
| POST | `/users` | `create` | ✗ — **no endpoint behind it** |

`AssignStoresDto` is `{ storeIds: string[] }` and is the **complete** list: an
omitted store is revoked, `[]` clears every one. It is not an add operation.

## The two assignment modes

`ASSIGN_MODE_BY_ROLE` in `user-row-actions.tsx` decides which button a row
offers, matching the API:

| Role | Mode | Endpoint | Resolves the scope |
|---|---|---|---|
| `ASSESSOR` | `assessor` | `/assigned-stores` | `ASSIGNED` — the stores it may score |
| `MENTOR` | `mentor` | `/assigned-stores` | `ASSIGNED` — the stores it may read |
| `ENTREPRENEUR` | `owner` | `/owned-stores` | `OWN` — the stores it owns |
| any other | — | — | No button, rather than one that 400s |

`useAssignOwnedStores` invalidates `storeKeys.all` as well as `userKeys.all` —
ownership is what an entrepreneur's store list resolves against, so the store
cache goes stale the moment it lands.

## Components

| Component | Notes |
|---|---|
| `UserList` | Search + role filter + status filter + `DataTable<User>` + `PaginationBar`. Every filter change resets the page to 1 |
| `UserRowActions` | Approve / reject / assign, each gated on `can(USERS_WRITE)` or `can(USERS_DELETE)`, each behind `useConfirm` |
| `AssignStoresDialog` | Multi-select over the store list, submits the full `storeIds` array |
| `UserPageHeader` | Stats + the note that `CreateUserForm` is unreachable |
| `CreateUserForm` | Built, tested, **not routed** — waiting on `POST /users` |

Status rendering: `USER_STATUS_LABELS` for the Thai text, `STATUS_VARIANT`
(local to `user-list.tsx`) mapping `ACTIVE | PENDING | SUSPENDED` to
`StatusBadge`'s `active | pending | inactive`.

## Types

```ts
interface User {
  id; name; email; role: Role; status: UserStatus;
  assignedStores: UserStoreLink[];   // embedded, so a row labels itself without a second fetch
  ownedStores: UserStoreLink[];
  assignedStoreIds: string[];
  ownedStoreIds: string[];
  lastLogin: string | null;
  createdAt; updatedAt;
}
```

`phone` and `organization` are deliberately absent — the Prisma `User` model has
no such columns, so every row would render them `undefined`. They survive only
on `CreateUserDto`, which has no live endpoint.

`UserStatus` is `ACTIVE | PENDING | SUSPENDED`; the UI only ever moves an
account out of `PENDING`.

## Registration → approval

```
/register  → POST /auth/register  → account created as PENDING (no tokens)
/login     → 403 AUTH_006 "รออนุมัติ", shown inline on the form
/users     → SUPER_ADMIN approves  → status ACTIVE
           → SUPER_ADMIN assigns stores if the role needs a scope
```

Roles are chosen at registration from `REGISTERABLE_ROLES` (everything except
ADMIN and SUPER_ADMIN) and are fixed thereafter.

## Tests

`user-row-actions`, `mocks/handlers/user.handlers.test.ts`.

## Gaps

- **`POST /users` does not exist.** `CreateUserForm`, `useCreateUser`,
  `userService.create` and `CreateUserDto` are all built and all unreachable.
  Route the form when the endpoint ships — and drop `phone`/`organization`
  unless the API model gains them.
- `/users/[id]` is in `ROUTES` and `useUser` exists, but there is no detail
  page.
- No audit trail of who approved whom.
