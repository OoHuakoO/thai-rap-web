'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/use-debounce';
import { StoreList } from './store-list';
import { StoreDetail } from './store-detail';
import { StoreStatsBar } from './store-stats-bar';
import { useStores, useStoreStats } from '../hooks/use-stores';
import { STORE_STATUS_LABELS, STORE_TYPE_OPTIONS } from '../types/store.types';
import type { StoreStatus, StoreQueryParams } from '../types/store.types';

const STATUS_OPTIONS = Object.entries(STORE_STATUS_LABELS) as [StoreStatus, string][];
const DEFAULT_LIMIT = 10;

export function StoreExplorer() {
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState<string>('ALL');
  const [storeType, setStoreType] = useState<string>('ALL');
  const [status, setStatus] = useState<StoreStatus | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const debouncedSearch = useDebounce(search, 300);

  const query: StoreQueryParams = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(province !== 'ALL' && { province }),
    ...(storeType !== 'ALL' && { storeType }),
    ...(status !== 'ALL' && { status }),
  };

  const { data } = useStores(query);
  const { data: stats } = useStoreStats();

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setPage(1);
  };

  const handleStoreTypeChange = (value: string) => {
    setStoreType(value);
    setPage(1);
  };

  const handleStatusChange = (value: StoreStatus | 'ALL') => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-[10px] text-muted-foreground">ค้นหา</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ค้นหาชื่อร้าน, เจ้าของ, เบอร์โทร..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="w-40">
          <label className="mb-1 block text-[10px] text-muted-foreground">จังหวัด</label>
          <Select value={province} onValueChange={handleProvinceChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทั้งหมด</SelectItem>
              {(stats?.byProvince ?? []).map((p) => (
                <SelectItem key={p.province} value={p.province}>
                  {p.province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <label className="mb-1 block text-[10px] text-muted-foreground">ประเภทร้าน</label>
          <Select value={storeType} onValueChange={handleStoreTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทั้งหมด</SelectItem>
              {STORE_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <label className="mb-1 block text-[10px] text-muted-foreground">สถานะ</label>
          <Select
            value={status}
            onValueChange={(v) => handleStatusChange(v as StoreStatus | 'ALL')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทั้งหมด</SelectItem>
              {STATUS_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="ml-auto gap-1.5" asChild>
          <Link href={ROUTES.STORE_NEW}>
            <Plus className="h-4 w-4" />
            เพิ่มร้านอาหาร
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-0 overflow-hidden rounded-xl border bg-card shadow-sm">
          <StoreList query={query} selectedId={selectedId} onSelect={setSelectedId} />
          {data && data.meta.total > 0 && (
            <PaginationBar
              page={data.meta.page}
              limit={data.meta.limit}
              total={data.meta.total}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
              itemLabel="ร้าน"
            />
          )}
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {selectedId ? (
            <StoreDetail storeId={selectedId} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-muted-foreground">
              <span className="text-4xl">🏪</span>
              <p className="text-sm">เลือกร้านอาหารเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>
      </div>

      <StoreStatsBar />
    </div>
  );
}
