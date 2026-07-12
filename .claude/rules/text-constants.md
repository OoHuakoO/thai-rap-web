# UI Text Constants

All user-facing text (Thai copy: labels, placeholders, button text, messages,
dialog titles) lives in a feature's `constants/*.constants.ts` file. Components
reference the constant — they never contain a raw Thai (or English) string
inside JSX.

This extends [no-hardcode.md](no-hardcode.md), which does not cover UI copy.

---

## Why

- One place to find/update copy without grepping every component.
- Enables future i18n without touching component logic.
- Makes it obvious in review when new copy is added vs. reused.

---

## File and Export Naming

File: `<domain>-<purpose>.constants.ts` (matches [feature-structure.md](feature-structure.md)).

Export name: `<SCOPE>_TEXT` for labels/copy, `<SCOPE>_VALIDATION_MESSAGES` for
Zod error messages. Always `as const`.

```ts
// features/store/constants/store-form.constants.ts
export const STORE_VALIDATION_MESSAGES = {
  nameRequired: 'กรุณากรอกชื่อร้าน',
  emailInvalid: 'อีเมลไม่ถูกต้อง',
} as const;

export const STORE_FORM_TEXT = {
  nameLabel: 'ชื่อร้าน',
  provincePlaceholder: 'เลือกจังหวัด',
} as const;
```

Split into multiple constants objects when a feature has distinct concerns —
don't cram everything into one giant object:

```ts
// features/store/constants/store-form.constants.ts
export const STORE_FORM_TEXT = { /* shared between create/edit */ } as const;
export const CREATE_STORE_FORM_TEXT = { /* create-only copy */ } as const;
export const EDIT_STORE_FORM_TEXT = { /* edit-only copy */ } as const;

// features/store/constants/store-dialog.constants.ts
export const STORE_DIALOG_TEXT = { /* confirm/success dialog copy */ } as const;
```

---

## Dynamic Text

Copy that interpolates a value is a function inside the same constants object
— never build the string inline in the component.

### DO

```ts
// constants file
export const STORE_DIALOG_TEXT = {
  deleteStoreDescription: (name: string) =>
    `ต้องการลบร้าน "${name}" ใช่หรือไม่? การลบไม่สามารถกู้คืนได้`,
} as const;

// component
<p>{STORE_DIALOG_TEXT.deleteStoreDescription(store.name)}</p>
```

### DON'T

```tsx
// ✗ Template string built in the component
<p>{`ต้องการลบร้าน "${store.name}" ใช่หรือไม่?`}</p>
```

---

## Usage in Components

### DO

```tsx
import { STORE_FORM_TEXT } from '../constants/store-form.constants';

<Label htmlFor="name">{STORE_FORM_TEXT.nameLabel}</Label>
```

### DON'T — raw string in JSX

```tsx
// ✗ features/store/components/store-detail.tsx does this today — fix when touched
<p className="mb-1.5 text-xs font-bold text-charcoal">ข้อมูลติดต่อ</p>
<span className="text-muted-foreground">เจ้าของร้าน</span>
```

```tsx
// ✗ features/dashboard/components/activity-feed.tsx does this today — fix when touched
<CardTitle className="text-sm font-semibold">กิจกรรมและการแจ้งเตือน</CardTitle>
```

Both should read from a constants object instead, e.g.:

```ts
export const STORE_DETAIL_TEXT = {
  contactInfoTitle: 'ข้อมูลติดต่อ',
  ownerNameLabel: 'เจ้าของร้าน',
} as const;
```

---

## Zod Schema Messages

Validation messages also come from the constants file, not inline strings in
the schema:

```ts
// ✓ features/store/schemas/store.schema.ts
import { STORE_VALIDATION_MESSAGES } from '../constants/store-form.constants';

export const storeFormSchema = z.object({
  name: z.string().min(1, STORE_VALIDATION_MESSAGES.nameRequired),
  email: z.string().email(STORE_VALIDATION_MESSAGES.emailInvalid).optional(),
});
```

```ts
// ✗ Don't inline the message in the schema
name: z.string().min(1, 'กรุณากรอกชื่อร้าน'),
```

---

## Exemptions

- Values passed straight through from the API (store names, user input echoed
  back) are data, not UI copy — not constants.
- `console.log`/error strings that are developer-facing only (never rendered
  to a user) don't need to go through this — though per
  [linting-config.md](linting-config.md) `console.log` shouldn't ship anyway.
- Test files — assertions can reference literal Thai strings directly instead
  of importing the constant, per [testing.md](testing.md)'s exemption for test data.

---

## Checklist Before Adding a Component

- [ ] No raw Thai/English string literal inside JSX
- [ ] Dynamic copy is a function in the constants file, not a template string in the component
- [ ] Zod `.min()`/`.email()`/etc. messages come from `<SCOPE>_VALIDATION_MESSAGES`
- [ ] New constants object named `<SCOPE>_TEXT` and declared `as const`
