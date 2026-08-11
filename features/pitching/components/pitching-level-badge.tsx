import { Badge } from '@/components/ui/badge';
import {
  PITCHING_LEVEL_BADGE_CLASSES,
  PITCHING_LEVEL_LABELS,
} from '../constants/pitching.constants';
import type { PitchingLevel } from '../types/pitching.types';

interface PitchingLevelBadgeProps {
  level: PitchingLevel;
}

/** The band a total falls in, worn the same way on every surface that shows one. */
export function PitchingLevelBadge({ level }: PitchingLevelBadgeProps) {
  return (
    <Badge variant="outline" className={PITCHING_LEVEL_BADGE_CLASSES[level]}>
      {PITCHING_LEVEL_LABELS[level]}
    </Badge>
  );
}
