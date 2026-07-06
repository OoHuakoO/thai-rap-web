import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AssessmentForm } from '@/features/assessment'
import type { Round } from '@/features/assessment'

const VALID_ROUNDS: Round[] = ['T0', 'T1', 'T2', 'T3', 'T4']

export const metadata: Metadata = {
  title: 'ประเมินร้าน | Thai Rap',
}

interface AssessmentPageProps {
  params: Promise<{ storeId: string; round: string }>
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { storeId, round } = await params

  if (!VALID_ROUNDS.includes(round as Round)) {
    notFound()
  }

  return (
    <section className="space-y-4">
      <AssessmentForm storeId={storeId} round={round as Round} />
    </section>
  )
}
