'use client'

import { QuestionRow } from './question-row'
import type { AssessmentQuestion, Dimension } from '../types/assessment.types'

interface AssessTableProps {
  dimension: Dimension
  questions: AssessmentQuestion[]
  locked: boolean
  highlightedId: number | null
  onScoreChange: (questionId: number, score: number) => void
  onNoteChange: (questionId: number, note: string) => void
}

export function AssessTable({
  dimension,
  questions,
  locked,
  highlightedId,
  onScoreChange,
  onNoteChange,
}: AssessTableProps) {
  const sorted = [...questions].sort((a, b) => a.questionNo - b.questionNo)
  const max = sorted.length * 4
  const sum = sorted.reduce((acc, q) => acc + (q.rawScore ?? 0), 0)
  const pct = max === 0 ? 0 : Math.round((sum / max) * 100)

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-bold text-charcoal">
            มิติที่ {dimension.id}: {dimension.name}
          </p>
          <p className="mt-0.5 max-w-[420px] text-xs text-muted-foreground">
            ประเมิน {sorted.length} ข้อ | น้ำหนัก {dimension.weight}% | คะแนน 0–4 ต่อข้อ | คะแนนเต็ม {max}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">คะแนนมิตินี้ (raw)</p>
          <p className="text-lg font-extrabold text-orange">
            {sum}
            <span className="text-xs font-normal text-muted-foreground"> / {max}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">({pct}%)</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-[11px] text-muted-foreground">
              <th className="px-2 py-2 text-left font-semibold">ข้อ</th>
              <th className="px-2 py-2 text-left font-semibold">ตัวดำเนินการ / เกณฑ์ประเมิน</th>
              <th className="px-2 py-2 text-left font-semibold">คะแนน (0–4)</th>
              <th className="px-2 py-2 text-left font-semibold">บันทึกผู้ประเมิน</th>
              <th className="px-2 py-2 text-left font-semibold">ข้อเสนอแนะ</th>
              <th className="px-2 py-2 text-left font-semibold">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((q) => (
              <QuestionRow
                key={q.questionId}
                question={q}
                locked={locked}
                highlighted={highlightedId === q.questionId}
                onScoreChange={(score) => onScoreChange(q.questionId, score)}
                onNoteChange={(note) => onNoteChange(q.questionId, note)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2.5">
        <div>
          <p className="text-[10px] text-muted-foreground">คะแนนรวมมิตินี้ (raw score)</p>
          <p className="text-base font-extrabold text-orange">
            {sum} <span className="text-xs font-normal text-muted-foreground">/ {max} คะแนน ({pct}%)</span>
          </p>
        </div>
      </div>
    </div>
  )
}
