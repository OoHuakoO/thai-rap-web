import type { Metadata } from 'next';
import { ActivityPageHeader, CreateActivityForm } from '@/features/activity';

export const metadata: Metadata = {
  title: 'เพิ่มกิจกรรม',
};

export default function NewActivityPage() {
  return (
    <section className="space-y-4">
      <ActivityPageHeader mode="create" />
      <CreateActivityForm />
    </section>
  );
}
