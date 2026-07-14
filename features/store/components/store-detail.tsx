'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/shared/loading';
import type { StatusVariant } from '@/components/shared/status-badge';
import { ROUTES } from '@/constants/routes';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { useAssessmentSummaries } from '@/features/assessment';
import { useStore } from '../hooks/use-stores';
import { STORE_DETAIL_TEXT } from '../constants/store-detail.constants';
import { STORE_STATUS_LABELS } from '../types/store.types';
import type { StoreStatus } from '../types/store.types';
import { StoreCoverGalleryStrip } from './store-cover-gallery-strip';
import { StoreContactCard } from './store-contact-card';
import { StoreDetailDocumentsCard } from './store-detail-documents-card';
import { StoreDetailMenuCard } from './store-detail-menu-card';
import { StoreProgressTimelineCard, type TimelineStep } from './store-progress-timeline-card';

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
const COMPACT_MENU_PHOTO_LIMIT = 4;
const COMPACT_STORE_PHOTO_LIMIT = 4;

interface StoreDetailProps {
  storeId: string;
  /** 'full' shows every photo/document (full page); 'compact' truncates with "ดูทั้งหมด" (side panel). */
  variant?: 'compact' | 'full';
}

export function StoreDetail({ storeId, variant = 'compact' }: StoreDetailProps) {
  const { data: store, isLoading, isError, error } = useStore(storeId);
  const { data: summaries } = useAssessmentSummaries(storeId);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; alt: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const timeline: TimelineStep[] = [
    { label: STORE_DETAIL_TEXT.timelineRegistered, date: store.createdAt, done: true },
    { label: STORE_DETAIL_TEXT.timelineT0, date: t0SubmittedAt, done: !!t0SubmittedAt },
    { label: STORE_DETAIL_TEXT.timelineT1, date: t1SubmittedAt, done: !!t1SubmittedAt },
    { label: STORE_DETAIL_TEXT.timelinePendingResult, date: null, done: decided },
  ];
  // The most recently completed step is highlighted (violet) as the current stage.
  const currentStepIndex = timeline.reduce((acc, t, i) => (t.done ? i : acc), -1);

  // Dedicated cover image first; fall back to the first store photo.
  const coverPhoto = store.coverUrl ?? store.storePhotos[0] ?? null;
  const stripPhotos = store.coverUrl ? store.storePhotos : store.storePhotos.slice(1);
  const visibleStrip = isCompact ? stripPhotos.slice(0, COMPACT_STORE_PHOTO_LIMIT) : stripPhotos;
  const hiddenStripCount = stripPhotos.length - visibleStrip.length;

  const visibleDocs = isCompact ? store.documents.slice(0, COMPACT_DOC_LIMIT) : store.documents;
  const hiddenDocsCount = store.documents.length - visibleDocs.length;

  const visibleMenuPhotos = isCompact
    ? store.menuPhotos.slice(0, COMPACT_MENU_PHOTO_LIMIT)
    : store.menuPhotos;
  const hiddenMenuPhotosCount = store.menuPhotos.length - visibleMenuPhotos.length;

  const openPreview = (url: string, alt: string) => {
    setPreviewPhoto({ url, alt });
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Store identity — full-width gradient banner (matches edit-page header) */}
      <div className="p-3 pb-0">
        <div className="rounded-xl border bg-gradient-to-br from-orange to-orange-light px-4 py-3 text-white shadow-sm">
          <h2 className="text-2xl font-extrabold">{store.name}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-semibold">
              📍 {store.province}
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-semibold">
              🍽 {store.storeType}
            </span>
          </div>
        </div>
      </div>

      {/* Body — left: cover/gallery/contact, right: documents/menu/timeline */}
      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col">
          <StoreCoverGalleryStrip
            storeName={store.name}
            coverPhoto={coverPhoto}
            statusVariant={STATUS_VARIANT[store.status]}
            statusLabel={STORE_STATUS_LABELS[store.status]}
            stripPhotos={stripPhotos}
            visibleStrip={visibleStrip}
            hiddenStripCount={hiddenStripCount}
            fullDetailHref={fullDetailHref}
            onPreview={openPreview}
          />
          <StoreContactCard store={store} />
        </div>

        {/* Right column — documents, menu menuPhotos, progress timeline */}
        <div className="space-y-2">
          <StoreDetailDocumentsCard
            documents={store.documents}
            visibleDocs={visibleDocs}
            hiddenDocsCount={hiddenDocsCount}
            isCompact={isCompact}
            fullDetailHref={fullDetailHref}
          />
          <StoreDetailMenuCard
            menuPhotos={store.menuPhotos}
            visibleMenuPhotos={visibleMenuPhotos}
            hiddenMenuPhotosCount={hiddenMenuPhotosCount}
            isCompact={isCompact}
            fullDetailHref={fullDetailHref}
            onPreview={openPreview}
          />
          <StoreProgressTimelineCard timeline={timeline} currentStepIndex={currentStepIndex} />
        </div>
      </div>

      {/* Problems + development goals */}
      <div className="grid grid-cols-1 gap-3 px-3 pb-3 sm:grid-cols-2">
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

      {/* Full-size photo preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl p-2">
          <DialogTitle className="sr-only">{previewPhoto?.alt}</DialogTitle>
          {previewPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewPhoto.url}
              alt={previewPhoto.alt}
              className="max-h-[80vh] w-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
