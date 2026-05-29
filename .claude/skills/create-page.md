---
name: create-page
description: Create a new Next.js App Router page. Handles Server/Client component split, metadata, loading.tsx, error.tsx, and route registration. Follows project App Router rules.
---

# Create Page

Create a new route in `app/` following the App Router rules in `nextjs-app-router.md`.

## Before Starting

Determine:
1. Route path (e.g. `/users`, `/users/[id]`, `/settings/profile`)
2. What data is displayed
3. Which feature module owns this data (`@/features/<name>`)
4. Whether the page needs dynamic params

---

## Step 1: Create the Route Directory

```
app/
└── <route>/
    ├── page.tsx        ← required
    ├── loading.tsx     ← add if page fetches data
    └── error.tsx       ← add if page has SSR data or critical render paths
```

---

## Step 2: Write `page.tsx`

Server Component by default — no `'use client'`.

```tsx
// app/<route>/page.tsx
import type { Metadata } from 'next'
import { FeatureComponent } from '@/features/<name>'

export const metadata: Metadata = {
  title: '<Page Title> | Thai Rap',
  description: '<Short description>',
}

export default function <Name>Page() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold"><Page Title></h1>
      <FeatureComponent />
    </section>
  )
}
```

Rules:
- No `useState`, `useEffect`, event handlers → those belong in feature components
- No data fetching in the page file
- Must export `metadata` or `generateMetadata`
- Default export only

---

## Step 3: Write `loading.tsx`

Add when the page renders a Client Component that fetches data.

```tsx
// app/<route>/loading.tsx
import { Loading } from '@/components/shared/loading'

export default function <Name>Loading() {
  return <Loading className="py-16" />
}
```

---

## Step 4: Write `error.tsx`

Add when the page could fail at the route level (SSR errors, unhandled Server Component errors).

```tsx
// app/<route>/error.tsx
'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function <Name>Error({ error, reset }: ErrorProps) {
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

---

## Step 5: Add to Navigation (if needed)

Check `constants/routes.ts` — add the new route constant.
Check `components/layout/sidebar.tsx` — add nav item if this is a primary route.

---

## Checklist

- [ ] `page.tsx` is a Server Component (no `'use client'`)
- [ ] `metadata` or `generateMetadata` exported from page
- [ ] No business logic or data fetching in page file
- [ ] `loading.tsx` added if page renders data-fetching components
- [ ] `error.tsx` added if route needs error boundary
- [ ] Route constant added to `constants/routes.ts`
- [ ] Nav item added to sidebar if applicable
- [ ] TypeScript passes with zero errors
