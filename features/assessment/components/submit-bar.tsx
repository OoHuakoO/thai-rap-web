'use client'

import { Button } from '@/components/ui/button'
import { TOTAL_QUESTIONS } from '../types/assessment.types'

interface SubmitBarProps {
  scored: number
  isSubmitted: boolean
  isPending: boolean
  onSubmit: () => void
}

export function SubmitBar({ scored, isSubmitted, isPending, onSubmit }: SubmitBarProps) {
  if (isSubmitted) {
    return (
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <span className="rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-bold text-green-700">
          ✓ ส่งผลแล้ว — ล็อคการแก้ไข
        </span>
      </div>
    )
  }

  const remaining = TOTAL_QUESTIONS - scored

  return (
    <div className="flex items-center justify-end gap-3 border-t pt-4">
      {remaining > 0 ? (
        <span className="text-sm text-muted-foreground">
          ยังขาด <b className="text-charcoal">{remaining}</b> ข้อ
        </span>
      ) : (
        <span className="text-sm font-medium text-score-green">✓ ครบทุกข้อแล้ว</span>
      )}
      <Button onClick={onSubmit} disabled={isPending}>
        {isPending ? 'กำลังส่ง...' : remaining > 0 ? 'Submit → ข้ามไปข้อที่ขาด' : `Submit`}
      </Button>
    </div>
  )
}
