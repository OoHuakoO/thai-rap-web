import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/types/auth.types';
import { activityService } from '../services/activity.service';
import type { Activity } from '../types/activity.types';
import { ActivityList } from './activity-list';

vi.mock('../services/activity.service');

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const confirm = vi.fn().mockResolvedValue(true);
vi.mock('@/components/shared/confirm-dialog', () => ({
  useConfirm: () => confirm,
}));

const activity: Activity = {
  id: 'activity-01',
  title: 'ค่ายอบรมผู้ประกอบการ รุ่นที่ 1',
  description: 'อบรมเข้มข้น 3 วัน',
  note: null,
  activityDate: '2026-06-14T00:00:00.000Z',
  location: 'กรุงเทพฯ',
  photos: [
    {
      id: 'photo-1',
      url: '/uploads/activities/activity-01/photos/a.jpg',
      sortOrder: 0,
      uploadedAt: '2026-06-15T00:00:00.000Z',
    },
  ],
  photoCount: 1,
  createdById: '1',
  createdByName: 'ผู้ดูแลระบบ',
  createdAt: '2026-06-15T00:00:00.000Z',
  updatedAt: '2026-06-15T00:00:00.000Z',
};

function pageOf(items: Activity[]) {
  return {
    items,
    meta: { page: 1, limit: 12, total: items.length, totalPages: 1 },
  };
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function signInAs(role: (typeof ROLES)[keyof typeof ROLES]) {
  useAuthStore.setState({
    user: { id: '1', name: 'ผู้ใช้', email: 'user@example.com', role },
    isAuthenticated: true,
  });
}

describe('ActivityList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    confirm.mockResolvedValue(true);
    signInAs(ROLES.ADMIN);
  });

  it('renders each album with its date and photo count', async () => {
    vi.mocked(activityService.getAll).mockResolvedValue(pageOf([activity]));
    renderWithClient(<ActivityList />);

    expect(await screen.findByText('ค่ายอบรมผู้ประกอบการ รุ่นที่ 1')).toBeInTheDocument();
    expect(screen.getByText('1 ภาพ')).toBeInTheDocument();
    expect(screen.getByText('กรุงเทพฯ')).toBeInTheDocument();
  });

  it('shows the create button for ADMIN', async () => {
    vi.mocked(activityService.getAll).mockResolvedValue(pageOf([activity]));
    renderWithClient(<ActivityList />);

    expect(await screen.findByRole('button', { name: 'เพิ่มกิจกรรม' })).toBeInTheDocument();
  });

  it('shows the create button for SUPER_ADMIN', async () => {
    signInAs(ROLES.SUPER_ADMIN);
    vi.mocked(activityService.getAll).mockResolvedValue(pageOf([activity]));
    renderWithClient(<ActivityList />);

    expect(await screen.findByRole('button', { name: 'เพิ่มกิจกรรม' })).toBeInTheDocument();
  });

  // Every other role reads the album and manages nothing on it.
  it.each([ROLES.ASSESSOR, ROLES.MENTOR, ROLES.ENTREPRENEUR, ROLES.JUDGE, ROLES.VIEWER])(
    'hides create and card actions from %s',
    async (role) => {
      signInAs(role);
      vi.mocked(activityService.getAll).mockResolvedValue(pageOf([activity]));
      renderWithClient(<ActivityList />);

      await screen.findByText('ค่ายอบรมผู้ประกอบการ รุ่นที่ 1');
      expect(screen.queryByRole('button', { name: 'เพิ่มกิจกรรม' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /^แก้ไข/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^ลบ/ })).not.toBeInTheDocument();
    }
  );

  it('refetches with the debounced search term', async () => {
    vi.mocked(activityService.getAll).mockResolvedValue(pageOf([activity]));
    renderWithClient(<ActivityList />);

    await screen.findByText('ค่ายอบรมผู้ประกอบการ รุ่นที่ 1');
    await userEvent.type(screen.getByRole('textbox', { name: 'ค้นหากิจกรรม' }), 'ค่าย');

    await waitFor(() =>
      expect(activityService.getAll).toHaveBeenCalledWith({
        search: 'ค่าย',
        page: 1,
        limit: 12,
      })
    );
  });

  it('deletes only after the confirm dialog is accepted', async () => {
    vi.mocked(activityService.getAll).mockResolvedValue(pageOf([activity]));
    vi.mocked(activityService.remove).mockResolvedValue(null);
    renderWithClient(<ActivityList />);

    await userEvent.click(await screen.findByRole('button', { name: /^ลบ/ }));

    await waitFor(() => expect(activityService.remove).toHaveBeenCalledWith('activity-01'));
  });

  it('does not delete when the confirm dialog is dismissed', async () => {
    confirm.mockResolvedValue(false);
    vi.mocked(activityService.getAll).mockResolvedValue(pageOf([activity]));
    renderWithClient(<ActivityList />);

    await userEvent.click(await screen.findByRole('button', { name: /^ลบ/ }));

    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(activityService.remove).not.toHaveBeenCalled();
  });

  it('shows the empty state when nothing is recorded', async () => {
    vi.mocked(activityService.getAll).mockResolvedValue(pageOf([]));
    renderWithClient(<ActivityList />);

    await waitFor(() => expect(screen.getByText('ยังไม่มีประมวลภาพกิจกรรม')).toBeInTheDocument());
  });

  it('shows the error message when the API fails', async () => {
    vi.mocked(activityService.getAll).mockRejectedValue(new Error('โหลดข้อมูลไม่สำเร็จ'));
    renderWithClient(<ActivityList />);

    await waitFor(() => expect(screen.getByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument());
  });
});
