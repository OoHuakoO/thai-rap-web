# Implement Feature Agent

You are a Senior Frontend Engineer implementing a new feature module.

Your job is to produce a complete, production-ready feature that is consistent
with the existing project architecture and all project rules.

Never invent new patterns. Always follow existing ones.

---

## Project Architecture Reference

This project uses a feature-based architecture under `features/`.

Each feature is a self-contained module:

```
features/<feature-name>/
├── components/          UI components for this feature
├── constants/           *.constants.ts — labels, options, form text (see text-constants.md)
├── hooks/                TanStack Query hooks
├── schemas/              *.schema.ts — Zod schemas + inferred form types
├── services/             API calls (uses shared @/services/api)
├── types/                TypeScript types, domain models, DTOs
└── index.ts              Public barrel export
```

Not every feature needs every folder — see
[feature-structure.md](../rules/feature-structure.md). Only create the
layers this feature actually needs.

Shared infrastructure:

```
services/api.ts          Axios instance with auth interceptors
components/ui/           Shadcn UI primitives
components/shared/       App-level shared components
stores/                  Zustand stores (UI state only)
hooks/                   Generic shared hooks
types/                   Shared API types
utils/cn.ts              Tailwind class merge utility
constants/               App-wide constants
```

Path alias: `@/*` maps to project root.

---

## Step 1: Understand the Feature

Before writing any code, determine:

1. What is the feature name? (e.g. `product`, `order`, `auth`)
2. What entities are involved?
3. What CRUD operations are needed?
4. What UI components are required?
5. What API endpoints will be called?

If any of these are unclear, ask before proceeding.

---

## Step 2: Define Types First

Create `features/<name>/types/<name>.types.ts`.

Define:

- Domain interface (the entity itself)
- Create DTO
- Update DTO
- Any query/filter parameters

```ts
// features/product/types/product.types.ts

export interface Product {
  id: string
  name: string
  price: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateProductDto {
  name: string
  price: number
  status: 'active' | 'inactive'
}

export type UpdateProductDto = Partial<CreateProductDto>
```

Rules:
- Use interfaces for object shapes
- Use `Dto` suffix for create/update payloads
- Domain model has no suffix
- Keep types specific to this feature here
- Shared API types (pagination, error) come from `@/types`

---

## Step 3: Create the Service

Create `features/<name>/services/<name>.service.ts`.

Import the shared Axios instance from `@/services/api`.

```ts
// features/product/services/product.service.ts

import api from '@/services/api'
import type { Product, CreateProductDto, UpdateProductDto } from '../types/product.types'

export const productService = {
  getAll: () =>
    api.get<Product[]>('/products').then((res) => res.data),

  getById: (id: string) =>
    api.get<Product>(`/products/${id}`).then((res) => res.data),

  create: (data: CreateProductDto) =>
    api.post<Product>('/products', data).then((res) => res.data),

  update: (id: string, data: UpdateProductDto) =>
    api.patch<Product>(`/products/${id}`, data).then((res) => res.data),

  remove: (id: string) =>
    api.delete(`/products/${id}`),
}
```

Rules:
- Only include methods that are actually needed
- Each method returns only `res.data` — never the full response
- Import types relatively (`../types/...`)
- No error handling here — handled at hook layer

---

## Step 4: Create Query Hooks

Create `features/<name>/hooks/use-<name>.ts`.

Define query keys at the top of the file.
Create one hook per operation.

```ts
// features/product/hooks/use-products.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productService } from '../services/product.service'
import type { CreateProductDto, UpdateProductDto } from '../types/product.types'

export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', id] as const,
}

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: productService.getAll,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductDto) => productService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProductDto) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}
```

Rules:
- Query keys must be exported and centralized in this file
- Always use `enabled: !!id` for detail queries
- Always invalidate affected queries after mutation
- Create separate hooks per operation — do not combine
- Only create hooks for operations that are actually needed

---

## Step 5: Create the Form Schema

If the feature includes a form, create `features/<name>/schemas/<name>.schema.ts`
per [feature-structure.md](../rules/feature-structure.md) — schemas get their
own folder, they don't live in `types/` or inline in the component.

Validation messages come from `<SCOPE>_VALIDATION_MESSAGES` in the feature's
`constants/<name>-form.constants.ts`, never inline strings — per
[text-constants.md](../rules/text-constants.md).

```ts
// features/product/constants/product-form.constants.ts
export const PRODUCT_VALIDATION_MESSAGES = {
  nameRequired: 'กรุณากรอกชื่อสินค้า',
  pricePositive: 'ราคาต้องมากกว่า 0',
} as const
```

```ts
// features/product/schemas/product.schema.ts
import { z } from 'zod'
import { PRODUCT_VALIDATION_MESSAGES } from '../constants/product-form.constants'

export const createProductSchema = z.object({
  name: z.string().min(1, PRODUCT_VALIDATION_MESSAGES.nameRequired),
  price: z.number().positive(PRODUCT_VALIDATION_MESSAGES.pricePositive),
  status: z.enum(['active', 'inactive']),
})

export type CreateProductFormValues = z.infer<typeof createProductSchema>
```

---

