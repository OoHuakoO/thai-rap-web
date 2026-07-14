# File Upload Patterns

Rules for any feature that lets a user attach a file — logos, photos,
documents, assessment evidence. Keeps every upload flow interchangeable
whether it's used inline in a form or as a standalone manager after create.

---

## Service Layer

Each upload gets its own named method in the feature's `*.service.ts` — never
a generic `upload(url, file)` helper. Always build a `FormData` with key
`'file'` and set the multipart header explicitly.

```ts
// ✓ features/store/services/store.service.ts
uploadDocument: (storeId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post<StoreDocument>(`/stores/${storeId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
},
```

Delete/remove gets its own method too (`deleteDocument`, `deleteCover`) — don't
overload one method with a boolean flag to switch between upload/delete.

---

## Two Upload UI Shapes

There are exactly two shapes in this codebase. Pick the one that matches
where the upload happens — don't invent a third.

### 1. Picker (buffers files before a parent form submits)

Used inside `create-store-form.tsx` via `StoreMediaPicker` — file selection
happens before the entity exists, so files are held in local `useState<File[]>`
and uploaded only after the parent mutation's `onSuccess`. The picker itself
never calls a service or hook.

```tsx
interface XPickerProps {
  files: File[]
  onChange: (files: File[]) => void
}
```

### 2. Manager (uploads immediately against an existing entity)

Used on edit/detail pages via `StorePhotoGalleryManager`,
`StoreDocumentManager` — the entity already has an id, so selecting a file
calls the upload hook directly, no buffering.

```tsx
const { mutate: uploadDocument, isPending: isUploading } = useUploadStoreDocument(storeId);

<input
  type="file"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isFileSizeValid(file)) {
        toast.error(fileTooLargeMessage(file));
        return;
      }
      uploadDocument(file, { onError: (err) => toast.error(extractErrorMessage(err)) });
    }
    e.target.value = '';
  }}
/>
```

Reset `e.target.value = ''` after reading the file in both shapes — otherwise
selecting the same file twice in a row doesn't fire `onChange` again.

---

## `accept` Attribute — Use the Standard Sets

Don't invent a new MIME list per component. Two sets cover every upload in
this project:

| Purpose | `accept` value |
|---|---|
| Images only (storefront photo, menu photo, cover) | `image/jpeg,image/png,image/webp` |
| Documents (registration docs, evidence attachments) | `application/pdf,.xlsx,.docx,.csv` |

If a new file kind needs a genuinely different set, add it here first, don't
just type a new string inline.

---

## Deleting an Uploaded File

Every delete goes through the confirm dialog (`useConfirm` from
`@/components/shared/confirm-dialog`) — never delete on a bare click.

```tsx
const confirm = useConfirm();

const handleDeleteDocument = async (doc: StoreDocument) => {
  const confirmed = await confirm({
    title: STORE_DIALOG_TEXT.deleteDocumentTitle,
    description: STORE_DIALOG_TEXT.deleteDocumentDescription(doc.filename),
    confirmLabel: STORE_DIALOG_TEXT.deleteConfirmLabel,
    variant: 'destructive',
  });
  if (!confirmed) return;
  deleteDocument(doc.id, { onError: (err) => toast.error(extractErrorMessage(err)) });
};
```

Dialog copy comes from `<domain>-dialog.constants.ts`, per
[text-constants.md](text-constants.md) — not inline strings.

---

## Error Handling

Upload/delete mutations report failure via `toast.error(extractErrorMessage(err))`
in `onError` — never let a failed upload fail silently or throw unhandled.
When uploading a batch of files in a loop (picker shape, after parent
`onSuccess`), catch each file's failure individually so one bad file doesn't
abort the rest:

```ts
for (const file of media.storefrontFiles) {
  await storeService.uploadStorefrontPhoto(store.id, file).catch((err) => {
    toast.error(CREATE_STORE_FORM_TEXT.storefrontUploadError(file.name, extractErrorMessage(err)));
  });
}
```

---

## Preview URLs

When showing a local preview before upload (picker shape), create the object
URL in a `useEffect` keyed on the file(s) and revoke it in the cleanup — never
create an object URL during render, and never leave it un-revoked.

```tsx
useEffect(() => {
  const url = URL.createObjectURL(file)
  setPreview(url)
  return () => URL.revokeObjectURL(url)
}, [file])
```

For already-uploaded files (manager shape), don't create an object URL at
all — render the server URL through `buildFileUrl()` (`@/utils/build-file-url`).

---

## Client-Side Size Limit

Every upload component validates file size before calling the upload
mutation, using the shared helpers from `utils/validate-file-size.ts`
(`MAX_FILE_SIZE_BYTES` comes from `constants/`, per
[no-hardcode.md](no-hardcode.md) — never a locally redefined limit):

```ts
import { isFileSizeValid, fileTooLargeMessage } from '@/utils/validate-file-size'

if (!isFileSizeValid(file)) {
  toast.error(fileTooLargeMessage(file));
  return;
}
```

In the picker shape (multi-file), filter instead of early-returning so one
oversized file doesn't block the rest of the selection:

```ts
function filterValidFiles(files: File[]): File[] {
  const valid: File[] = [];
  for (const file of files) {
    if (isFileSizeValid(file)) valid.push(file);
    else toast.error(fileTooLargeMessage(file));
  }
  return valid;
}
```

`formatFileSize()` lives in `utils/format-file-size.ts` — import it, don't
redefine a local copy in the component (this exists as local duplicates in
`store-media-picker.tsx` and `store-document-manager.tsx` today; treat that
as a bug to fix when you touch either file, not a pattern to copy).

---

## Checklist Before Adding an Upload

- [ ] Service method is named for what it uploads (`uploadDocument`, not `upload`)
- [ ] `accept` uses one of the two standard MIME sets above
- [ ] Picker shape (pre-entity) vs manager shape (post-entity) matches where the upload happens
- [ ] `e.target.value = ''` reset after reading the file
- [ ] Delete goes through `useConfirm`, not a bare click handler
- [ ] Upload/delete errors go to `toast.error(extractErrorMessage(err))`
- [ ] Object URLs created in `useEffect`, revoked in cleanup
- [ ] File size validated client-side before the request is sent
