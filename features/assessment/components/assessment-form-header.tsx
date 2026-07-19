'use client';

import type { ReactNode } from 'react';
import { AssessmentStorePicker } from './assessment-store-picker';
import { RoundPills } from './round-pills';
import { ASSESSMENT_FORM_TEXT } from '../constants/assessment-text.constants';
import type { Round } from '../types/assessment.types';

interface AssessmentFormHeaderProps {
  storeId: string;
  storeName?: string;
  storeCoverUrl?: string | null;
  round: Round;
  onProvinceChange: () => void;
  onStoreSelect?: () => void;
  children?: ReactNode;
}

// Shared by the locked-round notice and the main scoring view — both need
// the same store picker + round pills row, the locked view just doesn't
// need the progress bar / save buttons the caller passes as children.
export function AssessmentFormHeader({
  storeId,
  storeName,
  storeCoverUrl,
  round,
  onProvinceChange,
  onStoreSelect,
  children,
}: AssessmentFormHeaderProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-3 shadow-sm">
      <AssessmentStorePicker
        storeId={storeId}
        storeName={storeName}
        storeCoverUrl={storeCoverUrl}
        round={round}
        onProvinceChange={onProvinceChange}
        onStoreSelect={onStoreSelect}
      />
      <div>
        <p className="mb-1 text-sm text-muted-foreground">{ASSESSMENT_FORM_TEXT.roundLabel}</p>
        <RoundPills storeId={storeId} activeRound={round} />
      </div>
      {children}
    </div>
  );
}
