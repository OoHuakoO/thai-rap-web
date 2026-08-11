'use client';

import { Quote } from 'lucide-react';
import { AlertCard } from '@/components/shared/alert-card';
import { PITCHING_DASHBOARD_TEXT } from '../constants/pitching.constants';
import type { Pitching } from '../types/pitching.types';
import { readJudgeOpinion } from '../utils/pitching-opinion';
import { PitchingCommentBox } from './pitching-comment-box';
import { PitchingJudgeIdentity } from './pitching-judge-identity';
import { PitchingMinimumConditionsStrip } from './pitching-minimum-strip';
import { PitchingPanel } from './pitching-panel';
import { PitchingReasonQuote } from './pitching-reason-quote';
import { PitchingRecommendationBadge } from './pitching-recommendation-badge';

interface PitchingJudgeOpinionProps {
  pitching: Pitching;
  /** True when the judge filter is on "ทุกกรรมการ" and this judge was picked for the reader. */
  isJudgeAutoPicked?: boolean;
}

export function PitchingJudgeOpinion({
  pitching,
  isJudgeAutoPicked = false,
}: PitchingJudgeOpinionProps) {
  const { summary, fields, isEmpty } = readJudgeOpinion(pitching);

  return (
    <PitchingPanel
      title={PITCHING_DASHBOARD_TEXT.judgeOpinionTitle}
      icon={Quote}
      accent="purple"
      contentClassName="gap-4"
    >
      {/* The judge's name stays visible even with nothing written, so "ทุกกรรมการ"
          never leaves the reader guessing whose blank form they are looking at. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PitchingJudgeIdentity judgeName={pitching.judgeName} />
        {pitching.recommendation && (
          <PitchingRecommendationBadge recommendation={pitching.recommendation} />
        )}
      </div>

      {isJudgeAutoPicked && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {PITCHING_DASHBOARD_TEXT.opinionAutoJudgeHint}
        </p>
      )}

      {/* The verdict on its own reads as a clean pass; the gate is what a judge
          actually failed on, so it sits with the verdict, not only in the report. */}
      {pitching.minimumConditions && (
        <PitchingMinimumConditionsStrip conditions={pitching.minimumConditions} />
      )}

      {isEmpty ? (
        <AlertCard variant="info" message={PITCHING_DASHBOARD_TEXT.opinionEmpty} />
      ) : (
        <>
          {summary && <PitchingReasonQuote reason={summary} accent="purple" />}

          {/* Every box of the round, same fields the store report prints — a
              committee reading one judge here should not have to open the
              report to see what they wrote in the other boxes. */}
          <div className="grid flex-1 content-start gap-3 xl:grid-cols-2">
            {fields.map((field) => (
              <PitchingCommentBox
                key={field.key}
                label={field.label}
                value={field.text}
                tone={field.tone}
              />
            ))}
          </div>
        </>
      )}
    </PitchingPanel>
  );
}
