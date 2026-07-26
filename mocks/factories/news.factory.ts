import type { CreateNewsDto, NewsItem } from '@/features/news/types/news.types';

let idCounter = 100;

const MOCK_AUTHOR = { id: '1', name: 'นายคมศักดิ์ กรณย์ประกิตต์' };

export function createNews(overrides: Partial<NewsItem> = {}): NewsItem {
  const id = `news-${++idCounter}`;
  return {
    id,
    type: 'GENERAL',
    title: `ข่าวประชาสัมพันธ์ ${id}`,
    description: 'รายละเอียดข่าวประชาสัมพันธ์',
    urgent: false,
    publishedAt: new Date().toISOString(),
    authorId: MOCK_AUTHOR.id,
    authorName: MOCK_AUTHOR.name,
    ...overrides,
  };
}

export function createNewsFromDto(dto: CreateNewsDto): NewsItem {
  return createNews({
    type: dto.type,
    title: dto.title,
    description: dto.description,
    urgent: dto.urgent,
    publishedAt: dto.publishedAt ?? new Date().toISOString(),
  });
}
