import { cn } from '@/utils/cn'
import { colors } from '@/styles/tokens'

interface ScoreCircleProps {
  score: number
  maxScore?: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizeConfig = {
  sm: { container: 'h-16 w-16', text: 'text-lg', sub: 'text-xs', viewBox: 40, r: 16 },
  md: { container: 'h-24 w-24', text: 'text-2xl', sub: 'text-xs', viewBox: 56, r: 24 },
  lg: { container: 'h-32 w-32', text: 'text-3xl', sub: 'text-sm', viewBox: 80, r: 34 },
}

export function ScoreCircle({ score, maxScore = 100, size = 'md', label, className }: ScoreCircleProps) {
  const cfg = sizeConfig[size]
  const pct = Math.min(100, Math.max(0, (score / maxScore) * 100))

  const vb = cfg.viewBox
  const cx = vb / 2
  const cy = vb / 2
  const r = cfg.r
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference

  const fillColor = pct >= 70 ? colors.orange : pct >= 50 ? colors.orangeLight : colors.scoreRed

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className={cn('relative flex items-center justify-center', cfg.container)}>
        <svg
          viewBox={`0 0 ${vb} ${vb}`}
          className="absolute inset-0 h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.cream} strokeWidth={4} />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={fillColor}
            strokeWidth={4}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="relative flex flex-col items-center leading-none">
          <span className={cn('font-bold tabular-nums text-charcoal', cfg.text)}>{score}</span>
          <span className={cn('text-muted-foreground', cfg.sub)}>/{maxScore}</span>
        </div>
      </div>
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
    </div>
  )
}
