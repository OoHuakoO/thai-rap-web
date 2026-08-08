'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { BarChart } from '@/components/shared/bar-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { colors } from '@/styles/tokens';
import { PITCHING_DASHBOARD_TEXT } from '../constants/pitching.constants';
import type { PitchingCriterionAverage } from '../types/pitching.types';

const SERIES_KEY = 'avgScore';
// A criterion title is a full sentence on the paper form. Recharts drops any
// tick that would overlap its neighbour rather than letting them collide, so a
// label too long for the column silently removes bars from the axis — measured
// at the card's narrowest (a 1024px viewport), ten characters is what keeps
// every criterion labelled.
const AXIS_LABEL_MAX_CHARS = 10;

interface PitchingCriteriaChartProps {
  criteria: PitchingCriterionAverage[];
}

export function PitchingCriteriaChart({ criteria }: PitchingCriteriaChartProps) {
  const data = criteria.map((criterion) => ({
    label:
      criterion.title.length > AXIS_LABEL_MAX_CHARS
        ? `${criterion.title.slice(0, AXIS_LABEL_MAX_CHARS)}…`
        : criterion.title,
    [SERIES_KEY]: Number(criterion.avgScore.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {PITCHING_DASHBOARD_TEXT.criteriaChartTitle}{' '}
          <span className="font-normal text-muted-foreground">
            {PITCHING_DASHBOARD_TEXT.criteriaChartSubtitle}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.criteriaEmpty} />
        ) : (
          <BarChart
            data={data}
            series={[
              {
                key: SERIES_KEY,
                label: PITCHING_DASHBOARD_TEXT.criteriaChartSeriesLabel,
                color: colors.purpleBanner,
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
