# MSW Mock Patterns

Rules for maintaining the MSW infrastructure in `mocks/`. Follow these when adding
handlers for new domains or extending existing ones.

---

## Directory Structure

```
mocks/
├── index.ts                    initMocks() — entry point
├── browser.ts                  MSW worker setup (browser only)
├── handlers/
│   ├── index.ts                merge all domain handlers
│   └── <domain>.handlers.ts   one file per domain
├── factories/
│   └── <domain>.factory.ts    createXxx() / createXxxFromDto()
└── fixtures/
    └── <domain>.fixtures.ts   in-memory db for stateful mocks
```

---

## Adding a New Domain

Follow this sequence every time:

### 1. Fixture — in-memory stateful store

```ts
// mocks/fixtures/product.fixtures.ts
import type { Product, UpdateProductDto } from '@/features/product/types/product.types'

const seed: Product[] = [
  { id: '1', name: 'Song A', price: 99, status: 'active', createdAt: '...', updatedAt: '...' },
]

let store: Product[] = [...seed]

export const productDb = {
  reset: () => { store = [...seed] },
  getAll: () => store,
  findById: (id: string) => store.find((p) => p.id === id) ?? null,
  create: (item: Product) => { store = [...store, item]; return item },
  update: (id: string, data: UpdateProductDto): Product | null => {
    const idx = store.findIndex((p) => p.id === id)
    if (idx === -1) return null
    const updated = { ...store[idx], ...data, updatedAt: new Date().toISOString() }
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)]
    return updated
  },
  remove: (id: string): boolean => {
    const prev = store.length
    store = store.filter((p) => p.id !== id)
    return store.length < prev
  },
}
```

### 2. Factory — generate realistic data

```ts
// mocks/factories/product.factory.ts
import type { Product, CreateProductDto } from '@/features/product/types/product.types'

let idCounter = 200

export function createProduct(overrides: Partial<Product> = {}): Product {
  const id = String(++idCounter)
  const now = new Date().toISOString()
  return { id, name: `Product ${id}`, price: 100, status: 'active', createdAt: now, updatedAt: now, ...overrides }
}

export function createProductFromDto(dto: CreateProductDto): Product {
  return createProduct({ name: dto.name, price: dto.price, status: dto.status })
}
```

### 3. Handlers — one file per domain

```ts
// mocks/handlers/product.handlers.ts
import { http, HttpResponse } from 'msw'
import { productDb } from '../fixtures/product.fixtures'
import { createProductFromDto } from '../factories/product.factory'
import type { Product, CreateProductDto } from '@/features/product/types/product.types'
import type { ApiError } from '@/types/api.types'

const BASE = '/products'

export const productHandlers = [
  http.get(BASE, ({ request }) => { ... }),
  http.get(`${BASE}/:id`, ({ request, params }) => { ... }),
  http.post(BASE, async ({ request }) => { ... }),
  http.patch(`${BASE}/:id`, async ({ request, params }) => { ... }),
  http.delete(`${BASE}/:id`, ({ request, params }) => { ... }),
]
```

### 4. Register in `mocks/handlers/index.ts`

```ts
import { userHandlers } from './user.handlers'
import { productHandlers } from './product.handlers'   // add here

export const handlers = [...userHandlers, ...productHandlers]
```

---

## Error Scenario Pattern

Every handler checks the `X-Mock-Scenario` request header.
This lets you test error paths without changing URLs or mock data.

```ts
function getScenario(request: Request): string {
  return request.headers.get('X-Mock-Scenario') ?? 'success'
}

// Inside handler:
const scenario = getScenario(request)
if (scenario === 'unauthorized') return unauthorized()
if (scenario === 'forbidden') return forbidden()
if (scenario === 'server-error') return serverError()
```

Supported scenarios: `unauthorized` (401), `forbidden` (403), `server-error` (500), `validation-error` (422).

Triggering from dev/tests:
```ts
// Axios request with scenario header
api.get('/products', { headers: { 'X-Mock-Scenario': 'server-error' } })
```

---

## Pagination Pattern

Return plain array when no pagination params — keeps existing hooks working.
Return `PaginatedResponse<T>` when `?page=` or `?limit=` present.

```ts
const hasPagination = url.searchParams.has('page') || url.searchParams.has('limit')
if (!hasPagination) {
  return HttpResponse.json<Product[]>(filtered)
}
const page = Number(url.searchParams.get('page') ?? 1)
const limit = Number(url.searchParams.get('limit') ?? 10)
// ... slice and return PaginatedResponse
```

---

## Environment Toggle

Mocks are active when `NEXT_PUBLIC_ENABLE_MOCKS=true` in `.env.local`.
Production is always off (hard `NODE_ENV` guard in `mocks/index.ts`).
Never set `NEXT_PUBLIC_ENABLE_MOCKS=true` in `.env.example` — keep it `false`.

---

## Rules

- One handler file per domain — never mix domains in one file
- Handlers use factories and fixtures — never hardcode mock objects inline
- All handlers support the 4 error scenarios via `X-Mock-Scenario`
- `onUnhandledRequest: 'bypass'` — unhandled requests go to real API
- Never import from `mocks/` inside feature code (services, hooks, components)
