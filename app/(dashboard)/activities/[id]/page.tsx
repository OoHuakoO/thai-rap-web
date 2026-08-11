import type { Metadata } from 'next';
import { ActivityDetail } from '@/features/activity';

export const metadata: Metadata = {
  title: 'ประมวลภาพกิจกรรม',
};

interface ActivityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { id } = await params;

  return (
    <section className="space-y-4">
      <ActivityDetail activityId={id} />
    </section>
  );
}
