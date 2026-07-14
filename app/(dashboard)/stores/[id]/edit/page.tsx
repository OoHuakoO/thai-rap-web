import type { Metadata } from 'next'
import { StoreEditPage, StoreFormHeader, StoreListBackLink } from '@/features/store'

export const metadata: Metadata = {
  title: 'แก้ไขร้านอาหาร | Thai Rap',
}

interface EditStorePageProps {
  params: Promise<{ id: string }>
}

export default async function EditStorePageRoute({ params }: EditStorePageProps) {
  const { id } = await params

  return (
    <section className="space-y-4">
      <StoreListBackLink />
      <StoreFormHeader mode="edit" />
      <StoreEditPage storeId={id} />
    </section>
  )
}
