# No Hardcoded Values

Never hardcode strings, numbers, or colors that have a named constant.
Always reference the constant. This is enforced in code review.

---

## Routes

Use `ROUTES` from `@/constants/routes.ts`. Never write path strings inline.

```ts
// ✗
router.push('/users')
<Link href="/users/123">

// ✓
import { ROUTES } from '@/constants'
router.push(ROUTES.USERS)
<Link href={ROUTES.USER_DETAIL(user.id)}>
```

Add new routes to `constants/routes.ts` before using them anywhere.

---

## Query Keys

Use the exported key objects from each feature's hooks file.
Never write raw string arrays inline.

```ts
// ✗
useQuery({ queryKey: ['users'] })
queryClient.invalidateQueries({ queryKey: ['users'] })

// ✓
import { userKeys } from '@/features/user/hooks/use-users'
useQuery({ queryKey: userKeys.all })
queryClient.invalidateQueries({ queryKey: userKeys.all })
```

---

## Colors

Use `colors` from `@/styles/tokens` for JS contexts (Recharts, dynamic styles).
Use Tailwind classes for static JSX styles.

```tsx
// ✗
<Radar stroke="#F97316" />
<div style={{ color: '#10B981' }} />

// ✓
import { colors } from '@/styles/tokens'
<Radar stroke={colors.orange} />
<div className="text-score-green" />
```

---

## Magic Numbers

Named constants for any number used more than once or without obvious meaning.
Place in `constants/index.ts` or close to the feature that owns them.

```ts
// ✗
useQuery({ staleTime: 60000 })
const pages = Math.ceil(total / 10)
setTimeout(callback, 5000)

// ✓
const STALE_TIME_MS = 60_000
const DEFAULT_PAGE_SIZE = 10
const TOAST_DURATION_MS = 5_000

useQuery({ staleTime: STALE_TIME_MS })
const pages = Math.ceil(total / DEFAULT_PAGE_SIZE)
setTimeout(callback, TOAST_DURATION_MS)
```

---

## API Endpoint Paths

Endpoint strings live only inside service files. Never repeat them in components,
hooks, or pages.

```ts
// ✗ — repeated in two places, breaks when endpoint changes
// hook:
queryFn: () => api.get('/users').then(r => r.data)
// component:
await api.post('/users', data)

// ✓ — single source of truth in service
export const userService = {
  getAll: () => api.get<User[]>('/users').then(r => r.data),
  create: (data: CreateUserDto) => api.post<User>('/users', data).then(r => r.data),
}
```

---

## Environment Variables

Never access `process.env` directly in components, hooks, or services.
Read from `constants/index.ts` which provides fallbacks and a single access point.

```ts
// ✗
const url = process.env.NEXT_PUBLIC_API_URL

// ✓
import { API_URL } from '@/constants'
const url = API_URL
```

---

## Exemptions

These are allowed to be inline:

- Tailwind class strings — `className="bg-orange p-4 rounded-lg"`
- Single-use local variables that are self-documenting — `const maxRetries = 3`
- Test data in test files — fixtures are the exception, not production code
