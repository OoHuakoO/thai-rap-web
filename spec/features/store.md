# Feature: Store

`features/store/` — the restaurant directory: browse, create, edit, delete, and
manage a store's media and documents. The largest feature in the app.

## Routes

| Route | Page composition | Notes |
|---|---|---|
| `/stores` | `StoreExplorer` | List + filters + inline detail pane |
| `/stores/new` | `StoreListBackLink` + `StoreFormHeader mode="create"` + `CreateStoreForm` | |
| `/stores/[id]` | `StoreListBackLink` + `StoreDetail variant="full"` + `StoreAnalyticsSection` + `StoreReportSection` | Pulls in two other features |
| `/stores/[id]/edit` | `StoreListBackLink` + `StoreFormHeader mode="edit"` + `StoreEditPage` | |

Access: `store:read` **and** `allowedRoles: [SUPER_ADMIN, ADMIN, ENTREPRENEUR]`.
ASSESSOR/MENTOR/JUDGE/ME_TEAM hold `store:read` for other pages' store pickers
but cannot open this section. VIEWER holds only `store:read:public`.

An ENTREPRENEUR sees only the stores it owns — enforced server-side by the `OWN`
data scope, not by client filtering.

## Endpoints

| Method | Path | Service method |
|---|---|---|
| GET | `/stores` | `getAll(params)` → `PaginatedStores` |
| GET | `/stores/stats` | `getStats()` — ADMIN + ENTREPRENEUR only |
| GET | `/stores/:id` | `getById(id)` |
| POST | `/stores` | `create(dto)` |
| PATCH | `/stores/:id` | `update(id, dto)` |
| PATCH | `/stores/:id/status` | `updateStatus(id, status)` |
| DELETE | `/stores/:id` | `remove(id)` |
| POST/DELETE | `/stores/:id/documents[/:documentId]` | `uploadDocument` / `deleteDocument` |
| POST/DELETE | `/stores/:id/menu-photos` | `uploadMenuPhoto` / `deleteMenuPhoto({ url })` |
| POST/DELETE | `/stores/:id/cover` | `uploadCover` / `deleteCover` |
| POST/DELETE | `/stores/:id/store-photos` | `uploadStorePhoto` / `deleteStorePhoto({ url })` |

Photo deletes send the URL in the request **body**, not the path — the file has
no id of its own.

## Query params

`StoreQueryParams` = `{ page, limit, search, province, storeType, status }`.
`StoreExplorer` builds it from local state, spreading each filter only when it
is not `'ALL'`, and debounces `search` by 300 ms. Every filter change resets
`page` to 1.

## Components

| Component | Role |
|---|---|
| `StoreExplorer` | The `/stores` page: `StoreStatsBar`, filter row (search + province + type + status), `StoreList`, `PaginationBar`, and an inline `StoreDetail variant="compact"` for the selected row |
| `StoreList` | The table. Row click selects; row actions gated on `can()` |
| `StoreDetail` | `variant: 'compact' \| 'full'` — the pane inside the explorer vs. the full detail page |
| `StoreStatsBar` | Five KPI tiles (participation + T0–T3) from `StoreStats`, artwork via `MaskIcon` |
| `CreateStoreForm` / `EditStoreForm` / `StoreEditPage` | Create and edit |
| `StoreGeneralInfoFields` | The shared field block both forms render; each form fetches the province/type lists and passes them in |
| `StoreMediaPicker` | **Picker** shape — buffers files before the store exists |
| `StoreCoverManager` / `StoreCoverPicker` / `StoreCoverGalleryStrip` | Cover image |
| `StorePhotoGalleryManager` | **Manager** shape — storefront/menu photos on an existing store |
| `StoreDocumentManager` | **Manager** shape — registration documents |
| `StoreDetailMenuCard` / `StoreDetailDocumentsCard` / `StoreContactCard` | Detail page sections |
| `StoreProgressTimelineCard` | Status progression via `TimelineSteps` |
| `StoreFormHeader` / `StoreListBackLink` | Page chrome, `mode: 'create' \| 'edit'` |

