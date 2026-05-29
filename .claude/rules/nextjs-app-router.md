# Next.js App Router Patterns

Rules for the App Router in this project. Default to Server Components —
add `'use client'` only when the reasons below apply.

---

## Server vs Client Component Decision Tree

```
Does the component need:
  - onClick, onChange, or any event handler?       → use client
  - useState or useReducer?                         → use client
  - useEffect?                                      → use client
  - browser APIs (window, localStorage)?            → use client
  - TanStack Query hooks?                           → use client
  - Zustand store?                                  → use client
  - Third-party client-only library?                → use client
  - None of the above?                              → Server Component (default)
```

---

## `'use client'` Boundary Placement

Push `'use client'` as far down the tree as possible. A Server Component can render
a Client Component, but not vice versa (without `children` prop pattern).

```tsx
// ✗ Making the whole page client-side for one interactive button
'use client'
export default function UsersPage() {
  return (
    <div>
      <UserList />      {/* could be server */}
      <CreateButton />  {/* only this needs client */}
    </div>
  )
}

// ✓ Page is Server Component, only the interactive part is client
// app/users/page.tsx — Server Component
export default function UsersPage() {
  return (
    <div>
      <UserList />       {/* Server Component */}
      <CreateButton />   {/* 'use client' inside create-button.tsx */}
    </div>
  )
}
```

---

## Page Files

Pages in `app/` are Server Components by default. Keep them thin — composition only.

```tsx
// app/users/page.tsx
import type { Metadata } from 'next'
import { UserList } from '@/features/user'

export const metadata: Metadata = {
  title: 'Users | Thai Rap',
}

export default function UsersPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      <UserList />
    </section>
  )
}
```

Rules:
- No data fetching logic in page files
- No business logic in page files
- Export `metadata` for SEO on every page
- Default export only — no named exports from page files

---

## Loading States

Create `loading.tsx` next to `page.tsx` for route-level Suspense fallback.

```tsx
// app/users/loading.tsx
import { Loading } from '@/components/shared/loading'

export default function UsersLoading() {
  return <Loading className="py-16" />
}
```

Use for: route transitions, initial page load skeleton.
Do NOT use as a substitute for `isLoading` state in Client Components that fetch data.

---

## Error Boundaries

Create `error.tsx` for route-level errors (SSR failures, unhandled Server Component errors).

```tsx
// app/users/error.tsx
'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function UsersError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="text-sm text-primary underline">
        Try again
      </button>
    </div>
  )
}
```

`error.tsx` must be `'use client'`. It does NOT replace `isError` handling inside
Client Components that use TanStack Query.

---

## Route Handlers

API routes live in `app/api/`. Use when you need a server-side endpoint.

```
app/api/
└── users/
    ├── route.ts          GET /api/users, POST /api/users
    └── [id]/
        └── route.ts      GET /api/users/:id, PATCH, DELETE
```

```ts
// app/api/users/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(_request: NextRequest) {
  // server-side data fetch
  return NextResponse.json(data)
}
```

This project uses an **external API** (`NEXT_PUBLIC_API_URL`). Route handlers are used
only when a server-side proxy or transformation is needed.

---

## Metadata API

Export `metadata` (static) or `generateMetadata` (dynamic) from every page.

```ts
// Static
export const metadata: Metadata = {
  title: 'Page Title | Thai Rap',
  description: 'Page description',
}

// Dynamic (based on params)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: `User ${params.id} | Thai Rap` }
}
```

---

## What NOT To Do

```tsx
// ✗ Fetching data with useEffect in a page
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => { fetch('/api/users').then(...) }, [])
}

// ✗ Adding 'use client' to layout.tsx
'use client'
export default function RootLayout(...) { ... }

// ✗ Missing metadata export
export default function Page() { return <div /> }
```
