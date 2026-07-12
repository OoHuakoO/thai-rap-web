import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export type StatusVariant =
  | 'pass'
  | 'fail'
  | 'new'
  | 'pending'
  | 'active'
  | 'inactive'
  | 'warning'
  | 'purple'

interface StatusBadgeProps {
  status: StatusVariant
  label?: string
  className?: string
}

const variantClassName: Record<StatusVariant, string> = {
  pass:     'border-score-green/20 bg-score-green/10 text-score-green hover:bg-score-green/20',
  fail:     'border-score-red/20 bg-score-red/10 text-score-red hover:bg-score-red/20',
  new:      'border-orange/20 bg-orange/10 text-orange hover:bg-orange/20',
  pending:  'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  active:   'border-score-green/20 bg-score-green/10 text-score-green hover:bg-score-green/20',
  inactive: 'border-border bg-muted text-muted-foreground hover:bg-muted/80',
  warning:  'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  purple:   'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
}

const defaultLabel: Record<StatusVariant, string> = {
  pass:     'ผ่าน',
  fail:     'ไม่ผ่าน',
  new:      'ใหม่',
  pending:  'รอดำเนินการ',
  active:   'ใช้งาน',
  inactive: 'ปิดใช้งาน',
  warning:  'แจ้งเตือน',
  purple:   'ประเมินแล้ว',
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(variantClassName[status], className)}
    >
      {label ?? defaultLabel[status]}
    </Badge>
  )
}
