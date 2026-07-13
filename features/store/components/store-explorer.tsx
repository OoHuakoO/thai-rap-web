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
import { useAuthStore } from '@/stores/useAuthStore';
import { StoreList } from './store-list';
import { StoreDetail } from './store-detail';
import { StoreStatsBar } from './store-stats-bar';
import { useStores, useStoreStats } from '../hooks/use-stores';
import { STORE_STATUS_LABELS, STORE_TYPE_OPTIONS } from '../types/store.types';
import type { StoreStatus, StoreQueryParams } from '../types/store.types';

const STATUS_OPTIONS = Object.entries(STORE_STATUS_LABELS) as [StoreStatus, string][];
const DEFAULT_LIMIT = 10;

export function StoreExplorer() {
  const can = useAuthStore((s) => s.can);
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
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2 border-r pr-4">
          <h1 className="text-lg font-semibold whitespace-nowrap">ข้อมูลร้านอาหาร</h1>
          <p className="text-sm whitespace-nowrap text-muted-foreground">Restaurant Profiles</p>
        </div>

        <div className="relative w-72">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาชื่อร้าน, เจ้าของ, เบอร์โทร..."
            className="pr-8"
          />
          <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex h-10 w-48 items-center gap-1.5 rounded-md border border-input bg-background px-2.5">
          <span className="whitespace-nowrap text-xs text-muted-foreground">จังหวัด</span>
          <Select value={province} onValueChange={handleProvinceChange}>
            <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 shadow-none focus:ring-0 focus:ring-offset-0">
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

        <div className="flex h-10 w-52 items-center gap-1.5 rounded-md border border-input bg-background px-2.5">
          <span className="whitespace-nowrap text-xs text-muted-foreground">ประเภทร้าน</span>
          <Select value={storeType} onValueChange={handleStoreTypeChange}>
            <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 shadow-none focus:ring-0 focus:ring-offset-0">
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

        <div className="flex h-10 w-56 items-center gap-1.5 rounded-md border border-input bg-background px-2.5">
          <span className="whitespace-nowrap text-xs text-muted-foreground">สถานะ</span>
          <Select
            value={status}
            onValueChange={(v) => handleStatusChange(v as StoreStatus | 'ALL')}
          >
            <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 shadow-none focus:ring-0 focus:ring-offset-0">
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

        {can('store:write') && (
          <Button className="ml-auto h-10 flex-shrink-0 gap-1.5" asChild>
            <Link href={ROUTES.STORE_NEW}>
              <Plus className="h-4 w-4" />
              เพิ่มร้านอาหาร
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(460px,1fr)]">
        {/* Fixed to the height of a fully-populated store-detail card (verified ~715px)
            so this stays constant across pages and whether or not a row is selected —
            it must never grow/shrink based on content. */}
        <div className="flex h-[720px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex-1 overflow-y-auto">
            <StoreList query={query} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
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

        <div className="h-[720px] overflow-y-auto rounded-xl border bg-card shadow-sm">
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
