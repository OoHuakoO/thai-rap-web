# UI System

## Design source

The visual reference is the design sheet in `design/` (`thai_rap.html`,
`THAI-RAP_System_Interface_All_Pages-*.jpg`) and the icon sheet in `icon/`.
`.claude/launch.json` has a `design` target that serves `docs/design` on port
8090 for side-by-side comparison.

## Colour tokens

Brand colours are declared once in `app/globals.css` as **space-separated RGB
channels** so Tailwind's opacity modifiers work (`bg-orange/10`), and mapped to
utility names in `tailwind.config.ts`. `styles/tokens.ts` holds the same values
as TS constants for the places that need a raw hex — Recharts props, inline SVG.

| Token | Utility | Hex | Used for |
|---|---|---|---|
| `--color-orange` | `orange` | `#F17128` | Primary CTA, active nav |
| `--color-orange-light` | `orange-light` | `#F58544` | Hover, secondary CTA |
| `--color-orange-dark` | `orange-dark` | `#C75B1A` | Banner title |
| `--color-cream` | `cream` | `#FFF0E5` | Auth background, tinted panels |
| `--color-cream-soft` / `-light` | `cream-soft` / `cream-light` | `#FDF5EC` / `#FFF8F2` | Project banner gradient |
| `--color-charcoal` | `charcoal` | `#58595B` | Body text, secondary labels |
| `--color-purple-banner` | `purple-banner` | `#7A51A0` | Banner heading, secondary badges |
| `--color-dark-nav` | `dark-nav` | `#1F2937` | Sidebar background |
| `--color-text-main` | `text-main` | `#111827` | Body text |
| `--color-score-green` | `score-green` | `#10B981` | Positive score |
| `--color-score-red` | `score-red` | `#EF4444` | Negative score, error |

shadcn's semantic HSL variables (`--primary`, `--muted`, `--destructive`, …)
sit alongside them; `--primary` and `--ring` are tuned to the brand orange, so
default shadcn components already look on-brand. `--radius` is `0.5rem`.

A `.dark` block exists in `globals.css` and `darkMode: ['class']` is configured,
but nothing ever sets the class. **The app is light-only** — do not assume dark
mode works just because the variables are there.

### Chart palettes

Two lists in `styles/tokens.ts`, used for different reasons:

- `chartColors` — ordered by series priority (blue, emerald, amber, red). For
  multi-series charts where series 1 should dominate.
- `provinceChartColors` — categorical, cycled by index, starting with brand
  orange. For province donuts and legends, where no series outranks another.

Never hand a Recharts component a literal hex — pull from these, or from the
`--chart-1..5` CSS variables via `components/ui/chart.tsx`.

## Typography

`styles/fonts.ts` loads two `next/font/google` families exposed as CSS
variables:

- `Sarabun` (400/500/600/700, `latin` + `thai`) → `--font-sarabun`
- `Inter` (`latin`) → `--font-inter`

`font-sans` resolves to Inter → Sarabun → sans-serif; `font-thai` forces
Sarabun. The body sets `font-sans`, so Thai glyphs fall through to Sarabun
naturally while Latin numerals and codes get Inter's metrics.

Scale (`fontSizes` in `styles/tokens.ts`) matches Tailwind's default: `xs` 12px
captions → `4xl` 36px hero.

## Layout shell

`components/layout/app-shell.tsx` wraps every `(dashboard)` page:

```
<div class="flex h-screen overflow-hidden">
  <Sidebar />                       260px, or 62px collapsed
  <div class="flex flex-1 flex-col overflow-hidden">
    <TopHeader />                   partner logos + user + logout
    <main class="flex-1 overflow-y-auto">
      <ProjectBanner />             programme identity + fiscal year
      <div class="p-6">{children}</div>
    </main>
  </div>
</div>
```

The shell owns the viewport. Consequences:

- The scroll container is `<main>`, not the window. A `min-h-screen` child
  overflows it and produces a second scrollbar — use `min-h-[60vh]` inside the
  dashboard.
