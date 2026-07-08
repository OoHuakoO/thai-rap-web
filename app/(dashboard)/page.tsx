import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Thai Rap',
}

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Page Header — project title (org logos deferred) */}
      <div className="-mx-6 -mt-6 border-b bg-white px-6 py-4 text-center">
        <h1 className="text-sm font-bold text-charcoal sm:text-base">
          หน่วยบริการเครือข่าย การพัฒนาผู้ประกอบธุรกิจอาหาร ในภูมิภาค ภาคตะวันออก
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
          ภายใต้โครงการการสร้างผู้ประกอบการอาหารมืออาชีพ
        </p>
        <p className="mt-0.5 text-xs font-semibold text-orange sm:text-sm">
          ประปีงบประมาณ พ.ศ. 2569
        </p>
      </div>
    </div>
  )
}
