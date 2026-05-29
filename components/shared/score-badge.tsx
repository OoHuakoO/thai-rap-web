import { cn } from '@/utils/cn';
import type { ScoreLevel } from '@/types';

interface ScoreBadgeProps {
  score: number;
  label?: string;
  className?: string;
}

function getLevel(score: number): ScoreLevel {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  return 'poor';
}

const levelConfig: Record<ScoreLevel, { label: string; className: string }> = {
  excellent: { label: 'Excellent', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  good:      { label: 'Good',      className: 'bg-blue-100 text-blue-700 border-blue-200' },
  average:   { label: 'Average',   className: 'bg-amber-100 text-amber-700 border-amber-200' },
  poor:      { label: 'Poor',      className: 'bg-red-100 text-red-700 border-red-200' },
};

export function ScoreBadge({ score, label, className }: ScoreBadgeProps) {
  const level = getLevel(score);
  const config = levelConfig[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      <span className="tabular-nums">{score}</span>
      <span>{label ?? config.label}</span>
    </span>
  );
}
