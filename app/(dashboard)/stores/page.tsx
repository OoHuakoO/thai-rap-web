import type { Metadata } from 'next'
import { StoreExplorer } from '@/features/store'

export const metadata: Metadata = {
  title: 'ข้อมูลร้านอาหาร | Thai Rap',
}

export default function StoresPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">ข้อมูลร้านอาหาร</h1>
        <p className="text-sm text-muted-foreground">Restaurant Profiles</p>
      </div>

      <StoreExplorer />
    </section>
  )
}
