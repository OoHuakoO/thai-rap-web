import type { IncubationStepStatus } from '../types/dashboard.types';

const COMPLETED_THRESHOLD = 100;
const ACTIVE_THRESHOLD = 50;

export function getIncubationStatus(percentage: number): IncubationStepStatus {
  if (percentage >= COMPLETED_THRESHOLD) return 'completed';
  if (percentage >= ACTIVE_THRESHOLD) return 'active';
  return 'pending';
}
