'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/shared/loading'
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge'
import { ROUTES } from '@/constants/routes'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { useStore } from '../hooks/use-stores'
import { STORE_STATUS_LABELS } from '../types/store.types'
import type { StoreStatus } from '../types/store.types'

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

const ASSESSMENT_ROUNDS = [
  { round: 'T0', label: 'T0 — ก่อนเข้าค่าย' },
  { round: 'T1', label: 'T1 — หลังค่าย' },
  { round: 'T2', label: 'T2 — Field Audit' },
  { round: 'T3', label: 'T3 — ติดตาม 1 เดือน' },
  { round: 'T4', label: 'T4 — ติดตาม 3 เดือน' },
] as const

interface StoreDetailProps {
  storeId: string
}

export function StoreDetail({ storeId }: StoreDetailProps) {
  const { data: store, isLoading, isError, error } = useStore(storeId)

  if (isLoading) return <Loading className="py-16" />

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>
  }

  if (!store) {
    return <p className="py-8 text-center text-muted-foreground">ไม่พบร้านนี้</p>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{store.name}</CardTitle>
          <StatusBadge status={STATUS_VARIANT[store.status]} label={STORE_STATUS_LABELS[store.status]} />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">จังหวัด</p>
            <p>{store.province}</p>
          </div>
          <div>
            <p className="text-muted-foreground">ประเภทร้าน</p>
            <p>{store.storeType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">เจ้าของร้าน</p>
            <p>{store.ownerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">เบอร์โทร</p>
            <p>{store.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">ที่อยู่</p>
            <p>{store.address}</p>
          </div>
          {store.mainProblems && (
            <div className="col-span-2">
              <p className="text-muted-foreground">ปัญหาหลัก</p>
              <p>{store.mainProblems}</p>
            </div>
          )}
          {store.goals && (
            <div className="col-span-2">
              <p className="text-muted-foreground">เป้าหมายการพัฒนา</p>
              <p>{store.goals}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ประเมินร้าน</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {ASSESSMENT_ROUNDS.map(({ round, label }) => (
            <Button key={round} variant="outline" asChild>
              <Link href={ROUTES.ASSESSMENT_DETAIL(store.id, round)}>{label}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
