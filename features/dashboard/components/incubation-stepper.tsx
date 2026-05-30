'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimelineSteps } from '@/components/shared/timeline-steps'
import { ProgressBar } from '@/components/shared/progress-bar'
import { CardSkeleton } from '@/components/shared/loading'
import { AlertCard } from '@/components/shared/alert-card'
import { useIncubationSteps } from '../hooks/use-dashboard'
import { extractErrorMessage } from '@/utils/extract-error-message'

export function IncubationStepper() {
  const { data: steps, isLoading, isError, error } = useIncubationSteps()

  if (isLoading) return <CardSkeleton />

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        </CardContent>
      </Card>
    )
  }

  if (!steps) return null

  const timelineSteps = steps.map((s) => ({
    label: s.label,
    sublabel: `${s.count} ร้าน`,
    status: s.status,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">ขั้นตอนการบ่มเพาะ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimelineSteps steps={timelineSteps} />
        <div className="space-y-2.5 pt-2">
          {steps.map((step) => (
            <ProgressBar
              key={step.label}
              value={step.percent}
              label={`${step.label} ${step.sublabel}`}
              showPercentage
              color={
                step.status === 'completed'
                  ? 'success'
                  : step.status === 'active'
                  ? 'default'
                  : 'warning'
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
