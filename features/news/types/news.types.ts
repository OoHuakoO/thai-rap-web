export type NewsType = 'GENERAL' | 'EVENT' | 'ALERT';

export interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  description: string;
  urgent: boolean;
  publishedAt: string;
  authorId: string;
  authorName: string;
}

export interface CreateNewsDto {
  type: NewsType;
  title: string;
  description: string;
  urgent: boolean;
  publishedAt?: string;
}

export type UpdateNewsDto = Partial<CreateNewsDto>;

export interface NewsQuery {
  type?: NewsType;
  limit?: number;
}
