import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivityPhoto } from '../types/activity.types';
import { ActivityPhotoGrid } from './activity-photo-grid';
import { ActivityPhotoManager } from './activity-photo-manager';
import { ActivityPhotoPicker } from './activity-photo-picker';

vi.mock('../services/activity.service');

vi.mock('@/components/shared/confirm-dialog', () => ({
  useConfirm: () => vi.fn().mockResolvedValue(true),
}));

const photos = [
  { id: 'photo-1', src: '/uploads/activities/a/photos/one.jpg' },
  { id: 'photo-2', src: '/uploads/activities/a/photos/two.jpg' },
];

describe('ActivityPhotoGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the empty message when there is nothing to render', () => {
    render(<ActivityPhotoGrid photos={[]} alt="ภาพกิจกรรม" onRemove={vi.fn()} />);

    expect(screen.getByText('ยังไม่มีภาพ')).toBeInTheDocument();
  });

  it('numbers each photo so the view and delete controls name the one they act on', () => {
    render(<ActivityPhotoGrid photos={photos} alt="ภาพกิจกรรม" onRemove={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'ดูภาพที่ 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ลบภาพที่ 2' })).toBeInTheDocument();
  });

  it('removes by position, so the caller does not have to match on url', async () => {
    const onRemove = vi.fn();
    render(<ActivityPhotoGrid photos={photos} alt="ภาพกิจกรรม" onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button', { name: 'ลบภาพที่ 2' }));

    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('enlarges the photo that was clicked', async () => {
    render(<ActivityPhotoGrid photos={photos} alt="ภาพกิจกรรม" onRemove={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'ดูภาพที่ 1' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', photos[0].src);
  });
});

// The create form and the edit form show the same thing — a photo about to be
// in the album, and one already in it — so a tile must not be one size on one
// page and another size on the other. Both go through ActivityPhotoGrid, and
// this compares them to each other rather than to a fixed class string.
describe('picker and manager tiles', () => {
  const savedPhoto: ActivityPhoto = {
    id: 'photo-1',
    url: '/uploads/activities/a/photos/one.jpg',
    sortOrder: 0,
    uploadedAt: '2026-06-15T00:00:00.000Z',
  };

  function thumbnailClassOf(container: HTMLElement): string {
    const image = container.querySelector('img');
    if (!image) throw new Error('no thumbnail rendered');
    return image.className;
  }

  it('render a thumbnail of the same size', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const picker = render(
      <ActivityPhotoPicker
        files={[new File(['a'], 'a.jpg', { type: 'image/jpeg' })]}
        onChange={vi.fn()}
      />
    );
    await waitFor(() => expect(picker.container.querySelector('img')).toBeInTheDocument());

    const manager = render(
      <QueryClientProvider client={queryClient}>
        <ActivityPhotoManager activityId="activity-01" photos={[savedPhoto]} />
      </QueryClientProvider>
    );

    const pickerTile = thumbnailClassOf(picker.container);
    expect(pickerTile).not.toBe('');
    expect(pickerTile).toBe(thumbnailClassOf(manager.container));
  });
});