- Page padding (`p-6`) belongs to the shell; per-page vertical rhythm
  (`space-y-4`) belongs to the page.

| Component | Notes |
|---|---|
| `Sidebar` | Role-filtered `NAV_ITEMS`, then the collapse toggle, then the user card. Collapse state is local `useState` — not persisted. Collapsed links carry `title` as the only readable label. Active state: exact match for `/`, `startsWith` for everything else. |
| `TopHeader` | Centred partner logo strip (`priority` image), user avatar + `ROLE_LABELS[role]`, logout button. |
| `ProjectBanner` | Static programme identity. The only dynamic part is `getCurrentFiscalYearBE()` (`utils/get-fiscal-year.ts`). |

Nav icons are PNGs from `public/icons/nav/` referenced through `NAV_ICONS`;
`NavItem.icon` accepts either such a path **or** a Lucide component, for items
whose brand asset does not exist yet (`Megaphone` for news, `Images` for the
activity gallery, `UserCog` for users). `NavIcon` in `sidebar.tsx` branches on `typeof icon === 'string'`.

## Component inventory

### `components/ui/` — shadcn primitives

Generated via the shadcn CLI (`components.json`: style `default`, base colour
slate, CSS variables on, `rsc: true`, icon library lucide). 27 files:

`accordion` `alert` `avatar` `badge` `breadcrumb` `button` `calendar` `card`
`chart` `checkbox` `dialog` `dropdown-menu` `input` `label` `pagination`
`popover` `radio-group` `scroll-area` `select` `separator` `sheet` `skeleton`
`sonner` `table` `tabs` `textarea` `tooltip`

Add new primitives with the CLI rather than by hand, and keep local edits
minimal so a regeneration stays cheap. See
`.claude/rules/shadcn-component-rules.md`.

### `components/shared/` — cross-feature composites

Every file here has at least two real consumers; that is the bar for the folder
(see `.claude/rules/frontend-rules.md`).

| Component | Exports | Purpose |
|---|---|---|
| `alert-card.tsx` | `AlertCard` | The standard error/info/empty block: `variant` + `message` |
| `back-link.tsx` | `BackLink` | "← back" link with an href |
| `bar-chart.tsx` | `BarChart` | Recharts bar wrapper |
| `donut-chart.tsx` | `DonutChart` | Recharts donut wrapper. The optional centre caption goes through Recharts' `<Label content>` — a bare `<text>` inside `<Pie>` is dropped |
| `brand-icons.tsx` | `FacebookIcon`, `LineIcon`, `InstagramIcon` | Social marks for store contact cards |
| `confirm-dialog.tsx` | `ConfirmDialogProvider`, `useConfirm`, `useAlert` | Promise-based confirm — **every** destructive action goes through it |
| `data-table.tsx` | `DataTable<T>` | Generic table driven by `TableColumn<T>[]`, with loading/empty states and optional row selection |
| `download-buttons.tsx` | `DownloadButtons`, `DownloadFormat` | The Excel/PDF pair on every export. Labels are props — the copy belongs to the feature that owns the download |
| `error-page.tsx` | `ErrorPage` | The single layout behind all four status pages and both boundaries |
| `field-error.tsx` | `FieldError` | Field-level validation message |
| `loading.tsx` | `Loading`, `TableSkeleton`, `CardSkeleton` | The three loading shapes |
| `mask-icon.tsx` | `MaskIcon` | Renders a PNG icon as a CSS mask so it takes `currentColor` |
| `pagination-bar.tsx` | `PaginationBar` | Page + page-size control used by every paged list |
| `photo-preview-grid.tsx` | `PhotoPreviewGrid` | Thumbnail grid for picked/uploaded images |
| `progress-bar.tsx` | `ProgressBar` | `ProgressColor` variants |
| `stat-card.tsx` | `StatCard` | Generic KPI tile (`StatCardData`) |
| `status-badge.tsx` | `StatusBadge` | Coloured status pill |
| `tag-input.tsx` | `TagInput` | Free-text chip list (`mainProblems`, `goals`) |
| `timeline-steps.tsx` | `TimelineSteps` | Horizontal step tracker |

