'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutChart } from '@/components/shared/donut-chart'
import { CardSkeleton } from '@/components/shared/loading'
import { AlertCard } from '@/components/shared/alert-card'
import { useProvinceDistribution } from '../hooks/use-dashboard'
import { PROVINCE_DONUT_TEXT } from '../constants/dashboard-cards.constants'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { colors } from '@/styles/tokens'

const PROVINCE_COLORS = [
  colors.orange,
  colors.orangeLight,
  colors.charcoal,
  colors.scoreGreen,
  colors.scoreRed,
]

export function ProvinceDonut() {
  const { data, isLoading, isError, error } = useProvinceDistribution()

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

  if (!data) return null

  const total = data.reduce((sum, d) => sum + d.count, 0)
  const chartData = data.map((d, i) => ({
    label: d.province,
    value: d.count,
    color: PROVINCE_COLORS[i % PROVINCE_COLORS.length],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{PROVINCE_DONUT_TEXT.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <DonutChart
          data={chartData}
          centerValue={total}
          centerLabel={PROVINCE_DONUT_TEXT.centerLabel}
          height={240}
        />
      </CardContent>
    </Card>
  )
}
