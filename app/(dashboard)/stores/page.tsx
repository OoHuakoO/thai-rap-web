import type { Metadata } from 'next';
import { StoreExplorer } from '@/features/store';

export const metadata: Metadata = {
  title: 'ข้อมูลร้านอาหาร',
};

export default function StoresPage() {
  return (
    <section className="space-y-4">
      <StoreExplorer />
    </section>
  );
}
