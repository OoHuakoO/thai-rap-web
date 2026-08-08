'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { DonutChart } from '@/components/shared/donut-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PITCHING_DASHBOARD_TEXT } from '../constants/pitching.constants';
import type { PitchingRankingRow } from '../types/pitching.types';
import { buildScoreDistribution } from '../utils/pitching-distribution';

interface PitchingScoreDistributionProps {
  rows: PitchingRankingRow[];
}

export function PitchingScoreDistribution({ rows }: PitchingScoreDistributionProps) {
  const bands = buildScoreDistribution(rows);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {PITCHING_DASHBOARD_TEXT.distributionTitle}{' '}
          <span className="font-normal text-muted-foreground">
            {PITCHING_DASHBOARD_TEXT.distributionSubtitle}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.distributionEmpty} />
        ) : (
          <div className="flex max-w-3xl flex-wrap items-center gap-4">
            <div className="min-w-[180px] flex-1">
              <DonutChart
                // Empty bands would still claim a legend row and a tooltip slot.
                data={bands
                  .filter((band) => band.count > 0)
                  .map((band) => ({ label: band.label, value: band.count, color: band.color }))}
                centerValue={rows.length}
                centerLabel={PITCHING_DASHBOARD_TEXT.distributionCenterLabel}
                showLegend={false}
              />
            </div>

            <ul className="min-w-[200px] flex-1 space-y-2">
              {bands.map((band) => (
                <li key={band.key} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-sm"
                    style={{ backgroundColor: band.color }}
                  />
                  <span className="min-w-0 flex-1 text-charcoal">{band.label}</span>
                  <span className="flex-shrink-0 tabular-nums text-muted-foreground">
                    {PITCHING_DASHBOARD_TEXT.distributionRowValue(band.count, band.pct)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
