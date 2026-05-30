import api from '@/services/api'
import type {
  DashboardKPI,
  ProvinceDistribution,
  Top20Item,
  IncubationStep,
  ProvinceComparison,
  ActivityItem,
  ReportStatusItem,
} from '../types/dashboard.types'

export const dashboardService = {
  getKpi: () => api.get<DashboardKPI>('/dashboard/kpi').then((r) => r.data),
  getProvinceDistribution: () =>
    api.get<ProvinceDistribution[]>('/dashboard/province-distribution').then((r) => r.data),
  getTop20: () => api.get<Top20Item[]>('/dashboard/top20').then((r) => r.data),
  getIncubationSteps: () =>
    api.get<IncubationStep[]>('/dashboard/incubation-steps').then((r) => r.data),
  getProvinceComparison: () =>
    api.get<ProvinceComparison[]>('/dashboard/province-comparison').then((r) => r.data),
  getActivity: () => api.get<ActivityItem[]>('/dashboard/activity').then((r) => r.data),
  getReportsStatus: () =>
    api.get<ReportStatusItem[]>('/dashboard/reports-status').then((r) => r.data),
}
