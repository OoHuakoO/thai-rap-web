import type { Metadata } from 'next';
import { ActivityPageHeader, EditActivityForm } from '@/features/activity';

export const metadata: Metadata = {
  title: 'แก้ไขกิจกรรม',
};

interface EditActivityPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const { id } = await params;

  return (
    <section className="space-y-4">
      <ActivityPageHeader mode="edit" />
      <EditActivityForm activityId={id} />
    </section>
  );
}
