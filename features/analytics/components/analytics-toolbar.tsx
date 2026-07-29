'use client';

import { useState } from 'react';
import { ChevronDown, Download, Store as StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProvinces } from '@/features/province';
import type { Store } from '@/features/store';
import { buildFileUrl } from '@/utils/build-file-url';
import { cn } from '@/utils/cn';
import {
  ALL_PROVINCES_VALUE,
  COMPARE_PAIR_OPTIONS,
  formatComparePairLabel,
  type ComparePairOption,
} from '../constants/analytics-display.constants';
import { ANALYTICS_TOOLBAR_TEXT } from '../constants/analytics-text.constants';

interface AnalyticsToolbarProps {
  stores: Store[];
  selectedStore: Store | undefined;
  onStoreChange: (storeId: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  comparePair: ComparePairOption;
  onComparePairChange: (value: string) => void;
  province: string;
  onProvinceChange: (province: string) => void;
  onExport: () => void;
  isExporting: boolean;
  canExport: boolean;
}

export function AnalyticsToolbar({
  stores,
  selectedStore,
  onStoreChange,
  search,
  onSearchChange,
  comparePair,
  onComparePairChange,
  province,
  onProvinceChange,
  onExport,
  isExporting,
  canExport,
}: AnalyticsToolbarProps) {
  const [isStoreOpen, setStoreOpen] = useState(false);
  const { data: provinces } = useProvinces();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px]">
        <p className="mb-1 text-xs text-muted-foreground">{ANALYTICS_TOOLBAR_TEXT.storeLabel}</p>
        <Popover open={isStoreOpen} onOpenChange={setStoreOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-full min-w-[200px] items-center gap-2 rounded-lg border border-input bg-card px-2.5 text-left"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-cream">
                {selectedStore?.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={buildFileUrl(selectedStore.coverUrl)}
                    alt={selectedStore.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <StoreIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                )}
              </span>
              <span className="flex-1 truncate text-xs font-medium text-charcoal">
                {selectedStore?.name ?? '—'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={ANALYTICS_TOOLBAR_TEXT.searchPlaceholder}
              className="mb-2 h-8 text-xs"
            />
            <div className="max-h-64 space-y-0.5 overflow-y-auto">
              {stores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => {
                    setStoreOpen(false);
                    onStoreChange(store.id);
                  }}
                  className={cn(
                    'flex w-full items-center gap-1.5 truncate rounded-md px-2 py-1.5 text-left text-xs hover:bg-cream',
                    store.id === selectedStore?.id && 'bg-cream font-semibold text-orange'
                  )}
                >
                  <span className="truncate">
                    {store.name}
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      · {store.province}
                    </span>
                  </span>
                </button>
              ))}
              {stores.length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                  {ANALYTICS_TOOLBAR_TEXT.noStoreFound}
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="w-32">
        <p className="mb-1 text-xs text-muted-foreground">{ANALYTICS_TOOLBAR_TEXT.compareLabel}</p>
        <Select value={comparePair.value} onValueChange={onComparePairChange}>
          <SelectTrigger className="h-9 text-xs" aria-label={ANALYTICS_TOOLBAR_TEXT.compareLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMPARE_PAIR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {formatComparePairLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-36">
        <p className="mb-1 text-xs text-muted-foreground">{ANALYTICS_TOOLBAR_TEXT.provinceLabel}</p>
        <Select value={province} onValueChange={onProvinceChange}>
          <SelectTrigger className="h-9 text-xs" aria-label={ANALYTICS_TOOLBAR_TEXT.provinceLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PROVINCES_VALUE} className="text-xs">
              {ANALYTICS_TOOLBAR_TEXT.allProvinces}
            </SelectItem>
            {(provinces ?? []).map((item) => (
              <SelectItem key={item.id} value={item.nameTh} className="text-xs">
                {item.nameTh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onExport}
        disabled={!canExport || isExporting}
        className="h-9 gap-1.5 bg-orange text-white hover:bg-orange-light"
      >
        <Download className="h-4 w-4" />
        {isExporting ? ANALYTICS_TOOLBAR_TEXT.exporting : ANALYTICS_TOOLBAR_TEXT.export}
      </Button>

    </div>
  );
}
