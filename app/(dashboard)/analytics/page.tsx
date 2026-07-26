import type { Metadata } from 'next';
import { AnalyticsDashboard } from '@/features/analytics';

export const metadata: Metadata = {
  title: 'วิเคราะห์ศักยภาพ | Thai Rap',
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
