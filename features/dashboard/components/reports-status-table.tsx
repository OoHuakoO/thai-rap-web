'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { AlertCard } from '@/components/shared/alert-card'
import { useReportsStatus } from '../hooks/use-dashboard'
import { REPORTS_STATUS_TABLE_TEXT } from '../constants/dashboard-cards.constants'
import { extractErrorMessage } from '@/utils/extract-error-message'
import type { ReportStatusItem } from '../types/dashboard.types'
import type { TableColumn } from '@/types'

const columns: TableColumn<ReportStatusItem>[] = [
  { key: 'name', header: REPORTS_STATUS_TABLE_TEXT.nameColumn },
  { key: 'type', header: REPORTS_STATUS_TABLE_TEXT.typeColumn, className: 'text-muted-foreground' },
  {
    key: 'status',
    header: REPORTS_STATUS_TABLE_TEXT.statusColumn,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'updatedAt',
    header: REPORTS_STATUS_TABLE_TEXT.updatedAtColumn,
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
        <CardTitle className="text-sm font-semibold">{REPORTS_STATUS_TABLE_TEXT.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data ?? []}
          keyField="id"
          isLoading={isLoading}
          emptyMessage={REPORTS_STATUS_TABLE_TEXT.empty}
        />
      </CardContent>
    </Card>
  )
}