## Step 6: Create UI Components

Create each component as a `'use client'` file in `features/<name>/components/`.

All user-facing copy comes from the feature's `constants/<name>-text.constants.ts`
per [text-constants.md](../rules/text-constants.md) — never a raw string in
JSX. Error messages from failed queries/mutations always go through
`extractErrorMessage()` (`@/utils/extract-error-message`), never
`error.message` or `error instanceof Error` directly — per
[error-handling-patterns.md](../rules/error-handling-patterns.md).

```ts
// features/product/constants/product.constants.ts
export const PRODUCT_TEXT = {
  namePlaceholder: 'ชื่อสินค้า',
  nameLabel: 'ชื่อสินค้า',
  emptyList: 'ไม่พบสินค้า',
  createButton: 'เพิ่มสินค้า',
  creating: 'กำลังเพิ่ม...',
} as const
```

### List Component Pattern

```tsx
// features/product/components/product-list.tsx
'use client'

import { Loading } from '@/components/shared/loading'
import { Card, CardContent } from '@/components/ui/card'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { useProducts } from '../hooks/use-products'
import { PRODUCT_TEXT } from '../constants/product.constants'

export function ProductList() {
  const { data: products, isLoading, isError, error } = useProducts()

  if (isLoading) return <Loading className="py-8" />

  if (isError) {
    return (
      <p className="py-8 text-center text-destructive">
        {extractErrorMessage(error)}
      </p>
    )
  }

  if (!products?.length) {
    return <p className="py-8 text-center text-muted-foreground">{PRODUCT_TEXT.emptyList}</p>
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <Card key={product.id}>
          <CardContent className="pt-4">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">${product.price}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Form Component Pattern

```tsx
// features/product/components/create-product-form.tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { useCreateProduct } from '../hooks/use-products'
import { createProductSchema, type CreateProductFormValues } from '../schemas/product.schema'
import { PRODUCT_TEXT } from '../constants/product.constants'

export function CreateProductForm() {
  const { mutate: createProduct, isPending, isError, error } = useCreateProduct()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
  })

  const onSubmit = (data: CreateProductFormValues) => {
    createProduct(data, { onSuccess: () => reset() })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {extractErrorMessage(error)}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="name">{PRODUCT_TEXT.nameLabel}</Label>
        <Input id="name" {...register('name')} placeholder={PRODUCT_TEXT.namePlaceholder} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? PRODUCT_TEXT.creating : PRODUCT_TEXT.createButton}
      </Button>
    </form>
  )
}
```

Component rules:
- All feature components are `'use client'`
- Always handle: loading, error, empty states
- No raw Thai/English string literals in JSX — read from `<SCOPE>_TEXT` constants
- Query/mutation errors always render via `extractErrorMessage(error)`, never `error.message` directly
- Use `@/components/ui/*` for primitives
- Use `@/components/shared/loading` for loading states
- Import hooks, schemas, constants, and types relatively

---

## Step 7: Create the Barrel Export

Create `features/<name>/index.ts`.

Export only what consumers outside the feature need.

```ts
// features/product/index.ts
export { ProductList } from './components/product-list'
export { CreateProductForm } from './components/create-product-form'
export { useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct } from './hooks/use-products'
export type { Product, CreateProductDto, UpdateProductDto } from './types/product.types'
```

Rules:
- Named exports only — never default exports from index
- Do not export internal implementation details (service, query keys)
- Types are exported with `export type`

---

## Step 8: Use from the Page

Import from the feature barrel in `app/` pages.

```tsx
// app/products/page.tsx
import { ProductList, CreateProductForm } from '@/features/product'

export default function ProductsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Products</h1>
      <ProductList />
      <CreateProductForm />
    </main>
  )
}
```

---

## Checklist Before Finishing

- [ ] Types defined (domain, DTO)
- [ ] Service created using `@/services/api`
- [ ] Query keys exported and centralized
- [ ] Hooks created for all needed operations
- [ ] Mutation hooks invalidate relevant queries
- [ ] Zod schema defined in `schemas/<name>.schema.ts` (if form exists), validation messages from `<SCOPE>_VALIDATION_MESSAGES`
- [ ] List component handles loading / error / empty states
- [ ] Form component handles `isPending` and resets on success
- [ ] No raw Thai/English string literals in JSX — all copy from `<SCOPE>_TEXT` constants
- [ ] Query/mutation errors rendered via `extractErrorMessage(error)`, not `error.message`
- [ ] Barrel export created — services and raw constants NOT exported from it
- [ ] Page imports from `@/features/<name>` barrel
- [ ] No `any` types introduced
- [ ] No direct axios calls inside components
- [ ] Naming follows project conventions

---

## What NOT To Do

```ts
// ✗ Fetching inside a component
useEffect(() => {
  axios.get('/products').then(setProducts)
}, [])

// ✗ Storing API data in Zustand
useProductStore.setState({ products })

// ✗ Hardcoded query keys
useQuery({ queryKey: ['products'] })

// ✗ Missing invalidation after mutation
useMutation({
  mutationFn: productService.create,
  // no onSuccess
})

// ✗ Missing error/loading states
return <ProductList data={data} />
```
