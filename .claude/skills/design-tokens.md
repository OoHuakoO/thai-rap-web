---
name: design-tokens
description: Design token reference for this project. Use when styling components — colors, font sizes, spacing, shadows, border radius. Source of truth is styles/tokens.ts.
---

# Design Tokens

Source: `styles/tokens.ts`
Import: `import { colors, fontSizes, spacing, shadows, borderRadius } from '@/styles/tokens'`

Use tokens for **JS contexts** (Recharts, dynamic styles, conditional styling).
Use **Tailwind classes** for static styles in JSX.

---

## Colors

| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| `colors.orange` | `#F97316` | `bg-orange` / `text-orange` | Primary CTA, active nav |
| `colors.purple` | `#7C3AED` | `bg-purple` / `text-purple` | Secondary badges |
| `colors.darkNav` | `#1F2937` | `bg-dark-nav` | Sidebar background |
| `colors.textMain` | `#111827` | `text-text-main` | Body text |
| `colors.scoreGreen` | `#10B981` | `text-score-green` | Positive score |
| `colors.scoreRed` | `#EF4444` | `text-score-red` | Negative score / error |

---

## Font Sizes

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `fontSizes.xs` | 12px | `text-xs` | Captions, labels |
| `fontSizes.sm` | 14px | `text-sm` | Secondary text, table rows |
| `fontSizes.base` | 16px | `text-base` | Body text |
| `fontSizes.lg` | 18px | `text-lg` | Subheadings |
| `fontSizes.xl` | 20px | `text-xl` | Card titles |
| `fontSizes['2xl']` | 24px | `text-2xl` | Section headings |
| `fontSizes['3xl']` | 30px | `text-3xl` | Page headings |
| `fontSizes['4xl']` | 36px | `text-4xl` | Hero headings |

---

## Spacing

4px base unit — matches Tailwind's default scale.

| Token | Value | Tailwind |
|---|---|---|
| `spacing[1]` | 4px | `p-1` / `m-1` / `gap-1` |
| `spacing[2]` | 8px | `p-2` / `m-2` / `gap-2` |
| `spacing[4]` | 16px | `p-4` / `m-4` / `gap-4` |
| `spacing[6]` | 24px | `p-6` / `m-6` / `gap-6` |
| `spacing[8]` | 32px | `p-8` / `m-8` / `gap-8` |
| `spacing[12]` | 48px | `p-12` / `m-12` |
| `spacing[16]` | 64px | `p-16` / `m-16` |

---

## Shadows

| Token | Tailwind | Use |
|---|---|---|
| `shadows.sm` | `shadow-sm` | Subtle lift, inputs |
| `shadows.md` | `shadow-md` | Dropdowns |
| `shadows.lg` | `shadow-lg` | Modals |
| `shadows.xl` | `shadow-xl` | Popovers |
| `shadows.card` | — | Cards (custom, use JS token) |
| `shadows.none` | `shadow-none` | Remove shadow |

---

## Border Radius

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `borderRadius.sm` | 4px | `rounded-sm` | Inputs, small elements |
| `borderRadius.md` | 6px | `rounded-md` | Buttons |
| `borderRadius.lg` | 8px | `rounded-lg` | Cards (matches `--radius`) |
| `borderRadius.xl` | 12px | `rounded-xl` | Modals, large panels |
| `borderRadius['2xl']` | 16px | `rounded-2xl` | Hero sections |
| `borderRadius.full` | 9999px | `rounded-full` | Pills, badges, avatars |

---

## Fonts

Defined in `styles/fonts.ts`. Applied globally in `app/layout.tsx`.

| Font | Variable | Tailwind | Use |
|---|---|---|---|
| Inter | `--font-inter` | `font-sans` | Default UI font (Latin) |
| Sarabun | `--font-sarabun` | `font-thai` | Thai script sections |

---

## Usage Examples

```tsx
// Tailwind (preferred for static styles)
<button className="bg-orange text-white rounded-md px-4 py-2 shadow-sm">
  Submit
</button>

<span className="text-score-green font-semibold text-sm">+12%</span>

<nav className="bg-dark-nav" />
```

```tsx
// TypeScript tokens (for Recharts, dynamic styles)
import { colors, shadows } from '@/styles/tokens'

<RadarChart>
  <Radar stroke={colors.orange} fill={colors.orange} fillOpacity={0.2} />
  <Radar stroke={colors.scoreGreen} fill={colors.scoreGreen} fillOpacity={0.2} />
</RadarChart>

// Dynamic shadow based on state
<div style={{ boxShadow: isActive ? shadows.lg : shadows.sm }}>
```
