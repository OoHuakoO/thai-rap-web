# Feature: Activity

`features/activity/` — ประมวลภาพกิจกรรม. Photo albums of what the programme
ran: camps, workshops, site visits. **Every role reads them; only the admin pair
manages them.**

## Routes

| Route | Page composition | Permission |
|---|---|---|
| `/activities` | `ActivityPageHeader mode="list"` + `ActivityList` | `activity:read` — **every role** |
| `/activities/[id]` | `ActivityDetail` | inherits `/activities` |
| `/activities/new` | `ActivityPageHeader mode="create"` + `CreateActivityForm` | `activity:write` — SUPER_ADMIN, ADMIN |
| `/activities/[id]/edit` | `ActivityPageHeader mode="edit"` + `EditActivityForm` | `activity:write` |

`/activities` carries no `allowedRoles` gate and every role holds
`activity:read` — including JUDGE, which holds neither `dashboard:read` nor
`news:read`. This is the only programme-wide page a judge reaches, and it is
deliberate: an album records what the programme did and carries no store's data.

The detail route has **no `ROUTE_PERMISSIONS` entry of its own** — it is a read,
so `/activities` covers it through the prefix match. The two write pages sit
below it and win `canAccessRoute`'s longest match with `activity:write`;
`/activities/[id]/edit` matches through `ROUTES.ACTIVITY_EDIT_PATTERN`
(`/activities/:id/edit`), the same static-twin trick as `NEWS_EDIT_PATTERN`.

## Endpoints

| Method | Path | Service method |
|---|---|---|
| GET | `/activities?search&page&limit` | `getAll(query)` → `PaginatedResponse<Activity>` |
| GET | `/activities/:id` | `getById(id)` |
| POST | `/activities` | `create(dto)` |
| PATCH | `/activities/:id` | `update(id, dto)` |
| DELETE | `/activities/:id` | `remove(id)` |
| POST | `/activities/:id/photos` | `uploadPhotos(id, files)` — repeated **`files`** part, returns the whole `Activity` |
| DELETE | `/activities/:id/photos/:photoId` | `deletePhoto(id, photoId)` |

`uploadPhotos` is the only batch upload in this app — one `FormData` carrying
every file under the same `files` key, max 20 per request. Every other upload
here posts a single `file`.

The API also serves `PATCH /activities/:id/photos/:photoId` (reorder), but this
app has no service method for it — photos keep their upload order. The MSW
handler mirrors it anyway.

## Hooks

| Hook | Key | Notes |
|---|---|---|
| `useActivities(query)` | `activityKeys.list(query)` | Key normalises: `search ?? ''`, `page ?? 1`, `limit ?? null` |
| `useActivity(id)` | `activityKeys.detail(id)` | `enabled: Boolean(id)` |
| `useCreateActivity` / `useUpdateActivity(id)` / `useDeleteActivity` | — | Each invalidates `activityKeys.all` |
| `useUploadActivityPhotos(id)` / `useDeleteActivityPhoto(id)` | — | Same invalidation — a photo write changes both the album and its list row |

No cross-feature invalidation: unlike news, nothing else in the app renders
these.

## Types

```ts
interface ActivityPhoto {
  id; url;
  sortOrder: number;
  uploadedAt;
}

interface Activity {
  id; title; description;
  note: string | null;          // หมายเหตุ
  activityDate;                 // วันที่จัดกิจกรรม — the sort key
  location: string | null;
  photos: ActivityPhoto[];
  photoCount: number;
  createdById; createdByName; createdAt; updatedAt;
}
```

**`photos` is a preview on a list row and the full album on the detail route** —
`GET /activities` sends only the first four. `photoCount` is the real total on
both, so "n ภาพ" reads that field and the card cover reads `photos[0]`.

There is no draft/published state. An album is visible the moment it is saved.

## Components

| Component | Notes |
|---|---|
| `ActivityList` | Card grid + debounced search (`useDebounce`) + `PaginationBar`. Create/edit/delete gated on `can(activity:write)`; delete goes through `useConfirm` with copy from `ACTIVITY_DIALOG_TEXT` |
| `ActivityDetail` | Read-only album: header, description, หมายเหตุ callout, photo grid. The edit button is the only permission-gated thing on it |
| `ActivityForm` | The shared field block. It does **not** navigate on success — only the caller knows the id it just created, so create/edit each push their own route. The submit button is disabled off react-hook-form's own `formState.isSubmitting`, not off a mutation's `isPending` passed down: it awaits the whole of `onSubmit`, which on create keeps working after the mutation resolves |
| `CreateActivityForm` | Picker shape: buffers files in `useState`, then calls `activityService.uploadPhotos` after the create mutation resolves (the documented service-from-component escape hatch), then opens the new album |
| `EditActivityForm` | Manager shape: photos upload immediately through `ActivityPhotoManager`, so a photo added here survives a cancelled edit |
| `ActivityPhotoPicker` / `ActivityPhotoManager` | The two upload shapes from `file-upload-patterns.md`. They differ only in what a selected file does — buffered on the picker, uploaded at once on the manager — and both draw their thumbnails with `ActivityPhotoGrid` |
| `ActivityPhotoGrid` | The tile strip both upload shapes render, over object URLs on the picker and server URLs on the manager. It is activity-local rather than the shared `PhotoPreviewGrid` the store pickers use: that one draws a 64px tile with a hover-revealed remove button, which is a different size from the album's and unreachable on a touch screen. Removal is by index, so the caller owns what "remove" means — dropping a buffered file, or a confirm dialog and a DELETE |
| `ActivityPhotoLightbox` | The enlarge-on-click popup, shared by `ActivityDetail` and `ActivityPhotoGrid`. It takes a ready-to-render `src`, not a photo record — the picker enlarges a buffered file that has no record yet. `max-w-3xl` against the store detail's `max-w-2xl` — an album is read as a set, so the photo is the subject rather than one field of a record |

Copy and limits live in `constants/activity.constants.ts`; the max-length
constants mirror the API's DTO decorators.

## Barrel

```ts
export { ActivityDetail, ActivityList, ActivityPageHeader, CreateActivityForm, EditActivityForm };
export { useActivities, useActivity };
export type { Activity, ActivityPhoto };
```

The mutation hooks are internal — only the forms and the photo manager use them.

## Tests

`activity-list`, `activity-photo-grid`, `activity-photo-manager`,
`create-activity-form`, `filter-valid-photos`, `activity.service`,
`mocks/handlers/activity.handlers`.

`activity-photo-grid` also holds the picker/manager tile-parity check — it
compares the two thumbnails to each other, so it fails if either page stops
going through the shared grid.

The handler test runs under `// @vitest-environment node`: the photo-upload
handler reads `request.formData()`, and a `File` built under jsdom is a
different class from the one undici's multipart parser accepts.

## Gaps

- `sortOrder` is writable through the API but this app never sends it — photos
  stay in upload order, with no drag-to-reorder.
- A photo carries no caption. It was removed from both repos on 2026-08-11; the
  album's own `description` and `note` carry the words.
- No cover selection: the card cover is always `photos[0]`.
- The create form uploads its buffered photos in one request, so one bad file
  fails the batch — the per-file `catch` the store's picker uses does not apply,
  and the failure message counts the photos rather than naming the one at fault.
- A selection over `ACTIVITY_PHOTO_MAX_PER_UPLOAD` is trimmed by
  `filterValidPhotos` and the user is told how many were skipped — there is no
  queue that sends the remainder as a second request.
- `location` and `note` are sent as `''` rather than omitted when cleared, so a
  cleared field is stored empty rather than null. Both render the same.
