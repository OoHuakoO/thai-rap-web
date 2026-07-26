'use client';

import { AlertCard } from '@/components/shared/alert-card';
import { CardSkeleton } from '@/components/shared/loading';
import { extractErrorMessage } from '@/utils/extract-error-message';
import { ACTION_PLAN_PHASE_ORDER } from '../constants/analytics-display.constants';
import { ACTION_PLANS_TEXT } from '../constants/analytics-text.constants';
import { useActionPlans } from '../hooks/use-action-plans';
import { ActionPlanCard } from './action-plan-card';

interface ActionPlansSectionProps {
  storeId: string;
}

const GRID_CLASS = 'grid grid-cols-1 gap-3 lg:grid-cols-3';

export function ActionPlansSection({ storeId }: ActionPlansSectionProps) {
  const { data: plans, isLoading, isError, error } = useActionPlans(storeId);

  // The API is free to return the phases in any order — the page always reads
  // 7 → 30 → 90 left to right.
  const orderedPlans = [...(plans ?? [])].sort(
    (a, b) => ACTION_PLAN_PHASE_ORDER.indexOf(a.phase) - ACTION_PLAN_PHASE_ORDER.indexOf(b.phase)
  );

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-text-main">{ACTION_PLANS_TEXT.title}</h2>

      {isLoading && (
        <div className={GRID_CLASS}>
          {ACTION_PLAN_PHASE_ORDER.map((phase) => (
            <CardSkeleton key={phase} />
          ))}
        </div>
      )}

      {!isLoading && isError && <AlertCard variant="error" message={extractErrorMessage(error)} />}

      {!isLoading && !isError && orderedPlans.length === 0 && (
        <AlertCard variant="info" message={ACTION_PLANS_TEXT.empty} />
      )}

      {!isLoading && !isError && orderedPlans.length > 0 && (
        <div className={GRID_CLASS}>
          {orderedPlans.map((plan) => (
            <ActionPlanCard key={plan.phase} plan={plan} />
          ))}
        </div>
      )}
    </section>
  );
}
