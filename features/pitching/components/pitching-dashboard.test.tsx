import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_MAX_PAGE_LIMIT } from '@/constants';
import { storeService } from '@/features/store/services/store.service';
import { useAuthStore } from '@/stores/auth-store';
import type { Role } from '@/types/auth.types';
import { ROLES } from '@/types/auth.types';
import { pitchingService } from '../services/pitching.service';
import type { Pitching, PitchingRankingRow, PitchingStoreReport } from '../types/pitching.types';
import { PitchingDashboard } from './pitching-dashboard';

vi.mock('../services/pitching.service');
vi.mock('@/features/store/services/store.service');
// Recharts measures its container, which jsdom never gives a size — the charts
// are library wrappers, so they are stubbed out rather than rendered here.
vi.mock('@/components/shared/bar-chart', () => ({ BarChart: () => <div /> }));
vi.mock('@/components/shared/donut-chart', () => ({ DonutChart: () => <div /> }));

const STORE = {
  id: 'store-1',
  code: 'RAP69-001',
  name: 'บ้านริมน้ำ จันทบุรี',
  province: 'จันทบุรี',
  storeType: 'อาหารไทย',
  ownerName: 'คุณสานิตา บำรุงสุข',
  phone: '081-234-5678',
  email: null,
  address: null,
  socialLinks: {},
  avgRevenueMin: null,
  avgRevenueMax: null,
  mainProblems: [],
  goals: [],
  menuPhotos: [],
  coverUrl: null,
  storePhotos: [],
  documents: [],
  status: 'T1_COMPLETED' as const,
  ownerId: null,
  latestScore: null,
  latestAssessorName: null,
  latestAssessedAt: null,
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

const RANKING_ROW: PitchingRankingRow = {
  storeId: 'store-1',
  storeCode: 'RAP69-001',
  storeName: 'บ้านริมน้ำ จันทบุรี',
  province: 'จันทบุรี',
  rank: 2,
  judgeCount: 2,
  avgScore: 83,
  level: 'HIGHLY_SUITABLE',
  recommendationCounts: {
    SELECTED: 2,
    WAITING_LIST: 0,
    MINIMUM_NOT_MET: 0,
    NOT_SELECTED: 0,
  },
  minimumPassedCount: 0,
};

function judge(id: string, name: string, score: number, criterionScore: number): Pitching {
  return {
    id,
    storeId: 'store-1',
    storeCode: 'RAP69-001',
    storeName: 'บ้านริมน้ำ จันทบุรี',
    province: 'จันทบุรี',
    round: 'PITCH_DECK',
    judgeId: `${id}-judge`,
    judgeName: name,
    status: 'SUBMITTED',
    totalScore: score,
    currentScore: score,
    level: 'HIGHLY_SUITABLE',
    recommendation: 'SELECTED',
    evaluatedAt: '2026-05-20T03:30:00Z',
    updatedAt: '2026-05-20T03:30:00Z',
    submittedAt: '2026-05-20T03:30:00Z',
    createdAt: '2026-05-20T03:00:00Z',
    prototypeProduct: null,
    minimumConditions: null,
    evidenceChecked: [],
    comments: { strengths: 'เมนูมีเอกลักษณ์', urgentImprovements: 'แผนการตลาดยังไม่ชัดเจน' },
    recommendationReason: 'แนะนำด้านการตลาด',
    noConflictOfInterest: true,
    criteria: [
      {
        id: 101,
        round: 'PITCH_DECK',
        code: '1',
        section: null,
        title: 'ความชัดเจนของปัญหา',
        guideline: '',
        maxScore: 20,
        sortOrder: 1,
        score: criterionScore,
        note: null,
      },
    ],
  };
}

const REPORT: PitchingStoreReport = {
  storeId: 'store-1',
  storeCode: 'RAP69-001',
  storeName: 'บ้านริมน้ำ จันทบุรี',
  province: 'จันทบุรี',
  round: 'PITCH_DECK',
  avgScore: 83,
  level: 'HIGHLY_SUITABLE',
  rank: 2,
  rankedStoreCount: 23,
  judgeCount: 2,
  recommendationCounts: RANKING_ROW.recommendationCounts,
  criteria: [
    {
      id: 101,
      round: 'PITCH_DECK',
      code: '1',
      section: null,
      title: 'ความชัดเจนของปัญหา',
      guideline: '',
      maxScore: 20,
      sortOrder: 1,
      avgScore: 17.1,
      avgPct: 85.5,
    },
  ],
  judges: [
    judge('pitch-1', 'ดร.กฤษฎา วงษ์สมบัติ', 83, 18),
    judge('pitch-2', 'ผศ.ดร.เบญจมาศ', 80, 16),
  ],
};

function renderWithClient() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PitchingDashboard />
    </QueryClientProvider>
  );
}

