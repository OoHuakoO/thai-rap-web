---
name: debug-tanstack-query
description: Systematic debugging workflow for TanStack Query issues. Covers stale data, missing cache invalidation, race conditions, infinite re-renders, and query key mismatches.
---

# Debug TanStack Query

Systematic steps for diagnosing TanStack Query problems in this project.

---

## Step 1: Open React Query Devtools

The app renders `<ReactQueryDevtools initialIsOpen={false} />` (in `providers.tsx`).
Open devtools (bottom-right corner) and inspect:
- Active queries and their keys
- Query status: `fresh`, `stale`, `fetching`, `paused`, `inactive`
- Cache contents
- Mutation history

Most issues are visible here before touching code.

---

## Problem: Data doesn't update after mutation

**Symptom**: Create/update/delete succeeds but the list still shows old data.

**Diagnosis**:
1. Check `onSuccess` in the mutation hook — is `invalidateQueries` called?
2. Check the `queryKey` passed to `invalidateQueries` matches the query key in `useQuery`
3. Query keys are case-sensitive and must match exactly

```ts
// ✗ Key mismatch — mutation invalidates 'Users' but query uses 'users'
useQuery({ queryKey: ['users'] })
useMutation({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Users'] }) })

// ✓ Use the exported key constants
useMutation({ onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }) })
```

4. Verify the query key constants in `features/<name>/hooks/use-<name>.ts`:
```ts
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
}
```

---

## Problem: Stale data shown on page load

**Symptom**: Page shows cached (stale) data, doesn't re-fetch.

**Diagnosis**:
1. Check `staleTime` — the global default is `60_000` (1 minute) in `providers.tsx`
2. Data within `staleTime` is considered fresh → no refetch
3. `refetchOnWindowFocus: false` is set globally → no refetch on tab switch

**Fix options**:
```ts
// Override for a specific query that needs fresher data
useQuery({
  queryKey: userKeys.all,
  queryFn: userService.getAll,
  staleTime: 0,  // always refetch
})

// Or force refetch manually
queryClient.invalidateQueries({ queryKey: userKeys.all })
```

---

## Problem: Infinite re-render / re-fetch loop

**Symptom**: Network tab shows the same request firing repeatedly.

**Diagnosis**:
1. Check if a new object/array reference is being created on every render and passed as a query key:
```ts
// ✗ New array reference every render → query re-fires
useQuery({ queryKey: [{ userId: id }] })

// ✓ Stable reference
useQuery({ queryKey: userKeys.detail(id) })
```

2. Check if `queryClient` from `useQueryClient()` is inside a `useEffect` dependency array

3. Check if an `onSuccess` callback is calling `setState` that triggers a re-render that fires the query again

---

## Problem: Detail query fires before ID is available

**Symptom**: 404 or invalid request with `undefined` in the URL.

**Diagnosis**: Missing `enabled` guard.

```ts
// ✗ Fires with id=undefined on first render
useQuery({
  queryKey: userKeys.detail(id),
  queryFn: () => userService.getById(id),
})

// ✓ Waits until id is truthy
useQuery({
  queryKey: userKeys.detail(id),
  queryFn: () => userService.getById(id),
  enabled: !!id,
})
```

---

## Problem: Mutation error not showing in UI

**Symptom**: Network shows 4xx/5xx but no error message rendered.

**Diagnosis**:
1. Check component renders `isError` and calls `extractErrorMessage(error)`
2. Check mutation has `onError` or component reads `isError` from `useMutation` return
3. Check `retry: 1` (global) — error only surfaces after 2 failed attempts

```ts
// Component must read isError from mutation
const { mutate, isPending, isError, error } = useCreateUser()

// Render error
{isError && <p className="text-destructive">{extractErrorMessage(error)}</p>}
```

---

## Problem: Query data is `undefined` after successful fetch

**Symptom**: `data` is `undefined` even though network request succeeded.

**Diagnosis**:
1. Check service returns `res.data`, not the full Axios response:
```ts
// ✗ Returns AxiosResponse, not the payload
getAll: () => api.get<User[]>('/users')

// ✓ Returns the payload
getAll: () => api.get<User[]>('/users').then((res) => res.data)
```

2. Check the API response shape matches the generic type passed to `api.get<T>()`

---

## Quick Reference — Query Status

| Status | Meaning |
|---|---|
| `fresh` | Data within `staleTime` — no refetch |
| `stale` | Past `staleTime` — will refetch on next mount/focus |
| `fetching` | Request in-flight |
| `paused` | Offline or `enabled: false` |
| `inactive` | No component consuming this query |
| `error` | Last fetch failed after all retries |
