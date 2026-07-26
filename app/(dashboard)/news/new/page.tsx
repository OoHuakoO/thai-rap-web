import type { Metadata } from 'next';
import { CreateNewsForm, NewsPageHeader } from '@/features/news';

export const metadata: Metadata = {
  title: 'สร้างข่าวประชาสัมพันธ์',
};

export default function NewNewsPage() {
  return (
    <section className="space-y-4">
      <NewsPageHeader mode="create" />
      <CreateNewsForm />
    </section>
  );
}
