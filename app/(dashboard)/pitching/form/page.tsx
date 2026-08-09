import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loading } from '@/components/shared/loading';
import { PitchingFormWorkspace } from '@/features/pitching';

export const metadata: Metadata = {
  title: 'กรอกแบบประเมินพิชชิ่ง',
};

export default function PitchingFormPage() {
  return (
    <section className="space-y-4">
      {/* The workspace reads ?storeId/?round with useSearchParams, which opts
          the tree into client-side rendering and needs a boundary above it. */}
      <Suspense fallback={<Loading className="py-16" />}>
        <PitchingFormWorkspace />
      </Suspense>
    </section>
  );
}
