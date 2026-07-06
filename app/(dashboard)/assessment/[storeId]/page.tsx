import type { Metadata } from 'next'
import { RoundPicker } from '@/features/assessment'

export const metadata: Metadata = {
  title: 'เลือกรอบประเมิน | Thai Rap',
}

interface RoundPickerPageProps {
  params: Promise<{ storeId: string }>
}

export default async function AssessmentRoundPickerPage({ params }: RoundPickerPageProps) {
  const { storeId } = await params

  return (
    <section className="space-y-4">
      <RoundPicker storeId={storeId} />
    </section>
  )
}
