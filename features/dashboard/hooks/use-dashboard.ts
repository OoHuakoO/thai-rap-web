import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpi: () => ['dashboard', 'kpi'] as const,
  provinceDistribution: () => ['dashboard', 'province-distribution'] as const,
  top20: () => ['dashboard', 'top20'] as const,
  incubationSteps: () => ['dashboard', 'incubation-steps'] as const,
  provinceComparison: () => ['dashboard', 'province-comparison'] as const,
  activity: () => ['dashboard', 'activity'] as const,
  reportsStatus: () => ['dashboard', 'reports-status'] as const,
}

export function useKpi() {
  return useQuery({ queryKey: dashboardKeys.kpi(), queryFn: dashboardService.getKpi })
}

export function useProvinceDistribution() {
  return useQuery({
    queryKey: dashboardKeys.provinceDistribution(),
    queryFn: dashboardService.getProvinceDistribution,
  })
}

export function useTop20() {
  return useQuery({ queryKey: dashboardKeys.top20(), queryFn: dashboardService.getTop20 })
}

export function useIncubationSteps() {
  return useQuery({
    queryKey: dashboardKeys.incubationSteps(),
    queryFn: dashboardService.getIncubationSteps,
  })
}

export function useProvinceComparison() {
  return useQuery({
    queryKey: dashboardKeys.provinceComparison(),
    queryFn: dashboardService.getProvinceComparison,
  })
}

export function useActivity() {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: dashboardService.getActivity,
  })
}

export function useReportsStatus() {
  return useQuery({
    queryKey: dashboardKeys.reportsStatus(),
    queryFn: dashboardService.getReportsStatus,
  })
}
