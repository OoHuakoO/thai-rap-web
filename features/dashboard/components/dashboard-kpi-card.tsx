import { MaskIcon } from '@/components/shared/mask-icon';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { KPI_ACCENT_CLASS, type KpiAccent } from '../constants/dashboard-display.constants';
import { DASHBOARD_KPI_TEXT } from '../constants/dashboard-text.constants';

interface DashboardKpiCardProps {
  title: string;
  value: number;
  percentage: number;
  /** Path under `public/` to the MaskIcon artwork. */
  icon: string;
  accent: KpiAccent;
  subtitle?: string;
}

const PERCENTAGE_FRACTION_DIGITS = 2;

// ~85% of the circle's h-14 diameter — the artwork reads too small below this.
const ICON_CLASS = 'h-12 w-12';

function formatPercentage(percentage: number): string {
  const clamped = Math.min(100, Math.max(0, percentage));
  return `${Number(clamped.toFixed(PERCENTAGE_FRACTION_DIGITS))}%`;
}

export function DashboardKpiCard({
  title,
  value,
  percentage,
  icon,
  accent,
  subtitle,
}: DashboardKpiCardProps) {
  const accentClass = KPI_ACCENT_CLASS[accent];
  const barWidth = Math.min(100, Math.max(0, percentage));

  return (
    <Card className="h-full shadow-sm">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-full',
              accentClass.circle
            )}
          >
            <MaskIcon src={icon} className={ICON_CLASS} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium leading-tight text-charcoal">{title}</p>
            <p className="mt-0.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold tabular-nums text-text-main">
                {value.toLocaleString('th-TH')}
              </span>
              <span className="text-xs text-charcoal">{DASHBOARD_KPI_TEXT.storeUnit}</span>
            </p>
            {subtitle && <p className="mt-0.5 text-[11px] text-charcoal">{subtitle}</p>}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-label={title}
            aria-valuenow={Math.round(barWidth)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn('h-full rounded-full transition-all', accentClass.bar)}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] font-medium tabular-nums text-charcoal">
            {formatPercentage(percentage)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
