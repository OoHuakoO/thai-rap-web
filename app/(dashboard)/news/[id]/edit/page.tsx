import type { Metadata } from 'next';
import { EditNewsForm, NewsPageHeader } from '@/features/news';

export const metadata: Metadata = {
  title: 'แก้ไขข่าวประชาสัมพันธ์',
};

interface EditNewsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNewsPageRoute({ params }: EditNewsPageProps) {
  const { id } = await params;

  return (
    <section className="space-y-4">
      <NewsPageHeader mode="edit" />
      <EditNewsForm newsId={id} />
    </section>
  );
}
