'use client';

import { cn } from '@/utils/cn';
import { SCORE_SUMMARY_TEXT } from '../constants/assessment-text.constants';
import { ZONE_BADGE_CLASSES, ZONE_COLORS, ZONE_DESCRIPTIONS, type Zone } from '../utils/zone';

interface ScoreSummaryZoneProps {
  zone: Zone;
  /** False until the round is fully scored — see the note in score-summary.tsx. */
  showZone: boolean;
  scoredCount: number;
  totalQuestions: number;
  isSubmitted: boolean;
  /** The round has no frozen totalScore yet, so anything shown is a running value. */
  isProvisional: boolean;
}

export function ScoreSummaryZone({
  zone,
  showZone,
  scoredCount,
  totalQuestions,
  isSubmitted,
  isProvisional,
}: ScoreSummaryZoneProps) {
  const hasScore = scoredCount > 0 || !isProvisional;

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-bold',
          showZone
            ? ZONE_BADGE_CLASSES[ZONE_COLORS[zone]]
            : 'border-border bg-muted/40 text-muted-foreground'
        )}
      >
        <span>
          {showZone
            ? zone
            : hasScore
              ? SCORE_SUMMARY_TEXT.scoringProgress(scoredCount, totalQuestions)
              : SCORE_SUMMARY_TEXT.noScore}
        </span>
        {isSubmitted ? (
          <span className="text-[11.5px] font-semibold">{SCORE_SUMMARY_TEXT.submitted}</span>
        ) : (
          hasScore &&
          isProvisional && (
            <span className="text-[11.5px] font-semibold">{SCORE_SUMMARY_TEXT.provisional}</span>
          )
        )}
      </div>
      <p className="text-[12.5px] leading-relaxed text-muted-foreground">
        {showZone
          ? ZONE_DESCRIPTIONS[zone]
          : hasScore
            ? SCORE_SUMMARY_TEXT.zonePendingDescription
            : SCORE_SUMMARY_TEXT.noScoreDescription}
      </p>
    </>
  );
}
