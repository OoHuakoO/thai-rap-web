# TypeScript Advanced Patterns

Patterns beyond the basics in `frontend-rules.md`. Apply these when the situation calls
for them — do not over-engineer simple cases.

---

## `import type` is Mandatory

All type-only imports must use `import type`. Enforced by ESLint.

```ts
import type { User, CreateUserDto } from '@/features/user/types/user.types'
import type { ApiError } from '@/types/api.types'
```

---

## Discriminated Unions for State

Model loading/error/success states as discriminated unions instead of multiple booleans.

```ts
// ✗ Multiple booleans get out of sync
interface State {
  isLoading: boolean
  isError: boolean
  data: User | null
  error: Error | null
}

// ✓ Discriminated union — exactly one state at a time
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
```

---

## Type Guards

Use type predicates to narrow `unknown` or union types.

```ts
import type { ApiError } from '@/types/api.types'
import type { AxiosError } from 'axios'

function isAxiosError(error: unknown): error is AxiosError<ApiError> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}
```

---

## `as const` for Literal Inference

Use `as const` on arrays and objects that should not be widened to `string`, `number`, etc.

```ts
// ✗ Type inferred as string[]
const ROLES = ['admin', 'user']

// ✓ Type inferred as readonly ['admin', 'user']
const ROLES = ['admin', 'user'] as const
type Role = typeof ROLES[number] // 'admin' | 'user'
```

Query key tuples already use `as const`:
```ts
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
}
```

---

## `satisfies` Operator

Use `satisfies` to validate a value against a type without widening it.

```ts
type Config = Record<string, { label: string; path: string }>

// ✓ Validates shape AND preserves literal types for autocomplete
const NAV_ITEMS = {
  home: { label: 'Home', path: '/' },
  users: { label: 'Users', path: '/users' },
} satisfies Config
```

---

## Generic Constraints

Constrain generics to the minimum needed shape.

```ts
// ✗ Unconstrained — can be anything
function getById<T>(items: T[], id: string): T | undefined

// ✓ Constrained — requires id field
function getById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id)
}
```

---

## Utility Types

Use built-in utility types instead of re-implementing them.

| Need | Use |
|---|---|
| All fields optional | `Partial<T>` |
| All fields required | `Required<T>` |
| Read-only fields | `Readonly<T>` |
| Pick subset of fields | `Pick<T, 'a' \| 'b'>` |
| Exclude fields | `Omit<T, 'id' \| 'createdAt'>` |
| Union to intersection | `Extract<T, U>` / `Exclude<T, U>` |
| Infer function return | `ReturnType<typeof fn>` |
| Infer Zod schema | `z.infer<typeof schema>` |

```ts
// UpdateDto = all User fields optional, except id/timestamps
export type UpdateUserDto = Partial<Pick<User, 'name' | 'email' | 'role'>>
```

---

## Avoid These

```ts
// ✗ Type assertion (as) hides real type errors
const user = response.data as User

// ✗ Non-null assertion (!) without certainty
const el = document.getElementById('root')!

// ✗ Enum — use union string types instead
enum Role { Admin = 'admin', User = 'user' }

// ✓ Union type — simpler, no runtime overhead
type Role = 'admin' | 'user'
```
