import type { Metadata } from 'next';
import { PitchingRankingWorkspace } from '@/features/pitching';

export const metadata: Metadata = {
  title: 'อันดับคะแนนพิชชิ่ง',
};

export default function PitchingRankingPage() {
  return (
    <section className="space-y-4">
      <PitchingRankingWorkspace />
    </section>
  );
}
