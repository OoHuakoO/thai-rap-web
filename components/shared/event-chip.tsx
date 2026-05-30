import { cn } from '@/utils/cn'

export type EventChipVariant = 'default' | 'active' | 'warning' | 'success' | 'error'

interface EventChipProps {
  label: string
  date?: string
  variant?: EventChipVariant
  onClick?: () => void
  className?: string
}

const variantConfig: Record<EventChipVariant, string> = {
  default: 'bg-white border-border text-charcoal hover:border-orange',
  active:  'bg-orange border-orange text-white',
  warning: 'bg-amber-50 border-amber-300 text-amber-700',
  success: 'bg-score-green/10 border-score-green/30 text-score-green',
  error:   'bg-score-red/10 border-score-red/30 text-score-red',
}

export function EventChip({ label, date, variant = 'default', onClick, className }: EventChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex flex-col items-center gap-0.5 rounded-lg border px-3 py-1.5 text-center transition-colors',
        onClick ? 'cursor-pointer' : 'cursor-default',
        variantConfig[variant],
        className
      )}
    >
      {date && <span className="text-xs font-medium tabular-nums">{date}</span>}
      <span className="max-w-[80px] truncate text-xs leading-tight">{label}</span>
    </button>
  )
}

interface EventChipRowProps {
  chips: Omit<EventChipProps, 'className'>[]
  className?: string
}

export function EventChipRow({ chips, className }: EventChipRowProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <EventChip key={`${chip.label}-${chip.date ?? ''}`} {...chip} />
      ))}
    </div>
  )
}
