'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import { useStores } from '@/features/store';
import { useProvinces } from '@/features/province';
import { STORE_PICKER_TEXT } from '../constants/assessment-text.constants';
import type { Round } from '../types/assessment.types';

interface AssessmentStorePickerProps {
  storeId: string;
  storeName?: string;
  round: Round;
}

export function AssessmentStorePicker({ storeId, storeName, round }: AssessmentStorePickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState<string>('ALL');

  const { data } = useStores({
    limit: 100,
    ...(search && { search }),
    ...(province !== 'ALL' && { province }),
  });
  const { data: provinces } = useProvinces();

  return (
    <div className="flex items-end gap-2">
      <div>
        <p className="mb-1 text-[10px] text-muted-foreground">{STORE_PICKER_TEXT.selectStore}</p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex min-w-[165px] items-center gap-1.5 rounded-lg border-[1.5px] border-border bg-card px-2.5 py-[5px] text-left"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-cream text-xs">
                🍜
              </span>
              <span className="flex-1 truncate text-xs font-medium text-charcoal">
                {storeName ?? '—'}
              </span>
              <ChevronDown className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={STORE_PICKER_TEXT.searchPlaceholder}
              className="mb-2 h-8 text-xs"
            />
            <div className="max-h-64 space-y-0.5 overflow-y-auto">
              {(data?.items ?? []).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(ROUTES.ASSESSMENT_DETAIL(s.id, round));
                  }}
                  className={cn(
                    'block w-full truncate rounded-md px-2 py-1.5 text-left text-xs hover:bg-cream',
                    s.id === storeId && 'bg-cream font-semibold text-orange'
                  )}
                >
                  {s.name}
                  <span className="ml-1 text-[10px] text-muted-foreground">· {s.province}</span>
                </button>
              ))}
              {data?.items.length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                  {STORE_PICKER_TEXT.noStoreFound}
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="w-32">
        <p className="mb-1 text-[10px] text-muted-foreground">{STORE_PICKER_TEXT.province}</p>
        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger className="h-[34px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{STORE_PICKER_TEXT.allProvinces}</SelectItem>
            {(provinces ?? []).map((p) => (
              <SelectItem key={p.id} value={p.nameTh}>
                {p.nameTh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
