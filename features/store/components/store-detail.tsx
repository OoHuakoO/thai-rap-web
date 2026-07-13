'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/shared/loading';
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge';
import { FacebookIcon, LineIcon, InstagramIcon } from '@/components/shared/brand-icons';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { buildFileUrl } from '@/utils/build-file-url';
import { useAssessmentSummaries } from '@/features/assessment';
import { useStore } from '../hooks/use-stores';
import { STORE_DETAIL_TEXT } from '../constants/store-detail.constants';
import { STORE_STATUS_LABELS } from '../types/store.types';
import type { StoreStatus } from '../types/store.types';

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
};

const DECIDED_STATUSES: StoreStatus[] = [
  'SELECTED',
  'CONDITIONAL_SELECTED',
  'WAITING_LIST',
  'NOT_SELECTED',
];

// How many items the compact (side-panel) view shows before "ดูทั้งหมด".
const COMPACT_DOC_LIMIT = 3;
const COMPACT_PHOTO_LIMIT = 4;
const COMPACT_STOREFRONT_LIMIT = 4;

function getDocMeta(fileType: string): { label: string; className: string } {
  if (fileType.includes('pdf')) return { label: 'PDF', className: 'bg-destructive' };
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return { label: 'XLS', className: 'bg-score-green' };
  }
  if (fileType.includes('word')) return { label: 'DOC', className: 'bg-blue-600' };
  if (fileType.startsWith('image/')) return { label: 'IMG', className: 'bg-purple-banner' };
  return { label: 'FILE', className: 'bg-slate-500' };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface StoreDetailProps {
  storeId: string;
  /** 'full' shows every photo/document (full page); 'compact' truncates with "ดูทั้งหมด" (side panel). */
  variant?: 'compact' | 'full';
}

