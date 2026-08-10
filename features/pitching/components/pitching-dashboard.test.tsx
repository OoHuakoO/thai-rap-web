import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
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
  coverUrl: null,
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
  vi.mocked(storeService.getById).mockResolvedValue(STORE);
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
  });

  // The ranking already names every store the page can report on, so a page of
  // full store rows would be fetched to render one of them.
  it('reads one store record, not the whole store list', async () => {
    renderWithClient();

    await waitFor(() => expect(storeService.getById).toHaveBeenCalledWith('store-1'));
    expect(storeService.getAll).not.toHaveBeenCalled();
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
  });

  it('hides the scoring link from a role that cannot write', async () => {
    signInAs(ROLES.VIEWER);
    renderWithClient();

    await waitFor(() => expect(screen.getByText('สรุปผลการประเมิน')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /เพิ่มผลการประเมิน/ })).not.toBeInTheDocument();
  });

  it('carries the shown store and round into the store card’s scoring link', async () => {
    renderWithClient();

    const link = await waitFor(() => screen.getByRole('link', { name: /กรอกคะแนน/ }));
    expect(link).toHaveAttribute('href', '/pitching/form?storeId=store-1&round=PITCH_DECK');
    expect(link).toHaveTextContent('เต็ม 20 คะแนน ต่อเกณฑ์');
  });

  it('hides the store card’s scoring link from a role that cannot write', async () => {
    signInAs(ROLES.VIEWER);
    renderWithClient();

    await waitFor(() => expect(screen.getByText('สรุปผลการประเมิน')).toBeInTheDocument());
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

  // Both narrower picks are scoped by the round, so a stale one survives the
  // change only because the same judge sits on the next store's panel too.
  it('resets the store and judge picks when the round changes', async () => {
    vi.mocked(pitchingService.getRanking).mockImplementation((round) =>
      Promise.resolve({
        items: [
          round === 'PITCH_DECK'
            ? RANKING_ROW
            : { ...RANKING_ROW, storeId: 'store-9', storeName: 'ร้านรอบเร่งรัด' },
        ],
        meta: { page: 1, limit: API_MAX_PAGE_LIMIT, total: 1, totalPages: 1 },
      })
    );
    renderWithClient();

    await waitFor(() => expect(screen.getByText('17.1')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('combobox', { name: 'กรรมการ' }));
    await userEvent.click(screen.getByRole('option', { name: 'ดร.กฤษฎา วงษ์สมบัติ' }));
    await waitFor(() => expect(screen.getByText('18')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('combobox', { name: 'รอบคัดเลือก' }));
    await userEvent.click(screen.getByRole('option', { name: 'รอบ Incubation สู่ Acceleration' }));

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'ร้านอาหาร' })).toHaveTextContent(
        'ร้านรอบเร่งรัด'
      )
    );
    expect(screen.getByRole('combobox', { name: 'กรรมการ' })).toHaveTextContent(
      'ทุกกรรมการ (ค่าเฉลี่ย)'
    );
  });

  it('resets the judge pick when the store changes', async () => {
    vi.mocked(pitchingService.getRanking).mockResolvedValue({
      items: [RANKING_ROW, { ...RANKING_ROW, storeId: 'store-2', storeName: 'ครัวคุณย่า' }],
      meta: { page: 1, limit: API_MAX_PAGE_LIMIT, total: 2, totalPages: 1 },
    });
    renderWithClient();

    await waitFor(() => expect(screen.getByText('17.1')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('combobox', { name: 'กรรมการ' }));
    await userEvent.click(screen.getByRole('option', { name: 'ดร.กฤษฎา วงษ์สมบัติ' }));
    await waitFor(() => expect(screen.getByText('18')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('combobox', { name: 'ร้านอาหาร' }));
    await userEvent.click(screen.getByRole('option', { name: 'ครัวคุณย่า' }));

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'กรรมการ' })).toHaveTextContent(
        'ทุกกรรมการ (ค่าเฉลี่ย)'
      )
    );
    expect(screen.getByText('17.1')).toBeInTheDocument();
  });

  // Clicking a Top-10 row should render from cache, not open on a skeleton.
  it('warms the leading stores’ reports once the cohort lands', async () => {
    vi.mocked(pitchingService.getRanking).mockResolvedValue({
      items: [2, 3, 4, 5].map((n) => ({
        ...RANKING_ROW,
        storeId: `store-${n}`,
        rank: n - 1,
      })),
      meta: { page: 1, limit: API_MAX_PAGE_LIMIT, total: 4, totalPages: 1 },
    });
    renderWithClient();

    await waitFor(() =>
      expect(pitchingService.getStoreReport).toHaveBeenCalledWith('store-4', 'PITCH_DECK')
    );
    const warmed = vi.mocked(pitchingService.getStoreReport).mock.calls.map(([storeId]) => storeId);
    expect(warmed).toContain('store-2');
    expect(warmed).toContain('store-3');
    expect(warmed).not.toContain('store-5');
  });

  it('opens the whole ranking in a dialog, paged, without another request', async () => {
    vi.mocked(pitchingService.getRanking).mockResolvedValue({
      items: Array.from({ length: 12 }, (_, index) => ({
        ...RANKING_ROW,
        storeId: `store-${index + 1}`,
        storeCode: `RAP69-${String(index + 1).padStart(3, '0')}`,
        storeName: `ร้านที่ ${index + 1}`,
        rank: index + 1,
        avgScore: 90 - index,
      })),
      meta: { page: 1, limit: API_MAX_PAGE_LIMIT, total: 12, totalPages: 1 },
    });
    renderWithClient();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /ดูอันดับทั้งหมด/ })).toBeEnabled()
    );
    const rankingCalls = vi.mocked(pitchingService.getRanking).mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: /ดูอันดับทั้งหมด/ }));

    const dialog = await screen.findByRole('dialog');
    // Page 1 of the dialog holds ten of the twelve rows; the eleventh is on
    // page 2, which is what proves the list is paged rather than truncated.
    expect(within(dialog).getByText('ร้านที่ 10')).toBeInTheDocument();
    expect(within(dialog).queryByText('ร้านที่ 11')).not.toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('link', { name: '2' }));
    expect(within(dialog).getByText('ร้านที่ 11')).toBeInTheDocument();
    expect(vi.mocked(pitchingService.getRanking).mock.calls).toHaveLength(rankingCalls);
  });

  it('selects the store clicked in the ranking dialog and closes it', async () => {
    renderWithClient();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /ดูอันดับทั้งหมด/ })).toBeEnabled()
    );
    await userEvent.click(screen.getByRole('button', { name: /ดูอันดับทั้งหมด/ }));

    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /บ้านริมน้ำ จันทบุรี/ }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
