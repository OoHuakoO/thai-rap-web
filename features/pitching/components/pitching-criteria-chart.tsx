'use client';

import { ChartColumnBig } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { BarChart } from '@/components/shared/bar-chart';
import { colors } from '@/styles/tokens';
import { PITCHING_DASHBOARD_TEXT } from '../constants/pitching.constants';
import type { PitchingCriterionAverage } from '../types/pitching.types';
import { PitchingPanel } from './pitching-panel';

const SERIES_KEY = 'avgScore';
// A criterion title is a full sentence on the paper form. Recharts drops any
// tick that would overlap its neighbour rather than letting them collide, so a
// label too long for the column silently removes bars from the axis — measured
// at the card's narrowest (a 1024px viewport), ten characters is what keeps
// every criterion labelled.
const AXIS_LABEL_MAX_CHARS = 10;

// Truncate at the axis, not in the data — the tooltip reads the same field and
// is the one place with room for the whole sentence.
function toAxisLabel(title: string): string {
  return title.length > AXIS_LABEL_MAX_CHARS ? `${title.slice(0, AXIS_LABEL_MAX_CHARS)}…` : title;
}

interface PitchingCriteriaChartProps {
  criteria: PitchingCriterionAverage[];
}

export function PitchingCriteriaChart({ criteria }: PitchingCriteriaChartProps) {
  const data = criteria.map((criterion) => ({
    label: criterion.title,
    [SERIES_KEY]: Number(criterion.avgScore.toFixed(1)),
  }));

  return (
    <PitchingPanel
      title={PITCHING_DASHBOARD_TEXT.criteriaChartTitle}
      subtitle={PITCHING_DASHBOARD_TEXT.criteriaChartSubtitle}
      icon={ChartColumnBig}
      accent="purple"
      contentClassName="justify-center"
    >
      {data.length === 0 ? (
        <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.criteriaEmpty} />
      ) : (
        <BarChart
          data={data}
          xTickFormatter={toAxisLabel}
          series={[
            {
              key: SERIES_KEY,
              label: PITCHING_DASHBOARD_TEXT.criteriaChartSeriesLabel,
              color: colors.purpleBanner,
            },
          ]}
        />
      )}
    </PitchingPanel>
  );
}
