'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProgressBar } from '@/components/shared/progress-bar';
import { ACTION_PLAN_PHASE_DAYS } from '../constants/analytics-display.constants';
import { ACTION_PLANS_TEXT } from '../constants/analytics-text.constants';
import type { ActionPlan } from '../types/analytics.types';

interface ActionPlanCardProps {
  plan: ActionPlan;
}

export function ActionPlanCard({ plan }: ActionPlanCardProps) {
  const [isOpen, setOpen] = useState(false);
  const days = ACTION_PLAN_PHASE_DAYS[plan.phase];

  return (
    <>
      <Card className="flex h-full flex-col border-orange/30 bg-cream-light shadow-sm">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex gap-3">
            {/* Calendar block: orange spine over the day count, per the design. */}
            <span
              aria-hidden
              className="flex h-14 w-14 shrink-0 flex-col overflow-hidden rounded-xl border-2 border-orange"
            >
              <span className="h-3 w-full bg-orange" />
              <span className="flex flex-1 items-center justify-center text-xl font-bold tabular-nums text-orange">
                {days}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-charcoal">{plan.label}</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs leading-relaxed text-charcoal">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3 pt-1">
            <span className="shrink-0 text-[11px] text-charcoal">
              {ACTION_PLANS_TEXT.progressLabel}
            </span>
            <ProgressBar value={plan.progress} className="flex-1" />
            <span className="shrink-0 text-[11px] font-medium tabular-nums text-charcoal">
              {plan.progress}%
            </span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 text-[11px] font-medium text-orange underline-offset-2 hover:underline"
            >
              {ACTION_PLANS_TEXT.detailLink}
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{ACTION_PLANS_TEXT.dialogTitle(plan.label)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">{ACTION_PLANS_TEXT.itemsLabel}</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-charcoal">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
            <ProgressBar
              value={plan.progress}
              label={ACTION_PLANS_TEXT.progressLabel}
              showPercentage
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {ACTION_PLANS_TEXT.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
