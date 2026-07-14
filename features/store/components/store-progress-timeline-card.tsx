import { Card } from '@/components/ui/card';
import { formatThaiDate } from '@/utils/format-thai-date';
import { STORE_DETAIL_TEXT } from '../constants/store-detail.constants';

export interface TimelineStep {
  label: string;
  date: string | null;
  done: boolean;
}

interface StoreProgressTimelineCardProps {
  timeline: TimelineStep[];
  currentStepIndex: number;
}

export function StoreProgressTimelineCard({
  timeline,
  currentStepIndex,
}: StoreProgressTimelineCardProps) {
  return (
    <Card className="space-y-1.5 p-2.5 shadow-none">
      <p className="text-sm font-bold text-charcoal">{STORE_DETAIL_TEXT.progressStatusTitle}</p>
      <div>
        {timeline.map((t, i) => {
          const isCurrent = i === currentStepIndex;
          const isLast = i === timeline.length - 1;
          return (
            <div key={t.label} className="flex gap-2">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                    isCurrent
                      ? 'bg-purple-banner'
                      : t.done
                        ? 'bg-score-green'
                        : 'border-2 border-border bg-muted'
                  }`}
                >
                  {t.done ? '✓' : ''}
                </span>
                {!isLast && (
                  <span className={`w-px flex-1 ${t.done ? 'bg-score-green' : 'bg-border'}`} />
                )}
              </div>
              <div
                className={`flex flex-1 items-center justify-between gap-2 ${isLast ? '' : 'pb-2'}`}
              >
                <p
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-purple-banner'
                      : t.done
                        ? 'text-charcoal'
                        : 'text-muted-foreground'
                  }`}
                >
                  {t.label}
                </p>
                {t.date && (
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatThaiDate(t.date)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
