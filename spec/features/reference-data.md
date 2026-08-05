# Feature: Reference Data (Province, Store Type)

Two minimal features covering the seeded lookup lists that populate dropdowns.
They exist as separate folders because they are separate API resources, not
because either needs a UI of its own.

## Shape

Neither has `components/`, `schemas/`, `constants/`, or `utils/` — only a hook,
a service, and a type. That is the correct shape; do not add empty folders "for
consistency" (`.claude/rules/feature-structure.md`).

```
features/province/          features/store-type/
├── hooks/use-provinces.ts  ├── hooks/use-store-types.ts
├── services/…              ├── services/…
├── types/…                 ├── types/…
└── index.ts                └── index.ts
```

## Province

| Item | Value |
|---|---|
| Type | `Province { id: number; nameTh: string }` |
| Endpoint | `GET /provinces` → `Province[]` |
| Hook | `useProvinces()` |
| Key | `provinceKeys.all` = `['provinces']` |
| `staleTime` | 24 hours |
| Barrel | `useProvinces`, `provinceKeys`, `type Province` |

## Store type

| Item | Value |
|---|---|
| Type | `StoreType { id: number; nameTh: string }` |
| Endpoint | `GET /store-types` → `StoreType[]` |
| Hook | `useStoreTypes()` |
| Key | `storeTypeKeys.all` = `['store-types']` |
| `staleTime` | 24 hours |
| Barrel | `useStoreTypes`, `storeTypeKeys`, `type StoreType` |

## Why the 24-hour stale time

Both lists are seeded once server-side and do not change within a session.
Without the override they would refetch on the app's 60-second default every
time a filter dropdown mounts. The same reasoning drives
`useDimensions()`'s `staleTime: Infinity` in the assessment feature — the three
of them are the app's only genuinely static server data.

## Consumers

| Consumer | Uses |
|---|---|
| `store/store-explorer.tsx` | Both — the province and type filter dropdowns |
| `store/create-store-form.tsx`, `store/edit-store-form.tsx` | Both — required selects |
| `analytics/analytics-toolbar.tsx` | Province — the analytics filter |
| `assessment/assessment-store-picker.tsx` | Province — narrows the store popover |

`Store.province` and `Store.storeType` are stored as **strings**, not foreign
keys — the filters send `nameTh`, and `STORE_UNSPECIFIED_LABEL` (`'ไม่ระบุ'`,
`constants/index.ts`) stands in for a store imported from the intake workbook
before either is filled in. It mirrors the API's own
`STORE_UNSPECIFIED_LABEL`.

## Adding another lookup list

Copy this shape exactly: type, service with a single `getAll`, hook with a
`*Keys` object and a 24-hour `staleTime`, barrel exporting the hook + keys +
type. Do not add it to an existing feature — a lookup list belongs to whatever
resource the API exposes, not to whichever screen happened to need it first.
