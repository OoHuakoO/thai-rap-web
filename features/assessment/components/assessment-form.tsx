'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Loading } from '@/components/shared/loading'
import { ProgressBar } from '@/components/shared/progress-bar'
import { Button } from '@/components/ui/button'
import { extractErrorMessage } from '@/utils/extract-error-message'
import { useStore } from '@/features/store'
import { AssessmentStorePicker } from './assessment-store-picker'
import { RoundPills } from './round-pills'
import { DimensionList } from './dimension-list'
import { AssessTable } from './assess-table'
import { ScoreSummary } from './score-summary'
import { SubmitBar } from './submit-bar'
import { TimelineArea } from './timeline-area'
import {
  assessmentKeys,
  useAssessment,
  useDeleteEvidence,
  useDimensions,
  useSubmitAssessment,
  useUpdateScore,
  useUploadEvidence,
} from '../hooks/use-assessment'
import { TOTAL_QUESTIONS } from '../types/assessment.types'
import type { Round } from '../types/assessment.types'

interface AssessmentFormProps {
  storeId: string
  round: Round
}

export function AssessmentForm({ storeId, round }: AssessmentFormProps) {
  const queryClient = useQueryClient()
  const { data: store } = useStore(storeId)
  const { data: assessment, isLoading, isError, error } = useAssessment(storeId, round)
  const { data: dimensions } = useDimensions()
  const [selectedDim, setSelectedDim] = useState(1)
  const [highlightedId, setHighlightedId] = useState<number | null>(null)

  const updateScore = useUpdateScore(storeId, round, assessment?.id ?? '')
  const submitAssessment = useSubmitAssessment(storeId, round, assessment?.id ?? '')
  const uploadEvidence = useUploadEvidence(storeId, round, assessment?.id ?? '')
  const deleteEvidence = useDeleteEvidence(storeId, round, assessment?.id ?? '')

  if (isLoading) return <Loading className="py-16" />

  if (isError) {
    return <p className="py-8 text-center text-destructive">{extractErrorMessage(error)}</p>
  }

  if (!assessment) return null

  const locked = assessment.status === 'SUBMITTED'
  const scoredCount = assessment.questions.filter((q) => q.rawScore !== null).length
  const progressPct = Math.round((scoredCount / TOTAL_QUESTIONS) * 100)
  const dimension = dimensions?.find((d) => d.id === selectedDim) ?? dimensions?.[0]
  const dimQuestions = assessment.questions.filter((q) => q.dimensionId === dimension?.id)

  const handleScoreChange = (questionId: number, score: number) => {
    const question = assessment.questions.find((q) => q.questionId === questionId)
    updateScore.mutate(
      { questionId, rawScore: score, note: question?.note ?? undefined },
      { onError: (err) => toast.error(extractErrorMessage(err)) }
    )
  }

  const handleNoteChange = (questionId: number, note: string) => {
    const question = assessment.questions.find((q) => q.questionId === questionId)
    if (question?.rawScore === null || question?.rawScore === undefined) return
    updateScore.mutate(
      { questionId, rawScore: question.rawScore, note },
      { onError: (err) => toast.error(extractErrorMessage(err)) }
    )
  }

  const handleUploadEvidence = (questionId: number, file: File) => {
    uploadEvidence.mutate(
      { questionId, file },
      {
        onSuccess: () => toast.success(`แนบไฟล์ ${file.name} แล้ว`),
        onError: (err) => toast.error(extractErrorMessage(err)),
      }
    )
  }

  const handleDeleteEvidence = (evidenceId: string) => {
    deleteEvidence.mutate(evidenceId, {
      onSuccess: () => toast.success('ลบไฟล์แล้ว'),
      onError: (err) => toast.error(extractErrorMessage(err)),
    })
  }

  const handleSaveDraft = () => {
    queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) })
    toast.success('บันทึกร่างเรียบร้อย')
  }

  const maxDim = dimensions?.length ?? 8

  const handleSaveNext = () => {
    queryClient.invalidateQueries({ queryKey: assessmentKeys.byStoreRound(storeId, round) })
    if (selectedDim < maxDim) {
      setSelectedDim(selectedDim + 1)
      requestAnimationFrame(() => {
        document.getElementById('assess-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      toast.success(`บันทึกแล้ว — ไปมิติที่ ${selectedDim + 1}`)
    } else {
      document.getElementById('submit-bar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.success('บันทึกแล้ว — ครบทุกมิติ พร้อม Submit')
    }
  }

  const handleSubmit = () => {
    const firstUnscored = [...assessment.questions]
      .sort((a, b) => a.questionNo - b.questionNo)
      .find((q) => q.rawScore === null)

    if (firstUnscored) {
      setSelectedDim(firstUnscored.dimensionId)
      setHighlightedId(firstUnscored.questionId)
      requestAnimationFrame(() => {
        document.getElementById(`q-${firstUnscored.questionId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
      setTimeout(() => setHighlightedId(null), 2500)
      return
    }

    if (!window.confirm(`ยืนยัน Submit รอบ ${round}?\n\nหลัง Submit แล้วจะไม่สามารถแก้ไขคะแนนได้`)) {
      return
    }

    submitAssessment.mutate(undefined, {
      onSuccess: () => toast.success('ส่งผลการประเมินสำเร็จ'),
      onError: (err) => toast.error(extractErrorMessage(err)),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-3 shadow-sm">
        <AssessmentStorePicker storeId={storeId} storeName={store?.name} round={round} />
        <div>
          <p className="mb-1 text-[10px] text-muted-foreground">รอบประเมิน</p>
          <RoundPills storeId={storeId} activeRound={round} />
        </div>
        <div className="min-w-[160px] flex-1">
          <p className="mb-1 text-[10px] text-muted-foreground">ความคืบหน้าการประเมิน</p>
          <div className="flex items-center gap-2">
            <ProgressBar value={progressPct} className="flex-1" />
            <span className="text-sm font-bold text-orange">{progressPct}%</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-1.5 border-orange text-orange hover:bg-orange/10 hover:text-orange"
            onClick={handleSaveDraft}
            disabled={locked}
          >
            💾 บันทึกร่าง
          </Button>
          <Button onClick={handleSaveNext} disabled={locked}>
            บันทึกและถัดไป →
          </Button>
        </div>
      </div>

      {dimensions && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[205px_minmax(0,1fr)_270px] lg:items-start">
          <DimensionList
            dimensions={dimensions}
            questions={assessment.questions}
            selectedId={selectedDim}
            totalScore={assessment.totalScore}
            onSelect={setSelectedDim}
          />

          {dimension && (
            <AssessTable
              dimension={dimension}
              questions={dimQuestions}
              locked={locked}
              highlightedId={highlightedId}
              isUploading={uploadEvidence.isPending}
              onScoreChange={handleScoreChange}
              onNoteChange={handleNoteChange}
              onUploadEvidence={handleUploadEvidence}
              onDeleteEvidence={handleDeleteEvidence}
              onSaveDraft={handleSaveDraft}
              onSaveNext={handleSaveNext}
            />
          )}

          <ScoreSummary
            storeId={storeId}
            store={store}
            round={round}
            selectedDimId={selectedDim}
            totalScore={assessment.totalScore}
            questions={assessment.questions}
            redFlags={assessment.redFlags}
            isSubmitted={locked}
          />
        </div>
      )}

      <div id="submit-bar" className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <SubmitBar
          scored={scoredCount}
          isSubmitted={locked}
          isPending={submitAssessment.isPending}
          onSubmit={handleSubmit}
        />
      </div>

      <TimelineArea storeId={storeId} round={round} assessmentId={assessment.id} notes={assessment.notes} />
    </div>
  )
}
