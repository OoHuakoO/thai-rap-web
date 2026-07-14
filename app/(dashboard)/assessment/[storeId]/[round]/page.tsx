import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AssessmentForm, isValidRound } from '@/features/assessment'

export const metadata: Metadata = {
  title: 'ประเมินร้าน | Thai Rap',
}

interface AssessmentPageProps {
  params: Promise<{ storeId: string; round: string }>
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { storeId, round } = await params

  if (!isValidRound(round)) {
    notFound()
  }

  return (
    <section className="space-y-4">
      <AssessmentForm storeId={storeId} round={round} />
    </section>
  )
}