function signInAs(role: Role) {
  useAuthStore.setState({
    user: { id: 'u1', name: 'ทดสอบ', email: 'test@example.com', role },
    isAuthenticated: true,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  signInAs(ROLES.JUDGE);
  vi.mocked(storeService.getAll).mockResolvedValue({
    items: [STORE],
    meta: { page: 1, limit: API_MAX_PAGE_LIMIT, total: 1, totalPages: 1 },
  });
  vi.mocked(pitchingService.getRanking).mockResolvedValue({
    items: [RANKING_ROW],
    meta: { page: 1, limit: API_MAX_PAGE_LIMIT, total: 1, totalPages: 1 },
  });
  vi.mocked(pitchingService.getStoreReport).mockResolvedValue(REPORT);
});

describe('PitchingDashboard', () => {
  // The dashboard asks for the whole cohort in one page, so its `limit` is the
  // largest this app sends anywhere. The API rejects a limit over
  // API_MAX_PAGE_LIMIT with 422 rather than clamping it, so a bumped constant
  // takes both panels to an error state — assert the number that goes over the
  // wire, not the constant, which a caller can override at the call site.
  it('asks for the cohort within the API’s page-limit ceiling', async () => {
    renderWithClient();

    await waitFor(() => expect(pitchingService.getRanking).toHaveBeenCalled());
    const rankingLimit = vi.mocked(pitchingService.getRanking).mock.calls[0][3];
    expect(rankingLimit).toBeLessThanOrEqual(API_MAX_PAGE_LIMIT);

    await waitFor(() => expect(storeService.getAll).toHaveBeenCalled());
    const storeLimit = vi.mocked(storeService.getAll).mock.calls[0][0]?.limit;
    expect(storeLimit).toBeLessThanOrEqual(API_MAX_PAGE_LIMIT);
  });

  it('opens on the report, not on a scoring form', async () => {
    renderWithClient();

    await waitFor(() => expect(screen.getByText('สรุปผลการประเมิน')).toBeInTheDocument());
    expect(screen.getByText(/อันดับคะแนนสูงสุด/)).toBeInTheDocument();
    expect(screen.getByText(/Judge-by-Judge/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ส่งแบบประเมิน' })).not.toBeInTheDocument();
  });

  it('reaches the scoring form through a link for a role that can write', async () => {
    renderWithClient();

    await waitFor(() => expect(screen.getByText('สรุปผลการประเมิน')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /เพิ่มผลการประเมิน/ })).toHaveAttribute(
      'href',
      '/pitching/form'
    );
    expect(screen.getByRole('link', { name: /กรอกคะแนน/ })).toHaveAttribute(
      'href',
      '/pitching/form'
    );
  });

  it('hides the scoring links from a role that cannot write', async () => {
    signInAs(ROLES.VIEWER);
    renderWithClient();

    await waitFor(() => expect(screen.getByText('สรุปผลการประเมิน')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /เพิ่มผลการประเมิน/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /กรอกคะแนน/ })).not.toBeInTheDocument();
  });

  it('shows the cross-judge average until a judge is picked', async () => {
    renderWithClient();

    await waitFor(() => expect(screen.getByText('17.1')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('combobox', { name: 'กรรมการ' }));
    await userEvent.click(screen.getByRole('option', { name: 'ดร.กฤษฎา วงษ์สมบัติ' }));

    await waitFor(() => expect(screen.getByText('18')).toBeInTheDocument());
    expect(screen.queryByText('17.1')).not.toBeInTheDocument();
  });

  it('links to the full ranking page', async () => {
    renderWithClient();

    await waitFor(() =>
      expect(screen.getByRole('link', { name: /ดูอันดับทั้งหมด/ })).toHaveAttribute(
        'href',
        '/pitching/ranking'
      )
    );
  });
});
