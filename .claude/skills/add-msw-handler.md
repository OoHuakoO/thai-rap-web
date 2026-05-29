---
name: add-msw-handler
description: Add MSW mock handler for a new domain. Creates fixture, factory, handler file, and registers it. Follows the established pattern in mocks/handlers/user.handlers.ts.
---

# Add MSW Handler

Add mock support for a new domain following the project's established pattern.

## Before Starting

Read these files to understand the existing pattern:
- `mocks/fixtures/user.fixtures.ts`
- `mocks/factories/user.factory.ts`
- `mocks/handlers/user.handlers.ts`
- `mocks/handlers/index.ts`

Identify:
1. Domain name (e.g. `product`, `auth`, `order`)
2. Entity type and its fields
3. API endpoints needed

---

## Step 1: Create Fixture

`mocks/fixtures/<domain>.fixtures.ts`

- Seed array with 3–5 realistic entries matching the domain
- Export `<domain>Db` object with: `reset`, `getAll`, `findById`, `create`, `update`, `remove`
- `let store` is mutable — mutations persist for the browser session
- `reset()` restores the seed (used in tests)

---

## Step 2: Create Factory

`mocks/factories/<domain>.factory.ts`

- Export `create<Entity>(overrides?)` — generates one entity with realistic defaults
- Export `create<Entity>FromDto(dto)` — builds entity from a CreateDto
- Use a module-level `idCounter` starting above the seed IDs to avoid collisions

---

## Step 3: Create Handler File

`mocks/handlers/<domain>.handlers.ts`

Copy the error helper functions from `user.handlers.ts` (or import from a shared file if one is created later):
```ts
function getScenario(request: Request): string { ... }
function unauthorized(): Response { ... }
function forbidden(): Response { ... }
function serverError(): Response { ... }
function notFound(entity?: string): Response { ... }
```

Implement handlers for all needed endpoints.
Every handler must check scenario before doing anything else.
`GET` list: support filtering via query params, optional pagination.
`POST`: validate required fields, return 422 with field errors on failure.
`PATCH`: return 404 if entity not found.
`DELETE`: return 204 on success, 404 if not found.

Export `const <domain>Handlers = [...]`

---

## Step 4: Register in Index

`mocks/handlers/index.ts`

```ts
import { userHandlers } from './user.handlers'
import { <domain>Handlers } from './<domain>.handlers'

export const handlers = [...userHandlers, ...<domain>Handlers]
```

---

## Step 5: Verify

Run `npx tsc --noEmit` — zero errors required.

Check in browser devtools Network tab that requests to the new endpoint
return mock data when `NEXT_PUBLIC_ENABLE_MOCKS=true`.

---

## Checklist

- [ ] Fixture created with seed data and `<domain>Db` object
- [ ] Factory creates entity with realistic defaults
- [ ] Handler supports GET list (with optional filtering)
- [ ] Handler supports GET by ID (404 if not found)
- [ ] Handler supports POST (validation error + success)
- [ ] Handler supports PATCH (404 if not found)
- [ ] Handler supports DELETE (204 success, 404 if not found)
- [ ] All 4 error scenarios wired via `X-Mock-Scenario` header
- [ ] Handlers registered in `mocks/handlers/index.ts`
- [ ] TypeScript passes with zero errors
- [ ] No mock imports inside feature code
