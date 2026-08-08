'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/constants/routes';
import type { Store } from '@/features/store';
import { useAuthStore } from '@/stores/auth-store';
import { PERMISSIONS } from '@/types/auth.types';
import {
  ALL_JUDGES,
  PITCHING_DASHBOARD_TEXT,
  PITCHING_ROUND_LABELS,
  PITCHING_TEXT,
} from '../constants/pitching.constants';
import { PITCHING_ROUNDS, type PitchingRound } from '../types/pitching.types';

export interface PitchingJudgeOption {
  id: string;
  name: string;
}

interface PitchingDashboardToolbarProps {
  round: PitchingRound;
  onRoundChange: (round: PitchingRound) => void;
  stores: Store[];
  storeId: string;
  onStoreChange: (storeId: string) => void;
  judges: PitchingJudgeOption[];
  judgeId: string;
  onJudgeChange: (judgeId: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function PitchingDashboardToolbar({
  round,
  onRoundChange,
  stores,
  storeId,
  onStoreChange,
  judges,
  judgeId,
  onJudgeChange,
  search,
  onSearchChange,
}: PitchingDashboardToolbarProps) {
  const canWrite = useAuthStore((state) => state.can(PERMISSIONS.PITCHING_WRITE));

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-text-main">{PITCHING_TEXT.pageTitle}</h1>
        <p className="text-sm text-charcoal">{PITCHING_TEXT.pageSubtitle}</p>
      </div>

      <div className="flex flex-1 flex-wrap items-end justify-end gap-3">
        <div className="w-full space-y-1.5 sm:w-56">
          <Label htmlFor="pitching-round">{PITCHING_DASHBOARD_TEXT.roundLabel}</Label>
          <Select value={round} onValueChange={(next) => onRoundChange(next as PitchingRound)}>
            <SelectTrigger id="pitching-round">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PITCHING_ROUNDS.map((item) => (
                <SelectItem key={item} value={item}>
                  {PITCHING_ROUND_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full space-y-1.5 sm:w-52">
          <Label htmlFor="pitching-dashboard-store">{PITCHING_DASHBOARD_TEXT.storeLabel}</Label>
          <Select value={storeId} onValueChange={onStoreChange} disabled={stores.length === 0}>
            <SelectTrigger id="pitching-dashboard-store">
              <SelectValue placeholder={PITCHING_TEXT.storePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full space-y-1.5 sm:w-52">
          <Label htmlFor="pitching-judge">{PITCHING_DASHBOARD_TEXT.judgeLabel}</Label>
          <Select value={judgeId} onValueChange={onJudgeChange}>
            <SelectTrigger id="pitching-judge">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_JUDGES}>{PITCHING_DASHBOARD_TEXT.judgeAll}</SelectItem>
              {judges.map((judge) => (
                <SelectItem key={judge.id} value={judge.id}>
                  {judge.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full space-y-1.5 sm:w-56">
          <Label htmlFor="pitching-search">{PITCHING_DASHBOARD_TEXT.searchLabel}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="pitching-search"
              className="pl-9"
              value={search}
              placeholder={PITCHING_DASHBOARD_TEXT.searchPlaceholder}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        {canWrite && (
          <Button asChild>
            <Link href={ROUTES.PITCHING_FORM}>
              <Plus className="h-4 w-4" />
              {PITCHING_DASHBOARD_TEXT.addScore}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
