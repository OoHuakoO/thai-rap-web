# thai-rap-web

Next.js 15 (App Router) frontend for the THAI-RAP restaurant incubation
programme. Client-rendered against `thai-rap-api` over `NEXT_PUBLIC_API_URL` —
no `middleware.ts`, no `app/api/`, no Server Component data fetching.

Thai-only UI. React 19, TypeScript strict, TanStack Query, Zustand (auth only),
Tailwind + shadcn/ui, RHF + Zod, Vitest, MSW.

## Read these before writing code

Two doc sets, deliberately split. **Open the relevant file — do not work from
this page alone; it is an index, not a summary.**

| Need | Open |
|---|---|
| How to write it here — naming, layering, patterns, checklists | `.claude/rules/README.md` (indexes 17 rule files) |
| What the app currently does — routes, permissions, endpoints, per-feature detail | `spec/README.md` (indexes 16 spec files) |
| How the API client, refresh, and error pipeline work | `services/README.md` (Thai) |

The split is load-bearing: a **rule** is normative and holds whether or not the
code obeys it; a **spec** is a snapshot the next commit can invalidate. So
inventories, counts, and known deviations live in `spec/`, never in a rule.
Keep this file free of them too — it is a router, and a third copy of the facts
is a third thing to go stale.

Typical entry points:

- Touching access control → `.claude/rules/auth-permissions.md` + `spec/03-access-control.md`
- Adding a route → `spec/02-routing.md` (three files must change together)
- Adding a feature folder → `.claude/rules/feature-structure.md`
- Any API call → `.claude/rules/error-handling-patterns.md` + `spec/04-data-layer.md`
- A specific domain → `spec/features/<domain>.md`

## Layout

```
app/          App Router — routes only, thin composition, no 'use client'
features/     one folder per domain; where nearly all code lives
components/   ui/ (shadcn) · shared/ (cross-feature) · layout/ (AppShell)
services/     axios instance, ApiError, error mapper — no domain code
stores/       Zustand — auth-store.ts only
constants/    routes, permissions, nav, HTTP status, app config
mocks/        MSW — off by default, hard-guarded in production
spec/         what the app does
```

## Commands

```bash
npm run dev          # port 3000
npm run type-check   # tsc --noEmit
npm run lint
npm run test         # vitest run
npm run format       # prettier --write .
```

Run `type-check`, `lint`, and `test` before calling a change done. Do not start
a dev server with `bash` — use the `web` target in `.claude/launch.json`
(`web-mocks` on 3100 runs with MSW on).

## Non-negotiables

- No `any`, no non-null assertion, no `@ts-ignore` — all ESLint errors here.
- Type-only imports use `import type`.
- Never hardcode a route, query key, colour, or endpoint — they all have a home.
- Never write `user.role === 'ADMIN'` — go through `can()` / `hasRole()` / `canRoute()`.
- Client-side permission checks are UX only; the API enforces the real thing.
- When a change makes a sentence in `spec/` or a rule false, fix it in the same
  PR.
