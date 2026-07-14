# Feature Folder Structure

Every domain lives under `features/<domain>/` with the same internal layering.
Consistency here is what lets any engineer jump into an unfamiliar feature and
know where to look.

---

## Standard Layout

```
features/<domain>/
├── components/     UI — one component per file, kebab-case
├── constants/       *.constants.ts — labels, options, form text
├── hooks/            *.ts — useX hooks wrapping TanStack Query / mutations
├── schemas/          *.schema.ts — Zod schemas + inferred form types
├── services/         *.service.ts — API calls only, no business logic
├── types/            *.types.ts — domain types, DTOs
├── utils/            optional — pure helper functions local to this feature
└── index.ts           barrel — public surface of the feature
```

Not every feature needs every folder. `province/` has no `components/` or
`schemas/` because it only exposes read data — that's fine. Never create an
empty folder "for consistency."

---

## The Barrel (`index.ts`)

`index.ts` is the only file other features are allowed to import from.

### DO — export components, hooks, and types

```ts
// features/store/index.ts
export { StoreList } from './components/store-list';
export { useStores } from './hooks/use-stores';
export { useStore } from './hooks/use-store';
export { useCreateStore } from './hooks/use-create-store';
export type { Store, CreateStoreDto } from './types/store.types';
```

### DON'T — export services or constants from the barrel

Services and constants are implementation detail of the feature that owns
them. Exporting a service invites other features to call it directly and skip
the hook layer (cache invalidation, loading/error state, retries).

```ts
// ✗ Don't do this
export { storeService } from './services/store.service';
export { STORE_FORM_TEXT } from './constants/store-form.constants';
```

If a constant is genuinely shared across features (e.g. `STORE_STATUS_LABELS`
used by both `store` and `assessment`), it's exported as a **type export**
alongside the domain type it labels — not as a raw constants re-export:

```ts
// ✓ features/store/index.ts
export { STORE_STATUS_LABELS } from './types/store.types';
```

---

## Cross-Feature Imports

A feature may depend on another feature (e.g. `assessment` reads store data),
but only through that feature's barrel.

### DO

```ts
// features/assessment/components/assessment-entry.tsx
import { useStores, STORE_STATUS_LABELS } from '@/features/store';
import type { Store, StoreStatus } from '@/features/store';
```

### DON'T — reach into another feature's internal folders

```ts
// ✗ Bypasses the barrel — internal file structure of `store` is not a stable contract
import { useAssessmentSummaries } from '@/features/assessment/hooks/use-assessment';
```

If code does this today, treat it as a bug to fix when you touch that file —
route it through `@/features/assessment` instead.

---

## Layer Dependency Rules

```
components → hooks → services → api.ts
components → schemas (for react-hook-form resolvers)
hooks → types
```

- **Components call hooks, not services.** Hooks own query keys, cache
  invalidation, and loading/error state — calling a service directly from a
  component throws that away.
- **Exception:** a component may call a service directly for one-off,
  non-cached side effects that don't fit `useMutation` cleanly — e.g. looping
  over several files to upload them after a create-mutation succeeds
  (`create-store-form.tsx` calling `storeService.uploadLogo` inside the
  `onSuccess` callback). This is a deliberate escape hatch, not a pattern to
  spread — if you're calling the same service method from more than one
  component, wrap it in a hook instead.
- **Services never import from `components/` or `hooks/`.** They only build
  requests and return typed data.
- **Schemas never import from `services/`.** Validation is independent of
  how data is fetched or sent.

---

## Naming Within a Feature

File naming follows [naming-conventions.md](naming-conventions.md) project-wide.
Within a feature specifically:

| File | Pattern | Example |
|---|---|---|
| Component | `<name>.tsx` | `create-store-form.tsx` |
| Hook file | one file per hook, `use-<action>.ts` | `use-login.ts`, `use-create-store.ts` |
| Service file | `<domain>.service.ts` | `store.service.ts` |
| Schema file | `<action>.schema.ts` or `<domain>.schema.ts` | `store.schema.ts`, `login.schema.ts` |
| Types file | `<domain>.types.ts` | `store.types.ts` |
| Constants file | `<domain>-<purpose>.constants.ts` | `store-form.constants.ts`, `store-dialog.constants.ts` |

Split hooks one-per-file, named for the action the hook performs —
`use-login.ts`, `use-register.ts`, `use-logout.ts` (`features/auth/hooks/`),
not a single `use-auth.ts` bundling all three. Keeps each hook's diff small
and its imports/mocks isolated in tests.

---

## Checklist Before Adding a New Feature

- [ ] Folder name is kebab-case, singular domain noun (`store`, not `stores`)
- [ ] Only the layers actually needed are created — no empty folders
- [ ] `index.ts` exports components/hooks/types only, never services or raw constants
- [ ] Other features import this feature only via `@/features/<domain>`, never a deep path
- [ ] Components call hooks; services are called directly only for the documented upload-loop exception
