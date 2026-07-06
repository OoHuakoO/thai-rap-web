'use client'

import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge'
import { ROUTES } from '@/constants/routes'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { useStores, STORE_STATUS_LABELS } from '@/features/store'
import type { Store, StoreStatus } from '@/features/store'
import type { TableColumn } from '@/types'

const STATUS_VARIANT: Record<StoreStatus, StatusVariant> = {
  REGISTERED: 'new',
  T0_COMPLETED: 'pending',
  CAMP_COMPLETED: 'pending',
  T1_COMPLETED: 'pending',
  PITCHING_COMPLETED: 'pending',
  SELECTED: 'pass',
  CONDITIONAL_SELECTED: 'warning',
  WAITING_LIST: 'pending',
  NOT_SELECTED: 'fail',
  FIELD_AUDITED: 'pending',
  IDP_CREATED: 'pending',
  COMPLETED: 'active',
}

export function AssessmentStoreList() {
  const router = useRouter()
  const { data, isLoading, isError, error } = useStores()

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>
  }

  const columns: TableColumn<Store>[] = [
    {
      key: 'name',
      header: 'ร้าน',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange to-orange-light text-base text-white">
            🍜
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.ownerName} · {row.storeType}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'province', header: 'จังหวัด' },
    {
      key: 'status',
      header: 'สถานะ',
      cell: (row) => (
        <StatusBadge status={STATUS_VARIANT[row.status]} label={STORE_STATUS_LABELS[row.status]} />
      ),
    },
  ]

  return (
    <DataTable<Store>
      columns={columns}
      data={data?.items ?? []}
      keyField="id"
      isLoading={isLoading}
      emptyMessage="ยังไม่มีร้านให้ประเมิน"
      className="bg-card"
      onRowClick={(row) => router.push(ROUTES.ASSESSMENT_PICK_ROUND(row.id))}
    />
  )
}
