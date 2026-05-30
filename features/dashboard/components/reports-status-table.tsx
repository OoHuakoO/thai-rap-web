'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { AlertCard } from '@/components/shared/alert-card'
import { useReportsStatus } from '../hooks/use-dashboard'
import { extractErrorMessage } from '@/utils/extract-error-message'
import type { ReportStatusItem } from '../types/dashboard.types'
import type { TableColumn } from '@/types'

const columns: TableColumn<ReportStatusItem>[] = [
  { key: 'name', header: 'รายงาน' },
  { key: 'type', header: 'ประเภท', className: 'text-muted-foreground' },
  {
    key: 'status',
    header: 'สถานะ',
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'updatedAt',
    header: 'อัพเดต',
    className: 'text-muted-foreground text-xs',
  },
]

export function ReportsStatusTable() {
  const { data, isLoading, isError, error } = useReportsStatus()

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
        <CardTitle className="text-sm font-semibold">สถานะรายงาน</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data ?? []}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="ยังไม่มีรายงาน"
        />
      </CardContent>
    </Card>
  )
}
