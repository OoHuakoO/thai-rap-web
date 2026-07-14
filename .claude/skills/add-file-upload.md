---
name: add-file-upload
description: Add a file upload/delete flow to a feature — service methods, upload hook, and either a Picker (pre-entity) or Manager (post-entity) component. Follows file-upload-patterns.md using features/store's document and photo-gallery managers as reference.
---

# Add File Upload

Add an upload flow following [file-upload-patterns.md](../rules/file-upload-patterns.md).
Read that file first — this skill is the step-by-step for applying it.

## Before Starting

Determine:
1. Domain and what's being uploaded (a store's cover image, a user's
   avatar, an assessment's evidence photo)
2. **Picker or Manager?** — does the parent entity exist yet when the user
   picks a file?
   - Entity doesn't exist yet (e.g. inside a create form) → **Picker**
   - Entity already has an id (edit/detail page) → **Manager**
3. Single file or multiple?
4. Images, documents, or both — decides the `accept` value

---

## Step 1: Service Methods

Add named upload/delete methods to the feature's `*.service.ts`. Never a
generic `upload(url, file)` — name it for what it uploads.

```ts
// features/<name>/services/<name>.service.ts
uploadCover: (entityId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post<string>(`/entities/${entityId}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
},

deleteCover: (entityId: string) => api.delete(`/entities/${entityId}/cover`),
```

---

## Step 2: Upload/Delete Hooks (Manager shape only)

Picker shape doesn't need hooks — it buffers files and the parent form
calls the service directly in `onSuccess` (see Step 4). Manager shape wraps
each service method in a mutation:

```ts
// features/<name>/hooks/use-<name>.ts
export function useUploadCover(entityId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => entityService.uploadCover(entityId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: entityKeys.detail(entityId) }),
  })
}

export function useDeleteCover(entityId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => entityService.deleteCover(entityId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: entityKeys.detail(entityId) }),
  })
}
```

---

## Step 3: Size Validation

Every upload path checks size before calling the mutation/service, using
the shared helper — never a locally redefined byte limit:

```ts
import { isFileSizeValid, fileTooLargeMessage } from '@/utils/validate-file-size'

if (!isFileSizeValid(file)) {
  toast.error(fileTooLargeMessage(file))
  return
}
```

For a multi-file picker, filter instead of bailing on the first oversized
file:

```ts
function filterValidFiles(files: File[]): File[] {
  const valid: File[] = []
  for (const file of files) {
    if (isFileSizeValid(file)) valid.push(file)
    else toast.error(fileTooLargeMessage(file))
  }
  return valid
}
```

---

## Step 4a: Picker Component (pre-entity)

Buffers `File[]` in the parent form's `useState`. Never calls a service or
hook itself.

```tsx
// features/<name>/components/<name>-media-picker.tsx
'use client'

interface XPickerProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function XPicker({ files, onChange }: XPickerProps) {
  return (
    <input
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp"
      onChange={(e) => {
        if (e.target.files) onChange([...files, ...filterValidFiles(Array.from(e.target.files))])
        e.target.value = ''
      }}
    />
  )
}
```

The parent form's `create` mutation `onSuccess` then loops and calls the
service directly (the documented escape hatch in
[feature-structure.md](../rules/feature-structure.md) — a component calling
a service outside the hook layer, justified here because it's a one-off
batch upload after create, not a reusable query):

```ts
onSuccess: async (entity) => {
  for (const file of pickedFiles) {
    await entityService.uploadCover(entity.id, file).catch((err) => {
      toast.error(ENTITY_TEXT.uploadError(file.name, extractErrorMessage(err)))
    })
  }
}
```

Show a local preview via an object URL created in `useEffect`, revoked in
cleanup — never during render:

```tsx
useEffect(() => {
  const urls = files.map((file) => URL.createObjectURL(file))
  setPreviews(urls)
  return () => urls.forEach((url) => URL.revokeObjectURL(url))
}, [files])
```

## Step 4b: Manager Component (post-entity)

Selecting a file calls the upload hook from Step 2 directly, no buffering.

```tsx
// features/<name>/components/<name>-cover-manager.tsx
'use client'

export function EntityCoverManager({ entityId, coverUrl }: { entityId: string; coverUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: uploadCover, isPending } = useUploadCover(entityId)
  const { mutate: deleteCover } = useDeleteCover(entityId)
  const confirm = useConfirm()

  const handleSelected = (file: File | undefined) => {
    if (!file) return
    if (!isFileSizeValid(file)) return toast.error(fileTooLargeMessage(file))
    uploadCover(file, { onError: (err) => toast.error(extractErrorMessage(err)) })
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: ENTITY_DIALOG_TEXT.deleteCoverTitle,
      description: ENTITY_DIALOG_TEXT.deleteCoverDescription,
      confirmLabel: ENTITY_DIALOG_TEXT.deleteConfirmLabel,
      variant: 'destructive',
    })
    if (!confirmed) return
    deleteCover(undefined, { onError: (err) => toast.error(extractErrorMessage(err)) })
  }

  return (
    <>
      {coverUrl && <img src={buildFileUrl(coverUrl)} alt="" />}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleSelected(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </>
  )
}
```

Render already-uploaded files through `buildFileUrl()`
(`@/utils/build-file-url`) — never create an object URL for a server file.

---

## Checklist

- [ ] Service methods named for what they upload/delete — no generic `upload()`
- [ ] Picker (pre-entity) vs Manager (post-entity) matches where the upload happens
- [ ] Manager shape: hooks created and invalidate the right query key on success
- [ ] Picker shape: never calls service/hook itself; parent form uploads in `onSuccess`, catching each file's failure individually
- [ ] `accept` uses a standard MIME set from [file-upload-patterns.md](../rules/file-upload-patterns.md), not an invented one
- [ ] File size validated with `isFileSizeValid`/`fileTooLargeMessage` before every upload call
- [ ] `e.target.value = ''` reset after reading the file
- [ ] Delete goes through `useConfirm`, never a bare click
- [ ] Dialog copy comes from `<domain>-dialog.constants.ts`, not inline strings
- [ ] Object URLs (picker previews) created in `useEffect`, revoked in cleanup
- [ ] Uploaded files rendered via `buildFileUrl()`, not a raw object URL
