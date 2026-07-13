'use client';

import { Store, ClipboardList, ClipboardCheck, Trophy } from 'lucide-react';
import { Loading } from '@/components/shared/loading';
import { useStoreStats } from '../hooks/use-stores';

const PROVINCE_COLORS = [
  '#F17128',
  '#7B1FA2',
  '#1976d2',
  '#4caf50',
  '#9E9E9E',
  '#F44336',
  '#00897B',
];

export function StoreStatsBar() {
  const { data: stats, isLoading } = useStoreStats();

  if (isLoading) return <Loading className="py-6" />;
  if (!stats) return null;

  const targetPct = Math.round((stats.total / stats.targetTotal) * 1000) / 10;
  const t0Pct =
    stats.total === 0 ? 0 : Math.round((stats.t0CompletedCount / stats.total) * 1000) / 10;
  const t1Pct =
    stats.total === 0 ? 0 : Math.round((stats.t1CompletedCount / stats.total) * 1000) / 10;
  const passedPct =
    stats.total === 0 ? 0 : Math.round((stats.passedCount / stats.total) * 1000) / 10;

  return (
    <div className="flex flex-col items-stretch gap-3 xl:flex-row">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex h-full items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange sm:h-16 sm:w-16">
            <Store className="h-7 w-7 text-white sm:h-9 sm:w-9" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-charcoal">จำนวนร้านทั้งหมด</p>
            <p className="mt-1 leading-tight text-charcoal">
              <span className="text-2xl font-extrabold">{stats.total}</span>{' '}
              <span className="text-xs text-muted-foreground">ร้าน</span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              เป้าหมาย {stats.targetTotal} ร้าน
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-orange"
                  style={{ width: `${targetPct}%` }}
                />
              </span>
              <span className="text-xs text-muted-foreground">{targetPct}%</span>
            </div>
          </div>
        </div>

        <div className="flex h-full items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange sm:h-16 sm:w-16">
            <ClipboardList className="h-7 w-7 text-white sm:h-9 sm:w-9" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">ร้านที่ประเมินแล้ว T0</p>
            <p className="mt-1 leading-tight text-charcoal">
              <span className="text-2xl font-extrabold">{stats.t0CompletedCount}</span>{' '}
              <span className="text-xs text-muted-foreground">ร้าน</span>
            </p>
            <p className="mt-1.5 text-2xl font-bold text-orange">{t0Pct}%</p>
          </div>
        </div>

        <div className="flex h-full items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-banner sm:h-16 sm:w-16">
            <ClipboardCheck className="h-7 w-7 text-white sm:h-9 sm:w-9" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">ร้านที่ประเมินแล้ว T1</p>
            <p className="mt-1 leading-tight text-charcoal">
              <span className="text-2xl font-extrabold">{stats.t1CompletedCount}</span>{' '}
              <span className="text-xs text-muted-foreground">ร้าน</span>
            </p>
            <p className="mt-1.5 text-2xl font-bold text-purple-banner">{t1Pct}%</p>
          </div>
        </div>

        <div className="flex h-full items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-score-green sm:h-16 sm:w-16">
            <Trophy className="h-7 w-7 text-white sm:h-9 sm:w-9" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">ร้านที่ผ่านเข้ารอบ</p>
            <p className="mt-1 leading-tight text-charcoal">
              <span className="text-2xl font-extrabold">{stats.passedCount}</span>{' '}
              <span className="text-xs text-muted-foreground">ร้าน</span>
            </p>
            <p className="mt-1.5 text-2xl font-bold text-score-green">{passedPct}%</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-3 shadow-sm xl:w-72 xl:flex-shrink-0">
        <p className="mb-2 text-sm font-bold text-charcoal">การกระจายตัวของร้านอาหารรายจังหวัด</p>
        <div className="flex flex-col gap-1.5">
          {stats.byProvince.map((p, i) => (
            <div key={p.province} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                style={{ background: PROVINCE_COLORS[i % PROVINCE_COLORS.length] }}
              />
              <span className="min-w-[72px] text-charcoal">{p.province}</span>
              <span className="text-muted-foreground">
                {p.count} ร้าน ({p.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
