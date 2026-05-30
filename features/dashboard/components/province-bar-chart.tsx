'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from '@/components/shared/bar-chart'
import { CardSkeleton } from '@/components/shared/loading'
import { AlertCard } from '@/components/shared/alert-card'
import { useProvinceComparison } from '../hooks/use-dashboard'
import { extractErrorMessage } from '@/utils/extract-error-message'

export function ProvinceBarChart() {
  const { data, isLoading, isError, error } = useProvinceComparison()

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

  const chartData = data.map((d) => ({
    label: d.province,
    t0: d.t0,
    t1: d.t1,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">เปรียบเทียบคะแนน T0 vs T1 รายจังหวัด</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          data={chartData}
          series={[
            { key: 't0', label: 'T0 ประเมินเบื้องต้น' },
            { key: 't1', label: 'T1 ประเมินเชิงลึก' },
          ]}
          height={240}
        />
      </CardContent>
    </Card>
  )
}
