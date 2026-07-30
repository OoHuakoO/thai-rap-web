import { calcScorePercent, calcWeightedTotal, sumQuestionScores } from './dimension-score';
import type { AssessmentQuestion, Dimension, Round } from '../types/assessment.types';

/** One finished round, as read from its own assessment record. */
export interface CompletedRoundInput {
  round: Round;
  totalScore: number | null;
  questions: AssessmentQuestion[];
}

export interface OverallRoundTotal {
  round: Round;
  totalScore: number;
}

export interface OverallDimensionRow {
  id: number;
  name: string;
  weight: number;
  /** Percentage per finished round; a round that scored nothing in this dimension is null. */
  pctByRound: Partial<Record<Round, number | null>>;
  /** Every finished round pooled into one percentage — the "รวมกัน" figure. */
  avgPct: number;
}

export interface OverallSummary {
  roundTotals: OverallRoundTotal[];
  dimensions: OverallDimensionRow[];
  /** Mean weighted total over the finished rounds. */
  averageTotalScore: number;
  /** Mean of the dimension averages, unweighted — every dimension counted once. */
  averageDimensionPct: number;
}

/**
 * Collapses every finished round of one store into a single cross-round view:
 * each dimension's rounds side by side plus their pooled average, and the mean
 * weighted total underneath.
 *
 * Pooling raw scores rather than averaging the per-round percentages is the same
 * number here (every round answers the same questions, so the denominators
 * match) and stays correct if a round is ever finished with a question missing.
 *
 * Returns null when there is nothing finished to combine — the caller renders an
 * empty state rather than a table of zeroes.
 */
export function buildOverallSummary(
  completed: CompletedRoundInput[],
  dimensions: Dimension[]
): OverallSummary | null {
  if (completed.length === 0 || dimensions.length === 0) return null;

  const roundTotals: OverallRoundTotal[] = completed.map((entry) => ({
    round: entry.round,
    // A finished round carries a frozen totalScore; the fallback covers a round
    // whose record predates that write, so it never lands as a 0 in the mean.
    totalScore: entry.totalScore ?? calcWeightedTotal(entry.questions, dimensions),
  }));

  const dimensionRows: OverallDimensionRow[] = dimensions.map((dim) => {
    const pctByRound: Partial<Record<Round, number | null>> = {};
    let pooledSum = 0;
    let pooledMax = 0;

    for (const entry of completed) {
      const dimQuestions = entry.questions.filter((q) => q.dimensionId === dim.id);
      const { sum, max } = sumQuestionScores(dimQuestions);
      pctByRound[entry.round] = max === 0 ? null : calcScorePercent(sum, max, 1);
      pooledSum += sum;
      pooledMax += max;
    }

    return {
      id: dim.id,
      name: dim.name,
      weight: dim.weight,
      pctByRound,
      avgPct: calcScorePercent(pooledSum, pooledMax, 1),
    };
  });

  const averageTotalScore =
    roundTotals.reduce((acc, entry) => acc + entry.totalScore, 0) / roundTotals.length;
  const averageDimensionPct =
    dimensionRows.reduce((acc, row) => acc + row.avgPct, 0) / dimensionRows.length;

  return {
    roundTotals,
    dimensions: dimensionRows,
    averageTotalScore,
    averageDimensionPct: Math.round(averageDimensionPct * 10) / 10,
  };
}