## Hooks

All in `hooks/use-stores.ts`, alongside `storeKeys`:

`useStores(params)`, `useStore(id)`, `useStoreStats()`, `useCreateStore()`,
`useUpdateStore(id)`, `useUpdateStoreStatus(id)`, `useDeleteStore()`, and eight
upload/delete mutations (`useUploadStoreDocument`, `useDeleteStoreDocument`,
`useUploadMenuPhoto`, `useDeleteMenuPhoto`, `useUploadStoreCover`,
`useDeleteStoreCover`, `useUploadStorePhoto`, `useDeleteStorePhoto`).

Every upload/delete invalidates `storeKeys.detail(storeId)` only; the
create/update/delete trio invalidates `storeKeys.all` plus the detail key where
relevant.

## The create flow's upload loop

`CreateStoreForm` is the one component allowed to call a service directly. The
store must exist before its files can be attached, so:

```
submit → useCreateStore()
       → onSuccess(created)
         → storeService.uploadCover(id, media.coverFile)
         → for (file of media.storePhotoFiles) storeService.uploadStorePhoto(id, file)
         → for (file of media.menuFiles)       storeService.uploadMenuPhoto(id, file)
         → for (file of media.documentFiles)   storeService.uploadDocument(id, file)
       → navigate to the new store
```

Each upload carries its own `.catch(err => toast.error(…))`, so one bad file
reports itself and the rest still upload.

This is the documented escape hatch, not a pattern to spread. A second caller
means it becomes a hook.

## Types

`Store` carries three groups of fields:

- **Identity** — `id`, `code` (the `RAP69-XXX` code printed on the offline
  forms), `name`, `status`, `ownerId`.
- **Profile, nullable** — `province`, `storeType`, `ownerName`, `phone`,
  `email`, `address`, `avgRevenueMin/Max`. Null for a store imported from the
  intake workbook before its profile is filled in; the create/edit forms still
  require all of them.
- **Content** — `socialLinks`, `mainProblems[]`, `goals[]`, `menuPhotos[]`,
  `coverUrl`, `storePhotos[]`, `documents[]`, plus `latestScore`,
  `latestAssessorName`, `latestAssessedAt`.

Two rules that bite:

1. For a `PUBLIC`-scoped role (VIEWER) the excluded keys are **absent, not
   null**. Guard with `!= null` / `?? fallback`, never `!== null`.
2. `ownerId` (the `User` relation) is what decides who may edit — distinct from
   `ownerName`, which is free text. The API enforces the same in
   `StoreService.assertCanManage`.

`STORE_STATUS_LABELS` maps all 12 `StoreStatus` values to Thai. Note
`FIELD_AUDITED` = "ประเมิน T2 แล้ว" and `COMPLETED` = "ประเมิน T3 แล้ว" — the
enum names carry the stage, the labels carry the round.

## Constants

Six files, split by surface: `store-explorer`, `store-list`, `store-detail`,
`store-form`, `store-dialog` (confirm copy), `store-media`,
`store-stats-bar`. Page sizes (`DEFAULT_STORE_PAGE_LIMIT`) live here, not
inline.

## Utils

- `document-visuals.ts` — icon/colour per document type.
- `filter-valid-files.ts` — drops oversized files from a multi-select and toasts
  each one, instead of failing the whole selection.

## Dependencies

Imports `useProvinces` (`@/features/province`) and `useStoreTypes`
(`@/features/store-type`) for the filter dropdowns. Imported by `assessment`,
`analytics`, `report` and `user` — `storeKeys` is part of that public surface,
because assigning owners and submitting assessments both invalidate store data.

## Tests

`store-list`, `store-general-info-fields`, and
`mocks/handlers/store.handlers.test.ts` (the reference for role-scoped mock
handlers).

## Gaps

- There is no bulk import UI, though `code` exists precisely to map spreadsheet
  rows back to records.
