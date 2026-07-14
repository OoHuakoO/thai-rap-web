# Error Handling Patterns

Every async operation can fail. Handle errors consistently across the codebase.
Users must always know what went wrong and what they can do next.

---

## Three Layers of Error Handling

```
1. API Layer     → normalize error shape
2. Hook Layer    → expose error state
3. UI Layer      → display appropriate message
```

Never handle errors at only one layer and ignore the others.

---

## Layer 1: API Client (Axios Interceptor)

The Axios interceptor in `services/api.ts` is responsible for:

- Normalizing every error into `ApiError` via `mapToApiError()` (`services/error-mapper.ts`)
- Handling auth failures: refresh-and-retry once on 401, then logout + redirect to login if refresh fails
- Redirecting on account-of-app-state errors the component layer can't meaningfully recover from (403 → `/403`, 5xx → `/500`, 503 → `/503`)
- Showing a **global** toast for the two error classes with no per-component recovery (network error, 429 rate-limit) — see exception below
- Always rejecting with the normalized `ApiError` so the hook/UI layer still gets `isError`/`error` for anything not listed above

```ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = mapToApiError(error)

    if (apiError.isCancelled) return Promise.reject(apiError)

    if (apiError.isNetworkError) {
      toast.error(apiError.message, { id: 'network-error' })
      return Promise.reject(apiError)
    }

    // 401: refresh once and retry, else logout + redirect (skipped for login/register)
    // 403 / 5xx / 503: redirect to the matching error page
    // 429: toast with retry-after seconds
    // ...

    return Promise.reject(apiError)
  }
)
```

**Exception to "no UI feedback from the interceptor"**: network-error and rate-limit toasts are the interceptor's job, not the component's — both are cross-cutting failures with no component-specific recovery, and gating them behind every call site would mean duplicating the same toast in every hook. Every other status (400, 404, 409, 422, etc.) still rejects with `ApiError` untouched and must be handled inline at the Hook/UI layer per the table below — the interceptor does not show UI feedback for those.

---

## Layer 2: Service Layer

Services do not catch errors.
They let errors propagate to the hook layer.

```ts
// ✓ Let it propagate
export const userService = {
  getAll: () => api.get<User[]>('/users').then((res) => res.data),
}

// ✗ Swallowing errors silently
export const userService = {
  getAll: async () => {
    try {
      const res = await api.get<User[]>('/users')
      return res.data
    } catch {
      return []   // hiding the error — don't do this
    }
  },
}
```

---

## Layer 3: TanStack Query Hooks

TanStack Query captures errors automatically in `isError` and `error`.

```ts
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: userService.getAll,
    retry: 1,  // retry once on network failure, then surface the error
  })
}
```

For mutations, use `onError` for side effects (toast, logging):

```ts
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
    onError: (error) => {
      // toast or log here — not in the component
      console.error('Failed to create user:', error)
    },
  })
}
```

---

## Layer 4: UI Components

Every component consuming async data must handle all three states:

```tsx
export function UserList() {
  const { data: users, isLoading, isError, error } = useUsers()

  // 1. Loading state
  if (isLoading) return <Loading className="py-8" />

  // 2. Error state — always show a meaningful message
  if (isError) {
    return (
      <p className="py-8 text-center text-destructive">
        {extractErrorMessage(error)}
      </p>
    )
  }

  // 3. Empty state
  if (!users?.length) {
    return <p className="py-8 text-center text-muted-foreground">No users found.</p>
  }

  // 4. Data state
  return <div>...</div>
}
```

Never:

```tsx
// ✗ Assuming data exists
return <UserTable data={data} />

// ✗ No loading state
if (isError) return <p>Error</p>
return <UserTable data={data} />
```

---

## Extracting Error Messages

Server errors come in many shapes. Use a utility to normalize them.

Create `utils/extract-error-message.ts`:

```ts
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Axios error with server response
    const axiosError = error as AxiosError<ApiError>
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message
    }
    return error.message
  }
  return 'An unexpected error occurred'
}
```

Usage:

```tsx
if (isError) {
  return <p className="text-destructive">{extractErrorMessage(error)}</p>
}
```

---

## Form Errors

Forms have two types of errors:

| Type | Source | Where to show |
|------|--------|--------------|
| Validation error | Zod schema | Under the field |
| API error | Server response | Above submit button or toast |

### Validation errors (under each field)

```tsx
<div className="space-y-1">
  <label className="text-sm font-medium">Email</label>
  <Input {...register('email')} />
  {errors.email && (
    <p className="text-sm text-destructive">{errors.email.message}</p>
  )}
</div>
```

### API errors (shown after submit attempt)

```tsx
const { mutate, isPending, isError, error } = useCreateUser()

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    {isError && (
      <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        {extractErrorMessage(error)}
      </p>
    )}
    {/* fields */}
    <Button type="submit" disabled={isPending}>Submit</Button>
  </form>
)
```

---

## Error Boundaries

Use Next.js `error.tsx` files for route-level error boundaries.

```
app/
├── error.tsx          ← catches errors from any page
├── users/
│   ├── error.tsx      ← catches errors from /users/* only
│   └── page.tsx
```

```tsx
// app/error.tsx
'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="text-primary underline">
        Try again
      </button>
    </div>
  )
}
```

Use `error.tsx` for:
- Unexpected runtime errors
- Unhandled promise rejections in Server Components
- Network failures during SSR data fetching

Do NOT use `error.tsx` as a substitute for handling loading/error states in Client Components.

---

## When to Use Toast vs Inline Error

| Situation | Pattern |
|-----------|---------|
| Fetch error (query) | Inline — in the component next to the affected data |
| Mutation success | Toast — feedback without blocking the UI |
| Mutation error (recoverable) | Inline — above the form's submit button |
| Mutation error (unexpected) | Toast — for errors the user can't act on |
| Auth expiry | Redirect — interceptor handles this |
| Route-level crash | `error.tsx` boundary |

---

## What Not To Do

```tsx
// ✗ Swallowing errors silently
try {
  await userService.create(data)
} catch {
  // nothing
}

// ✗ Generic error message for all cases
<p>Error occurred</p>

// ✗ console.error in production components
console.error(error)

// ✗ Showing raw error objects
<p>{JSON.stringify(error)}</p>

// ✗ Assuming mutations always succeed
const { mutate } = useCreateUser()
mutate(data)
// no onError, no UI feedback
```

---

## Checklist

When implementing any async operation:

- [ ] Loading state shown
- [ ] Error state shown with readable message
- [ ] Empty state shown when data is absent
- [ ] Form API errors shown near the submit button
- [ ] Form validation errors shown under each field
- [ ] Mutation errors handled with `onError` or inline error state
- [ ] Error message extracted via `extractErrorMessage()` utility
- [ ] 401 handled globally via Axios interceptor
- [ ] `error.tsx` added for new route segments with SSR data
