import type { Metadata } from 'next'
import { StoreDetail, StoreListBackLink } from '@/features/store'

export const metadata: Metadata = {
  title: 'รายละเอียดร้าน | Thai Rap',
}

interface StoreDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { id } = await params

  return (
    <section className="space-y-4">
      <StoreListBackLink />
      <StoreDetail storeId={id} variant="full" />
    </section>
  )
}
