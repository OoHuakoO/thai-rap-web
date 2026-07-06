'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/constants/routes'
import { useAssessmentSummaries } from '../hooks/use-assessment'
import type { Round } from '../types/assessment.types'

const ROUNDS: Round[] = ['T0', 'T1', 'T2', 'T3', 'T4']

interface RoundPillsProps {
  storeId: string
  activeRound?: Round
}

export function RoundPills({ storeId, activeRound }: RoundPillsProps) {
  const { data: summaries } = useAssessmentSummaries(storeId)

  return (
    <div className="flex flex-wrap gap-1.5">
      {ROUNDS.map((round) => {
        const summary = summaries?.find((s) => s.round === round)
        const isSubmitted = summary?.status === 'SUBMITTED'
        const isActive = round === activeRound

        return (
          <Link
            key={round}
            href={ROUTES.ASSESSMENT_DETAIL(storeId, round)}
            className={cn(
              'relative rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-bold transition-all',
              isActive && 'border-[var(--color-dark-nav)] bg-[var(--color-dark-nav)] text-white',
              !isActive &&
                isSubmitted &&
                'border-score-green text-score-green',
              !isActive &&
                !isSubmitted &&
                'border-border text-muted-foreground hover:border-orange hover:text-orange'
            )}
          >
            {round}
            {isSubmitted && !isActive && (
              <span className="absolute -right-1 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-score-green text-white">
                <Check className="h-2 w-2" strokeWidth={3} />
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
