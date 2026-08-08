import type { Metadata } from 'next';
import { PitchingDashboard } from '@/features/pitching';

export const metadata: Metadata = {
  title: 'คะแนนพิชชิ่ง',
};

export default function PitchingPage() {
  return (
    <section className="space-y-4">
      <PitchingDashboard />
    </section>
  );
}
