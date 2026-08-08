'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { DataTable } from '@/components/shared/data-table';
import { DownloadButtons } from '@/components/shared/download-buttons';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProvinces } from '@/features/province';
import type { TableColumn } from '@/types';
import { extractErrorMessage } from '@/utils/extract-error-message';
import {
  ALL_PROVINCES,
  PITCHING_LEVEL_BADGE_CLASSES,
  PITCHING_LEVEL_LABELS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import { useExportPitchingRanking } from '../hooks/use-export-pitching';
import { usePitchingRanking } from '../hooks/use-pitching-report';
import type { PitchingRankingRow, PitchingRound } from '../types/pitching.types';

interface PitchingRankingTableProps {
  round: PitchingRound;
  province: string;
  page: number;
  limit: number;
  selectedStoreId: string;
  onProvinceChange: (province: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSelectStore: (storeId: string) => void;
}

export function PitchingRankingTable({
  round,
  province,
  page,
  limit,
  selectedStoreId,
  onProvinceChange,
  onPageChange,
  onLimitChange,
  onSelectStore,
}: PitchingRankingTableProps) {
  const provinceFilter = province === ALL_PROVINCES ? undefined : province;
  const { data, isLoading, isError, error } = usePitchingRanking(
    round,
    provinceFilter,
    page,
    limit
  );
  const { data: provinces } = useProvinces();
  const { mutate: exportRanking, isPending: isExporting } = useExportPitchingRanking();

  const columns: TableColumn<PitchingRankingRow>[] = [
    { key: 'rank', header: PITCHING_TEXT.rankColumn, className: 'w-16' },
    {
      key: 'storeName',
      header: PITCHING_TEXT.storeColumn,
      cell: (row) => (
        <div>
          <p className="font-medium text-text-main">{row.storeName}</p>
          <p className="text-xs text-muted-foreground">{row.storeCode}</p>
        </div>
      ),
    },
    { key: 'province', header: PITCHING_TEXT.provinceColumn },
    {
      key: 'judgeCount',
      header: PITCHING_TEXT.judgeCountColumn,
      cell: (row) => PITCHING_TEXT.judgeCountValue(row.judgeCount),
    },
    {
      key: 'avgScore',
      header: PITCHING_TEXT.avgScoreColumn,
      cell: (row) => <span className="font-semibold text-orange">{row.avgScore.toFixed(2)}</span>,
    },
    {
      key: 'level',
      header: PITCHING_TEXT.levelColumn,
      cell: (row) => (
        <Badge variant="outline" className={PITCHING_LEVEL_BADGE_CLASSES[row.level]}>
          {PITCHING_LEVEL_LABELS[row.level]}
        </Badge>
      ),
    },
    {
      key: 'minimumPassedCount',
      header: PITCHING_TEXT.minimumPassedColumn,
      cell: (row) => `${row.minimumPassedCount} / ${row.judgeCount}`,
    },
  ];

  if (isError) return <AlertCard variant="error" message={extractErrorMessage(error)} />;

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="text-sm font-semibold">{PITCHING_TEXT.rankingTitle}</CardTitle>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-full max-w-xs space-y-1.5">
            <Label htmlFor="pitching-ranking-province">{PITCHING_TEXT.provinceLabel}</Label>
            <Select value={province} onValueChange={onProvinceChange}>
              <SelectTrigger
                id="pitching-ranking-province"
                aria-label={PITCHING_TEXT.provinceLabel}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PROVINCES}>{PITCHING_TEXT.provinceAll}</SelectItem>
                {(provinces ?? []).map((item) => (
                  <SelectItem key={item.id} value={item.nameTh}>
                    {item.nameTh}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{PITCHING_TEXT.provinceHint}</p>
          </div>

          <div className="space-y-1.5">
            <DownloadButtons
              isExporting={isExporting}
              excelLabel={PITCHING_TEXT.downloadExcel}
              pdfLabel={PITCHING_TEXT.downloadPdf}
              onDownload={(format) => exportRanking({ round, province: provinceFilter, format })}
            />
            <p className="text-xs text-muted-foreground">{PITCHING_TEXT.rankingDownloadHint}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          keyField="storeId"
          isLoading={isLoading}
          emptyMessage={PITCHING_TEXT.rankingEmpty}
          onRowClick={(row) => onSelectStore(row.storeId)}
          isRowSelected={(row) => row.storeId === selectedStoreId}
        />
        {data && data.meta.total > 0 && (
          <PaginationBar
            page={data.meta.page}
            limit={data.meta.limit}
            total={data.meta.total}
            totalPages={data.meta.totalPages}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            itemLabel={PITCHING_TEXT.rankingItemLabel}
          />
        )}
      </CardContent>
    </Card>
  );
}
