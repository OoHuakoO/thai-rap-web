'use client';

import { Award, BarChart3, Gauge, Trophy, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  PITCHING_DASHBOARD_TEXT,
  PITCHING_LEVEL_LABELS,
  PITCHING_RECOMMENDATION_LABELS,
  PITCHING_TEXT,
  PITCHING_TOTAL_MAX,
} from '../constants/pitching.constants';
import type { PitchingStoreReport } from '../types/pitching.types';
import { pickMajorityRecommendation } from '../utils/pitching-recommendation';
import { PitchingPanel } from './pitching-panel';

type TileTone = 'orange' | 'purple' | 'green' | 'charcoal';

const TILE_TONE_CLASSES: Record<TileTone, { card: string; icon: string; value: string }> = {
  orange: { card: 'border-orange/20 bg-orange/[0.06]', icon: 'text-orange', value: 'text-orange' },
  purple: {
    card: 'border-purple-banner/20 bg-purple-banner/[0.06]',
    icon: 'text-purple-banner',
    value: 'text-purple-banner',
  },
  green: {
    card: 'border-score-green/20 bg-score-green/[0.06]',
    icon: 'text-score-green',
    value: 'text-score-green',
  },
  charcoal: {
    card: 'border-charcoal/15 bg-charcoal/[0.05]',
    icon: 'text-charcoal',
    value: 'text-charcoal',
  },
};

interface PitchingSummaryTilesProps {
  report: PitchingStoreReport;
}

export function PitchingSummaryTiles({ report }: PitchingSummaryTilesProps) {
  const majority = pickMajorityRecommendation(report.recommendationCounts);
  const selectedShare =
    report.judgeCount === 0 ? 0 : (report.recommendationCounts.SELECTED / report.judgeCount) * 100;

  return (
    <PitchingPanel
      title={PITCHING_DASHBOARD_TEXT.summaryTitle}
      icon={BarChart3}
      accent="purple"
      contentClassName="justify-center"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={Gauge}
          tone="orange"
          title={PITCHING_DASHBOARD_TEXT.avgTileTitle}
          value={(report.avgScore ?? 0).toFixed(1)}
          unit={PITCHING_DASHBOARD_TEXT.outOf(PITCHING_TOTAL_MAX)}
        />
        <SummaryTile
          icon={Trophy}
          tone="purple"
          title={PITCHING_DASHBOARD_TEXT.rankTileTitle}
          value={report.rank ?? PITCHING_TEXT.noComment}
          unit={`${PITCHING_DASHBOARD_TEXT.outOf(report.rankedStoreCount)} ${PITCHING_DASHBOARD_TEXT.rankTileUnit}`}
        />
        <SummaryTile
          icon={Users}
          tone="green"
          title={PITCHING_DASHBOARD_TEXT.selectedShareTileTitle}
          value={PITCHING_DASHBOARD_TEXT.selectedShareValue(selectedShare)}
          description={PITCHING_DASHBOARD_TEXT.selectedShareDescription(
            report.recommendationCounts.SELECTED,
            report.judgeCount
          )}
        />
        <SummaryTile
          icon={Award}
          tone="charcoal"
          title={PITCHING_DASHBOARD_TEXT.verdictTileTitle}
          value={report.level ? PITCHING_LEVEL_LABELS[report.level] : PITCHING_TEXT.noComment}
          // The verdict is a phrase, not a number — it reads at body size while
          // the three numeric tiles keep the display size.
          valueClassName="text-lg"
          description={
            majority
              ? PITCHING_RECOMMENDATION_LABELS[majority]
              : PITCHING_DASHBOARD_TEXT.verdictNone
          }
        />
      </div>
    </PitchingPanel>
  );
}

interface SummaryTileProps {
  icon: LucideIcon;
  tone: TileTone;
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  valueClassName?: string;
}

function SummaryTile({
  icon: Icon,
  tone,
  title,
  value,
  unit,
  description,
  valueClassName,
}: SummaryTileProps) {
  const toneClasses = TILE_TONE_CLASSES[tone];

  return (
    <div className={cn('rounded-xl border p-3', toneClasses.card)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">{title}</p>
        <Icon className={cn('h-4 w-4 flex-shrink-0', toneClasses.icon)} />
      </div>
      <p
        className={cn(
          'mt-1.5 text-2xl font-bold tabular-nums leading-tight',
          toneClasses.value,
          valueClassName
        )}
      >
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
      </p>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
