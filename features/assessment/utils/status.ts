import type { AssessmentStatus } from '../types/assessment.types';

// Mirrors COMPLETED_STATUSES in the API's AssessmentService. A round is
// finished once it is submitted; an admin approving it afterwards does not
// reopen it — every "is this round done / is the form locked" check reads this,
// so an APPROVED round can never look editable on one side and be rejected on
// the other.
export const COMPLETED_ASSESSMENT_STATUSES: AssessmentStatus[] = ['SUBMITTED', 'APPROVED'];

export function isCompletedStatus(status: AssessmentStatus | undefined): boolean {
  return status !== undefined && COMPLETED_ASSESSMENT_STATUSES.includes(status);
}
