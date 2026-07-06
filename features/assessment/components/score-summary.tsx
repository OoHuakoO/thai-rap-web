'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/shared/progress-bar'
import { cn } from '@/utils/cn'
import { useDimensions } from '../hooks/use-assessment'
import { getZone, ZONE_DESCRIPTIONS, ZONE_COLORS, ZONE_BADGE_CLASSES } from '../utils/zone'
import { RED_FLAG_LABELS } from '../types/assessment.types'
import type { AssessmentQuestion, RedFlag } from '../types/assessment.types'
import type { Store } from '@/features/store'

interface ScoreSummaryProps {
  store?: Store
  selectedDimId: number
  totalScore: number | null
  questions: AssessmentQuestion[]
  redFlags: RedFlag[]
  isSubmitted: boolean
}

export function ScoreSummary({
  store,
  selectedDimId,
  totalScore,
  questions,
  redFlags,
  isSubmitted,
}: ScoreSummaryProps) {
  const { data: dimensions } = useDimensions()

  const score = totalScore ?? 0
  const zone = getZone(score)
  const zoneColor = ZONE_COLORS[zone]

  const dimensionScores = (dimensions ?? []).map((dim) => {
    const dimQuestions = questions.filter((q) => q.dimensionId === dim.id)
    const sum = dimQuestions.reduce((acc, q) => acc + (q.rawScore ?? 0), 0)
    const max = dimQuestions.length * 4
    const pct = max === 0 ? 0 : Math.round((sum / max) * 1000) / 10
    return { ...dim, pct }
  })

  const selectedDim = dimensionScores.find((d) => d.id === selectedDimId)

  return (
    <Card>
      <CardContent className="space-y-3 pt-5">
        <div>
          <p className="text-sm font-bold text-charcoal">สรุปผลการประเมินร้าน</p>
          {store && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {store.name} · {store.province}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/40 p-2.5 text-center">
            <p className="text-[9px] leading-tight text-muted-foreground">คะแนนมิติที่เลือก</p>
            <p className="text-lg font-extrabold text-orange">
              {selectedDim ? selectedDim.pct.toFixed(1) : '0.0'}
              <span className="text-[10px] font-normal text-muted-foreground">/100</span>
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2.5 text-center">
            <p className="text-[9px] leading-tight text-muted-foreground">คะแนนรวมถ่วงน้ำหนัก</p>
            <p className="text-lg font-extrabold text-[var(--color-dark-nav)]">
              {score.toFixed(2)}
              <span className="text-[10px] font-normal text-muted-foreground">/100</span>
            </p>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-bold',
            ZONE_BADGE_CLASSES[zoneColor]
          )}
        >
          <span>{totalScore !== null ? zone : 'ยังไม่มีคะแนน'}</span>
          {isSubmitted && <span className="text-[10px] font-semibold">✓ ส่งผลแล้ว</span>}
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {totalScore !== null ? ZONE_DESCRIPTIONS[zone] : 'ยังไม่ได้ให้คะแนน'}
        </p>

        {redFlags.length > 0 && (
          <div className="border-t pt-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-destructive">
              Red Flags (ต้องแก้เร่งด่วน)
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {redFlags.length}
              </span>
            </p>
            <ul className="space-y-1">
              {redFlags.map((flag) => (
                <li key={flag.id} className="flex items-start gap-1.5 text-[11px] leading-tight text-charcoal">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-destructive" />
                  {RED_FLAG_LABELS[flag.type]}
                  {flag.recommendation ? `: ${flag.recommendation}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t pt-2.5">
          <p className="mb-1.5 text-[11px] font-bold text-charcoal">เปรียบเทียบ 8 มิติ</p>
          <div className="space-y-1.5">
            {dimensionScores.map((dim) => (
              <ProgressBar key={dim.id} value={dim.pct} label={dim.nameEn} showPercentage />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
