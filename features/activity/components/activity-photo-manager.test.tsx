import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { activityService } from '../services/activity.service';
import type { ActivityPhoto } from '../types/activity.types';
import { ActivityPhotoManager } from './activity-photo-manager';

vi.mock('../services/activity.service');

const confirm = vi.fn().mockResolvedValue(true);
vi.mock('@/components/shared/confirm-dialog', () => ({
  useConfirm: () => confirm,
}));

const photos: ActivityPhoto[] = [
  {
    id: 'photo-1',
    url: '/uploads/activities/activity-01/photos/a.jpg',
    sortOrder: 0,
    uploadedAt: '2026-06-15T00:00:00.000Z',
  },
  {
    id: 'photo-2',
    url: '/uploads/activities/activity-01/photos/b.jpg',
    sortOrder: 1,
    uploadedAt: '2026-06-15T00:00:00.000Z',
  },
];

function renderManager() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ActivityPhotoManager activityId="activity-01" photos={photos} />
    </QueryClientProvider>
  );
}

describe('ActivityPhotoManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    confirm.mockResolvedValue(true);
  });

  it('opens the lightbox when a thumbnail is clicked', async () => {
    renderManager();

    await userEvent.click(screen.getByRole('button', { name: 'ดูภาพที่ 1' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('img')).toBeInTheDocument();
  });

  it('deletes a photo only after the confirm dialog is accepted', async () => {
    vi.mocked(activityService.deletePhoto).mockResolvedValue(null);
    renderManager();

    await userEvent.click(screen.getByRole('button', { name: 'ลบภาพที่ 1' }));

    await waitFor(() =>
      expect(activityService.deletePhoto).toHaveBeenCalledWith('activity-01', 'photo-1')
    );
  });

  it('does not delete when the confirm dialog is dismissed', async () => {
    confirm.mockResolvedValue(false);
    renderManager();

    await userEvent.click(screen.getByRole('button', { name: 'ลบภาพที่ 1' }));

    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(activityService.deletePhoto).not.toHaveBeenCalled();
  });

  it('shows the empty state when the album has no photos', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <ActivityPhotoManager activityId="activity-01" photos={[]} />
      </QueryClientProvider>
    );

    expect(screen.getByText('ยังไม่มีภาพ')).toBeInTheDocument();
  });
});
