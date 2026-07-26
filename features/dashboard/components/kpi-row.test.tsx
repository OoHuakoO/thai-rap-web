import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardKPIs } from '../types/dashboard.types';
import { KpiRow } from './kpi-row';

vi.mock('../services/dashboard.service');

const kpis: DashboardKPIs = {
  totalStores: 312,
  targetStores: 400,
  t0Completed: 289,
  t0Percentage: 92.63,
  t1Completed: 176,
  t1Percentage: 56.41,
  t2Completed: 176,
  t2Percentage: 56.41,
  t3Completed: 176,
  t3Percentage: 56.41,
  selectedStores: 48,
  selectedPercentage: 15.38,
  improvedStores: 176,
  improvementRate: 56.41,
  avgScore: 72.34,
  lastUpdated: '2026-05-20T00:00:00.000Z',
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('KpiRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows placeholder cards while loading', () => {
    vi.mocked(dashboardService.getKpis).mockReturnValue(new Promise(() => {}));
    const { container } = renderWithClient(<KpiRow />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders all six KPI cards with the API values', async () => {
    vi.mocked(dashboardService.getKpis).mockResolvedValue(kpis);
    renderWithClient(<KpiRow />);

    await waitFor(() => expect(screen.getByText('จำนวนร้านเข้าร่วม')).toBeInTheDocument());

    expect(screen.getByText('ประเมินแล้ว T0')).toBeInTheDocument();
    expect(screen.getByText('ประเมินแล้ว T1')).toBeInTheDocument();
    expect(screen.getByText('ประเมินแล้ว T2')).toBeInTheDocument();
    expect(screen.getByText('ประเมินแล้ว T3')).toBeInTheDocument();
    expect(screen.getByText('อัตราการพัฒนา')).toBeInTheDocument();

    expect(screen.getByText('312')).toBeInTheDocument();
    expect(screen.getByText('289')).toBeInTheDocument();
    expect(screen.getAllByText('176')).toHaveLength(4);
    expect(screen.getByText('เป้าหมาย 400 ร้าน')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('92.63%')).toBeInTheDocument();
    expect(screen.getAllByText('56.41%')).toHaveLength(4);
  });

  it('shows the error message when the API fails', async () => {
    vi.mocked(dashboardService.getKpis).mockRejectedValue(new Error('โหลดข้อมูลไม่สำเร็จ'));
    renderWithClient(<KpiRow />);

    await waitFor(() => expect(screen.getByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument());
  });
});
