import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/services/api';
import { activityService } from './activity.service';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('activityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { items: [], meta: {} } });
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    vi.mocked(api.delete).mockResolvedValue({ data: null });
  });

  it('calls GET /activities with no filter by default', async () => {
    await activityService.getAll();
    expect(api.get).toHaveBeenCalledWith('/activities', { params: {} });
  });

  it('passes search and paging through as query params', async () => {
    await activityService.getAll({ search: 'ค่าย', page: 2, limit: 12 });
    expect(api.get).toHaveBeenCalledWith('/activities', {
      params: { search: 'ค่าย', page: 2, limit: 12 },
    });
  });

  it('calls GET /activities/:id', async () => {
    await activityService.getById('activity-01');
    expect(api.get).toHaveBeenCalledWith('/activities/activity-01');
  });

  it('calls POST /activities with the payload', async () => {
    const payload = {
      title: 'ชื่อกิจกรรม',
      description: 'รายละเอียด',
      activityDate: '2026-06-14T00:00:00.000Z',
    };
    await activityService.create(payload);
    expect(api.post).toHaveBeenCalledWith('/activities', payload);
  });

  it('calls PATCH /activities/:id with the changed fields only', async () => {
    await activityService.update('activity-01', { note: 'หมายเหตุใหม่' });
    expect(api.patch).toHaveBeenCalledWith('/activities/activity-01', { note: 'หมายเหตุใหม่' });
  });

  it('calls DELETE /activities/:id', async () => {
    await activityService.remove('activity-01');
    expect(api.delete).toHaveBeenCalledWith('/activities/activity-01');
  });

  // The API reads a repeated `files` part — one FormData with every file, not
  // one request per photo.
  it('posts every photo under the same files key', async () => {
    const files = [
      new File(['a'], 'one.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'two.png', { type: 'image/png' }),
    ];
    await activityService.uploadPhotos('activity-01', files);

    const [url, form, config] = vi.mocked(api.post).mock.calls[0];
    expect(url).toBe('/activities/activity-01/photos');
    expect((form as FormData).getAll('files')).toHaveLength(2);
    expect(config?.headers).toEqual({ 'Content-Type': 'multipart/form-data' });
  });

  it('calls DELETE on a single photo', async () => {
    await activityService.deletePhoto('activity-01', 'photo-1');
    expect(api.delete).toHaveBeenCalledWith('/activities/activity-01/photos/photo-1');
  });
});
