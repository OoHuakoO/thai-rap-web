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

## Step 5: Register the Route

Check `constants/routes.ts` — add the new route constant.
Check `components/layout/sidebar.tsx` — add nav item if this is a primary route.

If this page lives under `app/(dashboard)/` — i.e. it requires
authentication — three files must be updated together per
[auth-permissions.md](../rules/auth-permissions.md)'s "Adding a new
protected route" section. Missing one leaves either a broken nav link or an
unguarded page:

1. `constants/routes.ts` — the `ROUTES` entry (done above).
2. `constants/permissions.ts` — add `{ path, requiredPermission }` to
   `ROUTE_PERMISSIONS`. This is what actually blocks access — a user can
   type the URL directly even if it's not in the nav.
3. `constants/nav-config.ts` — add a `NAV_ITEMS` entry with `allowedRoles`
   matching whichever roles have `requiredPermission` in `ROLE_PERMISSIONS`.
   This only controls whether the link is shown, not access.

A page under `app/(auth)/` (login, register) needs none of this — that
layout redirects *away* if already authenticated, it doesn't gate on
permissions.

---

## Checklist

- [ ] `page.tsx` is a Server Component (no `'use client'`)
- [ ] `metadata` or `generateMetadata` exported from page
- [ ] No business logic or data fetching in page file
- [ ] `loading.tsx` added if page renders data-fetching components
- [ ] `error.tsx` added if route needs error boundary
- [ ] Route constant added to `constants/routes.ts`
- [ ] Nav item added to sidebar if applicable
- [ ] If under `app/(dashboard)/`: `ROUTE_PERMISSIONS` entry added in `constants/permissions.ts`
- [ ] If under `app/(dashboard)/`: `NAV_ITEMS` entry added in `constants/nav-config.ts` with correct `allowedRoles`
- [ ] TypeScript passes with zero errors
