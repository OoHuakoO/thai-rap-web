# Error Status Pages

Rules for the dedicated HTTP-status error pages under `app/errors/` — the
pages the Axios interceptor (`services/api.ts`, see
[services/README.md](../../services/README.md)) redirects to on `403`,
`429`, `500`/`502`/`504`, and `503`. These are distinct from Next.js
`error.tsx` route boundaries (see [nextjs-app-router.md](nextjs-app-router.md))
— `error.tsx` catches unexpected render/SSR crashes, the pages here are
deliberate, known-status destinations the interceptor navigates to.

---

## One Shared Component

All status pages render `components/shared/error-page.tsx` — never build a
new layout per status code.

```tsx
// app/errors/403/page.tsx
import type { Metadata } from 'next'
import { ErrorPage } from '@/components/shared/error-page'
import { HTTP_STATUS } from '@/constants/http-status'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'ไม่มีสิทธิ์เข้าถึง',
}

export default function ForbiddenPage() {
  return (
    <ErrorPage
      code={HTTP_STATUS.FORBIDDEN}
      title="ไม่มีสิทธิ์เข้าถึง"
      message="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด"
      actions={[
        { label: 'กลับหน้าหลัก', href: ROUTES.HOME, variant: 'default' },
        { label: 'เข้าสู่ระบบอีกครั้ง', href: ROUTES.LOGIN, variant: 'outline' },
      ]}
    />
  )
}
```

`ErrorPage` itself (`components/shared/error-page.tsx`) is a Client
Component (`'use client'`) because `actions` can carry an `onClick`, but each
`app/errors/<code>/page.tsx` stays a Server Component — no `'use client'`
at the page level, only `metadata` + a call to `ErrorPage`.

---

## Adding a New Status Page

1. Create `app/errors/<code>/page.tsx`.
2. Export `metadata` with a Thai title — the page's own name only. The root
   layout's `title.template` appends the app name, per
   [nextjs-app-router.md](nextjs-app-router.md).
3. Render `<ErrorPage code={...} title={...} message={...} actions={...} />`,
   passing `code` from `HTTP_STATUS` rather than a numeric literal.
4. `title`/`message` are page-specific copy fixed to that status — per
   [text-constants.md](text-constants.md) this is UI copy, but because each
   status page has exactly one hardcoded, non-reused string (not shared
   across components), it stays inline here rather than in a constants file.
   If a second consumer ever needs the same copy, extract it then.
5. `actions` always use `ROUTES.*` from `constants/routes.ts` — never a raw
   path string, per [no-hardcode.md](no-hardcode.md).
6. Wire the new status in `services/api.ts`'s response interceptor `switch`
   if the interceptor should redirect there automatically.

---

## Standalone Page vs. Inside the Dashboard Shell

`ErrorPage` defaults to `min-h-screen`, which is right for the standalone
pages under `app/errors/` — they render under the root layout and own the
whole viewport.

A boundary that renders *inside* `app/(dashboard)/` does not.
`AppShell` is already `h-screen` with a `p-6` scroll area, so a full-viewport
child overflows it and produces a second scrollbar with the content pushed
off-centre. Those pass a shorter height:

```tsx
// app/(dashboard)/error.tsx, app/(dashboard)/not-found.tsx
<ErrorPage className="min-h-[60vh]" code={HTTP_STATUS.SERVER_ERROR} ... />
```

`app/(dashboard)/not-found.tsx` exists so `notFound()` thrown from a dashboard
route (an unknown assessment round, say) keeps the user inside the shell —
without it the root `app/not-found.tsx` renders with no navigation at all.

---

## What NOT to Do

```tsx
// ✗ min-h-screen inside the dashboard shell — overflows AppShell's scroll area
<ErrorPage code={HTTP_STATUS.SERVER_ERROR} ... />   // in app/(dashboard)/error.tsx

// ✗ New bespoke layout instead of reusing ErrorPage
export default function ForbiddenPage() {
  return <div className="flex flex-col items-center">...</div>
}

// ✗ Raw path string instead of ROUTES
actions={[{ label: 'กลับหน้าหลัก', href: '/' }]}

// ✗ 'use client' on the page itself — ErrorPage already handles interactivity
'use client'
export default function ForbiddenPage() { ... }
```

---

## Checklist

- [ ] Page renders `ErrorPage` from `components/shared/error-page.tsx` — no bespoke layout
- [ ] `metadata` exported with a Thai title, no `| Thai Rap` suffix
- [ ] Page itself has no `'use client'`
- [ ] `code` comes from `HTTP_STATUS`, not a numeric literal
- [ ] `className="min-h-[60vh]"` passed if it renders inside the dashboard shell
- [ ] `actions[].href` uses `ROUTES.*`, never a raw string
- [ ] Interceptor in `services/api.ts` updated if this status should auto-redirect
