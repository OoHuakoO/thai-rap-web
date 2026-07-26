import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/services/api';
import { newsService } from './news.service';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('newsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    vi.mocked(api.delete).mockResolvedValue({ data: null });
  });

  it('calls GET /news with no filter by default', async () => {
    await newsService.getAll();
    expect(api.get).toHaveBeenCalledWith('/news', { params: {} });
  });

  it('passes the type filter through as a query param', async () => {
    await newsService.getAll({ type: 'EVENT' });
    expect(api.get).toHaveBeenCalledWith('/news', { params: { type: 'EVENT' } });
  });

  it('calls GET /news/:id', async () => {
    await newsService.getById('news-01');
    expect(api.get).toHaveBeenCalledWith('/news/news-01');
  });

  it('calls POST /news with the payload', async () => {
    const payload = {
      type: 'GENERAL' as const,
      title: 'หัวข้อ',
      description: 'รายละเอียด',
      urgent: false,
    };
    await newsService.create(payload);
    expect(api.post).toHaveBeenCalledWith('/news', payload);
  });

  it('calls PATCH /news/:id with the changed fields only', async () => {
    await newsService.update('news-01', { urgent: true });
    expect(api.patch).toHaveBeenCalledWith('/news/news-01', { urgent: true });
  });

  it('calls DELETE /news/:id', async () => {
    await newsService.remove('news-01');
    expect(api.delete).toHaveBeenCalledWith('/news/news-01');
  });
});
