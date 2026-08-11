import {
  PITCHING_COMMENT_FIELDS,
  PITCHING_COMMENT_TONES,
  type PitchingCommentTone,
} from '../constants/pitching.constants';
import type { Pitching } from '../types/pitching.types';

export interface JudgeOpinionField {
  key: string;
  label: string;
  tone: PitchingCommentTone;
  text: string;
}

export interface JudgeOpinion {
  /** เหตุผลประกอบการพิจารณา — kept apart from the boxes, as on the paper form. */
  summary: string;
  /** Every comment box of the round, blank ones included and in form order. */
  fields: JudgeOpinionField[];
  isEmpty: boolean;
}

/**
 * A judge's write-up as the dashboard and the store report both read it: the
 * whole form, not a chosen pair of boxes — a committee reading one judge needs
 * the same fields the report prints.
 */
export function readJudgeOpinion(pitching: Pitching): JudgeOpinion {
  const summary = pitching.recommendationReason?.trim() ?? '';
  const fields = PITCHING_COMMENT_FIELDS[pitching.round].map((field) => ({
    key: field.key,
    label: field.label,
    tone: PITCHING_COMMENT_TONES[field.key] ?? ('advice' as const),
    text: pitching.comments[field.key]?.trim() ?? '',
  }));

  return {
    summary,
    fields,
    isEmpty: !summary && fields.every((field) => !field.text),
  };
}

/**
 * Which judge the opinion panel shows when no single judge is picked. Comments
 * are free text, so the "ทุกกรรมการ (ค่าเฉลี่ย)" option has nothing to average
 * — it falls back to one judge. Skipping judges who wrote nothing keeps the
 * panel from reading as "no comments" while other judges on the same panel
 * have written some.
 */
export function pickOpinionJudge(judges: Pitching[]): Pitching | null {
  return judges.find((judge) => !readJudgeOpinion(judge).isEmpty) ?? judges[0] ?? null;
}
