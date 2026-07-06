'use client'

import { Loading } from '@/components/shared/loading'
import { useStoreStats } from '../hooks/use-stores'

const PROVINCE_COLORS = ['#F17128', '#7B1FA2', '#1976d2', '#4caf50', '#9E9E9E', '#F44336', '#00897B']

export function StoreStatsBar() {
  const { data: stats, isLoading } = useStoreStats()

  if (isLoading) return <Loading className="py-6" />
  if (!stats) return null

  const targetPct = Math.round((stats.total / stats.targetTotal) * 1000) / 10
  const t0Pct = stats.total === 0 ? 0 : Math.round((stats.t0CompletedCount / stats.total) * 1000) / 10
  const t1Pct = stats.total === 0 ? 0 : Math.round((stats.t1CompletedCount / stats.total) * 1000) / 10
  const passedPct = stats.total === 0 ? 0 : Math.round((stats.passedCount / stats.total) * 1000) / 10

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-3 shadow-sm">
      <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-orange/10 text-base">
            🏪
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-tight text-charcoal">{stats.total}</p>
            <p className="truncate text-[9.5px] text-muted-foreground">จำนวนร้านทั้งหมด</p>
            <p className="text-[9px] font-bold text-orange">
              เป้าหมาย {stats.targetTotal} ร้าน ({targetPct}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-amber-100 text-base">
            📋
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-tight text-charcoal">{stats.t0CompletedCount}</p>
            <p className="truncate text-[9.5px] text-muted-foreground">ร้านที่ประเมินแล้ว T0</p>
            <p className="text-[9px] font-bold text-amber-600">{t0Pct}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-score-green/10 text-base">
            ✅
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-tight text-charcoal">{stats.t1CompletedCount}</p>
            <p className="truncate text-[9.5px] text-muted-foreground">ร้านที่ประเมินแล้ว T1</p>
            <p className="text-[9px] font-bold text-score-green">{t1Pct}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-base">
            🏆
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-tight text-charcoal">{stats.passedCount}</p>
            <p className="truncate text-[9.5px] text-muted-foreground">ร้านที่ผ่านเข้ารอบ</p>
            <p className="text-[9px] font-bold text-blue-600">{passedPct}%</p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <p className="mb-1.5 text-[10px] font-bold text-charcoal">การกระจายตัวของร้านอาหารรายจังหวัด</p>
        <div className="flex flex-col gap-1">
          {stats.byProvince.slice(0, 5).map((p, i) => (
            <div key={p.province} className="flex items-center gap-1.5 text-[9.5px]">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-sm"
                style={{ background: PROVINCE_COLORS[i % PROVINCE_COLORS.length] }}
              />
              <span className="min-w-[64px] text-charcoal">{p.province}</span>
              <span className="h-[7px] w-20 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${p.pct}%`, background: PROVINCE_COLORS[i % PROVINCE_COLORS.length] }}
                />
              </span>
              <span className="text-muted-foreground">
                {p.count} ร้าน ({p.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
