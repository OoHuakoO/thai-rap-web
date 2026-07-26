import type { Metadata } from 'next';
import { AnalyticsDashboard } from '@/features/analytics';

export const metadata: Metadata = {
  title: 'วิเคราะห์ศักยภาพ',
};

export default function AnalyticsPage() {
  return (
    <section className="space-y-4">
      <AnalyticsDashboard />
    </section>
  );
}
