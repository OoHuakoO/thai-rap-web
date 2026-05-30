'use client'

import { Store, Activity, ClipboardList, Target, TrendingUp, Award } from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading'
import { AlertCard } from '@/components/shared/alert-card'
import { useKpi } from '../hooks/use-dashboard'
import { extractErrorMessage } from '@/utils/extract-error-message'

export function KpiRow() {
  const { data: kpi, isLoading, isError, error } = useKpi()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return <AlertCard variant="error" message={extractErrorMessage(error)} />
  }

  if (!kpi) return null

  const cards = [
    {
      title: 'ร้านอาหารทั้งหมด',
      value: kpi.totalStores,
      description: 'ร้านในโครงการ',
      icon: <Store className="h-4 w-4" />,
    },
    {
      title: 'กำลังพัฒนา',
      value: kpi.activeStores,
      description: 'ร้านที่ยังดำเนินการ',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: 'การประเมินทั้งหมด',
      value: kpi.assessmentCount,
      description: 'ครั้ง (T0–T4)',
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      title: 'อัตราความสำเร็จ',
      value: `${kpi.completionRate}%`,
      description: 'ผ่านเกณฑ์การประเมิน',
      icon: <Target className="h-4 w-4" />,
    },
    {
      title: 'คะแนนเฉลี่ย',
      value: kpi.averageScore.toFixed(1),
      description: 'คะแนนภาพรวม',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: 'เข้าสู่อุทยาน',
      value: kpi.incubationCount,
      description: 'ร้านผ่าน T4 แล้ว',
      icon: <Award className="h-4 w-4" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  )
}
