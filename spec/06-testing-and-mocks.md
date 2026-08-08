# Testing & Mocks

## Test setup

| Piece | Value |
|---|---|
| Runner | Vitest 4, `environment: 'jsdom'`, `globals: true` |
| Config | `vitest.config.ts` — `@vitejs/plugin-react`, `@` alias → repo root |
| Setup | `vitest.setup.ts` |
| Library | `@testing-library/react` + `user-event` + `jest-dom` |
| Commands | `npm run test` (once), `npm run test:watch` |

`vitest.setup.ts` imports `@testing-library/jest-dom/vitest` and stubs four
`Element` methods jsdom does not implement — `hasPointerCapture`,
`setPointerCapture`, `releasePointerCapture`, `scrollIntoView`. Radix's `Select`
calls into the Pointer Capture API on every pointer event, so without those
stubs any test that opens a select dies. Anything else Radix needs goes here
too, not into individual tests.

Tests are excluded from `tsconfig.json`'s `include`, so `npm run type-check`
does not cover them; Vitest type-checks them at run time via esbuild.

## What is tested

56 test files, concentrated where a mistake is expensive and cheap to catch:

| Area | Files | Example |
|---|---|---|
| Access control | 2 | `constants/permissions.test.ts`, `constants/nav-config.test.ts` — the matrices and the redirect-loop guarantees |
| API client | 3 | `services/__tests__/api.test.ts` (refresh, retry, redirects), `api-error.test.ts`, `extract-error-message.test.ts` |
| Pure domain utils | 12 | scoring (`dimension-score`, `overall-summary`, `zone`, `round`, `status`), analytics formatting, dashboard formatting |
| Services | 6 | assessment, auth, dashboard, news, pitching, report — URL, params, response shaping |
| Hooks | 5 | `use-assessment`, `use-login`, `use-logout`, `use-register`, `use-top20` |
| Components | 23 | forms, list/table rendering, empty and error states, permission-driven rendering |
| MSW handlers | 7 | role-aware handlers are logic, so they get their own tests |

Rules of thumb from `.claude/rules/testing.md`:

- Test behaviour a user or caller can observe, not implementation detail.
- A pure function gets a unit test; a component gets a render test with queries
  by role/text, not by class name.
- Every component test must cover the loading, error, and empty branches — those
  are the branches that ship broken.
- Handler tests exist because role scoping in mocks is real logic; fixture data
  alone needs no test.

## MSW mock layer

Mocks let the whole app run with no backend — useful for design work, for
demoing a flow the API has not shipped, and for exercising error paths.

```
mocks/
├── index.ts                 initMocks() — the only entry point
├── browser.ts               setupWorker(...handlers)
├── handlers/
│   ├── index.ts             merges every domain's handlers
│   └── <domain>.handlers.ts one file per domain (12 today)
├── factories/               createXxx() / createXxxFromDto()
├── fixtures/                in-memory stateful stores
└── utils/scenario.ts        shared X-Mock-Scenario helpers
```

Domains covered: `auth`, `dashboard`, `news`, `report`, `user`, `store`,
`assessment`, `analytics`, `province`, `store-type`, `upload`.

### Turning them on

```bash
NEXT_PUBLIC_ENABLE_MOCKS=true npm run dev
```

or the `web-mocks` target in `.claude/launch.json` (port 3100).

Three guards in `mocks/index.ts`, all required:

1. `typeof window === 'undefined'` → return (service workers are browser-only).
2. `NODE_ENV === 'production'` → return, **regardless of the env var**.
3. `NEXT_PUBLIC_ENABLE_MOCKS !== 'true'` → return.

MSW is behind a dynamic `import('./browser')`, so it never enters the production
bundle. `onUnhandledRequest: 'bypass'` — anything without a handler goes to the
real API.

`MockProvider` renders `null` until the worker has started, so no request can
escape before interception is live. When mocks are **off** it also unregisters
any surviving service worker — one left behind by an earlier mocks-on session
keeps serving its own stale data and looks exactly like real data going missing
on reload.

> Note: `preview_start` cannot turn mocks on for the in-app browser. Verify
> API-dependent flows with Vitest instead of the preview.

### Adding a domain

Same four steps every time (`.claude/rules/msw-patterns.md`):

1. `fixtures/<domain>.fixtures.ts` — an in-memory `db` object with
   `reset/getAll/findById/create/update/remove`, seeded from a const array.
2. `factories/<domain>.factory.ts` — `createX(overrides)` and
   `createXFromDto(dto)`. Handlers never inline a literal object.
3. `handlers/<domain>.handlers.ts` — one file, one domain.
4. Register it in `handlers/index.ts`.

### Error scenarios

Every handler reads the `X-Mock-Scenario` request header via
`getScenario(request)` and can return a canned failure built by
`mocks/utils/scenario.ts`:

| Scenario | Status | Code |
|---|---|---|
| `unauthorized` | 401 | `AUTH_003` |
| `forbidden` | 403 | `PERM_001` |
| `server-error` | 500 | `SYS_001` |
| `validation-error` | 422 | `VALID_002` (+ field `details`) |
| `notFound(code, message)` | 404 | caller-supplied |

```ts
api.get('/stores', { headers: { 'X-Mock-Scenario': 'server-error' } });
```

Domain-specific failures (a wrong-password message, a pending-approval 403)
stay in their own handler file — only the generic shapes are shared.

### Role-aware handlers

Where the real endpoint narrows its answer by role, the handler must too —
otherwise mock mode shows a page the API would never serve. The caller is
derived from the mock bearer token (`getMockUserId`, which parses
`Bearer mock-access-<userId>`), never from a body field or a client-set header.

`mocks/handlers/store.handlers.ts` is the reference implementation: it scopes
the list, 403s a record outside the caller's scope, gates `/stores/stats` on the
same roles the API does, and strips the payload for a `PUBLIC`-scoped role.

Three constraints:

- A request with **no** token stays unscoped — handler tests call endpoints
  without signing in, while every real app call carries one.
- Relationships (ownership, assignment) live on **one** fixture and are derived
  at request time. Copying a link into a second fixture guarantees they
  disagree.
- Role-aware behaviour requires a `<domain>.handlers.test.ts`.

### Response shape

Mocks return **flat** payloads — no `{ success, data }` envelope. The unwrapping
interceptor in `services/api.ts` only unwraps a body that has both keys, so
flat mock responses pass through untouched. Keep it that way; adding an envelope
to mocks would double-unwrap nothing and quietly change behaviour between modes.

Pagination follows the API: return a plain array when no `page`/`limit` param is
present, and a `PaginatedResponse<T>` when one is.

### Boundaries

- Never import from `mocks/` inside feature code — no service, hook, or
  component may reference it.
- Never set `NEXT_PUBLIC_ENABLE_MOCKS=true` in `.env.example`.
- Mock data is not a spec. When the API's real shape differs, the API wins and
  the fixture gets fixed.
