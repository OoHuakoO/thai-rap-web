'use client';

import type { ReactNode } from 'react';
import { Loading } from '@/components/shared/loading';
import { MaskIcon } from '@/components/shared/mask-icon';
import { useStoreStats } from '../hooks/use-stores';
import { STORE_STATS_ICONS, STORE_STATS_TEXT } from '../constants/store-stats-bar.constants';

// ~70% of the circle's diameter — matches the icon-to-circle ratio in the design.
const ICON_CLASS = 'h-20 w-20 text-white sm:h-20 sm:w-20';

function toPercent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}

interface StatItemProps {
  icon: ReactNode;
  title: string;
  count: number;
  percent: number;
  subLabel?: string;
}

function StatItem({ icon, title, count, percent, subLabel }: StatItemProps) {
  return (
    <div className="flex h-full items-start gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-orange sm:h-20 sm:w-20">
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-semibold text-charcoal">{title}</p>
        <p className="mt-1 leading-tight text-charcoal">
          <span className="text-2xl font-extrabold">{count}</span>{' '}
          <span className="text-xs text-muted-foreground">{STORE_STATS_TEXT.storeUnit}</span>
        </p>
        {subLabel ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">{subLabel}</p>
        ) : null}
        <div className="mt-auto flex items-center gap-1.5 pt-1.5">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-orange"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </span>
          <span className="text-xs font-medium text-muted-foreground">{percent}%</span>
        </div>
      </div>
    </div>
  );
}

export function StoreStatsBar() {
  const { data: stats, isLoading } = useStoreStats();

  if (isLoading) return <Loading className="py-6" />;
  if (!stats) return null;

  const items: StatItemProps[] = [
    {
      icon: <MaskIcon src={STORE_STATS_ICONS.participation} className={ICON_CLASS} />,
      title: STORE_STATS_TEXT.participationTitle,
      count: stats.total,
      percent: toPercent(stats.total, stats.targetTotal),
      subLabel: STORE_STATS_TEXT.targetLabel(stats.targetTotal),
    },
    {
      icon: <MaskIcon src={STORE_STATS_ICONS.t0Completed} className={ICON_CLASS} />,
      title: STORE_STATS_TEXT.t0CompletedTitle,
      count: stats.t0CompletedCount,
      percent: toPercent(stats.t0CompletedCount, stats.total),
    },
    {
      icon: <MaskIcon src={STORE_STATS_ICONS.t1Completed} className={ICON_CLASS} />,
      title: STORE_STATS_TEXT.t1CompletedTitle,
      count: stats.t1CompletedCount,
      percent: toPercent(stats.t1CompletedCount, stats.total),
    },
    {
      icon: <MaskIcon src={STORE_STATS_ICONS.t2Completed} className={ICON_CLASS} />,
      title: STORE_STATS_TEXT.t2CompletedTitle,
      count: stats.t2CompletedCount,
      percent: toPercent(stats.t2CompletedCount, stats.total),
    },
    {
      icon: <MaskIcon src={STORE_STATS_ICONS.t3Completed} className={ICON_CLASS} />,
      title: STORE_STATS_TEXT.t3CompletedTitle,
      count: stats.t3CompletedCount,
      percent: toPercent(stats.t3CompletedCount, stats.total),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => (
        <StatItem key={item.title} {...item} />
      ))}
    </div>
  );
}
