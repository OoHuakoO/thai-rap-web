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
uploadLogo: (storeId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api
    .post<string>(`/stores/${storeId}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
},
```

Delete/remove gets its own method too (`deleteLogo`, `deletePhoto`) — don't
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

Used on edit/detail pages via `StoreLogoManager`, `StorePhotoGalleryManager`,
`StoreDocumentManager` — the entity already has an id, so selecting a file
calls the upload hook directly, no buffering.

```tsx
const { mutate: uploadLogo, isPending: isUploading } = useUploadStoreLogo(storeId);

<input
  type="file"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo(file, { onError: (err) => toast.error(extractErrorMessage(err)) });
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
| Images only (logo, storefront photo, menu photo) | `image/jpeg,image/png,image/webp` |
| Documents (registration docs, evidence attachments) | `image/jpeg,image/png,image/webp,application/pdf,.xlsx` |

If a new file kind needs a genuinely different set, add it here first, don't
just type a new string inline.

---

## Deleting an Uploaded File

Every delete goes through the confirm dialog (`useConfirm` from
`@/components/shared/confirm-dialog`) — never delete on a bare click.

```tsx
const confirm = useConfirm();

const handleDeleteLogo = async () => {
  const confirmed = await confirm({
    title: STORE_DIALOG_TEXT.deleteLogoTitle,
    description: STORE_DIALOG_TEXT.deleteLogoDescription,
    confirmLabel: STORE_DIALOG_TEXT.deleteConfirmLabel,
    variant: 'destructive',
  });
  if (!confirmed) return;
  deleteLogo(undefined, { onError: (err) => toast.error(extractErrorMessage(err)) });
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

## Gap: No Client-Side Size Limit Today

No component in this codebase validates file size before upload — the
`<input accept=...>` only restricts MIME type, and an oversized file is
discovered only when the server rejects it. This is a known gap, not an
established pattern to copy.

When you add or touch an upload component, add a size check before calling
the upload mutation:

```ts
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — confirm limit with backend

if (file.size > MAX_FILE_SIZE_BYTES) {
  toast.error(`ไฟล์ใหญ่เกินไป (สูงสุด ${formatFileSize(MAX_FILE_SIZE_BYTES)})`);
  return;
}
```

Reuse `formatFileSize()` from `store-media-picker.tsx` (move it to
`utils/format-file-size.ts` if a second feature needs it — don't duplicate it).

---

## Checklist Before Adding an Upload

- [ ] Service method is named for what it uploads (`uploadLogo`, not `upload`)
- [ ] `accept` uses one of the two standard MIME sets above
- [ ] Picker shape (pre-entity) vs manager shape (post-entity) matches where the upload happens
- [ ] `e.target.value = ''` reset after reading the file
- [ ] Delete goes through `useConfirm`, not a bare click handler
- [ ] Upload/delete errors go to `toast.error(extractErrorMessage(err))`
- [ ] Object URLs created in `useEffect`, revoked in cleanup
- [ ] File size validated client-side before the request is sent
