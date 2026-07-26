import type { Metadata } from 'next';
import { ReportPageHeader, ReportWorkspace } from '@/features/report';

export const metadata: Metadata = {
  title: 'รายงานผลการประเมิน',
};

export default function ReportsPage() {
  return (
    <section className="space-y-4">
      <ReportPageHeader />
      <ReportWorkspace />
    </section>
  );
}
