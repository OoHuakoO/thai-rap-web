import type { NewsItem } from '@/features/news/types/news.types';

const seed: NewsItem[] = [
  {
    id: 'news-01',
    type: 'EVENT',
    title: 'กิจกรรมอบรมหลักสูตรการจัดการต้นทุน',
    description: 'วันที่ 25 พ.ค. 2569 เวลา 09:00 น.',
    urgent: false,
    publishedAt: '2026-05-19T00:00:00.000Z',
    authorId: '1',
    authorName: 'นายคมศักดิ์ กรณย์ประกิตต์',
  },
  {
    id: 'news-02',
    type: 'GENERAL',
    title: 'อัปเดตเกณฑ์การประเมินโครงการ ปี 2569',
    description: 'มีผลตั้งแต่วันที่ 18 พ.ค. 2569 เป็นต้นไป',
    urgent: false,
    publishedAt: '2026-05-18T00:00:00.000Z',
    authorId: '1',
    authorName: 'นายคมศักดิ์ กรณย์ประกิตต์',
  },
  {
    id: 'news-03',
    type: 'ALERT',
    title: 'ปิดระบบชั่วคราวเพื่อปรับปรุงฐานข้อมูล',
    description: 'คืนวันที่ 22 พ.ค. 2569 เวลา 22:00 - 02:00 น.',
    urgent: true,
    publishedAt: '2026-05-17T00:00:00.000Z',
    authorId: '1',
    authorName: 'นายคมศักดิ์ กรณย์ประกิตต์',
  },
];

let store: NewsItem[] = [...seed];

export const newsDb = {
  reset: () => {
    store = [...seed];
  },
  // Urgent first, then newest — same ordering the API applies.
  getAll: () =>
    [...store].sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return b.publishedAt.localeCompare(a.publishedAt);
    }),
  findById: (id: string) => store.find((item) => item.id === id) ?? null,
  create: (item: NewsItem) => {
    store = [item, ...store];
    return item;
  },
  update: (id: string, data: Partial<NewsItem>): NewsItem | null => {
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated = { ...store[index], ...data };
    store = [...store.slice(0, index), updated, ...store.slice(index + 1)];
    return updated;
  },
  remove: (id: string): boolean => {
    const before = store.length;
    store = store.filter((item) => item.id !== id);
    return store.length < before;
  },
};
