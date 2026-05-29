# Naming Conventions

Consistent naming reduces cognitive load and prevents ambiguity.
Apply these rules without exception.

---

## File Naming

All files use `kebab-case`.

```
user-list.tsx
create-user-form.tsx
use-users.ts
user.service.ts
user.types.ts
auth-store.ts
```

Never use:

```
UserList.tsx         ✗
createUserForm.tsx   ✗
useUsers.ts          ✗
UserService.ts       ✗
```

---

## Folder Naming

All folders use `kebab-case`.

```
features/user/
features/auth/
features/product-catalog/
components/ui/
components/shared/
```

Never:

```
features/User/          ✗
features/productCatalog ✗
```

---

## Component Naming

Components are named in `PascalCase`.
The component name must match the file name.

```tsx
// file: user-list.tsx
export function UserList() { ... }

// file: create-user-form.tsx
export function CreateUserForm() { ... }
```

Prefix by role when helpful:

```
UserList         — list of users
UserCard         — single user item
UserForm         — form for user data
UserDetail       — detail view
```

Never abbreviate or use vague names:

```
Comp.tsx         ✗
UC.tsx           ✗
UserComp.tsx     ✗
```

---

## Hook Naming

All hooks start with `use`.
Use `camelCase` after the prefix.

```ts
useUsers()
useUser(id)
useCreateUser()
useDebounce()
useAuthStore()
```

Name by what the hook returns, not by implementation:

```ts
useUsers()        — returns user list
useUser(id)       — returns single user
useAuthStore()    — returns auth state
```

Never:

```ts
getUsersHook()   ✗
fetchUsers()     ✗
usersHook()      ✗
```

---

## Service Naming

Services are plain objects with camelCase methods.
Files use `.service.ts` suffix.

```ts
// file: user.service.ts
export const userService = {
  getAll: () => ...,
  getById: (id) => ...,
  create: (data) => ...,
  update: (id, data) => ...,
  remove: (id) => ...,
}
```

Method names follow REST semantics:

| Action | Method Name |
|--------|-------------|
| Read list | `getAll` |
| Read one | `getById` |
| Create | `create` |
| Update (partial) | `update` |
| Delete | `remove` |

Never name methods after HTTP verbs:

```ts
userService.get()    ✗
userService.post()   ✗
userService.patch()  ✗
```

---

## Type and Interface Naming

All types and interfaces use `PascalCase`.

Use these suffixes consistently:

| Purpose | Suffix | Example |
|---------|--------|---------|
| Domain model | none | `User`, `Product` |
| Create payload | `Dto` | `CreateUserDto` |
| Update payload | `Dto` | `UpdateUserDto` |
| Component props | `Props` | `UserCardProps` |
| API response shape | `Response` | `UsersResponse` |
| Store state | `State` | `AuthState` |

```ts
interface User { ... }
interface CreateUserDto { ... }
interface UpdateUserDto { ... }
interface UserCardProps { ... }
interface AuthState { ... }
```

Never use type aliases for object shapes when interfaces are appropriate:

```ts
type User = { id: string }    ✗  (use interface for objects)
type OnClick = () => void     ✓  (type alias fine for functions/unions)
```

---

## Zod Schema Naming

Schema variables use `camelCase` + `Schema` suffix.
Inferred types drop the suffix.

```ts
const createUserSchema = z.object({ ... })
type CreateUserFormValues = z.infer<typeof createUserSchema>
```

Never name schemas after components:

```ts
const CreateUserFormSchema  ✗
const SCHEMA                ✗
```

---

## Constant Naming

True constants (never change) use `UPPER_SNAKE_CASE`.
Structured constant objects use `UPPER_SNAKE_CASE` for the variable.

```ts
// constants/routes.ts
export const ROUTES = {
  HOME: '/',
  USERS: '/users',
} as const

// constants/index.ts
export const APP_NAME = 'My App'
export const API_TIMEOUT = 10_000
```

Never use `UPPER_SNAKE_CASE` for mutable values or query keys.

---

## Query Key Naming

Query keys live in the feature's hooks file.
Variable name is `camelCase` + `Keys` suffix.

```ts
// features/user/hooks/use-users.ts
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
}
```

Never hardcode query keys inline:

```ts
useQuery({ queryKey: ['users'] })          ✗
useQuery({ queryKey: userKeys.all })       ✓
```

---

## Store Naming

Zustand stores use `use` prefix and `Store` suffix.
File uses `camelCase` without the `use` prefix.

```ts
// file: stores/auth-store.ts
export const useAuthStore = create<AuthState>(...)

// file: stores/ui-store.ts
export const useUIStore = create<UIState>(...)
```

---

## Event Handler Naming

Props that accept handlers are prefixed with `on`.
Handler implementations are prefixed with `handle`.

```tsx
// prop definition
interface UserCardProps {
  onDelete: (id: string) => void
}

// implementation at call site
<UserCard onDelete={handleDelete} />

function handleDelete(id: string) { ... }
```

Never:

```tsx
onDelete={deleteUser}     ✗  (reads as the action, not the handler)
onDelete={onDelete}       ✗  (prop name leaked into implementation)
```

---

## Boolean Variable Naming

Booleans are prefixed with `is`, `has`, `can`, or `should`.

```ts
isLoading
isAuthenticated
hasPermission
canEdit
shouldRefetch
isPending
```

Never:

```ts
loading       ✗
authenticated ✗
permission    ✗
```

---

## Quick Reference

| Thing | Convention | Example |
|-------|-----------|---------|
| File | kebab-case | `user-list.tsx` |
| Folder | kebab-case | `features/user/` |
| Component | PascalCase | `UserList` |
| Hook | `use` + camelCase | `useUsers` |
| Service file | kebab + `.service.ts` | `user.service.ts` |
| Service variable | camelCase + `Service` | `userService` |
| Domain type | PascalCase | `User` |
| DTO type | PascalCase + `Dto` | `CreateUserDto` |
| Props type | PascalCase + `Props` | `UserCardProps` |
| Zod schema | camelCase + `Schema` | `createUserSchema` |
| Query keys | camelCase + `Keys` | `userKeys` |
| Store | `use` + PascalCase + `Store` | `useAuthStore` |
| Constant | UPPER_SNAKE_CASE | `API_TIMEOUT` |
| Boolean | `is`/`has`/`can` prefix | `isLoading` |
| Event prop | `on` prefix | `onDelete` |
| Event handler | `handle` prefix | `handleDelete` |
