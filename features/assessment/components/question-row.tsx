'use client'

import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge, type StatusVariant } from '@/components/shared/status-badge'
import { cn } from '@/utils/cn'
import { ScoreButtonGroup } from './score-button-group'
import type { AssessmentQuestion } from '../types/assessment.types'

function getStatus(score: number | null): { variant: StatusVariant; label: string } {
  if (score === null) return { variant: 'inactive', label: '⏸ ยังไม่ประเมิน' }
  if (score <= 1) return { variant: 'fail', label: '⚠ ต้องแก้ไข' }
  if (score === 2) return { variant: 'warning', label: '🔄 กำลังประเมิน' }
  return { variant: 'pass', label: '✅ เสร็จสิ้น' }
}

interface QuestionRowProps {
  question: AssessmentQuestion
  locked: boolean
  highlighted?: boolean
  onScoreChange: (score: number) => void
  onNoteChange: (note: string) => void
}

export function QuestionRow({
  question,
  locked,
  highlighted,
  onScoreChange,
  onNoteChange,
}: QuestionRowProps) {
  const [note, setNote] = useState(question.note ?? '')
  const debouncedNote = useDebounce(note, 600)
  const lastSent = useRef(question.note ?? '')

  useEffect(() => {
    if (debouncedNote !== lastSent.current) {
      lastSent.current = debouncedNote
      onNoteChange(debouncedNote)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNote])

  const status = getStatus(question.rawScore)

  return (
    <tr
      id={`q-${question.questionId}`}
      className={cn(
        'border-b border-border/60 align-top transition-colors last:border-0 hover:bg-muted/20',
        highlighted && 'bg-cream outline outline-2 -outline-offset-2 outline-orange'
      )}
    >
      <td className="w-9 px-2 py-2.5 text-xs font-bold text-muted-foreground">
        {String(question.questionNo).padStart(2, '0')}
      </td>
      <td className="max-w-[240px] px-2 py-2.5 text-[13px] leading-relaxed text-charcoal">
        {question.questionText}
      </td>
      <td className="min-w-[120px] px-2 py-2.5">
        <ScoreButtonGroup
          value={question.rawScore}
          disabled={locked}
          onChange={onScoreChange}
        />
      </td>
      <td className="min-w-[160px] px-2 py-2.5">
        <Textarea
          placeholder={question.rawScore === null ? 'ให้คะแนนก่อนเพื่อบันทึกหมายเหตุ' : 'บันทึกผู้ประเมิน'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={locked || question.rawScore === null}
          className="min-h-0 py-1.5 text-xs"
          rows={2}
        />
      </td>
      <td className="max-w-[160px] px-2 py-2.5 text-xs italic text-muted-foreground">
        {question.suggestion ?? ''}
      </td>
      <td className="px-2 py-2.5">
        <StatusBadge status={status.variant} label={status.label} className="whitespace-nowrap" />
      </td>
    </tr>
  )
}
