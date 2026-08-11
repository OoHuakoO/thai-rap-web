import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Activity } from '../types/activity.types';
import { activityService } from '../services/activity.service';
import { CreateActivityForm } from './create-activity-form';

vi.mock('../services/activity.service');

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const created = { id: 'activity-99' } as Activity;

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateActivityForm />
    </QueryClientProvider>
  );
}

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText('ชื่อกิจกรรม'), 'ค่ายอบรม รุ่นที่ 1');
  await userEvent.type(screen.getByLabelText('รายละเอียดกิจกรรม'), 'อบรม 3 วัน');
  await userEvent.type(screen.getByLabelText('วันที่จัดกิจกรรม'), '2026-06-14');
}

async function attachPhoto() {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(input, new File(['a'], 'a.jpg', { type: 'image/jpeg' }));
}

describe('CreateActivityForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(activityService.create).mockResolvedValue(created);
    vi.mocked(activityService.uploadPhotos).mockResolvedValue(created);
  });

  it('saves the album, uploads the buffered photos, then opens the album', async () => {
    renderForm();
    await fillRequiredFields();
    await attachPhoto();

    await userEvent.click(screen.getByRole('button', { name: 'บันทึกกิจกรรม' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/activities/activity-99'));
    expect(activityService.create).toHaveBeenCalledTimes(1);
    expect(activityService.uploadPhotos).toHaveBeenCalledWith('activity-99', [
      expect.objectContaining({ name: 'a.jpg' }),
    ]);
  });

  // The create mutation resolves before the photos finish uploading. A submit
  // button that re-opens in that gap saves a second album for one click too many.
  it('keeps the submit button disabled until the photo upload finishes', async () => {
    let finishUpload!: () => void;
    vi.mocked(activityService.uploadPhotos).mockReturnValue(
      new Promise((resolve) => {
        finishUpload = () => resolve(created);
      })
    );

    renderForm();
    await fillRequiredFields();
    await attachPhoto();

    const submit = screen.getByRole('button', { name: 'บันทึกกิจกรรม' });
    await userEvent.click(submit);

    await waitFor(() => expect(activityService.uploadPhotos).toHaveBeenCalled());
    expect(submit).toBeDisabled();

    finishUpload();
    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(activityService.create).toHaveBeenCalledTimes(1);
  });
});
