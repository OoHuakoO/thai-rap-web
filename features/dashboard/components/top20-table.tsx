'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { AlertCard } from '@/components/shared/alert-card'
import { useTop20 } from '../hooks/use-dashboard'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { cn } from '@/utils/cn'
import type { Top20Item } from '../types/dashboard.types'
import type { TableColumn } from '@/types'

const columns: TableColumn<Top20Item>[] = [
  {
    key: 'rank',
    header: '#',
    className: 'w-10 text-center font-medium text-muted-foreground',
    cell: (row) => (
      <span className={cn('font-semibold', row.rank <= 3 && 'text-orange')}>{row.rank}</span>
    ),
  },
  { key: 'name', header: 'ชื่อร้าน' },
  { key: 'province', header: 'จังหวัด', className: 'text-muted-foreground' },
  { key: 'type', header: 'ประเภท', className: 'text-muted-foreground' },
  {
    key: 'score',
    header: 'คะแนน',
    className: 'text-right',
    cell: (row) => (
      <span
        className={cn(
          'font-semibold tabular-nums',
          row.score >= 80 ? 'text-score-green' : row.score >= 60 ? 'text-orange' : 'text-score-red'
        )}
      >
        {row.score}
      </span>
    ),
  },
]

export function Top20Table() {
  const { data, isLoading, isError, error } = useTop20()

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <AlertCard variant="error" message={extractErrorMessage(error)} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Top 20 ร้านคะแนนสูงสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data ?? []}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="ยังไม่มีข้อมูลร้านอาหาร"
        />
      </CardContent>
    </Card>
  )
}
