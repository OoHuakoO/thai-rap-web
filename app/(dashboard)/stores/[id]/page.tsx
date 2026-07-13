import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { StoreDetail } from '@/features/store'

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
      <Link
        href={ROUTES.STORES}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-orange"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับไปรายการร้านอาหาร
      </Link>
      <StoreDetail storeId={id} variant="full" />
    </section>
  )
}
