'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/shared/loading'
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge'
import { ROUTES } from '@/constants/routes'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { useAssessmentSummaries } from '@/features/assessment/hooks/use-assessment'
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

const DECIDED_STATUSES: StoreStatus[] = ['SELECTED', 'CONDITIONAL_SELECTED', 'WAITING_LIST', 'NOT_SELECTED']

const DOC_ICON: Record<'pdf' | 'xlsx' | 'docx', string> = {
  pdf: '📄',
  xlsx: '📊',
  docx: '📝',
}

const DOC_CLASS: Record<'pdf' | 'xlsx' | 'docx', string> = {
  pdf: 'bg-destructive/10',
  xlsx: 'bg-score-green/10',
  docx: 'bg-blue-100',
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface StoreDetailProps {
  storeId: string
}

export function StoreDetail({ storeId }: StoreDetailProps) {
  const { data: store, isLoading, isError, error } = useStore(storeId)
  const { data: summaries } = useAssessmentSummaries(storeId)

  if (isLoading) return <Loading className="py-16" />

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>
  }

  if (!store) {
    return <p className="py-8 text-center text-muted-foreground">ไม่พบร้านนี้</p>
  }

  const t0SubmittedAt = summaries?.find((s) => s.round === 'T0')?.submittedAt ?? null
  const t1SubmittedAt = summaries?.find((s) => s.round === 'T1')?.submittedAt ?? null
  const decided = DECIDED_STATUSES.includes(store.status)

  const timeline = [
    { label: 'ลงทะเบียนร้านอาหาร', date: store.createdAt, done: true },
    { label: 'ประเมิน T0', date: t0SubmittedAt, done: !!t0SubmittedAt },
    { label: 'ประเมิน T1', date: t1SubmittedAt, done: !!t1SubmittedAt },
    { label: 'รอประกาศผลการคัดเลือก', date: null, done: decided },
  ]

  const problemTags = store.mainProblems?.split(',').map((p) => p.trim()).filter(Boolean) ?? []
  const goalTags = store.goals?.split(',').map((g) => g.trim()).filter(Boolean) ?? []

  return (
    <div className="space-y-4">
      <div className="relative flex h-[110px] items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-br from-orange to-orange-light">
        <span className="text-5xl">🍜</span>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
          <p className="text-sm font-bold text-white">{store.name}</p>
          <p className="text-[10.5px] text-white/85">
            📍 {store.province} &nbsp;|&nbsp; 🍽 {store.storeType}
          </p>
        </div>
        <div className="absolute right-2 top-2">
          <StatusBadge status={STATUS_VARIANT[store.status]} label={STORE_STATUS_LABELS[store.status]} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-3 pb-3 sm:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-bold text-charcoal">ข้อมูลติดต่อ</p>
            <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1 text-[10.5px]">
              <span className="text-muted-foreground">เจ้าของร้าน</span>
              <span className="font-medium text-charcoal">{store.ownerName}</span>
              <span className="text-muted-foreground">เบอร์โทร</span>
              <span className="font-medium text-charcoal">{store.phone}</span>
              {store.email && (
                <>
                  <span className="text-muted-foreground">อีเมล</span>
                  <span className="font-medium text-charcoal">{store.email}</span>
                </>
              )}
              <span className="text-muted-foreground">ที่อยู่</span>
              <span className="font-medium leading-relaxed text-charcoal">{store.address}</span>
              {store.avgRevenue !== null && (
                <>
                  <span className="text-muted-foreground">ยอดขาย/เดือน</span>
                  <span className="font-medium text-orange">{store.avgRevenue.toLocaleString()} บาท</span>
                </>
              )}
            </div>
            {store.socialLinks.facebook && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <a
                  href={store.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1877f2] text-[10px] text-white"
                  title="Facebook"
                >
                  f
                </a>
              </div>
            )}
          </div>

          {problemTags.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-charcoal">ปัญหาสำคัญ</p>
              <div className="flex flex-wrap gap-1">
                {problemTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[9.5px] text-destructive"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {goalTags.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-charcoal">เป้าหมายการพัฒนา</p>
              <div className="flex flex-wrap gap-1">
                {goalTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-[9.5px] text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-bold text-charcoal">เอกสารที่อัปโหลด</p>
            {(store.documents?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-2">
                {store.documents.map((doc) => (
                  <div key={doc.name} className="w-16 text-center">
                    <div
                      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-md text-base ${DOC_CLASS[doc.fileType]}`}
                    >
                      {DOC_ICON[doc.fileType]}
                    </div>
                    <p className="mt-0.5 truncate text-[8.5px] text-muted-foreground">{doc.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10.5px] text-muted-foreground">ยังไม่มีเอกสารอัปโหลด</p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold text-charcoal">สถานะเข้าร่วมโครงการ</p>
            <div className="space-y-2">
              {timeline.map((t, i) => (
                <div key={t.label} className="flex items-start gap-2">
                  <span
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                      t.done ? 'bg-score-green text-white' : 'border-2 border-border bg-muted'
                    }`}
                  >
                    {t.done ? '✓' : ''}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-charcoal">{t.label}</p>
                    {t.date && <p className="text-[9px] text-muted-foreground">{formatDate(t.date)}</p>}
                  </div>
                  {i < timeline.length - 1 && null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t px-3 pb-3 pt-3">
        <p className="mb-2 text-xs font-bold text-charcoal">ประเมินร้าน</p>
        <div className="flex flex-wrap gap-2">
          {ASSESSMENT_ROUNDS.map(({ round, label }) => (
            <Button key={round} variant="outline" size="sm" asChild>
              <Link href={ROUTES.ASSESSMENT_DETAIL(store.id, round)}>{label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
