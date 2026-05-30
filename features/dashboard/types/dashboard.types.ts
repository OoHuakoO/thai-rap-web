export interface DashboardKPI {
  totalStores: number
  activeStores: number
  assessmentCount: number
  completionRate: number
  averageScore: number
  incubationCount: number
}

export interface ProvinceDistribution {
  province: string
  count: number
}

export interface Top20Item {
  rank: number
  id: string
  name: string
  province: string
  type: string
  score: number
}

export interface IncubationStep {
  label: string
  sublabel: string
  count: number
  percent: number
  status: 'completed' | 'active' | 'pending'
}

export interface ProvinceComparison {
  province: string
  t0: number
  t1: number
}

export interface ActivityItem {
  id: string
  variant: 'info' | 'warning' | 'success' | 'error'
  title?: string
  message: string
  timestamp: string
}

export interface ReportStatusItem {
  id: string
  name: string
  type: string
  status: 'pass' | 'pending' | 'fail' | 'warning'
  updatedAt: string
}
