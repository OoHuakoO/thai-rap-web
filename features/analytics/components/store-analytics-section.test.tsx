import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES, type Role } from '@/types/auth.types';
import { analyticsService } from '../services/analytics.service';
import type { StoreAnalytics } from '../types/analytics.types';
import { StoreAnalyticsSection } from './store-analytics-section';

vi.mock('../services/analytics.service');

const analytics: StoreAnalytics = {
  storeId: 'store-1',
  kpis: {
    t0Score: 25,
    t1Score: 50,
    improvementRate: 100,
    rankInProject: 11,
    totalStores: 11,
    zone: 'Survival Zone',
    incubationReadiness: null,
  },
  radar: {
    axes: ['คุณภาพอาหารและนวัตกรรมเมนู', 'ความปลอดภัยอาหารและมาตรฐาน'],
    series: [
      { name: 'T0', data: [25, 25] },
      { name: 'T1', data: [50, 50] },
      { name: 'T2', data: [60, 62] },
      { name: 'T3', data: [70, 74] },
    ],
  },
  trend: {
    xAxis: ['T0', 'T1', 'T2', 'T3'],
    series: [{ name: 'ร้านบ้านสวนคุณสุข', data: [25, 50, null, null], actualCount: 2 }],
  },
  strengths: [],
  weaknesses: [],
  redFlags: [],
  aiAnalysis: null,
  mentorRecommendations: [],
  incubationStatus: null,
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function signInAs(role: Role) {
  useAuthStore.setState({
    user: { id: 'user-1', name: 'ผู้ใช้', email: 'user@example.com', role },
    isAuthenticated: true,
  });
}

beforeAll(() => {
  // Recharts' ResponsiveContainer observes its box on mount; jsdom ships no
  // ResizeObserver, so the chart throws before any assertion runs.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

describe('StoreAnalyticsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the three analytics charts for the store', async () => {
    signInAs(ROLES.ADMIN);
    vi.mocked(analyticsService.getStoreAnalytics).mockResolvedValue(analytics);

    renderWithClient(<StoreAnalyticsSection storeId="store-1" />);

    expect(await screen.findByText('ภาพรวมศักยภาพ 8 มิติ (Radar Comparison)')).toBeInTheDocument();
    expect(screen.getByText('เปรียบเทียบคะแนนรายมิติ (T0 – T3)')).toBeInTheDocument();
    expect(screen.getByText('แนวโน้มพัฒนาการ (T0 – T3 Trend)')).toBeInTheDocument();
  });

  it('plots every round the store has in the dimension charts', async () => {
    signInAs(ROLES.ADMIN);
    vi.mocked(analyticsService.getStoreAnalytics).mockResolvedValue(analytics);

    renderWithClient(<StoreAnalyticsSection storeId="store-1" />);

    const radarLegend = await screen.findByRole('list', { name: 'ชุดข้อมูลในกราฟเรดาร์' });
    expect(radarLegend).toHaveTextContent('T0');
    expect(radarLegend).toHaveTextContent('T3');
  });

  it('requests the analytics of the store it is given', async () => {
    signInAs(ROLES.ADMIN);
    vi.mocked(analyticsService.getStoreAnalytics).mockResolvedValue(analytics);

    renderWithClient(<StoreAnalyticsSection storeId="store-9" />);

    await waitFor(() =>
      expect(analyticsService.getStoreAnalytics).toHaveBeenCalledWith('store-9', {
        compare: 'T0vsT1',
      })
    );
  });

  it('shows the error message when the request fails', async () => {
    signInAs(ROLES.ADMIN);
    vi.mocked(analyticsService.getStoreAnalytics).mockRejectedValue(
      new Error('เซิร์ฟเวอร์ผิดพลาด')
    );

    renderWithClient(<StoreAnalyticsSection storeId="store-1" />);

    expect(await screen.findByText('เซิร์ฟเวอร์ผิดพลาด')).toBeInTheDocument();
  });

  it('renders the charts for an entrepreneur, without the staff-only page link', async () => {
    signInAs(ROLES.ENTREPRENEUR);
    vi.mocked(analyticsService.getStoreAnalytics).mockResolvedValue(analytics);

    renderWithClient(<StoreAnalyticsSection storeId="store-1" />);

    expect(await screen.findByText('ภาพรวมศักยภาพ 8 มิติ (Radar Comparison)')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ดูหน้าวิเคราะห์ศักยภาพ/ })).not.toBeInTheDocument();
  });

  it.each([ROLES.VIEWER, ROLES.JUDGE])(
    'renders nothing and fetches nothing for %s',
    async (role) => {
      signInAs(role);

      const { container } = renderWithClient(<StoreAnalyticsSection storeId="store-1" />);

      expect(container).toBeEmptyDOMElement();
      expect(analyticsService.getStoreAnalytics).not.toHaveBeenCalled();
    }
  );
});
