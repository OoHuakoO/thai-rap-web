import type { Metadata } from 'next'
import {
  KpiRow,
  ProvinceDonut,
  IncubationStepper,
  ProvinceBarChart,
  ActivityFeed,
  Top20Table,
  ReportsStatusTable,
} from '@/features/dashboard'

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

      {/* KPI row */}
      <KpiRow />

      {/* Row 2: Donut | Top20 | Incubation (3 equal columns) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ProvinceDonut />
        <Top20Table />
        <IncubationStepper />
      </div>

      {/* Row 3: BarChart (2/3) | Activity (1/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProvinceBarChart />
        </div>
        <ActivityFeed />
      </div>

      {/* Row 4: Reports status */}
      <ReportsStatusTable />
    </div>
  )
}
