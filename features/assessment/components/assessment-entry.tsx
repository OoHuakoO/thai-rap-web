'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/shared/loading'
import { ROUTES } from '@/constants/routes'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { useStores } from '@/features/store'
import { useAssessmentSummaries } from '../hooks/use-assessment'
import type { Round } from '../types/assessment.types'

const ROUNDS: Round[] = ['T0', 'T1', 'T2', 'T3', 'T4']

export function AssessmentEntry() {
  const router = useRouter()
  const { data, isLoading, isError, error } = useStores({ limit: 1 })
  const firstStore = data?.items[0]
  const { data: summaries } = useAssessmentSummaries(firstStore?.id ?? '')

  useEffect(() => {
    if (!firstStore || !summaries) return
    const currentRound =
      ROUNDS.find(
        (round) => summaries.find((s) => s.round === round)?.status !== 'SUBMITTED'
      ) ?? ROUNDS[ROUNDS.length - 1]
    router.replace(ROUTES.ASSESSMENT_DETAIL(firstStore.id, currentRound))
  }, [firstStore, summaries, router])

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>
  }

  if (!isLoading && data && !firstStore) {
    return <p className="py-8 text-center text-muted-foreground">ยังไม่มีร้านให้ประเมิน</p>
  }

  return <Loading className="py-16" />
}
