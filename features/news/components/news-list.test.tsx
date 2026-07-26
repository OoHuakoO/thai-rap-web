import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES } from '@/types/auth.types';
import { newsService } from '../services/news.service';
import type { NewsItem } from '../types/news.types';
import { NewsList } from './news-list';

vi.mock('../services/news.service');

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const confirm = vi.fn().mockResolvedValue(true);
vi.mock('@/components/shared/confirm-dialog', () => ({
  useConfirm: () => confirm,
}));

const item: NewsItem = {
  id: 'news-01',
  type: 'EVENT',
  title: 'กิจกรรมอบรมหลักสูตรการจัดการต้นทุน',
  description: 'วันที่ 25 พ.ค. 2569 เวลา 09:00 น.',
  urgent: false,
  publishedAt: '2026-05-19T00:00:00.000Z',
  authorId: '1',
  authorName: 'นายคมศักดิ์ กรณย์ประกิตต์',
};

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

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

describe('NewsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    confirm.mockResolvedValue(true);
    signInAs(ROLES.ADMIN);
  });

  it('renders each announcement with its category label', async () => {
    vi.mocked(newsService.getAll).mockResolvedValue([item]);
    renderWithClient(<NewsList />);

    expect(await screen.findByText('กิจกรรมอบรมหลักสูตรการจัดการต้นทุน')).toBeInTheDocument();
    expect(screen.getByText('กิจกรรม')).toBeInTheDocument();
  });

  it('shows the create button for ADMIN', async () => {
    vi.mocked(newsService.getAll).mockResolvedValue([item]);
    renderWithClient(<NewsList />);

    expect(await screen.findByRole('button', { name: 'สร้างข่าว' })).toBeInTheDocument();
  });

  it('shows the create button for SUPER_ADMIN', async () => {
    signInAs(ROLES.SUPER_ADMIN);
    vi.mocked(newsService.getAll).mockResolvedValue([item]);
    renderWithClient(<NewsList />);

    expect(await screen.findByRole('button', { name: 'สร้างข่าว' })).toBeInTheDocument();
  });

  it('hides create and row actions from a role without news:write', async () => {
    signInAs(ROLES.ASSESSOR);
    vi.mocked(newsService.getAll).mockResolvedValue([item]);
    renderWithClient(<NewsList />);

    await screen.findByText('กิจกรรมอบรมหลักสูตรการจัดการต้นทุน');
    expect(screen.queryByRole('button', { name: 'สร้างข่าว' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^แก้ไข/ })).not.toBeInTheDocument();
  });

  it('refetches with the selected category', async () => {
    vi.mocked(newsService.getAll).mockResolvedValue([item]);
    renderWithClient(<NewsList />);

    await waitFor(() => expect(newsService.getAll).toHaveBeenCalledWith({ type: undefined }));

    await userEvent.click(screen.getByRole('combobox', { name: 'ประเภทข่าว' }));
    await userEvent.click(await screen.findByRole('option', { name: 'การแจ้งเตือน' }));

    await waitFor(() => expect(newsService.getAll).toHaveBeenCalledWith({ type: 'ALERT' }));
  });

  it('deletes only after the confirm dialog is accepted', async () => {
    vi.mocked(newsService.getAll).mockResolvedValue([item]);
    vi.mocked(newsService.remove).mockResolvedValue(null);
    renderWithClient(<NewsList />);

    await userEvent.click(await screen.findByRole('button', { name: /^ลบ/ }));

    await waitFor(() => expect(newsService.remove).toHaveBeenCalledWith('news-01'));
  });

  it('does not delete when the confirm dialog is dismissed', async () => {
    confirm.mockResolvedValue(false);
    vi.mocked(newsService.getAll).mockResolvedValue([item]);
    renderWithClient(<NewsList />);

    await userEvent.click(await screen.findByRole('button', { name: /^ลบ/ }));

    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(newsService.remove).not.toHaveBeenCalled();
  });

  it('shows the empty state when nothing is published', async () => {
    vi.mocked(newsService.getAll).mockResolvedValue([]);
    renderWithClient(<NewsList />);

    await waitFor(() => expect(screen.getByText('ยังไม่มีข่าวประชาสัมพันธ์')).toBeInTheDocument());
  });

  it('shows the error message when the API fails', async () => {
    vi.mocked(newsService.getAll).mockRejectedValue(new Error('โหลดข้อมูลไม่สำเร็จ'));
    renderWithClient(<NewsList />);

    await waitFor(() => expect(screen.getByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument());
  });
});
