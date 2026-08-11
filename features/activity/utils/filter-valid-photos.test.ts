import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_FILE_SIZE_BYTES } from '@/constants';
import { ACTIVITY_PHOTO_MAX_PER_UPLOAD } from '../constants/activity.constants';
import { filterValidPhotos } from './filter-valid-photos';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

function photo(name: string, size = 1024): File {
  const file = new File(['x'], name, { type: 'image/jpeg' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function photos(count: number): File[] {
  return Array.from({ length: count }, (_, index) => photo(`photo-${index}.jpg`));
}

describe('filterValidPhotos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps a selection that is within both limits', () => {
    expect(filterValidPhotos(photos(3))).toHaveLength(3);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('drops an oversized file and names it, keeping the rest of the selection', () => {
    const result = filterValidPhotos([
      photo('ok.jpg'),
      photo('huge.jpg', MAX_FILE_SIZE_BYTES + 1),
      photo('ok-2.jpg'),
    ]);

    expect(result.map((file) => file.name)).toEqual(['ok.jpg', 'ok-2.jpg']);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(vi.mocked(toast.error).mock.calls[0][0]).toContain('huge.jpg');
  });

  it('caps the selection at the per-request maximum and says how many it skipped', () => {
    const result = filterValidPhotos(photos(ACTIVITY_PHOTO_MAX_PER_UPLOAD + 5));

    expect(result).toHaveLength(ACTIVITY_PHOTO_MAX_PER_UPLOAD);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(vi.mocked(toast.error).mock.calls[0][0]).toContain('5');
  });

  // The picker adds to a selection it already holds, so the cap has to count
  // both — otherwise two batches of 15 sail past a limit of 20.
  it('counts photos the caller already holds against the cap', () => {
    const result = filterValidPhotos(photos(15), ACTIVITY_PHOTO_MAX_PER_UPLOAD - 4);

    expect(result).toHaveLength(4);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('keeps nothing once the caller is already at the cap', () => {
    expect(filterValidPhotos(photos(2), ACTIVITY_PHOTO_MAX_PER_UPLOAD)).toEqual([]);
  });
});
