import { describe, expect, it } from 'vitest';
import { isCompletedStatus } from './status';

describe('isCompletedStatus', () => {
  it('treats a submitted round as finished', () => {
    expect(isCompletedStatus('SUBMITTED')).toBe(true);
  });

  // Approving a submitted round must not reopen it — the API rejects every
  // write to an APPROVED assessment, so the UI has to lock it too.
  it('treats an approved round as finished', () => {
    expect(isCompletedStatus('APPROVED')).toBe(true);
  });

  it('treats a draft or in-progress round as unfinished', () => {
    expect(isCompletedStatus('DRAFT')).toBe(false);
    expect(isCompletedStatus('IN_PROGRESS')).toBe(false);
  });

  it('treats a round with no assessment as unfinished', () => {
    expect(isCompletedStatus(undefined)).toBe(false);
  });
});
