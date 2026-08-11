import type { Metadata } from 'next';
import { ActivityList, ActivityPageHeader } from '@/features/activity';

export const metadata: Metadata = {
  title: 'ประมวลภาพกิจกรรม',
};

export default function ActivitiesPage() {
  return (
    <section className="space-y-4">
      <ActivityPageHeader mode="list" />
      <ActivityList />
    </section>
  );
}
