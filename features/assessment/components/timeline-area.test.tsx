import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimelineArea } from './timeline-area';
import { useAssessmentSummaries, useUpdateNotes } from '../hooks/use-assessment';

vi.mock('../hooks/use-assessment', () => ({
  useAssessmentSummaries: vi.fn(),
  useUpdateNotes: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAssessmentSummaries).mockReturnValue({
    data: [],
  } as unknown as ReturnType<typeof useAssessmentSummaries>);
  vi.mocked(useUpdateNotes).mockReturnValue({
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof useUpdateNotes>);
});

describe('TimelineArea', () => {
  it('shows the edit-notes button when the user can edit', () => {
    render(
      <TimelineArea storeId="store-1" round="T0" assessmentId="a1" notes={null} canEdit={true} />
    );

    expect(screen.getByRole('button', { name: 'แก้ไขบันทึกเพิ่มเติม' })).toBeInTheDocument();
  });

  it('hides the edit-notes button when the user cannot edit', () => {
    render(
      <TimelineArea storeId="store-1" round="T0" assessmentId="a1" notes={null} canEdit={false} />
    );

    expect(screen.queryByRole('button', { name: 'แก้ไขบันทึกเพิ่มเติม' })).not.toBeInTheDocument();
  });

  it('still shows existing notes as read-only text when the user cannot edit', () => {
    render(
      <TimelineArea
        storeId="store-1"
        round="T0"
        assessmentId="a1"
        notes="บันทึกเดิม"
        canEdit={false}
      />
    );

    expect(screen.getByText('บันทึกเดิม')).toBeInTheDocument();
  });
});
