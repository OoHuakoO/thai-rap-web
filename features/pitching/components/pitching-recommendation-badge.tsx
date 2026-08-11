import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  PITCHING_RECOMMENDATION_BADGE_CLASSES,
  PITCHING_RECOMMENDATION_LABELS,
} from '../constants/pitching.constants';
import type { PitchingRecommendation } from '../types/pitching.types';

interface PitchingRecommendationBadgeProps {
  recommendation: PitchingRecommendation;
  /** Appended after the label — the panel tally hangs its count here. */
  suffix?: ReactNode;
}

/** A judge's verdict, worn the same way wherever the verdict is named. */
export function PitchingRecommendationBadge({
  recommendation,
  suffix,
}: PitchingRecommendationBadgeProps) {
  return (
    <Badge variant="outline" className={PITCHING_RECOMMENDATION_BADGE_CLASSES[recommendation]}>
      {PITCHING_RECOMMENDATION_LABELS[recommendation]}
      {suffix}
    </Badge>
  );
}
