'use client';

import type { ReactNode } from 'react';
import { AssessmentFormHeader } from './assessment-form-header';
import type { Round } from '../types/assessment.types';

interface AssessmentNoticeProps {
  storeId: string;
  storeName?: string;
  storeCoverUrl?: string | null;
  round: Round;
  onProvinceChange: () => void;
  onStoreSelect?: () => void;
  children: ReactNode;
}

// The three states that replace the scoring grid — no store picked, the round
// is locked behind a prior one, the round has not been started — are the same
// header plus one panel. Only the panel differs, so it comes in as children.
export function AssessmentNotice({
  storeId,
  storeName,
  storeCoverUrl,
  round,
  onProvinceChange,
  onStoreSelect,
  children,
}: AssessmentNoticeProps) {
  return (
    <div className="space-y-4">
      <AssessmentFormHeader
        storeId={storeId}
        storeName={storeName}
        storeCoverUrl={storeCoverUrl}
        round={round}
        onProvinceChange={onProvinceChange}
        onStoreSelect={onStoreSelect}
      />
      <div className="rounded-xl border bg-card py-16 text-center shadow-sm">{children}</div>
    </div>
  );
}
