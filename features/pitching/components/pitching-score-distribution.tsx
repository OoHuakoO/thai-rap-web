'use client';

import { ChartPie } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { DonutChart } from '@/components/shared/donut-chart';
import { PITCHING_DASHBOARD_TEXT } from '../constants/pitching.constants';
import type { PitchingRankingRow } from '../types/pitching.types';
import { buildScoreDistribution } from '../utils/pitching-distribution';
import { PitchingPanel } from './pitching-panel';

interface PitchingScoreDistributionProps {
  rows: PitchingRankingRow[];
}

export function PitchingScoreDistribution({ rows }: PitchingScoreDistributionProps) {
  const bands = buildScoreDistribution(rows);

  return (
    <PitchingPanel
      title={PITCHING_DASHBOARD_TEXT.distributionTitle}
      subtitle={PITCHING_DASHBOARD_TEXT.distributionSubtitle}
      icon={ChartPie}
      accent="green"
      contentClassName="justify-center"
    >
      {rows.length === 0 ? (
        <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.distributionEmpty} />
      ) : (
        // The donut takes a fixed column and the bands take the rest, so the
        // legend grows with the card instead of the pair sitting in a capped
        // block with the right half of the card empty.
        <div className="grid items-center gap-4 xl:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
          <DonutChart
            // Empty bands would still claim a legend row and a tooltip slot.
            data={bands
              .filter((band) => band.count > 0)
              .map((band) => ({ label: band.label, value: band.count, color: band.color }))}
            centerValue={rows.length}
            centerLabel={PITCHING_DASHBOARD_TEXT.distributionCenterLabel}
            showLegend={false}
            height={220}
          />

          <ul className="space-y-2.5">
            {bands.map((band) => (
              <li key={band.key} className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-sm"
                    style={{ backgroundColor: band.color }}
                  />
                  <span className="min-w-0 flex-1 text-charcoal">{band.label}</span>
                  <span className="flex-shrink-0 tabular-nums text-muted-foreground">
                    {PITCHING_DASHBOARD_TEXT.distributionRowValue(band.count, band.pct)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${band.pct}%`, backgroundColor: band.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PitchingPanel>
  );
}
