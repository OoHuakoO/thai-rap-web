'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/shared/loading'
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge'
import { ROUTES } from '@/constants/routes'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { buildFileUrl } from '@/utils/build-file-url'
import { useAssessmentSummaries } from '@/features/assessment'
import { useStore } from '../hooks/use-stores'
import { STORE_DETAIL_TEXT, ASSESSMENT_ROUND_LABELS } from '../constants/store-detail.constants'
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

const DECIDED_STATUSES: StoreStatus[] = ['SELECTED', 'CONDITIONAL_SELECTED', 'WAITING_LIST', 'NOT_SELECTED']

function getDocIcon(fileType: string): { icon: string; className: string } {
  if (fileType.includes('pdf')) return { icon: '📄', className: 'bg-destructive/10' }
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return { icon: '📊', className: 'bg-score-green/10' }
  }
  if (fileType.startsWith('image/')) return { icon: '🖼', className: 'bg-blue-100' }
  return { icon: '📝', className: 'bg-blue-100' }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
    return <p className="py-8 text-center text-muted-foreground">{STORE_DETAIL_TEXT.notFound}</p>
  }

  const t0SubmittedAt = summaries?.find((s) => s.round === 'T0')?.submittedAt ?? null
  const t1SubmittedAt = summaries?.find((s) => s.round === 'T1')?.submittedAt ?? null
  const decided = DECIDED_STATUSES.includes(store.status)

  const timeline = [
    { label: STORE_DETAIL_TEXT.timelineRegistered, date: store.createdAt, done: true },
    { label: STORE_DETAIL_TEXT.timelineT0, date: t0SubmittedAt, done: !!t0SubmittedAt },
    { label: STORE_DETAIL_TEXT.timelineT1, date: t1SubmittedAt, done: !!t1SubmittedAt },
    { label: STORE_DETAIL_TEXT.timelinePendingResult, date: null, done: decided },
  ]

  return (
    <div className="space-y-4">
      <div className="relative flex h-[110px] items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-br from-orange to-orange-light">
        {store.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={buildFileUrl(store.logoUrl)}
            alt={store.name}
            className="h-16 w-16 rounded-full border-2 border-white object-cover"
          />
        ) : (
          <span className="text-5xl">🍜</span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
          <p className="text-sm font-bold text-white">{store.name}</p>
          <p className="text-[10.5px] text-white/85">
            📍 {store.province} &nbsp;|&nbsp; 🍽 {store.storeType}
          </p>
        </div>
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <StatusBadge status={STATUS_VARIANT[store.status]} label={STORE_STATUS_LABELS[store.status]} />
          <Button variant="secondary" size="icon" className="h-6 w-6" title={STORE_DETAIL_TEXT.editStoreTitle} asChild>
            <Link href={ROUTES.STORE_EDIT(store.id)}>
              <Pencil className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-3 pb-3 sm:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-bold text-charcoal">{STORE_DETAIL_TEXT.contactInfoTitle}</p>
            <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1 text-[10.5px]">
              <span className="text-muted-foreground">{STORE_DETAIL_TEXT.ownerNameLabel}</span>
              <span className="font-medium text-charcoal">{store.ownerName}</span>
              <span className="text-muted-foreground">{STORE_DETAIL_TEXT.phoneLabel}</span>
              <span className="font-medium text-charcoal">{store.phone}</span>
              {store.email && (
                <>
                  <span className="text-muted-foreground">{STORE_DETAIL_TEXT.emailLabel}</span>
                  <span className="font-medium text-charcoal">{store.email}</span>
                </>
              )}
              <span className="text-muted-foreground">{STORE_DETAIL_TEXT.addressLabel}</span>
              <span className="font-medium leading-relaxed text-charcoal">{store.address}</span>
              {store.avgRevenue !== null && (
                <>
                  <span className="text-muted-foreground">{STORE_DETAIL_TEXT.avgRevenueLabel}</span>
                  <span className="font-medium text-orange">
                    {store.avgRevenue.toLocaleString()} {STORE_DETAIL_TEXT.currencyUnit}
                  </span>
                </>
              )}
            </div>
            {(store.socialLinks.facebook || store.socialLinks.line || store.socialLinks.instagram) && (
              <div className="mt-1.5 flex items-center gap-1.5">
                {store.socialLinks.facebook && (
                  <a
                    href={store.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1877f2] text-[10px] text-white"
                    title={STORE_DETAIL_TEXT.facebookTitle}
                  >
                    f
                  </a>
                )}
                {store.socialLinks.line && (
                  <a
                    href={store.socialLinks.line}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-[#06c755] text-[10px] font-bold text-white"
                    title={STORE_DETAIL_TEXT.lineTitle}
                  >
                    L
                  </a>
                )}
                {store.socialLinks.instagram && (
                  <a
                    href={store.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-[10px] text-white"
                    title={STORE_DETAIL_TEXT.instagramTitle}
                  >
                    IG
                  </a>
                )}
              </div>
            )}
          </div>

          {(store.mainProblems?.length ?? 0) > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-charcoal">{STORE_DETAIL_TEXT.mainProblemsTitle}</p>
              <div className="flex flex-wrap gap-1">
                {store.mainProblems.map((tag) => (
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

          {(store.goals?.length ?? 0) > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-charcoal">{STORE_DETAIL_TEXT.goalsTitle}</p>
              <div className="flex flex-wrap gap-1">
                {store.goals.map((tag) => (
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

          {(store.storefrontPhotos?.length ?? 0) > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-charcoal">{STORE_DETAIL_TEXT.storefrontPhotosTitle}</p>
              <div className="flex flex-wrap gap-2">
                {store.storefrontPhotos.map((url) => (
                  <div key={url} className="h-14 w-14 overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildFileUrl(url)}
                      alt={STORE_DETAIL_TEXT.storefrontPhotoAlt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-bold text-charcoal">{STORE_DETAIL_TEXT.documentsTitle}</p>
            {(store.documents?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-2">
                {store.documents.map((doc) => {
                  const { icon, className } = getDocIcon(doc.fileType)
                  return (
                    <div key={doc.id} className="w-16 text-center">
                      <a href={buildFileUrl(doc.url)} target="_blank" rel="noreferrer">
                        <div
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-md text-base ${className}`}
                        >
                          {icon}
                        </div>
                      </a>
                      <p
                        className="mt-0.5 truncate text-[8.5px] text-muted-foreground"
                        title={`${doc.filename} (${formatFileSize(doc.fileSize)})`}
                      >
                        {doc.filename}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-[10.5px] text-muted-foreground">{STORE_DETAIL_TEXT.documentsEmpty}</p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold text-charcoal">{STORE_DETAIL_TEXT.menuPhotosTitle}</p>
            {(store.photos?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-2">
                {store.photos.map((url) => (
                  <div key={url} className="h-14 w-14 overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildFileUrl(url)}
                      alt={STORE_DETAIL_TEXT.menuPhotoAlt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10.5px] text-muted-foreground">{STORE_DETAIL_TEXT.menuPhotosEmpty}</p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold text-charcoal">{STORE_DETAIL_TEXT.progressStatusTitle}</p>
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
        <p className="mb-2 text-xs font-bold text-charcoal">{STORE_DETAIL_TEXT.assessmentSectionTitle}</p>
        <div className="flex flex-wrap gap-2">
          {ASSESSMENT_ROUND_LABELS.map(({ round, label }) => (
            <Button key={round} variant="outline" size="sm" asChild>
              <Link href={ROUTES.ASSESSMENT_DETAIL(store.id, round)}>{label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
