# Architecture

## Top-level layout

```
thai-rap-web/
├── app/               Next.js App Router — routes only, thin composition
├── features/          One folder per domain; where nearly all code lives
├── components/
│   ├── ui/            shadcn/ui primitives (generated, lightly edited)
│   ├── shared/        Cross-feature composites, promoted from a feature
│   └── layout/        AppShell, Sidebar, TopHeader, ProjectBanner
├── services/          Axios instance, ApiError, error mapper (no domain code)
├── stores/            Zustand — auth-store.ts only
├── constants/         Routes, permissions, nav, HTTP status, app config
├── types/             Cross-cutting types: api, auth, ui
├── hooks/             Cross-cutting hooks — use-debounce.ts only
├── utils/             Pure helpers, one export per file
├── styles/            Design tokens + next/font declarations
├── mocks/             MSW worker, handlers, factories, fixtures
├── icon/, design/     Source art and the static design reference
└── spec/              This folder
```

## The layering rule

```
app/page.tsx  →  features/<domain>/components  →  hooks  →  services  →  services/api.ts
                                     ↓                 ↓
                             components/ui       types / schemas
                             components/shared
```

Read strictly downward:

- **Pages** compose. No data fetching, no business logic, no `'use client'`.
  Every page returns a single `<section className="space-y-4">`.
- **Components** call hooks, never services. The one sanctioned exception is a
  post-create upload loop (see below).
- **Hooks** own query keys, cache invalidation, and loading/error state.
- **Services** build requests and return typed data. They never catch errors
  and never import from `components/` or `hooks/`.
- **Schemas** (Zod) never import from `services/` — validation is independent
  of transport.

The documented service-from-component exception: `create-store-form.tsx` calls
`storeService.uploadLogo`/`uploadStorefrontPhoto` inside the create mutation's
`onSuccess`, looping over buffered files. It is an escape hatch for one-off,
non-cached side effects — a second caller means it becomes a hook. See
`.claude/rules/feature-structure.md`.

## Feature folder shape

```
features/<domain>/
├── components/     one component per file, kebab-case
├── constants/      *.constants.ts — Thai UI copy, option lists, display config
├── hooks/          use-<action>.ts, one hook per file; <domain>-keys.ts
├── schemas/        *.schema.ts — Zod + inferred form types
├── services/       <domain>.service.ts — API calls only
├── types/          <domain>.types.ts
├── utils/          pure helpers local to the domain (optional)
└── index.ts        barrel — the feature's only public surface
```

Not every domain has every folder. `province/` and `store-type/` are hooks +
service + types only; that is correct, not incomplete.

Two hook-key conventions coexist and both are fine:

- a dedicated `<domain>-keys.ts` (`dashboard`, `analytics`, `news`, `report`, `pitching`)
- keys exported from the hooks file itself (`store`, `user`, `assessment`)

What is not fine is an inline `queryKey: ['stores']` at a call site.

## The barrel contract

`features/<domain>/index.ts` exports **components, hooks, and types**. It never
exports a service or a raw constants object — that would let another feature
skip the hook layer and lose cache invalidation. A shared label map is exported
as a value alongside its type (`STORE_STATUS_LABELS`, `ROUND_LABELS`,
`USER_STATUS_LABELS`), which is the documented exception.

Cross-feature imports go through the barrel only:

```ts
// ✓
import { useStores, STORE_STATUS_LABELS } from '@/features/store';
// ✗ — internal structure is not a contract
import { useStores } from '@/features/store/hooks/use-stores';
```

Current cross-feature edges (all via barrels, all one-directional):

| From | To | Why |
|---|---|---|
| `assessment` | `store` | store name/status on the scoring page; `storeKeys` invalidation |
| `analytics` | `assessment`, `store` | reuses `RedFlag`/`Round`/`Zone`; store picker |
| `report` | `dashboard`, `store`, `pitching` | reuses `AssessmentRound`; store picker; the พิชชิ่ง scope |
| `pitching` | `store`, `province` | store picker on the form; province filter on the ranking |
| `user` | `store` | assigning stores invalidates `storeKeys` |
| `store` | `province`, `store-type` | filter dropdowns |
| `news` | `dashboard` | invalidates the activity feed, which renders the same items |
| `layout` | `auth` | `useLogout` in the header |

`dashboard` depends on nothing else, and `report`/`analytics` reuse
`AssessmentRound`/`Round` rather than redeclaring the union — note both names
exist for the same four values, one per feature.

No deep cross-feature imports remain. `features/dashboard/index.ts` exports
`dashboardKeys` and the `DownloadedFile` type for exactly this reason — a query
key another feature must invalidate is public surface, the same way `storeKeys`
is on `features/store`.

## Server vs Client components

`'use client'` sits as low as possible.

**Server Components** — every `app/**/page.tsx`. They export `metadata`, await
`params`, and render feature components. `app/(dashboard)/assessment/[storeId]/[round]/page.tsx`
is the only page with logic: it validates the round segment and calls
`notFound()`.

**Client Components** — the two route-group layouts (they read the auth store),
every feature component that fetches or handles input, `AppShell`'s children,
and `app/(dashboard)/error.tsx`.

`app/layout.tsx` stays a Server Component and mounts `<Providers>`, which is
where the client boundary actually begins.

## Provider tree

`app/providers.tsx`, outermost first:

```
MockProvider              renders null until MSW is ready (no-op when mocks off)
└── QueryClientProvider   staleTime 60s, retry 1, refetchOnWindowFocus false
    ├── AuthBootstrap     silent refresh on reload; renders null
    ├── ConfirmDialogProvider   useConfirm() for every destructive action
    ├── {children}
    ├── Toaster           sonner, top-right, richColors
    └── ReactQueryDevtools
```

`MockProvider` is outermost on purpose: no request may escape to the network
before the service worker is listening. It also unregisters a stale worker left
behind by an earlier mocks-on session, which otherwise keeps serving its own
in-memory data indefinitely.

## Where a piece of code belongs

| Kind of code | Home |
|---|---|
| Thai UI copy used by >1 component in a domain | `features/<d>/constants/<d>-text.constants.ts` |
| Thai copy fixed to exactly one page (e.g. an error page's title) | inline in that page |
| A pure function used by one domain | `features/<d>/utils/` |
| A pure function used by two or more domains | `utils/`, one export per file |
| A component used by one domain | `features/<d>/components/` |
| A component a **second real caller** now needs | `components/shared/` — never speculatively |
| A Radix/shadcn primitive | `components/ui/` via the shadcn generator |
| A route path | `constants/routes.ts` — never a literal string |
| An HTTP status number | `constants/http-status.ts` |

## Deliberate omissions

These are choices, not gaps:

- **No `middleware.ts`.** The API owns the httpOnly refresh cookie on another
  origin, so middleware could not read the session. Guarding is layout-level
  and client-side; the API re-checks every request.
- **No Server Component data fetching in `(dashboard)`.** The RSC payload is
  produced before the client guard runs, so fetching there would leak data past
  the guard.
- **No `app/api/`.** The external API is the only backend.
- **No dark mode.** `darkMode: ['class']` and `next-themes` are installed, but
  nothing toggles the class; the palette is light-only.
