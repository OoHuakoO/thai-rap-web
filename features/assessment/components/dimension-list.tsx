'use client'

import { cn } from '@/utils/cn'
import type { AssessmentQuestion, Dimension } from '../types/assessment.types'

const SCORE_LEGEND = [
  { value: 0, label: 'ไม่มี' },
  { value: 1, label: 'มีบ้าง' },
  { value: 2, label: 'พื้นฐาน' },
  { value: 3, label: 'ดี' },
  { value: 4, label: 'ดีมาก' },
]

interface DimensionListProps {
  dimensions: Dimension[]
  questions: AssessmentQuestion[]
  selectedId: number
  totalScore: number | null
  onSelect: (id: number) => void
}

export function DimensionList({
  dimensions,
  questions,
  selectedId,
  totalScore,
  onSelect,
}: DimensionListProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-3 py-2.5">
        <p className="text-sm font-bold text-charcoal">
          8 มิติการประเมิน <span className="ml-1 text-[10px] font-normal text-muted-foreground">Assessment Dimensions</span>
        </p>
      </div>

      <div className="mx-2.5 my-2 rounded-lg bg-cream p-2">
        <p className="mb-1 text-[10px] font-bold text-orange">เกณฑ์คะแนน 0–4</p>
        <div className="flex flex-wrap gap-1">
          {SCORE_LEGEND.map((s) => (
            <span
              key={s.value}
              className="flex items-center gap-1 rounded border bg-white px-1.5 py-0.5 text-[9px] text-muted-foreground"
            >
              <b className="text-orange">{s.value}</b>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div>
        {dimensions.map((dim) => {
          const dimQuestions = questions.filter((q) => q.dimensionId === dim.id)
          const max = dimQuestions.length * 4
          const sum = dimQuestions.reduce((acc, q) => acc + (q.rawScore ?? 0), 0)
          const pct = max === 0 ? 0 : Math.round((sum / max) * 100)
          const active = dim.id === selectedId

          return (
            <button
              key={dim.id}
              type="button"
              onClick={() => onSelect(dim.id)}
              className={cn(
                'flex w-full items-center gap-2 border-b px-3 py-2 text-left transition-colors last:border-0 hover:bg-cream',
                active && 'border-l-[3px] border-l-orange bg-cream pl-[9px]'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground',
                  active && 'bg-orange text-white'
                )}
              >
                {dim.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold leading-tight text-charcoal">
                  {dim.name}
                </span>
                <span className="block truncate text-[9px] leading-tight text-muted-foreground">
                  {dim.nameEn}
                </span>
              </span>
              <span className="flex-shrink-0 text-right">
                <span className="block text-[11px] font-bold text-orange">{pct}%</span>
                <span className="block text-[8.5px] text-muted-foreground">น้ำหนัก {dim.weight}%</span>
                <span className="mt-0.5 block h-[3px] w-11 rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-orange"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between border-t bg-muted/20 px-3 py-2.5">
        <div>
          <span className="block text-[10px] text-muted-foreground">คะแนนรวมถ่วงน้ำหนัก</span>
          <span className="cursor-default text-[9px] text-orange underline">ดูรูปภาพผลทั้งหมด →</span>
        </div>
        <span className="text-base font-extrabold text-orange">
          {(totalScore ?? 0).toFixed(2)}
          <span className="text-[10px] font-normal text-muted-foreground">/100</span>
        </span>
      </div>
    </div>
  )
}
