import { Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ANALYTICS_ACCENT_CLASS } from '../constants/analytics-display.constants';
import { TARGET_CARD_TEXT } from '../constants/analytics-text.constants';
import type { AnalyticsTarget } from '../types/analytics.types';

interface TargetCardProps {
  target: AnalyticsTarget;
}

const accentClass = ANALYTICS_ACCENT_CLASS.purple;

export function TargetCard({ target }: TargetCardProps) {
  return (
    <Card className={`shadow-sm ${accentClass.header}`}>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-banner text-white">
          <Target className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className={`text-[13px] font-semibold ${accentClass.text}`}>
            {TARGET_CARD_TEXT.title(target.round)}
          </p>
          <p className="text-xs text-charcoal">{TARGET_CARD_TEXT.totalScore(target.totalScore)}</p>
          <p className="text-xs text-charcoal">
            {TARGET_CARD_TEXT.readiness(target.incubationReadiness)}
          </p>
          <p className="text-xs text-charcoal">
            {TARGET_CARD_TEXT.topPercentile(target.topPercentile)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
