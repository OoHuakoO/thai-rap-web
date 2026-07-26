import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardService } from '../services/dashboard.service';
import type { ProvinceComparison } from '../types/dashboard.types';
import { ProvinceComparisonCard } from './province-comparison-card';

vi.mock('../services/dashboard.service');

function comparison(overrides: Partial<ProvinceComparison> = {}): ProvinceComparison {
  return {
    province: 'จันทบุรี',
    fromRound: 'T0',
    toRound: 'T1',
    fromScore: 62.1,
    toScore: 75.8,
    ...overrides,
  };
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeAll(() => {
  // Radix Select relies on pointer-capture and scrollIntoView, neither of which
  // jsdom implements — without these stubs opening the dropdown throws.
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();

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

describe('ProvinceComparisonCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dashboardService.getKpis).mockResolvedValue(
      {} as Awaited<ReturnType<typeof dashboardService.getKpis>>
    );
  });

  it('requests T0 vs T1 and titles the card with that pair by default', async () => {
    vi.mocked(dashboardService.getProvinceComparison).mockResolvedValue([comparison()]);
    renderWithClient(<ProvinceComparisonCard />);

    await waitFor(() =>
      expect(dashboardService.getProvinceComparison).toHaveBeenCalledWith({
        from: 'T0',
        to: 'T1',
      })
    );
    expect(screen.getByText('เปรียบเทียบผลคะแนนเฉลี่ย (T0 vs T1)')).toBeInTheDocument();
    expect(await screen.findByText('คะแนนเฉลี่ย T0')).toBeInTheDocument();
  });

  it('refetches and retitles when another round pair is selected', async () => {
    vi.mocked(dashboardService.getProvinceComparison).mockResolvedValue([
      comparison({ fromRound: 'T2', toRound: 'T3' }),
    ]);
    renderWithClient(<ProvinceComparisonCard />);

    await userEvent.click(screen.getByRole('combobox', { name: 'คู่รอบที่เปรียบเทียบ' }));
    await userEvent.click(await screen.findByRole('option', { name: 'T2 vs T3' }));

    await waitFor(() =>
      expect(dashboardService.getProvinceComparison).toHaveBeenCalledWith({
        from: 'T2',
        to: 'T3',
      })
    );
    expect(screen.getByText('เปรียบเทียบผลคะแนนเฉลี่ย (T2 vs T3)')).toBeInTheDocument();
    expect(await screen.findByText('คะแนนเฉลี่ย T3')).toBeInTheDocument();
  });

  it('shows the empty state when no province has scores', async () => {
    vi.mocked(dashboardService.getProvinceComparison).mockResolvedValue([]);
    renderWithClient(<ProvinceComparisonCard />);

    await waitFor(() =>
      expect(screen.getByText('ยังไม่มีข้อมูลเปรียบเทียบคะแนน')).toBeInTheDocument()
    );
  });

  it('shows the error message when the API fails', async () => {
    vi.mocked(dashboardService.getProvinceComparison).mockRejectedValue(
      new Error('โหลดข้อมูลไม่สำเร็จ')
    );
    renderWithClient(<ProvinceComparisonCard />);

    await waitFor(() => expect(screen.getByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument());
  });
});
