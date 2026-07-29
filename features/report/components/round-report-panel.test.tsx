import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import { ROLES, type Role } from '@/types/auth.types';
import { downloadBlob } from '@/utils/download-blob';
import { reportService } from '../services/report.service';
import type { RoundReport } from '../types/report.types';
import { RoundReportPanel } from './round-report-panel';

vi.mock('../services/report.service');
vi.mock('@/utils/download-blob');

const report: RoundReport = {
  store: {
    id: 'store-1',
    name: 'ครัวริมธารจันทบุรี',
    province: 'จันทบุรี',
    storeType: 'อาหารไทย',
    ownerName: 'นางสาวศิริวรรณ',
  },
  round: 'T1',
  totalScore: 75.8,
  zone: 'Growth Zone',
  assessorName: 'นายสมชาย วงษ์สมบัติ',
  submittedAt: '2026-05-20T00:00:00.000Z',
  notes: 'ผ่านเกณฑ์ทุกมิติ',
  rawScore: 161,
  maxScore: 200,
  rawScorePct: 80.5,
  completionPct: 100,
  dimensions: [
    {
      dimensionId: 1,
      dimensionName: 'ความปลอดภัยอาหาร',
      weight: 14,
      scorePct: 80.5,
      rawScore: 23,
      maxScore: 28,
      weightedScore: 11.27,
      questions: [
        { questionNo: 1, questionText: 'ล้างมือก่อนปรุงอาหาร', rawScore: 4, maxScore: 4 },
        { questionNo: 2, questionText: 'เก็บวัตถุดิบถูกอุณหภูมิ', rawScore: null, maxScore: 4 },
      ],
    },
  ],
  redFlags: [{ type: 'FINANCIAL', severity: 'CRITICAL', triggerQuestions: [28], resolved: false }],
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

describe('RoundReportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAs(ROLES.ADMIN);
  });

  it('renders the round result, dimensions and red flags', async () => {
    vi.mocked(reportService.getRoundReport).mockResolvedValue(report);
    renderWithClient(<RoundReportPanel storeId="store-1" round="T1" />);

    expect(await screen.findByText('ครัวริมธารจันทบุรี')).toBeInTheDocument();
    expect(screen.getAllByText('75.80').length).toBeGreaterThan(0);
    expect(screen.getByText('Growth Zone')).toBeInTheDocument();
    expect(screen.getByText('นายสมชาย วงษ์สมบัติ')).toBeInTheDocument();
    expect(screen.getAllByText('80.50').length).toBeGreaterThan(0);
    expect(screen.getByText('ยังไม่แก้ไข')).toBeInTheDocument();
  });

  it('shows the raw score and the weighted contribution of each dimension', async () => {
    vi.mocked(reportService.getRoundReport).mockResolvedValue(report);
    renderWithClient(<RoundReportPanel storeId="store-1" round="T1" />);

    expect(await screen.findByText('161 / 200')).toBeInTheDocument();
    expect(screen.getAllByText('11.27').length).toBeGreaterThan(0);
  });

  // The per-question breakdown and the weighting arithmetic are admin-only —
  // every other role keeps the summary the panel has always shown.
  it('hides the weighting breakdown and the per-question detail from other roles', async () => {
    signInAs(ROLES.ENTREPRENEUR);
    vi.mocked(reportService.getRoundReport).mockResolvedValue(report);
    renderWithClient(<RoundReportPanel storeId="store-1" round="T1" />);

    expect(await screen.findByText('ครัวริมธารจันทบุรี')).toBeInTheDocument();
    expect(screen.getByText('80.50')).toBeInTheDocument();
    expect(screen.queryByText('161 / 200')).not.toBeInTheDocument();
    expect(screen.queryByText('11.27')).not.toBeInTheDocument();
    expect(screen.queryByText('ผลการให้คะแนนรายข้อ')).not.toBeInTheDocument();
  });

  it('lists every question of a dimension once its section is opened', async () => {
    vi.mocked(reportService.getRoundReport).mockResolvedValue(report);
    renderWithClient(<RoundReportPanel storeId="store-1" round="T1" />);

    await userEvent.click(await screen.findByRole('button', { name: /ความปลอดภัยอาหาร/ }));

    expect(await screen.findByText('ล้างมือก่อนปรุงอาหาร')).toBeInTheDocument();
    expect(screen.getByText('เก็บวัตถุดิบถูกอุณหภูมิ')).toBeInTheDocument();
  });

  it('says there is no red flag when the round has none', async () => {
    vi.mocked(reportService.getRoundReport).mockResolvedValue({ ...report, redFlags: [] });
    renderWithClient(<RoundReportPanel storeId="store-1" round="T1" />);

    expect(await screen.findByText('ไม่พบสัญญาณเตือน')).toBeInTheDocument();
  });

  it('downloads the round report as PDF', async () => {
    const blob = new Blob(['x']);
    vi.mocked(reportService.getRoundReport).mockResolvedValue(report);
    vi.mocked(reportService.exportRoundReport).mockResolvedValue({
      blob,
      filename: 'assessment-report-T1.pdf',
    });
    renderWithClient(<RoundReportPanel storeId="store-1" round="T1" />);

    await userEvent.click(await screen.findByRole('button', { name: 'ดาวน์โหลด PDF' }));

    await waitFor(() =>
      expect(reportService.exportRoundReport).toHaveBeenCalledWith('store-1', 'T1', 'pdf')
    );
    expect(downloadBlob).toHaveBeenCalledWith(blob, 'assessment-report-T1.pdf');
  });

  it('treats a missing round as "not assessed yet" rather than an error', async () => {
    vi.mocked(reportService.getRoundReport).mockRejectedValue(
      new Error('ยังไม่มีผลการประเมินรอบ T3 ของร้านนี้')
    );
    renderWithClient(<RoundReportPanel storeId="store-1" round="T3" />);

    await waitFor(() =>
      expect(screen.getByText('ยังไม่มีผลการประเมินรอบ T3 ของร้านนี้')).toBeInTheDocument()
    );
  });
});
