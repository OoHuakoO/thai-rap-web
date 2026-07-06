'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAssessmentSummaries } from '../hooks/use-assessment'
import type { Round } from '../types/assessment.types'

const ROUNDS: Round[] = ['T0', 'T1', 'T2', 'T3', 'T4']
const LOCKED_UNTIL_T1: Round[] = ['T2', 'T3', 'T4']

interface RoundPillsProps {
  storeId: string
  activeRound?: Round
}

export function RoundPills({ storeId, activeRound }: RoundPillsProps) {
  const router = useRouter()
  const { data: summaries } = useAssessmentSummaries(storeId)
  const [lockOpen, setLockOpen] = useState(false)

  const t1Submitted = summaries?.find((s) => s.round === 'T1')?.status === 'SUBMITTED'

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {ROUNDS.map((round) => {
          const summary = summaries?.find((s) => s.round === round)
          const isSubmitted = summary?.status === 'SUBMITTED'
          const isActive = round === activeRound
          const isLocked = LOCKED_UNTIL_T1.includes(round) && !t1Submitted

          return (
            <button
              key={round}
              type="button"
              onClick={() => {
                if (isLocked) {
                  setLockOpen(true)
                  return
                }
                router.push(ROUTES.ASSESSMENT_DETAIL(storeId, round))
              }}
              className={cn(
                'relative rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-bold transition-all',
                isLocked && 'cursor-not-allowed border-border text-muted-foreground/50',
                !isLocked &&
                  isActive &&
                  'border-[var(--color-dark-nav)] bg-[var(--color-dark-nav)] text-white',
                !isLocked && !isActive && isSubmitted && 'border-score-green text-score-green',
                !isLocked &&
                  !isActive &&
                  !isSubmitted &&
                  'border-border text-muted-foreground hover:border-orange hover:text-orange'
              )}
            >
              {round}
              {isLocked && (
                <Lock className="ml-1 inline-block h-2.5 w-2.5 -translate-y-px" strokeWidth={3} />
              )}
              {isSubmitted && !isActive && !isLocked && (
                <span className="absolute -right-1 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-score-green text-white">
                  <Check className="h-2 w-2" strokeWidth={3} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader className="items-center">
            <span className="text-4xl">🔒</span>
            <DialogTitle>ต้องทำรอบ T1 ก่อน</DialogTitle>
            <DialogDescription>
              ไม่สามารถเข้าถึงรอบนี้ได้
              <br />
              กรุณาทำการประเมินรอบ <b className="text-charcoal">T1</b> ให้เสร็จก่อน
              <br />
              จึงจะสามารถเข้าถึง T2, T3, T4 ได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setLockOpen(false)}>เข้าใจแล้ว</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
