import type { Metadata } from 'next';
import { PitchingFormWorkspace } from '@/features/pitching';

export const metadata: Metadata = {
  title: 'กรอกแบบประเมินพิชชิ่ง',
};

export default function PitchingFormPage() {
  return (
    <section className="space-y-4">
      <PitchingFormWorkspace />
    </section>
  );
}
