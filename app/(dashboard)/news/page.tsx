import type { Metadata } from 'next';
import { NewsList, NewsPageHeader } from '@/features/news';

export const metadata: Metadata = {
  title: 'ข่าวประชาสัมพันธ์',
};

export default function NewsPage() {
  return (
    <section className="space-y-4">
      <NewsPageHeader mode="list" />
      <NewsList />
    </section>
  );
}
