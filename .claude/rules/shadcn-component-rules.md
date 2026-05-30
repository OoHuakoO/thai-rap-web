# Shadcn Component Rules

All project components must be built on top of shadcn/ui primitives.
Never write raw HTML elements when a shadcn equivalent exists.

---

## Core Principle

shadcn/ui is the single source of UI primitives for this project.
Custom components wrap or extend shadcn — they never replace it.

---

## Available shadcn Components

All installed shadcn components live in `components/ui/`:

| Category | Components |
|---|---|
| Form | `Button`, `Input`, `Label`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Slider`, `Calendar` |
| Display | `Badge`, `Card`, `Alert`, `Avatar`, `Skeleton`, `Progress`, `Separator`, `ScrollArea` |
| Overlay | `Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`, `HoverCard` |
| Navigation | `Tabs`, `Breadcrumb`, `Pagination` |
| Data | `Table`, `Chart` |
| Layout | `Accordion`, `Collapsible`, `Resizable` |
| Feedback | `Sonner` (toast) |

---

## Rules

### DO — Use shadcn primitives as base

```tsx
// ✓ Wrap shadcn Badge
import { Badge } from '@/components/ui/badge'

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant="outline" className={variantClassName[status]}>...</Badge>
}
```

```tsx
// ✓ Wrap shadcn Alert
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export function AlertCard({ variant, title, message }: AlertCardProps) {
  return (
    <Alert className={variantClass}>
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
```

```tsx
// ✓ Use shadcn Avatar
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>
```

```tsx
// ✓ Use shadcn Chart (wraps Recharts)
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

<ChartContainer config={chartConfig}>
  <BarChart data={data}>
    <ChartTooltip content={<ChartTooltipContent />} />
    ...
  </BarChart>
</ChartContainer>
```

### DON'T — Write raw HTML when shadcn exists

```tsx
// ✗ Raw div for badge
<div className="rounded-full border px-2 py-0.5 text-xs">ผ่าน</div>

// ✗ Raw div for alert
<div className="flex gap-3 rounded-lg border p-3 bg-amber-50">
  <AlertTriangle />
  <p>message</p>
</div>

// ✗ Raw div for avatar initials
<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
  {user.name[0]}
</div>

// ✗ Recharts without ChartContainer
<ResponsiveContainer>
  <BarChart data={data}>
    <Tooltip />
  </BarChart>
</ResponsiveContainer>
```

---

## Adding a New shadcn Component

When you need a component that is not yet installed:

```bash
npx shadcn@latest add <component-name>
```

Check `https://ui.shadcn.com/docs/components` for the full list.
Do NOT write a custom implementation before checking if shadcn has it.

---

## Extending shadcn Components

When shadcn's default variants are not enough, extend via `className` prop:

```tsx
// ✓ Extend with className — don't fork the component
<Button className="bg-orange text-white hover:bg-orange-light">
  Custom CTA
</Button>

// ✓ Use cva to add project-specific variants to a wrapper
const statusBadgeVariants = cva('', {
  variants: {
    status: {
      pass: 'border-score-green/20 bg-score-green/10 text-score-green',
      fail: 'border-score-red/20 bg-score-red/10 text-score-red',
    },
  },
})
```

Never modify files in `components/ui/` directly — they are shadcn-managed.
Customization belongs in `components/shared/` wrappers.

---

## Chart Components

All charts use shadcn `ChartContainer` as the wrapper.
Raw `ResponsiveContainer` from Recharts is not used directly.

```tsx
// ✓ Correct
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const chartConfig: ChartConfig = {
  value: { label: 'Value', color: 'var(--color-orange)' },
}

<ChartContainer config={chartConfig} style={{ height: 280 }}>
  <BarChart data={data}>
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="value" fill="var(--color-value)" />
  </BarChart>
</ChartContainer>
```

Chart CSS variables `--chart-1` through `--chart-5` are defined in `globals.css`
and map to brand colors (orange → orange-light → charcoal → score-green → score-red).

---

## Loading States

Use shadcn `Skeleton` for content placeholders.
Use `Loading` spinner from `components/shared/loading.tsx` for full-area loading.

```tsx
// ✓ Skeleton for table placeholder
import { TableSkeleton } from '@/components/shared/loading'
if (isLoading) return <TableSkeleton rows={5} cols={4} />

// ✓ Skeleton for card placeholder
import { CardSkeleton } from '@/components/shared/loading'
if (isLoading) return <CardSkeleton />

// ✓ Spinner for full area
import { Loading } from '@/components/shared/loading'
if (isLoading) return <Loading className="py-8" />
```

---

## Form Fields

Always use shadcn form primitives together:

```tsx
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

<div className="space-y-1.5">
  <Label htmlFor="name">ชื่อร้าน</Label>
  <Input id="name" {...register('name')} />
  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
</div>
```

---

## Checklist Before Creating Any Component

- [ ] Check if shadcn has this component at `https://ui.shadcn.com/docs/components`
- [ ] If yes — install it with `npx shadcn@latest add <name>`, then wrap it
- [ ] If no — build custom in `components/shared/` using existing shadcn primitives as building blocks
- [ ] Never modify files in `components/ui/`
- [ ] Never use raw `<div>` where shadcn `Card`, `Alert`, `Badge`, etc. fits
- [ ] Charts always use `ChartContainer` from `components/ui/chart`