Shared UI types (`StatCardData`, `TableColumn<T>`, `ProgressColor`) live in
`types/ui.types.ts`, not next to the component.

### Where a component starts

In `features/<domain>/components/`. It moves to `components/shared/` the moment
a **second feature** imports it — never before. A speculative shared component
has no caller to validate its props and rots into dead code.

## Interaction conventions

| Concern | Rule |
|---|---|
| Destructive actions | `await useConfirm()({ title, description, confirmLabel, variant: 'destructive' })`; copy from `<domain>-dialog.constants.ts`. Never delete on a bare click. |
| Confirm/cancel labels | `CONFIRM_DIALOG_TEXT` in `constants/confirm-dialog.ts` |
| Success feedback | `toast.success` (sonner, mounted once) |
| Search inputs | `useDebounce(value, 300)` (`hooks/use-debounce.ts`) |
| Filter change | Always reset the page to 1 — a stale page number renders an empty table that reads as "no results" |
| Permission-gated controls | Hide with `can(...)`, don't disable |
| Styling | Tailwind utilities only. No inline `style` except computed values (chart geometry, gradients) |
| Class merging | `cn()` (`utils/cn.ts` — clsx + tailwind-merge) |
| Class order | Sorted automatically by `prettier-plugin-tailwindcss`; do not fight it |

## File upload UI

Exactly two shapes; a third is a design error.

1. **Picker** — used before the entity exists (`StoreMediaPicker` inside
   `CreateStoreForm`). Files are buffered in `useState<File[]>` and uploaded in
   the parent mutation's `onSuccess`. The picker itself never calls a service.
2. **Manager** — used against an existing id (`StorePhotoGalleryManager`,
   `StoreDocumentManager`, `StoreCoverManager`). Selecting a file fires the
   upload mutation immediately.

Both must: reset `e.target.value = ''` after reading the file; validate size
with `isFileSizeValid` / `fileTooLargeMessage` (`utils/validate-file-size.ts`)
against `MAX_FILE_SIZE_BYTES`; report failures via
`toast.error(extractErrorMessage(err))`; create object URLs in a `useEffect` and
revoke them in the cleanup. Already-uploaded files render through
`buildFileUrl()`, never an object URL.

Standard `accept` sets — do not invent a third:

| Purpose | `accept` |
|---|---|
| Images | `image/jpeg,image/png,image/webp` |
| Documents | `application/pdf,.xlsx,.docx,.csv` |
| Assessment evidence | `EVIDENCE_ACCEPT` = `image/jpeg,image/png,image/webp,application/pdf,.xlsx` (narrower — mirrors the API's extension whitelist) |

Full rules: `.claude/rules/file-upload-patterns.md`.

## Text constants

User-facing Thai strings live in `features/<domain>/constants/*.constants.ts` as
`UPPER_SNAKE` objects, including the function-valued ones for interpolation:

```ts
export const REPORT_TEXT = {
  pageTitle: 'รายงานผลการประเมิน',
  matrixStoreCount: (count: number) => `ร้านที่ส่งผลการประเมินรอบนี้ ${count} ร้าน`,
} as const;
```

The exception is a string with exactly one, non-reused call site — the title and
message of a status page stay inline. Extract on the second consumer, not
before. See `.claude/rules/text-constants.md`.

## Accessibility

Semantic elements throughout; `aria-label` on icon-only buttons (sidebar
collapse, logout), `aria-pressed` on the score buttons, `aria-label` on both
`<nav>` landmarks and on `DataTable`. Decorative images carry `aria-hidden` and
`alt=""`. Charts are decorative wrappers around a data table or list wherever
one exists.
