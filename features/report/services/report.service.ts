import api from '@/services/api';
import type { AssessmentRound } from '@/features/dashboard/types/dashboard.types';
import type { DownloadedFile } from '@/features/dashboard/types/dashboard.types';
import type {
  OverviewReport,
  ReportFileFormat,
  RoundMatrixQueryParams,
  RoundMatrixReport,
  RoundReport,
} from '../types/report.types';

const FILENAME_PATTERN = /filename="?([^";]+)"?/;

function parseFilename(contentDisposition: unknown): string | undefined {
  if (typeof contentDisposition !== 'string') return undefined;
  return FILENAME_PATTERN.exec(contentDisposition)?.[1];
}

function toDownloadedFile(res: { data: Blob; headers: unknown }): DownloadedFile {
  const headers = res.headers as Record<string, unknown>;
  return { blob: res.data, filename: parseFilename(headers['content-disposition']) };
}

export const reportService = {
  getRoundReport: (storeId: string, round: AssessmentRound) =>
    api.get<RoundReport>(`/reports/stores/${storeId}/rounds/${round}`).then((res) => res.data),

  getOverviewReport: (storeId: string) =>
    api.get<OverviewReport>(`/reports/stores/${storeId}/overview`).then((res) => res.data),

  exportRoundReport: (storeId: string, round: AssessmentRound, format: ReportFileFormat) =>
    api
      .get<Blob>(`/reports/stores/${storeId}/rounds/${round}/export`, {
        params: { format },
        responseType: 'blob',
      })
      .then(toDownloadedFile),

  getRoundMatrix: (round: AssessmentRound, params: RoundMatrixQueryParams = {}) =>
    api
      .get<RoundMatrixReport>(`/reports/rounds/${round}/stores`, { params })
      .then((res) => res.data),

  // No page here on purpose: the file is the whole round. A download that
  // stopped at the rows on screen would have to be stitched together by hand.
  exportRoundMatrix: (round: AssessmentRound, format: ReportFileFormat) =>
    api
      .get<Blob>(`/reports/rounds/${round}/stores/export`, {
        params: { format },
        responseType: 'blob',
      })
      .then(toDownloadedFile),

  exportOverviewReport: (storeId: string, format: ReportFileFormat) =>
    api
      .get<Blob>(`/reports/stores/${storeId}/overview/export`, {
        params: { format },
        responseType: 'blob',
      })
      .then(toDownloadedFile),
};
