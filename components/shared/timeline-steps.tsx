import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface TimelineStep {
  label: string
  sublabel?: string
  status: 'completed' | 'active' | 'pending'
}

interface TimelineStepsProps {
  steps: TimelineStep[]
  className?: string
}

export function TimelineSteps({ steps, className }: TimelineStepsProps) {
  return (
    <div className={cn('flex items-start', className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1

        return (
          <div key={i} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                  step.status === 'completed' && 'border-orange bg-orange text-white',
                  step.status === 'active'    && 'border-orange bg-cream text-orange',
                  step.status === 'pending'   && 'border-border bg-white text-muted-foreground'
                )}
              >
                {step.status === 'completed' ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>

              {!isLast && (
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    step.status === 'completed' ? 'bg-orange' : 'bg-border'
                  )}
                />
              )}
            </div>

            <div className="mt-1.5 max-w-[80px] space-y-0.5 text-center">
              <p
                className={cn(
                  'text-xs font-medium leading-tight',
                  step.status === 'active' || step.status === 'completed'
                    ? 'text-charcoal'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.sublabel && (
                <p className="text-xs text-muted-foreground">{step.sublabel}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