export function StoreDetail({ storeId, variant = 'compact' }: StoreDetailProps) {
  const { data: store, isLoading, isError, error } = useStore(storeId);
  const { data: summaries } = useAssessmentSummaries(storeId);

  if (isLoading) return <Loading className="py-16" />;

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>;
  }

  if (!store) {
    return <p className="py-8 text-center text-muted-foreground">{STORE_DETAIL_TEXT.notFound}</p>;
  }

  const isCompact = variant === 'compact';
  const fullDetailHref = ROUTES.STORE_DETAIL(store.id);

  const t0SubmittedAt = summaries?.find((s) => s.round === 'T0')?.submittedAt ?? null;
  const t1SubmittedAt = summaries?.find((s) => s.round === 'T1')?.submittedAt ?? null;
  const decided = DECIDED_STATUSES.includes(store.status);

  const timeline = [
    { label: STORE_DETAIL_TEXT.timelineRegistered, date: store.createdAt, done: true },
    { label: STORE_DETAIL_TEXT.timelineT0, date: t0SubmittedAt, done: !!t0SubmittedAt },
    { label: STORE_DETAIL_TEXT.timelineT1, date: t1SubmittedAt, done: !!t1SubmittedAt },
    { label: STORE_DETAIL_TEXT.timelinePendingResult, date: null, done: decided },
  ];
  // The most recently completed step is highlighted (violet) as the current stage.
  const currentStepIndex = timeline.reduce((acc, t, i) => (t.done ? i : acc), -1);

  const coverPhoto = store.storefrontPhotos[0] ?? null;
  const stripPhotos = store.storefrontPhotos.slice(1);
  const visibleStrip = isCompact ? stripPhotos.slice(0, COMPACT_STOREFRONT_LIMIT) : stripPhotos;
  const hiddenStripCount = stripPhotos.length - visibleStrip.length;

  const visibleDocs = isCompact ? store.documents.slice(0, COMPACT_DOC_LIMIT) : store.documents;
  const hiddenDocsCount = store.documents.length - visibleDocs.length;

  const visiblePhotos = isCompact ? store.photos.slice(0, COMPACT_PHOTO_LIMIT) : store.photos;
  const hiddenPhotosCount = store.photos.length - visiblePhotos.length;

  return (
    <div className="flex flex-col">
      {/* Header — cover photo + name + status + location */}
      <div>
        <div className="relative h-24 overflow-hidden rounded-t-xl">
          {coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={buildFileUrl(coverPhoto)}
              alt={store.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange to-orange-light">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={buildFileUrl(store.logoUrl)}
                  alt={store.name}
                  className="h-12 w-12 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <span className="text-5xl">🍜</span>
              )}
            </div>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            title={STORE_DETAIL_TEXT.editStoreTitle}
            asChild
          >
            <Link href={ROUTES.STORE_EDIT(store.id)}>
              <Pencil className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="px-3 pt-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-bold text-charcoal">{store.name}</p>
            <StatusBadge
              status={STATUS_VARIANT[store.status]}
              label={STORE_STATUS_LABELS[store.status]}
            />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            📍 {store.province} &nbsp;|&nbsp; 🍽 {store.storeType}
          </p>
        </div>
      </div>

      {/* Storefront gallery strip — always reserves its row so card height stays
          consistent whether or not a store has extra photos beyond the cover. */}
      <div className="mt-2 px-3">
        <div className="flex min-h-14 flex-wrap items-center gap-1.5">
          {stripPhotos.length > 0 ? (
            <>
              {visibleStrip.map((url) => (
                <div key={url} className="h-14 w-14 overflow-hidden rounded-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildFileUrl(url)}
                    alt={STORE_DETAIL_TEXT.storefrontPhotoAlt}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {hiddenStripCount > 0 && (
                <Link
                  href={fullDetailHref}
                  className="flex h-14 w-14 flex-col items-center justify-center rounded-md bg-muted text-center text-xs font-semibold text-muted-foreground hover:bg-muted/80"
                >
                  <span className="text-sm">+{hiddenStripCount}</span>
                  {STORE_DETAIL_TEXT.viewAllLabel}
                </Link>
              )}
            </>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              {STORE_DETAIL_TEXT.storefrontGalleryEmpty}
            </p>
          )}
        </div>
      </div>

      {/* Body — contact (left) + documents/menu/timeline (right) */}
      <div className="mt-2 grid grid-cols-1 gap-3 px-3 sm:grid-cols-2">
        {/* Left: contact info */}
        <Card className="space-y-2 p-2.5 shadow-none">
          <p className="text-sm font-bold text-charcoal">{STORE_DETAIL_TEXT.contactInfoTitle}</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1 text-[13px]">
            <span className="text-muted-foreground">{STORE_DETAIL_TEXT.ownerNameLabel}</span>
            <span className="font-medium text-charcoal">{store.ownerName}</span>
            <span className="text-muted-foreground">{STORE_DETAIL_TEXT.phoneLabel}</span>
            <span className="font-medium text-charcoal">{store.phone}</span>
            <span className="text-muted-foreground">{STORE_DETAIL_TEXT.emailLabel}</span>
            <span className="break-all font-medium text-charcoal">
              {store.email || STORE_DETAIL_TEXT.emailEmpty}
            </span>
            <span className="text-muted-foreground">{STORE_DETAIL_TEXT.addressLabel}</span>
            <span className="font-medium leading-relaxed text-charcoal">{store.address}</span>
          </div>

          <div>
            <span className="text-[13px] text-muted-foreground">
              {STORE_DETAIL_TEXT.onlineChannelsLabel}
            </span>
            {store.socialLinks.facebook || store.socialLinks.line || store.socialLinks.instagram ? (
              <div className="mt-1 flex items-center gap-1.5">
                {store.socialLinks.facebook && (
                  <a
                    href={store.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={STORE_DETAIL_TEXT.facebookTitle}
                  >
                    <FacebookIcon className="h-7 w-7" />
                  </a>
                )}
                {store.socialLinks.line && (
                  <a
                    href={store.socialLinks.line}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={STORE_DETAIL_TEXT.lineTitle}
                  >
                    <LineIcon className="h-7 w-7" />
                  </a>
                )}
                {store.socialLinks.instagram && (
                  <a
                    href={store.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={STORE_DETAIL_TEXT.instagramTitle}
                  >
                    <InstagramIcon className="h-7 w-7" />
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-1 text-[13px] text-muted-foreground">
                {STORE_DETAIL_TEXT.onlineChannelsEmpty}
              </p>
            )}
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-2.5 text-[13px]">
            <span className="text-muted-foreground">{STORE_DETAIL_TEXT.avgRevenueLabel}</span>
            {store.avgRevenueMin !== null && store.avgRevenueMax !== null ? (
              <span className="font-medium text-orange">
                {store.avgRevenueMin.toLocaleString()}{' '}
                {STORE_DETAIL_TEXT.avgRevenueRangeSeparator}{' '}
                {store.avgRevenueMax.toLocaleString()} {STORE_DETAIL_TEXT.currencyUnit}
              </span>
            ) : (
              <span className="text-muted-foreground">{STORE_DETAIL_TEXT.avgRevenueEmpty}</span>
            )}
          </div>
        </Card>

        {/* Right: documents, menu photos, progress timeline */}
        <div className="space-y-2">
          <Card className="space-y-1.5 p-2.5 shadow-none">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-charcoal">
                {STORE_DETAIL_TEXT.documentsTitle}
              </p>
              {isCompact && store.documents.length > 0 && (
                <Link href={fullDetailHref} className="text-[13px] text-orange hover:underline">
                  {STORE_DETAIL_TEXT.viewAllLabel}
                </Link>
              )}
            </div>
            {store.documents.length > 0 ? (
              <div className="flex min-h-14 flex-wrap items-center gap-2">
                {visibleDocs.map((doc) => {
                  const { label, className } = getDocMeta(doc.fileType);
                  return (
                    <div key={doc.id} className="w-14 text-center">
                      <a href={buildFileUrl(doc.url)} target="_blank" rel="noreferrer">
                        <div
                          className={`mx-auto flex h-12 w-10 items-center justify-center rounded-md text-[11px] font-bold text-white ${className}`}
                        >
                          {label}
                        </div>
                      </a>
                      <p
                        className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-muted-foreground"
                        title={`${doc.filename} (${formatFileSize(doc.fileSize)})`}
                      >
                        {doc.filename}
                      </p>
                    </div>
                  );
                })}
                {hiddenDocsCount > 0 && (
                  <Link
                    href={fullDetailHref}
                    className="flex h-12 w-10 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80"
                  >
                    +{hiddenDocsCount}
                  </Link>
                )}
              </div>
            ) : (
              <p className="flex min-h-14 items-center text-[13px] text-muted-foreground">
                {STORE_DETAIL_TEXT.documentsEmpty}
              </p>
            )}
          </Card>

          <Card className="space-y-1.5 p-2.5 shadow-none">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-charcoal">
                {STORE_DETAIL_TEXT.menuPhotosTitle}
              </p>
              {isCompact && store.photos.length > 0 && (
                <Link href={fullDetailHref} className="text-[13px] text-orange hover:underline">
                  {STORE_DETAIL_TEXT.viewAllLabel}
                </Link>
              )}
            </div>
            {store.photos.length > 0 ? (
              <div className="flex min-h-14 flex-wrap items-center gap-2">
                {visiblePhotos.map((url) => (
                  <div key={url} className="h-14 w-14 overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildFileUrl(url)}
                      alt={STORE_DETAIL_TEXT.menuPhotoAlt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                {hiddenPhotosCount > 0 && (
                  <Link
                    href={fullDetailHref}
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-md bg-muted text-center text-xs font-semibold text-muted-foreground hover:bg-muted/80"
                  >
                    <span className="text-sm">+{hiddenPhotosCount}</span>
                    {STORE_DETAIL_TEXT.viewAllLabel}
                  </Link>
                )}
              </div>
            ) : (
              <p className="flex min-h-14 items-center text-[13px] text-muted-foreground">
                {STORE_DETAIL_TEXT.menuPhotosEmpty}
              </p>
            )}
          </Card>

          <Card className="space-y-1.5 p-2.5 shadow-none">
            <p className="text-sm font-bold text-charcoal">
              {STORE_DETAIL_TEXT.progressStatusTitle}
            </p>
            <div>
              {timeline.map((t, i) => {
                const isCurrent = i === currentStepIndex;
                const isLast = i === timeline.length - 1;
                return (
                  <div key={t.label} className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                          isCurrent
                            ? 'bg-purple-banner'
                            : t.done
                              ? 'bg-score-green'
                              : 'border-2 border-border bg-muted'
                        }`}
                      >
                        {t.done ? '✓' : ''}
                      </span>
                      {!isLast && (
                        <span
                          className={`w-px flex-1 ${t.done ? 'bg-score-green' : 'bg-border'}`}
                        />
                      )}
                    </div>
                    <div
                      className={`flex flex-1 items-center justify-between gap-2 ${isLast ? '' : 'pb-2'}`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          isCurrent
                            ? 'text-purple-banner'
                            : t.done
                              ? 'text-charcoal'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {t.label}
                      </p>
                      {t.date && (
                        <p className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(t.date)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Problems + development goals */}
      <div className="mt-2 grid grid-cols-1 gap-3 px-3 pb-2 sm:grid-cols-2">
        <Card className="space-y-1 border-orange/20 bg-orange/5 p-2.5 shadow-none">
          <p className="text-sm font-bold text-orange">{STORE_DETAIL_TEXT.mainProblemsTitle}</p>
          <p className="text-[13px] leading-relaxed text-charcoal">
            {(store.mainProblems?.length ?? 0) > 0
              ? store.mainProblems.join(', ')
              : STORE_DETAIL_TEXT.mainProblemsEmpty}
          </p>
        </Card>
        <Card className="space-y-1 border-purple-banner/20 bg-purple-banner/5 p-2.5 shadow-none">
          <p className="text-sm font-bold text-purple-banner">{STORE_DETAIL_TEXT.goalsTitle}</p>
          <p className="text-[13px] leading-relaxed text-charcoal">
            {(store.goals?.length ?? 0) > 0 ? store.goals.join(', ') : STORE_DETAIL_TEXT.goalsEmpty}
          </p>
        </Card>
      </div>
    </div>
  );
}
