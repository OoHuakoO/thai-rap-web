import type { Metadata } from 'next';
import {
  ActivityFeedCard,
  IncubationProgressCard,
  KpiRow,
  ProvinceComparisonCard,
  ProvinceDonutCard,
  ReportsStatusCard,
  Top20Card,
} from '@/features/dashboard';

export const metadata: Metadata = {
  title: 'ภาพรวมโครงการ | Thai Rap',
};

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <KpiRow />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ProvinceDonutCard />
        <Top20Card />
        <IncubationProgressCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ProvinceComparisonCard />
        <ActivityFeedCard />
        <ReportsStatusCard />
      </div>
    </div>
  );
}
